/* AUDIOLINK · nav.js · v1.14
   V1.14: fix — el banner de sin conexión a veces no desaparecía solo
   al recuperar señal (había que recargar la página), mientras el punto
   de estado (v1.13) sí se actualizaba. Los eventos nativos 'online'/
   'offline' del navegador son conocidos por no dispararse siempre de
   forma confiable (varía según navegador/SO/red). Se agrega un chequeo
   de respaldo cada 5s (setInterval) y también al volver a la pestaña
   (evento 'visibilitychange') — ambos llaman la misma
   actualizarEstadoConexion() de siempre, así que aunque el evento nativo
   falle, en máximo 5s (o al volver a mirar la pestaña) se corrige solo,
   sin depender de un recargado manual. No se tocó la lógica interna de
   la función ni el resto del archivo.
   V1.13: dos mejoras al indicador de conexión (v1.11/v1.12), a pedido
   del usuario. (1) Punto de estado (🟢/🔴) junto al logo "AUDIOLINK",
   tanto en el sidebar de escritorio como en la topbar móvil. (2) Las
   barritas del ícono `vu` JUNTO AL LOGO cambian de dorado a rojo cuando
   se pierde conexión — se le agrega la clase extra .vu-brand solo a
   esas dos instancias (sidebar + topbar), el ícono `vu` del botón de
   menú móvil (⋮) queda igual que siempre, sin tocar, para no confundir
   "conexión" con "hay opciones nuevas en el menú". Todo controlado por
   una sola clase en <body> ('conn-offline'/quitarla si online), que
   actualizarEstadoConexion() ya calculaba — no se agregó ningún
   listener nuevo, solo se extendió esa misma función. No se tocó
   ninguna otra lógica.
   V1.12: fix — el banner de sin conexión (v1.11) nunca se creaba en la
   práctica. Dependía solo de 'DOMContentLoaded' para dispararse la
   primera vez, pero nav.js normalmente se carga DESPUÉS de que ese
   evento ya ocurrió (se inyecta en #nav-mount, que ya existe en el
   DOM) — el listener se registraba tarde y nunca se disparaba. Se
   agrega una llamada directa a actualizarEstadoConexion() al cargar el
   script (sin esperar el evento), y se deja 'DOMContentLoaded' como
   respaldo por si algún módulo cargara nav.js antes de tiempo. No se
   tocó la lógica de show/hide ni los listeners online/offline.
   V1.11: se agrega el indicador global de "sin conexión" — banner fijo
   arriba de la pantalla ("🔴 Sin conexión — los cambios se guardarán al
   recuperar señal"), que aparece/desaparece con los eventos nativos
   online/offline del navegador. Se centraliza acá (no en cada HTML) para
   que quede disponible automáticamente en todos los módulos apenas
   carguen nav.js — pensado para acompañar el piloto de Firestore offline
   persistence (proyecto.html v5.26) sin tener que repetir el indicador
   archivo por archivo cuando se replique a logistica.html/bitacora.html/
   etc. No depende de Firestore directamente: es solo navigator.onLine +
   los eventos del navegador, así que funciona igual en cualquier módulo,
   tenga o no enablePersistence() activado. No se tocó ninguna otra
   función existente.
   V1.10: se agrega el ítem "Recordatorios" (recordatorios.html) a ITEMS,
   en el grupo 'Gestión' (junto a Proyectos/Clientes) — módulo nuevo de
   notas/recordatorios personales o de equipo (ver index.html v2.8 y
   firestore.rules v2.29). Se suma también a idsFueraBottomnav para no
   saturar la barra inferior móvil (queda accesible por sidebar desktop
   y panel "···" móvil). No se tocó ninguna otra función, ítem existente
   ni la lógica de inyección/colapsar/tema.
   V1.9: fix — "Cotizador" nunca aparecía en el panel "···" móvil.
   Estaba en ITEMS con grupo:'Finanzas' (por eso sí se veía en el
   sidebar desktop, que recorre ITEMS completo), pero se excluía de la
   bottomnav con una condición aparte (it.id !== 'cotizador') en vez de
   vía idsFueraBottomnav — y como masMobileGroupedHtml() solo muestra
   lo que está en esa lista, Cotizador quedaba inalcanzable desde el
   menú móvil. Se agrega 'cotizador' a idsFueraBottomnav; la condición
   `it.id !== 'cotizador'` en el filtro de la bottomnav queda igual
   (redundante pero inofensiva, no se tocó para minimizar el diff). No
   se tocó ningún otro ítem, grupo ni lógica.
   V1.8: acordeón por grupo. Cada .sb-grupo-label (desktop) y su
   equivalente en el panel "···" móvil ahora son clickeables: pliegan/
   expanden los ítems de ese grupo (Gestión/Catálogos/Operación/
   Finanzas). Estado por grupo persistido en localStorage, clave
   `audiolink_sb_grupo_<nombre>` — compartida entre desktop y mobile,
   así que cerrar un grupo en uno lo cierra en el otro. Si el sidebar
   desktop está en modo colapsado (solo íconos), el acordeón por grupo
   se ignora vía CSS (.sidebar.collapsed fuerza todos los grupos
   visibles) — no tiene sentido plegar grupos cuando ya solo se ven
   íconos. También: el botón de menú móvil (antes "⋮" / .btn-icon,
   suelto en cada página) ahora lo genera nav.js con el mismo ícono
   `vu` (barritas animadas) que ya vive junto al título "AUDIOLINK" —
   se reutiliza el mismo markup/CSS del vu de marca, sin duplicar
   nada. Páginas viejas con su propio botón "⋮"/.btn-icon van a mostrar
   temporalmente los dos botones superpuestos hasta que se les quite
   ese bloque manualmente (pendiente, uno por uno).
   V1.7: sidebar de escritorio agrupado por categoría (Gestión/
   Catálogos/Operación/Finanzas), separado por encabezados de sección
   (.sb-grupo-label, ver nav.css). Cada ítem de ITEMS ahora tiene un
   campo `grupo` (o null para los que van sueltos: Dashboard arriba,
   Avatar/Icono abajo). Nueva función sbNavGroupedHtml() reemplaza el
   antiguo ITEMS.map(sbItemHtml) SOLO en el sidebar desktop — el orden
   real del array ITEMS no cambió, así que el mobile-bottomnav y el
   panel "···" (que seguían usando ITEMS.filter/.map directo hasta
   v1.7) quedaban exactamente igual que antes, sin reordenarse.
   V1.6: se agrega el ítem "Avatar / Icono" (avatares-iconos.html) a
   ITEMS, después de "Vacas" — catálogo de avatars/iconos del ecosistema
   (Cloudinary, folder ICONOS + Firestore colección avataresIconos). Se
   suma también a idsFueraBottomnav para no saturar la barra inferior
   móvil (queda accesible por sidebar desktop y panel "···" móvil). No
   se tocó ninguna otra función, ítem existente ni la lógica de
   inyección/colapsar/tema.
   V1.5: se agrega el ítem "Vacas" (vacas.html) a ITEMS, después de
   "Cotizador" — módulo de vaca colectiva (crowdfunding interno). Se suma
   también a idsFueraBottomnav para no saturar la barra inferior móvil
   (queda accesible por sidebar desktop y panel "···" móvil). No se tocó
   ninguna otra función, ítem existente ni la lógica de
   inyección/colapsar/tema.
   V1.4: se agrega el ítem "Eventos" (eventos.html) a ITEMS, después de
   "Equipo Técnico" — módulo Live (sonido en vivo), mismo criterio que
   V1.3 (página nueva del ecosistema que aún no estaba en el menú). Se
   suma también a idsFueraBottomnav para no saturar la barra inferior
   móvil (queda accesible por sidebar desktop y panel "···" móvil). No
   se tocó ninguna otra función, ítem existente ni la lógica de
   inyección/colapsar/tema.
   V1.3: se agregan los ítems "Egresos" (egresos.html) y "Equipo Técnico"
   (equipo-tecnico.html) a ITEMS, después de "Pagos" — mismo criterio que
   V1.2 (páginas nuevas del ecosistema que aún no estaban en el menú).
   Ambos se suman también a idsFueraBottomnav para no saturar la barra
   inferior móvil (quedan accesibles por sidebar desktop y panel "···"
   móvil). No se tocó ninguna otra función, ítem existente ni la lógica
   de inyección/colapsar/tema.
   V1.2: se agregan los ítems "Estudios" (estudios.html) y "Músicos"
   (musicos.html) a ITEMS, entre Clientes y Logística — mismos catálogos
   maestros que antes vivían como modales dentro de proyecto.html (ver
   plan de migración acordado). Como ya son ítems reales de ITEMS[], se
   retiraron de proyecto.html los accesos duplicados que tenía en su
   sbFootExtra (abrirModalEstudios()/abrirModalMusicos()) — ahora entran
   por acá, con href real, disponibles en TODO el ecosistema (antes solo
   se podían abrir desde Proyectos). Se agregan también al filtro del
   mobile-bottomnav (junto a cotizador y clientes) para que la barra
   inferior mobile no crezca de 4 accesos — quedan disponibles ahí vía
   sidebar desktop y panel "···" mobile. No se tocó ninguna otra función,
   ítem existente ni la lógica de inyección/colapsar/tema.
   V1.1: se agrega el ítem "Clientes" (clientes.html) a ITEMS, entre
   Proyectos y Logística. No se tocó ninguna otra función, ítem existente
   ni la lógica de inyección/colapsar/tema.
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

  const ITEMS = [
    { id:'dashboard', href:'index.html',     icon:'🏠', label:'Dashboard', grupo:null },
    { id:'proyecto',  href:'proyecto.html',  icon:'📁', label:'Proyectos', grupo:'Gestión' },
    { id:'clientes',  href:'clientes.html',  icon:'👤', label:'Clientes',  grupo:'Gestión' },
    { id:'recordatorios', href:'recordatorios.html', icon:'📝', label:'Recordatorios', grupo:'Gestión' },
    { id:'estudios',  href:'estudios.html',  icon:'🏢', label:'Estudios',  grupo:'Catálogos' },
    { id:'musicos',   href:'musicos.html',   icon:'🎻', label:'Músicos',   grupo:'Catálogos' },
    { id:'logistica', href:'logistica.html', icon:'🎚️', label:'Logística', grupo:'Operación' },
    { id:'pagos',     href:'pagos.html',     icon:'💳', label:'Pagos',      grupo:'Finanzas' },
    { id:'egresos',   href:'egresos.html',   icon:'📤', label:'Egresos',    grupo:'Finanzas' },
    { id:'equipo-tecnico', href:'equipo-tecnico.html', icon:'🛠️', label:'Equipo Técnico', grupo:'Catálogos' },
    { id:'eventos',   href:'eventos.html',   icon:'🎤', label:'Eventos',   grupo:'Operación' },
    { id:'cotizador', href:'cotizador.html', icon:'🧮', label:'Cotizador',  grupo:'Finanzas' },
    { id:'vacas',     href:'vacas.html',     icon:'🐄', label:'Vacas',     grupo:'Operación' },
    { id:'avatares',  href:'avatares-iconos.html', icon:'🤓', label:'Avatar / Icono', grupo:null }
  ];

  // Ítems que se sacan del mobile-bottomnav (para no saturar la barra de 4
  // accesos) pero que igual necesitan quedar accesibles en mobile: se
  // listan aparte en el panel "···". Antes solo estaba 'clientes'
  // hardcodeado acá (v1.1); v1.2 lo generaliza a una lista para sumar
  // 'estudios' y 'musicos' sin repetir el mismo condicional 3 veces.
  const idsFueraBottomnav = ['clientes', 'recordatorios', 'estudios', 'musicos', 'egresos', 'equipo-tecnico', 'eventos', 'vacas', 'avatares', 'cotizador'];

  const vu = `<div class="vu"><span></span><span></span><span></span><span></span><span></span></div>`;
  // v1.13: mismo ícono, clase extra para poder cambiarle el color según
  // conexión sin afectar el vu del botón de menú móvil (que usa `vu` a
  // secas, arriba).
  const vuBrand = `<div class="vu vu-brand"><span></span><span></span><span></span><span></span><span></span></div>`;
  const connDot = `<span class="conn-dot" title="Estado de conexión"></span>`;

  function grupoColapsado(nombre){
    return localStorage.getItem('audiolink_sb_grupo_' + nombre) === '1';
  }

  function sbGrupoLabelHtml(nombre){
    return `<div class="sb-grupo-label" onclick="toggleSbGrupo('${nombre}')"><span>${nombre}</span><i class="sb-grupo-arrow">▾</i></div>`;
  }

  function sbItemHtml(it){
    const esActivo = it.id === activo;
    if(esActivo){
      return `<a href="#" class="sb-item active" style="pointer-events:none;"><i>${it.icon}</i><span>${it.label}</span></a>`;
    }
    return `<a href="${it.href}" class="sb-item"><i>${it.icon}</i><span>${it.label}</span></a>`;
  }

  // v1.7: sidebar agrupado por categoría (grupo:null = sin sección,
  // van sueltos arriba/abajo). Recorre GRUPOS_ORDEN y por cada uno
  // filtra ITEMS conservando su orden original — no se reordena ni
  // se toca la lista plana ITEMS (de la que dependen el mobile-bottomnav
  // y el panel "···", que siguen exactamente igual que antes).
  const GRUPOS_ORDEN = ['Gestión', 'Catálogos', 'Operación', 'Finanzas'];
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
        html += `<a href="${it.href}" class="mas-mobile-item" style="text-decoration:none;"><i>${it.icon}</i>${it.label}</a>\n      `;
      });
      html += `</div>\n  </div>\n  `;
    });
    sinGrupo.forEach(it => {
      html += `<a href="${it.href}" class="mas-mobile-item" style="text-decoration:none;"><i>${it.icon}</i>${it.label}</a>\n  `;
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

  const sidebarHtml = `
<aside class="sidebar" id="sidebar">
  <div class="sb-brand">
    ${vuBrand}
    <h1>AUDIOLINK</h1>
    ${connDot}
  </div>
  <nav class="sb-nav">
    ${sbNavGroupedHtml()}
  </nav>
  <div class="sb-foot">
    ${extraSbFootHtml()}
    ${soportaTema ? '<div class="sb-item" onclick="toggleTema()" id="btnTemaSb"><i>🌙</i><span>Tema</span></div>' : ''}
    <div class="sb-item" onclick="cerrarSesion()"><i>⏻</i><span>Cerrar sesión</span></div>
    <div class="sb-toggle" id="sidebarToggle"><i>«</i><span>Colapsar</span></div>
    <div class="sb-credit">Marto 🧠 · martowave@gmail.com</div>
  </div>
</aside>

<div class="mobile-topbar">
  <div class="brand">
    ${vuBrand}
    <h1>AUDIOLINK</h1>
    ${connDot}
  </div>
  <div class="mobile-topbar-actions">
    <button class="btn-menu-vu" onclick="toggleMasMobile()" title="Más opciones">${vu}</button>
  </div>
</div>

<div class="mas-mobile-panel" id="masMobilePanel">
  ${masMobileGroupedHtml()}
  ${extraMasMobileHtml()}
  ${soportaTema ? '<div class="mas-mobile-item" onclick="toggleTema()"><i>🌙</i>Cambiar tema</div>' : ''}
  <div class="mas-mobile-item" onclick="cerrarSesion()"><i>⏻</i>Cerrar sesión</div>
  <div class="mas-mobile-credit">Marto 🧠 · martowave@gmail.com</div>
</div>

<nav class="mobile-bottomnav">
  ${ITEMS.filter(it => it.id !== 'cotizador' && !idsFueraBottomnav.includes(it.id)).map(it =>
    `<a href="${it.href}"${it.id === activo ? ' class="active"' : ''}><i>${it.icon}</i>${it.label}</a>`
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
    const icono = tema === 'dark' ? '🌙' : '☀️';
    const sbIcon = document.querySelector('#btnTemaSb i');
    if(sbIcon) sbIcon.textContent = icono;
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
    const t = localStorage.getItem('audiolink_tema') || 'dark';
    actualizarIconoTema(t);
  });
  // ============ INDICADOR SIN CONEXIÓN (v1.11) ============
  function crearBannerOffline(){
    if(document.getElementById('offlineBanner')) return;
    const banner = document.createElement('div');
    banner.id = 'offlineBanner';
    banner.className = 'offline-banner';
    banner.textContent = '🔴 Sin conexión — los cambios se guardarán al recuperar señal';
    document.body.appendChild(banner);
  }
  function actualizarEstadoConexion(){
    crearBannerOffline();
    const banner = document.getElementById('offlineBanner');
    const offline = !navigator.onLine;
    if(banner) banner.classList.toggle('show', offline);
    document.body.classList.toggle('conn-offline', offline);
  }
  window.addEventListener('online', actualizarEstadoConexion);
  window.addEventListener('offline', actualizarEstadoConexion);
  document.addEventListener('DOMContentLoaded', actualizarEstadoConexion);
  document.addEventListener('visibilitychange', () => {
    if(document.visibilityState === 'visible') actualizarEstadoConexion();
  });
  setInterval(actualizarEstadoConexion, 5000);
  actualizarEstadoConexion();
})();
