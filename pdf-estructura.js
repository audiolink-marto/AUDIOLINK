// AUDIOLINK · pdf-estructura.js · v1.10
// v1.10: (a pedido) header ampliado — de vuelta a franja de color +
// diffuser + logo + subtítulo (mismo espíritu visual que logistica.html),
// pero headerH=28mm (no 38mm): decisión acordada con el usuario, esta
// hoja sigue siendo de atril y necesita más espacio para las tarjetas de
// acordes que un informe de logística. Lee las mismas variables globales
// de header-config.js que logistica.html (HEADER_SIN_FONDO,
// HEADER_COLOR_RGB, HEADER_DIFFUSER_OPACITY, HEADER_COLOR_OPACITY,
// LOGO_SIZE/ALIGN/OFFSET_Y/SIN_LOGO), con typeof-guards por si esa hoja
// no cargó. Subtítulo derecho nuevo: "GUÍA DE PRÁCTICA" + fecha, mismo
// patrón que el subtítulo de exportarPDF() en logistica.html. Reemplaza
// el header discreto de v1.9 (13mm, solo logo + línea dorada, sin fondo).
// El resto del PDF (cajas de acordes, patrón rítmico, cálculos de
// compases) no se tocó — solo el bloque de header y el punto de arranque
// de `y` (ahora headerH+9 = 37 en vez de 22).
// v1.9: (a pedido) header discreto (pintarHeader()) al inicio de la
// primera página — logo (leído de #hdrLogo, mismo criterio que
// logistica.html: LOGO_SIZE/LOGO_ALIGN/LOGO_OFFSET_Y/LOGO_SIN_LOGO de
// header-config.js) + línea dorada fina debajo, headerH=13mm fijo. A
// propósito NO usa franja de color de fondo ni diffuser (a diferencia de
// logistica.html) — decisión tomada con el usuario: este PDF es una hoja
// de referencia rápida para atril, un header protagónico le come espacio
// útil y compite con las cajas de acordes. Si LOGO_SIN_LOGO está activo
// (o no hay imagen cargada en #hdrLogo), solo se dibuja la línea dorada
// y el PDF queda visualmente igual que antes de este cambio, solo
// desplazado ~13mm. El nombre del tema + BPM se corren ese mismo alto
// (y arranca en headerH+9 en vez de margen) pero se dibujan exactamente
// igual que antes (mismo texto, tamaños y orden). No toca
// dibujarCajas/dibujarCajaBreak/patrón rítmico ni ningún cálculo de
// compases — es exclusivamente el bloque de header y el punto de arranque
// de `y`.
// v1.8: (a pedido) ícono de acento ">" (dibujarIconoAcentoBreak) más chico
// — de 2.6x3.4 a ~1.7x2.2 (65%), con su espacio reservado ajustado (return
// 4 → 2.6) para que no quede hueco de más al lado del golpe acentuado. Se
// re-centró el offset en dibujarPatronRitmico (que lo reutiliza sobre la
// plica) para que siga alineado con el nuevo tamaño. No cambia el resto
// del dibujo del patrón ni ningún cálculo de compases.
// v1.7: (a pedido) líneas de compás en el patrón rítmico
// (dibujarPatronRitmico) — barra de apertura al inicio, cierre al final, y
// una divisoria entre cada compás si la sección dura 2+ compases (mismo
// criterio visual que ya separaba los acordes en dibujarCajaBreak). Nuevo
// parámetro `compases` (con default 1 para no romper otros llamados);
// dibujarCajaBreak ahora se lo pasa (`total`) en su propio llamado. No
// cambia el agrupado de a 2 ni el dibujo de golpes/silencios/ligados.
// v1.6: (a pedido) se saca el texto "BREAK" de dibujarCajaBreak — la nota
// de tiempo (notaTiempoCorte), si el staff cargó una, se recorre para
// arrancar donde antes empezaba "BREAK" (columna del margen) en vez de
// desaparecer. Si no hay nota, ese renglón queda vacío pero se sigue
// reservando el mismo alto (y += 6) que antes, así calcularAltoSeccion no
// necesita tocarse. No afecta la caja de acordes condicional (v1.5) ni el
// patrón rítmico.
// v1.5: (a pedido) 2 ajustes a dibujarCajaBreak: 1) si ningún compás de la
// sección Break/Corte tiene acorde cargado, la caja de acordes no se
// dibuja (antes salía un rectángulo vacío) — va directo a "BREAK" +
// patrón; calcularAltoSeccion ajusta el alto reservado según corresponda.
// 2) se saca el ícono de acento ">" fijo junto a la palabra "BREAK" (el
// mismo ícono sigue usándose DENTRO del patrón rítmico para golpes
// acentuados marcados con "X" mayúscula — eso no cambia). No se tocó
// dibujarCajas, dibujarPatronRitmico, ni ningún cálculo de compases.
// v1.4: (a pedido) FIX — la caja de Break/Corte (dibujarCajaBreak) se
// dibujaba siempre con el ancho total de la página (anchoUtil) sin
// importar cuántos compases dura, viéndose desproporcionada al lado de
// secciones como Coro (que usan cajas de ancho fijo por compás). Ahora
// usa cajaAncho por compás (mismo criterio que dibujarCajas), con tope
// en POR_FILA compases — el patrón rítmico debajo también se ajusta a
// este nuevo ancho de caja en vez de anchoUtil. No cambia ningún cálculo
// de compases/duración, ni el alto de la caja, solo el ancho.
// v1.2: (a pedido) patrón rítmico para Break/Corte (dibujarPatronRitmico)
// — notación real acotada (solo corcheas, sin silencios propios ni
// ligaduras): plicas con cabeza rellena, agrupadas de a 2 con corchete
// cuando el par completo es golpe, gancho individual si queda sola.
// Toma s.patronRitmico (string "x"/"." , ej. "x.xx.x..", cargado por el
// staff), se dibuja debajo de "BREAK" solo si viene con datos. No cambia
// dibujarCajas, dibujarCajaBreak (salvo el agregado puntual), ni ningún
// cálculo de compases — calcularAltoSeccion reserva el espacio extra
// cuando corresponde.
// v1.1: (a pedido) una sección ya no se corte entre dos páginas — se
// reserva su alto TOTAL (header + bloque de cajas + 2da vez si hay) de
// una sola vez antes de dibujarla, en vez de solo 10mm fijos para el
// header (ver calcularAltoSeccion). No cambia ningún cálculo de compases
// ni el dibujo en sí, solo dónde arranca la página cuando no entra
// completa.
// v1.0: (a pedido, "que los dos PDF se vean iguales") generador de PDF de
// estructura, sacado tal cual de guia-practica.html v1.29.12
// (exportarEstructuraPDF) — cero cambios en dibujarCajas, dibujarCajaBreak,
// dibujarBarraRepeticion, dibujarCorcheteCasilla, íconos de repetición/coda/
// acento, letra de ensayo, D.C./variación/coda, ni en el cálculo de
// compases. Se comparte entre guia-practica.html y musico.html vía
// <script src="pdf-estructura.js">.
//
// Única diferencia con el original: en vez de leer bpm/compás/clave de los
// inputs del staff y recalcular duracion/color adentro del loop
// (duracionCompasesSeccion(s) / colorDeSeccionEnLista(secciones, i)), ahora
// los recibe ya resueltos en `datos` — eso es lo único que de verdad
// difiere entre staff (duracionCompasesSeccion, basado en hastaSegundos
// manual) y músico (su propio cálculo con secPerBar/hastaSegundos-o-
// próxima-sección), así que cada página sigue calculando esos dos valores
// como ya lo hacía, y este archivo solo dibuja. Todo lo demás (esCoda,
// nombresYaImpresos, letraEnsayo, repeticiones, Break/Corte, barra de
// repetición, preview en pestaña nueva) es exactamente el mismo código.
//
// Firma:
//   generarEstructuraPDF({ temaNombre, bpm, compasTexto, claveTxt, secciones })
// donde cada elemento de `secciones` es la sección tal cual (con todos sus
// campos: nombre, tipo, desdeSegundos, hastaSegundos, acordesPorCompas,
// letraPorCompas, acordesCiclo, letraCiclo, acordesFinal2, letraFinal2,
// letraEnsayo, origenId, esVariacion, notaVariacion, modoRepeticionPDF,
// compasOverride, notaTiempoCorte, repeticiones, finalDistintoN,
// cicloCompases, acordesSinTiempo, id) MÁS `duracion` y `color` ya
// resueltos por quien llama, ya ordenadas por desdeSegundos.
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
  const goldRGB = [201, 162, 75];
  const mutedRGB = [154, 151, 143];
  const headerH = 28;
  const imgDiffuserHdr = document.getElementById('hdrDiffuser');
  const imgLogoHdr = document.getElementById('hdrLogo');
  const diffuserOkHdr = imgDiffuserHdr && imgDiffuserHdr.complete && imgDiffuserHdr.naturalWidth > 0;
  const logoOkHdr = imgLogoHdr && imgLogoHdr.complete && imgLogoHdr.naturalWidth > 0;
  const headerSinFondo = typeof HEADER_SIN_FONDO !== 'undefined' ? HEADER_SIN_FONDO : false;
  const headerColorRGB = typeof HEADER_COLOR_RGB !== 'undefined' ? HEADER_COLOR_RGB : [11, 11, 13];
  const headerDiffuserOpacity = typeof HEADER_DIFFUSER_OPACITY !== 'undefined' ? HEADER_DIFFUSER_OPACITY : 1.0;
  const headerColorOpacity = typeof HEADER_COLOR_OPACITY !== 'undefined' ? HEADER_COLOR_OPACITY : 0.62;

  function pintarHeader(){
    if(!headerSinFondo){
      if(diffuserOkHdr){
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: headerDiffuserOpacity }));
        doc.addImage(imgDiffuserHdr, 'JPEG', 0, 0, pageW, headerH);
        doc.restoreGraphicsState();
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
      doc.addImage(imgLogoHdr, 'PNG', logoX, logoY, logoW, logoH);
    }
    // v1.10: subtítulo derecha, mismo patrón que logistica.html.
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...mutedRGB);
    doc.text('GUÍA DE PRÁCTICA', pageW - margen, headerH - 12, { align: 'right' });
    doc.setFontSize(8);
    doc.text(new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric' }), pageW - margen, headerH - 5, { align: 'right' });
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

  const dibujarCajas = (acordes, letra, total) => {
    const filas = Math.ceil(total / POR_FILA);
    asegurarEspacio(filas * cajaAlto + 2);
    for(let j = 0; j < total; j++){
      const fila = Math.floor(j / POR_FILA);
      const col = j % POR_FILA;
      const x = margen + col * cajaAncho;
      const yCaja = y + fila * cajaAlto;
      doc.setDrawColor(180); doc.rect(x, yCaja, cajaAncho, cajaAlto);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(140);
      doc.text('c.' + (j + 1), x + 1.5, yCaja + 4);
      doc.setTextColor(20);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
      const acorde = (acordes && acordes[j]) || '';
      doc.text(acorde, x + cajaAncho / 2, yCaja + 8, { align: 'center' });
      const le = (letra && letra[j]) || '';
      if(le){
        doc.setFont('helvetica', 'italic'); doc.setFontSize(7);
        const leCorta = le.length > 22 ? le.slice(0, 21) + '…' : le;
        doc.text(leCorta, x + cajaAncho / 2, yCaja + 13, { align: 'center' });
      }
    }
    y += filas * cajaAlto + 4;
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
    doc.rect(margen - 2.2, yBloqueInicio, grosor, alto, 'F');
    doc.rect(margen - 3.6, yBloqueInicio, 0.4, alto, 'F');
    doc.rect(margen + ancho + 1, yBloqueInicio, grosor, alto, 'F');
    doc.rect(margen + ancho + 3.2, yBloqueInicio, 0.4, alto, 'F');
  };
  // v1.29: corchete "1." / "2." de casilla, en vez del texto "2ª vez:"
  // suelto — se dibuja pegado a la esquina sup. izq. del bloque.
  const dibujarCorcheteCasilla = (yBloqueInicio, numero) => {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(20);
    doc.text(numero + '.', margen + 1.5, yBloqueInicio - 1);
    doc.setDrawColor(20); doc.setLineWidth(0.3);
    doc.line(margen, yBloqueInicio, margen, yBloqueInicio - 3);
    doc.line(margen, yBloqueInicio - 3, margen + anchoUtil, yBloqueInicio - 3);
  };
  // v1.29.2: íconos dibujados a mano en vez de emoji — jsPDF con fuente
  // helvetica estándar no soporta unicode alto (🔁/⊕ salían como
  // caracteres rotos, ej. "Ø=Ý"). Cada ícono devuelve el ancho que ocupó,
  // para poder ubicar el texto que sigue justo al lado.
  const dibujarIconoRepeticion = (x, yBase) => {
    // mini versión de la misma barra ║: — dos trazos + puntito, ~4mm
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
  const dibujarPatronRitmico = (patron, xStart, ancho, yBase, compases) => {
    const tokens = (patron || '').replace(/\s+/g, '').split('').filter(c => c === 'x' || c === 'X' || c === '.' || c === '-');
    if(!tokens.length) return 0;
    const n = tokens.length;
    const paso = ancho / n;
    const altoPlica = 6;
    const xCentro = (idx) => xStart + paso * idx + paso / 2;
    const esNota = (t) => t === 'x' || t === 'X';
    doc.setDrawColor(20); doc.setLineWidth(0.25);
    doc.line(xStart, yBase, xStart + ancho, yBase); // línea base (una sola, sin alturas)

    // v1.7: barras de compás — apertura, cierre y divisorias intermedias
    // si son 2+ compases. Mismo alto que la plica (de yBase-altoPlica a
    // yBase), independiente del agrupado de golpes.
    const totalCompases = Math.max(1, compases || 1);
    doc.setDrawColor(20); doc.setLineWidth(0.3);
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
    // edición impresa) centrada en su casillero.
    const dibujarSilencio = (x) => {
      doc.setDrawColor(20); doc.setLineWidth(0.5);
      const yc = yBase - altoPlica * 0.45;
      doc.line(x - 1.1, yc - 1.6, x + 0.9, yc + 0.5);
      doc.line(x + 0.9, yc + 0.5, x - 0.3, yc + 1.8);
    };
    // ligado: arco chico entre la posición anterior y esta.
    const dibujarLigado = (xDesde, xHasta) => {
      doc.setDrawColor(20); doc.setLineWidth(0.35);
      const yTie = yBase + 2;
      const xMid = (xDesde + xHasta) / 2;
      doc.line(xDesde, yTie, xMid, yTie - 1.3);
      doc.line(xMid, yTie - 1.3, xHasta, yTie);
    };

    // pasada 1: silencios y ligados (independiente del agrupado de a 2)
    for(let j = 0; j < n; j++){
      const t = tokens[j];
      if(t === '.') dibujarSilencio(xCentro(j));
      else if(t === '-' && j > 0) dibujarLigado(xCentro(j - 1), xCentro(j));
    }

    // pasada 2: golpes (x/X) — cabeza, plica, acento si corresponde, y
    // agrupado de a 2 con corchete/gancho (mismo criterio que v1.2).
    for(let g = 0; g < n; g += 2){
      const a = tokens[g];
      const b = (g + 1 < n) ? tokens[g + 1] : null;
      const xa = xCentro(g), xb = b != null ? xCentro(g + 1) : null;
      if(esNota(a)){
        doc.circle(xa, yBase, 0.9, 'F');
        doc.setLineWidth(0.35);
        doc.line(xa + 0.9, yBase, xa + 0.9, yBase - altoPlica);
        if(a === 'X') dibujarIconoAcentoBreak(xa + 0.9 - 0.85, yBase - altoPlica - 1);
      }
      if(esNota(b)){
        doc.circle(xb, yBase, 0.9, 'F');
        doc.setLineWidth(0.35);
        doc.line(xb + 0.9, yBase, xb + 0.9, yBase - altoPlica);
        if(b === 'X') dibujarIconoAcentoBreak(xb + 0.9 - 0.85, yBase - altoPlica - 1);
        if(esNota(a)){
          // corchete uniendo el par (2 corcheas agrupadas)
          doc.setLineWidth(0.9);
          doc.line(xa + 0.9, yBase - altoPlica, xb + 0.9, yBase - altoPlica);
        } else {
          // corchea suelta (gancho individual)
          doc.setLineWidth(0.35);
          doc.line(xb + 0.9, yBase - altoPlica, xb + 0.9 + 1.6, yBase - altoPlica + 1.6);
        }
      } else if(esNota(a)){
        doc.setLineWidth(0.35);
        doc.line(xa + 0.9, yBase - altoPlica, xa + 0.9 + 1.6, yBase - altoPlica + 1.6);
      }
    }
    doc.setTextColor(20);
    return altoPlica + 4;
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
  const dibujarCajaBreak = (acordes, total, nota, patron) => {
    const altoCaja = 15;
    const hayAcordes = Array.isArray(acordes) && acordes.some(a => (a || '').trim());
    if(hayAcordes){
      const anchoCaja = Math.min(Math.max(1, total), POR_FILA) * cajaAncho;
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
      }
      y += altoCaja + 3;
    } else {
      asegurarEspacio(8 + (patron ? 10 : 0));
    }
    const notaTxt = (nota || '').trim();
    if(notaTxt){
      doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(120);
      doc.text('(' + notaTxt + ')', margen, y);
      doc.setTextColor(20);
    }
    y += 6;
    if((patron || '').trim()){
      y += 4;
      // v1.4: el patrón rítmico ahora se dibuja al ancho de la caja
      // (anchoCaja) cuando hay caja, o del ancho de 1 compás si no la hay,
      // no de la página (anchoUtil), para que quede alineado con el resto
      // del bloque en vez de estirarse de más.
      const anchoPatron = Math.min(Math.max(1, total), POR_FILA) * cajaAncho;
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
    if(esCoda) return 9 + 6; // header + "Ver primera aparición arriba."
    let alto = 9; // barra de color + nombre
    if(s.tipo === 'vamp'){
      const ciclo = s.cicloCompases || (s.acordesCiclo && s.acordesCiclo.length) || 0;
      alto += ciclo > 0 ? (Math.ceil(ciclo / POR_FILA) * cajaAlto + 4 + 6) : 6;
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
      const altoBloque = (n) => {
        if(!esBreak) return Math.ceil(n / POR_FILA) * cajaAlto + 4;
        const hayAcordes = Array.isArray(s.acordesPorCompas) && s.acordesPorCompas.slice(0, n).some(a => (a||'').trim());
        return (hayAcordes ? 15 + 3 : 0) + 6 + ((s.patronRitmico||'').trim() ? 10 : 0);
      };
      const repeticiones = s.repeticiones || 1;
      if(repeticiones > 1){
        const basePase = Math.max(1, Math.round(duracion / repeticiones));
        alto += altoBloque(basePase);
        const finalN = Math.min(basePase, s.finalDistintoN || 1);
        const hay2da = (s.acordesFinal2 && s.acordesFinal2.some(a => (a||'').trim())) || (s.letraFinal2 && s.letraFinal2.some(l => (l||'').trim()));
        if(hay2da) alto += 3 + altoBloque(finalN);
      } else {
        alto += altoBloque(duracion);
      }
    } else {
      alto += 6;
    }
    return alto + 2; // el y+=2 final entre secciones
  };

  secciones.forEach((s, i) => {
    if(!(s.nombre || '').trim()) return;
    const esCoda = s.origenId && !s.esVariacion && s.modoRepeticionPDF === 'coda' && nombresYaImpresos.has(s.origenId);
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
    doc.text(s.nombre + etiquetaDC, xTexto, y + 5);
    if(esCoda){
      const anchoNombre = doc.getTextWidth(s.nombre + etiquetaDC);
      const xIcono = xTexto + anchoNombre + 2;
      dibujarIconoCoda(xIcono, y + 5.5, [255, 255, 255]);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      doc.text('D.S. al Coda', xIcono + 5.5, y + 5);
    }
    if((s.compasOverride || '').trim()){
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      doc.text('· ' + s.compasOverride.trim(), margen + anchoUtil - 2, y + 5, { align: 'right' });
    }
    y += 9;
    doc.setTextColor(20);
    nombresYaImpresos.add(s.id || s.nombre);

    // v1.29: modo coda — no re-dibuja el cuadro completo, solo remite a la
    // primera aparición (ya se ve completo más arriba en el mismo PDF).
    // Nada de esto toca dibujarCajas/cálculo de compases.
    if(esCoda){
      doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
      doc.text('Ver primera aparición arriba.', margen, y);
      y += 6; doc.setTextColor(20);
      return;
    }

    if(s.tipo === 'vamp'){
      const ciclo = s.cicloCompases || (s.acordesCiclo && s.acordesCiclo.length) || 0;
      if(ciclo > 0){
        dibujarCajas(s.acordesCiclo, s.letraCiclo, ciclo);
        const anchoIcono = dibujarIconoRepeticion(margen, y);
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
        doc.text('se repite (ciclo de ' + ciclo + ' comp.)', margen + anchoIcono + 1, y);
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
        ? (ac, le, n) => dibujarCajaBreak(ac, n, s.notaTiempoCorte, s.patronRitmico)
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
          // v1.29.8: FIX — yBloque se capturaba ANTES de asegurar espacio;
          // si dibujarCajas() disparaba un salto de página adentro
          // (asegurarEspacio → addPage → y=margen), yBloque quedaba con la
          // Y vieja (página anterior) mientras las cajas se dibujaban en
          // la Y nueva — la barra/corchete quedaban flotando,
          // desalineados. Ahora se asegura el espacio ANTES de capturar
          // yBloque, así los dos usan la misma Y real.
          const altoBloque = Math.ceil(basePase / POR_FILA) * cajaAlto;
          const anchoBloque = Math.min(basePase, POR_FILA) * cajaAncho;
          asegurarEspacio(altoBloque + 2);
          const yBloque = y;
          dibujarBloqueSeccion(s.acordesPorCompas, s.letraPorCompas, basePase);
          dibujarBarraRepeticion(yBloque, altoBloque, anchoBloque);
          doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(120);
          doc.text('x' + repeticiones + ' (' + duracion + ' comp. reales)', margen + anchoBloque / 2, y - 2, { align: 'center' });
          doc.setTextColor(20);
          const finalN = Math.min(basePase, s.finalDistintoN || 1);
          const hay2da = (s.acordesFinal2 && s.acordesFinal2.some(a => (a||'').trim())) || (s.letraFinal2 && s.letraFinal2.some(l => (l||'').trim()));
          if(hay2da){
            y += 3;
            const altoBloque2 = Math.ceil(finalN / POR_FILA) * cajaAlto;
            asegurarEspacio(altoBloque2 + 4);
            const yBloque2 = y;
            dibujarCorcheteCasilla(yBloque2, 2);
            dibujarBloqueSeccion(s.acordesFinal2, s.letraFinal2, finalN);
          }
        } else {
          dibujarBloqueSeccion(s.acordesPorCompas, s.letraPorCompas, duracion);
        }
      } else {
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
        doc.text('Definí el fin de la sección para ver las cajas acá.', margen, y);
        y += 6; doc.setTextColor(20);
      }
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
