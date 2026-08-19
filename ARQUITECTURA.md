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

---

## 5. Patrón: lógica de header de PDF compartida entre páginas (agosto 2026)

Implementado por primera vez al extraer el bloque de configuración del
header de PDF de `logistica.html` (v2.109 → v2.110) a un archivo nuevo,
`header-config.js` v1.0. Queda documentado acá porque es el primer caso
de lógica de UI/config (no solo utilidades puras como `escapeHtml()` en
`utils.js`) que se comparte entre páginas — el próximo archivo que
exporte PDF con un header parecido (`proyecto.html`, `cotizador.html`,
`egresos.html`, etc.) puede copiar este patrón en vez de reinventarlo.

### Qué se centraliza y qué no
`header-config.js` contiene todo lo que es **configuración del
aspecto** del header: constantes por defecto, variables globales
(`LOGO_SIZE`, `HEADER_COLOR_RGB`, etc.), las funciones `actualizar*()`
de cada input, el preview visual en CSS (`actualizarHeaderPreview()` —
no genera PDF), la restauración desde `localStorage`
(`inicializarHeaderConfig()`) y el reset a valores por defecto
(`resetearHeaderDefaults()`).

`pintarHeader()` — la función jsPDF que realmente dibuja el header
dentro del PDF — **no se centraliza**, queda en cada página consumidora.
Razón: cada PDF puede tener detalles propios (tamaño de página, textos,
badges) que no vale la pena forzar a un molde común; `pintarHeader()`
simplemente lee las mismas variables globales que antes, ahora provistas
por el archivo compartido en vez de definidas localmente.

### Cómo conectar una página nueva a este patrón
1. Agregar `<script src="header-config.js"></script>` en el `<head>`,
   junto a `utils.js`/`firebase-config.js`.
2. Reproducir en el HTML los inputs con los IDs que `header-config.js`
   espera (documentados en su propia cabecera): `logoPathInput`,
   `diffuserPathInput`, `headerColorInput`, `headerSinFondoInput`,
   `headerColorOpacityInput`, `headerDiffuserOpacityInput`,
   `logoSizeInput`, `logoOffsetXInput`, `logoOffsetYInput` — solo los
   que apliquen a esa página. El preview (`#headerPreviewBox` y sus
   hijos) es opcional.
3. Llamar `inicializarHeaderConfig()` dentro del propio
   `DOMContentLoaded` de la página consumidora (no antes — los inputs
   deben existir ya en el DOM).
4. Adaptar el `pintarHeader()` propio de esa página para leer las
   variables globales (`LOGO_SIZE`, `HEADER_COLOR_RGB`, etc.) en vez de
   sus propias constantes locales — sin duplicar la lógica de
   configuración.

### Por qué importa
Antes de este patrón, cada página que exportara PDF con header
hubiera reinventado su propio bloque de constantes/inputs/localStorage
(como ya pasaba con `escapeHtml()` antes de migrarse a `utils.js`).
Centralizar solo la parte de configuración —sin forzar a centralizar el
dibujo del PDF, que sí varía por página— evita esa duplicación sin
perder la flexibilidad de cada `pintarHeader()`.

---

## 6. Modo offline (planeado — no implementado aún, agosto 2026)

Necesidad: poder trabajar en entornos remotos sin señal (uso frecuente,
no solo viajes ocasionales). Diseño acordado antes de tocar código, para
que quede documentado el mapa completo aunque se implemente por partes
o en otra instancia.

### Decisión de arquitectura general
Un solo código, no una versión aparte. `firebase-config.js` expone la
variable `db` de siempre; internamente decide si apunta a Firestore real
o a un mock, según un flag. El resto de los archivos (proyecto.html,
logistica.html, etc.) siguen llamando `db.collection(...).doc(...).get()`
exactamente igual — no se toca su lógica interna. Se descartó mantener
dos codebases separadas por el riesgo de desincronización (arreglar un
bug en producción y olvidarlo en la versión offline).

Se descartó Firebase Emulator Suite como base de este modo: mantenerlo
sincronizado con reglas/índices/estructura de colecciones reales
(incluyendo `collectionGroup('actividad')` de Las Vacas) es carga de
mantenimiento constante, no justificada para este caso de uso.

Cloudinary y Auth quedan fuera del alcance offline por ahora: sin subida
ni edición de imágenes offline; sesión de Auth se asume persistida por
el navegador (pendiente de verificar).

### Fase 1 — Solo lectura offline
- Flag `AUDIOLINK_MODO_OFFLINE` en `firebase-config.js` (manual, sin
  detección automática de red — evita falsos positivos con wifi lento).
- Datos guardados como **archivo `.json` real** descargado por el
  usuario (no `localStorage`), para portabilidad entre dispositivo/
  navegador — `localStorage` queda atado a un solo navegador y dominio,
  no sirve si se cambia de equipo para ir a terreno.
- Cada archivo descargado incluye su propia fecha/hora de descarga. Al
  cargar un proyecto junto con un catálogo descargado por separado, si
  las fechas difieren más de un umbral (a definir, ej. 7 días), se
  muestra una alerta no bloqueante ("⚠️ catálogo de hace N días") — el
  usuario puede seguir trabajando; la alerta queda anotada dentro del
  archivo offline para reaparecer en la revisión de sincronización de
  Fase 2, no se pierde solo por cerrarla en el momento.

**Tres botones de descarga, para tres escenarios de uso distintos:**

1. **"📦 Descargar catálogos"** — central (`index.html`). Uso poco
   frecuente (semanal o al agregar gente nueva). Trae músicos/técnicos/
   estudios (cambian poco).
2. **"📥 Descargar proyecto"** — por proyecto, en `proyecto.html`. Uso
   frecuente (cada salida a terreno). Trae el proyecto + sus sesiones
   (cambian seguido). Separado del anterior a propósito, mismo criterio
   de costo de lectura ya fijado en la sección 1 de este documento.
3. **"🌴 Descargar todo para modo extendido"** — central (`index.html`).
   Para viajes largos donde no conviene depender de reconectar seguido.
   Trae catálogos + todos los proyectos con `etapaActual` en
   `preproduccion / grabacion / edicion / mezcla / mastering` (excluye
   `entrega` por defecto), todos con la misma fecha de descarga —
   elimina el problema de desalineación de por sí. Incluye un checkbox
   opcional **"☐ Incluir también proyectos ya entregados (modo fin del
   mundo)"**, desmarcado por defecto — al marcarlo, suma también los
   proyectos en etapa `entrega` para cobertura completa en viajes donde
   de verdad no habrá señal por mucho tiempo.

- Botón "📂 Cargar archivo offline" — en terreno, sin señal, carga el/los
  `.json` descargados previamente (permite cargar catálogos + uno o
  varios proyectos en la misma sesión de trabajo).
- Mock de `db` que imita `.collection().doc().get()/.where()/onSnapshot()`
  leyendo del archivo cargado en memoria. `onSnapshot` dispara el
  callback una sola vez con los datos locales (no hay listener real
  posible sin conexión).
- Sin escritura offline en esta fase.

### Fase 2 — Escritura offline + sincronización con revisión de conflictos
- Requiere campo `updatedAt` estandarizado en todo documento editable
  offline — verificar cobertura real antes de empezar; sin esto no hay
  forma de saber qué versión es más reciente al comparar.
- Documentos nuevos creados offline usan ID con prefijo reconocible
  `offline_{timestamp}_{random}` en vez de dejar que Firestore
  autogenere — evita colisión con IDs reales creados en paralelo por
  otra persona mientras se estaba offline. Si igual aparece un
  duplicado conceptual (dos documentos distintos para "lo mismo"), es
  una decisión de negocio a resolver manualmente, no un error de
  sistema.
- Sincronización siempre manual — botón "🔄 Revisar cambios pendientes",
  nunca automática al detectar señal de nuevo.
- Comparación documento por documento contra el estado real en
  Firestore al momento de sincronizar:
  - Sin cambios del lado de Firestore → sube directo, sin fricción.
  - Cambió Firestore Y hubo edición offline del mismo documento →
    conflicto, pasa a revisión.
  - Documento eliminado en Firestore mientras se estaba offline → no
    se sube encima; se avisa para decidir (recrear o descartar).
- Revisión de conflictos campo por campo (no documento completo, para
  no perder ediciones válidas de ambos lados), con atajo "✅ Usar todas
  las mías" / "✅ Usar todas las de la nube" para conflictos triviales
  sin tener que revisar campo por campo.
- Confirmación final tipo resumen ("vas a actualizar N campos en M
  documentos") antes de escribir a Firestore — última oportunidad de
  cancelar.

