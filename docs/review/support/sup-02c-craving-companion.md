# SUP-02C — Afrontar el impulso de consumir

| Campo | Valor |
|---|---|
| Product id (interno) | `craving.companion` |
| Apertura | Estado en memoria de `SupportPage` (sin ID en la URL) |
| Query legacy `?tool=` | Siempre se elimina; **nunca** abre la herramienta |
| `contentVersion` | `0.1.2` |
| `implementationStatus` | `implemented` |
| `editorialStatus` | `editorial_review_done` |
| `clinicalStatus` | `pending` |
| `publicationStatus` | `unpublished` |
| `publicationGate` | `pending_independent_authorization` |
| Allow-list | `SUPPORT_CRAVING_TOOL_ENABLED = false` |
| Runtime | `support-craving-tool.ts`, `support-craving-content.ts`, `craving-companion-session.ts`, `CravingCompanionTool.tsx`, `UrgeWaveVisual.tsx` |

**Implementación técnica:** completada (local, sin publicación).
**Revisión editorial interna:** completada (copy 0.1.1).
**Refinamiento visual:** completado (layout íntimo 0.1.2: columna ~720px, Somi centrado, progreso de 5 segmentos, ola refinada).
**Validación clínica externa:** **pendiente**.
**Autorización de publicación:** **pendiente** (independiente).

**Nota sobre capturas previas:** el texto estrecho junto a Somi y los espacios oscuros eran sobre todo defectos reales de layout/captura (Somi en fila con el párrafo; crop con dock fijo). v0.1.2 corrige composición y regenera PNG.

No es una intervención clínicamente validada. SUP-02B permanece unpublished e intacto.

---

## Privacidad por diseño

1. El acompañamiento se abre con `cravingOpen` en `SupportPage` (memoria React).
2. El id de producto **no** se escribe en la URL durante el uso normal.
3. Cualquier `?tool=…` (incluido `craving.companion`) se elimina y no monta la UI.
4. Sin `localStorage` / `sessionStorage` / IndexedDB / cookies / telemetría específica / API / XP / Bitácora.
5. DOM: `data-craving-companion` sin valor de producto; `data-craving-step` / `data-craving-choice` / `data-craving-nav` solo para testing y a11y.

### Limitaciones (infraestructura / hosting)

Aunque la app no envíe telemetría propia, un proveedor de hosting, CDN, proxy o el historial del navegador podrían registrar rutas genéricas (`/preview/support`, `/app/support`) o errores de red. Eso **no** incluye el id `craving.companion` en query si el gate y el strip funcionan. Si en el futuro se añade observabilidad que serialice el DOM, los `data-craving-*` de testing podrían filtrar paso/elección: vigilar ese riesgo.

---

## Decisiones arquitectónicas

1. Gate `SUPPORT_CRAVING_TOOL_ENABLED` + tarjeta «Prevista» mientras sea `false`.
2. Apertura in-memory; `resolveSupportToolQueryParam` siempre `null`.
3. Somi: assets existentes; tamaño `medium`, composición centrada sobre el encabezado.
4. Ola SVG + CSS (capas cian/violeta); `prefers-reduced-motion`.
5. Ayuda/emergencias visibles en todos los pasos; salida nunca bloqueada.
6. Referencias educativas en `<details>` discreto, con notas de alcance (p. ej. alcohol vs general).
7. Columna de contenido ~720px centrada; progreso de 5 segmentos + label accesible.

---

## Flujo (5 pasos)

1. Acogida → comenzar
2. Presente → continuar / omitir
3. Observar (ola) → continuar / omitir
4. Elegir (6 alternativas o continuar sin elegir)
5. Cierre → repetir / estrategias / hub / ayuda

---

## Texto

Fuente tipada: `support-craving-content.ts` v0.1.2 (copy editorial 0.1.1 + presentación 0.1.2).
Hub: `support.json` → títulos «Afrontar el impulso de consumir» / «Coping with cravings».

---

## Capturas / QA

- Capturas definitivas v0.1.2: `docs/review/support/sup-02c-screens/` (10 PNG: mobile-375 + desktop-1440 × 5 pasos). Regeneradas 2026-11-16 con gate temporal `true`; crop del artículo companion (dock fijo oculto solo en captura de revisión).
- Validación controlada del flujo habilitado: `apps/web/scripts/validate-sup-02c-flow.mjs` (bundle con gate `true`, sin bypass público). Ejecutada 2026-11-16: recorrido, skip/back, 6 alternativas, respiración/ayuda, foco teclado, salida, sin id en URL, sin storage/red sensible. Comprobación móvil con dock visible: CTAs scrollables por encima de la barra inferior (nav en flujo flex, no overlay).
- Cierre desarrollo: gate restaurado a `false`; suite web; `tsc`/build convencional; guards E2E; smoke + block E2E; `git diff --check` OK.

---

## Referencias

Ver `sup-02c-references.md`.
