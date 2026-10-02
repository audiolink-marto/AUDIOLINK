/* AUDIOLINK · sw.js · v1.1
   Service worker (cascarón offline) para que las hojas del ecosistema
   abran sin señal dentro del .exe (Tauri/WebView2) y en el navegador. Lo
   registra registrar-sw.js (interruptor ACTIVAR_SW). Debe quedar en la
   MISMA carpeta que las hojas: su alcance es la carpeta donde vive.

   v1.1: (a pedido: "usar lo que más se pueda sin conexión") deja de
   cubrir solo ensayo.html. Al instalarse guarda TODAS las hojas de
   PAGINAS (las del menú de nav.js más login, musico, guia-practica,
   bitacora e ingeniero) y DESCUBRE solos los archivos que cada una
   carga (<script src>, <link href>, <img src>): los del sitio y las
   librerías externas permitidas (Firebase, jsPDF, Tone, Google Fonts).
   Así no hay que mantener una lista por hoja. Lo que una hoja pida
   después (p. ej. una imagen referida desde CSS) se guarda la primera
   vez que se abra con señal. VERSION pasa a 'v2' para que se limpie la
   copia de v1.0. No cambia la estrategia ni lo que NO se toca.

   Decisiones (v1.0, vigentes):
   (1) LA RED PRIMERO para los archivos del propio sitio: con internet
       siempre se carga la versión fresca y se guarda una copia; solo si
       la red falla (o tarda más de TIMEOUT_RED_MS) se sirve la copia.
       Así un despliegue nuevo llega solo y nadie queda atrapado en una
       versión vieja.
   (2) Librerías externas versionadas (Firebase, jsPDF, Tone, Google
       Fonts): la copia primero, y si no hay se baja y se guarda.
   (3) NO se toca: Firestore / Auth / Cloudinary (el audio tiene su propio
       caché en la app: audiolink-audio-cache-v1 y audiolink-audio-offline-v1),
       YouTube, peticiones que no sean GET, ni peticiones con Range (audio).
   (4) Si un archivo no existe o no hay red al instalar, no se aborta.
   Nombres de caché audiolink-sitio-* y audiolink-cdn-*: coinciden con lo
   que borra el interruptor de registrar-sw.js al apagarse.
   Límite: abrir una hoja sin señal solo sirve si antes se abrió con señal
   (para sus datos hace falta además la persistencia de Firestore de cada
   hoja, que se va activando hoja por hoja con audiolink-local.js). */
'use strict';

const VERSION = 'v2';
const CACHE_SITIO = 'audiolink-sitio-' + VERSION;
const CACHE_CDN = 'audiolink-cdn-' + VERSION;
const TIMEOUT_RED_MS = 4000;

// Hojas completas (rutas relativas a sw.js). Se guardan y se analizan.
const PAGINAS = [
  'index.html', 'ensayo.html', 'login.html',
  'proyecto.html', 'clientes.html', 'recordatorios.html',
  'estudios.html', 'musicos.html', 'equipo-tecnico.html',
  'logistica.html', 'eventos.html', 'cocina.html', 'vacas.html',
  'pagos.html', 'egresos.html', 'cotizador.html',
  'avatares-iconos.html', 'header-config.html',
  'musico.html', 'guia-practica.html', 'bitacora.html', 'ingeniero.html'
];
// Archivos que se guardan aunque ninguna hoja los nombre de forma directa.
const PRECARGA = [
  'audiolink-local.js', 'offline-mock.js', 'firebase-config.js', 'utils.js',
  'header-config.js', 'pdf-armonias.js', 'pdf-percusion.js', 'practica-movil.js',
  'registrar-sw.js', 'nav.js', 'nav.css', 'manifest.webmanifest',
  'logo/apple-touch-icon.png', 'logo/logo-circular-192.png', 'logo/logo-knob-192.png',
  'img/DIFFUSER.jpg', 'img/logo%201.png',
  // copias locales opcionales (si no existen, se ignoran)
  'vendor/firebase-app-compat.js', 'vendor/firebase-auth-compat.js',
  'vendor/firebase-firestore-compat.js', 'vendor/jspdf.umd.min.js'
];
const PRECARGA_CDN = [
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&display=swap'
];

// ¿Es una librería externa que se puede guardar? (solo estos orígenes)
function esLibreriaExterna(url){
  if(url.hostname === 'www.gstatic.com') return url.pathname.indexOf('/firebasejs/') === 0;
  return url.hostname === 'cdnjs.cloudflare.com' ||
         url.hostname === 'fonts.googleapis.com' ||
         url.hostname === 'fonts.gstatic.com';
}

function guardable(res){
  return !!res && (res.ok || res.type === 'opaque');
}

function absoluta(ruta){
  return new URL(ruta, self.location.href).href;
}

// Busca en el HTML de una hoja los archivos que carga y los suma a los
// conjuntos (propios del sitio / librerías externas permitidas).
function descubrir(html, urlPagina, sitioSet, cdnSet){
  const etiquetas = html.match(/<(?:script|link|img)\b[^>]*>/gi) || [];
  etiquetas.forEach(function(tag){
    const nombre = (/^<\s*(script|link|img)/i.exec(tag) || [])[1];
    if(!nombre) return;
    if(nombre.toLowerCase() === 'link' && /\brel\s*=\s*["']?(preconnect|dns-prefetch)/i.test(tag)) return;
    const atributo = nombre.toLowerCase() === 'link' ? 'href' : 'src';
    const m = new RegExp('\\b' + atributo + '\\s*=\\s*["\']([^"\']+)["\']', 'i').exec(tag);
    if(!m) return;
    const valor = m[1].trim();
    if(!valor || /^(data:|blob:|javascript:|mailto:|tel:|#)/i.test(valor)) return;
    let u;
    try{ u = new URL(valor, urlPagina); }catch(e){ return; }
    u.hash = '';
    if(u.protocol !== 'https:' && u.protocol !== 'http:') return;
    if(u.origin === self.location.origin){
      if(/\/sw\.js$/.test(u.pathname)) return;
      sitioSet.add(u.href);
    }else if(esLibreriaExterna(u)){
      cdnSet.add(u.href);
    }
  });
}

self.addEventListener('install', function(event){
  event.waitUntil((async function(){
    const sitio = await caches.open(CACHE_SITIO);
    const cdn = await caches.open(CACHE_CDN);
    const sitioSet = new Set(PRECARGA.map(absoluta));
    const cdnSet = new Set(PRECARGA_CDN);
    const paginas = PAGINAS.map(absoluta);
    const guardadas = new Set();

    // 1) Las hojas: se guardan y se analizan para descubrir sus archivos.
    await Promise.all(paginas.map(async function(url){
      try{
        const res = await fetch(new Request(url, { cache: 'reload' }));
        if(res && res.ok){
          const copia = res.clone();
          await sitio.put(url, res);
          guardadas.add(url);
          descubrir(await copia.text(), url, sitioSet, cdnSet);
        }
      }catch(e){ /* esa hoja no existe o no hay red: no se aborta */ }
    }));

    // 2) Los archivos propios que esas hojas cargan (y la lista fija).
    await Promise.all([...sitioSet].filter(function(u){ return !guardadas.has(u) && paginas.indexOf(u) === -1; }).map(async function(url){
      try{
        const res = await fetch(new Request(url, { cache: 'reload' }));
        if(res && res.ok) await sitio.put(url, res);
      }catch(e){ /* falta ese archivo o no hay red */ }
    }));

    // 3) Las librerías externas permitidas.
    await Promise.all([...cdnSet].map(async function(url){
      try{
        const res = await fetch(new Request(url, { mode: 'no-cors' }));
        if(guardable(res)) await cdn.put(url, res);
      }catch(e){ /* sin red al instalar: se llenará en el primer uso */ }
    }));

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', function(event){
  event.waitUntil((async function(){
    const claves = await caches.keys();
    await Promise.all(claves.filter(function(k){
      return (/^audiolink-(sitio|cdn)-/.test(k)) && k !== CACHE_SITIO && k !== CACHE_CDN;
    }).map(function(k){ return caches.delete(k); }));
    await self.clients.claim();
  })());
});

// Espera la red hasta TIMEOUT_RED_MS; devuelve null si vence (la petición
// sigue en segundo plano y actualiza la copia cuando termine).
function esperarRed(promesaRed){
  return new Promise(function(resolve, reject){
    let listo = false;
    const t = setTimeout(function(){ if(!listo){ listo = true; resolve(null); } }, TIMEOUT_RED_MS);
    promesaRed.then(function(v){
      if(!listo){ listo = true; clearTimeout(t); resolve(v); }
    }, function(e){
      if(!listo){ listo = true; clearTimeout(t); reject(e); }
    });
  });
}

async function redPrimero(event){
  const req = event.request;
  const cache = await caches.open(CACHE_SITIO);
  const buscarCopia = function(){ return cache.match(req, { ignoreSearch: true }); };

  // La petición de red también guarda la copia, aunque llegue tarde.
  const red = fetch(req).then(function(res){
    if(res && res.ok) cache.put(req, res.clone()).catch(function(){});
    return res;
  });
  event.waitUntil(red.catch(function(){}));

  let res = null;
  try{
    res = await esperarRed(red);
  }catch(e){
    const copia = await buscarCopia();
    if(copia) return copia;
    return Response.error();
  }
  if(res === null){ // tardó demasiado
    const copia = await buscarCopia();
    if(copia) return copia;
    try{ return await red; }catch(e){ return Response.error(); }
  }
  if(res.status >= 500){ // el servidor falló: mejor la copia si existe
    const copia = await buscarCopia();
    if(copia) return copia;
  }
  return res;
}

async function copiaPrimero(event){
  const req = event.request;
  const cache = await caches.open(CACHE_CDN);
  const copia = await cache.match(req);
  if(copia) return copia;
  try{
    const res = await fetch(req);
    if(guardable(res)) cache.put(req, res.clone()).catch(function(){});
    return res;
  }catch(e){
    return Response.error();
  }
}

self.addEventListener('fetch', function(event){
  const req = event.request;
  if(req.method !== 'GET') return;
  if(req.headers && req.headers.has('range')) return; // audio por tramos: no se toca
  let url;
  try{ url = new URL(req.url); }catch(e){ return; }
  if(url.protocol !== 'https:' && url.protocol !== 'http:') return;

  if(url.origin === self.location.origin){
    event.respondWith(redPrimero(event));
    return;
  }
  if(esLibreriaExterna(url)){
    event.respondWith(copiaPrimero(event));
    return;
  }
  // Firestore, Auth, Cloudinary, YouTube y cualquier otro origen: el navegador decide.
});
