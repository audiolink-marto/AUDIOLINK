/* AUDIOLINK · offline-mock.js · v0.4 (Fase 1 — persiste entre páginas)
   v0.4: se agrega enablePersistence() como no-op al mock. Se nos había
   pasado por alto en el diagnóstico original — proyecto.html v5.26 ya
   llamaba db.enablePersistence() (piloto de persistencia offline de
   Firestore real) ANTES de que existiera este archivo. Como el mock no
   tenía ese método, `db.enablePersistence is not a function` cortaba
   la ejecución del script completo justo ahí — por eso el dashboard
   quedaba vacío Y el guard de sesión nunca corría (deslogueo
   aparente). El mock YA actúa como cache offline por diseño, así que
   no hace nada — solo evita el error.

   v0.3: _offlineData ahora se guarda en localStorage (clave
   AUDIOLINK_OFFLINE_KEY) cada vez que cargarArchivoOffline() procesa un
   archivo, y se restaura automáticamente al cargar este script en
   CUALQUIER página. Esto era necesario porque una variable JS en
   memoria no sobrevive a la navegación entre archivos .html distintos
   (index.html -> proyecto.html es una recarga completa del navegador,
   no un cambio de sección) — sin esto, cargar el archivo en index.html
   no le servía de nada a proyecto.html. localStorage acá es solo un
   PUENTE entre páginas de la misma sesión de trabajo, no reemplaza al
   archivo .json real (que sigue siendo la fuente portable entre
   dispositivos). Se agrega limpiarDatosOffline() para vaciar todo
   (memoria + localStorage) al salir del modo offline o antes de cargar
   datos frescos.

   v0.2: se implementa lectura real desde _offlineData (antes todo
   devolvía vacío con console.warn). Se agrega soporte de subcolecciones
   (doc(id).collection('sesiones')...), que es el patrón real que usa
   proyecto.html (sesiones/produccion/temas/pagos viven como
   subcolección de cada proyecto, no como colección aparte — confirmado
   en el diagnóstico de agosto 2026). cargarArchivoOffline() es la
   función que index.html llama al leer un .json descargado por
   proyecto.html (descargarProyectoOffline(), v5.33). where()/orderBy()
   son placeholders que devuelven todo sin filtrar por ahora — se
   afinan cuando haga falta un caso real que lo necesite.

   v0.1: esqueleto inicial (todo vacío, solo la forma de la cadena).

   Cargar este archivo ANTES que firebase-config.js en el <head>, en
   TODAS las páginas donde se vaya a permitir usar modo offline (no
   solo donde se sube el archivo — también donde se lee, ej.
   proyecto.html). No afecta nada si no se carga — crearDB() en
   firebase-config.js cae directo a firebase.firestore() real si
   offline-mock.js no está presente.

   Sin escritura offline en esta fase (Fase 2, más adelante) — set()/
   update()/add() no existen en este mock a propósito.
*/

const AUDIOLINK_OFFLINE_KEY = 'audiolink_offline_data';

// Estructura en memoria, se llena con cargarArchivoOffline() o se
// restaura sola desde localStorage al cargar este script:
// {
//   proyectos: {
//     [id]: {
//       data: {...},              // datos del doc proyecto (sin subcolecciones)
//       sub: { sesiones:[...], produccion:[...], temas:[...], pagos:[...] },
//       fechaDescarga: "ISO..."
//     }
//   },
//   catalogos: { musicos:[...], equipoTecnico:[...], estudios:[...] , fechaDescarga: "ISO..." }
// }
let _offlineData = _restaurarOfflineDataDesdeLocalStorage();

function _restaurarOfflineDataDesdeLocalStorage(){
  try{
    const guardado = localStorage.getItem(AUDIOLINK_OFFLINE_KEY);
    if(guardado) return JSON.parse(guardado);
  }catch(err){
    console.error('AUDIOLINK offline-mock: no se pudo restaurar localStorage, se arranca vacío.', err);
  }
  return { proyectos: {}, catalogos: null };
}

function _guardarOfflineDataEnLocalStorage(){
  try{
    localStorage.setItem(AUDIOLINK_OFFLINE_KEY, JSON.stringify(_offlineData));
  }catch(err){
    // Típicamente cuota excedida (localStorage ~5-10MB). Con archivos
    // de proyecto individuales no debería pasar, pero si pasa, avisar
    // en vez de fallar en silencio.
    console.error('AUDIOLINK offline-mock: no se pudo guardar en localStorage (¿cuota excedida?).', err);
    alert('⚠️ No se pudo guardar el archivo offline localmente (puede que sea muy pesado). Los datos están cargados en esta página pero no persistirán al navegar a otra.');
  }
}

// Vacía todo — memoria y localStorage. Llamar al salir del modo offline
// o antes de cargar un set de datos completamente nuevo.
function limpiarDatosOffline(){
  _offlineData = { proyectos: {}, catalogos: null };
  try{ localStorage.removeItem(AUDIOLINK_OFFLINE_KEY); }
  catch(err){ console.error('AUDIOLINK offline-mock: error limpiando localStorage.', err); }
}

// Llamar desde el input file (ver botón en index.html). Acepta un
// FileList (uno o varios .json a la vez). Devuelve un resumen de texto
// para mostrar al usuario (qué se cargó, de cuándo).
async function cargarArchivoOffline(fileList){
  const resumen = [];
  for(const file of fileList){
    try{
      const texto = await file.text();
      const json = JSON.parse(texto);

      if(json.tipoArchivo === 'audiolink_proyecto_offline'){
        _offlineData.proyectos[json.proyectoId] = {
          data: json.proyecto,
          sub: {
            sesiones: json.sesiones || [],
            produccion: json.produccion || [],
            temas: json.temas || [],
            pagos: json.pagos || []
          },
          fechaDescarga: json.fechaDescarga
        };
        const nombreProy = json.proyecto?.nombre || json.proyecto?.cliente || json.proyectoId;
        resumen.push(`✅ Proyecto "${nombreProy}" — descargado ${_formatearFecha(json.fechaDescarga)}`);
      }
      else if(json.tipoArchivo === 'audiolink_catalogos_offline'){
        _offlineData.catalogos = {
          musicos: json.musicos || [],
          equipoTecnico: json.equipoTecnico || [],
          estudios: json.estudios || [],
          fechaDescarga: json.fechaDescarga
        };
        resumen.push(`✅ Catálogos — descargados ${_formatearFecha(json.fechaDescarga)}`);
      }
      else{
        resumen.push(`⚠️ "${file.name}" no es un archivo offline de AUDIOLINK reconocido (falta o no coincide tipoArchivo).`);
      }
    }catch(err){
      console.error('Error leyendo archivo offline:', file.name, err);
      resumen.push(`❌ "${file.name}" — no se pudo leer (¿es un .json válido?).`);
    }
  }
  _guardarOfflineDataEnLocalStorage();
  return resumen;
}

function _formatearFecha(iso){
  if(!iso) return 'fecha desconocida';
  try{
    return new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });
  }catch{ return iso; }
}

function crearDBOffline(){
  return {
    collection(nombreColeccion){
      return _mockColeccionRaiz(nombreColeccion);
    },
    // No-op — en Firestore real activa cache offline con IndexedDB.
    // El mock YA ES el modo offline, no hace falta nada más acá.
    // Se agrega solo para no romper archivos que llaman
    // db.enablePersistence() de entrada (ej. proyecto.html v5.26).
    enablePersistence(){
      return Promise.resolve();
    },
    collectionGroup(nombreSubcoleccion){
      // Junta esa subcolección de TODOS los proyectos cargados en memoria.
      // Ej. collectionGroup('sesiones') -> todas las sesiones de todos
      // los proyectos que se hayan cargado offline.
      const docs = [];
      Object.entries(_offlineData.proyectos).forEach(([proyectoId, p]) => {
        (p.sub[nombreSubcoleccion] || []).forEach(item => {
          docs.push(_crearDocSnapshot(item.id, item, proyectoId));
        });
      });
      return _crearQueryEstatica(docs);
    }
  };
}

// Colección de nivel raíz: por ahora solo 'proyectos' tiene datos reales
// (desde archivos de proyecto). Catálogos (musicos/equipoTecnico/estudios)
// se resuelven aparte porque en Firestore SÍ son colecciones raíz.
function _mockColeccionRaiz(nombre){
  let docsBase = [];
  if(nombre === 'proyectos'){
    docsBase = Object.entries(_offlineData.proyectos).map(([id, p]) => ({ id, ...p.data }));
  } else if(_offlineData.catalogos && nombre in _offlineData.catalogos){
    docsBase = _offlineData.catalogos[nombre];
  }

  return Object.assign(_crearQueryEstatica(docsBase.map(d => _crearDocSnapshot(d.id, d))), {
    doc(id){
      return _mockDoc(nombre, id);
    }
  });
}

function _mockDoc(coleccionRaiz, id){
  const proyectoEnMemoria = coleccionRaiz === 'proyectos' ? _offlineData.proyectos[id] : null;

  return {
    id,
    async get(){
      if(proyectoEnMemoria){
        return { exists: true, id, data: () => ({ ...proyectoEnMemoria.data }) };
      }
      return { exists: false, id, data: () => undefined };
    },
    onSnapshot(callback){
      if(proyectoEnMemoria){
        callback({ exists: true, id, data: () => ({ ...proyectoEnMemoria.data }) });
      } else {
        callback({ exists: false, id, data: () => undefined });
      }
      return function unsubscribe(){};
    },
    // Subcolección: solo tiene datos reales si coleccionRaiz === 'proyectos'
    // y ese proyecto fue cargado offline (sesiones/produccion/temas/pagos).
    collection(nombreSub){
      const items = proyectoEnMemoria ? (proyectoEnMemoria.sub[nombreSub] || []) : [];
      return _crearQueryEstatica(items.map(d => _crearDocSnapshot(d.id, d, id)));
    }
    // set()/update() — Fase 2, no implementado a propósito.
  };
}

function _crearDocSnapshot(id, data, proyectoIdPadre){
  const { id: _omit, ...resto } = data || {};
  return { id, data: () => ({ ...resto }), exists: true, ref: { parent: { parent: proyectoIdPadre ? { id: proyectoIdPadre } : null } } };
}

// "Query" de solo lectura sobre un array ya resuelto en memoria. where()/
// orderBy() son placeholders (devuelven la misma query sin filtrar) —
// implementar filtrado real cuando aparezca un caso concreto que lo pida.
function _crearQueryEstatica(docsSnapshot){
  return {
    where(){ return _crearQueryEstatica(docsSnapshot); },
    orderBy(){ return _crearQueryEstatica(docsSnapshot); },
    async get(){
      return {
        docs: docsSnapshot,
        empty: docsSnapshot.length === 0,
        forEach(fn){ docsSnapshot.forEach(fn); }
      };
    },
    onSnapshot(callback){
      callback({
        docs: docsSnapshot,
        empty: docsSnapshot.length === 0,
        forEach(fn){ docsSnapshot.forEach(fn); }
      });
      return function unsubscribe(){};
    }
  };
}
