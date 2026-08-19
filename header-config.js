// AUDIOLINK · header-config.js · v1.1
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

// v1.1: config Cloudinary — mismo cloud_name/preset unsigned que
// avatares-iconos.html (CLOUDINARY_UPLOAD_PRESET 'ICONOS'), folder propio.
const CLOUDINARY_CLOUD_NAME = 'dv7lelmoy';
const CLOUDINARY_UPLOAD_PRESET = 'ICONOS';
const CLOUDINARY_FOLDER_HEADER = 'HEADER';

let HEADER_COLOR_RGB = [11, 11, 13];
let HEADER_SIN_FONDO = false;
let HEADER_COLOR_OPACITY = HEADER_COLOR_OPACITY_DEFAULT;
let HEADER_DIFFUSER_OPACITY = HEADER_DIFFUSER_OPACITY_DEFAULT;
let LOGO_SIZE = LOGO_SIZE_DEFAULT;
let LOGO_ALIGN = LOGO_ALIGN_DEFAULT;
let LOGO_OFFSET_Y = LOGO_OFFSET_Y_DEFAULT;

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
    imgLogo.style.transform = 'none';
  }

  if(HEADER_SIN_FONDO){
    if(imgDiffuser) imgDiffuser.style.opacity = '0';
    if(capaColor) capaColor.style.background = '#ffffff';
    if(capaColor) capaColor.style.opacity = '1';
  } else {
    if(imgDiffuser) imgDiffuser.style.opacity = String(HEADER_DIFFUSER_OPACITY);
    if(capaColor) capaColor.style.background = `rgb(${HEADER_COLOR_RGB.join(',')})`;
    if(capaColor) capaColor.style.opacity = String(HEADER_COLOR_OPACITY);
  }
}

function inicializarHeaderConfig(){
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

  actualizarHeaderPreview();
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
    'audiolink_logo_offset_y'
  ];
  claves.forEach(k => localStorage.removeItem(k));

  HEADER_COLOR_RGB = hexToRgbArray(HEADER_COLOR_DEFAULT);
  HEADER_SIN_FONDO = false;
  HEADER_COLOR_OPACITY = HEADER_COLOR_OPACITY_DEFAULT;
  HEADER_DIFFUSER_OPACITY = HEADER_DIFFUSER_OPACITY_DEFAULT;
  LOGO_SIZE = LOGO_SIZE_DEFAULT;
  LOGO_ALIGN = LOGO_ALIGN_DEFAULT;
  LOGO_OFFSET_Y = LOGO_OFFSET_Y_DEFAULT;

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

  actualizarHeaderPreview();
}

// ============ CLOUDINARY (v1.1) ============
// Mismo mecanismo que avatares-iconos.html (fetch directo a la API,
// unsigned preset 'ICONOS'), folder propio 'HEADER'. Al terminar, guarda
// la URL resultante en el input de ruta correspondiente y dispara el
// mismo flujo de siempre (localStorage + preview + imagen oculta que lee
// pintarHeader() de cada página) — no se crea ningún mecanismo nuevo de
// guardado, solo se autocompleta el input existente.
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
        resolve(data.secure_url);
      })
      .catch(err => {
        console.error('Error subiendo a Cloudinary:', err);
        reject(err);
      });
  });
}
