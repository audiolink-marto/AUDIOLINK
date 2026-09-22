/* AUDIOLINK · practica-movil.js · v1 (ayudas móviles compartidas: ensayo.html + musico.html)
   v1: archivo NUEVO — reúne lo que no toca la lógica de práctica y sirve
   igual en los dos HTML, para mantenerlo en un solo lugar:
   (1) (el registro del service worker vive ahora en registrar-sw.js),
   (2) mantiene la pantalla encendida mientras suena la pista o el
       metrónomo (Wake Lock),
   (3) muestra título y controles de reproducción en la pantalla de
       bloqueo (Media Session) — SOLO donde el navegador lo permite, ver
       nota abajo,
   (4) pellizco de dos dedos para hacer zoom en la onda.
   No modifica ninguna función ni variable de los HTML: solo LEE sus
   globals (estadoPractica, dibujarWaveform, togglePlayPractica,
   WAVEFORM_ZOOM_MIN/MAX) y llama a lo que ya existe. Cargar con `defer`,
   después de los scripts en línea.

   Nota sobre viewport-fit=cover: a propósito NO se agrega. Con "cover" la
   página se dibuja también bajo el notch y la barra de gestos, y los
   elementos fijos de nav.js/header-config.js (que no se tocaron) quedarían
   tapados al instalar la app. Sin "cover", el navegador ya deja los
   márgenes seguros por su cuenta. */
(function(){
  'use strict';

  // ---------- estado de reproducción (sondeo liviano, 1 vez por segundo) ----------
  // Se sondea en vez de escuchar eventos porque el motor de audio puede ser
  // un <audio>, el reproductor Web Audio propio (no emite eventos DOM) o el
  // player de YouTube: los tres exponen su estado de formas distintas.
  function uidSonando(){
    if(typeof estadoPractica === 'undefined') return null;
    for(const uid in estadoPractica){
      const e = estadoPractica[uid];
      if(!e) continue;
      if(e.audioActivo && e.audioActivo.paused === false) return uid;
      if(e.metroLibreActivo) return uid;
      try{
        if(e.ytPlayer && typeof e.ytPlayer.getPlayerState === 'function' && e.ytPlayer.getPlayerState() === 1) return uid;
      }catch(err){ /* el player de YouTube puede no estar listo todavía */ }
    }
    return null;
  }

  // ---------- (2) Wake Lock ----------
  let wakeLock = null;
  async function pedirWakeLock(){
    if(!('wakeLock' in navigator) || wakeLock || document.visibilityState !== 'visible') return;
    try{
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', function(){ wakeLock = null; });
    }catch(e){ wakeLock = null; /* batería baja o permiso denegado: no es crítico */ }
  }
  function soltarWakeLock(){
    if(!wakeLock) return;
    try{ wakeLock.release(); }catch(e){}
    wakeLock = null;
  }

  // ---------- (3) Media Session ----------
  // Nota: Chrome/Android solo muestra estos controles cuando suena un
  // elemento <audio>/<video>. Con el reproductor Web Audio de baja latencia
  // (el que usa la app una vez decodificada la pista) el sistema no los
  // muestra; el metadato y los manejadores quedan listos por si el motor es
  // un <audio> (p. ej. mientras decodifica).
  let uidMediaSession = null;
  function configurarMediaSession(uid){
    if(!('mediaSession' in navigator) || uidMediaSession === uid) return;
    uidMediaSession = uid;
    const titEl = document.getElementById('practicaTituloTema');
    const titulo = ((titEl && titEl.textContent) || document.title || 'AUDIOLINK').trim();
    try{ navigator.mediaSession.metadata = new MediaMetadata({ title: titulo, artist: 'AUDIOLINK' }); }catch(e){}
    const manejador = function(accion, fn){ try{ navigator.mediaSession.setActionHandler(accion, fn); }catch(e){} };
    const saltar = function(delta){
      const e = estadoPractica[uid];
      if(!e || !e.seek || !e.getTiempoActual) return;
      const dur = e.getDuracion ? e.getDuracion() : 0;
      const t = e.getTiempoActual() + delta;
      e.seek(Math.max(0, dur ? Math.min(dur, t) : t));
    };
    manejador('play', function(){
      const e = estadoPractica[uid];
      if(e && e.audioActivo && e.audioActivo.paused && typeof togglePlayPractica === 'function') togglePlayPractica(uid);
    });
    manejador('pause', function(){
      const e = estadoPractica[uid];
      if(e && e.audioActivo && !e.audioActivo.paused && typeof togglePlayPractica === 'function') togglePlayPractica(uid);
    });
    manejador('seekbackward', function(){ saltar(-10); });
    manejador('seekforward', function(){ saltar(10); });
    manejador('seekto', function(d){
      const e = estadoPractica[uid];
      if(e && e.seek && d && typeof d.seekTime === 'number') e.seek(Math.max(0, d.seekTime));
    });
  }

  function sincronizar(){
    const uid = uidSonando();
    if(uid){
      pedirWakeLock();
      configurarMediaSession(uid);
      if('mediaSession' in navigator){ try{ navigator.mediaSession.playbackState = 'playing'; }catch(e){} }
    }else{
      soltarWakeLock();
      if('mediaSession' in navigator && uidMediaSession){ try{ navigator.mediaSession.playbackState = 'paused'; }catch(e){} }
    }
  }
  setInterval(sincronizar, 1000);
  // el navegador suelta el wake lock al ocultar la pestaña: se vuelve a pedir al volver
  document.addEventListener('visibilitychange', function(){
    if(document.visibilityState === 'visible') sincronizar();
  });

  // ---------- (4) Pellizco para zoom en la onda ----------
  // touch-action: pan-x pan-y (ver CSS) deja el desplazamiento nativo de la
  // onda con un dedo y libera los dos dedos para este gesto. Mismo rango y
  // mismo redibujado que los botones +/− (zoom entero 1×–8×); el punto de
  // la canción que queda entre los dedos se mantiene bajo ellos.
  let pinch = null;
  function distancia(t){ return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }

  document.addEventListener('touchstart', function(ev){
    if(ev.touches.length !== 2 || typeof estadoPractica === 'undefined') return;
    const wrap = ev.target && ev.target.closest ? ev.target.closest('.practica-waveform-wrap') : null;
    if(!wrap) return;
    const uid = (wrap.id || '').replace('waveformwrap-', '');
    const est = estadoPractica[uid];
    if(!est) return;
    const rect = wrap.getBoundingClientRect();
    const cx = (ev.touches[0].clientX + ev.touches[1].clientX) / 2 - rect.left;
    const ancho = wrap.scrollWidth || wrap.clientWidth || 1;
    pinch = { uid: uid, wrap: wrap, d0: distancia(ev.touches) || 1, z0: est.waveformZoom || 1, frac: (wrap.scrollLeft + cx) / ancho, cx: cx };
  }, { passive: true });

  // Listener PASIVO a propósito: uno no pasivo a nivel de documento obliga al
  // navegador a esperar a este código antes de cada desplazamiento táctil, y
  // con la onda redibujándose a 60 fps eso se sentiría trabado en TODA la
  // página. No hace falta preventDefault: touch-action (ver CSS) ya impide el
  // zoom del navegador sobre la onda.
  document.addEventListener('touchmove', function(ev){
    if(!pinch || ev.touches.length !== 2) return;
    const est = estadoPractica[pinch.uid];
    if(!est) return;
    const zMin = (typeof WAVEFORM_ZOOM_MIN === 'number') ? WAVEFORM_ZOOM_MIN : 1;
    const zMax = (typeof WAVEFORM_ZOOM_MAX === 'number') ? WAVEFORM_ZOOM_MAX : 8;
    const nuevo = Math.max(zMin, Math.min(zMax, Math.round(pinch.z0 * (distancia(ev.touches) / pinch.d0))));
    if(nuevo === (est.waveformZoom || 1)) return;
    est.waveformZoom = nuevo;
    // gesto manual: el autoscroll de la onda se pausa (mismo criterio que un scroll a mano)
    est.waveformUltimoScrollManual = performance.now();
    const label = document.getElementById('waveformzoomlabel-' + pinch.uid);
    if(label) label.textContent = nuevo + '×';
    dibujarWaveform(pinch.uid, est.getTiempoActual ? est.getTiempoActual() : 0);
    pinch.wrap.scrollLeft = pinch.frac * (pinch.wrap.scrollWidth || 1) - pinch.cx;
  }, { passive: true });

  function terminarPellizco(ev){ if(pinch && ev.touches.length < 2) pinch = null; }
  document.addEventListener('touchend', terminarPellizco, { passive: true });
  document.addEventListener('touchcancel', terminarPellizco, { passive: true });
})();
