// AUDIOLINK · pdf-armonias.js · v1.102
// v1.102: (a pedido, FIX real tras revisión de PDF — reemplaza el
// intento anterior de esta misma versión, descartado por el usuario) el
// cierre "‖" del marco de repetición del Vamp (v1.101) invadía la caja
// sobrante cuando sobra>0, porque se dibuja hacia afuera asumiendo
// espacio vacío ahí, y esa caja queda pegada justo después. En vez de
// tocar el dibujo del cierre (se probó y se descartó: "dejalo igual que
// estaba"), se aleja la caja sobrante: dibujarCajas gana opciones.
// gapDesdeColumna + opciones.gapMm — a partir de esa columna (inclusive)
// suma gapMm al x de la caja. La llamada del Vamp la usa solo cuando
// sobra>0 (gapDesdeColumna: ciclo, gapMm: 6) — deja 6mm de aire real
// entre la última caja del ciclo y la caja sobrante, suficiente para que
// el cierre del marco (dibujarBarraRepeticion, sin cambios) quepa sin
// solaparse. Sin sobra, sin cambios. Réplica en pdf-percusion.js v1.99.
// AUDIOLINK · pdf-armonias.js · v1.101
// v1.101: (a pedido) marco de repetición (‖: ... :‖, el que ya usaba
// fija-bloque con repeticiones>1 vía dibujarBarraRepeticion) ahora
// también se dibuja en Vamp, siempre — antes el Vamp solo tenía el
// iconito antes del texto "se repite...", sin marco alrededor de las
// cajas. Envuelve únicamente las cajas del ciclo (ancho = min(ciclo,
// POR_FILA)*cajaAncho), nunca la caja sobrante cuando `sobra > 0` la
// agrega a la grilla — objetivo puntual: distinguir visualmente qué se
// repite (ciclo) de qué es el compás suelto (sobra). Sin sobra, cambio
// visual nuevo: el ciclo completo queda enmarcado (antes no llevaba
// marco). Mismo cambio replicado en pdf-percusion.js v1.98.
// AUDIOLINK · pdf-armonias.js · v1.100
// v1.100: (a pedido, FIX real) vamp con ciclo que no cierra exacto (ej.
// ciclo de 2 comp. + 1 comp. suelto, duración total 5) numeraba mal el
// "#N" (compás real global) de la caja sobrante — la calculaba como
// compasGlobalInicio+posLabel (mismo criterio lineal que las columnas
// del ciclo), dando #3 en vez de #5, porque esa caja en realidad ocurre
// DESPUÉS de las vueltas completas del ciclo, no en la 3ra posición
// lineal. Fix: dibujarCajas() gana un opciones.numerosGlobales opcional
// (array con el número real por columna) que pisa el cálculo lineal
// cuando viene; sin pasarlo (todos los demás usos existentes) el
// resultado es IDÉNTICO a antes. El caso vamp con sobra arma ese array a
// mano: columnas del ciclo (0..ciclo-1) siguen igual, la(s) columna(s)
// sobrante(s) usan compasGlobalInicio + vueltasCompletas*ciclo + offset.
// Las listas de "próximas vueltas" bajo cada caja del ciclo no cambian
// (ya calculaban bien las repeticiones intermedias, esta caja sobrante
// se dibuja aparte con su propio número, sin duplicar). No afecta
// pdf-percusion.js (no numera compases globales en vamp) ni el preview
// del editor web (no hace este cálculo).
// AUDIOLINK · pdf-armonias.js · v1.99
// v1.99: (a pedido) subtítulo "Clave de sección X/Y" arriba de la
// miniatura de clave por sección — chico, itálico, gris (no compite con
// el nombre de la sección). El compás va como texto plano (ej. "3/4"),
// distinto de la fracción apilada gráfica que ya se dibujaba junto al
// patrón (esa se mantiene igual). extraClave sube de 15 a 19mm en
// calcularAltoSeccion para darle espacio a la línea nueva.
// AUDIOLINK · pdf-armonias.js · v1.98
// v1.98: (a pedido, con FIX post-revisión de PDF) resolución de NEGRA
// combinada con corchea en el patrón rítmico, ahora también en el PDF
// (antes solo estaba en el preview del editor web, guia-practica.html
// v1.96-v1.98). FIX: el trazo del silencio de negra salía muy chico
// comparado con el silencio de corchea — se agrandó ~1.8x el path bezier
// y se subió el grosor de línea de 0.45 a 0.6*sc.
// Cambios, los 3 en el motor duplicado (parsearPatronRitmico/
// aplanarColumnasPatron/pesoTotalPatron/dibujarPatronRitmico), mismo
// criterio que el editor: (1) "," = silencio de negra (pesa 2 corcheas),
// nuevo trazo dibujarSilencioNegra() en zigzag vía bezier (doc.lines),
// debajo de la línea base en gris tenue, igual zona que el silencio de
// corchea de siempre pero forma distinta. (2) "n"/"N" = golpe de negra
// normal/acentuado, pesa 2, entra a esNota() (cabeza+plica) pero NO a
// esBeamable() — nunca corchete ni bandera, plica limpia. "N" dispara el
// mismo acento que "X". Ninguno de los 3 símbolos se agrega dentro de
// grupos {} (tresillo/sextillo siguen siendo puros de corchea). Patrones
// existentes sin estos símbolos dan resultado IDÉNTICO a v1.97.
// AUDIOLINK · pdf-armonias.js · v1.97
// v1.97: (a pedido, tras revisar PDF de v1.96) 3 fixes sobre la
// miniatura de clave de sección (escala 0.4): 1) FIX real — el
// corchete/bandera de corchea (pasada 3 de dibujarPatronRitmico) NUNCA
// se escalaba por `sc`, a diferencia de la cabeza+plica (pasada 2) que
// sí lo hacía desde v1.94; a escala 0.4 esto dejaba el corchete
// calculado con un offset de radio ~2.3x más grande que la plica real
// → se veía "flotando" separado de la punta (~1mm). Ahora toda la
// pasada 3 (offsets de ancla, grosor de línea, forma de la bandera
// bezier, barra doble de sextillo, offset del número 3/6) escala junto
// con `sc`, mismo criterio que ya usan pasadas 1 y 2 — a escala 1
// resultado idéntico a antes. 2) El acento (>) escalaba en proporción
// lineal estricta a `sc` y a 0.4 quedaba casi invisible (grosor de
// línea 0.136mm); ahora usa un piso de escala propio
// (Math.max(sc,0.65)) solo para sus propias medidas, así no desaparece
// en miniatura aunque el resto del patrón sí se achique al 0.4 real.
// 3) El timing/compás apilado (numerador/denominador) se dibujaba a
// fontSize fijo 9 con offsets fijos (y-1.5 / y+3.5) pensados sin
// relación a la altura real de la miniatura (altoPlica a escala 0.4 =
// 2.4mm) — el bloque de texto terminaba ocupando ~8mm de alto, mucho
// más que la propia pauta rítmica que acompaña, y se veía
// descolgado/"fuera de contexto". Ahora se calcula en función de la
// altura real de plica de la miniatura (altoPlicaClave) con fontSize
// reducido (6pt, mismo criterio de legibilidad mínima que ya usan los
// números de grupo 3/6 a fontSize 5), numerador arriba / denominador
// abajo dentro del mismo rango vertical que ocupa la pauta.
// AUDIOLINK · pdf-armonias.js · v1.96
// v1.96: (a pedido, tras revisar captura) 3 ajustes finos sobre la
// miniatura de clave de sección: 1) el renglón baja 2mm más (y += 8 en
// vez de 6) porque las plicas quedaban pegadas/cortadas contra la barra
// de título de arriba — extraClave sube de 13 a 15 para darle espacio
// reservado; 2) el acento (>) se separa 1mm extra fijo (sin *sc) de la
// punta de la plica — a este tamaño ya quedaba muy chico como para
// además achicarle el aire; 3) el timing/compás al comienzo del
// renglón pasa de texto en línea ("3/4") a notación musical real
// (numerador arriba / denominador abajo, apilados y centrados).
// AUDIOLINK · pdf-armonias.js · v1.95
// v1.95: (a pedido) 2 ajustes sobre la miniatura de clave de sección
// (v1.94): 1) FIX — el ícono de acento (>) usaba offsets fijos sin
// escalar por `sc`, así que en miniatura (escala 0.4) sobresalía del
// espacio reservado y se veía "cortado" arriba; ahora escala junto con
// el resto del patrón (a escala 1 el resultado es idéntico a antes). 2)
// se agrega el timing/compás (ej. "3/4") al comienzo del renglón —
// s.compasOverride si la sección lo tiene, si no compasTexto (el
// compás general del tema) — como texto normal (sin escalar, es
// etiqueta no notación), y el patrón arranca después de ese texto.
// AUDIOLINK · pdf-armonias.js · v1.94
// v1.94: (a pedido) FIX — la clave de sección se dibujaba a tamaño
// completo (igual que el patrón principal de Break/Corte), aunque en el
// editor (guia-practica.html) ya se ve chica como miniatura. Ahora usa
// el 6to parámetro `escala` de dibujarPatronRitmico (ya soportado desde
// antes) en 0.4, y el ancho se reduce al 30% de anchoUtil (alineado a
// la izquierda, en `margen`) — miniatura real chica en alto Y ancho, no
// solo en alto. No toca el patrón principal (llamada de Break/Corte
// sigue sin pasar escala, tamaño completo).
// AUDIOLINK · pdf-armonias.js · v1.93
// v1.93: (a pedido) clave por sección (s.claveSeccion, cargada en
// guia-practica.html) — se dibuja con dibujarPatronRitmico (mismo motor
// que ya usa Break/Corte para patronRitmico), en su propia línea debajo
// de la barra de título de CUALQUIER sección (no solo Break/Corte),
// ancho completo, "2" fijo de compases (el ciclo de clave siempre son 2
// compases, no la duración de la sección). calcularAltoSeccion reserva
// 13mm extra si la sección tiene claveSeccion — valor probado
// visualmente (PDF de prueba + rasterizado con pdftoppm) antes de
// fijarlo: los 10mm que ya usa el cálculo de Break/Corte (con otra
// convención de padding) dejaban el silencio casi tocando el límite.
// Segunda entrega de 3 del plan consolidado de clave por sección (sigue
// musico.html para que suene en vivo).
// AUDIOLINK · pdf-armonias.js · v1.3
// v1.3: (a pedido, FIX real) Vamp con `duracion` no múltiplo exacto de
// `ciclo` (ej. ciclo=2, duracion=3) dejaba el compás sobrante (#3) sin
// dibujar en ningún lado — dibujarCajas siempre pintaba exactamente
// `ciclo` cajas. Ahora se arma la grilla como `ciclo+sobra` cajas
// (repitiendo al final los primeros `sobra` acordes del ciclo, mismo
// contenido real), y el texto "se repite..." suma "+ N comp." cuando
// corresponde. Cero cambios en fija-bloque, 2da vez, Break/Corte.
// v1.2: (a pedido, FIX sobre v1.1) con 2da vez cargada, la lista de
// "próximas vueltas" mostraba la ÚLTIMA vuelta también en las columnas
// que la 2da vez reemplaza — duplicado y engañoso, porque esa vuelta en
// realidad se toca con la 2da vez (caja aparte), no con el contenido
// original de esa columna. Ahora esas columnas (colReemplazoVueltas en
// adelante) listan solo las vueltas intermedias, sin la última. Columnas
// que la 2da vez NO reemplaza no cambian. Cero cambios en el resto.
// v1.1: (a pedido) FIX/mejora — la lista de "próximas vueltas" (#N chico
// bajo cada caja) para una sección fija-bloque simple con repeticiones>1
// (ej. Coda/Final repetido x2) ahora: (a) se dibuja SIEMPRE que haya más
// de 1 vuelta, ya no requiere hay2da (antes, sin 2da vez cargada, no se
// dibujaba nada — solo quedaba el texto "x2 (N comp. reales)" sin
// detalle de qué compás real es cada vuelta); (b) recorre TODAS las
// columnas de basePase, no solo la primera — mismo criterio que ya usa
// el Vamp para su ciclo. Cero cambios en el resto del archivo (barra de
// repetición, 2da vez, Break/Corte, etc.).
// v1.0: split desde pdf-estructura.js v1.92 (ver ahí el historial
// completo de generarEstructuraPDF hasta esa versión). A partir de acá
// este archivo lleva su propio changelog independiente.
// Contiene: generarEstructuraPDF (PDF de acordes/armonías), usado por
// guia-practica.html y musico.html.

function generarEstructuraPDF(datos){
  const { temaNombre, bpm, compasTexto, claveTxt, secciones: seccionesEntrada } = datos;
  if(!window.jspdf){ alert('No se pudo cargar el generador de PDF. Revisá tu conexión e intentá de nuevo.'); return; }
  if(!seccionesEntrada || !seccionesEntrada.length){ alert('No hay secciones cargadas todavía.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margen = 12;
  const anchoUtil = pageW - margen * 2;

  // v1.10: (a pedido) header ampliado igual en espíritu al de
  // logistica.html (franja de color + diffuser + logo + subtítulo), pero
  // a headerH=28 (no 38) — hoja de atril, prioriza espacio para las
  // tarjetas de acordes sobre el protagonismo visual del header. Misma
  // lógica de pintado (HEADER_SIN_FONDO, HEADER_COLOR_RGB,
  // HEADER_DIFFUSER_OPACITY, HEADER_COLOR_OPACITY, LOGO_SIZE/ALIGN/
  // OFFSET_Y/SIN_LOGO) leída de header-config.js, con typeof-guards por
  // si esa hoja no llegó a cargar. Reemplaza el header discreto de v1.9
  // (13mm, solo logo + línea dorada).
  // v1.11: FIX contraste — el subtítulo usaba mutedRGB [154,151,143]
  // (gris beige), mismo color que logistica.html deja "fuera de alcance"
  // en su propio jsPDF (v2.128: ahí solo se corrigió el header piloto en
  // CSS, no el PDF real, por quedar afuera del pedido de ese momento).
  // Acá sí se corrige: blanco/crema con opacidad 0.85
  // (rgba(250,247,238,0.85), el mismo valor que usaron en el CSS
  // corregido de logistica.html), legible sobre el fondo oscuro/
  // texturizado sin competir con el dorado.
  const goldRGB = [201, 162, 75];
  // v1.13: headerH sube de 28 a 38mm — igual que logistica.html — a
  // pedido del usuario, para que el recorte "cover" del diffuser use la
  // misma proporción (pageW/headerH) que logistica y no se vea tan
  // recortado/achatado como con 28mm. Contrapartida ya asumida: menos
  // espacio para las cajas de acordes debajo (que era la razón original
  // de v1.10 para dejarlo en 28mm). El punto de arranque de `y` se ajusta
  // proporcionalmente más abajo (ver `let y = headerH + 9`). No se tocó
  // ningún cálculo de compases ni el resto del dibujo.
  const headerH = 38;
  const imgDiffuserHdr = document.getElementById('hdrDiffuser');
  const imgLogoHdr = document.getElementById('hdrLogo');
  const diffuserOkHdr = imgDiffuserHdr && imgDiffuserHdr.complete && imgDiffuserHdr.naturalWidth > 0;
  const logoOkHdr = imgLogoHdr && imgLogoHdr.complete && imgLogoHdr.naturalWidth > 0;
  const headerSinFondo = typeof HEADER_SIN_FONDO !== 'undefined' ? HEADER_SIN_FONDO : false;
  const headerColorRGB = typeof HEADER_COLOR_RGB !== 'undefined' ? HEADER_COLOR_RGB : [11, 11, 13];
  const headerDiffuserOpacity = typeof HEADER_DIFFUSER_OPACITY !== 'undefined' ? HEADER_DIFFUSER_OPACITY : 1.0;
  const headerColorOpacity = typeof HEADER_COLOR_OPACITY !== 'undefined' ? HEADER_COLOR_OPACITY : 0.62;

  // v1.11: FIX estiramiento — el diffuser se forzaba a pageW×headerH sin
  // respetar su proporción real; con headerH=28 (más bajo que los 38mm de
  // logistica.html) la distorsión horizontal se notaba mucho. Recorte
  // tipo "cover" (mismo criterio que background-size:cover en CSS): se
  // recorta el sobrante de la imagen (centrado) para llenar el header sin
  // deformarla, en vez de estirarla. Se calcula una sola vez por PDF.
  // v1.21: recorte "cover" del diffuser, ahora 100% vectorial (rect+clip
  // nativo de jsPDF) — reemplaza a recortarImagenCover() (basado en
  // canvas.toDataURL(), eliminada). El canvas fallaba siempre bajo
  // file:// (SecurityError, "tainted canvas"); el plan B de v1.15/v1.20
  // (imagen sin recortar, forzada a pageW×headerH) ESTIRABA la imagen
  // (perillas ovaladas en vez de circulares, visto en captura real del
  // usuario). Esta versión calcula el tamaño real "cover" (misma
  // matemática de antes: iguala el lado que sobra y centra) pero en vez
  // de recortar píxeles con canvas, dibuja la imagen completa a ese
  // tamaño (más grande que el hueco del header) y usa doc.clip() para
  // ocultar visualmente el sobrante — nunca lee píxeles por su cuenta,
  // así que funciona igual en file:// y en servidor, sin try/catch.
  function dibujarDiffuserCover(img, targetWmm, targetHmm, opacity, formato){
    const targetRatio = targetWmm / targetHmm;
    const srcRatio = img.naturalWidth / img.naturalHeight;
    let drawW, drawH;
    if(srcRatio > targetRatio){
      drawH = targetHmm;
      drawW = targetHmm * srcRatio;
    } else {
      drawW = targetWmm;
      drawH = targetWmm / srcRatio;
    }
    const drawX = (targetWmm - drawW) / 2;
    const drawY = (targetHmm - drawH) / 2;
    doc.saveGraphicsState();
    doc.rect(0, 0, targetWmm, targetHmm, null);
    doc.clip();
    doc.discardPath();
    doc.setGState(new doc.GState({ opacity }));
    doc.addImage(img, formato, drawX, drawY, drawW, drawH);
    doc.restoreGraphicsState();
  }
  // v1.19: (a pedido, FIX real de fondo) conversión simple imagen→dataURL
  // vía canvas, SIN recorte (a diferencia de recortarImagenCover) — para
  // el logo, que no necesita "cover", solo evitar que jsPDF reciba el
  // <img> crudo. Mismo mecanismo que ya usa el diffuser desde v1.11/v1.15
  // (canvas.drawImage + toDataURL), reutilizado tal cual.
  function imagenComoDataURL(img, calidad){
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    return canvas.toDataURL('image/jpeg', calidad != null ? calidad : 0.95);
  }
  // v1.20: solo se usa en el camino de "último recurso" (raw <img> sin
  // convertir vía canvas) — ahí SÍ importa que el formato declarado a
  // jsPDF coincida con el archivo real, para que no salga a re-verificar
  // los bytes por su cuenta (ver changelog v1.20 arriba). Default 'JPEG'
  // cubre .jpg/.jpeg/.jfif y también rutas sin extensión reconocible
  // (ej. URLs de Cloudinary), igual que el comportamiento anterior.
  function detectarFormatoImagen(src){
    const limpio = (src || '').split('?')[0].split('#')[0].toLowerCase();
    if(limpio.endsWith('.png')) return 'PNG';
    if(limpio.endsWith('.webp')) return 'WEBP';
    return 'JPEG';
  }

  function pintarHeader(){
    if(!headerSinFondo){
      if(diffuserOkHdr){
        dibujarDiffuserCover(imgDiffuserHdr, pageW, headerH, headerDiffuserOpacity, detectarFormatoImagen(imgDiffuserHdr.src));
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: headerColorOpacity }));
        doc.setFillColor(...headerColorRGB);
        doc.rect(0, 0, pageW, headerH, 'F');
        doc.restoreGraphicsState();
      } else {
        doc.setFillColor(...headerColorRGB);
        doc.rect(0, 0, pageW, headerH, 'F');
      }
    }
    doc.setDrawColor(...goldRGB);
    doc.setLineWidth(0.5);
    doc.line(0, headerH, pageW, headerH);
    if(logoOkHdr && !(typeof LOGO_SIN_LOGO !== 'undefined' && LOGO_SIN_LOGO)){
      const logoH = Math.min(typeof LOGO_SIZE !== 'undefined' ? LOGO_SIZE : 16, headerH - 4);
      const logoW = logoH * (imgLogoHdr.naturalWidth / imgLogoHdr.naturalHeight);
      const offsetY = typeof LOGO_OFFSET_Y !== 'undefined' ? LOGO_OFFSET_Y : 0;
      const logoY = (headerH - logoH) / 2 + offsetY;
      const align = typeof LOGO_ALIGN !== 'undefined' ? LOGO_ALIGN : 'izquierda';
      let logoX;
      if(align === 'centro') logoX = (pageW - logoW) / 2;
      else if(align === 'derecha') logoX = pageW - margen - logoW;
      else logoX = margen;
      // v1.19: FIX de FONDO (el try/catch de v1.16 no alcanzaba) — el
      // error real, visto en consola bajo file://, es un XMLHttpRequest
      // interno de jsPDF que sale a buscar los bytes ORIGINALES del logo
      // cuando se le pasa el <img> crudo a addImage(). Ese XHR queda
      // bloqueado por CORS y el TypeError que sigue explota DENTRO de un
      // callback asíncrono de jsPDF (addimage.js) — fuera de cualquier
      // try/catch síncrono puesto alrededor del addImage() en sí, por eso
      // v1.16 no lo atrapaba pese a envolver la llamada. La solución real
      // (mismo mecanismo ya probado acá con el diffuser desde v1.15):
      // convertir el logo a dataURL vía canvas ANTES de pasarlo a jsPDF —
      // así jsPDF ya tiene los bytes inline y nunca sale a buscarlos por
      // su cuenta, evitando el XHR problemático de raíz.
      let logoParaPintar = imgLogoHdr;
      let logoFormato = 'JPEG';
      try {
        logoParaPintar = imagenComoDataURL(imgLogoHdr);
        // imagenComoDataURL() fuerza JPEG real vía canvas.toDataURL(), así
        // que 'JPEG' siempre es correcto en este camino (éxito).
      } catch(e){
        logoParaPintar = imgLogoHdr; // último recurso: sin conversión, ver v1.16
        logoFormato = detectarFormatoImagen(imgLogoHdr.src); // v1.20: formato real, no asumido
      }
      try {
        doc.addImage(logoParaPintar, logoFormato, logoX, logoY, logoW, logoH);
      } catch(e){ /* logo omitido puntualmente, ver nota v1.19 arriba */ }
    }
    // v1.10: subtítulo derecha, mismo patrón que logistica.html.
    // v1.11: color corregido a crema (ver nota de contraste arriba) —
    // pensado para un header con velo oscuro encima, como logistica.html.
    // v1.12: FIX contraste real — a diferencia de logistica.html, esta
    // hoja usa el header sin velo oscuro (fondo queda con la textura
    // metálica clara del diffuser tal cual, a propósito, confirmado con
    // el usuario), así que el crema de v1.11 quedaba casi invisible sobre
    // ese fondo claro. Se cambia a gris oscuro (mismo tono que el logo)
    // en vez de agregar un fondito oscuro detrás, para no romper el look
    // limpio del header. No toca tamaño, posición, texto, logo, diffuser
    // ni ningún otro cálculo.
    // v1.14: (a pedido) el gris de v1.12 seguía perdiéndose contra las
    // líneas de la textura del diffuser en esa zona — se oscurece más
    // (casi negro), pasa a negrita y a opacidad plena (antes 0.85), sigue
    // sin fondito atrás (decisión tomada con el usuario: prioriza el look
    // limpio del header). No toca tamaño, posición, texto, logo, diffuser
    // ni ningún otro cálculo.
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 1 }));
    doc.setTextColor(25, 22, 18);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('GUÍA DE PRÁCTICA', pageW - margen, headerH - 12, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric' }), pageW - margen, headerH - 5, { align: 'right' });
    doc.restoreGraphicsState();
  }

  pintarHeader();
  let y = headerH + 9;

  const nombreTema = temaNombre || 'Tema sin nombre';

  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text(nombreTema, margen, y); y += 7;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.text(`BPM ${bpm || '—'} · Compás ${compasTexto || '4/4'}${claveTxt ? ' · Clave: ' + claveTxt : ''}`, margen, y);
  y += 8;

  const asegurarEspacio = (alto) => {
    if(y + alto > pageH - margen){ doc.addPage(); y = margen; }
  };

  const POR_FILA = 4;
  const cajaAncho = anchoUtil / POR_FILA;
  const cajaAlto = 16;
  // v1.55: hayContenido() sigue siendo el criterio compartido para
  // decidir si un bloque reserva su tira de notas (ver dibujarCajas y
  // calcularAltoSeccion) — un solo lugar de verdad.
  const hayContenido = (arr) => Array.isArray(arr) && arr.some(x => (x || '').trim());

  // v1.55: (a pedido, FIX de diseño) la nota corta por compás salía de
  // adentro de cada casilla (v1.32/v1.33) — rompía la altura pareja de
  // toda la fila con solo una nota cargada. Ahora es una tira PROPIA que
  // se repite arriba de CADA fila de POR_FILA(4) cajas — mantiene la
  // grilla de acordes/letra exactamente como estaba antes de v1.32 (alto
  // fijo, cajaAlto) y agrega notaFilaAlto(5mm) por fila SOLO si el
  // array de notas tiene algún contenido (si no, cero alto extra, mismo
  // criterio que antes). hayContenido() es GLOBAL al array completo, no
  // por fila — si el bloque tiene una sola nota en cualquier compás,
  // TODAS las filas reservan su tira (vacía en las filas sin nota), para
  // que la grilla quede prolija y alineada siempre en el mismo lugar.
  const notaFilaAlto = 5;
  // v1.41: (a pedido) 5to parámetro opcional `colInicio` — permite que la
  // 1ra caja arranque en una columna distinta de 0 (usado por la 2da vez
  // de repeticiones, para alinearla debajo del compás real que reemplaza
  // en vez de siempre reiniciar en columna 1). Con colInicio=0 (default,
  // todos los llamados existentes) el comportamiento es IDÉNTICO a antes
  // — no cambia nada para el resto de los usos de dibujarCajas.
  // v1.43: (a pedido) 6to parámetro opcional `labelInicio` — separa
  // "en qué columna se dibuja" de "qué número de compás dice la
  // etiqueta". Hace falta para el modo horizontal: la caja de la 2da
  // vez se dibuja en la columna siguiente a la 1ra vez (colInicio), pero
  // tiene que decir el compás REAL que reemplaza (labelInicio), que
  // puede ser una columna distinta. Si no se pasa, usa colInicio (mismo
  // comportamiento que v1.41/v1.42 para todos los llamados existentes).
  // v1.43: (a pedido) 7mo parámetro opcional `opciones` — para el modo
  // horizontal, la 2da vez tiene que dibujarse en la MISMA fila que ya
  // dibujó la 1ra vez (mismo Y), sin que esta función avance el cursor
  // `y` de nuevo (esa altura ya la reservó/avanzó la 1ra vez). Con
  // opciones={} (default, todos los llamados existentes) el
  // comportamiento es IDÉNTICO a antes: usa el `y` actual y avanza al
  // terminar.
  //   opciones.yBase          → Y fija a usar en vez del `y` actual
  //   opciones.hayNotasForzado → fuerza sí/no reservar tira de nota,
  //                              para que la fila comparta la misma
  //                              altura que la 1ra vez aunque esta 2da
  //                              vez no tenga notas propias
  //   opciones.sinAvanzarY     → no toca asegurarEspacio() ni el `y`
  //                              final (la 1ra vez ya lo hizo)
  //   opciones.compasGlobalInicio → (v1.45) si viene un número, dibuja
  //                              además "#N" (compás real del TEMA
  //                              completo, no de la sección) arriba a la
  //                              derecha de cada caja, espejando al
  //                              "c.N" de arriba-izquierda. N = este
  //                              valor + posLabel (mismo índice que ya
  //                              usa "c.N", así que en 2da vez/D.C. el
  //                              "#N" coincide con el compás real que se
  //                              está reemplazando/repitiendo, no con la
  //                              columna donde se dibuja). Si es
  //                              null/undefined (default), no se dibuja
  //                              nada nuevo — cero cambios visuales para
  //                              los llamados que no lo pasen (Vamp, por
  //                              ejemplo, sigue sin usarlo: ver el
  //                              comentario en el llamado de la sección
  //                              principal sobre por qué).
  // v1.71: mismo orden que htmlOpcionesTiempoAcorde (guia-practica.html)
  // para el select de tiempo/anticipación de cada acorde.
  const TIEMPOS_ORDEN = ['1', 'a1', '2', 'a2', '3', 'a3', '4', 'a4'];
  const dibujarCajas = (acordes, letra, total, notas, colInicio, labelInicio, opciones) => {
    opciones = opciones || {};
    colInicio = colInicio || 0;
    labelInicio = labelInicio != null ? labelInicio : colInicio;
    const yBase = opciones.yBase != null ? opciones.yBase : y;
    const hayNotas = opciones.hayNotasForzado != null ? opciones.hayNotasForzado : hayContenido(notas);
    const filas = Math.ceil((total + colInicio) / POR_FILA);
    const altoTotal = filas * (cajaAlto + (hayNotas ? notaFilaAlto : 0));
    if(!opciones.sinAvanzarY) asegurarEspacio(altoTotal + 2);
    for(let j = 0; j < total; j++){
      const posGlobal = j + colInicio;
      const posLabel = j + labelInicio;
      const fila = Math.floor(posGlobal / POR_FILA);
      const col = posGlobal % POR_FILA;
      // v1.103: (a pedido, FIX real, ver captura) opciones.gapDesdeColumna
      // + opciones.gapMm — separa horizontalmente las columnas a partir de
      // `gapDesdeColumna` (inclusive) el ancho indicado, dejando aire real
      // entre esas cajas y las anteriores. Hace falta en Vamp con sobra:
      // la caja sobrante queda pegada al ciclo, sin espacio para el cierre
      // "‖" del marco de repetición (que se dibuja hacia afuera, asumiendo
      // ese aire). Sin pasar estas opciones (default), x no cambia.
      const gapX = (opciones.gapDesdeColumna != null && col >= opciones.gapDesdeColumna) ? (opciones.gapMm || 0) : 0;
      const x = margen + col * cajaAncho + gapX;
      const yFila = yBase + fila * (cajaAlto + (hayNotas ? notaFilaAlto : 0));
      const yCaja = yFila + (hayNotas ? notaFilaAlto : 0);
      if(hayNotas){
        const no = (notas && notas[j]) || '';
        if(no){
          doc.setFont('helvetica', 'italic'); doc.setFontSize(6.5); doc.setTextColor(180, 120, 40);
          const noCorta = no.length > 22 ? no.slice(0, 21) + '…' : no;
          doc.text(noCorta, x + cajaAncho / 2, yFila + notaFilaAlto - 1.3, { align: 'center' });
          doc.setTextColor(20);
        }
      }
      doc.setDrawColor(180); doc.rect(x, yCaja, cajaAncho, cajaAlto);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(140);
      // v1.42: (a pedido) usa posLabel en vez de j — con colInicio>0
      // (2da vez alineada o al lado), la etiqueta ahora muestra el
      // número de compás REAL que reemplaza (ej. "c.2"), sea cual sea
      // la columna donde se dibuja la caja (posGlobal). Con
      // labelInicio===colInicio (default) posLabel===posGlobal, sin
      // cambios para el resto de los usos.
      doc.text('c.' + (posLabel + 1), x + 1.5, yCaja + 4);
      doc.setTextColor(20);
      // v1.45: (a pedido) contador global de compás — "#N" arriba a la
      // derecha, mismo criterio de posLabel que "c.N" (así en 2da
      // vez/D.C. muestra el compás real que se reemplaza/repite, no la
      // columna de dibujo). Más chico y discreto que "c.N" (6pt vs 7pt)
      // a propósito: es la referencia secundaria, el acorde sigue siendo
      // lo dominante al centro.
      if(opciones.compasGlobalInicio != null){
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(170);
        // v1.100: (a pedido, FIX real) "opciones.numerosGlobales[j]", si
        // viene, pisa el cálculo lineal de siempre (compasGlobalInicio +
        // posLabel). Hace falta para vamp con sobra (ver más abajo): ahí
        // la caja "sobrante" NO es la posición j del ciclo, es un compás
        // real que ocurre DESPUÉS de todas las vueltas completas, y el
        // cálculo lineal le daba el número de compás equivocado. Sin
        // pasar este array (default), el resultado es IDÉNTICO a antes.
        const numeroGlobal = (opciones.numerosGlobales && opciones.numerosGlobales[j] != null)
          ? opciones.numerosGlobales[j]
          : (opciones.compasGlobalInicio + posLabel);
        doc.text('#' + numeroGlobal, x + cajaAncho - 1.5, yCaja + 4, { align: 'right' });
        doc.setTextColor(20);
      }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
      const acorde = (acordes && acordes[j]) || '';
      doc.text(acorde, x + cajaAncho / 2, yCaja + 8, { align: 'center' });
      // v1.71/v1.72: (a pedido) mini-regla de tiempo/anticipación del
      // acorde — 8 marcas (1,a1,2,a2,3,a3,4,a4: resolución de corchea
      // completa, 'aN' = corchea débil que sigue al tiempo N; el caso
      // "entra antes del 1 del compás" en sentido estricto es siempre a4
      // del compás anterior) pegadas al borde inferior de la celda, con
      // un punto relleno en la posición cargada. Lee opciones.acordesTiempo
      // (mismo patrón que `notas`, array paralelo) — si no viene el
      // array, o el valor de esta celda está vacío ('' = "no marcar
      // nada", el caso común: acorde justo en el tiempo, sin síncopa),
      // no se dibuja nada, cero cambio visual.
      // v1.72: FIX — la letra (yCaja+13) y el punto de la regla (antes en
      // yCaja+12.2) se pisaban visualmente (ver captura de referencia).
      // Ahora, SOLO en las celdas donde efectivamente hay un valor de
      // tiempo cargado (hayRegla), la letra sube 1mm (yCaja+12 en vez de
      // +13) y se achica 1pt (6pt en vez de 7pt); sin valor de tiempo, la
      // letra queda exactamente igual que siempre. La regla en sí también
      // baja 1mm (yCaja+cajaAlto-1 en vez de -2) para dejarle más aire.
      const tValCelda = (opciones.acordesTiempo && opciones.acordesTiempo[j]) || '';
      const hayRegla = TIEMPOS_ORDEN.indexOf(tValCelda) !== -1;
      const le = (letra && letra[j]) || '';
      if(le){
        doc.setFont('helvetica', 'italic'); doc.setFontSize(hayRegla ? 6 : 7);
        const leCorta = le.length > 22 ? le.slice(0, 21) + '…' : le;
        doc.text(leCorta, x + cajaAncho / 2, yCaja + (hayRegla ? 12 : 13), { align: 'center' });
        doc.setTextColor(20);
      }
      if(hayRegla){
        const idxTiempo = TIEMPOS_ORDEN.indexOf(tValCelda);
        const reglaAncho = cajaAncho * 0.7;
        const reglaX0 = x + (cajaAncho - reglaAncho) / 2;
        const pasoTiempo = reglaAncho / (TIEMPOS_ORDEN.length - 1);
        const reglaY = yCaja + cajaAlto - 1;
        doc.setDrawColor(160);
        TIEMPOS_ORDEN.forEach((t, ti) => {
          const tx = reglaX0 + ti * pasoTiempo;
          const esFuerte = ti % 2 === 0; // tiempos 1-2-3-4 vs. corcheas débiles
          doc.setLineWidth(esFuerte ? 0.35 : 0.2);
          doc.line(tx, reglaY, tx, reglaY - (esFuerte ? 1.4 : 0.8));
        });
        doc.setLineWidth(0.2);
        doc.setFillColor(20, 20, 20);
        doc.circle(reglaX0 + idxTiempo * pasoTiempo, reglaY - 1.8, 0.6, 'F');
        doc.setDrawColor(180);
      }
    }
    if(!opciones.sinAvanzarY) y += altoTotal + 4;
  };

  // v1.29: barra de repetición real (║: ... :║) en vez del texto italic
  // "se repite xN" — se dibuja como dos trazos gruesos pegados al borde
  // izq/der del bloque de cajas que ya armó dibujarCajas(). No cambia el
  // cálculo de compases, solo el dibujo encima de lo que ya se pintó.
  // yBloqueInicio/alto vienen de afuera porque el bloque ya se dibujó
  // (dibujarCajas ya movió `y`).
  const dibujarBarraRepeticion = (yBloqueInicio, alto, anchoBloque) => {
    // v1.29.3: FIX — usaba `anchoUtil` (ancho de fila completa, 4
    // columnas) para la barra derecha, así que en secciones con menos de
    // 4 compases (ej. "Coda/Final" con 2) la barra quedaba lejos, flotando
    // fuera de las cajas reales. Ahora recibe `anchoBloque` (el ancho real
    // ocupado por las cajas de esa fila) y lo usa en vez de `anchoUtil`.
    const ancho = anchoBloque != null ? anchoBloque : anchoUtil;
    const grosor = 1.2;
    doc.setFillColor(20, 20, 20);
    // v1.66: (a pedido, confirmado pixel a pixel contra la imagen de
    // referencia) FIX — v1.65 invirtió el orden sin necesidad; v1.64 lo
    // tenía bien. Orden correcto, de afuera hacia adentro: GRUESO-FINO-
    // PUNTOS al abrir (izquierda), y su espejo PUNTOS-FINO-GRUESO al
    // cerrar (derecha). Se mantiene el aire de 0.8mm entre elementos.
    doc.rect(margen - 4.4, yBloqueInicio, grosor, alto, 'F');
    doc.rect(margen - 2.4, yBloqueInicio, 0.4, alto, 'F');
    doc.rect(margen + ancho + 3.2, yBloqueInicio, grosor, alto, 'F');
    doc.rect(margen + ancho + 2.0, yBloqueInicio, 0.4, alto, 'F');
    const yc = yBloqueInicio + alto / 2;
    doc.circle(margen - 0.85, yc - 1.2, 0.35, 'F');
    doc.circle(margen - 0.85, yc + 1.2, 0.35, 'F');
    doc.circle(margen + ancho + 0.85, yc - 1.2, 0.35, 'F');
    doc.circle(margen + ancho + 0.85, yc + 1.2, 0.35, 'F');
  };
  // v1.29: corchete "1." / "2." de casilla, en vez del texto "2ª vez:"
  // suelto — se dibuja pegado a la esquina sup. izq. del bloque.
  // v1.41: (a pedido) 2 parámetros opcionales `xInicio`/`ancho` — antes
  // siempre arrancaba en `margen` y cubría `anchoUtil` (todo el ancho de
  // fila). Ahora puede dibujarse angosto, alineado a las columnas
  // específicas que reemplaza la 2da vez (o "1ra vez" arriba). Con los
  // valores default (margen/anchoUtil) el resultado es IDÉNTICO a antes.
  const dibujarCorcheteCasilla = (yBloqueInicio, numero, xInicio, ancho) => {
    xInicio = xInicio != null ? xInicio : margen;
    ancho = ancho != null ? ancho : anchoUtil;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(20);
    // v1.39: (a pedido) invertido el orden — antes el NÚMERO quedaba
    // pegado a la caja (-0.5) y la LÍNEA lejos (-3), al revés de lo
    // esperado (la línea, que es lo visualmente dominante, es lo que
    // hace ver a qué grilla "pertenece" el bloque). Ahora la línea queda
    // pegada a la caja de abajo y el número flota arriba de la línea,
    // con el mismo colchón de 2.5mm entre ambos que venía funcionando
    // sin tocarse.
    // v1.40: (a pedido) menos aire entre número y línea — de 2.5mm a
    // 1.8mm (-4 → -3.3), para que se lea como una sola unidad en vez de
    // verse el número "suelto" flotando por encima. Sigue sin tocarse
    // (el número bold 8pt mide ~2mm de alto real) y sigue sobrando
    // margen contra el texto "x2 (...)" de arriba (~4mm).
    doc.text(numero + '.', xInicio + 1.5, yBloqueInicio - 3.3);
    doc.setDrawColor(20); doc.setLineWidth(0.3);
    doc.line(xInicio, yBloqueInicio, xInicio, yBloqueInicio - 1.5);
    doc.line(xInicio, yBloqueInicio - 1.5, xInicio + ancho, yBloqueInicio - 1.5);
  };
  // v1.60: (a pedido) helper compartido para el resumen "c.#X-c.#Y" que
  // ya existía SOLO en fija-bloque con 1ra/2da vez (v1.58, texto inline
  // ahí, no como función). Se extrae acá para poder reusarlo tal cual en
  // Vamp, Break/Corte y fija-bloque simple (sin 1ra/2da vez) sin duplicar
  // el mismo texto/estilo 3 veces. Si fin es null o igual a inicio,
  // muestra un solo compás ("c.#5") en vez de rango. No dibuja nada si
  // inicio es null (contador global apagado).
  const dibujarResumenCompases = (inicio, fin, xDerecha, yLinea) => {
    if(inicio == null) return;
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(120);
    doc.text('c.#' + inicio + ((fin != null && fin !== inicio) ? '-c.#' + fin : ''), xDerecha, yLinea, { align: 'right' });
    doc.setTextColor(20);
  };
  // v1.29.2: íconos dibujados a mano en vez de emoji — jsPDF con fuente
  // helvetica estándar no soporta unicode alto (🔁/⊕ salían como
  // caracteres rotos, ej. "Ø=Ý"). Cada ícono devuelve el ancho que ocupó,
  // para poder ubicar el texto que sigue justo al lado.
  const dibujarIconoRepeticion = (x, yBase) => {
    // mini versión de la misma barra ║: — dos trazos + puntito, ~4mm
    // v1.66: (a pedido, confirmado contra imagen de referencia) FIX — el
    // orden original (v1.29.2) YA estaba bien: grueso-fino-puntos de
    // afuera hacia adentro. v1.65 lo había invertido sin necesidad; se
    // revierte a como estaba.
    doc.setFillColor(120, 120, 120);
    doc.rect(x, yBase - 3, 0.8, 3.2, 'F');
    doc.rect(x + 1.4, yBase - 3, 0.3, 3.2, 'F');
    doc.circle(x + 2.6, yBase - 2.2, 0.35, 'F');
    doc.circle(x + 2.6, yBase - 0.8, 0.35, 'F');
    return 4.2;
  };
  const dibujarIconoCoda = (x, yBase, colorRGB) => {
    // círculo con cruz, símbolo estándar de coda, ~3.5mm. colorRGB para
    // poder pintarlo blanco cuando va sobre la barra de color del header
    // (donde el texto también es blanco) o gris cuando va sobre fondo
    // blanco de página.
    const [r,g,b] = colorRGB || [120,120,120];
    doc.setDrawColor(r, g, b); doc.setLineWidth(0.3);
    doc.circle(x + 1.6, yBase - 1.6, 1.6, 'S');
    doc.line(x + 1.6, yBase - 3.4, x + 1.6, yBase + 0.2);
    doc.line(x - 0.2, yBase - 1.6, x + 3.4, yBase - 1.6);
    return 4.4;
  };

  // v1.29.11: ícono de acento (>) dibujado a mano, mismo criterio que
  // dibujarIconoRepeticion/dibujarIconoCoda (nada de emoji, jsPDF+helvetica
  // no soporta unicode alto). Se define ANTES de dibujarPatronRitmico
  // porque ese la reutiliza para marcar golpes acentuados.
  const dibujarIconoAcentoBreak = (x, yBase) => {
    doc.setDrawColor(20, 20, 20); doc.setLineWidth(0.5);
    doc.line(x, yBase - 2.2, x + 1.7, yBase - 1.1);
    doc.line(x + 1.7, yBase - 1.1, x, yBase - 0.0);
    return 2.6;
  };

  // v1.3: (a pedido) vocabulario completo del patrón rítmico — sigue
  // siendo notación acotada (solo corcheas, sin figuras variadas ni
  // alturas), pero ahora con 4 símbolos en vez de 2:
  //   x = golpe normal
  //   X = golpe ACENTUADO (dibuja el mismo ">" de dibujarIconoAcentoBreak
  //       arriba de la plica, reutilizado tal cual — no es un ícono nuevo)
  //   . = SILENCIO (ahora con marca propia — antes, en v1.0-v1.2, un "."
  //       era solo un hueco vacío sin dibujo; ahora se ve un trazo
  //       simplificado, no es el símbolo estándar de silencio de corchea
  //       de una edición impresa, es una marca a mano coherente con el
  //       resto de íconos del PDF)
  //   - = LIGADO — sostiene el golpe/silencio de la posición anterior, no
  //       ataca de nuevo: se dibuja un arco chico entre esa posición y
  //       esta. Varios "-" seguidos encadenan sus arcos y se leen como
  //       una sola ligadura larga.
  // El agrupado de a 2 (corchete) sigue exactamente igual que v1.2: dos
  // GOLPES (x o X) consecutivos en el mismo par se unen con corchete; un
  // golpe solo (por tener un "." o "-" al lado) lleva gancho individual.
  // Silencios y ligados no tienen cabeza ni plica propia — no "ocupan"
  // lugar en el agrupado de golpes, se dibujan aparte en una pasada previa.
  // v1.7: (a pedido) líneas de compás — barra de apertura, cierre y una
  // divisoria entre cada compás si la sección dura 2+ compases (mismo
  // criterio visual que separa los acordes en dibujarCajaBreak). Nuevo
  // parámetro `compases` (duración de la sección en compases, default 1
  // si no se pasa, para no romper otros llamados existentes). No cambia
  // el agrupado de a 2 ni el dibujo de golpes/silencios/ligados.
  // v1.3: (a pedido) tresillos/sextillos — misma sintaxis "{...}" dentro
  // del patrón libre que patronRitmicoSVG en guia-practica.html: {xxx}
  // tresillo, {xxxxxx} sextillo, ambos ocupan el mismo espacio de 2
  // corcheas normales sin importar cuántas notas tengan adentro. Parser
  // y aplanado de columnas duplicados a mano acá (mismo criterio de
  // duplicación deliberada de siempre entre jsPDF y SVG de pantalla) para
  // que PDF y preview se vean igual. Un grupo mal formado (sin "}" de
  // cierre, o con tamaño distinto de 3/6) se dibuja como notas sueltas
  // sin bracket — no se dibuja un agrupado que no es válido.
  const parsearPatronRitmico = (patron) => {
    const str = (patron || '').replace(/\s+/g, '');
    const items = [];
    let i = 0;
    while(i < str.length){
      const c = str[i];
      if(c === '{'){
        const fin = str.indexOf('}', i + 1);
        const cerrado = fin !== -1;
        const inner = cerrado ? str.slice(i + 1, fin) : str.slice(i + 1);
        const valores = inner.split('').filter(ch => ch === 'x' || ch === 'X' || ch === '.' || ch === '-');
        const n = valores.length;
        const numero = (n === 3) ? 3 : (n === 6 ? 6 : null);
        items.push({ tipo: 'grupo', valores, numero, valido: cerrado && numero !== null });
        i = cerrado ? fin + 1 : str.length;
      } else if(c === 'x' || c === 'X' || c === '.' || c === '-' || c === ',' || c === 'n' || c === 'N'){
        // v1.98: (a pedido, puesto al día con guia-practica.html v1.96-98)
        // "," = silencio de negra, "n"/"N" = golpe de negra normal/
        // acentuado. Ninguno se agrega dentro de grupos {} (esos siguen
        // siendo puros de corchea, mismo criterio que el editor web).
        items.push({ tipo: 'simple', valor: c });
        i++;
      } else {
        i++;
      }
    }
    return items;
  };
  const aplanarColumnasPatron = (items) => {
    const cols = [];
    items.forEach(it => {
      if(it.tipo === 'simple'){
        // v1.98: "," (silencio de negra) y "n"/"N" (golpe de negra) pesan
        // 2 corcheas; el resto sigue pesando 1, como siempre.
        const pesaNegra = it.valor === ',' || it.valor === 'n' || it.valor === 'N';
        cols.push({ caracter: it.valor, peso: pesaNegra ? 2 : 1, grupo: null });
      } else {
        const pesoCada = it.valido ? (2 / it.valores.length) : 1;
        it.valores.forEach((v, idx) => {
          cols.push({ caracter: v, peso: pesoCada, grupo: it.valido ? { numero: it.numero, idx, size: it.valores.length } : null });
        });
      }
    });
    return cols;
  };
  const pesoTotalPatron = (items) => {
    let total = 0;
    items.forEach(it => { total += (it.tipo === 'simple') ? ((it.valor === ',' || it.valor === 'n' || it.valor === 'N') ? 2 : 1) : (it.valido ? 2 : it.valores.length); });
    return total;
  };
  // v1.67: (a pedido) helper compartido — mismo cálculo de columnas/xInfo
  // que antes vivía inline dentro de dibujarPatronRitmico, extraído tal
  // cual (cero cambios de lógica) para que dibujarAcordesPorGolpe (nuevo,
  // ver más abajo) pueda ubicar cada acorde exactamente arriba de su nota,
  // usando el mismo xStart/ancho que la tira rítmica real.
  const calcularColsYXInfo = (patron, xStart, ancho) => {
    const items = parsearPatronRitmico(patron);
    if(!items.length) return { cols: [], xInfo: [] };
    const cols = aplanarColumnasPatron(items);
    const pesoTotal = pesoTotalPatron(items);
    let acumPeso = 0;
    const xInfo = cols.map(col => {
      const x0 = xStart + (acumPeso / pesoTotal) * ancho;
      const w = (col.peso / pesoTotal) * ancho;
      acumPeso += col.peso;
      return { xCentro: x0 + w / 2, x0, x1: x0 + w };
    });
    return { cols, xInfo };
  };
  // v1.96: (a pedido) 6to parámetro opcional `escala` — el PDF seguía
  // dibujando la clave de sección a tamaño completo aunque el preview del
  // editor (patronRitmicoSVG v1.95) ya la muestra chica. A diferencia del
  // SVG (que solo achica con CSS, el dibujo interno no cambia), acá cada
  // trazo se hace con coordenadas absolutas en mm, así que para verse
  // realmente chico hay que escalar de verdad las medidas: alto de plica,
  // radio de cabeza, grosor de líneas, tamaño de letra de 3/6, offsets del
  // acento/ligado/silencio/bandera. El ANCHO horizontal (separación entre
  // notas) NO se toca acá — depende de qué `ancho` reciba la función, así
  // que para una miniatura angosta el llamador debe pasar un `ancho` más
  // chico (además de `escala`), igual que ya hace patronRitmicoSVG al
  // recibir un contenedor más chico. Default escala=1 → cero cambio para
  // el llamado de siempre (patrón principal de Break/Corte, línea ~1025).
  const dibujarPatronRitmico = (patron, xStart, ancho, yBase, compases, escala) => {
    const { cols, xInfo } = calcularColsYXInfo(patron, xStart, ancho);
    if(!cols.length) return 0;
    const n = cols.length;
    const sc = escala || 1;
    const altoPlica = 6 * sc;
    // v1.30: FIX — mismo fix que patronRitmicoSVG v1.52: "-" ahora
    // también cuenta como nota (esNota) para que se le dibuje su propia
    // cabeza+plica, como corresponde a una ligadura real (2 notas
    // completas unidas por la curva, no una nota fantasma).
    // v1.98: "n"/"N" (golpe de negra) también son nota (cabeza+plica),
    // pero NO entran a esBeamable — nunca les sale corchete ni bandera
    // (una negra real no lleva gancho), mismo criterio que
    // patronRitmicoSVG v1.98 en guia-practica.html.
    const esNota = (t) => t === 'x' || t === 'X' || t === '-' || t === 'n' || t === 'N';
    // v1.30: esBeamable es más estricto que esNota — se usa solo para
    // decidir qué se agrupa con un corchete/barra. La ligadura "-" cuenta
    // como nota para dibujarse, pero NUNCA debe agruparse en un corchete
    // con la nota anterior o siguiente (ya tiene su propia curva de
    // ligado, sería redundante/confuso agregarle además una barra).
    const esBeamable = (t) => t === 'x' || t === 'X';
    doc.setDrawColor(20); doc.setLineWidth(0.25 * sc);
    doc.line(xStart, yBase, xStart + ancho, yBase); // línea base (una sola, sin alturas)

    // v1.7: barras de compás — apertura, cierre y divisorias intermedias
    // si son 2+ compases. Mismo alto que la plica (de yBase-altoPlica a
    // yBase), independiente del agrupado de golpes.
    const totalCompases = Math.max(1, compases || 1);
    doc.setDrawColor(20); doc.setLineWidth(0.3 * sc);
    doc.line(xStart, yBase - altoPlica, xStart, yBase);
    doc.line(xStart + ancho, yBase - altoPlica, xStart + ancho, yBase);
    if(totalCompases >= 2){
      for(let c = 1; c < totalCompases; c++){
        const xDiv = xStart + (ancho / totalCompases) * c;
        doc.line(xDiv, yBase - altoPlica, xDiv, yBase);
      }
    }
    doc.setFillColor(20, 20, 20);

    // silencio: marca simplificada (dos trazos, no el símbolo estándar de
    // edición impresa) — v1.18: ahora colgando DEBAJO de la línea base,
    // en gris tenue, para no confundirse con el acento (que va arriba de
    // la plica, en negro). Antes iba arriba cerca de la plica y a este
    // tamaño era casi indistinguible del chevrón de acento.
    const dibujarSilencio = (x) => {
      doc.setDrawColor(150, 150, 150); doc.setLineWidth(0.45 * sc);
      const yc = yBase + 2 * sc;
      doc.line(x - 1.1 * sc, yc - 1.6 * sc, x + 0.9 * sc, yc + 0.5 * sc);
      doc.line(x + 0.9 * sc, yc + 0.5 * sc, x - 0.3 * sc, yc + 1.8 * sc);
      doc.setDrawColor(20);
    };
    // v1.98: (a pedido) silencio de NEGRA — símbolo distinto al de
    // corchea de arriba, mismo criterio visual (debajo de la línea base,
    // gris tenue). Trazo en zigzag suave vía curvas bezier (doc.lines con
    // segmentos de 6 valores, mismo mecanismo que dibujarLigado/bandera),
    // aproximando el mismo path que patronRitmicoSVG v1.98 en el editor.
    const dibujarSilencioNegra = (x) => {
      doc.setDrawColor(150, 150, 150); doc.setLineWidth(0.6 * sc);
      const yc = yBase + 2.0 * sc;
      doc.lines(
        [
          [2.0 * sc, 1.0 * sc, -2.15 * sc, 1.0 * sc, 1.1 * sc, 1.8 * sc],
          [2.0 * sc, 0.7 * sc, -2.35 * sc, 1.8 * sc, -1.25 * sc, 4.0 * sc]
        ],
        x - 0.7 * sc, yc - 3.6 * sc, [1, 1], 'S', false
      );
      doc.setDrawColor(20);
    };
    // ligado: arco chico entre la posición anterior y esta.
    // v1.29: (a pedido) FIX — la ligadura estaba dibujada con 2 líneas
    // rectas formando un ángulo (∧), distinta a la curva suave del
    // preview (patronRitmicoSVG). Se reemplaza por una curva bezier
    // (aproximación cúbica de la misma quadratic que usa el SVG: mismos
    // puntos de control convertidos con la fórmula estándar C1=P0+2/3
    // (Q-P0), C2=P1+2/3(Q-P1)) para que preview y PDF se vean IGUAL.
    // Profundidad 1.7mm, misma proporción que el preview (4.5 con
    // altoPlica=16 → ratio 0.28; acá altoPlica=6 → 6*0.28≈1.7).
    const dibujarLigado = (xDesde, xHasta) => {
      doc.setDrawColor(20); doc.setLineWidth(0.35 * sc);
      const yTie = yBase + 2 * sc;
      const profundidad = 1.7 * sc;
      const dx = xHasta - xDesde;
      doc.lines(
        [[dx / 3, (2 / 3) * profundidad, (dx * 2) / 3, (2 / 3) * profundidad, dx, 0]],
        xDesde, yTie, [1, 1], 'S', false
      );
    };

    // pasada 1: silencios y ligados (independiente del agrupado de golpes)
    for(let j = 0; j < n; j++){
      const col = cols[j];
      if(col.caracter === '.') dibujarSilencio(xInfo[j].xCentro);
      else if(col.caracter === ',') dibujarSilencioNegra(xInfo[j].xCentro);
      else if(col.caracter === '-' && j > 0) dibujarLigado(xInfo[j - 1].xCentro, xInfo[j].xCentro);
    }

    // pasada 2: golpes (x/X) — cabeza, plica, acento si corresponde
    // v1.26: (a pedido) vuelve la cabeza — dentro de un grupo
    // (tresillo/sextillo) se dibuja más chica (r=0.55mm en vez de 0.9mm)
    // para que no se toquen entre sí; fuera de grupos, cabeza normal.
    for(let j = 0; j < n; j++){
      const col = cols[j];
      if(!esNota(col.caracter)) continue;
      const xj = xInfo[j].xCentro;
      const r = (col.grupo ? 0.55 : 0.9) * sc;
      const xPlica = xj + r;
      doc.circle(xj, yBase, r, 'F');
      doc.setLineWidth(0.28 * sc);
      doc.line(xPlica, yBase, xPlica, yBase - altoPlica);
      // v1.29: (a pedido) FIX — el acento se veía "muy grande" en el PDF.
      // Estaba reusando dibujarIconoAcentoBreak() con sus medidas fijas
      // (2.2 x 1.7mm, grosor 0.5mm), pensadas para un ícono a tamaño de
      // lectura normal en otra parte del documento — acá, sobre una
      // plica de solo 6mm de alto (altoPlica), esas medidas resultaban
      // desproporcionadas (el acento ocupaba más de un tercio del alto
      // de la plica). Se dibuja un acento propio, escalado a la misma
      // proporción que usa patronRitmicoSVG en el preview (alto ≈13.75%
      // de altoPlica, ancho ≈77% del alto, grosor ≈5.6% de altoPlica) —
      // no se toca dibujarIconoAcentoBreak por si se usa en otro lado a
      // su tamaño original.
      if(col.caracter === 'X' || col.caracter === 'N'){
        // v1.98: "N" (golpe de negra acentuado) dispara el mismo acento.
        // v1.95: FIX — estos offsets eran fijos (sin *sc), correctos a
        // escala 1 pero, en miniatura (escala 0.4), el acento quedaba
        // desproporcionadamente alto respecto a la plica achicada y se
        // salía del espacio reservado (calcularAltoSeccion), viéndose
        // "cortado" arriba. Ahora todo el ícono escala junto con el
        // resto (misma proporción que antes, a escala 1 el resultado es
        // idéntico al de v1.29).
        // v1.96: (a pedido) +1mm extra fijo (sin *sc) de separación
        // respecto a la punta de la plica — a este tamaño ya quedaba
        // muy chico como para además achicarle el margen de aire.
        // v1.97: (a pedido) FIX — escalar el acento en proporción
        // lineal estricta a `sc` lo dejaba casi invisible en miniatura
        // (grosor de línea 0.136mm a sc=0.4). Se usa un piso propio
        // `scAcento` solo para las medidas del ícono (no para su
        // posición base, que sigue anclada a xPlica/altoPlica reales),
        // así el acento no se achica más allá de un tamaño legible
        // aunque el resto del patrón sí vaya a escala 0.4. A sc>=0.65
        // (patrón principal, escala 1) no cambia nada.
        const scAcento = Math.max(sc, 0.65);
        const ax = xPlica - 0.32 * scAcento, ay = yBase - altoPlica - 1.4 * sc - 1;
        doc.setDrawColor(20, 20, 20); doc.setLineWidth(0.34 * scAcento);
        doc.line(ax, ay - 0.83 * scAcento, ax + 0.64 * scAcento, ay - 0.42 * scAcento);
        doc.line(ax + 0.64 * scAcento, ay - 0.42 * scAcento, ax, ay - 0.0);
      }
    }

    // pasada 3: beams — grupos válidos llevan un solo corchete abarcando
    // todo el grupo + número (3/6) centrado arriba; fuera de grupo sigue
    // el agrupado de a 2 de siempre (corchete de par / gancho suelto).
    let j = 0;
    while(j < n){
      const col = cols[j];
      if(col.grupo){
        const size = col.grupo.size;
        let jFin = j;
        while(jFin < n && cols[jFin].grupo && cols[jFin].grupo.idx < size) jFin++;
        // v1.50: (a pedido) FIX — el corchete vuelve a ir de PLICA a
        // PLICA (borde derecho de la cabeza de la primera nota real del
        // grupo, hasta el mismo punto de la última), no del borde del
        // casillero — en v1.23 se había extendido al ancho completo del
        // grupo, pero visualmente se salía por los costados de la plica.
        // Mismo criterio que patronRitmicoSVG v1.50. Si el grupo tiene un
        // solo golpe real, se dibuja la bandera curva en vez de corchete
        // (no hay 2 plicas que unir); si no tiene ninguno, no se dibuja
        // nada.
        const idxGolpes = [];
        for(let k = j; k < jFin; k++) if(esBeamable(cols[k].caracter)) idxGolpes.push(k);
        if(idxGolpes.length >= 2){
          // v1.97: (a pedido) FIX real — estos offsets/grosores NO
          // escalaban por `sc` (a diferencia de la cabeza+plica de la
          // pasada 2, que sí desde v1.94). A escala 1 no se notaba
          // porque coincidía con las medidas reales, pero en miniatura
          // (sc=0.4) el corchete quedaba anclado a un punto bastante
          // más lejos de la punta real de la plica escalada → se veía
          // "flotando" separado (~1mm). Ahora escala junto con el
          // resto; a sc=1 el resultado es idéntico a antes.
          const rIni = (cols[idxGolpes[0]].grupo ? 0.55 : 0.9) * sc;
          const rFin = (cols[idxGolpes[idxGolpes.length - 1]].grupo ? 0.55 : 0.9) * sc;
          const xIni = xInfo[idxGolpes[0]].xCentro + rIni;
          const xFin = xInfo[idxGolpes[idxGolpes.length - 1]].xCentro + rFin;
          doc.setLineWidth(0.75 * sc);
          doc.line(xIni, yBase - altoPlica, xFin, yBase - altoPlica);
          // v1.27: (a pedido) doble barra cuando el grupo es de 6
          // (sextillo = semicorchea), simple para 3 (tresillo/corchea).
          if(size === 6){
            doc.line(xIni, yBase - altoPlica + 1.3 * sc, xFin, yBase - altoPlica + 1.3 * sc);
          }
          const xMedio = (xIni + xFin) / 2;
          doc.setFontSize(5);
          doc.setTextColor(20);
          doc.text(String(col.grupo.numero), xMedio, yBase - altoPlica - 2.3 * sc, { align: 'center' });
        } else if(idxGolpes.length === 1){
          const r = (cols[idxGolpes[0]].grupo ? 0.55 : 0.9) * sc;
          const xa = xInfo[idxGolpes[0]].xCentro + r;
          const yTop = yBase - altoPlica;
          doc.setFillColor(20, 20, 20);
          doc.lines(
            [
              [1.6 * sc, 0.3 * sc, 1.75 * sc, 1.35 * sc, 0.4 * sc, 2.45 * sc],
              [0.7 * sc, -1.15 * sc, 0.45 * sc, -1.85 * sc, -0.4 * sc, -2.45 * sc]
            ],
            xa, yTop, [1, 1], 'F', true
          );
          doc.setFontSize(5);
          doc.setTextColor(20);
          doc.text(String(col.grupo.numero), xa, yBase - altoPlica - 2.3 * sc, { align: 'center' });
        }
        j = jFin;
      } else if(col.caracter === '-'){
        // v1.30: FIX — mismo fix que patronRitmicoSVG v1.52: la nota
        // ligada siempre dibuja su propia bandera suelta, nunca se
        // empareja con la anterior/siguiente en un corchete de a 2 (ya
        // tiene su curva de ligado propia).
        // v1.97: offset y forma de la bandera ahora escalan por `sc`
        // (mismo fix que el resto de esta pasada 3).
        const xa = xInfo[j].xCentro + 0.9 * sc;
        const yTop = yBase - altoPlica;
        doc.setFillColor(20, 20, 20);
        doc.lines(
          [
            [1.6 * sc, 0.3 * sc, 1.75 * sc, 1.35 * sc, 0.4 * sc, 2.45 * sc],
            [0.7 * sc, -1.15 * sc, 0.45 * sc, -1.85 * sc, -0.4 * sc, -2.45 * sc]
          ],
          xa, yTop, [1, 1], 'F', true
        );
        j += 1;
      } else if(esBeamable(col.caracter)){
        const nextCol = (j + 1 < n && !cols[j + 1].grupo) ? cols[j + 1] : null;
        const xa = xInfo[j].xCentro + 0.9 * sc;
        if(nextCol && esBeamable(nextCol.caracter)){
          const xb = xInfo[j + 1].xCentro + 0.9 * sc;
          doc.setLineWidth(0.75 * sc);
          doc.line(xa, yBase - altoPlica, xb, yBase - altoPlica);
          j += 2;
        } else {
          // v1.27: (a pedido) bandera curva (bezier) en vez de la línea
          // recta diagonal, acercándose a la notación real de corchea
          // suelta. Mismo criterio/forma que patronRitmicoSVG v1.49,
          // adaptado a la API de curvas de jsPDF (doc.lines con
          // segmentos de 6 valores = bezier, deltas relativos al punto
          // anterior). Probado aislado en Node+jsPDF antes de aplicar.
          // v1.97: forma y offset ahora escalan por `sc`.
          const yTop = yBase - altoPlica;
          doc.setFillColor(20, 20, 20);
          doc.lines(
            [
              [1.6 * sc, 0.3 * sc, 1.75 * sc, 1.35 * sc, 0.4 * sc, 2.45 * sc],
              [0.7 * sc, -1.15 * sc, 0.45 * sc, -1.85 * sc, -0.4 * sc, -2.45 * sc]
            ],
            xa, yTop, [1, 1], 'F', true
          );
          j += 1;
        }
      } else {
        j += 1;
      }
    }
    doc.setTextColor(20);
    // v1.18: se sube de +4 a +7 el margen reservado — el silencio ahora
    // cuelga debajo de la línea base (antes iba arriba, ya cubierto por
    // altoPlica) y necesita su propio espacio para no pisar el contenido
    // que dibuja el llamador justo debajo.
    return altoPlica + 7;
  };
  // v1.29.11: caja especial para Break/Corte — en vez de dibujarCajas() con
  // grilla de 4 columnas chicas, una única caja ancha y baja con el/los
  // acorde(s) grandes y centrados (si son 2+ compases, se reparten en
  // partes iguales dentro de la MISMA caja, separadas por una línea fina
  // — no cajas sueltas de 4-por-fila). Sin números de compás (c.1, c.2):
  // no aportan nada en un golpe de 1-2 compases y ensucian la lectura
  // rápida. Debajo: "BREAK" + nota de tiempo si el staff cargó una
  // (notaTiempoCorte). No toca dibujarCajas ni ningún cálculo de
  // compases — es puramente un dibujo alternativo.
  // v1.2: si el staff cargó patronRitmico, se dibuja debajo de "BREAK" con
  // dibujarPatronRitmico (plicas/corcheas agrupadas).
  // v1.4: FIX — la caja se dibujaba SIEMPRE con anchoUtil (ancho total de
  // la página) sin importar cuántos compases dura el Break/Corte, lo que
  // la hacía ver desproporcionada al lado de secciones como Coro (que sí
  // reparten en cajas de tamaño fijo cajaAncho). Ahora usa el mismo
  // criterio de ancho que el resto: cajaAncho por compás, hasta un máximo
  // de POR_FILA compases (igual límite que dibujarCajas), y solo llega a
  // anchoUtil si realmente tiene 4+ compases. No cambia ningún cálculo de
  // compases ni de duración, solo el ancho del dibujo.
  // v1.5: (a pedido) 2 ajustes más:
  // 1) Si ninguno de los compases tiene acorde cargado, la caja no se
  //    dibuja (era un rectángulo vacío sin aportar nada) — se va directo
  //    a "BREAK" + patrón. Si algún compás sí tiene acorde, la caja se
  //    dibuja igual que antes.
  // 2) Se saca el ícono de acento ">" fijo al lado de la palabra "BREAK":
  //    el criterio ahora es escribir el ritmo real con el patrón (donde
  //    "X" mayúscula sigue marcando acento con ese mismo ícono, eso no
  //    cambia), en vez de un ícono genérico y fijo junto al texto.
  // v1.67: (a pedido) fila de acordes "por golpe" — cuando la sección trae
  // el campo acordesPorGolpe (cargado en guia-practica.html), cada acorde
  // se dibuja arriba de su nota exacta del patrón rítmico, en vez del
  // texto único centrado de siempre. Reusa calcularColsYXInfo (mismo
  // xStart/ancho que dibujarPatronRitmico) para que la columna de cada
  // acorde coincida 1 a 1 con la columna de su nota. acordesPorGolpe está
  // alineado solo contra las columnas que son nota real (x/X/-) — los
  // silencios ('.') no cuentan, mismo criterio que usa el editor
  // (htmlAcordesPorGolpeInputs en guia-practica.html).
  // Tamaño de letra auto-ajustable: arranca en el tamaño más grande
  // (15pt, igual al del texto libre de siempre) y baja de escalón
  // (12→10→8pt) solo si el acorde no entra en el espacio libre hasta la
  // nota-con-acorde más cercana (anterior/siguiente) sin pisarla. Piso en
  // 8pt (por debajo ya no se lee bien en atril).
  // v1.69: (a pedido) notasPorGolpe — anotación corta puntual por golpe
  // (ej. "MAS SUAVE"), campo hermano de acordesPorGolpe cargado en
  // guia-practica.html. A diferencia del acorde (que casi siempre tiene
  // contenido en cada golpe), la nota es puntual — la mayoría de los
  // golpes no la usan. Por eso NO se reserva una franja fija propia: se
  // dibuja chica (6pt itálica) solo donde hay texto, pegada arriba del
  // acorde de ESE golpe (si el acorde ocupa letra grande, la nota sube
  // más para no pisarlo — altoAcordeAprox estima el alto real dibujado).
  // Sin nota en ese golpe, no se dibuja ni se reserva nada ahí.
  const escalaFuenteGolpe = [15, 12, 10, 8];
  const dibujarAcordesPorGolpe = (acordesPorGolpe, notasPorGolpe, patron, xStart, ancho, yBase) => {
    const { cols, xInfo } = calcularColsYXInfo(patron, xStart, ancho);
    if(!cols.length) return;
    const esNota = (t) => t === 'x' || t === 'X' || t === '-';
    const notaIdx = [];
    cols.forEach((c, j) => { if(esNota(c.caracter)) notaIdx.push(j); });
    doc.setTextColor(20);
    notaIdx.forEach((j, k) => {
      const texto = ((acordesPorGolpe && acordesPorGolpe[k]) || '').trim();
      const xCentro = xInfo[j].xCentro;
      let size = 0;
      if(texto){
        // espacio disponible: distancia a la nota-con-acorde vecina más
        // cercana (o al borde de la caja si es la primera/última) — el
        // *2*0.85 da el ancho total del "hueco" propio de este acorde,
        // dejando un 15% de aire para que no se toquen entre sí.
        const xPrev = k > 0 ? xInfo[notaIdx[k - 1]].xCentro : xStart;
        const xNext = k < notaIdx.length - 1 ? xInfo[notaIdx[k + 1]].xCentro : xStart + ancho;
        const slot = Math.min(xCentro - xPrev, xNext - xCentro) * 2 * 0.85;
        doc.setFont('helvetica', 'bold');
        size = escalaFuenteGolpe[escalaFuenteGolpe.length - 1];
        for(const candidato of escalaFuenteGolpe){
          doc.setFontSize(candidato);
          if(doc.getTextWidth(texto) <= slot){ size = candidato; break; }
        }
        doc.setFontSize(size);
        doc.text(texto, xCentro, yBase, { align: 'center' });
      }
      const notaTxt = ((notasPorGolpe && notasPorGolpe[k]) || '').trim();
      if(notaTxt){
        // altoAcordeAprox: conversión aproximada pt→mm del alto de letra
        // mayúscula bold Helvetica (≈0.36 del tamaño en pt) — sirve para
        // saber cuánto subió el acorde y no pisarlo con la nota de arriba.
        const altoAcordeAprox = size ? size * 0.36 : 0;
        doc.setFont('helvetica', 'italic'); doc.setFontSize(6); doc.setTextColor(120);
        doc.text(notaTxt, xCentro, yBase - altoAcordeAprox - 2.2, { align: 'center' });
        doc.setTextColor(20);
      }
    });
    doc.setTextColor(20);
  };
  const dibujarCajaBreak = (acordes, total, nota, patron, compasGlobalInicio, acordesPorGolpe, notasPorGolpe) => {
    const altoCaja = 15;
    // v1.67: acordesPorGolpe (si tiene contenido y hay patrón cargado)
    // reemplaza por completo el texto libre de la caja — el acorde pasa a
    // dibujarse arriba de su nota, no centrado en un recuadro. Si no hay
    // acordesPorGolpe (Break/Corte viejo, o sección sin patrón), sigue
    // exactamente como antes.
    const hayAcordesPorGolpe = Array.isArray(acordesPorGolpe) && acordesPorGolpe.some(a => (a || '').trim()) && (patron || '').trim();
    const hayAcordes = !hayAcordesPorGolpe && Array.isArray(acordes) && acordes.some(a => (a || '').trim());
    if(hayAcordes){
      // v1.52: (a pedido, tras revisar captura real) FIX — antes el ancho
      // de la caja dependía de `total` (compases: min(total,POR_FILA)*
      // cajaAncho), así que con total=1 la caja quedaba angosta (~46mm) y
      // el texto del acorde (que en Break/Corte puede ser una frase libre
      // con varios acordes en un solo campo, ej. "Am Bbdim7b E7 G Am
      // Bbdim7b" dentro de UN compás) se dibujaba centrado a 15pt y
      // desbordaba la caja por los dos lados. El Break/Corte es siempre
      // UN renglón/frase libre de la sección — no una grilla por compás
      // como el resto — así que no tiene sentido que su ancho dependa de
      // `total`. Ahora usa siempre el ancho completo disponible de la
      // página (anchoUtil), sea 1 compás o varios. Con total>=POR_FILA ya
      // usaba anchoUtil de antes (min(...,POR_FILA)*cajaAncho=anchoUtil),
      // así que ese caso no cambia visualmente.
      const anchoCaja = anchoUtil;
      asegurarEspacio(altoCaja + 8 + (patron ? 10 : 0));
      const yCaja = y;
      doc.setDrawColor(20); doc.setLineWidth(0.4);
      doc.rect(margen, yCaja, anchoCaja, altoCaja);
      const anchoParte = anchoCaja / Math.max(1, total);
      doc.setTextColor(20);
      for(let j = 0; j < total; j++){
        if(j > 0){
          doc.setDrawColor(190); doc.setLineWidth(0.2);
          doc.line(margen + anchoParte * j, yCaja + 2, margen + anchoParte * j, yCaja + altoCaja - 2);
        }
        const cx = margen + anchoParte * j + anchoParte / 2;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(15);
        const acorde = (acordes && acordes[j]) || '';
        doc.text(acorde, cx, yCaja + altoCaja / 2 + 2.5, { align: 'center' });
        // v1.57: (a pedido) "#N" también en Break/Corte — antes solo lo
        // dibujaba dibujarCajas() (grilla normal); esta caja tiene su
        // propio dibujo y no lo traía. Mismo estilo/posición que la
        // grilla (esquina sup. derecha de cada parte, 6pt gris, línea
        // ~881), usando compasGlobalInicio+j. No se dibuja si el contador
        // global está apagado, mismo criterio que en todos lados.
        if(compasGlobalInicio != null){
          doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(170);
          doc.text('#' + (compasGlobalInicio + j), margen + anchoParte * j + anchoParte - 1.5, yCaja + 4, { align: 'right' });
          doc.setTextColor(20);
        }
      }
      y += altoCaja + 3;
    } else {
      // v1.67: +9mm extra cuando hay acordesPorGolpe — espacio para la
      // fila de acordes que se dibuja pegada arriba del patrón (ver más
      // abajo). Sin acordesPorGolpe, cero cambios respecto a antes.
      // v1.68: 9→12mm — coincide con la separación de 11mm que ahora usa
      // la fila de acordes (antes 8mm), más 1mm de margen.
      asegurarEspacio(8 + (patron ? 10 : 0) + (hayAcordesPorGolpe ? 12 : 0));
    }
    const notaTxt = (nota || '').trim();
    if(notaTxt){
      doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(120);
      doc.text('(' + notaTxt + ')', margen, y);
      doc.setTextColor(20);
    }
    // v1.70: el resumen "c.#X-c.#Y" se sacó de acá — ahora se dibuja una
    // sola vez en la barra de título de la sección (mismo dato, ver
    // dibujarBloqueSeccion.forEach más abajo, cerca de compasTxt).
    y += 6;
    if((patron || '').trim()){
      y += 4;
      // v1.4: el patrón rítmico ahora se dibuja al ancho de la caja
      // (anchoCaja) cuando hay caja, o del ancho de 1 compás si no la hay,
      // no de la página (anchoUtil), para que quede alineado con el resto
      // del bloque en vez de estirarse de más.
      // v1.52: mismo criterio que arriba — el ancho ya no depende de
      // `total`, usa anchoUtil siempre, para quedar alineado con la caja
      // de acordes (que ahora también usa anchoUtil).
      const anchoPatron = anchoUtil;
      // v1.67: si hay acordesPorGolpe, la fila de acordes va pegada
      // JUSTO arriba de la tira de notas (mismo xStart/ancho, así las
      // columnas coinciden exacto) — se dibuja antes de avanzar "y" al
      // punto donde arranca el patrón.
      if(hayAcordesPorGolpe){
        dibujarAcordesPorGolpe(acordesPorGolpe, notasPorGolpe, patron, margen, anchoPatron, y);
        // v1.68: (a pedido) 8→11mm — con fuente grande (15pt) el acorde
        // subía lo suficiente como para pisar el numerito de grupo
        // (tresillo/sextillo, ver dibujarPatronRitmico), que queda a
        // 10.5mm de la línea base. Con 11mm de separación + el numerito
        // bajado a 3.3mm (antes 4.5mm) queda una franja limpia entre
        // ambos, sin tocarse.
        y += 11;
      }
      dibujarPatronRitmico(patron, margen, anchoPatron, y, total);
      y += 6;
    }
  };

  // v1.24: color compartido — una sección con origenId usa el color de su
  // origen (ya resuelto por quien llama, en s.color) en vez de uno por
  // posición propia, y se le agrega "(D.C.)" al nombre para dejar claro
  // que es la misma idea repetida (da capo). El cuadro de acordes/letra se
  // sigue dibujando COMPLETO en cada aparición (ya tiene su propia copia
  // de datos, no hay nada que "ver arriba").
  const secciones = seccionesEntrada;
  // v1.29: sección ya sonó antes → hace falta para saber si el modo "coda"
  // (compacto) puede remitir a "ya sonó" o si es la primera vez que
  // aparece (en cuyo caso igual imprime completo, no hay a dónde remitir).
  const nombresYaImpresos = new Set();

  // v1.1: (a pedido) reserva el alto TOTAL de la sección (header + bloque
  // de cajas + 2da vez si hay) de una sola vez, antes de empezar a
  // dibujarla — así, si no entra completa en lo que queda de página,
  // salta TODA la sección a la página siguiente en vez de partirla (antes
  // solo se reservaban 10mm para el header, y cada sub-bloque chequeaba
  // espacio por separado con su propio asegurarEspacio adentro de
  // dibujarCajas/dibujarCajaBreak — eso podía dejar el header de color en
  // una página y las cajas en la otra, o la 1ra vez en una página y la 2da
  // vez en la siguiente). Replica exactamente la misma cuenta que hace el
  // dibujo real más abajo (mismos POR_FILA/cajaAlto/altoCaja, mismos +4/+6
  // de margen entre bloques) — si cambia el dibujo real, esta cuenta tiene
  // que actualizarse junto con él. No cambia ningún cálculo de compases ni
  // el contenido de las cajas, solo DÓNDE arranca la página.
  const calcularAltoSeccion = (s, esCoda) => {
    // v1.55: notaSeccion ya no imprime una línea aparte debajo de la
    // barra (ver más abajo, ahora va inline en la misma línea del
    // nombre, dentro de los 9mm de siempre) — no suma alto propio.
    // v1.93: (a pedido) clave por sección (s.claveSeccion) — 13mm extra
    // (altoPlica(6) + 7 de margen, el mismo valor que ya documenta y
    // devuelve dibujarPatronRitmico como su necesidad real). Probado
    // visualmente (PDF de prueba + rasterizado) antes de fijar el
    // número: +10 (el que usa el cálculo de Break/Corte más abajo, con
    // otra convención de padding) dejaba el silencio casi tocando el
    // límite; +13 deja margen cómodo. Se dibuja en SU PROPIA línea
    // debajo de la barra de título (no inline con el nombre) —
    // dibujarPatronRitmico necesita altoPlica(6) arriba + espacio del
    // silencio colgando abajo, no entra en los 9mm de la barra. Aplica a
    // CUALQUIER sección (no solo Break/Corte), y también a esCoda (mismo
    // criterio que compasTxt, que ya se imprime igual en repeticiones de
    // coda).
    // v1.96: 13 → 15 (2mm extra) porque el renglón de la clave ahora
    // arranca 2mm más abajo (y += 8 en vez de 6) para que las plicas no
    // queden pegadas/cortadas contra la barra de título de arriba.
    const extraClave = (s.claveSeccion || '').trim() ? 19 : 0;
    if(esCoda) return 9 + 6 + extraClave; // header + "Ver primera aparición arriba." + clave si tiene
    let alto = 9 + extraClave; // barra de color + nombre (+ clave si tiene)
    if(s.tipo === 'vamp'){
      const ciclo = s.cicloCompases || (s.acordesCiclo && s.acordesCiclo.length) || 0;
      // v1.55: la nota corta por compás ya no crece la caja — reserva su
      // propia tira (notaFilaAlto) por cada fila de POR_FILA, igual
      // criterio que dibujarCajas (hayContenido global del array).
      const notaAltoCiclo = hayContenido(s.notasCiclo) ? notaFilaAlto : 0;
      alto += ciclo > 0 ? (Math.ceil(ciclo / POR_FILA) * (cajaAlto + notaAltoCiclo) + 4 + 6) : 6;
      return alto;
    }
    const duracion = s.duracion;
    if(s.nombre === 'Intro' && (s.acordesSinTiempo || '').trim()) alto += 6;
    if(duracion != null && duracion > 0){
      const esBreak = s.nombre === 'Break/Corte';
      // v1.5: altoBloque para Break/Corte ahora depende de si hay algún
      // acorde cargado (n primeros compases de s.acordesPorCompas) — si no
      // hay ninguno, la caja no se dibuja (ver dibujarCajaBreak v1.5) y no
      // hay que reservarle sus 15+3mm.
      // v1.55: altoBloque, rama no-Break, reserva notaFilaAlto por CADA
      // fila (no +4mm fijo por caja como en v1.32) — mismo criterio que
      // el dibujo real en dibujarCajas. Break/Corte no usa notas por
      // compás (usa notaTiempoCorte, un campo distinto) — su fórmula
      // fija no cambia.
      const altoBloque = (n, notas) => {
        if(!esBreak){
          const notaAlto = hayContenido(notas) ? notaFilaAlto : 0;
          return Math.ceil(n / POR_FILA) * (cajaAlto + notaAlto) + 4;
        }
        // v1.67: acordesPorGolpe (si tiene contenido y hay patrón) usa
        // 9mm extra en vez de los 15+3 de la caja vieja — mismo criterio
        // que dibujarCajaBreak (ver ahí el detalle).
        const hayAcordesPorGolpe = Array.isArray(s.acordesPorGolpe) && s.acordesPorGolpe.some(a => (a||'').trim()) && (s.patronRitmico||'').trim();
        const hayAcordes = !hayAcordesPorGolpe && Array.isArray(s.acordesPorCompas) && s.acordesPorCompas.slice(0, n).some(a => (a||'').trim());
        // v1.68: 9→12mm, mismo valor que dibujarCajaBreak (ver ahí).
        return (hayAcordes ? 15 + 3 : 0) + (hayAcordesPorGolpe ? 12 : 0) + 6 + ((s.patronRitmico||'').trim() ? 10 : 0);
      };
      const repeticiones = s.repeticiones || 1;
      if(repeticiones > 1){
        const basePase = Math.max(1, Math.round(duracion / repeticiones));
        alto += altoBloque(basePase, s.notasPorCompas);
        const finalN = Math.min(basePase, s.finalDistintoN || 1);
        const hay2da = (s.acordesFinal2 && s.acordesFinal2.some(a => (a||'').trim())) || (s.letraFinal2 && s.letraFinal2.some(l => (l||'').trim()));
        if(hay2da) alto += 3 + altoBloque(finalN, s.notasFinal2);
      } else {
        alto += altoBloque(duracion, s.notasPorCompas);
      }
    } else {
      alto += 6;
    }
    return alto + 2; // el y+=2 final entre secciones
  };

  // v1.45: (a pedido) contador global de compás — cuenta compases reales
  // del TEMA completo (no por sección), con repeticiones incluidas.
  // compasGlobal arranca en 1 y avanza sumando s.duracion de cada
  // sección en orden (duracionCompasesSeccion en guia-practica.html, que
  // sale de hastaSegundos-desdeSegundos — existe para CUALQUIER tipo de
  // sección, Vamp incluido, así que ya viene con las repeticiones/vueltas
  // reales contadas, sin tener que recalcular nada acá). Si en algún
  // punto una sección no tiene fin de tiempo definido (duracion null),
  // el conteo deja de ser confiable de ahí en adelante — se apaga
  // (contadorGlobalValido=false) y las secciones siguientes no muestran
  // "#N" hasta que se complete esa sección y se vuelva a exportar.
  let compasGlobal = 1;
  let contadorGlobalValido = true;

  secciones.forEach((s, i) => {
    if(!(s.nombre || '').trim()) return;
    const esCoda = s.origenId && !s.esVariacion && s.modoRepeticionPDF === 'coda' && nombresYaImpresos.has(s.origenId);
    // v1.45: se captura el arranque de ESTA sección antes de dibujar
    // nada — así todas las cajas de la sección (1ra pasada, 2da vez,
    // horizontal) usan el mismo punto de referencia.
    const compasGlobalInicio = contadorGlobalValido ? compasGlobal : null;
    asegurarEspacio(calcularAltoSeccion(s, esCoda));
    const color = s.color;
    const rgb = [parseInt(color.slice(1,3),16), parseInt(color.slice(3,5),16), parseInt(color.slice(5,7),16)];
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.rect(margen, y, anchoUtil, 7, 'F');
    doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    // v1.26: si es una variación, la etiqueta avisa que el cuadro NO es
    // igual al original (no alcanza con "ya lo vi arriba") — incluye la
    // nota corta si el staff cargó una.
    // v1.29: modo "coda" usa un ícono dibujado (círculo+cruz) + texto
    // "D.S. al Coda"/"D.C." en vez de "(D.C.)" a secas, cuando la sección
    // está marcada como compacta.
    const etiquetaDC = s.origenId
      ? (s.esVariacion
          ? ` (D.C. — variación${(s.notaVariacion || '').trim() ? ': ' + s.notaVariacion.trim() : ''})`
          : (esCoda ? '' : ' (D.C.)'))
      : '';
    // v1.29: letra de ensayo en caja cuadrada a la izq. del nombre, y
    // compás propio (si difiere del general del tema) a la derecha.
    // v1.29.5: hasta 2 caracteres (ej. "A'" para variación), no solo 1 —
    // la caja se ensancha un poco si hace falta.
    const letraEns = (s.letraEnsayo || '').trim().slice(0, 2).toUpperCase();
    let xTexto = margen + 2;
    if(letraEns){
      const anchoCaja = letraEns.length > 1 ? 7 : 5;
      doc.setDrawColor(255); doc.setLineWidth(0.3);
      doc.rect(margen + 2, y + 1, anchoCaja, 5);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      doc.text(letraEns, margen + 2 + anchoCaja / 2, y + 5, { align: 'center' });
      xTexto = margen + 4 + anchoCaja;
      doc.setFontSize(10);
    }
    // v1.53: (a pedido) duración de la sección al lado del título — mismo
    // dato y mismo formato que ya usa guia-practica.html en sus propias
    // etiquetas de estructura ("· N comp.", ver ese archivo ~línea 1565).
    // Antes solo vivía en el editor; en el PDF no había forma de saber de
    // un vistazo cuántos compases dura una sección sin contar las cajas.
    // Usa s.duracion (compases reales, incluye repeticiones si las hay —
    // mismo valor que ya usa el contador global "#N"), no basePase/ciclo.
    // Se agrega DENTRO del texto del nombre (no como bloque aparte) para
    // que participe del cálculo de xLibre ya existente y no pise la nota
    // de sección ni el ícono D.S./D.C. que van después.
    const duracionTxt = (s.duracion != null && s.duracion > 0) ? ' · ' + s.duracion + ' comp.' : '';
    doc.text(s.nombre + etiquetaDC + duracionTxt, xTexto, y + 5);
    let xLibre = xTexto + doc.getTextWidth(s.nombre + etiquetaDC + duracionTxt) + 3;
    if(esCoda){
      const xIcono = xLibre;
      dibujarIconoCoda(xIcono, y + 5.5, [255, 255, 255]);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      doc.text('D.S. al Coda', xIcono + 5.5, y + 5);
      xLibre = xIcono + 5.5 + doc.getTextWidth('D.S. al Coda') + 3;
    }
    // v1.55: compás override — se calcula el texto/ancho ACÁ (antes de
    // dibujarlo) para poder reservarle su espacio a la nota de sección
    // que va inmediatamente a la izquierda; el dibujo real del texto
    // queda al final del bloque, después de la nota (no cambia el
    // resultado visual, jsPDF no depende del orden de los doc.text()).
    const compasTxt = (s.compasOverride || '').trim() ? '· ' + s.compasOverride.trim() : '';
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    const anchoCompas = compasTxt ? doc.getTextWidth(compasTxt) + 4 : 0;
    // v1.55: (a pedido, FIX de diseño) la nota de sección deja de vivir
    // en su propia línea gris debajo de la barra (v1.31) — ahora va
    // INLINE en la misma línea del nombre, dentro de la franja de color
    // de siempre (la barra NO crece), entre el nombre/ícono y el compás
    // override de la derecha. Límite duro de 40 caracteres puesto en el
    // editor (guia-practica.html, bajado de 70 porque ahora comparte
    // línea con el nombre), más 2 redes de seguridad acá por si el
    // espacio real que queda libre (nombre largo + ícono + compás) es
    // más angosto que el peor caso previsto: 1) reduce la fuente de a
    // 0.5pt (de 8 a 6mín), 2) si aun a 6pt no entra, recorta con "…"
    // letra por letra hasta que sí entre. Si no queda casi espacio libre
    // (<8mm), directamente no se imprime — mejor omitirla que solaparla
    // con el compás.
    if((s.notaSeccion || '').trim()){
      const nota = s.notaSeccion.trim();
      const anchoDisponible = (margen + anchoUtil - anchoCompas - 2) - xLibre;
      if(anchoDisponible > 8){
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.8 }));
        doc.setFont('helvetica', 'italic');
        let fontNota = 8;
        doc.setFontSize(fontNota);
        while(doc.getTextWidth(nota) > anchoDisponible && fontNota > 6){
          fontNota -= 0.5;
          doc.setFontSize(fontNota);
        }
        let notaMostrar = nota;
        if(doc.getTextWidth(notaMostrar) > anchoDisponible){
          while(notaMostrar.length > 1 && doc.getTextWidth(notaMostrar + '…') > anchoDisponible){
            notaMostrar = notaMostrar.slice(0, -1);
          }
          notaMostrar += '…';
        }
        doc.text(notaMostrar, xLibre, y + 5);
        doc.restoreGraphicsState();
        doc.setFont('helvetica', 'normal');
      }
    }
    if(compasTxt){
      doc.setFontSize(8);
      doc.text(compasTxt, margen + anchoUtil - 2, y + 5, { align: 'right' });
    }
    // v1.70: (a pedido, según captura de referencia) el resumen
    // "c.#X-c.#Y" pasa a vivir DENTRO de la barra de título, mismo lado
    // derecho — antes era una línea aparte debajo del bloque de cajas,
    // repetida (con el mismo valor) en 4 puntos distintos del código
    // según el tipo de sección (fija-bloque simple/repetido, Vamp,
    // Break/Corte); las 4 usaban exactamente compasGlobalInicio..
    // compasGlobalInicio+s.duracion-1 (el rango real de TODA la sección),
    // así que ahora se calcula una sola vez acá y se sacaron esos 4
    // llamados (buscar "v1.70" en cada punto). Blanco, itálica, opacidad
    // reducida (mismo recurso que ya usa la nota de sección arriba) para
    // no competir visualmente con el nombre. Si hay compás override
    // (compasTxt), el resumen se corre a la izquierda de ese texto para
    // no pisarlo.
    if(compasGlobalInicio != null && s.duracion != null && s.duracion > 0){
      const finResumen = compasGlobalInicio + s.duracion - 1;
      const resumenTxt = 'c.#' + compasGlobalInicio + (finResumen !== compasGlobalInicio ? '-c.#' + finResumen : '');
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.75 }));
      doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(255);
      doc.text(resumenTxt, margen + anchoUtil - 2 - anchoCompas, y + 5, { align: 'right' });
      doc.restoreGraphicsState();
      doc.setFont('helvetica', 'normal'); doc.setTextColor(255);
    }
    y += 9;
    doc.setTextColor(20);
    nombresYaImpresos.add(s.id || s.nombre);

    // v1.93: (a pedido) clave por sección (s.claveSeccion) — se dibuja
    // en su propia línea, ancho completo (anchoUtil), mismo criterio de
    // padding (+6 antes, +6 después) que ya usa dibujarCajaBreak para
    // patronRitmico (línea ~987-1013 de este archivo). "2" fijo de
    // compases (el ciclo de clave siempre son 2 compases, no la
    // duración de la sección). Aplica a CUALQUIER sección, incluida
    // esCoda (mismo criterio que compasTxt arriba).
    if((s.claveSeccion || '').trim()){
      // v1.96: 6 → 8 (2mm más abajo) — a pedido, las plicas quedaban
      // pegadas/cortadas contra la barra de título de arriba.
      y += 8;
      const timingTxt = (s.compasOverride || compasTexto || '').trim();
      // v1.99: (a pedido) subtítulo propio arriba de la miniatura —
      // "Clave de sección X/Y" (el compás como texto plano, no la
      // fracción apilada gráfica de abajo). Chico e itálico, gris, para
      // no competir con el nombre de la sección. +4mm de alto reservado
      // (ver extraClave, ahora 19 en vez de 15) para que entre sin pisar
      // el patrón.
      const tituloClave = 'Clave de sección' + (timingTxt ? ' ' + timingTxt : '');
      doc.setFont('helvetica', 'italic'); doc.setFontSize(6.5); doc.setTextColor(90, 90, 90);
      doc.text(tituloClave, margen, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(20);
      y += 4.5;
      let xClave = margen;
      if(timingTxt){
        // v1.97: (a pedido) FIX — fontSize 9 y offsets fijos (y-1.5 /
        // y+3.5) no tenían relación con el alto real de la miniatura
        // que acompañan (altoPlica a la escala fija 0.4 que usa la
        // llamada de abajo = 2.4mm); el bloque de texto terminaba
        // ocupando ~8mm de alto, mucho más que la propia pauta, y se
        // veía descolgado/"fuera de contexto". Ahora se calcula sobre
        // altoPlicaClave (misma escala 0.4 fija que dibujarPatronRitmico
        // recibe más abajo) con fontSize reducido a 6pt — mismo criterio
        // de legibilidad mínima que ya usan los números de grupo (3/6,
        // fontSize 5) dentro del propio patrón — numerador arriba /
        // denominador abajo dentro del mismo rango vertical que ocupa
        // la pauta rítmica.
        const escalaClave = 0.4; // debe coincidir con el 6to arg de dibujarPatronRitmico, abajo
        const altoPlicaClave = 6 * escalaClave;
        const partes = timingTxt.split('/');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(6); doc.setTextColor(20);
        if(partes.length === 2){
          const anchoTiming = Math.max(doc.getTextWidth(partes[0]), doc.getTextWidth(partes[1]));
          const cx = margen + anchoTiming / 2;
          doc.text(partes[0], cx, y - altoPlicaClave + 1.6, { align: 'center' });
          doc.text(partes[1], cx, y + 1.6, { align: 'center' });
          xClave = margen + anchoTiming + 3;
        } else {
          doc.text(timingTxt, margen, y);
          xClave = margen + doc.getTextWidth(timingTxt) + 3;
        }
        doc.setFont('helvetica', 'normal');
      }
      // v1.94: (a pedido) miniatura real — antes usaba anchoUtil completo
      // y sin escala (se veía igual de grande que el patrón principal).
      // Ahora: escala 0.4 (6to parámetro, ya soportado por
      // dibujarPatronRitmico desde antes) + ancho reducido al 30% de
      // anchoUtil, alineado a la izquierda (arrancando después del
      // timing, si lo hay), dejando el resto de la línea vacío.
      dibujarPatronRitmico(s.claveSeccion, xClave, anchoUtil * 0.3, y, 2, 0.4);
      y += 6;
    }

    // v1.29: modo coda — no re-dibuja el cuadro completo, solo remite a la
    // primera aparición (ya se ve completo más arriba en el mismo PDF).
    // Nada de esto toca dibujarCajas/cálculo de compases.
    if(esCoda){
      doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
      doc.text('Ver primera aparición arriba.', margen, y);
      y += 6; doc.setTextColor(20);
      // v1.45: no dibuja cajas, pero los compases reales de esta
      // repetición SÍ pasan en el tema — el contador tiene que avanzar
      // igual (mismo criterio que el resto, ver más abajo).
      if(contadorGlobalValido){
        if(s.duracion != null && s.duracion > 0) compasGlobal += s.duracion;
        else contadorGlobalValido = false;
      }
      return;
    }

    if(s.tipo === 'vamp'){
      const ciclo = s.cicloCompases || (s.acordesCiclo && s.acordesCiclo.length) || 0;
      if(ciclo > 0){
        // v1.46: (a pedido) FIX de criterio sobre v1.45 — antes NO se
        // pasaba compasGlobalInicio acá, con el argumento de que "no hay
        // una caja única de compás real si el ciclo se repite". Error:
        // s.duracion ya define el total real de vueltas (duracion/ciclo)
        // sin ambigüedad, y la 1ra vuelta dibujada ocupa siempre los
        // primeros `ciclo` compases reales de la sección — exactamente
        // el mismo criterio que ya se usa en fija-bloque con
        // repeticiones (se numera la 1ra pasada, las vueltas repetidas
        // no se renumeran por ser idénticas). Ahora sí numera.
        // v1.3: (a pedido, FIX real — no solo cosmético) si `duracion` no
        // es múltiplo exacto de `ciclo` (ej. ciclo=2, duracion=3), el
        // compás sobrante (acá, compás #3) antes NO SE DIBUJABA EN
        // NINGÚN LADO: dibujarCajas siempre pintaba exactamente `ciclo`
        // cajas, sin importar cuánto durara la sección — el contador
        // global seguía avanzando bien para la sección siguiente, pero
        // esta sección se quedaba muda sobre su propio compás sobrante.
        // Fix: se arma un array extendido (acordesCiclo + los primeros
        // `sobra` acordes repetidos, mismo contenido — es literalmente
        // el mismo compás del ciclo, solo que la vuelta se corta ahí) y
        // se dibuja como una sola grilla de `ciclo+sobra` cajas. Mismo
        // criterio de numeración secuencial que cualquier otra grilla
        // (c.N/#N calculados con posLabel=j, sin casos especiales) —
        // dibujarCajas ya sabe partir en filas nuevas solo si no entra
        // en la fila (POR_FILA), sin código extra acá.
        const duracionVamp = s.duracion || ciclo;
        const vueltasCompletas = Math.max(1, Math.floor(duracionVamp / ciclo));
        const sobra = Math.max(0, duracionVamp - vueltasCompletas * ciclo);
        const acordesConSobra = sobra > 0 ? (s.acordesCiclo || []).concat((s.acordesCiclo || []).slice(0, sobra)) : s.acordesCiclo;
        const letraConSobra = sobra > 0 ? (s.letraCiclo || []).concat((s.letraCiclo || []).slice(0, sobra)) : s.letraCiclo;
        const notasConSobra = sobra > 0 ? (s.notasCiclo || []).concat((s.notasCiclo || []).slice(0, sobra)) : s.notasCiclo;
        const acordesTiempoConSobra = sobra > 0 ? (s.acordesTiempoCiclo || []).concat((s.acordesTiempoCiclo || []).slice(0, sobra)) : s.acordesTiempoCiclo;
        const yGridVamp = y;
        // v1.100: (a pedido, FIX real) el compás sobrante (columna
        // `ciclo`..`ciclo+sobra-1`) NO es la posición j del ciclo — ocurre
        // recién DESPUÉS de las `vueltasCompletas` vueltas completas. Antes
        // dibujarCajas calculaba su "#N" como compasGlobalInicio+j (mismo
        // criterio lineal que las columnas del ciclo), lo que daba un
        // número de compás real equivocado (ej. ciclo=2, duracion=5:
        // mostraba #3 en vez de #5 para la caja sobrante). Se arma acá el
        // array explícito con el número real de cada columna y se lo pasa
        // a dibujarCajas (opciones.numerosGlobales) — las columnas del
        // ciclo (0..ciclo-1) no cambian su cálculo, solo la(s) sobrante(s).
        const numerosGlobalesVamp = compasGlobalInicio != null
          ? Array.from({ length: ciclo + sobra }, (_, j) => j < ciclo
              ? compasGlobalInicio + j
              : compasGlobalInicio + vueltasCompletas * ciclo + (j - ciclo))
          : undefined;
        dibujarCajas(acordesConSobra, letraConSobra, ciclo + sobra, notasConSobra, undefined, undefined, { compasGlobalInicio, acordesTiempo: acordesTiempoConSobra, numerosGlobales: numerosGlobalesVamp, gapDesdeColumna: sobra > 0 ? ciclo : undefined, gapMm: 6 });
        // v1.101: (a pedido) marco de repetición (‖: ... :‖, el mismo que
        // ya usa fija-bloque con repeticiones>1 vía dibujarBarraRepeticion)
        // ahora también en Vamp, siempre — antes el Vamp solo tenía el
        // iconito antes del texto "se repite...", sin marco. Envuelve
        // ÚNICAMENTE las cajas del ciclo (ancho = min(ciclo,POR_FILA)*
        // cajaAncho, igual que la última fila de una grilla de `ciclo`
        // cajas), nunca la caja sobrante, aunque `sobra > 0` haya agregado
        // columnas extra a la grilla recién dibujada.
        const anchoMarcoVamp = (((Math.min(ciclo, POR_FILA) - 1) % POR_FILA) + 1) * cajaAncho;
        const hayNotasCicloMarco = hayContenido(s.notasCiclo);
        dibujarBarraRepeticion(yGridVamp + (hayNotasCicloMarco ? notaFilaAlto : 0), cajaAlto, anchoMarcoVamp);
        // v1.63: (a pedido) FIX/mejora sobre v1.59 — antes la lista de
        // próximas vueltas solo se pegaba a la 1ra caja del ciclo (columna
        // 0). El pedido es que TODAS las cajas del ciclo muestren sus
        // propias vueltas (ej. si "B" es c.1/#1 y también #3, "Bm" es
        // c.2/#2 y también #4) — no solo la primera. Se recorre cada
        // columna del ciclo (0..ciclo-1) y se lista, para cada una, sus
        // repeticiones futuras (compasGlobalInicio + columna + k*ciclo).
        const vueltasVamp = Math.max(0, Math.floor((s.duracion || ciclo) / ciclo) - 1);
        if(compasGlobalInicio != null && vueltasVamp > 0){
          const maxLineasVamp = 3;
          const hayNotasCiclo = hayContenido(s.notasCiclo);
          const yBaseVamp = yGridVamp + (hayNotasCiclo ? notaFilaAlto : 0) + 7;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(170);
          for(let col = 0; col < Math.min(ciclo, POR_FILA); col++){
            const xListaVamp = margen + cajaAncho * col + cajaAncho - 1.5;
            let yListaVamp = yBaseVamp;
            for(let k = 1; k <= Math.min(vueltasVamp, maxLineasVamp); k++){
              doc.text('#' + (compasGlobalInicio + col + k * ciclo), xListaVamp, yListaVamp, { align: 'right' });
              yListaVamp += 2.6;
            }
          }
          doc.setTextColor(20);
        }
        const anchoIcono = dibujarIconoRepeticion(margen, y);
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
        // v1.63: (a pedido) "yo no veo cuántas veces se repite" — el
        // texto solo decía el largo del ciclo, no cuántas vueltas son en
        // total. Se agrega "xN" adelante, mismo formato que ya usa
        // fija-bloque ("x2 (4 comp. reales)") para lo mismo.
        const totalVueltasVampTxt = vueltasVamp + 1;
        const sobraTxt = sobra > 0 ? (' + ' + sobra + ' comp.') : '';
        doc.text('se repite x' + totalVueltasVampTxt + ' (ciclo de ' + ciclo + ' comp.)' + sobraTxt, margen + anchoIcono + 1, y);
        // v1.70: el resumen "c.#X-c.#Y" se sacó de acá — ahora vive en la
        // barra de título de la sección (mismo dato).
        y += 6; doc.setTextColor(20);
      } else {
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
        doc.text('Definí el ciclo de compases arriba para ver las cajas acá.', margen, y);
        y += 6; doc.setTextColor(20);
      }
    } else {
      const duracion = s.duracion;
      // v1.29.11: Break/Corte usa dibujarCajaBreak (caja ancha) en vez de
      // dibujarCajas (grilla de 4 col.) — mismo dato de entrada
      // (acordesPorCompas/acordesFinal2), solo cambia el dibujo.
      const esBreak = s.nombre === 'Break/Corte';
      const dibujarBloqueSeccion = esBreak
        ? (ac, le, n, no, ci, li, opciones) => dibujarCajaBreak(ac, n, s.notaTiempoCorte, s.patronRitmico, opciones && opciones.compasGlobalInicio, s.acordesPorGolpe, s.notasPorGolpe)
        : dibujarCajas;
      if(duracion != null && duracion > 0){
        if(s.nombre === 'Intro' && (s.acordesSinTiempo || '').trim()){
          doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
          doc.text('Libre/rubato: ' + s.acordesSinTiempo, margen, y);
          y += 6;
        }
        // v1.23: repetición con 1ra/2da vez — dibuja UNA sola pasada
        // (basePase cajas, lo que realmente cargó el staff en la grilla de
        // arriba) en vez de repetir la fila entera `repeticiones` veces;
        // abajo, nota de repetición y, si hay 2da vez cargada, una fila
        // chica aparte con esas cajas. repeticiones=1 (default) no cambia
        // nada.
        const repeticiones = s.repeticiones || 1;
        if(repeticiones > 1){
          const basePase = Math.max(1, Math.round(duracion / repeticiones));
          // v1.42: (a pedido) hay2da/alineable ahora se calculan ACÁ
          // arriba (antes se calculaban después de dibujar la 1ra vez) —
          // necesitamos saberlo ANTES de capturar yBloque, para poder
          // reservar aire arriba para el corchete "1." si va a hacer
          // falta. finalN no depende de nada que se calcule más abajo.
          const finalN = Math.min(basePase, s.finalDistintoN || 1);
          const hay2da = (s.acordesFinal2 && s.acordesFinal2.some(a => (a||'').trim())) || (s.letraFinal2 && s.letraFinal2.some(l => (l||'').trim()));
          const alineable = !esBreak && basePase <= POR_FILA;
          // v1.43: (a pedido) cabeHorizontal también se calcula ACÁ
          // arriba (antes de saber si hace falta reservar aire para el
          // corchete "1.").
          const hayNotas1 = !esBreak && hayContenido(s.notasPorCompas);
          const hayNotas2 = !esBreak && hayContenido(s.notasFinal2);
          const colLibreDesde = basePase % POR_FILA;
          const libres = colLibreDesde === 0 ? 0 : POR_FILA - colLibreDesde;
          const cabeHorizontal = !!s.casillaHorizontal && alineable && libres >= finalN && hayNotas1 === hayNotas2;
          // v1.44: FIX — este aire se reservaba solo si !cabeHorizontal,
          // con el razonamiento de que "en horizontal no se dibuja el
          // corchete 1., así que no hace falta". Error: en horizontal SÍ
          // se dibuja un corchete arriba (el "2." de la caja pegada al
          // lado, ver más abajo), anclado en el mismo yBloque y con el
          // mismo offset hacia arriba que el "1." — el aire hace falta
          // en los dos modos por igual. Ahora se reserva siempre que
          // alineable && hay2da, sin importar cabeHorizontal.
          if(alineable && hay2da){
            // El corchete se dibuja pegado a la caja/nota de abajo
            // (offsets de dibujarCorcheteCasilla sin cambios) — lo que
            // hacía falta era AIRE ARRIBA de toda la sección para que no
            // pisara la franja de color del título anterior. Antes no
            // había forma de reservarlo (asegurarEspacio solo protege
            // hacia abajo). +5mm alcanza para el offset del número
            // (-3.3) más un margen chico.
            y += 5;
          }
          // v1.29.8: FIX — yBloque se capturaba ANTES de asegurar espacio;
          // si dibujarCajas() disparaba un salto de página adentro
          // (asegurarEspacio → addPage → y=margen), yBloque quedaba con la
          // Y vieja (página anterior) mientras las cajas se dibujaban en
          // la Y nueva — la barra/corchete quedaban flotando,
          // desalineados. Ahora se asegura el espacio ANTES de capturar
          // yBloque, así los dos usan la misma Y real.
          const altoBloque = Math.ceil(basePase / POR_FILA) * (cajaAlto + (!esBreak && hayContenido(s.notasPorCompas) ? notaFilaAlto : 0));
          const anchoBloque = Math.min(basePase, POR_FILA) * cajaAncho;
          asegurarEspacio(altoBloque + 2);
          const yBloque = y;
          dibujarBloqueSeccion(s.acordesPorCompas, s.letraPorCompas, basePase, s.notasPorCompas, undefined, undefined, { compasGlobalInicio, acordesTiempo: s.acordesTiempo });
          // v1.51: (a pedido) "→ #N" — versión final, DEBAJO
          // de la 1ra caja (#14) puntual, centrado bajo esa columna (no
          // bajo todo el bloque, por eso no usa el mismo ancho que el
          // texto "x2 (...)"). Se dibuja ACÁ, apenas terminan de dibujarse
          // las cajas (y ya quedó en yBox_bottom+4, el colchón que deja
          // dibujarCajas) y ANTES del texto "x2 (...)" que se dibuja más
          // abajo en este mismo bloque — así queda una franja propia,
          // sin pisar ni la letra en cursiva (que va DENTRO de la caja,
          // más arriba) ni el texto "x2 (...)" (3mm más abajo que esto).
          // No depende de la cantidad de repeticiones: es un solo número
          // (compasGlobalInicio + basePase), no una lista — el ancho de
          // columna (cajaAncho, ~46.5mm con POR_FILA=4) sobra de sobra
          // para cualquier compás real de una canción (hasta 4-5 dígitos
          // sin riesgo de desbordar, muy por encima de lo que un tema
          // real necesita). Mismo criterio de apagado que "#N" de siempre.
          // v1.55: (a pedido, versión final tras varias iteraciones)
          // "→ #N" pasa a ser una listita, pegada JUSTO abajo del label
          // "#14" (misma esquina sup. derecha de la 1ra caja, ADENTRO —
          // mismo x que usa dibujarCajas para el label: x+cajaAncho-1.5,
          // ver línea ~881), no más afuera/debajo de toda la caja. Si hay
          // varias vueltas (repeticiones > 2), se listan una debajo de la
          // otra (columna), cada una un compás real más adelante
          // (compasGlobalInicio + col + k*basePase, k=1..repeticiones-1).
          // Si no entran todas en las maxLineas disponibles, la última
          // línea visible pasa a ser "..." en vez del número, para no
          // desbordar la caja hacia la letra en cursiva (yCaja+13) ni
          // hacia el acorde grande del centro. yBloque acá equivale a
          // yCaja de la 1ra caja (fila 0, columna 0) porque dibujarCajas()
          // arranca sus filas en el mismo y que recibe.
          // v1.1: (a pedido) 2 cambios sobre la versión anterior: (a) ya
          // no requiere hay2da — antes, una sección fija-bloque repetida
          // SIN 2da vez (ej. Coda/Final) se quedaba sin esta lista por
          // completo, mostrando solo el texto "x2 (N comp. reales)" sin
          // detalle de qué compás real es cada vuelta; (b) recorre TODAS
          // las columnas de basePase (antes solo columna 0), mismo
          // criterio que ya usa el Vamp (línea ~1270) para su ciclo —
          // cada caja de la 1ra pasada ahora lista sus propias vueltas
          // futuras, no solo la primera.
          // v1.2: (a pedido, FIX) cuando hay 2da vez, la última vuelta
          // (k=totalVueltas, la que reemplaza el final por acordesFinal2)
          // NO va en esta lista para las columnas que la 2da vez
          // reemplaza (colReemplazo..basePase-1) — ese número ya se
          // dibuja en la propia caja de "2DA VEZ" (ver más abajo,
          // dibujarBloqueSeccion con compasGlobalInicio2da). Antes se
          // listaba en los dos lugares a la vez (duplicado y engañoso:
          // parecía que esa columna volvía a tocarse en su versión
          // original en la última vuelta, cuando en realidad se toca la
          // 2da vez). Columnas fuera del rango de reemplazo (antes de
          // colReemplazo) no cambian: siguen listando todas las vueltas,
          // la 2da vez no las afecta.
          const colReemplazoVueltas = alineable ? (basePase - finalN) : 0;
          if(alineable && compasGlobalInicio != null){
            const totalVueltas = Math.max(0, (s.repeticiones || 1) - 1);
            if(totalVueltas > 0){
              const maxLineas = 3;
              // v1.56: FIX — faltaba sumar el mismo corrimiento que
              // dibujarCajas() aplica a la fila 0 cuando hay nota arriba
              // (yCaja = yFila + (hayNotas?notaFilaAlto:0), línea 862).
              // Con "MAS SUAVE" presente, la caja real bajaba 5mm pero
              // esta lista se quedaba calculada desde yBloque sin ese
              // offset — quedaba dibujada MÁS ARRIBA que el label "#14"
              // real, pisándolo. Usa hayNotas1 (mismo dato que ya se le
              // pasa a dibujarCajas como "notas" de la 1ra vez).
              const yCajaReal = yBloque + (hayNotas1 ? notaFilaAlto : 0);
              doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(170);
              for(let col = 0; col < Math.min(basePase, POR_FILA); col++){
                // v1.2: última vuelta oculta en columnas reemplazadas
                // por la 2da vez (ver comentario arriba).
                const totalVueltasCol = (hay2da && col >= colReemplazoVueltas) ? totalVueltas - 1 : totalVueltas;
                if(totalVueltasCol <= 0) continue;
                const xLista = margen + cajaAncho * col + cajaAncho - 1.5;
                let yLista = yCajaReal + 7;
                for(let k = 1; k <= Math.min(totalVueltasCol, maxLineas); k++){
                  const esUltimaVisible = (k === maxLineas) && (totalVueltasCol > maxLineas);
                  const txt = esUltimaVisible ? '…' : '#' + (compasGlobalInicio + col + k * basePase);
                  doc.text(txt, xLista, yLista, { align: 'right' });
                  yLista += 2.6;
                }
              }
              doc.setTextColor(20);
            }
          }
          // v1.35: (a pedido) la barra ya no abarca la tira de nota
          // (ej. "MAS SUAVE") de la 1ra fila — solo el alto real de las
          // cajas. Se corre el inicio hacia abajo esa misma altura
          // (offsetNotaPrimeraFila) y se resta del total, así el final de
          // la barra (abajo) no se mueve, solo el arranque. Nota: si el
          // bloque ocupa MÁS de una fila (basePase > POR_FILA), las notas
          // de las filas intermedias/siguientes siguen quedando dentro de
          // la barra — separarlas también implicaría partir la barra en
          // segmentos por fila, cambio más grande que no se hizo acá.
          const offsetNotaPrimeraFila = (!esBreak && hayContenido(s.notasPorCompas) ? notaFilaAlto : 0);
          // v1.48: FIX — en modo horizontal (cabeHorizontal), la 2da vez se
          // dibuja pegada a la derecha de la 1ra vez SIN espacio de por
          // medio (ver más abajo, xHorizontal = margen + basePase*cajaAncho,
          // justo donde terminaba anchoBloque). El trazo derecho de la barra
          // de repetición asumía aire ahí y quedaba dibujado ENCIMA/adentro
          // de la caja de la 2da vez. Ahora, solo cuando cabeHorizontal &&
          // hay2da, el ancho que recibe dibujarBarraRepeticion se extiende
          // para que el trazo derecho cierre después de la caja de la 2da
          // vez (borde real de "Fm"/etc.), no en el borde de la 1ra vez —
          // la barra enmarca el ciclo completo con su final incluido, como
          // corresponde. El trazo izquierdo no cambia. Sin 2da vez o con
          // 2da vez apilada (no cabeHorizontal), anchoBloque queda igual
          // que siempre.
          const anchoBarraDerecha = (cabeHorizontal && hay2da) ? anchoBloque + finalN * cajaAncho : anchoBloque;
          dibujarBarraRepeticion(yBloque + offsetNotaPrimeraFila, altoBloque - offsetNotaPrimeraFila, anchoBarraDerecha);
          doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(120);
          // v1.39: (a pedido) FIX de dirección sobre v1.38 — no tenía en
          // cuenta que dibujarCajas() ya deja +4mm de colchón después de
          // la caja (y += altoTotal + 4). y-3 en realidad ACERCABA el
          // texto al borde (quedaba a solo 1mm), al revés de lo buscado.
          // Con y-1 queda a 3mm reales del borde de la grilla de arriba.
          doc.text('x' + repeticiones + ' (' + duracion + ' comp. reales)', margen + anchoBloque / 2, y - 1, { align: 'center' });
          // v1.70: el resumen "c.#X-c.#Y" se sacó de acá — ahora vive en
          // la barra de título de la sección (mismo dato, una sola vez).
          doc.setTextColor(20);
          // v1.41: (a pedido) antes la 2da vez SIEMPRE arrancaba dibujada
          // en columna 1, sin importar cuántos compases reemplaza — con
          // basePase=2 y finalDistintoN=1, el PDF mostraba la 2da vez
          // como si fuera "c.1" nueva, sin forma de saber que en
          // realidad reemplaza el c.2. Ahora, SOLO si la 1ra vez entra
          // en una única fila (caso normal — si ocupa varias filas, cae
          // al comportamiento de siempre por abajo), se calcula la
          // columna real que reemplaza y se alinean ahí tanto el
          // corchete "2." como un corchete "1." nuevo arriba de la 1ra
          // vez, en las mismas columnas — para que quede claro a simple
          // vista qué compás(es) cambia(n) en la última pasada.
          const colReemplazo = alineable ? (basePase - finalN) : 0;
          const xReemplazo = margen + colReemplazo * cajaAncho;
          const anchoReemplazo = finalN * cajaAncho;
          // v1.44: (a pedido) el corchete "1." ahora se dibuja también en
          // modo horizontal (antes solo en el apilado vertical) — sin él,
          // no quedaba claro a simple vista CUÁL caja de la 1ra pasada es
          // la que se reemplaza (solo se notaba leyendo el "c.N" chico).
          // Ahora queda simétrico: "1." arriba de la caja reemplazada,
          // "2." arriba de la caja pegada al lado.
          if(alineable && hay2da){
            // El corchete "1." va arriba de TODA la tira de nota (si hay,
            // ej. "MAS SUAVE") para no pisar ese texto — por eso usa
            // yBloque (arranque real de la fila) y no yCaja/offsetNota.
            dibujarCorcheteCasilla(yBloque, 1, xReemplazo, anchoReemplazo);
          }
          if(hay2da && cabeHorizontal){
            // Modo horizontal: la 2da vez va pegada a la derecha de la
            // 1ra vez, EN LA MISMA FILA (columna basePase en adelante),
            // con su propio corchete "2." angosto arriba (mismo estilo
            // que el corchete "1."/"2." de siempre, solo que del ancho
            // de sus columnas). La etiqueta "c.N" sigue mostrando el
            // compás real (labelInicio=colReemplazo), no la columna
            // donde se dibuja.
            const xHorizontal = margen + basePase * cajaAncho;
            const anchoHorizontal = finalN * cajaAncho;
            // Mismo criterio que el corchete "1.": ancla en yBloque (por
            // encima de TODA la tira de nota si hay, ej. "MAS SUAVE"),
            // no en yCaja — si no, con nota cargada el corchete quedaría
            // pisando ese texto.
            dibujarCorcheteCasilla(yBloque, 2, xHorizontal, anchoHorizontal);
            // v1.47: FIX — la 2da vez es la ÚLTIMA pasada del repetido,
            // no la primera. compasGlobalInicio (el de la sección) sirve
            // para la 1ra pasada, pero acá hay que sumarle las pasadas
            // intermedias: (repeticiones-1) vueltas completas de
            // basePase compases cada una, antes de llegar a colReemplazo.
            // Si repeticiones=1, esto no suma nada (queda igual que antes).
            const compasGlobalInicio2da = compasGlobalInicio != null
              ? compasGlobalInicio + (repeticiones - 1) * basePase
              : null;
            dibujarCajas(s.acordesFinal2, s.letraFinal2, finalN, s.notasFinal2, basePase, colReemplazo, {
              yBase: yBloque,
              hayNotasForzado: hayNotas1,
              sinAvanzarY: true,
              compasGlobalInicio: compasGlobalInicio2da,
              acordesTiempo: s.acordesTiempoFinal2
            });
          } else if(hay2da){
            // v1.37: (a pedido) el hueco fijo era de 3mm, y en esos 3mm
            // tenían que convivir el texto "x2 (N comp. reales)" (dibujado
            // arriba, en y-2, con sus propios ascendentes/descendentes) Y
            // la línea del corchete "2." (que arranca 3.5mm por encima de
            // yBloque2) — terminaban pisándose entre sí y con el borde de
            // la grilla de la fila anterior. Con 6mm de hueco, la línea del
            // corchete queda por DEBAJO del borde de esa grilla (no
            // pegada) y con margen real respecto al texto "x2 (...)". El
            // tick vertical de 3.5mm hasta la caja de abajo no cambió.
            // v1.39: hueco 6→7mm — con el número del corchete ahora
            // flotando más arriba de la línea (-4, ver v1.39 en
            // dibujarCorcheteCasilla), quedaba a solo ~1mm del texto
            // "x2 (...)" de arriba. Con 7mm queda a ~4mm, sin riesgo de
            // tocarse. El tick de 1.5mm hasta la caja de abajo no cambió.
            y += 7;
            const altoBloque2 = Math.ceil(finalN / POR_FILA) * (cajaAlto + (!esBreak && hayContenido(s.notasFinal2) ? notaFilaAlto : 0));
            asegurarEspacio(altoBloque2 + 4);
            const yBloque2 = y;
            dibujarCorcheteCasilla(yBloque2, 2, alineable ? xReemplazo : margen, alineable ? anchoReemplazo : anchoUtil);
            // v1.47: mismo FIX que en el modo horizontal — ver comentario
            // ahí arriba.
            const compasGlobalInicio2daV = compasGlobalInicio != null
              ? compasGlobalInicio + (repeticiones - 1) * basePase
              : null;
            dibujarBloqueSeccion(s.acordesFinal2, s.letraFinal2, finalN, s.notasFinal2, alineable ? colReemplazo : 0, undefined, { compasGlobalInicio: compasGlobalInicio2daV, acordesTiempo: s.acordesTiempoFinal2 });
          }
        } else {
          dibujarBloqueSeccion(s.acordesPorCompas, s.letraPorCompas, duracion, s.notasPorCompas, undefined, undefined, { compasGlobalInicio, acordesTiempo: s.acordesTiempo });
          // v1.70: el resumen "c.#X-c.#Y" se sacó de acá — ahora vive en
          // la barra de título de la sección (mismo dato, una sola vez;
          // ver dibujarBloqueSeccion.forEach, cerca de compasTxt).
        }
      } else {
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
        doc.text('Definí el fin de la sección para ver las cajas acá.', margen, y);
        y += 6; doc.setTextColor(20);
      }
    }
    // v1.45: avance del contador global — al final, para que aplique
    // sea cual sea la rama de dibujo de arriba (Vamp, fija-bloque,
    // Break/Corte, o el placeholder "definí el fin/ciclo..."). Usa
    // SIEMPRE s.duracion (compases reales del tema completo), nunca
    // ciclo/basePase/finalN — esos son solo cuántas cajas se DIBUJAN,
    // no cuántos compases reales pasan.
    if(contadorGlobalValido){
      if(s.duracion != null && s.duracion > 0) compasGlobal += s.duracion;
      else contadorGlobalValido = false;
    }
    y += 2;
  });

  const nombreArchivo = 'estructura-' + nombreTema.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.pdf';
  // v1.28: preview antes de descargar — en vez de forzar la descarga
  // directa con doc.save(), se abre el PDF ya armado (mismo dibujo de
  // siempre, cero cambios en dibujarCajas/cálculo de compases) en una
  // pestaña nueva con el visor nativo del navegador. Desde ahí el usuario
  // ve el resultado real y decide si lo descarga o imprime con los
  // controles propios del visor — no se duplica ninguna lógica de
  // renderizado. setProperties(title) hace que el visor y el nombre
  // sugerido al guardar coincidan con nombreArchivo.
  doc.setProperties({ title: nombreArchivo });
  const urlPreview = doc.output('bloburl');
  const ventana = window.open(urlPreview, '_blank');
  if(!ventana){
    // Bloqueador de pop-ups u otro impedimento: no se pierde el PDF, se
    // cae al comportamiento anterior (descarga directa).
    doc.save(nombreArchivo);
  }
}
