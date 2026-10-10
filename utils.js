/* AUDIOLINK · utils.js · v1.6
   v1.6: (a pedido) hoyISO() ahora devuelve la fecha LOCAL (AAAA-MM-DD
   según el reloj del dispositivo) en vez de la fecha UTC. Antes usaba
   toISOString(), que en Colombia (UTC-5) ya marca el día siguiente
   desde las 7 p. m.: esFechaVencida() y estadoRecordatorio() mostraban
   "Vencido" un recordatorio de hoy pasadas las 7 p. m. (contador.html
   ya lo evitaba con su propia fechaLocal()). Mismo nombre, misma forma
   de retorno, ninguna otra función cambia; index.html y
   recordatorios.html no necesitan tocarse. También se corrige el
   comentario de tiempoRelativo(), que decía que el ecosistema no tiene
   Service Worker (ya existe sw.js).

   v1.5: se centraliza mostrarToast() — vivía copiada igual (mismo
   patrón visual) en cocina.html y RECETARIO.html. Recibe el id del
   contenedor como 4to parámetro (default 'toast-cocina', el nombre
   que ya usaba cocina.html) porque cada página sigue declarando su
   propio <div id="toast-..."> y su propio bloque CSS de .toast-item
   (NO se centraliza CSS/contenedor en esta pasada — decisión explícita
   para no tocar nav.css/nav.js, que corren en todo el ecosistema; ver
   ARQUITECTURA.md si se decide dar ese paso más adelante). Se retiró
   la copia local solo de cocina.html por ahora.

   v1.4: se centralizan tiempoRelativo() y estadoRecordatorio() — vivían
   solo en recordatorios.html (v1.3) y el widget del Dashboard
   (index.html) necesitaba el mismo cálculo para mostrar el mismo badge/
   texto relativo que la lista completa. Se retira la copia local de
   recordatorios.html; index.html las usa ahora también en
   renderRecordatoriosDash(). Mismo comportamiento, mismo resultado.

   v1.3: se agregan hoyISO() y esFechaVencida() — antes varios archivos
   (index.html, recordatorios.html) repetían `new Date().toISOString()
   .split('T')[0]` sueltos para comparar fechas de recordatorios. Se
   centraliza acá mismo patrón que las demás utilidades: un solo lugar
   para "qué es hoy" y "qué cuenta como vencido", así si el criterio
   cambia (ej. usar zona horaria distinta) se ajusta en un solo sitio.
   Se retiró la comparación inline solo en index.html y recordatorios.html
   (las únicas que la usaban hasta ahora).

   v1.2: se agregan horaAMinutos() y minutosATexto() — vivían copiadas
   en bitacora.html (bloque de hora + set-up). Se centralizan acá para
   que ingeniero.html y logistica.html las usen también sin duplicar
   código (mismo comportamiento, mismo resultado). Se retiró la copia
   local solo en bitacora.html.

   v1.1: se agrega escapeHtml() — estaba copiada igual, carácter por
   carácter, en proyecto.html, logistica.html, clientes.html, portal.html,
   ingeniero.html y bitacora.html. Se centraliza acá mismo patrón que
   formatCOP(). Por ahora se retiró la copia local solo de ingeniero.html,
   bitacora.html y proyecto.html (los 3 que se tocaron en esta sesión);
   los demás archivos siguen con su copia local hasta que se migren
   aparte, sin romper nada mientras tanto (misma función, mismo
   resultado).

   v1.0: Utilidades compartidas por el ecosistema. Por ahora solo formatCOP()
   (antes vivía solo en cotizador.html; pagos.html tenía su propia versión
   fmt() con el mismo resultado visual pero código distinto). Se deja
   fuera a propósito proyecto.html: ahí el formateo de plata está repartido
   en ~10 sitios sueltos, varios dentro del motor de exportación a PDF
   (jsPDF), y no vale la pena el riesgo de tocarlos solo por consistencia.

   USO: <script src="utils.js"></script> en el <head> o antes de usar
   formatCOP()/escapeHtml() por primera vez. */

const formatCOP = (val) => new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0
}).format(val);

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str == null ? '' : String(str);
  return d.innerHTML;
}

function horaAMinutos(hora){
  if(!hora || !hora.includes(':')) return null;
  const [h, m] = hora.split(':').map(Number);
  if(isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}
function minutosATexto(mins){
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if(h && m) return `${h}h ${m}min`;
  if(h) return `${h}h`;
  return `${m}min`;
}

function hoyISO(){
  const d = new Date();   // fecha LOCAL, no UTC (toISOString() cambia de día a las 7 p. m. en Colombia)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function esFechaVencida(fecha){
  if(!fecha) return false;
  return fecha < hoyISO();
}

// Se recalcula cada vez que se renderiza (no es un timer corriendo en
// segundo plano — JS no sigue corriendo sin la pestaña abierta; el
// Service Worker del ecosistema (sw.js) no interviene en este cálculo).
// Si hay hora, compara con
// precisión de minutos; si no, solo con precisión de día.
function tiempoRelativo(fecha, hora){
  if(!fecha) return null;
  const ahora = new Date();
  const objetivo = new Date(fecha + 'T' + (hora || '00:00'));
  const diffMs = objetivo - ahora;
  const diffMin = Math.round(diffMs / 60000);
  const diffHoras = Math.round(diffMin / 60);
  const diffDias = Math.round(diffHoras / 24);

  if(!hora){
    if(diffDias === 0) return 'hoy';
    if(diffDias === 1) return 'mañana';
    if(diffDias === -1) return 'ayer';
    return diffDias > 0 ? `en ${diffDias} días` : `hace ${Math.abs(diffDias)} días`;
  }
  if(Math.abs(diffMin) < 60) return diffMin >= 0 ? `en ${diffMin} min` : `hace ${Math.abs(diffMin)} min`;
  if(Math.abs(diffHoras) < 24) return diffHoras >= 0 ? `en ${diffHoras} h` : `hace ${Math.abs(diffHoras)} h`;
  return diffDias >= 0 ? `en ${diffDias} días` : `hace ${Math.abs(diffDias)} días`;
}

function estadoRecordatorio(fecha){
  if(!fecha) return null;
  if(esFechaVencida(fecha)) return { texto: 'Vencido', clase: 'err' };
  if(fecha === hoyISO()) return { texto: 'Hoy', clase: 'warn' };
  return { texto: 'Próximo', clase: 'ok' };
}

// v1.5: toast de confirmación — mismo patrón visual que ya usaban
// cocina.html/RECETARIO.html por separado. Requiere que la página
// consumidora tenga su propio <div id="{contenedorId}"></div> y su
// propio CSS .toast-item/.t-ok/.t-warn/.t-error/.t-info (no se
// centraliza CSS/contenedor acá, ver comentario de cabecera v1.5).
function mostrarToast(msg, tipo = 'info', dur = 3500, contenedorId = 'toast-cocina'){
  const cont = document.getElementById(contenedorId);
  if(!cont) return;
  const el = document.createElement('div');
  el.className = `toast-item t-${tipo}`;
  el.textContent = msg;
  cont.appendChild(el);
  setTimeout(() => { el.classList.add('saliendo'); setTimeout(() => el.remove(), 400); }, dur);
}
