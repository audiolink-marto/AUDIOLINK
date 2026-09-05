// AUDIOLINK · pdf-estructura.js · v1.29
// v1.29: (a pedido) 2 FIX de consistencia preview/PDF:
// 1) Acento (">") del patrón se veía "muy grande" — estaba reusando
// dibujarIconoAcentoBreak() con sus medidas fijas (2.2x1.7mm, grosor
// 0.5mm), pensadas para otra escala/contexto en el documento. Se dibuja
// ahora un acento propio dentro de dibujarPatronRitmico, escalado a la
// misma proporción que usa patronRitmicoSVG en el preview (relativo a
// altoPlica=6mm). NO se tocó dibujarIconoAcentoBreak en sí, por si se usa
// en otro lado a su tamaño original — solo se dejó de llamar desde acá.
// 2) Ligadura: estaba dibujada con 2 líneas rectas en ángulo (∧),
// distinta a la curva suave del preview. Se reemplaza por una curva
// bezier (aproximación cúbica de la misma quadratic del SVG) con la
// misma profundidad proporcional (v1.51 en guia-practica.html).
//
// v1.28: FIX — mismo fix que guia-practica.html v1.50: el corchete de
// tresillo/sextillo vuelve a ir de PLICA a PLICA (no del borde del
// casillero, que se salía por los costados). Se saca el tick de cierre
// de v1.26 (ya no hace falta, ambas puntas caen en una plica real). Si
// el grupo tiene un solo golpe real, bandera curva en vez de corchete.
// Probado con jsPDF real (test_patron3.pdf) antes de aplicar. No cambia
// silencios, ligados, parser, pesos, doble barra (v1.27) ni radios de
// cabeza (v1.26).
//
// v1.27: (a pedido) mismo cambio que guia-practica.html v1.49 —
// acercando el dibujo a la notación musical estándar:
// 1) Doble barra cuando el grupo es de 6 (sextillo/semicorchea), simple
// para 3 (tresillo/corchea). Separación 1.3mm, barra 0.75mm de grosor,
// tick de cierre extendido de 1.1 a 1.8mm para cerrar ambas.
// 2) Plica más fina: de 0.35 a 0.28mm.
// 3) Bandera curva (bezier vía doc.lines con segmentos de 6 valores) en
// vez de la línea recta diagonal, para la corchea suelta. Probada
// aislada en Node+jsPDF real (test_flag.pdf) antes de aplicarla acá,
// para no arriesgar el PDF de producción sin verificar que jsPDF la
// soporta bien.
// No toca silencios, ligados, parser, pesos, ni el ancho del corchete de
// grupo (v1.24).
//
// v1.26: (a pedido) mismo cambio que guia-practica.html v1.48 — vuelve la
// cabeza de nota (más chica dentro de grupos, r=0.55mm vs 0.9mm, para que
// no se toquen entre sí) y se agrega tick de cierre en cada punta del
// corchete de tresillo/sextillo (antes quedaba "abierto" si el extremo
// del grupo era un silencio). No cambia silencios, ligados, parser,
// pesos, ni el ancho del corchete (v1.24).
//
// v1.25: (a pedido) mismo cambio que guia-practica.html v1.47 — se saca
// la cabeza (círculo) de todas las notas del patrón rítmico, queda solo
// la plica. Resuelve que en tresillos/sextillos las cabezas de notas
// consecutivas quedaran casi pegadas entre sí. La plica se centra en el
// punto exacto del pulso (antes +0.9 a la derecha). No cambia el ancho
// de los corchetes de tresillo/sextillo (v1.24), silencios, ligados,
// parser ni pesos.
//
// v1.24: FIX — mismo fix que guia-practica.html v1.46: el ajuste de v1.23
// (corchete cubriendo el ancho real del grupo) tapaba el acento (">")
// cuando la nota acentuada quedaba cerca del centro del grupo — se sube
// el número de yBase-altoPlica-1 a yBase-altoPlica-4.5. Y el corchete, al
// tocar la línea de compás en el primer/último grupo del patrón, se le
// resta 0.25mm de cada lado para separarlo visualmente de la barra (antes
// se "fundían" y parecía que la línea de compás había crecido, aunque su
// alto no cambió). No requirió tocar el margen reservado (altoPlica+7)
// porque el número sigue dentro de esa franja.
//
// v1.23: (a pedido) el corchete y el número de tresillo/sextillo en
// dibujarPatronRitmico ahora cubren el ancho REAL de todo el grupo (borde
// izquierdo de su primera posición a borde derecho de su última), no solo
// el tramo entre el primer y el último golpe — antes, si el grupo
// empezaba o terminaba en silencio, el corchete quedaba angosto/corrido y
// el número descentrado. Se dibuja siempre que el grupo sea válido, aunque
// no tenga ningún golpe adentro. Mismo criterio aplicado en paralelo en
// patronRitmicoSVG (guia-practica.html v1.45) para que pantalla y PDF
// sigan viéndose igual. No cambia el parser, el peso de columnas, ni el
// dibujo de golpes/silencios/ligados.
//
// v1.22: FIX del fix de v1.21 — el diffuser ya no se estiraba, pero se
// filtraba (sin recortar) por debajo del header, tapando el título y la
// primera sección. Probado en aislado (Node + jsPDF real + render a
// imagen): doc.rect(x,y,w,h) SIN un 4to argumento de estilo pinta un
// trazo (stroke) por defecto, lo que "cierra" el path ANTES de que
// doc.clip() llegue a aplicarlo — el recorte de PDF exige pedirse ANTES
// de pintar el trazado. Fix real: doc.rect(x,y,w,h,null) — el `null`
// evita que se pinte nada, dejando el path abierto para que clip() sí
// lo tome. Verificado con un rectángulo de prueba: sin el `null` el
// "recorte" no cortaba nada (se veía completo); con `null` corta
// exactamente en el borde esperado. No cambia ningún otro cálculo.
//
// v1.21: FIX estiramiento del diffuser en local (file://) — reportado con
// captura real (perillas ovaladas en vez de circulares). recortarImagenCover()
// (canvas.toDataURL()) siempre tira SecurityError bajo file://, y el plan B
// de v1.15/v1.20 (imagen sin recortar, forzada a pageW×headerH) estiraba la
// imagen sin respetar su proporción. Se elimina recortarImagenCover() y se
// reemplaza por dibujarDiffuserCover(): calcula el mismo tamaño "cover" de
// siempre, pero en vez de recortar píxeles con canvas, dibuja la imagen
// completa a ese tamaño (centrada, más grande que el header) y usa el
// doc.rect()+doc.clip() nativo de jsPDF para ocultar visualmente el
// sobrante — 100% vectorial, nunca lee píxeles por su cuenta, así que
// funciona igual en file:// y en servidor. También usa detectarFormatoImagen()
// (v1.20) en vez de asumir 'JPEG'. No cambia el logo, headerH, colores,
// opacidades, ni ningún otro dibujo/cálculo de compases.
//
// v1.20: FIX real de fondo (el de v1.19 no alcanzaba en todos los casos)
// — cuando el logo/diffuser cae al último recurso (raw <img> sin
// convertir, por SecurityError de canvas bajo file://), el código
// pasaba SIEMPRE 'JPEG' como formato a doc.addImage(), sin importar el
// archivo real. El logo por defecto (img/logo 1.png) es un PNG: al
// decirle a jsPDF que es JPEG, jsPDF no confía en el dato y sale a
// re-verificar los bytes reales con un XMLHttpRequest interno propio —
// ese XHR es el que queda bloqueado por CORS bajo file:// (mismo
// síntoma ya visto: "botón no responde"), y por eso funcionaba con
// rutas de Cloudinary (XHR remoto sí permitido por sus headers CORS)
// pero no con el logo local por defecto. Nueva función
// detectarFormatoImagen(src) lee la extensión real del archivo
// (.png → 'PNG', .webp → 'WEBP', cualquier otro caso incl. URLs sin
// extensión como Cloudinary → 'JPEG', igual que antes) y se usa en el
// catch de logo Y diffuser. No cambia el camino feliz (canvas→dataURL,
// que ya fuerza JPEG real vía toDataURL), ni headerH, colores, tamaños,
// ni ningún otro dibujo.
//
// v1.19: FIX de fondo (el try/catch de v1.16 no alcanzaba) — el botón
// "Exportar PDF" seguía sin responder en local (file://) en musico.html y
// guia-practica.html. La consola mostró la causa real: jsPDF, al recibir
// el <img> crudo del logo en doc.addImage(), sale a buscar los bytes
// ORIGINALES del archivo con un XMLHttpRequest interno propio — ese XHR
// queda bloqueado por CORS bajo file://, y el TypeError que sigue explota
// DENTRO de un callback asíncrono de jsPDF (addimage.js), fuera de
// cualquier try/catch síncrono alrededor de la llamada — por eso el
// try/catch de v1.16 nunca lo atrapaba, aunque el síntoma (mismo mensaje
// de error) era idéntico. Fix real: nueva función imagenComoDataURL()
// convierte el logo a dataURL vía canvas ANTES de pasarlo a jsPDF (mismo
// mecanismo que el diffuser ya usa con éxito desde v1.11/v1.15) — así
// jsPDF ya tiene los bytes inline y nunca sale a buscarlos por su cuenta.
// Verificado con el patrón real del logo (.jfif) reportado por el
// usuario. No cambia headerH, colores, diffuser, ni ningún otro dibujo.
//
// v1.18: FIX — a pedido, tras revisar una captura real del preview: la
// marca de silencio se dibujaba arriba, casi en la misma zona/tamaño que
// el chevrón de acento, confundibles a simple vista. Ahora dibujarSilencio
// dibuja SIEMPRE debajo de la línea base, en gris (150,150,150) en vez de
// negro. dibujarPatronRitmico ahora reserva altoPlica+7 (antes +4) para
// que el llamador no pise esa marca. Mismo cambio en guia-practica.html
// (patronRitmicoSVG v1.44) para que preview y PDF se sigan viendo igual.
//
// v1.17: (a pedido) tresillos y sextillos en dibujarPatronRitmico —
// misma sintaxis "{...}" que guia-practica.html (patronRitmicoSVG v1.43):
// {xxx} tresillo, {xxxxxx} sextillo, ambos ocupan el espacio de 2
// corcheas normales sin importar cuántas notas tengan adentro. Nuevas
// funciones locales parsearPatronRitmico(), aplanarColumnasPatron() y
// pesoTotalPatron() (duplicadas a mano en guia-practica.html por el
// mismo motivo de siempre: jsPDF y SVG de pantalla no comparten dibujo).
// dibujarPatronRitmico ahora posiciona cada columna según su peso
// relativo (antes era ancho/n fijo) y dibuja los grupos válidos con un
// corchete único + número (3/6) centrado arriba en vez del corchete de a
// pares de siempre. Un grupo mal formado se dibuja como notas sueltas
// sin bracket. No cambia la firma de la función ni lo que devuelve
// (altoPlica + 4), ni ningún otro dibujo de este archivo.
//
// v1.16: FIX — el fallback de v1.15 no alcanzaba: la consola mostró que
// el verdadero corte pasaba en el LOGO, no en el diffuser. Bajo file://,
// jsPDF intenta traer los bytes originales del logo con un
// XMLHttpRequest directo al archivo (para incrustar el JPEG/JFIF sin
// recomprimir, mejor calidad) — esa petición queda bloqueada por CORS
// sin excepción posible bajo file:// (más estricto que el "tainted
// canvas" del diffuser), y tiraba un TypeError no capturado dentro de
// addImage() (Cannot read properties of undefined (reading 'data')) que
// cortaba TODO el PDF. Se envuelve ese doc.addImage() del logo en
// try/catch: si falla, se omite el logo puntual (el resto del header —
// diffuser, línea dorada, subtítulo — sigue intacto) en vez de cortar la
// generación completa. Servido por Netlify (http/https, mismo origen) el
// logo vuelve a incrustarse normal, sin cambios. No es un bug 100%
// arreglable en file:// (XMLHttpRequest a archivos locales está
// bloqueado sin excepción en el navegador) — la recomendación real es
// probar sirviendo el HTML con un servidor local (ej. `netlify dev`,
// Live Server), donde este problema no existe.
// v1.15: FIX — recortarImagenCover (v1.11) usa canvas.toDataURL(), que
// tira SecurityError ("tainted canvas") si el HTML se abre con file://
// (sin servidor) en vez de http(s), ya que el navegador no confía en
// imágenes locales cargadas así para leer el canvas. Eso cortaba TODA la
// generación del PDF sin aviso — el botón "Exportar PDF" quedaba sin
// responder en local, mientras que logistica.html (que nunca usa canvas,
// solo addImage directo con el <img>) sí funcionaba. Se envuelve el
// llamado en try/catch dentro de pintarHeader(): si falla, cae a
// addImage directo con la imagen original sin recortar (mismo criterio
// que logistica.html) — se pierde el recorte "cover" fino solo en ese
// caso puntual (file://), el PDF se sigue generando igual. Servido por
// Netlify (mismo origen http/https) el recorte cover sigue funcionando
// normal, sin cambios. No toca headerH, colores, ni el resto del dibujo.
// v1.14: (a pedido) el subtítulo del header ("GUÍA DE PRÁCTICA" + fecha)
// seguía con poco contraste (v1.12) contra las líneas de la textura del
// diffuser en esa zona. Se oscurece más (25,22,18, casi negro), el título
// pasa a negrita y opacidad plena (antes 0.85, gris 60,56,50) — la fecha
// queda en peso normal para mantener la jerarquía. Sigue sin fondito
// detrás (decisión tomada con el usuario, prioriza el look limpio del
// header sobre agregar un parche). No toca tamaño, posición, texto, logo,
// diffuser, headerH, ni ningún otro cálculo.
// v1.13: (a pedido) headerH sube de 28 a 38mm — igual que logistica.html
// — así el recorte "cover" del diffuser usa la misma proporción
// (pageW/headerH) que logistica.html y no se ve tan recortado/achatado
// (antes 210/28≈7.5:1, ahora 210/38≈5.5:1, mucho más parecido al 215.9/
// 38≈5.7:1 de logistica). Contrapartida asumida por el usuario: menos
// espacio para las cajas de acordes debajo, que era la razón original de
// v1.10 para dejarlo en 28mm. `y` arranca en headerH+9 = 47 (antes 37).
// No se tocó el recorte cover en sí (recortarImagenCover), el color del
// subtítulo (v1.12), ni ningún cálculo de compases/dibujo de cajas.
// v1.12: FIX contraste — el subtítulo del header (derecha, "GUÍA DE
// PRÁCTICA" + fecha) usaba crema/blanco (v1.11), pensado para un header
// con velo oscuro como el de logistica.html. Esta hoja usa el header sin
// ese velo (fondo queda con la textura metálica clara del diffuser tal
// cual, a propósito, confirmado con el usuario vía captura), así que el
// crema quedaba casi invisible sobre ese fondo claro. Se cambia a gris
// oscuro (60,56,50), mismo tono que el logo, en vez de agregar un fondito
// oscuro detrás del texto — así no se rompe el look limpio y claro del
// header. No se tocó tamaño, posición, texto, logo, diffuser, ni ningún
// otro color/cálculo. Afecta a guia-practica.html y musico.html (comparten
// este archivo vía <script src>).
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
      } else if(c === 'x' || c === 'X' || c === '.' || c === '-'){
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
        cols.push({ caracter: it.valor, peso: 1, grupo: null });
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
    items.forEach(it => { total += (it.tipo === 'simple') ? 1 : (it.valido ? 2 : it.valores.length); });
    return total;
  };
  const dibujarPatronRitmico = (patron, xStart, ancho, yBase, compases) => {
    const items = parsearPatronRitmico(patron);
    if(!items.length) return 0;
    const cols = aplanarColumnasPatron(items);
    const pesoTotal = pesoTotalPatron(items);
    const n = cols.length;
    const altoPlica = 6;
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

    // posiciones: ancho de cada columna proporcional a su peso (una nota
    // de tresillo/sextillo pesa menos que una corchea suelta, pero el
    // grupo completo sigue ocupando el mismo espacio de 2 corcheas).
    let acumPeso = 0;
    const xInfo = cols.map(col => {
      const x0 = xStart + (acumPeso / pesoTotal) * ancho;
      const w = (col.peso / pesoTotal) * ancho;
      acumPeso += col.peso;
      return { xCentro: x0 + w / 2, x0, x1: x0 + w };
    });

    // silencio: marca simplificada (dos trazos, no el símbolo estándar de
    // edición impresa) — v1.18: ahora colgando DEBAJO de la línea base,
    // en gris tenue, para no confundirse con el acento (que va arriba de
    // la plica, en negro). Antes iba arriba cerca de la plica y a este
    // tamaño era casi indistinguible del chevrón de acento.
    const dibujarSilencio = (x) => {
      doc.setDrawColor(150, 150, 150); doc.setLineWidth(0.45);
      const yc = yBase + 2;
      doc.line(x - 1.1, yc - 1.6, x + 0.9, yc + 0.5);
      doc.line(x + 0.9, yc + 0.5, x - 0.3, yc + 1.8);
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
      doc.setDrawColor(20); doc.setLineWidth(0.35);
      const yTie = yBase + 2;
      const profundidad = 1.7;
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
      const r = col.grupo ? 0.55 : 0.9;
      const xPlica = xj + r;
      doc.circle(xj, yBase, r, 'F');
      doc.setLineWidth(0.28);
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
      if(col.caracter === 'X'){
        const ax = xPlica - 0.32, ay = yBase - altoPlica - 0.4;
        doc.setDrawColor(20, 20, 20); doc.setLineWidth(0.34);
        doc.line(ax, ay - 0.83, ax + 0.64, ay - 0.42);
        doc.line(ax + 0.64, ay - 0.42, ax, ay - 0.0);
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
        for(let k = j; k < jFin; k++) if(esNota(cols[k].caracter)) idxGolpes.push(k);
        if(idxGolpes.length >= 2){
          const rIni = cols[idxGolpes[0]].grupo ? 0.55 : 0.9;
          const rFin = cols[idxGolpes[idxGolpes.length - 1]].grupo ? 0.55 : 0.9;
          const xIni = xInfo[idxGolpes[0]].xCentro + rIni;
          const xFin = xInfo[idxGolpes[idxGolpes.length - 1]].xCentro + rFin;
          doc.setLineWidth(0.75);
          doc.line(xIni, yBase - altoPlica, xFin, yBase - altoPlica);
          // v1.27: (a pedido) doble barra cuando el grupo es de 6
          // (sextillo = semicorchea), simple para 3 (tresillo/corchea).
          if(size === 6){
            doc.line(xIni, yBase - altoPlica + 1.3, xFin, yBase - altoPlica + 1.3);
          }
          const xMedio = (xIni + xFin) / 2;
          doc.setFontSize(5);
          doc.setTextColor(20);
          doc.text(String(col.grupo.numero), xMedio, yBase - altoPlica - 4.5, { align: 'center' });
        } else if(idxGolpes.length === 1){
          const r = cols[idxGolpes[0]].grupo ? 0.55 : 0.9;
          const xa = xInfo[idxGolpes[0]].xCentro + r;
          const yTop = yBase - altoPlica;
          doc.setFillColor(20, 20, 20);
          doc.lines(
            [
              [1.6, 0.3, 1.75, 1.35, 0.4, 2.45],
              [0.7, -1.15, 0.45, -1.85, -0.4, -2.45]
            ],
            xa, yTop, [1, 1], 'F', true
          );
          doc.setFontSize(5);
          doc.setTextColor(20);
          doc.text(String(col.grupo.numero), xa, yBase - altoPlica - 4.5, { align: 'center' });
        }
        j = jFin;
      } else if(esNota(col.caracter)){
        const nextCol = (j + 1 < n && !cols[j + 1].grupo) ? cols[j + 1] : null;
        const xa = xInfo[j].xCentro + 0.9;
        if(nextCol && esNota(nextCol.caracter)){
          const xb = xInfo[j + 1].xCentro + 0.9;
          doc.setLineWidth(0.75);
          doc.line(xa, yBase - altoPlica, xb, yBase - altoPlica);
          j += 2;
        } else {
          // v1.27: (a pedido) bandera curva (bezier) en vez de la línea
          // recta diagonal, acercándose a la notación real de corchea
          // suelta. Mismo criterio/forma que patronRitmicoSVG v1.49,
          // adaptado a la API de curvas de jsPDF (doc.lines con
          // segmentos de 6 valores = bezier, deltas relativos al punto
          // anterior). Probado aislado en Node+jsPDF antes de aplicar.
          const yTop = yBase - altoPlica;
          doc.setFillColor(20, 20, 20);
          doc.lines(
            [
              [1.6, 0.3, 1.75, 1.35, 0.4, 2.45],
              [0.7, -1.15, 0.45, -1.85, -0.4, -2.45]
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
