// test_cocina.js — arnés de pruebas reutilizable para cocina.html
// FIX clave: el bloque <script> real declara variables con `let`/`const`
// (recetasCache, insumosCache, etc). Si esas variables se llenan con datos
// de prueba DESPUÉS de un eval() separado, se crea una variable global
// nueva y distinta (no la del scope del script) => las funciones internas
// nunca la ven. Solución: la inyección de datos de prueba debe ir DENTRO
// del mismo string que se evalúa, no en una sentencia aparte.

global.window = { open: () => ({ document: { open(){}, write(){}, close(){} } }) };
global.alert = (msg) => console.log('ALERT:', msg);
global.firebase = { firestore: { FieldValue: { serverTimestamp: () => 'TS' } } };
global.document = {
  getElementById: () => ({ value:'', innerHTML:'', textContent:'', addEventListener:()=>{} }),
  addEventListener: () => {},
  createElement: () => ({ innerHTML:'' })
};
global.event = null;
global.navigator = { onLine: true };
global.crearDB = function(){
  return { collection: () => ({ onSnapshot: () => {}, doc: () => ({ set: async () => {}, update: async () => {} }) }) };
};

const fs = require('fs');
const html = fs.readFileSync('cocina.html', 'utf8');
const startMarker = 'const db = crearDB();';
const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf('</script>\n</body>');
let code = html.slice(startIdx, endIdx);
code = code.split("document.addEventListener('DOMContentLoaded'")[0];

// --- Zona de datos de prueba: SE EDITA ACÁ, no fuera del eval ---
const inyeccion = `
recetasCache = [{ id:'rec1', nombre:'LASAÑA', costoTotal:45000, unidadesPorLote:10,
  precioVenta:8000, ingresos:80000, ganancia:35000, margenPct:43.75, insumos:[
    { nombre:'Pasta', cantidad:1, unidad:'KG', subtotal:12000 }
  ] }];

window.open = function(){ console.log('✅ window.open fue llamado'); return { document:{open(){},write(){},close(){}} }; };

console.log('--- llamando imprimirRecetaHTML ---');
imprimirRecetaHTML('rec1');
console.log('--- fin ---');
`;

(0, eval)(code + inyeccion);
