/* AUDIOLINK · firebase-config.js · v1.2
   v1.2: crearDB() ahora revisa primero un override guardado en
   localStorage (clave AUDIOLINK_OFFLINE_OVERRIDE) — lo controla el
   switch visual del panel "MODO OFFLINE" en index.html (v2.22). Si no
   hay override guardado, se usa AUDIOLINK_MODO_OFFLINE como antes (el
   default de fábrica, editable acá a mano si se prefiere). El switch
   no reemplaza el flag, solo le gana cuando está presente — así
   siempre queda un valor de respaldo claro en el código. Motivo: antes
   solo se podía cambiar offline/online editando este archivo a mano,
   lo que llevó a que quedara en `true` sin querer y el dashboard se
   viera vacío (nada de calendario ni proyectos) sin ningún aviso de
   por qué.

   v1.1: se agrega el flag AUDIOLINK_MODO_OFFLINE y la función crearDB().
   Antes cada archivo hacía `const db = firebase.firestore();` directo.
   Ahora ese mismo archivo puede hacer `const db = crearDB();` — si el
   flag está en false (default), crearDB() devuelve firebase.firestore()
   real, sin ningún cambio de comportamiento. Si está en true, devuelve
   un mock que vive en offline-mock.js (archivo nuevo, cargarlo ANTES
   de firebase-config.js si se va a usar modo offline). Ningún archivo
   HTML fue modificado todavía para usar crearDB() en vez de
   firebase.firestore() directo — ese cambio se hace archivo por
   archivo, por separado, para no romper nada de golpe. Mientras un
   archivo no se migre, sigue funcionando exactamente igual que antes.

   v1.0: Config Firebase compartida por todo el ecosistema (cotizador, index,
   login, logistica, pagos, portal, proyecto). Antes estaba copiada y
   pegada en cada archivo; ahora vive en un solo lugar. Los valores son
   exactamente los mismos que ya tenía cada HTML — ningún cambio de
   proyecto/API key. Se carga con <script src="firebase-config.js"></script>
   ANTES de firebase.initializeApp(firebaseConfig) en cada página. */
const firebaseConfig = {
  apiKey: "AIzaSyB8yE-H1urpKOr-K4H2fzRRq5X-PlQZQgs",
  authDomain: "audiolink-44abd.firebaseapp.com",
  projectId: "audiolink-44abd",
  storageBucket: "audiolink-44abd.firebasestorage.app",
  messagingSenderId: "497341329998",
  appId: "1:497341329998:web:58f8c33f971a2626c6491f"
};

// Flag manual — cambiar a true solo cuando se vaya a trabajar sin señal
// (ej. antes de salir a terreno, con el archivo offline ya cargado).
// A propósito NO hay detección automática de red: un wifi lento/inestable
// daría falsos positivos y activaría el mock sin que el usuario lo pida.
const AUDIOLINK_MODO_OFFLINE = false;

// Uso en cada archivo (reemplaza `const db = firebase.firestore();`):
//   const db = crearDB();
// Revisa primero el override del switch visual (localStorage); si no
// hay override guardado, cae al flag AUDIOLINK_MODO_OFFLINE de arriba.
// Si el resultado es "offline", requiere que offline-mock.js esté
// cargado ANTES que este archivo (expone window.crearDBOffline()).
function crearDB(){
  let modoOffline = AUDIOLINK_MODO_OFFLINE;
  try{
    const override = localStorage.getItem('AUDIOLINK_OFFLINE_OVERRIDE');
    if(override === 'true') modoOffline = true;
    if(override === 'false') modoOffline = false;
  }catch(err){
    console.error('AUDIOLINK: no se pudo leer el override de modo offline, se usa el flag por defecto.', err);
  }

  if(modoOffline){
    if(typeof crearDBOffline !== 'function'){
      console.error('AUDIOLINK: modo offline activado pero offline-mock.js no está cargado. Revisar orden de <script> en el <head>.');
      return firebase.firestore();
    }
    return crearDBOffline();
  }
  return firebase.firestore();
}
