/* AUDIOLINK · sw.js · v1.0
   Service worker (cascarón offline) para que ensayo.html abra sin señal
   dentro del .exe (Tauri/WebView2) y en el navegador. Lo registra
   registrar-sw.js (interruptor ACTIVAR_SW). Debe quedar en la MISMA
   carpeta que ensayo.html: su alcance es la carpeta donde vive.

   Decisiones (acordadas):
   (1) LA RED PRIMERO para los archivos del propio sitio: con internet
       siempre se carga la versión fresca y se guarda una copia; solo si
       la red falla (o tarda más de TIMEOUT_RED_MS) se sirve la copia.
       Así un despliegue nuevo llega solo y nadie queda atrapado en una
       versión vieja.
   (2) Librerías externas versionadas (Firebase, jsPDF, Google Fonts): la
       copia primero, y si no hay se baja y se guarda.
   (3) NO se toca: Firestore / Auth / Cloudinary (el audio tiene su propio
       caché en la app: audiolink-audio-cache-v1 y audiolink-audio-offline-v1),
       peticiones que no sean GET, ni peticiones con Range (audio).
   (4) Al instalarse se guarda de una vez la lista PRECARGA (archivos de
       ensayo.html) y las librerías externas, para que sirva sin señal
       desde la primera visita. Si un archivo no existe, no se aborta.
   Nombres de caché audiolink-sitio-* y audiolink-cdn-*: coinciden con lo
   que borra el interruptor de registrar-sw.js al apagarse.
   Para subir de versión forzando limpieza: cambiar VERSION. */
'use strict';

const VERSION = 'v1';
const CACHE_SITIO = 'audiolink-sitio-' + VERSION;
const CACHE_CDN = 'audiolink-cdn-' + VERSION;
const TIMEOUT_RED_MS = 4000;

// Rutas relativas a la ubicación de sw.js.
const PRECARGA = [
  'ensayo.html',
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

self.addEventListener('install', function(event){
  event.waitUntil((async function(){
    const sitio = await caches.open(CACHE_SITIO);
    await Promise.all(PRECARGA.map(async function(ruta){
      try{
        const url = new URL(ruta, self.location.href).href;
        const res = await fetch(new Request(url, { cache: 'reload' }));
        if(res && res.ok) await sitio.put(url, res);
      }catch(e){ /* falta ese archivo o no hay red: no se aborta la instalación */ }
    }));
    const cdn = await caches.open(CACHE_CDN);
    await Promise.all(PRECARGA_CDN.map(async function(url){
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
  // Firestore, Auth, Cloudinary y cualquier otro origen: el navegador decide.
});
