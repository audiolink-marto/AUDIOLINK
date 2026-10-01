/* AUDIOLINK · audiolink-local.js · v1.0
   Trabajo en local (sin internet) compartido por las hojas del ecosistema.
   Se carga con <script src="audiolink-local.js"></script> ANTES de los
   scripts de Firebase y de firebase-config.js. Si el archivo no está
   desplegado, cada hoja debe seguir funcionando con su comportamiento
   anterior (ver el respaldo en ensayo.html v3.291): este archivo nunca
   es requisito para abrir la página.

   Qué hace (todo probado antes en ensayo.html v3.290):
   (1) cargarFirebase() / cargarScript(): usan la copia local de
       vendor/<archivo> si existe; si no, el CDN de siempre. Así el
       .exe (Tauri) abre sin internet. AUDIOLINK_ORIGEN_LIBS dice de
       dónde salió cada archivo ('local' o 'cdn').
   (2) iniciar(opciones): activa la persistencia de Firestore (IndexedDB,
       synchronizeTabs) y devuelve { auth, db, usarCopiaLocal,
       sesionSoloLocal } listos para usar en la hoja.
       - modoLocal = false (switch apagado): auth y db son los normales
         de la hoja; solo se activa la persistencia (caché en el
         dispositivo de lo que ya se lee).
       - modoLocal = true (switch encendido) con SDK: auth REAL (la
         sesión se restaura sin red) + db real envuelto: una escritura
         espera ~1.5 s la confirmación del servidor y, si no llega, se
         da por encolada (Firestore la sube sola al volver la señal,
         gana el último); una lectura espera ~3 s y si no llega lee del
         caché. Errores reales con conexión se propagan. add() usa
         doc()+set() para tener el id al instante.
       - Respaldo de solo lectura (copia en localStorage que arma cada
         hoja) únicamente si: el SDK no cargó, o Firebase no confirma
         sesión en ~4 s habiendo email guardado, o falló la persistencia
         y no hay red. Ahí las escrituras se rechazan, porque sin sesión
         real Firestore las descartaría al sincronizar.
   No toca firebase-config.js, offline-mock.js, Cloudinary ni nada
   propio de cada hoja. */
(function(global){
  'use strict';

  var T_AUTH_MS = 4000;       // sin confirmación de sesión → respaldo (si hay email guardado)
  var T_ESCRITURA_MS = 1500;  // escritura sin confirmación del servidor → se da por encolada
  var T_LECTURA_MS = 3000;    // lectura sin respuesta del servidor → se lee del caché
  var VERSION_FIREBASE = '10.12.2';

  global.AUDIOLINK_ORIGEN_LIBS = global.AUDIOLINK_ORIGEN_LIBS || {};

  // ---------- (1) carga de scripts: local si existe, si no CDN ----------
  function existeLocal(ruta){
    try{
      var x = new XMLHttpRequest();
      x.open('GET', ruta, false);
      x.send();
      if(x.status !== 200) return false;
      var tipo = (x.getResponseHeader('content-type') || '').toLowerCase();
      return !tipo || tipo.indexOf('javascript') !== -1;
    }catch(e){ return false; }
  }
  // Usa document.write a propósito: el script se ejecuta en orden, antes de
  // las etiquetas <script> siguientes. Solo sirve mientras la página carga.
  function cargarScript(nombre, urlCdn){
    var local = 'vendor/' + nombre;
    var usarLocal = existeLocal(local);
    global.AUDIOLINK_ORIGEN_LIBS[nombre] = usarLocal ? 'local' : 'cdn';
    document.write('<script src="' + (usarLocal ? local : urlCdn) + '"><\/script>');
  }
  function cargarFirebase(){
    var base = 'https://www.gstatic.com/firebasejs/' + VERSION_FIREBASE + '/';
    ['app', 'auth', 'firestore'].forEach(function(n){
      var nombre = 'firebase-' + n + '-compat.js';
      cargarScript(nombre, base + nombre);
    });
  }

  // ---------- (2) trabajo en local ----------
  function iniciar(op){
    op = op || {};
    var modoLocal = !!op.modoLocal;
    var sdkOk = !!op.sdkOk;
    var authReal = op.authReal;
    var leerEmail = op.leerEmail || function(){ return ''; };

    var persistenciaOk = false;
    var promesaPersistencia = Promise.resolve();
    var usarCopiaForzado = false; // auth sin confirmar → db de solo lectura sobre la copia

    // Debe llamarse antes de cualquier otra operación de Firestore. Siempre
    // activa (solo guarda en el dispositivo lo que la hoja ya lee).
    if(sdkOk){
      try{
        promesaPersistencia = global.firebase.firestore().enablePersistence({ synchronizeTabs: true })
          .then(function(){ persistenciaOk = true; })
          .catch(function(err){ console.warn('AUDIOLINK: sin persistencia de Firestore (' + (err && err.code) + ').', err); });
      }catch(err){
        console.warn('AUDIOLINK: no se pudo activar la persistencia de Firestore.', err);
      }
    }

    // ¿Hay que leer de la copia de solo lectura en vez de Firestore?
    function usarCopiaLocal(){
      if(!modoLocal) return false;
      if(!sdkOk) return true;
      if(usarCopiaForzado) return true;
      return !persistenciaOk && !navigator.onLine;
    }
    // ¿Login / "cerrar sesión" deben tratarse como sin conexión?
    function sesionSoloLocal(){
      return modoLocal && (!navigator.onLine || !sdkOk || usarCopiaForzado);
    }

    // Espera `promesa` hasta `ms`; si vence, resuelve con valorSiVence().
    // Si después falla (p. ej. al sincronizar), solo se avisa en consola.
    function conTimeout(promesa, ms, valorSiVence){
      return new Promise(function(resolve, reject){
        var listo = false;
        var t = setTimeout(function(){ if(!listo){ listo = true; resolve(valorSiVence()); } }, ms);
        promesa.then(function(v){
          if(!listo){ listo = true; clearTimeout(t); resolve(v); }
        }, function(e){
          if(!listo){ listo = true; clearTimeout(t); reject(e); }
          else console.warn('AUDIOLINK: una escritura en cola falló al sincronizar.', e);
        });
      });
    }
    function leerConRespaldo(leerNormal, leerCache){
      return conTimeout(leerNormal(), T_LECTURA_MS, function(){ return null; })
        .then(function(r){ return r !== null ? r : leerCache(); });
    }
    function envolverDoc(ref){
      function esc(nombre){
        return function(){
          return conTimeout(ref[nombre].apply(ref, arguments), T_ESCRITURA_MS, function(){ return undefined; });
        };
      }
      return {
        id: ref.id,
        get: function(){ var a = arguments; return leerConRespaldo(function(){ return ref.get.apply(ref, a); }, function(){ return ref.get({ source: 'cache' }); }); },
        set: esc('set'), update: esc('update'), delete: esc('delete')
      };
    }
    function envolverQuery(q){
      return {
        where: function(){ return envolverQuery(q.where.apply(q, arguments)); },
        get: function(){ var a = arguments; return leerConRespaldo(function(){ return q.get.apply(q, a); }, function(){ return q.get({ source: 'cache' }); }); }
      };
    }
    function envolverColeccion(col){
      var base = envolverQuery(col);
      base.doc = function(id){ return envolverDoc(col.doc(id)); };
      // add() → doc() + set(): el id está disponible al instante (quien llama solo debe usar docRef.id).
      base.add = function(datos){
        var ref = col.doc();
        return conTimeout(ref.set(datos), T_ESCRITURA_MS, function(){ return undefined; }).then(function(){ return { id: ref.id }; });
      };
      return base;
    }

    var dbCopiaCache = null;
    function dbCopia(){
      if(!dbCopiaCache) dbCopiaCache = op.crearDBRespaldo(leerEmail());
      return dbCopiaCache;
    }

    // db del modo local con SDK: en cada llamada decide entre Firestore real
    // (envuelto) y la copia de solo lectura (respaldo).
    function crearDBLocal(){
      var real = global.firebase.firestore();
      function enrutar(conReal, conCopia){
        return promesaPersistencia.then(function(){ return usarCopiaLocal() ? conCopia() : conReal(); });
      }
      return {
        collection: function(nombre){
          function colReal(){ return envolverColeccion(real.collection(nombre)); }
          function colCopia(){ return dbCopia().collection(nombre); }
          function consulta(filtros){
            function aplicar(col){ return filtros.reduce(function(q, f){ return q.where(f[0], f[1], f[2]); }, col); }
            return {
              where: function(c, o, v){ return consulta(filtros.concat([[c, o, v]])); },
              get: function(){ return enrutar(function(){ return aplicar(colReal()).get(); }, function(){ return aplicar(colCopia()).get(); }); }
            };
          }
          var q = consulta([]);
          q.add = function(datos){ return enrutar(function(){ return colReal().add(datos); }, function(){ return colCopia().add(datos); }); };
          q.doc = function(id){
            function metodo(nombre2){
              return function(){
                var a = arguments;
                return enrutar(
                  function(){ var d = colReal().doc(id); return d[nombre2].apply(d, a); },
                  function(){ var d = colCopia().doc(id); return d[nombre2].apply(d, a); }
                );
              };
            }
            return { id: id, get: metodo('get'), set: metodo('set'), update: metodo('update'), delete: metodo('delete') };
          };
          return q;
        }
      };
    }

    // auth del modo local con SDK: Firebase Auth REAL (restaura la sesión sin
    // red). Respaldo solo si no confirma sesión y hay email guardado.
    function crearAuthHibrido(real){
      var userRespaldo = null;
      function activarRespaldo(){
        var email = leerEmail();
        if(!email) return null;
        usarCopiaForzado = true;
        userRespaldo = { email: email, uid: 'offline-' + email, isAnonymous: false };
        return userRespaldo;
      }
      return {
        get currentUser(){ return real.currentUser || userRespaldo; },
        signOut: function(){ return real.signOut(); },
        signInWithEmailAndPassword: function(c, k){ return real.signInWithEmailAndPassword(c, k); },
        onAuthStateChanged: function(cb){
          var resuelto = false;
          var temporizador = setTimeout(function(){
            if(resuelto) return;
            var u = activarRespaldo();
            if(u){ resuelto = true; cb(u); } // sin email guardado: sigue esperando al auth real
          }, T_AUTH_MS);
          return real.onAuthStateChanged(function(u){
            clearTimeout(temporizador);
            if(u){
              var yaEstabaDentro = resuelto && !!userRespaldo;
              usarCopiaForzado = false; userRespaldo = null;
              if(yaEstabaDentro) return; // llegó tarde la sesión real: no se reinicia la pantalla
              resuelto = true; cb(u); return;
            }
            if(userRespaldo) return; // respaldo activo: no se manda al login
            if(!resuelto && !navigator.onLine){
              var uf = activarRespaldo();
              if(uf){ resuelto = true; cb(uf); return; }
            }
            resuelto = true; cb(null);
          });
        }
      };
    }

    var auth, db;
    if(!modoLocal){
      auth = authReal;
      db = op.crearDBNormal();
    } else if(!sdkOk){
      // SDK caído: auth de mentira + db de solo lectura (copia), como en ensayo v3.289
      auth = op.crearAuthRespaldo(leerEmail());
      db = op.crearDBRespaldo(leerEmail());
    } else {
      auth = crearAuthHibrido(authReal);
      db = crearDBLocal();
    }

    return {
      auth: auth,
      db: db,
      usarCopiaLocal: usarCopiaLocal,
      sesionSoloLocal: sesionSoloLocal,
      persistenciaOk: function(){ return persistenciaOk; },
      copiaForzada: function(){ return usarCopiaForzado; }
    };
  }

  global.AudiolinkLocal = {
    version: '1.0',
    cargarScript: cargarScript,
    cargarFirebase: cargarFirebase,
    iniciar: iniciar
  };
})(window);
