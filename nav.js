/* AUDIOLINK · nav.js · v1.2
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
    { id:'dashboard', href:'index.html',     icon:'🏠', label:'Dashboard'  },
    { id:'proyecto',  href:'proyecto.html',  icon:'📁', label:'Proyectos'  },
    { id:'clientes',  href:'clientes.html',  icon:'👤', label:'Clientes'   },
    { id:'estudios',  href:'estudios.html',  icon:'🏢', label:'Estudios'   },
    { id:'musicos',   href:'musicos.html',   icon:'🎻', label:'Músicos'    },
    { id:'logistica', href:'logistica.html', icon:'🎚️', label:'Logística' },
    { id:'pagos',     href:'pagos.html',     icon:'💳', label:'Pagos'      },
    { id:'cotizador', href:'cotizador.html', icon:'🧮', label:'Cotizador'  }
  ];

  // Ítems que se sacan del mobile-bottomnav (para no saturar la barra de 4
  // accesos) pero que igual necesitan quedar accesibles en mobile: se
  // listan aparte en el panel "···". Antes solo estaba 'clientes'
  // hardcodeado acá (v1.1); v1.2 lo generaliza a una lista para sumar
  // 'estudios' y 'musicos' sin repetir el mismo condicional 3 veces.
  const idsFueraBottomnav = ['clientes', 'estudios', 'musicos'];

  const vu = `<div class="vu"><span></span><span></span><span></span><span></span><span></span></div>`;

  function sbItemHtml(it){
    const esActivo = it.id === activo;
    if(esActivo){
      return `<a href="#" class="sb-item active" style="pointer-events:none;"><i>${it.icon}</i><span>${it.label}</span></a>`;
    }
    return `<a href="${it.href}" class="sb-item"><i>${it.icon}</i><span>${it.label}</span></a>`;
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
    ${vu}
    <h1>AUDIOLINK</h1>
  </div>
  <nav class="sb-nav">
    ${ITEMS.map(sbItemHtml).join('\n    ')}
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
    ${vu}
    <h1>AUDIOLINK</h1>
  </div>
  <div class="mobile-topbar-actions">
    <button class="btn-icon" onclick="toggleMasMobile()" title="Más opciones">⋮</button>
  </div>
</div>

<div class="mas-mobile-panel" id="masMobilePanel">
  ${ITEMS.filter(it => idsFueraBottomnav.includes(it.id) && it.id !== activo).map(it =>
    `<a href="${it.href}" class="mas-mobile-item" style="text-decoration:none;"><i>${it.icon}</i>${it.label}</a>`
  ).join('\n  ')}
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
})();
