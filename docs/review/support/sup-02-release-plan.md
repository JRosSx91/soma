# SUP-02 — Plan de despliegue y rollback

## Alcance

Publicación conjunta (cuando se autorice):

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

- SUP-02B/C/E gates locales on; SUP-02D operativo.
- Companion 5 pasos + emergencia verificados (Playwright + script DEMO).
- Validación clínica externa: **no realizada**.

## Pipeline

1. Revisión final humana del diff de enablement.
2. Commit autorizado.
3. Push a `origin/develop` + PR habitual (solo con autorización expresa).
4. CI verde.
5. Merge a `main` según pipeline del repo.
6. Deploy de producción.
7. Smoke post-deploy (hub Apoyo, Inicio→Apoyo, craving, after-use, ficha relapse, ES/EN, emergencia, sin `?tool=`; sin invite automática).

## Rollback

- Revert del commit de enablement (gates `false` / sacar `relapse.prevention` del allow-list) y redeploy por el mismo pipeline.
- SUP-02D (tarjeta Inicio) puede permanecer: es solo navegación al hub.
- No requiere migración de base de datos ni cambios de API.

## Estados documentales

| Pieza | Editorial | Seguridad | Clínica externa | Local | Producción |
|---|---|---|---|---|---|
| 02B | Completada | Completada | No realizada | Habilitada | Pendiente |
| 02C | Completada | Completada | No realizada | Habilitada | Pendiente |
| 02D | Completada | Completada | N/A (UI acceso) | En árbol | Pendiente de release conjunta |
| 02E | Completada | Completada | No realizada | Hub on / invite off | Pendiente |
