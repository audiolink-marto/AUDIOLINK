/* AUDIOLINK · registrar-sw.js · v1.2
   Registra sw.js (cascarón offline). Es el ÚNICO punto que instala el
   service worker: cargarlo con `defer` en cada hoja que deba abrir sin
   señal (hoy: ensayo.html). Para sumar otra hoja: cargar este archivo en
   ella y agregar sus archivos a la lista PRECARGA de sw.js.
   Solo actúa en https (o localhost), que es lo que exigen los service workers.

   v1.2: ACTIVAR_SW = true (ahora sí existe sw.js v1.0: la red primero,
   la copia solo si la red falla; ver su cabecera). Al abrir cada hoja
   se pide al navegador que revise si hay un sw.js nuevo (update()),
   para que una versión nueva se instale sin esperar. El interruptor
   de v1.1 se conserva sin cambios: con ACTIVAR_SW = false se
   desregistra el service worker y se borran sus copias.

   v1.1: INTERRUPTOR. Poner ACTIVAR_SW = false y desplegar este archivo (es
   chico, no hace falta tocar ningún HTML) apaga todo: en el siguiente
   arranque de cada dispositivo se desregistra el service worker y se borran
   sus copias (audiolink-sitio/cdn/partituras). NO se toca el caché de
   canciones de la app (audiolink-audio-cache-v1) ni ningún dato. Con
   ACTIVAR_SW = true (valor normal) se registra como siempre. */
(function(){
  'use strict';
  const ACTIVAR_SW = true;

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
    navigator.serviceWorker.register('sw.js').then(function(reg){
      // Revisa si hay un sw.js nuevo (solo con red; sin red falla en silencio).
      if(reg && typeof reg.update === 'function') reg.update().catch(function(){});
    }).catch(function(e){
      console.warn('AUDIOLINK: no se pudo registrar el service worker.', e);
    });
  });
})();
