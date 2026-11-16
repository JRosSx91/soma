# Q-E2E-1 — Infraestructura Playwright y smoke DEMO

Estado: **cerrado** (commit local autorizado).  
Alcance: Chromium + smoke DEMO `/preview` → Recuperación → Explorar.  
No cierra el hito global **Q-E2E** (faltan auth de staging y CI).

## Instalación de navegadores

Desde `apps/web` (tras `pnpm install` en la raíz del monorepo):

```bash
pnpm exec playwright install chromium
```

Solo Chromium en esta fase. Firefox y WebKit quedan fuera de alcance.

## Comandos

Todos desde `apps/web` (o `pnpm --filter @soma/web <script>`):

| Script | Qué hace |
| --- | --- |
| `pnpm test:e2e` | Smoke E2E (siempre `build` + Vite Preview en loopback; no reutiliza servidor ajeno) |
| `pnpm test:e2e:headed` | Igual, con ventana visible |
| `pnpm test:e2e:debug` | Inspector Playwright |
| `pnpm test:e2e:guards` | Unit tests fail-closed de `e2e/lib/safe-env.ts` (**comando reproducible**) |
| `pnpm test` | Suite web existente (`node:test` + tsx); **no** ejecuta E2E |

Equivalente raíz para guards:

```bash
pnpm --filter @soma/web test:e2e:guards
```

La configuración arranca `pnpm run build` con `VITE_API_URL=""` y `SOMA_E2E_PREVIEW=1`, luego `vite preview --host 127.0.0.1 --port 4173 --strictPort`.  
`reuseExistingServer: false`: si el puerto 4173 ya está ocupado, el arranque **falla** (no se adopta un preview construido fuera del E2E).

## Configuración del entorno

| Variable | Rol |
| --- | --- |
| `E2E_BASE_URL` | Origen del SPA bajo prueba. Por defecto `http://127.0.0.1:4173`. Solo loopback con puerto explícito. |
| `E2E_API_URL` | Pista opcional; si está definida debe ser loopback. No se usan credenciales. |
| `VITE_API_URL` | Validada al cargar la config (fail-closed si apunta fuera de loopback). El `webServer` la fuerza a `""` en el proceso de build/preview. Vite **no** sobrescribe `process.env` ya definido con valores de `.env*`. |
| `SOMA_E2E_PREVIEW` | `1` en el `webServer` E2E: desactiva el proxy Nest (`localhost:3000`) del `preview` en `vite.config.ts`. |

Idioma de aserciones: `locale: es-ES` + `localStorage` `soma.i18n.lang=es`.

### API de producción y Vite

- Fallback de cliente: `VITE_API_URL ?? ""` (mismo origen / vacío; no hay URL de producción por defecto).
- En este repo no hay `.env` / `.env.production` bajo `apps/web` (solo `.env.example`).
- Un `VITE_API_URL` de producción en el shell hace fallar `assertSafeApiHint` **antes** de abrir el navegador.
- Defensa en profundidad: el allowlist del smoke aborta `/auth`, `/me`, `/health`, `/substances` aunque sean same-origin.

## Política de aislamiento (fail-closed)

1. **Antes de arrancar el navegador:** `assertSafeE2eOrigin` / `assertSafeApiHint` rechazan hosts no loopback y marcadores de producción (p. ej. `somarecovery`, `supabase`, `staging`, clouds).
2. **Durante el smoke:** `browserContext.route` (instalado en `beforeEach`, antes de cualquier `goto`) aborta requests fuera del allowlist.
3. **`serviceWorkers: "block"`** en el contexto Playwright para que un SW no eluda la interceptación.
4. **Sin** cookies, sesiones ni datos reales de producción; **sin** reutilizar servidor preexistente en 4173.
5. Si el entorno no puede garantizarse seguro, Playwright aborta al cargar la configuración o al arrancar el `webServer`.

## Ejecución y depuración

- Fallos: traza (`trace: retain-on-failure`) y captura (`screenshot: only-on-failure`).
- `retries: 0` — la estabilidad no se oculta con reintentos.
- Depuración: `pnpm test:e2e:debug` o `pnpm exec playwright show-report` tras un fallo.

## Informes y trazas

Ignorados por git (raíz y `apps/web`):

- `apps/web/playwright-report/` — HTML report
- `apps/web/test-results/` — artefactos / traces / screenshots
- `blob-report/`, `playwright/.cache/`

## Separación de runners

- E2E: `*.spec.ts` bajo `apps/web/e2e/` + Playwright.
- Unit/integración web: `*.test.ts` bajo `src/…` vía `scripts/run-web-tests.cjs` (raíces fijas; **no** incluye `e2e/`).
- Guards: únicamente `pnpm test:e2e:guards` / `pnpm --filter @soma/web test:e2e:guards`.

## Limitaciones actuales

- Solo Chromium.
- Solo recorrido DEMO público; sin autenticación LIVE.
- Explore puede no listar sustancias vía API (build sin `VITE_API_URL` + rutas API abortadas); el smoke valida shell, sistemas del atlas y copy educativo local.
- Sin job CI; sin Firefox/WebKit; sin POM ni abstracciones extra.

## Alcance previsto de Q-E2E-2

- Ampliar cobertura DEMO (Inicio, Anatomía u otras secciones estables) si se autoriza.
- Criterio de auth en entorno de staging **autorizado** (cuentas sintéticas; nunca producción), cuando exista infraestructura.
- Valorar job CI mínimo (Chromium + smoke DEMO) sin debilitar guards.
- No introducir staging desde este documento; queda a autorización expresa.
