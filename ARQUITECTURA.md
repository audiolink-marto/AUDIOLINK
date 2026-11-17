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

---

## 7. Estado de lo planeado (nota de actualización, noviembre 2026)

La sección 6 (modo offline) dice "planeado — no implementado aún". Eso
quedó desactualizado: la **Fase 1 ya está en uso** en varias hojas. Los
encabezados de versión de `pagos.html` (v2.4/v2.5), `recordatorios.html`
(v1.9/v1.10) y `logistica.html` (v2.72) describen la migración al patrón:
`<script src="offline-mock.js">` antes de `firebase-config.js`,
`const db = crearDB()` en vez de `firebase.firestore()`, y el guard
`if(estaModoOfflineActivo())` alrededor de `auth.onAuthStateChanged()`.
Con el flag en `false` (default) `crearDB()` devuelve Firestore real.

Se deja el texto de la sección 6 tal cual (es el diseño completo, incluida
la Fase 2 que sí sigue pendiente) y esta nota sola corrige el estado.
Pendiente de confirmar con el dueño del proyecto: qué hojas faltan por
migrar y si la Fase 2 sigue en el plan.

---

## 8. Patrón: hoja de ecosistema "por proyecto" con un solo documento (noviembre 2026)

Implementado por primera vez con `checklist.html` (v1.0 → v1.4). Es una
hoja que sirve para **todos** los proyectos, no solo uno, y vive a nivel
de proyecto (como `produccion.html`). Queda documentado para que la
próxima hoja del mismo tipo (por proyecto, con datos editables y poco
volumen) copie el patrón.

### Piezas
- **Entrada:** `hoja.html?id={proyectoId}`. Si falta el `?id=`, la hoja
  se detiene con un mensaje (no intenta adivinar). Botón de acceso en
  `proyecto.html` junto a Producción (`window.open(... + proyectoActualId)`,
  v5.45). No va en el menú lateral de `nav.js`: es global y no sabe qué
  proyecto se está viendo.
- **Cabecera estándar:** `nav.js`/`nav.css`, `offline-mock.js`,
  `firebase-config.js`, `utils.js`, guard de sesión contra
  `equipoInterno/{email}.activo`, `crearDB()` (ver sección 7).
- **Un solo documento:** `proyectos/{id}/checklist/plan` con `items`,
  `custom`, `bloques` y `compartir`. Se escribe completo con `set()`
  (un único editor a la vez en la práctica). Guardado automático con
  espera de 0,7 s tras el último cambio; también se guarda al ocultar la
  pestaña (`visibilitychange`). `JSON.parse(JSON.stringify(...))` antes
  de escribir para que nunca viaje un `undefined` (Firestore rechaza el
  documento entero).
- **Solo se guarda lo que tiene contenido:** si una casilla queda sin
  marca, nota, responsable ni fecha, su clave se borra de `items`.
- **Regla de Firestore:** subcolección dentro de `proyectos/{proyectoId}`
  con el mismo patrón que `/produccion`: `allow read, write: if esStaff();`
  (v2.47).

### La plantilla vive en el código, con ids estables
Las casillas base están definidas en el JS de la hoja, cada una con un
**id explícito** (`A1`, `B3`, y por bloque `{idBloque}.pre.2`...). Lo que
el usuario anota se guarda por id, no por posición. Consecuencias:
- Agregar casillas nuevas a la plantilla es seguro si llevan un id nuevo
  (se agregan al final del grupo): todos los proyectos y bloques ya
  existentes las muestran vacías y conservan lo anotado.
- **Nunca reutilizar ni renombrar un id existente** con otro significado.
  Cambiar solo el texto visible de una casilla es seguro (pasó con
  Preproducción 5 en v1.2).
- Cada casilla puede llevar una **"pista" de dónde se llena el dato**
  (hoja y campo del ecosistema). Es solo para el equipo y no viaja al
  cliente.
- El usuario puede agregar ítems propios por grupo (se guardan en
  `custom`, con id `c{...}` generado) y bloques propios (`bloques`).

### Qué NO se hace
- No se escribe nada fuera del documento `plan` salvo lo que
  explícitamente documentan las secciones 9 y 10.
- Esta hoja no reemplaza a `recordatorios.html` (que ya tiene su propio
  checklist con subítems y visibilidad): son cosas distintas y conectarlas
  sin cuidado terminaría duplicando listas. Ver sección 11.

---

## 9. Patrón: compartir con el cliente por link con token + respuesta por pregunta (noviembre 2026)

Hermano de `compartirinfo.html` (que comparte reportes del contador con
un único bloque "respuesta del cliente"). Se creó aparte porque
`compartirinfo.html` está atado al modelo del contador; aquí el cliente
responde **cada pregunta por separado**. Archivos: `checklist.html`
(lado equipo, desde v1.1), `checklist-cliente.html` (vista pública) y
`firestore.rules` v2.48.

### Piezas
**1. Documento público: `checklistCompartidos/{token}`**
El id es el token: 32 caracteres aleatorios a–z, A–Z, 0–9 generados con
`crypto.getRandomValues()` (mismo esquema que `compartirinfo.html`). Campos:
`proyectoId`, `titulo`, `visibleCliente`, `preguntas[{id, grupo, label}]`,
`ids[]` (los mismos ids, solo para que las reglas puedan validar
pertenencia) y `actualizadoEn`. **Es una copia (snapshot)**: solo viaja
el texto de cada pregunta y su bloque/etapa. Nunca notas, responsables,
fechas ni pistas internas. Actualizar = volver a publicar; el token no
cambia, así el link ya enviado sigue valiendo.

**2. Respuestas: `checklistCompartidos/{token}/respuestas/{preguntaId}`**
Un documento por pregunta, con el id de la pregunta como id del
documento y campos exactos `texto`, `nombre`, `fecha`.

**3. Reglas (v2.48)**
```
match /checklistCompartidos/{token} {
  allow read, write: if esStaff();
  allow get: if resource.data.visibleCliente == true;   // nunca list
  match /respuestas/{preguntaId} {
    allow read, write: if esStaff();
    allow get: if <padre>.visibleCliente == true;
    allow create, update: if <padre>.visibleCliente == true
      && preguntaId in <padre>.ids
      && keys exactas ['texto','nombre','fecha']
      && texto string <= 500 && nombre string <= 100
      && fecha == request.time;
  }
}
```
(`<padre>` = `get(/databases/$(database)/documents/checklistCompartidos/$(token)).data`.)
Puntos clave: el cliente **no puede listar ni borrar**; solo puede
escribir respuestas a preguntas que figuran en `ids` (evita que alguien
con el token llene la subcolección con documentos arbitrarios); pausar
el link = `visibleCliente: false` (no se borra nada).

**4. Vista del cliente: `checklist-cliente.html?r=TOKEN`**
Página standalone, sin login ni `nav.js` ni `offline-mock.js`. Lee el
documento con un `get()` puntual y cada respuesta previa también con
`get()` por pregunta (no puede listar). Escribe con `serverTimestamp()`
en `fecha`. El cliente puede volver al mismo link y editar. Primero móvil
(táctil 48 px, campos a 16 px, barra de envío fija), tema claro/oscuro por
`prefers-color-scheme`. Un token con formato inválido, un documento
inexistente o un link en pausa muestran el mismo mensaje ("no está
disponible"), sin distinguir los casos.

**5. Lado equipo**
Panel "Compartir con el cliente" en `checklist.html`: Publicar/Actualizar,
Copiar link, Dejar de compartir, ↻ Respuestas. El token se guarda en el
plan (`compartir.token`) **antes** de crear el documento público, para no
dejar un link huérfano si falla el guardado. Las respuestas se leen con
un `get()` por pregunta marcada y se muestran bajo cada casilla.

### Costo de lectura conocido (decidir si crece)
`checklist.html` carga las respuestas del cliente **al abrir la hoja**
cuando ya existe un token (1 lectura por pregunta marcada). Con ~10–40
preguntas es aceptable y coincide con el criterio "carga única" de la
sección 1, pero si un proyecto llega a cientos de preguntas conviene
moverlo detrás del botón "↻ Respuestas" con caché, como ya se hizo en
la sección 10.

### Verificación
Las reglas v2.48 **no se probaron en el emulador de Firebase** (no estaba
disponible en el entorno de desarrollo); se verificaron con una simulación
propia y el usuario confirmó el flujo funcionando en uso real (v1.1). Si
se cambian estas reglas, probarlas en el simulador de la consola de
Firebase antes de publicar.

---

## 10. Mapa de datos: sesiones, asistencia y consentimientos + lista interna (noviembre 2026)

Documentación de lo que **ya existe** en el ecosistema y de la primera
hoja que lo junta. Verificado leyendo `logistica.html` (v2.131),
`musico.html` (v3.234), `consentimiento.html` (v1.1) y `firestore.rules`.

### Dónde vive cada dato
- **Sesión:** `proyectos/{id}/sesiones/{sid}` — `fecha`, `horaInicio`,
  `horaFin`, `estudioId`/`estudioNombre`, `sala`, `temaId`/`temaNombre`,
  `actividad`, `tiempoSetupMin`, `musicosAsignados[]`,
  `tecnicosAsignados[]`, instrumentación, `inputList`, etc.
- **Músico asignado** (dentro de la sesión): `nombre`, `correo`,
  `telefono`, `instrumento`, `tarifa`.
- **Asistencia (RSVP):** mapa `rsvp` en el propio documento de la sesión,
  `{ "correo@dominio": "confirmado" | "rechazado" }`. Lo escribe el músico
  desde `musico.html` con `set({rsvp:{[correo]: valor}}, {merge:true})`.
  **No usar `update()` con una ruta tipo `'rsvp.correo@x.com'`**: los
  puntos del correo se interpretan como separadores de campo (ya está
  comentado en `musico.html`).
- **Consentimiento firmado:** `sesiones/{sid}/consentimientos/{cid}` con
  `nombre`, `correo`, `tarifa`, `aceptado`, `creadoEn`. Lo crea la
  persona sin login desde `consentimiento.html?p=&s=&nombre=&correo=&tarifa=`
  (el link lo arma `logistica.html` → "📝 Generar link de consentimiento", o
  lo abre el propio músico desde su panel). Reglas: crear sin login con
  esquema exacto; leer/editar/borrar solo `esStaff()`.

### Lista interna de consentimientos (`checklist.html` v1.3, pestaña "✍️ Consentimientos")
- Solo **lee**; no escribe nada en sesiones ni consentimientos. No
  requiere reglas nuevas (el equipo ya lee ambas con `esStaff()`).
- **Bajo demanda:** no lee al abrir la hoja ni la pestaña. El botón
  "🔄 Calcular" hace 1 lectura de las sesiones + 1 por sesión (firmas) y
  guarda el resultado ~15 min en `localStorage` por proyecto
  (`al_checklist_consent_{proyectoId}`). Mismo criterio que
  `cargarRegistradosMusicos()` (sección 1).
- **Cruce:** músico ↔ firma por `correo` (sin importar mayúsculas) o, si
  el músico no tiene correo o no coincide, por nombre normalizado (sin
  tildes ni mayúsculas, espacios colapsados). Músico ↔ asistencia solo
  por correo; sin correo se avisa que no se puede saber su asistencia.
- Marca con ⚠ cuando la tarifa firmada difiere de la asignada, y lista
  aparte las firmas de personas no asignadas a esa sesión.

### Pendientes conocidos
- `consentimiento.html` v1.1 tiene el texto legal como **PLACEHOLDER**
  ("pendiente redactar el texto legal"). Mientras siga así, lo que firma
  el músico es un texto vacío. `checklist.html` lo recuerda en la casilla
  A8, pero no lo resuelve.
- `logistica.html` solo **genera y envía** el link; no tiene una vista de
  quién firmó (esa vista hoy es la pestaña de `checklist.html`).
- No existe un campo de **rider técnico** del músico en ninguna hoja
  (`estudios.html` guarda backline y preamps por sala, no el rider de
  cada artista). Hoy se anota en una casilla del checklist.

---

## 11. Cosas explícitamente descartadas o diferidas (noviembre 2026)

- **Coordinar con el cliente desde `portal.html`.** Hoy el portal es casi
  solo de lectura: muestra proyectos visibles, etapas, sesiones visibles
  con sus tomas, cotización y pagos; **su única escritura es aceptar una
  cotización**. Agregarle un bloque "Pendientes contigo" implicaría que el
  portal escriba en una colección nueva y reglas nuevas con más
  superficie. Se eligió el link con token (sección 9). Reconsiderar solo
  si el flujo del link se queda corto con clientes reales.
- **Reusar `compartirinfo.html` para el checklist.** Está atado al modelo
  de reportes del contador (horas/días), no a preguntas con respuesta
  individual. Se copió el *patrón*, no el archivo.
- **Conectar las fechas límite del checklist con `recordatorios.html`.**
  Esa hoja ya tiene su propio checklist con subítems y visibilidad
  (fecha, hora, texto): conectarlas sin diseño previo duplicaría listas.
  Diferido; si se retoma, diseñarlo aparte.
- **Una lista de consentimientos *manual* dentro del checklist** (casillas
  por músico): se descartó a favor de la lista automática, porque una
  lista manual se desactualiza.
- **Vista de "quién firmó" dentro de `logistica.html`.** Se resolvió en
  `checklist.html` para no tocar la lógica de guardado de esa hoja (ver
  también la nota sobre `logistica.html` en la sección 3).

### Archivos nuevos o cambiados en este bloque de trabajo
`checklist.html` v1.4 · `checklist-cliente.html` v1.0 · `proyecto.html`
v5.45 (solo el botón "✅ Checklist") · `firestore.rules` v2.47
(`/checklist/`) y v2.48 (`/checklistCompartidos/` + `/respuestas/`).
