# ACH-02C — Propuesta SQL: `hidden = false` en platinos de soberanía

**Estado:** propuesta **no ejecutada**.  
**Fecha:** 2026-11-14.  
**Alcance:** alinear metadatos persistidos de los cuatro platinos con el snapshot web (`hidden: false`).  
**Prohibido aquí:** `seedAchievements`, migraciones Prisma, automatismos, cambios a `UserAchievement`, ejecución en producción sin autorización explícita posterior.

Los platinos en el seed/local regenerado ya usan `hidden: false`. Entornos cuya tabla `Achievement` aún tenga `hidden: true` (p. ej. bases sembradas antes de ACH-02B) necesitan este `UPDATE` puntual.

---

## Identificadores autorizados

| id | tier esperado |
| --- | --- |
| `alcohol-sovereignty-platinum` | `platinum` |
| `nicotine-sovereignty-platinum` | `platinum` |
| `cannabis-sovereignty-platinum` | `platinum` |
| `cocaine-sovereignty-platinum` | `platinum` |

---

## Script transaccional (idempotente)

Ejecutar solo en un entorno autorizado, con revisión humana del `SELECT` previo. **No** ejecutar en este hito.

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

### Procedimiento de rollback **antes** del `COMMIT`

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

Ese reverso **no** forma parte de ACH-02C y **no** debe ejecutarse sin autorización.

---

## Garantías

- No toca `UserAchievement`.
- No borra ni recrea el catálogo (a diferencia de `seedAchievements`).
- No altera `family`, `tier`, umbrales ni IDs.
- Idempotente: reejecutar con `hidden` ya en `false` no cambia el resultado lógico.

---

## Relación con la SPA

La galería web usa el snapshot generado (`achievement-catalog.generated.ts`), donde los platinos ya están `hidden: false`. El desbloqueo usa `tier`, no `hidden`. Este SQL alinea la API LIVE / BD persistida con esa decisión (D4).
