# SUP-02 — Registro de release y rollback

## Alcance

Publicación conjunta ejecutada mediante PR #127 (enablement) y PR #128 (pulido visual), según confirmación del propietario:

- SUP-02B — `relapse.prevention`
- SUP-02C — craving companion
- SUP-02D — acceso Inicio → Apoyo (ya en árbol; sin gate)
- SUP-02E — after-use companion (hub voluntario; **invite LIVE off**)

## QA final (2026-11-16)

### API `JournalEntry.clientOpId` (18 fallos)

- **Causa:** la base local `soma` **no tiene** la columna `clientOpId` ni la migración `20261109140000_journal_entry_idempotency` aplicada (26 migraciones sí; esa no).
- El **schema Prisma** y el **cliente regenerado** (`prisma generate`) sí conocen `clientOpId`.
- Contraste en **HEAD `5260ea1`** (sin cambios SUP-02): mismos fallos pg journal (`The column clientOpId does not exist`).
- **Conclusión:** drift de schema local preexistente; **no es regresión SUP-02**. No se ejecutaron migraciones (prohibido en este hito).

### Invitación LIVE SUP-02E

- Validación E2E autenticada con API simulada no viable sin complejidad adicional.
- **Acción:** `SUPPORT_AFTER_USE_INVITE_ENABLED = false` (hub voluntario permanece `TOOL_ENABLED = true`).
- Flag one-shot / heurística / UI de invite conservados apagados por el switch.

### Producto

- SUP-02B/C/E gates on; SUP-02D operativo; invite automática SUP-02E off.
- Companion 5 pasos + emergencia verificados (Playwright + script DEMO).
- QA comunicado para PR #128: **1133/1133 tests web** y **4/4 recorridos E2E** satisfactorios. Este sync no repite las baterías.
- Validación clínica externa: **no realizada**.

### Producción

- El propietario confirma visualmente que PR #128 aparece desplegada en Render.
- No se recopió el SHA del panel ni se realizó verificación independiente; la confirmación del propietario es la evidencia disponible.
- La validación E2E LIVE autenticada de la invitación no se realizó; el switch debe permanecer `false`.

## Pipeline ejecutado / evidencia pendiente

1. Enablement: PR #127 fusionada.
2. Pulido visual: PR #128 fusionada.
3. QA comunicado: web 1133/1133; E2E 4/4.
4. Deploy: confirmado visualmente por el propietario, sin SHA Render independiente.
5. Pendiente específico: E2E LIVE autenticada de invite antes de considerar encenderla.

## Rollback

- Revert del commit de enablement (gates `false` / sacar `relapse.prevention` del allow-list) y redeploy por el mismo pipeline.
- SUP-02D (tarjeta Inicio) puede permanecer: es solo navegación al hub.
- No requiere migración de base de datos ni cambios de API.

## Estados documentales

| Pieza | Editorial | Seguridad | Clínica externa | Local | Producción |
|---|---|---|---|---|---|
| 02B | Completada | Completada | No realizada | Habilitada | Desplegada según propietario; SHA no verificado |
| 02C | Completada | Completada | No realizada | Habilitada | Desplegada según propietario; SHA no verificado |
| 02D | Completada | Completada | N/A (UI acceso) | En árbol | Desplegada según propietario; SHA no verificado |
| 02E | Completada | Completada | No realizada | Hub on / invite off | Hub desplegado según propietario; invite off |
