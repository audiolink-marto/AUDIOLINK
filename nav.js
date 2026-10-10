/* AUDIOLINK · nav.js · v1.32
   V1.32: (a pedido) se suma la hoja contador.html al menú: ítem nuevo
   'contador' (Contador, grupo Gestión, a continuación de Recordatorios),
   con ícono SVG de cronómetro dibujado en la misma línea hoja técnica
   (al-k / al-c), y se agrega a idsFueraBottomnav para que la barra
   inferior móvil conserve sus 4 accesos (queda en el panel "···").
   contador.html define window.NAV_CONFIG = { activo: 'contador' }, así
   que el ítem se marca activo. No se tocó ningún otro ítem, id, href,
   grupo, tema, sesión ni sync. El resto del archivo es idéntico a v1.31.
   V1.31: (a pedido) sin cambios de código. El historial V1.1–V1.28 se
   traslada de la cabecera a CHANGELOG.md (sección nav.js); en la
   cabecera queda la versión vigente, las 2 entradas previas (V1.30 y V1.29)
   y la descripción de uso. Todo lo que sigue después de la cabecera es
   idéntico a v1.30.
   V1.30: (a pedido) los íconos pasan de "temblor" (filtro de v1.29) a
   dibujo tipo HOJA TÉCNICA hecho a mano en el propio SVG, en la línea del
   dial (cruz de ejes, marcas, aros dobles): trazo principal con
   sobre-trazo en las esquinas, líneas finas de detalle (clase al-k) y
   ejes de construcción punteados (clase al-c). Se redibujan los 17 de
   ITEMS (campo svg) y luna/sol/encendido de los botones del dial y del
   panel (los tres con un aro punteado de órbita). Se ELIMINA el filtro
   alPen de v1.29 (penDefs y los <g filter>), ya no hace falta. Las clases
   al-k / al-c se definen en nav.css v1.26 (sin ese CSS los detalles se
   verían con el trazo principal). No cambian ids, hrefs, labels, grupos,
   tema, sesión, sync, ni el emoji de respaldo (`icon`).
   V1.29: (a pedido) los íconos SVG (17 de ITEMS + luna/sol/encendido de
   los botones del dial y del panel) se ven dibujados a mano, como el
   dial: cada SVG envuelve sus trazos en <g filter="url(#alPen)"> y se
   inyecta una sola vez, junto al sidebar, un <svg> de 0x0 con ese filtro
   (feTurbulence + feDisplacementMap: un temblor leve del trazo, en
   unidades del viewBox de 24, así escala igual en todos los tamaños).
   Solo cambia el dibujo: estructura, ids, onclick, ITEMS, tema, sesión,
   sync y el emoji de respaldo no se tocaron. Intensidad = atributo
   scale del filtro (1.4; 0 = trazo limpio). El filtro NO usa
   display:none (algunos navegadores lo ignoran). Scrollbar: nav.css v1.25.
   Historial anterior (V1.28 hacia atrás): CHANGELOG.md, sección nav.js.
   Navegación compartida (sidebar desktop + mobile topbar + panel "···" +
   bottomnav) para todo el ecosistema. Antes este bloque de HTML/CSS/JS
   estaba copiado y pegado en cada página (index/cotizador/logistica/
   pagos/proyecto), lo que causó que el cotizador quedara desincronizado
   (sin barras VU, sin botón de tema). Ahora vive en un solo lugar.

   USO — antes de <script src="nav.js"></script>, cada página define:

   window.NAV_CONFIG = {
     activo: 'proyecto',        // 'dashboard'|'proyecto'|'logistica'|'pagos'|'cotizador'
     sbFootExtra: [],           // ítems extra en el pie del sidebar (antes de Tema/Cerrar sesión)
     masMobileExtra: []         // ítems extra en el panel "···" móvil
   };
   Cada extra: {icon:'🔐', label:'Portal de clientes', onclick:'abrirModalPortalClientes()'}

   Si una página no define NAV_CONFIG, se asume sin extras y ningún ítem activo.
   nav.js inyecta su HTML en <div id="nav-mount"></div> (debe existir en el
   body, en el mismo lugar donde antes vivían <aside class="sidebar">,
   .mobile-topbar, .mas-mobile-panel y .mobile-bottomnav).

   Centraliza también cerrarSesion(), toggleMasMobile(), toggleTema() y el
   colapsar/expandir del sidebar — antes duplicados en cada página. Requiere
   que `auth` (firebase.auth()) ya exista en el scope global al momento de
   llamar cerrarSesion(). No toca ninguna lógica de datos/Firestore de cada
   página. */

(function(){
  const cfg = window.NAV_CONFIG || {};
  const activo = cfg.activo || '';
  const sbFootExtra = cfg.sbFootExtra || [];
  const masMobileExtra = cfg.masMobileExtra || [];
  const soportaTema = cfg.soportaTema !== false; // default true; false = página aún sin CSS de modo claro (ej. cotizador)

  // v1.21: favicon compartido (solo si la página no declara uno propio).
  // rel~="icon" NO coincide con apple-touch-icon (token distinto).
  const LOGO_DIR = 'logo/'; // carpeta (relativa a las páginas) con los archivos del logo
  try{
    if(document.head && !document.querySelector('link[rel~="icon"]')){
      const lnkIco = document.createElement('link');
      lnkIco.rel = 'icon';
      lnkIco.href = LOGO_DIR + 'favicon.ico';
      lnkIco.setAttribute('sizes', 'any');
      document.head.appendChild(lnkIco);
      const lnkPng = document.createElement('link');
      lnkPng.rel = 'icon';
      lnkPng.type = 'image/png';
      lnkPng.setAttribute('sizes', '32x32');
      lnkPng.href = LOGO_DIR + 'logo-circular-32.png';
      document.head.appendChild(lnkPng);
    }
  }catch(e){ /* el favicon nunca debe romper la navegación */ }

  // v1.27: atributos comunes de todos los SVG de trazo (ítems + botones del dial).
  const _svgAttr = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"';
  function iconoItem(it){
    return it.svg ? `<svg ${_svgAttr}>${it.svg}</svg>` : it.icon;
  }

  const ITEMS = [
    { id:'dashboard', href:'index.html',     icon:'🏠', label:'Dashboard', grupo:null, svg:'<path class="al-c" d="M12 1.5v21"/><path d="M2.6 11.6 12 3.6l9.4 8"/><path d="M5.5 10.2V21M18.5 10.2V21"/><path d="M3 21h18"/><path class="al-k" d="M10 21v-6h4v6"/>' },
    { id:'proyecto',  href:'proyecto.html',  icon:'📁', label:'Proyectos', grupo:'Gestión', svg:'<path class="al-c" d="M1.5 14.2h21"/><path d="M2.6 8.5h18.8"/><path d="M3.5 5h6l2 3.5"/><path d="M3.5 5v15.3M20.5 7.7v12.6"/><path d="M2.6 19.5h18.8"/><path class="al-k" d="M6.5 12.2h11"/>' },
    { id:'clientes',  href:'clientes.html',  icon:'👤', label:'Clientes',  grupo:'Gestión', svg:'<path class="al-c" d="M12 1.5v21"/><circle cx="12" cy="8.2" r="3.4"/><path d="M4.6 20.5c.7-3.9 3.4-6.1 7.4-6.1s6.7 2.2 7.4 6.1"/><path d="M2.8 20.5h18.4"/><path class="al-k" d="M9 14.9l3 2.6 3-2.6"/>' },
    { id:'recordatorios', href:'recordatorios.html', icon:'📝', label:'Recordatorios', grupo:'Gestión', svg:'<path d="M5.5 2.8v18.9"/><path d="M4.8 3.5h9.7"/><path d="M4.8 21h14.9"/><path d="M19 8v13.7"/><path d="M14.5 3.5 19 8"/><path class="al-k" d="M14.5 3.5V8H19"/><path class="al-k" d="M8.5 12.5h7M8.5 15.5h7M8.5 18.5h4"/>' },
    { id:'contador', href:'contador.html', icon:'⏱️', label:'Contador', grupo:'Gestión', svg:'<path class="al-c" d="M1.5 13.5h21"/><circle cx="12" cy="13.5" r="7.6"/><path d="M9.4 2.8h5.2M12 2.8v3.1"/><path d="M18.3 7.2l1.6-1.6"/><path class="al-k" d="M12 13.5V9.2M12 13.5l3 1.8"/><path class="al-k" d="M12 7.2v.9M19.6 13.5h-.9M12 20v-.9M4.4 13.5h.9"/>' },
    { id:'estudios',  href:'estudios.html',  icon:'🏢', label:'Estudios',  grupo:'Catálogos', svg:'<path d="M2.8 21h18.4"/><path d="M5.5 21.6V3.8M4.8 4.5h9.9M14.5 3.8v17.8"/><path d="M14 9.5h4.9M18.5 8.8v12.8"/><path class="al-k" d="M8 8h3M8 11.5h3M8 15h3"/><path class="al-k" d="M8.3 21v-3h3.4v3"/><path class="al-k" d="M15 12.8l2.9-2.9M15 16.2l3.1-3.1M15 19.6l3.1-3.1"/>' },
    { id:'musicos',   href:'musicos.html',   icon:'🎻', label:'Músicos',   grupo:'Catálogos', svg:'<path class="al-c" d="M1.5 20.8h21"/><path d="M9.2 17.2V5.4M18.2 15.2V3.4"/><path d="M9.2 5.4l9-2"/><path class="al-k" d="M9.2 8.4l9-2"/><circle cx="6.9" cy="17.6" r="2.3"/><circle cx="15.9" cy="15.6" r="2.3"/>' },
    { id:'logistica', href:'logistica.html', icon:'🎚️', label:'Logística', grupo:'Operación', svg:'<path class="al-k" d="M6 3.5v9.3M6 16.4v4.1M12 3.5v3.3M12 10.4v10.1M18 3.5v7.3M18 14.4v6.1"/><path class="al-k" d="M4.5 3.5h3M4.5 20.5h3M10.5 3.5h3M10.5 20.5h3M16.5 3.5h3M16.5 20.5h3"/><rect x="3.8" y="12.8" width="4.4" height="3.6" rx="0.4"/><rect x="9.8" y="6.8" width="4.4" height="3.6" rx="0.4"/><rect x="15.8" y="10.8" width="4.4" height="3.6" rx="0.4"/>' },
    { id:'pagos',     href:'pagos.html',     icon:'💳', label:'Pagos',      grupo:'Finanzas', svg:'<path d="M2.6 5.5h18.8M2.6 18.5h18.8M3.5 4.6v14.8M20.5 4.6v14.8"/><path class="al-k" d="M3.5 9.2h17M3.5 11.3h17"/><path class="al-k" d="M6.5 15.2h3.6M12.2 15.2h1.8"/>' },
    { id:'egresos',   href:'egresos.html',   icon:'📤', label:'Egresos',    grupo:'Finanzas', svg:'<path d="M4 13.2v6.3M20 13.2v6.3M2.8 19.5h18.4"/><path class="al-k" d="M2.8 13.2h3M18.2 13.2h3"/><path d="M12 15.2V3"/><path d="M8 7l4-4 4 4"/>' },
    { id:'equipo-tecnico', href:'equipo-tecnico.html', icon:'🛠️', label:'Equipo Técnico', grupo:'Catálogos', svg:'<path class="al-c" d="M1.8 22.2 22.2 1.8"/><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/><circle class="al-k" cx="5.2" cy="18.8" r="1"/>' },
    { id:'eventos',   href:'eventos.html',   icon:'🎤', label:'Eventos',   grupo:'Operación', svg:'<path class="al-c" d="M12 1.5v21"/><rect x="9" y="3" width="6" height="11" rx="3"/><path class="al-k" d="M9.4 7h5.2M9.4 9.2h5.2M9.4 11.4h5.2"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"/><path d="M8 21h8"/>' },
    { id:'cotizador', href:'cotizador.html', icon:'🧮', label:'Cotizador',  grupo:'Finanzas', svg:'<path d="M4.8 3.5h14.4M4.8 20.5h14.4M5.5 2.8v18.4M18.5 2.8v18.4"/><rect class="al-k" x="8" y="6.5" width="8" height="3.2"/><path d="M8.5 13.2h.01M12 13.2h.01M15.5 13.2h.01M8.5 16.8h.01M12 16.8h.01M15.5 16.8h.01"/>' },
    { id:'vacas',     href:'vacas.html',     icon:'🐄', label:'Vacas',     grupo:'Operación', svg:'<path class="al-c" d="M12 1.5v21"/><ellipse cx="12" cy="6.5" rx="7" ry="2.7"/><path d="M5 6.5v5c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7v-5"/><path d="M5 11.5v5c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7v-5"/>' },
    { id:'cocina',    href:'cocina.html',    icon:'🍱', label:'Cocina',    grupo:'Operación', svg:'<path class="al-c" d="M12 1.5v21"/><path d="M5 10.5V17a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-6.5"/><path d="M3.6 10.5h16.8"/><path d="M5 12.6H2.6M19 12.6h2.4"/><path class="al-k" d="M9.5 7c0-1.2 1-1.4 1-2.6M14 7c0-1.2 1-1.4 1-2.6"/>' },
    { id:'ensayo',    href:'ensayo.html',    icon:'🎼', label:'Ensayo',    grupo:'Operación', svg:'<path class="al-c" d="M12 1.5v21"/><path d="M9.2 3.5h5.6M9.2 3.5 5.5 20.5M14.8 3.5l3.7 17"/><path d="M3.8 20.5h16.4"/><path d="M12 17 15.2 8"/><circle class="al-k" cx="12" cy="17" r="1"/>' },
    { id:'avatares',  href:'avatares-iconos.html', icon:'🤓', label:'Avatar / Icono', grupo:'Ajustes', svg:'<path class="al-c" d="M12 1.3v21.4M1.3 12h21.4"/><circle cx="12" cy="12" r="8.5"/><path d="M9 10.2h.01M15 10.2h.01"/><path d="M8.7 14.3a4 4 0 0 0 6.6 0"/>' },
    { id:'header-config', href:'header-config.html', icon:'🖼️', label:'Header PDF', grupo:'Ajustes', svg:'<path d="M2.6 4.5h18.8M2.6 19.5h18.8M3.5 3.6v16.8M20.5 3.6v16.8"/><circle class="al-k" cx="8.5" cy="9.5" r="1.5"/><path d="M4 17l4.5-4.5 3.5 3.5 3-3 5 5"/>' }
  ];

  // Ítems que se sacan del mobile-bottomnav (para no saturar la barra de 4
  // accesos) pero que igual necesitan quedar accesibles en mobile: se
  // listan aparte en el panel "···". Antes solo estaba 'clientes'
  // hardcodeado acá (v1.1); v1.2 lo generaliza a una lista para sumar
  // 'estudios' y 'musicos' sin repetir el mismo condicional 3 veces.
  const idsFueraBottomnav = ['clientes', 'recordatorios', 'contador', 'estudios', 'musicos', 'egresos', 'equipo-tecnico', 'eventos', 'vacas', 'cocina', 'ensayo', 'avatares', 'cotizador', 'header-config'];

  const vu = `<div class="vu"><span></span><span></span><span></span><span></span><span></span></div>`;
  // v1.13: mismo ícono, clase extra para poder cambiarle el color según
  // conexión sin afectar el vu del botón de menú móvil (que usa `vu` a
  // secas, arriba).
  const vuBrand = `<div class="vu vu-brand"><span></span><span></span><span></span><span></span><span></span></div>`;
  const connDot = `<span class="conn-dot" title="Estado de conexión"></span>`;
  // v1.23: dial del logo junto a la marca. Si falla la carga, se oculta.
  const dialBrand = `<img class="brand-dial" src="${LOGO_DIR}logo-circular-192.png" alt="AUDIOLINK" width="28" height="28" decoding="async" onerror="this.style.display='none'">`;
  // v1.16: badge de cambios pendientes de sincronizar (Fase 2 offline).
  // Oculto por defecto (display:none inline, ver actualizarBadgeSync());
  // onclick fuerza sincronizarColaOffline() manualmente.
  const syncBadge = `<span class="sync-badge" id="syncBadge" title="Cambios pendientes de sincronizar — tocar para sincronizar ahora" style="display:none;" onclick="_navForzarSincronizacion()"></span>`;

  function grupoColapsado(nombre){
    return localStorage.getItem('audiolink_sb_grupo_' + nombre) === '1';
  }

  function sbGrupoLabelHtml(nombre){
    return `<div class="sb-grupo-label" onclick="toggleSbGrupo('${nombre}')"><span>${nombre}</span><i class="sb-grupo-arrow">▾</i></div>`;
  }

  function sbItemHtml(it){
    const esActivo = it.id === activo;
    if(esActivo){
      return `<a href="#" class="sb-item active" style="pointer-events:none;"><i>${iconoItem(it)}</i><span>${it.label}</span></a>`;
    }
    return `<a href="${it.href}" class="sb-item"><i>${iconoItem(it)}</i><span>${it.label}</span></a>`;
  }

  // v1.7: sidebar agrupado por categoría (grupo:null = sin sección,
  // van sueltos arriba/abajo). Recorre GRUPOS_ORDEN y por cada uno
  // filtra ITEMS conservando su orden original — no se reordena ni
  // se toca la lista plana ITEMS (de la que dependen el mobile-bottomnav
  // y el panel "···", que siguen exactamente igual que antes).
  const GRUPOS_ORDEN = ['Gestión', 'Catálogos', 'Operación', 'Finanzas', 'Ajustes'];
  function sbNavGroupedHtml(){
    let html = '';
    // Dashboard (primer ítem sin grupo) va suelto arriba, en su lugar original
    const sinGrupo = ITEMS.filter(it => !it.grupo);
    if(sinGrupo[0]) html += sbItemHtml(sinGrupo[0]) + '\n    ';
    GRUPOS_ORDEN.forEach(nombreGrupo => {
      const itemsGrupo = ITEMS.filter(it => it.grupo === nombreGrupo);
      if(itemsGrupo.length === 0) return;
      const colapsado = grupoColapsado(nombreGrupo);
      html += `<div class="sb-grupo${colapsado ? ' colapsado' : ''}" data-grupo="${nombreGrupo}">\n      `;
      html += sbGrupoLabelHtml(nombreGrupo) + '\n      ';
      html += `<div class="sb-grupo-body">\n        `;
      itemsGrupo.forEach(it => { html += sbItemHtml(it) + '\n        '; });
      html += `</div>\n    </div>\n    `;
    });
    // resto de ítems sin grupo (ej. Avatar/Icono) van sueltos al final,
    // en su orden original — mismo lugar que ocupaban antes de agrupar
    sinGrupo.slice(1).forEach(it => { html += sbItemHtml(it) + '\n    '; });
    return html;
  }

  // V1.8: mismo agrupado que sbNavGroupedHtml pero para el panel "···"
  // móvil — solo incluye los ítems que ya estaban fuera del bottomnav
  // (idsFueraBottomnav), respetando exactamente el mismo filtro que
  // usaba el .mas-mobile-panel antes de v1.8. Comparte estado de
  // colapsado con el sidebar desktop (misma clave de localStorage).
  function masMobileGroupedHtml(){
    let html = '';
    const itemsFuera = ITEMS.filter(it => idsFueraBottomnav.includes(it.id) && it.id !== activo);
    const sinGrupo = itemsFuera.filter(it => !it.grupo);
    GRUPOS_ORDEN.forEach(nombreGrupo => {
      const itemsGrupo = itemsFuera.filter(it => it.grupo === nombreGrupo);
      if(itemsGrupo.length === 0) return;
      const colapsado = grupoColapsado(nombreGrupo);
      html += `<div class="mas-mobile-grupo${colapsado ? ' colapsado' : ''}" data-grupo="${nombreGrupo}">\n    `;
      html += `<div class="mas-mobile-grupo-label" onclick="toggleSbGrupo('${nombreGrupo}')"><span>${nombreGrupo}</span><i class="sb-grupo-arrow">▾</i></div>\n    `;
      html += `<div class="mas-mobile-grupo-body">\n      `;
      itemsGrupo.forEach(it => {
        html += `<a href="${it.href}" class="mas-mobile-item" style="text-decoration:none;"><i>${iconoItem(it)}</i>${it.label}</a>\n      `;
      });
      html += `</div>\n  </div>\n  `;
    });
    sinGrupo.forEach(it => {
      html += `<a href="${it.href}" class="mas-mobile-item" style="text-decoration:none;"><i>${iconoItem(it)}</i>${it.label}</a>\n  `;
    });
    return html;
  }

  function extraSbFootHtml(){
    return sbFootExtra.map(e =>
      `<div class="sb-item" onclick="${e.onclick}"><i>${e.icon}</i><span>${e.label}</span></div>`
    ).join('');
  }

  function extraMasMobileHtml(){
    return masMobileExtra.map(e =>
      `<div class="mas-mobile-item" onclick="${e.onclick}"><i>${e.icon}</i>${e.label}</div>`
    ).join('');
  }

  // v1.25: íconos de trazo para los botones junto al dial (currentColor,
  // así siguen el color/tema del botón sin reglas extra).
  const SVG_MOON = `<svg ${_svgAttr}><circle class="al-c" cx="12" cy="12" r="10.4"/><path d="M20 14.2A8 8 0 1 1 9.8 4a6.4 6.4 0 0 0 10.2 10.2z"/></svg>`;
  const SVG_SUN = `<svg ${_svgAttr}><circle class="al-c" cx="12" cy="12" r="10.4"/><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></svg>`;
  const SVG_POWER = `<svg ${_svgAttr}><circle class="al-c" cx="12" cy="12" r="10.4"/><path d="M12 3v8.5"/><path d="M6.6 6.9a7.8 7.8 0 1 0 10.8 0"/></svg>`;
  function iconoTemaSvg(tema){ return tema === 'dark' ? SVG_MOON : SVG_SUN; }
  const temaInicial = localStorage.getItem('audiolink_tema') || 'dark';

  const sidebarHtml = `
<aside class="sidebar" id="sidebar">
  <div class="sb-dial">
    ${soportaTema ? `<button type="button" class="sb-dial-btn" id="btnTemaSb" onclick="toggleTema()" title="Cambiar tema" aria-label="Cambiar tema">${iconoTemaSvg(temaInicial)}</button>` : '<span class="sb-dial-btn sb-dial-ghost" aria-hidden="true"></span>'}
    <div class="sb-dial-face" id="sbDial" title="Colapsar/expandir menú">${dialBrand}</div>
    <button type="button" class="sb-dial-btn" onclick="cerrarSesion()" title="Cerrar sesión" aria-label="Cerrar sesión">${SVG_POWER}</button>
  </div>
  <div class="sb-brand">
    ${vuBrand}
    <h1>AUDIOLINK</h1>
    ${connDot}
    ${syncBadge}
  </div>
  <nav class="sb-nav">
    ${sbNavGroupedHtml()}
  </nav>
  <div class="sb-foot">
    ${extraSbFootHtml()}
    <div class="sb-toggle" id="sidebarToggle"><i>«</i><span>Colapsar</span></div>
    <div class="sb-credit">Marto 🧠 · martowave@gmail.com</div>
  </div>
</aside>

<div class="mobile-topbar">
  <div class="brand">
    ${dialBrand}
    ${vuBrand}
    <h1>AUDIOLINK</h1>
    ${connDot}
    ${syncBadge}
  </div>
  <div class="mobile-topbar-actions">
    <button class="btn-menu-vu" onclick="toggleMasMobile()" title="Más opciones">${vu}</button>
  </div>
</div>

<div class="mas-mobile-panel" id="masMobilePanel">
  ${masMobileGroupedHtml()}
  ${extraMasMobileHtml()}
  ${soportaTema ? `<div class="mas-mobile-item" onclick="toggleTema()"><i id="iconoTemaMas">${iconoTemaSvg(temaInicial)}</i>Cambiar tema</div>` : ''}
  <div class="mas-mobile-item" onclick="cerrarSesion()"><i>${SVG_POWER}</i>Cerrar sesión</div>
  <div class="mas-mobile-credit">Marto 🧠 · martowave@gmail.com</div>
</div>

<nav class="mobile-bottomnav">
  ${ITEMS.filter(it => it.id !== 'cotizador' && !idsFueraBottomnav.includes(it.id)).map(it =>
    `<a href="${it.href}"${it.id === activo ? ' class="active"' : ''}><i>${iconoItem(it)}</i>${it.label}</a>`
  ).join('\n  ')}
</nav>`;

  const mount = document.getElementById('nav-mount');
  if(mount){
    mount.outerHTML = sidebarHtml;
  } else {
    console.error('nav.js: no se encontró <div id="nav-mount"></div> en el body.');
  }

  // ============ ACORDEÓN POR GRUPO (sidebar desktop + panel "···") ============
  window.toggleSbGrupo = function(nombre){
    const key = 'audiolink_sb_grupo_' + nombre;
    const nuevo = localStorage.getItem(key) !== '1';
    localStorage.setItem(key, nuevo ? '1' : '0');
    document.querySelectorAll('[data-grupo="' + nombre + '"]').forEach(el => {
      el.classList.toggle('colapsado', nuevo);
    });
  };

  // ============ CERRAR SESIÓN ============
  window.cerrarSesion = function(){
    if(!confirm('¿Cerrar sesión?')) return;
    auth.signOut().then(() => window.location.href = 'login.html');
  };

  // ============ TEMA ============
  window.actualizarIconoTema = function(tema){
    const sbBtn = document.getElementById('btnTemaSb');
    if(sbBtn) sbBtn.innerHTML = iconoTemaSvg(tema);
    const masIcon = document.getElementById('iconoTemaMas');
    if(masIcon) masIcon.innerHTML = iconoTemaSvg(tema);
  };
  window.toggleTema = function(){
    const actual = document.documentElement.getAttribute('data-tema') || 'dark';
    const nuevo = actual === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-tema', nuevo);
    localStorage.setItem('audiolink_tema', nuevo);
    actualizarIconoTema(nuevo);
  };

  // ============ PANEL "···" MÓVIL ============
  window.toggleMasMobile = function(){
    const panel = document.getElementById('masMobilePanel');
    if(panel) panel.classList.toggle('show');
  };
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('masMobilePanel');
    if(!panel || !panel.classList.contains('show')) return;
    const btn = e.target.closest('.mobile-topbar-actions');
    if(!panel.contains(e.target) && !btn) panel.classList.remove('show');
  });

  // ============ SIDEBAR COLAPSABLE (desktop) ============
  document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const mainWrap = document.getElementById('mainWrap');
    const toggle = document.getElementById('sidebarToggle');
    if(!sidebar || !mainWrap || !toggle) return;
    const colapsado = localStorage.getItem('audiolink_sb_colapsado') === '1';
    if(colapsado){ sidebar.classList.add('collapsed'); mainWrap.classList.add('expanded'); }
    toggle.addEventListener('click', () => {
      const ahora = sidebar.classList.toggle('collapsed');
      mainWrap.classList.toggle('expanded', ahora);
      localStorage.setItem('audiolink_sb_colapsado', ahora ? '1' : '0');
    });
    // v1.24: el dial del logo dispara el mismo botón, sin duplicar lógica.
    const sbDial = document.getElementById('sbDial');
    if(sbDial) sbDial.addEventListener('click', () => toggle.click());
    const t = localStorage.getItem('audiolink_tema') || 'dark';
    actualizarIconoTema(t);
  });
  // ============ INDICADOR SIN CONEXIÓN (v1.11) / MODO OFFLINE (v1.15) ============
  function crearBannerOffline(){
    if(document.getElementById('offlineBanner')) return;
    const banner = document.createElement('div');
    banner.id = 'offlineBanner';
    banner.className = 'offline-banner';
    document.body.appendChild(banner);
  }
  // v1.15: distingue dos casos antes mezclados en uno solo ("conn-offline"):
  // (1) sin internet real (navigator.onLine === false) — como siempre.
  // (2) modo offline ACTIVADO A PROPÓSITO por el usuario (switch de
  // index.html v2.22/firebase-config.js v1.2 AUDIOLINK_OFFLINE_OVERRIDE),
  // aunque SÍ haya internet real. Antes el puntito quedaba verde en este
  // segundo caso porque solo miraba navigator.onLine, sin saber nada del
  // modo manual — confuso para verificar visualmente en qué modo está la
  // app. estaModoOfflineActivo() vive en firebase-config.js; si esa
  // función no existe todavía (orden de scripts, o página sin
  // firebase-config.js cargado), se asume false sin romper nada.
  function _modoOfflineManualActivo(){
    try{
      return typeof estaModoOfflineActivo === 'function' && estaModoOfflineActivo();
    }catch(err){ return false; }
  }
  function actualizarEstadoConexion(){
    crearBannerOffline();
    const banner = document.getElementById('offlineBanner');
    const sinInternet = !navigator.onLine;
    const modoOfflineManual = _modoOfflineManualActivo();

    document.body.classList.toggle('conn-offline', sinInternet);
    document.body.classList.toggle('conn-modo-offline', !sinInternet && modoOfflineManual);

    if(banner){
      if(sinInternet){
        banner.textContent = '🔴 Sin conexión — los cambios se guardarán al recuperar señal';
        banner.classList.add('show');
      } else if(modoOfflineManual){
        banner.textContent = '🟡 Modo offline activo — usando datos cargados localmente';
        banner.classList.add('show');
      } else {
        banner.classList.remove('show');
      }
    }
  }
  window.addEventListener('online', actualizarEstadoConexion);
  window.addEventListener('offline', actualizarEstadoConexion);
  document.addEventListener('DOMContentLoaded', actualizarEstadoConexion);
  document.addEventListener('visibilitychange', () => {
    if(document.visibilityState === 'visible') actualizarEstadoConexion();
  });
  setInterval(actualizarEstadoConexion, 5000);
  actualizarEstadoConexion();

  // v1.16 — badge de "N pendientes" (Fase 2 offline). Lee la cola con
  // obtenerColaCambiosOffline() (vive en offline-mock.js — si esa
  // función no existe todavía en la página, se asume 0 sin romper
  // nada). Se actualiza cada 5s junto con el chequeo de conexión, y
  // también justo después de sincronizar.
  // v1.19: antes usaba getElementById('syncBadge'), pero el id está
  // duplicado a propósito (una copia en el sidebar, otra en el
  // mobile-topbar — ambas se insertan siempre juntas, sin importar el
  // dispositivo). getElementById solo devuelve la primera coincidencia
  // (la del sidebar), así que en mobile la copia visible del topbar
  // nunca se actualizaba ni mostraba el número real. Se cambia a
  // querySelectorAll('.sync-badge') para actualizar TODAS las copias
  // por igual. El onclick de cada una ya estaba puesto individualmente
  // en el HTML, no se toca.
  function actualizarBadgeSync(){
    const badges = document.querySelectorAll('.sync-badge');
    if(!badges.length) return;
    let n = 0;
    try{
      if(typeof obtenerColaCambiosOffline === 'function') n += obtenerColaCambiosOffline().length;
      if(typeof obtenerConflictosOffline === 'function') n += obtenerConflictosOffline().length;
    }catch(err){ /* offline-mock.js no cargado en esta página, se ignora */ }
    badges.forEach(badge => {
      if(n > 0){
        badge.textContent = n;
        badge.style.display = '';
      } else {
        badge.style.display = 'none';
      }
    });
  }

  // Botón manual (tocar el badge) — de respaldo, por si el evento
  // 'online' del navegador no dispara (pasa a veces, ver v1.14).
  window._navForzarSincronizacion = async function(){
    if(typeof sincronizarColaOffline !== 'function'){
      alert('⚠️ La sincronización no está disponible en esta página.');
      return;
    }
    const res = await sincronizarColaOffline();
    actualizarBadgeSync();
    if(!res.ok){
      if(res.motivo === 'sin_internet') alert('🔴 Sin conexión — no se puede sincronizar todavía.');
      else if(res.motivo === 'ya_en_progreso') return; // silencioso, ya está sincronizando
      else alert('⚠️ No se pudo sincronizar: ' + res.motivo);
      return;
    }
    let msg = `✅ ${res.sincronizados} cambio(s) sincronizado(s).`;
    if(res.conflictos > 0) msg += `\n⚠️ ${res.conflictos} conflicto(s) — alguien más editó lo mismo mientras estabas offline. Revisar con obtenerConflictosOffline().`;
    if(res.errores > 0) msg += `\n❌ ${res.errores} con error, se reintentan solos más adelante.`;
    if(res.no_reconocidos > 0) msg += `\n🚫 ${res.no_reconocidos} cambio(s) de un tipo/colección no soportado offline — quedan atascados, no se van a sincronizar solos.`;
    if(res.sincronizados > 0 || res.conflictos > 0 || res.errores > 0 || res.no_reconocidos > 0) alert(msg);
  };

  // Automático: al recuperar señal real (evento 'online'), intenta
  // sincronizar solo. No se dispara si el modo offline manual está
  // activo (estaModoOfflineActivo()) — ahí el usuario sigue trabajando
  // offline a propósito, aunque haya señal.
  window.addEventListener('online', () => {
    if(typeof sincronizarColaOffline !== 'function') return;
    if(_modoOfflineManualActivo()) return;
    sincronizarColaOffline().then(actualizarBadgeSync);
  });
  setInterval(actualizarBadgeSync, 5000);
  actualizarBadgeSync();
})();
