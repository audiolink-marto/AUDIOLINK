/* AUDIOLINK · utils.js · v1.0
   Utilidades compartidas por el ecosistema. Por ahora solo formatCOP()
   (antes vivía solo en cotizador.html; pagos.html tenía su propia versión
   fmt() con el mismo resultado visual pero código distinto). Se deja
   fuera a propósito proyecto.html: ahí el formateo de plata está repartido
   en ~10 sitios sueltos, varios dentro del motor de exportación a PDF
   (jsPDF), y no vale la pena el riesgo de tocarlos solo por consistencia.

   USO: <script src="utils.js"></script> en el <head> o antes de usar
   formatCOP() por primera vez. */

const formatCOP = (val) => new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0
}).format(val);
