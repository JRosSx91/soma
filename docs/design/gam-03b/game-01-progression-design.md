# GAM-03B-GAME-01 — Diseño de progresión incremental del Centro de Expedición

> **Propuesta anterior, no vigente.** ECON-01B, ECON-01C y ECON-01D sustituyen el balance de este documento: reservas, topes de ausencia y el ciclo de «Analizar». El registro vigente está en `economy-status.md`. Este archivo se conserva como historia y no autoriza implementación.

> Propuesta de diseño. No autoriza implementación, publicación científica, cambios de economía ni sustitución del Centro de Expedición actual.

## Estado y principios

El nuevo Centro de Expedición puede incorporar una campaña incremental finita que represente la construcción de un mapa de conocimiento. La actividad lúdica no mide aprendizaje real, salud, abstinencia, recuperación ni valor personal. Misiones, XP y Medallas permanecen como sistemas independientes.

Esta propuesta introduce una economía separada, en contradicción con el criterio todavía activo de `ROADMAP.md` según el cual GAM-03B no crea una segunda economía. La contradicción debe resolverse mediante una decisión de producto y una reconciliación documental independientes antes de implementar.

Principios obligatorios:

- Todo contenido científico publicado permanece consultable desde la biblioteca aunque el nodo del juego no esté descubierto.
- Descubrir un nodo es un estado lúdico, no una validación de conocimiento ni una afirmación científica.
- No hay rachas, castigos por ausencia, anuncios, compras, loot boxes, tablas competitivas ni reinicios de prestigio.
- La moneda del juego no se convierte en XP, medallas, niveles ni recompensas externas.
- La campaña tiene una escala comprensible y mejoras finitas; no utiliza cifras astronómicas ni crecimiento infinito.
- La interacción manual es un acelerador accesible, no una exigencia de pulsaciones rápidas.
- Las relaciones científicas, los prerrequisitos pedagógicos y las dependencias del juego se almacenan y representan como capas distintas.

## A. Concepto general

### Nombre de trabajo: Laboratorio de Curiosidad

La persona usuaria pone en marcha un pequeño laboratorio visual. Cada interacción reúne observaciones, mejora instrumentos y permite dedicar recursos a nuevos descubrimientos. Al desbloquear un nodo, el mapa se amplía y ofrece acceso directo a su ficha científica, pero la ficha también puede consultarse en cualquier momento desde la biblioteca.

La identidad propia de SOMA procede de tres decisiones:

1. La campaña representa cómo se construye una explicación científica desde conceptos básicos hasta sistemas complejos.
2. El juego nunca transforma estados de salud o recuperación en recursos.
3. Cada desbloqueo conduce a contenido educativo real y diferencia explícitamente la conexión científica de la dependencia lúdica.

No se reproduce la composición, nomenclatura, arte, interfaz ni economía de otros juegos incrementales. Se reutilizan únicamente convenciones generales del género: acción manual, producción gradual, compras finitas, automatización y progreso entre sesiones.

### Objetivo de campaña

Completar el primer «Cuaderno de Expedición»: 19 descubrimientos que recorren magnitudes eléctricas, membranas, bioelectricidad, neuronas y comunicación sináptica. Completarlo no reinicia el progreso ni abre una economía infinita. Las ampliaciones futuras añaden capítulos y sumideros acotados, no multiplicadores sin límite.

## B. Bucle principal

### Bucle corto

1. **Observar:** seleccionar el nodo de investigación activo y utilizar «Analizar» mediante clic, toque, teclado o pulsación mantenida.
2. **Reunir:** obtener Chispas de Curiosidad y recoger la producción acumulada por los instrumentos.
3. **Decidir:** invertir las Chispas en un descubrimiento, una mejora de instrumento o capacidad de reserva.
4. **Descubrir:** completar el coste de un nodo y revelar su estado lúdico, su imagen futura y un acceso destacado a la ficha.
5. **Comprender:** abrir la ficha, consultar relaciones reales y seguir un recorrido pedagógico opcional. Leer no es requisito para producir recursos.
6. **Ampliar:** el descubrimiento añade una pequeña capacidad de producción y abre nuevas dependencias de juego.

### Interacción manual

- Acción base propuesta: 1 Chispa por activación de «Analizar».
- No se exige velocidad: mantener pulsado produce acciones al mismo ritmo máximo que pulsar repetidamente.
- Ritmo máximo provisional: 4 acciones por segundo, validado por el dominio y no por la frecuencia de eventos del navegador.
- Las mejoras manuales son finitas y aumentan el rendimiento por acción, no el ritmo necesario.
- La interfaz ofrece una alternativa «Analizar de forma continua» mientras el control mantiene foco o está pulsado; se detiene al soltarlo, perder foco o cambiar de pestaña.
- No hay bonificaciones por sesiones largas, cadenas de clics o días consecutivos.

### Producción automática

- El primer nodo entrega un instrumento inicial de producción lenta para que la campaña no dependa exclusivamente del clic.
- Cada descubrimiento aporta una tasa base pequeña. La cifra representa capacidad del laboratorio, no importancia científica.
- Las mejoras aumentan tasas de ramas concretas con límites definidos.
- La producción se deposita en una reserva con capacidad finita. Al llenarse, simplemente se detiene; no se muestra como una pérdida ni se envían avisos de urgencia.

### Progreso entre sesiones

Al regresar, el servidor calcula la producción desde la última liquidación válida hasta el menor de estos límites:

- Tiempo transcurrido real.
- Ocho horas de producción sin conexión, valor provisional.
- Capacidad disponible de la reserva.

La reserva llena permanece disponible sin caducidad. No hay recompensa especial por volver a una hora concreta. La pantalla informa «Tu reserva alcanzó su capacidad» en vez de cuantificar recursos supuestamente perdidos.

## C. Economía y progresión

### Moneda provisional: Chispas de Curiosidad

Las Chispas representan atención experimental acumulada dentro de la ficción del laboratorio. No representan conocimiento demostrado, capacidad intelectual, recuperación, salud ni experiencia de usuario.

El nombre y símbolo definitivo necesitan aprobación ES/EN. Nombre inglés provisional: **Curiosity Sparks**. Abreviatura interna sugerida: `spark`, nunca `xp`.

### Fuentes

| Fuente | Recurrencia | Control |
| --- | --- | --- |
| Acción manual «Analizar» | Repetible, con ritmo máximo | Ganancia lineal y mejoras finitas |
| Instrumentos de nodos descubiertos | Continua | Tasa y reserva limitadas |
| Finalización de un descubrimiento | Una vez | Bonificación pequeña predefinida, opcional |
| Finalización de un capítulo | Una vez | Capacidad o mejora funcional, no multiplicador ilimitado |
| Producción sin conexión | Continua hasta el límite | Máximo provisional de 8 horas y reserva disponible |

No generan Chispas:

- Leer o releer una ficha.
- Completar Misiones.
- Obtener XP o Medallas.
- Registrar abstinencia, craving, recaída, bienestar o entradas de Bitácora.
- Iniciar sesión, volver cada día o permanecer conectado.

### Gastos

- Coste de descubrimiento de nodos.
- Niveles finitos de instrumentos.
- Ampliaciones finitas de la reserva.
- Mejoras de rama que modifican producción manual o automática.
- Elementos cosméticos futuros solo si se autorizan y no ocultan información científica.

No se consumen Chispas para abrir fichas, pedir ayuda, cambiar idioma, usar accesibilidad o consultar relaciones.

### Curva de costes provisional

Los valores sirven para simulación, no son importes aprobados:

| Tramo | Coste orientativo por nodo | Duración objetivo sin optimización |
| --- | ---: | --- |
| Fundamentos | 0–50 | Minutos |
| Membranas | 70–210 | Una o varias sesiones breves |
| Bioelectricidad | 260–400 | Varias sesiones |
| Neuronas y sinapsis | 450–1.800 | Varios días sin obligación diaria |

Coste de una mejora de nivel `n`:

`coste(n) = redondear(costeBase × 1,65^n)`

Condiciones:

- Máximo recomendado: cinco niveles por mejora en el primer capítulo.
- Ninguna mejora multiplica más de ×2,5 por sí sola.
- Los multiplicadores se suman por categoría antes de aplicar un único factor final; no se encadenan exponencialmente.
- Los costes y tasas usan enteros o milésimas enteras, nunca coma flotante como fuente de verdad.
- No hay inflación infinita, notación científica ni números deliberadamente inabarcables en el primer lanzamiento.

### Reserva

- Capacidad inicial provisional: 120 Chispas.
- Mejoras: +50 % sobre la capacidad base, hasta cinco niveles.
- La capacidad debe cubrir al menos cuatro horas de la tasa automática esperada para la etapa actual.
- Una reserva llena detiene la producción, pero no reduce saldo ni descubrimientos.

### Fin de campaña

Al descubrir `K000060`, el capítulo queda completado. El juego conserva:

- Saldo restante.
- Mejoras.
- Historial de descubrimientos.
- Acceso al mapa y fichas.

No se ofrece prestigio, reinicio, conversión a XP ni repetición infinita. Una futura expansión añade nuevos nodos con costes calibrados respecto a la economía existente.

## D. Primer árbol de 19 descubrimientos

### Convenciones

- **Relación científica:** procede del catálogo revisado y conserva sujeto, predicado y objeto.
- **Ruta pedagógica:** recomendación no bloqueante para comprender contenidos.
- **Dependencia de juego:** condición de campaña; no afirma causalidad, composición ni jerarquía científica.
- **Puerta de capítulo:** exige un número o conjunto de descubrimientos, sin dibujar una arista científica falsa.

Las dependencias siguientes son exclusivamente lúdicas. Cuando estas fichas obtengan autorización editorial y se publiquen, la biblioteca permitirá consultar los 19 conceptos aunque su estado de juego sea «pendiente». En el estado actual, el manifiesto público continúa vacío.

| Orden sugerido | ID canónico | Título ES | Title EN | Coste provisional | Dependencia de juego | Aporte automático provisional |
| ---: | --- | --- | --- | ---: | --- | ---: |
| 1 | `soma:K000004` | Carga eléctrica | Electric charge | 0 | Inicio de campaña | 0,25/min |
| 2 | `soma:K000006` | Diferencia de potencial eléctrico | Electric potential difference | 20 | `soma:K000004` | 0,35/min |
| 3 | `soma:K000008` | Gradiente de concentración | Concentration gradient | 20 | `soma:K000004` | 0,35/min |
| 4 | `soma:K000013` | Ion | Ion | 25 | `soma:K000004` | 0,40/min |
| 5 | `soma:K000010` | Potencial electroquímico | Electrochemical potential | 50 | `soma:K000006` + `soma:K000008` | 0,60/min |
| 6 | `soma:K000020` | Proteína | Protein | 70 | Tres descubrimientos de fundamentos | 0,75/min |
| 7 | `soma:K000023` | Membrana biológica | Biological membrane | 100 | `soma:K000020` + `soma:K000013` | 1,00/min |
| 8 | `soma:K000028` | Canal iónico | Ion channel | 140 | `soma:K000020` + `soma:K000023` | 1,25/min |
| 9 | `soma:K000032` | Transportador de membrana | Membrane transporter | 140 | `soma:K000020` + `soma:K000023` | 1,25/min |
| 10 | `soma:K000030` | Canal iónico dependiente de voltaje | Voltage-gated ion channel | 210 | `soma:K000028` | 1,75/min |
| 11 | `soma:K000037` | Potencial de membrana | Membrane potential | 260 | `soma:K000006` + `soma:K000010` + `soma:K000023` | 2,00/min |
| 12 | `soma:K000041` | Potencial de acción | Action potential | 400 | `soma:K000030` + `soma:K000037` | 2,75/min |
| 13 | `soma:K000043` | Neurona | Neuron | 450 | Puerta: 10 descubrimientos | 3,00/min |
| 14 | `soma:K000046` | Axón | Axon | 600 | `soma:K000043` | 3,50/min |
| 15 | `soma:K000054` | Sinapsis | Synapse | 600 | `soma:K000043` | 3,50/min |
| 16 | `soma:K000047` | Terminal axónica | Axon terminal | 800 | `soma:K000046` | 4,25/min |
| 17 | `soma:K000055` | Sinapsis química | Chemical synapse | 850 | `soma:K000054` | 4,25/min |
| 18 | `soma:K000058` | Vesícula sináptica | Synaptic vesicle | 1.200 | `soma:K000047` + `soma:K000055` | 5,50/min |
| 19 | `soma:K000060` | Liberación de neurotransmisor | Neurotransmitter release | 1.800 | `soma:K000058` + capítulo de bioelectricidad completado | 7,00/min |

### Justificación del recorrido

La campaña abre tres subramas iniciales —electricidad, gradientes e iones— y las hace converger en membranas y bioelectricidad. La neurona se abre mediante una puerta de capítulo, no mediante una relación causal desde el potencial de acción. Axón y sinapsis forman subramas paralelas que convergen en vesícula y liberación.

No se crea una arista científica directa entre `soma:K000041` y `soma:K000060`. La exigencia de completar el capítulo de bioelectricidad para el último nodo es una condición de juego etiquetada, no una relación ontológica. `soma:K000016` y `soma:K000097` permanecen fuera de este capítulo hasta una revisión posterior.

### Presentación de conexiones

| Capa | Forma | Etiqueta obligatoria | Puede ocultarse |
| --- | --- | --- | --- |
| Científica | Línea continua | Predicado real | Sí, salvo en modo científico |
| Pedagógica | Línea punteada | «Ayuda a comprender» | Sí |
| Juego | Línea discontinua con icono de instrumento | «Requisito de expedición» | Sí, salvo en modo juego |
| Puerta de capítulo | Banda o umbral, sin flecha entre conceptos | «Completa N descubrimientos» | No en modo juego |

El patrón, el icono y el texto diferencian capas además del color.

## E. Mejoras y automatización

### Familias de mejoras

| Mejora | Efecto | Límite propuesto | Riesgo controlado |
| --- | --- | ---: | --- |
| Lupa de campo | +1 Chispa por acción manual | 5 | Evita clics cada vez más rápidos |
| Registro automático | +25 % a producción de una rama | 5 por rama | Crecimiento lineal acotado |
| Banco de muestras | +50 % a capacidad base | 5 | Permite ausencias más largas |
| Análisis comparativo | +10 % a dos ramas ya abiertas | 3 | Premia convergencia sin crear relación científica |
| Calibración estable | Reduce un 5 % el coste de nodos de la rama | 3 | Descuento máximo explícito |

### Desbloqueo de automatización

- Instrumento inicial: disponible con `K000004`.
- Mejoras de rama: tras dos descubrimientos de esa rama.
- Análisis comparativo: tras abrir al menos dos ramas.
- Producción sin conexión: activa desde el comienzo; no es una compra.

No existen trabajadores aleatorios, cofres, rarezas, probabilidades ocultas ni compras repetibles sin límite.

### Equilibrio inicial

El balance debe simular al menos estos perfiles:

- Persona que utiliza principalmente interacción manual en sesiones de 5 minutos.
- Persona que consulta una vez por semana y depende de la reserva.
- Persona que combina dos sesiones cortas al día, sin bonificación diaria.
- Uso exclusivamente con teclado o control mantenido.
- Usuario que ignora las mejoras y ahorra directamente para nodos.

Objetivo cualitativo: los primeros tres nodos se descubren en la primera sesión; el capítulo completo requiere varios días de uso opcional, no semanas de espera pasiva ni una tarde de clic intensivo.

## F. Experiencia visual y de usuario

### Composición

- Fondo oscuro SOMA con profundidad ligera, sin movimiento continuo obligatorio.
- Tarjetas de nodo con título, imagen científica futura, coste y estado lúdico.
- Vista científica y vista de juego sobre el mismo conjunto de nodos; no son dos mapas independientes.
- Panel superior compacto con saldo, producción por minuto y capacidad de reserva.
- Ficha existente al seleccionar un nodo, con una sección lúdica claramente separada.
- En móvil, ramas en columnas o carriles navegables y una lista equivalente; el zoom y pan no son la única navegación.

### Estados

| Estado | Significado | Presentación accesible |
| --- | --- | --- |
| Consultable | Ficha disponible en biblioteca | Etiqueta «Disponible en biblioteca» |
| Pendiente | Nodo de juego aún no investigable | Borde neutro + requisitos en texto |
| Investigable | Requisitos de juego cumplidos | Borde cian + acción «Investigar» |
| En curso | Aporte parcial realizado | Progreso numérico y barra con nombre accesible |
| Descubierto | Coste completado | Acento violeta + icono y texto |
| Capítulo completo | Los 19 nodos descubiertos | Resumen final no competitivo |

Los nodos pendientes no ocultan nombres ni fichas publicadas. La ilustración puede aparecer atenuada en el juego, pero el texto alternativo y el título permanecen disponibles.

### Accesibilidad

- Todas las acciones son botones nativos y alcanzables por teclado.
- «Analizar» funciona con pulsación individual o mantenida; no exige doble clic ni gestos rápidos.
- El saldo se actualiza visualmente, pero el lector de pantalla recibe anuncios agrupados, no uno por cada incremento.
- `prefers-reduced-motion` elimina pulsos, partículas y desplazamientos automáticos.
- Contraste AA y estados diferenciados por forma, patrón, icono y texto.
- Controles para ocultar animaciones decorativas y reducir efectos numéricos.
- Lista textual completa del árbol, sus requisitos y relaciones.
- Objetivos táctiles mínimos de 44 × 44 px.
- No hay cuenta atrás, urgencia, sonido obligatorio ni vibración.

### Ilustraciones

Las ilustraciones serán originales, realistas y científicamente revisadas. El arte no se utiliza como evidencia científica. Hasta MEDIA-01, cada nodo funciona con título, tipo y un marcador no vacío solo cuando exista metadata visual autorizada.

## G. Arquitectura técnica mínima

### Separación de dominios

```text
Catálogo científico publicado ── solo lectura ──► navegador y fichas
Relaciones científicas ───────── solo lectura ──► mapa contextual
Rutas pedagógicas ────────────── orientación ───► recorrido opcional
Configuración del juego ──────── balance ───────► requisitos, costes y tasas
Estado del juego por usuario ─── persistencia ──► saldo, compras y liquidación
```

La configuración del juego referencia IDs científicos publicados, pero nunca modifica sus estados ni deriva relaciones. Un validador de build rechaza IDs inexistentes, duplicados, no publicados o dependencias lúdicas cíclicas.

### Estado mínimo LIVE

Propuesta conceptual, pendiente de diseño de datos:

- Versión de la campaña y esquema de balance.
- Saldo entero en milésimas de Chispa.
- Producción total y capacidad.
- `lastSettledAt` controlado por servidor.
- Revisión monotónica para concurrencia.
- Descubrimientos con clave única usuario + concepto.
- Niveles de mejora con clave única usuario + mejora.
- Claves de idempotencia para compras y lotes de acciones manuales.

No se almacenan textos leídos, patrones de clic detallados, datos clínicos ni estados de recuperación.

### Operaciones de dominio

- `readState`: liquida producción pendiente y devuelve un snapshot.
- `recordManualActions`: acepta un lote limitado, valida ritmo máximo e idempotencia.
- `purchaseDiscovery`: comprueba requisitos, saldo y unicidad dentro de una transacción.
- `purchaseUpgrade`: valida nivel máximo, coste y versión de balance.
- `settleOfflineProduction`: calcula tiempo en servidor, capacidad y tasa histórica aplicable.

No existe una operación pública «grant currency». Toda variación procede de comandos cerrados y reglas versionadas.

### Concurrencia e idempotencia

- Bloqueo de fila u optimistic concurrency mediante revisión monotónica.
- Índice único para cada descubrimiento y nivel adquirido.
- Comando con `clientOpId` único por usuario.
- Saldo y compra se actualizan en una transacción.
- Repeticiones devuelven el resultado original sin duplicar saldo ni compras.
- El cálculo sin conexión se basa en hora del servidor y una tasa reconstruible para la versión de balance.

### DEMO y LIVE

| Entorno | Estado | Persistencia | Autoridad |
| --- | --- | --- | --- |
| DEMO | Campaña ficticia o sandbox | Memoria o almacenamiento local claramente etiquetado | Cliente; sin comunicación con LIVE |
| LIVE | Progreso personal del juego | PostgreSQL mediante API autenticada | Servidor |

DEMO nunca crea XP, medallas, misiones ni filas LIVE. Debe ofrecer una acción visible de reinicio del sandbox.

### API y datos

Este diseño no autoriza endpoints ni migraciones. Antes de implementarlos debe decidirse si el modelo mínimo utiliza:

1. Estado agregado versionado más registros únicos de compras.
2. Ledger completo de Chispas.

La primera alternativa reduce coste operativo; la segunda facilita auditoría, pero añade volumen y complejidad. La recomendación inicial es estado agregado, compras idempotentes y registro técnico mínimo de comandos, porque la moneda no tiene valor real ni se convierte en otras economías.

### Compatibilidad

- Los importes se versionan por campaña; una actualización no recalcula compras históricas automáticamente.
- Los IDs de juego son estables y distintos de IDs científicos.
- Los conceptos se referencian por ID canónico, no se duplican.
- Nuevos capítulos pueden añadir configuración sin cambiar las reglas de los anteriores.
- El motor no conoce campos de Misiones, XP, Medallas, Atlas ni Recuperación.

## H. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación propuesta |
| --- | --- | --- |
| Confundir moneda con aprendizaje real | Alto | Copy explícita; no usar «nivel científico» ni puntuaciones cognitivas |
| Confundir dependencia de juego con causalidad | Alto | Capas, estilos y etiquetas distintas; validación y leyenda persistente |
| Segunda economía contradice roadmap | Alto | Decisión de producto y reconciliación documental antes de código |
| FOMO por producción sin conexión | Alto | Sin caducidad, sin rachas ni avisos; reserva llena sin lenguaje de pérdida |
| Clic compulsivo o fatiga motora | Alto | Pulsación mantenida, ritmo máximo, automatización temprana y sin combos |
| Crecimiento exponencial incontrolable | Medio | Niveles y multiplicadores limitados; simulador de balance |
| Manipulación del reloj | Medio | Tiempo y liquidación autoritativos del servidor |
| Duplicación por concurrencia | Alto | Transacciones, claves únicas e idempotencia |
| Catálogo científico todavía vacío | Bloqueante para activación | No activar hasta publicar un lote científico autorizado |
| Arte científicamente incorrecto | Alto | Revisión científica independiente; texto no depende de la imagen |
| Sobrecarga móvil del grafo | Medio | Lista equivalente, carriles, límite de nodos visibles y detalle bajo demanda |
| Anuncios de lector de pantalla excesivos | Medio | Agrupar actualizaciones y permitir silenciarlas |
| Coste de mantenimiento de balance | Medio | Configuración declarativa, campaña finita y telemetría agregada no sensible |
| Trampas en una moneda sin valor real | Bajo/medio | Validación razonable sin sistemas antifraude invasivos |

### Seguridad y privacidad

- No registrar texto de fichas consultadas ni duración de lectura como señal de comportamiento.
- No usar telemetría individual para inferir salud, consumo o capacidad cognitiva.
- Métricas de balance, si se autorizan, deben ser agregadas: tiempo mediano entre nodos, distribución de costes y tasa de abandono de capítulo.
- No exponer saldo o progreso en URLs.
- No añadir notificaciones push de reserva llena.
- El borrado de cuenta debe eliminar también el estado del juego.

## I. Plan de implementación incremental

### GAME-01A — Decisiones de producto y balance

- Resolver la contradicción sobre segunda economía.
- Aprobar nombre, límites, costes provisionales y cap sin conexión.
- Construir un simulador puro, sin UI ni persistencia.
- Criterio: cuatro perfiles de uso completan la campaña en intervalos aceptables sin clic intensivo.

### GAME-01B — Contratos y configuración

- Tipos estrictos para campaña, nodos, costes, tasas y dependencias de juego.
- Validador de IDs publicados, ciclos y separación de capas.
- Manifiesto de juego vacío por defecto.
- Criterio: ninguna dependencia lúdica se exporta como relación científica.

### GAME-01C — Motor puro

- Cálculo de producción, costes, compras, reserva y liquidación sin conexión.
- Tests de límites, redondeo, versiones y determinismo.
- Sin React, API ni base de datos.

### GAME-01D — Sandbox DEMO

- UI incremental con fixtures sintéticas.
- Teclado, pulsación mantenida, movimiento reducido y lista alternativa.
- Estado efímero o local reiniciable, sin llamadas LIVE.
- Criterio: no toca XP, Misiones o Medallas.

### GAME-01E — Persistencia LIVE

- Diseño Prisma/API separado y revisión de privacidad.
- Transacciones, idempotencia, concurrencia y reloj de servidor.
- PostgreSQL aislado antes de cualquier migración autorizada.

### GAME-01F — Integración con contenido publicado

- Referenciar exclusivamente conceptos publicados.
- Incorporar los 19 nodos tras autorización editorial independiente.
- Validar que la biblioteca continúa accesible sin progreso de juego.

### GAME-01G — QA de equilibrio y accesibilidad

- Simulación prolongada y concurrencia.
- Navegador real en escritorio y móvil.
- Teclado, lector de pantalla, zoom y movimiento reducido.
- Revisión científica de etiquetas y conexiones visuales.

### GAME-01H — Activación controlada

- Flag interno o entrega coordinada DEMO/LIVE.
- Smoke con identidad sintética.
- Rollback que oculta el juego sin borrar progreso.
- EXP-04 y despliegue requieren autorizaciones separadas.

## J. Decisiones que requieren aprobación

1. Autorizar o rechazar formalmente una segunda economía y reconciliar `ROADMAP.md`.
2. Aprobar el nombre ES/EN «Chispas de Curiosidad / Curiosity Sparks».
3. Confirmar que la moneda no se convierte nunca en XP, Medallas u otras recompensas.
4. Aprobar la campaña finita sin prestigio ni reinicios.
5. Aprobar costes, tasas y fórmula de mejoras solo después de simulación.
6. Confirmar el límite sin conexión de ocho horas y el diseño de reserva.
7. Definir si DEMO persiste localmente o se reinicia en cada sesión.
8. Aprobar la pulsación mantenida y el ritmo máximo de acciones manuales.
9. Decidir si la finalización de nodo concede una bonificación única o solo producción.
10. Aprobar los 19 requisitos de juego como capa no científica.
11. Elegir estado agregado o ledger para persistencia LIVE.
12. Autorizar cualquier migración, endpoint o telemetría en hitos posteriores.
13. Confirmar que la activación espera a un catálogo científico publicado.
14. Aprobar una política de rollback que preserve el progreso del juego.
15. Determinar si la economía se incorpora al nuevo Centro antes, durante o después de EXP-04.

## Criterio de salida del diseño

GAME-01 puede pasar a simulación únicamente cuando se resuelva la contradicción de producto sobre la segunda economía y se aprueben los guardarraíles contra FOMO, clic compulsivo y confusión científica. Este documento no autoriza ningún importe, esquema de datos, endpoint, publicación científica ni activación pública.
