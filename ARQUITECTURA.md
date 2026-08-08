# AUDIOLINK — Notas de arquitectura

Este archivo no es código — es memoria compartida de decisiones de diseño
que no viven naturalmente en el changelog de un solo HTML porque aplican
a todo el ecosistema. Se actualiza cuando se toma una decisión que debería
consultarse antes de repetir un patrón distinto en un archivo nuevo.

---

## 1. Criterio de lectura de Firestore (agosto 2026)

El ecosistema no tiene un único patrón de cuándo leer datos — se fue
decidiendo caso por caso según la necesidad del momento. Esta sección fija
el criterio para que la próxima función nueva no lo reinvente.

### Tiempo real (`onSnapshot`)
Usar cuando el dato se muestra en una pantalla que la persona tiene
abierta activamente y necesita reflejar cambios que pueden venir de otra
sesión/dispositivo casi al instante — ej. lista de sesiones de un
proyecto abierto, historial de pagos/egresos de un modal abierto, "Total
pagado"/"Margen real" de un proyecto que se está revisando para tomar una
decisión.

Siempre desuscribir (`unsubscribe()`) al salir de la vista o cambiar de
proyecto/persona — dejar listeners huérfanos corriendo de fondo es el
error más fácil de cometer con este patrón.

### Carga única (`.get()`)
Usar para catálogos que casi no cambian dentro de una sesión de uso
(estudios, técnicos, músicos al llenar un dropdown) o para datos de
contexto que no son críticos si están un poco desactualizados.

### Caché con expiración + botón manual (localStorage)
Usar cuando el cálculo es agregado y pesado — típicamente
`collectionGroup()` escaneando muchos documentos de golpe (ej. "Registrado"
por músico/técnico, sumando tarifas de TODAS las sesiones de TODOS los
proyectos). No se dispara solo al abrir la página; vive detrás de un botón
explícito ("🔄 Calcular..."), y el resultado se cachea ~15 min en
localStorage para que abrir/cerrar la página varias veces seguidas no
repita el costo.

Patrón de referencia ya implementado: `cargarRegistradosMusicos()` /
`cargarRegistradosTecnicos()` en musicos.html v2.0 / equipo-tecnico.html
v1.6.

### Por qué importa
Firestore cobra por documento leído, no por consulta. Un `collectionGroup`
sin control puede leer cientos de documentos cada vez que alguien
simplemente abre una página para mirar el catálogo, sin que ese costo
tenga relación con lo que la persona realmente necesitaba en ese momento.

---

## 2. Estado de "formulario actual" en catálogos (pendiente de resolver)

Cada catálogo (`musicos.html`, `equipo-tecnico.html`, `egresos.html`)
reinventa su propio patrón para saber si el panel/modal está en modo
"nuevo" o "editando algo existente" — con nombre distinto cada vez
(`musicoEditId`, `tecnicoActualId`, `egresoEditId`). Funciona, pero es
duplicación que podría centralizarse en `utils.js` como un helper
reutilizable para el próximo catálogo que se cree. No se ha hecho
todavía — queda anotado para cuando se decida abordarlo.

---

## 3. Cosas explícitamente descartadas (para no reconsiderarlas sin razón nueva)

- **Campo denormalizado de "registrado" en musicos/equipoTecnico**,
  actualizado desde logistica.html al guardar una sesión (en vez de
  recalcularlo con collectionGroup). Es la solución más eficiente a largo
  plazo, pero implica tocar la lógica de guardado de logistica.html y
  migrar datos históricos. Se descartó por ahora por falta de una señal
  real de que collectionGroup + caché no alcance. Reconsiderar solo si
  aparece evidencia concreta de lentitud o costo, no por anticipación.
- **Margen por proyecto en tiempo real perfecto**: hoy depende de dos
  fuentes (resumenPagos en tiempo real, resumenEgresosProyecto en tiempo
  real desde v5.23) que se recalculan de forma independiente. Funciona
  bien, pero no hay garantía atómica de que ambos números correspondan
  exactamente al mismo instante si hay una escritura simultánea. Riesgo
  aceptado, no se resuelve por ahora.

---

## 4. Patrón: selector de catálogo compartido para portal público (agosto 2026)

Implementado por primera vez para el selector de avatar de participantes
(`vacas.html` v1.43 / `vaca.html` v1.58 / `firestore.rules` v2.24),
reutilizando el catálogo `avataresIconos` (creado para
`avatares-iconos.html`). Queda documentado acá porque es el primer caso
de un catálogo interno (solo staff) al que se le abre una ventana de
lectura pública angosta para que el portal sin login pueda usarlo como
selector visual — el próximo catálogo que necesite lo mismo (íconos,
plantillas, etc.) puede copiar este patrón en vez de reinventarlo.

### Piezas del patrón

**1. Regla de Firestore — lectura pública filtrada por `activo`, sin abrir escritura**
```
match /miCatalogo/{id} {
  allow read, write: if esStaff();
  allow get, list: if resource.data.activo == true;
}
```
Funciona porque Firestore evalúa `list` documento por documento contra
el resultado real de la consulta — el filtro `activo == true` en la
regla solo es efectivo si el cliente YA consulta con
`.where('activo', '==', true)` (si el cliente pidiera todo el catálogo
sin ese `where`, la consulta completa sería rechazada). El catálogo
sigue sin ser editable públicamente.

**2. Consulta en el cliente — carga bajo demanda, no tiempo real**
La cuadrícula del selector se carga con `.get()` (no `onSnapshot`) justo
al abrir el modal/vista donde se necesita, filtrando por el/los campos
que correspondan (ej. `tipo == 'avatar'`) además de `activo == true`.
No hace falta tiempo real porque el catálogo no cambia mientras alguien
está eligiendo — coincide con el criterio de "Carga única" ya fijado en
la sección 1 de este documento.

**3. UI — cuadrícula de miniaturas clickeable**
Cada opción es una miniatura (`<img>` o un ícono "sin selección"), con
`data-url` guardando el identificador real y un `onclick` que marca la
selección visualmente (borde de acento) y guarda el valor en una
variable de módulo simple (ej. `npAvatarSeleccionado`). Se ofrece
siempre una opción explícita de "ninguno" (🚫), no solo dejar sin marcar.

**4. Dónde se guarda el valor elegido — mirror-safe**
Cuando el dato ya tiene un doc espejo público liviano (patrón
`/integrantes` de la sección de Vacas), el campo elegido se escribe en
AMBOS documentos (el real con datos completos, y el espejo público) con
el mismo nombre de campo — nunca solo en uno. Si el espejo público
necesita poder actualizarse después sin login (ej. cambiar el avatar
tras registrarse), se agrega un `allow update` público NUEVO y
ESTRICTAMENTE angosto, restringido con
`diff(resource.data).affectedKeys().hasOnly(['campoUnico'])` — nunca un
update público de campo libre. Mismo criterio de "secreto por link" que
ya usa `/participantes` para contacto/país: no hace falta `request.auth`
porque el ID del documento en la URL ya cumple ese rol.

**5. Nombre de campo — verificar el origen antes de asumir**
Al conectar un catálogo existente, revisar el nombre real del campo en
el archivo que lo creó en vez de asumir uno genérico (`url`, `imagen`,
etc.). En este caso el campo real es `urlCloudinary` (definido en
`avatares-iconos.html`), no `url`.

**Bug ya conocido de este primer caso (corregido)**: la primera versión
del selector de avatar usó `d.url` en vez de `d.urlCloudinary` — las
miniaturas no cargaban. Revisar siempre el campo real del catálogo
fuente antes de copiar este patrón a un catálogo nuevo.

