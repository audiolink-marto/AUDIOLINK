/* AUDIOLINK · checklist-vista.js · v1.3
   v1.3: (a pedido) cada pregunta puede traer una fecha propuesta (p.fecha, formato AAAA-MM-DD) y/o un responsable
   (p.responsable, solo texto), que el equipo marcó como visibles en checklist.html v1.8. Se pintan en una línea
   pequeña bajo el enunciado/nota ("📅 Fecha propuesta: 15 dic 2026 · 👤 Responsable: Pedro", clase .fecha-cli).
   Si hay fecha y la pregunta aún NO tiene respuesta, se agrega una alerta suave (clase .alerta-cli, sin tono de
   reproche): faltan 3 días o menos -> "Se acerca la fecha propuesta"; ya pasó -> "La fecha propuesta ya pasó,
   ¿la ajustamos?". Con respuesta no hay alerta. Los días se calculan con la fecha LOCAL del dispositivo. Sin
   p.fecha ni p.responsable el HTML es idéntico al de v1.2. El CSS lo pone cada página (.fecha-cli, .alerta-cli).
   Ids nuevos (solo cuando hay alerta): {prefijo}a{i}.
   v1.2: cada pregunta puede traer un ejemplo opcional (p.ejemplo) que se usa como placeholder de la caja de
   respuesta; sin él se ve "Tu respuesta..." como antes. Sin p.ejemplo el HTML es idéntico al de v1.1.
   v1.1: cada pregunta puede traer una nota opcional (p.nota, solo texto) que se pinta en un recuadro de solo
   lectura "Nota de Audiolink" entre el enunciado y la caja de respuesta (clase .nota-cli, el CSS lo pone cada
   página). Sin p.nota el HTML es idéntico al de v1.0.
   Módulo compartido del checklist: arma el HTML de la vista del cliente.
   Lo usan checklist-cliente.html (vista pública) y checklist.html (vista previa del editor),
   para que las dos se vean siempre igual.
   SOLO devuelve HTML. No incluye CSS: cada página trae el suyo (clases .cab .marca .intro .campo
   .lbl-nombre .grupo .q .meta .pie-logo .nota-cli .fecha-cli .alerta-cli).
   Uso: clVistaHTML(titulo, preguntas, op)
     preguntas: [{ id, grupo, label, nota?, ejemplo?, fecha?, responsable? }]
     op (todo opcional): { prefijo:'', nombre:'', respuestas:{ id: texto }, maxTexto:480, botonTema:'<button…>' }
   Ids que genera: {prefijo}nombre, {prefijo}t{i} (textarea con data-i y data-id), {prefijo}m{i} (estado),
   {prefijo}pieLogo. Sin prefijo coinciden con los de checklist-cliente.html v1.1.
   Requiere audiolink-logo.js (opcional: sin él se ve el texto AUDIOLINK). */
function cvEsc(s){
  return String(s === null || s === undefined ? '' : s)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#39;');
}
function cvLogo(px, anim){ return window.alLogo ? alLogo('h', px, anim) : 'AUDIOLINK'; }

// ---- Fechas (v1.3): propias del módulo porque checklist-cliente.html no carga utils.js ----
const CV_MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
// Devuelve [año, mes, día] si f es una fecha AAAA-MM-DD válida; si no, null.
function cvFechaOk(f){
  if(typeof f !== 'string') return null;
  const m = f.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if(!m) return null;
  const y = +m[1], mo = +m[2], d = +m[3];
  if(mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  return [y, mo, d];
}
function cvFechaLegible(a){ return a[2] + ' ' + CV_MESES[a[1] - 1] + ' ' + a[0]; }
// Días desde hoy (fecha LOCAL del dispositivo) hasta la fecha: 0 = hoy, negativo = ya pasó.
function cvDiasHasta(a){
  const h = new Date();
  const hoy = new Date(h.getFullYear(), h.getMonth(), h.getDate());
  return Math.round((new Date(a[0], a[1] - 1, a[2]) - hoy) / 86400000);
}
// Línea "Fecha propuesta / Responsable" y alerta suave. Sin fecha ni responsable devuelve '' (HTML idéntico a v1.2).
function cvInfoHTML(p, respondida, pf, i){
  const partes = [];
  const f = cvFechaOk(p.fecha);
  if(f) partes.push('📅 Fecha propuesta: ' + cvEsc(cvFechaLegible(f)));
  const rs = typeof p.responsable === 'string' ? p.responsable.trim() : '';
  if(rs) partes.push('👤 Responsable: ' + cvEsc(rs));
  if(!partes.length) return '';
  let h = `<div class="fecha-cli">${partes.join(' · ')}</div>`;
  if(f && !respondida){
    const dias = cvDiasHasta(f);
    if(dias < 0) h += `<div class="alerta-cli" id="${pf}a${i}">La fecha propuesta ya pasó, ¿la ajustamos?</div>`;
    else if(dias <= 3) h += `<div class="alerta-cli" id="${pf}a${i}">Se acerca la fecha propuesta</div>`;
  }
  return h;
}

function clVistaHTML(titulo, preguntas, op){
  op = op || {};
  const pf = op.prefijo || '';
  const resp = op.respuestas || {};
  const max = op.maxTexto || 480;
  let html = `<div class="cab"><div class="marca">${cvLogo(26, true)}</div>${op.botonTema || ''}</div>
    <h1>${cvEsc(titulo || 'Preguntas del proyecto')}</h1>
    <p class="intro">Responde lo que puedas. Puedes volver a este mismo link y cambiar tus respuestas cuando quieras.</p>
    <label class="lbl-nombre" for="${pf}nombre">Tu nombre</label>
    <input class="campo" type="text" id="${pf}nombre" maxlength="100" autocomplete="name" value="${cvEsc(op.nombre)}" placeholder="Para saber quién responde">`;
  const grupos = [];
  (Array.isArray(preguntas) ? preguntas : []).forEach(p => {
    let g = grupos.find(x => x.nombre === p.grupo);
    if(!g){ g = { nombre: p.grupo, items: [] }; grupos.push(g); }
    g.items.push(p);
  });
  let n = 0;
  grupos.forEach(g => {
    html += `<div class="grupo"><h2>${cvEsc(g.nombre || 'Preguntas')}</h2>`;
    g.items.forEach(p => {
      const i = n++;
      const r = resp[p.id];
      const respondida = r !== undefined && r !== null && String(r).trim() !== '';
      html += `<div class="q"><label for="${pf}t${i}">${cvEsc(p.label)}</label>${typeof p.nota === 'string' && p.nota.trim() ? `<div class="nota-cli"><small>📝 Nota de Audiolink</small>${cvEsc(p.nota)}</div>` : ''}${cvInfoHTML(p, respondida, pf, i)}
        <textarea class="campo" id="${pf}t${i}" maxlength="${max}" data-i="${i}" data-id="${cvEsc(p.id)}" placeholder="${cvEsc(typeof p.ejemplo === 'string' && p.ejemplo.trim() ? p.ejemplo.trim() : 'Tu respuesta...')}"></textarea>
        <div class="meta" id="${pf}m${i}">${r !== undefined && r !== '' ? 'Ya respondida' : ''}</div></div>`;
    });
    html += '</div>';
  });
  html += `<div class="pie-logo" id="${pf}pieLogo">${cvLogo(20, false)}</div>`;
  return html;
}