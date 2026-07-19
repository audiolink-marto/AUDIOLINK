/* AUDIOLINK · firebase-config.js · v1.0
   Config Firebase compartida por todo el ecosistema (cotizador, index,
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
