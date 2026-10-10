/* AUDIOLINK · audiolink-local.js · v1.1
   Trabajo en local (sin internet) compartido por las hojas del ecosistema.
   Se carga con <script src="audiolink-local.js"></script> ANTES del script
   que llama a iniciar(). Si el archivo no está desplegado, cada hoja debe
   seguir funcionando con su comportamiento anterior (ver el respaldo en
   ensayo.html v3.291 e ingeniero.html): este archivo nunca es requisito
   para abrir la página.

   v1.1: (a pedido: "usar lo que más se pueda sin conexión") el envoltorio
   de db deja de ser una lista corta de métodos (where/get/doc/add) y pasa
   a ser GENÉRICO: envuelve el Firestore real con un Proxy que deja pasar
   cualquier método (subcolecciones doc().collection(), collectionGroup,
   orderBy, limit, onSnapshot, batch, FieldValue, etc.) y solo protege las
   operaciones que se quedarían colgadas sin red: get, set, update,
   delete, add y batch.commit. runTransaction y onSnapshot pasan sin tocar
   (con persistencia, onSnapshot responde desde el caché). Los snapshots
   que devuelve Firestore no se envuelven. add() ahora devuelve la
   referencia completa (antes solo { id }). Además: (a) guarda el último
   email con sesión real confirmada (audiolink_ultimo_email) para usarlo
   como respaldo sin que cada hoja lo implemente; (b) iniciar() devuelve
   firestoreReal (modo local con SDK) para que cada hoja decida si mantiene
   su guard offline antiguo (mock/JSON) o usa el guard normal con la sesión
   restaurada; (c) toda escritura se rechaza con aviso si se está en el
   respaldo (sin sesión real confirmada), para no encolar escrituras que
   Firestore descartaría al sincronizar; (d) la decisión "usar copia de
   solo lectura por falla de persistencia" ahora espera a que la
   persistencia falle de verdad (antes se asumía fallo mientras estaba
   pendiente). ensayo.html v3.291 sigue funcionando sin cambios.

   v1.0: carga de scripts (cargarFirebase/cargarScript: copia local en
   vendor/ si existe, si no CDN), persistencia de Firestore, envoltorio de
   escrituras/lecturas y login híbrido. Todo probado antes en ensayo.html.

   Qué hace:
   (1) cargarFirebase() / cargarScript(): usan la copia local de
       vendor/<archivo> si existe; si no, el CDN de siempre.
       AUDIOLINK_ORIGEN_LIBS dice de dónde salió cada archivo.
   (2) iniciar(opciones): activa la persistencia de Firestore (IndexedDB,
       synchronizeTabs) y devuelve { auth, db, usarCopiaLocal,
       sesionSoloLocal, firestoreReal, ... } listos para usar en la hoja.
       - modoLocal = false (switch apagado): auth y db son los normales
         de la hoja; solo se activa la persistencia (caché en el
         dispositivo de lo que ya se lee).
       - modoLocal = true (switch encendido) con SDK: auth REAL (la
         sesión se restaura sin red) + db real envuelto: una escritura
         espera ~1.5 s la confirmación del servidor y, si no llega, se
         da por encolada (Firestore la sube sola al volver la señal,
         gana el último); una lectura espera ~3 s y si no llega lee del
         caché. Errores reales con conexión se propagan.
       - Respaldo (copia que arma cada hoja: snapshot de solo lectura en
         ensayo, mock en las demás) únicamente si: el SDK no cargó, o
         Firebase no confirma sesión en ~4 s habiendo email guardado, o
         falló la persistencia y no hay red. En el respaldo las
         escrituras se rechazan.
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
  var CLAVE_ULTIMO_EMAIL = 'audiolink_ultimo_email';
  var MSG_SIN_CONEXION = 'Sin conexión: esta acción necesita internet';

  function leerUltimoEmail(){
    try{ return global.localStorage.getItem(CLAVE_ULTIMO_EMAIL) || ''; }catch(e){ return ''; }
  }
  function guardarUltimoEmail(email){
    try{ if(email) global.localStorage.setItem(CLAVE_ULTIMO_EMAIL, email); }catch(e){}
  }
  function olvidarUltimoEmail(){
    try{ global.localStorage.removeItem(CLAVE_ULTIMO_EMAIL); }catch(e){}
  }

  function iniciar(op){
    op = op || {};
    var modoLocal = !!op.modoLocal;
    var sdkOk = !!op.sdkOk;
    var authReal = op.authReal;
    var leerEmail = op.leerEmail || leerUltimoEmail;

    var estadoPersistencia = 'pendiente'; // 'pendiente' | 'ok' | 'fallo'
    var promesaPersistencia = Promise.resolve();
    var usarCopiaForzado = false; // auth sin confirmar → respaldo (sin escrituras)

    // Debe llamarse antes de cualquier otra operación de Firestore. Siempre
    // activa (solo guarda en el dispositivo lo que la hoja ya lee).
    if(sdkOk){
      try{
        promesaPersistencia = global.firebase.firestore().enablePersistence({ synchronizeTabs: true })
          .then(function(){ estadoPersistencia = 'ok'; })
          .catch(function(err){
            estadoPersistencia = 'fallo';
            console.warn('AUDIOLINK: sin persistencia de Firestore (' + (err && err.code) + ').', err);
          });
      }catch(err){
        estadoPersistencia = 'fallo';
        console.warn('AUDIOLINK: no se pudo activar la persistencia de Firestore.', err);
      }
    }

    // ¿Hay que usar el respaldo (copia de solo lectura, sin escrituras)?
    function usarCopiaLocal(){
      if(!modoLocal) return false;
      if(!sdkOk) return true;
      if(usarCopiaForzado) return true;
      return estadoPersistencia === 'fallo' && !navigator.onLine;
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

    // ---- envoltorio genérico (Proxy) del Firestore real ----
    // Reconoce el tipo de objeto por sus métodos (sin depender del SDK).
    function tipoDe(x){
      if(!x || typeof x !== 'object') return null;
      if(typeof x.collection === 'function' && typeof x.batch === 'function') return 'db';
      if(typeof x.collection === 'function' && typeof x.set === 'function' && typeof x.get === 'function') return 'doc';
      if(typeof x.add === 'function' && typeof x.doc === 'function') return 'col';
      if(typeof x.where === 'function' && typeof x.get === 'function') return 'query';
      if(typeof x.commit === 'function' && typeof x.set === 'function' && typeof x.get !== 'function') return 'batch';
      return null;
    }
    var proxies = new WeakMap(); // proxy → objeto real
    function desenvolver(a){
      return (a && typeof a === 'object' && proxies.has(a)) ? proxies.get(a) : a;
    }
    function rechazoSinConexion(){ return Promise.reject(new Error(MSG_SIN_CONEXION)); }
    var leer = function(t, v, args){
      if(args.length) return v.apply(t, args); // con opciones (p. ej. {source}) se respeta tal cual
      return leerConRespaldo(function(){ return v.call(t); }, function(){ return v.call(t, { source: 'cache' }); });
    };
    var escribir = function(t, v, args){
      if(usarCopiaLocal()) return rechazoSinConexion();
      return conTimeout(v.apply(t, args), T_ESCRITURA_MS, function(){ return undefined; });
    };
    var anadir = function(t, v, args){
      if(usarCopiaLocal()) return rechazoSinConexion();
      var ref = t.doc(); // id disponible al instante (add() = doc() + set())
      return conTimeout(ref.set(args[0]), T_ESCRITURA_MS, function(){ return undefined; })
        .then(function(){ return envolver(ref); });
    };
    var PROTEGIDOS = {
      doc: { get: leer, set: escribir, update: escribir, delete: escribir },
      col: { get: leer, add: anadir },
      query: { get: leer },
      batch: { commit: escribir }
    };
    function envolver(x){
      var tipo = tipoDe(x);
      if(!tipo) return x; // snapshots, promesas, funciones de baja, FieldValue, etc.: sin tocar
      var p = new Proxy(x, {
        get: function(t, prop){
          var v = t[prop];
          if(prop === 'parent') return envolver(v);
          if(typeof v !== 'function') return v;
          var protegido = PROTEGIDOS[tipo] && PROTEGIDOS[tipo][prop];
          return function(){
            var args = Array.prototype.map.call(arguments, desenvolver);
            if(protegido) return protegido(t, v, args);
            return envolver(v.apply(t, args));
          };
        }
      });
      proxies.set(p, x);
      return p;
    }

    var dbCopiaCache;
    function dbCopia(){
      if(dbCopiaCache === undefined){
        try{ dbCopiaCache = op.crearDBRespaldo ? (op.crearDBRespaldo(leerEmail()) || null) : null; }
        catch(e){ console.warn('AUDIOLINK: no se pudo crear el respaldo de datos.', e); dbCopiaCache = null; }
      }
      return dbCopiaCache;
    }

    // db del modo local con SDK: Firestore real envuelto; el respaldo solo
    // entra cuando usarCopiaLocal() es true (y la hoja definió uno).
    function crearDBLocal(){
      var real = envolver(global.firebase.firestore());
      return new Proxy({}, {
        get: function(_, prop){
          var base = (usarCopiaLocal() && dbCopia()) || real;
          var v = base[prop];
          return typeof v === 'function' ? v.bind(base) : v;
        }
      });
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
        signOut: function(){
          return real.signOut().then(function(r){ olvidarUltimoEmail(); return r; });
        },
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
              guardarUltimoEmail(u.email);
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
      // SDK caído: auth de mentira + db de respaldo (cada hoja define el suyo)
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
      firestoreReal: modoLocal && sdkOk,
      persistenciaOk: function(){ return estadoPersistencia === 'ok'; },
      copiaForzada: function(){ return usarCopiaForzado; }
    };
  }

  global.AudiolinkLocal = {
    version: '1.1',
    cargarScript: cargarScript,
    cargarFirebase: cargarFirebase,
    iniciar: iniciar
  };
})(window);
