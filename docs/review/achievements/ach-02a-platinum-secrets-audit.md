# ACH-02A — Auditoría de platinos y logros secretos (UX-10 / UX-11 / UX-12)

Documento de auditoría. **Sin cambios de código** en ACH-02A; sin commit / push / PR / merge / despliegue en ese hito.
Fecha: **2026-11-13**.
Objetivo: preparar la corrección de UX-10–12 **sin comprometer** logros ya persistidos en la beta pública.

### Aprobación de producto (post-auditoría)

| Decisión | Resolución | Fecha |
|---|---|---|
| D1 | **D1-A** — todas las curvas alcanzables no-platino de S | 2026-11-13 |
| D2 | **D2-No** — temporales fuera de `required(S)` | 2026-11-13 |
| D3 | **D3-A** — solo conjunto; sin umbral 0,99 adicional | 2026-11-13 |
| D4 | **D4-Sí** — platinos con `hidden: false` | 2026-11-13 |

Implementación: **ACH-02B** (`ach-02b-implementation.md`).

---

## 0. Estado Git (inspección)

| Ref | Valor |
|---|---|
| Rama local | `develop` |
| `HEAD` / `origin/develop` | `a02adf2` — `perf(web): decouple hero LCP from intro animation (PERF-01E)` |
| `origin/main` | `cf33d1a` — **Merge pull request #124** from `develop` (incluye PERF-01E / producto `a02adf2`) |
| Working tree código | Limpio de tracked/staged |
| Untracked ajenos | Preservados (`docs/design/*`, capturas, inventarios previos en `docs/review/`) |

No se sincronizaron ramas locales con `main`. No merge / rebase / reset / cherry-pick.

**Nota para el roadmap (sin editarlo aquí):** varias filas de estado siguen citando SHAs antiguos (`c519bb3`, PERF-01C como “local”, etc.). Tras #124, `main` ya contiene PERF-01E. UX-11 sigue “Pendiente”; UX-12 “Parcialmente implementado”; la evidencia de UX-12 sobre `Bloqueado. {tierLabel}` está **desactualizada** respecto al código actual (ver §3).

---

## 1. Hallazgos confirmados

### 1.1 Catálogo

| Hecho | Evidencia |
|---|---|
| **156** IDs (106 `curve` + 50 `temporal`) | `achievement-catalog.generated.ts`; seed API |
| **149** alcanzables / **7** `ruleReview: true` | Generador: `ruleReview = !curves.has(organ\|substance)` |
| **4** platinos de soberanía | `alcohol\|nicotine\|cannabis\|cocaine-sovereignty-platinum` |
| Cafeína **sin** platino | 8 curvas cafeína; 6 en `ruleReview`; 2 alcanzables |
| **8** `hidden: true` | 4 secretos bronce + **4 platinos** |
| Platinos: `threshold: 0.99`, `organId: brain-vta`, `hidden: true`, `ruleReview: false` | Seed + snapshot web |

Siete no disponibles (IDs exactos):

1. `cocaine-hippocampus-gold-1`
2. `caffeine-vta-bronze-1`
3. `caffeine-vta-bronze-2`
4. `caffeine-vta-silver-1`
5. `caffeine-vta-silver-2`
6. `caffeine-vta-silver-3`
7. `caffeine-vta-silver-4`

Secretos no platino (alcanzables, `hidden`):

- `alcohol-acute-survival-bronze`
- `nicotine-vta-bronze`
- `cannabis-vta-bronze-1`
- `cocaine-vta-bronze-1`

Curvas alcanzables **excluyendo** el platino de esa sustancia (candidatos naturales a “conjunto de soberanía”):

| Sustancia | Curvas totales | Alcanzables | Alcanzables sin platino |
|---|---:|---:|---:|
| alcohol | 29 | 29 | **28** |
| nicotine | 21 | 21 | **20** |
| cannabis | 20 | 20 | **19** |
| cocaine | 28 | 27 | **26** (excluye hippocampus gold) |
| caffeine | 8 | 2 | 2 (sin platino) |

Cada sustancia tiene además **10** temporales (familia distinta).

### 1.2 Desbloqueo actual (reglas reales)

- Función pura: `planAchievementUnlocks` en `packages/shared-types/src/recovery-math.ts`.
- **No hay rama especial para platino**: se evalúa como cualquier curva (`threshold` vs `curveProgress`).
- Sin curva → no se planifica (las 7 `ruleReview` **nunca** se conceden).
- Persistencia: `detectAndPersistUnlocks` → `insertUserAchievementsIgnoringConflicts` (`ON CONFLICT DO NOTHING RETURNING`).
- Política: **insert-only**; recaída / cambio de fecha **no revoca** (ACH-REV / ACH-01C.1).
- LIVE: `GET /me/achievements` detecta + lista. DEMO `/preview`: **sin** API de logros; catálogo solo.

### 1.3 Presentación UI (Logros 2.0)

- `isSealedAchievement`: `hidden && !unlocked && tier !== "platinum"` → los **platinos no se sellan** aunque `hidden: true` en catálogo.
- Secreto sellado (ficha): título `???` / `hidden.title`, medalla disco de candado (**sin** silueta de tramo), copy genérico; **no** muestra Bronce/Plata/Oro.
- Platino bloqueado: medalla de platino visible, etiqueta de rareza, umbral 99 %, órgano, título y descripción.
- `ruleReview`: bucket `unavailable`, contadores “Pendientes de definición”, detalle `reviewDetail`; **excluidos** del denominador de colección (`hasUnlockRule` / `collectionTotal`).
- Búsqueda: títulos de secretos sellados **no** coinciden; sí por sustancia.
- Landing: showcase con disco **sellado** de platino (decorativo, no catálogo live).

### 1.4 Qué ya está corregido vs qué sigue abierto

| Requisito | Estado real en código |
|---|---|
| UX-10 — distinguir no disponibles | **Mayormente cumplido** (UI + exclusión de progreso). Residual: validación LIVE de comprensión. |
| UX-11 — platino = conjunto | **No cumplido** (sigue umbral 0,99). |
| UX-12 — secretos sin tramo; platinos no secretos | **Parcialmente cumplido** en UI (`isSealedAchievement` + ficha). Catálogo aún marca platinos `hidden: true` (inconsistencia de datos). |

---

## 2. Reglas actuales (resumen operativo)

1. Existencia en seed/generador ≠ alcanzabilidad (`ruleReview`) ≠ publicación UI ≠ comportamiento de desbloqueo.
2. Desbloqueo curva = `curveProgress >= threshold` con uso abstinente + `lastUseDate`.
3. Desbloqueo temporal = días de abstinencia ≥ umbral.
4. Una fila `UserAchievement` es el único criterio de “obtenida” en galería LIVE.
5. Medallas **no** conceden XP (GAM-01 / ledger aparte).
6. Idempotencia: conflicto único `(userId, achievementId)` → no duplicar.

---

## 3. Contradicciones con UX-10–12

### UX-10

- Criterio roadmap: UI distingue y explica. **Cumplido** en galería 2.0.
- Contradicción menor: el roadmap aún dice “pendiente de validación”; el producto ya excluye los 7 del progreso. No inventar reglas científicas nuevas.

### UX-11

- Criterio: el platino **no** debe desbloquearse solo con umbral. **Contradicción directa** con `planAchievementUnlocks` + seed `0.99`.
- Un usuario puede tener el platino **sin** el resto de medallas de la sustancia (si el VTA llega a 0,99 antes o sin coleccionar el resto).
- Cafeína no entra (sin platino).

### UX-12

- Criterio: ficha sellada de secreto **sin** tramo; platinos visibles como platino, sin patrón `???`.
- **UI actual** ya oculta el tramo en secretos sellados y muestra platinos abiertos.
- Contradicción de **modelo de datos**: los 4 platinos siguen `hidden: true` (misma bandera que los secretos).
- Evidencia del roadmap (`Bloqueado. {tierLabel}`) **no coincide** con `AchievementsPage` actual (ficha sellada → `Oculto.` + descripción genérica).
- Residual UX: etiqueta de rareza en `AchievementMedal` hardcodeada en español (`Platino`, etc.) aunque la UI esté en EN; filtro por rareza “Bronce” puede listar el slot del secreto (sin revelar título, pero sí que existe un bronce oculto en esa sustancia).

---

## 4. Propuesta de reglas (diseño — no implementado)

### 4.1 UX-11 — Elegibilidad de platino (propuesta)

**Definición recomendada (determinista):**

Para `S ∈ {alcohol, nicotine, cannabis, cocaine}`:

```
required(S) = { id ∈ curve catalog |
  substanceId = S
  ∧ tier ≠ platinum
  ∧ ruleReview ≠ true }

platinum(S) se planifica solo si
  required(S) ⊆ (alreadyUnlockedIds ∪ plannedNonPlatinumThisPass)
```

- **Temporales:** **fuera** del conjunto por defecto (familia distinta; “soberanía” fisiológica ≠ reloj de días). Decisión de producto si se quieren incluir.
- **Secretos bronce** de la sustancia: **sí** entran (son alcanzables y pertenecen a la colección de curvas).
- **`ruleReview`:** **excluidos** (nunca desbloqueables → si se exigieran, el platino de cocaína sería imposible).
- **Umbral 0,99:** dejar de ser condición suficiente. Opciones:
  - **A (preferida):** eliminar dependencia del umbral para platinos; solo conjunto.
  - **B:** conservar 0,99 **y** conjunto (más estricto; puede retrasar el platino tras completar la colección).
- **Cafeína:** sin cambio (no hay platino).

**Cálculo en una sola transacción (anti-carrera):**

1. Planificar desbloqueos no-platino como hoy.
2. Construir `owned = alreadyUnlocked ∪ newlyPlanned`.
3. Evaluar platinos contra `required(S) ⊆ owned`.
4. Insertar todo con `ON CONFLICT DO NOTHING` (idempotente; dos GET concurrentes no duplican).

No hace falta migración de filas existentes.

### 4.2 UX-12 — Presentación (propuesta)

1. **Datos:** `hidden: false` en los cuatro platinos (seed + regenerar snapshot web), alineando catálogo con UI.
2. **Secretos:** mantener sello sin tramo; no revelar título/descripción/progreso hasta `UserAchievement`.
3. **Platinos bloqueados:** visibles como platino (arte + rareza); copy que explique “culminación de la colección de curvas de {sustancia}” cuando UX-11 esté activo (texto nuevo ES/EN).
4. **Accesibilidad:** nombre accesible del sello = “Oculto” / “Hidden”, no el tier; al desbloquear, anunciar título real.
5. **Filtro por rareza:** aceptar que un secreto bronce aparezca como slot sellado bajo filtro Bronce, **o** (alternativa) ocultar secretos sellados de filtros de rareza — decisión de producto menor.

### 4.3 UX-10 — Sin cambio de catálogo científico

- Conservar los 7 como `ruleReview` / no disponibles.
- No inventar curvas ni umbrales.
- Confirmar en copy que **no bloquean** el platino (implícito si `required` excluye `ruleReview`).

---

## 5. Impacto sobre usuarios existentes

| Escenario | Política propuesta |
|---|---|
| Usuario **ya** tiene un platino por 0,99 | **Conservar** la fila. No revocar. Insert-only. |
| Usuario tiene platino **sin** colección completa | Historial válido; no se recalcula hacia atrás. |
| Usuario **casi** en 0,99 pero sin colección | Tras ACH-02B **no** recibirá platino hasta completar `required(S)`. |
| Usuario completa colección después | Recibe platino en el siguiente `detectAndPersistUnlocks` (idempotente). |
| DEMO | Sin cambio de persistencia (no hay unlocks de cuenta). |
| XP / niveles | Sin impacto (medallas ≠ `XpGrant`). |
| Notificaciones / celebración | Solo si hay **nuevo** insert de platino; no re-celebrar filas antiguas. |

**Retroactividad:** no migrar ni “corregir” concesiones previas. Documentar en release notes internas que el significado del platino cambia **hacia adelante**.

---

## 6. Archivos que requerirían cambios (ACH-02B+)

| Área | Rutas probables |
|---|---|
| Regla pura | `packages/shared-types/src/recovery-math.ts` (+ tests) |
| API | `apps/api/src/achievements/achievements.service.ts` (si el planificador necesita metadata `tier`/`hidden`/`ruleReview` no presente hoy en `UnlockCandidate`) |
| Seed / catálogo | `apps/api/prisma/seed/achievements.ts`; regenerar `achievement-catalog.generated.ts` vía `build-achievement-catalog.mjs` |
| Tipos | `UnlockCandidate` / DTOs si hace falta `tier` + flag platino |
| UI copy | `apps/web/src/i18n/locales/{es,en}/achievements.json`; posiblemente detalle en `AchievementsPage.tsx` |
| Vista | `achievements-view.ts` solo si se ajusta copy/filtros; `isSealedAchievement` ya correcto para platinos |
| Docs / roadmap | `ROADMAP.md` (estado UX-11/12) — **fuera de ACH-02A** |

**No tocar en el primer corte:** Prisma schema de `UserAchievement`, migraciones de datos, backend ajeno, SEO, imágenes WebP de medallas (salvo que el producto pida arte nuevo).

---

## 7. Estrategia de tests

1. **Unit (`planAchievementUnlocks`):**
   - Conjunto incompleto → platino no planificado aunque `curveProgress ≥ 0.99`.
   - Conjunto completo en `alreadyUnlocked` → platino planificado.
   - Conjunto se completa **en el mismo pase** (otros IDs planeados) → platino también.
   - `ruleReview` ausente del required → cocaína desbloqueable.
   - Temporales no exigidos (si se adopta la propuesta).
   - Idempotencia: ya unlocked → omitido.
2. **API/PG:** dos `detectAndPersistUnlocks` concurrentes; recaída no borra platino; sin consentimiento especial → sin inserts.
3. **UI:** secretos sellados sin tier; platinos no sellados; contadores 149/7; búsqueda; ES/EN del nuevo copy de culminación.
4. **Regresión:** temporals, inbox, celebrate, DEMO sin sync.

---

## 8. Riesgos y decisiones de producto pendientes

| # | Decisión | Por qué importa |
|---|---|---|
| D1 | ¿`required(S)` = todas las curvas alcanzables no-platino de S? | Define el tamaño (28/20/19/26). |
| D2 | ¿Incluir medallas **temporales**? | Recomendación auditoría: **no**. |
| D3 | ¿Platino = solo conjunto (A) o conjunto ∧ 0,99 (B)? | A es más limpio; B retrasa tras coleccionar. |
| D4 | ¿Poner `hidden: false` en platinos en seed? | Alinea datos con UX-12; regenera snapshot. |
| D5 | ¿Comunicar a usuarios con platino “anticipado”? | No revocar; opcional nota de historial. |
| D6 | ¿Filtro rareza revela existencia de secretos? | Menor; aceptar o ocultar sellados del filtro. |
| D7 | ¿Autorizar cambio de seed/API en beta? | ROADMAP UX-11 hoy dice que **no** autoriza cambiar el seed sin diseño — esta auditoría **es** ese diseño; hace falta OK explícito para ACH-02B. |

Riesgos técnicos:

- Olvidar el segundo pase en la misma transacción → platino imposible el mismo día que el último requisito.
- Exigir `ruleReview` → platino de cocaína imposible.
- Revocar o “reparar” filas → rompe confianza ACH-REV.
- Mezclar temporales en `required` sin copy claro → confusión fisiológico vs tiempo.

---

## 9. Propuesta de implementación ACH-02B (si procede)

**Nombre sugerido:** ACH-02B — Platino por colección + higiene UX-12 de datos.

**Alcance mínimo:**

1. Ampliar candidatos de unlock con `tier` (y opcionalmente `hidden`) desde DB/seed.
2. Implementar gate de platino en `planAchievementUnlocks` (o helper puro dedicado llamado desde ahí).
3. Tests unitarios + al menos un caso PG de “último requisito + platino en el mismo GET”.
4. `hidden: false` en los 4 platinos del seed + regenerar catálogo web.
5. Copy ES/EN de culminación para ficha de platino bloqueado.
6. Actualizar ROADMAP (UX-11 → implementado local / integrado; matizar UX-12) en el mismo tren o hito doc inmediato.
7. **Sin** migración de `UserAchievement`, **sin** revocaciones, **sin** cambios científicos de curvas.

**Fuera de ACH-02B:** validación LIVE cualitativa UX-10; arte nuevo; XP; cafeína platino; ACH-REV C (historial de fechas).

**Orden sugerido:** decisiones D1–D4 del propietario → ACH-02B código → revisión → commit autorizado → PR.

---

## 10. Resumen ejecutivo

- **UX-10:** en código, sustancialmente resuelto; 7 no disponibles claros y fuera del progreso; no bloquean un platino si `required` los excluye.
- **UX-11:** causa confirmada — platinos = umbral VTA 0,99 como cualquier curva; hace falta regla de conjunto + pase anti-carrera; **no revocar** platinos ya dados.
- **UX-12:** UI ya trata platinos como visibles y secretos sin tramo; falta alinear `hidden` en catálogo y refrescar evidencia del roadmap.
- Siguiente hito natural: **ACH-02B** tras decisiones de producto D1–D4.
