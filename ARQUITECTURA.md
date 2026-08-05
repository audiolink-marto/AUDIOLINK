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
