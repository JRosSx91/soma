# SUP-02C — Afrontar el impulso de consumir

| Campo | Valor |
|---|---|
| Product id (interno) | `craving.companion` |
| Apertura | Estado en memoria de `SupportPage` (sin ID en la URL) |
| Query legacy `?tool=` | Siempre se elimina; **nunca** abre la herramienta |
| `contentVersion` | `0.1.2` |
| `implementationStatus` | `implemented` |
| `editorialStatus` | `editorial_review_done` |
| `safetyStatus` | `safety_review_done` |
| `clinicalStatus` | `external_clinical_validation_not_done` |
| `publicationStatus` | `enabled_pending_production` |
| `publicationGate` | `awaiting_express_production_release` |
| Allow-list | `SUPPORT_CRAVING_TOOL_ENABLED = true` |
| Runtime | `support-craving-tool.ts`, `support-craving-content.ts`, `craving-companion-session.ts`, `CravingCompanionTool.tsx`, `UrgeWaveVisual.tsx` |

**Implementación técnica:** completada.
**Revisión editorial interna:** completada (copy 0.1.1).
**Refinamiento visual:** completado (layout íntimo 0.1.2).
**Revisión de seguridad:** completada.
**Validación clínica externa:** **no realizada**.
**Habilitación local:** gate `true` (release conjunta SUP-02).
**Publicación en producción:** **pendiente** de autorización expresa.

No es una intervención clínicamente validada. Política: `editorial-policy.md`.

---

## Privacidad por diseño

1. El acompañamiento se abre con `cravingOpen` en `SupportPage` (memoria React).
2. El id de producto **no** se escribe en la URL durante el uso normal.
3. Cualquier `?tool=…` (incluido `craving.companion`) se elimina y no monta la UI.
4. Sin `localStorage` / `sessionStorage` / IndexedDB / cookies / telemetría específica / API / XP / Bitácora.
5. DOM: `data-craving-companion` sin valor de producto; `data-craving-step` / `data-craving-choice` / `data-craving-nav` solo para testing y a11y.

### Limitaciones (infraestructura / hosting)

Aunque la app no envíe telemetría propia, un proveedor de hosting, CDN, proxy o el historial del navegador podrían registrar rutas genéricas (`/preview/support`, `/app/support`) o errores de red. Eso **no** incluye el id `craving.companion` en query si el strip funciona.

---

## Flujo

1. Hub Apoyo → tarjeta «Afrontar el impulso de consumir» → abrir.
2. Cinco pasos: welcome → ground → observe → choose → close.
3. Salida / reinicio: Salir vuelve al hub; reabrir reinicia el flujo en memoria.
4. Recursos de ayuda y emergencias visibles durante la experiencia.

## Capturas

`docs/review/support/sup-02c-screens/` — mobile-375 y desktop-1440.
