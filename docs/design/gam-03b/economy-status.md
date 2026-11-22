# GAM-03B — Estado de la economía del árbol

Registro interno. No modifica `ROADMAP.md` y no autoriza integrar ni publicar esta economía en la beta.

## Aprobado conceptualmente

Estas decisiones describen la dirección vigente. Las cifras del balance B2/ECON-01D siguen siendo provisionales.

- La moneda exclusiva del árbol es Chispas de curiosidad. No es XP.
- El saldo no tiene límite jugable.
- La producción automática sigue offline, sin límite de tiempo. La ausencia no se penaliza.
- Los generadores pertenecen a conceptos del árbol.
- Los costes crecen entre estratos.
- El fondo del árbol se puede pulsar. No hay un botón «Analizar» obligatorio.
- Cada toque válido entrega su recompensa al momento. La potencia por toque mejora con compras y con hitos científicos.
- No hay pausas, fatiga ni un rendimiento que baje por pulsar de forma continua.
- El tope provisional es técnico: 12 eventos recompensados por segundo.
- Las dependencias científicas y las jugables son capas distintas.
- Esta economía no mide ni altera XP, misiones, medallas, abstinencia ni recuperación.
- Antes de integrarla o publicarla hay que reconciliarla con `ROADMAP.md`. Ese criterio todavía dice que el árbol no crea una segunda economía.

## Implementado en esta rama

- El catálogo público está vacío. El manifiesto no autoriza conceptos, relaciones ni prerrequisitos.
- Las fichas pueden mostrar explicación, ejemplo, aclaraciones y fuentes cuando un concepto publicado las traiga.
- `/preview/dev/knowledge-prototype` existe solo en desarrollo. La build de producción no debe servir esa ruta.
- El prototipo DEV ejecuta el Estrato 00 con los 28 conceptos F00.01–F00.28 y el motor B2/ECON-01D: Chispas en milichispas enteras, saldo sin tope, pulsación del fondo, potencia por toque y generadores con producción offline. Sigue siendo una fixture de desarrollo. No es una publicación editorial.
- La partida DEV se guarda solo en `soma.dev.knowledge-prototype.economy.v1`. Una versión o un identificador de balance distinto descarta esa partida local y no toca datos de recuperación.

## Fixture DEV del Estrato 00

La correspondencia neuronal de 19 nodos quedó sustituida. Esta tabla describe la partida actual y no autoriza publicación.

| Pieza B2 | Concepto del Estrato 00 | Identificador de ejecución |
| --- | --- | --- |
| Generador, niveles 1 a 5 | F00.01 Universo físico | `f00-universe` |
| Generador | F00.05 Espacio-tiempo | `f00-spacetime` |
| Generador | F00.23 Campo físico | `f00-field` |
| Generador y puerta de la potencia T1 | F00.15 Energía | `f00-energy` |
| Puerta de la potencia T2 | Estrato posterior, bloqueada | — |
| Puerta de la potencia T3 | Estrato posterior, bloqueada | — |

Los identificadores de ejecución son `soma:K900101`–`soma:K900128`. No reutilizan la ontología `soma:K000xxx` ni el banco neuronal `soma:K900001`–`soma:K900019`. El balance es `b2-econ-01d-s00-28` y la versión de guardado es 2. Una partida del banco anterior se descarta. Los 13 conceptos esenciales suman 18.564 chispas y los 28 suman 49.702. La puerta F00.26 cuesta 0. T2 y T3 no se compran en este capítulo.

## Historial del banco neuronal

No son identificaciones científicas. Describen el banco de 19 nodos que esta fixture reemplazó.

| Pieza B2 | Sustituto en la fixture | Secuencia |
| --- | --- | --- |
| Generador Universo, niveles 1 a 5 | Carga eléctrica | 1 |
| Generador Espacio-tiempo | Canal iónico | 5 |
| Generador Campo, y puerta de la potencia T1 | Neurona | 7 |
| Generador Energía | Sinapsis | 16 |
| Puerta de la potencia T2, en lugar de S1E2 | Axón | 15 |
| Puerta de la potencia T3, en lugar de S2E2 | Receptor | 18 |

La potencia por toque usa la tabla ECON-01D: 1, luego 2 y 3, 5 y 8, 14 y 24, 40 y 70, con los costes 40, 150, 600, 2.500, 12.000, 45.000, 160.000 y 520.000. Los precios de los 19 descubrimientos suman 29.812 chispas y ocupan la banda inicial del Estrato 00. No son la lista definitiva.
