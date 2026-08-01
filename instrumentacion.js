/* AUDIOLINK · instrumentacion.js · v1.5
   v1.5: se agrega un campo `orden` (number) a cada GRUPO, para que el
   orden visual ya no dependa de cómo Firestore devuelva las claves del
   mapa `instrumentacionGrupos` (los mapas en Firestore NO garantizan
   preservar el orden de inserción de sus campos — a diferencia de un
   arreglo, que sí lo garantiza; por eso las piezas dentro de un grupo,
   que son un arreglo, nunca tuvieron este problema). Mismo patrón ya
   usado para los temas de proyecto.html (campo `orden` ahí también).
   - renderInstrumentacion() hace backfill en memoria de `orden` para
     grupos guardados antes de este cambio (usa el orden de llegada de
     las claves como fallback, una sola vez), y siempre pinta ordenado
     por `orden`, no por Object.keys().
   - moverGrupoInstr() ahora intercambia el valor de `orden` entre el
     grupo y su vecino (en vez de reconstruir el objeto con las claves
     reordenadas).
   - agregarGrupoInstrPrompt() asigna al grupo nuevo el `orden` más alto
     existente + 1, para que caiga al final.
   - CATALOGO_INSTRUMENTACION_DEFAULT gana `orden` 0..6 en sus 7 grupos
     base, en el mismo orden que ya tenían.
   No se tocó nada de piezas (instrumentacionState sigue siendo arreglo,
   sin cambios), ni el sistema de opciones del selector (v1.1).

   v1.4: cada pieza ({id, nombre}) gana un campo opcional `subgrupo`
   (texto libre, ej. "Bombo" para las piezas "BD IN"/"BD OUT" dentro del
   grupo "Batería"). Se agrega un input pequeño junto al nombre en cada
   fila de pieza (instr-pieza-row, que pasa de 4 a 5 columnas). Piezas
   sin subgrupo quedan exactamente igual que antes (campo vacío, no
   rompe nada existente). Consumido por logistica.html (propaga
   subgrupoCatalogo al inputList) y bitacora.html (sub-agrupa visualmente
   dentro del grupo). No se tocó nada del sistema de grupos, opciones del
   selector, ni reordenar ↑↓.

   v1.3: se agrega reordenar con botones ↑↓ (sin drag&drop — más confiable
   en mobile, sin depender de librerías nuevas ni gestos táctiles):
   - Piezas dentro de un grupo: botones ↑↓ junto al ✕ en cada fila,
     mueven la pieza dentro de instrumentacionState[key] (array).
   - Grupos completos: botones ↑↓ en el header de cada grupo, mueven la
     clave dentro del orden de instrumentacionGruposState (los objetos JS
     preservan el orden de inserción de claves string, así que reordenar
     = reconstruir el objeto con las claves en el nuevo orden).
   Los botones se deshabilitan en los extremos (primera pieza no sube,
   última no baja, etc.) en vez de dar la vuelta.

   ⚠️ CORRECCIÓN sobre v1.2: la versión v1.2 que se había anunciado antes
   NUNCA se aplicó de verdad (falló al escribirse y no se detectó a
   tiempo) — el archivo que quedó activo seguía siendo v1.1, con
   cantidad/unidades todavía funcionando. Esta v1.3 sí incluye, ahora
   verificado, todo lo que se había prometido en v1.2:
   - Se elimina el sistema de cantidad/unidades (generarUnidades,
     cambiarCantidadInstr, cambiarUnidadInstr). Cada pieza es ahora
     {id, nombre}. Piezas repetidas (ej. varias trompetas) se
     individualizan a mano agregando cada una por separado.
   - Piezas y grupos custom tienen `id`/clave estable
     (pz_<timestamp>_<random> / custom_<timestamp>), ya no se identifican
     por posición (idx) en el array.
   - "+ agregar personalizada" pregunta (confirm) si también se quiere
     guardar como opción reutilizable del selector.
   - Aviso al eliminar un grupo menciona piezas Y opciones perdidas.
   - Modo prueba confirmado: no se migran datos viejos guardados con
     cantidad/unidades, esos campos simplemente se ignoran al cargar.

   v1.1: se pueden editar/añadir/quitar las OPCIONES fijas del <select>
   "Elegir pieza..." de cada grupo (grupo.piezas). Botón ⚙️ en el header
   del grupo despliega un mini-editor (renombrar, quitar, "+ agregar
   opción"). Independiente de las piezas ya agregadas a propósito.

   v1.0: extraído de proyecto.html (bloque "INSTRUMENTACIÓN v4.2").
   Edición de GRUPOS (agregar / renombrar / eliminar, incluidos los 7
   base) — modo prueba. Cada proyecto guarda su propio catálogo de grupos
   en `instrumentacionGrupos` (campo del documento, junto a
   `instrumentacion`); si el proyecto no lo tiene aún, se usa una copia
   de CATALOGO_INSTRUMENTACION_DEFAULT como punto de partida.

   ⚠️ Nota de alcance (sigue vigente): bitacora.html y logistica.html
   tienen su propio diccionario fijo GRUPOS_INSTRUMENTACION_LABELS y NO
   leen instrumentacionGrupos — si acá renombras/eliminas/agregas/
   reordenas un grupo, esos dos archivos van a seguir mostrando el orden
   y nombre viejo. No rompe nada, es solo desincronización visual
   mientras se prueba esto. */

const CATALOGO_INSTRUMENTACION_DEFAULT = {
  bateria: { label: 'Batería', orden: 0, piezas: ['Kick','Redoblante','Tom 1','Tom 2','Tom de piso','Hi-hat','Overhead L','Overhead R','Ride'] },
  percusionLatina: { label: 'Percusión latina', orden: 1, piezas: ['Congas','Bongó','Timbales','Campana','Güiro','Maracas','Clave'] },
  cuerdas: { label: 'Cuerdas', orden: 2, piezas: ['Bajo eléctrico','Contrabajo','Baby bass','Guitarra eléctrica','Guitarra acústica','Tres','Cuatro'] },
  bronces: { label: 'Bronces', orden: 3, piezas: ['Trompeta','Trombón','Saxofón','Flauta traversa'] },
  voces: { label: 'Voces', orden: 4, piezas: ['Voz principal','Coro 1','Coro 2','Coro 3'] },
  teclas: { label: 'Teclas', orden: 5, piezas: ['Piano','Teclado/Sintetizador'] },
  otros: { label: 'Otros', orden: 6, piezas: [] }
};

function catalogoInstrumentacionDefaultCopy(){
  return JSON.parse(JSON.stringify(CATALOGO_INSTRUMENTACION_DEFAULT));
}

// instrumentacionGruposState: catálogo de grupos del proyecto que se está
// editando ahora mismo: { clave: { label, piezas: [nombres para el <select>] } }
// El ORDEN de las claves = orden visual de los grupos (v1.3).
let instrumentacionGruposState = {};
// instrumentacionState: piezas ya agregadas por grupo (lo que se guarda):
// { clave: [{id, nombre}] } — v1.3: sin cantidad/unidades, orden del
// array = orden visual de las piezas dentro del grupo.
let instrumentacionState = {};
let instrGruposAbiertos = {};
// v1.1: qué grupos tienen visible el editor de opciones fijas del <select>
let instrOpcionesAbiertas = {};

function instrumentacionVacia(){
  const st = {};
  Object.keys(instrumentacionGruposState).forEach(k => st[k] = []);
  return st;
}

// v1.2: generador simple de id estable, sin dependencias externas.
function generarIdInstr(prefijo){
  return `${prefijo}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function buscarPiezaPorId(key, id){
  return (instrumentacionState[key] || []).find(p => p.id === id);
}

function renderInstrumentacion(){
  const cont = document.getElementById('instrumentacionContainer');
  // v1.5: backfill en memoria de `orden` para grupos guardados antes de
  // este cambio — usa el orden de llegada de las claves como fallback,
  // una sola vez (se guarda con orden la próxima vez que se use
  // "Guardar"). A partir de acá, el orden visual SIEMPRE sale de este
  // campo, nunca de Object.keys() directamente (ver comentario v1.5
  // arriba sobre por qué los mapas de Firestore no lo garantizan).
  Object.keys(instrumentacionGruposState).forEach((k, i) => {
    if(typeof instrumentacionGruposState[k].orden !== 'number') instrumentacionGruposState[k].orden = i;
  });
  const clavesGrupos = Object.keys(instrumentacionGruposState)
    .sort((a, b) => instrumentacionGruposState[a].orden - instrumentacionGruposState[b].orden);
  cont.innerHTML = clavesGrupos.map((key, gIdx) => {
    const grupo = instrumentacionGruposState[key];
    const piezas = instrumentacionState[key] || [];
    // v1.3 fix: piezas guardadas antes de este cambio (sin id) reciben uno
    // al vuelo, aquí mismo, para que ↑↓/renombrar/quitar funcionen también
    // en datos ya existentes. No es migración de Firestore, solo backfill
    // en memoria — se guarda con id la próxima vez que se use "Guardar".
    piezas.forEach(p => { if(!p.id) p.id = generarIdInstr('pz'); });
    const abierto = !!instrGruposAbiertos[key];
    const yaAgregadas = piezas.map(p => p.nombre);
    const disponibles = (grupo.piezas || []).filter(p => !yaAgregadas.includes(p));

    // v1.3: fila de pieza con botones ↑↓ además del ✕. Sin cantidad/unidades.
    const filas = piezas.map((p, idx) => `
        <div class="instr-pieza-row">
          <input type="text" value="${escapeHtml(p.nombre)}" onchange="renombrarPiezaInstr('${key}','${p.id}',this.value)">
          <input type="text" class="instr-subgrupo-input" placeholder="Subgrupo (opc.)" value="${escapeHtml(p.subgrupo || '')}" onchange="cambiarSubgrupoPiezaInstr('${key}','${p.id}',this.value)">
          <button onclick="moverPiezaInstr('${key}','${p.id}',-1)" title="Subir" ${idx === 0 ? 'disabled' : ''}>↑</button>
          <button onclick="moverPiezaInstr('${key}','${p.id}',1)" title="Bajar" ${idx === piezas.length - 1 ? 'disabled' : ''}>↓</button>
          <button onclick="quitarPiezaInstr('${key}','${p.id}')" title="Quitar">✕</button>
        </div>`).join('');

    const selectHtml = disponibles.length ? `
      <select id="instrSelect_${key}">
        <option value="">Elegir pieza...</option>
        ${disponibles.map(p => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`).join('')}
      </select>
      <button class="btn btn-ghost" onclick="agregarDesdeSelectInstr('${key}')" style="height:34px;">+ agregar</button>` : '';

    // v1.1: editor de las opciones fijas del <select> (grupo.piezas), separado
    // de las piezas ya agregadas (instrumentacionState). Renombrar/quitar acá
    // no toca piezas ya agregadas — son independientes a propósito.
    const opcionesAbiertas = !!instrOpcionesAbiertas[key];
    const opcionesHtml = opcionesAbiertas ? `
      <div class="instr-opciones-editor" style="margin-top:8px;padding-top:8px;border-top:1px dashed var(--border,#444);">
        <div style="font-size:0.72rem;opacity:0.7;margin-bottom:6px;">Opciones del selector "Elegir pieza..." (no afecta piezas ya agregadas)</div>
        ${(grupo.piezas || []).map((op, opIdx) => `
          <div class="instr-opcion-row">
            <input type="text" value="${escapeHtml(op)}" onchange="renombrarOpcionInstr('${key}',${opIdx},this.value)">
            <button onclick="quitarOpcionInstr('${key}',${opIdx})" title="Quitar opción">✕</button>
          </div>`).join('')}
        <div class="instr-footer-row">
          <span class="link-add" onclick="agregarOpcionInstrPrompt('${key}')">+ agregar opción</span>
        </div>
      </div>` : '';

    return `
      <div class="instr-grupo ${abierto ? 'abierto' : ''}">
        <div class="instr-grupo-header">
          <div class="instr-grupo-titulo">
            <strong class="instr-grupo-label-click" onclick="event.stopPropagation(); renombrarGrupoInstrPrompt('${key}')" title="Clic para renombrar grupo">${escapeHtml(grupo.label)} ✎</strong>
            <span onclick="toggleGrupoInstr('${key}')" style="cursor:pointer;">${piezas.length ? piezas.length + ' pieza(s)' : 'sin piezas'} ▾</span>
          </div>
          <div class="instr-grupo-acciones">
            <button onclick="event.stopPropagation(); moverGrupoInstr('${key}',-1)" title="Subir grupo" ${gIdx === 0 ? 'disabled' : ''}>↑</button>
            <button onclick="event.stopPropagation(); moverGrupoInstr('${key}',1)" title="Bajar grupo" ${gIdx === clavesGrupos.length - 1 ? 'disabled' : ''}>↓</button>
            <button onclick="event.stopPropagation(); toggleOpcionesInstr('${key}')" title="Editar opciones del selector">⚙️</button>
            <button onclick="event.stopPropagation(); eliminarGrupoInstr('${key}')" title="Eliminar grupo">🗑️</button>
          </div>
        </div>
        <div class="instr-grupo-body">
          ${filas}
          <div class="instr-footer-row">
            ${selectHtml}
            <span class="link-add" onclick="agregarPersonalizadaInstr('${key}')">+ agregar personalizada</span>
          </div>
          ${opcionesHtml}
        </div>
      </div>`;
  }).join('') + `
    <div class="instr-footer-row" style="margin-top:10px;">
      <span class="link-add" onclick="agregarGrupoInstrPrompt()">+ agregar grupo</span>
    </div>`;
}

function toggleGrupoInstr(key){
  instrGruposAbiertos[key] = !instrGruposAbiertos[key];
  renderInstrumentacion();
}

function agregarPiezaInstr(key, nombre){
  if(!nombre.trim()) return;
  instrumentacionState[key].push({ id: generarIdInstr('pz'), nombre: nombre.trim() });
  instrGruposAbiertos[key] = true;
  renderInstrumentacion();
}

function agregarDesdeSelectInstr(key){
  const sel = document.getElementById(`instrSelect_${key}`);
  if(sel && sel.value) agregarPiezaInstr(key, sel.value);
}

// v1.2: unifica "agregar personalizada" con el editor de opciones (v1.1) —
// pregunta si también se quiere guardar como opción reutilizable del
// selector, para no tener que repetir el nombre a mano la próxima vez.
function agregarPersonalizadaInstr(key){
  const nombre = prompt('Nombre de la pieza a agregar:');
  if(!nombre || !nombre.trim()) return;
  agregarPiezaInstr(key, nombre);
  const grupo = instrumentacionGruposState[key];
  const yaEsOpcion = grupo && (grupo.piezas || []).includes(nombre.trim());
  if(grupo && !yaEsOpcion && confirm(`¿Guardar "${nombre.trim()}" también como opción reutilizable del selector de este grupo?`)){
    if(!grupo.piezas) grupo.piezas = [];
    grupo.piezas.push(nombre.trim());
    renderInstrumentacion();
  }
}

function quitarPiezaInstr(key, id){
  instrumentacionState[key] = (instrumentacionState[key] || []).filter(p => p.id !== id);
  renderInstrumentacion();
}

function renombrarPiezaInstr(key, id, valor){
  const p = buscarPiezaPorId(key, id);
  if(!p || !valor.trim()) { renderInstrumentacion(); return; }
  p.nombre = valor.trim();
  renderInstrumentacion();
}

// v1.4: subgrupo es texto libre y opcional — puede quedar vacío (se
// guarda como '' para no dejar el campo undefined en Firestore).
function cambiarSubgrupoPiezaInstr(key, id, valor){
  const p = buscarPiezaPorId(key, id);
  if(!p) { renderInstrumentacion(); return; }
  p.subgrupo = valor.trim();
  renderInstrumentacion();
}

// v1.3: reordenar una pieza dentro de su grupo (dir: -1 sube, 1 baja).
function moverPiezaInstr(key, id, dir){
  const arr = instrumentacionState[key];
  if(!arr) return;
  const idx = arr.findIndex(p => p.id === id);
  const nuevoIdx = idx + dir;
  if(idx < 0 || nuevoIdx < 0 || nuevoIdx >= arr.length) return;
  [arr[idx], arr[nuevoIdx]] = [arr[nuevoIdx], arr[idx]];
  renderInstrumentacion();
}

// ---- v1.0: edición de grupos (agregar / renombrar / eliminar) ----

function agregarGrupoInstrPrompt(){
  const nombre = prompt('Nombre del grupo nuevo (ej: Vientos madera):');
  if(!nombre || !nombre.trim()) return;
  const key = generarIdInstr('custom');
  const ordenes = Object.values(instrumentacionGruposState).map(g => g.orden || 0);
  const ordenNuevo = ordenes.length ? Math.max(...ordenes) + 1 : 0;
  instrumentacionGruposState[key] = { label: nombre.trim(), orden: ordenNuevo, piezas: [] };
  instrumentacionState[key] = [];
  instrGruposAbiertos[key] = true;
  renderInstrumentacion();
}

function renombrarGrupoInstrPrompt(key){
  const grupo = instrumentacionGruposState[key];
  if(!grupo) return;
  const nuevo = prompt('Nuevo nombre del grupo:', grupo.label);
  if(!nuevo || !nuevo.trim()) return;
  grupo.label = nuevo.trim();
  renderInstrumentacion();
}

function eliminarGrupoInstr(key){
  const grupo = instrumentacionGruposState[key];
  if(!grupo) return;
  const piezas = (instrumentacionState[key] || []).length;
  const opciones = (grupo.piezas || []).length;
  const partes = [];
  if(piezas) partes.push(`${piezas} pieza(s) cargada(s)`);
  if(opciones) partes.push(`${opciones} opción(es) del selector`);
  const aviso = partes.length
    ? `El grupo "${grupo.label}" tiene ${partes.join(' y ')}. ¿Eliminarlo de todas formas? Se perderá todo eso al guardar.`
    : `¿Eliminar el grupo "${grupo.label}"?`;
  if(!confirm(aviso)) return;
  delete instrumentacionGruposState[key];
  delete instrumentacionState[key];
  delete instrGruposAbiertos[key];
  delete instrOpcionesAbiertas[key];
  renderInstrumentacion();
}

// v1.5: reordenar un grupo completo (dir: -1 sube, 1 baja) intercambiando
// el valor de `orden` con el vecino en la lista ya ordenada — reemplaza
// el enfoque de v1.3 (reconstruir el objeto con las claves reordenadas),
// que no sobrevivía a un guardado/lectura en Firestore porque los mapas
// no garantizan el orden de sus campos.
function moverGrupoInstr(key, dir){
  const claves = Object.keys(instrumentacionGruposState)
    .sort((a, b) => instrumentacionGruposState[a].orden - instrumentacionGruposState[b].orden);
  const idx = claves.indexOf(key);
  const nuevoIdx = idx + dir;
  if(idx < 0 || nuevoIdx < 0 || nuevoIdx >= claves.length) return;
  const vecino = claves[nuevoIdx];
  const ordenTemp = instrumentacionGruposState[key].orden;
  instrumentacionGruposState[key].orden = instrumentacionGruposState[vecino].orden;
  instrumentacionGruposState[vecino].orden = ordenTemp;
  renderInstrumentacion();
}

// ---- v1.1: edición de las opciones fijas del <select> por grupo ----
// (grupo.piezas — el catálogo de sugerencias, independiente de las piezas
// ya agregadas en instrumentacionState. Ver nota en el header del archivo.)

function toggleOpcionesInstr(key){
  instrOpcionesAbiertas[key] = !instrOpcionesAbiertas[key];
  renderInstrumentacion();
}

function renombrarOpcionInstr(key, opIdx, valor){
  const grupo = instrumentacionGruposState[key];
  if(!grupo || !valor.trim()) { renderInstrumentacion(); return; }
  grupo.piezas[opIdx] = valor.trim();
  renderInstrumentacion();
}

function quitarOpcionInstr(key, opIdx){
  const grupo = instrumentacionGruposState[key];
  if(!grupo) return;
  grupo.piezas.splice(opIdx, 1);
  renderInstrumentacion();
}

function agregarOpcionInstrPrompt(key){
  const grupo = instrumentacionGruposState[key];
  if(!grupo) return;
  const nombre = prompt('Nueva opción para el selector "Elegir pieza...":');
  if(!nombre || !nombre.trim()) return;
  if(!grupo.piezas) grupo.piezas = [];
  grupo.piezas.push(nombre.trim());
  renderInstrumentacion();
}
/* ============ FIN INSTRUMENTACIÓN ============ */
