/* AUDIOLINK · offline-mock.js · v1.10 (whitelist ampliada: clientes + egresos)
   v1.10: se agregan 'clientes' y 'egresos' a _COLECCIONES_ESCRIBIBLES_RAIZ —
   proyecto.html los escribe (CRUD de clientes, listener de gastos por
   proyecto) y no estaban en la whitelist, así que esos cambios offline
   quedaban atascados en la cola para siempre, sin avisar (ver también
   nav.js v1.19). Usan el mismo mecanismo genérico add/delete/update/set
   ya existente para toda la whitelist — no se agregó lógica nueva de
   mock, solo se sumaron los dos nombres.
   Además, sincronizarColaOffline() ahora cuenta los cambios que caen al
   'else' (tipo/colección no reconocido) en un nuevo campo
   `no_reconocidos` del resultado — antes se reencolaban en silencio y
   no había forma de que la UI supiera que algo se quedó pegado.

   v1.9: cocina.html v1.7 agregó 2 colecciones raíz nuevas
   (categoriasCocina, checkCompras) que necesitaban escritura offline.
   Se agregan ambas a _COLECCIONES_ESCRIBIBLES_RAIZ y, como
   categoriasCocina.doc(id).update() y checkCompras.doc('activa').set()
   no tenían equivalente en el mock (antes solo existía add()/delete()
   sobre colecciones raíz), se agregan docRef.update() y docRef.set()
   genéricos para toda la whitelist (ver comentario junto a esos
   bloques, dentro de _mockDoc). set() es upsert — crea el doc si no
   existe, lo reemplaza si existe — necesario porque checkCompras
   puede no tener nada descargado la primera vez que se usa offline.
   sincronizarColaOffline() ahora también sube cambios tipo
   'update'/'set' de estas colecciones (antes solo sabía 'add'/
   'delete'). Sin detección de conflicto en 'update' (a diferencia de
   sesiones) — riesgo aceptado, no se pidió más que eso.

   v1.8: query.add() de las colecciones de cocina (whitelist v1.7) ya
   no guarda el sentinel crudo de
   firebase.firestore.FieldValue.serverTimestamp() en memoria/UI —
   cocina.html lo usa en creadoEn al guardar ventas/insumos/recetas.
   Nueva función _reemplazarServerTimestampParaOffline(datos): detecta
   ese sentinel (objeto interno del SDK con _methodName conteniendo
   "servertimestamp") y lo reemplaza por new Date().toISOString() SOLO
   en la copia que va al array en memoria — la cola de sincronización
   (_encolarCambio) sigue guardando el sentinel original intacto, para
   que al sincronizar Firestore real lo resuelva como un
   serverTimestamp de verdad (no una fecha aproximada del momento del
   add() offline). No se tocó tomas/sesiones ni ninguna otra función.

   v1.7 (escritura offline de cocina.html)
   v1.7: whitelist de escritura offline ampliada a las 4 colecciones
   raíz de cocina.html (cocinaInsumos, cocinaRecetas, cocinaProductos,
   ventasCocina). Mismo mecanismo que sesiones/tomas (v1.3): cola de
   cambios pendientes (_encolarCambio), listeners vivos para que la UI
   se refresque sola sin salir y volver a entrar (_registrarListenerVivo/
   _notificarListenersVivos, mismo patrón que tomas de v1.4), y
   sincronizarColaOffline() (v1.5) ahora también sube estos cambios a
   Firestore real cuando vuelve la señal.
   (a) add(): en _mockColeccionRaiz(), para las 4 colecciones de la
       whitelist — genera id temporal 'offline_...', guarda el doc YA
       en _offlineData.catalogos[nombre] (memoria + localStorage) para
       que la UI lo vea sin esperar sync, encola el cambio y notifica
       a cualquier onSnapshot() activo sobre esa colección.
   (b) delete(): en _mockDoc(), mismas 4 colecciones — saca el doc de
       memoria, encola el cambio, notifica listeners.
   (c) No hay update() para estas 4 colecciones — cocina.html no lo usa
       (solo add()/delete()), se agrega si en el futuro hace falta un
       caso real.
   (d) Sin conflictos posibles en add()/delete() (a diferencia del
       update() de sesiones): un add() siempre crea un doc nuevo, un
       delete() no tiene "versión anterior" que comparar — se
       sincronizan directo, sin pasar por _conflictosOffline.
   (e) Cualquier otra colección raíz (musicos, equipoTecnico, estudios,
       equipoInterno, ingenieros, musicosPortal, etc.) sigue sin
       add()/update()/delete() — no agregarla a la whitelist sin
       confirmarlo antes con el usuario.

   v1.6 (lectura offline de cocina.html)
   v1.6: cargarArchivoOffline() ahora también guarda cocinaInsumos,
   cocinaRecetas, cocinaProductos y ventasCocina cuando vienen en el
   .json de catálogos (tipoArchivo 'audiolink_catalogos_offline' o
   'audiolink_todo_offline') — mismo patrón que equipoInterno/
   ingenieros/musicosPortal (v1.0). Son 4 colecciones raíz, igual que
   esas, así que no hace falta tocar _mockColeccionRaiz ni ningún otro
   mecanismo de lectura: con quedar en _offlineData.catalogos alcanza
   para que cocina.html las lea offline con db.collection(nombre)...
   Solo lado de LECTURA. El botón "📦 Descargar catálogos" (y
   "🌴 Descargar todo") que arma el .json vive en index.html, que no
   se tocó acá — falta agregarle estos 4 campos ahí para que el .json
   los incluya de verdad. Sin ese cambio, este archivo simplemente
   guarda array vacío para los 4 (no rompe nada, pero tampoco sirve de
   nada hasta que index.html los empaquete).

   v1.5: sincronizarColaOffline() sube de verdad la cola de cambios
   pendientes a Firestore real (firebase.firestore(), no crearDB()).
   Para add() de tomas no hay conflicto posible (siempre crea un doc
   nuevo). Para update() de sesiones: se guarda un baseActualizadoEn
   (el que el usuario tenía offline antes de editar) en cada cambio
   encolado; al sincronizar se compara contra el actualizadoEn real en
   Firestore — si difieren, alguien más cambió la sesión mientras
   estabas offline → conflicto, no se sobreescribe solo, se guarda en
   _conflictosOffline (localStorage AUDIOLINK_CONFLICTOS_KEY) para que
   el usuario decida con resolverConflictoOffline(indice,'mio'|'firestore').
   Nada de esto se dispara solo todavía — falta engancharlo desde
   nav.js (evento 'online' + botón manual), que es el siguiente paso.

   v1.4: onSnapshot() de tomas ahora se refresca solo cuando add()
   agrega una toma nueva (antes quedaba congelado hasta salir y volver
   a entrar de bitacora.html). Se agregó un registro de "listeners
   vivos" (_listenersVivos/_registrarListenerVivo/_notificarListenersVivos):
   el onSnapshot() puntual de la query de tomas (dentro de
   sesiones/{id}/tomas) se registra ahí, y tomasQuery.add() avisa a esos
   listeners después de guardar. Acotado 100% a tomas — no toca
   onSnapshot() genérico de _crearQueryEstatica ni ninguna otra
   colección/subcolección.

   v1.3: Parte 2 — primera escritura offline real, whitelist estricta
   (solo 'sesiones' y 'tomas'), más un fix de un bug de v1.2.
   (a) FIX bug v1.2: dentro de .doc(sesionId).collection('tomas'), la
       condición comparaba coleccionRaiz==='sesiones' (que en ese punto
       SIEMPRE vale 'proyectos', el padre) en vez de nombreSub==='sesiones'
       (el nombre real de la subcolección). Nunca daba true — el fix de
       v1.2 no leía tomas aunque no tirara error. Corregido.
   (b) sesionRef.collection('tomas').add(datos) ya funciona offline:
       genera un id temporal 'offline_<timestamp>_<random>', guarda la
       toma de inmediato en memoria (subEnMemoria.tomasPorSesion) para
       que la UI la vea sin esperar sync, y encola el cambio.
   (c) sesionRef.update(datos) también funciona offline (whitelist:
       solo si la subcolección es 'sesiones'), mismo mecanismo de cola.
   (d) Cola de cambios pendientes: nueva clave de localStorage
       AUDIOLINK_COLA_KEY (separada de AUDIOLINK_OFFLINE_KEY). Funciones
       obtenerColaCambiosOffline() / limpiarColaCambiosOffline() quedan
       expuestas para que la UI muestre "N cambios pendientes" a futuro.
       La sincronización real contra Firestore (subir la cola cuando
       vuelve la señal, resolver conflictos) NO está implementada
       todavía — es el siguiente paso, después de confirmar que grabar
       tomas offline ya no tira error.
   Cualquier colección fuera de 'sesiones'/'tomas' (equipoTecnico,
   estudios, clientes, pagos, musicos, etc.) sigue sin add()/update()/
   delete() — no se toca esa whitelist sin confirmarlo antes.

   v1.2: Parte 1.5 completa — bitacora.html ya puede LEER tomas offline
   (la escritura sigue para la Parte 2, más adelante).
   (a) cargarArchivoOffline() ahora también guarda tomasPorSesion
       (objeto { sesionId: [tomas...] }) tanto para
       audiolink_proyecto_offline como para audiolink_todo_offline —
       viene del .json si proyecto.html/descargarTodoOffline ya lo
       incluyen (fetch extra por sesión, cambio hecho aparte en
       proyecto.html/index.html, no en este archivo).
   (b) .doc(sesionId).collection('tomas') dentro de la subcolección
       'sesiones' ya NO devuelve siempre vacío — ahora lee de verdad
       desde subEnMemoria.tomasPorSesion[subId]. Cualquier otra
       combinación (otra colección padre, otro nombre de sub-sub)
       sigue devolviendo vacío igual que antes, no rompe nada más.
   Con esto, abrir bitácora offline de una sesión que ya tenía tomas
   grabadas muestra la lista real en vez de vacía.

   v1.1: se agrega .doc(subId) sobre las subcolecciones que devuelve
   _mockDoc().collection(nombreSub) — ver el comentario junto al fix,
   dentro de _mockDoc() más abajo. Antes esa subcolección solo servía
   para consultar TODA la colección de una vez (.where/.orderBy/.get/
   .onSnapshot — ej. logistica.html listando sesiones), pero ningún
   archivo había necesitado pedir un documento puntual dentro de una
   subcolección hasta bitacora.html (proyectos/{id}/sesiones/{sesionId}),
   que tronaba "doc is not a function" al armar sesionRef y dejaba la
   página en "Cargando..." con "Error validando tu acceso offline."
   Reutiliza los mismos datos ya en memoria — no cambia qué se lee del
   .json ni ninguna otra función.

   v1.0: cargarArchivoOffline() ahora también guarda equipoInterno,
   ingenieros y musicosPortal cuando vienen en el .json de catálogos
   (tipoArchivo 'audiolink_catalogos_offline' o 'audiolink_todo_offline').
   Necesario para que bitacora.html/ingeniero.html/musico.html puedan
   resolver "quién sos" en modo offline (Grupo C) sin depender de
   Firebase Auth. No cambia el mecanismo de lectura (_mockDoc/
   _mockColeccionRaiz ya eran genéricos para cualquier colección de
   catalogos desde el fix de v0.9), solo qué campos se leen del .json
   al cargarlo. Si el .json no trae estos 3 campos (archivos viejos ya
   descargados), simplemente quedan como array vacío — no rompe nada.

   (Nota: el título de este archivo decía "v0.8" pero el changelog de
   abajo ya documentaba un fix aplicado como "v0.9" — desfase que venía
   de antes. Se corrige acá el número de título para que coincida con
   el código real; no se tocó ninguna lógica al corregir esto.)

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
// v1.3: cola de cambios pendientes de sincronizar (Parte 2 — escritura
// offline). Clave de localStorage separada de AUDIOLINK_OFFLINE_KEY a
// propósito: los datos descargados y los cambios pendientes tienen
// ciclos de vida distintos (limpiar uno no debe limpiar el otro).
const AUDIOLINK_COLA_KEY = 'audiolink_offline_cola_cambios';

// v1.7 — whitelist de escritura offline para colecciones RAÍZ (a
// diferencia de sesiones/tomas, que son subcolecciones de 'proyectos'
// y tienen su propia whitelist dentro de _mockDoc). Usada por
// _mockColeccionRaiz() (add) y _mockDoc() (delete). Cualquier colección
// raíz que no esté acá sigue sin escritura offline — no agregarla sin
// confirmarlo antes con el usuario.
// v1.9: se agregan 'categoriasCocina' y 'checkCompras' (cocina.html
// v1.7). A diferencia de las 4 anteriores, estas dos también necesitan
// update()/set() puntual sobre un doc — ver docRef.update/docRef.set
// más abajo, junto a docRef.delete (mismo bloque, misma condición).
const _COLECCIONES_ESCRIBIBLES_RAIZ = ['cocinaInsumos', 'cocinaRecetas', 'cocinaProductos', 'ventasCocina', 'categoriasCocina', 'checkCompras', 'clientes', 'egresos'];

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
//   catalogos: { musicos:[...], equipoTecnico:[...], estudios:[...],
//                equipoInterno:[...], ingenieros:[...], musicosPortal:[...],
//                cocinaInsumos:[...], cocinaRecetas:[...],
//                cocinaProductos:[...], ventasCocina:[...],
//                fechaDescarga: "ISO..." }
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

// v1.3 — cola de cambios pendientes (Parte 2, escritura offline).
let _colaCambiosOffline = _restaurarColaDesdeLocalStorage();

function _restaurarColaDesdeLocalStorage(){
  try{
    const guardado = localStorage.getItem(AUDIOLINK_COLA_KEY);
    if(guardado) return JSON.parse(guardado);
  }catch(err){
    console.error('AUDIOLINK offline-mock: no se pudo restaurar la cola de cambios, se arranca vacía.', err);
  }
  return [];
}

function _guardarColaEnLocalStorage(){
  try{
    localStorage.setItem(AUDIOLINK_COLA_KEY, JSON.stringify(_colaCambiosOffline));
  }catch(err){
    console.error('AUDIOLINK offline-mock: no se pudo guardar la cola de cambios (¿cuota excedida?).', err);
    alert('⚠️ No se pudo guardar el cambio en la cola de sincronización local (puede que sea muy pesado).');
  }
}

// Id temporal para docs creados offline — se reemplaza por el id real
// de Firestore cuando se implemente la sincronización.
function _generarIdOffline(){
  return 'offline_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
}

// Agrega un cambio pendiente a la cola. Solo lo llaman los puntos de
// escritura ya habilitados por whitelist (sesiones/tomas) — ver
// _mockDoc más abajo. No sincroniza nada todavía, solo registra.
function _encolarCambio(cambio){
  _colaCambiosOffline.push({ ...cambio, fecha: new Date().toISOString() });
  _guardarColaEnLocalStorage();
}

// Expuestas para que la UI (ej. futuro botón "Sincronizar" o badge de
// "N cambios pendientes") pueda consultar/vaciar la cola. La lógica de
// sincronización real contra Firestore es un paso aparte, todavía no
// construido — esto solo deja la cola armada y consultable.
function obtenerColaCambiosOffline(){
  return [..._colaCambiosOffline];
}

function limpiarColaCambiosOffline(){
  _colaCambiosOffline = [];
  try{ localStorage.removeItem(AUDIOLINK_COLA_KEY); }
  catch(err){ console.error('AUDIOLINK offline-mock: error limpiando cola de cambios.', err); }
}

// v1.5 — Fase 2: sincronización real de la cola contra Firestore.
// Toma lo que dejó _encolarCambio() y lo escribe de verdad. Antes de
// aplicar un update() de sesiones, compara el actualizadoEn real en
// Firestore contra baseActualizadoEn (lo que el usuario tenía offline
// al momento de editar) — si difieren, es conflicto: no se sobreescribe
// solo, se guarda aparte en _conflictosOffline para que el usuario
// decida. Los add() de tomas no tienen conflicto posible (siempre
// crean un doc nuevo), se aplican directo.
const AUDIOLINK_CONFLICTOS_KEY = 'audiolink_offline_conflictos';
let _conflictosOffline = _restaurarConflictosDesdeLocalStorage();

function _restaurarConflictosDesdeLocalStorage(){
  try{
    const guardado = localStorage.getItem(AUDIOLINK_CONFLICTOS_KEY);
    if(guardado) return JSON.parse(guardado);
  }catch(err){
    console.error('AUDIOLINK offline-mock: no se pudo restaurar conflictos, se arranca vacío.', err);
  }
  return [];
}
function _guardarConflictosEnLocalStorage(){
  try{
    localStorage.setItem(AUDIOLINK_CONFLICTOS_KEY, JSON.stringify(_conflictosOffline));
  }catch(err){
    console.error('AUDIOLINK offline-mock: no se pudo guardar conflictos.', err);
  }
}
function obtenerConflictosOffline(){
  return [..._conflictosOffline];
}

// Compara dos valores de actualizadoEn que pueden venir en formatos
// distintos (Firestore Timestamp real con .toMillis(), objeto plano
// {seconds,nanoseconds} tras pasar por JSON, o null si nunca se guardó).
function _mismoValorActualizacion(a, b){
  if(a == null && b == null) return true;
  if(a == null || b == null) return false;
  const aMs = typeof a.toMillis === 'function' ? a.toMillis() : (a.seconds != null ? a.seconds * 1000 : a);
  const bMs = typeof b.toMillis === 'function' ? b.toMillis() : (b.seconds != null ? b.seconds * 1000 : b);
  return aMs === bMs;
}

let _sincronizandoOffline = false;

// Recorre la cola y sube cada cambio a Firestore real (firebase.firestore(),
// NUNCA crearDB() — necesitamos el real sin importar qué diga el switch
// de modo offline). Devuelve un resumen; no tira si algo falla, deja
// ese cambio en la cola para reintentar después.
async function sincronizarColaOffline(){
  if(_sincronizandoOffline) return { ok: false, motivo: 'ya_en_progreso' };
  if(!navigator.onLine) return { ok: false, motivo: 'sin_internet' };
  if(typeof firebase === 'undefined' || !firebase.firestore){
    console.error('AUDIOLINK offline-mock: firebase no está cargado, no se puede sincronizar.');
    return { ok: false, motivo: 'firebase_no_cargado' };
  }
  _sincronizandoOffline = true;
  let sincronizados = 0, conflictos = 0, errores = 0, no_reconocidos = 0;
  try{
    const db = firebase.firestore();
    const colaActual = [..._colaCambiosOffline];
    const pendientes = [];
    for(const cambio of colaActual){
      try{
        if(cambio.coleccion === 'tomas' && cambio.tipo === 'add'){
          await db.collection('proyectos').doc(cambio.proyectoId)
            .collection('sesiones').doc(cambio.sesionId)
            .collection('tomas').add(cambio.datos);
          sincronizados++;
        } else if(cambio.coleccion === 'sesiones' && cambio.tipo === 'update'){
          const ref = db.collection('proyectos').doc(cambio.proyectoId).collection('sesiones').doc(cambio.sesionId);
          const snap = await ref.get();
          const actualReal = snap.exists ? snap.data().actualizadoEn : null;
          if(!_mismoValorActualizacion(actualReal, cambio.baseActualizadoEn)){
            _conflictosOffline.push({ ...cambio, detectadoEn: new Date().toISOString() });
            _guardarConflictosEnLocalStorage();
            conflictos++;
            continue; // no se aplica ni se deja en la cola normal — queda en conflictos hasta que el usuario decida.
          }
          await ref.update(cambio.datos);
          sincronizados++;
        } else if(_COLECCIONES_ESCRIBIBLES_RAIZ.includes(cambio.coleccion) && cambio.tipo === 'add'){
          // v1.7 — sin conflicto posible (siempre crea un doc nuevo),
          // igual que 'tomas'/add de arriba.
          await db.collection(cambio.coleccion).add(cambio.datos);
          sincronizados++;
        } else if(_COLECCIONES_ESCRIBIBLES_RAIZ.includes(cambio.coleccion) && cambio.tipo === 'delete'){
          // v1.7 — sin conflicto posible: si alguien más ya lo había
          // borrado, Firestore no tira error al borrar un doc
          // inexistente, simplemente no hace nada.
          await db.collection(cambio.coleccion).doc(cambio.docId).delete();
          sincronizados++;
        } else if(_COLECCIONES_ESCRIBIBLES_RAIZ.includes(cambio.coleccion) && cambio.tipo === 'update'){
          // v1.9 — igual que 'sesiones'/update pero SIN detección de
          // conflicto (categoriasCocina no tiene actualizadoEn de
          // referencia como sesiones). Si dos personas editan la
          // misma categoría offline al mismo tiempo, gana el último
          // que sincroniza — riesgo aceptado, no se pidió más que eso.
          await db.collection(cambio.coleccion).doc(cambio.docId).update(cambio.datos);
          sincronizados++;
        } else if(_COLECCIONES_ESCRIBIBLES_RAIZ.includes(cambio.coleccion) && cambio.tipo === 'set'){
          // v1.9 — checkCompras.doc('activa').set(). Mismo sin-
          // conflicto que 'add'/'delete': set() siempre reemplaza el
          // doc completo, no hay merge parcial que pueda chocar.
          await db.collection(cambio.coleccion).doc(cambio.docId).set(cambio.datos);
          sincronizados++;
        } else {
          console.warn('AUDIOLINK offline-mock: cambio en cola con tipo/colección no reconocido, se deja pendiente.', cambio);
          no_reconocidos++;
          pendientes.push(cambio);
        }
      }catch(err){
        console.error('AUDIOLINK offline-mock: error sincronizando un cambio, se deja pendiente para reintentar.', cambio, err);
        errores++;
        pendientes.push(cambio);
      }
    }
    _colaCambiosOffline = pendientes;
    _guardarColaEnLocalStorage();
  } finally {
    _sincronizandoOffline = false;
  }
  return { ok: true, sincronizados, conflictos, errores, no_reconocidos };
}

// El usuario decide qué gana: 'mio' vuelve a aplicar el update que
// tenía offline (sobreescribe lo que haya ahora en Firestore);
// 'firestore' descarta el cambio offline y deja lo que ya está en
// Firestore tal cual. Cualquiera de los dos casos saca el conflicto
// de la lista.
async function resolverConflictoOffline(indice, decision){
  const conflicto = _conflictosOffline[indice];
  if(!conflicto) return { ok: false, motivo: 'no_encontrado' };
  if(decision === 'mio'){
    try{
      const db = firebase.firestore();
      await db.collection('proyectos').doc(conflicto.proyectoId)
        .collection('sesiones').doc(conflicto.sesionId)
        .update(conflicto.datos);
    }catch(err){
      console.error('AUDIOLINK offline-mock: error aplicando "mio" al resolver conflicto.', err);
      return { ok: false, motivo: 'error_firestore' };
    }
  }
  _conflictosOffline.splice(indice, 1);
  _guardarConflictosEnLocalStorage();
  return { ok: true };
}

// v1.4 — listeners onSnapshot "vivos". Antes, un onSnapshot() del mock
// disparaba el callback UNA sola vez al registrarse y quedaba congelado
// ahí para siempre — a diferencia de Firestore real, que vuelve a
// disparar el callback cada vez que los datos cambian (incluidos los
// cambios propios). Esto se notó en bitacora.html: suscribirTomas()
// usa onSnapshot() sobre tomas, y al agregar una toma con add() la
// lista no se refrescaba sola (solo al salir y volver a entrar, que
// vuelve a registrar el listener desde cero). Con este registro, add()
// avisa a los listeners activos de esa sesión para que se re-emitan.
const _listenersVivos = {};

function _registrarListenerVivo(pathKey, fnReemitir){
  if(!_listenersVivos[pathKey]) _listenersVivos[pathKey] = new Set();
  _listenersVivos[pathKey].add(fnReemitir);
  return function quitar(){
    if(_listenersVivos[pathKey]) _listenersVivos[pathKey].delete(fnReemitir);
  };
}

function _notificarListenersVivos(pathKey){
  (_listenersVivos[pathKey] || new Set()).forEach(fn => fn());
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
            pagos: json.pagos || [],
            // v1.2: tomas por sesión (proyecto.html ya las incluye en
            // el .json). Objeto { sesionId: [tomas...] }, no un array
            // plano — cada sesión tiene las suyas.
            tomasPorSesion: json.tomasPorSesion || {}
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
          // v1.0: necesarios para que bitacora/ingeniero/musico puedan
          // resolver "quién sos" offline (Grupo C) sin Firebase Auth.
          equipoInterno: json.equipoInterno || [],
          ingenieros: json.ingenieros || [],
          musicosPortal: json.musicosPortal || [],
          // v1.6: catálogos de cocina.html (colecciones raíz, mismo
          // patrón que equipoInterno/ingenieros/musicosPortal). Si el
          // .json no los trae (archivos viejos ya descargados o
          // mientras index.html no los empaquete todavía), quedan
          // como array vacío — no rompe nada.
          cocinaInsumos: json.cocinaInsumos || [],
          cocinaRecetas: json.cocinaRecetas || [],
          cocinaProductos: json.cocinaProductos || [],
          ventasCocina: json.ventasCocina || [],
          // v1.9: categoriasCocina sigue el mismo patrón array que los
          // 4 de arriba. checkCompras es doc único ('activa') — index.html
          // v2.29+ lo manda como objeto suelto (o null si no existe
          // todavía), acá se envuelve en array de 1 para que encaje
          // con el mismo mecanismo de búsqueda por id que usa
          // _mockDoc() para el resto de colecciones raíz.
          categoriasCocina: json.categoriasCocina || [],
          checkCompras: json.checkCompras ? [json.checkCompras] : [],
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
              pagos: p.pagos || [],
              // v1.2: mismo agregado que en audiolink_proyecto_offline.
              tomasPorSesion: p.tomasPorSesion || {}
            },
            fechaDescarga: json.fechaDescarga
          };
        });
        if(json.catalogos){
          _offlineData.catalogos = {
            musicos: json.catalogos.musicos || [],
            equipoTecnico: json.catalogos.equipoTecnico || [],
            estudios: json.catalogos.estudios || [],
            // v1.0: mismo agregado que en audiolink_catalogos_offline.
            equipoInterno: json.catalogos.equipoInterno || [],
            ingenieros: json.catalogos.ingenieros || [],
            musicosPortal: json.catalogos.musicosPortal || [],
            // v1.6: mismo agregado que en audiolink_catalogos_offline.
            cocinaInsumos: json.catalogos.cocinaInsumos || [],
            cocinaRecetas: json.catalogos.cocinaRecetas || [],
            cocinaProductos: json.catalogos.cocinaProductos || [],
            ventasCocina: json.catalogos.ventasCocina || [],
            // v1.9: mismo agregado que en audiolink_catalogos_offline.
            categoriasCocina: json.catalogos.categoriasCocina || [],
            checkCompras: json.catalogos.checkCompras ? [json.catalogos.checkCompras] : [],
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
// v1.8 — detecta el "sentinel" que devuelve
// firebase.firestore.FieldValue.serverTimestamp() (un objeto interno
// del SDK, no una fecha real — Firestore recién lo resuelve del lado
// del servidor). cocina.html lo usa en creadoEn al guardar ventas/
// insumos/recetas. Offline no hay servidor que lo resuelva, así que
// sin este reemplazo quedaría guardado el objeto crudo en memoria y
// se vería roto en cualquier pantalla que muestre esa fecha antes de
// sincronizar. Se reemplaza SOLO en la copia que va a memoria/UI —
// la cola de sincronización (_encolarCambio) sigue guardando el
// sentinel original, para que Firestore real lo resuelva como
// serverTimestamp de verdad al sincronizar.
function _reemplazarServerTimestampParaOffline(datos){
  const copia = { ...datos };
  Object.keys(copia).forEach(k => {
    const v = copia[k];
    if(v && typeof v === 'object' && typeof v._methodName === 'string' && v._methodName.toLowerCase().includes('servertimestamp')){
      copia[k] = new Date().toISOString();
    }
  });
  return copia;
}

function _mockColeccionRaiz(nombre){
  let docsBase = [];
  if(nombre === 'proyectos'){
    docsBase = Object.entries(_offlineData.proyectos).map(([id, p]) => ({ id, ...p.data }));
  } else if(_offlineData.catalogos && nombre in _offlineData.catalogos){
    docsBase = _offlineData.catalogos[nombre];
  }

  const query = _crearQueryEstatica(docsBase.map(d => _crearDocSnapshot(d.id, d)));
  query.doc = function(id){
    return _mockDoc(nombre, id);
  };

  // v1.7 — whitelist de escritura offline (ver constante
  // _COLECCIONES_ESCRIBIBLES_RAIZ más arriba). Mismo patrón que
  // tomasQuery dentro de _mockDoc (v1.3/v1.4): onSnapshot() se
  // sobreescribe puntualmente para registrar un listener vivo que se
  // re-emite solo cuando add()/delete() cambian los datos, sin tocar
  // el onSnapshot() genérico de _crearQueryEstatica (sigue igual para
  // cualquier otro uso, incluida esta misma colección en modo
  // solo-lectura si algún día se saca de la whitelist).
  if(_COLECCIONES_ESCRIBIBLES_RAIZ.includes(nombre) && _offlineData.catalogos){
    const _pathKeyCatalogo = `catalogo:${nombre}`;

    query.onSnapshot = function(callback){
      function _emitirCatalogo(){
        const itemsActuales = _offlineData.catalogos[nombre] || [];
        const fresca = _crearQueryEstatica(itemsActuales.map(d => _crearDocSnapshot(d.id, d)));
        fresca.get().then(callback);
      }
      setTimeout(_emitirCatalogo, 0);
      return _registrarListenerVivo(_pathKeyCatalogo, _emitirCatalogo);
    };

    query.add = async function(datos){
      const nuevoId = _generarIdOffline();
      // v1.8 — el doc que va a memoria/UI tiene los serverTimestamp()
      // ya resueltos a una fecha local; el que va a la cola de
      // sincronización (más abajo) mantiene el sentinel original.
      const nuevoDoc = { id: nuevoId, ..._reemplazarServerTimestampParaOffline(datos) };
      if(!_offlineData.catalogos[nombre]) _offlineData.catalogos[nombre] = [];
      _offlineData.catalogos[nombre].push(nuevoDoc);
      _encolarCambio({ tipo: 'add', coleccion: nombre, docId: nuevoId, datos });
      _guardarOfflineDataEnLocalStorage();
      _notificarListenersVivos(_pathKeyCatalogo);
      return { id: nuevoId };
    };
  }

  return query;
}

// v0.9: antes solo resolvía datos reales cuando coleccionRaiz==='proyectos'
// — .doc(id).get() sobre un catálogo (musicos/estudios/ingenieros/etc)
// SIEMPRE devolvía exists:false, aunque .collection('musicos').get()
// (la colección completa) sí funcionara. Esto pasaba desapercibido
// porque hasta ahora nada llamaba .doc(id) sobre un catálogo en modo
// offline — bitacora.html/ingeniero.html/musico.html sí lo necesitan
// (buscan ingenieros/{correo} y musicosPortal/{correo} by id) para
// saber "quién sos" sin Firebase Auth real. Ahora también busca por id
// dentro de _offlineData.catalogos[coleccionRaiz] si no es 'proyectos'.
function _mockDoc(coleccionRaiz, id){
  let dataEnMemoria = null;
  let subEnMemoria = {};

  if(coleccionRaiz === 'proyectos'){
    const p = _offlineData.proyectos[id];
    if(p){ dataEnMemoria = p.data; subEnMemoria = p.sub; }
  } else if(_offlineData.catalogos && coleccionRaiz in _offlineData.catalogos){
    const item = (_offlineData.catalogos[coleccionRaiz] || []).find(d => d.id === id);
    if(item) dataEnMemoria = item;
  }

  const docRef = {
    id,
    async get(){
      if(dataEnMemoria){
        return { exists: true, id, data: () => ({ ...dataEnMemoria }) };
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
        if(dataEnMemoria){
          callback({ exists: true, id, data: () => ({ ...dataEnMemoria }) });
        } else {
          callback({ exists: false, id, data: () => undefined });
        }
      }, 0);
      return function unsubscribe(){};
    },
    // Subcolección: solo tiene datos reales si coleccionRaiz === 'proyectos'
    // y ese proyecto fue cargado offline (sesiones/produccion/temas/pagos).
    collection(nombreSub){
      // v1.3: si la subcolección todavía no existe en memoria, se crea
      // vacía DENTRO de subEnMemoria (no una copia suelta) — necesario
      // para que .add()/.update() de más abajo escriban sobre el mismo
      // objeto que después se guarda en localStorage, no sobre un array
      // desconectado.
      if(!subEnMemoria[nombreSub]) subEnMemoria[nombreSub] = [];
      const items = subEnMemoria[nombreSub];
      const query = _crearQueryEstatica(items.map(d => _crearDocSnapshot(d.id, d, id)));
      // v1.1: se agrega .doc(subId) sobre la subcolección. Antes esta
      // solo servía para consultar TODA la subcolección de una vez
      // (.where/.orderBy/.get/.onSnapshot — ej. logistica.html listando
      // sesiones), pero ningún archivo había necesitado pedir un
      // documento puntual dentro de una subcolección hasta bitacora.html
      // (proyectos/{id}/sesiones/{sesionId}), que tronaba con "doc is
      // not a function" al armar sesionRef. Reutiliza los mismos `items`
      // ya resueltos en memoria arriba — no trae nada nuevo del .json.
      query.doc = function(subId){
        const docRef = {
          id: subId,
          async get(){
            const actual = items.find(d => d.id === subId);
            const { id: _o, ...r } = actual || {};
            return actual
              ? { exists: true, id: subId, data: () => ({ ...r }) }
              : { exists: false, id: subId, data: () => undefined };
          },
          onSnapshot(callback){
            // Mismo motivo de asincronía forzada que el resto del mock
            // (ver comentario en _mockDoc.onSnapshot más arriba).
            setTimeout(() => {
              const actual = items.find(d => d.id === subId);
              const { id: _o, ...r } = actual || {};
              callback(actual
                ? { exists: true, id: subId, data: () => ({ ...r }) }
                : { exists: false, id: subId, data: () => undefined });
            }, 0);
            return function unsubscribe(){};
          },
          collection(nombreSubSub){
            // v1.2 (con fix v1.3): única sub-sub-colección real hoy es
            // sesiones/{sesionId}/tomas — se lee de tomasPorSesion[subId].
            // BUG v1.2 corregido acá: la condición comparaba contra
            // coleccionRaiz (que en este punto siempre vale 'proyectos',
            // el padre) en vez de nombreSub (que es el nombre real de
            // esta subcolección, 'sesiones') — nunca daba true, por eso
            // el fix anterior no leía nada aunque no tirara error.
            if(nombreSub === 'sesiones' && nombreSubSub === 'tomas'){
              if(!subEnMemoria.tomasPorSesion) subEnMemoria.tomasPorSesion = {};
              if(!subEnMemoria.tomasPorSesion[subId]) subEnMemoria.tomasPorSesion[subId] = [];
              const tomas = subEnMemoria.tomasPorSesion[subId];
              const _pathKeyTomas = `tomas:${id}:${subId}`;
              const tomasQuery = _crearQueryEstatica(tomas.map(d => _crearDocSnapshot(d.id, d, subId)));
              // v1.4 — se sobreescribe onSnapshot puntualmente para esta
              // query de tomas: además del disparo async normal, registra
              // el callback en _listenersVivos bajo _pathKeyTomas, para
              // que add() (más abajo) pueda re-emitirlo cuando cambian
              // los datos. No toca el onSnapshot genérico de
              // _crearQueryEstatica (sigue igual para cualquier otro uso).
              tomasQuery.onSnapshot = function(callback){
                function _emitirTomas(){
                  const fresca = _crearQueryEstatica(tomas.map(d => _crearDocSnapshot(d.id, d, subId)));
                  fresca.get().then(callback);
                }
                setTimeout(_emitirTomas, 0);
                return _registrarListenerVivo(_pathKeyTomas, _emitirTomas);
              };
              // v1.3 — Parte 2: whitelist de escritura offline. add()
              // genera un id temporal 'offline_...', guarda la toma YA
              // en memoria (para que la UI la vea sin esperar sync) y
              // encola el cambio para cuando vuelva la señal. No hay
              // update()/delete() de tomas todavía — no se pidió, se
              // agrega cuando haga falta un caso real.
              tomasQuery.add = async function(datos){
                const nuevoId = _generarIdOffline();
                const nuevoDoc = { id: nuevoId, ...datos };
                tomas.push(nuevoDoc);
                _encolarCambio({ tipo: 'add', coleccion: 'tomas', proyectoId: id, sesionId: subId, docId: nuevoId, datos });
                _guardarOfflineDataEnLocalStorage();
                // v1.4 — avisa a cualquier onSnapshot() activo sobre esta
                // misma sesión/tomas para que se refresque solo, sin
                // esperar a salir y volver a entrar.
                _notificarListenersVivos(_pathKeyTomas);
                return { id: nuevoId };
              };
              return tomasQuery;
            }
            return _crearQueryEstatica([]);
          }
          // set() — Fase 2, no implementado a propósito. update() de
          // sesiones sí, más abajo (whitelist explícita).
        };
        // v1.3 — Parte 2: update() de la sesión misma, whitelist
        // estricta (solo nombreSub === 'sesiones'). Cualquier otra
        // colección (equipoTecnico, estudios, clientes, pagos, musicos,
        // etc.) sigue sin update()/add()/delete() — no agregarla sin
        // confirmarlo antes con el usuario.
        if(nombreSub === 'sesiones'){
          docRef.update = async function(datos){
            const idx = items.findIndex(d => d.id === subId);
            if(idx === -1){
              throw new Error(`AUDIOLINK offline-mock: no se puede actualizar la sesión "${subId}" porque no está cargada en memoria offline.`);
            }
            // v1.5 — se guarda el actualizadoEn que el usuario tenía
            // ANTES de aplicar este cambio (el que vio la última vez
            // que se descargó/leyó offline). Al sincronizar, se compara
            // contra el actualizadoEn real en Firestore en ese momento:
            // si difieren, alguien más (ej. Alejo) cambió la sesión
            // mientras estabas offline → conflicto, no se sobreescribe
            // solo.
            const baseActualizadoEn = items[idx].actualizadoEn ?? null;
            Object.assign(items[idx], datos);
            _encolarCambio({ tipo: 'update', coleccion: 'sesiones', proyectoId: id, sesionId: subId, docId: subId, datos, baseActualizadoEn });
            _guardarOfflineDataEnLocalStorage();
          };
        }
        return docRef;
      };
      return query;
    }
    // set()/add()/update() genérico sobre esta colección (no un doc
    // puntual) — Fase 2, no implementado a propósito. La whitelist real
    // (sesiones/tomas) vive en query.doc() de más arriba, sobre el doc
    // puntual — ahí es donde bitacora.html realmente escribe. Cualquier
    // otra colección (equipoTecnico, estudios, clientes, pagos, musicos,
    // etc.) debe seguir bloqueada y tirar error claro si alguien intenta
    // escribir offline — no agregarla a la whitelist sin confirmarlo
    // antes con el usuario.
  };

  // v1.7 — whitelist de escritura offline para colecciones RAÍZ (ver
  // _COLECCIONES_ESCRIBIBLES_RAIZ). delete() puntual: saca el doc de
  // _offlineData.catalogos[coleccionRaiz], encola el cambio y notifica
  // a cualquier onSnapshot() activo sobre esa colección (mismo
  // _pathKeyCatalogo que usa query.onSnapshot()/add() en
  // _mockColeccionRaiz). Sin update() a propósito — cocina.html no lo
  // usa sobre estas 4 colecciones.
  if(_COLECCIONES_ESCRIBIBLES_RAIZ.includes(coleccionRaiz) && _offlineData.catalogos){
    docRef.delete = async function(){
      const arr = _offlineData.catalogos[coleccionRaiz] || [];
      const idx = arr.findIndex(d => d.id === id);
      if(idx === -1){
        throw new Error(`AUDIOLINK offline-mock: no se puede borrar "${id}" de "${coleccionRaiz}" porque no está cargado en memoria offline.`);
      }
      arr.splice(idx, 1);
      _encolarCambio({ tipo: 'delete', coleccion: coleccionRaiz, docId: id });
      _guardarOfflineDataEnLocalStorage();
      _notificarListenersVivos(`catalogo:${coleccionRaiz}`);
    };
  }

  // v1.9 — update()/set() puntual sobre un doc de colección raíz.
  // Antes ningún doc raíz tenía esto (comentario viejo: "Sin update()
  // a propósito — cocina.html no lo usa sobre estas 4 colecciones").
  // Ahora categoriasCocina.doc(id).update({nombre}) y
  // checkCompras.doc('activa').set({...}) sí lo necesitan. Misma
  // whitelist que delete() arriba, pero sin exigir que el array ya
  // exista en memoria (checkCompras puede no tener nada descargado
  // todavía la primera vez que se usa offline).
  if(_COLECCIONES_ESCRIBIBLES_RAIZ.includes(coleccionRaiz)){
    docRef.update = async function(datos){
      const arr = (_offlineData.catalogos && _offlineData.catalogos[coleccionRaiz]) || [];
      const idx = arr.findIndex(d => d.id === id);
      if(idx === -1){
        throw new Error(`AUDIOLINK offline-mock: no se puede actualizar "${id}" en "${coleccionRaiz}" porque no está cargado en memoria offline.`);
      }
      Object.assign(arr[idx], _reemplazarServerTimestampParaOffline(datos));
      _encolarCambio({ tipo: 'update', coleccion: coleccionRaiz, docId: id, datos });
      _guardarOfflineDataEnLocalStorage();
      _notificarListenersVivos(`catalogo:${coleccionRaiz}`);
    };

    // set() es upsert (crea si no existe, reemplaza si existe) — así
    // se comporta Firestore real. checkCompras.doc('activa') lo usa
    // porque ese doc puede no existir todavía (primera vez que se abre
    // la pestaña Compras).
    docRef.set = async function(datos){
      if(!_offlineData.catalogos) _offlineData.catalogos = {};
      if(!_offlineData.catalogos[coleccionRaiz]) _offlineData.catalogos[coleccionRaiz] = [];
      const arr = _offlineData.catalogos[coleccionRaiz];
      const datosResueltos = _reemplazarServerTimestampParaOffline(datos);
      const idx = arr.findIndex(d => d.id === id);
      if(idx === -1){
        arr.push({ id, ...datosResueltos });
      } else {
        arr[idx] = { id, ...datosResueltos };
      }
      _encolarCambio({ tipo: 'set', coleccion: coleccionRaiz, docId: id, datos });
      _guardarOfflineDataEnLocalStorage();
      _notificarListenersVivos(`catalogo:${coleccionRaiz}`);
    };
  }

  return docRef;
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
