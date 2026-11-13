# ACH-02B — Platino por colección + higiene UX-12

Implementación local. **Sin commit / push / PR / merge / despliegue** en este hito.
Fecha: **2026-11-13**.
Precedentes: ACH-02A (aprobada); decisiones **D1-A / D2-No / D3-A / D4-Sí**.

---

## 1. Estado Git

| Ref | Valor |
|---|---|
| Rama | `develop` |
| HEAD / `origin/develop` | `a02adf2` (PERF-01E) |
| `origin/main` | `cf33d1a` (merge PR #124, PERF-01E) |
| Working tree | Cambios ACH-02B + untracked ajenos preservados |

Sin merge / rebase / reset / cherry-pick. Sin sincronización automática con `main`.

---

## 2. Arquitectura

1. **Regla pura** en `packages/shared-types/src/recovery-math.ts`:
   - `platinumRequirementIds(achievements, curves, substanceId)`
   - `planAchievementUnlocks`: pase 1 = no-platino (curva/temporal como antes); pase 2 = platinos si `required(S) ⊆ alreadyUnlocked ∪ planned`.
2. **API** pasa `tier` al planificador; insert-only + lock de usuario + `ON CONFLICT DO NOTHING` sin cambios de semántica.
3. **Catálogo:** cuatro platinos `hidden: false` en seed; snapshot web regenerado (`4 hidden` = solo secretos bronce).
4. **Frontend:** copy de colección ES/EN; progreso `platinumCollectionProgress`; platinos no usan barra de umbral 0,99; secretos sellados intactos.

**Sin** migración Prisma / schema. **Sin** seeds contra producción.

---

## 3. `required(S)` efectivo

```
family = curve
∧ substanceId = S
∧ tier ≠ platinum
∧ existe curva organ×substance  (equivale a ruleReview ≠ true en el snapshot web)
```

Temporales: **excluidos**. Propio platino: **excluido**. Otras sustancias: **excluidas**.

Contraste catálogo actual (tests; **no** constantes de negocio): alcohol **28**, nicotina **20**, cannabis **19**, cocaína **26**. Cafeína: sin platino (2 curvas alcanzables).

---

## 4. Usuarios existentes

- Filas `UserAchievement` de platino **conservadas** (no revocar / no reescribir `unlockedAt`).
- Nuevas concesiones solo si la colección está completa (hacia adelante).
- Medallas ≠ XP.

---

## 5. Validaciones ejecutadas

| Suite | Resultado |
|---|---|
| `@soma/shared-types` tests | 88/88 |
| Web suite | 1112/1112 |
| API `test:unit` | 328/329 — fallo ajeno `start-prod.test.ts` (timeout JWT example; no ACH-02B) |
| API `test:pg` ACH-02B | **No ejecutado** (`DATABASE_URL` unset) |
| Web `tsc` + build | OK |
| API `tsc` | OK |
| `git diff --check` | OK |

El test PG `platinum-unlocks.pg.integration.test.ts` queda listo para entorno local con Postgres.

---

## 6. Riesgos residuales

- Entornos cuya tabla `Achievement` aún tenga platinos `hidden: true` hasta una actualización **segura** de metadatos (no `seedAchievements`, que borra catálogo y `UserAchievement`): la galería web usa el snapshot generado (`hidden: false`); el desbloqueo usa `tier`, no `hidden`.
- Validación LIVE cualitativa UX-10 sigue pendiente (fuera de alcance).

---

## 7. ACH-02B-FINAL — evidencia adicional (2026-11-13)

### 7.1 `start-prod.test.ts`

| Hecho | Detalle |
|---|---|
| Test | `start:prod rejects an example JWT_SECRET before listen` |
| Error en suite completa previa | `start:prod did not exit before opening the server` (timeout 10 s del harness) |
| Diff vs `a02adf2` | **Ninguno** en `start-prod.test.ts` ni `scripts/start-prod.cjs` |
| Aislado (ACH-02B, 3×) | **3/3 pass** (≈1,9–3,7 s) |
| Clasificación | **Preexistente / flaky bajo carga de suite**, no introducido por ACH-02B. No se modificó código de producción ni el test. |

### 7.2 PostgreSQL

| Hecho | Detalle |
|---|---|
| `apps/api/.env` | `DATABASE_URL` → `postgresql://localhost:5432/soma` (local) |
| Servidor | **No alcanzable** (`Can't reach database server at localhost:5432`; nada escucha en 5432) |
| Resultado | Integración **no ejecutada**. Para correrla: levantar Postgres local en ese host/puerto con esquema Soma y catálogo `Achievement` (sin seed destructivo sobre datos valorados); luego `npm run test:pg` filtrando ACH-02B / `platinum-unlocks.pg.integration.test.ts`. |
| Idempotencia / concurrencia reales | **No verificadas en PG** en este hito (bloqueadas por el servidor caído). Cubiertas a nivel de regla pura + diseño `ON CONFLICT` / lock existente. |

### 7.3 Metadatos `hidden` en producción

| Capa | Fuente | Efecto de ACH-02B |
|---|---|---|
| Galería web | `achievement-catalog.generated.ts` | Platinos `hidden: false` al desplegar SPA |
| API LIVE | filas `Achievement` en PostgreSQL | Sigue el valor persistido; seed wipe **no** es seguro en prod |
| Desbloqueo | `tier` vía `planAchievementUnlocks` | **No depende** de `hidden` |

`seedAchievements` hace `deleteMany` de `UserAchievement` + `Achievement` y recrea: **solo local/dev**. Para alinear prod: `UPDATE "Achievement" SET "hidden" = false WHERE id IN (…cuatro platinos…)` (u operación equivalente revisada), **sin** wipe. No ejecutado aquí.
