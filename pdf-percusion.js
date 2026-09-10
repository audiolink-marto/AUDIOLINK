// AUDIOLINK · pdf-percusion.js · v1.102
// v1.102: mismo fix que pdf-armonias.js v1.105, replicado — dibujarCajasPercusion
// gana 2do gap independiente y acumulativo (opciones.gapDesdeColumna2/
// gapMm2); con anacrusa, el ciclo real se corre 6mm después de la
// Anacrusa (antes pegada, 0mm — el marco la invadía). offsetX del marco y
// x de "próximas vueltas" suman ese mismo gap. Sin anacrusa, cero cambio.
// AUDIOLINK · pdf-percusion.js · v1.101
// v1.101: mismo fix que pdf-armonias.js v1.104, replicado — con
// anacrusa Y Vamp, la caja "Anacrusa" se dibuja aparte (columna propia,
// dibujarCajasPercusion([],[],1,0,0,{esAnacrusa:true,sinAvanzarY:true})),
// no adentro del ciclo (v1.100 la metía en columna 0, y el motor de
// repetición la contaba como parte de lo que se repite). El ciclo real
// arranca en colInicioCicloPercusion=1; dibujarBarraRepeticionPercusion
// gana opciones.offsetX para que el marco arranque ahí, no en el margen
// de página; la lista de "próximas vueltas" usa el mismo offset.
// compasGlobal vuelve a arrancar siempre en 1. Fija-bloque (no-Vamp) NO
// se tocó (sigue con el criterio de v1.100, columna 0 — no tenía este
// bug, ahí no hay cálculo modular sobre esa columna).
// AUDIOLINK · pdf-percusion.js · v1.100
// v1.100: mismo fix que pdf-armonias.js v1.103, replicado — datos.anacrusa
// hace compasGlobal arrancar en 0, y dibujarCajasPercusion gana
// opciones.esAnacrusa (solo j===0): la 1ra caja del tema muestra
// "Anacrusa" en vez de "c.1" y no dibuja su "#0". Aplicado en el único
// punto de entrada de la 1ra caja (dibujarCajasPercusion, línea ~1138,
// compartido por Vamp y fija-bloque). Sin datos.anacrusa, cero cambios.
// AUDIOLINK · pdf-percusion.js · v1.99
// v1.99: mismo fix que pdf-armonias.js v1.102, replicado (reemplaza el
// intento anterior de esta misma versión) — dibujarCajasPercusion gana
// opciones.gapDesdeColumna + opciones.gapMm (mismo mecanismo); la llamada
// del Vamp las usa solo cuando sobraPercusion>0 (gapDesdeColumna:
// totalCajas, gapMm: 6), separando la caja sobrante 6mm de las cajas del
// ciclo para que el cierre del marco (dibujarBarraRepeticionPercusion,
// sin cambios) no se solape. Sin sobra, sin cambios.
// AUDIOLINK · pdf-percusion.js · v1.98
// v1.98: (a pedido) el marco de repetición (‖: ... :‖, ya existía para
// fija-bloque con repeticiones>1) ahora también se dibuja en Vamp,
// siempre — antes estaba excluido a propósito (v1.86: "Vamp... no lleva
// marco"). Encierra únicamente las cajas del CICLO (anchoMarcoPercusion
// ya se basa en `totalCajas`, que en Vamp es el largo del ciclo, no
// ciclo+sobra — ver totalCajasSeccionPercusion), nunca la caja sobrante
// cuando la hay. Sin sobra, resultado visual nuevo: marco alrededor del
// ciclo completo (antes no llevaba marco, solo el iconito + texto "se
// repite..." de siempre, que se mantienen igual).
// AUDIOLINK · pdf-percusion.js · v1.97
// v1.97: (a pedido, FIX real) mismo fix que pdf-armonias.js v1.100 — en
// Vamp con ciclo que no cierra exacto (ej. ciclo=2 + 1 comp. suelto,
// duración total 5), el "#N" (compás real global) de la caja sobrante se
// calculaba lineal (compasBase + posLabel), dando #3 en vez de #5, porque
// esa caja en realidad ocurre DESPUÉS de las vueltas completas del ciclo,
// no en la 3ra posición. dibujarCajasPercusion gana opciones.
// numerosGlobales (mismo mecanismo que dibujarCajas en pdf-armonias.js):
// si viene definido, usa numerosGlobales[j] en vez del cálculo lineal.
// Sin ese array (todo lo que no es vamp con sobra), resultado idéntico a
// antes. La llamada del Vamp arma el array: columnas 0..totalCajas-1
// siguen igual, la(s) sobrante(s) usan compasGlobalInicio +
// vueltasCompletas*totalCajas + offset.
// AUDIOLINK · pdf-percusion.js · v1.96
// v1.96: (a pedido) subtítulo "Clave de sección X/Y" arriba de la
// miniatura de clave por sección — chico, itálico, gris (no compite con
// el nombre de la sección). El compás va como texto plano (ej. "3/4"),
// distinto de la fracción apilada gráfica que ya se dibujaba junto al
// patrón (esa se mantiene igual). extraClave sube de 15 a 19mm en
// calcularAltoSeccionPercusion para darle espacio a la línea nueva.
// AUDIOLINK · pdf-percusion.js · v1.95
// v1.95: (a pedido, con FIX post-revisión de PDF) resolución de NEGRA
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
// existentes sin estos símbolos dan resultado IDÉNTICO a v1.94.
// AUDIOLINK · pdf-percusion.js · v1.94
// v1.94: (a pedido) clave por sección puesta al día con pdf-armonias.js
// v1.94-v1.97 (ver ahí el detalle de cada fix): 1) dibujarPatronRitmico
// gana el 6to parámetro `escala` — toda la función (plica, cabeza,
// corchetes, bandera de corchea, barra doble de sextillo, offset del
// número 3/6) escala junto con `sc`; a escala 1 (la única forma en que
// se la llama hoy, Break/Corte) el resultado es idéntico a antes, cero
// riesgo ahí. El acento (>) usa un piso propio (Math.max(sc,0.65)) para
// sus propias medidas, así no desaparece en miniatura. 2) la clave de
// sección pasa de dibujarse a tamaño completo (ancho completo, sin
// escala) a miniatura real: escala 0.4, ancho 30% de anchoUtil,
// alineada a la izquierda — mismo criterio que armonías v1.94. 3) se
// agrega el timing/compás (s.compasOverride o compasTexto general) en
// notación apilada (numerador arriba/denominador abajo) al comienzo del
// renglón, con fontSize calculado según el alto real de la miniatura
// (mismo criterio que armonías v1.97, evita el bloque de texto
// "descolgado" que dejaba el fontSize fijo de una versión anterior).
// calcularAltoSeccionPercusion: extraClave sube de 13 a 15mm (mismo
// valor que armonías, mismo motivo — el renglón baja 2mm más). Cero
// cambios en grillas, Break/Corte, repeticiones o cualquier otra parte
// del archivo.
// AUDIOLINK · pdf-percusion.js · v1.93
// v1.93: (a pedido) clave por sección (s.claveSeccion) — mismo cambio
// que pdf-armonias.js v1.93 (ver ahí el detalle): dibujarPatronRitmico
// en su propia línea debajo de la barra de título, ancho completo, "2"
// fijo de compases, +13mm reservado en calcularAltoSeccionPercusion
// (mismas dos ramas, esBreak y normal). Segunda entrega de 3 del plan
// consolidado de clave por sección.
// AUDIOLINK · pdf-percusion.js · v1.3
// v1.3: (a pedido, FIX real) mismo fix que pdf-armonias.js v1.3 — Vamp
// con `duracion` no múltiplo exacto del ciclo dejaba el compás sobrante
// sin dibujar. Ahora la grilla se arma con `totalCajas+sobra` cajas y
// el texto "se repite..." suma "+ N comp." cuando corresponde.
// v1.2: (a pedido, FIX) mismo fix que pdf-armonias.js v1.2 — con 2da vez
// cargada, la lista de "próximas vueltas" ya no repite la ÚLTIMA vuelta
// en las columnas que la 2da vez reemplaza (ese número ya se dibuja en
// la caja de "2DA VEZ"). Cero cambios en el resto.
// v1.1: (a pedido) mismo fix que pdf-armonias.js v1.1 — fija-bloque
// simple (!esVamp) con repeticiones>1 ahora también muestra la lista de
// "próximas vueltas" (#N chico) bajo TODAS las columnas de la 1ra
// pasada, con o sin 2da vez cargada (antes no existía este bloque acá,
// a diferencia de acordes que al menos la tenía —limitada a columna 0—
// cuando había 2da vez). Cero cambios en el resto del archivo.
// v1.0: split desde pdf-estructura.js v1.92 (ver ahí el historial
// completo de generarEstructuraPDFPercusion hasta esa versión). A
// partir de acá este archivo lleva su propio changelog independiente.
// Contiene: generarEstructuraPDFPercusion (PDF de guía de percusión),
// usado por guia-practica.html.


// v1.73: (a pedido) "guía de percusión" — función NUEVA y separada,
// cero líneas compartidas con generarEstructuraPDF/dibujarCajas/
// dibujarCajaBreak de arriba (cero riesgo de romper el PDF de acordes
// existente). Mismo `datos` de entrada (temaNombre/bpm/compasTexto/
// claveTxt/secciones), mismos colores por sección ya resueltos por
// quien llama (exportarEstructuraPDFPercusion, guia-practica.html
// v1.74). Diferencias a propósito respecto al PDF de acordes:
//  - Header COMPLETO, igual al de generarEstructuraPDF (headerH=38mm,
//    franja + diffuser con recorte "cover" + logo con
//    LOGO_SIZE/ALIGN/OFFSET_Y/SIN_LOGO + línea dorada), a pedido — antes
//    era simplificado (solo franja+logo, 20mm), ya no. Los 3 helpers
//    (dibujarDiffuserCover/imagenComoDataURL/detectarFormatoImagen) son
//    funciones locales dentro de generarEstructuraPDF, así que se
//    duplican acá tal cual (mismo código, cero cambio de lógica) porque
//    esta función vive aparte y no puede llamarlas directamente. Único
//    texto distinto: "GUÍA DE PERCUSIÓN" en vez de "GUÍA DE PRÁCTICA".
//  - Cada celda de compás: número + (si hay) notasPercusionPorCompas de
//    ESE compás — nada de acorde ni letra (a pedido explícito: "esta
//    guía no tiene acordes").
//  - Mini-regla de 16 marcas (semicorchea) en vez de las 8 de acordes,
//    notación 1/e/&/a por tiempo (misma que ya usa cualquier
//    percusionista) — lee acentosPorCompas, campo propio, no
//    acordesTiempo.
// Alcance de esta primera versión (a propósito, para no arriesgar todo
// de una): dibuja UNA pasada por sección (basePase, igual criterio que
// la grilla principal de acordes) — no expande 2da vez (acordesFinal2)
// ni el ciclo completo de Vamp, y las secciones Break/Corte se dibujan
// igual que cualquier otra (sin su patrón rítmico propio). Si hace
// falta alguna de esas 3 cosas, se agrega después con el mismo criterio
// ya usado en todo este archivo (avisando antes de tocar).
function generarEstructuraPDFPercusion(datos){
  const { temaNombre, bpm, compasTexto, claveTxt, secciones: seccionesEntrada } = datos;
  if(!window.jspdf){ alert('No se pudo cargar el generador de PDF. Revisá tu conexión e intentá de nuevo.'); return; }
  if(!seccionesEntrada || !seccionesEntrada.length){ alert('No hay secciones cargadas todavía.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margen = 12;
  const anchoUtil = pageW - margen * 2;

  const goldRGB = [201, 162, 75];
  const headerH = 38;
  const imgDiffuserHdr = document.getElementById('hdrDiffuser');
  const imgLogoHdr = document.getElementById('hdrLogo');
  const diffuserOkHdr = imgDiffuserHdr && imgDiffuserHdr.complete && imgDiffuserHdr.naturalWidth > 0;
  const logoOkHdr = imgLogoHdr && imgLogoHdr.complete && imgLogoHdr.naturalWidth > 0;
  const headerSinFondo = typeof HEADER_SIN_FONDO !== 'undefined' ? HEADER_SIN_FONDO : false;
  const headerColorRGB = typeof HEADER_COLOR_RGB !== 'undefined' ? HEADER_COLOR_RGB : [11, 11, 13];
  const headerDiffuserOpacity = typeof HEADER_DIFFUSER_OPACITY !== 'undefined' ? HEADER_DIFFUSER_OPACITY : 1.0;
  const headerColorOpacity = typeof HEADER_COLOR_OPACITY !== 'undefined' ? HEADER_COLOR_OPACITY : 0.62;

  // Helpers duplicados tal cual desde generarEstructuraPDF (son funciones
  // locales allá, no accesibles acá) — cero cambio de lógica, ver esa
  // función para el detalle de cada uno.
  function dibujarDiffuserCoverPercusion(img, targetWmm, targetHmm, opacity, formato){
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
  function imagenComoDataURLPercusion(img, calidad){
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    return canvas.toDataURL('image/jpeg', calidad != null ? calidad : 0.95);
  }
  function detectarFormatoImagenPercusion(src){
    const limpio = (src || '').split('?')[0].split('#')[0].toLowerCase();
    if(limpio.endsWith('.png')) return 'PNG';
    if(limpio.endsWith('.webp')) return 'WEBP';
    return 'JPEG';
  }

  if(!headerSinFondo){
    if(diffuserOkHdr){
      dibujarDiffuserCoverPercusion(imgDiffuserHdr, pageW, headerH, headerDiffuserOpacity, detectarFormatoImagenPercusion(imgDiffuserHdr.src));
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
    let logoParaPintar = imgLogoHdr;
    let logoFormato = 'JPEG';
    try {
      logoParaPintar = imagenComoDataURLPercusion(imgLogoHdr);
    } catch(e){
      logoParaPintar = imgLogoHdr;
      logoFormato = detectarFormatoImagenPercusion(imgLogoHdr.src);
    }
    try {
      doc.addImage(logoParaPintar, logoFormato, logoX, logoY, logoW, logoH);
    } catch(e){ /* logo omitido puntualmente, mismo criterio que generarEstructuraPDF */ }
  }
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: 1 }));
  doc.setTextColor(25, 22, 18);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('GUÍA DE PERCUSIÓN', pageW - margen, headerH - 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric' }), pageW - margen, headerH - 5, { align: 'right' });
  doc.restoreGraphicsState();

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

  const POR_FILA = 6;
  const cajaAncho = anchoUtil / POR_FILA;
  const cajaAlto = 14;
  const TIEMPOS_PERCUSION = ['1','1e','1&','1a','2','2e','2&','2a','3','3e','3&','3a','4','4e','4&','4a'];
  // v1.90: (a pedido) notaFilaAlto/hayContenido — duplicados tal cual de
  // generarEstructuraPDF (línea ~1157/1170, funciones locales allá, no
  // accesibles desde acá) para que la nota por compás de percusión
  // (notasPercusionPorCompas/Ciclo/Final2) tenga su propia tira arriba de
  // la caja, mismo criterio visual que ya usa el PDF de acordes.
  const notaFilaAlto = 5;
  const hayContenido = (arr) => Array.isArray(arr) && arr.some(x => (x || '').trim());

  const secciones = seccionesEntrada.filter(s => (s.nombre || '').trim());

  // v1.76: (a pedido) Vamp y 2da vez en la guía de percusión — mismo
  // patrón que ya usa generarEstructuraPDF con dibujarCajas/acordesCiclo/
  // acordesFinal2, pero leyendo los arrays exclusivos de percusión
  // (notasPercusionCiclo/acentosCiclo y notasPercusionFinal2/acentosFinal2).
  // Antes, esta función ignoraba s.tipo==='vamp' por completo: dibujaba
  // s.duracion cajas leyendo notasPercusionPorCompas/acentosPorCompas (los
  // arrays de la grilla principal, que en una sección Vamp ni siquiera se
  // cargan) — quedaba mal. También faltaba el bloque de 2da vez entero.
  const totalCajasSeccionPercusion = (s) => {
    const esVamp = s.tipo === 'vamp';
    const esBreak = s.nombre === 'Break/Corte';
    if(esVamp) return s.cicloCompases || (s.notasPercusionCiclo && s.notasPercusionCiclo.length) || 0;
    const repeticiones = esBreak ? 1 : (s.repeticiones || 1);
    const duracion = s.duracion || 1;
    return repeticiones > 1 ? Math.max(1, Math.round(duracion / repeticiones)) : duracion;
  };
  const hay2daSeccionPercusion = (s, totalCajas) => {
    if(s.tipo === 'vamp' || s.nombre === 'Break/Corte') return false;
    const repeticiones = s.repeticiones || 1;
    if(repeticiones <= 1) return false;
    // v1.77: (a pedido) antes SOLO miraba los arrays exclusivos de
    // percusión (notasPercusionFinal2/acentosFinal2) — si el usuario ya
    // había cargado una 2da vez distinta en el PDF general (acordesFinal2/
    // letraFinal2) pero no había tocado nada de percusión, este PDF no
    // mostraba el bloque de 2da vez. Ahora también hereda esa info.
    return (s.notasPercusionFinal2 && s.notasPercusionFinal2.some(t => (t||'').trim())) ||
           (s.acentosFinal2 && s.acentosFinal2.some(a => (a||'').trim())) ||
           (s.acordesFinal2 && s.acordesFinal2.some(a => (a||'').trim())) ||
           (s.letraFinal2 && s.letraFinal2.some(l => (l||'').trim()));
  };
  // v1.77: (a pedido) criterio compartido — ¿esta sección debe mostrar
  // la línea "se repite xN..." heredada del PDF general? (Vamp con ciclo
  // definido, o fija-bloque con repeticiones>1; Break/Corte nunca).
  const mostrarRepeticionPercusion = (s, totalCajas) => {
    const esVamp = s.tipo === 'vamp';
    const esBreak = s.nombre === 'Break/Corte';
    if(esVamp) return totalCajas > 0;
    return !esBreak && (s.repeticiones || 1) > 1;
  };
  const calcularAltoSeccionPercusion = (s) => {
    // v1.93: (a pedido) clave por sección (s.claveSeccion) — mismo
    // criterio que generarEstructuraPDF. Se suma en las dos ramas
    // (esBreak y normal) porque aplica a CUALQUIER sección, no solo
    // Break/Corte.
    // v1.94: 13 → 15mm, mismo valor y mismo motivo que armonías v1.96
    // (el renglón de la clave ahora arranca 2mm más abajo).
    const extraClave = (s.claveSeccion || '').trim() ? 19 : 0;
    const esBreak = s.nombre === 'Break/Corte';
    if(esBreak){
      // v1.84: (a pedido) alto para el patrón rítmico en vez de la
      // grilla — mismo criterio que dibujarCajaBreak en generarEstructuraPDF
      // (header 10mm + nota de tiempo 6mm + patrón si hay: 4mm de
      // separación + altoPlica(6)+7 de dibujarPatronRitmico).
      const hayPatron = (s.patronRitmico || '').trim();
      return 7 + 3 + 6 + (hayPatron ? 4 + 13 : 0) + 4 + extraClave;
    }
    const totalCajas = totalCajasSeccionPercusion(s);
    const filas = Math.max(1, Math.ceil((totalCajas || 1) / POR_FILA));
    // v1.92: (a pedido) la tira de arriba ahora la ocupa la nota de
    // ARMONÍA (notasPorCompas/notasCiclo), no la de percusión — la de
    // percusión vuelve a vivir ADENTRO de la caja (ver dibujarCajasPercusion).
    // Por eso acá se mira notasPorCompas/notasCiclo para decidir si
    // reservar notaFilaAlto, igual que hace calcularAltoSeccion en
    // generarEstructuraPDF para la grilla de acordes.
    const notasArmoniaPrincipal = s.tipo === 'vamp' ? s.notasCiclo : s.notasPorCompas;
    const notaAltoPrincipal = hayContenido(notasArmoniaPrincipal) ? notaFilaAlto : 0;
    let alto = 7 + 3 + filas * (cajaAlto + notaAltoPrincipal + 2) + 4;
    if(mostrarRepeticionPercusion(s, totalCajas)) alto += 5;
    if(hay2daSeccionPercusion(s, totalCajas)){
      const finalN = Math.min(totalCajas || 1, s.finalDistintoN || 1);
      const filasF2 = Math.max(1, Math.ceil(finalN / POR_FILA));
      const notaAltoF2 = hayContenido(s.notasFinal2) ? notaFilaAlto : 0;
      alto += cajaAlto + 4 + 4 + filasF2 * (cajaAlto + notaAltoF2 + 2);
    }
    return alto + extraClave;
  };

  // v1.79: (a pedido) mismo ícono gráfico de repetición (║:) que ya usa
  // generarEstructuraPDF (dibujarIconoRepeticion, v1.29.2) — duplicado
  // tal cual acá porque es función local allá, no accesible desde este
  // archivo/función. Antes "se repite xN" en el PDF de percusión era
  // solo texto itálico, sin el símbolo gráfico que sí tiene el PDF de
  // acordes para lo mismo. Cero cambio en generarEstructuraPDF.
  const dibujarIconoRepeticionPercusion = (x, yBase) => {
    doc.setFillColor(120, 120, 120);
    doc.rect(x, yBase - 3, 0.8, 3.2, 'F');
    doc.rect(x + 1.4, yBase - 3, 0.3, 3.2, 'F');
    doc.circle(x + 2.6, yBase - 2.2, 0.35, 'F');
    doc.circle(x + 2.6, yBase - 0.8, 0.35, 'F');
    return 4.2;
  };
  // v1.86: (a pedido) marco completo izq.+der. con puntos, idéntico a
  // dibujarBarraRepeticion de generarEstructuraPDF (línea ~1265-1288) —
  // duplicado tal cual, mismo motivo que dibujarIconoCoda/dibujarPatronRitmico
  // arriba. Reemplaza a dibujarBarraCierreSeccion (v1.79/v1.81, solo lado
  // derecho, se dibujaba en TODA sección): ahora, mismo criterio que
  // acordes, el marco completo solo se dibuja en fija-bloque con
  // repeticiones>1 — Vamp y secciones sin repetición no llevan marco
  // (en acordes, Vamp solo tiene el iconito "║:" antes del texto "se
  // repite...", sin marco a los costados de las cajas).
  const dibujarBarraRepeticionPercusion = (yBloqueInicio, alto, anchoBloque, opciones) => {
    opciones = opciones || {};
    const ox = opciones.offsetX || 0;
    const ancho = anchoBloque != null ? anchoBloque : anchoUtil;
    const grosor = 1.2;
    doc.setFillColor(20, 20, 20);
    doc.rect(margen + ox - 4.4, yBloqueInicio, grosor, alto, 'F');
    doc.rect(margen + ox - 2.4, yBloqueInicio, 0.4, alto, 'F');
    doc.rect(margen + ox + ancho + 3.2, yBloqueInicio, grosor, alto, 'F');
    doc.rect(margen + ox + ancho + 2.0, yBloqueInicio, 0.4, alto, 'F');
    const yc = yBloqueInicio + alto / 2;
    doc.circle(margen + ox - 0.85, yc - 1.2, 0.35, 'F');
    doc.circle(margen + ox - 0.85, yc + 1.2, 0.35, 'F');
    doc.circle(margen + ox + ancho + 0.85, yc - 1.2, 0.35, 'F');
    doc.circle(margen + ox + ancho + 0.85, yc + 1.2, 0.35, 'F');
  };
  // v1.88: (a pedido) corchete "1."/"2." de casilla, duplicado tal cual
  // de dibujarCorcheteCasilla (generarEstructuraPDF, línea ~1310) — mismo
  // motivo que el resto de los helpers ya duplicados acá. Se usa cuando
  // la 2da vez de percusión entra en horizontal (pegada a la 1ra vez) o
  // alineada verticalmente bajo la columna que reemplaza.
  const dibujarCorcheteCasillaPercusion = (yBloqueInicio, numero, xInicio, ancho) => {
    xInicio = xInicio != null ? xInicio : margen;
    ancho = ancho != null ? ancho : anchoUtil;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(20);
    doc.text(numero + '.', xInicio + 1.5, yBloqueInicio - 3.3);
    doc.setDrawColor(20); doc.setLineWidth(0.3);
    doc.line(xInicio, yBloqueInicio, xInicio, yBloqueInicio - 1.5);
    doc.line(xInicio, yBloqueInicio - 1.5, xInicio + ancho, yBloqueInicio - 1.5);
  };
  // Ancho real ocupado por la última fila de `total` cajas — mismo
  // cálculo que usa dibujarCajasPercusion para decidir cuándo saltar de
  // fila, pero acá solo para saber dónde termina la última fila.
  const anchoUltimaFilaPercusion = (total) => (((total - 1) % POR_FILA) + 1) * cajaAncho;


  // (select "Instrumento") — si un valor no está en esta lista, se
  // asume que viene de "Otro…"/'__otro__' y se muestra
  // s.instrumentoPercusionOtro en su lugar.
  const INSTRUMENTOS_PERCUSION_FIJOS = ['Congas','Bongó','Campana','Timbal','Güiro','Maracas','Clave','Kick/Drum','Todos/Tutti'];
  // v1.79: (a pedido) guia-practica.html v1.78 cambió el select de
  // instrumento (valor único) a checkboxes de selección múltiple —
  // s.instrumentoPercusion ahora es un array de strings (varios
  // instrumentos por sección, ej. Conga+Bongó+Güiro). Esta función
  // soporta AMBOS formatos a propósito, sin depender de que el editor
  // ya haya "migrado" el dato: si el PDF se genera sobre una sección
  // vieja que nunca se volvió a abrir en el editor (sigue con el string
  // suelto de antes de v1.78), igual se muestra bien. Varios
  // instrumentos se listan juntos separados por coma, en una sola
  // línea — mismo criterio de "lo primero que ve el percusionista" que
  // ya se usa para "se repite xN".
  const textoInstrumentoPercusion = (s) => {
    const lista = Array.isArray(s.instrumentoPercusion) ? s.instrumentoPercusion : (s.instrumentoPercusion ? [s.instrumentoPercusion] : []);
    const nombres = lista.map(v => {
      if(INSTRUMENTOS_PERCUSION_FIJOS.includes(v)) return v;
      if(v === '__otro__' || v) return (s.instrumentoPercusionOtro || '').trim();
      return '';
    }).filter(Boolean);
    // Object.fromEntries + Object.keys evita duplicar "Otro" si por
    // algún motivo quedaran 2 marcas de __otro__/valor-libre juntas.
    return Array.from(new Set(nombres)).join(', ');
  };

  // v1.81: (a pedido) contador global de compás + resumen "c.#X-c.#Y" en
  // la barra de título — mismo criterio/cálculo que ya usa
  // generarEstructuraPDF (v1.45/v1.70), duplicado acá porque son
  // variables locales allá. compasGlobal arranca en 1 y avanza sumando
  // s.duracion de cada sección en orden; si una sección no tiene fin de
  // tiempo definido (duracion null), el conteo deja de ser confiable de
  // ahí en adelante (contadorGlobalValido=false) y las siguientes no
  // muestran resumen hasta que se complete esa sección y se reexporte.
  // v1.101: (a pedido, FIX real — reemplaza el criterio de v1.100) la
  // anacrusa ya NO le resta un número al contador — pasa a ser una caja
  // aparte, sin "#N" (ver bloque Vamp más abajo), así que el contador
  // vuelve a arrancar siempre en 1.
  let compasGlobal = 1;
  let contadorGlobalValido = true;

  // v1.83: (a pedido) Coda/D.C./D.S. heredado de generarEstructuraPDF —
  // nombresYaImpresos trackea qué secciones ya se dibujaron completas
  // (por id o nombre) para saber si una repetición posterior puede
  // imprimirse como referencia corta en vez de repetir todo el cuadro.
  const nombresYaImpresos = new Set();
  // Ícono círculo+cruz de coda, duplicado tal cual de generarEstructuraPDF
  // (dibujarIconoCoda) porque esta función vive aparte y no puede
  // llamarla directamente — mismo criterio que el resto de los helpers
  // ya duplicados acá (ver comentario de cabecera del archivo).
  const dibujarIconoCoda = (x, yBase, colorRGB) => {
    const [r,g,b] = colorRGB || [120,120,120];
    doc.setDrawColor(r, g, b); doc.setLineWidth(0.3);
    doc.circle(x + 1.6, yBase - 1.6, 1.6, 'S');
    doc.line(x + 1.6, yBase - 3.4, x + 1.6, yBase + 0.2);
    doc.line(x - 0.2, yBase - 1.6, x + 3.4, yBase - 1.6);
    return 4.4;
  };

  // v1.84: (a pedido) patrón rítmico de Break/Corte, heredado tal cual de
  // generarEstructuraPDF (dibujarIconoAcentoBreak, parsearPatronRitmico,
  // aplanarColumnasPatron, pesoTotalPatron, calcularColsYXInfo,
  // dibujarPatronRitmico — líneas ~1352-1667 de esa función). Duplicado
  // acá completo, sin cambiar una sola línea de la lógica de dibujo, por
  // el mismo motivo que dibujarIconoCoda arriba: son funciones locales de
  // generarEstructuraPDF, esta función no puede llamarlas directamente.
  const dibujarIconoAcentoBreak = (x, yBase) => {
    doc.setDrawColor(20, 20, 20); doc.setLineWidth(0.5);
    doc.line(x, yBase - 2.2, x + 1.7, yBase - 1.1);
    doc.line(x + 1.7, yBase - 1.1, x, yBase - 0.0);
    return 2.6;
  };
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
        // v1.95: (a pedido, puesto al día con guia-practica.html v1.96-98)
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
        // v1.95: "," (silencio de negra) y "n"/"N" (golpe de negra) pesan
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
  // v1.94: (a pedido) 6to parámetro `escala` — puesto al día con
  // pdf-armonias.js v1.94-v1.97 (ver ahí el detalle de cada fix). Toda
  // la función escala junto con `sc`; sin pasar el parámetro (como sigue
  // llamándola Break/Corte, más abajo) sc=1 y el resultado es idéntico
  // al de antes de v1.94.
  const dibujarPatronRitmico = (patron, xStart, ancho, yBase, compases, escala) => {
    const { cols, xInfo } = calcularColsYXInfo(patron, xStart, ancho);
    if(!cols.length) return 0;
    const n = cols.length;
    const sc = escala || 1;
    const altoPlica = 6 * sc;
    // v1.95: "n"/"N" (golpe de negra) también son nota (cabeza+plica),
    // pero NO entran a esBeamable — nunca les sale corchete ni bandera
    // (una negra real no lleva gancho), mismo criterio que
    // patronRitmicoSVG v1.98 en guia-practica.html.
    const esNota = (t) => t === 'x' || t === 'X' || t === '-' || t === 'n' || t === 'N';
    const esBeamable = (t) => t === 'x' || t === 'X';
    doc.setDrawColor(20); doc.setLineWidth(0.25 * sc);
    doc.line(xStart, yBase, xStart + ancho, yBase);
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
    const dibujarSilencio = (x) => {
      doc.setDrawColor(150, 150, 150); doc.setLineWidth(0.45 * sc);
      const yc = yBase + 2 * sc;
      doc.line(x - 1.1 * sc, yc - 1.6 * sc, x + 0.9 * sc, yc + 0.5 * sc);
      doc.line(x + 0.9 * sc, yc + 0.5 * sc, x - 0.3 * sc, yc + 1.8 * sc);
      doc.setDrawColor(20);
    };
    // v1.95: (a pedido) silencio de NEGRA — símbolo distinto al de
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
    for(let j = 0; j < n; j++){
      const col = cols[j];
      if(col.caracter === '.') dibujarSilencio(xInfo[j].xCentro);
      else if(col.caracter === ',') dibujarSilencioNegra(xInfo[j].xCentro);
      else if(col.caracter === '-' && j > 0) dibujarLigado(xInfo[j - 1].xCentro, xInfo[j].xCentro);
    }
    for(let j = 0; j < n; j++){
      const col = cols[j];
      if(!esNota(col.caracter)) continue;
      const xj = xInfo[j].xCentro;
      const r = (col.grupo ? 0.55 : 0.9) * sc;
      const xPlica = xj + r;
      doc.circle(xj, yBase, r, 'F');
      doc.setLineWidth(0.28 * sc);
      doc.line(xPlica, yBase, xPlica, yBase - altoPlica);
      if(col.caracter === 'X' || col.caracter === 'N'){
        // v1.95: "N" (golpe de negra acentuado) dispara el mismo acento.
        // v1.94: piso propio (scAcento) solo para las medidas del ícono
        // — a escala 1 no cambia nada, en miniatura (0.4) no se achica
        // más allá de un tamaño legible. Mismo criterio que armonías.
        const scAcento = Math.max(sc, 0.65);
        const ax = xPlica - 0.32 * scAcento, ay = yBase - altoPlica - 1.4 * sc - 1;
        doc.setDrawColor(20, 20, 20); doc.setLineWidth(0.34 * scAcento);
        doc.line(ax, ay - 0.83 * scAcento, ax + 0.64 * scAcento, ay - 0.42 * scAcento);
        doc.line(ax + 0.64 * scAcento, ay - 0.42 * scAcento, ax, ay - 0.0);
      }
    }
    let j = 0;
    while(j < n){
      const col = cols[j];
      if(col.grupo){
        const size = col.grupo.size;
        let jFin = j;
        while(jFin < n && cols[jFin].grupo && cols[jFin].grupo.idx < size) jFin++;
        const idxGolpes = [];
        for(let k = j; k < jFin; k++) if(esBeamable(cols[k].caracter)) idxGolpes.push(k);
        if(idxGolpes.length >= 2){
          const rIni = (cols[idxGolpes[0]].grupo ? 0.55 : 0.9) * sc;
          const rFin = (cols[idxGolpes[idxGolpes.length - 1]].grupo ? 0.55 : 0.9) * sc;
          const xIni = xInfo[idxGolpes[0]].xCentro + rIni;
          const xFin = xInfo[idxGolpes[idxGolpes.length - 1]].xCentro + rFin;
          doc.setLineWidth(0.75 * sc);
          doc.line(xIni, yBase - altoPlica, xFin, yBase - altoPlica);
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
    return altoPlica + 7;
  };

  secciones.forEach((s, idxSeccion) => {
    const compasGlobalInicio = contadorGlobalValido ? compasGlobal : null;
    const esCoda = s.origenId && !s.esVariacion && s.modoRepeticionPDF === 'coda' && nombresYaImpresos.has(s.origenId);
    // v1.90 (FIX): declarada ACÁ, al ppio. del forEach de cada sección —
    // no adentro del bloque que dibuja la grilla — porque el avance final
    // de la sección (más abajo, y += ... ultimaHayNotasPercusion ...)
    // vive FUERA de ese bloque. Declarada adentro quedaba fuera de scope
    // ahí y tiraba "ultimaHayNotasPercusion is not defined", rompiendo el
    // botón completo (todo el script deja de ejecutar si una función
    // tira una excepción sin capturar).
    let ultimaHayNotasPercusion = false;
    asegurarEspacio(calcularAltoSeccionPercusion(s));
    const color = s.color;
    const rgb = [parseInt(color.slice(1,3),16), parseInt(color.slice(3,5),16), parseInt(color.slice(5,7),16)];
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.rect(margen, y, anchoUtil, 7, 'F');
    // v1.78: (a pedido) si la sección está marcada "🔔 Sección de
    // campana" (s.esCampana, guia-practica.html v1.77), se agrega un
    // marco dorado alrededor de la barra de título para que salte a la
    // vista sin tener que leer el texto. Puramente visual — no cambia
    // ningún cálculo de alto/ancho, se dibuja encima del rect ya pintado.
    if(s.esCampana){
      doc.setDrawColor(200, 160, 40); doc.setLineWidth(0.6);
      doc.rect(margen, y, anchoUtil, 7);
    }
    doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
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
    const duracionTxt = (s.duracion != null && s.duracion > 0) ? ' · ' + s.duracion + ' comp.' : '';
    // v1.83: (a pedido) misma etiqueta D.C./D.S. que ya usa
    // generarEstructuraPDF (línea ~1970-1974) — texto "(D.C.)" simple,
    // "(D.C. — variación: ...)" si esVariacion, o nada si esCoda (ese caso
    // usa el ícono + "D.S. al Coda" en vez de texto entre paréntesis).
    const etiquetaDC = s.origenId
      ? (s.esVariacion
          ? ` (D.C. — variación${(s.notaVariacion || '').trim() ? ': ' + s.notaVariacion.trim() : ''})`
          : (esCoda ? '' : ' (D.C.)'))
      : '';
    doc.text(s.nombre + etiquetaDC + duracionTxt, xTexto, y + 5);
    let xLibre = xTexto + doc.getTextWidth(s.nombre + etiquetaDC + duracionTxt) + 3;
    if(esCoda){
      const xIcono = xLibre;
      dibujarIconoCoda(xIcono, y + 5.5, [255, 255, 255]);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      doc.text('D.S. al Coda', xIcono + 5.5, y + 5);
      xLibre = xIcono + 5.5 + doc.getTextWidth('D.S. al Coda') + 3;
      doc.setFontSize(10);
    }
    // v1.78: (a pedido) badge "CAMPANA" en texto (nada de emoji — mismo
    // criterio que dibujarIconoRepeticion/dibujarIconoCoda, jsPDF+
    // helvetica no rinde bien unicode de campana) pegado después del
    // nombre, mismo dorado que el marco de arriba.
    if(s.esCampana){
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
      doc.setTextColor(255, 240, 200);
      doc.text('CAMPANA', xLibre, y + 5);
      xLibre += doc.getTextWidth('CAMPANA') + 3;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.setTextColor(255);
    }
    // v1.83: (a pedido) compás override (s.compasOverride, ej. "· 3/4")
    // heredado de generarEstructuraPDF (línea ~2015) — se calcula el
    // texto/ancho ACÁ (antes de dibujarlo) para poder reservarle su
    // espacio a la nota de sección, igual que en acordes. Dibujo real más
    // abajo, a la izquierda de instrumento+resumen.
    const compasTxt = (s.compasOverride || '').trim() ? '· ' + s.compasOverride.trim() : '';
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    const anchoCompas = compasTxt ? doc.getTextWidth(compasTxt) + 4 : 0;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    // Nota de sección inline (mismo criterio de "auto-ajuste + recorte"
    // que generarEstructuraPDF, versión resumida).
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
      }
    }
    if(compasTxt){
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(255);
      doc.text(compasTxt, margen + anchoUtil - 2, y + 5, { align: 'right' });
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    }
    // v1.78: instrumento de la sección (s.instrumentoPercusion/
    // instrumentoPercusionOtro, guia-practica.html v1.77) — alineado a la
    // derecha de la barra de título.
    const instrumentoTxt = textoInstrumentoPercusion(s);
    let anchoInstrumentoTxt = 0;
    if(instrumentoTxt){
      doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
      doc.setTextColor(255);
      doc.text(instrumentoTxt, margen + anchoUtil - 2 - anchoCompas, y + 5, { align: 'right' });
      anchoInstrumentoTxt = doc.getTextWidth(instrumentoTxt) + 4;
    }
    // v1.81: (a pedido) resumen "c.#X-c.#Y" — mismo dato/estilo que ya
    // usa generarEstructuraPDF (v1.70: blanco, itálica, opacidad
    // reducida), corrido a la izquierda del texto de instrumento para no
    // pisarlo si ambos están presentes.
    if(compasGlobalInicio != null && s.duracion != null && s.duracion > 0){
      const finResumen = compasGlobalInicio + s.duracion - 1;
      const resumenTxt = 'c.#' + compasGlobalInicio + (finResumen !== compasGlobalInicio ? '-c.#' + finResumen : '');
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.75 }));
      doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(255);
      doc.text(resumenTxt, margen + anchoUtil - 2 - anchoCompas - anchoInstrumentoTxt, y + 5, { align: 'right' });
      doc.restoreGraphicsState();
      doc.setFont('helvetica', 'normal'); doc.setTextColor(255);
    }
    y += 7 + 3;
    doc.setTextColor(20);
    nombresYaImpresos.add(s.id || s.nombre);

    // v1.93: (a pedido) clave por sección (s.claveSeccion) — línea
    // propia debajo de la barra de título, "2" fijo de compases (ciclo
    // de clave).
    // v1.94: puesta al día con generarEstructuraPDF (pdf-armonias.js)
    // v1.94-v1.97 — miniatura real (escala 0.4, ancho 30% de anchoUtil,
    // alineada a la izquierda) en vez de tamaño completo, + timing/
    // compás (s.compasOverride o compasTexto general) en notación
    // apilada (numerador arriba/denominador abajo) al comienzo del
    // renglón, con fontSize calculado según el alto real de la
    // miniatura (mismo criterio que armonías, evita el bloque de texto
    // "descolgado" de un fontSize fijo sin relación a la miniatura).
    if((s.claveSeccion || '').trim()){
      const timingTxt = (s.compasOverride || compasTexto || '').trim();
      // v1.96: (a pedido) subtítulo propio arriba de la miniatura —
      // "Clave de sección X/Y" (el compás como texto plano, no la
      // fracción apilada gráfica que ya se dibuja más abajo junto al
      // patrón). Chico e itálico, gris, para no competir con el nombre
      // de la sección. +4mm de alto reservado (ver extraClave, ahora 19
      // en vez de 15) para que entre sin pisar el patrón de abajo.
      y += 8;
      const tituloClave = 'Clave de sección' + (timingTxt ? ' ' + timingTxt : '');
      doc.setFont('helvetica', 'italic'); doc.setFontSize(6.5); doc.setTextColor(90, 90, 90);
      doc.text(tituloClave, margen, y);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(20);
      y += 4.5;
      let xClave = margen;
      if(timingTxt){
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
      dibujarPatronRitmico(s.claveSeccion, xClave, anchoUtil * 0.3, y, 2, 0.4);
      y += 6;
    }

    // v1.83: modo coda — no re-dibuja el cuadro completo, solo remite a
    // la primera aparición (mismo criterio y texto que generarEstructuraPDF
    // línea ~2087). El contador global de compás sigue avanzando igual al
    // final del forEach (ya estaba así antes de este cambio), así que las
    // secciones siguientes no se desfasan.
    // v1.89: (a pedido) FIX — margen excesivo después de "se repite...".
    // Este flag trackea si lo ÚLTIMO dibujado en la sección fue una línea
    // de texto (con su propio aire ya incluido) en vez de una fila de
    // cajas — al final del forEach se usa para no sumarle ENCIMA otro
    // "cajaAlto+4" completo (pensado para dejar aire debajo de una FILA
    // de cajas, no de una línea de texto). Default false = comportamiento
    // de siempre (último elemento fue una grilla).
    let ultimoElementoEsTexto = false;
    if(esCoda){
      doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
      doc.text('Ver primera aparición arriba.', margen, y);
      y += 6; doc.setTextColor(20);
    } else {
    const esBreak = s.nombre === 'Break/Corte';
    if(esBreak){
      // v1.84: (a pedido) Break/Corte dibuja el patrón rítmico
      // (dibujarPatronRitmico) en vez de la grilla genérica — mismo
      // criterio que dibujarCajaBreak en generarEstructuraPDF, versión
      // sin acordes (esta guía no los muestra): nota de tiempo
      // (notaTiempoCorte) arriba si está cargada, patrón debajo.
      const totalCajasBreak = totalCajasSeccionPercusion(s);
      const notaTxt = (s.notaTiempoCorte || '').trim();
      if(notaTxt){
        doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(120);
        doc.text('(' + notaTxt + ')', margen, y);
        doc.setTextColor(20);
      }
      y += 6;
      if((s.patronRitmico || '').trim()){
        y += 4;
        dibujarPatronRitmico(s.patronRitmico, margen, anchoUtil, y, totalCajasBreak);
        y += 6;
      }
    } else {

    // v1.76: helper local — mismo dibujo de caja que antes (grilla +
    // nota de percusión + regla de acento), ahora reutilizable para el
    // pase normal, el ciclo de Vamp y el bloque de 2da vez. No dibuja el
    // +4 de cierre de bloque — eso lo maneja el llamador entre bloques y
    // al final de la sección.
    // v1.88: (a pedido) numInicio (1-based) se reemplaza por colInicio/
    // labelInicio (0-based, mismo patrón que dibujarCajas de acordes,
    // línea ~1175) + opciones — necesario para la 2da vez horizontal:
    //  - colInicio: columna real donde arranca a dibujarse (posición en
    //    la grilla). Antes siempre arrancaba en columna 0.
    //  - labelInicio: número real de compás - 1 de la primera caja (para
    //    que "c.N" muestre el compás real que reemplaza, sea cual sea la
    //    columna donde se dibuja). Por defecto = colInicio (mismo
    //    comportamiento que antes: numInicio = colInicio+1).
    //  - opciones.yBase: y de arranque del bloque (default: y corrido).
    //  - opciones.sinAvanzarY: si true, dibuja en yBase sin tocar el y
    //    corrido (para la 2da vez horizontal, que va en la MISMA fila que
    //    la 1ra vez, ya dibujada).
    //  - opciones.compasGlobalInicioOverride: para el "#N", usa este
    //    valor en vez de compasGlobalInicio (2da vez: compasGlobalInicio
    //    + (repeticiones-1)*totalCajas — mismo cálculo que acordes).
    // Los 2 llamados que ya existían (pase principal con numInicio=1,
    // 2da vez apilada con numInicio=totalCajas-finalN+1) quedan
    // idénticos visualmente: colInicio=0/labelInicio=0 y
    // colInicio=0/labelInicio=totalCajas-finalN respectivamente.
    // v1.90: guarda si la última grilla dibujada (no forzada, es decir la
    // que sí avanza `y`) reservó tira de notas — para que el espaciado
    // que viene después (barra de repetición, lista de vueltas del Vamp,
    // texto "se repite...", avance final de la sección) sepa si tiene que
    // sumar notaFilaAlto o no. La actualiza dibujarCajasPercusion cada vez
    // que dibuja sin sinAvanzarY (declarada arriba, al ppio. del forEach).
    const dibujarCajasPercusion = (notas, acentos, total, colInicio, labelInicio, opciones) => {
      opciones = opciones || {};
      colInicio = colInicio || 0;
      labelInicio = labelInicio != null ? labelInicio : colInicio;
      const yBase = opciones.yBase != null ? opciones.yBase : y;
      const compasBase = opciones.compasGlobalInicioOverride != null ? opciones.compasGlobalInicioOverride : compasGlobalInicio;
      // v1.92: (a pedido) 2 fuentes de nota por compás en simultáneo:
      //  - `notas` (percusión: notasPercusionPorCompas/Ciclo/Final2) vuelve
      //    a vivir ADENTRO de la caja, negro/negrita — es la info principal
      //    para el percusionista ("repique de bongó", "solo kick").
      //  - `opciones.notasArmonia` (la misma notasPorCompas/notasCiclo/
      //    notasFinal2 que ya se ve en el PDF de acordes) pasa a su propia
      //    tira ARRIBA de la caja, itálica/naranja — contexto general del
      //    tema, igual estilo que dibujarCajas en generarEstructuraPDF.
      // hayNotas (si se reserva la tira de arriba) se decide por
      // notasArmonia, no por `notas` — la de percusión ya no necesita
      // alto extra porque va adentro. opciones.hayNotasForzado sigue
      // permitiendo heredar el valor del bloque principal para la 2da vez
      // horizontal (mismo patrón que hayNotasForzado en dibujarCajas).
      const notasArmonia = opciones.notasArmonia || [];
      const hayNotas = opciones.hayNotasForzado != null ? opciones.hayNotasForzado : hayContenido(notasArmonia);
      let filaAnterior = -1;
      let yLocal = yBase;
      for(let j = 0; j < total; j++){
        const posGlobal = j + colInicio;
        const posLabel = j + labelInicio;
        const fila = Math.floor(posGlobal / POR_FILA);
        const col = posGlobal % POR_FILA;
        if(fila !== filaAnterior){
          if(filaAnterior !== -1) yLocal += cajaAlto + (hayNotas ? notaFilaAlto : 0) + 2;
          filaAnterior = fila;
        }
        const x = margen + col * cajaAncho + ((opciones.gapDesdeColumna != null && col >= opciones.gapDesdeColumna) ? (opciones.gapMm || 0) : 0) + ((opciones.gapDesdeColumna2 != null && col >= opciones.gapDesdeColumna2) ? (opciones.gapMm2 || 0) : 0);
        const yCaja = yLocal + (hayNotas ? notaFilaAlto : 0);
        if(!opciones.sinAvanzarY){ y = yLocal; ultimaHayNotasPercusion = hayNotas; }
        if(hayNotas){
          const notaArmoniaTxt = (notasArmonia[j] || '').trim();
          if(notaArmoniaTxt){
            doc.setFont('helvetica', 'italic'); doc.setFontSize(6.5); doc.setTextColor(180, 120, 40);
            const notaCorta = notaArmoniaTxt.length > 22 ? notaArmoniaTxt.slice(0, 21) + '…' : notaArmoniaTxt;
            doc.text(notaCorta, x + cajaAncho / 2, yLocal + notaFilaAlto - 1.3, { align: 'center' });
            doc.setTextColor(20);
          }
        }
        doc.setDrawColor(200); doc.setLineWidth(0.2);
        doc.rect(x, yCaja, cajaAncho, cajaAlto);
        // v1.77: (a pedido) "c.N" pasa de 7pt gris150 (casi invisible en
        // la hoja impresa) a 9pt negrita gris70 — es el dato básico que
        // el percusionista necesita ver aunque la caja esté vacía.
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
        doc.setTextColor(70);
        // v1.100: (a pedido) mismo fix que pdf-armonias.js v1.103 —
        // opciones.esAnacrusa (solo j===0) muestra "Anacrusa" en vez de
        // "c.1" y se salta el "#N" (ver más abajo).
        const esCajaAnacrusaPercusion = !!(opciones.esAnacrusa && j === 0);
        doc.text(esCajaAnacrusaPercusion ? 'Anacrusa' : ('c.' + (posLabel + 1)), x + 2, yCaja + 5);
        // v1.82: (a pedido) mismo contador global "#N" que ya usa
        // generarEstructuraPDF (línea ~1182) — misma fórmula relativa
        // (compasBase + posLabel, mismo criterio que "opciones.
        // compasGlobalInicio + posLabel" de dibujarCajas) y mismo estilo
        // discreto (6pt, gris170).
        if(compasBase != null && !esCajaAnacrusaPercusion){
          // v1.4: (a pedido) mismo fix que pdf-armonias.js v1.100 — si
          // opciones.numerosGlobales[j] viene definido, usa ese valor en
          // vez de "compasBase + posLabel" (lineal). Hace falta para vamp
          // con sobra: esa caja NO es la posición j del ciclo, es un
          // compás que ocurre DESPUÉS de las vueltas completas.
          const numeroGlobalPercusion = (opciones.numerosGlobales && opciones.numerosGlobales[j] != null)
            ? opciones.numerosGlobales[j]
            : (compasBase + posLabel);
          doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(170);
          doc.text('#' + numeroGlobalPercusion, x + cajaAncho - 1.5, yCaja + 4, { align: 'right' });
          doc.setTextColor(20);
        }
        // v1.92: nota de PERCUSIÓN — vuelve adentro de la caja (info
        // principal), negro/negrita, mismo estilo/límite que tenía antes
        // de v1.90 (26 caracteres, 7.5pt).
        const notaPercusionTxt = (notas[j] || '').trim();
        if(notaPercusionTxt){
          doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
          doc.setTextColor(20);
          const notaPercusionCorta = notaPercusionTxt.length > 26 ? notaPercusionTxt.slice(0, 25) + '…' : notaPercusionTxt;
          doc.text(notaPercusionCorta, x + cajaAncho / 2, yCaja + 8, { align: 'center', maxWidth: cajaAncho - 4 });
        }

        const tVal = acentos[j] || '';
        const idxTiempo = TIEMPOS_PERCUSION.indexOf(tVal);
        if(idxTiempo !== -1){
          const reglaAncho = cajaAncho * 0.8;
          const reglaX0 = x + (cajaAncho - reglaAncho) / 2;
          const pasoTiempo = reglaAncho / (TIEMPOS_PERCUSION.length - 1);
          const reglaY = yCaja + cajaAlto - 2;
          doc.setDrawColor(160);
          TIEMPOS_PERCUSION.forEach((t, ti) => {
            const tx = reglaX0 + ti * pasoTiempo;
            const esFuerte = ti % 4 === 0; // tiempos 1-2-3-4 vs. e/&/a
            doc.setLineWidth(esFuerte ? 0.35 : 0.2);
            doc.line(tx, reglaY, tx, reglaY - (esFuerte ? 1.4 : 0.7));
          });
          doc.setLineWidth(0.2);
          doc.setFillColor(20, 20, 20);
          doc.circle(reglaX0 + idxTiempo * pasoTiempo, reglaY - 1.8, 0.6, 'F');
        }
      }
    };

    const esVamp = s.tipo === 'vamp';
    const esBreak = s.nombre === 'Break/Corte';
    const totalCajas = totalCajasSeccionPercusion(s);
    // v1.88: (a pedido) datos de la 2da vez calculados ACÁ arriba (mismo
    // criterio que generarEstructuraPDF v1.42/v1.43: alineable/
    // cabeHorizontal se necesitan ANTES de dibujar la grilla principal,
    // para reservar aire si va a llevar corchete "1." encima).
    const repeticionesPercusion = s.repeticiones || 1;
    const finalNPercusion = Math.min(totalCajas || 1, s.finalDistintoN || 1);
    const hay2da = hay2daSeccionPercusion(s, totalCajas);
    const alineablePercusion = !esVamp && totalCajas <= POR_FILA;
    const colLibreDesdePercusion = totalCajas % POR_FILA;
    const libresPercusion = colLibreDesdePercusion === 0 ? 0 : POR_FILA - colLibreDesdePercusion;
    const cabeHorizontalPercusion = alineablePercusion && libresPercusion >= finalNPercusion;
    const colReemplazoPercusion = alineablePercusion ? (totalCajas - finalNPercusion) : 0;
    const xReemplazoPercusion = margen + colReemplazoPercusion * cajaAncho;
    const anchoReemplazoPercusion = finalNPercusion * cajaAncho;

    // v1.88: mismo aire reservado que generarEstructuraPDF (v1.42/v1.44)
    // arriba del bloque cuando la 2da vez va a llevar corchete "1."
    // encima de la 1ra vez — sin esto, el corchete pisa la franja de
    // color del título de la sección.
    if(alineablePercusion && hay2da) y += 5;

    if(esVamp && totalCajas <= 0){
      doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
      doc.text('Definí el ciclo de compases arriba para ver las cajas acá.', margen, y);
      doc.setTextColor(20);
    } else {
      const notas = esVamp
        ? (Array.isArray(s.notasPercusionCiclo) ? s.notasPercusionCiclo : [])
        : (Array.isArray(s.notasPercusionPorCompas) ? s.notasPercusionPorCompas : []);
      const acentos = esVamp
        ? (Array.isArray(s.acentosCiclo) ? s.acentosCiclo : [])
        : (Array.isArray(s.acentosPorCompas) ? s.acentosPorCompas : []);
      // v1.92: (a pedido) nota de ARMONÍA (la misma que ya se ve en el PDF
      // de acordes) para la tira de arriba — en simultáneo con la nota de
      // percusión (adentro de la caja, ver dibujarCajasPercusion).
      const notasArmonia = esVamp
        ? (Array.isArray(s.notasCiclo) ? s.notasCiclo : [])
        : (Array.isArray(s.notasPorCompas) ? s.notasPorCompas : []);
      const yGridVamp = y;
      // v1.3: (a pedido) mismo fix que pdf-armonias.js v1.3 — si
      // `duracion` no es múltiplo exacto de `totalCajas` (el ciclo, en
      // Vamp), el compás sobrante no se dibujaba en ningún lado. Se
      // arma un array extendido (repite los primeros `sobra` valores
      // del ciclo, mismo contenido real) y se dibuja como una sola
      // grilla de `totalCajas+sobra` cajas.
      const duracionVampPercusion = esVamp ? (s.duracion || totalCajas) : totalCajas;
      const sobraPercusion = esVamp ? Math.max(0, duracionVampPercusion - Math.max(1, Math.floor(duracionVampPercusion / totalCajas)) * totalCajas) : 0;
      const notasConSobraPercusion = sobraPercusion > 0 ? notas.concat(notas.slice(0, sobraPercusion)) : notas;
      const acentosConSobraPercusion = sobraPercusion > 0 ? acentos.concat(acentos.slice(0, sobraPercusion)) : acentos;
      const notasArmoniaConSobraPercusion = sobraPercusion > 0 ? notasArmonia.concat(notasArmonia.slice(0, sobraPercusion)) : notasArmonia;
      // v1.4: (a pedido) mismo fix que pdf-armonias.js v1.100 — arma acá
      // el array numerosGlobales que pasa a dibujarCajasPercusion (ver
      // arriba): columnas del ciclo (0..totalCajas-1) siguen el cálculo
      // lineal de siempre; la(s) columna(s) sobrante(s) usan
      // compasGlobalInicio + vueltasCompletasPercusion*totalCajas + offset,
      // porque esa caja ocurre DESPUÉS de las vueltas completas del ciclo,
      // no en la posición j del ciclo.
      const vueltasCompletasPercusion = Math.max(1, Math.floor(duracionVampPercusion / totalCajas));
      const numerosGlobalesVampPercusion = compasGlobalInicio != null
        ? Array.from({ length: totalCajas + sobraPercusion }, (_, j) => j < totalCajas
            ? compasGlobalInicio + j
            : compasGlobalInicio + vueltasCompletasPercusion * totalCajas + (j - totalCajas))
        : undefined;
      // v1.101: (a pedido, FIX real — mismo criterio que pdf-armonias.js
      // v1.104) con anacrusa Y Vamp, la caja "Anacrusa" pasa a dibujarse
      // aparte (columna propia, fuera de `totalCajas`/`sobraPercusion`),
      // en vez de ocupar la columna 0 del ciclo (v1.100, que hacía que el
      // motor de repetición la tratara como parte del ciclo que se
      // repite). Fija-bloque (no-Vamp) sigue igual que antes (v1.100):
      // ahí la anacrusa en columna 0 no entra en ningún cálculo modular.
      const conAnacrusaVampPercusion = !!(datos.anacrusa && idxSeccion === 0 && esVamp);
      const colInicioCicloPercusion = conAnacrusaVampPercusion ? 1 : 0;
      if(conAnacrusaVampPercusion){
        dibujarCajasPercusion([], [], 1, 0, 0, { esAnacrusa: true, sinAvanzarY: true });
      }
      const anacrusaGapMmPercusion = conAnacrusaVampPercusion ? 6 : 0;
      dibujarCajasPercusion(notasConSobraPercusion, acentosConSobraPercusion, totalCajas + sobraPercusion, colInicioCicloPercusion, 0, { notasArmonia: notasArmoniaConSobraPercusion, numerosGlobales: numerosGlobalesVampPercusion, gapDesdeColumna: conAnacrusaVampPercusion ? colInicioCicloPercusion : undefined, gapMm: anacrusaGapMmPercusion, gapDesdeColumna2: sobraPercusion > 0 ? totalCajas + colInicioCicloPercusion : undefined, gapMm2: 6, esAnacrusa: datos.anacrusa && idxSeccion === 0 && !esVamp });
      // v1.85: (a pedido) lista de "próximas repeticiones" en Vamp
      // (#N chico bajo cada caja del ciclo), heredada de
      // generarEstructuraPDF (línea ~2130-2152) — mismo cálculo
      // (compasGlobalInicio + columna + k*ciclo), máximo 3 líneas visibles
      // por columna, mismo estilo (6pt gris170). Se dibuja bajo la
      // PRIMERA fila del ciclo (yGridVamp + cajaAlto), mismo límite de
      // columnas visibles (min(ciclo,POR_FILA)) que acordes.
      if(esVamp && compasGlobalInicio != null){
        const vueltasVampLista = Math.max(0, Math.floor((s.duracion || totalCajas) / totalCajas) - 1);
        if(vueltasVampLista > 0){
          const maxLineasVamp = 3;
          // v1.87: (a pedido, FIX) la lista va DENTRO de la caja, pegada
          // justo abajo del label "#N" (mismo criterio que acordes v1.55:
          // "pegada JUSTO abajo del label, misma esquina sup. derecha,
          // ADENTRO") — antes (v1.85) quedaba afuera, debajo del borde de
          // la caja, descolgada en el margen. El label "#N" de cada caja
          // se dibuja en yCaja+4 (dibujarCajasPercusion, fila 0 ==
          // yGridVamp acá); +6.5 dnos deja pegado justo debajo.
          // v1.90: +notaFilaAlto si la grilla reservó tira de notas (el
          // label "#N" de la caja se corrió hacia abajo esa misma medida).
          const yBaseVamp = yGridVamp + (ultimaHayNotasPercusion ? notaFilaAlto : 0) + 6.5;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(170);
          for(let col = 0; col < Math.min(totalCajas, POR_FILA); col++){
            // v1.101: +colInicioCicloPercusion*cajaAncho — misma columna
            // real que usa dibujarCajasPercusion para el ciclo, con
            // anacrusa corrida 1 columna a la derecha.
            const xListaVamp = margen + colInicioCicloPercusion * cajaAncho + anacrusaGapMmPercusion + cajaAncho * col + cajaAncho - 1.5;
            let yListaVamp = yBaseVamp;
            for(let k = 1; k <= Math.min(vueltasVampLista, maxLineasVamp); k++){
              doc.text('#' + (compasGlobalInicio + col + k * totalCajas), xListaVamp, yListaVamp, { align: 'right' });
              yListaVamp += 2.6;
            }
          }
          doc.setTextColor(20);
        }
      }
      // v1.1: (a pedido) mismo fix aplicado en pdf-armonias.js v1.1 —
      // fija-bloque simple (!esVamp) con repeticiones>1 nunca tuvo esta
      // lista de "próximas vueltas" (ni siquiera en 1 sola columna, a
      // diferencia del caso con hay2da en acordes que sí la tenía,
      // aunque limitada a columna 0). Ahora recorre TODAS las columnas
      // de totalCajas (mismo criterio que el Vamp de arriba), con o sin
      // 2da vez — cada caja de la 1ra pasada lista sus propias vueltas
      // futuras (compasGlobalInicio + col + k*totalCajas).
      // v1.2: (a pedido, FIX) mismo fix que pdf-armonias.js v1.2 — con
      // 2da vez, la última vuelta no se lista en las columnas que la
      // 2da vez reemplaza (colReemplazoPercusion..totalCajas-1), porque
      // ese número ya se dibuja en la propia caja de "2DA VEZ" más abajo
      // (dibujarCajasPercusion con compasGlobalInicio2da). Reusa
      // colReemplazoPercusion/hay2da ya calculados arriba (línea ~878-883).
      if(!esVamp && alineablePercusion && compasGlobalInicio != null){
        const totalVueltasPercusion = Math.max(0, repeticionesPercusion - 1);
        if(totalVueltasPercusion > 0){
          const maxLineasPercusion = 3;
          const yBasePercusion = yGridVamp + (ultimaHayNotasPercusion ? notaFilaAlto : 0) + 6.5;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(170);
          for(let col = 0; col < Math.min(totalCajas, POR_FILA); col++){
            // v1.2: última vuelta oculta en columnas reemplazadas por
            // la 2da vez (ver comentario arriba).
            const totalVueltasColPercusion = (hay2da && col >= colReemplazoPercusion) ? totalVueltasPercusion - 1 : totalVueltasPercusion;
            if(totalVueltasColPercusion <= 0) continue;
            const xListaPercusion = margen + cajaAncho * col + cajaAncho - 1.5;
            let yListaPercusion = yBasePercusion;
            for(let k = 1; k <= Math.min(totalVueltasColPercusion, maxLineasPercusion); k++){
              const esUltimaVisible = (k === maxLineasPercusion) && (totalVueltasColPercusion > maxLineasPercusion);
              const txt = esUltimaVisible ? '…' : '#' + (compasGlobalInicio + col + k * totalCajas);
              doc.text(txt, xListaPercusion, yListaPercusion, { align: 'right' });
              yListaPercusion += 2.6;
            }
          }
          doc.setTextColor(20);
        }
      }
      // v1.86: (a pedido) marco completo (izq.+der.) SOLO en fija-bloque
      // con repeticiones>1 — mismo criterio que dibujarBarraRepeticion en
      // generarEstructuraPDF, que tampoco lo dibuja para Vamp. Se dibuja
      // pegado a la fila principal (yGridVamp), antes del bloque de 2da
      // vez (que no lleva marco propio, igual que en acordes).
      // v1.89: (a pedido, FIX) el trazo derecho del marco quedaba en el
      // borde de la 1ra vez y por eso pisaba/se solapaba con la caja de
      // la 2da vez horizontal recién agregada (v1.88) — mismo FIX que ya
      // tiene generarEstructuraPDF para esto (v1.48: anchoBarraDerecha se
      // extiende cabeHorizontal&&hay2da para que el trazo cierre DESPUÉS
      // de la caja de la 2da vez, no en el borde de la 1ra).
      // v1.98: (a pedido) el marco de repetición pasa a dibujarse SIEMPRE
      // en Vamp (antes excluido con !esVamp) — el usuario decidió que la
      // señal visual "‖: ... :‖" alrededor de las cajas del ciclo se vea
      // en todos los casos, no solo cuando hay sobra. anchoMarcoPercusion
      // ya usa `totalCajas` (= ciclo, no ciclo+sobra en Vamp — ver
      // totalCajasSeccionPercusion), así que el marco envuelve SOLO las
      // cajas del ciclo, nunca la caja sobrante, sin cambios acá.
      if(mostrarRepeticionPercusion(s, totalCajas)){
        const anchoMarcoPercusion = (cabeHorizontalPercusion && hay2da)
          ? anchoUltimaFilaPercusion(totalCajas) + finalNPercusion * cajaAncho
          : anchoUltimaFilaPercusion(totalCajas);
        // v1.90: el marco arranca DESPUÉS de la tira de notas (si hay),
        // mismo criterio que dibujarBarraRepeticion en generarEstructuraPDF
        // (yBloque + offsetNotaPrimeraFila) — así no envuelve el texto
        // naranja de la nota, solo la caja.
        // v1.101: offsetX = colInicioCicloPercusion*cajaAncho — con
        // anacrusa+Vamp, el marco arranca en la columna del ciclo, no en
        // el margen de página.
        dibujarBarraRepeticionPercusion(yGridVamp + (ultimaHayNotasPercusion ? notaFilaAlto : 0), cajaAlto, anchoMarcoPercusion, { offsetX: colInicioCicloPercusion * cajaAncho + anacrusaGapMmPercusion });
      }

      // v1.88: (a pedido) "se repite xN..." pasa a dibujarse DESPUÉS de
      // la grilla (debajo), mismo orden que generarEstructuraPDF — antes
      // se dibujaba arriba, antes de las cajas.
      if(mostrarRepeticionPercusion(s, totalCajas)){
        // v1.90: +notaFilaAlto si la última fila dibujada reservó tira de
        // notas, para no pisar ese texto con "se repite...".
        y += cajaAlto + (ultimaHayNotasPercusion ? notaFilaAlto : 0) + 4;
        const anchoIconoRep = dibujarIconoRepeticionPercusion(margen, y);
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
        if(esVamp){
          const vueltasVamp = Math.max(0, Math.floor((s.duracion || totalCajas) / totalCajas) - 1);
          const sobraTxtPercusion = sobraPercusion > 0 ? (' + ' + sobraPercusion + ' comp.') : '';
          doc.text('se repite x' + (vueltasVamp + 1) + ' (ciclo de ' + totalCajas + ' comp.)' + sobraTxtPercusion, margen + anchoIconoRep + 1, y);
        } else {
          doc.text('se repite x' + repeticionesPercusion + ' (' + (s.duracion || 1) + ' comp. reales)', margen + anchoIconoRep + 1, y);
        }
        doc.setTextColor(20);
        y += 5;
        ultimoElementoEsTexto = true;
      }

      // v1.88: (a pedido) corchete "1." arriba de la 1ra vez — mismo
      // criterio que generarEstructuraPDF (dibujarCorcheteCasilla,
      // línea ~2371): se dibuja siempre que alineable && hay2da, sea la
      // 2da vez horizontal o apilada.
      if(alineablePercusion && hay2da){
        dibujarCorcheteCasillaPercusion(yGridVamp, 1, xReemplazoPercusion, anchoReemplazoPercusion);
      }

      // v1.76/v1.88: 2da vez — mismo criterio que generarEstructuraPDF
      // (solo aplica a fija-bloque con repeticiones>1, no a Vamp ni
      // Break/Corte). v1.88 agrega el modo HORIZONTAL (pegada a la
      // derecha de la 1ra vez, en la misma fila, con corchetes "1."/"2."
      // — mismo criterio "cabeHorizontal" que generarEstructuraPDF,
      // línea ~2227/2373) además del FIX del contador "#N" (antes
      // repetía el mismo número que la 1ra pasada).
      if(hay2da){
        const compasGlobalInicio2da = compasGlobalInicio != null
          ? compasGlobalInicio + (repeticionesPercusion - 1) * totalCajas
          : null;
        const notasF2 = Array.isArray(s.notasPercusionFinal2) ? s.notasPercusionFinal2 : [];
        const acentosF2 = Array.isArray(s.acentosFinal2) ? s.acentosFinal2 : [];
        // v1.92: nota de armonía de la 2da vez (misma que ya usa
        // generarEstructuraPDF para este bloque).
        const notasArmoniaF2 = Array.isArray(s.notasFinal2) ? s.notasFinal2 : [];
        if(cabeHorizontalPercusion){
          const xHorizontal = margen + totalCajas * cajaAncho;
          dibujarCorcheteCasillaPercusion(yGridVamp, 2, xHorizontal, anchoReemplazoPercusion);
          // v1.90: hayNotasForzado hereda el valor de la grilla principal
          // (ultimaHayNotasPercusion) — mismo motivo que hayNotasForzado en
          // dibujarCajas/generarEstructuraPDF: si la 2da vez horizontal no
          // tiene notas propias pero la 1ra sí, igual reserva la tira para
          // que ambas cajas queden alineadas en la misma fila.
          dibujarCajasPercusion(notasF2, acentosF2, finalNPercusion, totalCajas, colReemplazoPercusion, {
            yBase: yGridVamp,
            sinAvanzarY: true,
            hayNotasForzado: ultimaHayNotasPercusion,
            notasArmonia: notasArmoniaF2,
            compasGlobalInicioOverride: compasGlobalInicio2da
          });
        } else {
          y += 4;
          doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(120);
          doc.text('2da vez (últimos ' + finalNPercusion + ' comp.)', margen, y);
          doc.setTextColor(20);
          y += 4;
          if(alineablePercusion){
            dibujarCorcheteCasillaPercusion(y, 2, xReemplazoPercusion, anchoReemplazoPercusion);
          }
          dibujarCajasPercusion(notasF2, acentosF2, finalNPercusion, colReemplazoPercusion, colReemplazoPercusion, {
            notasArmonia: notasArmoniaF2,
            compasGlobalInicioOverride: compasGlobalInicio2da
          });
          ultimoElementoEsTexto = false;
        }
      }
    }
    } // cierre del if(esBreak) — v1.84
    } // cierre del else(esCoda) — v1.83
    // v1.81: avanza el contador global — mismo criterio que
    // generarEstructuraPDF (v1.45): si esta sección no tiene duración
    // definida, se apaga el contador para las secciones siguientes.
    if(s.duracion != null && s.duracion > 0) compasGlobal += s.duracion;
    else contadorGlobalValido = false;
    // v1.89: (a pedido, FIX) antes sumaba cajaAlto+4 siempre (pensado
    // para dejar aire debajo de la ÚLTIMA FILA de cajas) — con "se
    // repite..." ahora dibujándose debajo (v1.88), en las secciones que
    // terminan en esa línea de texto (que ya trae su propio y+=5) esto
    // sumaba un cajaAlto (14mm) de más antes de la siguiente sección.
    // Con el texto como último elemento, 4mm de aire alcanza (mismo
    // criterio que el resto del archivo para "aire después de una línea
    // de texto").
    // v1.90: +notaFilaAlto si la última grilla dibujada (principal o 2da
    // vez apilada) reservó tira de notas — mismo motivo que los demás
    // ajustes de este cambio: sin esto, la sección siguiente arrancaba
    // pisando la nota naranja de la última fila.
    y += ultimoElementoEsTexto ? 4 : cajaAlto + (ultimaHayNotasPercusion ? notaFilaAlto : 0) + 4;
  });

  const nombreArchivo = 'percusion-' + nombreTema.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.pdf';
  doc.setProperties({ title: nombreArchivo });
  const urlPreview = doc.output('bloburl');
  const ventana = window.open(urlPreview, '_blank');
  if(!ventana){
    doc.save(nombreArchivo);
  }
}

