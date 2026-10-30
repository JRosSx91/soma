# Soma — operaciones mínimas (beta cerrada)

Guía operativa breve para arrancar y mantener Soma en una beta cerrada.
No sustituye a un proveedor concreto: **no se han verificado** panel de hosting,
backups ni dominio de correo en esta fase.

No incluye secretos. No autoriza despliegues ni migraciones por sí sola.

---

## A. Arquitectura prevista

Cuatro piezas. Distinguir lo que el código asume de lo que hay que confirmar en el proveedor.

| Pieza | Rol | Estado |
| --- | --- | --- |
| SPA | Vite/React. Origen público previsto: `https://somarecovery.app` (`/app` LIVE, `/preview` DEMO). | **Confirmado en código.** El SHA servido por el host **no está verificado**. |
| API | NestJS. Entrada de producción: `pnpm --filter @soma/api start:prod`. Prisma no migra al arrancar. | **Confirmado en código.** Host, URL pública de la API y TLS **pendientes de verificar**. |
| PostgreSQL | Única base. `DATABASE_URL` en Prisma. | **Confirmado en código.** El proveedor (p. ej. mención a Supabase en el roadmap) **no está verificado**. SSL de conexión **recomendado, no autoimpuesto**. |
| Correo | Recuperación de contraseña. Proveedor previsto: Resend. | **Confirmado en código** (`AUTH_PASSWORD_RESET_MAILER=resend`). Dominio, DNS y clave **pendientes de verificar**. No configurados en esta tarea. |

Relación prevista: el navegador carga la SPA; la SPA llama a la API con CORS + cookie `soma_refresh`; la API usa PostgreSQL; el mailer envía solo el enlace de reset a `APP_PUBLIC_URL`.

---

## B. Arranque seguro

Usar **siempre** el arranque de producción:

```text
pnpm --filter @soma/api start:prod
```

Ese script fija `NODE_ENV=production` **antes** de cargar `dist/main.js`.  
`pnpm --filter @soma/api start` (`node dist/main.js`) **no** fuerza producción: los chequeos fail-closed no corren.

Requisito: `apps/api/dist` generado (`prisma generate` + `tsc -b`) en el artefacto desplegado.

### Variables imprescindibles (nombres, no valores)

| Variable | Producción |
| --- | --- |
| `NODE_ENV` | `production` (lo impone `start:prod`) |
| `DATABASE_URL` | PostgreSQL gestionado. Preferir `sslmode=require` (el código **aún no** lo exige al arrancar) |
| `JWT_SECRET` | Aleatorio criptográfico; mínimo 32 bytes de longitud; **nunca** un ejemplo documentado |
| `AUTH_REGISTRATION_MODE` | `invite` (obligatorio para arrancar) |
| `CORS_ORIGIN` | Un solo origen `https://…` (sin `*`, sin lista) |
| `APP_PUBLIC_URL` | Origen HTTPS de la SPA (enlaces de reset; no se toma de `Host`/`Origin`) |
| `AUTH_PASSWORD_RESET_MAILER` | `resend` (con credenciales) o `disabled` (no envía ni emite tokens de reset) |
| `JWT_EXPIRES_IN` | Opcional; si se define, duración con unidad y ≤ 1 h (p. ej. `15m`) |
| `PORT` | El que asigne el host |

Mailer Resend (cuando no esté `disabled`):

- `RESEND_API_KEY`
- `PASSWORD_RESET_FROM_EMAIL` (remitente del dominio **verificado** en Resend)

Si `resend` está elegido pero faltan esas dos, el proceso cae a **disabled** (no inventa secretos). En producción, `memory` / `log` / vacío están prohibidos.

No poner `AUTH_COOKIE_SECURE=false`.

### CORS

Un origen HTTPS explícito. `credentials: true` para la cookie de refresh.  
El mismo origen alimenta `AuthOriginGuard` en `/auth/refresh` y `/auth/logout`.

### Cookies

Cookie `soma_refresh`: HttpOnly, `path=/auth`.

- En producción, `Secure` queda activo salvo que se intente desactivarlo (eso impide arrancar).
- SameSite por defecto `lax`. Si SPA y API están en **hosts HTTPS distintos**, hace falta `AUTH_COOKIE_SAMESITE=none`, `AUTH_COOKIE_SECURE=true` y `AUTH_COOKIE_CROSS_SITE=true`.
- Esa decisión de topología **sigue pendiente de verificar** en el host.

### HTTPS

La SPA y `CORS_ORIGIN` / `APP_PUBLIC_URL` deben ser HTTPS. El certificado TLS del host **no está verificado** en esta guía. Comprobar en el panel y con una petición real a `/health` y a la SPA.

### PostgreSQL con SSL

Añadir `sslmode=require` (o el equivalente del proveedor) a `DATABASE_URL`.  
El arranque **no** falla hoy si falta SSL: hay que configurarlo a propósito y comprobar que la API arranca y `/health` responde.

---

## C. Migraciones

No usar `prisma migrate dev` en producción.  
No migrar en el arranque de la API.  
No ejecutar migraciones como parte de esta tarea BETA-01C.2.

Procedimiento cuando **sí** se autorice una migración:

1. **Confirmar destino.** URL y proyecto del proveedor (staging vs producción). Anotar qué base se va a tocar. No mezclar la local.
2. **Verificar copia de seguridad reciente.** Ver sección D. Si no hay backup reciente y comprobable, **no migrar**.
3. **Comprobar estado.** Desde un entorno con la misma `DATABASE_URL` de destino:

   ```text
   pnpm --filter @soma/api exec prisma migrate status
   ```

   Anotar migraciones pendientes vs aplicadas. Si el historial no coincide con git, detenerse.
4. **Aplicar solo deploy:**

   ```text
   pnpm --filter @soma/api exec prisma migrate deploy
   ```

5. **Verificar.** `migrate status` limpio; `GET /health` 200; un login o registro por invitación de prueba en la cuenta del operador.

---

## D. Backups

**No asumir que los backups están activos.**

1. Abrir el panel del proveedor de PostgreSQL (el que realmente use la beta).
2. Buscar copias automáticas / PITR / snapshots. Anotar: activado o no, frecuencia, retención, región, si hace falta un plan de pago.
3. Si no hay backup automático, no improvisar scripts en este repositorio. Activar la función del proveedor o documentar el hueco como bloqueante.
4. **Restauración de prueba** (obligatoria antes de beta, en una **base aislada**, nunca sobre producción):
   - Crear instancia o branch vacío.
   - Restaurar el backup más reciente allí.
   - Comprobar que arranca Prisma (`migrate status`) y que hay datos coherentes mínimos (p. ej. que la cuenta de prueba del operador existe si se esperaba).
5. **Evidencia a conservar:** fecha/hora, identificador del backup, destino de la restauración, resultado (éxito/fallo), quién lo hizo. Sin volcar datos personales al chat ni al git.

---

## E. Recuperación de contraseña

| Elemento | Qué hacer |
| --- | --- |
| Proveedor | Resend (`AUTH_PASSWORD_RESET_MAILER=resend`) |
| Dominio | Verificar el dominio de envío en Resend (DNS). **Estado actual: no verificado en esta fase.** |
| Remitente técnico | `PASSWORD_RESET_FROM_EMAIL` en ese dominio (p. ej. `noreply@…`). No usar Gmail como FROM de Resend. |
| Correo de contacto humano | `soma.recovery.app@gmail.com` — buzón de soporte / pruebas del operador, **no** el remitente transaccional |
| Arranque | Completar API key + FROM **antes** de abrir la beta si se quiere reset real. Con `disabled`, forgot-password no emite tokens |

**Prueba (cuando el dominio y las claves existan; no enviar nada ahora):**

1. Cuenta propia creada por invitación.
2. Forgot-password con ese correo.
3. Comprobar llegada (y carpeta spam) desde el FROM técnico.
4. Abrir el enlace HTTPS de `APP_PUBLIC_URL` y completar el reset.
5. Login con la nueva contraseña.
6. Conservar evidencia: id de mensaje Resend, hora, éxito. No pegar tokens ni API keys.

---

## F. Comprobaciones antes de beta

- [ ] API arranca con `start:prod` y `NODE_ENV=production` (falla cerrado si faltan JWT, invite, CORS HTTPS, cookie secure).
- [ ] HTTPS en SPA y API; certificado válido.
- [ ] `DATABASE_URL` con SSL; `/health` 200 (`SELECT 1`).
- [ ] Backup del proveedor **activo** y restauración de prueba en base aislada documentada.
- [ ] Resend: dominio verificado, FROM técnico, prueba de envío y reset con cuenta propia. Contacto: `soma.recovery.app@gmail.com`.
- [ ] `AUTH_REGISTRATION_MODE=invite`; registro solo con invitación válida.
- [ ] Avisos legales en `/privacy` y `/terms`. Hoy `LEGAL_NOTICE_STATUS=draft`: **el registro en producción está bloqueado** hasta publicación consciente (BETA-01B). Publicar es decisión de producto, no un flip accidental.
- [ ] CORS un origen HTTPS; cookie refresh HttpOnly + Secure; SameSite acorde a si SPA y API comparten sitio.
- [ ] Migraciones de git aplicadas con `migrate deploy` (tras backup), no `migrate dev`.
- [ ] SPA servida desde el artefacto acordado; SHA de deploy anotado cuando el host lo permita.

---

## Fuera de alcance de esta guía

- Configurar Resend, DNS, Render u otro host.
- Activar backups en el proveedor.
- Ejecutar migraciones.
- CI de integración con PostgreSQL, matrices de versiones o despliegue automático.
