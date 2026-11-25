# SOMA 2.0 — instrucciones para agentes

Instrucciones operativas. El detalle de producto está en `ROADMAP.md` y el estado de traspaso en `docs/handoff/HANDOFF-01.md`. Este archivo no autoriza commit, push, PR, merge ni despliegue.

## Lectura inicial

Antes de planificar o editar, leer en este orden:

1. `docs/handoff/HANDOFF-01.md`
2. `ROADMAP.md` (prioridad vigente y el hito que se va a tocar)
3. `README.md`
4. El documento especializado del área. Conocimiento: `docs/design/gam-03b/economy-status.md` y `docs/content/gam-03b/`. Operación: `docs/BETA_01C_OPERATIONS.md` y `docs/BETA_01C_BACKUP_RESTORE.md`.

No abrir un hito que el roadmap no tenga autorizado. La prioridad actual es **AUDIT-01**. No implementar sus recomendaciones futuras como si ya estuvieran aprobadas.

## Alcance

- Reutilizar contratos, módulos y patrones existentes.
- No añadir dependencias, servicios ni infraestructura sin autorización.
- Mantener paridad ES/EN, la distinción DEMO/LIVE y los assets originales de SOMA y Somi.
- Limitar cada cambio al alcance autorizado. No adelantar estratos, misiones ni secciones nuevas.
- Una rama de desarrollo no es producción. `feature/gam-03b` no está publicada.
- El prototipo `/preview/dev/knowledge-prototype` solo existe en desarrollo. No publicarlo ni conectar sus Chispas a XP, abstinencia, medallas o misiones.

## Código

- TypeScript en `apps/web`, `apps/api` y `packages/shared-types`.
- Web: React, Vite y Tailwind. API: NestJS y Prisma. Contratos compartidos en `@soma/shared-types`.
- No crear una segunda arquitectura de renderizado, de autenticación o de economía.
- No modificar lógica de abstinencia, XP, niveles, medallas o su persistencia sin autorización específica.
- Conservar el catálogo público de conocimiento vacío mientras no se autorice su publicación.

## Validación

Ejecutar comprobaciones proporcionales al cambio. No dar por superada una prueba que no se haya ejecutado. Desde la raíz:

```text
pnpm --filter @soma/shared-types build
pnpm --filter @soma/shared-types test
pnpm --filter @soma/api exec tsc -b --pretty false
pnpm --filter @soma/api test:unit
pnpm --filter @soma/web exec tsc -b --pretty false
pnpm --filter @soma/web test
pnpm --filter @soma/web lint
pnpm --filter @soma/web build
```

El build web debe seguir generando un catálogo público de conocimiento vacío. `prisma generate` hace falta antes del typecheck de la API si el cliente no existe. `pnpm --filter @soma/api test:pg` y cualquier migración exigen autorización y una base aislada. E2E: `pnpm --filter @soma/web test:e2e`, solo contra orígenes permitidos por `apps/web/e2e/lib/safe-env.ts`.

## Seguridad, privacidad y producto

- SOMA es educativa. No prometer precisión clínica individual ni publicar síntomas o consejos sin revisión clínica.
- No penalizar recaídas, craving o peticiones de ayuda, ni conceder recompensas por ello.
- No registrar datos sensibles ni información de recuperación en logs, URLs o telemetría.
- No incluir secretos, credenciales, tokens ni datos personales en código, documentación o informes.
- No alterar partidas, bases de datos ni datos de usuarios.

## Git y producción

- Antes de editar: rama, HEAD y working tree.
- Preservar cambios sin stage y archivos sin seguimiento. No usar `git add -A`, `git add .` ni operaciones destructivas.
- No cambiar de rama, ni hacer commit, push, merge, PR, rebase, reset, clean o despliegue, sin autorización expresa.
- No instalar dependencias ni modificar infraestructura, variables o configuración de producción sin autorización.
- Un merge en `main` no es un despliegue. No afirmar un SHA de Render que no se haya leído en el panel.

## Entrega

Trabajar por hitos pequeños y separar auditoría, diseño, implementación, QA y publicación. Detenerse antes de una autorización nueva.

El informe final indica archivos modificados, pruebas ejecutadas, pruebas no ejecutadas, riesgos, limitaciones y decisiones pendientes.
