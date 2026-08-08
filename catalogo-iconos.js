// AUDIOLINK · catalogo-iconos.js · v1.0
// Extraído de eventos1.html v1.61 el 2026-08-06.
//
// Contiene: el catálogo de fábrica de tipos de ícono (CATALOGO_ICONOS_DEFAULT),
// las etiquetas/emoji por grupo (GRUPOS_ICONO_LABEL, etiquetaGrupo), los
// colores por tipo (COLORES_POR_TIPO) y la función que dibuja cada ícono como
// SVG (svgIcono, con su helper hexARgba).
//
// IMPORTANTE — orden de carga: este archivo debe cargarse con
// <script src="catalogo-iconos.js"></script> ANTES del script principal de
// eventos1.html, porque ese script usa svgIcono(), CATALOGO_ICONOS_DEFAULT,
// etiquetaGrupo() y COLORES_POR_TIPO como si fueran globales ya definidos
// (no hay imports/exports, es JS clásico de script tags, para mantener el
// mismo funcionamiento como sitio estático).
//
// Este archivo NO toca Firestore ni el DOM — es solo datos + una función pura
// de dibujo. La combinación con overrides de Firestore (catalogoIconosCache)
// y toda la lógica de medición real del canvas/PDF siguen viviendo en
// eventos1.html, sin cambios.
//
// Reutilizable: para usar este catálogo en otro proyecto, copia este archivo
// tal cual y agrégale el <script src="catalogo-iconos.js"> antes de tu script
// principal.

const CATALOGO_ICONOS_DEFAULT = [
  { clave:'bombo',      nombre:'Bombo/Kick',        patron:'bombo|kick',                     formaBase:'bombo',            anchoCM:56, altoCM:66, abrev:'BO',  grupo:'bateria' },
  { clave:'caja',       nombre:'Caja/Redoblante',   patron:'redoblante|snare|caja',           formaBase:'caja',             anchoCM:36, altoCM:36, abrev:'CJ',  grupo:'bateria' },
  { clave:'tom-floor',  nombre:'Floor Tom/Goliat',  patron:'goliat|floor.?tom|tom.*16|16.*tom', formaBase:'tom-floor',      anchoCM:41, altoCM:41, abrev:'FT',  grupo:'bateria' },
  { clave:'tom-12',     nombre:'Tom 12"',           patron:'tom.*12|12.*tom',                 formaBase:'tom',              anchoCM:30, altoCM:30, abrev:'T12', grupo:'bateria' },
  { clave:'tom-10',     nombre:'Tom 10"',           patron:'tom.*10|10.*tom',                 formaBase:'tom',              anchoCM:25, altoCM:25, abrev:'T10', grupo:'bateria' },
  { clave:'tom',        nombre:'Tom (genérico)',    patron:'tom',                             formaBase:'tom',              anchoCM:30, altoCM:30, abrev:'TM',  grupo:'bateria' },
  { clave:'hihat',      nombre:'Hi-Hat',            patron:'hi.?hat|charles',                 formaBase:'platillo-hihat',   anchoCM:36, altoCM:36, abrev:'HH',  grupo:'bateria' },
  { clave:'overhead',   nombre:'Overhead',          patron:'overhead|over.?head|\\boh\\b',    formaBase:'overhead',         anchoCM:50, altoCM:50, abrev:'OH',  grupo:'bateria' },
  { clave:'crash',      nombre:'Crash',             patron:'crash',                           formaBase:'platillo',         anchoCM:46, altoCM:46, abrev:'CR',  grupo:'bateria' },
  { clave:'ride',       nombre:'Ride',              patron:'ride',                            formaBase:'platillo',         anchoCM:51, altoCM:51, abrev:'RD',  grupo:'bateria' },
  { clave:'sillin',     nombre:'Sillín/Throne',     patron:'sillin|throne|banco',             formaBase:'sillin',           anchoCM:36, altoCM:36, abrev:'SI',  grupo:'bateria' },
  { clave:'platillo',   nombre:'Platillo (genérico)', patron:'platillo',                      formaBase:'platillo',         anchoCM:41, altoCM:41, abrev:'PL',  grupo:'bateria' },
  { clave:'caja-di',    nombre:'DI Box',            patron:'\\bdi\\b|direct\\s?box',          formaBase:'caja-di',          anchoCM:10, altoCM:8,  abrev:'DI',  grupo:'linea' },
  { clave:'wireless',   nombre:'Inalámbrico',       patron:'inalambric|wireless',             formaBase:'caja-wireless',    anchoCM:8,  altoCM:8,  abrev:'RF',  grupo:'linea' },
  { clave:'inear',      nombre:'In-Ear',            patron:'in.?ear',                         formaBase:'caja-inear',       anchoCM:8,  altoCM:6,  abrev:'IE',  grupo:'linea' },
  { clave:'snake',      nombre:'Snake/Multicore',   patron:'snake|multicore',                 formaBase:'caja-snake',       anchoCM:22, altoCM:14, abrev:'SN',  grupo:'linea' },
  { clave:'consola',    nombre:'Consola FOH',       patron:'consola|mixer|foh',               formaBase:'caja-consola',     anchoCM:45, altoCM:30, abrev:'FOH', grupo:'linea' },
  { clave:'stand',      nombre:'Base de mic vacía', patron:'base.*mic|mic.*vacia|stand.?vacio', formaBase:'stand-vacio',    anchoCM:20, altoCM:20, abrev:'BM',  grupo:'linea' },
  { clave:'microfono',  nombre:'Micrófono (voz)',   patron:'voz|vocal|coro',                  formaBase:'microfono',        anchoCM:12, altoCM:12, abrev:'MC',  grupo:'voces' },
  { clave:'generico',   nombre:'Genérico',          patron:'',                                formaBase:'generico',         anchoCM:12, altoCM:12, abrev:'',    grupo:'otros' }
];
// Etiqueta + emoji por grupo, para el modal y el desplegable de autocompletar
// (v1.27). Un grupo que no esté en este mapa (ej. 'cuerdas' recién creado
// desde el modal) igual funciona — se muestra con su propio nombre y un
// emoji genérico 🎼, sin necesidad de tocar este mapa.
const GRUPOS_ICONO_LABEL = {
  bateria: { nombre:'Batería',    emoji:'🥁' },
  linea:   { nombre:'Línea/DI',   emoji:'🔌' },
  voces:   { nombre:'Voces',      emoji:'🎤' },
  otros:   { nombre:'Otros',      emoji:'🎼' }
};
function etiquetaGrupo(grupo){ return (GRUPOS_ICONO_LABEL[grupo] || { nombre: grupo || 'Otros', emoji:'🎼' }); }
const COLORES_POR_TIPO = {
  bombo: '#e2574c', caja: '#4f9dde', tom: '#6fbf73', 'tom-floor': '#3fae9e',
  sillin: '#9a978f', platillo: '#c9a24b', 'platillo-hihat': '#c9a24b',
  'caja-di': '#b98fd1', 'caja-wireless': '#e0a63f', 'caja-inear': '#e0a63f',
  'caja-snake': '#8a8f99', 'caja-consola': '#8a8f99', microfono: '#d8d5cb',
  'stand-vacio': '#5f5c54'
};
function hexARgba(hex, alpha){
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${alpha})`;
}
// v1.30: svgCustom (opcional) — SVG pegado a mano desde el modal ⚙️ Tipos de
// ícono, para piezas que no encajan en ninguna formaBase de fábrica. Se usa
// tal cual, sin recolorear (el glow dorado de selección sigue funcionando
// igual porque es un filtro CSS sobre el <svg>, no algo que dependa de su
// contenido). Si el usuario quiere que su SVG respete el tema, puede usar
// "currentColor" en sus fill/stroke — el contenedor .stage-forma hereda
// color del tema automáticamente.
function svgIcono(tipo, seleccionado, colorOverride, svgCustom){
  if(svgCustom) return svgCustom;
  const colorBase = colorOverride || COLORES_POR_TIPO[tipo] || null;
  const trazo = colorBase || 'var(--gold)';
  const relleno = colorBase ? hexARgba(colorBase, seleccionado ? 0.55 : 0.22) : (seleccionado ? 'var(--gold)' : 'var(--surf)');
  switch(tipo){
    case 'bombo':
      // Cuerpo rectangular (vista en planta real, no el perfil circular del cuerpo)
      // + patas estabilizadoras + pedal, basado en tu librería de piezas
      return `<svg viewBox="0 0 100 100">
        <line x1="14" y1="86" x2="26" y2="70" stroke="${trazo}" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="86" y1="86" x2="74" y2="70" stroke="${trazo}" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="14" cy="86" r="2.5" fill="${trazo}"/><circle cx="86" cy="86" r="2.5" fill="${trazo}"/>
        <rect x="7" y="16" width="86" height="72" rx="4" fill="${relleno}" stroke="${trazo}" stroke-width="5"/>
        <rect x="42" y="2" width="16" height="16" rx="3" fill="none" stroke="${trazo}" stroke-width="2.5"/>
      </svg>`;
    case 'caja':
      // Snare: cuerpo + mecanismo bordonero a los lados (basado en tu librería de piezas)
      return `<svg viewBox="0 0 100 100">
        <rect x="2" y="44" width="9" height="12" rx="2" fill="${trazo}"/>
        <rect x="89" y="44" width="9" height="12" rx="2" fill="${trazo}"/>
        <circle cx="50" cy="50" r="45" fill="${relleno}" stroke="${trazo}" stroke-width="5"/>
        <circle cx="50" cy="50" r="36" fill="none" stroke="${trazo}" stroke-width="1.5" opacity="0.5"/>
      </svg>`;
    case 'tom':
      // Tom de rack: cuerpo + clip de montaje al aro (rim mount), floor tom usa patas propias, no clip.
      // El clip va DESPUÉS del círculo (SVG pinta en orden de aparición) para que no quede tapado.
      return `<svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="${relleno}" stroke="${trazo}" stroke-width="6"/>
        <circle cx="50" cy="50" r="37" fill="none" stroke="${trazo}" stroke-width="1.5" opacity="0.5"/>
        <rect x="41" y="0" width="18" height="11" rx="2" fill="${trazo}"/>
      </svg>`;
    case 'tom-floor':
      // Floor tom / Goliat: mismo cuerpo que un tom, + 3 anclajes de patas (basado en tu librería de piezas)
      return `<svg viewBox="0 0 100 100">
        <rect x="9" y="14" width="9" height="9" rx="1.5" fill="${trazo}"/>
        <rect x="82" y="14" width="9" height="9" rx="1.5" fill="${trazo}"/>
        <rect x="45" y="89" width="9" height="9" rx="1.5" fill="${trazo}"/>
        <circle cx="50" cy="50" r="44" fill="${relleno}" stroke="${trazo}" stroke-width="6"/>
        <circle cx="50" cy="50" r="36" fill="none" stroke="${trazo}" stroke-width="1.5" opacity="0.5"/>
      </svg>`;
    case 'sillin':
      // Sillín/throne: asiento circular, forma simple sin detalle innecesario
      return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="43" fill="${relleno}" stroke="${trazo}" stroke-width="5"/><circle cx="50" cy="50" r="33" fill="none" stroke="${trazo}" stroke-width="2" opacity="0.6"/></svg>`;
    case 'platillo': {
      // v1.52: antes eran 12 líneas radiales tipo "rayos de sombrilla".
      // Ahora anillos concéntricos (más fiel a las marcas reales de un
      // platillo visto desde arriba), delgados, con la campana central
      // (r=12) con trazo más grueso para que resalte.
      return `<svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="${relleno}" stroke="${trazo}" stroke-width="1.4"/>
        <circle cx="50" cy="50" r="34" fill="none" stroke="${trazo}" stroke-width="0.9" opacity="0.75"/>
        <circle cx="50" cy="50" r="23" fill="none" stroke="${trazo}" stroke-width="0.9" opacity="0.6"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="${trazo}" stroke-width="3"/>
      </svg>`;
    }
    case 'platillo-hihat':
      // v1.52: antes eran dos elipses superpuestas (vista de lado). Ahora
      // vista superior — mismos anillos concéntricos que 'platillo' — más
      // el trípode del pedal: 3 patas a 120° exactas (un poco más largas
      // que el radio del plato, como en la vida real) y la vara + placa
      // de pedal hacia abajo. El trípode y el pedal van en gris fijo
      // (hardware/soporte), independiente del color del plato (que sigue
      // ${trazo}/${relleno}, respeta override y selección).
      return `<svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="${relleno}" stroke="${trazo}" stroke-width="1.4"/>
        <circle cx="50" cy="50" r="34" fill="none" stroke="${trazo}" stroke-width="0.9" opacity="0.75"/>
        <circle cx="50" cy="50" r="23" fill="none" stroke="${trazo}" stroke-width="0.9" opacity="0.6"/>
        <circle cx="50" cy="50" r="12" fill="none" stroke="${trazo}" stroke-width="3"/>
        <line x1="50" y1="50" x2="50" y2="0" stroke="#9a978f" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="50" y1="50" x2="93.3" y2="75" stroke="#9a978f" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="50" y1="50" x2="6.7" y2="75" stroke="#9a978f" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="50" y1="50" x2="50" y2="72" stroke="#9a978f" stroke-width="1.6" stroke-linecap="round"/>
        <rect x="44" y="72" width="12" height="22" rx="3" fill="#9a978f"/>
      </svg>`;
    case 'caja-di':
      // DI box: cuerpo + dos conectores (entrada/salida XLR) a los lados
      return `<svg viewBox="0 0 100 100">
        <rect x="6" y="20" width="88" height="60" rx="6" fill="${relleno}" stroke="${trazo}" stroke-width="5"/>
        <circle cx="18" cy="50" r="7" fill="none" stroke="${trazo}" stroke-width="3"/>
        <circle cx="82" cy="50" r="7" fill="none" stroke="${trazo}" stroke-width="3"/>
        <text x="50" y="58" font-size="22" text-anchor="middle" fill="${trazo}" font-family="inherit">DI</text>
      </svg>`;
    case 'caja-wireless':
      // Receptor inalámbrico: cuerpo + doble antena (diversity), típico de racks de RF
      return `<svg viewBox="0 0 100 100">
        <rect x="10" y="34" width="80" height="52" rx="6" fill="${relleno}" stroke="${trazo}" stroke-width="5"/>
        <line x1="35" y1="34" x2="30" y2="8" stroke="${trazo}" stroke-width="4" stroke-linecap="round"/>
        <line x1="65" y1="34" x2="70" y2="8" stroke="${trazo}" stroke-width="4" stroke-linecap="round"/>
        <circle cx="30" cy="8" r="4" fill="${trazo}"/><circle cx="70" cy="8" r="4" fill="${trazo}"/>
      </svg>`;
    case 'caja-inear':
      // Bodypack de in-ear: cuerpo + clip de cinturón + antena corta
      return `<svg viewBox="0 0 100 100">
        <rect x="12" y="15" width="76" height="60" rx="7" fill="${relleno}" stroke="${trazo}" stroke-width="5"/>
        <line x1="50" y1="15" x2="50" y2="4" stroke="${trazo}" stroke-width="3" stroke-linecap="round"/>
        <circle cx="35" cy="42" r="7" fill="${trazo}"/><circle cx="65" cy="42" r="7" fill="${trazo}"/>
        <rect x="30" y="75" width="40" height="10" rx="2" fill="${trazo}" opacity="0.55"/>
      </svg>`;
    case 'caja-snake': {
      // Stage box: fila de conectores XLR numerados
      const puntos = [18, 34, 50, 66, 82].map(x => `<circle cx="${x}" cy="52" r="5" fill="none" stroke="${trazo}" stroke-width="2.5"/>`).join('');
      return `<svg viewBox="0 0 100 100"><rect x="6" y="28" width="88" height="48" rx="4" fill="${relleno}" stroke="${trazo}" stroke-width="5"/>${puntos}</svg>`;
    }
    case 'caja-consola': {
      // Consola: faders (línea) + perilla (círculo) por canal, vista en planta
      const canales = [20, 38, 56, 74].map(x => `<line x1="${x}" y1="32" x2="${x}" y2="78" stroke="${trazo}" stroke-width="4" opacity="0.6"/><circle cx="${x}" cy="22" r="4.5" fill="none" stroke="${trazo}" stroke-width="2.5"/>`).join('');
      return `<svg viewBox="0 0 100 100"><rect x="4" y="12" width="92" height="76" rx="5" fill="${relleno}" stroke="${trazo}" stroke-width="5"/>${canales}</svg>`;
    }
    case 'overhead':
      // v1.52: antes el Overhead compartía dibujo con el mic de voz
      // (cápsula redonda + trípode largo, formaBase 'microfono'). Ahora
      // tiene su propio dibujo: cápsula delgada tipo lápiz (con punto de
      // diafragma y dos rayitas de rejilla, para que se lea como
      // micrófono) centrada exactamente en el punto donde convergen 3
      // patas cortas de trípode, vista superior — sin clip. Colores fijos
      // por diseño (dorado en las patas, gris en la cápsula) para
      // contrastar los dos elementos aunque sean el mismo ícono; no usa
      // ${trazo}/${relleno} porque el criterio acá fue visual, no de
      // override por canal.
      return `<svg viewBox="0 0 100 100">
        <line x1="50" y1="50" x2="50" y2="22" stroke="#c9a24b" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="50" y1="50" x2="30" y2="74" stroke="#c9a24b" stroke-width="1.6" stroke-linecap="round"/>
        <line x1="50" y1="50" x2="70" y2="74" stroke="#c9a24b" stroke-width="1.6" stroke-linecap="round"/>
        <rect x="44" y="28" width="12" height="44" rx="6" fill="#d8d5cb33" stroke="#d8d5cb" stroke-width="1.6"/>
        <circle cx="50" cy="34" r="3" fill="#d8d5cb"/>
        <line x1="46" y1="46" x2="54" y2="46" stroke="#d8d5cb" stroke-width="1" opacity="0.7"/>
        <line x1="46" y1="58" x2="54" y2="58" stroke="#d8d5cb" stroke-width="1" opacity="0.7"/>
      </svg>`;
    case 'microfono':
      // Micrófono en planta: cápsula con rejilla + base de trípode (stand incluido, no se duplica pieza)
      return `<svg viewBox="0 0 100 100">
        <line x1="50" y1="70" x2="50" y2="92" stroke="${trazo}" stroke-width="3" opacity="0.7"/>
        <line x1="50" y1="92" x2="31" y2="97" stroke="${trazo}" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
        <line x1="50" y1="92" x2="69" y2="97" stroke="${trazo}" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
        <line x1="50" y1="92" x2="50" y2="99" stroke="${trazo}" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
        <circle cx="50" cy="40" r="32" fill="${relleno}" stroke="${trazo}" stroke-width="6"/>
        <circle cx="50" cy="40" r="21" fill="none" stroke="${trazo}" stroke-width="1.5" opacity="0.5"/>
        <circle cx="50" cy="40" r="10" fill="none" stroke="${trazo}" stroke-width="1.5" opacity="0.5"/>
      </svg>`;
    case 'stand-vacio':
      // Base de mic sin cápsula asignada (v1.18): posición reservada, objeto sin canal
      return `<svg viewBox="0 0 100 100">
        <line x1="50" y1="8" x2="50" y2="78" stroke="${trazo}" stroke-width="4" opacity="0.8"/>
        <line x1="50" y1="78" x2="28" y2="92" stroke="${trazo}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
        <line x1="50" y1="78" x2="72" y2="92" stroke="${trazo}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
        <line x1="50" y1="78" x2="50" y2="97" stroke="${trazo}" stroke-width="4" stroke-linecap="round" opacity="0.8"/>
        <circle cx="50" cy="8" r="7" fill="none" stroke="${trazo}" stroke-width="3"/>
      </svg>`;
    default:
      return `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="${relleno}" stroke="${trazo}" stroke-width="6"/></svg>`;
  }
}
