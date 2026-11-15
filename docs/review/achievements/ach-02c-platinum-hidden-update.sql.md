# ACH-02C / ACH-02C-DB — `hidden = false` en platinos de soberanía

**Estado documental ACH-02C (SPA):** cerrado — PR #126, merge `8e502e8`, producto `78ffe9e`; desplegado en producción según el propietario.  
**Estado ACH-02C-DB (Supabase):** **ejecutado y cerrado** (2026-11-15), confirmación del propietario.  
**Propuesta original:** 2026-11-14.  
**Alcance cumplido:** alinear metadatos persistidos de los cuatro platinos con el snapshot web (`hidden: false`).

**Prohibido (sigue vigente como política):** `seedAchievements` wipe, migraciones Prisma para este cambio, automatismos no revisados, cambios a `UserAchievement`.

---

## Resultado ACH-02C-DB (2026-11-15)

| Campo | Valor |
| --- | --- |
| Entorno | Supabase (producción), según propietario |
| Operación | Transaccional, limitada a los cuatro IDs autorizados |
| Estado previo | Cuatro platinos con `hidden = true` |
| Estado posterior | Cuatro platinos con `hidden = false` (confirmado por el propietario) |
| `UserAchievement` | No modificado |
| `seedAchievements` | No ejecutado |

### Validaciones por alcance (no confundir)

| Alcance | Qué cubre |
| --- | --- |
| Local | Suite web / typecheck / build de ACH-02C; PG de ACH-02B en `soma_ach02b_pg` |
| DEMO Chromium | Etiquetas «Colección completa» / «Complete collection»; secretos sellados ES/EN |
| Producción SPA | Despliegue ACH-02C confirmado por el propietario (**sin** SHA Render inventado aquí) |
| Producción BD | ACH-02C-DB: `hidden=false` en los cuatro platinos (confirmación del propietario) |

Residual ajeno: validación LIVE de comprensión **UX-10** (no forma parte de ACH-02C-DB).

---

## Identificadores autorizados

| id | tier esperado |
| --- | --- |
| `alcohol-sovereignty-platinum` | `platinum` |
| `nicotine-sovereignty-platinum` | `platinum` |
| `cannabis-sovereignty-platinum` | `platinum` |
| `cocaine-sovereignty-platinum` | `platinum` |

---

## Script de referencia (propuesta histórica ACH-02C)

Propuesta autorizada el 2026-11-14. ACH-02C-DB confirmó el **resultado** (UPDATE transaccional limitado a los cuatro IDs; `hidden=true` → `hidden=false`) **sin** registrar aquí el transcript SQL exacto de Supabase. Este bloque **no** se afirma como el script ejecutado byte a byte. Conservado para auditoría. **No** reejecutar sin autorización explícita.

```sql
BEGIN;

-- 1) Consulta previa: filas que se pretende tocar
SELECT id, tier, hidden
FROM "Achievement"
WHERE id IN (
  'alcohol-sovereignty-platinum',
  'nicotine-sovereignty-platinum',
  'cannabis-sovereignty-platinum',
  'cocaine-sovereignty-platinum'
)
ORDER BY id;

-- 2) Comprobación de identificadores y tier (debe devolver 4)
--    Abortar (ROLLBACK) si el conteo no es 4 o algún tier ≠ platinum.
DO $$
DECLARE
  n integer;
  bad integer;
BEGIN
  SELECT COUNT(*) INTO n
  FROM "Achievement"
  WHERE id IN (
    'alcohol-sovereignty-platinum',
    'nicotine-sovereignty-platinum',
    'cannabis-sovereignty-platinum',
    'cocaine-sovereignty-platinum'
  );

  SELECT COUNT(*) INTO bad
  FROM "Achievement"
  WHERE id IN (
    'alcohol-sovereignty-platinum',
    'nicotine-sovereignty-platinum',
    'cannabis-sovereignty-platinum',
    'cocaine-sovereignty-platinum'
  )
  AND tier IS DISTINCT FROM 'platinum';

  IF n <> 4 OR bad <> 0 THEN
    RAISE EXCEPTION
      'ACH-02C abort: expected 4 sovereignty platinums with tier=platinum (found n=%, bad_tier=%)',
      n, bad;
  END IF;
END $$;

-- 3) UPDATE limitado a esos cuatro IDs (idempotente si ya están en false)
UPDATE "Achievement"
SET hidden = false
WHERE id IN (
  'alcohol-sovereignty-platinum',
  'nicotine-sovereignty-platinum',
  'cannabis-sovereignty-platinum',
  'cocaine-sovereignty-platinum'
)
AND tier = 'platinum';

-- 4) Verificación posterior (hidden debe ser false en las 4)
SELECT id, tier, hidden
FROM "Achievement"
WHERE id IN (
  'alcohol-sovereignty-platinum',
  'nicotine-sovereignty-platinum',
  'cannabis-sovereignty-platinum',
  'cocaine-sovereignty-platinum'
)
ORDER BY id;

-- 5) Rollback de la transacción si la verificación no cuadra:
--    ROLLBACK;
--    (no continuar)

-- 6) Solo tras verificación humana explícita:
--    COMMIT;
```

### Procedimiento de rollback **antes** del `COMMIT` (referencia)

1. Mantener la sesión abierta con la transacción sin confirmar.
2. Si el `SELECT` posterior muestra `hidden = true`, filas de más/menos, o `tier` inesperado → `ROLLBACK;`.
3. Si hace falta deshacer un `COMMIT` ya aplicado (solo con autorización aparte), el reverso puntual sería:

```sql
BEGIN;
UPDATE "Achievement"
SET hidden = true
WHERE id IN (
  'alcohol-sovereignty-platinum',
  'nicotine-sovereignty-platinum',
  'cannabis-sovereignty-platinum',
  'cocaine-sovereignty-platinum'
)
AND tier = 'platinum';
-- Verificar SELECT; COMMIT solo si procede.
```

Ese reverso **no** debe ejecutarse sin autorización.

---

## Garantías

- No toca `UserAchievement`.
- No borra ni recrea el catálogo (a diferencia de `seedAchievements`).
- No altera `family`, `tier`, umbrales ni IDs.
- Idempotente: reejecutar con `hidden` ya en `false` no cambia el resultado lógico.

---

## Relación con la SPA

La galería web usa el snapshot generado (`achievement-catalog.generated.ts`), donde los platinos ya están `hidden: false`. El desbloqueo usa `tier`, no `hidden`. ACH-02C-DB alineó la BD persistida con esa decisión (D4).
