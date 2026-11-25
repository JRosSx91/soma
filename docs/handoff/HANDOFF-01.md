# HANDOFF-01 — Traspaso a Codex

Fecha: 2026-11-25. Documento de continuidad. No autoriza commit, push, PR, merge ni despliegue.

Leer después `ROADMAP.md` y `README.md`. Este archivo no sustituye el historial del roadmap.

## Qué es SOMA

SOMA 2.0 es un compañero educativo sobre la recuperación fisiológica tras el consumo de sustancias. No es un dispositivo médico, no diagnostica y no predice el estado clínico de una persona.

La beta pública está identificada en `README.md` y se sirve en `https://somarecovery.app`. La API documentada es `https://api.somarecovery.app`.

Problema que aborda: ofrecer información y acompañamiento comprensibles, sin presentar curvas, neurotransmisores o logros como mediciones individuales. La recuperación es el propósito central.

Orientación aprobada para la evaluación, no para implementar secciones nuevas:

1. Recuperación.
2. Reconstrucción personal.
3. Exploración y crecimiento.

La siguiente prioridad es **AUDIT-01**. Sus conclusiones todavía no existen y no son decisiones de producto.

## Arquitectura

Monorepo TypeScript con pnpm. Node `>=20`, pnpm `>=9`.

| Pieza | Ruta | Responsabilidad |
| --- | --- | --- |
| Web | `apps/web` | React 19, Vite, Tailwind, React Router. DEMO `/preview` y LIVE `/app`. |
| API | `apps/api` | NestJS, Prisma, PostgreSQL. |
| Contratos | `packages/shared-types` | Tipos compartidos, incluidos los avisos legales. |
| Diseño y revisión | `docs/` | Ontología, contenido, QA y operaciones. No es el runtime. |

No hay Dockerfile de la aplicación. `docker-compose.yml` solo levanta PostgreSQL 16 Alpine en local.

Infraestructura declarada en los textos legales y en el README: interfaz y API en Render; PostgreSQL en Supabase; copias cifradas con age hacia Cloudflare R2; correo de restablecimiento opcional por Resend. No hay `render.yaml` en el repositorio. El panel de Render no se inspeccionó en este traspaso.

Autenticación propia: JWT y cookie de refresco en `apps/api/src/auth`. El arranque de producción pasa por `apps/api/scripts/start-prod.cjs` y `assertSecureProductionEnv`. `AUTH_REGISTRATION_MODE` del host no está verificado. El correo de restablecimiento puede estar desactivado.

La Bitácora, el progreso, las misiones y el consentimiento de categoría especial son datos sensibles. No se registran en logs, URLs ni telemetría. No hay analítica de producto en la SPA (`MKT-01C`).

## Entornos

| Entorno | Qué es | Qué no es |
| --- | --- | --- |
| Local | `pnpm dev:web` y `pnpm dev:api`, con variables y Postgres propios | Producción |
| DEMO | `/preview` en el sitio público | Una sesión LIVE ni una concesión real de XP |
| LIVE | `/app` con sesión | Validado en cada superficie. Safari, PWA standalone y varios recorridos siguen sin reauditar |
| `main` | Rama de producción Git | Un despliegue. Render se ha desplegado de forma manual |

## Estado Git el 2026-11-25

Comprobado en local, sin fetch y sin inspeccionar Render:

- Rama activa: `feature/gam-03b`.
- HEAD local y `origin/feature/gam-03b`: `f331d48b60db32427c26ae2304f1e3fe700b8b7f` (`feat(knowledge): complete stratum zero scientific discovery articles`). La rama no está por delante ni por detrás de su remoto.
- `origin/develop`: `39a48ca` (PR #131, mensaje de cierre documental de GAM-XP).
- `origin/main`: `fb1881c` (PR #132). Su árbol coincide con `origin/develop`.
- La rama de trabajo contiene ese árbol de `develop` más 20 commits propios. No está fusionada en `main`.
- Última release que el propietario confirmó en SPA y API: `b91d637cba521507882e13529742a54ae960014d`, el 2026-11-19, con smoke 7/7. No se sabe si Render sigue en ese SHA o sirve el árbol de PR #132.

## Qué está publicado

Según `ROADMAP.md` y la confirmación del propietario del 2026-11-19, no según una inspección nueva:

shell de Soma 2.0, Inicio, Recuperación, Logros, Bitácora, XP/niveles/títulos, 20 misiones educativas publicadas y un borrador histórico oculto, atlas, landing, Somi en el tutorial, Centro de Expedición (`/expedition`, GAME-07) y Apoyo SUP-02B/C/D/E. La invitación automática de SUP-02E permanece apagada (`SUPPORT_AFTER_USE_INVITE_ENABLED=false`).

Catálogos de síntomas y consejos: públicos y vacíos a propósito. Bloqueados por revisión clínica.

## Qué no está publicado

**GAM-03B, Estrato 00.** Prototipo solo de desarrollo en `/preview/dev/knowledge-prototype` (`apps/web/src/App.tsx`, `import.meta.env.DEV` e import diferido). Veintiocho descubrimientos F00.01–F00.28. Identificadores `soma:K900101`–`soma:K900128`. Chispas en `localStorage`, balance `b2-econ-01d-s00-28`. No escriben XP, abstinencia, medallas ni misiones.

El catálogo público de conocimiento se construye vacío. La ontología de `docs/design/gam-03b/` (100 conceptos candidatos y once estratos pedagógicos) no es el prototipo jugable ni está publicada.

Estratos 01–08: pospuestos. GAM-02B, GAM-04 y GAM-05: no iniciados.

## Cambios sin consolidar

No descartarlos ni mezclarlos con un commit documental salvo autorización expresa.

Modificados y sin stage:

- `apps/web/src/features/recovery-dashboard/knowledge/KnowledgePrototypeTree.tsx`
- `apps/web/src/features/recovery-dashboard/knowledge/PrototypeConceptSheet.tsx`
- `apps/web/src/features/recovery-dashboard/knowledge/knowledge-prototype-camera.ts`
- `apps/web/src/features/recovery-dashboard/knowledge/knowledge-prototype-composition.ts`
- `apps/web/src/features/recovery-dashboard/knowledge/knowledge-prototype-editorial-view.tsx`
- `apps/web/src/features/recovery-dashboard/knowledge/knowledge-prototype-presentation.ts`

Son el ajuste visual de legibilidad del Estrato 00 (REVIEW-01 y REVIEW-01B). No cambian la economía ni el texto científico. Diff local de HANDOFF-01: 247 inserciones y 69 supresiones. Esta tarea no los ha vuelto a ejecutar en el navegador.

Sin seguimiento de Git, entre otros: `docs/review/**` (incluidas las capturas `gam-03b-s00-review-01` y `01b`), mockups `docs/design/*.png` y los scripts `apps/web/scripts/capture-gam-03b-visual-03.mjs` y `capture-sup-02-ux-polish.mjs`. Hay más archivos de revisión anteriores. No usar `git add -A` ni `git add .`.

## Pruebas

CI (`.github/workflows/ci.yml`): en PRs a `develop` y `main`, typecheck, tests unitarios, migraciones sobre PostgreSQL efímero y tests PG. El roadmap conserva cifras históricas de CI; este traspaso no ha ejecutado la suite.

Comandos reales, desde la raíz salvo el filtro:

```text
pnpm --filter @soma/shared-types build
pnpm --filter @soma/shared-types test
pnpm --filter @soma/api exec prisma generate
pnpm --filter @soma/api exec tsc -b --pretty false
pnpm --filter @soma/api test:unit
pnpm --filter @soma/web exec tsc -b --pretty false
pnpm --filter @soma/web test
pnpm --filter @soma/web lint
pnpm --filter @soma/web build
```

`pnpm --filter @soma/api test:pg` exige una base aislada y autorización para migrar. El build web regenera catálogos, incluido el de conocimiento público, que debe seguir en cero conceptos mientras no se autorice su publicación.

No presentar como superada una prueba que no se haya ejecutado. La última cifra de 1230 tests web pertenece al trabajo local de REVIEW-01B; no se repitió aquí.

## Deuda y límites conocidos

Fuente: roadmap y comprobaciones puntuales de este traspaso. No es la auditoría AUDIT-01.

- Q-CI no está cerrado del todo: cobertura, scripts de raíz y el residual de ESLint. Q-E2E continúa en Q-E2E-2+.
- Q-OBS está cerrado: hay un `AppErrorBoundary` en `apps/web/src/main.tsx` (PR #111). El diagnóstico del 2026-11-12, dentro de ese mismo hito, todavía describe la ausencia anterior.
- BETA-01D.3 sigue en revisión jurídica. MKT-PR-01D sigue sin cobertura confirmada.
- PWA-01D, tiendas (MOB-01) e INST-01 están aplazados. Safari iOS y PWA standalone no se dan por validados.
- UX-08 y UX-09 siguen pendientes. No se inventan ventanas clínicas.
- `docs/design/gam-03b/README.md` dice que ese directorio no está integrado. Sigue siendo cierto para la ontología candidata. El prototipo DEV sí está en la rama y el README no lo cuenta.
- `README.md` solo enumera `main` y `develop`. El trabajo actual vive en `feature/gam-03b`.
- `pnpm-lock.yaml` conserva un importador `apps/web-next` cuya carpeta no existe. Next y Sharp no están instalados. No se ha limpiado el lockfile.
- Los scripts `apps/web/scripts/optimize-*.mjs` llaman a ImageMagick local. No forman parte de `package.json` ni del runtime de Render.
- La economía de Chispas del prototipo no está reconciliada con el criterio histórico de no crear una segunda economía. Permanece aislada y sin publicar.

## Git y despliegue

`main` es la rama de producción y `develop` la de integración. El trabajo de GAM-03B está en `feature/gam-03b`. Un merge no despliega. Render no tiene autodespliegue declarado en el repositorio.

Antes de editar: rama, HEAD y working tree. No cambiar de rama con cambios pendientes. No hacer commit, push, PR, merge, rebase, reset ni clean sin autorización. No añadir secretos ni `.env`.

## Restricciones que no se incumplen

- No prometer precisión clínica individual.
- No penalizar recaídas, craving o peticiones de ayuda, ni recompensarlos.
- No modificar XP, niveles, medallas, abstinencia ni su persistencia sin autorización específica.
- No publicar el prototipo de conocimiento ni rellenar el catálogo público sin autorización.
- No ejecutar migraciones, seeds ni cambios de base de datos sin autorización.
- No tocar partidas ni datos de usuarios.
- No instalar dependencias ni cambiar infraestructura o configuración de producción sin autorización.
- Paridad ES/EN. DEMO y LIVE no se tratan como la misma superficie.
- Separar auditoría, diseño, implementación, QA y publicación.
- Informar de errores, limitaciones, pruebas no ejecutadas y decisiones que exceden la autorización.

## Próximo paso

AUDIT-01, hecha por Codex y después contrastada con una investigación externa. Hasta ese contraste no se amplían estratos, misiones de bienestar ni colecciones.

Referencias directas: `ROADMAP.md` (AUDIT-01 y GAM-03B), `docs/design/gam-03b/economy-status.md`, `docs/design/gam-03b/README.md`, `docs/content/gam-03b/`, `docs/BETA_01C_OPERATIONS.md`, `docs/BETA_01C_BACKUP_RESTORE.md`, `AGENTS.md`.
