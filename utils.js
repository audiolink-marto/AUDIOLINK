/* AUDIOLINK · utils.js · v1.3
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
  return new Date().toISOString().split('T')[0];
}

function esFechaVencida(fecha){
  if(!fecha) return false;
  return fecha < hoyISO();
}
