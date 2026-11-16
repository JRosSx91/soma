# Política editorial de Apoyo (SUP)

Política aprobada para contenido educativo y de acompañamiento general en el Centro de Apoyo. Aplicable a fichas, acompañamientos y textos de invitación (SUP-02B/C/D/E y siguientes hitos de Apoyo salvo excepción explícita).

## Principios

1. **Rigor científico.** Las afirmaciones científicas deben ser exactas, proporcionales y no exagerar el alcance de la evidencia.
2. **Referencias verificables.** Toda afirmación científica relevante debe poder enlazarse a fuentes públicas comprobables (organización, título, URL o documento). Las referencias no demuestran por sí solas que Soma sea una intervención clínicamente validada.
3. **Revisión editorial y de seguridad obligatoria** antes de habilitar el contenido en producto.
4. **Revisión clínica externa:** recomendable; **no bloqueante por defecto** para contenido educativo y acompañamiento general.
5. **Bloqueo de publicación** si existen riesgos de seguridad relevantes sin resolver (p. ej. consejos peligrosos, omisión de emergencias, framing diagnóstico indebido).
6. **Fuera del alcance de Soma:** diagnósticos, tratamientos personalizados y predicciones clínicas.
7. **Sin acreditación, sin afirmaciones de:** validación clínica, conformidad normativa, eficacia terapéutica garantizada o equivalencia a atención profesional.

## Estados que debe registrar cada hito

| Estado | Significado |
|---|---|
| Revisión editorial | Completada / pendiente |
| Revisión de seguridad | Completada / pendiente / bloqueada |
| Validación clínica externa | No realizada (por defecto) / realizada |
| Habilitación en árbol local | Gate/allow-list en código |
| Publicación en producción | Pendiente hasta autorización expresa + pipeline `develop` → `main` |

## Uso

Esta política no sustituye las hojas de revisión por hito (`sup-02b-*.md`, `sup-02c-*.md`, `sup-02e-*.md`, etc.). No obliga a reabrir auditorías bibliográficas ya cerradas salvo que aparezca una carencia concreta de seguridad o exactitud.
