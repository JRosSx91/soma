# SUP-02E — Acompañamiento después de volver a consumir

| Campo | Valor |
|---|---|
| Product id (interno) | `after.use.companion` |
| Apertura hub | Estado en memoria de `SupportPage` |
| Invitación post-guardado | **Deshabilitada en esta release** (`SUPPORT_AFTER_USE_INVITE_ENABLED = false`); hub voluntario activo |
| Hand-off invite → companion | Flag en memoria de módulo (sin `location.state` / URL) |
| Query `?tool=` | Siempre se elimina; **nunca** abre la herramienta |
| `contentVersion` | `0.2.0` |
| `implementationStatus` | `implemented` |
| `editorialStatus` | `editorial_review_done` |
| `safetyStatus` | `safety_review_done` |
| `clinicalStatus` | `external_clinical_validation_not_done` |
| `publicationStatus` | `enabled_pending_production` |
| `publicationGate` | `awaiting_express_production_release` |
| Evidencia de producción | Hub de PR #128 visible en Render según propietario; SHA no verificado independientemente |
| Allow-list | `SUPPORT_AFTER_USE_TOOL_ENABLED = true` |

## Decisiones

1. **No clasificar recaída ni asumir consumo reciente.** La API hace replace ciego de `SubstanceUsage`. Un diff abstinent→active o `lastUseDate` más reciente también puede ser una corrección. La invitación lo dice explícitamente.
2. **Acceso voluntario desde Apoyo** (tarjeta «Después de volver a consumir») es el canal principal.
3. **Invitación post-save** (secundaria): cableada pero **apagada** en esta release (`SUPPORT_AFTER_USE_INVITE_ENABLED = false`) hasta validación LIVE autenticada. El hub voluntario permanece habilitado.
4. **XP / logros:** el copy afirma conservación conforme a las reglas actuales del producto.
5. **Seguridad primero** en el paso «Un momento para cuidarte»: sobredosis / síntomas graves / peligro inmediato → emergencias; sin recomendar agua ni respiración como respuesta inmediata al consumo.
6. **Somi** `supportive`; ilustración propia de tarjeta `support-after-use` añadida en PR #128.

## Flujo renderizado (fuente tipada)

Pasos reales en `AFTER_USE_COMPANION_STEPS` / `support-after-use-content.ts`:

1. **welcome** — «Tu camino no empieza de cero» (+ conservación XP/logros)
2. **care** — «Un momento para cuidarte» (prioridad de seguridad)
3. **recognize** — «Reconocer lo ocurrido sin juzgarte»
4. **forward** — «Un pequeño paso hacia adelante»
5. **close** — «Estamos aquí si lo necesitas» (hub / respiración opcional / ayuda)

Banner de emergencia + enlaces de ayuda presentes en **todos** los pasos.

## Capturas

`docs/review/support/sup-02e-screens/` — capturas finales de cinco pasos en 375 y 1440; PR #128 añade el arte propio de la tarjeta.

## Limitaciones

- Sin historial servidor de usos previos; la heurística es solo cliente.
- DEMO no edita perfil; la invitación automática no aplica en DEMO ni en esta release.
- Validación clínica externa no realizada.
- Hub desplegado según confirmación visual del propietario tras PR #128; SHA Render no verificado independientemente.

## QA final (2026-11-16)

- Acompañamiento 5 pasos verificado en DEMO (E2E + script controlado).
- QA comunicado para PR #128: 1133/1133 tests web y 4/4 recorridos E2E.
- Invitación LIVE automática **no** verificada de extremo a extremo → **deshabilitada**.
- Validación clínica externa: **no realizada**.

Política: `editorial-policy.md`.
