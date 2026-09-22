/* AUDIOLINK · registrar-sw.js · v1.1
   Registra sw.js (cascarón offline). Es el ÚNICO punto que instala el
   service worker: cargarlo con `defer` en cada hoja que deba abrir sin
   señal (hoy: ensayo.html). Para sumar otra hoja: cargar este archivo en
   ella y agregar su nombre a las listas de sw.js.
   Solo actúa en https (o localhost), que es lo que exigen los service workers.

   v1.1: INTERRUPTOR. Poner ACTIVAR_SW = false y desplegar este archivo (es
   chico, no hace falta tocar ningún HTML) apaga todo: en el siguiente
   arranque de cada dispositivo se desregistra el service worker y se borran
   sus copias (audiolink-sitio/cdn/partituras). NO se toca el caché de
   canciones de la app (audiolink-audio-cache-v1) ni ningún dato. Con
   ACTIVAR_SW = true (valor normal) se registra como siempre. */
(function(){
  'use strict';
  const ACTIVAR_SW = false;

  if(!('serviceWorker' in navigator)) return;

  if(!ACTIVAR_SW){
    navigator.serviceWorker.getRegistrations()
      .then(function(regs){ regs.forEach(function(r){ r.unregister(); }); })
      .catch(function(){});
    if(window.caches){
      caches.keys().then(function(claves){
        claves.filter(function(k){ return /^audiolink-(sitio|cdn|partituras)-/.test(k); })
              .forEach(function(k){ caches.delete(k); });
      }).catch(function(){});
    }
    return;
  }

  if(location.protocol !== 'https:' && location.hostname !== 'localhost') return;
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').catch(function(e){
      console.warn('AUDIOLINK: no se pudo registrar el service worker.', e);
    });
  });
})();
