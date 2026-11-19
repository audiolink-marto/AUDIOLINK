/* AUDIOLINK · iconos-instrumentacion.js · v1.5
   v1.5: 3 iconos nuevos, solo se AGREGAN (nada existente cambia): `acusticas`
   (clavijero de guitarra acustica, para tiple/tres/cuatro y afines), `bloque`
   (llaves con una B: {B}, para grabaciones en bloque) y `coros` (tres bustos).
   Registrados en P, LISTA, COL/COLL y LABELS. Sin asignaciones por defecto.
   v1.4:   v1.4: 3 iconos nuevos (solo se AGREGAN al catalogo; ningun icono ni color
   existente cambia): `bajos` (clave de fa), `guiro` (percusion de mano) y
   `exoticos` (palmera, instrumentos exoticos y autoctonos). Se registran en
   P, LISTA (selector del editor), COL/COLL (color oscuro/claro) y LABELS.
   No se asigna ninguno por defecto: se eligen por grupo en el editor de
   instrumentacion. Una clave de grupo igual al id (ej. `bajos`) lo usa solo.
   v1.3: el icono elegido por grupo se resuelve con iconoClave(clave, grupo)
   (grupo.icono si existe, si no la clave del grupo, si no "otros"). Nuevo
   ICONOS_LISTA + iconoPickerHtml() para el selector del editor. Tema claro
   por :root[data-tema="light"] (el de logistica/proyecto; por defecto oscuro).
   v1.2: color por grupo (COL oscuro / COLL claro, contraste >= 3:1; apagado
   gris como en SPEC) y nuevo icono Cuerdas (cuerda vibrando).
   v1.1: estilo de los toggles de SPEC_MARTO v3.15: boton cuadrado oscuro con
   borde gris, linea fina de 1 px, detalles secundarios al 50 %.
   El color va ligado al icono (no al grupo): elegir icono = elegir color.
   API:
     iconoClave(clave, grupo)                       -> id de icono
     iconoGrupo(idIcono, {size, titulo, on})        -> 1 boton con icono
     iconosSesion(claves, {max, size, labelFn, iconoFn}) -> solo marcados (+N)
     iconosTira(todas, marcadas, {size, labelFn, iconoFn}) -> tira fija
     iconoPickerHtml(actual, nombreFn, claveGrupo)  -> cuadricula de seleccion */
(function(){
  const S = 'class="s"', H = 'class="h"';
  const P = {
    bateria: '<rect x="4" y="12" width="16" height="8"/><path '+S+' d="M9 12v8M12 12v8M15 12v8"/><path d="M6 4l5 6M18 4l-5 6"/>',
    percusionLatina: '<path d="M6 5h12l-2 15H8z"/><path '+S+' d="M6.8 11h10.4M7.5 16h9"/>',
    cuerdas: '<path '+S+' d="M3 12h18M3 8v8M21 8v8"/><path d="M3 12c1.75-8 3.5-8 5.25 0s3.5 8 5.25 0 3.5-8 5.25 0H21"/>',
    bronces: '<path d="M3 12h8M11 12l9-6v12z"/><path '+S+' d="M6 12V8M8.5 12V8"/>',
    voces: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11v1a6 6 0 0 0 12 0v-1"/><path '+S+' d="M12 18v3M9 21h6"/>',
    teclas: '<rect x="3" y="6" width="18" height="12"/><path '+S+' d="M7.5 13v5M12 13v5M16.5 13v5"/><rect '+H+' x="6.2" y="6" width="2.6" height="7"/><rect '+H+' x="10.7" y="6" width="2.6" height="7"/><rect '+H+' x="15.2" y="6" width="2.6" height="7"/>',
    otros: '<path '+S+' d="M6 4v16M12 4v16M18 4v16"/><rect '+H+' x="4" y="13" width="4" height="3"/><rect '+H+' x="10" y="7" width="4" height="3"/><rect '+H+' x="16" y="10" width="4" height="3"/>',
    bajos: '<path d="M6 10C6 6 9 4 12 4s6 2.5 5 7c-1 3.5-5 7-10.5 9"/><circle '+H+' cx="6.5" cy="10" r="1.9"/><circle '+H+' cx="20.2" cy="7.5" r="1.3"/><circle '+H+' cx="20.2" cy="12.5" r="1.3"/>',
    guiro: '<rect x="3" y="10" width="18" height="8" rx="4"/><path '+S+' d="M7.5 10v8M10.5 10v8M13.5 10v8M16.5 10v8"/><path d="M4 4.5l11 4"/>',
    exoticos: '<path d="M12 21c0-4 .5-7 1-10"/><path d="M13 11c-1.5-3.5-5-5-9-4M13 11c1.5-3.5 5-5 9-4M13 11c-.5-3 0-5 1-7"/><path '+S+' d="M13 11c-3-1-6 0-8 3M13 11c3-1 6 0 8 3M8 21h8"/><circle '+H+' cx="12.3" cy="12" r="1"/>',
    acusticas: '<path d="M9 2.5h6c1.4 0 2 1 1.7 2.4l-1.6 7.1c-.2.9-.5 1.5-1 2.5H9.9c-.5-1-.8-1.6-1-2.5L7.3 4.9C7 3.5 7.6 2.5 9 2.5z"/><path d="M10.4 14.5V21M13.6 14.5V21"/><path '+S+' d="M11 5.5V21M12 5.5V21M13 5.5V21"/><path d="M7.4 5.2H5M8.1 8.6H5M8.7 12H5M16.6 5.2H19M15.9 8.6H19M15.3 12H19"/><circle '+H+' cx="3.9" cy="5.2" r="1.5"/><circle '+H+' cx="3.9" cy="8.6" r="1.5"/><circle '+H+' cx="3.9" cy="12" r="1.5"/><circle '+H+' cx="20.1" cy="5.2" r="1.5"/><circle '+H+' cx="20.1" cy="8.6" r="1.5"/><circle '+H+' cx="20.1" cy="12" r="1.5"/>',
    bloque: '<path d="M7.5 3C5.5 3 5 4 5 6v3.2c0 1.4-.8 2.3-2 2.8 1.2.5 2 1.4 2 2.8V18c0 2 .5 3 2.5 3M16.5 3C18.5 3 19 4 19 6v3.2c0 1.4.8 2.3 2 2.8-1.2.5-2 1.4-2 2.8V18c0 2-.5 3-2.5 3"/><path d="M10 7.5v9M10 7.5h2.2c1.3 0 2 .8 2 1.85s-.7 1.85-2 1.85H10M10 11.2h2.6c1.3 0 2.1.9 2.1 2.65s-.8 2.65-2.1 2.65H10"/>',
    coros: '<circle cx="12" cy="7.5" r="2.6"/><path d="M7.5 20v-1.2c0-2.8 2-4.6 4.5-4.6s4.5 1.8 4.5 4.6V20z"/><circle '+S+' cx="5.2" cy="10" r="1.9"/><circle '+S+' cx="18.8" cy="10" r="1.9"/><path '+S+' d="M2 20v-1c0-2 1.5-3.4 3.2-3.4M22 20v-1c0-2-1.5-3.4-3.2-3.4"/>'
  };
  const LISTA = [
    { id:'bateria', label:'Batería' }, { id:'percusionLatina', label:'Percusión' },
    { id:'cuerdas', label:'Cuerdas' }, { id:'bronces', label:'Vientos' },
    { id:'voces', label:'Voces' }, { id:'teclas', label:'Teclas' }, { id:'otros', label:'Otros' },
    { id:'bajos', label:'Bajos' }, { id:'guiro', label:'Percusión de mano' }, { id:'exoticos', label:'Exóticos y autóctonos' },
    { id:'acusticas', label:'Cuerdas acústicas' }, { id:'bloque', label:'Bloque' }, { id:'coros', label:'Coros' }
  ];
  const COL  = { bateria:'#ff8a3d', percusionLatina:'#ffd23f', cuerdas:'#39ff88', bronces:'#ff4fd8', voces:'#33e6f2', teclas:'#8fa0ff', otros:'#c8c8d0', bajos:'#ff5a5a', guiro:'#c6f24a', exoticos:'#c58bff', acusticas:'#e6c08a', bloque:'#f2f2f7', coros:'#4ab3ff' };
  const COLL = { bateria:'#c25a00', percusionLatina:'#9a7400', cuerdas:'#00924a', bronces:'#c2008f', voces:'#0a8f9b', teclas:'#4256d0', otros:'#6b6b73', bajos:'#c42a2a', guiro:'#5f8200', exoticos:'#7a2fd0', acusticas:'#8a5a1f', bloque:'#3a3a44', coros:'#0a6fc2' };
  const LABELS = { bateria:'Batería', percusionLatina:'Percusión latina', cuerdas:'Cuerdas', bronces:'Vientos', voces:'Voces', teclas:'Teclas', otros:'Otros', bajos:'Bajos', guiro:'Percusión de mano', exoticos:'Exóticos y autóctonos', acusticas:'Cuerdas acústicas', bloque:'Bloque', coros:'Coros' };

  function inyectarCSS(){
    if(document.getElementById('igCss')) return;
    const L = ':root[data-tema="light"],:root[data-theme="light"]';
    const st = document.createElement('style'); st.id = 'igCss';
    st.textContent =
      ':root{--ig-body:#2e2e36;--ig-brd:#73737a;--ig-hov:#cccccf;--ig-off:#666670;--ig-on:#33e6f2}' +
      L + '{--ig-body:#ece9df;--ig-brd:#a9a595;--ig-hov:#4a4636;--ig-off:#9a9788;--ig-on:#0a9aa6}' +
      '.ig-fila{display:inline-flex;align-items:center;gap:4px;flex-shrink:0;}' +
      '.ig-btn{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;background:var(--ig-body);border:1px solid var(--ig-brd);color:var(--ig-off);flex-shrink:0;transition:border-color .12s,color .12s;}' +
      '.ig-btn:hover{border-color:var(--ig-hov);}' +
      '.ig-btn.on{color:var(--c,var(--ig-on));}' +
      L.split(',').map(x => x + ' .ig-btn.on').join(',') + '{color:var(--cl,var(--ig-on));}' +
      '.ig-btn svg{display:block;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:1.25px;stroke-linejoin:miter;overflow:visible;}' +
      '.ig-btn svg *{vector-effect:non-scaling-stroke;}' +
      '.ig-btn svg .s{opacity:.5;}.ig-btn svg .h{fill:currentColor;stroke:none;}' +
      '.ig-mas{font-size:.72rem;font-weight:700;color:var(--ig-off);padding:0 2px;}' +
      '.ig-picker{display:flex;gap:6px;flex-wrap:wrap;padding:8px 12px;border-top:1px dashed var(--brd,#444);}' +
      '.ig-pick{background:none;border:0;padding:2px;cursor:pointer;border-radius:6px;display:inline-flex;}' +
      '.ig-pick.sel{outline:2px solid var(--ig-hov);outline-offset:1px;}';
    document.head.appendChild(st);
  }
  function esc(t){ return String(t).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

  function iconoClave(clave, grupo){
    if(grupo && grupo.icono && P[grupo.icono]) return grupo.icono;
    return P[clave] ? clave : 'otros';
  }
  function iconoGrupo(id, o){
    o = o || {};
    const k = P[id] ? id : 'otros', s = o.size || 26, m = Math.round(s * 0.2), t = esc(o.titulo || LABELS[k]);
    return '<span class="ig-btn' + (o.on === false ? '' : ' on') + '" style="width:' + s + 'px;height:' + s + 'px;padding:' + m + 'px;--c:' + COL[k] + ';--cl:' + COLL[k] + '" title="' + t + '">' +
           '<svg viewBox="0 0 24 24" role="img" aria-label="' + t + '">' + P[k] + '</svg></span>';
  }
  function iconosSesion(claves, o){
    o = o || {};
    if(!Array.isArray(claves) || !claves.length) return '';
    const max = o.max || 3, lf = o.labelFn || (k => LABELS[k] || k), fi = o.iconoFn || (k => iconoClave(k));
    const vis = claves.slice(0, max), resto = claves.length - vis.length;
    return '<span class="ig-fila">' + vis.map(k => iconoGrupo(fi(k), { size:o.size, titulo:lf(k) })).join('') +
      (resto > 0 ? '<span class="ig-mas" title="' + esc(claves.slice(max).map(lf).join(', ')) + '">+' + resto + '</span>' : '') + '</span>';
  }
  function iconosTira(todas, marcadas, o){
    o = o || {};
    const lf = o.labelFn || (k => LABELS[k] || k), fi = o.iconoFn || (k => iconoClave(k));
    return '<span class="ig-fila">' + todas.map(k => iconoGrupo(fi(k), { size:o.size, titulo:lf(k), on:(marcadas || []).includes(k) })).join('') + '</span>';
  }
  function iconoPickerHtml(actual, nombreFn, claveGrupo){
    return LISTA.map(i => '<button type="button" class="ig-pick' + (i.id === actual ? ' sel' : '') + '" title="' + esc(i.label) +
      '" onclick="event.stopPropagation(); ' + nombreFn + '(\'' + claveGrupo + '\',\'' + i.id + '\')">' + iconoGrupo(i.id, { size:30, titulo:i.label }) + '</button>').join('');
  }
  inyectarCSS();
  window.ICONOS_INSTRUMENTACION = P; window.ICONOS_LISTA = LISTA;
  window.iconoClave = iconoClave; window.iconoGrupo = iconoGrupo; window.iconosSesion = iconosSesion;
  window.iconosTira = iconosTira; window.iconoPickerHtml = iconoPickerHtml;
})();
