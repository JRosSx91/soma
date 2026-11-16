# SUP-02E — Acompañamiento después de volver a consumir

| Campo | Valor |
|---|---|
| Product id (interno) | `after.use.companion` |
| Apertura hub | Estado en memoria de `SupportPage` |
| Invitación post-guardado | Solo LIVE + gate `true` + perfil con seguimiento existente + heurística de diff |
| Hand-off invite → companion | Flag en memoria de módulo (sin `location.state` / URL) |
| Query `?tool=` | Siempre se elimina; **nunca** abre la herramienta |
| `contentVersion` | `0.1.0` |
| `implementationStatus` | `implemented` |
| `editorialStatus` | `pending` |
| `clinicalStatus` | `pending` |
| `publicationStatus` | `unpublished` |
| `publicationGate` | `pending_independent_authorization` |
| Allow-list | `SUPPORT_AFTER_USE_TOOL_ENABLED = false` |

## Decisiones

1. **No clasificar recaída.** La API hace replace ciego de `SubstanceUsage`. Un diff abstinent→active o `lastUseDate` más reciente también puede ser una corrección. La invitación dice explícitamente que **no** clasifica el cambio.
2. **Acceso voluntario desde Apoyo** (tarjeta distinta de craving / hub genérico) es el canal principal mientras el gate esté cerrado (tarjeta «Prevista»).
3. **Invitación post-save** (secundaria): solo tras PUT LIVE OK, gate habilitado, **seguimiento ya existente** (no onboarding inicial) y heurística positiva; descartable; hand-off por flag en memoria + URL genérica `/app/support`.
4. **XP / logros:** verificados en producto (insert-only; sin revoke por cambio de uso). El copy afirma conservación conforme a reglas actuales.
5. **Somi** `supportive`; ilustración de tarjeta reutiliza `support-mindfulness` (sin nuevos assets).
6. **SUP-02B / SUP-02C** intactos y unpublished.

## Flujo

1. Hub Apoyo → tarjeta «Después de volver a consumir» (planned mientras gate false).
2. Con gate true: abrir companion (2 pasos: acogida → cierre con hub / respiración / ayuda).
3. LIVE edición de perfil existente: tras guardado OK + heurística → diálogo «¿Te gustaría recibir apoyo…?» → `/app/support` (memoria) o Inicio.

## Capturas

`docs/review/support/sup-02e-screens/` — mobile-375 y desktop-1440, pasos welcome/close (regeneradas con gate temporal `true`).

## Limitaciones

- Sin historial servidor de usos previos; la heurística es solo cliente.
- DEMO no edita perfil; la invitación no aplica en DEMO.
- Editorial y clínica externa pendientes de cierre formal.
