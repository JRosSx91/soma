# SOMA 2.0 — instrucciones para agentes

## Arquitectura y alcance

- Consulta `ROADMAP.md` antes de planificar o abrir hitos.
- Respeta la estructura, contratos y patrones existentes; reutilízalos antes de crear abstracciones nuevas.
- Evita sobreingeniería, dependencias e infraestructura innecesarias.
- Mantén paridad ES/EN, compatibilidad DEMO/LIVE y los assets originales de SOMA y Somi.
- Limita cada cambio al alcance expresamente autorizado. No anticipes funcionalidades futuras.

## Git, datos y permisos

- Antes de modificar código, comprueba rama, HEAD y estado del working tree.
- No hagas commit, push, merge, PR, rebase, reset, clean, checkout de rama, sincronización remota ni despliegue sin autorización expresa.
- No ejecutes migraciones, seeds ni cambios de base de datos sin autorización expresa.
- Preserva archivos untracked, cambios ajenos y trabajo en curso; evita operaciones destructivas.
- No modifiques lógica de abstinencia, XP, niveles, medallas o persistencia sin autorización específica.

## QA

- Prioriza pruebas específicas y proporcionales al cambio; no repitas auditorías o suites generales sin justificación.
- Ejecuta typecheck, tests y build cuando el riesgo y el alcance del cambio lo requieran.
- No ocultes errores ni presentes como superadas pruebas que no se hayan ejecutado.
- Documenta regresiones, limitaciones, verificaciones pendientes y diferencias entre local, referencias Git y producción.

## Seguridad, privacidad y producto

- No introduzcas registros innecesarios de datos sensibles ni expongas información de recuperación en logs, URLs o telemetría.
- SOMA es una aplicación educativa y de acompañamiento, no un servicio sanitario; no prometas precisión clínica individual.
- No penalices recaídas o vulnerabilidad ni concedas recompensas por craving, recaídas o solicitudes de ayuda.
- Prioriza accesibilidad, estabilidad, seguridad y utilidad real frente a mecánicas de engagement artificiales.

## Metodología y entrega

- Trabaja por hitos pequeños y separa auditoría, diseño, implementación, QA y publicación.
- Detente antes de cualquier operación que necesite una autorización nueva.
- Entrega un informe final con archivos modificados, pruebas ejecutadas, riesgos, limitaciones y decisiones pendientes.
