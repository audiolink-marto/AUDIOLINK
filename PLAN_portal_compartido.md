# PLAN — Portal compartido por enlace (Audiolink)

Estado: PLAN, sin código escrito. Fecha: 2026-11-20.
Objetivo: que el cliente vea su proyecto con un clic (sin registro ni contraseña), sin quedar vulnerable.

## 1. Decisiones ya tomadas
- Enfoque: enlace con token largo + **snapshot** del proyecto en un documento cuyo ID es el token (mismo patrón de `compartirInfo` y `checklistCompartidos`, reglas v2.43 / v2.48).
- Parte financiera con **código aparte** (se envía por otro canal, ej. WhatsApp).
- **Confirmar cotización** desde el enlace = el cliente deja una *respuesta* y **tú la apruebas**. No cambia la cotización real por sí solo.
- Snapshot **con guardado**: se actualiza cuando se guarda en la app (ver riesgo en §5).
- **Vencimiento manual**: lo defines tú por enlace y puedes revocarlo cuando quieras (confirmar interpretación en §6).
- Archivos de Cloudinary (maquetas): **etapa futura**, fuera de la v1.
- Opinión sobre página nueva vs modo token dentro de `portal.html`: **página nueva** (`portal-compartido.html`). Motivo: `portal.html` v2.23 ya es grande y depende de login + reglas de cliente; mezclar dos modos arriesga lo que funciona. Se copia el renderizado y `portal.html` no se toca. Más adelante, con aprobación, se puede extraer un módulo compartido.

## 2. Por qué snapshot (hallazgo clave)
Las reglas de Firestore no ven el token de la URL; solo ven ruta, campos y usuario. Las reglas actuales de `proyectos`, `cotizaciones` y `pagos` exigen `clienteEmail == correo con sesión`, y no hay Cloud Functions. Abrirlas "por token" expondría documentos reales. Por eso se publica una **copia filtrada** en un documento separado, donde el ID es el secreto.

## 3. Diseño de datos (reglas v2.49)
**`portalCompartidos/{token}`** (token = 32 caracteres aleatorios, `crypto.getRandomValues`)
- Campos: `proyectoId`, `visibleCliente` (bool), `vence` (timestamp o null), `actualizadoEn`, `proyecto{}`, `sesiones[]`, `temas[]` (nombres), `etapa`, `plan` (si se calcula en el cliente, no se guarda).
- Staff: lee y escribe. Sin login: solo `get` puntual (nunca `list`) si `visibleCliente == true` y (`vence == null` o `vence > request.time`).

**`portalCompartidos/{token}/financiero/{codigo}`** (codigo = 8–10 caracteres, alfabeto sin ambiguos)
- Contiene: cotización visible (rubros, total, alcance, notas), abonos (monto, fecha, método, comprobante), saldo.
- El ID es el código: sin él no se puede pedir el documento. Sin `list`. Mismas condiciones de visible/vence que el padre.
- Un PIN de 4 dígitos NO sirve (sin límite de intentos se fuerza con un script); por eso 8–10 caracteres.

**`portalCompartidos/{token}/financiero/{codigo}/respuestas/{id}`**
- El cliente puede **crear** una respuesta de confirmación, con campos exactos (`aceptado`, `nombre` ≤ 100, `comentario` ≤ 500, `fecha == request.time`), solo si el padre existe y está visible. No lee, no edita, no borra.
- Tú la ves en `proyecto.html` y, al aprobarla, cambias la cotización con el flujo ya existente.

**Nunca entra al snapshot:** tarifas de técnicos/músicos, notas internas, correos, teléfonos, `clienteEmail`, canales, `notasInternas`, presupuesto interno, el campo `nota` de los pagos.

## 4. Piezas a construir
1. `firestore_v2_49.rules` (completo, con changelog en la cabecera, sin tocar reglas existentes).
2. `portal-compartido.html` v1.0: sin login, lee el snapshot con `onSnapshot` de un solo documento, pide el código para lo financiero, muestra "Confirmación enviada, pendiente de validación". Incluye `<meta name="robots" content="noindex">` y `<meta name="referrer" content="no-referrer">`.
3. `proyecto.html` v5.48: botón "🔗 Portal compartido" (generar enlace, copiar, vencimiento, revocar/regenerar, ver código financiero, ver respuestas pendientes y aprobarlas).
4. Función compartida `actualizarSnapshotPortal(proyectoId)` (con debounce) y los puntos donde se llama (ver §5).

## 5. Riesgo a decidir: "con guardado"
Los datos nacen en varios archivos: proyecto (proyecto.html), sesiones (logistica.html), tomas (bitacora.html), abonos (pagos.html y pago rápido del dashboard), cotizaciones (cotizador.html). Para que el snapshot se actualice "al guardar", cada punto de guardado debe llamar a la función. Opciones:
- A) Llamarla en cada archivo (más completo; hay que tocar logistica, pagos, cotizador, bitácora, con tu aprobación archivo por archivo).
- B) Que `proyecto.html` regenere solo mientras está abierto (ya tiene listeners de sesiones, temas, pagos y cotizaciones). Más simple, pero si nadie tiene la página abierta no se actualiza.
- C) A + botón manual "Actualizar ahora" como respaldo.
Recomiendo B + botón manual para la v1 y A después por archivo. Cada reescritura cuesta lecturas/escrituras en Firestore: usar debounce.

## 6. Preguntas abiertas
- "Vencimiento manual": ¿eliges la fecha de vencimiento al generar el enlace (editable) o prefieres sin fecha y solo revocar a mano? El plan soporta ambos (`vence` opcional).
- ¿Un solo enlace por proyecto (regenerar = token nuevo y se borra el anterior) o varios? Propuesta: uno.
- ¿Despliegue? El código usa `audiolink-marto.github.io` (GitHub Pages), no Netlify. GitHub Pages no permite cabeceras HTTP, por eso `noindex` y `referrer` van en `<meta>`. Verificar dónde está publicado realmente.

## 7. Cloudinary (etapa futura, maquetas)
Un token no protege una URL pública de Cloudinary. Opciones a evaluar en esa etapa: entrega autenticada con URL firmada (la firma necesita el API secret, que NO puede vivir en el navegador; sin Cloud Functions requiere otra solución) o URLs con `public_id` impredecible (protección por oscuridad, más débil). **No lo sé con certeza: hay que comprobarlo en la documentación de Cloudinary antes de decidir.** La v1 no incluye archivos.

## 8. Archivos que hay que subir a la nueva conversación
`firestore_v2_48.rules`, `proyecto.html` (v5.47), `portal.html` (v2.23, solo de referencia para copiar el renderizado), `checklist.html` y/o `compartirinfo.html` (generador de token y UI de copiar enlace, para mantener el mismo estilo), `utils.js`, `firebase-config.js`. Si se elige la opción A del §5: `logistica.html`, `pagos.html`, `cotizador.html`, `bitacora.html`.

## 9. Método de entrega (tus reglas)
Resumen previo y aprobación antes de escribir código; archivos completos con versión nueva y changelog; verificar que todo lo demás siga funcionando; no tocar nada que no se apruebe; avisar si hay que empezar otra conversación por costo de contexto.
