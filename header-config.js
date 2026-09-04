// AUDIOLINK · header-config.js · v1.9
// v1.9: (a pedido) inicializarHeaderConfig() ahora también LEE
// configHeader/global de Firestore (antes v1.8 solo escribía) — ver nota
// completa junto a la función, más abajo. Efecto: el diseño del header
// configurado una vez en header-config.html se ve igual en todas las
// páginas consumidoras (logistica.html, guia-practica.html,
// musico.html) sin depender del localStorage de cada navegador/origen
// file://. La función vieja se renombró a _aplicarHeaderConfigLocal()
// (lógica intacta, ni una línea cambiada) y inicializarHeaderConfig()
// pasa a ser un wrapper: aplica local primero, después intenta Firestore
// y reaplica si hay datos. Ningún consumidor necesita cambiar nada — el
// nombre público de la función es el mismo.
// v1.8: (a pedido) la config del header ahora también se sincroniza a
// Firestore (configHeader/global, un solo doc) además de localStorage —
// ver sincronizarConfigHeaderFirestore() más abajo. Motivo: localStorage
// es por navegador/dispositivo, así que páginas abiertas por otras
// personas en sus propios dispositivos (ej. musico.html) no podían leer
// la config guardada acá. Se enganchó UNA sola vez, al final de
// actualizarHeaderPreview() (que ya se llama desde cada actualizar*() de
// este archivo) en vez de agregar la escritura a mano en cada una de las
// ~15 funciones — mismo efecto ("cada cambio también escribe a
// Firestore"), un solo punto de entrada, cero riesgo de que una función
// nueva se quede sin sincronizar. Con debounce de 600ms para no escribir
// un doc por cada pixel que se arrastra en un slider. Se sincronizan
// solo los campos que un PDF jsPDF usa de verdad (logo/diffuser path,
// color, opacidades, tamaño/align/offsetY del logo, sin-fondo/sin-logo)
// — los efectos CSS "solo modo piloto" (blur, grises, contraste, sombra,
// rotación, hue, saturate, sepia) se omiten a propósito, ya documentados
// como sin efecto en jsPDF. No cambia ningún flujo existente
// (localStorage, preview, Cloudinary, galería) — es 100% agregado. Si
// `db` (Firestore) no está disponible en la página, la sincronización se
// omite en silencio (no rompe el preview).
// v1.7: (1) Nuevo checkbox LOGO_SIN_LOGO — oculta el logo por completo
// (display:none, no solo opacity) tanto en el preview (#headerPreviewLogo)
// como en la imagen oculta que usa pintarHeader() de cada página
// (#hdrLogo). Antes, si el campo de ruta quedaba vacío o inválido,
// aparecía el ícono "alt" roto del navegador — con display:none eso ya
// no puede pasar. (2) HEADER_SIN_FONDO ahora también aplica display:none
// al diffuser (antes solo opacity:0) — mismo blindaje contra el ícono
// roto, sin cambiar el resto de su comportamiento (fondo blanco sólido
// se mantiene igual). Ningún otro flujo se toca. Falta: que cada
// pintarHeader() real (jsPDF) de logistica.html y demás consumidores
// lea LOGO_SIN_LOGO para omitir el logo en el PDF exportado — pendiente,
// se hace por separado en cada módulo.
//
// v1.6: 5 nuevos efectos CSS del FONDO del header (imagen diffuser) —
// DIFFUSER_BLUR, DIFFUSER_GRAYSCALE, DIFFUSER_CONTRAST, DIFFUSER_SOMBRA
// (checkbox), DIFFUSER_ROTACION. Mismo patrón que los efectos del logo
// (v1.4): se aplican al diffuser del preview (acá) y al header HTML del
// PDF piloto (logistica.html exportarPDFSesionHTML()) vía
// construirFiltroDiffuser(). HEADER_DIFFUSER_OPACITY ya existía desde
// antes de v1.4, se reutiliza tal cual. Rangos más libres que los del
// logo: blur 0–20px, grises 0–100%, contraste 0–200%, rotación -45°/45°.
// En los PDF jsPDF ningún efecto nuevo tiene efecto real (documentado
// igual que con el logo) — el diffuser en jsPDF solo usa su ruta/imagen
// tal cual, sin filtros.
//
// v1.5: 3 nuevos efectos de COLOR del logo — LOGO_HUE (hue-rotate,
// -180°/180°), LOGO_SATURATE (0–300%), LOGO_SEPIA (0–100%). Se suman a
// construirFiltroLogo() junto a los 4 de v1.4. Rangos deliberadamente
// más amplios/libres que blur/contraste (pedido explícito: "menos
// estricto y más libre con sliders"). Solo modo piloto/preview, igual
// que el resto de efectos del logo salvo LOGO_OPACITY.
//
// v1.4: 6 nuevos efectos CSS del logo — LOGO_OPACITY, LOGO_BLUR,
// LOGO_GRAYSCALE, LOGO_CONTRAST, LOGO_SOMBRA (checkbox), LOGO_ROTACION.
// Se aplican al logo del preview (acá) y al header HTML del PDF piloto
// (logistica.html exportarPDFSesionHTML()) vía construirFiltroLogo().
// En los PDF jsPDF (exportarPDF()/exportarPDFSesion()) SOLO LOGO_OPACITY
// tiene efecto real (vía doc.setGState) — jsPDF no soporta blur/grises/
// contraste/sombra/rotación de imagen sin reprocesarla a canvas, así que
// esos 5 quedan "solo modo piloto" por ahora, documentado en cada
// *_DEFAULT de abajo.
// Lógica compartida de configuración del header de PDF (logo, diffuser,
// color, opacidades, tamaño/alineación del logo) — extraída de logistica.html
// v2.109 para reutilizar en todo el ecosistema (proyecto.html, cotizador.html,
// egresos.html, etc.) cuando exporten PDF con el mismo tipo de header.
//
// v1.1: (1) LOGO_OFFSET_X (slider libre en mm) reemplazado por LOGO_ALIGN
// ('izquierda'|'centro'|'derecha') — cada pintarHeader() consumidor debe
// calcular la X final según este valor (ver logistica.html v2.111 como
// referencia). (2) marginXmm del preview pasa de 15 a 18 para igualar el
// marginX real usado en jsPDF (logistica.html). (3) Nuevo bloque CLOUDINARY:
// subida directa de logo/diffuser (mismo cloud_name/preset unsigned 'ICONOS'
// que avatares-iconos.html, folder propio 'HEADER') — al subir, se guarda la
// URL resultante en el mismo input de ruta de siempre, sin tocar el resto
// del flujo (localStorage, preview, pintarHeader() de cada página).
//
// v1.2: cada subida a Cloudinary ahora también registra un documento en
// Firestore (colección 'headerImagenes') y se agregó escucharGaleriaHeader()
// para listar en tiempo real las imágenes ya subidas — ver
// header-config.html v1.2 para los contenedores #logoGaleria/#diffuserGaleria
// y la carga de Firebase que esto requiere. Si la página consumidora no
// carga Firebase (no define `db`), todo lo demás sigue funcionando igual,
// solo se omite la galería.
//
// v1.3: fix de folder — CLOUDINARY_UPLOAD_PRESET pasa de 'ICONOS' a
// 'HEADER' (preset unsigned ya existente en Cloudinary con Asset folder
// fijo = HEADER). El preset 'ICONOS' tiene su propio Asset folder fijo
// (ICONOS), que Cloudinary prioriza sobre el parámetro `folder` del
// FormData — por eso todas las subidas caían ahí sin importar
// CLOUDINARY_FOLDER_HEADER. No se toca ningún otro flujo.
//
// Requiere en el HTML consumidor:
//   - Inputs con estos IDs (los que apliquen): logoPathInput,
//     diffuserPathInput, headerColorInput, headerSinFondoInput,
//     headerColorOpacityInput, headerDiffuserOpacityInput, logoSizeInput,
//     logoAlignButtons (data-align="izquierda|centro|derecha"), logoOffsetYInput
//   - Preview opcional: headerPreviewBox / headerPreviewDiffuser /
//     headerPreviewColor / headerPreviewLogo
//   - Imágenes ocultas leídas por pintarHeader() propio de cada página:
//     #hdrLogo, #hdrDiffuser (o las que cada pintarHeader() use)
//   - Llamar a inicializarHeaderConfig() dentro del propio
//     DOMContentLoaded de la página consumidora.
//
// pintarHeader() (la función jsPDF que realmente dibuja el PDF) NO vive
// acá — cada página mantiene la suya, leyendo estas variables globales
// (LOGO_SIZE, LOGO_ALIGN, HEADER_COLOR_RGB, etc.) igual que antes.

const LOGO_PATH_DEFAULT = 'img/logo%201.png';
const DIFFUSER_PATH_DEFAULT = 'img/DIFFUSER.jpg';
const HEADER_COLOR_DEFAULT = '#0b0b0d';
const HEADER_COLOR_OPACITY_DEFAULT = 0.62;
const HEADER_DIFFUSER_OPACITY_DEFAULT = 1.0;
const LOGO_SIZE_DEFAULT = 16;
const LOGO_ALIGN_DEFAULT = 'izquierda';
const LOGO_OFFSET_Y_DEFAULT = 0;
// v1.7: oculta el logo por completo (display:none) — ver nota de v1.7 arriba.
const LOGO_SIN_LOGO_DEFAULT = false;
// v1.4: efectos CSS del logo — solo afectan preview y el header HTML del
// PDF piloto (ver logistica.html exportarPDFSesionHTML()). En los PDF
// jsPDF (exportarPDF()/exportarPDFSesion()) SOLO se aplica LOGO_OPACITY,
// vía doc.setGState() — blur/grises/contraste/sombra/rotación no tienen
// equivalente nativo en jsPDF sin reprocesar la imagen a canvas, así que
// ahí se ignoran.
const LOGO_OPACITY_DEFAULT = 1;
const LOGO_BLUR_DEFAULT = 0;
const LOGO_GRAYSCALE_DEFAULT = 0;
const LOGO_CONTRAST_DEFAULT = 100;
const LOGO_SOMBRA_DEFAULT = false;
const LOGO_ROTACION_DEFAULT = 0;
// v1.5: efectos de color del logo — solo modo piloto/preview, mismo
// alcance que blur/grises/contraste/sombra/rotación de v1.4.
const LOGO_HUE_DEFAULT = 0;
const LOGO_SATURATE_DEFAULT = 100;
const LOGO_SEPIA_DEFAULT = 0;

// v1.6: efectos del FONDO del header (diffuser) — solo modo
// piloto/preview, igual alcance que los del logo salvo la opacidad
// (HEADER_DIFFUSER_OPACITY, que ya existía y sí aplica en todos lados).
const DIFFUSER_BLUR_DEFAULT = 0;
const DIFFUSER_GRAYSCALE_DEFAULT = 0;
const DIFFUSER_CONTRAST_DEFAULT = 100;
const DIFFUSER_SOMBRA_DEFAULT = false;
const DIFFUSER_ROTACION_DEFAULT = 0;

// v1.3: config Cloudinary — preset unsigned propio 'HEADER' (antes
// 'ICONOS', compartido con avatares-iconos.html; ver changelog v1.3).
const CLOUDINARY_CLOUD_NAME = 'dv7lelmoy';
const CLOUDINARY_UPLOAD_PRESET = 'HEADER';
const CLOUDINARY_FOLDER_HEADER = 'HEADER';

let HEADER_COLOR_RGB = [11, 11, 13];
let HEADER_SIN_FONDO = false;
let HEADER_COLOR_OPACITY = HEADER_COLOR_OPACITY_DEFAULT;
let HEADER_DIFFUSER_OPACITY = HEADER_DIFFUSER_OPACITY_DEFAULT;
let LOGO_SIZE = LOGO_SIZE_DEFAULT;
let LOGO_ALIGN = LOGO_ALIGN_DEFAULT;
let LOGO_OFFSET_Y = LOGO_OFFSET_Y_DEFAULT;
let LOGO_SIN_LOGO = LOGO_SIN_LOGO_DEFAULT;
let LOGO_OPACITY = LOGO_OPACITY_DEFAULT;
let LOGO_BLUR = LOGO_BLUR_DEFAULT;
let LOGO_GRAYSCALE = LOGO_GRAYSCALE_DEFAULT;
let LOGO_CONTRAST = LOGO_CONTRAST_DEFAULT;
let LOGO_SOMBRA = LOGO_SOMBRA_DEFAULT;
let LOGO_ROTACION = LOGO_ROTACION_DEFAULT;
let LOGO_HUE = LOGO_HUE_DEFAULT;
let LOGO_SATURATE = LOGO_SATURATE_DEFAULT;
let LOGO_SEPIA = LOGO_SEPIA_DEFAULT;

let DIFFUSER_BLUR = DIFFUSER_BLUR_DEFAULT;
let DIFFUSER_GRAYSCALE = DIFFUSER_GRAYSCALE_DEFAULT;
let DIFFUSER_CONTRAST = DIFFUSER_CONTRAST_DEFAULT;
let DIFFUSER_SOMBRA = DIFFUSER_SOMBRA_DEFAULT;
let DIFFUSER_ROTACION = DIFFUSER_ROTACION_DEFAULT;

function hexToRgbArray(hex){
  const n = parseInt(hex.replace('#',''), 16);
  return [(n>>16)&255, (n>>8)&255, n&255];
}

function actualizarLogoPath(valor){
  const ruta = (valor || '').trim();
  localStorage.setItem('audiolink_logo_path', ruta);
  const imgLogo = document.getElementById('hdrLogo');
  if(imgLogo) imgLogo.src = ruta || LOGO_PATH_DEFAULT;
  actualizarHeaderPreview();
}

function actualizarDiffuserPath(valor){
  const ruta = (valor || '').trim();
  localStorage.setItem('audiolink_diffuser_path', ruta);
  const imgDiffuser = document.getElementById('hdrDiffuser');
  if(imgDiffuser) imgDiffuser.src = ruta || DIFFUSER_PATH_DEFAULT;
  actualizarHeaderPreview();
}

function actualizarHeaderColor(valor){
  const hex = valor || HEADER_COLOR_DEFAULT;
  localStorage.setItem('audiolink_header_color', hex);
  HEADER_COLOR_RGB = hexToRgbArray(hex);
  actualizarHeaderPreview();
}

function actualizarHeaderSinFondo(activo){
  localStorage.setItem('audiolink_header_sin_fondo', activo ? '1' : '0');
  HEADER_SIN_FONDO = !!activo;
  actualizarHeaderPreview();
}

function actualizarHeaderColorOpacity(valor){
  const n = parseFloat(valor);
  HEADER_COLOR_OPACITY = isNaN(n) ? HEADER_COLOR_OPACITY_DEFAULT : n;
  localStorage.setItem('audiolink_header_color_opacity', String(HEADER_COLOR_OPACITY));
  actualizarHeaderPreview();
}

function actualizarHeaderDiffuserOpacity(valor){
  const n = parseFloat(valor);
  HEADER_DIFFUSER_OPACITY = isNaN(n) ? HEADER_DIFFUSER_OPACITY_DEFAULT : n;
  localStorage.setItem('audiolink_header_diffuser_opacity', String(HEADER_DIFFUSER_OPACITY));
  actualizarHeaderPreview();
}

function actualizarLogoSize(valor){
  const n = parseFloat(valor);
  LOGO_SIZE = isNaN(n) ? LOGO_SIZE_DEFAULT : n;
  localStorage.setItem('audiolink_logo_size', String(LOGO_SIZE));
  actualizarHeaderPreview();
}

function actualizarLogoAlign(valor){
  const opciones = ['izquierda', 'centro', 'derecha'];
  LOGO_ALIGN = opciones.includes(valor) ? valor : LOGO_ALIGN_DEFAULT;
  localStorage.setItem('audiolink_logo_align', LOGO_ALIGN);
  actualizarBotonesAlign();
  actualizarHeaderPreview();
}

function actualizarBotonesAlign(){
  // Refleja el estado activo en los 3 botones de alineación (data-align).
  document.querySelectorAll('[data-logo-align]').forEach(btn => {
    btn.classList.toggle('activo', btn.getAttribute('data-logo-align') === LOGO_ALIGN);
  });
}

function actualizarLogoOffsetY(valor){
  const n = parseFloat(valor);
  LOGO_OFFSET_Y = isNaN(n) ? LOGO_OFFSET_Y_DEFAULT : n;
  localStorage.setItem('audiolink_logo_offset_y', String(LOGO_OFFSET_Y));
  actualizarHeaderPreview();
}

// v1.7: oculta el logo por completo con display:none (no opacity) para
// evitar el ícono "alt" roto cuando la ruta queda vacía/inválida.
// Afecta tanto el preview (#headerPreviewLogo) como #hdrLogo (la imagen
// oculta que lee pintarHeader() de cada página consumidora).
function actualizarLogoSinLogo(activo){
  LOGO_SIN_LOGO = !!activo;
  localStorage.setItem('audiolink_logo_sin_logo', LOGO_SIN_LOGO ? '1' : '0');
  const imgLogoOculto = document.getElementById('hdrLogo');
  if(imgLogoOculto) imgLogoOculto.style.display = LOGO_SIN_LOGO ? 'none' : '';
  actualizarHeaderPreview();
}

// v1.4: efectos CSS del logo — mismo patrón que el resto (set var, guarda
// en localStorage, repinta preview). Ver nota junto a los *_DEFAULT sobre
// el alcance real en jsPDF (solo LOGO_OPACITY aplica ahí).
function actualizarLogoOpacity(valor){
  const n = parseFloat(valor);
  LOGO_OPACITY = isNaN(n) ? LOGO_OPACITY_DEFAULT : n;
  localStorage.setItem('audiolink_logo_opacity', String(LOGO_OPACITY));
  actualizarHeaderPreview();
}

function actualizarLogoBlur(valor){
  const n = parseFloat(valor);
  LOGO_BLUR = isNaN(n) ? LOGO_BLUR_DEFAULT : n;
  localStorage.setItem('audiolink_logo_blur', String(LOGO_BLUR));
  actualizarHeaderPreview();
}

function actualizarLogoGrayscale(valor){
  const n = parseFloat(valor);
  LOGO_GRAYSCALE = isNaN(n) ? LOGO_GRAYSCALE_DEFAULT : n;
  localStorage.setItem('audiolink_logo_grayscale', String(LOGO_GRAYSCALE));
  actualizarHeaderPreview();
}

function actualizarLogoContrast(valor){
  const n = parseFloat(valor);
  LOGO_CONTRAST = isNaN(n) ? LOGO_CONTRAST_DEFAULT : n;
  localStorage.setItem('audiolink_logo_contrast', String(LOGO_CONTRAST));
  actualizarHeaderPreview();
}

function actualizarLogoSombra(activo){
  LOGO_SOMBRA = !!activo;
  localStorage.setItem('audiolink_logo_sombra', LOGO_SOMBRA ? '1' : '0');
  actualizarHeaderPreview();
}

function actualizarLogoRotacion(valor){
  const n = parseFloat(valor);
  LOGO_ROTACION = isNaN(n) ? LOGO_ROTACION_DEFAULT : n;
  localStorage.setItem('audiolink_logo_rotacion', String(LOGO_ROTACION));
  actualizarHeaderPreview();
}

// v1.5: efectos de color del logo — mismo patrón (set var, guarda en
// localStorage, repinta preview), rangos más libres (ver header-config.html).
function actualizarLogoHue(valor){
  const n = parseFloat(valor);
  LOGO_HUE = isNaN(n) ? LOGO_HUE_DEFAULT : n;
  localStorage.setItem('audiolink_logo_hue', String(LOGO_HUE));
  actualizarHeaderPreview();
}

function actualizarLogoSaturate(valor){
  const n = parseFloat(valor);
  LOGO_SATURATE = isNaN(n) ? LOGO_SATURATE_DEFAULT : n;
  localStorage.setItem('audiolink_logo_saturate', String(LOGO_SATURATE));
  actualizarHeaderPreview();
}

function actualizarLogoSepia(valor){
  const n = parseFloat(valor);
  LOGO_SEPIA = isNaN(n) ? LOGO_SEPIA_DEFAULT : n;
  localStorage.setItem('audiolink_logo_sepia', String(LOGO_SEPIA));
  actualizarHeaderPreview();
}

// v1.4: arma el filter/transform CSS combinado del logo a partir de las
// variables de efectos — lo usan tanto el preview (acá) como
// logistica.html al pintar el header HTML del PDF piloto, para no
// duplicar la fórmula en dos archivos. v1.5: se suman los 3 de color.
function construirFiltroLogo(){
  const partes = [];
  if(LOGO_BLUR > 0) partes.push(`blur(${LOGO_BLUR}px)`);
  if(LOGO_GRAYSCALE > 0) partes.push(`grayscale(${LOGO_GRAYSCALE}%)`);
  if(LOGO_CONTRAST !== 100) partes.push(`contrast(${LOGO_CONTRAST}%)`);
  if(LOGO_SATURATE !== 100) partes.push(`saturate(${LOGO_SATURATE}%)`);
  if(LOGO_HUE !== 0) partes.push(`hue-rotate(${LOGO_HUE}deg)`);
  if(LOGO_SEPIA > 0) partes.push(`sepia(${LOGO_SEPIA}%)`);
  if(LOGO_SOMBRA) partes.push(`drop-shadow(0 2px 4px rgba(0,0,0,0.5))`);
  return partes.length ? partes.join(' ') : 'none';
}

// v1.6: efectos del fondo del header (diffuser) — mismo patrón que el logo.
function actualizarDiffuserBlur(valor){
  const n = parseFloat(valor);
  DIFFUSER_BLUR = isNaN(n) ? DIFFUSER_BLUR_DEFAULT : n;
  localStorage.setItem('audiolink_diffuser_blur', String(DIFFUSER_BLUR));
  actualizarHeaderPreview();
}

function actualizarDiffuserGrayscale(valor){
  const n = parseFloat(valor);
  DIFFUSER_GRAYSCALE = isNaN(n) ? DIFFUSER_GRAYSCALE_DEFAULT : n;
  localStorage.setItem('audiolink_diffuser_grayscale', String(DIFFUSER_GRAYSCALE));
  actualizarHeaderPreview();
}

function actualizarDiffuserContrast(valor){
  const n = parseFloat(valor);
  DIFFUSER_CONTRAST = isNaN(n) ? DIFFUSER_CONTRAST_DEFAULT : n;
  localStorage.setItem('audiolink_diffuser_contrast', String(DIFFUSER_CONTRAST));
  actualizarHeaderPreview();
}

function actualizarDiffuserSombra(activo){
  DIFFUSER_SOMBRA = !!activo;
  localStorage.setItem('audiolink_diffuser_sombra', DIFFUSER_SOMBRA ? '1' : '0');
  actualizarHeaderPreview();
}

function actualizarDiffuserRotacion(valor){
  const n = parseFloat(valor);
  DIFFUSER_ROTACION = isNaN(n) ? DIFFUSER_ROTACION_DEFAULT : n;
  localStorage.setItem('audiolink_diffuser_rotacion', String(DIFFUSER_ROTACION));
  actualizarHeaderPreview();
}

// v1.6: arma el filter CSS del diffuser — mismo mecanismo que
// construirFiltroLogo(), usado por el preview (acá) y por
// logistica.html al pintar el header HTML del PDF piloto.
function construirFiltroDiffuser(){
  const partes = [];
  if(DIFFUSER_BLUR > 0) partes.push(`blur(${DIFFUSER_BLUR}px)`);
  if(DIFFUSER_GRAYSCALE > 0) partes.push(`grayscale(${DIFFUSER_GRAYSCALE}%)`);
  if(DIFFUSER_CONTRAST !== 100) partes.push(`contrast(${DIFFUSER_CONTRAST}%)`);
  if(DIFFUSER_SOMBRA) partes.push(`drop-shadow(0 2px 4px rgba(0,0,0,0.5))`);
  return partes.length ? partes.join(' ') : 'none';
}

// v1.8: escribe a configHeader/global (Firestore) los campos que jsPDF
// usa de verdad, leídos tal cual quedan en localStorage (fuente única de
// verdad ya existente). merge:true para no pisar otros campos que a
// futuro se agreguen al doc por fuera de este archivo. Debounce de
// 600ms: se llama desde actualizarHeaderPreview() en cada cambio, pero
// solo se escribe una vez que el usuario deja de mover el control.
let _syncConfigHeaderTimeout = null;
function sincronizarConfigHeaderFirestore(){
  if(typeof db === 'undefined' || !db) return;
  clearTimeout(_syncConfigHeaderTimeout);
  _syncConfigHeaderTimeout = setTimeout(() => {
    const payload = {
      logoPath: localStorage.getItem('audiolink_logo_path') || '',
      diffuserPath: localStorage.getItem('audiolink_diffuser_path') || '',
      headerColor: localStorage.getItem('audiolink_header_color') || HEADER_COLOR_DEFAULT,
      headerSinFondo: localStorage.getItem('audiolink_header_sin_fondo') === '1',
      headerColorOpacity: parseFloat(localStorage.getItem('audiolink_header_color_opacity')) || HEADER_COLOR_OPACITY_DEFAULT,
      headerDiffuserOpacity: parseFloat(localStorage.getItem('audiolink_header_diffuser_opacity')) ?? HEADER_DIFFUSER_OPACITY_DEFAULT,
      logoSize: parseFloat(localStorage.getItem('audiolink_logo_size')) || LOGO_SIZE_DEFAULT,
      logoAlign: localStorage.getItem('audiolink_logo_align') || LOGO_ALIGN_DEFAULT,
      logoOffsetY: parseFloat(localStorage.getItem('audiolink_logo_offset_y')) || LOGO_OFFSET_Y_DEFAULT,
      logoSinLogo: localStorage.getItem('audiolink_logo_sin_logo') === '1',
      actualizadoEn: new Date().toISOString()
    };
    db.collection('configHeader').doc('global').set(payload, { merge: true }).catch(err => {
      console.warn('No se pudo sincronizar configHeader/global a Firestore:', err);
    });
  }, 600);
}

function actualizarHeaderPreview(){
  // Refleja visualmente (CSS, no jsPDF) las mismas variables que
  // pintarHeader() de cada página usa para exportar — puramente
  // informativo, no genera PDF ni toca la lógica de exportación.
  const box = document.getElementById('headerPreviewBox');
  if(!box) return;
  const imgDiffuser = document.getElementById('headerPreviewDiffuser');
  const capaColor = document.getElementById('headerPreviewColor');
  const imgLogo = document.getElementById('headerPreviewLogo');

  const rutaLogo = document.getElementById('logoPathInput')?.value.trim() || LOGO_PATH_DEFAULT;
  const rutaDiffuser = document.getElementById('diffuserPathInput')?.value.trim() || DIFFUSER_PATH_DEFAULT;
  if(imgLogo) imgLogo.src = rutaLogo;
  if(imgDiffuser) imgDiffuser.src = rutaDiffuser;

  // Tamaño y posición del logo — mismo cálculo en mm que pintarHeader()
  // (marginX=18, headerH=38, pageW=210 — v1.1: igualado al marginX real
  // de jsPDF en logistica.html, antes 15mm solo acá en el preview),
  // convertido a % sobre el box 210x38 para que el preview coincida
  // visualmente con el PDF real. RESERVA_DERECHA_MM: mismo valor que
  // logistica.html v2.111 para dejar espacio al subtítulo derecho.
  if(imgLogo){
    const marginXmm = 18;
    const headerHmm = 38;
    const pageWmm = 210;
    const reservaDerechaMm = 62;
    const logoHmm = LOGO_SIZE;
    // Ancho estimado del logo a partir de su proporción real (si ya cargó);
    // si aún no carga, usa una proporción típica 2.5:1 solo para el preview.
    const ratio = (imgLogo.naturalWidth && imgLogo.naturalHeight) ? (imgLogo.naturalWidth / imgLogo.naturalHeight) : 2.5;
    const logoWmm = logoHmm * ratio;
    const logoYmm = (headerHmm - logoHmm) / 2 + LOGO_OFFSET_Y;
    let logoXmm;
    if(LOGO_ALIGN === 'centro'){
      logoXmm = (pageWmm - logoWmm) / 2;
    } else if(LOGO_ALIGN === 'derecha'){
      logoXmm = pageWmm - marginXmm - reservaDerechaMm - logoWmm;
    } else {
      logoXmm = marginXmm;
    }
    imgLogo.style.height = (logoHmm / headerHmm * 100) + '%';
    imgLogo.style.top = (logoYmm / headerHmm * 100) + '%';
    imgLogo.style.left = (logoXmm / pageWmm * 100) + '%';
    imgLogo.style.width = 'auto';
    imgLogo.style.maxWidth = 'none';
    // v1.4: rotación se suma al transform (antes solo 'none'); opacidad y
    // el resto de efectos (blur/grises/contraste/sombra) van en filter.
    imgLogo.style.transform = LOGO_ROTACION !== 0 ? `rotate(${LOGO_ROTACION}deg)` : 'none';
    imgLogo.style.opacity = String(LOGO_OPACITY);
    imgLogo.style.filter = construirFiltroLogo();
    // v1.7: display:none (no solo opacity) para que nunca aparezca el
    // ícono "alt" roto si la ruta está vacía/inválida.
    imgLogo.style.display = LOGO_SIN_LOGO ? 'none' : '';
  }

  // v1.6: efectos del diffuser (filter + rotación) — se aplican siempre
  // que la imagen esté visible; si HEADER_SIN_FONDO está activo, el
  // bloque de abajo ya la oculta con opacity:0, así que no importa.
  if(imgDiffuser){
    imgDiffuser.style.filter = construirFiltroDiffuser();
    imgDiffuser.style.transform = DIFFUSER_ROTACION !== 0 ? `rotate(${DIFFUSER_ROTACION}deg)` : 'none';
  }

  if(HEADER_SIN_FONDO){
    // v1.7: display:none (no solo opacity:0) — blindaje contra el ícono
    // "alt" roto si la ruta del diffuser está vacía/inválida.
    if(imgDiffuser){ imgDiffuser.style.opacity = '0'; imgDiffuser.style.display = 'none'; }
    if(capaColor) capaColor.style.background = '#ffffff';
    if(capaColor) capaColor.style.opacity = '1';
  } else {
    if(imgDiffuser){ imgDiffuser.style.opacity = String(HEADER_DIFFUSER_OPACITY); imgDiffuser.style.display = ''; }
    if(capaColor) capaColor.style.background = `rgb(${HEADER_COLOR_RGB.join(',')})`;
    if(capaColor) capaColor.style.opacity = String(HEADER_COLOR_OPACITY);
  }

  // v1.8: cada repintado del preview = cada cambio de valor real, así
  // que este es el mismo punto de entrada para sincronizar a Firestore.
  sincronizarConfigHeaderFirestore();
}

function _aplicarHeaderConfigLocal(){
  // Restaura todos los valores desde localStorage y pinta el preview.
  // Cada página consumidora llama a esto dentro de su propio
  // DOMContentLoaded (después de que el HTML de los inputs ya existe).
  const rutaGuardada = localStorage.getItem('audiolink_logo_path');
  const inputLogo = document.getElementById('logoPathInput');
  if(rutaGuardada){
    if(inputLogo) inputLogo.value = rutaGuardada;
    const imgLogo = document.getElementById('hdrLogo');
    if(imgLogo) imgLogo.src = rutaGuardada;
  }

  const diffuserRutaGuardada = localStorage.getItem('audiolink_diffuser_path');
  const inputDiffuser = document.getElementById('diffuserPathInput');
  if(diffuserRutaGuardada){
    if(inputDiffuser) inputDiffuser.value = diffuserRutaGuardada;
    const imgDiffuser = document.getElementById('hdrDiffuser');
    if(imgDiffuser) imgDiffuser.src = diffuserRutaGuardada;
  }

  const colorGuardado = localStorage.getItem('audiolink_header_color') || HEADER_COLOR_DEFAULT;
  const inputColor = document.getElementById('headerColorInput');
  if(inputColor) inputColor.value = colorGuardado;
  HEADER_COLOR_RGB = hexToRgbArray(colorGuardado);

  const sinFondoGuardado = localStorage.getItem('audiolink_header_sin_fondo') === '1';
  const inputSinFondo = document.getElementById('headerSinFondoInput');
  if(inputSinFondo) inputSinFondo.checked = sinFondoGuardado;
  HEADER_SIN_FONDO = sinFondoGuardado;

  const colorOpacityGuardada = localStorage.getItem('audiolink_header_color_opacity');
  HEADER_COLOR_OPACITY = colorOpacityGuardada !== null ? parseFloat(colorOpacityGuardada) : HEADER_COLOR_OPACITY_DEFAULT;
  const inputColorOpacity = document.getElementById('headerColorOpacityInput');
  if(inputColorOpacity) inputColorOpacity.value = HEADER_COLOR_OPACITY;

  const diffuserOpacityGuardada = localStorage.getItem('audiolink_header_diffuser_opacity');
  HEADER_DIFFUSER_OPACITY = diffuserOpacityGuardada !== null ? parseFloat(diffuserOpacityGuardada) : HEADER_DIFFUSER_OPACITY_DEFAULT;
  const inputDiffuserOpacity = document.getElementById('headerDiffuserOpacityInput');
  if(inputDiffuserOpacity) inputDiffuserOpacity.value = HEADER_DIFFUSER_OPACITY;

  const logoSizeGuardado = localStorage.getItem('audiolink_logo_size');
  LOGO_SIZE = logoSizeGuardado !== null ? parseFloat(logoSizeGuardado) : LOGO_SIZE_DEFAULT;
  const inputLogoSize = document.getElementById('logoSizeInput');
  if(inputLogoSize) inputLogoSize.value = LOGO_SIZE;

  const logoAlignGuardado = localStorage.getItem('audiolink_logo_align');
  LOGO_ALIGN = (logoAlignGuardado && ['izquierda','centro','derecha'].includes(logoAlignGuardado)) ? logoAlignGuardado : LOGO_ALIGN_DEFAULT;
  actualizarBotonesAlign();

  const logoOffsetYGuardado = localStorage.getItem('audiolink_logo_offset_y');
  LOGO_OFFSET_Y = logoOffsetYGuardado !== null ? parseFloat(logoOffsetYGuardado) : LOGO_OFFSET_Y_DEFAULT;
  const inputLogoOffsetY = document.getElementById('logoOffsetYInput');
  if(inputLogoOffsetY) inputLogoOffsetY.value = LOGO_OFFSET_Y;

  // v1.7: LOGO_SIN_LOGO
  const logoSinLogoGuardado = localStorage.getItem('audiolink_logo_sin_logo') === '1';
  LOGO_SIN_LOGO = logoSinLogoGuardado;
  const inputLogoSinLogo = document.getElementById('logoSinLogoInput');
  if(inputLogoSinLogo) inputLogoSinLogo.checked = LOGO_SIN_LOGO;
  const imgLogoOcultoInit = document.getElementById('hdrLogo');
  if(imgLogoOcultoInit) imgLogoOcultoInit.style.display = LOGO_SIN_LOGO ? 'none' : '';

  // v1.4: efectos del logo (opacidad/blur/grises/contraste/sombra/rotación)
  const logoOpacityGuardada = localStorage.getItem('audiolink_logo_opacity');
  LOGO_OPACITY = logoOpacityGuardada !== null ? parseFloat(logoOpacityGuardada) : LOGO_OPACITY_DEFAULT;
  const inputLogoOpacity = document.getElementById('logoOpacityInput');
  if(inputLogoOpacity) inputLogoOpacity.value = LOGO_OPACITY;

  const logoBlurGuardado = localStorage.getItem('audiolink_logo_blur');
  LOGO_BLUR = logoBlurGuardado !== null ? parseFloat(logoBlurGuardado) : LOGO_BLUR_DEFAULT;
  const inputLogoBlur = document.getElementById('logoBlurInput');
  if(inputLogoBlur) inputLogoBlur.value = LOGO_BLUR;

  const logoGrayscaleGuardado = localStorage.getItem('audiolink_logo_grayscale');
  LOGO_GRAYSCALE = logoGrayscaleGuardado !== null ? parseFloat(logoGrayscaleGuardado) : LOGO_GRAYSCALE_DEFAULT;
  const inputLogoGrayscale = document.getElementById('logoGrayscaleInput');
  if(inputLogoGrayscale) inputLogoGrayscale.value = LOGO_GRAYSCALE;

  const logoContrastGuardado = localStorage.getItem('audiolink_logo_contrast');
  LOGO_CONTRAST = logoContrastGuardado !== null ? parseFloat(logoContrastGuardado) : LOGO_CONTRAST_DEFAULT;
  const inputLogoContrast = document.getElementById('logoContrastInput');
  if(inputLogoContrast) inputLogoContrast.value = LOGO_CONTRAST;

  const logoSombraGuardada = localStorage.getItem('audiolink_logo_sombra') === '1';
  LOGO_SOMBRA = logoSombraGuardada;
  const inputLogoSombra = document.getElementById('logoSombraInput');
  if(inputLogoSombra) inputLogoSombra.checked = LOGO_SOMBRA;

  const logoRotacionGuardada = localStorage.getItem('audiolink_logo_rotacion');
  LOGO_ROTACION = logoRotacionGuardada !== null ? parseFloat(logoRotacionGuardada) : LOGO_ROTACION_DEFAULT;
  const inputLogoRotacion = document.getElementById('logoRotacionInput');
  if(inputLogoRotacion) inputLogoRotacion.value = LOGO_ROTACION;

  // v1.5: efectos de color del logo
  const logoHueGuardado = localStorage.getItem('audiolink_logo_hue');
  LOGO_HUE = logoHueGuardado !== null ? parseFloat(logoHueGuardado) : LOGO_HUE_DEFAULT;
  const inputLogoHue = document.getElementById('logoHueInput');
  if(inputLogoHue) inputLogoHue.value = LOGO_HUE;

  const logoSaturateGuardado = localStorage.getItem('audiolink_logo_saturate');
  LOGO_SATURATE = logoSaturateGuardado !== null ? parseFloat(logoSaturateGuardado) : LOGO_SATURATE_DEFAULT;
  const inputLogoSaturate = document.getElementById('logoSaturateInput');
  if(inputLogoSaturate) inputLogoSaturate.value = LOGO_SATURATE;

  const logoSepiaGuardado = localStorage.getItem('audiolink_logo_sepia');
  LOGO_SEPIA = logoSepiaGuardado !== null ? parseFloat(logoSepiaGuardado) : LOGO_SEPIA_DEFAULT;
  const inputLogoSepia = document.getElementById('logoSepiaInput');
  if(inputLogoSepia) inputLogoSepia.value = LOGO_SEPIA;

  // v1.6: efectos del fondo (diffuser)
  const diffuserBlurGuardado = localStorage.getItem('audiolink_diffuser_blur');
  DIFFUSER_BLUR = diffuserBlurGuardado !== null ? parseFloat(diffuserBlurGuardado) : DIFFUSER_BLUR_DEFAULT;
  const inputDiffuserBlur = document.getElementById('diffuserBlurInput');
  if(inputDiffuserBlur) inputDiffuserBlur.value = DIFFUSER_BLUR;

  const diffuserGrayscaleGuardado = localStorage.getItem('audiolink_diffuser_grayscale');
  DIFFUSER_GRAYSCALE = diffuserGrayscaleGuardado !== null ? parseFloat(diffuserGrayscaleGuardado) : DIFFUSER_GRAYSCALE_DEFAULT;
  const inputDiffuserGrayscale = document.getElementById('diffuserGrayscaleInput');
  if(inputDiffuserGrayscale) inputDiffuserGrayscale.value = DIFFUSER_GRAYSCALE;

  const diffuserContrastGuardado = localStorage.getItem('audiolink_diffuser_contrast');
  DIFFUSER_CONTRAST = diffuserContrastGuardado !== null ? parseFloat(diffuserContrastGuardado) : DIFFUSER_CONTRAST_DEFAULT;
  const inputDiffuserContrast = document.getElementById('diffuserContrastInput');
  if(inputDiffuserContrast) inputDiffuserContrast.value = DIFFUSER_CONTRAST;

  const diffuserSombraGuardada = localStorage.getItem('audiolink_diffuser_sombra') === '1';
  DIFFUSER_SOMBRA = diffuserSombraGuardada;
  const inputDiffuserSombra = document.getElementById('diffuserSombraInput');
  if(inputDiffuserSombra) inputDiffuserSombra.checked = DIFFUSER_SOMBRA;

  const diffuserRotacionGuardada = localStorage.getItem('audiolink_diffuser_rotacion');
  DIFFUSER_ROTACION = diffuserRotacionGuardada !== null ? parseFloat(diffuserRotacionGuardada) : DIFFUSER_ROTACION_DEFAULT;
  const inputDiffuserRotacion = document.getElementById('diffuserRotacionInput');
  if(inputDiffuserRotacion) inputDiffuserRotacion.value = DIFFUSER_ROTACION;

  actualizarHeaderPreview();
  // v1.2: la galería (escucharGaleriaHeader) YA NO se llama acá — necesita
  // que la sesión de Firebase ya esté confirmada (ver guard de sesión en
  // header-config.html), así que ese archivo la dispara directamente
  // después de validar auth, no en cada inicializarHeaderConfig().
}

// v1.9: (a pedido) el diseño del header ahora se comparte de verdad entre
// páginas/dispositivos, no solo dentro del mismo navegador. Antes,
// inicializarHeaderConfig() solo leía localStorage — que es por
// navegador/origen, así que el mismo diseño configurado en
// header-config.html no se veía en otra página abierta en otro
// dispositivo, ni entre archivos file:// locales (cada uno puede quedar
// como origen distinto). configHeader/global YA se escribe en Firestore
// desde v1.8 (sincronizarConfigHeaderFirestore()) pero nunca se leía de
// vuelta. Ahora: se aplica primero lo que haya en localStorage (sin
// esperar red, cero parpadeo visual) y, si `db` existe y el doc trae
// datos, esos valores pisan localStorage y se vuelven a aplicar — así
// cualquier página que cargue después ve el mismo diseño ya guardado.
// Si `db` no está disponible o la lectura falla, todo sigue exactamente
// igual que en v1.8 (no rompe nada). Solo se traen los mismos campos que
// ya sincroniza sincronizarConfigHeaderFirestore() (logo/diffuser/color/
// opacidades/tamaño/align/offsetY del logo/sin-fondo/sin-logo) — los
// efectos CSS "solo modo piloto" siguen siendo 100% locales, como ya
// documentado en v1.8.
function inicializarHeaderConfig(){
  _aplicarHeaderConfigLocal();
  if(typeof db === 'undefined' || !db) return;
  db.collection('configHeader').doc('global').get().then(doc => {
    if(!doc.exists) return;
    const d = doc.data();
    if(d.logoPath !== undefined) localStorage.setItem('audiolink_logo_path', d.logoPath);
    if(d.diffuserPath !== undefined) localStorage.setItem('audiolink_diffuser_path', d.diffuserPath);
    if(d.headerColor !== undefined) localStorage.setItem('audiolink_header_color', d.headerColor);
    if(d.headerSinFondo !== undefined) localStorage.setItem('audiolink_header_sin_fondo', d.headerSinFondo ? '1' : '0');
    if(d.headerColorOpacity !== undefined) localStorage.setItem('audiolink_header_color_opacity', String(d.headerColorOpacity));
    if(d.headerDiffuserOpacity !== undefined) localStorage.setItem('audiolink_header_diffuser_opacity', String(d.headerDiffuserOpacity));
    if(d.logoSize !== undefined) localStorage.setItem('audiolink_logo_size', String(d.logoSize));
    if(d.logoAlign !== undefined) localStorage.setItem('audiolink_logo_align', d.logoAlign);
    if(d.logoOffsetY !== undefined) localStorage.setItem('audiolink_logo_offset_y', String(d.logoOffsetY));
    if(d.logoSinLogo !== undefined) localStorage.setItem('audiolink_logo_sin_logo', d.logoSinLogo ? '1' : '0');
    _aplicarHeaderConfigLocal();
  }).catch(err => console.warn('No se pudo leer configHeader/global de Firestore:', err));
}

function resetearHeaderDefaults(){
  // v1.0: restablece todos los sliders/inputs del header a sus valores
  // por defecto y limpia las claves de localStorage correspondientes.
  // No toca la ruta del logo ni del diffuser (eso es contenido, no
  // "aspecto"), solo color/opacidades/tamaño/posición.
  const claves = [
    'audiolink_header_color',
    'audiolink_header_sin_fondo',
    'audiolink_header_color_opacity',
    'audiolink_header_diffuser_opacity',
    'audiolink_logo_size',
    'audiolink_logo_align',
    'audiolink_logo_offset_y',
    'audiolink_logo_opacity',
    'audiolink_logo_blur',
    'audiolink_logo_grayscale',
    'audiolink_logo_contrast',
    'audiolink_logo_sombra',
    'audiolink_logo_rotacion',
    'audiolink_logo_hue',
    'audiolink_logo_saturate',
    'audiolink_logo_sepia',
    'audiolink_diffuser_blur',
    'audiolink_diffuser_grayscale',
    'audiolink_diffuser_contrast',
    'audiolink_diffuser_sombra',
    'audiolink_diffuser_rotacion'
  ];
  claves.forEach(k => localStorage.removeItem(k));

  HEADER_COLOR_RGB = hexToRgbArray(HEADER_COLOR_DEFAULT);
  HEADER_SIN_FONDO = false;
  HEADER_COLOR_OPACITY = HEADER_COLOR_OPACITY_DEFAULT;
  HEADER_DIFFUSER_OPACITY = HEADER_DIFFUSER_OPACITY_DEFAULT;
  LOGO_SIZE = LOGO_SIZE_DEFAULT;
  LOGO_ALIGN = LOGO_ALIGN_DEFAULT;
  LOGO_OFFSET_Y = LOGO_OFFSET_Y_DEFAULT;
  LOGO_OPACITY = LOGO_OPACITY_DEFAULT;
  LOGO_BLUR = LOGO_BLUR_DEFAULT;
  LOGO_GRAYSCALE = LOGO_GRAYSCALE_DEFAULT;
  LOGO_CONTRAST = LOGO_CONTRAST_DEFAULT;
  LOGO_SOMBRA = LOGO_SOMBRA_DEFAULT;
  LOGO_ROTACION = LOGO_ROTACION_DEFAULT;
  LOGO_HUE = LOGO_HUE_DEFAULT;
  LOGO_SATURATE = LOGO_SATURATE_DEFAULT;
  LOGO_SEPIA = LOGO_SEPIA_DEFAULT;
  DIFFUSER_BLUR = DIFFUSER_BLUR_DEFAULT;
  DIFFUSER_GRAYSCALE = DIFFUSER_GRAYSCALE_DEFAULT;
  DIFFUSER_CONTRAST = DIFFUSER_CONTRAST_DEFAULT;
  DIFFUSER_SOMBRA = DIFFUSER_SOMBRA_DEFAULT;
  DIFFUSER_ROTACION = DIFFUSER_ROTACION_DEFAULT;

  const inputColor = document.getElementById('headerColorInput');
  if(inputColor) inputColor.value = HEADER_COLOR_DEFAULT;
  const inputSinFondo = document.getElementById('headerSinFondoInput');
  if(inputSinFondo) inputSinFondo.checked = false;
  const inputColorOpacity = document.getElementById('headerColorOpacityInput');
  if(inputColorOpacity) inputColorOpacity.value = HEADER_COLOR_OPACITY_DEFAULT;
  const inputDiffuserOpacity = document.getElementById('headerDiffuserOpacityInput');
  if(inputDiffuserOpacity) inputDiffuserOpacity.value = HEADER_DIFFUSER_OPACITY_DEFAULT;
  const inputLogoSize = document.getElementById('logoSizeInput');
  if(inputLogoSize) inputLogoSize.value = LOGO_SIZE_DEFAULT;
  actualizarBotonesAlign();
  const inputLogoOffsetY = document.getElementById('logoOffsetYInput');
  if(inputLogoOffsetY) inputLogoOffsetY.value = LOGO_OFFSET_Y_DEFAULT;

  // v1.7: reset de LOGO_SIN_LOGO
  LOGO_SIN_LOGO = LOGO_SIN_LOGO_DEFAULT;
  const inputLogoSinLogoReset = document.getElementById('logoSinLogoInput');
  if(inputLogoSinLogoReset) inputLogoSinLogoReset.checked = false;
  const imgLogoOcultoReset = document.getElementById('hdrLogo');
  if(imgLogoOcultoReset) imgLogoOcultoReset.style.display = '';

  const inputLogoOpacity = document.getElementById('logoOpacityInput');
  if(inputLogoOpacity) inputLogoOpacity.value = LOGO_OPACITY_DEFAULT;
  const inputLogoBlur = document.getElementById('logoBlurInput');
  if(inputLogoBlur) inputLogoBlur.value = LOGO_BLUR_DEFAULT;
  const inputLogoGrayscale = document.getElementById('logoGrayscaleInput');
  if(inputLogoGrayscale) inputLogoGrayscale.value = LOGO_GRAYSCALE_DEFAULT;
  const inputLogoContrast = document.getElementById('logoContrastInput');
  if(inputLogoContrast) inputLogoContrast.value = LOGO_CONTRAST_DEFAULT;
  const inputLogoSombra = document.getElementById('logoSombraInput');
  if(inputLogoSombra) inputLogoSombra.checked = false;
  const inputLogoRotacion = document.getElementById('logoRotacionInput');
  if(inputLogoRotacion) inputLogoRotacion.value = LOGO_ROTACION_DEFAULT;
  const inputLogoHue = document.getElementById('logoHueInput');
  if(inputLogoHue) inputLogoHue.value = LOGO_HUE_DEFAULT;
  const inputLogoSaturate = document.getElementById('logoSaturateInput');
  if(inputLogoSaturate) inputLogoSaturate.value = LOGO_SATURATE_DEFAULT;
  const inputLogoSepia = document.getElementById('logoSepiaInput');
  if(inputLogoSepia) inputLogoSepia.value = LOGO_SEPIA_DEFAULT;

  const inputDiffuserBlur = document.getElementById('diffuserBlurInput');
  if(inputDiffuserBlur) inputDiffuserBlur.value = DIFFUSER_BLUR_DEFAULT;
  const inputDiffuserGrayscale = document.getElementById('diffuserGrayscaleInput');
  if(inputDiffuserGrayscale) inputDiffuserGrayscale.value = DIFFUSER_GRAYSCALE_DEFAULT;
  const inputDiffuserContrast = document.getElementById('diffuserContrastInput');
  if(inputDiffuserContrast) inputDiffuserContrast.value = DIFFUSER_CONTRAST_DEFAULT;
  const inputDiffuserSombra = document.getElementById('diffuserSombraInput');
  if(inputDiffuserSombra) inputDiffuserSombra.checked = false;
  const inputDiffuserRotacion = document.getElementById('diffuserRotacionInput');
  if(inputDiffuserRotacion) inputDiffuserRotacion.value = DIFFUSER_ROTACION_DEFAULT;

  actualizarHeaderPreview();
}

// ============ CLOUDINARY (v1.3) ============
// Mismo mecanismo que avatares-iconos.html (fetch directo a la API),
// ahora con preset unsigned propio 'HEADER' (ver changelog v1.3), folder
// propio 'HEADER'. Al terminar, guarda
// la URL resultante en el input de ruta correspondiente y dispara el
// mismo flujo de siempre (localStorage + preview + imagen oculta que lee
// pintarHeader() de cada página) — no se crea ningún mecanismo nuevo de
// guardado, solo se autocompleta el input existente.
//
// v1.1 (galería): además guarda un registro en Firestore (colección
// 'headerImagenes', separada de 'avataresIconos' de avatares-iconos.html)
// para poder listar y reutilizar imágenes ya subidas — ver
// escucharGaleriaHeader() más abajo. Requiere que el HTML consumidor
// (header-config.html) cargue Firebase antes de header-config.js y
// exponga una variable global `db`; si no existe (ej. una página
// consumidora que no cargue Firebase), la subida a Cloudinary sigue
// funcionando igual, solo se omite el guardado en la galería.
const HEADER_IMG_COLLECTION = 'headerImagenes';

function subirImagenHeaderACloudinary(file, tipo){
  // tipo: 'logo' | 'diffuser'
  return new Promise((resolve, reject) => {
    if(!file){ reject(new Error('No se seleccionó ningún archivo.')); return; }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', CLOUDINARY_FOLDER_HEADER);

    fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    })
      .then(res => res.json())
      .then(data => {
        if(!data.secure_url){
          throw new Error(data.error?.message || 'Cloudinary no devolvió una URL.');
        }
        if(tipo === 'logo'){
          const input = document.getElementById('logoPathInput');
          if(input) input.value = data.secure_url;
          actualizarLogoPath(data.secure_url);
        } else {
          const input = document.getElementById('diffuserPathInput');
          if(input) input.value = data.secure_url;
          actualizarDiffuserPath(data.secure_url);
        }
        // v1.1: registro en Firestore para la galería de reutilización.
        // Solo si `db` existe (evita romper páginas que no cargan Firebase).
        if(typeof db !== 'undefined' && db){
          db.collection(HEADER_IMG_COLLECTION).add({
            nombre: file.name || 'imagen',
            url: data.secure_url,
            tipo: tipo,
            fecha: new Date().toISOString()
          }).catch(err => console.error('No se pudo registrar en la galería (headerImagenes):', err));
        }
        resolve(data.secure_url);
      })
      .catch(err => {
        console.error('Error subiendo a Cloudinary:', err);
        reject(err);
      });
  });
}

// v1.1: galería de imágenes ya subidas (lee Firestore en tiempo real,
// igual patrón que escucharCatalogo() de avatares-iconos.html). Requiere
// contenedores #logoGaleria / #diffuserGaleria en el HTML consumidor.
// Si `db` no existe, no hace nada (no rompe nada).
function escucharGaleriaHeader(){
  if(typeof db === 'undefined' || !db) return;
  db.collection(HEADER_IMG_COLLECTION).orderBy('fecha', 'desc').onSnapshot(snap => {
    const logos = [];
    const diffusers = [];
    snap.forEach(doc => {
      const it = { id: doc.id, ...doc.data() };
      if(it.tipo === 'logo') logos.push(it);
      else if(it.tipo === 'diffuser') diffusers.push(it);
    });
    renderGaleriaHeader('logoGaleria', logos, 'logo');
    renderGaleriaHeader('diffuserGaleria', diffusers, 'diffuser');
  }, err => console.error('No se pudo leer la galería (headerImagenes):', err));
}

function renderGaleriaHeader(contenedorId, items, tipo){
  const cont = document.getElementById(contenedorId);
  if(!cont) return;
  if(!items.length){
    cont.innerHTML = '<span class="galeria-vacia">Aún no has subido imágenes acá.</span>';
    return;
  }
  cont.innerHTML = items.map(it => `
    <img src="${it.url}" title="${(it.nombre||'').replace(/"/g,'&quot;')}" class="galeria-thumb"
      onclick="seleccionarDeGaleriaHeader('${tipo}', '${it.url.replace(/'/g,"\\'")}')">
  `).join('');
}

function seleccionarDeGaleriaHeader(tipo, url){
  if(tipo === 'logo'){
    const input = document.getElementById('logoPathInput');
    if(input) input.value = url;
    actualizarLogoPath(url);
  } else {
    const input = document.getElementById('diffuserPathInput');
    if(input) input.value = url;
    actualizarDiffuserPath(url);
  }
}
