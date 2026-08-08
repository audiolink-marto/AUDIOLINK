# AUDIOLINK — Changelog

Historial de versiones del ecosistema. Antes vivía repartido en el comentario de cabecera de cada archivo HTML (cada vez más largo y pesado de leer); desde julio 2026 se centraliza acá. Cada archivo HTML conserva en su cabecera solo la versión vigente + un resumen corto, con nota de que el historial completo está acá.

---

## firestore.rules

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

### v1.6
se agrega el ítem "Avatar / Icono" (avatares-iconos.html) a ITEMS,
después de "Vacas". Se suma también a idsFueraBottomnav para no
saturar la barra inferior móvil (queda accesible por sidebar desktop
y panel "···" móvil). No se tocó ninguna otra función, ítem existente
ni la lógica de inyección/colapsar/tema.

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
