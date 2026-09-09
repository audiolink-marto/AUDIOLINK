// AUDIOLINK · pdf-estructura.js · v1.92
// v1.92: (a pedido) ahora se ven las 2 notas por compás a la vez en el
// PDF de percusión, con jerarquía clara:
//  - Nota de PERCUSIÓN (notasPercusionPorCompas/Ciclo/Final2) — vuelve a
//    vivir ADENTRO de la caja, negro/negrita (info principal: "repique
//    de bongó", "solo kick").
//  - Nota de ARMONÍA (notasPorCompas/notasCiclo/notasFinal2, la misma
//    que ya se ve en el PDF de acordes) — pasa a su propia tira ARRIBA
//    de la caja, itálica/naranja (contexto general del tema, secundario).
// dibujarCajasPercusion ahora recibe `opciones.notasArmonia` además del
// parámetro `notas` (que sigue siendo la de percusión, dibujada adentro
// como siempre fue hasta v1.89). hayNotas (si se reserva la tira de
// arriba) se decide por notasArmonia — calcularAltoSeccionPercusion
// también pasa a mirar notasPorCompas/notasCiclo/notasFinal2 (no las de
// percusión) para reservar ese alto. Los 3 llamados a dibujarCajasPercusion
// (grilla principal, 2da vez horizontal, 2da vez apilada) le pasan su
// notasArmonia correspondiente. Corchetes "1."/"2." sin cambios (ya
// anclaban por encima de toda la tira). Cero cambios en generarEstructuraPDF,
// dibujarCajas, dibujarCajaBreak ni dibujarCorcheteCasilla (PDF de acordes).
// v1.91: (a pedido, FIX urgente) v1.90 rompía el botón "🥁 PDF
// Percusión" por completo — `let ultimaHayNotasPercusion` había quedado
// declarada DENTRO del bloque que arma la grilla (Vamp/fija-bloque), pero
// se usaba también en el avance final de cada sección, que vive FUERA de
// ese bloque → "ReferenceError: ultimaHayNotasPercusion is not defined"
// no capturado, que frenaba toda la función (y por lo tanto el botón).
// Fix: la declaración se mueve al principio del `forEach` de cada
// sección (antes de cualquier if/else), donde queda visible para todo el
// resto del procesamiento de esa sección. Cero cambios de lógica/dibujo
// respecto a v1.90 — mismo comportamiento visual pretendido, ahora sin
// tirar excepción. Ver v1.90 más abajo para el detalle del cambio de
// fondo (nota por compás con tira propia arriba de la caja).
// v1.90: (a pedido) la nota por compás de la guía de percusión
// (notasPercusionPorCompas/Ciclo/Final2, dibujarCajasPercusion) pasa a
// dibujarse tal cual como en armonías: tira propia ARRIBA de cada caja
// (notaFilaAlto, 5mm), itálica, color naranja/marrón (180,120,40),
// truncada a 22 caracteres — mismo criterio visual y de posición que
// dibujarCajas en generarEstructuraPDF. Antes se dibujaba ADENTRO de la
// caja, negro/negrita, compitiendo por espacio con "c.N"/"#N"/la reglita
// de acento. hayNotas se calcula una sola vez por grilla (si cualquier
// compás trae nota, TODAS las filas de esa grilla reservan la tira, para
// que las cajas no salten de alto entre sí) — mismo patrón que
// hayContenido en generarEstructuraPDF. Ajustes derivados, para que nada
// más se corra o se pise:
//  - calcularAltoSeccionPercusion ahora reserva notaFilaAlto por fila
//    (grilla principal y 2da vez) cuando corresponde — si no, con notas
//    cargadas el dibujo real (más alto) pisaba la barra de título de la
//    sección siguiente.
//  - Nuevo flag por sección `ultimaHayNotasPercusion`: guarda si la
//    última grilla dibujada (la que sí avanza `y`, es decir sin
//    sinAvanzarY) reservó tira de notas. Lo usan la lista de "próximas
//    repeticiones" del Vamp (yBaseVamp), el marco de repetición
//    (dibujarBarraRepeticionPercusion arranca DESPUÉS de la tira, no
//    encima), el texto "se repite..." y el avance final de la sección —
//    los 4 puntos donde antes se asumía cajaAlto a secas.
//  - La 2da vez horizontal (pegada a la 1ra vez) hereda hayNotasForzado
//    de la grilla principal (mismo patrón que hayNotasForzado en
//    dibujarCajas/generarEstructuraPDF), para que ambas cajas queden
//    alineadas en la misma fila aunque la 2da vez no tenga notas propias.
// Los corchetes "1."/"2." (dibujarCorcheteCasillaPercusion) NO se tocan:
// ya anclaban en yGridVamp/yBloque2 (arranque real de la fila, ANTES de
// sumar la tira de notas), mismo criterio que dibujarCorcheteCasilla en
// generarEstructuraPDF — por eso ya quedaban arriba de la tira de notas
// sin pisarla, sin necesidad de ajuste. Cero cambios en generarEstructuraPDF,
// dibujarCajas, dibujarCajaBreak ni dibujarCorcheteCasilla (PDF de acordes).
// v1.89: (a pedido) 2 FIX sobre generarEstructuraPDFPercusion v1.88:
//  (a) margen excesivo después de "se repite..." — el incremento final
//      fijo (cajaAlto+4) de cada sección asumía que lo último dibujado
//      siempre era una FILA de cajas (cierto antes de v1.88, cuando "se
//      repite..." se dibujaba ANTES de la grilla). Ahora que se dibuja
//      DESPUÉS, en las secciones que terminan en esa línea de texto (o
//      en la 2da vez horizontal, que tampoco agrega una fila nueva) ese
//      cajaAlto+4 quedaba sumado ENCIMA del aire que la línea de texto
//      ya trae. Nuevo flag `ultimoElementoEsTexto` (por sección) decide
//      entre 4mm (texto) y cajaAlto+4 (fila de cajas).
//  (b) el marco de repetición (dibujarBarraRepeticionPercusion) pisaba/
//      se solapaba con la caja de la 2da vez horizontal (v1.88) porque
//      su trazo derecho cerraba en el borde de la 1ra vez, justo donde
//      arranca la 2da — mismo FIX que ya tiene generarEstructuraPDF
//      (v1.48): el ancho del marco se extiende para cerrar DESPUÉS de la
//      2da vez cuando es horizontal.
// Cero cambios en generarEstructuraPDF, dibujarCajas ni dibujarCajaBreak.
// v1.88: (a pedido) 4 ajustes en generarEstructuraPDFPercusion para
// emparejar el comportamiento de la guía de percusión con
// generarEstructuraPDF (acordes), ninguno toca generarEstructuraPDF,
// dibujarCajas ni dibujarCajaBreak:
//  (a) "se repite xN..." pasa de dibujarse ANTES de la grilla principal
//      a dibujarse DESPUÉS (debajo), mismo orden que acordes.
//  (b) FIX del contador "#N" en la 2da vez: antes reusaba el
//      compasGlobalInicio de la sección tal cual, mostrando el mismo
//      número que la 1ra pasada en vez del compás real de la ÚLTIMA
//      vuelta (ver dibujarCajasPercusion, ahora acepta
//      opciones.compasGlobalInicioOverride — mismo cálculo que ya usa
//      acordes: compasGlobalInicio + (repeticiones-1)*totalCajas).
//  (c) 2da vez ahora puede dibujarse en HORIZONTAL (pegada a la derecha
//      de la 1ra vez, en la misma fila) cuando entra — mismo criterio
//      "alineable"/"cabeHorizontal" que ya usa acordes — con los mismos
//      corchetes "1."/"2." (dibujarCorcheteCasillaPercusion, duplicado
//      tal cual de dibujarCorcheteCasilla). Antes la 2da vez SIEMPRE caía
//      apilada debajo, sin corchetes.
//  (d) dibujarCajasPercusion pasa de (notas,acentos,total,numInicio) a
//      (notas,acentos,total,colInicio,labelInicio,opciones) — mismo
//      patrón que dibujarCajas de acordes (colInicio para la posición en
//      la grilla, labelInicio para el "c.N" real, opciones.yBase/
//      sinAvanzarY para dibujar en la misma fila sin tocar el y
//      corrido). Los 2 llamados existentes (pase principal y 2da vez
//      apilada) se migraron sin cambiar su resultado visual.
// v1.87: (a pedido, FIX) la lista de "próximas repeticiones" en Vamp
// (v1.85) se corrige de posición — iba debajo del borde de la caja
// (yGridVamp+cajaAlto+2, afuera), ahora va DENTRO de la caja, pegada
// justo debajo del label "#N" (yGridVamp+6.5), igual que en acordes.
// v1.86: (a pedido, FIX) el marco doble con puntos en percusión pasa a
// dibujarse SOLO en fija-bloque con repeticiones>1 (dibujarBarraRepeticionPercusion,
// izq.+der., duplicado tal cual de dibujarBarraRepeticion de acordes) —
// antes (v1.79/v1.81, dibujarBarraCierreSeccion) se dibujaba en TODA
// sección, solo del lado derecho, lo que hacía que en Vamp (ej. "Solo")
// chocara visualmente con la lista de próximas repeticiones (v1.85). Con
// este cambio Vamp ya no dibuja ningún marco (igual que en acordes, que
// solo muestra el iconito "║:" ahí), así que el choque desaparece. El
// bloque de 2da vez tampoco lleva marco propio (mismo criterio que
// acordes: el marco envuelve solo la fila principal).
// v1.85: (a pedido) generarEstructuraPDFPercusion hereda la lista de
// "próximas repeticiones" en Vamp (#N chico bajo cada caja del ciclo,
// hasta 3 líneas) de generarEstructuraPDF — mismo cálculo y estilo.
// casillaHorizontal queda pendiente (evaluado como más riesgoso de lo
// estimado, a la espera de definir si vale la pena portarlo).
// v1.84: (a pedido) generarEstructuraPDFPercusion hereda el patrón
// rítmico de Break/Corte (dibujarPatronRitmico + helpers de parseo,
// duplicados tal cual de generarEstructuraPDF) y notaTiempoCorte — la
// sección Break/Corte ya no usa la grilla genérica, dibuja el patrón real
// igual que el PDF de acordes (sin fila de acordes, esta guía no los
// muestra). calcularAltoSeccionPercusion también actualizado para
// reservar el alto correcto en este caso.
// v1.83: (a pedido) generarEstructuraPDFPercusion hereda Coda/D.C./D.S.
// (nombresYaImpresos, esCoda, etiquetaDC, dibujarIconoCoda duplicado) y
// compasOverride — mismo criterio y estilo que generarEstructuraPDF,
// nada más tocado. notaTiempoCorte queda para el parche del patrón
// rítmico de Break/Corte (siguiente paso, todavía no aplica acá).
// v1.82: (a pedido) generarEstructuraPDFPercusion hereda el contador
// global de compás "#N" por caja (esquina sup. derecha, 6pt gris claro)
// que ya tenía generarEstructuraPDF — mismo criterio y estilo, sin tocar
// nada más de la función.
// v1.81: (a pedido) 2 ajustes más sobre generarEstructuraPDFPercusion:
//  (a) la barra de cierre de sección (v1.79) cambia de "doble barra
//      simple" a puntos + trazo fino + trazo grueso/fino — mismo
//      criterio visual que ya usa dibujarBarraRepeticion en
//      generarEstructuraPDF para el lado de cierre (║:). Puramente
//      estético, mismo esFinal (fina+gruesa en la última sección del
//      tema) de antes.
//  (b) se agrega el resumen "c.#X-c.#Y" en la barra de título de cada
//      sección — mismo dato/cálculo/estilo que ya usa
//      generarEstructuraPDF (v1.45/v1.70: contador global de compás,
//      blanco/itálica/opacidad reducida), duplicado acá porque son
//      variables locales allá. Se ubica a la izquierda del texto de
//      instrumento (v1.78) para no pisarlo cuando ambos están
//      presentes — si no hay instrumento cargado, el resumen ocupa todo
//      el espacio de la derecha.
// Cero cambios en generarEstructuraPDF, dibujarCajas ni dibujarCajaBreak.
// v1.80: (a pedido) 2 ajustes en generarEstructuraPDFPercusion pensando
// en que el percusionista vea la estructura más rápido, sin leer texto:
//  (a) "se repite xN..." ahora lleva el mismo ícono gráfico ║: que ya
//      usa generarEstructuraPDF para lo mismo (dibujarIconoRepeticion,
//      v1.29.2) — duplicado acá como dibujarIconoRepeticionPercusion
//      porque es función local allá, no accesible desde acá. Antes solo
//      era texto itálico sin símbolo. Mismo texto/criterio de siempre.
//  (b) nueva barra doble de cierre de sección (dibujarBarraCierreSeccion)
//      — hasta ahora el corte entre secciones solo se notaba por el
//      cambio de color de la barra de título, sin ningún símbolo de
//      notación. Se dibuja pegada al borde derecho de la ÚLTIMA fila de
//      cajas de cada sección (o del bloque de 2da vez, si lo hay — ese
//      es el contenido real que cierra la sección): doble barra fina
//      para secciones intermedias, fina+gruesa (barra final real) solo
//      en la última sección del tema.
// Cero cambios en generarEstructuraPDF, dibujarCajas ni dibujarCajaBreak
// (PDF de acordes normal intacto). Pendiente aparte (no en este paso):
// franja horizontal de compases grandes como "mapa" opcional del tema.
// v1.79: (a pedido) ajuste quirúrgico en textoInstrumentoPercusion,
// alineado a guia-practica.html v1.78 — el select de instrumento (valor
// único) pasó a checkboxes de selección múltiple, así que
// s.instrumentoPercusion ahora puede ser un array (varios instrumentos
// por sección, ej. Conga+Bongó+Güiro) en vez de un string. La función se
// hizo robusta a AMBOS formatos (array nuevo o string viejo sin migrar),
// para que el PDF salga bien aunque la sección nunca se haya vuelto a
// abrir en el editor desde v1.78. Con varios instrumentos, se listan
// juntos separados por coma en la misma línea de siempre (a la derecha
// de la barra de título) — cero cambios de layout/posición/estilo, cero
// cambios en el resto del dibujo de percusión ni en generarEstructuraPDF.
// v1.78: (a pedido) 2 ajustes dentro de generarEstructuraPDFPercusion,
// leyendo 2 campos nuevos de guia-practica.html v1.77 — cero cambios en
// generarEstructuraPDF, dibujarCajas ni dibujarCajaBreak (PDF de acordes
// normal intacto):
//  (a) s.esCampana (checkbox "🔔 Sección de campana") — dibuja un marco
//      dorado alrededor de la barra de título de esa sección + un badge
//      de texto "CAMPANA" (nada de emoji, mismo criterio que
//      dibujarIconoRepeticion/dibujarIconoCoda) pegado después del
//      nombre. Puramente visual, no cambia ningún cálculo de alto/ancho.
//  (b) s.instrumentoPercusion / instrumentoPercusionOtro (select con
//      lista fija + "Otro…") — texto itálico alineado a la derecha de la
//      barra de título con el instrumento de esa sección (Congas, Bongó,
//      Campana, Timbal, Güiro, Maracas, Clave, Kick/Drum, Todos/Tutti, u
//      "Otro" con el texto libre cargado). El PDF de percusión no dibuja
//      el resumen "c.#X-c.#Y" en la barra de título (eso es exclusivo de
//      generarEstructuraPDF), así que ese espacio a la derecha estaba
//      libre — no hay colisión.
// v1.77: (a pedido) 3 ajustes en generarEstructuraPDFPercusion, ninguno
// toca generarEstructuraPDF/dibujarCajas/dibujarCajaBreak (PDF de
// acordes normal):
//  (a) "c.N" (número de compás en cada caja) pasa de 7pt gris150 a 9pt
//      negrita gris70 — antes era casi invisible en la hoja impresa.
//  (b) Nueva línea "se repite xN (ciclo de M comp.)" / "se repite xN
//      (M comp. reales)" — mismo texto/criterio que ya usa
//      generarEstructuraPDF — para Vamp y fija-bloque con
//      repeticiones>1. Antes el PDF de percusión no mostraba esta info
//      aunque ya estuviera cargada para el PDF general.
//  (c) hay2daSeccionPercusion ahora también dispara el bloque de "2da
//      vez" si hay datos en acordesFinal2/letraFinal2 (PDF general),
//      no solo si se habían cargado los campos exclusivos de percusión
//      (notasPercusionFinal2/acentosFinal2). Antes, si el usuario ya
//      tenía una 2da vez distinta armada para acordes pero no había
//      tocado nada de percusión, el PDF de percusión la ignoraba por
//      completo.
// v1.76: (a pedido) generarEstructuraPDFPercusion ahora soporta Vamp y
// 2da vez, mismo patrón que generarEstructuraPDF/dibujarCajas pero
// leyendo los arrays exclusivos de percusión (notasPercusionCiclo/
// acentosCiclo y notasPercusionFinal2/acentosFinal2). Antes ignoraba
// s.tipo==='vamp' (dibujaba s.duracion cajas leyendo por error los
// arrays de la grilla principal) y no dibujaba la 2da vez. Se extrajo
// el dibujo de cada caja a un helper local (dibujarCajasPercusion,
// mismo dibujo de siempre) para reutilizarlo en los 3 casos sin
// duplicar código. Cero cambios en generarEstructuraPDF, dibujarCajas
// ni dibujarCajaBreak.
// v1.74: (a pedido) header de generarEstructuraPDFPercusion pasa de
// "simplificado" (20mm, franja+logo) a COMPLETO — igual al de
// generarEstructuraPDF (38mm, franja + diffuser con recorte "cover" +
// logo con todas sus opciones de header-config.js + línea dorada). Los 3
// helpers de imagen (dibujarDiffuserCover/imagenComoDataURL/
// detectarFormatoImagen) son funciones locales dentro de
// generarEstructuraPDF; se duplicaron tal cual (sufijo "Percusion" en el
// nombre para no chocar) porque esta función vive aparte y no puede
// llamarlas directamente. Único texto distinto respecto al header de
// acordes: "GUÍA DE PERCUSIÓN" en vez de "GUÍA DE PRÁCTICA". Cero
// cambios en generarEstructuraPDF, dibujarCajas ni dibujarCajaBreak — y
// el resto de generarEstructuraPDFPercusion (cajas, texto de percusión,
// regla de 16avos) queda exactamente igual a v1.73.
//
// v1.73: (a pedido) "guía de percusión" — generarEstructuraPDFPercusion,
// función NUEVA y separada (ver su propio comentario más abajo, junto a
// la función) — cero cambios en generarEstructuraPDF, dibujarCajas ni
// dibujarCajaBreak. Llamada desde guia-practica.html v1.74
// (exportarEstructuraPDFPercusion, botón "🥁 PDF Percusión").
//
// v1.72: (a pedido) 2 cambios sobre la regla de tiempo/anticipación
// (v1.71):
//  (a) FIX visual — la letra (yCaja+13) y el punto de la regla se pisaban
//      cuando la celda tenía letra Y tiempo cargados a la vez (visto en
//      captura de referencia). Ahora, solo en esas celdas puntuales, la
//      letra sube 1mm (+12 en vez de +13) y se achica 1pt (6pt en vez de
//      7pt); sin tiempo cargado, la letra queda idéntica a siempre. La
//      regla también baja 1mm (yCaja+cajaAlto-1 en vez de -2).
//  (b) La regla ahora se dibuja también en el bloque Vamp/ciclo
//      (acordesCiclo, nuevo campo paralelo s.acordesTiempoCiclo) y en la
//      2da vez de fija-bloque (acordesFinal2, nuevo campo paralelo
//      s.acordesTiempoFinal2) — antes solo vivía en la grilla principal.
//      Break/Corte sigue sin este dato (no aplica, resuelve tiempo con
//      patrón rítmico/golpe). Ver guia-practica.js v1.72 para los selects
//      nuevos en el editor de esos 2 bloques (Paso 1+2); acá solo se
//      conecta el dato en los 3 llamados que faltaban (Vamp, 2da vez
//      horizontal, 2da vez apilada) — ningún cálculo de compases/alto se
//      tocó.
//
// v1.71: (a pedido) Paso 3 de "tiempo/anticipación del acorde" (Paso 1:
// campo s.acordesTiempo; Paso 2: select en guia-practica.html, ambos ya
// resueltos ahí). Acá se dibuja: dentro de dibujarCajas(), cada celda
// puede mostrar una mini-regla de 8 marcas (1,a1,2,a2,3,a3,4,a4 —
// resolución de corchea completa, 'aN' = corchea débil que sigue al
// tiempo N) pegada al borde inferior, con un punto relleno en la
// posición cargada (celda vacía en acordesTiempo = no se dibuja nada,
// caso común). Nuevo dato opciones.acordesTiempo (array paralelo, mismo
// patrón que `notas`), conectado en los 2 llamados de la grilla
// principal (s.acordesPorCompas, con y sin repeticiones>1). NO se tocó
// dibujarCajaBreak (Break/Corte no tiene este campo en el editor) ni la
// grilla de 2da vez (s.acordesFinal2 — no tiene su propio acordesTiempo
// cargado, si hace falta más adelante avisar para agregarlo ahí también
// en los 3 pasos). Ningún cálculo de compases/alto de sección se tocó.
//
// v1.70: (a pedido, según captura de referencia) el resumen "c.#X-c.#Y"
// se saca de la línea aparte debajo del bloque de cajas y pasa a vivir
// DENTRO de la barra de título de la sección, mismo lado derecho —
// blanco, itálica, opacidad reducida. Antes vivía repetido (mismo
// cálculo) en 4 puntos del código según el tipo de sección (fija-bloque
// simple, fija-bloque con repeticiones, Vamp, Break/Corte); las 4 ramas
// usaban exactamente compasGlobalInicio..compasGlobalInicio+s.duracion-1
// (el rango real de TODA la sección, sin excepción), así que ahora se
// calcula una sola vez en el header y se sacaron los 4 llamados viejos
// (buscar "v1.70" en cada punto para el detalle). Si la sección tiene
// compás override (compasOverride), el resumen se corre a la izquierda
// de ese texto para no pisarlo. dibujarResumenCompases() queda sin uso
// (no se borró, por las dudas de que se use en otro lado más adelante).
//
// v1.69: (a pedido) 2 cambios:
//  (a) ajuste fino de separación en dibujarPatronRitmico — el acento
//      (">") sube 1mm más (ay: -0.4→-1.4) y el numerito de grupo
//      (tresillo/sextillo) baja 1mm (de -3.3 a -2.3, ya bajado de -4.5
//      en v1.68) — ambos ajustes puntuales de terminado visual, sin
//      tocar el resto de la lógica de dibujo.
//  (b) notasPorGolpe (campo hermano de acordesPorGolpe, cargado en
//      guia-practica.html) ahora se dibuja en el PDF — a diferencia del
//      acorde (que suele tener contenido en cada golpe), la nota es
//      puntual (solo algunos golpes la usan), así que NO reserva una
//      franja fija propia: se dibuja chica (6pt itálica gris) SOLO donde
//      hay texto, pegada arriba del acorde de ESE golpe (calcula cuánto
//      subió el acorde según su tamaño real para no pisarlo). Sin nota
//      en ese golpe, no se dibuja ni se reserva nada. dibujarAcordesPorGolpe
//      recibe el nuevo parámetro; dibujarCajaBreak y el wrapper que la
//      llama pasan s.notasPorGolpe igual que ya pasaban s.acordesPorGolpe.
//      No hace falta tocar calcularAltoSeccion — la nota vive dentro del
//      mismo espacio ya reservado para la fila de acordes (ver cálculo
//      en el comentario de dibujarAcordesPorGolpe).
//
// v1.68: (a pedido, ajuste sobre v1.67) FIX de separación — con fuente
// grande (15pt), el acorde de la fila nueva (acordesPorGolpe) podía
// pisar el numerito de grupo (tresillo/sextillo). Dos cambios en
// conjunto: (a) el numerito de grupo baja de 4.5mm a 3.3mm por encima de
// la barra del corchete (dibujarPatronRitmico, 2 puntos: grupo de 2+ y
// grupo de 1 golpe real); (b) la fila de acordes sube de 8mm a 11mm de
// separación respecto a la línea base del patrón (dibujarCajaBreak).
// calcularAltoSeccion se actualiza en conjunto (9→12mm reservados) para
// que la reserva de espacio de la sección siga coincidiendo con lo que
// se dibuja. Quedan 3 franjas bien separadas de arriba a abajo: acordes
// → numerito de grupo → barra/corchete+acento → notas. Los acentos (">")
// no se tocan — ya quedaban lejos del numerito, pegados a la plica.
//
// v1.67: (a pedido, Paso 2 de "acordes alineados por golpe" en Break/
// Corte — Paso 1 fue el editor en guia-practica.html v1.59/v1.60, que
// ya carga el campo acordesPorGolpe) dibujarCajaBreak ahora, SI la
// sección trae acordesPorGolpe con contenido Y tiene patrón rítmico
// cargado, dibuja cada acorde arriba de su nota exacta (fila propia,
// pegada arriba de la tira de notas) en vez del texto único centrado en
// el recuadro grande de siempre — la caja/recuadro no se dibuja en ese
// caso (ver el porqué junto a dibujarCajaBreak). Se agrega el helper
// compartido calcularColsYXInfo (cols+posiciones, extraído tal cual de
// dibujarPatronRitmico, cero cambio de lógica) para que la fila de
// acordes use EXACTAMENTE las mismas columnas que la tira de notas real
// — quedan alineados 1 a 1 sin duplicar el cálculo de pesos/posiciones.
// El tamaño de letra de cada acorde se auto-ajusta (15→12→10→8pt, mismo
// criterio para todos: el primer tamaño de esa escala que no se pise con
// el acorde vecino más cercano) en vez de un tamaño fijo, porque el
// espacio libre por acorde varía mucho según cuántas notas tenga el
// patrón y cuántos compases dure el Break. calcularAltoSeccion también
// se actualiza (9mm extra en vez de los 15+3 de la caja vieja) para que
// la reserva de espacio de la sección coincida con lo que realmente se
// dibuja. SIN acordesPorGolpe (Break/Corte cargado a la vieja usanza, o
// sección sin patrón), cero cambios — sigue exactamente como en v1.66.
// musico.html no necesita cambios propios: solo lee s.acordesPorGolpe
// (si está cargado) y llama a este mismo pdf-estructura.js.
//
// v1.66: (a pedido, confirmado pixel a pixel contra la imagen de
// referencia que subió el usuario) FIX — v1.65 invirtió el orden sin
// necesidad; v1.64 (fija-bloque) y el ícono original de Vamp (v1.29.2)
// ya estaban bien. Orden correcto, de afuera hacia adentro: GRUESO-FINO-
// PUNTOS al abrir, PUNTOS-FINO-GRUESO al cerrar (espejo). Se revierten
// las dos funciones a ese orden, conservando el aire de 0.8mm entre
// elementos que se agregó en el camino. v1.65 queda sin efecto.
//
// v1.63: (a pedido, 3 ajustes)
//  (a) en Vamp, la lista de próximas vueltas ("#N" pegado a la caja) ya
//      no es solo de la 1ra caja del ciclo — ahora cada columna del
//      ciclo muestra sus propias vueltas futuras (ej. "B" c.1/#1 también
//      lista #3; "Bm" c.2/#2 también lista #4). Con ciclo > POR_FILA (más
//      de 4 compases por vuelta) se limita a las primeras POR_FILA
//      columnas, que son las únicas en la fila 0 real de dibujarCajas.
//  (b) el texto de Vamp ahora dice cuántas vueltas son en total ("se
//      repite x2 (ciclo de 2 comp.)"), no solo el largo del ciclo.
//  (c) dibujarBarraRepeticion (fija-bloque) le faltaban los 2 punticos
//      del signo de repetición estándar que el ícono de Vamp
//      (dibujarIconoRepeticion) ya tenía — se agregan, del lado de
//      adentro de cada barra.
// Ver detalle junto a cada punto.
//
// v1.61: (a pedido, tras revisar captura real) FIX — el resumen
// "c.#X-c.#Y" (v1.58/v1.60) solo se dibujaba cuando hay2da era true;
// Coda/Final y cualquier sección con repeticiones>1 pero SIN 1ra/2da vez
// (el "x2 (...)" simple, sin corchetes) se quedaban sin resumen. Se
// simplifica además la fórmula del compás final a
// compasGlobalInicio+duracion-1 (duracion ya es el total real de todas
// las vueltas), que cubre los dos casos con el mismo cálculo. Ver detalle
// junto al código, cerca de "x2 (...)".
//
// v1.60: (a pedido) el resumen "c.#X-c.#Y" (v1.58, hasta ahora solo en
// fija-bloque con 1ra/2da vez) se extiende a los demás tipos: Vamp
// (Solo/Coro — junto a "se repite..."), Break/Corte (junto a la nota, o
// solo si no hay nota) y fija-bloque simple sin 1ra/2da vez (Remate,
// Coda/Final, etc.). Se extrajo un helper compartido
// (dibujarResumenCompases) para no repetir el mismo texto/estilo 4 veces.
// Ver el helper (cerca de dibujarIconoRepeticion) y cada punto de uso.
//
// v1.59: (a pedido) mismo recurso "#N" pegado a la 1ra caja (v1.55-58)
// ahora también en secciones tipo Vamp (Solo, Coro — loop simple). Lista
// los compases reales de las próximas vueltas, hasta donde entren en la
// caja (3 líneas) — sin "…" de corte al final, porque el Vamp siempre
// tiene el texto "se repite (ciclo de N comp.)" debajo que ya cubre el
// caso de más vueltas de las que entran en la lista. Ver detalle junto
// al código, rama `s.tipo === 'vamp'`.
//
// v1.58: (a pedido, tras comparar las 2 versiones de v1.57) se queda la
// lista "#N" pegada a la caja, y la frase de al lado cambia de "repite en
// compás #N" a un rango de compases reales de todo el bloque:
// "c.#14-c.#17" — en el mismo renglón que "x2 (...)", a la derecha (ya
// no en renglón aparte). Ver fórmula del compás final junto al código.
//
// v1.57: (a pedido, 3 cambios en un solo pedido)
//  (a) se saca la flecha "→" de la lista de "#N" (el glifo se rompía en
//      el PDF, se veía como "!'") — queda solo "#N", así alinea exacto
//      debajo del label "#14" real (mismo x, align right).
//  (b) se agrega una SEGUNDA versión de la misma info, en paralelo, para
//      comparar: una frase ("repite en compás #16") pegada junto al
//      texto de duración "x2 (N comp. reales)". Las dos conviven por
//      ahora — a pedido, para decidir cuál se queda.
//  (c) "#N" (compás real) ahora también se dibuja en Break/Corte
//      (dibujarCajaBreak no lo traía, solo lo hacía dibujarCajas) —
//      mismo estilo/posición que la grilla normal, uno por cada parte
//      de la caja. Se agregó un 5to parámetro (compasGlobalInicio) a
//      dibujarCajaBreak y se lo pasa el wrapper de dibujarBloqueSeccion.
// Ver detalle en cada punto, junto al código.
//
// v1.56: (a pedido, tras revisar captura real) FIX — la lista "→ #N" de
// v1.55 no sumaba el corrimiento que dibujarCajas() aplica a la fila 0
// cuando hay una nota arriba (ej. "MAS SUAVE", +notaFilaAlto=5mm) —
// quedaba dibujada más arriba que el label "#14" real, pisándolo. Ahora
// usa hayNotas1 (mismo dato que ya se le pasa a dibujarCajas) para
// calcular la Y real de la 1ra caja antes de anclar la lista debajo del
// label. Ver detalle junto al código.
//
// v1.55: (a pedido, versión final) "→ #N" deja de ser un solo número
// debajo de toda la caja — ahora es una lista (una vuelta por línea)
// pegada JUSTO abajo del label "#14", misma esquina sup. derecha de la
// 1ra caja, adentro. Con más de 2 repeticiones se listan todas las
// próximas vueltas; si no entran (más de 3), la última línea visible se
// reemplaza por "…". Reemplaza el fix de espaciado de v1.54 (ya no hace
// falta, al no compartir renglón con "x2 (...)"). Ver detalle junto al
// código.
//
// v1.54: (a pedido, tras revisar captura real) FIX de separación — el
// "→ #N" (v1.51) y el texto "x2 (N comp. reales)" quedaban a solo 2mm uno
// del otro y se veían amontonados. Se reservan 3mm extra justo después de
// dibujar "→ #N" para separarlos, sin afectar los casos donde no se
// dibuja ese texto. Ver detalle junto al código.
//
// v1.53: (a pedido) se agrega la duración de la sección ("· N comp.") al
// lado del nombre, en la franja de color del título — mismo dato/formato
// que ya mostraba guia-practica.html en sus propias etiquetas de
// estructura, pero antes no existía en el PDF. Usa s.duracion (compases
// reales). Va DENTRO del texto del nombre para heredar el cálculo de
// espacio libre (xLibre) ya existente, sin pisar la nota de sección ni el
// ícono D.S./D.C. Ver detalle donde se dibuja el título más abajo.
//
// v1.52: (a pedido, tras confirmar con datos reales: Break/Corte de 1
// compás con varios acordes en un solo campo de texto) FIX — dibujarCajaBreak
// usaba un ancho de caja proporcional a `total` (compases), así que con
// total=1 la caja quedaba angosta y el texto libre del acorde desbordaba
// por los dos lados. Como el Break/Corte es siempre UN renglón/frase libre
// de la sección (no una grilla por compás), ahora usa siempre el ancho
// completo de la página (anchoUtil), sea 1 compás o varios. Ver detalle
// en dibujarCajaBreak() más abajo.
//
// v1.51: (a pedido, tras 2 iteraciones de ubicación — ver v1.49/v1.50 más
// abajo) versión final de la referencia "próx. vuelta": pasa a llamarse
// "→ #N" y se dibuja DEBAJO de la 1ra caja puntual (#14), centrada bajo
// esa columna — no arriba de toda la fila (v1.49/v1.50), que quedaba sin
// ancla visual o rompía el orden de lectura. Al ir debajo de la caja
// (afuera, en el colchón que ya deja dibujarCajas) no choca con la letra
// en cursiva, que va DENTRO de la caja. Ver detalle donde se dibuja, junto
// a dibujarBloqueSeccion() más abajo.
//
// v1.49/v1.50: (a pedido) intentos previos de esta misma referencia —
// v1.49 la ubicó arriba a la derecha de la fila ("próx. inicio: #N"),
// v1.50 la movió arriba a la izquierda, pegada a la barra de repetición
// ("→ #N"). Ambas quedaron reemplazadas por v1.51 (debajo de la caja).
//
// v1.48: (a pedido, tras revisar captura real) FIX en el modo "casilla en
// horizontal" — el trazo derecho de la barra de repetición ║...║ se
// dibujaba justo donde arranca la caja de la 2da vez (pegada sin espacio
// al lado de la 1ra), así que quedaba montado/pisando esa caja. Ahora,
// cuando hay 2da vez horizontal, el ancho de la barra se extiende para
// que el trazo derecho cierre DESPUÉS de la caja de la 2da vez (el ciclo
// completo con su final incluido), no en el borde de la 1ra. El trazo
// izquierdo, el modo apilado y los casos sin 2da vez no cambian. Ver
// detalle en el comentario junto a dibujarBarraRepeticion() más abajo.
//
// v1.47: FIX sobre v1.45/v1.46 — el "#N" de la 2da vez (repetición con
// finalDistintoN) estaba mal calculado cuando repeticiones>1. Se le
// pasaba el mismo compasGlobalInicio que a la 1ra pasada + su columna
// local (colReemplazo), como si la 2da vez ocurriera en la 1ra vuelta.
// Pero la 2da vez es SIEMPRE la ÚLTIMA vuelta del repetido — hay que
// sumarle las vueltas intermedias completas: (repeticiones-1)*basePase
// compases reales antes de llegar a colReemplazo. Ejemplo real: sección
// que arranca en #14, repeticiones=2, basePase=2, colReemplazo=1 (c.2):
// antes mostraba #15 (14+1, como si fuera la 1ra vuelta); ahora muestra
// #17 (14 + (2-1)*2 + 1), que es el compás real correcto de la última
// vuelta. Con repeticiones=1 la fórmula no suma nada, así que no cambia
// nada para las secciones sin repetición. Aplica a los dos modos (2da
// vez horizontal y apilada vertical) — el "c.N" (relativo, de siempre)
// no se tocó, sigue mostrando lo mismo que siempre mostró.
//
// v1.46: (a pedido) FIX de criterio sobre v1.45 — el Vamp ahora SÍ
// numera "#N" en sus cajas de ciclo (antes se excluía a propósito). El
// razonamiento de v1.45 ("no hay una caja única si el ciclo se repite")
// estaba de más: s.duracion ya define sin ambigüedad el total real de
// vueltas (duracion/ciclo), y la vuelta dibujada es siempre la primera
// (los primeros `ciclo` compases reales de la sección) — mismo criterio
// que fija-bloque con repeticiones, que tampoco renumera las vueltas
// repetidas por ser idénticas. El contador global no cambió (ya sumaba
// bien s.duracion del Vamp); solo cambió que sus propias cajas ahora
// muestran el número.
//
// v1.45: (a pedido) contador general de compases — cada caja ahora
// puede mostrar, además del "c.N" de siempre (relativo a la sección),
// un "#N" chico arriba a la derecha con el compás REAL del tema
// completo (con repeticiones incluidas), para dar una referencia rápida
// en vivo ("arrancamos en el compás 47") sin tener que sumar sección por
// sección. Se agregó opciones.compasGlobalInicio a dibujarCajas (nuevo,
// opcional — sin él, cero cambios visuales) y una variable compasGlobal
// que se acumula sección por sección usando s.duracion (que en
// guia-practica.html sale de hastaSegundos-desdeSegundos, y existe para
// CUALQUIER tipo de sección incluido Vamp — así que ya viene con
// repeticiones/vueltas reales, sin recalcular nada acá). Si en algún
// punto una sección no tiene fin de tiempo definido, el contador se
// apaga de ahí en adelante (mejor no numerar que numerar mal). El Vamp
// SÍ suma su duración real al contador general, pero sus propias cajas
// (el ciclo) no muestran "#N" — se dibuja una sola vez pero suena
// repetido N veces en vivo, no hay una caja única para asignarle un
// compás real. No se tocó ningún cálculo de compases/columnas/páginas
// existente — todo lo agregado es aditivo (nuevo texto opcional).
//
// v1.44: (a pedido, tras revisar capturas reales) 2 ajustes al modo
// "casilla en horizontal" (v1.43):
// 1) FIX — el corchete "2." horizontal se montaba sobre la franja de
// color del título de la sección siguiente/anterior. La reserva de +5mm
// de aire arriba solo se activaba si !cabeHorizontal, con el supuesto de
// que en horizontal no se dibuja ningún corchete arriba — pero sí se
// dibuja (el "2." de la caja pegada al lado), con el mismo offset hacia
// arriba que el "1." del modo apilado. Ahora el aire se reserva siempre
// que alineable && hay2da, sin importar el modo.
// 2) (a pedido) el corchete "1." ahora también se dibuja en modo
// horizontal, arriba de la caja de la 1ra pasada que se reemplaza —
// antes solo aparecía en el apilado vertical, y en horizontal solo había
// "2." arriba de la caja nueva, sin nada que marcara cuál caja de la 1ra
// fila es la reemplazada (había que leer el "c.N" chico para deducirlo).
// Mismos datos de siempre (xReemplazo/anchoReemplazo, ya calculados) —
// no se tocó dibujarCorcheteCasilla ni el cálculo de columnas.
//
// v1.43: (a pedido) modo "casilla en horizontal" — nuevo checkbox del
// staff (s.casillaHorizontal, guia-practica.html v1.56). Si está tildado
// Y la 2da vez entra completa en las columnas libres que le quedan a la
// fila de la 1ra vez Y ambas comparten el mismo criterio de "hay notas
// por compás" (si no, cae al apilado de siempre): la 2da vez se dibuja
// pegada a la derecha, en la MISMA fila, con su propio corchete "2."
// angosto arriba (mismo estilo/offsets que el corchete de siempre) y
// "c.N" mostrando el compás real que reemplaza. Requirió generalizar
// dibujarCajas con un 6to parámetro `labelInicio` (separa "dónde se
// dibuja" de "qué número dice la etiqueta") y un 7mo `opciones`
// (yBase/hayNotasForzado/sinAvanzarY, para poder dibujar en la fila que
// ya dibujó la 1ra vez sin duplicar el avance del cursor `y`). Con los
// defaults de siempre, ambos parámetros no cambian nada del
// comportamiento existente.
//
// v1.42: (a pedido) 2 fixes sobre v1.41:
// 1) la etiqueta "c.N" de la 2da vez alineada usaba el índice local del
// loop en vez de la posición real de columna — mostraba "c.1" en vez de
// "c.2" cuando reemplazaba el 2do compás. Ahora usa posGlobal (ver
// dibujarCajas).
// 2) el corchete "1." nuevo chocaba con la franja de color del título,
// porque no había aire reservado arriba de la sección (asegurarEspacio
// solo protege hacia abajo). Se reordenó el cálculo de
// hay2da/alineable/finalN para saberlo ANTES de capturar yBloque, y se
// agregan +5mm de aire arriba en ese caso puntual — el corchete en sí
// no se movió (sigue igual de pegado a la caja/nota de abajo).
//
// v1.41: (a pedido) 2 cambios en el bloque 1ra/2da vez, para que se vea
// claramente CUÁL compás cambia en la última pasada (antes la 2da vez
// siempre arrancaba en columna 1, sin indicar nada):
// 1) dibujarCajas() y dibujarCorcheteCasilla() ahora aceptan una columna
// /posición de arranque opcional (retrocompatibles, default = igual que
// antes).
// 2) SOLO cuando la 1ra vez entra en una única fila (caso normal — si
// ocupa varias filas, cae al comportamiento de siempre): la 2da vez se
// dibuja alineada bajo la(s) columna(s) real(es) que reemplaza, y se
// agrega un corchete "1." nuevo arriba de esas mismas columnas en la 1ra
// vez (por encima de la tira de nota si hay, para no pisarla). Ojo: este
// corchete "1." puede necesitar algo de espacio libre POR ENCIMA de
// donde arranca la sección — no se verificó con asegurarEspacio porque
// esa función solo protege espacio hacia ABAJO. Si en algún caso queda
// muy pegado al contenido de arriba, avisar para ajustar.
//
// v1.40: (a pedido) menos aire entre el número y la línea del corchete
// "2." (2.5mm→1.8mm) — se veía muy suelto/flotando. Ver comentario en
// dibujarCorcheteCasilla.
//
// v1.39: (a pedido) FIX de dirección sobre v1.38 — no había tenido en
// cuenta que dibujarCajas() deja +4mm de colchón después de la caja, así
// que el ajuste anterior del texto "x2 (...)" (y-2→y-3) en realidad lo
// acercaba al borde de arriba en vez de alejarlo. Corregido a y-1 (3mm
// reales de aire). Además, se invirtió el orden dentro del corchete
// "2.": la LÍNEA (lo visualmente dominante) ahora queda pegada a la
// caja de abajo (encajonando), y el NÚMERO flota arriba de la línea —
// al revés de v1.38, que tenía el número pegado y la línea lejos. Hueco
// fijo subido a 7mm para que el número no quede pegado al texto "x2".
//
// v1.38: (a pedido) 2 ajustes finos de espaciado en el bloque 1ra/2da
// vez: 1) texto "x2 (N comp. reales)" bajado 1mm (y-2→y-3), quedaba
// tocando el borde de la grilla de arriba; 2) número+línea del corchete
// "2." acercados a la caja de abajo (encajonando la nota), manteniendo
// el mismo margen de 2.5mm entre ellos que ya venía funcionando sin
// tocarse.
//
// v1.37: (a pedido) FIX sobre v1.36 — el hueco fijo antes del bloque de
// 2da vez era muy chico (3mm) y ahí se pisaban el texto "x2 (N comp.
// reales)", la línea del corchete "2." y el borde de la grilla de la fila
// anterior (ver comentario en el punto donde se usa, más abajo). Subido
// a 6mm.
//
// v1.36: (a pedido) FIX rápido sobre v1.35 — bajado el bloquecito
// número+línea del corchete de casilla, quedaba muy separado de la
// grilla de abajo (ver comentario en dibujarCorcheteCasilla).
//
// v1.35: (a pedido) 2 fixes puntuales en el bloque de repetición 1ra/2da
// vez: 1) dibujarBarraRepeticion ya no abarca la tira de nota de la 1ra
// fila, solo el alto real de las cajas (ver comentario en el llamado,
// más abajo en la función principal); 2) dibujarCorcheteCasilla sube su
// línea 1mm (-3→-4) para que no toque el número "2." — verificado que
// sigue sin chocar con el texto "x2 (N comp. reales)" de arriba.
//
// v1.34: (a pedido) limpieza de comentario — la línea de v1.31 mencionaba
// altoCajaEfectivo(notas) como criterio vigente para altoBloque/altoBloque2,
// pero esa función ya no existe (quedó reemplazada por el criterio de
// notaFilaAlto/hayContenido de v1.55 en guia-practica.html / dibujarCajas).
// Solo se corrige el texto del comentario, cero cambios de código real.
//
// v1.33: (a pedido) cierre de la nota corta por compás (v1.32 ya había
// actualizado dibujarCajas y calcularAltoSeccion) — faltaban los llamados
// reales: 1) dibujarCajas(s.acordesCiclo,...) del bloque vamp ahora pasa
// s.notasCiclo como 4to argumento; 2) dibujarBloqueSeccion (wrapper que
// alterna entre dibujarCajas y dibujarCajaBreak) ahora acepta un 4to
// parámetro de notas — en la rama Break lo ignora (Break sigue usando
// notaTiempoCorte, una sola frase por bloque, no notas por compás; no se
// tocó dibujarCajaBreak); 3) los 3 llamados reales a dibujarBloqueSeccion
// (pasada única, 1ra pasada con repeticiones, 2da vez) ahora pasan
// s.notasPorCompas / s.notasFinal2 según corresponda; 4) altoBloque y
// altoBloque2 (usados para dibujar la barra/corchete de repetición) ya no
// usan cajaAlto fijo — en secciones normales usan el mismo criterio de
// notaFilaAlto/hayContenido que calcularAltoSeccion, para que la barra quede del
// mismo alto que las cajas reales cuando hay nota cargada; en Break/Corte
// se dejó la fórmula fija de siempre (no usa notas por compás). No se
// tocó dibujarCajas, dibujarCajaBreak, calcularAltoSeccion, el parser de
// notas ni ningún cálculo de compases — solo estas 8 líneas puntuales.
// Nota: el staff de guia-practica.html todavía no tiene inputs para
// cargar notasPorCompas/notasCiclo/notasFinal2 (solo existe el editor de
// notaTiempoCorte, que es un campo distinto) — queda pendiente para
// después, a pedido.
//
// v1.31: (a pedido) mismo cambio que guia-practica.html v1.53 — nueva
// "nota de sección" (s.notaSeccion) para todas las secciones. En
// calcularAltoSeccion se reserva 4mm extra cuando hay contenido (en
// ambas ramas, coda y normal). En el dibujo de la barra de título, justo
// después de imprimir el nombre y avanzar "y += 9", si hay notaSeccion
// se imprime en itálica gris (color 110) chica (7.5pt) debajo de la
// barra, y se suman otros 4mm a "y". Red de seguridad: si el texto no
// entra en el ancho útil a 7.5pt (la itálica a veces ocupa más que la
// misma fuente en normal), se reduce de a 0.5pt hasta 6pt mínimo — el
// límite de 70 caracteres del editor ya cubre el caso normal, esto es
// solo por si acaso. Probado con jsPDF real (test_nota_seccion.pdf),
// incluyendo el peor caso (70 "M" mayúsculas seguidas), antes de aplicar.
//
// v1.30: FIX — mismo fix que guia-practica.html v1.52: la ligadura ("-")
// ahora dibuja su propia cabeza+plica (esNota incluye "-"), como
// corresponde a 2 notas completas unidas por una curva, no una nota
// fantasma. Efecto colateral corregido en el mismo cambio: se agrega
// esBeamable (solo x/X) para la pasada de beams, y una rama dedicada
// para "-" que siempre dibuja su propia bandera suelta — nunca se
// agrupa en un corchete con la nota anterior/siguiente (sería redundante
// con la curva de ligado). Probado con jsPDF real (test_ligado2.pdf)
// antes de aplicar. No cambia silencios, parser, pesos, corchetes de
// grupo, doble barra ni la curva de ligado en sí (v1.29).
//
// v1.29: (a pedido) 2 FIX de consistencia preview/PDF:
// 1) Acento (">") del patrón se veía "muy grande" — estaba reusando
// dibujarIconoAcentoBreak() con sus medidas fijas (2.2x1.7mm, grosor
// 0.5mm), pensadas para otra escala/contexto en el documento. Se dibuja
// ahora un acento propio dentro de dibujarPatronRitmico, escalado a la
// misma proporción que usa patronRitmicoSVG en el preview (relativo a
// altoPlica=6mm). NO se tocó dibujarIconoAcentoBreak en sí, por si se usa
// en otro lado a su tamaño original — solo se dejó de llamar desde acá.
// 2) Ligadura: estaba dibujada con 2 líneas rectas en ángulo (∧),
// distinta a la curva suave del preview. Se reemplaza por una curva
// bezier (aproximación cúbica de la misma quadratic del SVG) con la
// misma profundidad proporcional (v1.51 en guia-practica.html).
//
// v1.28: FIX — mismo fix que guia-practica.html v1.50: el corchete de
// tresillo/sextillo vuelve a ir de PLICA a PLICA (no del borde del
// casillero, que se salía por los costados). Se saca el tick de cierre
// de v1.26 (ya no hace falta, ambas puntas caen en una plica real). Si
// el grupo tiene un solo golpe real, bandera curva en vez de corchete.
// Probado con jsPDF real (test_patron3.pdf) antes de aplicar. No cambia
// silencios, ligados, parser, pesos, doble barra (v1.27) ni radios de
// cabeza (v1.26).
//
// v1.27: (a pedido) mismo cambio que guia-practica.html v1.49 —
// acercando el dibujo a la notación musical estándar:
// 1) Doble barra cuando el grupo es de 6 (sextillo/semicorchea), simple
// para 3 (tresillo/corchea). Separación 1.3mm, barra 0.75mm de grosor,
// tick de cierre extendido de 1.1 a 1.8mm para cerrar ambas.
// 2) Plica más fina: de 0.35 a 0.28mm.
// 3) Bandera curva (bezier vía doc.lines con segmentos de 6 valores) en
// vez de la línea recta diagonal, para la corchea suelta. Probada
// aislada en Node+jsPDF real (test_flag.pdf) antes de aplicarla acá,
// para no arriesgar el PDF de producción sin verificar que jsPDF la
// soporta bien.
// No toca silencios, ligados, parser, pesos, ni el ancho del corchete de
// grupo (v1.24).
//
// v1.26: (a pedido) mismo cambio que guia-practica.html v1.48 — vuelve la
// cabeza de nota (más chica dentro de grupos, r=0.55mm vs 0.9mm, para que
// no se toquen entre sí) y se agrega tick de cierre en cada punta del
// corchete de tresillo/sextillo (antes quedaba "abierto" si el extremo
// del grupo era un silencio). No cambia silencios, ligados, parser,
// pesos, ni el ancho del corchete (v1.24).
//
// v1.25: (a pedido) mismo cambio que guia-practica.html v1.47 — se saca
// la cabeza (círculo) de todas las notas del patrón rítmico, queda solo
// la plica. Resuelve que en tresillos/sextillos las cabezas de notas
// consecutivas quedaran casi pegadas entre sí. La plica se centra en el
// punto exacto del pulso (antes +0.9 a la derecha). No cambia el ancho
// de los corchetes de tresillo/sextillo (v1.24), silencios, ligados,
// parser ni pesos.
//
// v1.24: FIX — mismo fix que guia-practica.html v1.46: el ajuste de v1.23
// (corchete cubriendo el ancho real del grupo) tapaba el acento (">")
// cuando la nota acentuada quedaba cerca del centro del grupo — se sube
// el número de yBase-altoPlica-1 a yBase-altoPlica-4.5. Y el corchete, al
// tocar la línea de compás en el primer/último grupo del patrón, se le
// resta 0.25mm de cada lado para separarlo visualmente de la barra (antes
// se "fundían" y parecía que la línea de compás había crecido, aunque su
// alto no cambió). No requirió tocar el margen reservado (altoPlica+7)
// porque el número sigue dentro de esa franja.
//
// v1.23: (a pedido) el corchete y el número de tresillo/sextillo en
// dibujarPatronRitmico ahora cubren el ancho REAL de todo el grupo (borde
// izquierdo de su primera posición a borde derecho de su última), no solo
// el tramo entre el primer y el último golpe — antes, si el grupo
// empezaba o terminaba en silencio, el corchete quedaba angosto/corrido y
// el número descentrado. Se dibuja siempre que el grupo sea válido, aunque
// no tenga ningún golpe adentro. Mismo criterio aplicado en paralelo en
// patronRitmicoSVG (guia-practica.html v1.45) para que pantalla y PDF
// sigan viéndose igual. No cambia el parser, el peso de columnas, ni el
// dibujo de golpes/silencios/ligados.
//
// v1.22: FIX del fix de v1.21 — el diffuser ya no se estiraba, pero se
// filtraba (sin recortar) por debajo del header, tapando el título y la
// primera sección. Probado en aislado (Node + jsPDF real + render a
// imagen): doc.rect(x,y,w,h) SIN un 4to argumento de estilo pinta un
// trazo (stroke) por defecto, lo que "cierra" el path ANTES de que
// doc.clip() llegue a aplicarlo — el recorte de PDF exige pedirse ANTES
// de pintar el trazado. Fix real: doc.rect(x,y,w,h,null) — el `null`
// evita que se pinte nada, dejando el path abierto para que clip() sí
// lo tome. Verificado con un rectángulo de prueba: sin el `null` el
// "recorte" no cortaba nada (se veía completo); con `null` corta
// exactamente en el borde esperado. No cambia ningún otro cálculo.
//
// v1.21: FIX estiramiento del diffuser en local (file://) — reportado con
// captura real (perillas ovaladas en vez de circulares). recortarImagenCover()
// (canvas.toDataURL()) siempre tira SecurityError bajo file://, y el plan B
// de v1.15/v1.20 (imagen sin recortar, forzada a pageW×headerH) estiraba la
// imagen sin respetar su proporción. Se elimina recortarImagenCover() y se
// reemplaza por dibujarDiffuserCover(): calcula el mismo tamaño "cover" de
// siempre, pero en vez de recortar píxeles con canvas, dibuja la imagen
// completa a ese tamaño (centrada, más grande que el header) y usa el
// doc.rect()+doc.clip() nativo de jsPDF para ocultar visualmente el
// sobrante — 100% vectorial, nunca lee píxeles por su cuenta, así que
// funciona igual en file:// y en servidor. También usa detectarFormatoImagen()
// (v1.20) en vez de asumir 'JPEG'. No cambia el logo, headerH, colores,
// opacidades, ni ningún otro dibujo/cálculo de compases.
//
// v1.20: FIX real de fondo (el de v1.19 no alcanzaba en todos los casos)
// — cuando el logo/diffuser cae al último recurso (raw <img> sin
// convertir, por SecurityError de canvas bajo file://), el código
// pasaba SIEMPRE 'JPEG' como formato a doc.addImage(), sin importar el
// archivo real. El logo por defecto (img/logo 1.png) es un PNG: al
// decirle a jsPDF que es JPEG, jsPDF no confía en el dato y sale a
// re-verificar los bytes reales con un XMLHttpRequest interno propio —
// ese XHR es el que queda bloqueado por CORS bajo file:// (mismo
// síntoma ya visto: "botón no responde"), y por eso funcionaba con
// rutas de Cloudinary (XHR remoto sí permitido por sus headers CORS)
// pero no con el logo local por defecto. Nueva función
// detectarFormatoImagen(src) lee la extensión real del archivo
// (.png → 'PNG', .webp → 'WEBP', cualquier otro caso incl. URLs sin
// extensión como Cloudinary → 'JPEG', igual que antes) y se usa en el
// catch de logo Y diffuser. No cambia el camino feliz (canvas→dataURL,
// que ya fuerza JPEG real vía toDataURL), ni headerH, colores, tamaños,
// ni ningún otro dibujo.
//
// v1.19: FIX de fondo (el try/catch de v1.16 no alcanzaba) — el botón
// "Exportar PDF" seguía sin responder en local (file://) en musico.html y
// guia-practica.html. La consola mostró la causa real: jsPDF, al recibir
// el <img> crudo del logo en doc.addImage(), sale a buscar los bytes
// ORIGINALES del archivo con un XMLHttpRequest interno propio — ese XHR
// queda bloqueado por CORS bajo file://, y el TypeError que sigue explota
// DENTRO de un callback asíncrono de jsPDF (addimage.js), fuera de
// cualquier try/catch síncrono alrededor de la llamada — por eso el
// try/catch de v1.16 nunca lo atrapaba, aunque el síntoma (mismo mensaje
// de error) era idéntico. Fix real: nueva función imagenComoDataURL()
// convierte el logo a dataURL vía canvas ANTES de pasarlo a jsPDF (mismo
// mecanismo que el diffuser ya usa con éxito desde v1.11/v1.15) — así
// jsPDF ya tiene los bytes inline y nunca sale a buscarlos por su cuenta.
// Verificado con el patrón real del logo (.jfif) reportado por el
// usuario. No cambia headerH, colores, diffuser, ni ningún otro dibujo.
//
// v1.18: FIX — a pedido, tras revisar una captura real del preview: la
// marca de silencio se dibujaba arriba, casi en la misma zona/tamaño que
// el chevrón de acento, confundibles a simple vista. Ahora dibujarSilencio
// dibuja SIEMPRE debajo de la línea base, en gris (150,150,150) en vez de
// negro. dibujarPatronRitmico ahora reserva altoPlica+7 (antes +4) para
// que el llamador no pise esa marca. Mismo cambio en guia-practica.html
// (patronRitmicoSVG v1.44) para que preview y PDF se sigan viendo igual.
//
// v1.17: (a pedido) tresillos y sextillos en dibujarPatronRitmico —
// misma sintaxis "{...}" que guia-practica.html (patronRitmicoSVG v1.43):
// {xxx} tresillo, {xxxxxx} sextillo, ambos ocupan el espacio de 2
// corcheas normales sin importar cuántas notas tengan adentro. Nuevas
// funciones locales parsearPatronRitmico(), aplanarColumnasPatron() y
// pesoTotalPatron() (duplicadas a mano en guia-practica.html por el
// mismo motivo de siempre: jsPDF y SVG de pantalla no comparten dibujo).
// dibujarPatronRitmico ahora posiciona cada columna según su peso
// relativo (antes era ancho/n fijo) y dibuja los grupos válidos con un
// corchete único + número (3/6) centrado arriba en vez del corchete de a
// pares de siempre. Un grupo mal formado se dibuja como notas sueltas
// sin bracket. No cambia la firma de la función ni lo que devuelve
// (altoPlica + 4), ni ningún otro dibujo de este archivo.
//
// v1.16: FIX — el fallback de v1.15 no alcanzaba: la consola mostró que
// el verdadero corte pasaba en el LOGO, no en el diffuser. Bajo file://,
// jsPDF intenta traer los bytes originales del logo con un
// XMLHttpRequest directo al archivo (para incrustar el JPEG/JFIF sin
// recomprimir, mejor calidad) — esa petición queda bloqueada por CORS
// sin excepción posible bajo file:// (más estricto que el "tainted
// canvas" del diffuser), y tiraba un TypeError no capturado dentro de
// addImage() (Cannot read properties of undefined (reading 'data')) que
// cortaba TODO el PDF. Se envuelve ese doc.addImage() del logo en
// try/catch: si falla, se omite el logo puntual (el resto del header —
// diffuser, línea dorada, subtítulo — sigue intacto) en vez de cortar la
// generación completa. Servido por Netlify (http/https, mismo origen) el
// logo vuelve a incrustarse normal, sin cambios. No es un bug 100%
// arreglable en file:// (XMLHttpRequest a archivos locales está
// bloqueado sin excepción en el navegador) — la recomendación real es
// probar sirviendo el HTML con un servidor local (ej. `netlify dev`,
// Live Server), donde este problema no existe.
// v1.15: FIX — recortarImagenCover (v1.11) usa canvas.toDataURL(), que
// tira SecurityError ("tainted canvas") si el HTML se abre con file://
// (sin servidor) en vez de http(s), ya que el navegador no confía en
// imágenes locales cargadas así para leer el canvas. Eso cortaba TODA la
// generación del PDF sin aviso — el botón "Exportar PDF" quedaba sin
// responder en local, mientras que logistica.html (que nunca usa canvas,
// solo addImage directo con el <img>) sí funcionaba. Se envuelve el
// llamado en try/catch dentro de pintarHeader(): si falla, cae a
// addImage directo con la imagen original sin recortar (mismo criterio
// que logistica.html) — se pierde el recorte "cover" fino solo en ese
// caso puntual (file://), el PDF se sigue generando igual. Servido por
// Netlify (mismo origen http/https) el recorte cover sigue funcionando
// normal, sin cambios. No toca headerH, colores, ni el resto del dibujo.
// v1.14: (a pedido) el subtítulo del header ("GUÍA DE PRÁCTICA" + fecha)
// seguía con poco contraste (v1.12) contra las líneas de la textura del
// diffuser en esa zona. Se oscurece más (25,22,18, casi negro), el título
// pasa a negrita y opacidad plena (antes 0.85, gris 60,56,50) — la fecha
// queda en peso normal para mantener la jerarquía. Sigue sin fondito
// detrás (decisión tomada con el usuario, prioriza el look limpio del
// header sobre agregar un parche). No toca tamaño, posición, texto, logo,
// diffuser, headerH, ni ningún otro cálculo.
// v1.13: (a pedido) headerH sube de 28 a 38mm — igual que logistica.html
// — así el recorte "cover" del diffuser usa la misma proporción
// (pageW/headerH) que logistica.html y no se ve tan recortado/achatado
// (antes 210/28≈7.5:1, ahora 210/38≈5.5:1, mucho más parecido al 215.9/
// 38≈5.7:1 de logistica). Contrapartida asumida por el usuario: menos
// espacio para las cajas de acordes debajo, que era la razón original de
// v1.10 para dejarlo en 28mm. `y` arranca en headerH+9 = 47 (antes 37).
// No se tocó el recorte cover en sí (recortarImagenCover), el color del
// subtítulo (v1.12), ni ningún cálculo de compases/dibujo de cajas.
// v1.12: FIX contraste — el subtítulo del header (derecha, "GUÍA DE
// PRÁCTICA" + fecha) usaba crema/blanco (v1.11), pensado para un header
// con velo oscuro como el de logistica.html. Esta hoja usa el header sin
// ese velo (fondo queda con la textura metálica clara del diffuser tal
// cual, a propósito, confirmado con el usuario vía captura), así que el
// crema quedaba casi invisible sobre ese fondo claro. Se cambia a gris
// oscuro (60,56,50), mismo tono que el logo, en vez de agregar un fondito
// oscuro detrás del texto — así no se rompe el look limpio y claro del
// header. No se tocó tamaño, posición, texto, logo, diffuser, ni ningún
// otro color/cálculo. Afecta a guia-practica.html y musico.html (comparten
// este archivo vía <script src>).
// v1.10: (a pedido) header ampliado — de vuelta a franja de color +
// diffuser + logo + subtítulo (mismo espíritu visual que logistica.html),
// pero headerH=28mm (no 38mm): decisión acordada con el usuario, esta
// hoja sigue siendo de atril y necesita más espacio para las tarjetas de
// acordes que un informe de logística. Lee las mismas variables globales
// de header-config.js que logistica.html (HEADER_SIN_FONDO,
// HEADER_COLOR_RGB, HEADER_DIFFUSER_OPACITY, HEADER_COLOR_OPACITY,
// LOGO_SIZE/ALIGN/OFFSET_Y/SIN_LOGO), con typeof-guards por si esa hoja
// no cargó. Subtítulo derecho nuevo: "GUÍA DE PRÁCTICA" + fecha, mismo
// patrón que el subtítulo de exportarPDF() en logistica.html. Reemplaza
// el header discreto de v1.9 (13mm, solo logo + línea dorada, sin fondo).
// El resto del PDF (cajas de acordes, patrón rítmico, cálculos de
// compases) no se tocó — solo el bloque de header y el punto de arranque
// de `y` (ahora headerH+9 = 37 en vez de 22).
// v1.9: (a pedido) header discreto (pintarHeader()) al inicio de la
// primera página — logo (leído de #hdrLogo, mismo criterio que
// logistica.html: LOGO_SIZE/LOGO_ALIGN/LOGO_OFFSET_Y/LOGO_SIN_LOGO de
// header-config.js) + línea dorada fina debajo, headerH=13mm fijo. A
// propósito NO usa franja de color de fondo ni diffuser (a diferencia de
// logistica.html) — decisión tomada con el usuario: este PDF es una hoja
// de referencia rápida para atril, un header protagónico le come espacio
// útil y compite con las cajas de acordes. Si LOGO_SIN_LOGO está activo
// (o no hay imagen cargada en #hdrLogo), solo se dibuja la línea dorada
// y el PDF queda visualmente igual que antes de este cambio, solo
// desplazado ~13mm. El nombre del tema + BPM se corren ese mismo alto
// (y arranca en headerH+9 en vez de margen) pero se dibujan exactamente
// igual que antes (mismo texto, tamaños y orden). No toca
// dibujarCajas/dibujarCajaBreak/patrón rítmico ni ningún cálculo de
// compases — es exclusivamente el bloque de header y el punto de arranque
// de `y`.
// v1.8: (a pedido) ícono de acento ">" (dibujarIconoAcentoBreak) más chico
// — de 2.6x3.4 a ~1.7x2.2 (65%), con su espacio reservado ajustado (return
// 4 → 2.6) para que no quede hueco de más al lado del golpe acentuado. Se
// re-centró el offset en dibujarPatronRitmico (que lo reutiliza sobre la
// plica) para que siga alineado con el nuevo tamaño. No cambia el resto
// del dibujo del patrón ni ningún cálculo de compases.
// v1.7: (a pedido) líneas de compás en el patrón rítmico
// (dibujarPatronRitmico) — barra de apertura al inicio, cierre al final, y
// una divisoria entre cada compás si la sección dura 2+ compases (mismo
// criterio visual que ya separaba los acordes en dibujarCajaBreak). Nuevo
// parámetro `compases` (con default 1 para no romper otros llamados);
// dibujarCajaBreak ahora se lo pasa (`total`) en su propio llamado. No
// cambia el agrupado de a 2 ni el dibujo de golpes/silencios/ligados.
// v1.6: (a pedido) se saca el texto "BREAK" de dibujarCajaBreak — la nota
// de tiempo (notaTiempoCorte), si el staff cargó una, se recorre para
// arrancar donde antes empezaba "BREAK" (columna del margen) en vez de
// desaparecer. Si no hay nota, ese renglón queda vacío pero se sigue
// reservando el mismo alto (y += 6) que antes, así calcularAltoSeccion no
// necesita tocarse. No afecta la caja de acordes condicional (v1.5) ni el
// patrón rítmico.
// v1.5: (a pedido) 2 ajustes a dibujarCajaBreak: 1) si ningún compás de la
// sección Break/Corte tiene acorde cargado, la caja de acordes no se
// dibuja (antes salía un rectángulo vacío) — va directo a "BREAK" +
// patrón; calcularAltoSeccion ajusta el alto reservado según corresponda.
// 2) se saca el ícono de acento ">" fijo junto a la palabra "BREAK" (el
// mismo ícono sigue usándose DENTRO del patrón rítmico para golpes
// acentuados marcados con "X" mayúscula — eso no cambia). No se tocó
// dibujarCajas, dibujarPatronRitmico, ni ningún cálculo de compases.
// v1.4: (a pedido) FIX — la caja de Break/Corte (dibujarCajaBreak) se
// dibujaba siempre con el ancho total de la página (anchoUtil) sin
// importar cuántos compases dura, viéndose desproporcionada al lado de
// secciones como Coro (que usan cajas de ancho fijo por compás). Ahora
// usa cajaAncho por compás (mismo criterio que dibujarCajas), con tope
// en POR_FILA compases — el patrón rítmico debajo también se ajusta a
// este nuevo ancho de caja en vez de anchoUtil. No cambia ningún cálculo
// de compases/duración, ni el alto de la caja, solo el ancho.
// v1.2: (a pedido) patrón rítmico para Break/Corte (dibujarPatronRitmico)
// — notación real acotada (solo corcheas, sin silencios propios ni
// ligaduras): plicas con cabeza rellena, agrupadas de a 2 con corchete
// cuando el par completo es golpe, gancho individual si queda sola.
// Toma s.patronRitmico (string "x"/"." , ej. "x.xx.x..", cargado por el
// staff), se dibuja debajo de "BREAK" solo si viene con datos. No cambia
// dibujarCajas, dibujarCajaBreak (salvo el agregado puntual), ni ningún
// cálculo de compases — calcularAltoSeccion reserva el espacio extra
// cuando corresponde.
// v1.1: (a pedido) una sección ya no se corte entre dos páginas — se
// reserva su alto TOTAL (header + bloque de cajas + 2da vez si hay) de
// una sola vez antes de dibujarla, en vez de solo 10mm fijos para el
// header (ver calcularAltoSeccion). No cambia ningún cálculo de compases
// ni el dibujo en sí, solo dónde arranca la página cuando no entra
// completa.
// v1.0: (a pedido, "que los dos PDF se vean iguales") generador de PDF de
// estructura, sacado tal cual de guia-practica.html v1.29.12
// (exportarEstructuraPDF) — cero cambios en dibujarCajas, dibujarCajaBreak,
// dibujarBarraRepeticion, dibujarCorcheteCasilla, íconos de repetición/coda/
// acento, letra de ensayo, D.C./variación/coda, ni en el cálculo de
// compases. Se comparte entre guia-practica.html y musico.html vía
// <script src="pdf-estructura.js">.
//
// Única diferencia con el original: en vez de leer bpm/compás/clave de los
// inputs del staff y recalcular duracion/color adentro del loop
// (duracionCompasesSeccion(s) / colorDeSeccionEnLista(secciones, i)), ahora
// los recibe ya resueltos en `datos` — eso es lo único que de verdad
// difiere entre staff (duracionCompasesSeccion, basado en hastaSegundos
// manual) y músico (su propio cálculo con secPerBar/hastaSegundos-o-
// próxima-sección), así que cada página sigue calculando esos dos valores
// como ya lo hacía, y este archivo solo dibuja. Todo lo demás (esCoda,
// nombresYaImpresos, letraEnsayo, repeticiones, Break/Corte, barra de
// repetición, preview en pestaña nueva) es exactamente el mismo código.
//
// Firma:
//   generarEstructuraPDF({ temaNombre, bpm, compasTexto, claveTxt, secciones })
// donde cada elemento de `secciones` es la sección tal cual (con todos sus
// campos: nombre, tipo, desdeSegundos, hastaSegundos, acordesPorCompas,
// letraPorCompas, acordesCiclo, letraCiclo, acordesFinal2, letraFinal2,
// letraEnsayo, origenId, esVariacion, notaVariacion, modoRepeticionPDF,
// compasOverride, notaTiempoCorte, repeticiones, finalDistintoN,
// cicloCompases, acordesSinTiempo, id) MÁS `duracion` y `color` ya
// resueltos por quien llama, ya ordenadas por desdeSegundos.
function generarEstructuraPDF(datos){
  const { temaNombre, bpm, compasTexto, claveTxt, secciones: seccionesEntrada } = datos;
  if(!window.jspdf){ alert('No se pudo cargar el generador de PDF. Revisá tu conexión e intentá de nuevo.'); return; }
  if(!seccionesEntrada || !seccionesEntrada.length){ alert('No hay secciones cargadas todavía.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margen = 12;
  const anchoUtil = pageW - margen * 2;

  // v1.10: (a pedido) header ampliado igual en espíritu al de
  // logistica.html (franja de color + diffuser + logo + subtítulo), pero
  // a headerH=28 (no 38) — hoja de atril, prioriza espacio para las
  // tarjetas de acordes sobre el protagonismo visual del header. Misma
  // lógica de pintado (HEADER_SIN_FONDO, HEADER_COLOR_RGB,
  // HEADER_DIFFUSER_OPACITY, HEADER_COLOR_OPACITY, LOGO_SIZE/ALIGN/
  // OFFSET_Y/SIN_LOGO) leída de header-config.js, con typeof-guards por
  // si esa hoja no llegó a cargar. Reemplaza el header discreto de v1.9
  // (13mm, solo logo + línea dorada).
  // v1.11: FIX contraste — el subtítulo usaba mutedRGB [154,151,143]
  // (gris beige), mismo color que logistica.html deja "fuera de alcance"
  // en su propio jsPDF (v2.128: ahí solo se corrigió el header piloto en
  // CSS, no el PDF real, por quedar afuera del pedido de ese momento).
  // Acá sí se corrige: blanco/crema con opacidad 0.85
  // (rgba(250,247,238,0.85), el mismo valor que usaron en el CSS
  // corregido de logistica.html), legible sobre el fondo oscuro/
  // texturizado sin competir con el dorado.
  const goldRGB = [201, 162, 75];
  // v1.13: headerH sube de 28 a 38mm — igual que logistica.html — a
  // pedido del usuario, para que el recorte "cover" del diffuser use la
  // misma proporción (pageW/headerH) que logistica y no se vea tan
  // recortado/achatado como con 28mm. Contrapartida ya asumida: menos
  // espacio para las cajas de acordes debajo (que era la razón original
  // de v1.10 para dejarlo en 28mm). El punto de arranque de `y` se ajusta
  // proporcionalmente más abajo (ver `let y = headerH + 9`). No se tocó
  // ningún cálculo de compases ni el resto del dibujo.
  const headerH = 38;
  const imgDiffuserHdr = document.getElementById('hdrDiffuser');
  const imgLogoHdr = document.getElementById('hdrLogo');
  const diffuserOkHdr = imgDiffuserHdr && imgDiffuserHdr.complete && imgDiffuserHdr.naturalWidth > 0;
  const logoOkHdr = imgLogoHdr && imgLogoHdr.complete && imgLogoHdr.naturalWidth > 0;
  const headerSinFondo = typeof HEADER_SIN_FONDO !== 'undefined' ? HEADER_SIN_FONDO : false;
  const headerColorRGB = typeof HEADER_COLOR_RGB !== 'undefined' ? HEADER_COLOR_RGB : [11, 11, 13];
  const headerDiffuserOpacity = typeof HEADER_DIFFUSER_OPACITY !== 'undefined' ? HEADER_DIFFUSER_OPACITY : 1.0;
  const headerColorOpacity = typeof HEADER_COLOR_OPACITY !== 'undefined' ? HEADER_COLOR_OPACITY : 0.62;

  // v1.11: FIX estiramiento — el diffuser se forzaba a pageW×headerH sin
  // respetar su proporción real; con headerH=28 (más bajo que los 38mm de
  // logistica.html) la distorsión horizontal se notaba mucho. Recorte
  // tipo "cover" (mismo criterio que background-size:cover en CSS): se
  // recorta el sobrante de la imagen (centrado) para llenar el header sin
  // deformarla, en vez de estirarla. Se calcula una sola vez por PDF.
  // v1.21: recorte "cover" del diffuser, ahora 100% vectorial (rect+clip
  // nativo de jsPDF) — reemplaza a recortarImagenCover() (basado en
  // canvas.toDataURL(), eliminada). El canvas fallaba siempre bajo
  // file:// (SecurityError, "tainted canvas"); el plan B de v1.15/v1.20
  // (imagen sin recortar, forzada a pageW×headerH) ESTIRABA la imagen
  // (perillas ovaladas en vez de circulares, visto en captura real del
  // usuario). Esta versión calcula el tamaño real "cover" (misma
  // matemática de antes: iguala el lado que sobra y centra) pero en vez
  // de recortar píxeles con canvas, dibuja la imagen completa a ese
  // tamaño (más grande que el hueco del header) y usa doc.clip() para
  // ocultar visualmente el sobrante — nunca lee píxeles por su cuenta,
  // así que funciona igual en file:// y en servidor, sin try/catch.
  function dibujarDiffuserCover(img, targetWmm, targetHmm, opacity, formato){
    const targetRatio = targetWmm / targetHmm;
    const srcRatio = img.naturalWidth / img.naturalHeight;
    let drawW, drawH;
    if(srcRatio > targetRatio){
      drawH = targetHmm;
      drawW = targetHmm * srcRatio;
    } else {
      drawW = targetWmm;
      drawH = targetWmm / srcRatio;
    }
    const drawX = (targetWmm - drawW) / 2;
    const drawY = (targetHmm - drawH) / 2;
    doc.saveGraphicsState();
    doc.rect(0, 0, targetWmm, targetHmm, null);
    doc.clip();
    doc.discardPath();
    doc.setGState(new doc.GState({ opacity }));
    doc.addImage(img, formato, drawX, drawY, drawW, drawH);
    doc.restoreGraphicsState();
  }
  // v1.19: (a pedido, FIX real de fondo) conversión simple imagen→dataURL
  // vía canvas, SIN recorte (a diferencia de recortarImagenCover) — para
  // el logo, que no necesita "cover", solo evitar que jsPDF reciba el
  // <img> crudo. Mismo mecanismo que ya usa el diffuser desde v1.11/v1.15
  // (canvas.drawImage + toDataURL), reutilizado tal cual.
  function imagenComoDataURL(img, calidad){
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    return canvas.toDataURL('image/jpeg', calidad != null ? calidad : 0.95);
  }
  // v1.20: solo se usa en el camino de "último recurso" (raw <img> sin
  // convertir vía canvas) — ahí SÍ importa que el formato declarado a
  // jsPDF coincida con el archivo real, para que no salga a re-verificar
  // los bytes por su cuenta (ver changelog v1.20 arriba). Default 'JPEG'
  // cubre .jpg/.jpeg/.jfif y también rutas sin extensión reconocible
  // (ej. URLs de Cloudinary), igual que el comportamiento anterior.
  function detectarFormatoImagen(src){
    const limpio = (src || '').split('?')[0].split('#')[0].toLowerCase();
    if(limpio.endsWith('.png')) return 'PNG';
    if(limpio.endsWith('.webp')) return 'WEBP';
    return 'JPEG';
  }

  function pintarHeader(){
    if(!headerSinFondo){
      if(diffuserOkHdr){
        dibujarDiffuserCover(imgDiffuserHdr, pageW, headerH, headerDiffuserOpacity, detectarFormatoImagen(imgDiffuserHdr.src));
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: headerColorOpacity }));
        doc.setFillColor(...headerColorRGB);
        doc.rect(0, 0, pageW, headerH, 'F');
        doc.restoreGraphicsState();
      } else {
        doc.setFillColor(...headerColorRGB);
        doc.rect(0, 0, pageW, headerH, 'F');
      }
    }
    doc.setDrawColor(...goldRGB);
    doc.setLineWidth(0.5);
    doc.line(0, headerH, pageW, headerH);
    if(logoOkHdr && !(typeof LOGO_SIN_LOGO !== 'undefined' && LOGO_SIN_LOGO)){
      const logoH = Math.min(typeof LOGO_SIZE !== 'undefined' ? LOGO_SIZE : 16, headerH - 4);
      const logoW = logoH * (imgLogoHdr.naturalWidth / imgLogoHdr.naturalHeight);
      const offsetY = typeof LOGO_OFFSET_Y !== 'undefined' ? LOGO_OFFSET_Y : 0;
      const logoY = (headerH - logoH) / 2 + offsetY;
      const align = typeof LOGO_ALIGN !== 'undefined' ? LOGO_ALIGN : 'izquierda';
      let logoX;
      if(align === 'centro') logoX = (pageW - logoW) / 2;
      else if(align === 'derecha') logoX = pageW - margen - logoW;
      else logoX = margen;
      // v1.19: FIX de FONDO (el try/catch de v1.16 no alcanzaba) — el
      // error real, visto en consola bajo file://, es un XMLHttpRequest
      // interno de jsPDF que sale a buscar los bytes ORIGINALES del logo
      // cuando se le pasa el <img> crudo a addImage(). Ese XHR queda
      // bloqueado por CORS y el TypeError que sigue explota DENTRO de un
      // callback asíncrono de jsPDF (addimage.js) — fuera de cualquier
      // try/catch síncrono puesto alrededor del addImage() en sí, por eso
      // v1.16 no lo atrapaba pese a envolver la llamada. La solución real
      // (mismo mecanismo ya probado acá con el diffuser desde v1.15):
      // convertir el logo a dataURL vía canvas ANTES de pasarlo a jsPDF —
      // así jsPDF ya tiene los bytes inline y nunca sale a buscarlos por
      // su cuenta, evitando el XHR problemático de raíz.
      let logoParaPintar = imgLogoHdr;
      let logoFormato = 'JPEG';
      try {
        logoParaPintar = imagenComoDataURL(imgLogoHdr);
        // imagenComoDataURL() fuerza JPEG real vía canvas.toDataURL(), así
        // que 'JPEG' siempre es correcto en este camino (éxito).
      } catch(e){
        logoParaPintar = imgLogoHdr; // último recurso: sin conversión, ver v1.16
        logoFormato = detectarFormatoImagen(imgLogoHdr.src); // v1.20: formato real, no asumido
      }
      try {
        doc.addImage(logoParaPintar, logoFormato, logoX, logoY, logoW, logoH);
      } catch(e){ /* logo omitido puntualmente, ver nota v1.19 arriba */ }
    }
    // v1.10: subtítulo derecha, mismo patrón que logistica.html.
    // v1.11: color corregido a crema (ver nota de contraste arriba) —
    // pensado para un header con velo oscuro encima, como logistica.html.
    // v1.12: FIX contraste real — a diferencia de logistica.html, esta
    // hoja usa el header sin velo oscuro (fondo queda con la textura
    // metálica clara del diffuser tal cual, a propósito, confirmado con
    // el usuario), así que el crema de v1.11 quedaba casi invisible sobre
    // ese fondo claro. Se cambia a gris oscuro (mismo tono que el logo)
    // en vez de agregar un fondito oscuro detrás, para no romper el look
    // limpio del header. No toca tamaño, posición, texto, logo, diffuser
    // ni ningún otro cálculo.
    // v1.14: (a pedido) el gris de v1.12 seguía perdiéndose contra las
    // líneas de la textura del diffuser en esa zona — se oscurece más
    // (casi negro), pasa a negrita y a opacidad plena (antes 0.85), sigue
    // sin fondito atrás (decisión tomada con el usuario: prioriza el look
    // limpio del header). No toca tamaño, posición, texto, logo, diffuser
    // ni ningún otro cálculo.
    doc.saveGraphicsState();
    doc.setGState(new doc.GState({ opacity: 1 }));
    doc.setTextColor(25, 22, 18);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text('GUÍA DE PRÁCTICA', pageW - margen, headerH - 12, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric' }), pageW - margen, headerH - 5, { align: 'right' });
    doc.restoreGraphicsState();
  }

  pintarHeader();
  let y = headerH + 9;

  const nombreTema = temaNombre || 'Tema sin nombre';

  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text(nombreTema, margen, y); y += 7;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.text(`BPM ${bpm || '—'} · Compás ${compasTexto || '4/4'}${claveTxt ? ' · Clave: ' + claveTxt : ''}`, margen, y);
  y += 8;

  const asegurarEspacio = (alto) => {
    if(y + alto > pageH - margen){ doc.addPage(); y = margen; }
  };

  const POR_FILA = 4;
  const cajaAncho = anchoUtil / POR_FILA;
  const cajaAlto = 16;
  // v1.55: hayContenido() sigue siendo el criterio compartido para
  // decidir si un bloque reserva su tira de notas (ver dibujarCajas y
  // calcularAltoSeccion) — un solo lugar de verdad.
  const hayContenido = (arr) => Array.isArray(arr) && arr.some(x => (x || '').trim());

  // v1.55: (a pedido, FIX de diseño) la nota corta por compás salía de
  // adentro de cada casilla (v1.32/v1.33) — rompía la altura pareja de
  // toda la fila con solo una nota cargada. Ahora es una tira PROPIA que
  // se repite arriba de CADA fila de POR_FILA(4) cajas — mantiene la
  // grilla de acordes/letra exactamente como estaba antes de v1.32 (alto
  // fijo, cajaAlto) y agrega notaFilaAlto(5mm) por fila SOLO si el
  // array de notas tiene algún contenido (si no, cero alto extra, mismo
  // criterio que antes). hayContenido() es GLOBAL al array completo, no
  // por fila — si el bloque tiene una sola nota en cualquier compás,
  // TODAS las filas reservan su tira (vacía en las filas sin nota), para
  // que la grilla quede prolija y alineada siempre en el mismo lugar.
  const notaFilaAlto = 5;
  // v1.41: (a pedido) 5to parámetro opcional `colInicio` — permite que la
  // 1ra caja arranque en una columna distinta de 0 (usado por la 2da vez
  // de repeticiones, para alinearla debajo del compás real que reemplaza
  // en vez de siempre reiniciar en columna 1). Con colInicio=0 (default,
  // todos los llamados existentes) el comportamiento es IDÉNTICO a antes
  // — no cambia nada para el resto de los usos de dibujarCajas.
  // v1.43: (a pedido) 6to parámetro opcional `labelInicio` — separa
  // "en qué columna se dibuja" de "qué número de compás dice la
  // etiqueta". Hace falta para el modo horizontal: la caja de la 2da
  // vez se dibuja en la columna siguiente a la 1ra vez (colInicio), pero
  // tiene que decir el compás REAL que reemplaza (labelInicio), que
  // puede ser una columna distinta. Si no se pasa, usa colInicio (mismo
  // comportamiento que v1.41/v1.42 para todos los llamados existentes).
  // v1.43: (a pedido) 7mo parámetro opcional `opciones` — para el modo
  // horizontal, la 2da vez tiene que dibujarse en la MISMA fila que ya
  // dibujó la 1ra vez (mismo Y), sin que esta función avance el cursor
  // `y` de nuevo (esa altura ya la reservó/avanzó la 1ra vez). Con
  // opciones={} (default, todos los llamados existentes) el
  // comportamiento es IDÉNTICO a antes: usa el `y` actual y avanza al
  // terminar.
  //   opciones.yBase          → Y fija a usar en vez del `y` actual
  //   opciones.hayNotasForzado → fuerza sí/no reservar tira de nota,
  //                              para que la fila comparta la misma
  //                              altura que la 1ra vez aunque esta 2da
  //                              vez no tenga notas propias
  //   opciones.sinAvanzarY     → no toca asegurarEspacio() ni el `y`
  //                              final (la 1ra vez ya lo hizo)
  //   opciones.compasGlobalInicio → (v1.45) si viene un número, dibuja
  //                              además "#N" (compás real del TEMA
  //                              completo, no de la sección) arriba a la
  //                              derecha de cada caja, espejando al
  //                              "c.N" de arriba-izquierda. N = este
  //                              valor + posLabel (mismo índice que ya
  //                              usa "c.N", así que en 2da vez/D.C. el
  //                              "#N" coincide con el compás real que se
  //                              está reemplazando/repitiendo, no con la
  //                              columna donde se dibuja). Si es
  //                              null/undefined (default), no se dibuja
  //                              nada nuevo — cero cambios visuales para
  //                              los llamados que no lo pasen (Vamp, por
  //                              ejemplo, sigue sin usarlo: ver el
  //                              comentario en el llamado de la sección
  //                              principal sobre por qué).
  // v1.71: mismo orden que htmlOpcionesTiempoAcorde (guia-practica.html)
  // para el select de tiempo/anticipación de cada acorde.
  const TIEMPOS_ORDEN = ['1', 'a1', '2', 'a2', '3', 'a3', '4', 'a4'];
  const dibujarCajas = (acordes, letra, total, notas, colInicio, labelInicio, opciones) => {
    opciones = opciones || {};
    colInicio = colInicio || 0;
    labelInicio = labelInicio != null ? labelInicio : colInicio;
    const yBase = opciones.yBase != null ? opciones.yBase : y;
    const hayNotas = opciones.hayNotasForzado != null ? opciones.hayNotasForzado : hayContenido(notas);
    const filas = Math.ceil((total + colInicio) / POR_FILA);
    const altoTotal = filas * (cajaAlto + (hayNotas ? notaFilaAlto : 0));
    if(!opciones.sinAvanzarY) asegurarEspacio(altoTotal + 2);
    for(let j = 0; j < total; j++){
      const posGlobal = j + colInicio;
      const posLabel = j + labelInicio;
      const fila = Math.floor(posGlobal / POR_FILA);
      const col = posGlobal % POR_FILA;
      const x = margen + col * cajaAncho;
      const yFila = yBase + fila * (cajaAlto + (hayNotas ? notaFilaAlto : 0));
      const yCaja = yFila + (hayNotas ? notaFilaAlto : 0);
      if(hayNotas){
        const no = (notas && notas[j]) || '';
        if(no){
          doc.setFont('helvetica', 'italic'); doc.setFontSize(6.5); doc.setTextColor(180, 120, 40);
          const noCorta = no.length > 22 ? no.slice(0, 21) + '…' : no;
          doc.text(noCorta, x + cajaAncho / 2, yFila + notaFilaAlto - 1.3, { align: 'center' });
          doc.setTextColor(20);
        }
      }
      doc.setDrawColor(180); doc.rect(x, yCaja, cajaAncho, cajaAlto);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(140);
      // v1.42: (a pedido) usa posLabel en vez de j — con colInicio>0
      // (2da vez alineada o al lado), la etiqueta ahora muestra el
      // número de compás REAL que reemplaza (ej. "c.2"), sea cual sea
      // la columna donde se dibuja la caja (posGlobal). Con
      // labelInicio===colInicio (default) posLabel===posGlobal, sin
      // cambios para el resto de los usos.
      doc.text('c.' + (posLabel + 1), x + 1.5, yCaja + 4);
      doc.setTextColor(20);
      // v1.45: (a pedido) contador global de compás — "#N" arriba a la
      // derecha, mismo criterio de posLabel que "c.N" (así en 2da
      // vez/D.C. muestra el compás real que se reemplaza/repite, no la
      // columna de dibujo). Más chico y discreto que "c.N" (6pt vs 7pt)
      // a propósito: es la referencia secundaria, el acorde sigue siendo
      // lo dominante al centro.
      if(opciones.compasGlobalInicio != null){
        doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(170);
        doc.text('#' + (opciones.compasGlobalInicio + posLabel), x + cajaAncho - 1.5, yCaja + 4, { align: 'right' });
        doc.setTextColor(20);
      }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
      const acorde = (acordes && acordes[j]) || '';
      doc.text(acorde, x + cajaAncho / 2, yCaja + 8, { align: 'center' });
      // v1.71/v1.72: (a pedido) mini-regla de tiempo/anticipación del
      // acorde — 8 marcas (1,a1,2,a2,3,a3,4,a4: resolución de corchea
      // completa, 'aN' = corchea débil que sigue al tiempo N; el caso
      // "entra antes del 1 del compás" en sentido estricto es siempre a4
      // del compás anterior) pegadas al borde inferior de la celda, con
      // un punto relleno en la posición cargada. Lee opciones.acordesTiempo
      // (mismo patrón que `notas`, array paralelo) — si no viene el
      // array, o el valor de esta celda está vacío ('' = "no marcar
      // nada", el caso común: acorde justo en el tiempo, sin síncopa),
      // no se dibuja nada, cero cambio visual.
      // v1.72: FIX — la letra (yCaja+13) y el punto de la regla (antes en
      // yCaja+12.2) se pisaban visualmente (ver captura de referencia).
      // Ahora, SOLO en las celdas donde efectivamente hay un valor de
      // tiempo cargado (hayRegla), la letra sube 1mm (yCaja+12 en vez de
      // +13) y se achica 1pt (6pt en vez de 7pt); sin valor de tiempo, la
      // letra queda exactamente igual que siempre. La regla en sí también
      // baja 1mm (yCaja+cajaAlto-1 en vez de -2) para dejarle más aire.
      const tValCelda = (opciones.acordesTiempo && opciones.acordesTiempo[j]) || '';
      const hayRegla = TIEMPOS_ORDEN.indexOf(tValCelda) !== -1;
      const le = (letra && letra[j]) || '';
      if(le){
        doc.setFont('helvetica', 'italic'); doc.setFontSize(hayRegla ? 6 : 7);
        const leCorta = le.length > 22 ? le.slice(0, 21) + '…' : le;
        doc.text(leCorta, x + cajaAncho / 2, yCaja + (hayRegla ? 12 : 13), { align: 'center' });
        doc.setTextColor(20);
      }
      if(hayRegla){
        const idxTiempo = TIEMPOS_ORDEN.indexOf(tValCelda);
        const reglaAncho = cajaAncho * 0.7;
        const reglaX0 = x + (cajaAncho - reglaAncho) / 2;
        const pasoTiempo = reglaAncho / (TIEMPOS_ORDEN.length - 1);
        const reglaY = yCaja + cajaAlto - 1;
        doc.setDrawColor(160);
        TIEMPOS_ORDEN.forEach((t, ti) => {
          const tx = reglaX0 + ti * pasoTiempo;
          const esFuerte = ti % 2 === 0; // tiempos 1-2-3-4 vs. corcheas débiles
          doc.setLineWidth(esFuerte ? 0.35 : 0.2);
          doc.line(tx, reglaY, tx, reglaY - (esFuerte ? 1.4 : 0.8));
        });
        doc.setLineWidth(0.2);
        doc.setFillColor(20, 20, 20);
        doc.circle(reglaX0 + idxTiempo * pasoTiempo, reglaY - 1.8, 0.6, 'F');
        doc.setDrawColor(180);
      }
    }
    if(!opciones.sinAvanzarY) y += altoTotal + 4;
  };

  // v1.29: barra de repetición real (║: ... :║) en vez del texto italic
  // "se repite xN" — se dibuja como dos trazos gruesos pegados al borde
  // izq/der del bloque de cajas que ya armó dibujarCajas(). No cambia el
  // cálculo de compases, solo el dibujo encima de lo que ya se pintó.
  // yBloqueInicio/alto vienen de afuera porque el bloque ya se dibujó
  // (dibujarCajas ya movió `y`).
  const dibujarBarraRepeticion = (yBloqueInicio, alto, anchoBloque) => {
    // v1.29.3: FIX — usaba `anchoUtil` (ancho de fila completa, 4
    // columnas) para la barra derecha, así que en secciones con menos de
    // 4 compases (ej. "Coda/Final" con 2) la barra quedaba lejos, flotando
    // fuera de las cajas reales. Ahora recibe `anchoBloque` (el ancho real
    // ocupado por las cajas de esa fila) y lo usa en vez de `anchoUtil`.
    const ancho = anchoBloque != null ? anchoBloque : anchoUtil;
    const grosor = 1.2;
    doc.setFillColor(20, 20, 20);
    // v1.66: (a pedido, confirmado pixel a pixel contra la imagen de
    // referencia) FIX — v1.65 invirtió el orden sin necesidad; v1.64 lo
    // tenía bien. Orden correcto, de afuera hacia adentro: GRUESO-FINO-
    // PUNTOS al abrir (izquierda), y su espejo PUNTOS-FINO-GRUESO al
    // cerrar (derecha). Se mantiene el aire de 0.8mm entre elementos.
    doc.rect(margen - 4.4, yBloqueInicio, grosor, alto, 'F');
    doc.rect(margen - 2.4, yBloqueInicio, 0.4, alto, 'F');
    doc.rect(margen + ancho + 3.2, yBloqueInicio, grosor, alto, 'F');
    doc.rect(margen + ancho + 2.0, yBloqueInicio, 0.4, alto, 'F');
    const yc = yBloqueInicio + alto / 2;
    doc.circle(margen - 0.85, yc - 1.2, 0.35, 'F');
    doc.circle(margen - 0.85, yc + 1.2, 0.35, 'F');
    doc.circle(margen + ancho + 0.85, yc - 1.2, 0.35, 'F');
    doc.circle(margen + ancho + 0.85, yc + 1.2, 0.35, 'F');
  };
  // v1.29: corchete "1." / "2." de casilla, en vez del texto "2ª vez:"
  // suelto — se dibuja pegado a la esquina sup. izq. del bloque.
  // v1.41: (a pedido) 2 parámetros opcionales `xInicio`/`ancho` — antes
  // siempre arrancaba en `margen` y cubría `anchoUtil` (todo el ancho de
  // fila). Ahora puede dibujarse angosto, alineado a las columnas
  // específicas que reemplaza la 2da vez (o "1ra vez" arriba). Con los
  // valores default (margen/anchoUtil) el resultado es IDÉNTICO a antes.
  const dibujarCorcheteCasilla = (yBloqueInicio, numero, xInicio, ancho) => {
    xInicio = xInicio != null ? xInicio : margen;
    ancho = ancho != null ? ancho : anchoUtil;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(20);
    // v1.39: (a pedido) invertido el orden — antes el NÚMERO quedaba
    // pegado a la caja (-0.5) y la LÍNEA lejos (-3), al revés de lo
    // esperado (la línea, que es lo visualmente dominante, es lo que
    // hace ver a qué grilla "pertenece" el bloque). Ahora la línea queda
    // pegada a la caja de abajo y el número flota arriba de la línea,
    // con el mismo colchón de 2.5mm entre ambos que venía funcionando
    // sin tocarse.
    // v1.40: (a pedido) menos aire entre número y línea — de 2.5mm a
    // 1.8mm (-4 → -3.3), para que se lea como una sola unidad en vez de
    // verse el número "suelto" flotando por encima. Sigue sin tocarse
    // (el número bold 8pt mide ~2mm de alto real) y sigue sobrando
    // margen contra el texto "x2 (...)" de arriba (~4mm).
    doc.text(numero + '.', xInicio + 1.5, yBloqueInicio - 3.3);
    doc.setDrawColor(20); doc.setLineWidth(0.3);
    doc.line(xInicio, yBloqueInicio, xInicio, yBloqueInicio - 1.5);
    doc.line(xInicio, yBloqueInicio - 1.5, xInicio + ancho, yBloqueInicio - 1.5);
  };
  // v1.60: (a pedido) helper compartido para el resumen "c.#X-c.#Y" que
  // ya existía SOLO en fija-bloque con 1ra/2da vez (v1.58, texto inline
  // ahí, no como función). Se extrae acá para poder reusarlo tal cual en
  // Vamp, Break/Corte y fija-bloque simple (sin 1ra/2da vez) sin duplicar
  // el mismo texto/estilo 3 veces. Si fin es null o igual a inicio,
  // muestra un solo compás ("c.#5") en vez de rango. No dibuja nada si
  // inicio es null (contador global apagado).
  const dibujarResumenCompases = (inicio, fin, xDerecha, yLinea) => {
    if(inicio == null) return;
    doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(120);
    doc.text('c.#' + inicio + ((fin != null && fin !== inicio) ? '-c.#' + fin : ''), xDerecha, yLinea, { align: 'right' });
    doc.setTextColor(20);
  };
  // v1.29.2: íconos dibujados a mano en vez de emoji — jsPDF con fuente
  // helvetica estándar no soporta unicode alto (🔁/⊕ salían como
  // caracteres rotos, ej. "Ø=Ý"). Cada ícono devuelve el ancho que ocupó,
  // para poder ubicar el texto que sigue justo al lado.
  const dibujarIconoRepeticion = (x, yBase) => {
    // mini versión de la misma barra ║: — dos trazos + puntito, ~4mm
    // v1.66: (a pedido, confirmado contra imagen de referencia) FIX — el
    // orden original (v1.29.2) YA estaba bien: grueso-fino-puntos de
    // afuera hacia adentro. v1.65 lo había invertido sin necesidad; se
    // revierte a como estaba.
    doc.setFillColor(120, 120, 120);
    doc.rect(x, yBase - 3, 0.8, 3.2, 'F');
    doc.rect(x + 1.4, yBase - 3, 0.3, 3.2, 'F');
    doc.circle(x + 2.6, yBase - 2.2, 0.35, 'F');
    doc.circle(x + 2.6, yBase - 0.8, 0.35, 'F');
    return 4.2;
  };
  const dibujarIconoCoda = (x, yBase, colorRGB) => {
    // círculo con cruz, símbolo estándar de coda, ~3.5mm. colorRGB para
    // poder pintarlo blanco cuando va sobre la barra de color del header
    // (donde el texto también es blanco) o gris cuando va sobre fondo
    // blanco de página.
    const [r,g,b] = colorRGB || [120,120,120];
    doc.setDrawColor(r, g, b); doc.setLineWidth(0.3);
    doc.circle(x + 1.6, yBase - 1.6, 1.6, 'S');
    doc.line(x + 1.6, yBase - 3.4, x + 1.6, yBase + 0.2);
    doc.line(x - 0.2, yBase - 1.6, x + 3.4, yBase - 1.6);
    return 4.4;
  };

  // v1.29.11: ícono de acento (>) dibujado a mano, mismo criterio que
  // dibujarIconoRepeticion/dibujarIconoCoda (nada de emoji, jsPDF+helvetica
  // no soporta unicode alto). Se define ANTES de dibujarPatronRitmico
  // porque ese la reutiliza para marcar golpes acentuados.
  const dibujarIconoAcentoBreak = (x, yBase) => {
    doc.setDrawColor(20, 20, 20); doc.setLineWidth(0.5);
    doc.line(x, yBase - 2.2, x + 1.7, yBase - 1.1);
    doc.line(x + 1.7, yBase - 1.1, x, yBase - 0.0);
    return 2.6;
  };

  // v1.3: (a pedido) vocabulario completo del patrón rítmico — sigue
  // siendo notación acotada (solo corcheas, sin figuras variadas ni
  // alturas), pero ahora con 4 símbolos en vez de 2:
  //   x = golpe normal
  //   X = golpe ACENTUADO (dibuja el mismo ">" de dibujarIconoAcentoBreak
  //       arriba de la plica, reutilizado tal cual — no es un ícono nuevo)
  //   . = SILENCIO (ahora con marca propia — antes, en v1.0-v1.2, un "."
  //       era solo un hueco vacío sin dibujo; ahora se ve un trazo
  //       simplificado, no es el símbolo estándar de silencio de corchea
  //       de una edición impresa, es una marca a mano coherente con el
  //       resto de íconos del PDF)
  //   - = LIGADO — sostiene el golpe/silencio de la posición anterior, no
  //       ataca de nuevo: se dibuja un arco chico entre esa posición y
  //       esta. Varios "-" seguidos encadenan sus arcos y se leen como
  //       una sola ligadura larga.
  // El agrupado de a 2 (corchete) sigue exactamente igual que v1.2: dos
  // GOLPES (x o X) consecutivos en el mismo par se unen con corchete; un
  // golpe solo (por tener un "." o "-" al lado) lleva gancho individual.
  // Silencios y ligados no tienen cabeza ni plica propia — no "ocupan"
  // lugar en el agrupado de golpes, se dibujan aparte en una pasada previa.
  // v1.7: (a pedido) líneas de compás — barra de apertura, cierre y una
  // divisoria entre cada compás si la sección dura 2+ compases (mismo
  // criterio visual que separa los acordes en dibujarCajaBreak). Nuevo
  // parámetro `compases` (duración de la sección en compases, default 1
  // si no se pasa, para no romper otros llamados existentes). No cambia
  // el agrupado de a 2 ni el dibujo de golpes/silencios/ligados.
  // v1.3: (a pedido) tresillos/sextillos — misma sintaxis "{...}" dentro
  // del patrón libre que patronRitmicoSVG en guia-practica.html: {xxx}
  // tresillo, {xxxxxx} sextillo, ambos ocupan el mismo espacio de 2
  // corcheas normales sin importar cuántas notas tengan adentro. Parser
  // y aplanado de columnas duplicados a mano acá (mismo criterio de
  // duplicación deliberada de siempre entre jsPDF y SVG de pantalla) para
  // que PDF y preview se vean igual. Un grupo mal formado (sin "}" de
  // cierre, o con tamaño distinto de 3/6) se dibuja como notas sueltas
  // sin bracket — no se dibuja un agrupado que no es válido.
  const parsearPatronRitmico = (patron) => {
    const str = (patron || '').replace(/\s+/g, '');
    const items = [];
    let i = 0;
    while(i < str.length){
      const c = str[i];
      if(c === '{'){
        const fin = str.indexOf('}', i + 1);
        const cerrado = fin !== -1;
        const inner = cerrado ? str.slice(i + 1, fin) : str.slice(i + 1);
        const valores = inner.split('').filter(ch => ch === 'x' || ch === 'X' || ch === '.' || ch === '-');
        const n = valores.length;
        const numero = (n === 3) ? 3 : (n === 6 ? 6 : null);
        items.push({ tipo: 'grupo', valores, numero, valido: cerrado && numero !== null });
        i = cerrado ? fin + 1 : str.length;
      } else if(c === 'x' || c === 'X' || c === '.' || c === '-'){
        items.push({ tipo: 'simple', valor: c });
        i++;
      } else {
        i++;
      }
    }
    return items;
  };
  const aplanarColumnasPatron = (items) => {
    const cols = [];
    items.forEach(it => {
      if(it.tipo === 'simple'){
        cols.push({ caracter: it.valor, peso: 1, grupo: null });
      } else {
        const pesoCada = it.valido ? (2 / it.valores.length) : 1;
        it.valores.forEach((v, idx) => {
          cols.push({ caracter: v, peso: pesoCada, grupo: it.valido ? { numero: it.numero, idx, size: it.valores.length } : null });
        });
      }
    });
    return cols;
  };
  const pesoTotalPatron = (items) => {
    let total = 0;
    items.forEach(it => { total += (it.tipo === 'simple') ? 1 : (it.valido ? 2 : it.valores.length); });
    return total;
  };
  // v1.67: (a pedido) helper compartido — mismo cálculo de columnas/xInfo
  // que antes vivía inline dentro de dibujarPatronRitmico, extraído tal
  // cual (cero cambios de lógica) para que dibujarAcordesPorGolpe (nuevo,
  // ver más abajo) pueda ubicar cada acorde exactamente arriba de su nota,
  // usando el mismo xStart/ancho que la tira rítmica real.
  const calcularColsYXInfo = (patron, xStart, ancho) => {
    const items = parsearPatronRitmico(patron);
    if(!items.length) return { cols: [], xInfo: [] };
    const cols = aplanarColumnasPatron(items);
    const pesoTotal = pesoTotalPatron(items);
    let acumPeso = 0;
    const xInfo = cols.map(col => {
      const x0 = xStart + (acumPeso / pesoTotal) * ancho;
      const w = (col.peso / pesoTotal) * ancho;
      acumPeso += col.peso;
      return { xCentro: x0 + w / 2, x0, x1: x0 + w };
    });
    return { cols, xInfo };
  };
  const dibujarPatronRitmico = (patron, xStart, ancho, yBase, compases) => {
    const { cols, xInfo } = calcularColsYXInfo(patron, xStart, ancho);
    if(!cols.length) return 0;
    const n = cols.length;
    const altoPlica = 6;
    // v1.30: FIX — mismo fix que patronRitmicoSVG v1.52: "-" ahora
    // también cuenta como nota (esNota) para que se le dibuje su propia
    // cabeza+plica, como corresponde a una ligadura real (2 notas
    // completas unidas por la curva, no una nota fantasma).
    const esNota = (t) => t === 'x' || t === 'X' || t === '-';
    // v1.30: esBeamable es más estricto que esNota — se usa solo para
    // decidir qué se agrupa con un corchete/barra. La ligadura "-" cuenta
    // como nota para dibujarse, pero NUNCA debe agruparse en un corchete
    // con la nota anterior o siguiente (ya tiene su propia curva de
    // ligado, sería redundante/confuso agregarle además una barra).
    const esBeamable = (t) => t === 'x' || t === 'X';
    doc.setDrawColor(20); doc.setLineWidth(0.25);
    doc.line(xStart, yBase, xStart + ancho, yBase); // línea base (una sola, sin alturas)

    // v1.7: barras de compás — apertura, cierre y divisorias intermedias
    // si son 2+ compases. Mismo alto que la plica (de yBase-altoPlica a
    // yBase), independiente del agrupado de golpes.
    const totalCompases = Math.max(1, compases || 1);
    doc.setDrawColor(20); doc.setLineWidth(0.3);
    doc.line(xStart, yBase - altoPlica, xStart, yBase);
    doc.line(xStart + ancho, yBase - altoPlica, xStart + ancho, yBase);
    if(totalCompases >= 2){
      for(let c = 1; c < totalCompases; c++){
        const xDiv = xStart + (ancho / totalCompases) * c;
        doc.line(xDiv, yBase - altoPlica, xDiv, yBase);
      }
    }
    doc.setFillColor(20, 20, 20);

    // silencio: marca simplificada (dos trazos, no el símbolo estándar de
    // edición impresa) — v1.18: ahora colgando DEBAJO de la línea base,
    // en gris tenue, para no confundirse con el acento (que va arriba de
    // la plica, en negro). Antes iba arriba cerca de la plica y a este
    // tamaño era casi indistinguible del chevrón de acento.
    const dibujarSilencio = (x) => {
      doc.setDrawColor(150, 150, 150); doc.setLineWidth(0.45);
      const yc = yBase + 2;
      doc.line(x - 1.1, yc - 1.6, x + 0.9, yc + 0.5);
      doc.line(x + 0.9, yc + 0.5, x - 0.3, yc + 1.8);
      doc.setDrawColor(20);
    };
    // ligado: arco chico entre la posición anterior y esta.
    // v1.29: (a pedido) FIX — la ligadura estaba dibujada con 2 líneas
    // rectas formando un ángulo (∧), distinta a la curva suave del
    // preview (patronRitmicoSVG). Se reemplaza por una curva bezier
    // (aproximación cúbica de la misma quadratic que usa el SVG: mismos
    // puntos de control convertidos con la fórmula estándar C1=P0+2/3
    // (Q-P0), C2=P1+2/3(Q-P1)) para que preview y PDF se vean IGUAL.
    // Profundidad 1.7mm, misma proporción que el preview (4.5 con
    // altoPlica=16 → ratio 0.28; acá altoPlica=6 → 6*0.28≈1.7).
    const dibujarLigado = (xDesde, xHasta) => {
      doc.setDrawColor(20); doc.setLineWidth(0.35);
      const yTie = yBase + 2;
      const profundidad = 1.7;
      const dx = xHasta - xDesde;
      doc.lines(
        [[dx / 3, (2 / 3) * profundidad, (dx * 2) / 3, (2 / 3) * profundidad, dx, 0]],
        xDesde, yTie, [1, 1], 'S', false
      );
    };

    // pasada 1: silencios y ligados (independiente del agrupado de golpes)
    for(let j = 0; j < n; j++){
      const col = cols[j];
      if(col.caracter === '.') dibujarSilencio(xInfo[j].xCentro);
      else if(col.caracter === '-' && j > 0) dibujarLigado(xInfo[j - 1].xCentro, xInfo[j].xCentro);
    }

    // pasada 2: golpes (x/X) — cabeza, plica, acento si corresponde
    // v1.26: (a pedido) vuelve la cabeza — dentro de un grupo
    // (tresillo/sextillo) se dibuja más chica (r=0.55mm en vez de 0.9mm)
    // para que no se toquen entre sí; fuera de grupos, cabeza normal.
    for(let j = 0; j < n; j++){
      const col = cols[j];
      if(!esNota(col.caracter)) continue;
      const xj = xInfo[j].xCentro;
      const r = col.grupo ? 0.55 : 0.9;
      const xPlica = xj + r;
      doc.circle(xj, yBase, r, 'F');
      doc.setLineWidth(0.28);
      doc.line(xPlica, yBase, xPlica, yBase - altoPlica);
      // v1.29: (a pedido) FIX — el acento se veía "muy grande" en el PDF.
      // Estaba reusando dibujarIconoAcentoBreak() con sus medidas fijas
      // (2.2 x 1.7mm, grosor 0.5mm), pensadas para un ícono a tamaño de
      // lectura normal en otra parte del documento — acá, sobre una
      // plica de solo 6mm de alto (altoPlica), esas medidas resultaban
      // desproporcionadas (el acento ocupaba más de un tercio del alto
      // de la plica). Se dibuja un acento propio, escalado a la misma
      // proporción que usa patronRitmicoSVG en el preview (alto ≈13.75%
      // de altoPlica, ancho ≈77% del alto, grosor ≈5.6% de altoPlica) —
      // no se toca dibujarIconoAcentoBreak por si se usa en otro lado a
      // su tamaño original.
      if(col.caracter === 'X'){
        const ax = xPlica - 0.32, ay = yBase - altoPlica - 1.4;
        doc.setDrawColor(20, 20, 20); doc.setLineWidth(0.34);
        doc.line(ax, ay - 0.83, ax + 0.64, ay - 0.42);
        doc.line(ax + 0.64, ay - 0.42, ax, ay - 0.0);
      }
    }

    // pasada 3: beams — grupos válidos llevan un solo corchete abarcando
    // todo el grupo + número (3/6) centrado arriba; fuera de grupo sigue
    // el agrupado de a 2 de siempre (corchete de par / gancho suelto).
    let j = 0;
    while(j < n){
      const col = cols[j];
      if(col.grupo){
        const size = col.grupo.size;
        let jFin = j;
        while(jFin < n && cols[jFin].grupo && cols[jFin].grupo.idx < size) jFin++;
        // v1.50: (a pedido) FIX — el corchete vuelve a ir de PLICA a
        // PLICA (borde derecho de la cabeza de la primera nota real del
        // grupo, hasta el mismo punto de la última), no del borde del
        // casillero — en v1.23 se había extendido al ancho completo del
        // grupo, pero visualmente se salía por los costados de la plica.
        // Mismo criterio que patronRitmicoSVG v1.50. Si el grupo tiene un
        // solo golpe real, se dibuja la bandera curva en vez de corchete
        // (no hay 2 plicas que unir); si no tiene ninguno, no se dibuja
        // nada.
        const idxGolpes = [];
        for(let k = j; k < jFin; k++) if(esBeamable(cols[k].caracter)) idxGolpes.push(k);
        if(idxGolpes.length >= 2){
          const rIni = cols[idxGolpes[0]].grupo ? 0.55 : 0.9;
          const rFin = cols[idxGolpes[idxGolpes.length - 1]].grupo ? 0.55 : 0.9;
          const xIni = xInfo[idxGolpes[0]].xCentro + rIni;
          const xFin = xInfo[idxGolpes[idxGolpes.length - 1]].xCentro + rFin;
          doc.setLineWidth(0.75);
          doc.line(xIni, yBase - altoPlica, xFin, yBase - altoPlica);
          // v1.27: (a pedido) doble barra cuando el grupo es de 6
          // (sextillo = semicorchea), simple para 3 (tresillo/corchea).
          if(size === 6){
            doc.line(xIni, yBase - altoPlica + 1.3, xFin, yBase - altoPlica + 1.3);
          }
          const xMedio = (xIni + xFin) / 2;
          doc.setFontSize(5);
          doc.setTextColor(20);
          doc.text(String(col.grupo.numero), xMedio, yBase - altoPlica - 2.3, { align: 'center' });
        } else if(idxGolpes.length === 1){
          const r = cols[idxGolpes[0]].grupo ? 0.55 : 0.9;
          const xa = xInfo[idxGolpes[0]].xCentro + r;
          const yTop = yBase - altoPlica;
          doc.setFillColor(20, 20, 20);
          doc.lines(
            [
              [1.6, 0.3, 1.75, 1.35, 0.4, 2.45],
              [0.7, -1.15, 0.45, -1.85, -0.4, -2.45]
            ],
            xa, yTop, [1, 1], 'F', true
          );
          doc.setFontSize(5);
          doc.setTextColor(20);
          doc.text(String(col.grupo.numero), xa, yBase - altoPlica - 2.3, { align: 'center' });
        }
        j = jFin;
      } else if(col.caracter === '-'){
        // v1.30: FIX — mismo fix que patronRitmicoSVG v1.52: la nota
        // ligada siempre dibuja su propia bandera suelta, nunca se
        // empareja con la anterior/siguiente en un corchete de a 2 (ya
        // tiene su curva de ligado propia).
        const xa = xInfo[j].xCentro + 0.9;
        const yTop = yBase - altoPlica;
        doc.setFillColor(20, 20, 20);
        doc.lines(
          [
            [1.6, 0.3, 1.75, 1.35, 0.4, 2.45],
            [0.7, -1.15, 0.45, -1.85, -0.4, -2.45]
          ],
          xa, yTop, [1, 1], 'F', true
        );
        j += 1;
      } else if(esBeamable(col.caracter)){
        const nextCol = (j + 1 < n && !cols[j + 1].grupo) ? cols[j + 1] : null;
        const xa = xInfo[j].xCentro + 0.9;
        if(nextCol && esBeamable(nextCol.caracter)){
          const xb = xInfo[j + 1].xCentro + 0.9;
          doc.setLineWidth(0.75);
          doc.line(xa, yBase - altoPlica, xb, yBase - altoPlica);
          j += 2;
        } else {
          // v1.27: (a pedido) bandera curva (bezier) en vez de la línea
          // recta diagonal, acercándose a la notación real de corchea
          // suelta. Mismo criterio/forma que patronRitmicoSVG v1.49,
          // adaptado a la API de curvas de jsPDF (doc.lines con
          // segmentos de 6 valores = bezier, deltas relativos al punto
          // anterior). Probado aislado en Node+jsPDF antes de aplicar.
          const yTop = yBase - altoPlica;
          doc.setFillColor(20, 20, 20);
          doc.lines(
            [
              [1.6, 0.3, 1.75, 1.35, 0.4, 2.45],
              [0.7, -1.15, 0.45, -1.85, -0.4, -2.45]
            ],
            xa, yTop, [1, 1], 'F', true
          );
          j += 1;
        }
      } else {
        j += 1;
      }
    }
    doc.setTextColor(20);
    // v1.18: se sube de +4 a +7 el margen reservado — el silencio ahora
    // cuelga debajo de la línea base (antes iba arriba, ya cubierto por
    // altoPlica) y necesita su propio espacio para no pisar el contenido
    // que dibuja el llamador justo debajo.
    return altoPlica + 7;
  };
  // v1.29.11: caja especial para Break/Corte — en vez de dibujarCajas() con
  // grilla de 4 columnas chicas, una única caja ancha y baja con el/los
  // acorde(s) grandes y centrados (si son 2+ compases, se reparten en
  // partes iguales dentro de la MISMA caja, separadas por una línea fina
  // — no cajas sueltas de 4-por-fila). Sin números de compás (c.1, c.2):
  // no aportan nada en un golpe de 1-2 compases y ensucian la lectura
  // rápida. Debajo: "BREAK" + nota de tiempo si el staff cargó una
  // (notaTiempoCorte). No toca dibujarCajas ni ningún cálculo de
  // compases — es puramente un dibujo alternativo.
  // v1.2: si el staff cargó patronRitmico, se dibuja debajo de "BREAK" con
  // dibujarPatronRitmico (plicas/corcheas agrupadas).
  // v1.4: FIX — la caja se dibujaba SIEMPRE con anchoUtil (ancho total de
  // la página) sin importar cuántos compases dura el Break/Corte, lo que
  // la hacía ver desproporcionada al lado de secciones como Coro (que sí
  // reparten en cajas de tamaño fijo cajaAncho). Ahora usa el mismo
  // criterio de ancho que el resto: cajaAncho por compás, hasta un máximo
  // de POR_FILA compases (igual límite que dibujarCajas), y solo llega a
  // anchoUtil si realmente tiene 4+ compases. No cambia ningún cálculo de
  // compases ni de duración, solo el ancho del dibujo.
  // v1.5: (a pedido) 2 ajustes más:
  // 1) Si ninguno de los compases tiene acorde cargado, la caja no se
  //    dibuja (era un rectángulo vacío sin aportar nada) — se va directo
  //    a "BREAK" + patrón. Si algún compás sí tiene acorde, la caja se
  //    dibuja igual que antes.
  // 2) Se saca el ícono de acento ">" fijo al lado de la palabra "BREAK":
  //    el criterio ahora es escribir el ritmo real con el patrón (donde
  //    "X" mayúscula sigue marcando acento con ese mismo ícono, eso no
  //    cambia), en vez de un ícono genérico y fijo junto al texto.
  // v1.67: (a pedido) fila de acordes "por golpe" — cuando la sección trae
  // el campo acordesPorGolpe (cargado en guia-practica.html), cada acorde
  // se dibuja arriba de su nota exacta del patrón rítmico, en vez del
  // texto único centrado de siempre. Reusa calcularColsYXInfo (mismo
  // xStart/ancho que dibujarPatronRitmico) para que la columna de cada
  // acorde coincida 1 a 1 con la columna de su nota. acordesPorGolpe está
  // alineado solo contra las columnas que son nota real (x/X/-) — los
  // silencios ('.') no cuentan, mismo criterio que usa el editor
  // (htmlAcordesPorGolpeInputs en guia-practica.html).
  // Tamaño de letra auto-ajustable: arranca en el tamaño más grande
  // (15pt, igual al del texto libre de siempre) y baja de escalón
  // (12→10→8pt) solo si el acorde no entra en el espacio libre hasta la
  // nota-con-acorde más cercana (anterior/siguiente) sin pisarla. Piso en
  // 8pt (por debajo ya no se lee bien en atril).
  // v1.69: (a pedido) notasPorGolpe — anotación corta puntual por golpe
  // (ej. "MAS SUAVE"), campo hermano de acordesPorGolpe cargado en
  // guia-practica.html. A diferencia del acorde (que casi siempre tiene
  // contenido en cada golpe), la nota es puntual — la mayoría de los
  // golpes no la usan. Por eso NO se reserva una franja fija propia: se
  // dibuja chica (6pt itálica) solo donde hay texto, pegada arriba del
  // acorde de ESE golpe (si el acorde ocupa letra grande, la nota sube
  // más para no pisarlo — altoAcordeAprox estima el alto real dibujado).
  // Sin nota en ese golpe, no se dibuja ni se reserva nada ahí.
  const escalaFuenteGolpe = [15, 12, 10, 8];
  const dibujarAcordesPorGolpe = (acordesPorGolpe, notasPorGolpe, patron, xStart, ancho, yBase) => {
    const { cols, xInfo } = calcularColsYXInfo(patron, xStart, ancho);
    if(!cols.length) return;
    const esNota = (t) => t === 'x' || t === 'X' || t === '-';
    const notaIdx = [];
    cols.forEach((c, j) => { if(esNota(c.caracter)) notaIdx.push(j); });
    doc.setTextColor(20);
    notaIdx.forEach((j, k) => {
      const texto = ((acordesPorGolpe && acordesPorGolpe[k]) || '').trim();
      const xCentro = xInfo[j].xCentro;
      let size = 0;
      if(texto){
        // espacio disponible: distancia a la nota-con-acorde vecina más
        // cercana (o al borde de la caja si es la primera/última) — el
        // *2*0.85 da el ancho total del "hueco" propio de este acorde,
        // dejando un 15% de aire para que no se toquen entre sí.
        const xPrev = k > 0 ? xInfo[notaIdx[k - 1]].xCentro : xStart;
        const xNext = k < notaIdx.length - 1 ? xInfo[notaIdx[k + 1]].xCentro : xStart + ancho;
        const slot = Math.min(xCentro - xPrev, xNext - xCentro) * 2 * 0.85;
        doc.setFont('helvetica', 'bold');
        size = escalaFuenteGolpe[escalaFuenteGolpe.length - 1];
        for(const candidato of escalaFuenteGolpe){
          doc.setFontSize(candidato);
          if(doc.getTextWidth(texto) <= slot){ size = candidato; break; }
        }
        doc.setFontSize(size);
        doc.text(texto, xCentro, yBase, { align: 'center' });
      }
      const notaTxt = ((notasPorGolpe && notasPorGolpe[k]) || '').trim();
      if(notaTxt){
        // altoAcordeAprox: conversión aproximada pt→mm del alto de letra
        // mayúscula bold Helvetica (≈0.36 del tamaño en pt) — sirve para
        // saber cuánto subió el acorde y no pisarlo con la nota de arriba.
        const altoAcordeAprox = size ? size * 0.36 : 0;
        doc.setFont('helvetica', 'italic'); doc.setFontSize(6); doc.setTextColor(120);
        doc.text(notaTxt, xCentro, yBase - altoAcordeAprox - 2.2, { align: 'center' });
        doc.setTextColor(20);
      }
    });
    doc.setTextColor(20);
  };
  const dibujarCajaBreak = (acordes, total, nota, patron, compasGlobalInicio, acordesPorGolpe, notasPorGolpe) => {
    const altoCaja = 15;
    // v1.67: acordesPorGolpe (si tiene contenido y hay patrón cargado)
    // reemplaza por completo el texto libre de la caja — el acorde pasa a
    // dibujarse arriba de su nota, no centrado en un recuadro. Si no hay
    // acordesPorGolpe (Break/Corte viejo, o sección sin patrón), sigue
    // exactamente como antes.
    const hayAcordesPorGolpe = Array.isArray(acordesPorGolpe) && acordesPorGolpe.some(a => (a || '').trim()) && (patron || '').trim();
    const hayAcordes = !hayAcordesPorGolpe && Array.isArray(acordes) && acordes.some(a => (a || '').trim());
    if(hayAcordes){
      // v1.52: (a pedido, tras revisar captura real) FIX — antes el ancho
      // de la caja dependía de `total` (compases: min(total,POR_FILA)*
      // cajaAncho), así que con total=1 la caja quedaba angosta (~46mm) y
      // el texto del acorde (que en Break/Corte puede ser una frase libre
      // con varios acordes en un solo campo, ej. "Am Bbdim7b E7 G Am
      // Bbdim7b" dentro de UN compás) se dibujaba centrado a 15pt y
      // desbordaba la caja por los dos lados. El Break/Corte es siempre
      // UN renglón/frase libre de la sección — no una grilla por compás
      // como el resto — así que no tiene sentido que su ancho dependa de
      // `total`. Ahora usa siempre el ancho completo disponible de la
      // página (anchoUtil), sea 1 compás o varios. Con total>=POR_FILA ya
      // usaba anchoUtil de antes (min(...,POR_FILA)*cajaAncho=anchoUtil),
      // así que ese caso no cambia visualmente.
      const anchoCaja = anchoUtil;
      asegurarEspacio(altoCaja + 8 + (patron ? 10 : 0));
      const yCaja = y;
      doc.setDrawColor(20); doc.setLineWidth(0.4);
      doc.rect(margen, yCaja, anchoCaja, altoCaja);
      const anchoParte = anchoCaja / Math.max(1, total);
      doc.setTextColor(20);
      for(let j = 0; j < total; j++){
        if(j > 0){
          doc.setDrawColor(190); doc.setLineWidth(0.2);
          doc.line(margen + anchoParte * j, yCaja + 2, margen + anchoParte * j, yCaja + altoCaja - 2);
        }
        const cx = margen + anchoParte * j + anchoParte / 2;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(15);
        const acorde = (acordes && acordes[j]) || '';
        doc.text(acorde, cx, yCaja + altoCaja / 2 + 2.5, { align: 'center' });
        // v1.57: (a pedido) "#N" también en Break/Corte — antes solo lo
        // dibujaba dibujarCajas() (grilla normal); esta caja tiene su
        // propio dibujo y no lo traía. Mismo estilo/posición que la
        // grilla (esquina sup. derecha de cada parte, 6pt gris, línea
        // ~881), usando compasGlobalInicio+j. No se dibuja si el contador
        // global está apagado, mismo criterio que en todos lados.
        if(compasGlobalInicio != null){
          doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(170);
          doc.text('#' + (compasGlobalInicio + j), margen + anchoParte * j + anchoParte - 1.5, yCaja + 4, { align: 'right' });
          doc.setTextColor(20);
        }
      }
      y += altoCaja + 3;
    } else {
      // v1.67: +9mm extra cuando hay acordesPorGolpe — espacio para la
      // fila de acordes que se dibuja pegada arriba del patrón (ver más
      // abajo). Sin acordesPorGolpe, cero cambios respecto a antes.
      // v1.68: 9→12mm — coincide con la separación de 11mm que ahora usa
      // la fila de acordes (antes 8mm), más 1mm de margen.
      asegurarEspacio(8 + (patron ? 10 : 0) + (hayAcordesPorGolpe ? 12 : 0));
    }
    const notaTxt = (nota || '').trim();
    if(notaTxt){
      doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(120);
      doc.text('(' + notaTxt + ')', margen, y);
      doc.setTextColor(20);
    }
    // v1.70: el resumen "c.#X-c.#Y" se sacó de acá — ahora se dibuja una
    // sola vez en la barra de título de la sección (mismo dato, ver
    // dibujarBloqueSeccion.forEach más abajo, cerca de compasTxt).
    y += 6;
    if((patron || '').trim()){
      y += 4;
      // v1.4: el patrón rítmico ahora se dibuja al ancho de la caja
      // (anchoCaja) cuando hay caja, o del ancho de 1 compás si no la hay,
      // no de la página (anchoUtil), para que quede alineado con el resto
      // del bloque en vez de estirarse de más.
      // v1.52: mismo criterio que arriba — el ancho ya no depende de
      // `total`, usa anchoUtil siempre, para quedar alineado con la caja
      // de acordes (que ahora también usa anchoUtil).
      const anchoPatron = anchoUtil;
      // v1.67: si hay acordesPorGolpe, la fila de acordes va pegada
      // JUSTO arriba de la tira de notas (mismo xStart/ancho, así las
      // columnas coinciden exacto) — se dibuja antes de avanzar "y" al
      // punto donde arranca el patrón.
      if(hayAcordesPorGolpe){
        dibujarAcordesPorGolpe(acordesPorGolpe, notasPorGolpe, patron, margen, anchoPatron, y);
        // v1.68: (a pedido) 8→11mm — con fuente grande (15pt) el acorde
        // subía lo suficiente como para pisar el numerito de grupo
        // (tresillo/sextillo, ver dibujarPatronRitmico), que queda a
        // 10.5mm de la línea base. Con 11mm de separación + el numerito
        // bajado a 3.3mm (antes 4.5mm) queda una franja limpia entre
        // ambos, sin tocarse.
        y += 11;
      }
      dibujarPatronRitmico(patron, margen, anchoPatron, y, total);
      y += 6;
    }
  };

  // v1.24: color compartido — una sección con origenId usa el color de su
  // origen (ya resuelto por quien llama, en s.color) en vez de uno por
  // posición propia, y se le agrega "(D.C.)" al nombre para dejar claro
  // que es la misma idea repetida (da capo). El cuadro de acordes/letra se
  // sigue dibujando COMPLETO en cada aparición (ya tiene su propia copia
  // de datos, no hay nada que "ver arriba").
  const secciones = seccionesEntrada;
  // v1.29: sección ya sonó antes → hace falta para saber si el modo "coda"
  // (compacto) puede remitir a "ya sonó" o si es la primera vez que
  // aparece (en cuyo caso igual imprime completo, no hay a dónde remitir).
  const nombresYaImpresos = new Set();

  // v1.1: (a pedido) reserva el alto TOTAL de la sección (header + bloque
  // de cajas + 2da vez si hay) de una sola vez, antes de empezar a
  // dibujarla — así, si no entra completa en lo que queda de página,
  // salta TODA la sección a la página siguiente en vez de partirla (antes
  // solo se reservaban 10mm para el header, y cada sub-bloque chequeaba
  // espacio por separado con su propio asegurarEspacio adentro de
  // dibujarCajas/dibujarCajaBreak — eso podía dejar el header de color en
  // una página y las cajas en la otra, o la 1ra vez en una página y la 2da
  // vez en la siguiente). Replica exactamente la misma cuenta que hace el
  // dibujo real más abajo (mismos POR_FILA/cajaAlto/altoCaja, mismos +4/+6
  // de margen entre bloques) — si cambia el dibujo real, esta cuenta tiene
  // que actualizarse junto con él. No cambia ningún cálculo de compases ni
  // el contenido de las cajas, solo DÓNDE arranca la página.
  const calcularAltoSeccion = (s, esCoda) => {
    // v1.55: notaSeccion ya no imprime una línea aparte debajo de la
    // barra (ver más abajo, ahora va inline en la misma línea del
    // nombre, dentro de los 9mm de siempre) — no suma alto propio.
    if(esCoda) return 9 + 6; // header + "Ver primera aparición arriba."
    let alto = 9; // barra de color + nombre
    if(s.tipo === 'vamp'){
      const ciclo = s.cicloCompases || (s.acordesCiclo && s.acordesCiclo.length) || 0;
      // v1.55: la nota corta por compás ya no crece la caja — reserva su
      // propia tira (notaFilaAlto) por cada fila de POR_FILA, igual
      // criterio que dibujarCajas (hayContenido global del array).
      const notaAltoCiclo = hayContenido(s.notasCiclo) ? notaFilaAlto : 0;
      alto += ciclo > 0 ? (Math.ceil(ciclo / POR_FILA) * (cajaAlto + notaAltoCiclo) + 4 + 6) : 6;
      return alto;
    }
    const duracion = s.duracion;
    if(s.nombre === 'Intro' && (s.acordesSinTiempo || '').trim()) alto += 6;
    if(duracion != null && duracion > 0){
      const esBreak = s.nombre === 'Break/Corte';
      // v1.5: altoBloque para Break/Corte ahora depende de si hay algún
      // acorde cargado (n primeros compases de s.acordesPorCompas) — si no
      // hay ninguno, la caja no se dibuja (ver dibujarCajaBreak v1.5) y no
      // hay que reservarle sus 15+3mm.
      // v1.55: altoBloque, rama no-Break, reserva notaFilaAlto por CADA
      // fila (no +4mm fijo por caja como en v1.32) — mismo criterio que
      // el dibujo real en dibujarCajas. Break/Corte no usa notas por
      // compás (usa notaTiempoCorte, un campo distinto) — su fórmula
      // fija no cambia.
      const altoBloque = (n, notas) => {
        if(!esBreak){
          const notaAlto = hayContenido(notas) ? notaFilaAlto : 0;
          return Math.ceil(n / POR_FILA) * (cajaAlto + notaAlto) + 4;
        }
        // v1.67: acordesPorGolpe (si tiene contenido y hay patrón) usa
        // 9mm extra en vez de los 15+3 de la caja vieja — mismo criterio
        // que dibujarCajaBreak (ver ahí el detalle).
        const hayAcordesPorGolpe = Array.isArray(s.acordesPorGolpe) && s.acordesPorGolpe.some(a => (a||'').trim()) && (s.patronRitmico||'').trim();
        const hayAcordes = !hayAcordesPorGolpe && Array.isArray(s.acordesPorCompas) && s.acordesPorCompas.slice(0, n).some(a => (a||'').trim());
        // v1.68: 9→12mm, mismo valor que dibujarCajaBreak (ver ahí).
        return (hayAcordes ? 15 + 3 : 0) + (hayAcordesPorGolpe ? 12 : 0) + 6 + ((s.patronRitmico||'').trim() ? 10 : 0);
      };
      const repeticiones = s.repeticiones || 1;
      if(repeticiones > 1){
        const basePase = Math.max(1, Math.round(duracion / repeticiones));
        alto += altoBloque(basePase, s.notasPorCompas);
        const finalN = Math.min(basePase, s.finalDistintoN || 1);
        const hay2da = (s.acordesFinal2 && s.acordesFinal2.some(a => (a||'').trim())) || (s.letraFinal2 && s.letraFinal2.some(l => (l||'').trim()));
        if(hay2da) alto += 3 + altoBloque(finalN, s.notasFinal2);
      } else {
        alto += altoBloque(duracion, s.notasPorCompas);
      }
    } else {
      alto += 6;
    }
    return alto + 2; // el y+=2 final entre secciones
  };

  // v1.45: (a pedido) contador global de compás — cuenta compases reales
  // del TEMA completo (no por sección), con repeticiones incluidas.
  // compasGlobal arranca en 1 y avanza sumando s.duracion de cada
  // sección en orden (duracionCompasesSeccion en guia-practica.html, que
  // sale de hastaSegundos-desdeSegundos — existe para CUALQUIER tipo de
  // sección, Vamp incluido, así que ya viene con las repeticiones/vueltas
  // reales contadas, sin tener que recalcular nada acá). Si en algún
  // punto una sección no tiene fin de tiempo definido (duracion null),
  // el conteo deja de ser confiable de ahí en adelante — se apaga
  // (contadorGlobalValido=false) y las secciones siguientes no muestran
  // "#N" hasta que se complete esa sección y se vuelva a exportar.
  let compasGlobal = 1;
  let contadorGlobalValido = true;

  secciones.forEach((s, i) => {
    if(!(s.nombre || '').trim()) return;
    const esCoda = s.origenId && !s.esVariacion && s.modoRepeticionPDF === 'coda' && nombresYaImpresos.has(s.origenId);
    // v1.45: se captura el arranque de ESTA sección antes de dibujar
    // nada — así todas las cajas de la sección (1ra pasada, 2da vez,
    // horizontal) usan el mismo punto de referencia.
    const compasGlobalInicio = contadorGlobalValido ? compasGlobal : null;
    asegurarEspacio(calcularAltoSeccion(s, esCoda));
    const color = s.color;
    const rgb = [parseInt(color.slice(1,3),16), parseInt(color.slice(3,5),16), parseInt(color.slice(5,7),16)];
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.rect(margen, y, anchoUtil, 7, 'F');
    doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    // v1.26: si es una variación, la etiqueta avisa que el cuadro NO es
    // igual al original (no alcanza con "ya lo vi arriba") — incluye la
    // nota corta si el staff cargó una.
    // v1.29: modo "coda" usa un ícono dibujado (círculo+cruz) + texto
    // "D.S. al Coda"/"D.C." en vez de "(D.C.)" a secas, cuando la sección
    // está marcada como compacta.
    const etiquetaDC = s.origenId
      ? (s.esVariacion
          ? ` (D.C. — variación${(s.notaVariacion || '').trim() ? ': ' + s.notaVariacion.trim() : ''})`
          : (esCoda ? '' : ' (D.C.)'))
      : '';
    // v1.29: letra de ensayo en caja cuadrada a la izq. del nombre, y
    // compás propio (si difiere del general del tema) a la derecha.
    // v1.29.5: hasta 2 caracteres (ej. "A'" para variación), no solo 1 —
    // la caja se ensancha un poco si hace falta.
    const letraEns = (s.letraEnsayo || '').trim().slice(0, 2).toUpperCase();
    let xTexto = margen + 2;
    if(letraEns){
      const anchoCaja = letraEns.length > 1 ? 7 : 5;
      doc.setDrawColor(255); doc.setLineWidth(0.3);
      doc.rect(margen + 2, y + 1, anchoCaja, 5);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      doc.text(letraEns, margen + 2 + anchoCaja / 2, y + 5, { align: 'center' });
      xTexto = margen + 4 + anchoCaja;
      doc.setFontSize(10);
    }
    // v1.53: (a pedido) duración de la sección al lado del título — mismo
    // dato y mismo formato que ya usa guia-practica.html en sus propias
    // etiquetas de estructura ("· N comp.", ver ese archivo ~línea 1565).
    // Antes solo vivía en el editor; en el PDF no había forma de saber de
    // un vistazo cuántos compases dura una sección sin contar las cajas.
    // Usa s.duracion (compases reales, incluye repeticiones si las hay —
    // mismo valor que ya usa el contador global "#N"), no basePase/ciclo.
    // Se agrega DENTRO del texto del nombre (no como bloque aparte) para
    // que participe del cálculo de xLibre ya existente y no pise la nota
    // de sección ni el ícono D.S./D.C. que van después.
    const duracionTxt = (s.duracion != null && s.duracion > 0) ? ' · ' + s.duracion + ' comp.' : '';
    doc.text(s.nombre + etiquetaDC + duracionTxt, xTexto, y + 5);
    let xLibre = xTexto + doc.getTextWidth(s.nombre + etiquetaDC + duracionTxt) + 3;
    if(esCoda){
      const xIcono = xLibre;
      dibujarIconoCoda(xIcono, y + 5.5, [255, 255, 255]);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      doc.text('D.S. al Coda', xIcono + 5.5, y + 5);
      xLibre = xIcono + 5.5 + doc.getTextWidth('D.S. al Coda') + 3;
    }
    // v1.55: compás override — se calcula el texto/ancho ACÁ (antes de
    // dibujarlo) para poder reservarle su espacio a la nota de sección
    // que va inmediatamente a la izquierda; el dibujo real del texto
    // queda al final del bloque, después de la nota (no cambia el
    // resultado visual, jsPDF no depende del orden de los doc.text()).
    const compasTxt = (s.compasOverride || '').trim() ? '· ' + s.compasOverride.trim() : '';
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    const anchoCompas = compasTxt ? doc.getTextWidth(compasTxt) + 4 : 0;
    // v1.55: (a pedido, FIX de diseño) la nota de sección deja de vivir
    // en su propia línea gris debajo de la barra (v1.31) — ahora va
    // INLINE en la misma línea del nombre, dentro de la franja de color
    // de siempre (la barra NO crece), entre el nombre/ícono y el compás
    // override de la derecha. Límite duro de 40 caracteres puesto en el
    // editor (guia-practica.html, bajado de 70 porque ahora comparte
    // línea con el nombre), más 2 redes de seguridad acá por si el
    // espacio real que queda libre (nombre largo + ícono + compás) es
    // más angosto que el peor caso previsto: 1) reduce la fuente de a
    // 0.5pt (de 8 a 6mín), 2) si aun a 6pt no entra, recorta con "…"
    // letra por letra hasta que sí entre. Si no queda casi espacio libre
    // (<8mm), directamente no se imprime — mejor omitirla que solaparla
    // con el compás.
    if((s.notaSeccion || '').trim()){
      const nota = s.notaSeccion.trim();
      const anchoDisponible = (margen + anchoUtil - anchoCompas - 2) - xLibre;
      if(anchoDisponible > 8){
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.8 }));
        doc.setFont('helvetica', 'italic');
        let fontNota = 8;
        doc.setFontSize(fontNota);
        while(doc.getTextWidth(nota) > anchoDisponible && fontNota > 6){
          fontNota -= 0.5;
          doc.setFontSize(fontNota);
        }
        let notaMostrar = nota;
        if(doc.getTextWidth(notaMostrar) > anchoDisponible){
          while(notaMostrar.length > 1 && doc.getTextWidth(notaMostrar + '…') > anchoDisponible){
            notaMostrar = notaMostrar.slice(0, -1);
          }
          notaMostrar += '…';
        }
        doc.text(notaMostrar, xLibre, y + 5);
        doc.restoreGraphicsState();
        doc.setFont('helvetica', 'normal');
      }
    }
    if(compasTxt){
      doc.setFontSize(8);
      doc.text(compasTxt, margen + anchoUtil - 2, y + 5, { align: 'right' });
    }
    // v1.70: (a pedido, según captura de referencia) el resumen
    // "c.#X-c.#Y" pasa a vivir DENTRO de la barra de título, mismo lado
    // derecho — antes era una línea aparte debajo del bloque de cajas,
    // repetida (con el mismo valor) en 4 puntos distintos del código
    // según el tipo de sección (fija-bloque simple/repetido, Vamp,
    // Break/Corte); las 4 usaban exactamente compasGlobalInicio..
    // compasGlobalInicio+s.duracion-1 (el rango real de TODA la sección),
    // así que ahora se calcula una sola vez acá y se sacaron esos 4
    // llamados (buscar "v1.70" en cada punto). Blanco, itálica, opacidad
    // reducida (mismo recurso que ya usa la nota de sección arriba) para
    // no competir visualmente con el nombre. Si hay compás override
    // (compasTxt), el resumen se corre a la izquierda de ese texto para
    // no pisarlo.
    if(compasGlobalInicio != null && s.duracion != null && s.duracion > 0){
      const finResumen = compasGlobalInicio + s.duracion - 1;
      const resumenTxt = 'c.#' + compasGlobalInicio + (finResumen !== compasGlobalInicio ? '-c.#' + finResumen : '');
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.75 }));
      doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(255);
      doc.text(resumenTxt, margen + anchoUtil - 2 - anchoCompas, y + 5, { align: 'right' });
      doc.restoreGraphicsState();
      doc.setFont('helvetica', 'normal'); doc.setTextColor(255);
    }
    y += 9;
    doc.setTextColor(20);
    nombresYaImpresos.add(s.id || s.nombre);

    // v1.29: modo coda — no re-dibuja el cuadro completo, solo remite a la
    // primera aparición (ya se ve completo más arriba en el mismo PDF).
    // Nada de esto toca dibujarCajas/cálculo de compases.
    if(esCoda){
      doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
      doc.text('Ver primera aparición arriba.', margen, y);
      y += 6; doc.setTextColor(20);
      // v1.45: no dibuja cajas, pero los compases reales de esta
      // repetición SÍ pasan en el tema — el contador tiene que avanzar
      // igual (mismo criterio que el resto, ver más abajo).
      if(contadorGlobalValido){
        if(s.duracion != null && s.duracion > 0) compasGlobal += s.duracion;
        else contadorGlobalValido = false;
      }
      return;
    }

    if(s.tipo === 'vamp'){
      const ciclo = s.cicloCompases || (s.acordesCiclo && s.acordesCiclo.length) || 0;
      if(ciclo > 0){
        // v1.46: (a pedido) FIX de criterio sobre v1.45 — antes NO se
        // pasaba compasGlobalInicio acá, con el argumento de que "no hay
        // una caja única de compás real si el ciclo se repite". Error:
        // s.duracion ya define el total real de vueltas (duracion/ciclo)
        // sin ambigüedad, y la 1ra vuelta dibujada ocupa siempre los
        // primeros `ciclo` compases reales de la sección — exactamente
        // el mismo criterio que ya se usa en fija-bloque con
        // repeticiones (se numera la 1ra pasada, las vueltas repetidas
        // no se renumeran por ser idénticas). Ahora sí numera.
        const yGridVamp = y;
        dibujarCajas(s.acordesCiclo, s.letraCiclo, ciclo, s.notasCiclo, undefined, undefined, { compasGlobalInicio, acordesTiempo: s.acordesTiempoCiclo });
        // v1.63: (a pedido) FIX/mejora sobre v1.59 — antes la lista de
        // próximas vueltas solo se pegaba a la 1ra caja del ciclo (columna
        // 0). El pedido es que TODAS las cajas del ciclo muestren sus
        // propias vueltas (ej. si "B" es c.1/#1 y también #3, "Bm" es
        // c.2/#2 y también #4) — no solo la primera. Se recorre cada
        // columna del ciclo (0..ciclo-1) y se lista, para cada una, sus
        // repeticiones futuras (compasGlobalInicio + columna + k*ciclo).
        const vueltasVamp = Math.max(0, Math.floor((s.duracion || ciclo) / ciclo) - 1);
        if(compasGlobalInicio != null && vueltasVamp > 0){
          const maxLineasVamp = 3;
          const hayNotasCiclo = hayContenido(s.notasCiclo);
          const yBaseVamp = yGridVamp + (hayNotasCiclo ? notaFilaAlto : 0) + 7;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(170);
          for(let col = 0; col < Math.min(ciclo, POR_FILA); col++){
            const xListaVamp = margen + cajaAncho * col + cajaAncho - 1.5;
            let yListaVamp = yBaseVamp;
            for(let k = 1; k <= Math.min(vueltasVamp, maxLineasVamp); k++){
              doc.text('#' + (compasGlobalInicio + col + k * ciclo), xListaVamp, yListaVamp, { align: 'right' });
              yListaVamp += 2.6;
            }
          }
          doc.setTextColor(20);
        }
        const anchoIcono = dibujarIconoRepeticion(margen, y);
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
        // v1.63: (a pedido) "yo no veo cuántas veces se repite" — el
        // texto solo decía el largo del ciclo, no cuántas vueltas son en
        // total. Se agrega "xN" adelante, mismo formato que ya usa
        // fija-bloque ("x2 (4 comp. reales)") para lo mismo.
        const totalVueltasVampTxt = vueltasVamp + 1;
        doc.text('se repite x' + totalVueltasVampTxt + ' (ciclo de ' + ciclo + ' comp.)', margen + anchoIcono + 1, y);
        // v1.70: el resumen "c.#X-c.#Y" se sacó de acá — ahora vive en la
        // barra de título de la sección (mismo dato).
        y += 6; doc.setTextColor(20);
      } else {
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
        doc.text('Definí el ciclo de compases arriba para ver las cajas acá.', margen, y);
        y += 6; doc.setTextColor(20);
      }
    } else {
      const duracion = s.duracion;
      // v1.29.11: Break/Corte usa dibujarCajaBreak (caja ancha) en vez de
      // dibujarCajas (grilla de 4 col.) — mismo dato de entrada
      // (acordesPorCompas/acordesFinal2), solo cambia el dibujo.
      const esBreak = s.nombre === 'Break/Corte';
      const dibujarBloqueSeccion = esBreak
        ? (ac, le, n, no, ci, li, opciones) => dibujarCajaBreak(ac, n, s.notaTiempoCorte, s.patronRitmico, opciones && opciones.compasGlobalInicio, s.acordesPorGolpe, s.notasPorGolpe)
        : dibujarCajas;
      if(duracion != null && duracion > 0){
        if(s.nombre === 'Intro' && (s.acordesSinTiempo || '').trim()){
          doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
          doc.text('Libre/rubato: ' + s.acordesSinTiempo, margen, y);
          y += 6;
        }
        // v1.23: repetición con 1ra/2da vez — dibuja UNA sola pasada
        // (basePase cajas, lo que realmente cargó el staff en la grilla de
        // arriba) en vez de repetir la fila entera `repeticiones` veces;
        // abajo, nota de repetición y, si hay 2da vez cargada, una fila
        // chica aparte con esas cajas. repeticiones=1 (default) no cambia
        // nada.
        const repeticiones = s.repeticiones || 1;
        if(repeticiones > 1){
          const basePase = Math.max(1, Math.round(duracion / repeticiones));
          // v1.42: (a pedido) hay2da/alineable ahora se calculan ACÁ
          // arriba (antes se calculaban después de dibujar la 1ra vez) —
          // necesitamos saberlo ANTES de capturar yBloque, para poder
          // reservar aire arriba para el corchete "1." si va a hacer
          // falta. finalN no depende de nada que se calcule más abajo.
          const finalN = Math.min(basePase, s.finalDistintoN || 1);
          const hay2da = (s.acordesFinal2 && s.acordesFinal2.some(a => (a||'').trim())) || (s.letraFinal2 && s.letraFinal2.some(l => (l||'').trim()));
          const alineable = !esBreak && basePase <= POR_FILA;
          // v1.43: (a pedido) cabeHorizontal también se calcula ACÁ
          // arriba (antes de saber si hace falta reservar aire para el
          // corchete "1.").
          const hayNotas1 = !esBreak && hayContenido(s.notasPorCompas);
          const hayNotas2 = !esBreak && hayContenido(s.notasFinal2);
          const colLibreDesde = basePase % POR_FILA;
          const libres = colLibreDesde === 0 ? 0 : POR_FILA - colLibreDesde;
          const cabeHorizontal = !!s.casillaHorizontal && alineable && libres >= finalN && hayNotas1 === hayNotas2;
          // v1.44: FIX — este aire se reservaba solo si !cabeHorizontal,
          // con el razonamiento de que "en horizontal no se dibuja el
          // corchete 1., así que no hace falta". Error: en horizontal SÍ
          // se dibuja un corchete arriba (el "2." de la caja pegada al
          // lado, ver más abajo), anclado en el mismo yBloque y con el
          // mismo offset hacia arriba que el "1." — el aire hace falta
          // en los dos modos por igual. Ahora se reserva siempre que
          // alineable && hay2da, sin importar cabeHorizontal.
          if(alineable && hay2da){
            // El corchete se dibuja pegado a la caja/nota de abajo
            // (offsets de dibujarCorcheteCasilla sin cambios) — lo que
            // hacía falta era AIRE ARRIBA de toda la sección para que no
            // pisara la franja de color del título anterior. Antes no
            // había forma de reservarlo (asegurarEspacio solo protege
            // hacia abajo). +5mm alcanza para el offset del número
            // (-3.3) más un margen chico.
            y += 5;
          }
          // v1.29.8: FIX — yBloque se capturaba ANTES de asegurar espacio;
          // si dibujarCajas() disparaba un salto de página adentro
          // (asegurarEspacio → addPage → y=margen), yBloque quedaba con la
          // Y vieja (página anterior) mientras las cajas se dibujaban en
          // la Y nueva — la barra/corchete quedaban flotando,
          // desalineados. Ahora se asegura el espacio ANTES de capturar
          // yBloque, así los dos usan la misma Y real.
          const altoBloque = Math.ceil(basePase / POR_FILA) * (cajaAlto + (!esBreak && hayContenido(s.notasPorCompas) ? notaFilaAlto : 0));
          const anchoBloque = Math.min(basePase, POR_FILA) * cajaAncho;
          asegurarEspacio(altoBloque + 2);
          const yBloque = y;
          dibujarBloqueSeccion(s.acordesPorCompas, s.letraPorCompas, basePase, s.notasPorCompas, undefined, undefined, { compasGlobalInicio, acordesTiempo: s.acordesTiempo });
          // v1.51: (a pedido) "→ #N" — versión final, DEBAJO
          // de la 1ra caja (#14) puntual, centrado bajo esa columna (no
          // bajo todo el bloque, por eso no usa el mismo ancho que el
          // texto "x2 (...)"). Se dibuja ACÁ, apenas terminan de dibujarse
          // las cajas (y ya quedó en yBox_bottom+4, el colchón que deja
          // dibujarCajas) y ANTES del texto "x2 (...)" que se dibuja más
          // abajo en este mismo bloque — así queda una franja propia,
          // sin pisar ni la letra en cursiva (que va DENTRO de la caja,
          // más arriba) ni el texto "x2 (...)" (3mm más abajo que esto).
          // No depende de la cantidad de repeticiones: es un solo número
          // (compasGlobalInicio + basePase), no una lista — el ancho de
          // columna (cajaAncho, ~46.5mm con POR_FILA=4) sobra de sobra
          // para cualquier compás real de una canción (hasta 4-5 dígitos
          // sin riesgo de desbordar, muy por encima de lo que un tema
          // real necesita). Mismo criterio de apagado que "#N" de siempre.
          // v1.55: (a pedido, versión final tras varias iteraciones)
          // "→ #N" pasa a ser una listita, pegada JUSTO abajo del label
          // "#14" (misma esquina sup. derecha de la 1ra caja, ADENTRO —
          // mismo x que usa dibujarCajas para el label: x+cajaAncho-1.5,
          // ver línea ~881), no más afuera/debajo de toda la caja. Si hay
          // varias vueltas (repeticiones > 2), se listan una debajo de la
          // otra (columna), cada una un compás real más adelante
          // (compasGlobalInicio + k*basePase, k=1..repeticiones-1). Si no
          // entran todas en las maxLineas disponibles, la última línea
          // visible pasa a ser "..." en vez del número, para no desbordar
          // la caja hacia la letra en cursiva (yCaja+13) ni hacia el
          // acorde grande del centro. yBloque acá equivale a yCaja de la
          // 1ra caja (fila 0, columna 0) porque dibujarCajas() arranca
          // sus filas en el mismo y que recibe.
          if(alineable && hay2da && compasGlobalInicio != null){
            const totalVueltas = Math.max(0, (s.repeticiones || 1) - 1);
            if(totalVueltas > 0){
              const maxLineas = 3;
              const xLista = margen + cajaAncho - 1.5;
              // v1.56: FIX — faltaba sumar el mismo corrimiento que
              // dibujarCajas() aplica a la fila 0 cuando hay nota arriba
              // (yCaja = yFila + (hayNotas?notaFilaAlto:0), línea 862).
              // Con "MAS SUAVE" presente, la caja real bajaba 5mm pero
              // esta lista se quedaba calculada desde yBloque sin ese
              // offset — quedaba dibujada MÁS ARRIBA que el label "#14"
              // real, pisándolo. Usa hayNotas1 (mismo dato que ya se le
              // pasa a dibujarCajas como "notas" de la 1ra vez).
              const yCajaReal = yBloque + (hayNotas1 ? notaFilaAlto : 0);
              let yLista = yCajaReal + 7;
              doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(170);
              for(let k = 1; k <= Math.min(totalVueltas, maxLineas); k++){
                const esUltimaVisible = (k === maxLineas) && (totalVueltas > maxLineas);
                const txt = esUltimaVisible ? '…' : '#' + (compasGlobalInicio + k * basePase);
                doc.text(txt, xLista, yLista, { align: 'right' });
                yLista += 2.6;
              }
              doc.setTextColor(20);
            }
          }
          // v1.35: (a pedido) la barra ya no abarca la tira de nota
          // (ej. "MAS SUAVE") de la 1ra fila — solo el alto real de las
          // cajas. Se corre el inicio hacia abajo esa misma altura
          // (offsetNotaPrimeraFila) y se resta del total, así el final de
          // la barra (abajo) no se mueve, solo el arranque. Nota: si el
          // bloque ocupa MÁS de una fila (basePase > POR_FILA), las notas
          // de las filas intermedias/siguientes siguen quedando dentro de
          // la barra — separarlas también implicaría partir la barra en
          // segmentos por fila, cambio más grande que no se hizo acá.
          const offsetNotaPrimeraFila = (!esBreak && hayContenido(s.notasPorCompas) ? notaFilaAlto : 0);
          // v1.48: FIX — en modo horizontal (cabeHorizontal), la 2da vez se
          // dibuja pegada a la derecha de la 1ra vez SIN espacio de por
          // medio (ver más abajo, xHorizontal = margen + basePase*cajaAncho,
          // justo donde terminaba anchoBloque). El trazo derecho de la barra
          // de repetición asumía aire ahí y quedaba dibujado ENCIMA/adentro
          // de la caja de la 2da vez. Ahora, solo cuando cabeHorizontal &&
          // hay2da, el ancho que recibe dibujarBarraRepeticion se extiende
          // para que el trazo derecho cierre después de la caja de la 2da
          // vez (borde real de "Fm"/etc.), no en el borde de la 1ra vez —
          // la barra enmarca el ciclo completo con su final incluido, como
          // corresponde. El trazo izquierdo no cambia. Sin 2da vez o con
          // 2da vez apilada (no cabeHorizontal), anchoBloque queda igual
          // que siempre.
          const anchoBarraDerecha = (cabeHorizontal && hay2da) ? anchoBloque + finalN * cajaAncho : anchoBloque;
          dibujarBarraRepeticion(yBloque + offsetNotaPrimeraFila, altoBloque - offsetNotaPrimeraFila, anchoBarraDerecha);
          doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(120);
          // v1.39: (a pedido) FIX de dirección sobre v1.38 — no tenía en
          // cuenta que dibujarCajas() ya deja +4mm de colchón después de
          // la caja (y += altoTotal + 4). y-3 en realidad ACERCABA el
          // texto al borde (quedaba a solo 1mm), al revés de lo buscado.
          // Con y-1 queda a 3mm reales del borde de la grilla de arriba.
          doc.text('x' + repeticiones + ' (' + duracion + ' comp. reales)', margen + anchoBloque / 2, y - 1, { align: 'center' });
          // v1.70: el resumen "c.#X-c.#Y" se sacó de acá — ahora vive en
          // la barra de título de la sección (mismo dato, una sola vez).
          doc.setTextColor(20);
          // v1.41: (a pedido) antes la 2da vez SIEMPRE arrancaba dibujada
          // en columna 1, sin importar cuántos compases reemplaza — con
          // basePase=2 y finalDistintoN=1, el PDF mostraba la 2da vez
          // como si fuera "c.1" nueva, sin forma de saber que en
          // realidad reemplaza el c.2. Ahora, SOLO si la 1ra vez entra
          // en una única fila (caso normal — si ocupa varias filas, cae
          // al comportamiento de siempre por abajo), se calcula la
          // columna real que reemplaza y se alinean ahí tanto el
          // corchete "2." como un corchete "1." nuevo arriba de la 1ra
          // vez, en las mismas columnas — para que quede claro a simple
          // vista qué compás(es) cambia(n) en la última pasada.
          const colReemplazo = alineable ? (basePase - finalN) : 0;
          const xReemplazo = margen + colReemplazo * cajaAncho;
          const anchoReemplazo = finalN * cajaAncho;
          // v1.44: (a pedido) el corchete "1." ahora se dibuja también en
          // modo horizontal (antes solo en el apilado vertical) — sin él,
          // no quedaba claro a simple vista CUÁL caja de la 1ra pasada es
          // la que se reemplaza (solo se notaba leyendo el "c.N" chico).
          // Ahora queda simétrico: "1." arriba de la caja reemplazada,
          // "2." arriba de la caja pegada al lado.
          if(alineable && hay2da){
            // El corchete "1." va arriba de TODA la tira de nota (si hay,
            // ej. "MAS SUAVE") para no pisar ese texto — por eso usa
            // yBloque (arranque real de la fila) y no yCaja/offsetNota.
            dibujarCorcheteCasilla(yBloque, 1, xReemplazo, anchoReemplazo);
          }
          if(hay2da && cabeHorizontal){
            // Modo horizontal: la 2da vez va pegada a la derecha de la
            // 1ra vez, EN LA MISMA FILA (columna basePase en adelante),
            // con su propio corchete "2." angosto arriba (mismo estilo
            // que el corchete "1."/"2." de siempre, solo que del ancho
            // de sus columnas). La etiqueta "c.N" sigue mostrando el
            // compás real (labelInicio=colReemplazo), no la columna
            // donde se dibuja.
            const xHorizontal = margen + basePase * cajaAncho;
            const anchoHorizontal = finalN * cajaAncho;
            // Mismo criterio que el corchete "1.": ancla en yBloque (por
            // encima de TODA la tira de nota si hay, ej. "MAS SUAVE"),
            // no en yCaja — si no, con nota cargada el corchete quedaría
            // pisando ese texto.
            dibujarCorcheteCasilla(yBloque, 2, xHorizontal, anchoHorizontal);
            // v1.47: FIX — la 2da vez es la ÚLTIMA pasada del repetido,
            // no la primera. compasGlobalInicio (el de la sección) sirve
            // para la 1ra pasada, pero acá hay que sumarle las pasadas
            // intermedias: (repeticiones-1) vueltas completas de
            // basePase compases cada una, antes de llegar a colReemplazo.
            // Si repeticiones=1, esto no suma nada (queda igual que antes).
            const compasGlobalInicio2da = compasGlobalInicio != null
              ? compasGlobalInicio + (repeticiones - 1) * basePase
              : null;
            dibujarCajas(s.acordesFinal2, s.letraFinal2, finalN, s.notasFinal2, basePase, colReemplazo, {
              yBase: yBloque,
              hayNotasForzado: hayNotas1,
              sinAvanzarY: true,
              compasGlobalInicio: compasGlobalInicio2da,
              acordesTiempo: s.acordesTiempoFinal2
            });
          } else if(hay2da){
            // v1.37: (a pedido) el hueco fijo era de 3mm, y en esos 3mm
            // tenían que convivir el texto "x2 (N comp. reales)" (dibujado
            // arriba, en y-2, con sus propios ascendentes/descendentes) Y
            // la línea del corchete "2." (que arranca 3.5mm por encima de
            // yBloque2) — terminaban pisándose entre sí y con el borde de
            // la grilla de la fila anterior. Con 6mm de hueco, la línea del
            // corchete queda por DEBAJO del borde de esa grilla (no
            // pegada) y con margen real respecto al texto "x2 (...)". El
            // tick vertical de 3.5mm hasta la caja de abajo no cambió.
            // v1.39: hueco 6→7mm — con el número del corchete ahora
            // flotando más arriba de la línea (-4, ver v1.39 en
            // dibujarCorcheteCasilla), quedaba a solo ~1mm del texto
            // "x2 (...)" de arriba. Con 7mm queda a ~4mm, sin riesgo de
            // tocarse. El tick de 1.5mm hasta la caja de abajo no cambió.
            y += 7;
            const altoBloque2 = Math.ceil(finalN / POR_FILA) * (cajaAlto + (!esBreak && hayContenido(s.notasFinal2) ? notaFilaAlto : 0));
            asegurarEspacio(altoBloque2 + 4);
            const yBloque2 = y;
            dibujarCorcheteCasilla(yBloque2, 2, alineable ? xReemplazo : margen, alineable ? anchoReemplazo : anchoUtil);
            // v1.47: mismo FIX que en el modo horizontal — ver comentario
            // ahí arriba.
            const compasGlobalInicio2daV = compasGlobalInicio != null
              ? compasGlobalInicio + (repeticiones - 1) * basePase
              : null;
            dibujarBloqueSeccion(s.acordesFinal2, s.letraFinal2, finalN, s.notasFinal2, alineable ? colReemplazo : 0, undefined, { compasGlobalInicio: compasGlobalInicio2daV, acordesTiempo: s.acordesTiempoFinal2 });
          }
        } else {
          dibujarBloqueSeccion(s.acordesPorCompas, s.letraPorCompas, duracion, s.notasPorCompas, undefined, undefined, { compasGlobalInicio, acordesTiempo: s.acordesTiempo });
          // v1.70: el resumen "c.#X-c.#Y" se sacó de acá — ahora vive en
          // la barra de título de la sección (mismo dato, una sola vez;
          // ver dibujarBloqueSeccion.forEach, cerca de compasTxt).
        }
      } else {
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
        doc.text('Definí el fin de la sección para ver las cajas acá.', margen, y);
        y += 6; doc.setTextColor(20);
      }
    }
    // v1.45: avance del contador global — al final, para que aplique
    // sea cual sea la rama de dibujo de arriba (Vamp, fija-bloque,
    // Break/Corte, o el placeholder "definí el fin/ciclo..."). Usa
    // SIEMPRE s.duracion (compases reales del tema completo), nunca
    // ciclo/basePase/finalN — esos son solo cuántas cajas se DIBUJAN,
    // no cuántos compases reales pasan.
    if(contadorGlobalValido){
      if(s.duracion != null && s.duracion > 0) compasGlobal += s.duracion;
      else contadorGlobalValido = false;
    }
    y += 2;
  });

  const nombreArchivo = 'estructura-' + nombreTema.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.pdf';
  // v1.28: preview antes de descargar — en vez de forzar la descarga
  // directa con doc.save(), se abre el PDF ya armado (mismo dibujo de
  // siempre, cero cambios en dibujarCajas/cálculo de compases) en una
  // pestaña nueva con el visor nativo del navegador. Desde ahí el usuario
  // ve el resultado real y decide si lo descarga o imprime con los
  // controles propios del visor — no se duplica ninguna lógica de
  // renderizado. setProperties(title) hace que el visor y el nombre
  // sugerido al guardar coincidan con nombreArchivo.
  doc.setProperties({ title: nombreArchivo });
  const urlPreview = doc.output('bloburl');
  const ventana = window.open(urlPreview, '_blank');
  if(!ventana){
    // Bloqueador de pop-ups u otro impedimento: no se pierde el PDF, se
    // cae al comportamiento anterior (descarga directa).
    doc.save(nombreArchivo);
  }
}

// v1.73: (a pedido) "guía de percusión" — función NUEVA y separada,
// cero líneas compartidas con generarEstructuraPDF/dibujarCajas/
// dibujarCajaBreak de arriba (cero riesgo de romper el PDF de acordes
// existente). Mismo `datos` de entrada (temaNombre/bpm/compasTexto/
// claveTxt/secciones), mismos colores por sección ya resueltos por
// quien llama (exportarEstructuraPDFPercusion, guia-practica.html
// v1.74). Diferencias a propósito respecto al PDF de acordes:
//  - Header COMPLETO, igual al de generarEstructuraPDF (headerH=38mm,
//    franja + diffuser con recorte "cover" + logo con
//    LOGO_SIZE/ALIGN/OFFSET_Y/SIN_LOGO + línea dorada), a pedido — antes
//    era simplificado (solo franja+logo, 20mm), ya no. Los 3 helpers
//    (dibujarDiffuserCover/imagenComoDataURL/detectarFormatoImagen) son
//    funciones locales dentro de generarEstructuraPDF, así que se
//    duplican acá tal cual (mismo código, cero cambio de lógica) porque
//    esta función vive aparte y no puede llamarlas directamente. Único
//    texto distinto: "GUÍA DE PERCUSIÓN" en vez de "GUÍA DE PRÁCTICA".
//  - Cada celda de compás: número + (si hay) notasPercusionPorCompas de
//    ESE compás — nada de acorde ni letra (a pedido explícito: "esta
//    guía no tiene acordes").
//  - Mini-regla de 16 marcas (semicorchea) en vez de las 8 de acordes,
//    notación 1/e/&/a por tiempo (misma que ya usa cualquier
//    percusionista) — lee acentosPorCompas, campo propio, no
//    acordesTiempo.
// Alcance de esta primera versión (a propósito, para no arriesgar todo
// de una): dibuja UNA pasada por sección (basePase, igual criterio que
// la grilla principal de acordes) — no expande 2da vez (acordesFinal2)
// ni el ciclo completo de Vamp, y las secciones Break/Corte se dibujan
// igual que cualquier otra (sin su patrón rítmico propio). Si hace
// falta alguna de esas 3 cosas, se agrega después con el mismo criterio
// ya usado en todo este archivo (avisando antes de tocar).
function generarEstructuraPDFPercusion(datos){
  const { temaNombre, bpm, compasTexto, claveTxt, secciones: seccionesEntrada } = datos;
  if(!window.jspdf){ alert('No se pudo cargar el generador de PDF. Revisá tu conexión e intentá de nuevo.'); return; }
  if(!seccionesEntrada || !seccionesEntrada.length){ alert('No hay secciones cargadas todavía.'); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margen = 12;
  const anchoUtil = pageW - margen * 2;

  const goldRGB = [201, 162, 75];
  const headerH = 38;
  const imgDiffuserHdr = document.getElementById('hdrDiffuser');
  const imgLogoHdr = document.getElementById('hdrLogo');
  const diffuserOkHdr = imgDiffuserHdr && imgDiffuserHdr.complete && imgDiffuserHdr.naturalWidth > 0;
  const logoOkHdr = imgLogoHdr && imgLogoHdr.complete && imgLogoHdr.naturalWidth > 0;
  const headerSinFondo = typeof HEADER_SIN_FONDO !== 'undefined' ? HEADER_SIN_FONDO : false;
  const headerColorRGB = typeof HEADER_COLOR_RGB !== 'undefined' ? HEADER_COLOR_RGB : [11, 11, 13];
  const headerDiffuserOpacity = typeof HEADER_DIFFUSER_OPACITY !== 'undefined' ? HEADER_DIFFUSER_OPACITY : 1.0;
  const headerColorOpacity = typeof HEADER_COLOR_OPACITY !== 'undefined' ? HEADER_COLOR_OPACITY : 0.62;

  // Helpers duplicados tal cual desde generarEstructuraPDF (son funciones
  // locales allá, no accesibles acá) — cero cambio de lógica, ver esa
  // función para el detalle de cada uno.
  function dibujarDiffuserCoverPercusion(img, targetWmm, targetHmm, opacity, formato){
    const targetRatio = targetWmm / targetHmm;
    const srcRatio = img.naturalWidth / img.naturalHeight;
    let drawW, drawH;
    if(srcRatio > targetRatio){
      drawH = targetHmm;
      drawW = targetHmm * srcRatio;
    } else {
      drawW = targetWmm;
      drawH = targetWmm / srcRatio;
    }
    const drawX = (targetWmm - drawW) / 2;
    const drawY = (targetHmm - drawH) / 2;
    doc.saveGraphicsState();
    doc.rect(0, 0, targetWmm, targetHmm, null);
    doc.clip();
    doc.discardPath();
    doc.setGState(new doc.GState({ opacity }));
    doc.addImage(img, formato, drawX, drawY, drawW, drawH);
    doc.restoreGraphicsState();
  }
  function imagenComoDataURLPercusion(img, calidad){
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d').drawImage(img, 0, 0);
    return canvas.toDataURL('image/jpeg', calidad != null ? calidad : 0.95);
  }
  function detectarFormatoImagenPercusion(src){
    const limpio = (src || '').split('?')[0].split('#')[0].toLowerCase();
    if(limpio.endsWith('.png')) return 'PNG';
    if(limpio.endsWith('.webp')) return 'WEBP';
    return 'JPEG';
  }

  if(!headerSinFondo){
    if(diffuserOkHdr){
      dibujarDiffuserCoverPercusion(imgDiffuserHdr, pageW, headerH, headerDiffuserOpacity, detectarFormatoImagenPercusion(imgDiffuserHdr.src));
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: headerColorOpacity }));
      doc.setFillColor(...headerColorRGB);
      doc.rect(0, 0, pageW, headerH, 'F');
      doc.restoreGraphicsState();
    } else {
      doc.setFillColor(...headerColorRGB);
      doc.rect(0, 0, pageW, headerH, 'F');
    }
  }
  doc.setDrawColor(...goldRGB);
  doc.setLineWidth(0.5);
  doc.line(0, headerH, pageW, headerH);
  if(logoOkHdr && !(typeof LOGO_SIN_LOGO !== 'undefined' && LOGO_SIN_LOGO)){
    const logoH = Math.min(typeof LOGO_SIZE !== 'undefined' ? LOGO_SIZE : 16, headerH - 4);
    const logoW = logoH * (imgLogoHdr.naturalWidth / imgLogoHdr.naturalHeight);
    const offsetY = typeof LOGO_OFFSET_Y !== 'undefined' ? LOGO_OFFSET_Y : 0;
    const logoY = (headerH - logoH) / 2 + offsetY;
    const align = typeof LOGO_ALIGN !== 'undefined' ? LOGO_ALIGN : 'izquierda';
    let logoX;
    if(align === 'centro') logoX = (pageW - logoW) / 2;
    else if(align === 'derecha') logoX = pageW - margen - logoW;
    else logoX = margen;
    let logoParaPintar = imgLogoHdr;
    let logoFormato = 'JPEG';
    try {
      logoParaPintar = imagenComoDataURLPercusion(imgLogoHdr);
    } catch(e){
      logoParaPintar = imgLogoHdr;
      logoFormato = detectarFormatoImagenPercusion(imgLogoHdr.src);
    }
    try {
      doc.addImage(logoParaPintar, logoFormato, logoX, logoY, logoW, logoH);
    } catch(e){ /* logo omitido puntualmente, mismo criterio que generarEstructuraPDF */ }
  }
  doc.saveGraphicsState();
  doc.setGState(new doc.GState({ opacity: 1 }));
  doc.setTextColor(25, 22, 18);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('GUÍA DE PERCUSIÓN', pageW - margen, headerH - 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(new Date().toLocaleDateString('es-CO', { day:'2-digit', month:'long', year:'numeric' }), pageW - margen, headerH - 5, { align: 'right' });
  doc.restoreGraphicsState();

  let y = headerH + 9;
  const nombreTema = temaNombre || 'Tema sin nombre';
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.setTextColor(20, 20, 20);
  doc.text(nombreTema, margen, y); y += 7;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.text(`BPM ${bpm || '—'} · Compás ${compasTexto || '4/4'}${claveTxt ? ' · Clave: ' + claveTxt : ''}`, margen, y);
  y += 8;

  const asegurarEspacio = (alto) => {
    if(y + alto > pageH - margen){ doc.addPage(); y = margen; }
  };

  const POR_FILA = 6;
  const cajaAncho = anchoUtil / POR_FILA;
  const cajaAlto = 14;
  const TIEMPOS_PERCUSION = ['1','1e','1&','1a','2','2e','2&','2a','3','3e','3&','3a','4','4e','4&','4a'];
  // v1.90: (a pedido) notaFilaAlto/hayContenido — duplicados tal cual de
  // generarEstructuraPDF (línea ~1157/1170, funciones locales allá, no
  // accesibles desde acá) para que la nota por compás de percusión
  // (notasPercusionPorCompas/Ciclo/Final2) tenga su propia tira arriba de
  // la caja, mismo criterio visual que ya usa el PDF de acordes.
  const notaFilaAlto = 5;
  const hayContenido = (arr) => Array.isArray(arr) && arr.some(x => (x || '').trim());

  const secciones = seccionesEntrada.filter(s => (s.nombre || '').trim());

  // v1.76: (a pedido) Vamp y 2da vez en la guía de percusión — mismo
  // patrón que ya usa generarEstructuraPDF con dibujarCajas/acordesCiclo/
  // acordesFinal2, pero leyendo los arrays exclusivos de percusión
  // (notasPercusionCiclo/acentosCiclo y notasPercusionFinal2/acentosFinal2).
  // Antes, esta función ignoraba s.tipo==='vamp' por completo: dibujaba
  // s.duracion cajas leyendo notasPercusionPorCompas/acentosPorCompas (los
  // arrays de la grilla principal, que en una sección Vamp ni siquiera se
  // cargan) — quedaba mal. También faltaba el bloque de 2da vez entero.
  const totalCajasSeccionPercusion = (s) => {
    const esVamp = s.tipo === 'vamp';
    const esBreak = s.nombre === 'Break/Corte';
    if(esVamp) return s.cicloCompases || (s.notasPercusionCiclo && s.notasPercusionCiclo.length) || 0;
    const repeticiones = esBreak ? 1 : (s.repeticiones || 1);
    const duracion = s.duracion || 1;
    return repeticiones > 1 ? Math.max(1, Math.round(duracion / repeticiones)) : duracion;
  };
  const hay2daSeccionPercusion = (s, totalCajas) => {
    if(s.tipo === 'vamp' || s.nombre === 'Break/Corte') return false;
    const repeticiones = s.repeticiones || 1;
    if(repeticiones <= 1) return false;
    // v1.77: (a pedido) antes SOLO miraba los arrays exclusivos de
    // percusión (notasPercusionFinal2/acentosFinal2) — si el usuario ya
    // había cargado una 2da vez distinta en el PDF general (acordesFinal2/
    // letraFinal2) pero no había tocado nada de percusión, este PDF no
    // mostraba el bloque de 2da vez. Ahora también hereda esa info.
    return (s.notasPercusionFinal2 && s.notasPercusionFinal2.some(t => (t||'').trim())) ||
           (s.acentosFinal2 && s.acentosFinal2.some(a => (a||'').trim())) ||
           (s.acordesFinal2 && s.acordesFinal2.some(a => (a||'').trim())) ||
           (s.letraFinal2 && s.letraFinal2.some(l => (l||'').trim()));
  };
  // v1.77: (a pedido) criterio compartido — ¿esta sección debe mostrar
  // la línea "se repite xN..." heredada del PDF general? (Vamp con ciclo
  // definido, o fija-bloque con repeticiones>1; Break/Corte nunca).
  const mostrarRepeticionPercusion = (s, totalCajas) => {
    const esVamp = s.tipo === 'vamp';
    const esBreak = s.nombre === 'Break/Corte';
    if(esVamp) return totalCajas > 0;
    return !esBreak && (s.repeticiones || 1) > 1;
  };
  const calcularAltoSeccionPercusion = (s) => {
    const esBreak = s.nombre === 'Break/Corte';
    if(esBreak){
      // v1.84: (a pedido) alto para el patrón rítmico en vez de la
      // grilla — mismo criterio que dibujarCajaBreak en generarEstructuraPDF
      // (header 10mm + nota de tiempo 6mm + patrón si hay: 4mm de
      // separación + altoPlica(6)+7 de dibujarPatronRitmico).
      const hayPatron = (s.patronRitmico || '').trim();
      return 7 + 3 + 6 + (hayPatron ? 4 + 13 : 0) + 4;
    }
    const totalCajas = totalCajasSeccionPercusion(s);
    const filas = Math.max(1, Math.ceil((totalCajas || 1) / POR_FILA));
    // v1.92: (a pedido) la tira de arriba ahora la ocupa la nota de
    // ARMONÍA (notasPorCompas/notasCiclo), no la de percusión — la de
    // percusión vuelve a vivir ADENTRO de la caja (ver dibujarCajasPercusion).
    // Por eso acá se mira notasPorCompas/notasCiclo para decidir si
    // reservar notaFilaAlto, igual que hace calcularAltoSeccion en
    // generarEstructuraPDF para la grilla de acordes.
    const notasArmoniaPrincipal = s.tipo === 'vamp' ? s.notasCiclo : s.notasPorCompas;
    const notaAltoPrincipal = hayContenido(notasArmoniaPrincipal) ? notaFilaAlto : 0;
    let alto = 7 + 3 + filas * (cajaAlto + notaAltoPrincipal + 2) + 4;
    if(mostrarRepeticionPercusion(s, totalCajas)) alto += 5;
    if(hay2daSeccionPercusion(s, totalCajas)){
      const finalN = Math.min(totalCajas || 1, s.finalDistintoN || 1);
      const filasF2 = Math.max(1, Math.ceil(finalN / POR_FILA));
      const notaAltoF2 = hayContenido(s.notasFinal2) ? notaFilaAlto : 0;
      alto += cajaAlto + 4 + 4 + filasF2 * (cajaAlto + notaAltoF2 + 2);
    }
    return alto;
  };

  // v1.79: (a pedido) mismo ícono gráfico de repetición (║:) que ya usa
  // generarEstructuraPDF (dibujarIconoRepeticion, v1.29.2) — duplicado
  // tal cual acá porque es función local allá, no accesible desde este
  // archivo/función. Antes "se repite xN" en el PDF de percusión era
  // solo texto itálico, sin el símbolo gráfico que sí tiene el PDF de
  // acordes para lo mismo. Cero cambio en generarEstructuraPDF.
  const dibujarIconoRepeticionPercusion = (x, yBase) => {
    doc.setFillColor(120, 120, 120);
    doc.rect(x, yBase - 3, 0.8, 3.2, 'F');
    doc.rect(x + 1.4, yBase - 3, 0.3, 3.2, 'F');
    doc.circle(x + 2.6, yBase - 2.2, 0.35, 'F');
    doc.circle(x + 2.6, yBase - 0.8, 0.35, 'F');
    return 4.2;
  };
  // v1.86: (a pedido) marco completo izq.+der. con puntos, idéntico a
  // dibujarBarraRepeticion de generarEstructuraPDF (línea ~1265-1288) —
  // duplicado tal cual, mismo motivo que dibujarIconoCoda/dibujarPatronRitmico
  // arriba. Reemplaza a dibujarBarraCierreSeccion (v1.79/v1.81, solo lado
  // derecho, se dibujaba en TODA sección): ahora, mismo criterio que
  // acordes, el marco completo solo se dibuja en fija-bloque con
  // repeticiones>1 — Vamp y secciones sin repetición no llevan marco
  // (en acordes, Vamp solo tiene el iconito "║:" antes del texto "se
  // repite...", sin marco a los costados de las cajas).
  const dibujarBarraRepeticionPercusion = (yBloqueInicio, alto, anchoBloque) => {
    const ancho = anchoBloque != null ? anchoBloque : anchoUtil;
    const grosor = 1.2;
    doc.setFillColor(20, 20, 20);
    doc.rect(margen - 4.4, yBloqueInicio, grosor, alto, 'F');
    doc.rect(margen - 2.4, yBloqueInicio, 0.4, alto, 'F');
    doc.rect(margen + ancho + 3.2, yBloqueInicio, grosor, alto, 'F');
    doc.rect(margen + ancho + 2.0, yBloqueInicio, 0.4, alto, 'F');
    const yc = yBloqueInicio + alto / 2;
    doc.circle(margen - 0.85, yc - 1.2, 0.35, 'F');
    doc.circle(margen - 0.85, yc + 1.2, 0.35, 'F');
    doc.circle(margen + ancho + 0.85, yc - 1.2, 0.35, 'F');
    doc.circle(margen + ancho + 0.85, yc + 1.2, 0.35, 'F');
  };
  // v1.88: (a pedido) corchete "1."/"2." de casilla, duplicado tal cual
  // de dibujarCorcheteCasilla (generarEstructuraPDF, línea ~1310) — mismo
  // motivo que el resto de los helpers ya duplicados acá. Se usa cuando
  // la 2da vez de percusión entra en horizontal (pegada a la 1ra vez) o
  // alineada verticalmente bajo la columna que reemplaza.
  const dibujarCorcheteCasillaPercusion = (yBloqueInicio, numero, xInicio, ancho) => {
    xInicio = xInicio != null ? xInicio : margen;
    ancho = ancho != null ? ancho : anchoUtil;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor(20);
    doc.text(numero + '.', xInicio + 1.5, yBloqueInicio - 3.3);
    doc.setDrawColor(20); doc.setLineWidth(0.3);
    doc.line(xInicio, yBloqueInicio, xInicio, yBloqueInicio - 1.5);
    doc.line(xInicio, yBloqueInicio - 1.5, xInicio + ancho, yBloqueInicio - 1.5);
  };
  // Ancho real ocupado por la última fila de `total` cajas — mismo
  // cálculo que usa dibujarCajasPercusion para decidir cuándo saltar de
  // fila, pero acá solo para saber dónde termina la última fila.
  const anchoUltimaFilaPercusion = (total) => (((total - 1) % POR_FILA) + 1) * cajaAncho;


  // (select "Instrumento") — si un valor no está en esta lista, se
  // asume que viene de "Otro…"/'__otro__' y se muestra
  // s.instrumentoPercusionOtro en su lugar.
  const INSTRUMENTOS_PERCUSION_FIJOS = ['Congas','Bongó','Campana','Timbal','Güiro','Maracas','Clave','Kick/Drum','Todos/Tutti'];
  // v1.79: (a pedido) guia-practica.html v1.78 cambió el select de
  // instrumento (valor único) a checkboxes de selección múltiple —
  // s.instrumentoPercusion ahora es un array de strings (varios
  // instrumentos por sección, ej. Conga+Bongó+Güiro). Esta función
  // soporta AMBOS formatos a propósito, sin depender de que el editor
  // ya haya "migrado" el dato: si el PDF se genera sobre una sección
  // vieja que nunca se volvió a abrir en el editor (sigue con el string
  // suelto de antes de v1.78), igual se muestra bien. Varios
  // instrumentos se listan juntos separados por coma, en una sola
  // línea — mismo criterio de "lo primero que ve el percusionista" que
  // ya se usa para "se repite xN".
  const textoInstrumentoPercusion = (s) => {
    const lista = Array.isArray(s.instrumentoPercusion) ? s.instrumentoPercusion : (s.instrumentoPercusion ? [s.instrumentoPercusion] : []);
    const nombres = lista.map(v => {
      if(INSTRUMENTOS_PERCUSION_FIJOS.includes(v)) return v;
      if(v === '__otro__' || v) return (s.instrumentoPercusionOtro || '').trim();
      return '';
    }).filter(Boolean);
    // Object.fromEntries + Object.keys evita duplicar "Otro" si por
    // algún motivo quedaran 2 marcas de __otro__/valor-libre juntas.
    return Array.from(new Set(nombres)).join(', ');
  };

  // v1.81: (a pedido) contador global de compás + resumen "c.#X-c.#Y" en
  // la barra de título — mismo criterio/cálculo que ya usa
  // generarEstructuraPDF (v1.45/v1.70), duplicado acá porque son
  // variables locales allá. compasGlobal arranca en 1 y avanza sumando
  // s.duracion de cada sección en orden; si una sección no tiene fin de
  // tiempo definido (duracion null), el conteo deja de ser confiable de
  // ahí en adelante (contadorGlobalValido=false) y las siguientes no
  // muestran resumen hasta que se complete esa sección y se reexporte.
  let compasGlobal = 1;
  let contadorGlobalValido = true;

  // v1.83: (a pedido) Coda/D.C./D.S. heredado de generarEstructuraPDF —
  // nombresYaImpresos trackea qué secciones ya se dibujaron completas
  // (por id o nombre) para saber si una repetición posterior puede
  // imprimirse como referencia corta en vez de repetir todo el cuadro.
  const nombresYaImpresos = new Set();
  // Ícono círculo+cruz de coda, duplicado tal cual de generarEstructuraPDF
  // (dibujarIconoCoda) porque esta función vive aparte y no puede
  // llamarla directamente — mismo criterio que el resto de los helpers
  // ya duplicados acá (ver comentario de cabecera del archivo).
  const dibujarIconoCoda = (x, yBase, colorRGB) => {
    const [r,g,b] = colorRGB || [120,120,120];
    doc.setDrawColor(r, g, b); doc.setLineWidth(0.3);
    doc.circle(x + 1.6, yBase - 1.6, 1.6, 'S');
    doc.line(x + 1.6, yBase - 3.4, x + 1.6, yBase + 0.2);
    doc.line(x - 0.2, yBase - 1.6, x + 3.4, yBase - 1.6);
    return 4.4;
  };

  // v1.84: (a pedido) patrón rítmico de Break/Corte, heredado tal cual de
  // generarEstructuraPDF (dibujarIconoAcentoBreak, parsearPatronRitmico,
  // aplanarColumnasPatron, pesoTotalPatron, calcularColsYXInfo,
  // dibujarPatronRitmico — líneas ~1352-1667 de esa función). Duplicado
  // acá completo, sin cambiar una sola línea de la lógica de dibujo, por
  // el mismo motivo que dibujarIconoCoda arriba: son funciones locales de
  // generarEstructuraPDF, esta función no puede llamarlas directamente.
  const dibujarIconoAcentoBreak = (x, yBase) => {
    doc.setDrawColor(20, 20, 20); doc.setLineWidth(0.5);
    doc.line(x, yBase - 2.2, x + 1.7, yBase - 1.1);
    doc.line(x + 1.7, yBase - 1.1, x, yBase - 0.0);
    return 2.6;
  };
  const parsearPatronRitmico = (patron) => {
    const str = (patron || '').replace(/\s+/g, '');
    const items = [];
    let i = 0;
    while(i < str.length){
      const c = str[i];
      if(c === '{'){
        const fin = str.indexOf('}', i + 1);
        const cerrado = fin !== -1;
        const inner = cerrado ? str.slice(i + 1, fin) : str.slice(i + 1);
        const valores = inner.split('').filter(ch => ch === 'x' || ch === 'X' || ch === '.' || ch === '-');
        const n = valores.length;
        const numero = (n === 3) ? 3 : (n === 6 ? 6 : null);
        items.push({ tipo: 'grupo', valores, numero, valido: cerrado && numero !== null });
        i = cerrado ? fin + 1 : str.length;
      } else if(c === 'x' || c === 'X' || c === '.' || c === '-'){
        items.push({ tipo: 'simple', valor: c });
        i++;
      } else {
        i++;
      }
    }
    return items;
  };
  const aplanarColumnasPatron = (items) => {
    const cols = [];
    items.forEach(it => {
      if(it.tipo === 'simple'){
        cols.push({ caracter: it.valor, peso: 1, grupo: null });
      } else {
        const pesoCada = it.valido ? (2 / it.valores.length) : 1;
        it.valores.forEach((v, idx) => {
          cols.push({ caracter: v, peso: pesoCada, grupo: it.valido ? { numero: it.numero, idx, size: it.valores.length } : null });
        });
      }
    });
    return cols;
  };
  const pesoTotalPatron = (items) => {
    let total = 0;
    items.forEach(it => { total += (it.tipo === 'simple') ? 1 : (it.valido ? 2 : it.valores.length); });
    return total;
  };
  const calcularColsYXInfo = (patron, xStart, ancho) => {
    const items = parsearPatronRitmico(patron);
    if(!items.length) return { cols: [], xInfo: [] };
    const cols = aplanarColumnasPatron(items);
    const pesoTotal = pesoTotalPatron(items);
    let acumPeso = 0;
    const xInfo = cols.map(col => {
      const x0 = xStart + (acumPeso / pesoTotal) * ancho;
      const w = (col.peso / pesoTotal) * ancho;
      acumPeso += col.peso;
      return { xCentro: x0 + w / 2, x0, x1: x0 + w };
    });
    return { cols, xInfo };
  };
  const dibujarPatronRitmico = (patron, xStart, ancho, yBase, compases) => {
    const { cols, xInfo } = calcularColsYXInfo(patron, xStart, ancho);
    if(!cols.length) return 0;
    const n = cols.length;
    const altoPlica = 6;
    const esNota = (t) => t === 'x' || t === 'X' || t === '-';
    const esBeamable = (t) => t === 'x' || t === 'X';
    doc.setDrawColor(20); doc.setLineWidth(0.25);
    doc.line(xStart, yBase, xStart + ancho, yBase);
    const totalCompases = Math.max(1, compases || 1);
    doc.setDrawColor(20); doc.setLineWidth(0.3);
    doc.line(xStart, yBase - altoPlica, xStart, yBase);
    doc.line(xStart + ancho, yBase - altoPlica, xStart + ancho, yBase);
    if(totalCompases >= 2){
      for(let c = 1; c < totalCompases; c++){
        const xDiv = xStart + (ancho / totalCompases) * c;
        doc.line(xDiv, yBase - altoPlica, xDiv, yBase);
      }
    }
    doc.setFillColor(20, 20, 20);
    const dibujarSilencio = (x) => {
      doc.setDrawColor(150, 150, 150); doc.setLineWidth(0.45);
      const yc = yBase + 2;
      doc.line(x - 1.1, yc - 1.6, x + 0.9, yc + 0.5);
      doc.line(x + 0.9, yc + 0.5, x - 0.3, yc + 1.8);
      doc.setDrawColor(20);
    };
    const dibujarLigado = (xDesde, xHasta) => {
      doc.setDrawColor(20); doc.setLineWidth(0.35);
      const yTie = yBase + 2;
      const profundidad = 1.7;
      const dx = xHasta - xDesde;
      doc.lines(
        [[dx / 3, (2 / 3) * profundidad, (dx * 2) / 3, (2 / 3) * profundidad, dx, 0]],
        xDesde, yTie, [1, 1], 'S', false
      );
    };
    for(let j = 0; j < n; j++){
      const col = cols[j];
      if(col.caracter === '.') dibujarSilencio(xInfo[j].xCentro);
      else if(col.caracter === '-' && j > 0) dibujarLigado(xInfo[j - 1].xCentro, xInfo[j].xCentro);
    }
    for(let j = 0; j < n; j++){
      const col = cols[j];
      if(!esNota(col.caracter)) continue;
      const xj = xInfo[j].xCentro;
      const r = col.grupo ? 0.55 : 0.9;
      const xPlica = xj + r;
      doc.circle(xj, yBase, r, 'F');
      doc.setLineWidth(0.28);
      doc.line(xPlica, yBase, xPlica, yBase - altoPlica);
      if(col.caracter === 'X'){
        const ax = xPlica - 0.32, ay = yBase - altoPlica - 1.4;
        doc.setDrawColor(20, 20, 20); doc.setLineWidth(0.34);
        doc.line(ax, ay - 0.83, ax + 0.64, ay - 0.42);
        doc.line(ax + 0.64, ay - 0.42, ax, ay - 0.0);
      }
    }
    let j = 0;
    while(j < n){
      const col = cols[j];
      if(col.grupo){
        const size = col.grupo.size;
        let jFin = j;
        while(jFin < n && cols[jFin].grupo && cols[jFin].grupo.idx < size) jFin++;
        const idxGolpes = [];
        for(let k = j; k < jFin; k++) if(esBeamable(cols[k].caracter)) idxGolpes.push(k);
        if(idxGolpes.length >= 2){
          const rIni = cols[idxGolpes[0]].grupo ? 0.55 : 0.9;
          const rFin = cols[idxGolpes[idxGolpes.length - 1]].grupo ? 0.55 : 0.9;
          const xIni = xInfo[idxGolpes[0]].xCentro + rIni;
          const xFin = xInfo[idxGolpes[idxGolpes.length - 1]].xCentro + rFin;
          doc.setLineWidth(0.75);
          doc.line(xIni, yBase - altoPlica, xFin, yBase - altoPlica);
          if(size === 6){
            doc.line(xIni, yBase - altoPlica + 1.3, xFin, yBase - altoPlica + 1.3);
          }
          const xMedio = (xIni + xFin) / 2;
          doc.setFontSize(5);
          doc.setTextColor(20);
          doc.text(String(col.grupo.numero), xMedio, yBase - altoPlica - 2.3, { align: 'center' });
        } else if(idxGolpes.length === 1){
          const r = cols[idxGolpes[0]].grupo ? 0.55 : 0.9;
          const xa = xInfo[idxGolpes[0]].xCentro + r;
          const yTop = yBase - altoPlica;
          doc.setFillColor(20, 20, 20);
          doc.lines(
            [
              [1.6, 0.3, 1.75, 1.35, 0.4, 2.45],
              [0.7, -1.15, 0.45, -1.85, -0.4, -2.45]
            ],
            xa, yTop, [1, 1], 'F', true
          );
          doc.setFontSize(5);
          doc.setTextColor(20);
          doc.text(String(col.grupo.numero), xa, yBase - altoPlica - 2.3, { align: 'center' });
        }
        j = jFin;
      } else if(col.caracter === '-'){
        const xa = xInfo[j].xCentro + 0.9;
        const yTop = yBase - altoPlica;
        doc.setFillColor(20, 20, 20);
        doc.lines(
          [
            [1.6, 0.3, 1.75, 1.35, 0.4, 2.45],
            [0.7, -1.15, 0.45, -1.85, -0.4, -2.45]
          ],
          xa, yTop, [1, 1], 'F', true
        );
        j += 1;
      } else if(esBeamable(col.caracter)){
        const nextCol = (j + 1 < n && !cols[j + 1].grupo) ? cols[j + 1] : null;
        const xa = xInfo[j].xCentro + 0.9;
        if(nextCol && esBeamable(nextCol.caracter)){
          const xb = xInfo[j + 1].xCentro + 0.9;
          doc.setLineWidth(0.75);
          doc.line(xa, yBase - altoPlica, xb, yBase - altoPlica);
          j += 2;
        } else {
          const yTop = yBase - altoPlica;
          doc.setFillColor(20, 20, 20);
          doc.lines(
            [
              [1.6, 0.3, 1.75, 1.35, 0.4, 2.45],
              [0.7, -1.15, 0.45, -1.85, -0.4, -2.45]
            ],
            xa, yTop, [1, 1], 'F', true
          );
          j += 1;
        }
      } else {
        j += 1;
      }
    }
    doc.setTextColor(20);
    return altoPlica + 7;
  };

  secciones.forEach((s, idxSeccion) => {
    const compasGlobalInicio = contadorGlobalValido ? compasGlobal : null;
    const esCoda = s.origenId && !s.esVariacion && s.modoRepeticionPDF === 'coda' && nombresYaImpresos.has(s.origenId);
    // v1.90 (FIX): declarada ACÁ, al ppio. del forEach de cada sección —
    // no adentro del bloque que dibuja la grilla — porque el avance final
    // de la sección (más abajo, y += ... ultimaHayNotasPercusion ...)
    // vive FUERA de ese bloque. Declarada adentro quedaba fuera de scope
    // ahí y tiraba "ultimaHayNotasPercusion is not defined", rompiendo el
    // botón completo (todo el script deja de ejecutar si una función
    // tira una excepción sin capturar).
    let ultimaHayNotasPercusion = false;
    asegurarEspacio(calcularAltoSeccionPercusion(s));
    const color = s.color;
    const rgb = [parseInt(color.slice(1,3),16), parseInt(color.slice(3,5),16), parseInt(color.slice(5,7),16)];
    doc.setFillColor(rgb[0], rgb[1], rgb[2]);
    doc.rect(margen, y, anchoUtil, 7, 'F');
    // v1.78: (a pedido) si la sección está marcada "🔔 Sección de
    // campana" (s.esCampana, guia-practica.html v1.77), se agrega un
    // marco dorado alrededor de la barra de título para que salte a la
    // vista sin tener que leer el texto. Puramente visual — no cambia
    // ningún cálculo de alto/ancho, se dibuja encima del rect ya pintado.
    if(s.esCampana){
      doc.setDrawColor(200, 160, 40); doc.setLineWidth(0.6);
      doc.rect(margen, y, anchoUtil, 7);
    }
    doc.setTextColor(255); doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    const letraEns = (s.letraEnsayo || '').trim().slice(0, 2).toUpperCase();
    let xTexto = margen + 2;
    if(letraEns){
      const anchoCaja = letraEns.length > 1 ? 7 : 5;
      doc.setDrawColor(255); doc.setLineWidth(0.3);
      doc.rect(margen + 2, y + 1, anchoCaja, 5);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      doc.text(letraEns, margen + 2 + anchoCaja / 2, y + 5, { align: 'center' });
      xTexto = margen + 4 + anchoCaja;
      doc.setFontSize(10);
    }
    const duracionTxt = (s.duracion != null && s.duracion > 0) ? ' · ' + s.duracion + ' comp.' : '';
    // v1.83: (a pedido) misma etiqueta D.C./D.S. que ya usa
    // generarEstructuraPDF (línea ~1970-1974) — texto "(D.C.)" simple,
    // "(D.C. — variación: ...)" si esVariacion, o nada si esCoda (ese caso
    // usa el ícono + "D.S. al Coda" en vez de texto entre paréntesis).
    const etiquetaDC = s.origenId
      ? (s.esVariacion
          ? ` (D.C. — variación${(s.notaVariacion || '').trim() ? ': ' + s.notaVariacion.trim() : ''})`
          : (esCoda ? '' : ' (D.C.)'))
      : '';
    doc.text(s.nombre + etiquetaDC + duracionTxt, xTexto, y + 5);
    let xLibre = xTexto + doc.getTextWidth(s.nombre + etiquetaDC + duracionTxt) + 3;
    if(esCoda){
      const xIcono = xLibre;
      dibujarIconoCoda(xIcono, y + 5.5, [255, 255, 255]);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      doc.text('D.S. al Coda', xIcono + 5.5, y + 5);
      xLibre = xIcono + 5.5 + doc.getTextWidth('D.S. al Coda') + 3;
      doc.setFontSize(10);
    }
    // v1.78: (a pedido) badge "CAMPANA" en texto (nada de emoji — mismo
    // criterio que dibujarIconoRepeticion/dibujarIconoCoda, jsPDF+
    // helvetica no rinde bien unicode de campana) pegado después del
    // nombre, mismo dorado que el marco de arriba.
    if(s.esCampana){
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
      doc.setTextColor(255, 240, 200);
      doc.text('CAMPANA', xLibre, y + 5);
      xLibre += doc.getTextWidth('CAMPANA') + 3;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.setTextColor(255);
    }
    // v1.83: (a pedido) compás override (s.compasOverride, ej. "· 3/4")
    // heredado de generarEstructuraPDF (línea ~2015) — se calcula el
    // texto/ancho ACÁ (antes de dibujarlo) para poder reservarle su
    // espacio a la nota de sección, igual que en acordes. Dibujo real más
    // abajo, a la izquierda de instrumento+resumen.
    const compasTxt = (s.compasOverride || '').trim() ? '· ' + s.compasOverride.trim() : '';
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    const anchoCompas = compasTxt ? doc.getTextWidth(compasTxt) + 4 : 0;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    // Nota de sección inline (mismo criterio de "auto-ajuste + recorte"
    // que generarEstructuraPDF, versión resumida).
    if((s.notaSeccion || '').trim()){
      const nota = s.notaSeccion.trim();
      const anchoDisponible = (margen + anchoUtil - anchoCompas - 2) - xLibre;
      if(anchoDisponible > 8){
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.8 }));
        doc.setFont('helvetica', 'italic');
        let fontNota = 8;
        doc.setFontSize(fontNota);
        while(doc.getTextWidth(nota) > anchoDisponible && fontNota > 6){
          fontNota -= 0.5;
          doc.setFontSize(fontNota);
        }
        let notaMostrar = nota;
        if(doc.getTextWidth(notaMostrar) > anchoDisponible){
          while(notaMostrar.length > 1 && doc.getTextWidth(notaMostrar + '…') > anchoDisponible){
            notaMostrar = notaMostrar.slice(0, -1);
          }
          notaMostrar += '…';
        }
        doc.text(notaMostrar, xLibre, y + 5);
        doc.restoreGraphicsState();
      }
    }
    if(compasTxt){
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(255);
      doc.text(compasTxt, margen + anchoUtil - 2, y + 5, { align: 'right' });
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    }
    // v1.78: instrumento de la sección (s.instrumentoPercusion/
    // instrumentoPercusionOtro, guia-practica.html v1.77) — alineado a la
    // derecha de la barra de título.
    const instrumentoTxt = textoInstrumentoPercusion(s);
    let anchoInstrumentoTxt = 0;
    if(instrumentoTxt){
      doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
      doc.setTextColor(255);
      doc.text(instrumentoTxt, margen + anchoUtil - 2 - anchoCompas, y + 5, { align: 'right' });
      anchoInstrumentoTxt = doc.getTextWidth(instrumentoTxt) + 4;
    }
    // v1.81: (a pedido) resumen "c.#X-c.#Y" — mismo dato/estilo que ya
    // usa generarEstructuraPDF (v1.70: blanco, itálica, opacidad
    // reducida), corrido a la izquierda del texto de instrumento para no
    // pisarlo si ambos están presentes.
    if(compasGlobalInicio != null && s.duracion != null && s.duracion > 0){
      const finResumen = compasGlobalInicio + s.duracion - 1;
      const resumenTxt = 'c.#' + compasGlobalInicio + (finResumen !== compasGlobalInicio ? '-c.#' + finResumen : '');
      doc.saveGraphicsState();
      doc.setGState(new doc.GState({ opacity: 0.75 }));
      doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(255);
      doc.text(resumenTxt, margen + anchoUtil - 2 - anchoCompas - anchoInstrumentoTxt, y + 5, { align: 'right' });
      doc.restoreGraphicsState();
      doc.setFont('helvetica', 'normal'); doc.setTextColor(255);
    }
    y += 7 + 3;
    doc.setTextColor(20);
    nombresYaImpresos.add(s.id || s.nombre);

    // v1.83: modo coda — no re-dibuja el cuadro completo, solo remite a
    // la primera aparición (mismo criterio y texto que generarEstructuraPDF
    // línea ~2087). El contador global de compás sigue avanzando igual al
    // final del forEach (ya estaba así antes de este cambio), así que las
    // secciones siguientes no se desfasan.
    // v1.89: (a pedido) FIX — margen excesivo después de "se repite...".
    // Este flag trackea si lo ÚLTIMO dibujado en la sección fue una línea
    // de texto (con su propio aire ya incluido) en vez de una fila de
    // cajas — al final del forEach se usa para no sumarle ENCIMA otro
    // "cajaAlto+4" completo (pensado para dejar aire debajo de una FILA
    // de cajas, no de una línea de texto). Default false = comportamiento
    // de siempre (último elemento fue una grilla).
    let ultimoElementoEsTexto = false;
    if(esCoda){
      doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
      doc.text('Ver primera aparición arriba.', margen, y);
      y += 6; doc.setTextColor(20);
    } else {
    const esBreak = s.nombre === 'Break/Corte';
    if(esBreak){
      // v1.84: (a pedido) Break/Corte dibuja el patrón rítmico
      // (dibujarPatronRitmico) en vez de la grilla genérica — mismo
      // criterio que dibujarCajaBreak en generarEstructuraPDF, versión
      // sin acordes (esta guía no los muestra): nota de tiempo
      // (notaTiempoCorte) arriba si está cargada, patrón debajo.
      const totalCajasBreak = totalCajasSeccionPercusion(s);
      const notaTxt = (s.notaTiempoCorte || '').trim();
      if(notaTxt){
        doc.setFont('helvetica', 'italic'); doc.setFontSize(7); doc.setTextColor(120);
        doc.text('(' + notaTxt + ')', margen, y);
        doc.setTextColor(20);
      }
      y += 6;
      if((s.patronRitmico || '').trim()){
        y += 4;
        dibujarPatronRitmico(s.patronRitmico, margen, anchoUtil, y, totalCajasBreak);
        y += 6;
      }
    } else {

    // v1.76: helper local — mismo dibujo de caja que antes (grilla +
    // nota de percusión + regla de acento), ahora reutilizable para el
    // pase normal, el ciclo de Vamp y el bloque de 2da vez. No dibuja el
    // +4 de cierre de bloque — eso lo maneja el llamador entre bloques y
    // al final de la sección.
    // v1.88: (a pedido) numInicio (1-based) se reemplaza por colInicio/
    // labelInicio (0-based, mismo patrón que dibujarCajas de acordes,
    // línea ~1175) + opciones — necesario para la 2da vez horizontal:
    //  - colInicio: columna real donde arranca a dibujarse (posición en
    //    la grilla). Antes siempre arrancaba en columna 0.
    //  - labelInicio: número real de compás - 1 de la primera caja (para
    //    que "c.N" muestre el compás real que reemplaza, sea cual sea la
    //    columna donde se dibuja). Por defecto = colInicio (mismo
    //    comportamiento que antes: numInicio = colInicio+1).
    //  - opciones.yBase: y de arranque del bloque (default: y corrido).
    //  - opciones.sinAvanzarY: si true, dibuja en yBase sin tocar el y
    //    corrido (para la 2da vez horizontal, que va en la MISMA fila que
    //    la 1ra vez, ya dibujada).
    //  - opciones.compasGlobalInicioOverride: para el "#N", usa este
    //    valor en vez de compasGlobalInicio (2da vez: compasGlobalInicio
    //    + (repeticiones-1)*totalCajas — mismo cálculo que acordes).
    // Los 2 llamados que ya existían (pase principal con numInicio=1,
    // 2da vez apilada con numInicio=totalCajas-finalN+1) quedan
    // idénticos visualmente: colInicio=0/labelInicio=0 y
    // colInicio=0/labelInicio=totalCajas-finalN respectivamente.
    // v1.90: guarda si la última grilla dibujada (no forzada, es decir la
    // que sí avanza `y`) reservó tira de notas — para que el espaciado
    // que viene después (barra de repetición, lista de vueltas del Vamp,
    // texto "se repite...", avance final de la sección) sepa si tiene que
    // sumar notaFilaAlto o no. La actualiza dibujarCajasPercusion cada vez
    // que dibuja sin sinAvanzarY (declarada arriba, al ppio. del forEach).
    const dibujarCajasPercusion = (notas, acentos, total, colInicio, labelInicio, opciones) => {
      opciones = opciones || {};
      colInicio = colInicio || 0;
      labelInicio = labelInicio != null ? labelInicio : colInicio;
      const yBase = opciones.yBase != null ? opciones.yBase : y;
      const compasBase = opciones.compasGlobalInicioOverride != null ? opciones.compasGlobalInicioOverride : compasGlobalInicio;
      // v1.92: (a pedido) 2 fuentes de nota por compás en simultáneo:
      //  - `notas` (percusión: notasPercusionPorCompas/Ciclo/Final2) vuelve
      //    a vivir ADENTRO de la caja, negro/negrita — es la info principal
      //    para el percusionista ("repique de bongó", "solo kick").
      //  - `opciones.notasArmonia` (la misma notasPorCompas/notasCiclo/
      //    notasFinal2 que ya se ve en el PDF de acordes) pasa a su propia
      //    tira ARRIBA de la caja, itálica/naranja — contexto general del
      //    tema, igual estilo que dibujarCajas en generarEstructuraPDF.
      // hayNotas (si se reserva la tira de arriba) se decide por
      // notasArmonia, no por `notas` — la de percusión ya no necesita
      // alto extra porque va adentro. opciones.hayNotasForzado sigue
      // permitiendo heredar el valor del bloque principal para la 2da vez
      // horizontal (mismo patrón que hayNotasForzado en dibujarCajas).
      const notasArmonia = opciones.notasArmonia || [];
      const hayNotas = opciones.hayNotasForzado != null ? opciones.hayNotasForzado : hayContenido(notasArmonia);
      let filaAnterior = -1;
      let yLocal = yBase;
      for(let j = 0; j < total; j++){
        const posGlobal = j + colInicio;
        const posLabel = j + labelInicio;
        const fila = Math.floor(posGlobal / POR_FILA);
        const col = posGlobal % POR_FILA;
        if(fila !== filaAnterior){
          if(filaAnterior !== -1) yLocal += cajaAlto + (hayNotas ? notaFilaAlto : 0) + 2;
          filaAnterior = fila;
        }
        const x = margen + col * cajaAncho;
        const yCaja = yLocal + (hayNotas ? notaFilaAlto : 0);
        if(!opciones.sinAvanzarY){ y = yLocal; ultimaHayNotasPercusion = hayNotas; }
        if(hayNotas){
          const notaArmoniaTxt = (notasArmonia[j] || '').trim();
          if(notaArmoniaTxt){
            doc.setFont('helvetica', 'italic'); doc.setFontSize(6.5); doc.setTextColor(180, 120, 40);
            const notaCorta = notaArmoniaTxt.length > 22 ? notaArmoniaTxt.slice(0, 21) + '…' : notaArmoniaTxt;
            doc.text(notaCorta, x + cajaAncho / 2, yLocal + notaFilaAlto - 1.3, { align: 'center' });
            doc.setTextColor(20);
          }
        }
        doc.setDrawColor(200); doc.setLineWidth(0.2);
        doc.rect(x, yCaja, cajaAncho, cajaAlto);
        // v1.77: (a pedido) "c.N" pasa de 7pt gris150 (casi invisible en
        // la hoja impresa) a 9pt negrita gris70 — es el dato básico que
        // el percusionista necesita ver aunque la caja esté vacía.
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
        doc.setTextColor(70);
        doc.text('c.' + (posLabel + 1), x + 2, yCaja + 5);
        // v1.82: (a pedido) mismo contador global "#N" que ya usa
        // generarEstructuraPDF (línea ~1182) — misma fórmula relativa
        // (compasBase + posLabel, mismo criterio que "opciones.
        // compasGlobalInicio + posLabel" de dibujarCajas) y mismo estilo
        // discreto (6pt, gris170).
        if(compasBase != null){
          doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(170);
          doc.text('#' + (compasBase + posLabel), x + cajaAncho - 1.5, yCaja + 4, { align: 'right' });
          doc.setTextColor(20);
        }
        // v1.92: nota de PERCUSIÓN — vuelve adentro de la caja (info
        // principal), negro/negrita, mismo estilo/límite que tenía antes
        // de v1.90 (26 caracteres, 7.5pt).
        const notaPercusionTxt = (notas[j] || '').trim();
        if(notaPercusionTxt){
          doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
          doc.setTextColor(20);
          const notaPercusionCorta = notaPercusionTxt.length > 26 ? notaPercusionTxt.slice(0, 25) + '…' : notaPercusionTxt;
          doc.text(notaPercusionCorta, x + cajaAncho / 2, yCaja + 8, { align: 'center', maxWidth: cajaAncho - 4 });
        }

        const tVal = acentos[j] || '';
        const idxTiempo = TIEMPOS_PERCUSION.indexOf(tVal);
        if(idxTiempo !== -1){
          const reglaAncho = cajaAncho * 0.8;
          const reglaX0 = x + (cajaAncho - reglaAncho) / 2;
          const pasoTiempo = reglaAncho / (TIEMPOS_PERCUSION.length - 1);
          const reglaY = yCaja + cajaAlto - 2;
          doc.setDrawColor(160);
          TIEMPOS_PERCUSION.forEach((t, ti) => {
            const tx = reglaX0 + ti * pasoTiempo;
            const esFuerte = ti % 4 === 0; // tiempos 1-2-3-4 vs. e/&/a
            doc.setLineWidth(esFuerte ? 0.35 : 0.2);
            doc.line(tx, reglaY, tx, reglaY - (esFuerte ? 1.4 : 0.7));
          });
          doc.setLineWidth(0.2);
          doc.setFillColor(20, 20, 20);
          doc.circle(reglaX0 + idxTiempo * pasoTiempo, reglaY - 1.8, 0.6, 'F');
        }
      }
    };

    const esVamp = s.tipo === 'vamp';
    const esBreak = s.nombre === 'Break/Corte';
    const totalCajas = totalCajasSeccionPercusion(s);
    // v1.88: (a pedido) datos de la 2da vez calculados ACÁ arriba (mismo
    // criterio que generarEstructuraPDF v1.42/v1.43: alineable/
    // cabeHorizontal se necesitan ANTES de dibujar la grilla principal,
    // para reservar aire si va a llevar corchete "1." encima).
    const repeticionesPercusion = s.repeticiones || 1;
    const finalNPercusion = Math.min(totalCajas || 1, s.finalDistintoN || 1);
    const hay2da = hay2daSeccionPercusion(s, totalCajas);
    const alineablePercusion = !esVamp && totalCajas <= POR_FILA;
    const colLibreDesdePercusion = totalCajas % POR_FILA;
    const libresPercusion = colLibreDesdePercusion === 0 ? 0 : POR_FILA - colLibreDesdePercusion;
    const cabeHorizontalPercusion = alineablePercusion && libresPercusion >= finalNPercusion;
    const colReemplazoPercusion = alineablePercusion ? (totalCajas - finalNPercusion) : 0;
    const xReemplazoPercusion = margen + colReemplazoPercusion * cajaAncho;
    const anchoReemplazoPercusion = finalNPercusion * cajaAncho;

    // v1.88: mismo aire reservado que generarEstructuraPDF (v1.42/v1.44)
    // arriba del bloque cuando la 2da vez va a llevar corchete "1."
    // encima de la 1ra vez — sin esto, el corchete pisa la franja de
    // color del título de la sección.
    if(alineablePercusion && hay2da) y += 5;

    if(esVamp && totalCajas <= 0){
      doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
      doc.text('Definí el ciclo de compases arriba para ver las cajas acá.', margen, y);
      doc.setTextColor(20);
    } else {
      const notas = esVamp
        ? (Array.isArray(s.notasPercusionCiclo) ? s.notasPercusionCiclo : [])
        : (Array.isArray(s.notasPercusionPorCompas) ? s.notasPercusionPorCompas : []);
      const acentos = esVamp
        ? (Array.isArray(s.acentosCiclo) ? s.acentosCiclo : [])
        : (Array.isArray(s.acentosPorCompas) ? s.acentosPorCompas : []);
      // v1.92: (a pedido) nota de ARMONÍA (la misma que ya se ve en el PDF
      // de acordes) para la tira de arriba — en simultáneo con la nota de
      // percusión (adentro de la caja, ver dibujarCajasPercusion).
      const notasArmonia = esVamp
        ? (Array.isArray(s.notasCiclo) ? s.notasCiclo : [])
        : (Array.isArray(s.notasPorCompas) ? s.notasPorCompas : []);
      const yGridVamp = y;
      dibujarCajasPercusion(notas, acentos, totalCajas, 0, 0, { notasArmonia });
      // v1.85: (a pedido) lista de "próximas repeticiones" en Vamp
      // (#N chico bajo cada caja del ciclo), heredada de
      // generarEstructuraPDF (línea ~2130-2152) — mismo cálculo
      // (compasGlobalInicio + columna + k*ciclo), máximo 3 líneas visibles
      // por columna, mismo estilo (6pt gris170). Se dibuja bajo la
      // PRIMERA fila del ciclo (yGridVamp + cajaAlto), mismo límite de
      // columnas visibles (min(ciclo,POR_FILA)) que acordes.
      if(esVamp && compasGlobalInicio != null){
        const vueltasVampLista = Math.max(0, Math.floor((s.duracion || totalCajas) / totalCajas) - 1);
        if(vueltasVampLista > 0){
          const maxLineasVamp = 3;
          // v1.87: (a pedido, FIX) la lista va DENTRO de la caja, pegada
          // justo abajo del label "#N" (mismo criterio que acordes v1.55:
          // "pegada JUSTO abajo del label, misma esquina sup. derecha,
          // ADENTRO") — antes (v1.85) quedaba afuera, debajo del borde de
          // la caja, descolgada en el margen. El label "#N" de cada caja
          // se dibuja en yCaja+4 (dibujarCajasPercusion, fila 0 ==
          // yGridVamp acá); +6.5 dnos deja pegado justo debajo.
          // v1.90: +notaFilaAlto si la grilla reservó tira de notas (el
          // label "#N" de la caja se corrió hacia abajo esa misma medida).
          const yBaseVamp = yGridVamp + (ultimaHayNotasPercusion ? notaFilaAlto : 0) + 6.5;
          doc.setFont('helvetica', 'normal'); doc.setFontSize(6); doc.setTextColor(170);
          for(let col = 0; col < Math.min(totalCajas, POR_FILA); col++){
            const xListaVamp = margen + cajaAncho * col + cajaAncho - 1.5;
            let yListaVamp = yBaseVamp;
            for(let k = 1; k <= Math.min(vueltasVampLista, maxLineasVamp); k++){
              doc.text('#' + (compasGlobalInicio + col + k * totalCajas), xListaVamp, yListaVamp, { align: 'right' });
              yListaVamp += 2.6;
            }
          }
          doc.setTextColor(20);
        }
      }
      // v1.86: (a pedido) marco completo (izq.+der.) SOLO en fija-bloque
      // con repeticiones>1 — mismo criterio que dibujarBarraRepeticion en
      // generarEstructuraPDF, que tampoco lo dibuja para Vamp. Se dibuja
      // pegado a la fila principal (yGridVamp), antes del bloque de 2da
      // vez (que no lleva marco propio, igual que en acordes).
      // v1.89: (a pedido, FIX) el trazo derecho del marco quedaba en el
      // borde de la 1ra vez y por eso pisaba/se solapaba con la caja de
      // la 2da vez horizontal recién agregada (v1.88) — mismo FIX que ya
      // tiene generarEstructuraPDF para esto (v1.48: anchoBarraDerecha se
      // extiende cabeHorizontal&&hay2da para que el trazo cierre DESPUÉS
      // de la caja de la 2da vez, no en el borde de la 1ra).
      if(mostrarRepeticionPercusion(s, totalCajas) && !esVamp){
        const anchoMarcoPercusion = (cabeHorizontalPercusion && hay2da)
          ? anchoUltimaFilaPercusion(totalCajas) + finalNPercusion * cajaAncho
          : anchoUltimaFilaPercusion(totalCajas);
        // v1.90: el marco arranca DESPUÉS de la tira de notas (si hay),
        // mismo criterio que dibujarBarraRepeticion en generarEstructuraPDF
        // (yBloque + offsetNotaPrimeraFila) — así no envuelve el texto
        // naranja de la nota, solo la caja.
        dibujarBarraRepeticionPercusion(yGridVamp + (ultimaHayNotasPercusion ? notaFilaAlto : 0), cajaAlto, anchoMarcoPercusion);
      }

      // v1.88: (a pedido) "se repite xN..." pasa a dibujarse DESPUÉS de
      // la grilla (debajo), mismo orden que generarEstructuraPDF — antes
      // se dibujaba arriba, antes de las cajas.
      if(mostrarRepeticionPercusion(s, totalCajas)){
        // v1.90: +notaFilaAlto si la última fila dibujada reservó tira de
        // notas, para no pisar ese texto con "se repite...".
        y += cajaAlto + (ultimaHayNotasPercusion ? notaFilaAlto : 0) + 4;
        const anchoIconoRep = dibujarIconoRepeticionPercusion(margen, y);
        doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(120);
        if(esVamp){
          const vueltasVamp = Math.max(0, Math.floor((s.duracion || totalCajas) / totalCajas) - 1);
          doc.text('se repite x' + (vueltasVamp + 1) + ' (ciclo de ' + totalCajas + ' comp.)', margen + anchoIconoRep + 1, y);
        } else {
          doc.text('se repite x' + repeticionesPercusion + ' (' + (s.duracion || 1) + ' comp. reales)', margen + anchoIconoRep + 1, y);
        }
        doc.setTextColor(20);
        y += 5;
        ultimoElementoEsTexto = true;
      }

      // v1.88: (a pedido) corchete "1." arriba de la 1ra vez — mismo
      // criterio que generarEstructuraPDF (dibujarCorcheteCasilla,
      // línea ~2371): se dibuja siempre que alineable && hay2da, sea la
      // 2da vez horizontal o apilada.
      if(alineablePercusion && hay2da){
        dibujarCorcheteCasillaPercusion(yGridVamp, 1, xReemplazoPercusion, anchoReemplazoPercusion);
      }

      // v1.76/v1.88: 2da vez — mismo criterio que generarEstructuraPDF
      // (solo aplica a fija-bloque con repeticiones>1, no a Vamp ni
      // Break/Corte). v1.88 agrega el modo HORIZONTAL (pegada a la
      // derecha de la 1ra vez, en la misma fila, con corchetes "1."/"2."
      // — mismo criterio "cabeHorizontal" que generarEstructuraPDF,
      // línea ~2227/2373) además del FIX del contador "#N" (antes
      // repetía el mismo número que la 1ra pasada).
      if(hay2da){
        const compasGlobalInicio2da = compasGlobalInicio != null
          ? compasGlobalInicio + (repeticionesPercusion - 1) * totalCajas
          : null;
        const notasF2 = Array.isArray(s.notasPercusionFinal2) ? s.notasPercusionFinal2 : [];
        const acentosF2 = Array.isArray(s.acentosFinal2) ? s.acentosFinal2 : [];
        // v1.92: nota de armonía de la 2da vez (misma que ya usa
        // generarEstructuraPDF para este bloque).
        const notasArmoniaF2 = Array.isArray(s.notasFinal2) ? s.notasFinal2 : [];
        if(cabeHorizontalPercusion){
          const xHorizontal = margen + totalCajas * cajaAncho;
          dibujarCorcheteCasillaPercusion(yGridVamp, 2, xHorizontal, anchoReemplazoPercusion);
          // v1.90: hayNotasForzado hereda el valor de la grilla principal
          // (ultimaHayNotasPercusion) — mismo motivo que hayNotasForzado en
          // dibujarCajas/generarEstructuraPDF: si la 2da vez horizontal no
          // tiene notas propias pero la 1ra sí, igual reserva la tira para
          // que ambas cajas queden alineadas en la misma fila.
          dibujarCajasPercusion(notasF2, acentosF2, finalNPercusion, totalCajas, colReemplazoPercusion, {
            yBase: yGridVamp,
            sinAvanzarY: true,
            hayNotasForzado: ultimaHayNotasPercusion,
            notasArmonia: notasArmoniaF2,
            compasGlobalInicioOverride: compasGlobalInicio2da
          });
        } else {
          y += 4;
          doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(120);
          doc.text('2da vez (últimos ' + finalNPercusion + ' comp.)', margen, y);
          doc.setTextColor(20);
          y += 4;
          if(alineablePercusion){
            dibujarCorcheteCasillaPercusion(y, 2, xReemplazoPercusion, anchoReemplazoPercusion);
          }
          dibujarCajasPercusion(notasF2, acentosF2, finalNPercusion, colReemplazoPercusion, colReemplazoPercusion, {
            notasArmonia: notasArmoniaF2,
            compasGlobalInicioOverride: compasGlobalInicio2da
          });
          ultimoElementoEsTexto = false;
        }
      }
    }
    } // cierre del if(esBreak) — v1.84
    } // cierre del else(esCoda) — v1.83
    // v1.81: avanza el contador global — mismo criterio que
    // generarEstructuraPDF (v1.45): si esta sección no tiene duración
    // definida, se apaga el contador para las secciones siguientes.
    if(s.duracion != null && s.duracion > 0) compasGlobal += s.duracion;
    else contadorGlobalValido = false;
    // v1.89: (a pedido, FIX) antes sumaba cajaAlto+4 siempre (pensado
    // para dejar aire debajo de la ÚLTIMA FILA de cajas) — con "se
    // repite..." ahora dibujándose debajo (v1.88), en las secciones que
    // terminan en esa línea de texto (que ya trae su propio y+=5) esto
    // sumaba un cajaAlto (14mm) de más antes de la siguiente sección.
    // Con el texto como último elemento, 4mm de aire alcanza (mismo
    // criterio que el resto del archivo para "aire después de una línea
    // de texto").
    // v1.90: +notaFilaAlto si la última grilla dibujada (principal o 2da
    // vez apilada) reservó tira de notas — mismo motivo que los demás
    // ajustes de este cambio: sin esto, la sección siguiente arrancaba
    // pisando la nota naranja de la última fila.
    y += ultimoElementoEsTexto ? 4 : cajaAlto + (ultimaHayNotasPercusion ? notaFilaAlto : 0) + 4;
  });

  const nombreArchivo = 'percusion-' + nombreTema.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.pdf';
  doc.setProperties({ title: nombreArchivo });
  const urlPreview = doc.output('bloburl');
  const ventana = window.open(urlPreview, '_blank');
  if(!ventana){
    doc.save(nombreArchivo);
  }
}

