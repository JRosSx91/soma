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
- El prototipo usa una economía de demostración anterior: acción «Analizar», tope de 2 acciones por segundo, bureta y calibración. Esa implementación no es ECON-01D.
