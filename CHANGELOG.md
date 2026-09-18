# AUDIOLINK — Changelog

Historial de versiones del ecosistema. Antes vivía repartido en el comentario de cabecera de cada archivo HTML (cada vez más largo y pesado de leer); desde julio 2026 se centraliza acá. Cada archivo HTML conserva en su cabecera solo la versión vigente + un resumen corto, con nota de que el historial completo está acá.

---

## pdf-armonias.js / pdf-percusion.js

### v1.0 (ambos) — split de pdf-estructura.js
pdf-estructura.js (llegó a v1.92, compartido por guia-practica.html y
musico.html) se separó en 2 archivos independientes, sin tercero
compartido: pdf-armonias.js (generarEstructuraPDF, PDF de
acordes/armonías) y pdf-percusion.js (generarEstructuraPDFPercusion,
PDF de guía de percusión). Las 2 funciones ya eran 100% autocontenidas
(sin helpers compartidos ni referencias cruzadas), así que el corte es
limpio: cada archivo pesa la mitad y cada página carga solo el que
necesita. El historial completo de cada función hasta v1.92 queda en
el comentario de cabecera de pdf-estructura.js (conservar ese archivo
como referencia histórica); de acá en adelante cada archivo nuevo
lleva su propio changelog independiente, empezando en v1.0.
Pendiente: actualizar el/los `<script src="pdf-estructura.js">` en
guia-practica.html (y musico.html si aplica) por los 2 nuevos.

---

## firestore.rules

### v2.27
defensa extra a nivel de Rules cuando una vaca está cerrada
(estado=='cerrada'). Antes el cierre era SOLO un candado de UI
(vacas.html ocultaba botones, vaca.html bloqueaba el registro de gente
nueva en el HTML) — a nivel de Rules cualquiera con el link general
podía seguir creando un doc en /participantes o /integrantes
directamente. Se agrega la función vacaAbierta(vacaId) (usa != 'cerrada',
no == 'activa', para no romper vacas viejas sin el campo `estado`
todavía) y se exige en el `allow create` público de ambas subcolecciones.
No se tocó ningún `update` (edición de datos propios, avatar) ni ninguna
otra regla — la edición de datos ya registrados sigue funcionando igual,
solo se bloquea CREAR nuevos.

### v2.26
FIX — confirmarPrimerAvatar() en vaca.html v1.69 hace
batch.update(partRef, { avatarUrl, avatarElegido:true }) para que el
paso "elige tu avatar" no se repita en cada carga. La regla de update
en /participantes no incluía avatarElegido como affectedKey permitida,
así que ese update SIEMPRE era rechazado (el batch entero fallaba en
silencio, sin toast visible) — el participante quedaba pidiendo avatar
de nuevo en cada recarga aunque ya hubiera elegido uno. Se agrega
avatarElegido como campo opcional adicional (validado como boolean) en
AMBAS variantes del `allow update` de /participantes. No se tocó
ninguna otra regla.

### v2.24
se agrega lectura pública (get+list, filtrada a activo == true) a
/avataresIconos — para que vaca.html (portal, sin login) pueda leer el
catálogo del selector de avatar. En /vacas/{id}/integrantes: el esquema
de create público ahora acepta avatarUrl opcional (antes solo aceptaba
[nombre, tipo, aporto] exactos, así que el registro habría fallado con
el campo nuevo); se agrega también un allow update público NUEVO,
restringido a SOLO el campo avatarUrl (mismo criterio de "secreto por
link" que ya usa /participantes para contacto/paisCodigo) — antes
/integrantes no tenía ningún update público. No se tocó ninguna otra
regla, función, condición, match ni colección existente.

### v2.23
se agrega el match /avataresIconos/{id} — sin esta regla, el panel
avatares-iconos.html fallaba con "Missing or insufficient permissions"
tanto al leer (onSnapshot) como al guardar. Mismo patrón exacto que
estudios/musicos/clientes/equipoTecnico/backlineCatalogo/egresos/
catalogoIconos: solo equipo interno lee y escribe. No confundir con
/catalogoIconos (v2.16), colección distinta ya existente (tipos de
ícono del Stageplot de eventos.html). No se tocó ninguna otra regla,
función, condición, match ni colección existente.

## avatares-iconos.html

### v1.1
se agrega "Subir en lote" — botón nuevo junto a "+ Nuevo", vista propia
(no el modal individual). Tipo y Categoría se definen una vez para
todo el lote; se eligen varios archivos, cada uno se lista con
miniatura local + nombre editable (precargado con el nombre del
archivo, sin extensión). Sube uno por uno a Cloudinary (mismo folder/
preset ICONOS) y crea su documento en avataresIconos, con progreso y
estado por archivo (pendiente/subiendo/listo/error). No se tocó el
modal individual ni ninguna otra función existente.

### v1.0
modo quirófano — archivo nuevo. Panel CRUD de catálogo de avatars/
iconos del ecosistema, entrada propia en el menú ("Avatar / Icono").
Imágenes en Cloudinary (cloud_name dv7lelmoy, folder ICONOS, upload
preset unsigned "ICONOS"), metadata en Firestore (colección
avataresIconos), escuchado en tiempo real (onSnapshot) para que el
resto del ecosistema pueda leer el catálogo actualizado. Genera
miniatura vía transformación de URL de Cloudinary (no sube archivo
duplicado). Usa firebase-config.js, utils.js (escapeHtml), nav.js/
nav.css igual que el resto de páginas.

## nav.js

### v1.7
sidebar de escritorio agrupado por categoría (Gestión/Catálogos/
Operación/Finanzas), separado por encabezados de sección
(.sb-grupo-label, ver nav.css v1.2). Cada ítem de ITEMS ahora tiene un
campo `grupo` (o null para los que van sueltos: Dashboard arriba,
Avatar/Icono abajo). Nueva función sbNavGroupedHtml() reemplaza el
antiguo ITEMS.map(sbItemHtml) SOLO en el sidebar desktop — el orden
real del array ITEMS no cambió, así que el mobile-bottomnav y el
panel "···" (que siguen usando ITEMS.filter/.map directo) quedan
exactamente igual que antes, sin reordenarse.

### v1.6
se agrega el ítem "Avatar / Icono" (avatares-iconos.html) a ITEMS,
después de "Vacas". Se suma también a idsFueraBottomnav para no
saturar la barra inferior móvil (queda accesible por sidebar desktop
y panel "···" móvil). No se tocó ninguna otra función, ítem existente
ni la lógica de inyección/colapsar/tema.

## nav.css

### v1.2
se agrega .sb-grupo-label — encabezado de sección para el sidebar de
escritorio agrupado (ver nav.js v1.7). Solo aplica al sidebar;
mobile-bottomnav y panel "···" no se tocaron.

## header-config.js

### v1.0
archivo nuevo — extraído de logistica.html v2.109. Centraliza la lógica
compartida de configuración del header de PDF (logo, diffuser, color,
opacidades, tamaño/posición del logo) para reutilizar en todo el
ecosistema (proyecto.html, cotizador.html, egresos.html, etc.) cuando
exporten PDF con el mismo tipo de header. Expone las constantes/
variables globales (LOGO_SIZE, HEADER_COLOR_RGB, etc.), las funciones
actualizar*() de cada input, actualizarHeaderPreview() (preview visual
en CSS, no genera PDF), inicializarHeaderConfig() (restaura todo desde
localStorage — cada página consumidora la llama en su propio
DOMContentLoaded) y resetearHeaderDefaults() (nueva, restablece color/
opacidades/tamaño/posición a sus valores por defecto y limpia esas
claves de localStorage; no toca las rutas de logo/diffuser). No incluye
pintarHeader() en sí (la función jsPDF que dibuja el PDF) — esa se
queda en cada página consumidora, leyendo estas variables globales
igual que antes, porque cada PDF puede tener detalles propios (tamaños
de página, textos, badges). Requiere en el HTML consumidor los inputs
con los IDs documentados en la cabecera del archivo, y opcionalmente el
preview (#headerPreviewBox y sus hijos).

## musico.html

### v3.199
(a pedido, "qué optimizarías" sobre el visor paginado de v3.198 — se
pidieron todas) 5 mejoras sobre el mismo visor de Score, sin tocar
Cloudinary/BPM/waveform/metrónomo: (1) mobile first —
.practica-score-nav ahora hace flex-wrap; bajo 400px el indicador
"Página X de N" pasa a fila propia arriba y los 2 botones quedan 50/50
debajo, con el texto oculto (solo ⬅/➡) para que no se corten en
pantallas angostas. (2) precarga silenciosa (new Image()) de la página
siguiente apenas se pinta la actual, para que "Siguiente" no tenga que
esperar la respuesta de Cloudinary. (3) la imagen visible ahora es
loading="eager" (antes heredaba "lazy" del código viejo, que no tiene
sentido siendo la única imagen pintada). (4) swipe táctil (izq/der)
sobre la imagen, además de los botones — pensado para practicar con el
instrumento en la mano. (5) flechas ←/→ del teclado (la imagen es
focuseable) + mensaje "No se pudo cargar esta página" si Cloudinary
devuelve error en vez de dejar el ícono de imagen rota.

### v3.198
(a pedido, "dejar los scores de a 1 pág, con sig. y atrás") el visor de
Score PDF (ver v3.197) ahora muestra las páginas de a una, con
navegación Atrás/Siguiente e indicador "Página X de N", en vez de
listar todas las miniaturas seguidas. Cambios acotados a
onToggleScorePractica + nuevas funciones cambiarPaginaScore/
renderPaginaScore + estilos .practica-score-nav en el CSS. Cero
cambios en Cloudinary (sigue usando pg_N vía transformación, nada se
sube ni se recorta acá), en obtenerScoreParaSesion, en
scoreBloqueHtml, ni en el resto del motor de BPM/waveform/metrónomo.

### v3.206
(a pedido) 2 ajustes: 1) "que la respiración sea más rapidita, como
un palpito, y probemos blanca, como luz" — período del pulso bajado
de 500ms a 180ms y color cambiado de lila a blanco puro; el loop de
respiración en pausa también baja su intervalo de 100ms a 40ms para
que no se vea entrecortado. 2) "no me gusta que las líneas de sección
pisan los números de la regla" — el número+caja de cada tick de
compás (antes dibujado ANTES que las líneas de sección/offset/CUE) se
difiere a un array y se redibuja al final de la función, después de
esas líneas — así el número siempre queda arriba, sin excepción.

### v3.205
(a pedido) "que respire más intensamente y también cuando está
detenido". Amplitud del pulso subida de ±0.1 a ±0.35 (rango
0.15-0.85, antes 0.35-0.55). Se agrega iniciarRespiroWaveform/
detenerRespiroWaveform: un loop liviano (setTimeout cada 100ms, no
rAF) que redibuja el playhead SOLO mientras está en pausa (antes solo
se veía animar mientras sonaba). Se apaga solo apenas detecta que
volvió a sonar, y explícitamente al tocar play, al terminar el audio,
y al destruir el estado. Arranca ya desde que se prepara el waveform
(antes de tocar play por primera vez).

### v3.204
(a pedido) revierte la bandera de v3.203 — "no me gusta, dejalo como
estaba [línea completa v3.202] pero más opaca [tenue, para que no
compita], más delgada, y que respire". El playhead vuelve a cruzar
todo el alto, pero sin sombra/glow, 1px en vez de 2px, y alpha
pulsando suave entre 0.35 y 0.55 (antes sólido) — se nota que respira
sin competir con el flash de las líneas de sección.

### v3.203
(a pedido, "que la línea de posición no compita con las de sección")
el playhead pasa de línea completa (mismo lenguaje visual que las
líneas de sección, que sí cruzan todo el alto) a una bandera/
triángulo SOLO arriba (14px) + un pulso sutil de opacidad (0.8-1.0,
seno sobre performance.now()) — como es el único elemento que
"respira", se encuentra solo sin competir en contraste con las
líneas de sección (sin tocar). El pulso se nota mientras suena; en
pausa queda fijo en la fase del instante en que se pausó, sin rAF
propio agregado a propósito. Cero cambios en el resto de
dibujarWaveform.

### v3.202
(a pedido, revisión de UI del waveform, mobile first) 4 ajustes en
dibujarWaveform/seekWaveformClick, sin tocar precisión de offset/
secciones/clave/click: 1) trazo vertical lila (con leve resplandor)
en la posición de reproducción, dibujado al final (encima de todo)
para más contraste que solo el cambio de color de barras — mismo
lila de siempre (colorProgreso), no se cambió el color. 2) a zoom
bajo (1x-2x, la vista por defecto en celular) las etiquetas de
sección muestran solo la letra de ensayo (A/B/C…) en vez del nombre
completo; el nombre completo vuelve al acercar (zoom 3x+) — mismo
mecanismo de carriles/ancho de siempre, sin tocarlo. 3) flash breve
(círculo que se desvanece en ~300ms) en el punto exacto donde se
hizo click para saltar, además del salto del playhead — programado
con un redibujado a los 320ms para que se apague solo incluso en
pausa. 4) el alto fijo de 90px de la zona de onda pasa a escalar con
el ancho real disponible (wrapWidth, no el zoom), acotado
64px-130px — en un celular típico (~370-400px) da prácticamente el
mismo ~90px de siempre; en tablet/desktop aprovecha más espacio. Cero
cambios en WAVEFORM_LANE_H/MAX_CARRILES, en el cálculo de ticks/
compás, ni en ninguna otra parte del motor de BPM/metrónomo/clave.

### v3.201
(a pedido, más optimizaciones sobre v3.200 — sin tocar el hint de
swipe, a pedido explícito) 1) recuerda la última página vista por
score (localStorage, por uid) y abre ahí en vez de volver siempre a
la página 1. 2) evita re-precargar una página ya precargada en la
misma apertura del panel (Set de páginas precargadas). 3) zoom por
doble-tap/doble-clic sobre la imagen (toggle 2x, scroll dentro de
.practica-score-imgwrap). 4) al llegar a la última página, el
indicador "Página X de N" se pone en verde+bold además de apagarse
el botón "Siguiente" — doble señal, no solo el botón gris. 5)
aria-label en los botones ⬅/➡ (necesario ahora que bajo 400px no
tienen texto visible) + aria-live="polite" en el indicador de
página, para lectores de pantalla. Cero cambios en paginación/
precarga base/swipe/teclado de v3.198-v3.200.

### v3.200
(a pedido, 3 rondas sobre el visor paginado de v3.198/199) 1) los
botones ⬅/➡ bajo 400px quedaban con flex:1 1 0 (rectángulo angosto
estirado a mitad de ancho, sin usar el estándar táctil del resto de la
app) — ahora usan el mismo criterio que .btn-icon (44×44px, cuadrados,
centrados), solo por CSS. 2) los emoji ⬅/➡ se reemplazan por chevrones
SVG en línea (trazo redondeado, currentColor — mismo criterio visual
que los íconos SVG que ya existen en el panel de práctica), heredan el
color del botón (gris/dorado en hover) en vez de un emoji de sistema.
3) "no noto el cambio del swipe" — el swipe de v3.199 no tenía ninguna
pista visual, así que era invisible sin probarlo a ciegas. Se agrega
un hint chico y sutil "← Desliza para cambiar de página →"
(.practica-score-hint) debajo de la imagen, visible SOLO la primera
vez que se abre el panel en esta carga de página (ocultarHintScore) y
que se autoculta a los 3s o apenas hay cualquier interacción (swipe,
botón, flecha) — no es un elemento permanente. Cero cambios en la
lógica de paginación/precarga/swipe/teclado de v3.198-v3.199.

### v3.197
(a pedido, "cómo veo los scores en músico") pantalla de práctica del
músico ahora muestra el Score PDF (subido por instrumento desde
guia-practica.html v1.118, practicaScores del tema) que matchee su
instrumento asignado en la sesión (miInstrumento) — mismo criterio de
match que ya usa obtenerMaquetaParaSesion (normalizarTxtPractica).
Nuevo bloque colapsable "📄 Score (N pág.)" en bloquePracticaHtml (las
3 ramas: sin maqueta, YouTube, audio-file), pinta las miniaturas de
todas las páginas recién al abrirse (pg_1..pg_N vía Cloudinary, lazy)
+ botón para el PDF completo. A propósito NO se reutilizó la clase
.practica-offsetlocal para el <details> — ese bloque es un <div> que
panelOffset muestra/oculta a mano solo para calibración de archivos
LOCALES; se creó .practica-score-panel aparte (mismo look visual,
cero JS de por medio) para no acoplar el Score a esa lógica. Cero
cambios en obtenerMaquetaParaSesion/obtenerMaquetasParaSesion,
chipsVersiones ni el resto del motor de BPM/waveform/metrónomo.

### v3.196
(a pedido, portado de ensayo.html v3.219) 4 ajustes de
jerarquía visual, 100% CSS — los 6 selectores tocados eran
byte-idénticos a ensayo antes de este cambio, se portó tal cual:
1) .practica-compas-grande: 2.8rem → 3.6rem.
2) .loop-presets-row suma fondo/padding (card, no más flotando).
3) .practica-mapa-tema/.practica-waveform-toolbar acercan margen
   (chip de sección activa + zoom + waveform como un grupo).
4) .practica-player-playbtn (▶) fondo dorado sólido; .practica-
   cue-pad (CUE/✕/📍/↻) baja de 2px→1px de borde y 14%→8% de
   fondo.

### v3.195
(a pedido, revisión de UI, portado de ensayo.html v3.218)
2 duplicaciones visuales sacadas:
1) Badge de arriba (badge-${uid}) — mismo fix que ensayo: badge2,
   dentro de la card del contador (v3.194), queda como único.
2) Nombre de archivo + tags ID3 de arriba (archivonombretop-${uid}
   / archivolocaltagstop-${uid}) — sacados de las 3 ramas de
   bloquePracticaHtml (sin maqueta / YouTube / audio Cloudinary).
   DIFERENCIA con ensayo (detectada antes de portar, no era un
   simple duplicado acá): el caso de maqueta en la nube
   (Cloudinary, ~línea 9554) solo escribía el nombre en
   archivonombretop — no existía abajo. Se agregó esa misma
   asignación también en archivolocalnombre-${uid} (practica-
   local-row) antes de sacar el de arriba, para no perder la
   única referencia visible de "qué maqueta está sonando" en ese
   caso. El caso YouTube nunca escribía nada en archivonombretop
   (verificado), así que ahí no hacía falta portar nada. El resto
   del JS (mostrarTagsDetectadosLocal, onArchivoLocalElegido) ya
   tenía guard tolerante a que el span de arriba no exista —no se
   tocó esa parte.

### v3.194
(a pedido) portados desde ensayo.html (v3.215-v3.217) los
3 cambios ya probados ahí:
1) El bloque "Pulso" (pulsolabel + pulsoClaveUnificadoHtml) se
   mueve de después de "Configuración" a justo después del
   waveform, antes de .practica-metro (arriba del contador).
2) Badge (badge2-${uid}) y reproductor/preconteo (metrobtn/
   precontbtn, antes .practica-libre-row suelto) pasan a vivir
   dentro de la misma card del contador, en un wrapper nuevo
   .practica-contador-card (mismo CSS que en ensayo.html).
3) FIX del scroll automático al reiniciar el loop: se saca
   bloqueActual.scrollIntoView() en la función de resaltado de
   sección — mismo bug de flicker de un frame en
   est.ultimaSeccionChip que en ensayo. Se deja intacto el resto
   (clase .activo, badge, contador).
NO se tocó (a pedido, queda pendiente) el 4to cambio de
ensayo.html (card de sección siempre visible con placeholder) —
en musico.html el div #seccion-${uid} solo se renderiza si
secciones.length, a diferencia de ensayo donde siempre existía;
portar ese cambio implica sacar esa condición y es una decisión
aparte.
Nota: guia-practica.html comparte patrones de código con este
archivo (ver comentarios a lo largo del archivo, "en espejo con
guia-practica.html") — no se tocó acá porque no está disponible
en esta conversación, pero los mismos 3 fixes aplicarían ahí
también si se mantiene la sincronía habitual entre ambos.

### v3.193
(a pedido) "deseleccionar sección" + zoom a sección,
portado desde ensayo.html YA con sus 2 fixes posteriores
resueltos (v3.210/211/212), para no volver a pisar los mismos 2
bugs acá:
1) Click en el bloque/chip YA resaltado (en vez de saltar de
   nuevo al mismo lugar) apaga el resaltado dorado y el loop de
   sección, sin mover el audio (onClickBloqueSeccionPractica/
   desactivarSeccionResaltada, nuevas). irASeccionPractica queda
   intacta — sigue siendo el único camino real de "saltar"; los
   onclick de chip/bloque ahora pasan por el wrapper nuevo.
2) FIX incluido de una: al reactivar clickeando la MISMA sección
   de nuevo, el resaltado SÍ vuelve a encender (se resetea
   est.ultimaSeccionChip antes del seek).
3) FIX incluido de una: la franja DORADA del waveform (dibujado
   aparte en dibujarWaveform) ya no se queda pintada después de
   deseleccionar — nuevo chequeo est.seccionDesactivadaSegundos,
   que se limpia solo en cuanto el playback entra a otra sección
   de verdad (actualizarContadorPractica).
4) Botón cuadrado 🤿 en la toolbar del waveform — ajusta el zoom
   a la sección que está sonando ahora (entero 1×-8×, redondeado
   hacia abajo) y hace scroll a su inicio
   (ajustarZoomASeccionPractica).
NO se trajo el botón ↺ de restaurar zoom (resetZoomWaveform) — esa
función no existe en musico.html, es un feature aparte que ensayo
ya tenía de antes; avisar si también se quiere agregar acá.

### v3.192
(a pedido, portado de ensayo.html v3.204, mobile first)
regla de tiempo del waveform — resolución ADAPTATIVA en vez de
fija (cada=16 principal, cada=4 secundaria, siempre). Ahora se
elige el `cada` más fino de una escalera
[1,2,4,8,16,32,64,128,256] que todavía deje
MIN_PX_TICK_PRINCIPAL=56px de separación real en pantalla
(pxPorCompas = secPerBar/dur * W, mismo principio que v3.38 usa
para el gap del waveform — reacciona a zoom y ancho real, no a la
duración total del tema). La secundaria (cadaSec) sigue siendo
1/4 del principal, pero se salta entera si no deja
MIN_PX_TICK_SECUNDARIO=32px. En un tema completo sin zoom en
celular, da el mismo cada=16 de siempre (caso ya validado sin
cambios) — solo se achica con espacio real de sobra (sección
corta, zoom). El tick del compás 1 (v3.190) ya usaba `compasDur`,
así que sigue funcionando igual con el nuevo `cada` adaptativo sin
tocarlo.

### v3.191
(a pedido, portado de ensayo.html v3.202.2) velocidad de
reproducción del archivo local: pasa de control por % a control
por BPM objetivo (reemplaza el %, no queda alterno) — el músico
piensa en "quiero que suene a X BPM", no en porcentaje. Mismo
motor de siempre (cambiarVelocidadLocalPractica, clamp 50%-120%)
— solo cambia cómo se calcula/exhibe la velocidad: bpmObjetivo /
bpmBase (bpmEfectivo||bpm). Funciones nuevas:
bpmBaseVelocidadPractica, aplicarVelocidadBpmPractica,
ajustarVelocidadBpmLocalPractica (±1 BPM),
aplicarVelocidadBpmInputPractica (campo numérico). Se sacó
ajustarVelocidadLocalPractica (±5%) y el label de %. A diferencia
de ensayo.html, NO se envolvió en <details>/ícono (eso es la
reorganización de v3.211, evaluada aparte) — misma estructura de
siempre (.practica-fila-label + .practica-fino-bloque).

### v3.190
(a pedido) 4 mejoras portadas desde ensayo.html (motor
compartido), revisadas una por una contra la arquitectura de
musico (esLocal es real acá, no universal como en ensayo; no hay
grilla de temas; SÍ hay YouTube/maquetas remotas):
1) Badges de BPM/Compás/Clave/Tonalidad jerarquizados en chips
   (antes un solo texto plano) — mismo criterio que ensayo.html
   v3.213, pero SIN tocar el criterio de "ajustado" de musico (acá
   no existe el mecanismo de "foto al abrir sesión" que sí tiene
   ensayo). De paso se trajo el fix de v3.210.4: el compás
   mostraba denominador "/4" fijo sin importar el compás real del
   tema — acá el bug pega cuando se practica con archivo LOCAL
   (esLocal es real, no universal como en ensayo) en un tema que
   no es /4.
2) #main gana @media(min-width:641px){max-width:1400px} — antes
   760px fijo en escritorio. Mobile no se toca.
3) FIX loop rápido x1/x2 quedaban pegados en .activo para siempre
   — a limpiarPresetsLoopPractica le faltaban 1 y 2 en el array.
4) Tick/número/hora del compás 1 (offsetEfectivo, arranque real
   del tema) en la regla de tiempo del waveform — no tenía marca
   propia, el bucle arrancaba recién en el segundo tick. Portado
   con la escala FIJA de musico (cada=16, ver v3.25) — NO se trajo
   la regla adaptativa de ensayo.html v3.204 (más grande, pendiente
   de evaluar aparte).
Pendiente (evaluación aparte, features más grandes): velocidad por
BPM objetivo en vez de %, regla adaptativa, "deseleccionar sección"
+ zoom a sección, reorden del bloque Configuración.

### v3.189
(a pedido) se completa el port desde ensayo.html — sistema
de modales propios (pedirConfirmacion/pedirTexto) + mostrarToast(),
tal cual como están en ensayo.html (mismo CSS, mismas funciones).
Reemplazan los 6 usos nativos que quedaban:
- confirm('¿Cerrar sesión?') → pedirConfirmacion (cerrarSesion
  pasó a ser async, sin cambiar cómo se la llama desde el HTML).
- prompt(correo modo offline) → pedirTexto (dentro de un IIFE que
  ya era async, conversión directa).
- 4 alert() → mostrarToast: 2 "sin secciones cargadas" (info), 1
  "no podés confirmar en modo preview" (info), 1 "no se pudo
  guardar tu RSVP" (error).
Ningún texto de mensaje cambió de fondo, solo el canal. No se tocó
ninguna lógica de guardado/sesión/RSVP.

### v3.188
(a pedido) 3 mejoras portadas desde ensayo.html (motor
compartido), confirmadas antes de portar que aplican igual acá:
1) Limpieza centralizada de estadoPractica — nueva función
destruirEstadoPractica(uid), único lugar que limpia un estado de
práctica completo. Antes se limpiaban a mano solo 3 de los ~8
timeouts, y nunca se cerraba webAudioPlayerLocal al reemplazar el
estado (solo al cambiar de archivo DENTRO de la misma sesión).
inicializarReproductoresPractica ahora solo la llama. Se preserva
el caso especial de YouTube (ytPlayer.destroy()), que ensayo.html
no tiene.
2) FIX waveform no ocupa el ancho completo en mobile — mismo bug
que ensayo.html v3.193 (canvas.style.width fijado una sola vez con
una medición que puede quedar vieja). Se agrega ResizeObserver
sobre el wrap, desconectado en destruirEstadoPractica.
3) Armadura del badge — se saca el símbolo repetido (♭♭♭/♯♯♯), se
muestra la tonalidad + las notas concretas de la armadura (ej.
"Ab (Bb Eb Ab Db)"). Nueva función notasDeArmadura(), no toca
ARMADURA_POR_TONALIDAD.
Pendiente (decisión aparte, más grande): modales propios
(pedirConfirmacion/pedirTexto) + mostrarToast() en vez de los
alert()/confirm()/prompt() nativos que quedan acá — ensayo.html ya
los tenía de antes, portar el sistema completo es una entrega en
sí misma.
v3.187 (versión anterior sin cambios de esta entrega):

### v3.187
(a pedido) "dejalos colapsables y revisa mobile first" —
el panel de filtros de tono (v3.183-186) pasa de div fijo a
<details>/<summary> nativo (colapsado por defecto), mismo
lenguaje visual/acordeón ya usado en "Configuración" desde v3.16
(flecha ▾ que rota, sin viñeta nativa) — no se inventó un
componente nuevo. Los 2 puntos que antes hacían
panelFiltros.style.display='flex' (onArchivoLocalElegido y
conectarMaquetaEnPractica) pasan a 'block' (display por defecto
de <details>). Auditoría mobile first: se agregó @media
(max-width:480px) para que cada fila de filtro (botón+slider+Hz)
pase el slider a su propia línea completa cuando no entran los 3
elementos cómodos en una fila angosta — el botón (44×44, tap
target estándar del ecosistema) y el valor Hz quedan arriba,
slider abajo a ancho completo.

### v3.186
(a pedido) "lo necesito también para la maqueta" — los
filtros de tono (v3.183-185) dejan de ser solo del archivo local
y ahora aplican TAMBIÉN a la maqueta oficial remota (tipo audio,
Cloudinary), reusando la MISMA cadena de filtros por uid
(obtenerFiltrosPractica, renombrada — antes obtenerFiltrosLocal-
Practica). El <audio id="audio-uid"> nativo de la maqueta remota
se conecta a Web Audio una sola vez (mismo criterio que el local,
guardado en est.audioRemotoSource) y el crearWebAudioPlayer() del
loop exacto remoto también hace conectarSalida(filtroHighpass) —
antes solo el del archivo local lo hacía. El panel de controles
(#filtroslocal-uid, ver v3.185) ahora también se muestra al
conectar una maqueta tipo audio (conectarMaquetaEnPractica), no
solo al elegir archivo local. Gap conocido, no soportado: maquetas
de YouTube — el iframe API de YouTube no expone acceso a Web
Audio, así que ese camino no puede pasar por los filtros (el
panel no se muestra en ese caso salvo que también haya un archivo
local cargado). Variables renombradas (est.filtroHighpass/
filtroLowpass, ya no "...Local") porque ahora son compartidas por
4 motores posibles (local nativo/WebAudio, remoto nativo/WebAudio).

### v3.185
(a pedido) los controles de filtros de tono (v3.183/184)
salen del panel colapsable "Configuración" (practica-offsetlocal,
calibración fina) — quedan en su propio contenedor
#filtroslocal-${uid}, ubicado junto a la fila del archivo local
(nombre/tags), justo debajo del botón "Usar canción del
dispositivo". Mismo criterio de visibilidad que Configuración
(display:none por defecto, se muestra en onArchivoLocalElegido
cuando hay archivo local cargado) — no cambia CUÁNDO aparece,
solo DÓNDE vive en el layout. Sin cambios en la lógica de audio
ni en las funciones toggleFiltroLocalPractica/
ajustarFiltroLocalPractica (siguen operando por id, no por
contenedor).

### v3.184
(a pedido) UI de filtros de tono (v3.183) estilizada: 1)
escala LOGARÍTMICA en ambos sliders (posición 0-100 en pantalla →
Hz vía posAFrecuenciaLog, estándar en audio — el oído percibe
frecuencia en escala log, no lineal); 2) checkboxes reemplazados
por botones cuadrados (practica-click-btn + .activo, mismo patrón
ya usado en todo el ecosistema para toggles) con ícono SVG propio
de pasa-altos/pasa-bajos (curva universal, sin texto) en vez de
checkbox+label.

### v3.183
(a pedido) filtros de tono pasa-altos/pasa-bajos para el
archivo LOCAL del músico (no la maqueta oficial) — 2 checkboxes +
sliders en el panel de ajustes. Se implementan como 2
BiquadFilterNode (highpass->lowpass->destino) compartidos por los
2 motores del archivo local (el <audio> nativo y el Web Audio de
loop exacto a 100%), creados una sola vez por uid vía
obtenerFiltrosPractica(); el <audio> nativo se conecta a Web
Audio (createMediaElementSource) una única vez en su vida (no se
puede repetir), reusado en cada archivo nuevo. Apagado = frequency
en valor neutro (20Hz/20000Hz), nunca se desconecta del grafo.
crearWebAudioPlayer() ganó conectarSalida(nodo) para poder
reruteoar SOLO el player del archivo local — el de la maqueta
oficial (crearWebAudioPlayer también usado en cambiarVersionMaqueta)
sigue yendo directo a destino, sin tocar. No afecta playbackRate/
preservesPitch/currentTime/streaming progresivo (verificado: son
comportamiento del propio <audio>, independiente del grafo de
salida). Se resetea a apagado con cada archivo local nuevo, igual
criterio que la velocidad.

### v3.182
(a pedido) "optimiza todo para mobile first" — auditoría
puntual del panel de Secciones locales (lo agregado en esta
sesión) contra la convención mobile-first ya establecida en el
resto del archivo, en vez de tocar el archivo entero a ciegas:
1) los inputs de Desde/Hasta (compás/tiempo) tenían min-height:
38px, bajo el mínimo táctil de 44px que usa TODO el resto del
archivo (.practica-click-btn, .practica-offsetlocal-input, etc.)
— corregido a 44px. 2) min-width de cada campo bajó de 110px a
100px, para que los 2 por fila entren cómodos en pantallas de
320px sin desbordar. 3) el rango de tiempo del header colapsable
(v3.180) baja a su propio renglón bajo 480px cuando el nombre es
largo, mismo criterio que .seccion-card-header-tiempo del editor
de staff. 4) las clases de texto secundario nuevas
(header-tiempo, duración, labels de campo) se suman al bump
parejo de +1px bajo 600px que ya existía (v3.129), en vez de
quedar afuera con su tamaño de escritorio. Los botones de
presets (x1..x64) ya estaban en 44×44 — sin cambios ahí.

### v3.181
(a pedido) 2 ajustes de consistencia visual: 1) "Fijar" y
"Reiniciar taps" (bloque Tempo exacto) pasan a cuadrados
solo-ícono (✓ / ↺) en el mismo renglón del input, mismo criterio
que "Ajustar comienzo" (v3.173). 2) "Restablecer velocidad" pasa
a cuadrado solo-ícono (↺) y se mueve al mismo renglón que
−5%/+5%, en vez de una fila propia debajo. .practica-fino-reset
queda sin uso en el HTML (mismo criterio del archivo con clases
legacy — no se borra del CSS).

### v3.180
(a pedido) 3 ajustes: 1) las tarjetas de "Secciones de este
archivo" pasan a header colapsable — mismo lenguaje visual que
.seccion-card-header del editor de staff (guia-practica.html):
punto de color + nombre + rango de tiempo (con compás entre
paréntesis) + 🗑 + flecha ▸/▾, clickeable, cuerpo oculto por
defecto. Estado colapsado/abierto solo en memoria
(est.seccionesLocalesColapso), nunca se guarda junto con las
secciones en localStorage — mismo criterio que _colapsada en el
staff (tampoco viaja a Firebase). Una sección recién creada nace
expandida; al eliminar una, se resetea el mapa de colapso entero
(evita índices desalineados por el corrimiento del splice).
2) Se quita el botón "Ajustar click a X (solo esta sesión)" y su
badge "✓ Ajustado a X BPM" — el BPM detectado del tag ahora se
auto-aplica como bpmOverride apenas se detecta, mismo criterio
que ya usaba la tonalidad desde v3.149 (que nunca tuvo botón).
Se eliminó usarBpmDetectadoPractica() (sin uso). Sigue siendo
solo de sesión, nunca toca Firestore/est.bpm.
3) FIX — irASeccionPractica sumaba offsetLocalDelta SIEMPRE al
saltar a una sección, asumiendo que 'segundos' venía en crudo
contra el offset oficial (así son las secciones del TEMA). Las
secciones LOCALES (v3.174) se crean con est.getTiempoActual() —
ya son tiempo real — así que sumarles offsetLocalDelta de nuevo
corría el punto de salto del inicio real de la sección. Ahora
solo suma cuando NO hay archivo local (est.archivoLocalUrl),
que es cuando de verdad se está mostrando una sección del tema.

### v3.178
(a pedido) 2 ajustes: 1) los 4 campos nuevos de
Desde/Hasta compás/tiempo (v3.175) no tenían la clase
.practica-offsetlocal-input, así que se veían con el fondo blanco
por defecto del navegador en vez del fondo oscuro del resto del
panel — se les agregó la clase, ahora combinan. 2) "Seguir
reproducción" y "Repetir sección actual" pasan de checkbox+texto
a botones cuadrados icon-only (.practica-click-btn, mismo
lenguaje que el resto): 🚶‍♂️ Seguir reproducción (arranca
"activo", igual que el checkbox arrancaba tildado) y 🔁 Repetir
sección actual (mismo ícono que ya tenía, ahora en botón). Ambos
alternan la clase .activo en vez de .checked — toggleLoopSeccionPractica
y la nueva toggleAutoScrollWaveformBtn (reemplaza a
toggleAutoScrollWaveform, que recibía el "checked" de un input)
actualizan esa clase. Se agregó un div .practica-waveform-toggles
(margin-left:auto) para mantenerlos pegados a la derecha del
toolbar, igual que antes.

### v3.177
(a pedido) FIX — secPerBarLocalPractica y
actualizarMapaEstructuraPractica (v3.175) usaban
est.bpmOverride||est.bpm para calcular segundos-por-compás, pero
el BPM real que usa la regla de compases del waveform
(dibujarWaveform, bpmParaTicks) y el resto del motor
(metrónomo/loop) es est.bpmEfectivo||est.bpm — bpmEfectivo ya
incluye ajuste fino/tap-tempo, no solo el override crudo. Por eso
los presets (x4, etc.) y "Desde/Hasta (compás)" no coincidían con
los compases reales dibujados sobre la onda. Ambos puntos ahora
usan bpmEfectivo, igual que el resto del archivo.

### v3.176
(a pedido) FIX — compasDeSegundosLocalPractica/
segundosDeCompasLocalPractica (v3.175) usaban solo
est.offsetLocalDelta como punto de compás 1, pero el offset real
de "comienzo de canción" en el resto del archivo es SIEMPRE
est.offset + est.offsetLocalDelta (offsetEfectivo) —
offsetLocalDelta es el ajuste que se suma sobre el offset oficial
del tema, no un reemplazo. Por eso el compás 1 de una sección
local no coincidía con el "Marcar tiempo 1 aquí" ya calibrado en
el panel de arriba. Ambas funciones ahora usan offsetEfectivo,
igual que el metrónomo/click/contador/ticks del waveform.

### v3.175
(a pedido) el panel "Secciones de este archivo" se rehace
lo más parecido posible al sub-bloque ⏱ Tiempo del editor de
secciones del staff (guia-practica.html): cada sección pasa a
tener Desde (compás)/Desde (tiempo) y Hasta (compás, opcional)/
Hasta (tiempo, opcional), ambos pares sincronizados entre sí (se
puede tipear cualquiera de los dos), presets rápidos x1/x2/x4/x8/
x16/x32/x64 (fin = N compases desde el inicio, mismo botón
.btn-preset que ya usan los loops rápidos), botón ↺ para volver
"hasta" a automático, e indicador "→ N compases" cuando hay hasta
fijado. Igual que en el staff, "hasta" vacío = termina donde
arranca la siguiente sección. Conversión compás↔segundos propia
para archivo local (secPerBarLocalPractica/
compasDeSegundosLocalPractica/segundosDeCompasLocalPractica): más
simple que la del staff (un solo BPM/compás efectivo —
est.bpmOverride||est.bpm + compasEfectivoDe(est) — y offset
est.offsetLocalDelta, sin múltiples tramos/compasOverride por
sección, que acá no aplican). "🎯 Marcar aquí" sigue siendo la
forma de crear una sección nueva en el tiempo actual; una vez
creada, todo se ajusta con estos campos. No se tocó el editor del
staff ni nada de Firebase — es un módulo aparte, inspirado en el
mismo pero con su propia lógica de conversión.

### v3.174
(a pedido) "secciones locales propias" — pendiente anotado
desde v3.163 (ver ese comentario). Nuevo panel en Configuración,
"Secciones de este archivo (solo este dispositivo)": el músico
marca partes del archivo local (Verso, Coro, etc.) con nombre +
tiempo actual de reproducción (🎯 Marcar aquí), puede renombrarlas
después (input inline), fijarles un "hasta" manual (⏱, útil en la
última sección — si no se fija, termina donde arranca la
siguiente, mismo criterio que las secciones del tema) y borrarlas
(🗑). Se guardan en localStorage por archivo (nombre+tamaño, mismo
patrón que el offset local de v3.28) — persisten si se vuelve a
cargar el mismo archivo, en este navegador únicamente.
seccionesRuntimeDe(est) pasa de devolver siempre [] con archivo
local a devolver est.seccionesLocales — esto reactiva GRATIS todo
lo que ya consumía secciones en runtime (mapa de estructura
arriba del waveform, líneas/etiquetas de sección en el canvas,
loop por sección, contador en vivo) sin tocar esas funciones. Las
secciones del TEMA (est.secciones, Firebase) y el export a PDF NO
se tocan ni se leen con archivo local — siguen exactamente igual
que antes de este cambio.

### v3.173
(a pedido) bloque "Ajustar comienzo (solo este archivo)":
los 5 botones (Detectar automático 🔍, Buscar más allá 📂,
Reproducir desde el principio ⏮, Marcar tiempo 1 🎯, Marcar con
click en la onda 🖱) pasan de .btn-ghost full-width con texto a
cuadrados 44x44 solo-ícono (.practica-click-btn), en fila con
flex-wrap, mobile-first. Se agregó title="" con el texto
original a cada uno (accesibilidad/tooltip). "Fijar" (✓) y
"Restablecer comienzo" (↺) también pasan a cuadrado y se movieron
al mismo renglón que el input de valor exacto. El bloque
"Tap (tiempo 1)" (con texto y contador) y "Reiniciar taps" /
"Restablecer velocidad" NO se tocaron — comparten clases con
este bloque pero no estaban en el pedido, así que se separaron
los estilos para no afectarlos (se sacó la clase
practica-offsetlocal-marcar de los botones que se volvieron
cuadrados, ya que esa clase la sigue usando el botón de Tap).

### v3.172
(a pedido) botones de Configuración (offset rápido ±20ms,
ajuste fino de offset ±0.05/±0.01, BPM fino ±0.5/±0.05, velocidad
±5%) pasan de columnas 1fr (rectángulos estirados) a cuadrados
fijos 44x44, mismo lenguaje visual que los botones de
metrónomo/reproductor (.practica-click-btn). Mobile-first: se
usa flex+wrap en vez de grid para que en pantallas angostas los
4 del bloque fino puedan acomodarse en 2 filas de 2 sin
desbordar ni recortarse. El número (−0.05, +0.5, etc.) se
mantiene dentro del cuadrado en tipografía más chica (no quedó
100% ícono puro, a pedido). Solo se tocó CSS de
.practica-calib-2col y .practica-fino-grid — ningún onclick, id
ni lógica de cálculo fue modificado.

### v3.171
(a pedido) el pad "Usar canción del dispositivo" se mueve
de su fila propia (practica-local-row) a la fila del metrónomo
(practica-metro, junto a Metro/Clave/Vol/≡) — mismo tamaño 44x44,
misma paleta verde de siempre. Ícono nuevo: ⬆ (flecha arriba) en
vez de ♪. practica-local-row ahora solo tiene el <input
type="file"> oculto y el nombre/tags del archivo cargado — nada
de lógica tocada, el input y el onclick apuntan a los mismos ids
de siempre.

### v3.170
(a pedido) 2 ajustes: 1) los botones "Metro" (click de
metrónomo) y "Clave" pierden el texto y el modificador
.practica-click-btn-etiqueta — vuelven a ser cuadrados 44x44
ícono-solo (📏/🌶), como CUE/loop/metro-libre/archivo local.
HTML_BOTON_METRO (usado por toggleClickPractica para resetear el
botón) se actualizó igual, sin el span de texto. 2) ▶/⏸ del
reproductor ahora se "enciende" (clase .activo, mismo dorado que
ya usan metro-libre/precont) mientras la pista suena, y se apaga
solo en pausa/fin (mismo listener 'play'/'pause'/'ended' de
siempre, ver actualizarIconoPlayPractica). ⏮ (reiniciar) no tiene
estado propio — es una acción momentánea — así que hace un flash
de 250ms con la misma clase .activo en vez de quedar prendido.

### v3.169
(a pedido) 2 ajustes al badge: 1) el compás efectivo con
archivo local u override de sesión ahora se muestra como "N/4"
(ej. "4/4"), no como número plano ("compás: 4") — se asume
denominador de negra, mismo criterio que ya usa el resto del
panel. 2) el mismo contenido del badge (♩ BPM · compás · clave)
ahora también se muestra debajito de la tira de puntos Pulso·
Clave (badge2-${uid} — el div ya estaba en el HTML de una
iteración anterior pero sin conectar; actualizarBadgePractica
ahora arma el texto una sola vez y lo copia a los dos badges, sin
duplicar lógica).

### v3.168
(a pedido) "Usar canción del dispositivo" y "▶ Metrónomo"
pasan a pads cuadrados (44x44, mismo tamaño que CUE/loop), cada
uno con su propia paleta: verde (--ok) para archivo local, dorado
(ya lo traía .btn/.practica-metro-btn.activo) para el metrónomo
libre. El botón de metrónomo, al perder el texto, mantiene sus 3
estados con ícono + tooltip (▶ arrancar / ⏸ detener / ⏳ pre-
conteo), mismo patrón ya usado en el botón de loop (v3.165).

### v3.167
(a pedido) misma lógica de v3.166 pero para la clave —
el badge ahora también muestra la clave efectiva (est.claveEfectiva)
con archivo local, no solo con maqueta oficial. La clave ya sonaba
igual en ambos casos (no depende de tag alguno); v3.149 solo la
ocultaba del texto del badge sin necesidad real. Sin cambios en el
sonido/comportamiento de la clave, solo en el texto mostrado.

### v3.166
(a pedido) el badge (♩ BPM · compás · clave) ahora
siempre muestra el compás EFECTIVO (compasEfectivoDe — el que
realmente usa el click), en vez de ocultarlo con archivo local
(v3.149) o mostrar el texto viejo del tema si hay un
compasesOverride de sesión activo. Con archivo local o con
override, se ve como número simple ("compás: 6"); sin ninguno de
los dos (maqueta oficial, sin ajustar), sigue igual que siempre
("4/4", etc.) — cero cambio visual en el caso de toda la vida. La
clave sigue oculta con archivo local, sin cambios. Así el músico
ve qué compás está sonando sin tener que abrir ⚙️ Ajustes.

### v3.165
(a pedido) los 3 botones de texto "✕ Quitar CUE", "📍 CUE
con click en la onda" y "↻ Marcar loop aquí" pasan a ser pads
cuadrados (44x44, mismo estilo que el pad "CUE") pegados a este
en la fila del reproductor (practica-playerbar), en vez de vivir
en filas de texto aparte más abajo. Quitar CUE y CUE-con-click
mantienen el wrapper cuerow-${uid} (ahora un <span> en vez de
<div>, mismo id) para no tocar la lógica que lo muestra/oculta
según haya waveform cargado. El botón de loop, al perder el
texto, sigue mostrando sus 3 estados con ícono + tooltip
(↻ marcar inicio / ⏹ marcar fin / ✕ cancelar) en vez de frases;
la lógica de marcarLoopPractica/loopRapidoCompasesPractica no
cambió, solo lo que se le asigna a textContent/title. Los
presets de loop rápido (x1..x64) y su fila quedan donde estaban,
sin tocar. Clases .practica-cue-btn/.practica-loop-btn (las de
los botones de texto viejos) quedan sin uso en el HTML pero no
se borraron del CSS, por si sirven en otro lado.

### v3.164
(a pedido) 2 ajustes chicos sobre archivo local, quedó
pendiente un 3ro (pausita del pre-conteo en el metrónomo standalone,
se resuelve después): 1) la línea de comparación de BPM del tag
("— tema en X BPM" + botón "Ajustar click") ahora muestra el
NOMBRE del tema (est.temaNombre, ya disponible desde el staff) en
vez de la palabra genérica "tema" — se pierde de vista fácil a qué
tema corresponde ese BPM con archivo local cargado. 2) el botón
"Ajustar click a X (solo esta sesión)" no daba ninguna señal clara
de haberse aplicado — ahora, al tocarlo, se reemplaza por "✓
Ajustado a X BPM" y se deshabilita, hasta que se cargue un archivo
nuevo.

### v3.163
(a pedido) DEFINITIVO — cierra la cacería del bug del
"hueco" con una decisión de diseño, no un parche más. Secciones/
marcadores de staff están calibrados en segundos contra la
maqueta oficial y casi nunca calzan en el tiempo con un archivo
local distinto — en vez de seguir sincronizándolas (fuente del
bug), CON ARCHIVO LOCAL SIEMPRE SE IGNORAN (seccionesRuntimeDe(est)
devuelve [] si hay archivo local, sin condición ni bandera — antes
de esto pasó por 5 banderas de debug temporales v3.159-3.162, ya
retiradas). BPM/compás/tonalidad/clave NO tenían este problema
(valores sueltos, no timestamps) y quedan exactamente igual que
siempre, con sus overrides de sesión normales. Limpieza asociada:
se sacó por completo el checkbox "🚩 Ocultar etiquetas de
estructura" (v3.135) — quedó sin efecto real, ya que su único caso
de uso (ocultar secciones con archivo local) ahora es automático
y permanente. Se eliminaron: la función
toggleOcultarEtiquetasEstructura(), el checkbox y su fila en
bloquePracticaHtml, el id de #mapaestructurawrap (el div sigue
existiendo, sin id), el campo est.ocultarEtiquetasEstructura, y su
activación en onArchivoLocalElegido. NO se tocó el export a PDF
(exportarEstructuraPracticaPDF y su versión de percusión), que
siguen usando est.secciones real sin pasar por seccionesRuntimeDe
— son un flujo explícito del músico (clic en un botón), no
reproducción en vivo. Pendiente, a futuro (conversación aparte):
"secciones locales propias" — crear secciones ancladas al reloj
del propio archivo local, sin depender de los timestamps del tema.

### v3.162
(a pedido) corrección de v3.161 — "ocultar etiquetas de
estructura por defecto" era demasiado amplio (aplicaba siempre,
incluso con la maqueta oficial). Ahora: (1) el default vuelve a
false en la inicialización del estado y en el checkbox/wrap HTML
— igual que toda la vida con la maqueta oficial; (2) se activa
SOLO al cargar un archivo local (onArchivoLocalElegido llama a
toggleOcultarEtiquetasEstructura(uid, true) y sincroniza el
checkbox) — ahí sí tiene sentido por defecto, porque las
secciones del tema casi nunca calzan en tiempo con un archivo
local distinto de la maqueta oficial. El músico puede destaparlas
a mano en cualquier momento con el mismo checkbox.

### v3.161
(a pedido) 2 ajustes: 1) DEBUG_AISLAR_SECCIONES pasa a
false — metrónomo (BPM/compás/clave, ya en false desde v3.160)
confirmado OK por el usuario, ahora se reactivan las secciones
reales para seguir cazando el bug del "hueco" (siguiente sospechosa
en la lista). Solo queda DEBUG_AISLAR_TONALIDAD en true. 2) FIX
real (no debug) — "🚩 Ocultar etiquetas de estructura" ahora
arranca ACTIVO por defecto (antes arrancaba destapado): checkbox
checked por defecto, wrap #mapaestructurawrap-${uid} con
display:none inicial, y nuevo campo est.ocultarEtiquetasEstructura:
true en la inicialización del estado (antes quedaba undefined/
falsy hasta que el músico tocaba el checkbox). El músico lo destapa
cuando quiera con el mismo checkbox de siempre.

### v3.160
(a pedido) DEBUG TEMPORAL — reemplaza el interruptor único
de v3.159 por 5 independientes (DEBUG_AISLAR_BPM/COMPAS/CLAVE/
SECCIONES/TONALIDAD, arriba de compasEfectivoDe), uno por pieza de
"alusión al tema/staff", para ir descartando de a una en vez de
todo junto. Estado actual: metrónomo (BPM/compás/clave) YA
descartado — las 3 en false, vuelve a funcionar 100% real con
archivo local. Secciones y tonalidad siguen aisladas (true), listas
para prenderse de a una (secciones primero, a pedido) — el músico
mismo puede ir cambiando estas 5 constantes sin pedir un nuevo
archivo. Mismos puntos tocados que v3.159 (compasEfectivoDe(),
recalcularEfectivoPractica(), actualizarBadgePractica(),
seccionesRuntimeDe() en 7 sitios runtime); NO toca export a PDF.
Revertir todo: las 5 en false, o buscar "v3.160-debug" y quitar
los puntos que las usan.

### v3.159
(a pedido) DEBUG TEMPORAL — plan de aislamiento para seguir
cazando el bug remanente del badge/sección: con archivo local
cargado, se desconecta POR COMPLETO toda alusión al tema/staff
(BPM, compás, tonalidad, clave, secciones) — el músico funciona
como si el tema no existiera (BPM neutro fijo 120, compás fijo
4/4, sin tonalidad/clave, sin secciones/badge de estructura).
Reemplazado en v3.160 por interruptores separados.

### v3.158
(a pedido) FIX del bug del "hueco" entre el "Hasta" manual
de una sección y el inicio real de la siguiente. Causa raíz: el
chip/etiqueta de sección activa (actualizarContadorPractica)
apagaba "actual" apenas se cruzaba hastaSegundos, mientras que el
motor de audio/conteo (recorrerTramosMusico) ya venía ignorando
hastaSegundos cuando hay sección siguiente (usa siempre el inicio
de esta). Decisión de diseño confirmada por el usuario: "Hasta" es
SOLO una meta visual para la barra de progreso/duración (esto no
se tocó); el chip/etiqueta ahora usa el mismo límite real que el
audio — el inicio de la siguiente sección manda sobre "Hasta", que
solo se usa como límite real si no hay sección siguiente. Se
quitaron también los 3 logs de diagnóstico temporales usados para
encontrar este bug (metro-libre-debug, clave-debug, tramo — de
v3.153/154/156), junto con las variables de estado que solo
existían para sostenerlos (ultimoBeatsDebugLibre,
ultimoInicioSegClaveDebug, ultimoInicioSegTramoDebug).

### v3.157
(a pedido) FIX real (no debug) — la tira de puntos
"Pulso·Clave" se desincronizaba visualmente del número de compás
justo al cruzar a un tramo nuevo, cuando había clave activa sin
claveSeccion propia. Causa: los puntos se anclaban al reloj
GLOBAL continuo de la clave (tRelClaveAncla), que no se reinicia
en los bordes de sección, mientras el número de compás sí usa
tRelTramo (se reinicia limpio). A pedido, los puntos ahora
siempre usan tRelTramo/secPerBarTramo, igual que sin clave — el
sonido y el flash de la × de la clave NO se tocaron, siguen en su
reloj continuo de siempre. Diagnóstico completo: logs v3.154-156
(aún presentes, temporales) confirmaron que el audio de la clave
estaba bien y que el problema era solo este cruce visual. Ver
conversación v3.157.

### v3.156
(TEMPORAL, sacar después) reemplaza el log v3.155 (nunca
disparaba, dependía de una variable que solo se asigna más abajo)
por uno a la entrada del bloque de clave que muestra los valores
crudos de resolverClaveDeTramo() — claveOnsetsEf, su length,
claveCicloSecEf — para confirmar si vienen vacíos en esta prueba.
Solo lectura, no cambia comportamiento. Ver conversación v3.156.

### v3.155
(TEMPORAL, sacar después) segundo log de diagnóstico,
ahora dentro del bloque de la clave de schedulerTickGlobalPractica()
— mide el desfase real (diffClave) entre el próximo evento de
clave agendado y tRelAnclaClave, y si supera o no el umbral de
resync (claveCicloSecEf*1.5). Hipótesis a confirmar: ese umbral
es mucho más ancho que el del clic normal (secPerBeat*1.5), así
que una microfase de punto flotante en el borde de un tramo
podría quedar sin corregir en la clave aunque el clic sí se
autocorrija. Solo lectura, no cambia comportamiento. Ver
conversación v3.155 para el diagnóstico completo.

### v3.154
(TEMPORAL, sacar después) log de diagnóstico en
schedulerTickGlobalPractica() — hipótesis: el metrónomo LIBRE
(botón "Metrónomo" standalone, sin pista) no usa tramosClick y
por eso el acento fuerte siempre suena en compasEfectivoDe(est)
(el compás GENERAL), ignorando si una sección declara su propio
compás — a diferencia del contador visual, que sí sigue el tramo
real. Esto explicaría el desfase reportado justo al entrar al
compás 9 (donde empezaría una sección con compás propio). El log
no cambia ningún comportamiento, solo compara ambos valores. Ver
conversación v3.154 para el diagnóstico completo.

### v3.153
FIX #2 del desync reportado — cambiarCompasOverridePractica()
nunca llamaba a recalcularEfectivoPractica(), a diferencia de
restablecerAjustesPractica() que sí lo hacía. Por eso
est.claveCicloSecEfectivo/claveOnsetsEfectivo (la duración de
ciclo que usa la tira de puntos Pulso·Clave para saber cuándo
reinicia) se quedaban calculados con el compás VIEJO hasta la
próxima recarga de página — el contador grande (número de
compás/pulso) ya mostraba bien el override porque ese sí se
recalcula en cada frame desde tramoActualContador, pero el punto
encendido de la tira seguía el ciclo viejo y por eso se veía
"adelantado"/reiniciando antes de tiempo. Con esta llamada
agregada, cambiar el compás de sesión ahora deja TODO (contador,
tira de puntos, clave) sincronizado al toque, sin necesitar
recargar la página.
v3.152b: FIX raíz del desync reportado ("compás de sesión distinto
de 4/4 se desincroniza de golpes/puntos, solo funciona bien en
4/4") — beatsPorBarraDeSeccionMusico() le daba prioridad SIEMPRE
al compás propio de cada sección (s.compasOverride, pensado para
casos reales como "un coro en 3/4") por encima del compás de
SESIÓN (compasEfectivoDe/compasesOverride). Así, apenas arrancaba
la primera sección con su propio compás guardado, el click y los
puntos volvían a ese valor, ignorando el override que el músico
acababa de poner para practicar un archivo local distinto. Ahora
recorrerTramosMusico()/beatsPorBarraDeSeccionMusico() reciben un
5to parámetro forzarGeneral (= !!est.compasesOverride en los 5
puntos de llamada: click, contador/puntos, loop simple, loop de
sección y clave-por-tramo) — con un compás de sesión activo, ESE
valor manda en TODAS las secciones, sin excepción; sin override de
sesión (forzarGeneral false) el comportamiento es idéntico al de
siempre, cero riesgo para quien no toca ese campo.

### v3.152
(a pedido) nueva "Subdivisión del click" en el panel de
ajustes del metrónomo (chips ×1/×2/×4, debajo de "Compás (solo
esta sesión)") — para practicar con más referencia rítmica dentro
del mismo compás (ej. ×2 para sentir las corcheas de un archivo
local). A propósito NO es la firma de tiempo real (denominador
musical): un compás sigue durando lo mismo y compasEfectivoDe(est)
no cambia — la subdivisión solo agrega clicks de RELLENO más
suaves (volumen ×0.6, sin acento) entre los pulsos principales de
siempre. Arquitectura: nuevo est.subdivisionOverride (mismo patrón
de sesión que bpmOverride/compasesOverride, nunca toca Firestore)
+ subdivisionDe(est) como único punto de lectura. El bloque nuevo
en schedulerTickGlobalPractica usa su PROPIO índice
(schedNextSubIdx), totalmente separado de schedNextBeatIdx/
beatEnBarra/acentos/tramosClick — así el pulso principal, la
clave, el waveform, el loop y los "bombillos" (dots) quedan
exactamente iguales a como funcionaban antes de esta versión; con
×1 (default) el comportamiento es idéntico al de v3.151. Se
restablece con el botón "Restablecer", igual que los demás
overrides. Texto informativo junto a los presets/campo libre de
compás (ej. "6 ×2 = 12 clicks/compás") vía
actualizarResumenCompasSubdivPractica(), oculto en ×1.
v3.151

### v3.151
(a pedido) la regla de tiempo (mm:ss) del waveform casi no
se veía — usaba colorFaint (gris oscuro, #5c5a55) contra un fondo
oscuro. Ahora usa colorGold (mismo dorado del número de compás),
tanto en la principal (cada 16, con caja de fondo) como en la
secundaria (cada 4, sin caja) — mucho más contraste, sin tocar la
posición ni el resto del criterio "más tenue" de la secundaria
(sigue con menos globalAlpha que la principal).

### v3.150
(a pedido) nuevo "Compás (solo esta sesión)" en el panel
de ajustes — para cuando el archivo local está en un compás
distinto al del tema (ej. 6/8). Presets rápidos (2,3,4,5,6,7,8,9,
12) + campo numérico libre, límite 2-12 (rango músicalmente
razonable: cubre simples, compuestos e impares comunes).
Arquitectura: nuevo est.compasesOverride (mismo patrón que
bpmOverride/claveOverride/tonalidadOverride) + nueva función
compasEfectivoDe(est) como ÚNICO punto de lectura — se reemplazó
TODO uso de est.compasesPorBarra fuera de comentarios/inicialización
por compasEfectivoDe(est) (29 sitios: waveform, loop, metrónomo/
scheduler, contador, clave, PDF/calibración), así que loop,
waveform, click y clave siempre coinciden entre sí con cualquier
compás elegido. PCU_BEATS_BASICOS se amplía de [2,3,4,5,7] a 2..12
para que la tira de puntos del metrónomo ya tenga pre-generada la
plantilla de cualquier valor del override, sin reconstruir DOM.
Al cambiar el compás se resetea el patrón de acentos (no tiene
sentido conservarlo con otra cantidad de tiempos) y se regenera
la fila de botones de acentos + la tira de pulso/clave. Se
restablece con el botón "Restablecer", igual que los demás
overrides — NO se resetea solo al cargar un archivo local nuevo
(a diferencia de BPM/tonalidad) porque no viene de un tag, es 100%
manual, mismo criterio que BPM/clave ajustados a mano.

### v3.149
(a pedido) 2 cambios más de "info del tema viejo" con
archivo local:
1) Tonalidad: se quita el botón "Usar F (solo esta sesión)" — se
   aplica DIRECTO como tonalidadOverride apenas se detecta el tag
   (sin comparar contra la del tema, sin confirmación). Si el
   archivo no trae tag de tonalidad, no se toca nada.
2) Badge superior: compás ("4/8") y clave ("Son 2-3") ya NO se
   muestran con un archivo local cargado (est.archivoLocalUrl) —
   son info de staff sin ningún dato equivalente detectable en un
   archivo de audio. BPM y tonalidad siguen mostrándose (vienen
   del propio archivo). El metrónomo/click interno sigue
   funcionando igual — esto es solo el texto del badge.

### v3.148
(a pedido) el badge de sección del contador ("6 comp. ·
Solo · 0:00-0:09 · Compás 1-6", en actualizarContadorPractica)
ahora también respeta el checkbox "Ocultar etiquetas de
estructura" (ej. si cargaste otro tema) — antes ese checkbox solo
apagaba las etiquetas del waveform (v3.136), pero este badge del
contador seguía mostrando la estructura del tema de staff aunque
el archivo local cargado fuera otra canción. Mismo criterio
exacto que ya usa dibujarWaveform: secciones=[] si
est.ocultarEtiquetasEstructura está activo.

### v3.147
(a pedido, revierte parte de v3.146) el músico quiere que
la regla de compases/tiempo y el loop sigan el BPM REAL del
archivo LOCAL cargado (el detectado por tag, vía "Ajustar click a
X"), no el guardado en el tema de staff. bpmParaTicks del waveform
vuelve a usar bpmEfectivo, y ahora TAMBIÉN marcarLoopPractica y
loopRapidoCompasesPractica usan bpmEfectivo en vez de est.bpm
crudo — así ticks, secciones y loop siempre coinciden entre sí Y
con el metrónomo/click (que ya usaban bpmEfectivo desde antes).
Sin override activo, bpmEfectivo === est.bpm, así que no cambia
nada hasta que el músico aplica un BPM detectado.

### v3.146
(a pedido) 2 fixes:
1) Al elegir un archivo local NUEVO, se resetean los overrides de
   sesión que vinieron del TAG del archivo anterior
   (bpmOverride/tonalidadOverride) — antes quedaban pegados del
   archivo viejo. El BPM/clave ajustados a mano desde el panel
   (no por tag) no se tocan.
2) bpmParaTicks del waveform vuelve a ser SIEMPRE est.bpm (real),
   no bpmEfectivo — así ticks, líneas de sección y loop rápido
   siempre coinciden entre sí, sin importar si hay un BPM de
   click ajustado (que no cambia el tempo real de la grabación).

### v3.145
(a pedido) la regla de tiempo (mm:ss) se movió de "debajo
del número de compás" (v3.144) a la parte inferior DEL WAVEFORM —
ahora se dibuja en el borde de abajo de la zona de la onda
(WAVEFORM_ONDA_H - 4), como franja propia separada del compás, no
pegada a él. Sigue usando el mismo t de cada tick (principal cada
16 y secundario cada 4), así ambas reglas coinciden en X.

### v3.144
(a pedido) 3 cambios en el waveform y en tonalidad:
1) Regla de compases secundaria: resolución subida de cada 8 a
   cada 4 compases, y ahora más tenue (menos alpha, sin caja de
   fondo en el número) para distinguirse claramente de la
   principal de 16 pese al doble de ticks.
2) Regla de tiempo (mm:ss) agregada debajo de CADA marcador de
   compás (principal de 16 y secundario de 4), usando el mismo t
   del tick — así ambas reglas siempre coinciden en X.
3) Tonalidad/armadura: mismo patrón que ya existía para BPM — si
   el tag TKEY/Camelot del archivo local difiere de la tonalidad
   configurada en el tema (guia-practica.html), aparece un botón
   "Usar F (solo esta sesión)" que aplica un tonalidadOverride de
   sesión (nunca toca Firestore/est.tonalidad). El badge superior
   ahora respeta ese override si existe. Antes la línea de tags
   solo mostraba el tono detectado sin poder aplicarlo, y el
   badge seguía mostrando SIEMPRE la tonalidad del tema (quedaba
   fija en lo que decía "staff" aunque se cargara un local con
   otro tono). La clave RÍTMICA (Son 2-3, etc.) no se toca: no
   viene en tags ID3 de un archivo de audio, no hay de dónde
   detectarla.

### v3.142
(a pedido) el botón "Ajustar click a X (solo esta sesión)"
ya no redondea el BPM detectado del tag — antes aplicaba
Math.round(145.23)=145, ahora aplica el valor exacto (145.23) como
est.bpmOverride, y el texto del botón también muestra el valor
exacto (con formatBpm, 2 decimales) en vez del redondeado. No
afecta límites 30-300 ni el resto del mecanismo de bpmOverride.

### v3.141
(a pedido) 2 ajustes sobre la línea de tags detectados del
archivo local: 1) se duplica arriba, junto al nombre del archivo
(nuevo span archivolocaltagstop-${uid} en bloquePracticaHtml,
además del que ya vivía junto a "Usar canción del dispositivo");
2) todo BPM mostrado en pantalla (badge superior, panel de
ajustes, línea de tags detectado/tema) ahora usa nueva función
formatBpm() → 2 decimales fijos (ej. "123.00 BPM"), pensado para
combinar con valores reales del archivo (ej. 145.23) y para uso
futuro en el staff. Solo cambia el texto mostrado — no toca
est.bpm/bpmEfectivo/Firestore ni ningún cálculo.

### v3.140
(a pedido) mostrarTagsDetectadosLocal ahora muestra un
mensaje temporal ("Sin tags BPM/Tonalidad en este archivo") cuando
el archivo local no trae tags ID3, en vez de dejar el espacio en
blanco sin avisar nada. Se borra solo a los 4s. Sin cambios de
lógica de audio/cálculo.

### v3.139
(a pedido) 3 ajustes sobre el CUE de v3.138:
1) FIX — la línea de "comienzo de canción" (offsetEfectivo) se
había perdido al separar offset/CUE en v3.138 (esa línea, de
v3.137, hacía doble trabajo). Vuelve como marca independiente
(celeste, banderita hacia la izquierda) — el CUE sigue en rosa,
banderita hacia la derecha, para distinguirlas de un vistazo.
2) El botón "⏮" del reproductor (reiniciarPistaPractica) ahora
prioriza el CUE si hay uno marcado; si no, cae al offset efectivo
(comportamiento de v3.138), y si tampoco hay offset, al segundo 0
de siempre.
3) "Marcar CUE aquí" pasa de botón de texto en una fila aparte a un
pad cuadrado ("CUE", rosa) pegado a ▶ en la fila del reproductor —
más parecido al botón CUE de un reproductor DJ (CDJ). Las otras 2
acciones (arma clic-en-la-onda / quitar) siguen como botones chicos
debajo, sin cambios de comportamiento.

### v3.138
(a pedido) FIX de diseño — v3.137 reusaba offsetLocalDelta
(calibración de click/conteo) también como punto de arranque del
play, mezclando dos cosas distintas. Ahora son independientes:
1) Nueva variable de sesión est.cuePlayback (null por defecto) —
el CUE de reproducción, sin tocar para nada el offset.
2) Nueva fila de botones en el reproductor (debajo del playerbar,
visible junto con el waveform): "📍 Marcar CUE aquí" (marca en el
segundo actual, marcarCuePractica), "📍 CUE con click en la onda"
(arma el modo, mismo patrón que el de offset, y el próximo click
en la onda fija el CUE ahí — toggleArmarCueWaveform), y "✕ Quitar
CUE" (quitarCuePractica, vuelve a null).
3) La línea rosa del waveform ahora se dibuja en cuePlayback, no en
offsetEfectivo.
4) togglePlayPractica: el salto automático al tocar play (si la
pista está en el segundo 0) ahora usa cuePlayback en vez de
offsetLocalDelta.
5) El botón "⏮" del reproductor (reiniciarPistaPractica, "Volver al
inicio de la pista") ya NO va al segundo 0 real — ahora va al
offset efectivo (offset + offsetLocalDelta), que es donde el
metrónomo considera el tiempo 1. Si el offset está en 0 (o se
restablece con "↺ Restablecer comienzo"), sigue siendo el segundo 0
de siempre. El otro botón, "⏮ Reproducir desde el principio" (el
de Configuración, usado para re-detectar el golpe), NO se tocó —
sigue yendo siempre al segundo 0 real, como necesita ese flujo.
cuePlayback se resetea a null con cada archivo nuevo
(onArchivoLocalElegido), igual que offsetLocalDelta pero por
separado. Cero cambios en el cálculo de compás/metrónomo/loop.

### v3.136
(a pedido) el checkbox "🚩 Ocultar etiquetas de estructura"
(v3.135) solo ocultaba el mapa de abajo — ahora también oculta lo
que dibujarWaveform pinta DENTRO del canvas: líneas de inicio/fin
de sección, sus etiquetas de nombre, y el resaltado dorado de
sección activa (todo depende de infoSecciones, que ahora se arma
con secciones=[] si est.ocultarEtiquetasEstructura está activo).
La franja verde de LOOP y la barra de progreso/playhead NO
dependen de secciones — siguen dibujándose igual, como se pidió
("excepto inicio y loops"). El toggle redibuja el frame actual al
tocarlo, para que se vea al instante sin esperar al próximo tick.

### v3.135
(a pedido) 4 ajustes:
1) "Usar canción del dispositivo" se movió: ahora va debajo del
bloque del metrónomo (antes vivía arriba, antes del mapa de
estructura). Sin cambios de comportamiento, solo de orden.
2) Nuevo checkbox "🚩 Ocultar etiquetas de estructura (ej. si
cargaste otro tema)" arriba del mapa — oculta el mapa
(mapaSeccionesHtml, envuelto ahora en #mapaestructurawrap-${uid})
con display:none. No borra ni recalcula nada, y no se persiste
entre sesiones a propósito (vuelve a mostrarse al recargar, para
no dejarlo "perdido" sin querer).
3) FIX — el "bombillito piloto" de clave (v3.127) usaba 🪔, distinto
del botón "Clave" (🌶) — ahora los dos usan el mismo emoji.
4) "Ajustar el comienzo con click en la onda" — nuevo botón
"🎯 Marcar con click en la onda" junto al ya existente "🎯 Marcar
tiempo 1 aquí". Arma un modo (toggleArmarMarcarInicioWaveform,
canvas con outline dorado y cursor crosshair); el PRÓXIMO click en
la onda marca el tiempo 1 ahí (mismo cálculo que
marcarOffsetLocalPractica) y se desarma solo. El click normal de
la onda (seek / cerrar loop a medio marcar) sigue exactamente
igual cuando el modo NO está armado.

### v3.134
(a pedido) el badge mostraba la armadura como símbolos
sueltos ("F♯m ♯♯♯") — ahora van entre paréntesis, igual que el
campo "Armadura (automática)" de guia-practica.html v1.116: "F♯m
(♯♯♯)". Solo formato de texto, mismo cálculo.

### v3.133
(a pedido) el badge (♩ BPM · compás · clave) ahora también
muestra Tonalidad + Armadura cuando el tema tiene practicaTonalidad
cargada (guia-practica.html v1.115): "♩ 96 BPM · 4/4 · Son 2-3 ·
F♯m ♯♯♯". Mismo círculo de quintas que usa el staff
(ARMADURA_POR_TONALIDAD, duplicado — archivos sueltos sin JS
compartido), pero acá se dibuja como en una partitura: la tonalidad
con ♯/♭ en vez de #/b (formatoTonalidadMusical) y la armadura como
símbolos repetidos en vez de texto (simbolosDeArmadura: "♯♯♯♯♯♯" en
vez de "6 sostenidos"). Si no hay tonalidad cargada, el badge queda
igual que antes (nada nuevo que mostrar).

### v3.132
(a pedido, "ir más allá") si el BPM detectado por tag ID3
difiere (≥1) del BPM configurado en el tema, el aviso de tags ahora
suma "— tema en X" + botón "Ajustar click a Y (solo esta sesión)".
El botón usa est.bpmOverride — el MISMO mecanismo que ya usan los
botones ±5/slider del panel de ajustes (recalcularEfectivoPractica)
— así que es 100% de sesión: nunca toca practicaBpm en Firestore ni
est.bpm. Queda guardado en localStorage como cualquier otro ajuste
de sesión (guardarAjustesPractica), recuperable hasta "Restablecer"
en el panel de ajustes.

### v3.131
(a pedido) info de tags ID3 en "Usar canción del
dispositivo" — mismo lector leerTagsAudioID3 que guia-practica.html
(archivos sueltos, sin JS compartido), NO analiza el audio, solo lee
metadata ya escrita por Virtual DJ/Rekordbox/Serato (TBPM/TKEY o
TXXX). Al elegir el archivo local, muestra "🏷️ 96 BPM · Cm" junto al
nombre — puramente informativo (esta pantalla no guarda nada en el
tema), para que el músico compare contra lo ya configurado.

### v3.130
(a pedido) FIX — las etiquetas de estructura ("Solo 5 c.",
"Coro 4 c.", etc. en seccionesChipsHtml/mapaSeccionesHtml) calculaban
la duración en compases con el compás GENERAL fijo del tema
(secPerBar único, afuera del loop), ignorando si la sección tenía su
propio compasOverride (ej. un Coro en 3/4 dentro de un tema en 4/4)
— por eso mostraban menos compases de los reales (el contador en
vivo sí era correcto porque ya usa recorrerTramosMusico). Fix:
secPerBar ahora se calcula POR SECCIÓN con beatsPorBarraDeSeccionMusico
(misma función que ya usa exportarEstructuraPracticaPDF desde v1.81),
dentro del .map() de ambas funciones. También se agrandó el texto:
.practica-seccion-chip 0.8rem→0.9rem (activo 0.86→0.96rem),
.practica-mapa-bloque 0.72→0.82rem, .practica-mapa-comp (badge
"X c.") 0.62→0.72rem. Cero cambio en el contador en vivo, el PDF ni
la lógica de audio/timing — solo el cálculo de estas 2 funciones de
etiquetas y su tamaño de texto.

### v3.129
(a pedido, mobile first) 4 ajustes inspirados en el pase
mobile-first ya hecho en guia-practica.html (v1.101-v1.110), acá
adaptados al uso EN VIVO del músico (no de configuración):
1) FIX zoom automático iOS — .practica-ajuste-select (0.9rem) y
.practica-offsetlocal-input (0.85rem) suben a 16px (mismo criterio
que guia-practica v1.102: Safari hace zoom si el campo enfocado
mide menos de 16px). El resto de inputs/selects del panel ya
estaba en 16px o tiene tamaño fijo por motivo de grilla — no se
tocaron.
2) Objetivo táctil — .btn-preset (loop rápido x1..x64) 38x38→44x44
(mínimo recomendado, igual que guia v1.103). FIX de regresión
propia: .loop-presets suma flex-wrap:wrap para que los 7 presets
no se corten en pantallas angostas al agrandarse (misma lógica que
.hasta-presets en guia v1.103).
3) Bump de texto secundario bajo 600px (nuevo @media) — labels,
meta de sesión, badges, textos de toolbar/offset/loop — pensado
para lectura rápida con el instrumento en la mano. Afuera a
propósito: título de marca, número grande del contador, título de
canción, y lo que ya bumpeaba el @media(480px) existente (evita
doble bump).
4) @media(max-width:400px) nuevo para <main> (padding 14px 12px),
mismo criterio que .page-container en guia v1.104, para telas muy
chicas (320-360px).
Ningún cambio de JS, oninput/onchange ni lógica de audio/cálculo —
100% CSS.

### v3.128
(a pedido) 2 ajustes más de UI:
1) "¿Confirmas asistencia?" (rsvp-row) se muda DENTRO del mismo
<details> de consentimiento (antes eran 2 bloques separados) —
resumen renombrado a "✅ Asistencia y consentimiento". Sigue
condicionado a !pasada, igual que antes (solo cambia dónde vive).
2) Las etiquetas de estructura (mapaSeccionesHtml, mapa/chips de
secciones) se mudan de arriba de todo (debajo del badge) a
inmediatamente encima del waveform — sin tocar la función en sí,
solo dónde se llama dentro del template.

### v3.127
(a pedido) 5 ajustes de UI en el bloque de práctica:
1) "Repetir sección actual" pasa de botón suelto a checkbox,
dentro de waveform-toolbar junto a "Seguir reproducción" (mismo
estilo). toggleLoopSeccionPractica() ahora sincroniza `checked`
en vez de textContent/clase.
2) "Marcar loop aquí" + "Loop rápido" (x1..x64) se mudan a una
fila nueva pegada justo debajo del playerbar (no entran en la
misma fila que play/pausa/volumen — se apretaría demasiado en
móvil con 7 presets).
3) Como consecuencia de 1) y 2), el bloque "Acciones de práctica"
que vivía entre el waveform y el contador desaparece — el número
grande y la tira de puntos quedan inmediatamente debajo del
waveform.
4) Nuevo bombillito piloto de la clave (🪔, arriba-izquierda de
.practica-compas-wrap): oculto si no hay clave activa
(claveActivaEf), parpadea en TODO golpe real de la clave (mismo
delay/duración que la ×, DELAY_VISUAL_CLAVE_MS ahora compartida)
— a diferencia de la ×, no depende de que exista un marcador
notaEl en el DOM, así que no se pierde con la degradación segura
de v3.113.
5) El bloque "✍️ Firmar consentimiento" pasa a un <details>
colapsado por defecto (mismo patrón que "Configuración").
No se tocó marcarLoopPractica, loopRapidoCompasesPractica, ni
ninguna lógica de audio/timing — solo dónde viven los controles
en el HTML y el bombillito nuevo.

### v3.126
(a pedido) FIX — reporte "no está dibujando la clave de
tramo al vuelo" (0 × dinámicas, onsets: [] pese a tener claveSeccion
propia con golpes). Causa: alfabeto de patrón desactualizado — hace
poco se agregaron a guia-practica.html "n"/"N" (golpe de negra,
normal/acentuado, pesa 2 corcheas) y "," (silencio de negra, pesa 2,
NO es golpe), pero la copia portada de parsearPatronRitmico/
aplanarColumnasPatron/pesoTotalPatron en musico.html se quedó con
el alfabeto viejo (solo x/X/./-) — cualquier patrón que usara el
alfabeto nuevo (ej. ".nn.nn,") se leía como si solo tuviera 2
silencios de corchea, sin ningún golpe real, dando onsets: [].
Fix: se portan 1:1 los mismos 3 ajustes ya vigentes en
guia-practica.html (mismo criterio, ningún carácter nuevo
inventado acá) — "," pesa 2 (silencio), "n"/"N" pesan 2 y SÍ son
golpe. También se agrega "n"/"N" al filtro de golpe real dentro de
construirOnsetsDesdePatron (propia de musico.html, calcula
tiempos en vivo — no existe en guia-practica.html). Los grupos
{} siguen siendo puros de corchea (x/X/./-), sin "n"/"N"/",", igual
que en guia-practica.html — sin cambio ahí.

### v3.125
FIX — reporte "el número de compás/tiempo es correcto
pero el punto de clave que prende no es el que corresponde"
(ej. compás 18 tiempo 1, pero prende el punto "2"). Causa: dos
relojes distintos para la clave — el número grande usa el reloj
LOCAL del tramo (barIndex/beatEnBarra, correcto), pero el turno
de compás de la clave, el flash de la × y el sonido (scheduler)
seguían anclados al reloj GLOBAL del tema (tRel) módulo el ciclo
de 2 compases — ya documentado como límite conocido ("la clave
asume compás constante", ver comentario v3.111 más abajo, ahora
resuelto). Si antes del tramo actual hubo otro compás, o el tramo
no cae justo en un borde del ciclo global de 2 compases, los dos
relojes se corrían entre sí. Fix: cuando el tramo actual declara
su PROPIA claveSeccion, el ciclo de la clave (turno de compás,
flash de la ×, sonido del scheduler, y puntos "Pulso" con clave)
pasa a anclarse al INICIO REAL DEL TRAMO (mismo criterio que ya
usa barIndex) en vez del reloj global — arranca limpio en el
primer compás de la sección, sin importar qué pasó antes. Sin
claveSeccion propia (clave general del tema, caso de siempre),
sigue anclada al reloj global — sin cambio ahí. Toca 4 puntos,
mismo criterio en los 4 para que sigan sonando/viéndose pegados:
resolverClaveDeTramo() (ahora también devuelve tRelAncla),
schedulerTickGlobalPractica() (agendamiento del sonido, con su
propia ventana de lookahead en el reloj anclado), y 3 usos dentro
de actualizarContadorPractica() (turno de compás, flash de la ×,
ciclo de puntos) — todos vía la nueva variable tRelClaveAncla. No
se tocó construirOnsetsDesdePatron, el dibujo de la tira, ni nada
del compás general (secPerBar/tRel "de siempre").

### v3.124
(a pedido) letra de ensayo (A/B/C…) en las etiquetas del
waveform — antes solo mostraban sec.nombre tal cual. Se porta 1:1
letraEnsayoSugerida() desde guia-practica.html (misma lógica: letra
manual del staff (s.letraEnsayo) tiene prioridad siempre; si no
hay, sugiere A/B/C… contando solo secciones con nombre no vacío y
sin origenId; una sección con origenId comparte la letra de su
origen, +"'" si es esVariacion) — se agregan letraEnsayoSugerida()
y letraEnsayoDeSeccion() a musico.html, que no las tenía. Etiqueta
ahora "A · Coro 2" en vez de solo "Coro 2"; sin nombre, sigue sin
mostrarse nada (sin cambio ahí). IMPORTANTE: se resuelve contra
est.secciones en su orden ORIGINAL de guardado (no la copia
ordenada por tiempo que ya usa el resto del waveform) — mismo
criterio que seccionesEnEdicion en el editor, para que la letra
coincida siempre con la del PDF. No se tocó nada de guia-
practica.html ni de cómo se guarda/sugiere la letra ahí — pregunta
aparte del staff: hoy dejar el campo "Letra de ensayo" en blanco
SIEMPRE cae en la sugerida (A/B/C…), no hay forma de decir
"esta sección va sin letra" — si lo quieren, es un cambio
puntual en guia-practica.html (un valor especial tipo "-" que
letraEnsayoSugerida/letraEnsayoDeSeccion respeten como "sin letra"),
evaluar aparte, no se tocó acá.

### v3.123
(a pedido, estética) fondo de la CARD de los puntos
(.pcu-strip, distinto de los círculos individuales — ver v3.122):
(a) antes solo se ponía dorada en el 2do compás si había clave
ACTIVA y era la plantilla home — ahora se pone dorada en el 2do
compás SIEMPRE (con o sin clave, en cualquier plantilla), usando un
conteo de compás real del tramo aparte (numeroCompasPcu/
esSegundoCompasPcu) que no toca el ciclo/timing de los puntos en sí.
(b) si el compás real del tramo NO es 4/4, ese destello usa lila
(--lila/--lila-bg, mismo tono que colorProgreso en otras partes del
panel) en vez de dorado — clase nueva .compas-otro, CSS con mayor
especificidad que .compas2 para ganarle cuando ambas coinciden.
En 4/4 sigue siendo dorado como siempre.

### v3.122
(a pedido, estética) los puntos del pulso general ya no
cambian de color de fondo según el tipo de compás (PCU_BEATS_COLOR:
azul en 2/4, verde en 3/4, naranja en 5/4, violeta en 7/4) — ahora
TODAS las plantillas se ven siempre como la principal/4/4 (puntos
grises en reposo). Lo único que sigue variando el fondo de un
círculo es el flash dorado (golpe normal) / verde (golpe fuerte)
al pasar cada tiempo — igual en el 1er compás que en el 2do. Cambio
mínimo y reversible: PCU_BEATS_COLOR y su CSS asociado
(--pcu-tpl-color) quedan intactos en el código, solo se dejó de
aplicar el estilo inline que los activaba.

### v3.121
FIX de fondo sobre v3.120 — reporte "el dibujo de los
círculos se pega y vuelve a arrancar en algunas repeticiones".
v3.120 dejó de cerrar el AudioContext propio de cada
crearWebAudioPlayer() (correcto, ahora es compartido — cerrarlo
hubiera apagado el click de todos), pero se quedó corto en 2
lugares donde un player viejo queda dando vueltas sin que nadie lo
desconecte del grafo de audio compartido:
(1) cerrar() detenía el nodo de audio (buffer source) pero nunca
desconectaba el gainNode propio del destino compartido — quedaba
como nodo huérfano para siempre. Ahora cerrar() también hace
gainNode.disconnect().
(2) conectarMaquetaEnPractica() (cambio de versión de maqueta
remota, chips "Con bajo"/"Sin bajo"): al mejorar a loop exacto se
creaba un crearWebAudioPlayer() nuevo, pero si el motor anterior YA
era un player de una versión previa, nunca se cerraba. Con varios
cambios de versión en una sesión (y varios instrumentos a la vez)
esos nodos huérfanos se iban acumulando en el mismo contexto
compartido y sobrecargaban de a poco el hilo de audio — se notaba
como un tironcito justo al reiniciar el loop/ciclo. Ahora se
guarda el motor anterior antes de reconectar y, si tenía .cerrar()
(o sea, era un player Web Audio y no el <audio> nativo del uid,
que se reusa siempre y no se cierra), se cierra.
El mecanismo de reutilización del cambio de VELOCIDAD
(ajustarVelocidadLocalPractica, que alterna entre el <audio> nativo
y est.webAudioPlayerLocal manteniendo ambos vivos) no se toca —
sigue guardando esa instancia para reusarla, nunca se cierra sola.

### v3.120
FIX — reporte "el click se siente inestable". Causa: cada
crearWebAudioPlayer() (loop exacto de una maqueta local o remota)
abría su PROPIO AudioContext nuevo, distinto del audioCtxPractica
que usa schedulerTickGlobalPractica() para agendar los beeps de
click/clave. Con instrumentos/maquetas activos, había varios
AudioContext corriendo en simultáneo: el click se agendaba con el
reloj de uno y la posición real de reproducción (est.
getTiempoActual) venía del reloj de OTRO — fuente de jitter/drift
entre agendado y sonido real, más notorio en móvil. Fix: se agrega
obtenerAudioCtxPractica() como único punto de creación/resume del
contexto; crearWebAudioPlayer() ahora reusa ESE mismo contexto en
vez de crear uno propio, y su cerrar() ya no lo cierra (antes
hubiera roto el click/clave y cualquier otro instrumento que lo
compartiera). 100% aditivo en interfaz: getTiempoActual/seek/play/
pause/volumen/loop de crearWebAudioPlayer no cambian, solo de qué
AudioContext salen. Sin secciones/maquetas con loop exacto activo
simultáneo, el comportamiento es equivalente a v3.119 salvo que
ahora hay un solo AudioContext en vez de varios.

### v3.119
FIX — "la clave va cruzada con el metro": v3.115 cambió el
ciclo de los PUNTOS para usar siempre el reloj LOCAL de la sección
(tRelTramo), pero el flash de la × y el sonido siempre usaron el
reloj GLOBAL del tema (tRel) — quedaban desfasados en cuanto había
clave activa. Con clave activa, el ciclo de los puntos vuelve a
anclarse al reloj global (tRel/claveCicloSecEf), igual que la ×;
sin clave sigue en el reloj local de la sección (sin cambios ahí).

### v3.118
(a pedido) el compasOverride de la sección (3/4, 5/4, etc.)
no se veía en ningún lado del panel de práctica — solo era
editable en guia-practica.html. Se agrega un badge chico junto al
nombre de la sección activa, SOLO cuando su compás real difiere
del general (tramoDeActual.beats) — sin override, no cambia nada.

### v3.117
FIX — el botón 🌶/🪘 de mute de clave se ocultaba por
completo si no había clave GENERAL configurada, aunque alguna
sección tuviera su propia claveSeccion — quedaba sin forma de
apagarla/prenderla. Ahora también se muestra si hay clave en
alguna sección (tieneClaveSeccionAlguna).

### v3.116
(a pedido) el override de sesión "Sin clave" (selector
CLAVE del panel de práctica) ya no pisa la claveSeccion PROPIA de
una sección — solo sigue ganando sobre la clave GENERAL. Un
override a una clave ESPECÍFICA sigue pisando todo, como hasta
ahora (sin cambio ahí). Afecta resolverClaveDeTramo (sonido) y
actualizarContadorPractica (visual/tira PCU) por igual, para que
no queden desincronizados.

### v3.115.1
FIX — la tira dinámica de clave no se dibujaba cuando la
sección solo heredaba la clave GENERAL (sin claveSeccion propia
guardada) — el gate estaba condicionado a claveSeccionActual en
vez de a hayClave. Ahora se dibuja siempre que haya clave activa
en el tramo, propia o heredada.

### v3.115
(a pedido) FIX — con clave activa, la tira PCU y su ciclo
seguían forzando el compás GENERAL (ignoraban compasOverride), así
que una sección con clave Y compás propio (ej. coro en 3/4 con
clave sonando) nunca mostraba su propia plantilla. Ahora plantilla
y ciclo son SIEMPRE el compás/tramo real, tenga o no clave activa.
Además: todas las plantillas pre-generan siempre 2 compases de
puntos (el 2do oculto por CSS salvo que haya clave activa en el
tramo — sin crear/borrar nodos); si el tramo declara su PROPIA
claveSeccion, se generan al vuelo las × correspondientes a SU
patrón real (antes solo la plantilla home tenía × y con la clave
GENERAL). Color por plantilla (PCU_BEATS_COLOR) ahora se ve como
fondo de los puntos en reposo, no como línea inset (chocaba
visualmente con los puntos).

### v3.114
(a pedido) plantillas básicas de conteo para el pulso
general (los "puntos grandes" del metrónomo, NO la clave — temas
independientes) — 2, 3, 4 (la que ya estaba), 5, 7 golpes.
Bug de fondo que resuelve: pulsoClaveUnificadoHtml() armaba la
tira de puntos UNA sola vez con compasEfectivoDe(est) (el compás
GENERAL del tema); una sección con compasOverride a otro compás
(ej. 5/4 en un tema 4/4) no tenía la cantidad real de puntos —
el golpe de más se recortaba contra el último punto
(Math.min(totalTiempos-1,...) en actualizarContadorPractica),
mostrando el golpe 5 pegado sobre el 4.
Ahora pulsoClaveUnificadoHtml() pre-genera, dentro del mismo
.pcu-strip, una .pcu-tira por cada plantilla básica + el compás
general (si no está ya en la lista), todas ocultas salvo la
activa (clase .pcu-tira-activa) — mismo criterio de "no
regenerar DOM en caliente" que ya usamos para la clave por
sección. actualizarContadorPractica() resuelve el compás real
del tramo actual y activa la plantilla que corresponde (o cae a
la del compás general si el compás no está en el vocabulario
básico — degradación segura). Solo la plantilla que coincide con
el compás GENERAL lleva los marcadores de clave (× — CLAVE_
PATRONES asume ese compás), sin cambio ahí.
Cada plantilla (salvo 4/4) trae su color propio (PCU_BEATS_COLOR,
acento inset sin afectar el layout) para distinguir de un vistazo
qué compás está sonando cuando cambia por sección.
100% aditivo: sin secciones con compasOverride fuera del compás
general, o si el tema entero es 4/4 sin overrides, el
comportamiento y la vista son idénticos a v3.113.

### v3.113
(a pedido, fix de fondo tras revisión) v3.112 dejaba 2
huecos reales en la clave por sección:
(1) claveOn (schedulerTickGlobalPractica) dependía SOLO de la
clave GENERAL del tema (est.clave/claveEfectiva) — un tema SIN
clave general pero con secciones que sí traen claveSeccion nunca
entraba al bloque de clave, ni sonido ni visual. Se agrega
est.tieneClaveSeccionAlguna (precalculado al cargar el tema) y
claveOn ahora también se activa si hay alguna claveSeccion,
aunque no haya clave general. Mismo fix aplicado al gate visual
equivalente en actualizarContadorPractica (antes "claveEf" a
secas, ahora "claveActivaEf" = claveEf || claveSeccion del tramo
actual) — afecta el turno de compás 1/2 de la clave y el ancho/
ciclo de la tira pcu (hayClave).
(2) el flash visual del "×" individual (marcadores
clavenota-uid-barIdx-posIdx) se generan en el DOM UNA sola vez
con la forma de la clave GENERAL (CLAVE_PATRONES[claveEf], N
golpes fijos). Si el tramo actual usa una claveSeccion con OTRA
cantidad de golpes, no hay forma de mapear con certeza qué
marcador le corresponde — degradación segura: se omite el flash
de esa nota puntual (patronCoincide === false) en vez de arriesgar
encender el marcador equivocado. El sonido (ya correcto desde
v3.112) y el ciclo de la tira pcu no se ven afectados por esto —
solo se pierde el flash fino del golpe individual en esas
secciones. Regenerar los marcadores dinámicamente por tramo
(alternativa con flash exacto en cualquier patrón) se dejó fuera
a propósito: toca la generación de markup del panel en vivo, más
invasivo, evaluar aparte si hace falta.
100% aditivo sobre v3.112, sin tocar ningún comportamiento cuando
no hay claveSeccion en ninguna sección.

### v3.112
(a pedido) clave POR SECCIÓN en ejecución en vivo — hasta
ahora la clave (patrón golpe/acento/silencio) era un solo valor
GLOBAL por tema (est.clave/claveOnsetsEfectivo), igual para toda
la canción. Ahora cada sección puede traer su propio patrón
(s.claveSeccion, ya editable desde guia-practica.html v1.93) y
los 3 consumidores en vivo lo respetan:
- recorrerTramosMusico() ahora anota claveSeccion en cada tramo
  (dato nuevo, no reemplaza ningún campo existente del tramo).
- se portan parsearPatronRitmico()/pesoTotalPatron() (puras, sin
  DOM) desde guia-practica.html, y se agrega
  construirOnsetsDesdePatron(patron, secPerBeat, secPerBar): mismo
  criterio proporcional (posición = peso acumulado/peso total)
  que ya usa el dibujo del patrón, pero en segundos, sobre un
  ciclo de 2 compases (igual que la clave general).
- scheduler de audio (clave, ~2691), contador/pulso visual
  (~3905) y tira pcu unificada (~4296): los 3 resuelven el tramo
  actual (tramoMusicoEnSegundo) UNA vez al entrar al bloque de
  clave (no dentro de loops de agendamiento — SCHED_LOOKAHEAD_SEC
  es 0.1s, muy por debajo de un ciclo de clave típico, así que no
  hace falta resync a mitad de ventana) y aplican: si hay
  claveOverride activo → se mantiene el valor global de siempre
  para TODOS los tramos (sin cambio de comportamiento actual); si
  no, tramo con claveSeccion propia → onsets de ese patrón; tramo
  sin ella → cae al est.claveOnsetsEfectivo/claveCicloSecEfectivo
  general, exactamente como hasta ahora.
- 100% aditivo/reversible: si ninguna sección tiene claveSeccion,
  el comportamiento es idéntico a v3.111.

### v3.111
(a pedido, tras reporte "el contador y el loop no están en
sincro") FIX de fondo — v3.109/v3.110 corregían el COMPÁS (beats)
por tramo pero dejaban 2 problemas: (1) el contador grande, los
puntos sin clave y la etiqueta "N comp. · Compás X-Y" nunca se
habían tocado — seguían con secPerBar/tRel 100% generales; (2) los
6 snaps de loop/waveform de v3.109 corregían el compás pero
seguían anclando el "reinicio en el borde" contra el offset GLOBAL
del tema en vez del inicio real de cada tramo — con más de un
tramo de compás distinto antes del punto en cuestión, el ancla se
corría y el loop no cerraba en el borde real.
Se introduce un constructor único (recorrerTramosMusico/
tramoMusicoEnSegundo/compasDeSegundosMusico, con compasInicio
ACUMULADO — mismo criterio de recorrerTramos()/compasDeSegundos()
de guia-practica.html) que reemplaza y retira: tramosClickMusico/
tramoClickEnSegundo (v3.110) y seccionEnSegundoMusico (v3.109).
Ahora comparten el mismo modelo: el CLICK (schedulerTickGlobal-
Practica), los LOOPS (marcarLoopPractica/loopRapidoCompasesPractica/
loop automático de sección, todos re-anclados contra el inicio del
tramo), las LÍNEAS del waveform (ídem), el CONTADOR grande
(barIndex/beatEnBarra), los PUNTOS sin clave (tiempoGlobal), y el
rango "Compás X-Y" de la etiqueta de sección (barInicio/
compasesSeccion). secPerBar/tRel generales se dejan intactos donde
los sigue usando la cuenta regresiva de "restantes" y el camino de
CLAVE (asume compás constante — caso de borde ya conversado,
fuera de alcance: con clave activa, el widget de puntos sigue
razonando en el compás general). Sin ningún compasOverride
cargado, cero cambio de comportamiento en todo lo anterior.

### v3.110
(a pedido) el CLICK sincronizado (schedulerTickGlobalPractica)
ahora acentúa por tramo real, no por módulo fijo — mismo criterio de
"reinicio en el borde" de recorrerTramos() (guia-practica.html),
simplificado acá en tramosClickMusico()/tramoClickEnSegundo() (no
necesita compasInicio acumulado, solo saber dónde cae el tiempo 1 de
cada tramo). El TIMING de los beeps no cambia — BPM sigue único para
todo el tema (confirmado: ni acá ni en guia-practica.html hay tempo
real por sección, solo compás) — esto solo corrige QUÉ beat es el
acento fuerte al cruzar una sección con compasOverride. El
metrónomo LIBRE (metroLibreActivo) queda 100% intacto con su módulo
fijo de siempre: corre en su propio reloj (performance.now()), sin
relación con desdeSegundos de las secciones, así que aplicarle
tramos sería mezclar dos relojes que no corresponden. Sin ningún
compasOverride cargado, cero cambio de comportamiento en el click.

### v3.109
(a pedido) amalgama alcanza también el compás/click en vivo,
no solo el PDF (v3.108). Extiende beatsPorBarraDeSeccionMusico
(compasOverride por sección) a los 8 puntos que antes usaban
compasEfectivoDe(est) fijo: marcarLoopPractica, loopRapidoCompases-
Practica (con helper nuevo seccionEnSegundoMusico para ubicar la
sección de un tiempo suelto), el loop automático de sección (ya
tenía `actual` resuelta), la línea de inicio de cada sección en el
waveform, y el fin de la franja de sección activa. bpmOverride
(ajuste personal de tempo del músico) queda intacto — es otro
concepto, no varía por sección, a diferencia de guia-practica.html
donde tampoco hay BPM real por tramo (recorrerTramos solo varía
compás). Sin ningún compasOverride cargado, cero cambio de
comportamiento en los 8 puntos.

### v3.108
(a pedido) amalgama — s.compasOverride ("Compás (si cambia
acá)", ya existía como campo, era solo texto decorativo en el PDF)
ahora también afecta el cálculo real de duración en los 2 export de
PDF (exportarEstructuraPracticaPDF/Percusion): nueva
beatsPorBarraDeSeccionMusico(s, beatsGeneral), secPerBar pasa a
calcularse POR SECCIÓN en vez de uno fijo para todo el tema. Mismo
criterio aplicado en guia-practica.html v1.81. Sin override, cero
cambio de comportamiento (usa el compás general de siempre).

### v3.107
(a pedido) botón nuevo "🥁 PDF Percusión" junto a "📄 Exportar
PDF" — nueva función exportarEstructuraPracticaPDFPercusion(uid),
mismo armado de datos que exportarEstructuraPracticaPDF pero llama a
generarEstructuraPDFPercusion (pdf-percusion.js). Se agrega
<script src="pdf-percusion.js">. Cero cambios en
exportarEstructuraPracticaPDF ni en el resto de la hoja.

### v3.106
(a pedido) pdf-estructura.js (v1.92) se dividió en 2 archivos
independientes; esta hoja solo usa generarEstructuraPDF (acordes),
así que el <script src="pdf-estructura.js"> se reemplazó por
<script src="pdf-armonias.js">. No usa percusión, no se agregó
pdf-percusion.js. Cero cambios de lógica/comportamiento.

### v3.105
(a pedido) FIX de diseño sobre v3.104 — la nota de sección
pasa de un carril propio debajo del nombre a ir PEGADA al lado del
nombre, mismo renglón (como en el PDF), quitando el carril extra que
agregaba v3.104. Sigue truncada corta (16 car.) e itálica/chica/
colorFaint (secundaria frente al nombre). El ancho combinado
(nombre + nota) ahora entra en el mismo cálculo de `carril` que ya
evita que las etiquetas se pisen entre sí — una sección vecina se
sigue corriendo sola si hace falta, sin lógica de colisión nueva.

### v3.104
(a pedido) nota de sección (s.notaSeccion, ya la imprime el
PDF desde pdf-estructura.js v1.53) ahora también visible en el
waveform de la práctica — pensando en mobile (alto de pantalla
escaso, la nota es dato de contexto, no lo urgente al tocar):
truncada bien corta (16 car. + "…", contra los 70 del PDF), itálica,
chica y en colorFaint (tenue a propósito, para que el ojo vaya
primero al nombre de sección). Se dibujaba pegada un renglón debajo
del nombre de su misma sección, en el mismo mecanismo de `carril`
que ya evita que los NOMBRES se pisen entre sí (dibujarWaveform) —
la nota reservaba su lugar en el mismo array carrilesFinX, así que
si una sección próxima caía dentro de ese ancho, la asignación de su
nombre la corría sola a otro carril, sin agregar detección de
colisión aparte. Superado por v3.105 (ver arriba). Nada de esto se
edita desde acá (solo lectura, mismo campo que ya carga
guia-practica.html).
v3.103

### v3.103
(a pedido, tras comparar el PDF de músico vs. el de práctica)
FIX en exportarEstructuraPracticaPDF() — las secciones tipo Vamp
(Solo/Coro) se armaban con duracion=null a propósito (la versión
vieja de pdf-estructura.js no la necesitaba). Desde pdf-estructura.js
v1.46 el contador global de compases (#N, título "· N comp.", "se
repite xN", resumen "c.#X-c.#Y" — varios agregados hoy) SÍ necesita
duracion también en los Vamp; al llegar null, el contador se apagaba
apenas pasaba la 1ra sección Vamp y todo lo de después quedaba sin
numerar. Ahora se calcula igual para todos los tipos (misma fórmula
de siempre, por tiempo real). No se tocó nada más de esta hoja.

### v3.102
FIX — las imágenes ocultas #hdrDiffuser/#hdrLogo (v3.101) se
hacían visibles y gigantes al final de la página: header-config.js
resetea su `style.display` a '' (no 'none') cada vez que
LOGO_SIN_LOGO/HEADER_SIN_FONDO están en false (su default), pisando
el display:none inline con el que se agregaron. Se sumó una regla
CSS `#hdrDiffuser,#hdrLogo{display:none!important}` al final del
body (mismo fix que guia-practica.html v1.40) — queda oculta pase lo
que pase, sin afectar en nada a pdf-estructura.js. No se tocó nada
más de esta hoja; el header ampliado de pdf-estructura.js v1.10
(28mm, franja de color + diffuser + logo + subtítulo) ya aplica acá
también porque comparte ese archivo, sin cambios propios de
musico.html para eso.

### v3.101
(a pedido) se conecta al header-config.js compartido — nuevo
<script src="header-config.js"> (antes de pdf-estructura.js), los 2
<img> ocultos #hdrLogo/#hdrDiffuser al final del body (mismo patrón
que logistica.html) y llamada a inicializarHeaderConfig() en un
DOMContentLoaded propio. Así el PDF de estructura (generado por
pdf-estructura.js v1.9) lee la misma config de logo/header que ya se
configura una sola vez en header-config.html. No toca ninguna otra
función ni flujo de esta página.

### v3.100
(a pedido, "que los dos PDF se vean iguales") exportarEstructuraPracticaPDF
ya no dibuja el PDF acá adentro (dibujarCajas/dibujarCajaBreak propios,
que estaban desincronizados de guia-practica.html: sin letra de
ensayo, sin barra de repetición dibujada, sin ícono de coda) — ahora
arma los datos (bpm/compás/clave + cada sección con su duración y
color ya resueltos, con el MISMO cálculo de duración que ya usaba
este archivo vía secPerBar/hastaSegundos-o-próxima-sección, sin
tocarlo) y se los pasa a generarEstructuraPDF() (pdf-estructura.js,
nuevo <script src>), compartida con guia-practica.html. El PDF de
músico ahora sale con el mismo nivel de detalle que el del staff:
letra de ensayo, D.C./variación/coda con ícono, Break/Corte, barra de
repetición dibujada y corchete de 2da casilla. Cero cambios en
colorDeSeccionEnLista ni en cómo actualizarCifradoPractica/el resto de
la pantalla en vivo leen las secciones.
v3.99

### v3.99
(a pedido) portea a este PDF (exportarEstructuraPracticaPDF)
la sección "Break/Corte" que guia-practica.html ya tenía desde su
v1.29.11 y que acá todavía no existía (se habían desincronizado).
Se identifica igual que en staff — por nombre exacto "Break/Corte",
sigue siendo tipo 'fija-bloque' como Verso/Coro — y usa una caja
especial (dibujarCajaBreak + dibujarIconoAcentoBreak, código
idéntico al de guia-practica.html) en vez de la grilla de
dibujarCajas: una única caja ancha con el/los acorde(s) grandes y
centrados, sin números de compás, y debajo "BREAK" + ícono de
acento + la nota de tiempo si el staff cargó una
(s.notaTiempoCorte). Mismos datos de entrada
(acordesPorCompas/letraPorCompas) que ya carga el staff — no se
agregó ningún campo nuevo. dibujarCajas y el resto del PDF
(repeticiones, D.C./variación, vamp) quedan intactos: solo cambia
qué función de dibujo se usa cuando el nombre de la sección es
"Break/Corte". Nota aparte: sigue pendiente si querés que el mapa
visual (mapaSeccionesHtml) también distinga Break/Corte, y la
letra de ensayo automática (letraEnsayoSugerida) — ninguna de las
dos se tocó, no fueron parte de este pedido puntual.

### v3.98
(a pedido) dos ajustes al mapa de estructura:
1) se quita del render la fila de chips redondos
(seccionesChipsHtml) debajo del mapa — quedaba duplicando la misma
info que ya muestra el mapa de arriba. La función queda definida
en el archivo por si se quiere retomar, solo se sacó su llamada en
el return de renderPractica.
2) mapaSeccionesHtml: el ancho de cada bloque ahora es proporcional
a TIEMPOS reales (compases × pulsos/compás), no a compases crudos
— mismo criterio que guia-practica.html (LINEA_TIEMPOS) — así una
sección pesa lo mismo visualmente sin importar el compás del tema.
Factor elegido para que en 4/4 el ancho quede idéntico al de antes.
Cero cambios en colorDeSeccionEnLista, duracionCompasesSeccion,
irASeccionPractica ni en cómo se cargan las secciones desde
Firestore.

### v3.97
(a pedido, "el metrónomo en móvil no es constante") el audio
del click/clave/metrónomo libre ya no se dispara desde rAF (podía
retrasarse o saltar frames en móvil) — ahora un scheduler propio
(setInterval de 25ms) agenda los próximos beeps ~100ms adelante
usando el reloj de Web Audio (audioCtxPractica.currentTime), que
corre en el hilo de audio con precisión de hardware. Lo visual
(dots, números, flash de clave) sigue en rAF sin cambios — solo se
separó "cuándo suena" de "cuándo se pinta". Ver
schedulerTickGlobalPractica() y el nuevo parámetro `when` de
beepPractica(). No se tocó ningún cálculo de compás/offset/acento.

### v3.96
(a pedido) dos ajustes:
1) Chips/bloques de sección vuelven al estilo "outline" (borde +
   texto con el color de la sección, fondo neutro en reposo,
   relleno completo + glow SOLO al estar activa) — mismo criterio
   que .practica-version-chip. Revierte el relleno permanente que
   v3.93/v3.94 le habían puesto a ambas filas (chip chico y
   bloque grande), a pedido explícito después de verlo en uso.
   El bloque grande además pasa a border-radius 8px en las 4
   esquinas de cada uno (antes solo el primero/último de la tira
   tenían esquinas redondeadas, el resto era recto) para que se
   lea como serie de píldoras separadas, no como barra continua.
   Los agregados de v3.94 (duración en el chip chico, badge de
   variación como elemento propio, contraste automático de texto
   vía --sec-text, chip activo un poco más grande) se mantienen,
   adaptados al nuevo fondo neutro.
2) Mensaje "Siguiente sección": antes texto chico gris apagado,
   con la distancia solo en minutos:segundos. Ahora más visible
   (dorado, negrita, más grande) y con los COMPASES como dato
   principal, minutos entre paréntesis como secundario — para el
   músico, la referencia real es "en cuántos compases", no en
   segundos. Mismo secPerBar/finSec que ya calculaba el resto de
   actualizarContadorPractica(), sin cambios en el cálculo.

### v3.95
(a pedido) tres ajustes:
1) Feedback de carga al cambiar de versión de maqueta (con
   bajo/sin bajo): conectarMaquetaEnPractica() (rama tipo 'audio')
   nunca mostraba "Cargando audio…" mientras se descarga/decodifica
   la nueva pista — a diferencia de onArchivoLocalElegido()
   (archivo del dispositivo), que sí lo hacía. Mismo elemento
   (playercargando), pero sin deshabilitar el botón de play: acá
   el <audio> nativo ya es reproducible de una (streaming
   progresivo), bloquear el botón habría contradicho eso.
2) Seek del playerbar (playerseek) — se revisó bien antes de
   tocarlo (ver charla): NO es redundante con el waveform, es la
   red de seguridad para cuando el waveform no llega a cargar
   (decode de Web Audio puede fallar por formato/red/memoria, y
   el código ya caía a "audio nativo de siempre" en ese caso).
   Ahora queda oculto por defecto (nueva
   mostrarSeekFallbackPractica()) y solo se muestra automático,
   con un aviso corto, si el waveform efectivamente no cargó —
   se llama en los 3 puntos relevantes: éxito
   (prepararWaveformDesdeBuffer), fallo (los 2 catch de decode,
   local y remoto) y reseteo al cambiar de archivo/versión.
3) "Repetir sección actual"/"Marcar loop aquí" más compactos SOLO
   en mobile (@media max-width:640px, mismo breakpoint que ya
   usaba el archivo): 2 por fila en grid en vez de apilados a lo
   ancho, más chicos y con wrap de texto a 2 líneas si hace
   falta. En escritorio quedan exactamente como estaban (de lado
   a lado, ocupando todo el div) — no se tocó nada ahí. El
   bloque de metrónomo (Metro/Clave/Vol/Ajustes) no se achicó,
   por ser de uso constante mientras se toca (tamaño táctil).

### v3.94
(a pedido) mejoras de percepción en chips/bloques de
sección (chip chico y bloque grande comparten los mismos cambios,
mismo criterio visual en los dos):
1) Contraste automático de texto: nueva colorTextoContraste()
   (luminancia relativa WCAG simplificada) — con colores claros de
   la paleta (dorado, verde claro) el texto ahora sale casi negro
   en vez de blanco fijo, que perdía legibilidad. Se pasa como
   --sec-text inline junto a --sec-color.
2) Duración en compases ("X c.") también en el chip chico — antes
   solo la tenía el bloque grande. seccionesChipsHtml() ahora
   recibe bpm/compasesPorBarra (antes no los necesitaba) para
   calcularla, mismo cálculo que ya usaba mapaSeccionesHtml.
3) Badge de variación (🔁) como elemento propio
   (.practica-chip-variacion), no como prefijo de texto plano que
   se perdía entre el nombre — flotante en la esquina del bloque
   grande (hay espacio, son 2 líneas), inline con fondo circular
   sutil en el chip chico (1 línea, sin espacio para flotar).
4) Chip activo sube levemente de tamaño de fuente (0.8rem→0.86rem)
   además del glow que ya tenía — ayuda a ubicarla por visión
   periférica sin mirar directo mientras se toca.
5) Una sola fila con scroll horizontal: ya estaba así desde antes
   en ambos contenedores (overflow-x:auto, sin wrap) — no hizo
   falta tocar nada.

### v3.93
(a pedido) reorganización del flujo visual completo de la
tarjeta de práctica, sin tocar ninguna función de cálculo/audio —
solo reordenar bloques de HTML ya existentes + 3 agregados chicos:
1) Nombre de canción: temaData.nombre nunca se pintaba en ningún
   lado (solo vivía interno, para el nombre de archivo del PDF).
   Ahora encabeza el bloque (.practica-titulo-cancion), arriba del
   instrumento (nuevo .practica-titulo-instrumento, mismo estilo
   que el .practica-titulo viejo, que se deja intacto por si algo
   más lo usa).
2) Versiones (con bajo/sin bajo): sin cambios de posición, ya
   estaba arriba del resto.
3) BPM·compás·clave (badge): sin cambios de posición, ya era lo
   primero dentro de controlesPracticaHtml.
4) Chips de estructura: mapaSeccionesHtml + seccionesChipsHtml se
   adelantan, ahora van justo después del badge (antes estaban
   más abajo, después de progreso/playerbar). Además,
   .practica-seccion-chip ahora usa el MISMO fx que
   .practica-mapa-bloque (relleno con --sec-color, opacity
   0.72→1 + glow al activarse) en vez del estilo "outline" que
   tenía — mismo criterio visual en chips chicos y bloques
   grandes.
5) Waveform/reproductor: progreso, playerbar, selector de archivo
   local, toolbar de zoom/autoscroll, canvas, "Repetir sección
   actual", "Marcar loop aquí" y los presets de loop rápido
   quedan agrupados acá. Se suman x1 y x2 comp. a los presets
   (antes [4,8,16,32,64], ahora [1,2,4,8,16,32,64]) — misma
   función loopRapidoCompasesPractica(), genérica para cualquier
   n, no necesitó cambios.
6) Contador: practica-metro (compás grande + beat + botones de
   metro/clave/vol/ajustes) sin cambios internos, solo de
   posición.
7) Pulso/clave: volumenRapidoHtml + label + pulsoClaveUnificadoHtml
   + panelAjustesHtml + fila de metrónomo libre/preconteo, sin
   cambios internos.
8) Letras: cifrado + letra completa (v3.92), sin cambios.
9) PDF: el botón "Exportar PDF" se separa de la fila de loops
   (donde vivía mezclado) a su propia fila al final
   (.practica-pdf-row, nueva), después de letras.
"Configuración" (calibración fina de offset/tempo/velocidad)
queda al final igual que antes — no estaba pedida en el reorden.

### v3.92
(a pedido) "Letra completa" — nuevo botón/panel colapsable
separado del cifrado técnico ("📄 Letra completa", mismo patrón
que "🎼 Ver letra"), para cuando el músico necesita referenciar la
letra corrida (campo "contenido", solo en secciones vamp) en vez
de la grilla compás a compás. Nuevas funciones
toggleLetraCompletaPractica()/actualizarLetraCompletaPractica(),
esta última llamada junto a actualizarCifradoPractica() en los
mismos 2 puntos (sección activa / sin sección). Colapsado por
defecto y oculto si la sección no tiene contenido cargado — no
compite con el resto de la pantalla en vivo cuando no se usa.
.practica-cifrado-panel suma white-space:pre-wrap para que el
texto corrido salte de línea bien (no afecta el panel de cifrado,
que ya maneja sus líneas por div).

### v3.91
(a pedido) FIX — el PDF propio de esta página
(exportarEstructuraPracticaPDF) nunca tuvo la etiqueta "(D.C.)"/
"(D.C. — variación)" que guia-practica.html sí tiene en el suyo
desde v1.24/v1.26 — acá solo se compartía el color
(colorDeSeccionEnLista), pero el nombre se imprimía pelado. Se
agrega el mismo bloque etiquetaDC, idéntico al de
guia-practica.html, justo donde se dibuja doc.text(s.nombre...).

### v3.90
(a pedido) FIX de encoding — mismo bug que
guia-practica.html v1.29: exportarEstructuraPracticaPDF() tenía
'Se repite...' con un emoji (🔁) y un símbolo musical Unicode (𝄇)
dentro de doc.text(), que la fuente helvetica de jsPDF no soporta
(solo Latin-1/WinAnsi) — salían como basura en el PDF. Se sacaron
los símbolos, queda texto plano. El resto de usos de 🔁 en el
archivo (chips, botones, panel de letra) son HTML normal, no PDF —
esos sí soportan UTF-8 y no se tocaron.

### v3.89
(a pedido) mismo cambio de guia-practica.html v1.28 —
exportarEstructuraPracticaPDF() ya no descarga directo, abre el
PDF con doc.output('bloburl') en pestaña nueva (visor nativo del
navegador); si el pop-up se bloquea, cae a doc.save() como antes.
Mismo dibujo/cálculo de siempre, sin cambios ahí.

### v3.88
(a pedido) refleja el flag esVariacion/notaVariacion de
guia-practica.html v1.26 en tres puntos de lectura (musico.html
solo lee practicaSecciones de Firebase, no genera el flag): (1)
chip de sección — antepone "🔁 " al nombre si esVariacion; (2)
bloque del mapa (mapaSeccionesHtml) — mismo prefijo; (3) panel de
letra/cifrado (actualizarCifradoPractica) — nueva línea de aviso
arriba del cifrado ("🔁 Variación: {notaVariacion}") cuando la
sección activa es una variación. Nueva clase CSS
.practica-cifrado-nota-variacion. No se tocó metrónomo, waveform,
loop, ni ningún otro panel/cálculo — cambio acotado a mostrar un
dato que ya llegaba de Firebase sin usarse.

### v3.87
(a pedido) FIX — el comentario de colorDeSeccionEnLista (ver
v3.87 anterior, más abajo) decía que el color compartido de una
sección dependiente (origenId) ya aplicaba a chips/mapa/waveform/
PDF/panel de letra, pero en realidad solo estaba conectado en los
chips; los otros 5 puntos seguían llamando a colorSeccionPorIndice
directo. Se completa la propagación: mapaSeccionesHtml (mapa),
exportarEstructuraPracticaPDF (PDF), actualizarCifradoPractica
(panel de letra — se le agrega el parámetro listaSecciones),
barra de progreso y etiqueta de sección activa, y el dibujo de
ticks del waveform, ahora resuelven el color con
colorDeSeccionEnLista(lista, i) igual que los chips. Mismo criterio
en los 6 puntos: si la sección no tiene origenId (o el origen no
está en esa lista), el color sigue siendo el de siempre por
posición — no cambia nada para secciones que no son dependientes.

### v3.86
(a pedido) lee la repetición con 1ra/2da vez que carga el
staff (guia-practica.html v1.22/v1.23) — el panel de letra/acordes
(actualizarCifradoPractica) y el PDF (exportarEstructuraPracticaPDF)
ahora traducen "compás j de la sección" → qué pasada es y, en la
última pasada, si cae dentro de los finalDistintoN compases finales,
leen acordesFinal2/letraFinal2 en vez de la pasada base. El PDF
dibuja una sola pasada de cajas + nota de repetición + fila aparte
de "2ª vez", igual que el de guia-practica.html. repeticiones=1
(default) no cambia nada de lo que ya funcionaba.

### v3.85.1
FIX — v3.84 había roto el arranque de reproducción al
elegir sección: barInicio/compasesSeccion quedaban declarados
dentro de un bloque {} que el panel de letra (v3.84) leía desde
afuera, tirando ReferenceError en cada frame con sección activa y
cortando actualizarContadorPractica() antes del loop automático y
el seguimiento del waveform. Se corrigió el scope, sin tocar
ningún cálculo de compás/waveform/loop (ver comentario en el
bloque `if(actual && elFill)`).

### v3.85
(a pedido) dos agregados, en espejo con guia-practica.html
v1.21 —
1) Mapa completo del tema (mapaSeccionesHtml, id mapatema-uid):
   tira horizontal con scroll (mismo patrón mobile-first que los
   chips de sección) con un bloque de color por sección, ancho
   proporcional a su duración en compases. El bloque de la sección
   que está sonando se resalta (clase .activo + scrollIntoView),
   actualizado junto con el chip existente en
   actualizarContadorPractica() — mismo criterio, mismo momento.
2) Botón "📄 Exportar PDF" (exportarEstructuraPracticaPDF) junto a
   "Repetir sección actual" — mismo formato real/latin book (cajas
   de compás) que ya arma guia-practica.html, leyendo los mismos
   datos ya cargados por el staff (acordesPorCompas/letraPorCompas,
   acordesCiclo/letraCiclo) desde `est` en vez de inputs de panel.
   jsPDF por CDN, 100% en el navegador.

### v3.84.1
(a pedido) v3.84 había inventado un campo nuevo
(sec.cifrado) para la letra/acordes — pero guia-practica.html YA
tenía acordesPorCompas/acordesCiclo por sección (edición existente,
sin usar en musico.html hasta ahora). Se descarta el campo nuevo:
el panel de letra ahora lee acordesPorCompas+letraPorCompas
(secciones fijas) o acordesCiclo+letraCiclo (vamp, cíclico —
letraCiclo es campo nuevo agregado en guia-practica.html v1.19,
hermano de acordesCiclo con el mismo índice), sin numeración de
compás propia: el índice de línea activa sale de barIndex - el
"Compás inicio" que ya calcula la etiqueta de sección (v3.82), o
cíclico (% cicloCompases) si la sección es vamp. Es solo lectura
acá — la edición vive en guia-practica.html.

### v3.84
(a pedido, Fase 3) la card de sección ahora puede mostrar
letra/acordes de la sección activa, en modo lectura y sincronizado
con el compás actual. Botón toggle "🎼 Ver letra" debajo del bloque
de metro/sección (colapsado por defecto, no empuja el contador ni
el waveform); al abrirse muestra la lista de líneas por compás, y
la línea activa se resalta con el mismo color de la sección
(colorSeccionPorIndice), igual que chip/barra/etiqueta. Sincronizado
desde actualizarContadorPractica() reusando el mismo barIndex ya
calculado ahí; el rearmado completo de las líneas (innerHTML) solo
corre al cambiar de sección, no en cada frame — solo se togglea la
clase .activa de la línea al cambiar de compás. No se tocó nada del
cálculo de audio/compás/clave.

### v3.83
(a pedido) fondo de la card de sección con tinte sutil del
color de la sección activa (color-mix 10% --sec-color sobre
--surf-light, mismo patrón que ya usa .practica-acento-btn.beat1),
además de emojis en botones Metro (📏) y Clave (🌶), y ajustes
mobile-first (fila de metro con flex-wrap, card a ancho completo,
textos menos diminutos en pantallas chicas).

### v3.82
(a pedido) debajo del rango en minutos de la etiqueta de
sección se agregó el rango de compás inicio-fin ("Compás X-Y"),
con la misma fórmula del barIndex del contador grande (offset+
offsetLocalDelta, secPerBar) aplicada a inicioSec/finSec. Además
la etiqueta pasó a ser una card (fondo + borde izquierdo) con el
color de la sección activa (colorSeccionPorIndice, --sec-color),
mismo color que ya usan el chip y la barra de progreso.

### v3.80
(a pedido) la etiqueta de sección (nombre + rango, v3.78)
se movió de debajo del waveform a junto al contador de compás —
ahora vive dentro de .practica-compas-wrap, debajo del número
grande. Mismo elemento (id seccion-uid) y misma lógica de
actualización de actualizarContadorPractica() (sin tocar); solo
cambió su ubicación en el HTML.

### v3.79
(a pedido) "el chip de sección enciende cuando estoy fuera
del rango de reproducción de esa sección" — la detección de
"sección actual" solo miraba cuándo EMPEZABA cada una
(desdeSegundos), nunca su propio final. Si una sección terminaba
(hastaSegundos manual) antes de que arrancara la siguiente,
quedaba un hueco donde el chip y la etiqueta de sección (v3.78)
seguían encendidos de más. Ahora se chequea el límite real de la
sección detectada (hastaSegundos si existe, si no el inicio de la
siguiente) — mismo criterio que ya usaba el loop automático de
sección. La última sección sin fin manual y sin siguiente sigue
sin límite real (se queda encendida hasta que termine el audio,
como ya era antes).

### v3.78
(a pedido) "relacionemos las etiquetas del waveform con el
contador" — ya existía un elemento (id seccion-uid, debajo del
waveform) que guardaba el nombre de la sección activa, pero se
quedaba siempre oculto (display:none nunca se sacaba) y no tenía
rango de tiempo. Ahora se muestra y arma un mensaje del tipo
"Sección: Estribillo · 1:24–2:10", usando el mismo inicioSec/
finSec que ya calculaba la barra de progreso — nada de cálculo
nuevo, solo se reutiliza y se hace visible. Se oculta de nuevo si
no hay sección activa (antes del inicio de la primera).

### v3.77
(a pedido) dos ajustes —
1) Botones del frente con ícono/emoji + texto: "Metro" junto al
   SVG del metrónomo, "Clave" junto al 🪘 — antes solo tenían el
   símbolo, ahora se distinguen de un vistazo. Nuevo modificador
   CSS .practica-click-btn-etiqueta, aparte del .practica-click-btn
   base (que siguen usando Vol/≡/🥁 sin cambios).
2) Etiqueta del tipo de clave en la sección de Pulso: antes decía
   solo "Pulso · Clave", sin especificar cuál (son/rumba/bossa,
   2-3/3-2). Ahora muestra "Pulso · Clave (Rumba 2-3)" (ejemplo),
   y se actualiza en vivo si la clave cambia desde el select de
   Ajustes (antes el texto solo se fijaba una vez al cargar).

### v3.76
(a pedido, solo visual — el sonido ya estaba bien) el
último golpe del grupo de 3 en la clave (ej. rumba, "y" de 4)
aparecía dibujado pegado al punto del 4to tiempo en vez de a
mitad de camino, cuando ese lado de 3 es el SEGUNDO compás del
ciclo de 2 — porque sincronizarNotasClavePulso() no tenía un
punto "siguiente" real hacia el cual interpolar al llegar al
último punto de la tira, y colapsaba sobre ese último punto.
Ahora extrapola con el mismo espaciado que ya hay entre los dos
últimos puntos reales. No se tocó nada del cálculo de audio
(construirOnsetsClave, beeps) — el desfase era puramente visual.

### v3.75
(a pedido) sonido independiente para la clave — antes
compartía la misma variable (sonidoClick) y los mismos chips que
el pulso del metrónomo; cambiar uno cambiaba el otro. Ahora hay
una segunda variable (sonidoClave) y una segunda fila de chips
"Sonido de la clave" en Ajustes (solo visible si hay clave
configurada), con su propia función (elegirSonidoClavePractica),
su propio guardado/carga en localStorage, y su propio reset. El
beep de la clave (bloque de ~línea 2980) ahora usa sonidoClave en
vez de sonidoClick. El pulso normal del click no se tocó — sigue
usando sonidoClick como siempre.

### v3.74
(a pedido) "funcionan los dos, solo el metro, pero no solo
la clave" — el sonido de la clave dependía de clickActivo (el
metrónomo) además de claveActiva (botón 🪘), así que no podía
sonar sola. Se quitó esa dependencia: ahora solo depende de
claveActiva. El reloj que dispara los golpes de clave corre en
actualizarContadorPractica(), que ya se ejecuta con el
metrónomo apagado o prendido (tanto en pista como en metrónomo
libre), así que la clave suena en cualquiera de los tres modos:
sola, con el metrónomo, o los dos apagados (silencio, esperado).

### v3.73
(a pedido) "cuando activo la clave se desactiva el click" —
no era un bug nuevo de v3.72, ya estaba antes: en cuanto había una
clave configurada, el pulso normal del click se apagaba del todo
(se asumía que los golpes de la clave lo reemplazaban), y como la
clave tiene silencios propios, se sentía como click apagado.
Ahora el pulso normal SIEMPRE suena con clickActivo prendido, y
si claveActiva también está prendida (botón 🪘 del frente) los
golpes de clave se superponen — control 100% desde los botones
del frente (▯/🪘), no desde la selección de clave en Ajustes.
Ver bloque `if(est.clickActivo){...}` en el loop de reproducción.

### v3.72
(a pedido) íconos en los botones de encender metrónomo y
clave —
1) Botón de metrónomo (clickbtn): antes mostraba texto plano
   ▮/▯, que se ve distinto según la fuente de cada dispositivo.
   Ahora usa un ícono SVG inline (ICONO_METRONOMO_SVG, definido
   junto a SONIDOS_CLICK) que hereda color vía currentColor —
   se ve igual en todos lados, y respeta el mismo tamaño/estilo
   de .practica-click-btn de siempre.
2) Botón de clave (clavebtn): seguía usando 🪘 (sin cambios en
   el emoji), pero el estado apagado dependía solo de opacidad
   0.4, poco visible en pantallas chicas o con poca luz. Ahora
   se apoya únicamente en la clase .activo (fondo/borde/color
   dorado), el mismo tratamiento que ya usan clickbtn y
   metrobtn — más notorio y consistente con el resto de la UI.
3) Confirmado (sin cambios de código): metrónomo y clave YA
   podían sonar simultáneos — el sonido de la clave solo se
   dispara si clickActivo Y claveActiva están ambos prendidos
   (ver ~est.clickActivo && est.claveActiva !== false en el
   loop de reproducción), así que prendiendo ambos botones se
   puede verificar la sincronía en vivo.

### v3.71
tres pedidos —
1) "la clave se ve adelantada": el sonido sigue instantáneo, pero
   el flash VISUAL del golpe de clave ahora se retrasa 25ms
   (DELAY_VISUAL_CLAVE_MS, fácil de ajustar) antes de encenderse.
   Es un ajuste perceptual, no un fix de cálculo — si se sigue
   sintiendo desfasado hay que subir/bajar ese número.
2) Nuevo sonido "Clave orgánica" (🪘) en el selector de sonidos —
   no es oscilador de tono puro como los otros 3, sino ruido
   blanco filtrado en banda (bandpass) + envolvente percusiva
   corta (~45ms), más parecido al golpe seco de una clave real.
   Ver rama 'noise' en beepPractica().
3) Botón nuevo junto al de click (🪘 clavebtn) para silenciar SOLO
   el sonido de la clave sin tocar el click general — independiente
   (claveActiva, default true, persistido). El flash visual de la
   × sigue funcionando aunque esté mudo, para no perder el
   seguimiento visual del patrón. Solo visible si hay clave activa.

### v3.70
los ticks secundarios de 8 compases (v3.58) nunca tuvieron
destello al cruzarlos — solo los de 16 lo tenían. Se agregó el
mismo criterio (detección de cruce + brillo dorado claro +
sombra), con su propio flag independiente
(waveformFlashTickSec/Hasta) para no interferir con el flash de
los de 16. No se tocó la jerarquía visual en reposo (línea fina,
alpha 0.4/0.6) ni el criterio de "saltar" los múltiplos de 16.

### v3.69
cambio de estrategia — se abandona el posicionamiento del
marcador de clave por fórmula CSS (calc/%), que en v3.66-v3.68
fue frágil: cada intento de fórmula dejaba afuera alguna variable
de layout (padding, gap, borde, tamaño distinto del punto fuerte)
y seguía viéndose desalineado. Ahora la tira solo guarda la
fracción del golpe en data-frac; una función nueva,
sincronizarNotasClavePulso(uid), mide con getBoundingClientRect()
dónde cayó REALMENTE cada punto ya renderizado, y ubica el
marcador ahí (o interpolado, si el golpe cae entre dos puntos,
ej. beatOffset 1.5) usando left en px + translateX(-50%) para
centrarlo. Se llama tras el render de la lista de sesiones y tras
reemplazar la tira al cambiar de clave, y se re-sincroniza en
resize (el ancho disponible cambia). No depende de ningún valor
de padding/gap fijo, así que sobrevive a futuros cambios de
layout sin recalcular fórmulas.

### v3.68
fix de precisión — el calc() de v3.66 descontaba el
padding lateral (12px) del .pcu-strip pero no los gaps de 3px
entre celdas flex, que consumen espacio real no considerado por
el cálculo lineal. Esto generaba un corrimiento acumulativo
(peor cuanto más a la derecha el punto — con 8 pulsos, hasta
~2-3px de diferencia), que es lo que se veía como "desalineado"
en el círculo aunque la forma en sí ya era simétrica. Corrección
derivada matemáticamente: restar 9px en vez de 12px (equivale a
sumar frac*3px, compensando el gap acumulado). No se tocó nada
más — mismo criterio de alineación (borde izquierdo) y misma
forma (círculo) de v3.67.

### v3.67
(a pedido) el marcador de golpe de clave pasa de triángulo
a círculo chico — se probaron × (texto, descartada por glifo no
centrado ópticamente según fuente) y tick vertical, pero se optó
por círculo: misma familia de forma que los puntos de pulso de
arriba (coherencia visual) y simetría total en ambos ejes (cero
riesgo de desalineación por "dirección" visual, a diferencia del
triángulo/×). Solo cambia el dibujo CSS de .pcu-x/.pcu-x.activo;
el left:calc() de v3.66 y el criterio de alineación (borde
izquierdo, sin centrar, igual que los puntos) no se tocan.

### v3.66
fix de sincronía — el left:% del triángulo de clave se
calculaba sobre el padding-box completo de .pcu-strip, pero los
puntos (celdas flex) viven en el content-box (sin los 6px de
padding lateral). Dos cajas de referencia distintas = desfase
que además variaba según el ancho de pantalla. Ahora usa
calc(6px + frac * (100% - 12px)) para mapear sobre el mismo
content-box que los puntos. Solo se tocó pulsoClaveUnificadoHtml
(la función activa); claveFigurasHtml (legacy, sin usar) queda
igual, con el mismo bug, por si se reactiva y se decide ahí.

### v3.65
(a pedido) todo (puntos + triángulos) pasa de estar
centrado dentro de su celda a alineado a la IZQUIERDA — el
usuario notó que el último tiempo se sentía visualmente más corto
estando centrado (queda menos margen libre después del último
punto que antes del primero). .pcu-cell cambia justify-content
de center a flex-start; leftPct del triángulo pierde el +0.5 que
tenía (v3.63) y .pcu-x pierde el translateX(-50%) — mismo
criterio de alineación en ambos, apoyados en el mismo borde
izquierdo de su tiempo.

### v3.64
(a pedido) la × de clave (texto) se reemplazó por un
triángulo dibujado en CSS puro (border trick, apunta hacia
arriba, sin glifo de fuente) — el glifo "×" no queda ópticamente
centrado en su caja de texto en la mayoría de las fuentes, lo que
hacía que se viera desalineado aunque el % de posición (fix
v3.63) ya estuviera bien; el triángulo es simétrico por
construcción, así que queda centrado exacto. Mismo id
(clavenota-uid-barIdx-posIdx) y misma lógica de encendido, solo
cambió cómo se dibuja.

### v3.63
(a pedido) fix — las × de clave quedaban corridas media
celda a la izquierda respecto a los puntos (el % de posición no
sumaba el medio-tiempo que los puntos sí tienen por estar
centrados en su celda vía flex); se agregó +0.5 al numerador de
leftPct en pulsoClaveUnificadoHtml() para que la × quede alineada
con el centro real de su tiempo, igual que el punto.

### v3.62
(a pedido) fix de la tira unificada (v3.61) — los puntos
bajan a resolución de NEGRAS (uno por tiempo, antes uno por
corchea, quedaba muy apretado) y las × de clave se separaron
visualmente de los puntos: ahora viven en su propia franja abajo
de la tira, posicionadas por porcentaje real (no por celda), así
ya no se pegan/tapan con los puntos grandes de tiempo fuerte. Las
× reutilizan el mismo id que ya usaba el sistema viejo de clave
(clavenota-uid-barIdx-posIdx), así el bloque de detección de
golpe de clave que ya existía en actualizarContadorPractica() las
enciende solo — se sacó el manejo de × que se había agregado en
v3.61 porque ya no hacía falta.

### v3.61
(a pedido, "nivel 3 ultra plus") tira única que fusiona
Pulso + Compás 1/2 + las 2 pistas de clave en un solo widget con
resolución de corcheas — un punto por corchea (grande/dorado en
tiempo fuerte), con la × de clave superpuesta en la misma celda
que le corresponde, y el fondo de la tira se tiñe al pasar al
compás 2 del ciclo de clave (reemplaza el texto "Compás 1/2").
Los widgets/funciones viejos (dotsPracticaHtml, claveFigurasHtml,
ids dot-/clavetick0-/clavenota-/clavebar-) NO se borraron — solo
dejaron de imprimirse en el HTML, así que sus updates en
actualizarContadorPractica() siguen corriendo pero como no-ops
seguros (ya estaban todos protegidos con if(el)). La tira nueva
se actualiza con su propio bloque en esa misma función, sin tocar
ningún cálculo de tiempo/offset/clave existente.

### v3.60
(a pedido) tras v3.59, la línea vertical de los ticks de 8
compases seguía perdiéndose contra las barras del waveform
(colorFaint muy tenue) — ahora usa dorado tenue (colorGold +
globalAlpha 0.4) en vez de colorFaint, mismo criterio que ya se
usó para el número. No se tocó el número (ya ajustado en v3.59)
ni el tick principal de 16.

### v3.59
(a pedido) contraste de las etiquetas de 8 compases del
waveform — el número (antes gris tenue, sin caja, encima de las
barras) ahora sube a la misma franja/altura que los números
dorados de 16 compases, con caja de fondo, en dorado tenue
(mismo --gold con opacidad reducida). La línea vertical de estos
ticks se dejó igual (fina/tenue) — no se tocó lógica de cálculo,
offsets ni el tick principal de 16.

### v3.58
(a pedido) cuatro ajustes de UI en el bloque de práctica,
ninguno toca el motor de audio/waveform/metrónomo salvo lo
puntual que se detalla:
- chips de versión ("Con bajo"/"Sin bajo") ahora viven dentro de
  una bandeja propia (fondo+borde), para distinguirse de un
  vistazo de los chips de sección — no cambia el color individual
  por chip que ya traían (v3.57).
- se subió un poco el tamaño de los textos que se leen seguido
  durante la práctica (tiempo del player, texto de progreso,
  botón "Vol", badge de "ajustado"); los puramente decorativos
  (créditos, rol-tag, labels de ajustes) se dejaron igual a
  propósito, para no perder jerarquía general.
- nueva regla de compases secundaria cada 8 (antes solo había una
  fija cada 16): línea fina/tenue y número chico, sin el destello
  dorado de "encendido" de la principal — se salta sola donde
  coincide con la de 16 para no duplicar línea. Mismo
  offset/grilla que ya usa la de 16, así que siempre coinciden.
- playerbar: botón ⏮ (vuelve al segundo 0 vía el mismo est.seek()
  de siempre) y slider de volumen REAL de la pista (separado del
  botón de silenciar, que sigue igual). Se agregó .volume al
  motor de Web Audio (antes solo tenía mute on/off) para que el
  slider funcione igual sea cual sea el motor conectado; y
  conectarMotorLocalPractica ahora traspasa volumen/mute al
  motor nuevo cada vez que se reconecta por dentro (cambio de
  velocidad, paso a loop exacto, cambio de versión), para que no
  se resetee solo a 100% sin avisar.

### v3.57
(a pedido, junto con guia-practica.html v1.16) los chips de
versión de maqueta usan el color opcional asignado en
guia-practica.html (maqueta.color) como borde/fondo cuando existe,
en vez del dorado genérico. Sin color asignado no cambia nada.
Solo se tocó el render de chipsVersiones y su CSS — nada del
motor de práctica/waveform/metrónomo.

### v3.56
(a pedido) un instrumento puede tener varias maquetas (ej.
"Con bajo" / "Sin bajo", ver guia-practica.html v1.13, campo
"Etiqueta") — se muestran como chips arriba del reproductor
(nueva obtenerMaquetasParaSesion, que junta TODAS las que
matcheen el instrumento en vez de solo la primera). Al tocar un
chip (cambiarVersionMaquetaPractica) se reconecta la fuente
manteniendo el mismo segundo donde estabas, para comparar el
mismo pasaje con y sin el instrumento — simplificación consciente:
el cambio de versión pausa la reproducción, no la retoma sola (evitaba
tener que detectar "estaba sonando" de forma genérica entre motores
bien distintos, Web Audio vs YouTube). La conexión real de
audio/YouTube se extrajo a una función aparte
(conectarMaquetaEnPractica) para no duplicar esa lógica entre la
carga inicial y el cambio de versión. Con una sola maqueta por
instrumento (como siempre hasta ahora), no aparecen chips y todo
se comporta exactamente igual que antes.

### v3.55
(a pedido) el nombre mostrado arriba del título ya no
depende de maqueta.nombreArchivo (campo guardado aparte, se podía
desincronizar si se editaba la URL a mano) — ahora se extrae en
vivo del public_id de la URL de Cloudinary (nueva función
nombrePublicIdDesdeUrl), que ahora sí coincide con el nombre real
del archivo porque el preset se configuró para usarlo como
public_id. Se actualiza solo con cualquier URL. Las maquetas
subidas ANTES de ese cambio de preset van a seguir mostrando el
código aleatorio de siempre hasta que se vuelvan a subir.

### v3.54
(a pedido) "🔁 Repetir sección actual" y "↻ Marcar loop
aquí" ahora viven en el MISMO div que "Loop rápido"
(.practica-loop-row), con el mismo tamaño de botón — se
distinguen con un borde de color propio (verde) en "Repetir
sección", que se pone dorado como antes cuando el loop de sección
está activo. Toda la sección "Acciones de práctica" (esos
botones + "Usar canción del dispositivo") se movió de lugar: ahora
queda justo debajo del waveform, antes del bloque de Pulso/
Metrónomo (antes iba después). No se tocó Configuración,
calibración, clave, volumen, chips de sección ni el waveform en sí.

### v3.53
(a pedido) el nombre del archivo (maqueta remota o canción
local del dispositivo) ahora también se muestra arriba, pegado al
título del bloque de práctica (nuevo span
.practica-archivo-nombre-top / archivonombretop-${uid}) — antes la
maqueta remota usaba por error el mismo span de "canción del
dispositivo" de más abajo, mezclando los dos casos visualmente. El
archivo local ahora se ve en los DOS lugares (arriba y junto al
botón, como antes); la maqueta remota se ve solo arriba. No se
tocó el resto del editor (ajustes, calibración, loop, chips,
waveform, metrónomo) — todo queda visible igual que siempre.

### v3.52
(a pedido) waveform + nombre original de archivo también
para la maqueta remota (Cloudinary, tipo "audio") — antes ambos
eran exclusivos del archivo local del músico. Se reusa el mismo
audioBuffer que ya se decodificaba para el loop exacto (sin
descargar/decodificar dos veces) y se llama a la misma
prepararWaveformDesdeBuffer() que usa el archivo local. El nombre
sale de maqueta.nombreArchivo (nuevo campo, ver guia-practica.html
v1.10) — si una maqueta vieja no lo tiene, el span queda vacío
como antes, sin romper nada. No se tocó el motor de reproducción,
el loop, YouTube ni el resto de la lógica.

### v3.51
(a pedido) el waveform ahora resalta con una franja de
fondo la SECCIÓN seleccionada (chip activo) — color dorado, para
distinguirla de la franja verde del loop de sección cuando ambas
coinciden. Usa la misma grilla snapeada que ya usan los ticks y
las líneas de sección (v3.49), así el borde de la franja siempre
coincide exacto con la línea.

### v3.50
(a pedido) al tocar el chip de una sección, el salto ahora
suma offsetLocalDelta al segundo guardado antes de hacer seek.
guia-practica.html calcula ese segundo solo con el offset OFICIAL
(Firebase); no conoce la calibración local (offsetLocalDelta, panel
dorado, por archivo/dispositivo). Sin esto, con un offsetLocalDelta
distinto de 0, el salto caía corrido respecto al resto de la app
(metrónomo/click/contador, que sí restan offset+offsetLocalDelta) y
el compás mostrado no coincidía con el configurado en Secciones. No
se tocó el offset oficial ni el cálculo del click/contador en
reproducción normal — ambos seguían bien, según confirmado.

### v3.49
(a pedido) fix — el loop de sección (🔁 Repetir sección
actual) no cerraba exacto en el compás configurado ("muela" al
reiniciar el ciclo), Y la línea/etiqueta de la sección en el
waveform tampoco coincidía visualmente con el tick de compás.
Causa real (encontrada después de dos intentos a medias — ver
historial completo en CHANGELOG o pedir detalle si hace falta):
la línea visual se dibuja en dibujarWaveform (infoSecciones) desde
sec.desdeSegundos CRUDO, un bloque de código separado del loop
nativo (est.loopInicio) — corregir uno no afectaba al otro, por
eso los primeros intentos no se veían reflejados en pantalla.
Fix final: tanto la línea del waveform como el loop nativo ahora
snapean desdeSegundos/hastaSegundos con el MISMO criterio que ya
usan los ticks de compás (bpmEfectivo||bpm + offset+offsetLocalDelta,
vía snapACompasPractica) — así el audio (lo que se escucha) y el
dibujo (lo que se ve) quedan siempre coherentes entre sí y con la
grilla, sin importar el offset calibrado en cada momento. El FIN
manual (hastaSegundos) del loop nativo se deja sin snapear a
propósito — es una decisión explícita cargada desde
guia-practica.html, no un borde de grilla.
v3.48 (fix): quedó una llave de más ("}") sobrante en
prepararWaveformLocal tras la limpieza de la función anterior —
rompía el script entero (SyntaxError global, nada de lo de abajo
corría). Corregido, sin cambios de lógica.

### v3.48
(a pedido) dos ajustes:
- persistencia del pre-conteo (activo + 1/2 compases): se guarda en
  localStorage como preferencia GENERAL del navegador (no por tema),
  igual criterio que "recuérdame" pero sin atarlo a un archivo — al
  recargar cualquier tema, queda como se dejó la última vez.
- loop musicalmente exacto: el loop manual (↻) y el de sección
  (🔁 Repetir sección actual) para archivo local y maqueta Cloudinary
  ahora usan Web Audio API (AudioBufferSourceNode con loopStart/
  loopEnd nativos, sample-accurate) en vez de "vigilar cuadro a
  cuadro y saltar con currentTime =" — eso último es lo que causaba
  el salto de audio al cerrar la vuelta (el seek de <audio> en
  archivos locales cae casi siempre un poco antes de lo pedido, ver
  v3.42). Mientras decodifica el audio completo (necesario para loop
  nativo) se ve "Cargando audio…" y el ▶ queda deshabilitado; si el
  navegador no puede decodificar el archivo, cae automático al
  <audio> nativo de siempre (nunca se queda sin poder reproducir).
  YouTube no cambia (fuera de este alcance, como ya estaba).

### v3.47
fix real del reporte "coro 1 arranca en 16 en vez de 17":
el margen de tolerancia de v3.42 (pensado solo para absorber la
imprecisión del seek al tocar un chip en archivo local) se estaba
aplicando SIEMPRE, incluso durante reproducción normal en curso —
eso hacía que cualquier sección encendiera 0.25s antes de su
límite real. No tenía relación con el pre-conteo (v3.44-46), pero
se volvió más notorio porque ahora se arranca más seguido desde
antes del principio. Ahora el margen solo se activa por 800ms
justo después de un salto manual de sección (tocar un chip), que
es el único caso que lo necesitaba; la reproducción normal vuelve
a comparar con el límite exacto.

### v3.46
(a pedido) controles nativos del audio (local y original)
reemplazados por un playerbar propio (▶/⏸, tiempo, barra de
búsqueda, silenciar) — esto es lo que resuelve de raíz el "blip"
de audio de v3.45: como ahora el único disparador de play() es
nuestro botón, el pre-conteo corre COMPLETO antes de llamar
est.play(), nunca después. Los <audio> quedan solo como fuente de
datos (sin controles visibles, display:none). Sigue sin aplicar a
maquetas de YouTube (fuera de este alcance).

### v3.45
(a pedido) tres ajustes sobre el pre-conteo (v3.44):
- sonido diferenciado: el pre-conteo suena con pitch más agudo
  (x1.5) que el click normal, para distinguirlo claramente.
- se extendió también a la pista/maqueta (audio local y original):
  al darle play, si el pre-conteo está activo se pausa de
  inmediato, corre el conteo, y recién ahí arranca el audio de
  verdad. Limitación real: al usar los controles nativos del
  <audio>, no hay forma de interceptar el play ANTES de que
  arranque, así que puede sonar un instante brevísimo antes de la
  pausa — no aplica todavía a maquetas de YouTube.
- el botón de activar/desactivar pre-conteo pasó de un checkbox
  escondido en ≡ a un botón cuadrado bien visible al lado de
  "▶ Metrónomo" (mismo estilo que los demás botones cuadrados). El
  selector de 1 o 2 compases se mantiene dentro de ≡.

### v3.44
(a pedido) pre-conteo opcional antes de que arranque el
metrónomo libre (▶ Metrónomo): 1 o 2 compases a elección, con
toggle para activarlo/desactivarlo (activado por defecto). Durante
el pre-conteo solo suenan los beeps con el patrón de acentos ya
configurado; el contador/dots real arranca recién cuando termina,
igual que antes. Por ahora solo aplica al metrónomo libre (no a la
maqueta/canción), como quedamos.

### v3.43
(a pedido) revisión de flujo/jerarquía del panel de práctica:
- reproductor + chips de sección + waveform ahora aparecen antes
  que el bloque de metrónomo/pulso/clave, así se llega más rápido
  a lo que se usa para practicar por secciones sin scrollear tanto.
- se ocultó el texto suelto "sección actual" (quedaba duplicado
  con el chip resaltado, y podía desincronizarse visualmente); el
  chip activo pasa a ser la única referencia visual de qué sección
  está sonando. El elemento sigue en el DOM (oculto) por si algo
  del JS lo referencia.
- el chip de BPM/compás/tono dejó de usar el estilo dorado (que
  se reserva para controles realmente activos, ej. metrónomo
  encendido, chip de sección sonando) — ahora es un chip de info
  neutro, para no competir visualmente con esos.
- dentro de "Configuración", se separó con un rótulo el ajuste
  rápido ±20ms (para usar mientras suena) de la calibración
  inicial de una sola vez (detectar comienzo / tempo exacto).
- el nombre del archivo local cargado ahora se ve más grande y
  con más contraste, en vez de texto chico casi invisible.

### v3.42
(a pedido) con archivo local del dispositivo, tocar un chip
de sección a veces encendía la sección ANTERIOR en vez de la
tocada (inconsistente). Causa: el seek en archivos locales no
siempre cae exacto en el segundo pedido — el navegador ajusta al
fotograma más cercano, casi siempre un poco antes — y el evento
"seeked" recalculaba la sección activa con ese tiempo real,
quedando justo debajo del límite de la sección tocada. Se agregó
un margen de 0.25s a la detección de sección activa para absorber
esa imprecisión.

### v3.41
(a pedido) dos ajustes:
- los chips de sección quedaban pegados al reproductor de audio
  (sin espacio entre ambos) — se agregó margin-top a la fila de
  chips para que respiren.
- al tocar un chip de sección estando en PAUSA, el audio saltaba
  al punto correcto pero nada refrescaba la UI (el chip no
  encendía, la barra de progreso y el waveform no se movían) hasta
  darle play. Ahora irASeccionPractica fuerza ese refresco al
  instante, esté sonando o no.

### v3.40
(a pedido) fix del parpadeo/inestabilidad de los chips de
sección: actualizarContadorPractica corría en cada frame y
quitaba/ponía la clase "activo" del chip aunque la sección activa
no hubiera cambiado, reiniciando la transición (glow/escala) todo
el tiempo y por eso nunca se veía asentada. Ahora solo se tocan
las clases cuando la sección activa realmente cambia.

### v3.39
(a pedido) dos ajustes a los chips de sección de arriba:
- se movieron de la parte superior del panel (junto al badge) a
  justo antes de la barra de zoom del waveform — quedan pegados
  físicamente a la sección que resaltan, en vez de estar a varios
  bloques de distancia (metrónomo, semáforo, clave, progreso).
- el chip de la sección que está sonando no se notaba bien: se
  ponía dorado plano, igual que un botón de selección estática
  (sin brillo ni movimiento) y perdía su color propio justo al
  activarse. Ahora "enciende" con SU color (el mismo que ya usa
  en el waveform) — fondo sólido, glow y una leve escala, mismo
  criterio que ya usan los puntos del pulso (beat-dot.activo).

### v3.38
(a pedido) más calidad en el waveform sin agregar peso —
NUM_PICOS pasa de 140 a 1000. El costo real (decodificar el
archivo) ya se paga sí o sí para tener la duración; extraer más
picos de esos mismos datos solo agrega unos KB de memoria (un
array de floats), nada de peso de descarga. Esto se nota sobre
todo con el zoom de v3.37: antes, al acercarse, las barras se
veían anchas y cuadradas (pocos picos estirados); ahora se ve
detalle real. De paso, el gap entre barras pasa de fijo (2px) a
proporcional al espacio disponible por pico — con 1000 picos en
pantallas angostas sin zoom, un gap fijo de 2px podía ser más
ancho que el espacio real por barra y las dejaba con ancho
negativo (invisibles). Ahora nunca pasa eso, y a zoom alto el gap
vuelve a acercarse a los 2px de siempre.

### v3.37
(a pedido) zoom horizontal del waveform, estilo DAW (se
desliza con scroll horizontal, no una "ventana" que reemplaza la
vista). Arriba del waveform hay una barra nueva con botones +/-
(zoom de 1x a 8x) y un checkbox "Seguir reproducción" (autoscroll,
tildado por defecto). El wrap (.practica-waveform-wrap) ahora
tiene overflow-x:auto; el canvas se dibuja más ancho que la
pantalla cuando hay zoom > 1x (mismo sistema devicePixelRatio de
v3.36, solo que el "ancho de pantalla" para calcular la
resolución pasa a ser el del wrap × el nivel de zoom). El
autoscroll corrige el scroll del wrap SOLO cuando el playhead se
acerca al borde visible, y se pausa 1.5s si el músico scrollea a
mano (para no pelearse con su gesto). El click/tap para saltar de
punto (seekWaveformClick) no necesitó cambios: sigue funcionando
igual porque usa el ancho real del canvas en pantalla, zoomeado o
no. Nada de la lógica de audio/metrónomo/carriles/colores de
versiones anteriores se tocó.

### v3.36
(a pedido) fix de resolución del waveform en mobile — antes
el canvas dibujaba en una resolución interna fija (700px de
ancho) y el CSS lo achicaba/agrandaba al ancho real de pantalla
(width:100%), pero el alto se fijaba en píxeles exactos. En
celulares angostos eso comprimía el dibujo de forma no uniforme
(más en ancho que en alto) y las etiquetas/texto se veían
estiradas. Ahora se mide el ancho real en pantalla
(canvas.clientWidth) y se usa como sistema de coordenadas, sumado
a devicePixelRatio para que el texto salga nítido en pantallas de
alta densidad. Se agrega un listener de resize/rotación que
redibuja los waveforms visibles cuando cambia el tamaño de
ventana. La lógica de carriles/colores de v3.34-v3.35 no cambió,
solo el sistema de coordenadas sobre el que dibuja.

### v3.35
(a pedido) la barra de progreso de la sección (debajo del
compás/beat, la que se llena mientras suena) ahora toma el color
de la sección actual en vez del dorado fijo de siempre — mismo
color e índice (colorSeccionPorIndice) que ya usan el chip de
arriba y las líneas/etiquetas del waveform, así las 3 vistas
coinciden. Sin sección activa (antes de la primera), vuelve al
dorado por defecto del CSS.

### v3.34
(a pedido) las etiquetas de sección del waveform ya NO
pisan la forma de onda. Antes se metían en 2 carriles fijos
pegados al fondo del mismo canvas de las barras. Ahora hay una
zona propia debajo de las barras, y esa zona crece en tantos
"carriles" (filas) como hagan falta (hasta 6) según cuántas
secciones queden muy juntas en el tiempo — con secciones
espaciadas (el caso normal) se ve una sola fila, igual que
siempre. La línea vertical de cada sección ahora cruza toda la
altura (barras + zona de etiquetas) para que quede clarísimo a
qué línea corresponde cada nombre, aunque esté varios carriles
más abajo. Letra de las etiquetas un poco más grande (13/14px,
antes 11/12px). El canvas ajusta su alto dinámicamente según la
cantidad de carriles usados; el wrap (.practica-waveform-wrap)
no se tocó.

### v3.33
(a pedido) colores por sección para diferenciarlas mejor —
antes todas (líneas, etiquetas y chips de acceso rápido) se veían
del mismo verde. Ahora cada sección tiene su color fijo según su
posición en la lista ordenada por tiempo (paleta de 8 colores,
cíclica si hay más secciones que colores), y ese mismo color se
usa tanto en el waveform como en el chip de arriba — así se
identifican de un vistazo en los dos lugares. La franja del loop
manual/rápido y el estado "activo" (gold) de los chips no
cambian.

### v3.32
(a pedido) fix — con secciones cortas, la línea punteada de
fin manual quedaba tapando el texto de la etiqueta (se leía
"coro : 2" en vez de "coro 2", y "PUENTE" se cortaba). Ahora el
waveform dibuja en 2 pasadas: primero todas las líneas de todas
las secciones, después todas las etiquetas encima — así ninguna
línea puede tapar un texto.

### v3.31
(a pedido) anti-colisión de etiquetas de sección en el
waveform — cuando dos o más quedan muy cerca (ej. Puente a 2
compases de Verso 2) se pisaban y quedaban ilegibles. Ahora se
reparten en 2 carriles (fila pegada abajo / fila justo arriba)
cuando hace falta; con secciones espaciadas se ve exactamente
igual que antes, un solo carril. De paso, letra un poco más
grande (11/12px, antes 10/11px) para que se lea bien en el ancho
de pantalla de un celular.

### v3.30
(a pedido) dos ajustes:
- el waveform ahora marca también el fin manual de sección
  (hastaSegundos, guia-practica.html v1.6/v1.7) con una línea
  verde punteada, además de la línea de inicio que ya existía.
- el selector de loop rápido (v3.29: 4/8/16/32/64 compases) pasa
  de 5 botones largos apilados a una fila de botones cuadrados
  "xN", mismo estilo que los presets de fin de sección en
  guia-practica.html v1.7. El preset activo se resalta en dorado.

### v3.29
(a pedido) 4 ajustes ligados al panel de práctica:
- finSec (barra de progreso, texto "Siguiente en...", loop
  automático de sección) ahora prioriza actual.hastaSegundos
  cuando la sección lo trae definido (guia-practica.html v1.6);
  si no está, sigue igual que antes (inicio de la siguiente
  sección, o +4 compases si es la última).
- loopRapidoCompasesPractica(uid, n): función que faltaba —
  el botón de "4 compases desde acá" no hacía nada. Ahora existe
  y se agregan también los de 8/16/32/64 compases.
- "Repetir sección actual" y los loops rápidos de N compases
  ahora también escriben est.loopInicio/est.loopFin (sin tocar
  est.loopActivo, que es el mecanismo propio del loop manual),
  así el waveform dibuja la franja verde igual que con "Marcar
  loop aquí".
- el loop automático de sección, al saltar de vuelta al inicio,
  fuerza que la barra de progreso vuelva a 0% de forma instantánea
  (se saca la transición de ancho un instante, solo para ese
  salto puntual) en vez de arrastrarse con la animación de 0.15s.

### v3.28
(a pedido) el offset local de "canción del dispositivo" se
recuerda por archivo (nombre+tamaño) en localStorage de este
navegador — al volver a cargar el mismo archivo, se recupera el
ajuste calibrado la vez anterior en vez de arrancar en 0. NO toca
Firebase ni el offset oficial del tema (sigue siendo un ajuste
solo local, por diseño — ver comentario en offsetLocalDelta).

### v3.27
(a pedido)
- reorden del panel de práctica en 3 zonas claras (separadas con
  borde superior + label): "En vivo" (compás/beat/pulso/
  metrónomo/progreso/waveform/audio — arriba, sin mover nada de
  lugar dentro de esa zona), "Acciones de práctica" (repetir
  sección/marcar loop/usar canción del dispositivo) y
  "Configuración" (todo el panel de calibración, que ya estaba
  colapsado por defecto). Antes estas tres cosas se intercalaban.
- fx de "encendido" en el waveform: al cruzar un tick de compás o
  el inicio de una sección durante la reproducción normal (no en
  saltos/seek), ese tick/sección brilla un instante (~280ms —
  glow + color más claro + texto más grande) y vuelve a su
  estado normal. Se detecta comparando el tiempo del frame
  anterior contra el actual (est.waveformTiempoPrevio).

### v3.26
(a pedido) contador de beat chico al lado del número
grande de compás (ej. "16 · 2") — mobile-first: inline, no ocupa
fila propia, y no repite el total de pulsos (eso ya lo muestran
los puntitos de "Pulso" debajo). Usa beatEnBarra, que ya se
calculaba cada frame para los puntitos pero no se mostraba como
texto — no se tocó esa lógica, solo se agregó el render.

### v3.25
(a pedido)
- ticks del waveform: escala fija cada 16 compases siempre (antes
  era dinámica según duración/tempo, ver intervaloCompasesWaveform,
  que se deja de llamar pero no se borra).
- se dibujan las secciones cargadas de la sesión (est.secciones)
  directamente sobre el waveform: línea verde + nombre abajo del
  canvas, para no pisar los números de compás (arriba, dorado).

### v3.24
(a pedido) fix — el conteo de compás de los ticks del
waveform no coincidía con el contador grande. Dos causas:
- los ticks calculaban secPerBar con est.bpm (nominal) en vez de
  est.bpmEfectivo (el BPM con override, si el músico ajustó
  tempo) — mismo criterio que ya usa actualizarContadorPractica.
- el número del tick arrancaba en "cada" cuando en el instante
  exacto de ese tick el contador ya marca "cada + 1" (off-by-one:
  el contador cuenta el compás que EMPIEZA ahí, no los
  transcurridos). Ahora arranca en cada + 1, igual que el
  contador.

### v3.23
(a pedido) los números de compás del waveform no se veían
— la causa real: el canvas tenía resolución fija 600×72 pero se
mostraba a solo 56px de alto (CSS), así que todo el dibujo
(incluido el texto) se reescalaba hacia abajo y quedaba borroso/
chico, peor aún en tema claro por menor contraste. Cambios:
- canvas agrandado (600×72 → 700×100 interno, 56px → 76px visible)
- fuente del número más grande y en negrita (10px → bold 13px)
- fondo del número ahora usa var(--bg) en vez de negro fijo, así
  tiene contraste correcto en dark Y en light
- la línea del tick arranca debajo del número (y=14), para que no
  se crucen

### v3.22
(a pedido) orden/agrupación del panel de práctica — sin
tocar lógica, solo maquetado:
- "Repetir sección actual" y "Marcar loop aquí" quedan bajo el
  label "Acciones de práctica" (reusa .practica-fila-label, ya
  existente en Pulso/Velocidad — no se creó estilo nuevo).
- "Usar canción del dispositivo" pasa a su propio label "Audio
  local", separándolo de las acciones de práctica en vivo.
- el indicador de sección actual ("—" cuando no hay ninguna
  activa) ahora solo se renderiza si la sesión tiene secciones
  definidas — antes aparecía siempre, como un guion suelto.
- botones de ajuste fino (±20ms): se sacan los emoji ⏪/⏩, que en
  algunos dispositivos rendereaban como banderas en vez de
  flechas — queda el mismo estilo que −5%/+5% de velocidad.

### v3.21
(a pedido) se muestra el nombre del archivo local elegido
(junto al botón "Usar canción del dispositivo"), ya que antes no
había ninguna confirmación visual de qué archivo quedó cargado.

### v3.20
(a pedido) ajustes visuales del waveform local:
- picos normalizados contra el máximo global del archivo (antes
  usaban el valor absoluto crudo, por lo que temas con loudness
  muy parejo se veían con barras casi todas iguales).
- color de progreso propio (lila #a78bd6) en vez de reusar --ok,
  para no afectar el verde del metrónomo/badges en otros lados.
- más espacio arriba y fondo semitransparente detrás de cada
  número de compás, para que no queden tapados por las barras.

### v3.19
(a pedido) waveform del archivo local cargado del
dispositivo — canvas propio (sin librerías externas, Web Audio
API nativa del navegador para extraer los picos de amplitud, una
sola vez al cargar el archivo, nunca por frame). Incluye:
- ticks de compás con intervalo automático (entre ~4 y ~10
  marcas visibles sin importar tempo/duración del tema),
  alineados al mismo offset que ya usa el metrónomo.
- franja verde translúcida sobre el tramo del loop manual, si
  hay uno activo.
- progreso (verde --ok) que avanza leyendo el mismo
  audio.currentTime que ya usa el metrónomo — sin lógica de
  reproducción nueva.
- click/tap en el waveform hace seek, vía el mismo est.seek() que
  ya usan los demás controles.
Si falla la decodificación (formato raro, etc.) el <audio> nativo
de siempre sigue funcionando igual — el waveform es un plus
visual, nunca un requisito.

### v3.18
(a pedido) el <audio controls> nativo se pintaba siempre
con el tema claro por defecto del navegador, sin importar el tema
de Audiolink — le agregué color-scheme atado a data-tema (dark por
defecto, light cuando el usuario tiene el tema claro activo). Una
regla CSS, sin tocar estructura ni lógica.

### v3.17
(a pedido) extendí el acento de color del bloque de Tempo
(v3.16, verde) a los otros dos bloques finos del panel de
calibración — mismo criterio, mismas variables ya existentes:
dorado=offset (comienzo), verde=tempo, ámbar=velocidad. Sin
cambios de estructura ni de lógica, solo color.

### v3.16
(a pedido) revisión de UX del panel de calibración de
archivo local, pensando en el uso en vivo:
- fix: el botón "Fijar" se recortaba en pantallas angostas
  (faltaba flex-shrink:0 en .practica-fino-fila-input button).
- "Ajuste rápido" pasa a ser lo primero visible del panel (antes
  de detección automática), por ser el control que se toca
  mientras suena.
- "Ajustar comienzo" y "Tempo exacto" ahora son <details>
  colapsados por defecto — el músico ve solo ajuste rápido +
  velocidad hasta que necesita calibrar desde cero.
- el bloque de Tempo/BPM tiene acento de color (--ok, verde) para
  diferenciarlo del de offset (dorado) de un vistazo.
- feedback breve "✓ guardado" junto al valor de BPM tras tap/fino/
  fijar exacto — SOLO ahí, porque offset y velocidad no persisten
  en localStorage (viven en memoria de la sesión de reproducción).

### v3.15
fix — al abrir una sesión con bpmOverride guardado de una
calibración anterior, el bloque fino de tempo (bpmlocalval)
quedaba en "— BPM" hasta tocar un botón. Ver CHANGELOG.md para el
detalle y el historial completo (v1.0–v3.14).

### v3.12
4 ajustes (a pedido, revisión general del ecosistema de práctica): (1)
changelog completo (v1.0–v3.11, antes en la cabecera del archivo) migrado
a CHANGELOG.md — la cabecera del HTML ahora solo trae la versión vigente
+ resumen corto, igual que ya hacen proyecto.html/cocina.html. (2)
rendimiento: el número grande de compás y los beat-dots del semáforo se
leen del DOM UNA VEZ al inicializar cada sesión (cacheados en
estadoPractica[uid].el) en vez de con getElementById en cada tick de
requestAnimationFrame (hasta 60 veces/segundo por sesión activa) —
mismo comportamiento visual exacto, menos trabajo por frame cuando hay
varias sesiones con metrónomo sonando a la vez. (3) accesibilidad: el
número grande de compás ahora también crece levemente (transform:scale)
en el golpe fuerte, no solo cambia de color a verde — mismo criterio que
ya usan los beat-dots (fuerte con más scale/glow que el resto), para que
la señal no dependa solo del color en músicos con daltonismo rojo-verde.
(4) limpieza de localStorage: cargarSesiones() ahora borra las claves
audiolink-ajustes-practica-* de sesiones que ya no vienen en la
respuesta de Firestore (sesión borrada o el músico ya no está asignado)
— antes se acumulaban indefinidamente sin ningún límite. No se tocó
nada de la lógica de BPM, clave, acentos, audio ni de los relojes del
metrónomo (libre vs. con pista) — eso queda pendiente como tarea aparte,
a propósito, por el riesgo de tocar timing en el mismo lote de cambios.

### v3.11
(a pedido) el número grande del compás (.practica-compas-grande) ahora se pone
verde (var(--ok), mismo tono que .beat-dot.fuerte.activo del semáforo) en el
instante exacto del primer golpe de cada compás, y vuelve a dorado el resto
del tiempo — mismo criterio de "flash momentáneo" que ya usa el semáforo, no
un resaltado sostenido todo el compás. Sincronizado de raíz: se togglea la
clase .activo en actualizarContadorPractica() usando el mismo beatEnBarra que
ya enciende el beat-dot correspondiente (i === beatEnBarra), en el mismo tick
— no hay cálculo aparte que pueda desfasarse. No se tocó ninguna otra lógica
(BPM, clave, acentos, audio).

### v3.10
(a pedido, tras revisar compras.html) 3 ajustes de consistencia visual, solo
CSS — buscan que el "sistema" (dorado = jerarquía, 44px = táctil, 0.72rem =
label secundario) sea el mismo en musico.html que en compras.html, para
reusarlo tal cual en próximos proyectos. (1) .practica-seccion-chip: 40px →
44px de min-height — era el único control bajo el estándar táctil del resto
del archivo (mismo hueco que se encontró en compras.html con .btn-toggle-
stock). (2) .sesion-card h3 (título de la sesión): color var(--txt) →
var(--gold) — en compras.html el título de card equivalente (.card h3) sí es
dorado; dejar este en texto plano rompía la regla de "dorado = importante" en
toda la app. (3) .practica-fila-label: 0.68rem → 0.72rem, para igualar a
.practica-ajuste-label — ambos cumplen el mismo rol (label chico en mayúscula)
y no había razón para que difirieran en tamaño.

### v3.9
(a pedido) dos ajustes de UI — (1) el botón del tiempo 1 en "Acentos por
tiempo" ahora usa el mismo verde que el semáforo (var(--ok)) en vez del dorado
genérico de "fuerte", para que la jerarquía visual del tiempo 1 sea
consistente entre el semáforo y el panel de ajustes. Si se cicla a "mudo"
sigue mandando el rojo (más importante saber que está silenciado que recordar
que es el tiempo 1). Los botones de acentos de clave no cambian — su "primer
golpe" no tiene relación con el pulso/semáforo. (2) mobile-first en "↻ Marcar
loop aquí" y "♪ Usar canción del dispositivo": antes eran botones angostos sin
altura táctil mínima (uno incluso sin borde, estilo "ghost link" fácil de
pasar por alto); ahora ambos son ancho completo, apilados en columna, con min-
height:44px y el mismo tratamiento visual que el resto de botones secundarios
del panel.

### v3.8
(a pedido) acentos configurables por golpe de clave, no solo el primero —
misma mecánica que ya existía para "Acentos por tiempo"
(toggleAcentoPractica): nueva fila en el panel de ajustes, visible solo con
clave activa, con un botón por cada uno de los 5 golpes fijos del patrón (2+3,
son/rumba/bossa siempre suman 5 — CLAVE_PATRONES). Cada botón cicla normal →
fuerte → mudo, igual que los de tiempo. "Fuerte" reusa el mismo tono agudo +
volFuerte que antes solo aplicaba al primer golpe del ciclo (v2.0/v2.5);
"mudo" apaga ese golpe puntual sin tocar el resto del patrón ni el click de
tiempo normal (que sigue su propio camino, sin clave, más abajo en
actualizarContadorPractica). Por defecto solo el primer golpe queda "fuerte" —
mismo comportamiento que tenía cualquiera que ya usara esto antes de v3.8.
Persiste en localStorage junto con el resto de ajustes
(guardarAjustesPractica/ cargarAjustesGuardados de v3.6), con chequeo de
longitud (5) antes de restaurar, por si en el futuro cambia el número de
golpes.

### v3.7
(a pedido) fix de robustez offline — firebase.initializeApp() y
firebase.auth() se ejecutaban SIN condicional al cargar la página (antes de
cualquier guard offline). Si los <script> de gstatic.com (firebase-*.js) no
llegaban a cargar por falta de red y sin caché previa del navegador,
`firebase` quedaba undefined y esa línea tronaba el <script> completo — el
guard offline (estaModoOfflineActivo(), unas líneas más abajo) nunca llegaba a
correr, y la página quedaba en blanco incluso teniendo datos offline ya
descargados. Ahora ambas llamadas van en try/catch: si fallan, `auth` queda
como un stub mínimo (signOut()/ onAuthStateChanged() no-op) para que
cerrarSesion() y el resto del código sigan sin romperse, y el guard offline de
más abajo corre con normalidad. No cambia nada del flujo cuando Firebase sí
carga bien (online u offline con caché) — mismo comportamiento de siempre.

### v3.6
(a pedido) 4 ajustes — (1) persistencia de ajustes de metrónomo (BPM/clave
override, sonido, acentos, volúmenes, mute) en localStorage por uid
('practica-'+id de sesión) — se guarda en cada función que ya mutaba
estadoPractica[uid] y se restaura en inicializarReproductoresPractica() antes
de recalcularEfectivo. Nunca toca Firestore ni el dato real del tema, solo
sobrevive a un recargo de página en el mismo navegador. (2) 🔇/🔊 → ▯ (click
apagado) / ▮ (click activo), mismo criterio "vacío/lleno" que ya usan los
botones de acento (●/—); ⚙️ → ≡ — quedan al mismo nivel de "inmunidad" al
render-de-emoji que ▶ ↻ ♪ (v2.7). (3) labels "Pulso" y "Clave" arriba de
.practica-semaforo y .practica-clave-figuras respectivamente, para que un
músico nuevo entienda que son dos datos distintos sin que se le explique. (4)
atajo de volumen: botón "Vol" junto a click/⚙️ que abre un mini-panel solo con
los 2 sliders de volumen (mismo handler ajustarVolumenAcentoPractica que ya
existía), sin pasar por el panel completo de ajustes.

### v3.5
(a pedido) los tiempos que no son el 1 ahora encienden en var(--warn) (ámbar,
ya existía en la paleta) en vez de compartir el verde de tiempo 1 — distinción
real de color, no solo intensidad como en v3.4. Se evitó --err (rojo) porque
ya se usa para detener/cancelar en otros botones de la hoja, hubiera sido
confuso reusarlo aquí como "tiempo normal".

### v3.4
(a pedido) 2 ajustes — (1) las × de clave activas ahora tienen el mismo fx de
"bombillo" que los beat-dot: text-shadow doble capa en dorado (halo real
alrededor del glifo, box-shadow no sirve para texto). (2) se restaura la
jerarquía perdida en

### v3.3
al ponerse todas verdes por igual, tiempo 1 y tiempos normales se sentían
iguales al encender — ahora tiempo 1 (.fuerte.activo) tiene glow más intenso
(16px/scale 1.2) y los demás uno más suave (8px/scale 1.1), mismo verde pero
intensidad distinta según el peso real del tiempo.

### v3.3
(a pedido) 3 ajustes — (1) el semáforo (beat-dots) se saca de la fila del
número/botones (🔊/⚙️) y pasa a su propia fila debajo, .practica-semaforo, a
ancho completo — ya no compite visualmente con los bordes dorados de esos
botones. (2) color del punto activo: de dorado a var(--ok) (verde, ya existía
en la paleta para RSVP) — se eligió sobre rojo/amarillo/verde literal para no
meter ruido cromático nuevo, y sobre "más dorado" porque el choque real era
justo ese color compitiendo con los botones de al lado (ya resuelto también
por el cambio de fila). (3) ticks débiles de la clave pasan de línea a punto
pequeño opaco (3px, opacity 0.28) — referencia discreta tipo "fantasma";
medio/fuerte se quedan como línea para mantener la jerarquía.

### v3.2
(a pedido) 3 ajustes — (1) los beat-dot (indicador de compás) pasan a ancho
completo (justify-content:space-between, ya que .practica-compas-wrap es
flex:1 y ocupaba el ancho disponible) con "bombillos" más grandes (16px/20px)
y glow dorado real al encenderse (box-shadow con var(--gold) directo, sin rgba
fijo, para que el color se adapte solo entre tema claro/ oscuro). (2) los
ticks de clave seguían muy tenues — cambiados de var(--muted) a var(--txt)
(máximo contraste posible, adapta solo por tema: casi blanco en oscuro, casi
negro en claro) con opacidad 0.18/0.4/0.7 según jerarquía. (3) revisado
mobile: tanto .practica-dots (space-between+flex) como los ticks/notas de
clave (posicionados en % dentro del track) escalan sin overflow sin necesidad
de reglas nuevas en el media query de 480px — no se tocó ese bloque.

### v3.1
(a pedido) los 8 ticks de v3.0 no se veían — causa raíz: usaban var(--brd),
que en el tema oscuro es casi idéntico al fondo de la pista (--surf-light), se
fundían. Cambiados a var(--muted) con opacidad escalonada
(débil/medio/fuerte), ahora el "apagado" es gris tenue visible, no invisible.
Mismo fix aplicado a los beat-dot del indicador de compás (mismo bug de
contraste con --brd) — de paso se le agrega glow al punto activo (box-shadow
dorado + opacidad 0.35→1 en el resto) para que se sienta como luz de semáforo
encendiéndose, no solo un cambio de color plano.

### v3.0
(a pedido) 2 cosas — (1) ticks del panel de clave (v2.9) a corcheas: 8 ticks
en vez de 4, jerarquía de peso/opacidad (fuerte/medio/débil) sin color nuevo —
el color queda exclusivo para la × activa. (2) jerarquía pendiente de los
botones Metrónomo/Loop/Canción: Metrónomo pasa a .btn (primario, relleno,
ancho completo) con estado .activo mientras suena; Loop se queda .btn-ghost
(secundario); Canción baja a texto plano sin borde/ sombra (terciario). De
paso, mismo criterio que en v2.7: el "⏸️ Detener" del botón Metrónomo (emoji
de color, no reportado antes) pasa a "⏸ Detener" (símbolo tipográfico) — mismo
botón que ya estaba editando, no un archivo/zona aparte.

### v2.9
(a pedido) las × de la clave (v2.8) quedaban sin referencia visual del tiempo
— se agregan ticks de fondo por cada pulso del compás (según compasesPorBarra)
en cada clave-figura-track, con el tiempo 1 (fuerte real) diferenciado (más
grueso/marcado). Solo CSS + claveFigurasHtml(); el encendido en tiempo real no
cambia.

### v2.8
(a pedido) seguimiento visual de la clave — se agregan las "figuras" (× por
golpe real) debajo del indicador de compás 1/2 ya existente. Reutiliza los
patrones CLAVE_PATRONES para dibujar solo los golpes reales (sin silencios ni
ligaduras: no hay data de duración, solo onsets, e inventar rítmica sería
incorrecto). Nueva claveFigurasHtml() arma las × posicionadas por % según su
beatOffset; se reconstruye en actualizarUIAjustesPractica() cada vez que
cambia la clave efectiva. El cálculo de idxLocal/ cicloIndex (ya existía para
el click de audio) ahora corre siempre que hay clave, no solo con clickActivo,
así el seguimiento visual funciona aunque el click esté mudo; el beep de clave
sigue sonando exactamente igual que antes.

### v2.7
(a pedido) los emojis de color (▶️🔁🎵) en Metrónomo/Marcar loop/Usar canción
del dispositivo se veían como iconos con fondo de color en algunos renders
mobile, rompiendo la paleta dorada. Reemplazados por símbolos tipográficos (▶
↻ ♪) que heredan currentColor del tema. Solo esos 3 botones y sus resets de
textContent; el resto del texto/HTML igual.

### v2.6
(a pedido) el rediseño de v2.5 solo cubría el panel de ajustes; se extiende el
mismo lenguaje visual (sombra sutil, :active con scale, hover más marcado,
44px táctil) a las clases base .btn/.btn-ghost/.btn-icon (usadas en toda la
hoja) y a .practica-click-btn (tap-tempo, antes 40px). .rsvp-btn no se tocó,
ya usaba --ok/--err con estados propios.

### v2.5
(a pedido) panel de ajustes — 2 bugs corregidos: el slider

### v2.5
(a pedido) panel de ajustes — 2 bugs corregidos: el slider continuo de BPM
(ajustarBpmSliderPractica) y los 2 sliders de volumen por acento
(ajustarVolumenAcentoPractica) no tenían función asociada, quedaban rotos al
moverlos; ahora actualizan estadoPractica[uid] y actualizarUIAjustesPractica()
los sincroniza de vuelta (antes solo sincronizaba
bpmval/clave/sonido/acentos). restablecerAjustesPractica() ahora también
resetea volFuerte/ volNormal a sus valores por defecto (1 / 0.55). Además
rediseño visual del panel: sliders custom (.practica-slider), iconos por
estado en sonido (🔔🥁🪵) y acentos (● fuerte / — mudo), más jerarquía en
labels/filas, sombras y estados activos, botones a mínimo 44px táctil, y
ajuste específico para mobile <480px.

### v2.4
(a pedido) panel de ajustes de metrónomo — BPM, clave, sonido del click y
acentos por tiempo, editables por el músico desde un panel desplegable (botón
⚙️ junto al de click). TODO en memoria
(estadoPractica[uid].bpmOverride/claveOverride/ sonidoClick/acentos) — nunca
se escribe a Firestore ni afecta el dato real del tema
(temaData.practicaBpm/practicaClave siguen siendo la fuente de verdad para
staff y para otros músicos). recalcularEfectivoPractica() combina
base+override en bpmEfectivo/claveEfectiva/claveOnsetsEfectivo/
claveCicloSecEfectivo, que actualizarContadorPractica() usa para el
contador/dots/turno de clave/click — el loop (marcarLoopPractica) sigue usando
el bpm/clave REAL del tema sin cambios, porque debe coincidir con el audio
real. El badge (♩ BPM · compás · clave) muestra "(ajustado)" mientras haya
algún override activo, y un botón "↺ Restablecer" limpia todo. Acentos por
tiempo (fuerte/normal/mudo, ciclables tocando el número) aplican al click
normal; el click de clave sigue acentuando solo el primer golpe de cada lado,
sin acento personalizable por golpe (pendiente si hace falta). Sonido del
click: 3 timbres (Clásico/ Grave/Woodblock) vía waveform+frecuencia en
beepPractica(), sin tocar su lógica de timing. UI pensada para mobile: sin
sliders (steppers táctiles de BPM), botones/chips con mínimo 40-44px de toque,
panel apilado verticalmente. No se tocó snapACompasPractica(),
construirOnsetsClave(), RSVP, ni el guard de sesión.

### v2.3
(a pedido) el botón "▶️ Metrónomo" de práctica libre (v2.2) deja de depender
de si hay maqueta cargada — ahora vive siempre en controlesPracticaHtml(),
visible en todos los casos, igual que el botón de click. Se excluye mutuamente
con la maqueta/YouTube/ archivo local de la misma sesión: activarlo pausa el
reproductor si estaba sonando (est.pause()); y si luego el músico le da play a
la maqueta, marcarReproduccionActiva() (ahora también llamada desde
toggleMetronomoLibre) apaga el metrónomo libre — se agregó el helper
apagarMetronomoLibreSiActivo() para eso, cubriendo tanto el caso de otra
sesión como el de la misma sesión (mismo uid). Así nunca hay dos relojes
escribiendo el contador/dots/clave al mismo tiempo. bloquePracticaHtml() ya no
bifurca el HTML en dos variantes — un solo controlesPracticaHtml() para todos
los casos, con o sin maqueta. No se tocó snapACompasPractica(),
marcarLoopPractica(), construirOnsetsClave(), RSVP, ni el guard de sesión.

### v2.2
(a pedido) "práctica libre" — metrónomo + clave sin tener que cargar canción.
Si el tema tiene practicaBpm/practicaCompas pero no hay maqueta para el
instrumento de este músico (o directamente ninguna maqueta),
bloquePracticaHtml() igual muestra el bloque, en modo libre: se ocultan
secciones/progreso/loop/ "canción del dispositivo" (dependen de un reproductor
real) y en su lugar aparece un botón "▶️ Metrónomo" (toggleMetronomoLibre) que
arranca/detiene un reloj propio (performance.now()) y lo alimenta directo a
actualizarContadorPractica() — el mismo contador, dots, click y turno de clave
que ya existían, sin duplicar lógica. inicializarReproductoresPractica() arma
el mismo estadoPractica[uid] (bpm/compás/clave) para este caso, pero sin
conectar audio/YouTube. Con maqueta cargada, todo sigue exactamente igual que
en v2.1 — no se tocó snapACompasPractica(), marcarLoopPractica(),
construirOnsetsClave(), RSVP, ni el guard de sesión.

### v2.1
(a pedido) fix de corte de clave en el loop — el snap del loop usaba siempre
bloques de 1 compás, pero la clave es un ciclo de 2 compases; si el punto de
loop no caía en el inicio de un ciclo completo, cada repetición saltaba a
mitad de la célula rítmica y sonaba cortada. Ahora marcarLoopPractica() usa
unidadCompases = 2 (en vez de 1) cuando est.clave está activo, tanto para el
snap de inicio/fin como para el mínimo de duración del loop (minBar) — así el
loop siempre arranca y cierra en el compás 1 del ciclo. Sin clave activa, el
comportamiento queda igual que en v1.7 (snap de 1 compás). No se tocó
snapACompasPractica(), el click de metrónomo, ni el resto del bloque de
práctica.

### v2.0
(a pedido, junto con guia-practica.html v1.4) soporte de clave rítmica
(son/rumba/bossa, 2-3 o 3-2), leída de temaData.practicaClave: 1) Badge de
BPM/compás con más jerarquía (antes era una línea chiquita gris; ahora es un
badge grande arriba del bloque), que además muestra el nombre de la clave si
hay una seleccionada. 2) Cuando hay clave activa, el click de metrónomo (v1.7)
DEJA de sonar por tiempo y suena solo en los golpes exactos de la célula
rítmica (ciclo de 2 compases), usando las posiciones confirmadas: lado de 3
(son/bossa): 1, "y" de 2, 4. Lado de 3 (rumba): 1, "y" de 2, "y" de 4. Lado de
2 (son/rumba): 2, 3. Lado de 2 (bossa): 2, "y" de 3. "2-3"/"3-2" define el
orden de los dos compases del ciclo. Los puntos de compás existentes NO
cambian — siguen marcando el tiempo normal como referencia visual. 3)
Indicador de "turno" del ciclo de clave (compás 1/2 de la célula), resaltado
en tiempo real según en cuál de los dos vas. Bossa/rumba con acentos débiles y
otras variantes quedan pendientes hasta confirmar el patrón exacto. No se tocó
obtenerMaquetaParaSesion(), el loop, las optimizaciones de v1.8, ni el guard
de sesión.

### v1.9
(a pedido) 1) Se quitó el auto-play al elegir canción del dispositivo (v1.8) —
carga lista, el músico le da play cuando quiera con los controles nativos del
<audio>. 2) Línea "BPM: {bpm} · Compás: {compás}" visible arriba del
metrónomo. 3) Accesos rápidos a Secciones — fila de chips con scroll
horizontal (pensada para mobile: sin wrap, altura mínima de toque 40px), uno
por sección cargada, que saltan (seek) directo a ese punto en el reproductor
que esté activo (YouTube/audio original/ archivo local). El chip de la sección
actual se resalta en cada tick de actualizarContadorPractica(), igual que ya
hacía el contador de compás. No se tocó el resto del bloque (metrónomo, click,
progreso, loop, optimizaciones de v1.8), ni obtenerMaquetaParaSesion(), ni el
guard de sesión.

### v1.8
(a pedido) 1) Botón "🎵 Usar canción del dispositivo" en el bloque de práctica
— abre el selector de archivos del teléfono (accept="audio/*"), reproduce el
archivo elegido con URL.createObjectURL() (100% local, sin internet) en un
<audio> oculto dedicado, y reconecta getTiempoActual/seek/pause a ese audio —
el metrónomo/progreso/loop siguen funcionando igual, porque solo dependen de
BPM/compás/offset ya cargados, no de dónde viene el audio. No reemplaza la
maqueta original, es una alternativa que convive con ella. 2) Optimización: se
destruye el YT.Player anterior (player.destroy()) antes de crear uno nuevo en
cada recarga de inicializarReproductoresPractica() (ej. tras un RSVP) — v1.7
creaba uno nuevo sin destruir el viejo, acumulando reproductores fantasma en
memoria. 3) Optimización: se libera (URL.revokeObjectURL) el archivo local
anterior antes de cargar uno nuevo o al recargar la lista de sesiones, por la
misma razón. 4) marcarReproduccionActiva(uid): al arrancar a sonar una maqueta
(audio, YouTube o archivo local), pausa explícitamente la que estuviera
sonando antes — antes dependía solo de que cada tick se cortara solo al
chequear .paused/getPlayerState(), lo cual bloqueaba el contador de la
anterior pero no pausaba el audio en sí si eran dos reproductores distintos
sonando a la vez. No se tocó bloquePracticaHtml() más allá de agregar el
botón/ input/audio nuevos, ni obtenerMaquetaParaSesion(), RSVP,
consentimiento, ni el guard de sesión.

### v1.7
(a pedido) el bloque "🎧 Maqueta de práctica" de v1.6 gana: 1) Puntos de
metrónomo — fila de círculos (uno por tiempo del compás) que se ilumina en
secuencia real, el tiempo 1 marcado distinto. 2) Click de metrónomo — beep
generado con Web Audio API (sin archivo extra), botón 🔊/🔇 para mute (apagado
por defecto). 3) Barra de progreso de la sección actual + "Siguiente: {nombre}
en {tiempo}". 4) Rediseño del bloque: número de compás más grande/centrado,
tipografía mono, layout más compacto tipo metrónomo real. 5) Loop marcado en
vivo: botón "🔁 Marcar loop aquí" — dos clicks mientras suena capturan
inicio/fin reales (no un timestamp pre-cargado, que casi nunca cae exacto),
con snap automático al borde de compás más cercano (usa
BPM+compás+practicaOffset, el mismo campo nuevo de guia-practica.html v1.3)
para que el loop entre/salga limpio en vez de a mitad de un tiempo. Un tercer
click cancela el loop. Todo esto vive en un objeto estadoPractica[uid] por
sesión (bpm, compasesPorBarra, offset, secciones, estado de loop/click,
getTiempoActual()/seek() — abstraen si el reproductor es <audio> o YouTube).
actualizarContadorPractica() se simplificó a (uid, tiempoActual) leyendo ese
estado, en vez de recibir 5 parámetros sueltos. No se tocó
obtenerMaquetaParaSesion(), extraerIdYoutube(), RSVP, consentimiento, ni el
guard de sesión.

### v1.6
(a pedido) guía de práctica — cada tarjeta de sesión ahora puede mostrar un
bloque "🎧 Maqueta de práctica" con la pista de referencia del instrumento
asignado a este músico (cargada desde guia-practica.html, campo
practicaMaquetas del doc de tema) y un contador de compases SINCRONIZADO al
tiempo real de reproducción (currentTime del <audio> o del player de YouTube —
no un click aparte como el preview de staff). Flujo: cargarSesiones() junta
los temaId únicos de las sesiones y trae cada doc de tema una sola vez
(temaCache), vía el mismo `allow get: if true` que ya permitía abrir
sesión/tema puntual sin ser staff — no se tocó firestore.rules.
obtenerMaquetaParaSesion() filtra practicaMaquetas por el instrumento asignado
a ESTE músico en ESTA sesión (miInstrumento, ya existente desde v1.1); si no
hay tema vinculado o no hay maqueta para su instrumento, no se muestra nada
(sin bloques vacíos). Se agrega <script
src="https://www.youtube.com/iframe_api"> en el head. No se tocó RSVP,
consentimiento, ni el guard de sesión/offline existentes — el modo offline
simplemente no tendrá temaCache poblado (sin internet no hay YouTube de todos
modos) y el bloque de práctica no aparece, sin romper el resto de la página.

### v1.5
Grupo C ("fin del mundo") — el guard offline llamaba solo console.info() y
musico.html quedaba inaccesible sin señal (necesita saber quién sos para
filtrar proyectosAsignados, y sin Firebase Auth no había forma). Se agrega
flujo offline: prompt() pide el correo una vez (se guarda en localStorage), y
se busca en equipoInterno/musicosPortal ya descargados (requiere offline-
mock.js v1.0+). Mismo criterio que el flujo online. Modo "vista previa"
(?preview=) no se soporta offline. No se tocó la rama else ni ninguna función
existente.

### v1.4
se agrega el guard "if(estaModoOfflineActivo())" alrededor de
auth.onAuthStateChanged() — mismo patrón que ya usaba index.html desde v2.23.
Sin este cambio, en modo offline (sin señal) el login real nunca confirmaba
sesión y esta página redirigía siempre a login.html, sacando al usuario del
modo offline al navegar a esta página. No se tocó la lógica interna del guard
(qué pasa si hay o no hay usuario), solo se envuelve.

### v1.3
se migra al patrón offline Fase 1 (mismo cambio que index.html v2.21,
proyecto.html v5.34, logistica.html v2.72) — se agrega <script src="offline-
mock.js"> en el <head> (antes de firebase-config.js) y se cambia `const db =
firebase.firestore()` por `const db = crearDB()`. Con AUDIOLINK_MODO_OFFLINE
en false (default), crearDB() devuelve firebase.firestore() real — cero cambio
de comportamiento. No se tocó ninguna otra lógica.

### v1.2
cada sesión gana un botón "✍️ Firmar consentimiento", que abre
consentimiento.html (ya existente, sin tocar) en pestaña nueva con
?p={proyectoId}&s={sesionId}&nombre=&correo=&tarifa= precargados desde la
misma asignación (musicosAsignados) que ya usamos para el instrumento — el
músico no depende de que staff le mande el link por WhatsApp. No se agregó
ninguna verificación de "ya firmé" porque implicaría un permiso de lectura
nuevo en Firestore rules que se decidió no agregar por ahora (firmar dos veces
no rompe nada, cada firma es solo un registro más). No se tocó
consentimiento.html, RSVP, ni el guard de sesión.

### v1.1
se corrige el alcance de "tus sesiones" — v1.0 mostraba TODAS las sesiones del
proyecto (asignación solo por proyecto, calcado de ingenieros). Se descubrió
que logistica.html YA tiene asignación por sesión (`musicosAsignados`, array
con {musicoId, nombre, correo, instrumento, telefono, tarifa, canales} —
sistema completo y preexistente, no hubo que tocar logistica.html en
absoluto). Ahora cargarSesiones() filtra: solo se listan sesiones donde
musicosAsignados contiene una entrada con `correo` igual al del músico
logueado (comparación case-insensitive). El instrumento mostrado en cada card
ahora sale de esa entrada específica (m.instrumento), no de un campo genérico
de sesión inexistente (v1.0 leía `s.instrumentoRequerido`, que nunca existió —
error de diseño antes de revisar el archivo real). Sesiones sin
musicosAsignados (o vacío) NO se muestran — antes esto habría sido un fallback
"mostrar a todos", pero como el campo ya existe y se usa activamente en
logística, no hace falta ese fallback. No se tocó el resto del archivo (RSVP,
vista previa, guard de sesión).

### v1.0
módulo nuevo. Portal del músico, calcado de ingeniero.html en esqueleto (guard
de sesión, modo vista previa, tema, login con ?next=) pero con una diferencia
deliberada de UI: en vez de listado de proyectos → detalle → sesiones (útil
para el ingeniero, que trabaja tema por tema), acá es una LISTA PLANA de "tus
próximas sesiones" ordenadas por fecha — lo único que le importa al músico es
cuándo/dónde toca, no navegar por proyecto. Cada card muestra fecha, hora,
sala, instrumento a llevar, director musical, y un RSVP (confirmar/rechazar
asistencia) que escribe en el campo `rsvp` de la sesión: { [correoMusico]:
'confirmado'|'rechazado' }. Requiere: firestore.rules con esMusicoDe()
(pendiente, próxima pieza) y colección `musicosPortal` (id=correo, activo,
nombre, proyectosAsignados[]) — separada del catálogo administrativo
`musicos.html`, mismo criterio que ingenieros vs equipoInterno (ver
ARQUITECTURA.md). Sin esas piezas, este archivo carga pero no puede leer nada
todavía — es la UI primero, según lo pedido. Historial completo de versiones:
ver CHANGELOG.md -->
## ensayo.html

Nota: el historial completo de versiones anteriores a v3.223 todavía
vive en la cabecera del propio archivo (no migrado a este changelog
todavía, ver nota general del encabezado de este documento).

### v3.224
(a pedido, "qué optimizarías" sobre el visor paginado de v3.223 — se
pidieron todas; portado de musico.html v3.199, mismos 5 puntos) sobre
el bloque "📄 Guía": (1) mobile first — bajo 400px el indicador pasa a
fila propia arriba y los 2 botones quedan 50/50 debajo, solo con ícono
(⬅/➡). (2) precarga silenciosa de la siguiente página del array
guiaPaginas del tema (no necesariamente consecutiva). (3)
loading="eager" en la imagen visible. (4) swipe táctil izq/der sobre
la imagen. (5) flechas ←/→ de teclado + mensaje si Cloudinary no
devuelve la imagen, en vez de ícono roto. Cero cambios en
guardarGuiaPdfEnCategoria, parsearRangoPaginas, Cloudinary, ni el
resto del motor de bpm/clave/compás/audio/offset/secciones.

### v3.231
(a pedido, portado de musico.html v3.206) 1) pulso más rápido
(período 180ms) y blanco (antes lila); intervalo de respiración en
pausa bajado a 40ms. 2) el número de cada tick de compás se difiere y
se redibuja al final, después de las líneas de sección/offset/CUE,
para que nunca quede tapado.

### v3.230
(a pedido, portado de musico.html v3.205) amplitud del pulso subida a
±0.35 (rango 0.15-0.85) + iniciarRespiroWaveform/detenerRespiroWaveform:
loop liviano (setTimeout 100ms) que redibuja el playhead también en
pausa, no solo mientras suena.

### v3.229
(a pedido, portado de musico.html v3.204) revierte la bandera de
v3.228 — línea completa otra vez, pero fina (1px), tenue (alpha
0.35-0.55, sin glow) y con pulso de respiración.

### v3.228
(a pedido, portado de musico.html v3.203) playhead pasa de línea
completa a bandera arriba (14px) + pulso sutil de opacidad
(0.8-1.0) — no compite con las líneas de sección, que siguen
iguales. Cero cambios en el resto de dibujarWaveform.

### v3.227
(a pedido, portado de musico.html v3.202, mismos 4 ajustes de UI del
waveform, mobile first) 1) trazo vertical lila en la posición de
reproducción, encima de todo. 2) a zoom bajo (1x-2x) las etiquetas de
sección muestran solo la letra de ensayo (A/B/C…); nombre completo al
acercar (zoom 3x+). 3) flash breve en el punto de click para saltar.
4) alto de la onda escala con el ancho real (64px-130px) en vez de
90px fijo. Cero cambios en offset/secciones/clave/click ni en el
resto del motor.

### v3.226
(a pedido, portado de musico.html v3.201, mismos 5 puntos — sin tocar
el hint de swipe) 1) recuerda el último índice visto dentro del array
guiaPaginas (localStorage, por uid). 2) evita re-precargar una página
ya precargada en la misma apertura. 3) zoom por doble-tap/doble-clic.
4) indicador "Página X de Y" en verde+bold al llegar a la última,
además del botón apagado. 5) aria-label en botones ⬅/➡ + aria-live en
el indicador. Cero cambios en guardarGuiaPdfEnCategoria,
parsearRangoPaginas, Cloudinary, ni el resto del motor de bpm/clave/
compás/audio/offset/secciones.

### v3.225
(a pedido, portado de musico.html v3.200, mismos 3 puntos)
sobre el bloque "📄 Guía": 1) los botones ⬅/➡ bajo 400px pasan de
flex:1 1 0 (rectángulo estirado) al criterio de .btn-icon (44×44px
cuadrados). 2) emoji ⬅/➡ reemplazados por chevrones SVG en línea
(currentColor, mismo trazo que otros íconos del panel). 3) hint
"← Desliza para cambiar de página →" (.practica-score-hint),
visible solo la primera vez que se abre el panel y que se
autoculta a los 3s o ante la primera interacción. Cero cambios en
guardarGuiaPdfEnCategoria, parsearRangoPaginas, Cloudinary, ni el
resto del motor de bpm/clave/compás/audio/offset/secciones.


### v3.222
(a pedido) 2 cambios independientes, sin tocar cálculo de
bpm/clave/compás/audio/offset/secciones:
1) Guía de PDF por tema: el campo único guiaPagina (un número) se
   reemplaza por guiaPaginas (array), permitiendo lista y/o rango
   en el mismo input de texto (ej. "3, 5-7, 12" -> páginas 3, 5,
   6, 7 y 12). Nueva función parsearRangoPaginas() (Subir tema/
   Editar tema, mismo input, ahora type=text) y
   formatearPaginasParaInput() para precargar el input al editar.
   guiaPdfBloqueHtml() pinta una miniatura + botón "ver PDF
   completo" por cada página del array, en vez de una sola.
   Compatibilidad: temas viejos con guiaPagina (sin guiaPaginas
   todavía) se siguen leyendo bien, tanto al precargar el
   formulario de edición como en la pantalla de práctica
   (fallback a [guiaPagina]) — al guardar una edición, el tema
   pasa a guiaPaginas y el guiaPagina viejo se limpia (null) para
   no dejar los dos conviviendo con datos distintos.
2) Menú ⋮ de la card de tema ("revisión mobile-first, sentía el
   menú obtuso"): el dropdown flotante .tema-card-menu (6 botones
   angostos pegados a la esquina de la card, sin backdrop, se
   podía recortar contra el borde de la pantalla) se reemplaza
   por un bottom sheet (sheetOpcionesTemaOverlay), mismo patrón
   .sheet-overlay/.sheet-box que ya usan Editar tema/Setlists/
   Categorías — full width, backdrop que cierra tocando afuera,
   botones de 48px de alto agrupados (editar nombre/categoría/
   tema arriba, duplicar en medio, restablecer ajustes si aplica,
   borrar separado abajo en rojo). Nueva
   abrirSheetOpcionesTema()/cerrarSheetOpcionesTema(), reemplazan
   a toggleMenuTema(). Ninguna función destino (renombrarTema,
   cambiarCategoriaTema, abrirEditorTema, duplicarTema, borrarTema,
   restablecerAjustesSesionDesdeCard) cambia de firma ni de
   lógica interna — solo cambia desde dónde se llaman. El CSS
   viejo .tema-card-menu queda sin uso (no se borra, por si hace
   falta revertir rápido) — candidato a limpieza en una futura
   revisión de código, igual que seccionesChipsHtml (v3.219).


### v3.221
(a pedido) PDF de guía de estudio, centralizado por
CATEGORÍA (no por tema — un mismo PDF cubre varios ejercicios).
Nuevo, sin tocar nada del motor existente:
1) "Subir tema"/"Editar tema" suman: input de archivo PDF
   (opcional, sube y reemplaza el PDF de TODA la categoría del
   tema) + número de página (por tema, campo guiaPagina en
   GUIAS2). Mismo mecanismo unsigned-XHR-con-progreso que ya usa
   subirAudioACloudinary, nueva función subirPdfACloudinary(),
   preset separado GUIAS2PDF (requiere crearlo en Cloudinary,
   unsigned, resource type Image, con delivery de PDF habilitado
   si la cuenta es free).
2) guardarGuiaPdfEnCategoria(): sube el PDF y guarda
   guiaPdfPublicId + guiaPdfPaginas en el doc CATEGORIAS2
   correspondiente (buscado por nombre, ya existente siempre para
   ese punto del flujo). Si no hay categoría elegida, no sube
   nada y avisa con un toast — el tema igual se guarda.
3) Pantalla de práctica: bloque colapsable "📄 Guía" (mismo
   <details>/CSS que ya usa .practica-offsetlocal, sin CSS
   nuevo). Al abrirlo por primera vez, carga la miniatura de la
   página exacta vía la transformación pg_N de Cloudinary
   (gratis, sin recortar/subir nada aparte) y ofrece un botón
   para abrir el PDF completo en esa página.
Nada de esto toca cálculo de bpm/clave/compás, audio, offset ni
secciones — es un agregado independiente.


### v3.220
(a pedido) bpm/compás/clave/tonalidad "override" de
práctica ahora TAMBIÉN se guardan en Firestore (GUIAS2), mismo
patrón que offset/secciones — antes vivían solo en localStorage,
así que no viajaban a otro dispositivo. Cambios, ambos acotados a
guardarAjustesPractica()/cargarAjustesGuardados() — nada más se
tocó:
1) guardarAjustesPractica(uid, soloLocal): sigue guardando TODO en
   localStorage igual que siempre (incluye un nuevo campo
   ajustadoEn=Date.now()). Además, si el tema abierto es el que
   está guardando (uid === 'practica-'+temaActualId) y no viene
   con soloLocal=true, manda bpmOverride/compasesOverride/
   claveOverride/tonalidadOverride + ajustesEn=Date.now() al doc
   GUIAS2 de ese tema (merge:true) — no toca offset ni secciones,
   que ya se guardan aparte.
2) cargarAjustesGuardados(uid): primero restaura del localStorage
   las preferencias que NUNCA viajan a la nube (sonido, acentos,
   subdivisión, volúmenes, on/off de click y clave — sin cambios).
   Para bpm/compás/clave/tonalidad, compara el timestamp guardado
   en localStorage (ajustadoEn) contra el que trae el tema desde
   Firestore (ajustesEn, ya viene en temaActualDatos al abrir el
   tema): gana el más reciente. Si gana la nube, sincroniza de
   vuelta el localStorage de este dispositivo (guardarAjustesPractica
   con soloLocal=true, para no reescribir Firestore con su propio
   dato).
Nada de esto toca cálculo de bpm efectivo, clave, acentos,
subdivisión ni el resto del motor — solo dónde/cómo se persisten
estos 4 valores.


### v3.219
(a pedido, revisión de jerarquía visual) 4 ajustes, 100%
CSS, ningún id ni función tocada:
1) .practica-compas-grande: 2.8rem → 3.6rem — el número de compás
   es el dato más consultado en vivo, ahora pesa más que la card
   de sección al lado.
2) .loop-presets-row ("Loop rápido") suma fondo/padding (mismo
   var(--surf-light) que las demás cards) — antes quedaba
   flotando solo entre el player y el chip de sección.
3) .practica-mapa-tema (el chip de sección activa arriba del
   waveform, .practica-mapa-bloque.activo) y .practica-waveform-
   toolbar (fila de zoom) acercan su margen — quedan como un
   grupo visual más compacto en vez de tres franjas sueltas.
4) Player: .practica-player-playbtn (▶) pasa a fondo dorado
   sólido, letra más grande — se distingue del resto. Los
   secundarios (.practica-cue-pad: CUE/✕/📍/↻) bajan de borde
   2px a 1px y de fondo 14%→8% de opacidad, quedan más tenues sin
   perder legibilidad.
Nota aparte (no tocado, para la lista de optimización de código):
seccionesChipsHtml() está definida pero no se llama en ningún
lado — código muerto.


### v3.218
(a pedido, revisión de UI) se sacan 2 duplicaciones
visuales detectadas en pantalla:
1) Badge de arriba (badge-${uid}, antes de "Loop rápido") — mismo
   contenido que badge2-${uid}, que desde v3.216 vive bien visible
   dentro de la card del contador. actualizarBadgePractica ya no
   busca "badge-"+uid (ni lo exige para actualizar badge2); el
   div del HTML se sacó.
2) Nombre de archivo + tags ID3 de arriba (archivonombretop-${uid}
   / archivolocaltagstop-${uid}, junto al título/notas) — mismo
   contenido que archivolocalnombre-${uid}/archivolocaltags-${uid}
   de practica-local-row, que desde v3.216 queda justo debajo de
   la card del contador. Se sacaron los 2 spans del HTML; el JS
   que los llenaba (mostrarTagsDetectadosLocal, onArchivoLocalElegido)
   ya tenía guard tolerante a que no existan (elTop/nombreSpanTop
   en null), así que no se tocó esa parte — simplemente dejan de
   encontrar el elemento y no hacen nada, sin romper el resto.
Se conservó "practicaCargandoAudio" (aviso de "Cargando audio de
la nube…") que vivía en la misma línea — no era parte de la
duplicación, cuidado señalado y corregido antes de publicar.


### v3.217
(a pedido, "el loop scrollea solo") FIX — al terminar cada
vuelta del loop, el chequeo de fin de sección (finSecChequeo) pone
actual=null un frame antes de que el loop realmente vuelva al
inicio; ese apagón de un frame borra est.ultimaSeccionChip, así
que al reiniciar el loop la MISMA sección se detectaba como
"recién activada" y disparaba bloqueActual.scrollIntoView(),
scrolleando la pantalla sola en cada vuelta aunque nunca hubo
cambio real de sección. Se saca el scrollIntoView; se deja intacto
todo lo demás (el chip/bloque se sigue resaltando con .activo,
badge y contador sin cambios).


### v3.216
(a pedido) el badge (BPM/compás/clave, badge2-${uid}) y la
fila de reproductor+preconteo (metrobtn/precontbtn, antes
.practica-libre-row suelta más abajo) pasan a vivir DENTRO de la
misma card del contador (.practica-metro), en vez de sueltos más
abajo con panelAjustesHtml en el medio. Se creó .practica-contador-card
como wrapper con el fondo/padding/radio que antes tenía solo
.practica-metro (que ahora los pierde, para no quedar una card
dentro de otra) y se le da separación propia a badge-fila/
libre-row cuando están dentro de este wrapper. Ningún id ni función
cambia — mismos elementos, mismo panelAjustesHtml donde estaba,
solo cambia el contenedor visual de estas 2 filas.


### v3.215
(a pedido) 2 ajustes visuales en el panel de práctica:
1) El bloque "Pulso" (label + pulsoClaveUnificadoHtml) se movió de
   su lugar original (después del contador, junto a "Configuración")
   a justo después del waveform, antes de .practica-metro — ahora
   aparece ARRIBA del contador grande. Puro reordenamiento de HTML:
   ningún id ni función cambia, no se tocó pulsoClaveUnificadoHtml
   ni su lógica de actualización (línea ~4122 la sigue reemplazando
   vía outerHTML con el mismo id).
2) Card de sección actual (#seccion-${uid}) deja de aparecer/
   desaparecer (antes display:none/''): ahora queda siempre visible,
   ocupando el mismo espacio. Se sacó el style="display:none" inicial
   del HTML y, en los 3 lugares donde antes se ocultaba
   (desactivarSeccionResaltada, "sin sección activa en el progreso"
   y "tema sin secciones"), ahora se le pone innerHTML='—' (placeholder
   neutro, sin valores) en vez de ocultarla. El caso en que SÍ hay
   sección activa sigue llenando el mismo innerHTML de siempre, sin
   cambios.


### v3.214
(a pedido, "en mobile el audio se siente atrasado") FIX de
desfase visual/audio en mobile. Diagnóstico confirmado con test
aparte: el click y el audio del tema YA estaban perfectamente
sincronizados entre sí (ambos se agendan con el mismo reloj de
Web Audio, audioCtxPractica.currentTime — ver v3.120/v3.97). El
desfase real era entre el punto visual (rAF, se enciende en el
instante en que el código agenda el sonido) y el audio realmente
audible: en mobile el hardware tarda bastante más en sacar el
sonido por el parlante que en desktop (outputLatency medido con
Opera/Android: 112ms — imperceptible en desktop, muy notorio en
mobile). Se agrega latenciaSalidaAudioPractica() (lee
AudioContext.outputLatency, con fallback a .baseLatency, y 0 si
ninguno existe — no rompe navegadores viejos) y se resta ese valor
al tiempo que el tick() de rAF le pasa a actualizarContadorPractica/
dibujarWaveform, así el punto y el waveform "esperan" lo mismo que
tarda el sonido en llegar al oído. No se tocó el scheduler de
audio (schedulerTickGlobalPractica) ni el motor de reproducción
(crearWebAudioPlayer): click/clave/tema siguen agendándose exacto
igual que antes, solo cambia CUÁNDO se refleja visualmente.


### v3.213
(a pedido) 3 ajustes visuales en el panel de práctica:
1) Puntos de PULSO más grandes: 18px normal / 28px acento (antes
   10px/18px) — más notorios en mobile mientras se toca.
2) Número grande del contador de compás: 2.8rem (antes 2rem).
3) Badges de BPM/Compás/Clave/Tonalidad — antes un solo texto
   plano ("♩ 87.78 BPM · 5/8 · Cm (Bb Eb Ab)"), ahora chips
   separados con jerarquía: BPM protagonista (más grande, acento
   dorado — el dato que más se consulta en vivo), compás/clave/
   tonalidad como chips secundarios más chicos y neutros.
   actualizarBadgePractica() arma los chips; los ids de siempre
   (badge-${uid}/badge2-${uid}) no cambian.


### v3.212
(a pedido) FIX "deseleccionar sección" seguía dejando la
franja DORADA resaltada en el waveform. Causa: esa franja
(dibujarWaveform, idxSeccionActiva) se recalcula cada frame solo
mirando tiempoActual — no sabía nada de la clase .activo del chip
ni del apagado de v3.210/v3.211. Se agrega est.seccionDesactivadaSegundos:
desactivarSeccionResaltada la marca y fuerza un redibujo inmediato;
dibujarWaveform la salta al pintar la franja; se limpia sola en
cuanto el playback realmente entra a otra sección, o al reactivar
manualmente la misma sección (mismo criterio que ya usa el chip).


### v3.211
(a pedido) 2 ajustes en el panel de práctica:
1) FIX "deseleccionar sección" (v3.210) solo apagaba el resaltado
   UNA vez — al reactivar clickeando la misma sección de nuevo, el
   resaltado no volvía a encender porque est.ultimaSeccionChip
   nunca se reseteaba (actualizarContadorPractica pensaba que "no
   cambió de sección"). Ahora onClickBloqueSeccionPractica limpia
   ese valor justo antes de reactivar (irASeccionPractica).
2) Reorden + unificación visual del bloque "Configuración":
   Secciones del tema → Ajustar comienzo → Tempo/Tap → Ajuste
   rápido → Velocidad de reproducción, las 5 como <details>
   colapsadas por defecto, con ícono cuadrado + tooltip en vez de
   texto en el summary (antes "Ajuste rápido" y "Velocidad" no
   colapsaban y quedaban en otro orden). Ningún id/función cambia
   de nombre, solo se reordena/envuelve el marcado existente.


### v3.210
(a pedido) 6 ajustes/fixes:
1) FIX overflow del sheet "Editar tema" — .sheet-box tenía
   max-height:75vh pero nunca overflow-y:auto (solo lo tenía su
   hijo .sheet-lista, que este sheet no usa). El contenido se
   salía por debajo del cuadro en vez de scrollear adentro.
2) Badge 🌶 de clave en la card de la grilla ("Mis temas") — "2-3"/
   "3-2" para los 6 presets (etiquetaClaveBadge), solo el ícono
   para clave personalizada.
3) FIX loop rápido x1/x2 quedaban "pegados" en .activo para
   siempre — limpiarPresetsLoopPractica(uid) tenía [4,8,16,32,64],
   faltaban 1 y 2 en ese array.
4) FIX badge de práctica insistía en denominador "/4" sin importar
   el compás real del tema (ej. mostraba "5/4" en un tema 5/8).
   Causa real: esLocal (est.archivoLocalUrl) es TRUE en TODO
   audio de esta app (hasta el de Cloudinary pasa por
   onArchivoLocalElegido), así que la rama "${efectivo}/4" se
   ejecutaba SIEMPRE con el 4 fijo a fuego, sin mirar el
   denominador real. Ahora usa el denominador real de
   est.compasTexto.
5) "Deseleccionar sección" — click en el bloque/chip YA resaltado
   (en vez de saltar de nuevo al mismo lugar) apaga el resaltado
   verde y el loop de sección, sin mover el audio
   (onClickBloqueSeccionPractica/desactivarSeccionResaltada). No
   hace falta flag ni limpieza extra: mientras el audio siga
   dentro de la misma sección, el resaltado automático no vuelve
   a tocar esas clases (no detecta cambio), así que el apagado se
   mantiene solo hasta que el playback entra a otra sección.
6) Botón cuadrado 🤿 — ajusta el zoom del waveform a la sección
   que está sonando ahora (zoom entero 1×-8×, redondeado hacia
   abajo para que entre completa) y hace scroll a su inicio
   (ajustarZoomASeccionPractica).


### v3.209
FIX de 2 bugs del motor de clave PERSONALIZADA de "Editar
tema" (v3.208), que había quedado a medio copiar del lado "Subir
tema":
1) Faltaban las funciones onCambioEditarTemaClave,
   beatsPorBarraEditarTema, insertarSimboloClaveEditar y
   actualizarClaveLibreEditar (existían solo sus gemelas
   ...Nuevo). El <select> de Editar y abrirEditorTema() ya las
   llamaban, así que el ReferenceError cortaba abrirEditorTema()
   ANTES de la línea que abre el sheet (overlay.classList.add):
   el botón "🛠️ Editar tema" no abría nada. Se agregaron como
   copia fiel del criterio ...Nuevo, apuntando a los ids de este
   formulario.
2) confirmarEditarTema() leía el valor crudo de
   document.getElementById('editarTemaClave').value en vez de
   usar resolverClaveSeleccionada(...) (como sí hace
   confirmarSubidaNuevoTema). Con "Personalizado…" elegido,
   guardaba el literal "personalizado" en tema.clave en vez del
   patrón escrito — el motor de audio lo habría tratado como
   patrón libre sin sentido. Se cambió a
   resolverClaveSeleccionada('editarTemaClave','editarTemaClaveLibre').
No se tocó "Subir tema" (ya estaba bien) ni el motor de audio
(construirOnsetsClave/construirOnsetsDesdePatron, sin cambios).


### v3.207
(a pedido) 3 ajustes de UI en la práctica:
1) El botón ↺ (restaurar zoom) se movió al lado derecho de los
   botones +/− del waveform, separado del grupo de toggles
   (autoscroll/loop de sección) donde vivía antes. Solo HTML, no
   toca zoomWaveform ni resetZoomWaveform.
2) Números de hora (mm:ss) de la regla del waveform, muy chicos
   vs. el número de compás: regla principal sube de 9/10px a
   11/12px, secundaria de 8/9px a 9/10px. Solo tamaño de fuente,
   no se tocó posición, color ni el criterio de "encendido".
3) #main (grilla de temas, formularios, práctica/waveform) gana
   @media(min-width:641px){max-width:1400px} — antes 760px fijo,
   dejaba espacio muerto en escritorio. Mobile no se toca (sus
   breakpoints 480/600/640 siguen igual). .subir-box ya se
   autolimita a 420px, y la grilla/waveform ya estaban preparados
   para más ancho (auto-fill / cálculo real de W).
v3.206


### v3.206
(a pedido) editor completo de un tema ya subido. Nueva
acción "🛠️ Editar tema" en el menú de la card (junto a Renombrar/
Cambiar categoría/Duplicar/Borrar) abre un sheet nuevo
(sheetEditarTemaOverlay) que reusa el mismo formulario de "Subir
nuevo tema" (nombre, BPM, compás con "Otro…" y su validación N/D,
categoría vía el mismo selector de categorías, tonalidad, clave),
precargado con los datos actuales del tema. Al guardar hace un
único set({...}, {merge:true}) sobre GUIAS2/{temaId} con todos los
campos juntos, actualiza el objeto en misTemas y refresca la
grilla — la grilla de "Mis temas" queda igual, sin tocar su
lista/layout. A propósito NO se toca ningún ajuste local de
práctica (bpmOverride/claveOverride/compasesOverride guardados en
estadoPractica o localStorage): el dato maestro del tema se edita
aparte, el músico sigue viendo su override hasta que lo
restablezca manualmente (mismo criterio ya usado por
restablecerAjustesSesionDesdeCard). Funciones nuevas:
abrirEditorTema, cerrarEditorTema, onCambioEditarTemaCompas,
limpiarErrorCompasLibreEditar, validarCompasLibreEditar (validador
propio, duplicado a propósito en vez de reusar validarCompasLibre,
para no tocar la función ya probada del flujo de subida),
confirmarEditarTema. elegirCategoriaDesdeSheet gana un modo
'editar' que solo actualiza el estado local del sheet (no escribe
a Firestore de una, como sí hace el modo 'tema') hasta que se
confirma el editor completo.
v3.204


### v3.204
(a pedido, mobile first) regla de tiempo del waveform —
resolución ADAPTATIVA en vez de fija (cada=16 principal, cada=4
secundaria, siempre). Ahora se elige el `cada` más fino de una
escalera [1,2,4,8,16,32,64,128,256] que todavía deje
MIN_PX_TICK_PRINCIPAL=56px de separación real en pantalla
(pxPorCompas = secPerBar/dur * W, mismo principio que ya usa v3.38
para el gap del waveform — reacciona a zoom y ancho real, no a la
duración total del tema). La secundaria (cadaSec) sigue siendo
1/4 del principal, pero se salta entera si no deja
MIN_PX_TICK_SECUNDARIO=32px. En un tema completo sin zoom en
celular, da el mismo cada=16 de siempre (caso ya validado sin
cambios) — solo se achica con espacio real de sobra (sección
corta, zoom). Resuelve el caso real detectado: sección de 2
compases en 5/4 sin tick propio del compás 2. Pendiente: probar
con captura real en mobile y ajustar los 2 umbrales (56/32) si
hace falta. Aún no replicado en musico.html.


### v3.203
(a pedido) FIX — la línea celeste de "comienzo de canción"
(offsetEfectivo) arrancaba en y=0 y montaba encima del tick de
compás 1 agregado en v3.202 (mismo x). Ahora arranca en y=14,
igual que el resto de los ticks de compás — ya no se superponen.
Replicado también en musico.html (ver su propio changelog).


### v3.202
(a pedido) 3 ajustes de ensayo, a replicar en musico.html
salvo el punto 3:
1) Regla de tiempo del waveform (dibujarWaveform) — el compás 1
   (offsetEfectivo, arranque real del tema) no tenía tick/número/
   hora, porque el bucle de ticks arrancaba recién en
   offsetEfectivo+compasDur. Se agregó el mismo dibujo (tick,
   número "1", mm:ss) para ese punto, mismo estilo/criterio de
   "encendido" que el resto de la regla, sin tocar el bucle
   existente.
2) Velocidad de reproducción del archivo local: pasa de control
   por % a control por BPM objetivo (reemplaza el %, no queda
   alterno). Mismo motor de siempre (cambiarVelocidadLocalPractica,
   clamp 50%-120%) — solo cambia cómo se calcula/exhibe `nueva`:
   velocidad = bpmObjetivo / bpmBase (bpmEfectivo||bpm). Funciones
   nuevas: bpmBaseVelocidadPractica, aplicarVelocidadBpmPractica,
   ajustarVelocidadBpmLocalPractica (±1 BPM),
   aplicarVelocidadBpmInputPractica (campo numérico). Se sacaron
   ajustarVelocidadLocalPractica (±5%) y el label de %.
3) "Ver letra" y "Letra completa" (cifrado/letra corrida) se
   sacaron de ensayo.html — a pedido, este archivo no tiene
   comunicación con el staff (eso es cosa de musico.html), así
   que esas 2 secciones no tenían sentido acá. Se borraron los 2
   botones/paneles y las funciones toggleCifradoPractica,
   toggleLetraCompletaPractica, actualizarLetraCompletaPractica,
   actualizarCifradoPractica, y sus llamadas. OJO: quedaron
   colgados en el CSS los estilos .practica-cifrado-* (inertes,
   sin romper nada, pero pesan) — no se tocaron por ser un cambio
   fuera del pedido puntual; avisar si también se quiere limpiar
   esa parte.


### v3.201
(a pedido) filtros de tono pasa-altos/pasa-bajos, portados
de musico.html tal cual (mismo motor, mismo lenguaje visual).
Confirmado antes de portar: en ensayo TODO el audio (archivo
subido del dispositivo Y el track de Cloudinary) pasa por el
mismo camino (onArchivoLocalElegido), así que no hace falta la
generalización a "maqueta remota" que sí necesitó musico.html —
acá alcanza con un solo punto de conexión.
- obtenerFiltrosPractica(uid): crea highpass->lowpass->destino UNA
  vez por uid (BiquadFilterNode), reusado en cada archivo nuevo.
- crearWebAudioPlayer() ganó conectarSalida(nodo) para poder
  reenrutar su salida (antes iba fijo a destino).
- El <audio> nativo se conecta a Web Audio (createMediaElement-
  Source) una sola vez por elemento y sale por los filtros.
- Panel "Filtros de tono" (acordeón, mismo estilo que musico)
  debajo de la fila del archivo — visible siempre que hay audio
  cargado. Cada archivo/tema nuevo arranca con los filtros en
  neutro (20Hz/20000Hz, apagados en la UI).
- destruirEstadoPractica ahora también desconecta filtroHighpass/
  filtroLowpass (mismo criterio del punto 3 de la revisión de
  código, v3.199).
No se tocó ningún cálculo de tempo/compás/clave ni el resto del
motor de audio.


### v3.200
(a pedido) punto 1 de la revisión de código — alcance
ACOTADO a la grilla de "Mis temas" (la sección más tocada
últimamente, y donde ya había que escapar apóstrofes a mano en
v3.196). Se reemplazan los onclick="...('${t.id}')" inline por
atributos data-accion/data-id/data-nombre normales (el navegador
los escapa solo, se acabó tener que escapar comillas a mano) más
un único listener delegado (manejarClickListaTemas) en
#listaTemas que decide qué función llamar según data-accion.
closest('[data-accion]') siempre agarra el elemento más específico
primero, así que reemplaza los event.stopPropagation() sueltos que
había: solo se ejecuta UNA acción por click. Las funciones de
destino (abrirTema, renombrarTema, ciclarProgresoTema, etc.) NO
cambian firma ni lógica interna — solo cambia CÓMO se las llama
desde el HTML. El resto de los 100+ onclick del archivo (fuera de
esta grilla) se deja igual por ahora — migración transversal de
alto riesgo, mejor por secciones cuando se toque cada una por otro
motivo, como se había hablado.


### v3.199
(a pedido) punto 3 de la revisión de código — limpieza
centralizada de estadoPractica. Nueva función
destruirEstadoPractica(uid), único lugar que limpia un
estadoPractica[uid] completo (revoca archivoLocalUrl, cierra
webAudioPlayerLocal, desconecta waveformResizeObserver, limpia los
~8 timeouts que fue juntando el estado). crearEstadoPracticaParaTema
ahora solo la llama, en vez de limpiar 3 de los 9 handles a mano
como antes. De paso se corrigió un leak real que se había colado
en v3.193: el ResizeObserver del fix de waveform en mobile nunca
se desconectaba al cambiar de tema. No cambia ningún cálculo ni
comportamiento visible — mismo timing de reset que antes.


### v3.198
(a pedido) punto 4 de la revisión de código — paginación
de la grilla "Mis temas". misTemas sigue completo en memoria (los
filtros/orden/búsqueda siguen siendo instantáneos, no se tocó
cargarMisTemas ni la query de Firestore); lo que cambia es cuánto
DOM se arma de una: filtrarYRenderizarTemas ahora corta la lista
filtrada a temasRenderizadosLimite (60 por defecto) y agrega un
botón "Cargar más" al final si sobran. resetPaginacionTemas()
vuelve el límite a 60 cada vez que cambia el buscador, un filtro,
el orden o la categoría activa (para no mostrar "cargar más" de
una búsqueda vieja); las demás llamadas a filtrarYRenderizarTemas
(progreso, restablecer ajustes, renombrar, etc.) NO resetean el
límite, así no se pierde el "cargué más" al hacer una acción chica
sobre una card ya visible.


### v3.197
(a pedido) primer punto de la revisión de código — se
reemplazan los 24 alert() nativos de error/aviso por un sistema de
toasts propio (mostrarToast(mensaje, tipo)), mismo lenguaje visual
que los modales de v3.188. No bloquean la UI, se apilan si hay más
de uno, se autodescartan a los 4.2s o al tocarlos. Los que eran
errores reales de guardado/lectura quedan en rojo ('error'); los
que eran avisos/validaciones (ya existe, elegí un archivo, etc.)
quedan en dorado ('info'). Ningún mensaje cambió de texto, solo el
canal. No se tocó ninguna lógica de cálculo ni de guardado.


### v3.196
(a pedido) forma de restablecer los ajustes de sesión SIN
entrar a practicar. Nueva función
restablecerAjustesSesionDesdeCard(id, nombreTema) — pide
confirmación (pedirConfirmacion, ya existente), borra la clave de
localStorage y, si el tema ya estaba abierto en esta sesión de la
página, también limpia estadoPractica en memoria llamando a
restablecerAjustesPractica(uid) para que quede coherente sin
recargar. Dos entradas nuevas, ambas condicionadas a que la card
tenga el 🔧 (tieneAjustes):
1) El propio ícono 🔧 de la card ahora dispara el reset al
clickearlo (antes solo abría el tema).
2) Ítem nuevo "↺ Restablecer ajustes de sesión" en el menú ⋮ de
la card, mismo criterio condicional.
No se toca restablecerAjustesPractica(uid) ni el flujo de reset
que ya existía DENTRO de la pantalla de práctica.


### v3.195
(a pedido) FIX — el ícono 🔧 aparecía superpuesto con el
título de la card. .tema-card-nombre solo reservaba
padding-left:34px (alcanzaba para el ícono de progreso solito),
pero .tema-card-ajustes ocupa hasta left:64px, así que el título
arrancaba justo debajo de él. Se agrega la clase condicional
"tiene-ajustes" a la card (puesta una sola vez por render, ya no
se llama temaTieneAjustesSesion() dos veces por card) y una regla
CSS que solo agranda el padding-left del título cuando esa clase
está — las cards sin 🔧 (la mayoría) no corren su título de más.


### v3.194
(a pedido) 2 ajustes:
1) Armadura del badge — se saca el símbolo repetido (♭♭♭/♯♯♯) del
todo, queda solo la tonalidad + las notas concretas entre
paréntesis (ej. "Ab (Bb Eb Ab Db)").
2) FIX — el ícono 🔧 de la card ("ajustes de sesión guardados")
nunca aparecía: temaTieneAjustesSesion(id) buscaba en localStorage
la clave 'audiolink-ajustes-'+id, pero crearEstadoPracticaParaTema
arma el uid real como 'practica-'+id, y es bajo ESA clave completa
que guardarAjustesPractica/cargarAjustesGuardados leen y escriben
siempre. Se corrige la clave buscada; nada más cambia.


### v3.193
(a pedido) 2 entregas, ambas aditivas:
1) Armadura del badge de práctica — además de los símbolos
repetidos (♭♭♭/♯♯♯), ahora también muestra qué notas concretas
llevan esa alteración, en el orden real del círculo de quintas
(ej. "Ab (♭♭♭♭: Bb Eb Ab Db)"). Nueva función notasDeArmadura(),
no toca armaduraDeTonalidad() ni ARMADURA_POR_TONALIDAD (la tabla
de cálculo real queda intacta).
2) FIX waveform en mobile no ocupa el ancho completo — dibujarWaveform
mide el ancho del contenedor una sola vez y lo fija; si esa medición
agarra un layout todavía no asentado (sidebar/topbar de nav.js
montándose, rotación sin evento de resize de ventana), quedaba
pegado a un ancho viejo. Se agrega un ResizeObserver sobre el wrap
del waveform (además del listener de window resize que ya había)
para redibujar ante cualquier cambio real de tamaño del contenedor,
incluido el primer layout.


### v3.192
(a pedido) 2 entregas, ambas aditivas:
1) "¿Ya subí este archivo?" — en "Subir nuevo tema" se avisa (sin
bloquear) si el nombre elegido ya existe en misTemas y/o si el
tamaño en bytes del archivo coincide con el de un tema ya
existente. Se agrega el campo tamañoBytes a GUIAS2 al subir un
tema nuevo, solo para este chequeo — no toca audioUrl ni ningún
cálculo existente.
2) Ícono 🔧 en la card de "Mis temas" (grilla) — aparece si hay
ajustes de sesión (bpm/clave/tonalidad/compás override) guardados
en localStorage para ese tema en este dispositivo. Nueva función
temaTieneAjustesSesion(id), solo lectura. La card sigue mostrando
SIEMPRE el valor oficial de Firestore (bpm/compás/tonalidad) — el
ícono es solo un aviso de "esto lo dejé modificado la última vez",
el botón "↺ Restablecer" dentro de práctica ya resuelve volver al
original.


### v3.191
(a pedido) 4 entregas de funcionalidad, todas aditivas:
1) Progreso por tema (🔴 por aprender / 🟡 en proceso / 🟢 listo):
campo nuevo "progreso" en GUIAS2. Badge en la esquina superior
izquierda de cada tarjeta de "Mis temas" — un tap cicla al
siguiente estado sin abrir ningún sheet. Filtro nuevo en el panel
de filtros (⚙️ Filtros → Progreso).
2) Duplicar tema: opción "📄 Duplicar tema" en el menú ⋮ de cada
tarjeta. Crea un documento nuevo en GUIAS2 con el MISMO audioUrl
(no re-sube nada a Cloudinary — pensado para variaciones del mismo
tema a otro BPM/tonalidad) y copia bpm/compás/tonalidad/clave/
categoría; secciones/offset/progreso/notas arrancan limpios en la
copia porque son ajustes de práctica, no del tema en sí.
3) Notas por tema: textarea "📝 Notas de este tema" arriba de todo
en la pantalla de práctica. Campo nuevo "notas" en GUIAS2. Guardado
EXPLÍCITO al salir del campo (onchange, no por tecla) — mismo
criterio de "sin timers" que se dejó en offset/secciones en
v3.190.
4) Listas de ensayo (setlists): colección nueva SETLISTS2
({dueño, nombre, temaIds: [...]}). Botón "📋 Listas" en Mis Temas
abre el gestor (crear/renombrar/borrar); cada lista tiene su editor
(agregar/quitar temas, reordenar con ↑↓) y un botón "▶ Practicar"
que abre el primer tema en modo lista. Estando en práctica DESDE
una lista, aparece una barra ◀/▶ para recorrerla en su orden
guardado (no alfabético); el botón "⇄ Cambiar de tema" ya
existente respeta el contexto: si elegís otro tema de la MISMA
lista activa, la barra ◀/▶ sigue viva, si no, se sale del modo
lista (comportamiento normal). El contexto de lista NO se persiste
entre sesiones (cada login arranca "fuera de lista" a propósito).
Respaldo/Importación actualizados para cubrir todo lo nuevo:
el JSON ahora incluye progreso/notas por tema y las listas
(exportadas por NOMBRE de tema, no por id, para poder reconstruirlas
al importar en otra cuenta); el CSV suma columnas Progreso/Notas;
importar ahora también crea/actualiza listas por nombre, resueltas
contra los temas ya creados/actualizados en la MISMA importación.


### v3.190
(a pedido) 2 entregas:
1) Se saca el debounce de offset/secciones agregado en v3.189 —
confirmado que TODO lo de secciones/marcadores/offset vive en
Firestore (colección GUIAS2, doc por tema), y el riesgo de perder
el último ajuste si se cierra la pestaña/app dentro de la ventana
de espera no valía el ahorro de escrituras. guardarOffsetLocal-
EnStorage() y guardarSeccionesLocalEnStorage() vuelven a escribir
directo, igual que antes de v3.189. Los otros dos cambios de
v3.189 (caché de audio y no releer Firestore al volver a la
grilla) se mantienen — no tocan la sincro de secciones/offset, solo
evitan descargas y lecturas redundantes.
2) Importar respaldo: botón "⬆️ Importar" en el mismo sheet de
"⬇️ Respaldo", que lee el JSON exportado por v3.188 (mismo formato,
campo version). Por cada tema del archivo: si ya existe un tema con
el MISMO nombre en la librería del usuario, se actualiza (merge)
bpm/compás/tonalidad/clave/categoría/offset/secciones — el audioUrl
del archivo importado NUNCA pisa el ya guardado, porque el JSON no
tiene el audio en sí y machacar la URL dejaría el tema sin sonido;
si no existe, se crea el documento en GUIAS2 con audioUrl:null (el
músico tendría que subir el audio de nuevo para ese tema). Las
categorías del archivo que no existan en CATEGORIAS2 se crean. Se
muestra un resumen (creados/actualizados/categorías nuevas) al
terminar, y misTemas/misCategorias se refrescan en memoria sin
necesidad de releer Firestore.


### v3.189
(a pedido) 3 optimizaciones de rendimiento, ninguna cambia
el resultado visible ni la lógica de cálculo — solo CUÁNDO y CUÁNTO
se lee/escribe contra Cloudinary/Firestore:
1) Caché de audio (Cache API, 'audiolink-audio-cache'): abrirTema()
revisa el caché ANTES de pedirle el archivo a Cloudinary. Si está,
se arma el File desde ahí (0 bytes de red); si no, se descarga y
recién ahí se guarda en caché para la próxima. Se cachean como
máximo 10 audios (LRU simple por orden de uso, ver
_lruTocarAudioCache) para no acumular espacio indefinidamente. No
requiere Service Worker: Cache API funciona directo desde el hilo
principal. Efecto colateral a favor: un tema ya abierto una vez
queda disponible para volver a practicar aunque se corte la señal.
2) cargarMisTemas() deja de ser el único camino para volver a "Mis
temas": volverAMisTemas() ahora reusa misTemas/misCategorias que ya
están en memoria (ámbas colecciones se mutan localmente en cada
acción — renombrar/categoría/borrar/crear ya lo hacían desde
v3.183+) y solo vuelve a golpear Firestore si pasaron más de 3
minutos desde la última carga (misTemasCargadosEn) o si todavía no
se cargó nunca. Antes, cada "‹ Mis temas" eran 2 lecturas de
colección completa (GUIAS2 + CATEGORIAS2), sin importar si algo
había cambiado. confirmarSubidaNuevoTema() ahora también empuja el
tema recién creado a misTemas en memoria, para que quede coherente
con este nuevo criterio.
3) Debounce de 900ms en guardarOffsetLocalEnStorage() y
guardarSeccionesLocalEnStorage(): mover un marcador o ajustar el
offset a mano dispara estas funciones muchas veces por segundo
mientras se arrastra; antes cada llamada era un set() a Firestore.
Ahora se agrupan por uid y solo el último valor tras 900ms de
quietud se escribe. Si el músico sale de la práctica o cierra sesión
antes de que venza el debounce, se fuerza el flush pendiente
(verFlushDebouncePractica) para no perder el último ajuste.


### v3.188
(a pedido) 4 entregas, todas ADITIVAS — no se tocó ninguna
función de cálculo, audio, metrónomo, secciones, loop ni PDF:
1) Gestor de categorías visible: botón "🏷️ Categorías" en la fila
de acciones de MIS TEMAS. Reutiliza el MISMO bottom sheet de
v3.185/v3.186 con un modo nuevo ('gestion'): el título cambia, se
oculta "Sin categoría" y tocar el nombre ya no asigna nada (solo
✏️/🗑️/+ Crear). Antes el editor solo se alcanzaba entrando por
"Elegir categoría", lo que lo volvía un hallazgo casual.
2) Cambiar de tema sin volver atrás: botón "⇄" en la cabecera de
vista-practica que abre un sheet con buscador sobre misTemas (ya
cargado en memoria, sin releer Firestore) y llama a abrirTema()
directo. El tema abierto aparece marcado y no es clickeable.
3) Se eliminan los prompt()/confirm() nativos: dos helpers nuevos
basados en promesas — pedirTexto() y pedirConfirmacion() — con el
mismo lenguaje visual de los sheets. Aplicados en renombrarTema,
borrarTema, renombrarCategoriaDesdeSheet, borrarCategoriaDesdeSheet
y cerrarSesion. Las funciones pasan a await sin cambiar su lógica
(todas ya eran async salvo cerrarSesion, que ahora usa .then()).
Los alert() de error quedaron reemplazados en v3.197 (ver más abajo).
4) Respaldo de "Mis temas": botón "⬇️" en MIS TEMAS que abre un
sheet con dos opciones — JSON completo (temas con secciones/offset/
audioUrl + categorías, pensado para re-importar más adelante) y CSV
simple (una fila por tema, para abrir en planilla). Todo se genera
en el navegador con Blob + URL.createObjectURL desde misTemas/
misCategorias; no descarga el audio, solo las URLs de Cloudinary.
PENDIENTE (a pedido, queda para después): offline-mock.js no
incluye GUIAS2 ni CATEGORIAS2 en su whitelist
(_COLECCIONES_ESCRIBIBLES_RAIZ), así que crear/editar temas o
categorías sin señal queda atascado sin avisar. Ese archivo es
compartido por todo el ecosistema y no se tocó acá.


### v3.187
(a pedido) 2 entregas:
1) Integración completa al ecosistema — se reemplaza el header
propio (logo/tema/salir) por el sidebar/topbar compartido
(nav.js/nav.css), agregando <div id="nav-mount"> + NAV_CONFIG +
<script src="nav.js"> y envolviendo el contenido en
<main id="mainWrap" class="main-wrap">. Se agrega "Ensayo" a
ITEMS en nav.js (grupo Operación) para que sea navegable desde el
resto de páginas del ecosistema. Se quitó el CSS duplicado de
.brand/.vu/@keyframes vu (nav.css ya trae el suyo) y el
toggleTema() propio (choca con el de nav.js, que ya usa la misma
clave de localStorage). cerrarSesion() se sobreescribe DESPUÉS de
cargar nav.js para que, en este módulo, cerrar sesión no redirija
a login.html (login del staff) — este módulo tiene su propio login
(vista-login) para músicos, ajeno a equipoInterno.
2) Editor de categorías (renombrar/borrar) en el bottom sheet —
✏️ actualiza el nombre en CATEGORIAS2 y en todos los temas que la
tenían asignada (para no dejarlos con un nombre huérfano); 🗑️
borra la categoría y, a pedido, los temas que la tenían quedan
"Sin categoría" (categoria:'') en vez de bloquear el borrado.


### v3.186
(a pedido) se quita el input "compás libre" del panel de
Ajustes de práctica — los presets (2,3,4,5,6,7,8,9,12) alcanzan.
Cambio solo de HTML: se borra el <input id="compaslibre-${uid}">;
las 3 referencias en JS (recalcularEfectivoPractica,
restablecerAjustesPractica, crearEstadoPracticaParaTema) ya tenían
guard if(elemento) y quedan intactas sin efecto. Nada más tocado.


### v3.185
(a pedido) 4 ajustes sobre "Mis temas":
1) FIX badge "(ajustado)" persistente: snapshotAjustesAlAbrir y su
comparación usaban JSON.stringify() directo, que borra las claves
en undefined — la foto tomada al abrir quedaba distinta de la
firma actual después de restablecer, así que el badge nunca se
apagaba. Nueva función única firmaAjustesPractica() normaliza
undefined→null en los dos puntos (ver comentario ahí). 2) las
categorías dejan de ser texto libre (input+datalist / prompt()):
ahora es una lista cerrada y reutilizable por usuario, colección
CATEGORIAS2 en Firestore, elegida desde un bottom sheet (buscador
+ lista + crear nueva) — mismo selector para "Subir nuevo tema" y
para "🏷️ Cambiar categoría" de un tema existente. Objetivo: evitar
que la misma categoría se fragmente en variantes por errores de
tipeo. El campo categoria en GUIAS2 sigue siendo un string, sin
cambios de esquema — cambia de dónde sale el valor, no cómo se
guarda. Arranca vacía a propósito (a pedido, las categorías viejas
con typos no se migran solas). 3) barra "Ordenar y filtrar" sobre
la grilla: orden por nombre/BPM/más reciente + filtros por
compás/tonalidad/clave, con contador de filtros activos. 4) los
chips de categoría (para filtrar la grilla, siguen siendo chips —
esto es aparte del selector del punto 2) ahora arman el onclick
por índice en vez de interpolar el nombre de la categoría en el
string del atributo, para no romperse con categorías que traigan
apóstrofes. Ninguna lógica de audio/metrónomo/clave/waveform/
Cloudinary fue tocada.


### v3.184
(a pedido) dos fixes:
1) "no redondees los BPM nunca" — se sacó el Math.round() que
truncaba a entero el BPM detectado del tag ID3 al precargar el
formulario de "Subir nuevo tema" (ej: 123.45 quedaba guardado como
123). El campo ya admite decimales (step="0.01"); ahora usa el
valor del tag tal cual. Quedan sin tocar otros dos
Math.round(...*100)/100 (tap-tempo/ajuste fino) que solo limpian
ruido de punto flotante a 2 decimales, no descartan precisión
musical real — avisado a Marto por si también los quiere fuera.
2) "faltan las etiquetas en waveform" — en dibujarWaveform(), la
condición `tSec <= 0` saltaba por completo cualquier sección que
arranca justo en el segundo 0 (sin línea, sin etiqueta, sin
resaltado de sección activa). En musico.html casi no se nota (la
maqueta rara vez arranca justo en 0:00), pero en ensayo.html es
habitual marcar la primera sección con 🎯 apenas empieza la pista.
Cambiado a `tSec < 0` — la sección en 0:00 se dibuja igual que
cualquier otra (labelX = sx+1 nunca queda negativo, no hay riesgo
de desborde). Mismo bug de origen presente en musico.html
(no tocado — fuera de alcance de este archivo).
v3.183


### v3.183
(a pedido) 7 ajustes: 1) botón "repetir sección"/indicador
de sección/letra/PDF ya no dependen de que el tema traiga secciones
precargadas al abrir — ahora existen siempre (ocultos hasta que hay
datos) y actualizarMapaEstructuraPractica decide su visibilidad en
runtime; esto también resuelve que no se vieran las secciones en el
waveform (mismo bug de origen). 2) el botón "usar canción del
dispositivo" pasa a ser un CTA ancho con texto mientras no hay
audio cargado (revierte parcialmente v3.168), y vuelve a ser el pad
chico una vez cargado un archivo. 3) el badge "(ajustado)" ahora
compara contra una foto de los overrides tomada al ABRIR la
pantalla (después de restaurar la calibración guardada), no contra
los valores por defecto — así no sale marcado por una calibración
heredada de una sesión anterior si en ÉSTA no se tocó nada. 4)
menú ⋮ en cada tema de "Mis temas": renombrar, cambiar categoría,
borrar. 5) buscador por nombre + chips de categoría (mismo patrón
visual que practica-sonido-chip/practica-seccion-chip) sobre la
grilla de temas; nuevo campo "categoria" (texto libre) en el
formulario de Subir nuevo tema, con datalist de las categorías ya
usadas. 6) jerarquía tipográfica: "MIS TEMAS"/"SUBIR NUEVO
TEMA"/nombre del tema pasan de etiqueta chica (1rem, muted, 500)
a título real (1.3rem, texto normal, 700); nombre de cada tarjeta
de tema a 1.05rem/700. Ninguna lógica de cálculo/audio/Firestore
existente fue tocada — todos los cambios son aditivos o de
visibilidad/estilo.
AUDIOLINK · ensayo.html · v1
Nuevo módulo standalone de práctica: login propio (Firebase Auth) +
"Mis temas" (Firestore, colección GUIAS2) + subida de audio a
Cloudinary (preset GUASAUDIO2). El motor de metrónomo/waveform/tags
ID3/offset/secciones/export PDF es el mismo de musico.html, copiado
sin tocar su lógica de cálculo — ver comentarios "v1 ensayo.html"
en los pocos puntos donde sí hubo que adaptar algo (persistencia de
offset/secciones: pasan de localStorage por archivo a Firestore por
tema; export PDF: usa las secciones del archivo/tema, que acá son
una sola cosa, no dos como en musico.html).


### v3.223
(a pedido, "dejar los scores de a 1 pág, con sig. y atrás", portado del
mismo pedido en musico.html v3.198) el bloque "📄 Guía" ahora muestra
las páginas referenciadas del tema (guiaPaginas) de a una, con
navegación Atrás/Siguiente e indicador "Página X de Y" (Y = cantidad
de páginas de ESE tema, no del PDF completo — pueden no ser
consecutivas, ej. 3, 7, 12). El botón "Ver PDF completo" apunta
siempre a la página actualmente mostrada. Cambios acotados a
guiaPdfBloqueHtml + onToggleGuiaPdf (agrega cambiarPaginaGuiaPdf/
renderPaginaGuiaPdf) + nuevos estilos .practica-score-nav (mismos que
musico.html v3.198, para que se vea igual). Cero cambios en
guardarGuiaPdfEnCategoria, parsearRangoPaginas, Cloudinary, ni el
resto del motor de bpm/clave/compás/audio/offset/secciones.

## proyecto.html

### v4.22
se agregan los 3 scripts del SDK de Firebase (app/auth/
firestore-compat 10.12.2) que faltaban en el <head> — se habían
quedado fuera al centralizar firebase-config.js, por lo que
"firebase" quedaba undefined y el listado de proyectos nunca cargaba
(pantalla en blanco / listado vacío). Mismas versiones que ya usan
logistica.html/ingeniero.html/bitacora.html. No se tocó nada más.

### v4.21
se quita la copia local de escapeHtml() — ahora vive en
utils.js v1.1 (compartida con ingeniero.html y bitacora.html, que
también se migraron). utils.js ya se cargaba acá desde v4.9 (solo
para formatCOP), así que no hubo que agregar el <script>. Mismo
comportamiento exacto, cero cambios visuales. Ver CHANGELOG.md para
el detalle de versiones anteriores — este comentario de aquí en
adelante solo documenta la versión vigente.

### v4.20
modo quirófano — se agrega app secundaria de Auth (appIng/
authIng, mismo patrón que authPortal de clientes.html) para que al
registrar un ingeniero NUEVO se le cree cuenta real de Firebase Auth
con contraseña temporal + correo automático de "crear tu
contraseña" (antes solo se creaba el doc en Firestore, sin forma
real de loguearse). Reasignar un ingeniero ya existente no toca su
cuenta Auth. Se agregan botones "Reenviar correo" y "🔗 Copiar link"
(login.html) en cada fila del modal de Ingenieros, junto a Vista
previa y Quitar — mismo patrón visual que clientes.html. No se tocó
Equipo Interno, Cotizador, Producción, ni el resto del archivo.

### v4.19
modo quirófano — se agrega campo "Nombre completo" al modal
de Ingenieros, guardado como `nombre` en ingenieros/{correo}. Al
registrar por primera vez es obligatorio; en reasignaciones a un
ingeniero ya existente es opcional (si se deja vacío no se
sobreescribe el nombre ya guardado). La lista del modal ahora
muestra el nombre como texto principal y el correo como referencia
debajo. Pensado para que ingeniero.html v1.2 pueda mostrar "Panel de
[Nombre]" en vez de solo el correo. No se tocó nada más del modal,
de Equipo Interno, ni del resto del archivo.

### v4.18
modo quirófano — se agrega botón "👁️" en cada fila del modal
de Ingenieros (junto al "✕ quitar"), que abre ingeniero.html?preview=
correo en pestaña nueva. Mismo patrón que _pcPreview de clientes.html
(portal.html ya sabe interpretar ?preview= validando contra
equipoInterno). Solo se tocó cargarListaIngenieros() para pintar el
botón nuevo y se agregó window._ingPreview — nada más del modal, de
Equipo Interno, ni del resto del archivo.

### v4.17
tercera pieza del login del Inge (v2.10 reglas, bitacora.html
v2.11 guard, esto es el CRUD de asignación). Nuevo botón "🎧
Ingenieros" en la vista de detalle del proyecto (junto a Cotizador/
Producción — es project-scoped, a diferencia de Equipo Interno que
es global). Modal modalIngenierosBg: agrega/quita el correo de la
colección `ingenieros` (activo + proyectosAsignados[]). A propósito
DISTINTO del patrón de Equipo Interno: acá nunca se borra el doc
completo del ingeniero, solo se hace arrayUnion/arrayRemove de
proyectoActualId sobre proyectosAsignados — un mismo ingeniero puede
estar asignado a varios proyectos, y quitarlo de este no debe
afectar su acceso a otros. No se tocó el modal ni las funciones de
Equipo Interno, ni ninguna otra parte de la vista de detalle/
listado/PDF/cotizaciones.

V4.16: se agrega campo "Cant. Temas" (fCantTemas, numérico, default 1)
a la ficha del proyecto, junto a Etapa actual/Entrega estimada. Se
guarda como `cantTemas` en el documento del proyecto y se precarga al
editar. Pensado para que cotizador.html pueda heredarlo automáticamente
al vincular el proyecto, en vez de escribirlo a mano cada vez. No se
tocó ningún otro campo, función de guardado, ni el resto de la ficha.
V4.15: Cotizador (simple, texto libre) migra a cotizacion-rapida.html
(mismo patrón que v4.14 con Producción musical). Se retiran de acá:
el modal modalCotizadorBg, las funciones cotizacionesRef/
abrirModalCotizador/cerrarModalCotizador/cargarListaCotizaciones/
agregarFilaItem/recalcularTotalCotizacion/abrirFormularioCotizacion/
volverListadoCotizaciones/recolectarDatosCotizacion/guardarCotizacion/
generarPDFCotizacion, y el CSS exclusivo .item-row/.cotiz-total/
.cotiz-item-lista — confirmado por grep que nada más en este archivo
los usaba (.link-add SÍ se mantiene: lo usan también Equipo e
Instrumentación). El botón "🧾 Cotizador" del detalle ahora abre
cotizacion-rapida.html?id={proyectoActualId} en pestaña nueva, mismo
patrón que Producción y que "🧮 Cotizador Pro" (cotizador.html) — se
mantienen los 3 como herramientas separadas, no se fusionó nada. No
se tocó Equipo interno, Dashboard, PDF de proyecto, ni ninguna otra
función/colección existente.
V4.14: Producción musical migra a produccion.html (mismo patrón de
migración ya usado en v4.13 con Portal de clientes, y v4.12 con
Estudios/Músicos). Se retiran de acá: el modal modalProduccionBg, el
lightbox lightboxProdBg, las funciones produccionRef/abrirModalProduccion/
cerrarModalProduccion/cargarListaProduccion/limpiarFormularioProduccion/
abrirFormularioProduccion/volverListadoProduccion/abrirLightboxProduccion/
cerrarLightboxProduccion/subirArchivoCloudinary/subirArchivoProduccion/
guardarProduccion/borrarProduccion, las constantes CLOUDINARY_CLOUD_NAME/
CLOUDINARY_UPLOAD_PRESET/EXTENSIONES_AUDIO/PRODUCCION_TIPO_LABEL, y el
CSS exclusivo .produccion-item-lista/.upload-status/.lightbox-bg/
.lightbox-content — confirmado por grep que nada más en este archivo
los usaba. El botón "🎵 Producción" del detalle ahora abre
produccion.html?id={proyectoActualId} en pestaña nueva, mismo patrón
que ya existía para "🧮 Cotizador Pro" (cotizador.html). No se tocó
Cotizador (simple ni Pro), Equipo interno, Dashboard, PDF, ni ninguna
otra función/colección existente.
V4.13: Portal de clientes migra a clientes.html (mismo patrón que
V4.13: Portal de clientes migra a clientes.html (mismo patrón que
Estudios/Músicos en v4.12 — ver plan de migración acordado). Se
retiran de acá: el modal modalPortalBg, las funciones
clientesAccesoCache/abrirModalPortalClientes/cerrarModalPortalClientes/
cargarClientesAccesoYRender/getClientesUnicos/renderListaPortalClientes/
window._pcActivar/_pcReenviar/_pcRevocar/_pcPreview, la referencia
clientesAccesoRef y la app secundaria appPortal/authPortal (Firebase
Auth) — confirmado por grep que nada más en este archivo las usaba.
También se retira la entrada "Portal de clientes" de sbFootExtra.
Ahora vive todo en clientes.html, con acceso real de Auth (antes solo
mostraba el estado en modo lectura ahí). No se tocó Equipo interno,
Cotizador, Producción, Dashboard, PDF, ni ninguna otra función/
colección existente.
V4.12: Estudios y Músicos migran a hojas propias (estudios.html /
musicos.html — mismas colecciones Firestore 'estudios'/'musicos',
mismo CRUD, sin cambios de lógica ni de datos). Se retiran de acá:
los modales modalEstudiosBg/modalMusicosBg, sus funciones
(abrirModalEstudios...guardarMusico, incl. slugMusico) y sus entradas
en sbFootExtra del NAV_CONFIG (ahora llegan como ítems reales de
nav.js v1.2, disponibles en todo el ecosistema, no solo acá). No se
tocó nada de Portal de clientes, Equipo interno, Cotizador,
Producción, Dashboard, PDF, ni ninguna otra función/colección
existente — subirArchivoCloudinary() sigue acá intacta porque la
sigue usando Producción musical.
V4.11: nuevo módulo clientes.html (colección Firestore 'clientes').
Se agrega un selector opcional "Cliente registrado" en el formulario
de proyecto, arriba de los campos existentes Cliente/Artista y Correo
del cliente. Al elegir un cliente de la lista, se pre-llenan esos dos
campos de texto (que siguen siendo editables/sobreescribibles a mano,
igual que siempre). Se guarda además `clienteId` (opcional, null si no
se vincula) en el documento del proyecto — es un campo nuevo y
aditivo: los proyectos existentes sin clienteId siguen funcionando
exactamente igual en PDF, portal, resumen financiero y todo lo demás,
porque ninguna de esas funciones lee clienteId, solo clienteArtista/
clienteEmail como antes. No se tocó guardarProyecto (salvo agregar el
campo), editarProyectoActual, limpiarFormulario (solo se agregó el
reset del selector nuevo), ni ninguna otra función, PDF, cálculo o
lógica existente.
V4.10: fix de desborde horizontal en mobile en la vista de detalle de
proyecto (botones PDF Cliente/Interno/Editar/Ver sesiones/Cotizador/
Producción se salían de pantalla). Causa: el bloque @media(max-width:640px)
con las reglas mobile de .pdf-actions, .row2 y .modal estaba ubicado
ANTES de las reglas base (sin media query) de esas mismas clases más
abajo en la hoja de estilos. Al empatar en especificidad, ganaba la
regla que aparece después en el archivo — es decir, la regla de
escritorio anulaba silenciosamente la regla mobile en todo momento.
Se movió el bloque completo (mismo contenido, ninguna propiedad
cambiada) a después de esas reglas base. No se tocó ninguna lógica de
cálculo, Firestore, PDF, ni ningún otro módulo.
V4.9: se corrige un bug donde un nombre de músico o de archivo adjunto
que contuviera una comilla doble (") rompía el atributo HTML onchange/
onclick correspondiente (la comilla doble cerraba el atributo antes de
tiempo, dejando código HTML suelto y el botón sin funcionar). Se agrega
la función escJsHtml(), que escapa backslash, comilla simple y comilla
doble (esta última como &quot;), y se usa en los 3 puntos donde se
interpola un string dentro de un string de JS dentro de un atributo
HTML: el nombre del músico en el onchange de "Adjuntar documento", y
doc.url + doc.nombre en el onclick de abrirLightboxProduccion() del
listado de documentos. No se corrige el dato ya guardado en Firestore
(si un músico tiene ese caracter en el nombre, sigue así hasta editarlo
manualmente) — solo se evita que rompa la página. No se tocó
_musEliminarDoc, guardarMusico, ni ninguna otra función o módulo.
V4.8: prueba temporal de diagnóstico — _musSubirDocumento ya no envía
el 2º parámetro (carpeta) a subirArchivoCloudinary(), por lo que los
documentos de músicos suben ahora a la carpeta raíz del preset de
Cloudinary, sin carpeta propia por músico. Objetivo: descartar si el
problema de subida está en el asset_folder/Dynamic Folder Mode del
preset. subirArchivoCloudinary(), slugMusico(), el guardado en
Firestore (arrayUnion) y _musEliminarDoc quedan intactos — cuando se
confirme la causa, se puede revertir este único cambio para volver a
subir con carpeta. No se tocó Producción, Pagos, Estudios, Cotizador
ni Dashboard.
V4.7: en la lista de documentos de cada músico, el ícono fijo 📄 se
reemplaza por una miniatura real (mismo criterio visual de Pagos):
si el archivo es imagen (jpg/jpeg/png/webp/gif) se arma un thumbnail
de 28x28 pidiendo la transformación de Cloudinary directamente en la
URL (w_28,h_28,c_fill,q_auto,f_auto insertado antes de /upload/), sin
subir nada nuevo ni gastar créditos de storage extra. Si no es imagen
(PDF, audio, otro) se deja un ícono según tipo. El clic sigue abriendo
exactamente el mismo abrirLightboxProduccion() de siempre — no se tocó
esa función, ni _musSubirDocumento, ni _musEliminarDoc, ni ningún otro
módulo (Producción, Pagos, Estudios, Cotizador, Dashboard).
V4.6: en cada músico del catálogo se puede adjuntar uno o varios
documentos (cédula, hoja de vida, contrato, etc.). Se guardan en
musicos/{id}.documentos: [{url, nombre, subidoEn}] vía arrayUnion/
arrayRemove. Sube por subirArchivoCloudinary() (misma función, ahora
con 2º parámetro opcional assetFolder para no romper llamados
existentes), a una carpeta dinámica por músico en Cloudinary
(musicos/{nombre-slug}_{id-corto}, vía asset_folder — cuenta con
Dynamic Folder Mode). Ver/descargar reutiliza abrirLightboxProduccion()
tal cual. Eliminar quita del array (no borra de Cloudinary, mismo
criterio no-destructivo del resto de la app). No se tocó guardarMusico,
el resto de Músicos, ni ningún otro modal.
V4.5: nuevo catálogo maestro "Músicos" (colección Firestore `musicos`),
mismo patrón CRUD que Estudios (activo:false en vez de borrar, sin
semilla). Campos: nombre, cedula, instrumento, correo, telefono.
Modal "🎻 Músicos" + entrada en sbFootExtra junto a Estudios. No se
tocó Estudios, Cotizador, Dashboard, ni ninguna otra lógica existente.
V4.4: en el dashboard de proyecto, la barra segmentada de etapa
(dash-etapa-bar / renderBarraEtapa) se reemplaza por la ruta de
nodos de portal.html (V1.8: .etapa-ruta, nodo circular + línea
conectora, check en las hechas, pulso dorado en la actual, subtexto
con fecha de grabación/entrega), para que el dashboard y el portal
de clientes muestren la misma pieza visual. Se trajo el CSS
(.etapa-ruta y clases asociadas, incl. @keyframes etapaPulso) tal
cual de portal.html, y se agregó renderRutaEtapa(p) como adaptación
de renderEtapaChips() que retorna el HTML en vez de escribirlo en un
elemento por getElementById, reutilizando sesionesDash ya cargado
por el dashboard para calcular el rango de fechas de grabación.
renderBarraEtapa() y ETAPAS_LABEL quedan intactos (renderBarraEtapa
ya no se invoca en el dashboard, pero se deja por si se usa en otro
lugar). No se tocó portal.html, PDF, resumen financiero, tarjetas,
mini-calendario ni ningún otro bloque del dashboard (v4.3).
V4.3: se agrega un dashboard como landing del detalle de proyecto,
arriba del contenido existente (resumen financiero, chips, narrativa,
equipo — nada de eso se tocó ni se movió de función). Incluye: barra
de etapa (sobre ETAPAS_LABEL existente), barra financiera (sobre
resumenPagos existente), 3 tarjetas (sesiones hechas/total,
instrumentación, producción) y un mini-calendario del mes con puntos
de color (verde = sesión pasada, azul = sesión próxima, ámbar =
entrega estimada); clic en un día con punto abre un tooltip con el
detalle + link a logistica.html. Para esto, verDetalle() se separó en
apertura/suscripción + renderDetalleContent() (reutilizable desde los
listeners nuevos sin duplicar código), y se agregan dos listeners
onSnapshot acotados al proyecto abierto (sesiones y producción),
que se desuscriben en volverListado() para no dejar lecturas de
Firestore corriendo de fondo al salir del detalle. No se tocó
logistica.html, Cloudinary, Storage ni instrumentación (v4.2).
V4.2: se agrega sección "Instrumentación" al formulario de proyecto
(Entrega 1 de 2). Acordeón por grupo (Batería, Percusión latina,
Cuerdas, Bronces, Voces, Teclas, Otros — CATALOGO_INSTRUMENTACION),
cada grupo con piezas predefinidas (selector) + "agregar personalizada"
(texto libre), cantidad por pieza y, si cantidad > 1, etiquetas
editables por unidad (ej: Congas → Tumba/Conga 2/Quinto en vez de
Congas 1/2/3). Se guarda como `instrumentacion` en el documento de
`proyectos`, sin tocar `equipo`, `costos` ni ningún otro campo.
Colapsado por defecto y responsive (una columna en mobile) para no
saturar el formulario. Entrega 2 (pendiente, en logistica.html): usar
esta plantilla para armar el checklist por grupo + input list en cada
sesión — no se tocó logistica.html en esta entrega. Cloudinary,
Storage (comentado desde v4.1) y producción: sin ningún cambio.
V4.1: se revierte el enrutamiento de audio a Firebase Storage de v4.0
porque Google exige plan Blaze (pago) para habilitar Storage, y no se
activó. El audio ya NO se sube por el input de archivo: si el usuario
selecciona un audio ahí, subirArchivoProduccion() lanza un error
controlado y guardarProduccion() lo muestra pidiendo usar el campo
"Enlace externo" en su lugar (pegar link de Drive/WeTransfer/etc., que
ya existía desde antes como enlaceExterno). Se agrega un botón 🔗 en el
listado que aparece cuando hay enlaceExterno pero no archivoUrl, para
abrirlo en pestaña nueva sin tener que entrar a editar el ítem. El SDK
de Firebase Storage, `const storage = firebase.storage()` y la función
subirArchivoStorage() quedan COMENTADOS (no borrados) por si se activa
Blaze más adelante y se retoma. Cloudinary (imagen/video/PDF) sigue
exactamente igual, sin ningún cambio.
V3.9: se agrega lightbox para ver el archivo adjunto de cada ítem de
Producción musical, sin salir del listado. Mismo patrón visual que el
lightbox de comprobantes de pagos.html (.lightbox-bg/.lightbox-content/
.lightbox-close, bloque CSS independiente, no se tocó nada de pagos.html).
Detección de tipo por extensión del nombre guardado (archivoNombre):
imagen → <img>, PDF → <iframe> embebido (sin paginado por Cloudinary,
a diferencia de pagos, porque un score no se factura por páginas),
audio (mp3/wav/m4a/ogg/aac) → <audio controls>, cualquier otro tipo →
botón "Abrir en pestaña nueva". En produccionLista se agregó una zona
de acciones aparte (junto al badge) con ícono 📎 visible solo si el
ítem tiene archivoUrl, con stopPropagation para no disparar el click
de "editar" del item completo (mismo patrón que el botón 📅 de v3.7).
No se tocó el formulario de producción, la subida a Cloudinary, ni
ninguna otra lógica existente.
V3.8: se agrega el modal "Producción musical" (CRUD sobre la nueva
subcolección Firestore proyectos/{id}/produccion), accesible desde el
detalle de cada proyecto junto a Cotizador/Ver sesiones. Cada ítem
guarda: título, tipo (score/arreglo/referencia/mezcla/otro), BPM,
tonalidad, archivo opcional (subido a Cloudinary con las mismas
credenciales que ya usa pagos.html para comprobantes — mismo cloud,
mismo preset), enlace externo opcional, notas, fecha/autor automático
y "visible para cliente" (booleano, pensado para que portal.html lo
use más adelante y aún no se toca). El esquema queda preparado para
que, en el futuro, una vista separada de colaborador/arreglista
externo pueda escribir en esta misma subcolección sin migrar datos.
No se tocó ninguna otra función existente (cotizador, PDF, estudios,
portal de clientes, equipo interno, sesiones).
V3.7: se agrega ícono directo "📅" en la card del listado (junto al
badge de estado, mismo patrón visual que el ícono 📁 de pagos.html)
que enlaza a logistica.html?id=X sin tener que abrir el detalle del
proyecto primero. Se agregó un div .card-top-actions para agrupar
badge+ícono sin romper el layout de 2 columnas de .card-top. No se
tocó ninguna otra lógica de la card ni del detalle.
V3.6: el botón "volver" del detalle ahora es dinámico según el origen.
Si se entró vía proyecto.html?id=X&from=pagos (como ahora enlaza
pagos.html v2.0), el link dice "← Volver a Pagos" y regresa a
pagos.html. Sin ese parámetro, comportamiento intacto: "← Volver a
proyectos" → volverListado(). No se tocó ninguna otra lógica.
V3.5: se agrega resumen financiero (Cotizado/Cobrado/Saldo) usando el
mismo patrón de pagos.html: collectionGroup('cotizaciones') con
estado=='aceptada' + subcolección pagos de cada proyecto, guardado en
un objeto nuevo `resumenPagos` (no toca `proyectos` ni su listener).
En la card del listado se agrega una línea "💰 Saldo pendiente" solo
si saldo > 0. En el detalle se agrega un bloque Cotizado/Cobrado/Saldo
arriba de la ficha, solo si el proyecto tiene cotización aceptada.
Usa formatCOP() de utils.js. No se tocó ninguna lógica de cotizador,
PDF, portal de clientes ni sesiones.
V3.4: en el listado de cotizaciones, el estado 'aceptada' ahora se
muestra como "En Producción" (antes "Aceptada"), con un badge de color
azul distintivo (.badge.prod) en vez de compartir el verde de
"Enviada". Es solo un cambio de etiqueta/color visual — el valor
interno guardado en Firestore sigue siendo 'aceptada', sin tocar
ninguna consulta ni lógica existente.
V3.3: en guardarCotizacion(), solo puede haber UNA cotización con
estado 'aceptada' por proyecto. Si se intenta aceptar una segunda,
se pide confirmación explícita; al confirmar, la cotización
previamente aceptada pasa automáticamente a 'enviada' (no se borra).
Si se cancela, no se guarda nada. No se tocó ninguna otra lógica de
ítems, PDF, validez ni notas.
V3.2: el sidebar/topbar mobile/panel "···"/bottomnav (antes
copiados y pegados en cada archivo) ahora se cargan desde nav.js
(compartido por todo el ecosistema), inyectados en <div id="nav-
mount"></div>. Las funciones cerrarSesion(), toggleTema(),
toggleMasMobile() y el colapsar del sidebar también se movieron a
nav.js. Los ítems específicos de esta página (si los hay) se pasan
via window.NAV_CONFIG antes de cargar nav.js. No se tocó ninguna
otra lógica ni el CSS existente de .sidebar/.mobile-topbar/etc.
V3.1: firebaseConfig deja de estar copiado en este archivo; ahora se
carga desde firebase-config.js (compartido por todo el ecosistema,
mismos valores exactos). Se agrega <script src="firebase-config.js">
en el <head>, justo después de firebase-firestore-compat.js. No se
tocó firebase.initializeApp() ni ninguna otra lógica.
V3.0: el modal "Estudios" agrega un textarea de specs/gear (texto
libre: layout, preamps, mics, monitores, etc.) por cada sala. Se
guarda en el campo salaX.specs de Firestore y lo lee el Cotizador
(v8.5) para mostrarlo cuando "Mostrar especificaciones técnicas" está
activo. La siembra automática de ICESI ahora incluye el texto real de
specs que antes estaba fijo en el HTML de cotizador.html, para no
perder esa información al migrar. No se tocó ninguna otra función.
V2.9: se agrega el acceso directo "🧮 Cotizador" en el sidebar y el
panel "···" (abre cotizador.html suelto, sin ?id=, que ya soporta
vincularse a un proyecto desde su propio selector). Se corrige un
olvido de la v2.7: faltaban los créditos de diseño (Marto 🧠 ·
martowave@gmail.com) en el sidebar y el panel móvil de este archivo —
ya estaban en logistica/pagos/index/portal pero no aquí, el piloto
original. No se tocó ninguna otra función existente.
V2.8: se agrega el modal "Estudios" (CRUD sobre la nueva colección
Firestore 'estudios'), accesible desde el sidebar y el panel "···"
junto a Equipo Interno. Cada estudio guarda nombre + 3 salas
(nombre+tarifa) + specsVisibles + activo. Al abrir el modal por primera
vez, si la colección está vacía, se siembran automáticamente los 3
entornos que antes estaban fijos en el código de cotizador.html
(ICESI, Externo, Home Studio) para no cambiar el comportamiento
existente. Desactivar un estudio no lo borra, solo lo oculta del
selector del Cotizador. No se tocó ninguna otra función existente.
V2.7: se rediseña la navegación (piloto, para replicar luego en
index.html/logistica.html/pagos.html/portal.html). Desktop (>=769px):
sidebar fija a la izquierda (patrón heredado de Andamios El Progreso
Central), colapsable a solo-iconos con botón toggle, que reemplaza el
nav.links horizontal. Mobile (<=768px): patrón heredado de PsicoGestión
— topbar mínima + bottom nav fija con 4 accesos (Dashboard/Proyectos/
Logística/Pagos) + botón "···" que despliega panel flotante con el
resto (Equipo interno, Portal de clientes, tema, cerrar sesión). El
nav.links viejo se retira del header; header queda solo como franja de
acciones contextuales en desktop. No se tocó ninguna función de
Firestore, cotizador, PDF, ni lógica de ningún modal — solo estructura
de navegación (HTML/CSS) y los onclick que ya abrían cada acción.
V2.6: se unifica tipografía con cotizador.html/ICESI (Playfair Display
+ DM Sans + JetBrains Mono vía Google Fonts). Solo se agregaron las
variables --T/--S/--M y se cambió font-family en body y .brand h1;
no se tocó ningún color, layout ni función existente.
V2.5: se rediseñó generarPDFCotizacion() con el lenguaje visual del PDF
de cotizador.html: dos tarjetas de info (Titular del Proyecto /
Trazabilidad), ítems agrupados por categoría (detectada por palabras
clave en el concepto) con subtotal por grupo, tipografía serif ("times")
para textos y mono ("courier") para etiquetas/cifras —los más cercanos
a Playfair Display/JetBrains Mono disponibles sin incrustar fuentes
externas en jsPDF—, y paginación automática si la cotización es larga.
No se tocó guardarCotizacion(), recolectarDatosCotizacion() ni ninguna
otra función del cotizador simple: solo cambia cómo se pinta el PDF.
V2.4: se agrega el botón "🧮 Cotizador Pro" dentro del modal de
cotizaciones, que abre cotizador.html?id={proyectoActualId} en pestaña
nueva (el calculador avanzado con salas/backline/honorarios/IVA).
Una sola línea nueva; no se tocó ninguna función existente.
V2.3: se agrega el enlace "Pagos" al nav (nuevo archivo pagos.html).
No se tocó ninguna otra función ni estilo existente.
V2.2: se agrega el "Cotizador" dentro del detalle de cada proyecto: modal
con ítems (concepto/cantidad/precio unitario), total en vivo, estado
(borrador/enviada/aceptada) y listado de cotizaciones previas del mismo
proyecto para reabrir/editar/duplicar. Se guarda en la subcolección
proyectos/{id}/cotizaciones (mismo patrón que sesiones en logistica.html).
Genera PDF reutilizando el estilo de marca de exportarPDF. Solo equipo
interno (mismo guard existente). No se tocó ninguna otra función ni
estilo existente.
V2.1: se agrega el modal "Equipo interno" (agregar/quitar correos con
acceso administrativo), adaptado del mismo patrón usado en PsicoGestión:
colección equipoInterno con doc id = correo, campo agregadoEn, y activo:true
para que el guard de sesión existente (que ya exige activo===true en
login.html/proyecto.html/logistica.html/index.html/portal.html) lo
reconozca sin tocar esos archivos. Quitar acceso borra el documento
completo (igual que Psico). No se tocó ninguna otra función ni estilo
existente.
V2.0: se agrega el modal "Portal de clientes" (activar/reenviar/revocar/vista
previa), adaptado del mismo patrón usado en PsicoGestión (reset-email +
instancia secundaria de Firebase para no cerrar la sesión de staff). Se
agrega el campo "Correo del cliente" en el formulario de proyecto, que
guarda clienteEmail (ya usado por portal.html). Colección nueva:
clientesAcceso (doc id = email en minúsculas) con authUid y
portalRevocado. No se tocó ninguna otra función ni estilo existente.
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"></script>
### v4.1
comentado — requiere plan Blaze, no activado. Ver nota arriba.
<script src="https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js"></script>

---

## bitacora.html

### v2.11.2
modo quirófano — si la URL trae &from=ingeniero (lo manda
ingeniero.html v1.2 en su botón "Abrir bitácora →"), se muestra un
link "← Volver a mis proyectos" arriba de todo, que regresa a
ingeniero.html. Si no viene ese parámetro (logistica.html, QR de
sala, pestaña de Reportes, etc. no lo mandan) no se muestra nada —
se preserva el comportamiento actual para esos otros flujos. No se
tocó el guard, las tabs, ni ninguna otra función existente.

### v2.11.1
login.html v1.8 ya soporta ?next= — se actualiza el
redirect del guard para mandarlo directo (antes solo dejaba el
respaldo en sessionStorage, comentado como pendiente en v2.11). El
respaldo se conserva por si algún flujo futuro pierde el parámetro.
Sin más cambios de lógica.

### v2.11
segunda pieza del login del Inge (v2.10 fue las reglas). Se
agrega firebase-auth-compat.js y el GUARD DE SESIÓN: bitacora.html
deja de ser standalone/sin login. Acepta equipoInterno (staff,
acceso total, para que Marto pueda revisar/soportar cualquier
sesión) o ingenieros (rol acotado — solo si el proyectoId de la URL
está en su proyectosAsignados[], ver reglas v2.10). El link ?p=&s=
se conserva tal cual como atajo directo a una sesión puntual, solo
que ahora pasa primero por el guard. Pendiente, cuando se toque
login.html: soporte de retorno post-login (?next=) — por ahora se
guarda el link original en sessionStorage
('audiolink_redirect_after_login') por si login.html llega a
usarlo, pero no rompe nada si no lo hace. No se tocó cargar(),
cargarNotasTema, guardarNotaEtapa ni ninguna otra lógica — el guard
es una capa nueva encima, cargar() se sigue llamando exactamente
igual que antes, solo que ahora después de validar acceso.

### v2.10
ajuste de fluidez visual a pedido del usuario, sobre lo que
quedó en v2.9/v2.9.1. Dos cambios, solo HTML/CSS + las líneas de
texto que ya existían (no toca cargarNotasTema, guardarNotaEtapa,
inputList ni ninguna otra lógica): (1) la ACTIVIDAD pasa a ser el
título visual principal de la página (`.actividad-titulo`, grande,
dorado) — el antiguo h1 "Bitácora de Grabación" baja a un eyebrow
chico arriba; fecha/sala quedan en el subtítulo aparte. (2) las 5
tabs se agrupan visualmente en 2 bloques con separador y etiqueta:
"Esta sesión" (🎛️ Bitácora, 🎙️ Grabación) vs "🎼 {nombre del tema}"
(✂️ Edición, 🎚️ Mezcla, 🏁 Mastering) — o "🎼 Sin tema" si la sesión
no tiene tema asignado. La idea es que sea obvio de un vistazo qué
pestañas afectan la sesión puntual y cuáles afectan la canción
completa. No se tocó ningún cálculo, guardado en Firestore, ni las
reglas.

### v2.9.1
fix — v2.9 movió Edición/Mezcla/Mastering al tema pero nunca
mostraba en pantalla A CUÁL tema pertenecía la sesión (usa
temaNombre, ya guardado como snapshot en el doc de sesión desde
logistica.html v2.39 — no requiere leer el tema aparte). Se agrega
línea "🎼 Tema: {nombre}" bajo el subtítulo, visible solo si la
sesión tiene tema asignado. No se tocó cargarNotasTema, guardarNotaEtapa
ni ninguna otra lógica de v2.9.

### v2.9
Fase 2 del sistema de temas — Edición/Mezcla/Mastering dejan de
vivir en la sesión y pasan al TEMA (proyectos/{p}/temas/{temaId}),
porque un tema (canción) suele tener varias sesiones de grabación
pero una sola edición/mezcla/mastering. Al cargar, si la sesión tiene
temaId (asignado desde logistica.html v2.39), se trae el doc del
tema y esas 3 pestañas leen/escriben ahí (guardarNotaEtapa separa el
caso 'Grabacion', que sigue intacto en la sesión, de los otros 3).
Si la sesión NO tiene tema asignado, las 3 pestañas se deshabilitan
con un aviso ("Asígnale un tema desde Logística") — decisión
explícita del usuario, sin fallback ni auto-creación de tema desde
acá. No había notas previas que migrar (confirmado con el usuario).
REQUIERE AJUSTAR LAS REGLAS DE FIRESTORE: se angosta la excepción
sin login de sesiones (ya no toca notasEdicion/Mezcla/Mastering, solo
inputList/notasGrabacion) y se agrega una excepción nueva, mismo
patrón, sobre /temas/{temaId} (get sin login + update angosto a esos
3 campos). Ver bloque de reglas actualizado al final de este
archivo. No se tocó Bitácora (Preamp/Gain), inputList, la sección de
Añadir/Borrar canal, ni la pestaña Grabación/tomas.

### v2.8
se traen a este archivo las pestañas ✂️ Edición, 🎚️ Mezcla y
🏁 Mastering (antes vivían en el modal de Reportes de logistica.html)
— decisión consciente del usuario: como el Inge es siempre la misma
persona y ya usa este link para todo, prefiere tenerlo junto acá en
vez de repetir el input list en 2 archivos. Además, la pestaña
🎙️ Grabación (antes "Tomas") ahora SÍ puede leer y borrar tomas ya
registradas (antes era create-only) — se reemplazó la lista local
`tomasLocalSesion` (solo mostraba lo agregado en la carga de página
actual) por una lista en vivo vía onSnapshot, con botón 🗑️ y
generación real de numero/código (ej. BATERIA_T01), ya que ahora sí
se puede leer el histórico sin duplicar. ESTO REQUIERE AMPLIAR LAS
REGLAS DE FIRESTORE de este link sin login (antes solo permitía
update() de `inputList`): ahora también necesita permitir update()
de notasEdicion/notasMezcla/notasMastering, y read+delete en
sesiones/{id}/tomas. Ver el bloque de reglas actualizado al final de
este archivo — cópialo tal cual a Firebase Console → Firestore →
Rules. RIESGO ACEPTADO explícitamente por el usuario: al ser un link
sin contraseña, cualquiera que lo obtenga podría ahora también leer/
borrar tomas y editar notas de mezcla/mastering de esa sesión (antes
solo podía tocar el input list). No se tocó Bitácora (Preamp/Gain),
inputList, ni la sección de Añadir/Borrar canal.

### v2.7
el badge de cada fila ya no muestra CH${it.canal} (Ch interno)
sino la POSICIÓN según el orden (1,2,3...), igual que en
logistica.html (editor de sesión y Reportes > Bitácora). El Ch
interno (it.canal) se sigue guardando y usando tal cual para el
matching de Preamp/Gain en logistica.html — acá solo cambió lo que
se muestra en pantalla, ningún cálculo ni el guardado en Firestore.

V2.6: sistema tipo consola digital para sesiones con muchos canales
(grabaciones en bloque, ej. percusión con ~20 canales): (1) color fijo
por grupo de "Instrumento" (paleta de 8 tonos, se elige por hash del
texto — el mismo nombre siempre sale del mismo color), aplicado al
borde del grupo y sus chips; (2) grupos colapsables (clic en el
encabezado), estado solo local de la pantalla, no se guarda; (3)
toolbar sticky arriba con buscador en vivo (nombre/Ch/Canal Interfaz)
y chips de navegación rápida por grupo (clic = scroll directo); (4)
cada canal pasa de tarjeta apilada a fila compacta tipo "channel
strip" (CH · Instrumento · Interfaz · Preamp · Gain en una sola
fila de 4 columnas, 2 en pantallas angostas). No cambia ningún dato
ni el guardado — mismo `inputListActual`/`orden`/`instrumento` de
v2.5, solo cómo se organiza y se ve.
V2.5: (1) nuevo campo "Instrumento (agrupar)" por canal — texto
libre, cuando dos o más renglones consecutivos (ya ordenados) tienen
el mismo texto ahí, se agrupan visualmente bajo un encabezado común
con borde dorado (mic+DI del mismo instrumento, aunque vengan de
piezas distintas del catálogo — no depende de ninguna estructura
fija); (2) botones ▲▼ por canal para reordenar la lista a mano —
mueven el renglón intercambiando su nuevo campo `orden` con el
vecino inmediato en el orden visual actual, el "Ch" interno (usado
para el matching de Preamp/Gain por nombre) nunca se toca. Ambos
campos (`orden`, `instrumento`) viajan en el mismo update() de
guardar() sobre `inputList`, sin cambiar las reglas de Firestore.
Sesiones viejas sin `orden` lo reciben por defecto = su Ch al cargar.
V2.4: se agrega campo "Canal Interfaz" a cada tarjeta (input físico
real en la interfaz de audio, distinto del Ch consecutivo que ya
traía cada renglón) — mismo patrón que Preamp/Gain: se guarda como
`canalInterfaz` dentro de cada ítem de `inputList`, viaja en el mismo
update() de guardar(), y también se incluye por defecto (vacío) en
los canales manuales añadidos con "➕ Añadir canal". No se tocó
ninguna otra lógica ni las reglas de Firestore (siguen permitiendo
solo tocar el campo `inputList`, este cambio va dentro de ese mismo
campo).
V2.3: en la sección Bitácora, botón "➕ Añadir canal" al final de la
lista — pensado para cuando el ING necesita un canal extra en plena
grabación que no estaba en la instrumentación original (ej. Caja
directa + mic). El canal nuevo entra con número consecutivo al
último del inputList, nombre en texto libre (placeholder "Ej: Caja
Directa") y Preamp/Gain vacíos igual que los demás. Solo los canales
agregados así llevan botón "🗑️" para borrarlos — los que ya traía
el inputList generado por logistica.html no se pueden borrar desde
acá. Se guarda con el mismo botón "Guardar bitácora" y el mismo
`sesionRef.update({inputList: inputListActual})' de siempre — no se
tocó `guardar()`, la sección Tomas, ni ninguna otra lógica. La regla
de Firestore sugerida ya solo permite tocar el campo `inputList` sin
login, así que no hace falta cambiarla.

V2.2: nuevo campo de texto libre "Nombre/código en el DAW" (opcional)
en el formulario de Tomas. Se guarda como `codigoDaw` junto a los
demás campos de la toma — coexiste con (no reemplaza) el sistema de
numero/codigo automático de logistica.html (que esta página nunca
generó, ver v2.1). Se muestra en el resumen de confirmación y en la
lista local de tomas registradas en esta sesión de trabajo. Se
actualizó también la regla de Firestore sugerida al final del
archivo (esquema de create en /tomas) para incluir el campo nuevo —
hay que volver a pegarla en Firebase Console si ya habías copiado la
versión anterior. Mismo campo agregado en logistica.html v2.7. No se
tocó ninguna otra lógica.
V2.1: se construye la sección "Tomas" (el shell ya existía desde
v2.0, pero sin formulario). Selector de instrumento vía
construirOpcionesInstrumento() — mismo criterio que logistica.html
### v2.6
si el grupo NO está marcado "individual" da la opción del
grupo completo (ej. "Bronces"); si SÍ está marcado, expande usando
el snapshot `instrumentacionSesionPiezas` guardado por logistica.html
v2.5 (ej. "Guitarra", "Bajo"). Luego estrellas + Usar/Descartar +
nota, y antes de guardar se muestra el resumen de confirmación
("Vas a registrar: ...") con Confirmar/Revisar. Al confirmar, se
hace add() a sesiones/{id}/tomas (create-only, no se puede leer,
editar ni borrar desde este link). Esta sección NO genera
numero/codigo (ej. BATERIA_T01) porque, al no poder leer el
histórico de tomas por la regla de Firestore, cualquier conteo
local sería incorrecto o duplicado entre distintas cargas de
página — se deja sin código y logistica.html lo muestra igual,
usando el nombre del instrumento como fallback (ya lo hacía). No
se tocó la sección Bitácora (Preamp/Gain), inputList, ni ninguna
otra lógica existente.
V2.0: Página standalone, SIN el sistema logueado de logistica.html (sin
firebase-auth, sin listado de proyectos). Se abre con
?p={proyectoId}&s={sesionId} — usa el ID de sesión que ya genera
Firestore como "secreto" (imposible de adivinar por fuerza bruta),
en vez de armar un sistema de tokens o colecciones nuevas.

DOS SECCIONES:
1. Bitácora — lee el inputList de esa sesión puntual, permite llenar
Preamp + Gain por canal. Guarda con update() sobre el documento
de la sesión, permitido solo si el ÚNICO campo modificado es
`inputList` (regla de Firestore).
2. Tomas (v2.0) — mismo formulario que logistica.html (instrumento,
rating, usar/descartar, nota). El selector de instrumento usa
`instrumentacionSesion` + `instrumentacionSesionIndividual` +
`instrumentacionSesionPiezas` (snapshot que logistica.html v2.5
guarda en la sesión) para expandir por pieza los grupos marcados
individual, igual que hace logistica.html. Antes de guardar, se
muestra un resumen de confirmación ("Vas a registrar: ...") con
botones Confirmar/Revisar — es el único punto de reversa que
tiene el ingeniero, porque una vez confirmado, la toma se crea
con `add()` (create-only) y no se puede editar ni borrar desde
este link (solo desde logistica.html, con login).

Ninguna de las dos secciones puede ver ni tocar ninguna OTRA sesión,
proyecto, nota, cliente ni dato del sistema. Requiere 2 reglas de
Firestore sin auth (ver comentario al final): (a) get + update
angosto en sesiones/{id} (igual que v1.0), (b) create-only, con
validación de esquema, en sesiones/{id}/tomas — sin read, sin
update, sin delete sin login. No se tocó proyecto.html, Cloudinary
ni Storage.

---

## ingeniero.html

### v1.2
(1) subtítulo "Panel de [Nombre]" junto al logo AUDIOLINK —
usa el campo `nombre` nuevo de ingenieros/{correo} (agregado en
proyecto.html v4.19), con fallback al correo si no lo tiene cargado
todavía; en modo staff normal (revisión, sin preview) dice "Modo
Staff · Revisión" en vez de un nombre. (2) el botón "Abrir bitácora
→" ahora manda &from=ingeniero en el link, para que bitacora.html
v2.11.2 pueda mostrar un "← Volver a mis proyectos" de regreso acá.
No se tocó el guard, el modo preview, ni el resto del listado/
detalle/sesiones.

### v1.1
modo vista previa para staff — ?preview=correo. Mismo patrón
que portal.html: valida que haya sesión de equipoInterno activa,
carga proyectosAsignados del ingeniero en preview (no el listado
completo que ve el staff normalmente), muestra banner "👁️ Vista
previa" y oculta el botón de cerrar sesión. Se dispara desde el
botón 👁️ del modal de Ingenieros en proyecto.html v4.18. No se tocó
el guard normal de staff/ingeniero, ni el resto del listado/detalle/
sesiones agrupadas por tema.

### v1.0
quinta pieza del login del Inge (v2.10 reglas, bitacora.html
v2.11.1 guard+retorno, proyecto.html v4.17 asignación, login.html
v1.8 reconoce ingenieros). Este es el "portal" del Inge — mismo
patrón visual/estructural que portal.html (header con VU meter,
listado de proyectos en grid, detalle con lista, mismas variables
--bg/--surf/--gold de Oro Profundo, mismo tema claro/oscuro con
localStorage), pero con diferencias a propósito:
(1) NO tiene login propio embebido — a diferencia de portal.html
(que usa una identidad de cliente separada), el Inge comparte el
mismo login.html/Auth que el staff. Este archivo solo trae el guard
de sesión (mismo patrón que logistica.html/proyecto.html), sin
pantalla de login ni fondo de neuronas — si no hay sesión válida,
redirige a login.html?next=ingeniero.html.
(2) Acepta equipoInterno (staff, para poder revisar/dar soporte) O
ingenieros (acotado por proyectosAsignados[]) — mismo doble criterio
que ya usa bitacora.html v2.11.
(3) Contenido técnico, no comercial: SIN cotización, SIN pagos, SIN
línea de tiempo de etapas (eso es contenido de cliente). En su lugar,
las sesiones se agrupan por TEMA (canción) — el modelo que se armó
en logistica.html v2.39/bitacora.html v2.9 — y cada sesión tiene un
botón directo "Abrir bitácora →" hacia bitacora.html?p=X&s=Y. Fechas/
horas/sala usan JetBrains Mono (--M) en vez de DM Sans, como toque
técnico sutil (lectura tipo timecode/rack), y las tarjetas de sesión
llevan un acento de borde izquierdo dorado (referencia visual a un
cable de patch) en vez del borde parejo de .sesion-card del portal
de cliente.
REQUIERE una regla de Firestore nueva: allow read en /proyectos/
{proyectoId} para esIngenieroDe(proyectoId) — hoy el rol ingeniero
solo puede leer sesiones/tomas/temas, no el doc del proyecto en sí
(necesario para mostrar el nombre del proyecto en el listado). Se
agrega en firestore_rules1.rules v2.11, comentada aparte para que
quede claro qué campos expone (nombre, cliente, narrativa — nunca
cotizaciones/pagos, que son subcolecciones con sus propias reglas
sin acceso de ingeniero).

---

## index.html

### v2.7
notificaciones flotantes de actividad de Vacas — nuevo listener
`collectionGroup('actividad')` (mismo feed liviano que ya usa
vaca.html para el portal público, sin tocar Rules ni ningún otro
archivo). Solo genera notificación visual para movimientos con
`creadoEn` posterior al momento en que cargó el Dashboard (no muestra
de golpe el historial existente). Contenedor fijo arriba-derecha,
máx. 3 tarjetas visibles + contador "+N más" si se acumulan. Clic en
cualquiera marca esa notificación como leída en localStorage (clave
`audiolink_vacaNotifLeidas`) y no vuelve a aparecer en futuras
visitas — sin redirigir a ningún lado por ahora (queda pendiente para
una iteración futura). No se tocó vacas.html ni vaca.html.

### v2.6
se agrega el panel "RESUMEN FINANCIERO · ESTE MES"
(Ingresos/Egresos/Balance), debajo de Próximas Sesiones y arriba de
Resumen Comercial. Dos listeners nuevos: `collectionGroup('pagos')`
(sin `.where()`, mismo patrón que `sesionesCal`, para no depender de
un índice compuesto nuevo) y `collection('egresos')` — el filtro de
"mes actual" se hace en el cliente (mismo criterio que usa
egresos.html). Balance = ingresos − egresos, coloreado verde/rojo
según el signo. Ambas tarjetas enlazan a pagos.html/egresos.html
respectivamente. Solo lectura, no gestiona nada desde acá. No se tocó
ningún otro panel ni listener existente. Con esto queda cerrado el
plan de mejoras acordado (alerta de vencidas + próximas sesiones +
resumen financiero); accesos directos del nav (punto 4) se revisó y
no requirió cambios — nav.js v1.3 ya está completo.

### v2.5
se agregan 2 mejoras al dashboard, ambas sin queries nuevas
a Firestore: (1) banner de alerta "⚠️ N entregas vencidas" arriba de
todo (visible sin scroll en mobile), calculado sobre `proyectos`
(mismo campo `estado` que ya usan `.badge`/`.dot`). (2) panel nuevo
"PRÓXIMAS SESIONES", ancho completo debajo del calendario/proyectos
(se apila en mobile con el `.layout` responsive existente), tomando
las próximas 5 sesiones de `sesionesCal` (ya cargado para el
calendario, sin query nueva). No se tocó `renderCalendario()`,
`eventosPorFecha()`, `renderListaProyectos()` ni el Resumen Comercial.
Pendiente (acordado, no implementado aún): panel de Resumen
Financiero (pagos/egresos, requiere 2 listeners nuevos y verificar
índices de `collectionGroup('pagos')`) y revisión de accesos directos
en `nav.js`.

### v2.4
se agrega `<script src="utils.js">` y se quita la copia
local de escapeHtml() — misma función, mismo resultado, ahora
centralizada (mismo patrón que proyecto.html/bitacora.html/
logistica.html/ingeniero.html). No se tocó renderListaProyectos(),
mostrarDia() ni ninguna otra lógica del dashboard. (Nota: esta
entrada reemplaza a la que decía "v1.10" — quedó registrada acá antes
de aplicarse al archivo real, con una numeración que no correspondía
a la línea de versiones vigente del archivo, v2.x. Este cambio es el
mismo, ya aplicado, con el número correcto.) Ver el comentario de
cabecera del archivo para el historial de versiones anteriores (aún
no migrado a este changelog).

---

## logistica.html

### v2.110
se extrae el bloque de configuración del header de PDF (logo, diffuser,
color, opacidades, tamaño/posición del logo — constantes, variables
globales, funciones actualizar*(), actualizarHeaderPreview() y la
restauración desde localStorage) a un archivo nuevo, header-config.js
v1.0, para reutilizarlo en el resto del ecosistema sin duplicar la
lógica en cada HTML que exporte PDF con el mismo tipo de header. Se
agrega `<script src="header-config.js">` y el DOMContentLoaded propio
ahora solo llama a inicializarHeaderConfig(). pintarHeader() (la lógica
jsPDF que realmente dibuja el PDF, dentro de exportarPDF() y
exportarPDFSesion()) no se tocó — sigue en este archivo, leyendo las
mismas variables globales que ahora provee header-config.js. Se agrega
también el botón "↺ Restablecer" en el panel de configuración,
enganchado a la función nueva resetearHeaderDefaults() (restablece
color/opacidades/tamaño/posición del logo a sus valores por defecto y
limpia esas claves de localStorage; no toca las rutas de logo/diffuser,
eso se considera contenido, no aspecto). No se tocó el resto del
archivo.

### v2.40
se quita la copia local de escapeHtml() — ya se cargaba
utils.js, que ahora también provee escapeHtml() (misma función,
mismo resultado). No se tocó nada más. Ver el comentario de cabecera
del archivo para el historial de versiones anteriores (aún no
migrado a este changelog).

---

## consentimiento.html

### v1.1
se quita la copia local de escapeHtml() — ya se cargaba
utils.js desde v1.0 solo para formatCOP(), ahora también provee
escapeHtml() (misma función, mismo resultado). No se tocó nada más.

---

## estudios.html

### v1.2
se quita la copia local de escapeHtml() — ya se cargaba
utils.js, que ahora también provee escapeHtml() (misma función,
mismo resultado). No se tocó nada más. Ver el comentario de cabecera
del archivo para el historial de versiones anteriores (aún no
migrado a este changelog).

---

## musicos.html

### v1.2
se quita la copia local de escapeHtml() — ya se cargaba
utils.js, que ahora también provee escapeHtml() (misma función,
mismo resultado). No se tocó nada más. Ver el comentario de cabecera
del archivo para el historial de versiones anteriores (aún no
migrado a este changelog).

---

## pagos.html

### v2.1
se quita la copia local de escapeHtml() — ya se cargaba
utils.js (fmt() ya delegaba en formatCOP() desde antes), ahora
también provee escapeHtml() (misma función, mismo resultado). No se
tocó nada más. Ver el comentario de cabecera del archivo para el
historial de versiones anteriores (aún no migrado a este changelog).

---

## portal.html

### v2.5
se quita la copia local de escapeHtml() — ya se cargaba
utils.js (desde v2.4, para formatCOP), que ahora también provee
escapeHtml() (misma función, mismo resultado). No se tocó nada más.
Ver el comentario de cabecera del archivo para el historial de
versiones anteriores (aún no migrado a este changelog).

---

## cotizador.html
### v9.53
se centraliza el catálogo de "Roles Musicales y
Postproducción" (Maquetación, Dirección Musical, Co-Arreglos,
Edición, Mezcla, Masterización) en un solo array ROLES_POST_ITEMS.
Antes el mismo patrón (chk-{id}/name-{id}/rate-{id}) estaba
copiado a mano en 3 funciones (calcularSubtotales, exportarPDF, y
el armado de ítems al guardar/exportar cotización) — 18 líneas
casi idénticas en total, con riesgo de que un ítem quedara en el
cálculo pero no en el PDF (o viceversa) si solo se tocaba un
lugar. Ahora las 3 funciones recorren el mismo array. Agregar un
ítem nuevo a futuro: sumar una línea al array (+ los 3 inputs
chk-X/name-X/rate-X en el HTML), nada más. Verificado con grep
que los 18 IDs referenciados (6 ítems × chk/rate/name) coinciden
exactamente con los inputs existentes en el HTML — mismo texto,
mismo orden, mismos $ que antes en los 3 lugares. No se tocó
Backline ni ninguna otra sección.

### v9.52
Comparador de Temas (modal "⚖️ Comparar Temas") — la fila
"— Grabación + Setup" (suma de Grabación neta + Setup Inge, agregada
en v9.49) ahora también muestra la etiqueta de horas (suma tal cual
de las horas de esas 2 filas, mismos datos ya calculados, sin
cálculo nuevo) en las columnas "1 Tema" y "N Temas", y la fila
completa se resalta con fondo dorado suave + negrita (clase
.fila-combo) para diferenciarla visualmente de las demás filas de
la tabla — no cambia ningún cálculo de $.

### v9.51
caja verde "Salas de Sesión" — la fila "Total (Grabación +
Setup)" ahora también muestra las horas totales sumadas tal cual
(suma directa de s.horas de todas las salas, mismo dato que ya
respalda el $ mostrado), sin depender de que haya setup > 0 (a
diferencia de las 2 líneas de arriba que solo aparecen si hay
setup). La fila completa se resalta con fondo dorado suave
(var(--gold-bg)) y texto en negrita para diferenciarla visualmente
del resto — no cambia ningún cálculo de $, solo agrega el label de
horas y el estilo de esa fila.

### v9.50
(pedido del usuario, solo texto/desglose, ningún cálculo de $
cambia) (1) Comparador de Temas: fila "Salas / Grabación" renombrada
a "Grabación neta" (mismo dato, subtotalSalas, para que no se
confunda con el total de sala que incluye setup). (2) Se agrega fila
"— Grabación + Setup" en esa misma tabla, justo debajo de Grabación
neta y Setup Inge — es la suma de esas 2 filas, no un dato nuevo.
(3) En la caja verde "Salas de Sesión" (renderSalasSesionesUI), la
fila "Total Salas (sesiones)" pasa a llamarse "Total (Grabación +
Setup)" — mismo valor (totalSalas), solo el nombre cambia para que
quede explícito que ya suma las 2 filas de arriba (Subtotal
Grabación + Subtotal Setup Inge).

### v9.49
REGLA DE SETUP REDEFINIDA (confirmado por el usuario, ver
bitacora.html v2.68)

### v9.49
REGLA DE SETUP REDEFINIDA (confirmado por el usuario, ver
bitacora.html v2.68) — el set-up del Inge ya NO se suma aparte del
rango horaInicio/horaFin, ahora va DENTRO de ese rango (ej. sesión
8:00-10:00 con set-up 60min = Setup 8:00-9:00 + Grabación 9:00-10:00,
total sigue siendo 2h, no 3h). Antes (v9.24) horasSala sumaba
tiempoSetupMin/60 por fuera de horas(horaInicio,horaFin), lo que
ahora duplicaría ese tiempo. horasSala pasa a ser igual a `horas`
directamente. setupHoras (desglose informativo Grabación/Setup Inge
en la UI y el PDF) NO cambia — sigue siendo el mismo dato, solo para
mostrar la proporción, nunca se resta del total cobrado.

### v9.48
(1) Comparador de Temas — "Técnicos" ya no usa el promedio
cacheado real (tecnicosDesdeSesionesCache) como base de horas en la
etiqueta; ahora usa Setup + Grabación neta del tema 1 (mismas horas
que ya muestran "Setup Inge" y "Salas / Grabación"), para que las 3
etiquetas sean consistentes entre sí (confirmado por el usuario: el
dato cacheado real podía traer una base distinta a la de sala/setup).
No cambia ningún cálculo de $, solo el texto de la etiqueta de horas.
(2) Estilo: las etiquetas grises de horas/escala del comparador
(.etiqueta-escala) pasan de gris apagado a un tono azul con
text-shadow tipo neón, usando la variable --blue ya existente en la
paleta del proyecto (misma que usan las cajas de Técnicos). Cambio
puramente visual, no se tocó ningún otro selector CSS.

### v9.47
Comparador de Temas — la fila "Salas / Grabación" deja de mostrar
la etiqueta fija "× temas" y ahora muestra horas reales, mismo patrón
que ya usa la fila "Técnicos" (ej. "1.50h → 3.30h"). Se agregan 2
variables locales a abrirComparadorTemas() (horasSalasTotalB, además
de la ya existente horasGrabacionPorTema para la columna A) que solo
arman el texto de la etiqueta — no tocan ningún cálculo de $. La
columna B resta la misma transición que ya se restaba en
"grabacionCostoB" ($), para que la etiqueta de horas sea el espejo
exacto de lo que se cobra. No se tocó ninguna otra fila, cálculo,
función ni bloque del archivo.

### v9.45
fix — Comparador de Temas, fila "Técnicos". El técnico está
desde que se abre la sala hasta que se cierra (confirmado por el
usuario), así que sus horas extra en escenarios de 2+ temas deben
crecer al mismo ritmo que el total real de horas de sala (setup +
transición + grabación neta de los temas 2+), no solo con la
transición. Antes (v9.43) se le pasaba a Técnicos el mismo
"horasExtraTransicion" que usa Setup, dejando sin pagar el bloque de
grabación neta del tema adicional — con setup 60min, transición
20min y 90min/tema, el técnico salía cobrando 2.83h en vez de las
4h reales de sala abierta para 2 temas. Ahora Técnicos usa su propia
variable "horasExtraTecnicos" = (temas-1) × grabaciónPorTema, que
equivale matemáticamente al crecimiento real de horas de sala
(salaTotal = setupBase + N × grabaciónPorTema, fórmula ya usada en
v9.44 para "Salas / Grabación"). No se tocó "Salas / Grabación" ni
"Setup Inge" — solo la fila "Técnicos" y su etiqueta de horas extra.

### v9.44
Comparador de Temas — la transición entre temas (2do en
adelante) ya NO se suma como tiempo extra encima de la grabación
completa. Ahora se resta de la grabación neta de esos temas y se
reclasifica hacia Setup — el bloque total de horas de sala por tema
adicional no crece, solo se reparte distinto entre "grabación" y
"setup/transición" (confirmado por el usuario). Técnicos siguen
usando la MISMA variable de horas extra (ya no un cálculo aparte),
para que ambos rubros no puedan desalinearse si se ajusta la
fórmula a futuro. Esto es SOLO dentro del Comparador (simulación) —
el cálculo real de sesiones (logistica.html/bitacora.html) queda
intacto a propósito: ahí el setup y las horas de técnico siguen
siendo independientes, por diseño de v9.24.

### v9.43
Comparador de Temas — "Técnicos" deja de ser "fijo". El
usuario confirmó que el ingeniero/asistente cobra por hora real
acordada, así que si la sesión se alarga por la transición del
2do tema en adelante, esas horas extra ahora se suman a cada
técnico × su propia tarifa (mismas horas de transición que ya usa
Setup Inge). calcularSubtotales() recibe un 6º parámetro opcional
tecnicosTransicionHorasOverride — sin él (caso real,
validarYCalcular() nunca lo pasa), el comportamiento queda
idéntico al de siempre.

### v9.42
fix — tarifaBlend (usada para el Setup del comparador)
promediaba TODAS las salas de la sesión, incluidas las que nunca
tuvieron setup real, arrastrando la tarifa hacia abajo y dejando el
Setup de 2 temas más barato que el de 1 tema pese a tener más horas.
Ahora tarifaBlend solo promedia las salas que sí tuvieron setup real.

### v9.41
fix del desfase de $ en el Comparador de Temas cuando hay
salas con tarifas distintas (ej. Estudio C $160.000/h + Estudio A
$270.000/h) — la columna "1 Tema" calculaba el Setup con
tarifaBlend (promedio de tarifas, $215.000/h en ese ejemplo) en vez
de la tarifa real de la sala donde ocurrió el setup ($270.000/h),
dejando "1 Tema" $55.000 por debajo del total real en vivo. Ahora,
si el campo Setup no fue editado a mano y cantActual === 1, se usa
el costo de Setup exacto (nuevo parámetro setupCostoOverride en
calcularSubtotales()) — "1 Tema" vuelve a ser espejo exacto del
total real. La columna "N Temas" sigue usando la proyección con
tarifaBlend, sin cambios (ahí no hay un "real" con qué compararse).

### v9.40
REFACTOR — validarYCalcular() (cotización real) ya no tiene
su propia copia de la fórmula de negocio; ahora llama a
calcularSubtotales() sin overrides (usa datos reales cacheados,
mismo comportamiento numérico de antes). Antes había 2 copias de
la misma lógica (validarYCalcular y calcularSubtotales) que había
que mantener sincronizadas a mano — riesgo real, ya se vio hoy con
el bug del promedio de músicos. De paso se corrigió un bug latente:
calcularSubtotales() sin musicosDescuentoOverride terminaba
aplicando igual "1+temasExtra" al costo de músicos (multiplicando
por cantidad de temas) — no afectaba nada hasta ahora porque el
comparador siempre pasa el %, pero se activaba apenas se conectara
con validarYCalcular(). Ahora sin ese override el factor es 1 fijo,
igual que el comportamiento histórico real. La caja verde de
renderSalasSesionesUI() (desglose Grabación/Setup Inge) no se tocó,
sigue leyendo salasDesdeSesionesCache por su cuenta (fase 2 futura,
pendiente de decisión aparte).

### v9.39
Comparador de Temas — el input "Setup 1er tema" ya no trae
60 min fijo por defecto. Al abrir el modal (solo la primera vez, no
en cada recálculo), si la sesión actual tiene 1 tema y hay setup real
cacheado, se precarga ese valor real; si no hay ningún setup cargado,
el campo queda vacío (placeholder "0") y el usuario decide qué poner.

### v9.38
Comparador de Temas — se separa la fila "Ejecución / Músicos"
en dos filas: "Músicos" (con el % de descuento desde 2do tema) y
"Técnicos" (fijo, sin descuento — tecnicosDesdeSesionesCache nunca
escala). Antes ambos se sumaban en una sola fila con la etiqueta de
%, lo que hacía parecer que la fórmula no cuadraba. calcularSubtotales()
ahora también retorna subtotalMusicos y subtotalTecnicos por separado.

### v9.37
fix de fórmula v9.36 — factorMusicosBlend estaba PROMEDIANDO
(dividiendo entre cantTemas), lo que dejaba el costo de 2 temas por
DEBAJO del de 1 tema solo. Corregido a fórmula aditiva: factor =
1 + temasExtra × (1 - %desc). Con 50% y 2 temas: 1 + 0.5 = 1.5×
el rate base (tema 1 al 100% + tema 2 al 50%, sumados).

### v9.36
Comparador de Temas — "Ejecución / Músicos" deja de ser "fijo"
y ahora aplica un % de descuento configurable desde el 2do tema
(default 50%, input "cmp-musicos-descuento"): tema 1 = tarifa
completa, temas adicionales = tarifa × (1 - %descuento). Aplica a
las 4 fuentes de músicos (Tarifa A, Tarifa B, Ensamble+Percusión,
musicosDesdeSesionesCache). Vive SOLO dentro de calcularSubtotales()
vía el nuevo parámetro musicosDescuentoOverride — validarYCalcular()
(cotización real, PDF, guardado) no se toca y sigue cobrando 100%
siempre, sin cambios de comportamiento.

### v9.35
"Salas / Grabación" en el Comparador de Temas pasa de "fijo"
a "× temas" — el usuario confirmó que la grabación neta (sin
contar setup) sí es ≈ proporcional al número de temas, a diferencia
del setup. Se toma el costo real de grabación cacheado (asumido
para la cantidad actual de "Cant. Temas"), se divide entre esa
cantidad para obtener el costo "por tema", y se escala × 1 y ×
escenarioB. calcularSubtotales() acepta un tercer parámetro opcional
grabacionCostoOverride para esto (sin él, sigue usando el dato real
tal cual, como antes — no afecta a otros llamadores).

### v9.34
el Comparador de Temas ya NO copia el mismo Setup Inge real
en ambas columnas (eso subestimaba el costo de "1 Tema", porque el
setup real ya está optimizado/reducido para grabar varios temas
juntos). Ahora se estima con la fórmula setup(N) = base + (N-1) ×
transición, con dos campos ajustables en el modal (default 60 min
/ 15 min, según lo indicado por el usuario). calcularSubtotales()
acepta un segundo parámetro opcional setupMinOverride para este fin
— sin ese parámetro, sigue usando el setup real cacheado como
antes (no afecta a ningún otro llamador de la función).

### v9.33
tres ajustes pedidos tras revisar el conjunto v9.24-v9.32:
(1) Comparador de Temas: "Salas / Ingeniería" se separa en "Salas /
Grabación" y "Setup Inge", mismo desglose que ya tenía la caja verde
desde v9.31/v9.32 (antes era un solo número fijo, ahora coherente
con el resto del cotizador). calcularSubtotales() devuelve
subtotalSetup aparte.
(2) Catálogo Avalado de Backline: la etiqueta "sugerido" ahora
distingue el motivo — "sugerido: alquilar" (dorado, coincidencia
con calidad=alquilar) vs "ya en el estudio (cobra aparte)"
(coincidencia con calidad=sirve); antes ambas se veían idénticas
aunque el motivo real fuera distinto. Prioridad: alquilar > sirve
si un ítem coincide con ambas listas.
(3) exportarPDF() y recolectarItemsPlanos(): la fila de cada sala
de sesión ahora se desglosa en "(Grabación)" + "(Setup Técnico)"
cuando hay setup > 0, en vez de una sola fila mezclada — el cliente
ahora ve esa distinción también en el PDF final. Si no hay setup,
se comporta exactamente igual que antes (una sola fila).

### v9.32
nueva línea "Subtotal Grabación (Xh)" junto a "Subtotal Setup
Inge" en la caja "Salas de Sesión" — horas/costo de grabación neta
(total de sala menos setup), para que el desglose quede completo:
Grabación + Setup Inge = Total Salas. Ambas líneas solo aparecen si
hay setup > 0 (si no hay setup, grabación = total, no aporta nada
nuevo mostrarla aparte).

### v9.31
nueva línea "Subtotal Setup Inge (Xh)" dentro de la caja
verde "Salas de Sesión", justo arriba de "Total Salas (sesiones)"
— suma horas y costo de setup de TODAS las salas del proyecto
(antes solo se veía la nota "(incl. Xh setup Inge)" por fila, sin
un total agregado). Solo aparece si el total de setup es > 0.

### v9.30
se retira el auto-check de resaltarCatalogoBackline() (v9.22/
v9.29) — con varias opciones del mismo instrumento en el catálogo,
auto-marcar todas las coincidencias obligaba a desmarcar a mano las
que no aplican. Ahora solo resalta en dorado la(s) fila(s) sugeridas
y el usuario marca la que corresponde. Nuevo: la fila cuyo checkbox
está marcado se resalta en verde (var(--green), vía CSS :has()),
para revisar de un vistazo qué quedó seleccionado.

### v9.29
se retira el mecanismo de aviso+checkbox de v9.27/v9.28 — el
usuario confirmó que el estudio SIEMPRE cobra aparte por el backline
"sirve tal cual" (aunque ya lo tenga), así que también debe sumarse
a la cotización. resaltarCatalogoBackline() ahora trata "sirve"
igual que "alquilar": auto-marca el checkbox real directamente, sin
paso intermedio. Vuelve al comportamiento simple de v9.22-v9.23.

### v9.28
fix — el acordeón del Catálogo Avalado de Backline solo se
abría automáticamente cuando había coincidencia "alquilar" (v9.22);
si el único match era un aviso "sirve" (v9.27, "ya disponible en el
estudio"), el acordeón quedaba cerrado y el aviso invisible aunque
sí se hubiera generado en el DOM. Ahora también abre con avisos.

### v9.27
resaltarCatalogoBackline() ahora también detecta ítems del
Catálogo Avalado que coinciden con backline "sirve tal cual" del
estudio (ya disponible, no necesita alquiler) — a esos NO se les
marca el checkbox real (eso seguiría cobrando un alquiler que no
aplica), sino que se les agrega un aviso azul con checkbox propio
("Ya disponible en el estudio — cotizar igual") para que el usuario
decida caso a caso; si lo marca, ahí sí activa el checkbox real y
entra al cálculo. El auto-check de ítems "alquilar" (v9.22) sigue
igual y tiene prioridad si un ítem coincide con ambos.

### v9.26
la caja verde "Salas de Sesión" ahora desglosa cuánto de las
horas totales es setup del Inge — ej. "3.0h × $X (incl. 0.5h setup
Inge)". Nuevo campo setupHoras en salasAcumulado, acumulado aparte
de horas (que sigue siendo la que se cobra, sin cambios desde
v9.24/v9.25). setupHoras es solo texto informativo, no entra en
ningún cálculo ni se resta de nada.

### v9.25
fix — el cálculo automático de "Salas de Sesión" (listener de
proyectos/{id}/sesiones) ignoraba tiempoSetupMin, el campo que el
Inge carga en bitacora.html (selector "Set-up necesario"). Ahora las
horas de sala = horasEntre(horaInicio,horaFin) + tiempoSetupMin/60,
usando una variable nueva horasSala separada de horas (la de
Técnicos no cambia). Como tiempoSetupMin vive por sesión y no por
tema, si el Inge agrupa 2+ temas en una sola sesión el setup ya
queda contado una sola vez de forma natural — no requiere dividir
nada a mano. No se tocó bitacora.html ni el cálculo de Técnicos/
Músicos de sesión.

### v9.24
nuevo "Comparador de Temas" (botón junto a Cant. Temas) — abre
un modal que muestra lado a lado el subtotal con cantTemas=1 vs el
valor actual de track-qty (si es 1, compara contra 2). Usa una función
nueva y aislada, calcularSubtotales(cantTemasOverride), que replica en
modo solo-lectura la misma lógica de validarYCalcular() (Salas,
Backline, Ejecución/Músicos fijos — no escalan con temas; Post-
producción sí escala ×cantTemas) pero sin escribir nada en el DOM ni
llamar guardarBorrador(). No se modificó validarYCalcular() ni ninguna
otra función de cálculo existente — el comparador es 100% aditivo.

### v9.23
fix — resaltarCatalogoBackline() (v9.22) solo se disparaba en

### v9.23
fix — resaltarCatalogoBackline() (v9.22) solo se disparaba en
el flujo manual (selector de estudio, vía actualizarNombresSalas()),
no en el flujo de proyecto vinculado (caja verde "Salas de Sesión",
renderSalasSesionesUI()). Se agrega la misma llamada ahí, combinando
el backline de todas las salas del caché de sesiones
(salasDesdeSesionesCache). No se tocó nada más del cálculo de salas
ni de recolectarItemsPlanos().

### v9.22
resaltarCatalogoBackline() ahora, además de resaltar visualmente
la fila sugerida, marca automáticamente el checkbox .chk-backline
correspondiente cuando hay coincidencia (antes solo resaltaba y el
usuario tenía que marcarlo a mano). El usuario sigue pudiendo
desmarcar cualquier fila que no aplique — reversible, no bloquea
nada. Al final de la función, si hubo alguna coincidencia, se llama
una vez a validarYCalcular() para que el subtotal refleje los ítems
recién marcados. No se tocó el matching por palabras, el catálogo
de tarifas, formatearBackline() ni pintarBackline().

### v9.21
fix real del bug "no carga backline con proyecto vinculado"
(se corrige el intento de v9.20, que quedó a medias). El backline de
sala vivía SOLO dentro de bloque-salas-manuales (backline-sala-a/b/c,
anidados en cada row-sala-a/b/c junto al checkbox manual), bloque que
aplicarDatosProyectoVinculado() oculta por diseño (v9.11) cuando hay
proyecto vinculado, porque las salas se cobran automático vía
salasDesdeSesionesCache. v9.20 mostraba esas filas para no perder el
backline, pero eso traía de vuelta los checkboxes/tarifas manuales
vacíos, duplicados con la caja verde "Salas de Sesión" de abajo. Se
revierte v9.20 (vuelve a ocultarse todo bloque-salas-manuales, como
v9.11 original) y en su lugar se agrega el backline directamente a
la caja verde automática: dentro de escucharTecnicosDesdeSesiones(),
salaData ahora también arma backline = backlineGeneral (estudio) +
backline propio de la sala (mismo criterio que combinarBackline() de
actualizarNombresSalas()), y renderSalasSesionesUI() lo pinta con
formatearBackline() (ya existente, sin duplicar lógica), debajo de
las specs. En modo selector manual (sin proyecto) no cambia nada —
sigue viéndose el backline dentro de cada Estudio A/B/C como siempre.

### v9.20
fix — con proyecto vinculado, el backline de sala (backline-
sala-a/b/c) dejaba de verse porque vivía anidado dentro de
bloque-salas-manuales, y aplicarDatosProyectoVinculado() ocultaba
ese contenedor completo al vincular un proyecto (las salas pasan a
cobrarse automático vía salasDesdeSesionesCache). El dato se seguía
calculando bien por debajo (cambiarEntorno() -> actualizarNombresSalas()
-> pintarBackline()), solo quedaba invisible. Ahora, en vez de ocultar
todo bloque-salas-manuales, se ocultan solo los 3 row-sala-a/b/c
(checkboxes + tarifas manuales) y el contenedor padre —con el
backline adentro— queda visible. No se tocó ninguna función de
cálculo ni pintarBackline()/actualizarNombresSalas().

### v9.19
BACKLINE_CALIDAD_LABELS suma la etiqueta para el nuevo valor
'musico' agregado en estudios.html v2.1 ("🎤 lo trae el músico"),
para que formatearBackline() lo muestre bien en el resumen de sala.
resaltarCatalogoBackline() no cambió: ya filtraba estrictamente por
calidad==='alquilar', así que un ítem 'musico' queda excluido del
Catálogo Avalado de Backline sin tocar esa función.

### v9.18
el backline de sala (pintarBackline, dentro de
actualizarNombresSalas) ya no depende de specsVisibles — antes, si
ese check no estaba marcado, el backline se ocultaba aunque la sala
tuviera ítems cargados. Ahora se muestra siempre que haya al menos
un ítem (propio de la sala o backlineGeneral del estudio),
independiente de specsVisibles. specsVisibles sigue controlando
únicamente el texto libre de specs, sin cambios ahí. No se tocó
resaltarCatalogoBackline() ni ningún cálculo.
V9.17.1 (hotfix): en v9.17 la función resaltarCatalogoBackline() había
quedado sin cerrar su llave final — el código de BACKLINE_CALIDAD_LABELS
y formatearBackline() quedó accidentalmente anidado dentro de ella,
rompiendo la sintaxis de todo el script y dejando la página aislada
(no cargaban proyectos ni nada dependiente de ese JS). Se agregó el
"}" faltante justo después de "if(acordeon && huboCoincidencia)
acordeon.open = true;", separando de nuevo resaltarCatalogoBackline()
de BACKLINE_CALIDAD_LABELS/formatearBackline() como bloques
independientes, tal como estaban antes de v9.17. No se modificó
ninguna otra línea ni lógica de cálculo.

### v9.17
nueva función resaltarCatalogoBackline() — al elegir estudio,
cruza los ítems marcados "alquilar" en el diagnóstico nuevo
(estudios.html backline/backlineGeneral) contra las etiquetas fijas
del Catálogo Avalado de Backline (el acordeón de tarifas por día que
ya existía) y resalta visualmente las filas que probablemente
correspondan, por coincidencia de palabras entre subgrupo/descripción
y el label de cada fila del catálogo. Es solo un realce visual +
abrir el acordeón si hay coincidencias — no marca checkboxes, no
toca el cálculo ni las tarifas. El catálogo de tarifas y el
diagnóstico de calidad siguen siendo dos datos separados a propósito
(decisión tomada con el usuario), esto solo los conecta visualmente.

### v9.16
actualizarNombresSalas() ahora combina backlineGeneral del
estudio (estudios.html v1.9, campo nuevo a nivel de estudio, para
estudios donde el backline no es por sala sino compartido, ej.
Icesi) con el backline propio de cada sala antes de mostrarlo — si
el estudio no tiene backlineGeneral, se comporta igual que v9.15.

### v9.15
actualizarNombresSalas() ahora también muestra el backline de
cada sala (estudios.html v1.7/v1.8, salaA/B/C.backline=[{categoria,
subgrupo,descripcion,calidad}]), agrupado por categoría, justo debajo
de las specs — mismo criterio de visibilidad (specsVisibles), y
además solo si la sala tiene ítems de backline cargados (si no, no
deja espacio vacío). Pensado para ver de una vez, al elegir sala en
la cotización, qué cubre el estudio y qué toca presupuestar aparte
en alquiler. Nueva función formatearBackline(). No se tocó el chip
"Salas de Sesión" (renderSalasSesionesUI) ni ningún cálculo.

### v9.14
se aumenta un poco el tamaño en mobile de los campos
(.text-input, nuevo @media max-width:640px, font-size:16px para
evitar el auto-zoom de iOS al tocar un campo) y del botón de acción
principal (.btn-action). .btn-icon ("⋮") sube de 38px a 42px. No se
tocó ninguna fórmula de cálculo, el borrador local, ni la
exportación a PDF. Mismo ajuste aplicado en paralelo a los otros 10
archivos del ecosistema y a nav.css v1.1.

### v9.13
se retira el bloque de CSS de navegación (sidebar/mobile-topbar/
bottomnav/panel "···") que estaba copiado y pegado en este archivo —
ahora vive centralizado en nav.css (<link> agregado en el <head>).
Esto corrige de paso un bug real: al header propio de esta página
(el que muestra "CENTRAL DE OPERACIONES...") le faltaba la regla
header{display:none} en el breakpoint mobile, así que quedaba
duplicado visualmente encima de la topbar mobile que inyecta nav.js;
nav.css ya trae esa regla, así que se corrige sola. También se
reemplaza la regla .btn-icon (que vivía metida dentro del @media con
propiedades extra de fondo/borde que no tenía el resto del
ecosistema) por la versión canónica, base y fuera de cualquier
media query, igual que en el resto de páginas. No se tocó ninguna
fórmula de cálculo, el borrador local, ni la exportación a PDF.

### v9.12
se reconstruye el bloque manual de Músicos de Sesión (Tarifa A,
Tarifa B y Ensamble de Percusión de 3 músicos) que existía antes de
v9.4 y se había quitado al agregar el automático desde sesiones.
Vuelve SOLO para cotizaciones sueltas (sin proyecto vinculado) — con
proyecto vinculado se oculta y desmarca, igual que bloque-salas-manuales,
porque ahí ya se cobra automático vía musicosDesdeSesionesCache.
Tarifas reconstruidas en $0 a propósito (no había forma de recuperar
los valores originales) — AUDIOLINK las ajusta directamente. Se
conecta a validarYCalcular(), exportarPDF() y recolectarItemsPlanos().

### v9.11
las 3 salas manuales (checkboxes Estudio A/B/C) ahora se
ocultan cuando hay proyecto vinculado (todo se cobra automático vía
salasDesdeSesionesCache) y se desmarcan al ocultarse, igual que ya
pasa con "Entorno Operativo Principal". Se mantiene la cotización
suelta (sin proyecto vinculado) intacta — ahí las salas manuales y
el selector de Entorno siguen visibles y funcionando igual que
siempre, por decisión explícita de AUDIOLINK. No se tocó ningún
cálculo ni la lógica de tieneSalaA/B/C existente.

### v9.10
el chip verde "Salas de Sesión" ahora también muestra las
specs/preamps de cada sala (mismo campo 'specs' de salaA/B/C en
Firestore que ya usan las salas manuales), solo cuando el estudio
tiene 'specsVisibles' activo — mismo criterio que actualizarNombresSalas()
para las salas manuales. No se tocó ningún cálculo ni las salas
manuales A/B/C.

### v9.9
(1) el chip verde "Salas de Sesión" ahora muestra también el
nombre del estudio de cada sala (ESTUDIOS_DATA[s.estudioId].nombre),
no solo el nombre de la sala; (2) el selector "Entorno Operativo
Principal" se oculta cuando hay proyecto vinculado y se hereda
automáticamente el estudio más usado en las sesiones de ese proyecto
(conteo por estudioId dentro de escucharTecnicosDesdeSesiones(), solo
se aplica si cambia respecto al valor actual, para no resetear
tarifas manuales editadas en cada actualización del snapshot). Sin
proyecto vinculado, el selector vuelve a mostrarse igual que antes
(cotización suelta). No se tocó la lógica de las salas manuales
A/B/C ni ningún cálculo existente.

### v9.8
mejora visual de las 3 cajas "automático desde sesión" (Técnicos/
Músicos/Salas de Sesión) — pasan de texto plano separado por <br> a
tarjetas tipo "chip" con color por categoría (azul Técnicos, morado
Músicos, verde Salas), usando nuevas variables --blue/--purple (y el
--green ya existente) definidas para ambos temas (oscuro/claro). Solo
cambia el render de esas 3 cajas (renderTecnicosSesionesUI(),
renderMusicosSesionesUI(), renderSalasSesionesUI()) y su HTML/CSS
asociado — no se tocó ningún cálculo, subtotal, ni la exportación PDF.

### v9.7
se completa la funcionalidad de "salas automáticas desde
sesiones" que había quedado a medias en una edición anterior (el
código ya sumaba salasDesdeSesionesCache en 3 lugares —subtotal,
PDF y guardado en proyecto— pero esa variable nunca se declaraba ni
se llenaba, lo que producía un ReferenceError en cada
validarYCalcular() y rompía en cascada el cálculo y el guardado).
Se agrega: (1) declaración y llenado de salasDesdeSesionesCache
dentro de escucharTecnicosDesdeSesiones(), agrupando por s.sala
(campo de logistica.html) y sumando horas, con la tarifa vigente
tomada de ESTUDIOS_DATA[s.estudioId]; (2) caja visible "Salas de
Sesión" (mismo patrón que Técnicos/Músicos de Sesión) vía
renderSalasSesionesUI(). No se tocó la lógica de salas manuales
(checkboxes Estudio A/B/C) ni ninguna fórmula existente.

### v9.6
(1) las salas del estudio (Estudio A/B/C) ahora se ocultan (y
se desmarcan si estaban chequeadas) cuando el estudio seleccionado
no tiene esa sala configurada en Firestore — antes se mostraban
igual como "Sala B"/"Sala C" genéricas con tarifa $0, aunque el
estudio real solo tuviera 1 o 2 salas; (2) el cliente SÍ se hereda
desde v9.2 (aplicarDatosProyectoVinculado(), campo client-name) —
confirmado, sin cambios necesarios ahí; (3) el campo "Nombre del
Tema / Proyecto" se oculta cuando hay un proyecto vinculado (queda
sincronizado automáticamente con proyectoVinculadoData.nombre, ya
no hace falta escribirlo aparte) y vuelve a aparecer si se trabaja
una cotización suelta sin vincular, para no romper ese caso. No se
tocó ninguna fórmula de cálculo, el borrador local, ni la
exportación a PDF.

### v9.5
se retira el rubro manual "Ingeniería de Grabación" (chk-ing,
grupo "Soporte Técnico Especializado" completo, y su datalist
lista-ingenieros) — quedaba redundante con los Técnicos de Sesión
automáticos (v9.2): cualquier ingeniero que grabe una sesión ya se
cobra solo con estar en tecnicosAsignados de logistica.html, y
mantener el checkbox manual abría la puerta a cobrarlo dos veces por
descuido. Se quitan sus 3 bloques de lógica (subtotal, PDF, guardado
en Firestore). No se tocó ninguna otra fórmula de cálculo, el
borrador local, ni la exportación a PDF de los rubros que sí quedan.

### v9.4
(1) las listas automáticas de Técnicos y Músicos de Sesión ahora
muestran también el rol/instrumento de cada persona (t.rol desde
tecnicosAsignados, m.instrumento desde musicosAsignados — ambos ya
existían en logistica.html, solo faltaba mostrarlos acá); (2) se
retiran los rubros manuales "Músicos de Sesión (Tarifa A)", "(Tarifa
B)" y "Ensamble de Percusión (3 Músicos)" — checkboxes, inputs y sus
3 bloques de lógica (subtotal, PDF, guardado en Firestore) quedan
reemplazados por el bloque automático de músicos desde sesiones
(v9.3); (3) fix en cargarEstudiosDesdeFirestore(): se descartan
documentos de la colección 'estudios' sin campo `nombre` (o solo
espacios), que aparecían como una opción vacía en el selector
"Entorno Operativo Principal" — no se tocó el filtro de 'activo'
existente. No se tocó ninguna otra fórmula de cálculo, el borrador
local, ni la exportación a PDF de los rubros que sí quedan.

### v9.3
tres cambios sobre el bloque de herencia automática desde el
proyecto/sesiones vinculadas: (1) aplicarDatosProyectoVinculado()
ahora también autocompleta "Cant. Temas" (track-qty) desde
proyectoVinculadoData.cantTemas (proyecto.html v4.16), con el mismo
criterio no-destructivo que ya usa para cliente/tema (solo si el
campo sigue en su valor por defecto "1"); (2) nuevo bloque "Músicos
de Sesión (automático, desde Logística)", mismo patrón que el de
Técnicos (v9.2): escucha proyectos/{id}/sesiones, lee el campo
musicosAsignados (logistica.html v2.32, con su nuevo subcampo
canales) y suma tarifa×canales por CADA aparición del músico (si
toca en 3 sesiones del proyecto, se cobra 3 veces — pedido
explícito, no se deduplica). Se suma a subtotalEjecucion, igual que
técnicos, y entra automáticamente al PDF y a
recolectarItemsPlanos(); (3) tanto la lista de técnicos como la de
músicos ahora muestran el valor $ calculado al lado de cada persona
y un total dentro de su propia caja (no se agrega fila nueva en el
resumen general, para no duplicar visualmente lo que ya estaba
sumado en Subtotal Ejecución); (4) FIX: los técnicos automáticos
(v9.2) nunca se habían agregado a recolectarItemsPlanos() — se
veían bien en pantalla y en el PDF, pero no quedaban guardados al
usar "Guardar Cotización en el Proyecto". Se agrega ahí, misma
fuente (tecnicosDesdeSesionesCache) que ya usan validarYCalcular()
y exportarPDF(). No se tocó ninguna fórmula de cálculo existente,
el borrador local, ni la exportación a PDF de los rubros manuales.

### v9.1
fix de contraste en tema claro. Varios textos (h1, títulos de
panel, inputs de texto y numéricos, subtítulo de sala) tenían el color
hardcodeado en blanco (#FFFFFF) o en un gris fijo (#9A8F7A) en vez de
usar var(--txt)/var(--muted). En oscuro no se notaba (--txt es casi
blanco), pero en claro quedaban textos blancos sobre fondo claro,
casi ilegibles. Se cambiaron esos 6 valores hardcodeados a las
variables de tema correspondientes. No se tocó ningún estilo de
impresión (@media print, que usa negro/blanco fijo a propósito para
el PDF) ni ninguna fórmula de cálculo.

### v9.0
Dos pendientes cerrados: (1) el cotizador ahora tiene soporte
completo de tema claro/oscuro (script de aplicación temprana +
bloque :root[data-tema="light"] a juego con su propia paleta +
soportaTema activado en NAV_CONFIG, el botón de tema ya aparece en
el nav); (2) el botón "Guardar Cotización en el Proyecto" ahora
muestra un texto de ayuda debajo explicando por qué está
deshabilitado (falta completar el formulario, o falta vincular un
proyecto). No se tocó la lógica de habilitado/deshabilitado
existente ni ninguna fórmula de cálculo.

### v8.9
formatCOP() ahora vive en utils.js (compartido). Se agrega <script src="utils.js"> junto a firebase-config.js. No se tocó ninguna llamada a formatCOP() ni ninguna fórmula.

### v8.8
el sidebar/topbar mobile/panel "···"/bottomnav (antes
copiados y pegados en cada archivo) ahora se cargan desde nav.js
(compartido por todo el ecosistema), inyectados en <div id="nav-
mount"></div>. Las funciones cerrarSesion(), toggleTema(),
toggleMasMobile() y el colapsar del sidebar también se movieron a
nav.js. Los ítems específicos de esta página (si los hay) se pasan
via window.NAV_CONFIG antes de cargar nav.js. No se tocó ninguna
otra lógica ni el CSS existente de .sidebar/.mobile-topbar/etc.

### v8.7
firebaseConfig deja de estar copiado en este archivo; ahora se
carga desde firebase-config.js (compartido por todo el ecosistema,
mismos valores exactos). Se agrega <script src="firebase-config.js">
en el <head>, justo después de firebase-firestore-compat.js. No se
tocó firebase.initializeApp() ni ninguna otra lógica.

### v8.6
fix bug de impresión/PDF — la topbar mobile, el bottomnav mobile,
el panel "···" y el sidebar (agregados en v8.2) no estaban ocultos en
@media print, así que se colaban al final del PDF exportado. Se agrega
regla que oculta .sidebar/.mobile-topbar/.mobile-bottomnav/.mas-mobile-
panel solo en impresión. También se agrega clear:both a
.print-footer-container para que el bloque de totales no quede mal
posicionado cuando hay notas (que usan float:left) antes de él. Cambios
100% CSS dentro de @media print; no se tocó ninguna fórmula de cálculo,
el borrador local, el guard de sesión, ni la lógica de exportarPDF().

### v8.5
las specs técnicas/gear de cada sala dejan de estar fijas en el
HTML (antes solo existían para ICESI, texto hardcodeado). Ahora salen
del campo 'specs' de cada sala en Firestore (editable como texto libre
desde el modal Estudios en proyecto.html — layout, preamps, mics,
monitores, lo que se necesite). Los saltos de línea se respetan como
<br>. No se tocó ninguna fórmula de cálculo ni la exportación a PDF.

### v8.4
fix — cargarEstudiosDesdeFirestore() combinaba where('activo','==',
true) con orderBy('nombre'), lo que exige un índice compuesto en
Firestore que no existía, y hacía fallar la consulta silenciosamente
(mensaje "Error cargando estudios" en el selector). Se cambia a traer
todos los estudios ordenados por nombre y filtrar 'activo' en JS. No
se tocó ninguna otra lógica.

### v8.3
el selector "Entorno Operativo Principal" deja de tener 3
opciones fijas en el código (ICESI/Externo/Home Studio). Ahora se
llena en tiempo real desde la colección Firestore 'estudios' (activo:
true), editable desde el modal "Estudios" en proyecto.html. Se
reemplazan TARIFAS_ENTORNOS/NOMBRES_SALAS_ENTORNOS por ESTUDIOS_DATA +
cargarEstudiosDesdeFirestore(). Al abrir el modal "Estudios" por
primera vez en proyecto.html se siembran automáticamente los 3
entornos originales, así que el comportamiento no cambia hasta que se
edite algo. cargarEstudiosDesdeFirestore() respeta el entorno y las
tarifas que el borrador local (localStorage) tenía guardados, en vez
de resetear siempre al primer estudio de la lista. No se tocó ninguna
fórmula de cálculo, el borrador local, ni la exportación a PDF.

### v8.2
se replica la arquitectura de navegación V2.7 de proyecto.html —
sidebar fija desktop (heredada de Andamios, colapsable a solo-iconos) +
mobile topbar/bottomnav/panel "···" (heredado de PsicoGestión),
reemplazando el link "← Volver" suelto del header. Se envuelve
.container en un nuevo .main-wrap que se ajusta al ancho del sidebar
(el .container conserva su max-width/margin:0 auto tal cual). Se
agregan también los créditos de diseño (Marto 🧠 · martowave@gmail.com)
al pie del sidebar y del panel móvil. No se tocó ninguna fórmula de
cálculo, el borrador local, el guard de sesión, ni la exportación a
PDF existentes.

### v8.1
se incorporan efectos visuales del diseño ICESI (index.html),
elegidos pensando en mobile (nada depende de :hover para funcionar):
glow de foco en inputs, sombra suave en paneles al pasar el mouse
(desktop), barras VU decorativas junto al título, flecha animada en el
acordeón de backline, y un pulso sutil en el botón "Guardar Cotización"
que se activa solo cuando el formulario ya está listo pero falta
vincular un proyecto. Todo aditivo: no se tocó ninguna regla CSS ni
función JS existente, solo se agregaron reglas y dos líneas que
alternan una clase. No se aplicó a proyecto.html ni a login.html.

### v8
se agrega guard de sesión de equipo interno (mismo patrón de
login.html/proyecto.html), vínculo a un proyecto de Firestore (por
?id=... en la URL o selector si se abre suelto) y botón "Guardar
cotización en proyecto", que escribe en proyectos/{id}/cotizaciones con
el mismo formato {items, total, estado, notas, validez, creadoEn} que ya
lee el Cotizador simple de proyecto.html. No se tocó ninguna fórmula de
cálculo, el borrador local, ni la exportación a PDF existentes.

---

## vacas.html

## vacas.html

### v1.80
copiarLinkInvitacion() ahora copia un mensaje completo en vez de solo
la URL pelada — mismo criterio que notificarWhatsApp() (organizador
desde localStorage si existe, si no cae a texto genérico): `Hola! Soy
{organizador} y los invito a la vaca "{nombre}". Confirma tu
participación aquí: {url}`. Es el link GENERAL (sin &p=), no lleva
nombre de participante. No se tocó el toast ni la función de copiado
en sí, solo qué texto arma.

### v1.79
control "avisado" por participante — botón pill (🔔/✅) al final de
cada fila, junto a la flecha de expandir. Se marca automáticamente al
usar el botón "📲 Avisar" (notificarWhatsApp()), y también se puede
togglear manual en cualquier momento (para cuando se avisó por otro
medio). Nuevo campo `avisado` (boolean) en el doc de cada
participante, vía función toggleAvisado(). No afecta cuotas, abonos
ni ninguna otra lógica. También se quita la mención "en AUDIOLINK"
del mensaje de notificarWhatsApp() (pedido explícito — el participante
no debe ver el nombre del ecosistema interno).

### v1.78
(1) fix de parpadeo/repaint al hacer scroll en móvil — se agrega
`will-change: transform` a `.mobile-topbar`, `.mobile-bottomnav` y
`#toast` dentro de `@media (max-width:768px)`, para moverlos a su
propia capa de composición GPU. (2) filas de participantes en móvil
pasan de mini-cards apiladas (todo el detalle siempre visible) a
filas colapsables: la cabecera muestra solo avatar + nombre + chip de
estado + flecha; al tocar se expande el detalle (abonado, contacto,
acciones) con transición suave (max-height/opacity). Nueva función
toggleFilaPart(). Todos los botones de acción llevan
event.stopPropagation() para no disparar el toggle de la fila al
pulsarlos. Desktop (≥769px) no se tocó — la tabla sigue igual.

### v1.53
footer del PDF (exportarAbonosPDF) cambia de "Diseñado por: Marto 🧠"
al mismo texto exacto que usa el crédito del sidebar (.sb-credit en
nav.js / .app-credit en vaca.html): "Marto 🧠 · martowave@gmail.com".
Solo ese texto — nada más del PDF se tocó.

### v1.52
exportarAbonosPDF(): los participantes tipo 'libre' (aporte libre, sin
cuota fija) ya no muestran "pendiente" en la tabla "Saldo por
participante" del PDF, porque no tiene sentido comparar su abonado
contra cuota_fija (mismo criterio que ya aplica vaca.html en el portal,
donde 'libre' oculta el estado pendiente/al día). Ahora muestran
"Aporte libre" en gris en la columna Saldo. También se excluyen del
cálculo de "Total a devolver" (antes su excedente contra la cuota fija
se sumaba ahí sin sentido). No se tocó ninguna otra columna, tabla,
cálculo de abonado real, ni exportarAbonosCSV().

### v1.44
FIX — el selector de avatar de v1.43 usaba d.url, pero el campo real en
avataresIconos (definido en avatares-iconos.html) es d.urlCloudinary; por
eso ninguna miniatura cargaba y solo se veía la opción "sin avatar" (🚫),
como reportó el usuario con captura de pantalla. Corregido en
cargarCatalogoAvataresParticipante(). Aprovechando el fix: la cuadrícula
del selector y la miniatura de la tabla de participantes ahora usan la
transformación liviana de Cloudinary (w_150/w_100,h_150/h_100,c_fill,
f_auto,q_auto) en vez de la imagen completa — mismo patrón que
urlMiniatura() en avatares-iconos.html. El valor guardado en avatarUrl
sigue siendo la URL original sin transformar. No se tocó nada más.

### v1.43
selector de avatar (opcional) al agregar participante desde el panel
admin — cuadrícula clickeable cargada del catálogo avataresIconos
(compartido con avatares-iconos.html), filtrada a tipo='avatar' y
activo==true, cargada bajo demanda (no tiempo real) al abrir el modal.
Guarda avatarUrl en el doc del participante y en su espejo integrantes.
La tabla de participantes ahora siempre muestra esa miniatura (o un
ícono 👤 genérico si no tiene) en columna nueva al inicio de cada fila.
No se tocó crearParticipante() en su lógica de cuotas/transacción —
solo se agregó el campo avatarUrl a los tx.set() que ya existían.
Requirió firestore.rules v2.24 (esquema de create en /integrantes
ampliado con avatarUrl opcional) y ver también el patrón documentado en
ARQUITECTURA.md sección 4 para reutilizarlo en catálogos futuros.

## vaca.html

### v1.79
lista pública de Integrantes (cargarIntegrantes()) ahora se ordena
siempre alfabéticamente por nombre (antes quedaba en orden de
inserción/registro, sin ayudar a nadie a ubicarse). Si el admin tiene
activo `ordenarPorAporte` en la vaca, ese agrupamiento (pendientes →
aportaron → libres) manda, pero el orden alfabético queda dentro de
cada grupo (Array.sort() de JS es estable). No se tocó
mostrarEstadoIntegrantes ni ocultarLibresDeLista.

### v1.78
varios ajustes pedidos tras revisión del portal:
(1) `<title>` deja de decir "Vaca · AUDIOLINK · v1.77" y pasa a solo
"Vaca" — WhatsApp usa el `<title>` para el preview del link antes de
enviar, y mostraba el nombre del ecosistema interno + número de
versión a quien recibía la invitación. document.title ahora se
actualiza dinámicamente en renderHeaderVaca() a "{nombreVaca} · por
{organizador}" (o solo el nombre si no hay organizador en
localStorage) — sin ninguna alusión a AUDIOLINK.
(2) vistaBienvenida reescrita — título destacado "🐄 Te están
invitando a esta vaca", explicación corta con mención explícita de la
alternativa de aporte libre desde el primer momento (se había perdido
al simplificar el texto original), CTA "Quiero unirme 🐄" a ancho
completo. El tutorial no se tocó (ya no tiene paso de bienvenida
redundante desde v1.70).
(3) tema por defecto pasa de oscuro a claro (`dia`) — se respeta el
localStorage de quien ya lo haya cambiado antes. Iconos del toggle
invertidos a pedido explícito: 🌙 en modo claro, 🌞 en modo oscuro.
Paleta de puntos animados (PALETAS_FONDO.dia) cambia de tonos
verde-bosque/naranja-tierra (chocaban con el fondo frío) a turquesa/
azul-grisáceo/dorado, a juego con --accent.

### v1.77
aviso visible en el portal cuando la vaca está cerrada (banner rojo
arriba del header, "🔒 Esta vaca está cerrada — no se aceptan más
aportes."). Antes un participante ya registrado entraba a su portal
normal sin ningún indicio del cierre — solo se bloqueaba el registro
de gente NUEVA (vistaError). Se muestra/oculta en renderHeaderVaca()
según vacaData.estado. Ver también firestore.rules v2.27 (candado
equivalente a nivel de Rules).

### v1.76
FIX reportado por el usuario — el checkbox "Ocultar montos en el feed
de actividad" (vacas.html v1.49, campo ocultarMontosActividad en el
doc de la vaca) no tenía ningún efecto en el portal: cargarActividad()
en vaca.html nunca leía ese campo y siempre mostraba "+$monto" sin
excepción. Ahora, si vacaData.ocultarMontosActividad está en true, el
feed muestra "aportó" en vez del monto — mismo criterio ya usado en
cargarIntegrantes() para la lista de participantes. No se tocó nada
más de cargarActividad() (orden, fecha, nombre, listener).

### v1.75
footer del PDF (generarResumenPDF) cambia de "Diseñado por: Marto 🧠"
al mismo texto exacto que usa el crédito del sidebar (.app-credit /
.sb-credit en nav.js): "Marto 🧠 · martowave@gmail.com". Solo ese
texto — nada más del PDF se tocó.

### v1.74
a pedido del usuario ("que los puntos no salten, solo enciendan/
apaguen y conecten"): se quita el translateY(-10px) de @keyframes
shimmerPulse (el "salto" vertical de la v1.18) — ahora el ciclo del
fondo (.shimmer-dot) es puramente encendido/apagado (opacity) + un
pulso de tamaño sutil (scale), sin desplazamiento de posición.
También se duplica la duración del ciclo (antes 1.6-3.4s, ahora
3.2-6.8s) y se amplía el rango de delay para que no se vean tan
sincronizados. No se tocó la red de nodos (.neuron-node/.neuron-line).

### v1.59
FIX — mismo bug de vacas.html v1.44 (d.url en vez de d.urlCloudinary),
corregido en cargarCatalogoAvatares(). Las 2 cuadrículas del selector
(registro y edición) y la miniatura de la lista pública de Integrantes
ahora usan la transformación liviana de Cloudinary. No se tocó nada más.

### v1.58
mismo selector de avatar de vacas.html v1.43, en 2 lugares: el
formulario de registro (registrarse(), guarda avatarUrl en el
participante y su espejo integrantes) y el modal "✏️ Editar mis datos"
(guardarEdicionDatos(), que antes no tocaba integrantes en absoluto y
ahora sí, solo para el campo avatarUrl). La lista pública de
Integrantes (v1.57) ahora pinta la miniatura de cada quien (o ícono 👤
genérico). Requirió firestore.rules v2.24: lectura pública de
avataresIconos (sin la cual el catálogo no cargaba para el visitante
sin login) y un allow update público nuevo en /integrantes, angosto a
solo el campo avatarUrl (necesario porque este modal edita el espejo
público sin sesión).

## cocina.html

### v1.99.12
línea "Generado desde: ..." en el encabezado del PDF de Lista de
compras — se deriva agregando y deduplicando los recetasOrigen de
TODOS los ítems que van en el PDF impreso (respeta el filtro de
categoría activo). Recetas con lotes muestran "Nombre ×N lotes";
pedidos sueltos muestran "Pedido de Cliente" sin lotes. No es un dato
nuevo guardado — se calcula al imprimir a partir de lo que cada ítem
ya trae.

### v1.99.11
últimos puntos pendientes del plan original de Compras + un pedido
nuevo: (1) "Para: ..." se trunca a los primeros 2 orígenes + "+N más"
en pantalla (title=lista completa); el PDF NO se truncó, en papel no
hay la misma restricción de espacio. (2) orden fijo dentro de cada
categoría — alfabético por defecto (localeCompare 'es'), en pantalla y
PDF. (3) chip "💰 Mayor precio" para ordenar por "compra completa"
descendente en vez de alfabético (variable ordenComprasPorPrecio,
aplica también al PDF). Función nueva montoCompraCompletaItem() extrae
el cálculo que ya existía inline, reusada en el total general y en el
ordenamiento.

### v1.99.10
desglose "cantidad por lote × N lotes" — se guarda "lotes" en cada
entrada de recetasOrigen (agregarRecetasAlCheck/
confirmarStockYGenerarLista, antes se perdía tras calcular el total),
y en Compras (pantalla + PDF) se muestra "Para: [receta] (X unidad ×
N lotes)" SOLO si hay un único origen tipo receta con esos datos — si
hay 2+ orígenes o es ítem suelto, se ve igual que antes (sin
desglose). Ítems generados antes de v1.99.10 no muestran desglose
hasta que se regeneren.

### v1.99.9
mobile — los bloques nuevos de Compras (compra-presentacion,
compra-total-presentacion, total general) no tenían el piso táctil de
0.92rem que ya aplicaba @media (max-width:600px) a .compra-total y
otros textos secundarios. Agregados a esa misma regla, con "Compra
completa" del total general en 1.15rem para mantener su jerarquía en
móvil.

### v1.99.8
(1) separador de miles (.) en todos los montos de Compras que aún
usaban $Math.round() sin formato — $ por ítem (pantalla y actualización
en vivo), "compra completa", PDF/checklist — ya usan formatoMoneda()
(toLocaleString es-CO), igual que el resto del sistema. (2) jerarquía
del total general: de fila horizontal a bloques apilados (label
arriba, monto abajo), "Compra completa" grande/dorado como principal y
"Costo receta" chico/gris como secundario.

### v1.99.7
total general arriba de la lista de Compras — suma "Compra completa" y
"Costo receta" de los ítems visibles con el filtro de categoría/
etiqueta activo (excluye "ya la tengo"). Se recalcula en cada
renderListaCompras().

### v1.99.6
resaltado visual del insumo específico dentro del detalle expandido de
una receta desactualizada — si el precio guardado en la receta
(i.valorUnidad) difiere del precio vigente del insumo (insumosCache),
esa fila se resalta (fondo dorado tenue + ⚠️ + tooltip con precio
guardado vs vigente).

### v1.99.5
botón "🔄 Actualizar con precios nuevos" en el detalle expandido de
Recetas, visible solo cuando ya está el badge "⚠️ Insumo actualizado"
— recalcula receta.insumos con el precio vigente de cada insumo, y
costoTotal/ganancia/margenPct en consecuencia. ingresos/precioVenta NO
se tocan. Actualiza todos los insumos de la receta de una vez, con
confirm() antes de guardar.

### v1.99.4
el PDF/checklist imprimible de "Lista de compras" ahora muestra, por
ítem, lo mismo que ya se ve en pantalla desde v1.99.3: línea
presentación + "$X compra completa" (destacado) + "$Y (costo receta)"
(chico), cuando el insumo tiene contenidoPresentacionCompra/
nombrePresentacionCompra cargados.

### v1.99.3
2 ajustes sobre v1.99.2 en Compras: (1) fix del nombre de presentación
forzando plural con "+s" (causaba "BOLSASs" si el insumo ya estaba en
plural) — ahora se muestra tal cual está guardado. (2) jerarquía
invertida: el $ de "compra completa" pasa a ser el destacado en
dorado, "costo receta" pasa a texto chico/secundario.

### v1.99.2
en Compras, si el insumo tiene presentación de compra cargada, se
agrega una segunda línea de $ mostrando el costo real de comprar las
presentaciones completas ya redondeadas hacia arriba (ej. "$7200 si
compras bolsas completas"), debajo del $ original (costo receta, sin
redondear). No toca costeo de receta/margen.

### v1.99.1
fix sobre v1.99 — la línea de conversión en Compras ahora dice "≈ 2
BOLSA de 1000 ML" en vez de solo "≈ 2 BOLSA" (faltaba el
número+unidad de la presentación, solo se veía el nombre).

### v1.99
2 campos nuevos y opcionales en Insumos — "Contenido por unidad de
compra" (contenidoPresentacionCompra, número) y "Nombre de la
presentación de compra" (nombrePresentacionCompra, texto). Ambos van
juntos: si falta uno, no se guarda ninguno. En Compras: si el insumo
tiene ambos cargados, aparece una línea bajo la cantidad, ej. "≈ 3
bolsas". No toca costeo, stock, ni Pedidos/Recetas.

## compras.html

Portal público (companion de cocina.html), autenticación por PIN,
mismo patrón que menu.html. Va bastante detrás de cocina.html en
versión — varias mejoras de Compras se replican acá con desfase.

### v1.6.6
mismo cambio que cocina.html v1.99.11 — "Para: ..." truncado a 2
orígenes + "+N más" (con title=lista completa), orden alfabético fijo
por defecto, chip "💰 Mayor precio". Calcado 1:1 (sin PDF, este portal
no lo tiene).

### v1.6.5
mismo desglose que cocina.html v1.99.10 — "Para: [receta] (X unidad ×
N lotes)". Portal es solo lectura, el dato ya viene calculado desde
cocina.html.

### v1.6.4
se agregó el @media (max-width:600px) que este portal no tenía — piso
de 0.92rem para textos secundarios chicos y chips más táctiles. Se
revisó .compra-nombre/.compra-cant/.compra-comprar-form input: esos ya
venían con tamaño fijo legible, no necesitaban regla adicional.

### v1.6.1 – v1.6.3
mismos cambios que cocina.html v1.99.2 – v1.99.9 (presentación de
compra, jerarquía $, total general, separador de miles, formatoMoneda()
agregado — no existía en este portal), calcados 1:1 con desfase de
sesión.

### v1.5
mismo cambio que cocina.html v1.33 — soporte para presentación de
compra en pantalla.

## Nota — escapeHtml() NO migrado a propósito

`clientes.html`, `cotizacion-rapida.html` y `produccion.html`
conservan su propia copia local de `escapeHtml()`, y así se deja a
propósito: usan una implementación distinta (con `replaceAll()`) que
además escapa comillas simples y dobles, necesaria porque su
resultado se inserta dentro de atributos HTML (`onclick="...('${...}')"`
en clientes.html, `value="${...}"` en cotizacion-rapida.html). La
versión de utils.js (basada en `div.textContent`) no escapa comillas
— migrar estos 3 archivos a esa versión rompería esos atributos si el
dato trae una comilla. No es una duplicación real: son dos funciones
con el mismo nombre mal usado, pero un trabajo distinto.


---
