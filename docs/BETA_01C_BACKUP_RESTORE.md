# Soma — backups cifrados (PostgreSQL → R2)

Guía operativa breve. **El sistema no se da por operativo** hasta una ejecución controlada y una restauración real del archivo `.age` en una base **aislada**.

No incluye secretos ni datos personales.

---

## Arquitectura

```text
GitHub Actions (solo rama main)
  environment: production-backups
        │
        ├─ pg_dump --format=custom   (PostgreSQL 17 client)
        ├─ age -r AGE_PUBLIC_KEY     (cifrado local)
        └─ aws s3 cp → Cloudflare R2
              bucket: soma-db-backups
              daily/   retención 7 días  (ciclo de vida R2)
              weekly/  retención 28 días (ciclo de vida R2)
```

La clave **privada** de `age` no está en GitHub. Vive fuera del repositorio, con copia en USB.

CI de PRs (`.github/workflows/ci.yml`) no forma parte de este flujo y no almacena backups.

---

## Secretos (solo nombres)

Environment GitHub `production-backups` (restringido a `main`):

| Nombre | Uso |
| --- | --- |
| `SUPABASE_BACKUP_DATABASE_URL` | URI de PostgreSQL para `pg_dump` (conexión **directa**, no el pooler transaccional :6543) |
| `AGE_PUBLIC_KEY` | Receptor `age1…` (solo pública) |
| `R2_ACCOUNT_ID` | Endpoint `https://<id>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | API S3 de R2 |
| `R2_SECRET_ACCESS_KEY` | API S3 de R2 |

No versionar valores. No pegar URIs en issues, chats ni logs.

---

## Frecuencia y retención

| Copia | Cuándo | Prefijo R2 | Retención |
| --- | --- | --- | --- |
| Diaria | Cron `0 3 * * *` (03:00 UTC; GitHub puede retrasar minutos) | `daily/` | 7 días (R2) |
| Semanal | Mismo dump cifrado, solo **domingo UTC** | `weekly/` | 28 días (R2) |

Disparo extra: `workflow_dispatch` **desde `main`**.

El cron de GitHub Actions usa el workflow de la **rama por defecto**, que en este repositorio es `main`. Si esa rama dejara de ser `main`, el programado dejaría de coincidir con el environment.

Este job **no borra** objetos: la caducidad la aplica Cloudflare R2.

Un backup diario **no** es PITR: se pierde todo lo escrito después del dump.

---

## Comprobar que existe un backup

1. GitHub → Actions → **Database backups** → última ejecución **verde** (día UTC actual o anterior inmediato).
2. Cloudflare R2 → bucket `soma-db-backups` → `daily/` → objeto `soma-<YYYYMMDDTHHMMSSZ>.dump.age` reciente.
3. Los domingos UTC, el mismo nombre debe aparecer también en `weekly/`.

Si el workflow falla **varios días seguidos**, R2 puede vaciar `daily/` por el ciclo de vida **aunque** no haya copias nuevas. Señales: Actions en rojo o sin ejecuciones; `daily/` sin objetos recientes. Entonces usar `weekly/` (hasta 28 días) y corregir el job **antes** de que caduque esa copia.

Activar notificaciones de GitHub por workflow fallido (Settings → Notifications / watching del repo).

---

## Descargar una copia cifrada

Desde una máquina de confianza, con credenciales R2 **locales** (no las subas al repo):

```bash
aws s3 cp s3://soma-db-backups/daily/soma-YYYYMMDDTHHMMSSZ.dump.age ./soma.dump.age \
  --endpoint-url "https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com"
```

Sustituir el nombre de objeto por el listado real. No commitear el `.age`.

---

## Descifrar (local)

Necesitas el fichero de clave privada de `age` (nunca en GitHub):

```bash
age -d -i /ruta/a/age-identity.txt -o soma.dump soma.dump.age
```

El `.dump` es formato **custom** de PostgreSQL (`pg_restore`). Borrar el plaintext al terminar.

---

## Restaurar en una base aislada

**Nunca** contra producción.

1. Crear (o usar) un PostgreSQL 17 vacío, local o un proyecto Supabase **aparte**.
2. Restaurar:

```bash
pg_restore --verbose --no-owner --no-acl --dbname="<URI_AISLADA>" soma.dump
```

Si la base no está vacía, `--clean` puede ser necesario; sigue siendo un destino de prueba.

3. Comprobar, sin volcar filas personales:

```bash
psql "<URI_AISLADA>" -c "SELECT 1"
psql "<URI_AISLADA>" -c "SELECT COUNT(*) FROM _prisma_migrations"
```

Opcional: `pnpm --filter @soma/api exec prisma migrate status` apuntando **solo** a esa URI.

4. Borrar dump descifrado, ciphertext local y la base de prueba cuando acabes.

---

## Si falla el workflow

1. Abrir el run en Actions. Leer el paso en rojo (`Install…` vs `Dump, encrypt, and upload`).
2. No buscar secretos en los logs; el script no debe imprimirlos. Si un log los mostrara, rotar credenciales.
3. Causas frecuentes: URI inalcanzable, SSL, cuota, R2 403, `AGE_PUBLIC_KEY` mal formada, cron no en `main`.
4. Corregir configuración **en el environment / proveedores**, no parchear secretos en git.
5. Cuando esté verde de nuevo, disparar `workflow_dispatch` en `main` y verificar un objeto nuevo en `daily/`.
6. Si `daily/` está vacío, restaurar desde `weekly/` si aún existe.

---

## Riesgos de privilegios (sin cambiar producción ahora)

- **Supabase:** `SUPABASE_BACKUP_DATABASE_URL` puede ser un rol elevado. Objetivo posterior: rol de solo lectura (`CONNECT` + `SELECT` en el esquema de la app), sin DDL ni escritura. No se modifica aquí.
- **R2:** las claves actuales permiten lectura y escritura. Un token comprometido podría **sobrescribir o borrar** copias (además de lo que ya borra el ciclo de vida). Objetivo posterior: permiso mínimo de `PutObject` (sin `DeleteObject`) sobre `soma-db-backups`.
- **GitHub:** el environment debe seguir limitado a `main`. No ejecutar este workflow desde `develop` ni desde PRs.

---

## Primera ejecución controlada (cuando se autorice)

1. Confirmar que el workflow está en `main` (merge previo).
2. `workflow_dispatch` en **Database backups** (rama `main`).
3. Run verde; objeto nuevo en `daily/`.
4. Descargar, descifrar con la clave USB, `pg_restore` en Postgres local vacío.
5. Conservar evidencia: id del run, nombre del objeto, fecha, resultado. Sin dumps ni secretos en git.
