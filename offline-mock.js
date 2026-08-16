/* AUDIOLINK · offline-mock.js · v0.8 (Fase 1 — persiste entre páginas)
   v0.8: dos mejoras, revisadas contra los usos reales en los archivos
   ya migrados (logistica/musicos/equipo-tecnico/clientes/pagos/
   bitacora/vacas/etc):
   (a) where()/orderBy()/limit() en _crearQueryEstatica ahora SÍ
       filtran/ordenan/truncan de verdad (antes eran placeholders que
       devolvían todo sin tocar). Soporta los operadores que de hecho
       se usan hoy: ==, !=, <, <=, >, >=, in, array-contains,
       array-contains-any. orderBy() de un solo campo (no se encontró
       ningún caso real con más de un orderBy() encadenado). Se
       reescribió como builder inmutable (cada .where()/.orderBy()/
       .limit() devuelve una query nueva que acumula la anterior) en
       vez del placeholder que ignoraba los argumentos.
   (b) cargarArchivoOffline() reconoce un tercer tipoArchivo:
       'audiolink_todo_offline' — el paquete de descargarTodoOffline()
       (index.html v2.25, botón "🌴 Descargar todo"): varios proyectos
       + catálogos en un solo archivo. No se tocó cómo se leen
       audiolink_proyecto_offline ni audiolink_catalogos_offline.

   v0.7: se agrega docChanges() a los snapshots de query (get() y
   onSnapshot()) — index.html:779 lo usa sobre
   collectionGroup('actividad') para detectar altas nuevas de
   actividad de Las Vacas. Simplificado: todos los docs se reportan
   como 'added' (no hay "snapshot anterior" real contra el que
   comparar en el mock). También se hace que doc.ref.parent.parent
   tenga un .get() real (antes era un objeto plano sin métodos) —
   index.html:788 lo llama. Limitación conocida anotada en el código:
   asume 'proyectos' como colección padre porque es la única con datos
   reales en Fase 1; si se carga actividad de Las Vacas offline en el
   futuro, hay que generalizar esto.

   v0.6: se agrega limit() como placeholder a _crearQueryEstatica (igual
   que where()/orderBy() — no filtra/trunca de verdad todavía). Causa
   real del "entra y sale" en index.html, más allá del fix de
   asincronía de v0.5: index.html:776 usa
   collectionGroup('actividad').orderBy(...).limit(20), y el mock no
   tenía .limit() — `db.collectionGroup(...).orderBy(...).limit is not
   a function` cortaba la ejecución del script ahí mismo, ANTES de
   llegar a la línea que declara `let recordatoriosCache` más abajo en
   el mismo <script>. Esto dejaba la variable en TDZ para siempre, que
   es lo que después se veía como
   "ReferenceError: Cannot access 'recordatoriosCache' before
   initialization" al disparar los onSnapshot ya registrados antes del
   corte. El fix de v0.5 (async real) seguía siendo necesario, pero no
   alcanzaba por este segundo problema encadenado.

   v0.5: los dos onSnapshot() del mock ahora disparan el callback de
   forma ASÍNCRONA (setTimeout 0) en vez de sincrónica. Causa real del
   bug "entra un segundo y sale" reportado en index.html: Firestore
   real SIEMPRE dispara onSnapshot de forma asíncrona, nunca en el
   mismo tick en que se registra — el mock lo hacía sincrónico, así que
   el callback corría en medio de la ejecución del script de
   index.html, ANTES de que terminara de declarar variables más abajo
   (ej. recordatoriosCache), causando
   "ReferenceError: Cannot access 'recordatoriosCache' before
   initialization" y cortando la página a mitad de carga — de ahí el
   flash de contenido seguido de expulsión.

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
      else if(json.tipoArchivo === 'audiolink_todo_offline'){
        // v0.8 — lee el paquete de descargarTodoOffline() (index.html
        // v2.25, botón "🌴 Descargar todo"): mismo esquema que un .json
        // de proyecto individual (audiolink_proyecto_offline), pero con
        // varios proyectos en un array `proyectos`, más los catálogos
        // embebidos (mismo esquema que audiolink_catalogos_offline).
        (json.proyectos || []).forEach(p => {
          _offlineData.proyectos[p.proyectoId] = {
            data: p.proyecto,
            sub: {
              sesiones: p.sesiones || [],
              produccion: p.produccion || [],
              temas: p.temas || [],
              pagos: p.pagos || []
            },
            fechaDescarga: json.fechaDescarga
          };
        });
        if(json.catalogos){
          _offlineData.catalogos = {
            musicos: json.catalogos.musicos || [],
            equipoTecnico: json.catalogos.equipoTecnico || [],
            estudios: json.catalogos.estudios || [],
            fechaDescarga: json.fechaDescarga
          };
        }
        resumen.push(`✅ Modo extendido — ${(json.proyectos || []).length} proyecto(s) + catálogos — descargado ${_formatearFecha(json.fechaDescarga)}`);
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
      // Async a propósito (setTimeout 0) — Firestore real SIEMPRE
      // dispara onSnapshot de forma asíncrona, nunca en el mismo tick
      // en que se registra. Si el mock lo disparaba sincrónico, el
      // callback corría ANTES de que el resto del script terminara de
      // declarar sus variables (ej. "recordatoriosCache" en
      // index.html), causando ReferenceError: Cannot access '...'
      // before initialization y cortando la página a mitad de carga.
      setTimeout(() => {
        if(proyectoEnMemoria){
          callback({ exists: true, id, data: () => ({ ...proyectoEnMemoria.data }) });
        } else {
          callback({ exists: false, id, data: () => undefined });
        }
      }, 0);
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
  return {
    id,
    data: () => ({ ...resto }),
    exists: true,
    ref: {
      // .parent.parent imita la referencia al doc padre (ej. para
      // collectionGroup('actividad'), el padre sería la vaca dueña de
      // esa actividad, no un proyecto) — necesita su propio .get()
      // real porque código como index.html:788 (vacaRef.get()) lo
      // llama. LIMITACIÓN CONOCIDA: acá se asume 'proyectos' como
      // colección padre porque es el único caso con datos reales en
      // Fase 1 (sesiones/produccion/temas/pagos de un proyecto
      // descargado). Si en el futuro se carga actividad de Las Vacas
      // offline, esto habría que generalizarlo a la colección padre
      // real, no fijo a 'proyectos'.
      parent: {
        parent: proyectoIdPadre ? _mockDoc('proyectos', proyectoIdPadre) : null
      }
    }
  };
}

// "Query" de solo lectura sobre un array ya resuelto en memoria.
// v0.8: where()/orderBy()/limit() ahora SÍ filtran/ordenan/truncan de
// verdad (antes eran placeholders que devolvían todo tal cual). Se
// revisaron todos los usos reales en los archivos ya migrados
// (logistica/musicos/equipo-tecnico/clientes/pagos/bitacora/vacas/etc):
// solo usan operadores '==', 'array-contains' en where(), orderBy() de
// un solo campo, y limit(n) — es lo que se soporta acá. Encadenar más
// de un orderBy() no se usa en ningún archivo real hoy, así que solo
// se aplica el último orderBy() encadenado (ordenamiento simple, no
// compuesto) — revisar esta nota si en el futuro aparece un caso con
// orderBy() múltiple.
function _crearQueryEstatica(docsSnapshot, _filtros = [], _orden = null, _limite = null){
  const builder = {
    where(campo, operador, valor){
      return _crearQueryEstatica(docsSnapshot, [..._filtros, { campo, operador, valor }], _orden, _limite);
    },
    orderBy(campo, direccion = 'asc'){
      return _crearQueryEstatica(docsSnapshot, _filtros, { campo, direccion }, _limite);
    },
    limit(n){
      return _crearQueryEstatica(docsSnapshot, _filtros, _orden, n);
    },
    async get(){
      return _resolverQuery();
    },
    onSnapshot(callback){
      // Async a propósito — mismo motivo que el onSnapshot de _mockDoc
      // arriba (ver comentario ahí). Este es el que efectivamente
      // causó el bug reportado (recordatoriosCache en index.html).
      setTimeout(() => callback(_resolverQuery()), 0);
      return function unsubscribe(){};
    }
  };
  return builder;

  function _cumpleFiltro(doc, filtro){
    const valorDoc = doc.data()[filtro.campo];
    switch(filtro.operador){
      case '==': return valorDoc === filtro.valor;
      case '!=': return valorDoc !== filtro.valor;
      case '<':  return valorDoc < filtro.valor;
      case '<=': return valorDoc <= filtro.valor;
      case '>':  return valorDoc > filtro.valor;
      case '>=': return valorDoc >= filtro.valor;
      case 'in': return Array.isArray(filtro.valor) && filtro.valor.includes(valorDoc);
      case 'array-contains': return Array.isArray(valorDoc) && valorDoc.includes(filtro.valor);
      case 'array-contains-any': return Array.isArray(valorDoc) && Array.isArray(filtro.valor) && valorDoc.some(v => filtro.valor.includes(v));
      default:
        console.warn(`AUDIOLINK offline-mock: operador where() "${filtro.operador}" no soportado, el filtro se ignora.`, filtro);
        return true;
    }
  }

  function _resolverQuery(){
    let docs = docsSnapshot.filter(doc => _filtros.every(f => _cumpleFiltro(doc, f)));

    if(_orden){
      const { campo, direccion } = _orden;
      docs = [...docs].sort((a, b) => {
        const va = a.data()[campo];
        const vb = b.data()[campo];
        if(va === vb) return 0;
        if(va === undefined || va === null) return 1;
        if(vb === undefined || vb === null) return -1;
        const cmp = va < vb ? -1 : 1;
        return direccion === 'desc' ? -cmp : cmp;
      });
    }

    if(_limite != null) docs = docs.slice(0, _limite);

    return {
      docs,
      empty: docs.length === 0,
      forEach(fn){ docs.forEach(fn); },
      docChanges(){ return _crearDocChanges(docs); }
    };
  }
}

// docChanges() real de Firestore avisa qué cambió entre snapshots
// (added/modified/removed) comparando contra el snapshot anterior. El
// mock no tiene "snapshot anterior" real (no hay listener persistente
// contra un servidor) — se simplifica: TODOS los docs se reportan como
// 'added' una sola vez, que es lo que pasa en Firestore real también
// en la primera carga de cualquier onSnapshot. Si algún código
// dependiera de ver 'modified'/'removed' en vivo, no lo va a ver acá
// — no encontramos ese caso en el diagnóstico (index.html:780 filtra
// explícitamente solo 'added').
function _crearDocChanges(docsSnapshot){
  return docsSnapshot.map(doc => ({ type: 'added', doc }));
}
