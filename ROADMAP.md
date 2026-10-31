# Roadmap Soma 2.0

Documento de planificación permanente. Se consulta **antes** de abrir un hito nuevo.  
**No otorga permiso** para commit, push, PR, merge ni despliegue.

Última actualización editorial: 2026-10-31 (**UX-PRE-BETA** en curso: primera tanda UX-01 a UX-10 completada localmente). Prioridad inmediata: **UX-PRE-BETA**. Secuencia hasta la beta: **UX-PRE-BETA → BETA-01**. Tras la apertura: **MKT-01**. MOB-01 pospuesto. **BETA-01** y **MKT-01** pendientes.
HEAD de `origin/develop` al actualizar: `2152424058bfa6b24f17fc9be1e87a3189a35d32` (CI PR #84). Incluye SEO-01A (`cdf038c`, PR #75), FBK-01 (`f1b447f`, PR #77), R-JXP (`a26585e`, PR #78), UX-GLO-01 (`db6385b`, PR #79), CLEAN-01 (`ca3b456`), WEB-01 (`ff5a359`, PR #82) y registro/privacidad (`65866c2`, PR #83).
HEAD local de `develop` (sin push): cierre **ONB-01C** (este commit) — **doce** commits por delante de `origin/develop` (backups `78e3b1d` … ONB-01B `0132676` + este cierre). **No** en `origin/develop`.
`origin/main`: `7f78c3268e46795a0ad42e443eacd1b188a69b63` (pin `pg_dump` PG17, PR #86). Encima de REL-01 (`8155554`, PR #76) y backups cifrados R2 (`21e5897`, PR #85). SEO-01A, FBK-01, R-JXP, UX-GLO-01, CLEAN-01, WEB-01, registro #83, CI #84, GAM-03, Somi y los commits legales locales **no** están en `main`. **Deploy de producción no autorizado aquí.** Registro sigue por invitación; `LEGAL_NOTICE_STATUS=draft`.

Hay documentación científica y editorial en `docs/` (curvas, 9B Consejos). Eso **no** es este roadmap de producto.

---

## Objetivo y alcance

Soma 2.0 es un compañero **educativo** para explorar la recuperación fisiológica tras el consumo de sustancias: dashboard personal, atlas anatómico, catálogo de sustancias y logros. **Soma Expeditions** está **parcialmente implementada** en `main` git (shell, Inicio/Recuperación/Logros 2.0, hitos temporales, Bitácora, XP/niveles/títulos, misiones educativas) y el atlas 2.0 consolidado está en `develop` (UX-GLO-01). La landing renovada está en `develop` (WEB-01, PR #82); **no** en `main` ni se da por desplegada. Somi está cerrado técnicamente en local (`79f8360`; CHR-01). El tutorial (**ONB-01**) está **cerrado en desarrollo local** (A `aca59c6`, B `0132676`, C este commit); **no** publicado ni desplegado. Pendiente de comprobación LIVE autenticada antes de la beta. El usuario es protagonista de una expedición personal; **no** es ranking, clínica ni obligación de uso diario. Integrado en `develop` **no** equivale a desplegado en producción.

No es un dispositivo médico. Las curvas son modelos ilustrativos (`curveProgress` / avance de curva), **no** un porcentaje de salud recuperada ni una medición clínica. No se miden neurotransmisores. Las estimaciones de recuperación **no** se presentan como mediciones fisiológicas individuales. Las fases educativas se eligen para comparar; no se calculan a partir de los días de abstinencia salvo que un hito futuro lo autorice con evidencia.

Alcance de contenido canónico actual: cinco sustancias (alcohol, nicotina, cannabis, cocaína, cafeína), 12 sistemas, 21 estructuras, 56 curvas, **156** identificadores de logros (106 de curva + 50 temporales); **149** medallas alcanzables y **7** sin regla válida (no disponibles). ES/EN para la interfaz Soma 2.0. Superficies `/preview` (DEMO) y `/app` (LIVE, sesión).

Los **doce requisitos originales** (`UX-01`–`UX-12`) se conservan íntegros (identificadores y criterios). El resto de este documento organiza compromisos recuperados, calidad y trabajo editorial **sin duplicarlos**. **UX-01** sigue siendo la orientación anatómica; la consolidación visual y responsive de Soma 2.0 es **UX-GLO-01**, no un segundo UX-01.

Fuera de alcance hasta autorización: síntomas de abstinencia **publicados**, consejos clínicos, migraciones/seeds, ventanas 1–7/8–56/57+ como evidencia por sustancia, revocación automática de logros.

---

## Prioridad inmediata y apertura de beta

**Prioridad inmediata:** **UX-PRE-BETA** (en curso). Primera tanda **UX-01 a UX-10** completada localmente, con ajustes visuales posteriores y copy público de Logros. El hito general **sigue abierto**. **BETA-01** y **MKT-01** pendientes. CHR-01 `79f8360`. ONB-01 cerrado en desarrollo local (`ce24eb8`). **No** desplegado. **No** publicado.

**Después de CHR-01B:** **ONB-01** (tutorial interactivo con Somi). El diseño exacto del recorrido se acuerda **antes** de implementar. Reutiliza el onboarding de cuenta (AUTH-01); **no** lo duplica.

**Después de ONB-01:** **UX-PRE-BETA** (revisión personal del propietario del producto: pública, DEMO y LIVE). Aprobación explícita obligatoria. **No** es una refactorización general ni reabre UX-GLO-01.

**Después de UX-PRE-BETA:** continuar **BETA-01** (D.3 jurídica, avisos, consentimiento, git/deploy, migraciones/backups, registro, humo autorizado, autorización humana). **BETA-01 no está cerrado.** **No** se autoriza registro público. `LEGAL_NOTICE_STATUS` permanece en `draft`. La validación jurídica **puede prepararse en paralelo**; su **cierre** y la **apertura** esperan las comprobaciones de este carril.

**Después de BETA-01:** **MKT-01** (identidad profesional y marketing). **No** crear cuentas ni publicaciones en esta reorganización.

**Regla de avance:** cuando un hito está bloqueado por una dependencia **externa** y existen trabajos posteriores **técnicamente independientes**, se puede continuar con esos trabajos **sin** dar por cerrado el hito bloqueado. Aplicación actual: la **preparación** jurídica (BETA-01D.3) puede avanzar en paralelo a CHR-01 / ONB-01 / UX-PRE-BETA; **no** abre la beta ni cierra BETA-01.

FBK-01, R-JXP, UX-GLO-01, CLEAN-01, WEB-01 y **GAM-03** están **cerrados o completados en git de `develop`** (GAM-03: commit local `19c76a1`; **no** `origin/develop`). No están en `main` ni se dan por desplegados.

**Objetivo principal de producto:** abrir una **beta pública de Soma 2.0** cuando la aplicación alcance un nivel adecuado de estabilidad, seguridad, coherencia visual y usabilidad, **después** de Somi usable, tutorial y revisión UX-PRE-BETA. No hay fecha fijada. El merge de REL-01 a `main` **no** abre registros.

Hitos **antes** de autorizar la apertura (1–5 y GAM-03 cubiertos en git de `develop` o local; 6–10 **no** se implementan en esta actualización documental):

| Orden | ID | Papel respecto a la beta |
| --- | --- | --- |
| 1 | FBK-01 | Centro de feedback privado. **Cerrado** frente a sus criterios de aceptación. En `develop` (`f1b447f`, PR #77). **No** `main`. **No** desplegado |
| 2 | R-JXP | Carrera de `UserProgression`. **Cerrado** (PG17 local 2026-10-30). En `develop` (`a26585e`, PR #78). **No** `main`. **No** desplegado |
| 3 | UX-GLO-01 | Consolidación UX. **Completado** en `develop` (`db6385b`, squash PR #79). **No** `main`. **No** desplegado. Distinto de **UX-PRE-BETA** |
| 4 | CLEAN-01 | Legado Soma 1.0. **Completado** en `develop` (`ca3b456`). **No** `main`. **No** desplegado |
| 5 | WEB-01 | Landing Soma 2.0. **Completado** en `develop` (`ff5a359`, PR #82). **No** `main`. **No** desplegado. **SEO-01B** sigue pendiente |
| — | GAM-03 | Integración de economía. **Cerrado técnicamente** (local `19c76a1`). **No** `origin/develop`. **No** `main`. **No** desplegado |
| 6 | CHR-01 | Somi. **Cerrado técnicamente** en local (`79f8360`). WebP estáticos; solo ONB-01. **No** `origin/develop`. **No** desplegado |
| 7 | ONB-01 | Tutorial. **Cerrado en desarrollo local** (A `aca59c6`, B `0132676`, C este commit). Pendiente LIVE autenticada. **No** desplegado. **No** publicado |
| 8 | UX-PRE-BETA | Revisión integral del propietario. **En curso.** Primera tanda UX-01 a UX-10 completada localmente. **No** cerrado |
| 9 | BETA-01 preparación | Parcial. Infra/backups verificados; borradores legales **no** publicados; consentimiento y retirada en git local; validación jurídica **pendiente**; registro por invitación implementado **no** habilitado en producción |
| 10 | BETA-01 autorización | Decisión humana explícita para abrir registros. Distinta de la preparación. **Pendiente** |
| 11 | MKT-01 | Identidad profesional y marketing. **Después** de BETA-01. Pendiente. Sin cuentas ni publicaciones ahora |

**FBK-02**, **GAME-07/08**, **WEB-02**, **SEO-01B** y **MOB-01** siguen posteriores o pospuestos. **MOB-01** no tiene fecha y no es requisito de la beta.

---

## Cómo leer estados y prioridades

Estados permitidos:

| Estado | Significado |
| --- | --- |
| Completado | Criterio cubierto en código y aceptado en un PR; la superficie LIVE o una reinspección puntual puede faltar. |
| Completado y validado | Criterio cubierto en código **y** comprobado en la superficie indicada (DEMO pública ≠ LIVE). |
| Implementado, pendiente de validación | Hay código; falta recorrido de producto o LIVE. |
| Parcialmente implementado | Hay código que no cubre el criterio o lo contradice en parte. |
| Pendiente | No hay implementación que cumpla el criterio, o el contenido no existe. |
| Bloqueado por revisión clínica | No se publica ni se marca Completado con tests. |
| Requiere investigación | Falta evidencia (p. ej. SHA de Render). |

Prioridades: **P0** solo con bloqueo real evidenciado. **P1** impacto de lanzamiento o criterio UX abierto. **P2** calidad, editorial o política. **P3** legado o pulido no bloqueante.

Validación **DEMO** (`/preview` en `https://somarecovery.app`) **no** equivale a validación **LIVE** (`/app` autenticado). Integrado en `develop` **no** equivale a desplegado en producción.

**Cierre de hito (permanente):** (1) validar criterios de aceptación; (2) aprobación explícita de cierre; (3) actualizar este archivo; (4) registrar pruebas y referencias; (5) commit **solo** cuando se autorice. No dejar un cierre técnico sin reflejo en el roadmap.

---

## Estado general

| Superficie | Estado |
| --- | --- |
| Producto Soma 2.0 en `develop` / `main` | `main` = backups PG17 (`7f78c32`, PR #86) sobre REL-01 (`8155554`, PR #76) y R2 (`21e5897`, PR #85). `origin/develop` = `2152424` (CI #84). Local `develop` = cierre ONB-01 (ahead 12). **Deploy de producción no verificado aquí.** Registro por invitación; avisos en `draft` |
| UX-01 orientación corporal | Completado (PR #45). Orientación exacta en prod no reauditada el 2026-10-25 |
| UX-02 mensajes diarios × 60 | Completado y validado (tests) |
| UX-03 figura móvil | Completado y validado DEMO 320/375/430 |
| UX-04 recuperación DEMO | Completado y validado DEMO (PR #50). LIVE `/app` no retestado |
| UX-05–07 Explorar | Completados y validados DEMO (PR #49). LIVE no comprobado. Explorador 2.0 fusionado en `develop` (PR #61). **No** desplegado |
| UX-08–09 atlas editorial | Pendiente (contenido / evidencia) |
| UX-10 logros en revisión | Cubierto en ACH-01 (7 no disponibles). UX-11/12 siguen abiertos |
| UX-11 platino | Pendiente (umbral 0,99 insuficiente) |
| UX-12 secretos y platinos | Parcialmente implementado |
| Neurotransmisores educativos | Publicados como MVP educativo (PR #49). REC-VIS-01 añade panel cualitativo en Recuperación. No son mediciones. SHA Render no verificado |
| Síntomas / Consejos | Bloqueado por revisión clínica; catálogos **publicados vacíos** |
| LIVE `/app` | AUTH-01 y LIVE-01 validados funcionalmente **en local** (cuenta sintética). No producción, no staging, no recaídas, no múltiples pestañas |
| ACH-NOTIF-01 campana | Completado y validado (LIVE producción). PR #51 + pulido #52 |
| ACH-CELEB-01 celebraciones | Completado y validado (LIVE producción). PR #51 + pulido #52 |
| SHELL-01 shell autenticado | Completado y validado (LIVE producción). PR #52 |
| Soma Expeditions (GAME-*) | GAME-01, GAME-02, NAV-01, NAV-02, GAME-03A–C en `main` git vía REL-01 (PR #53–#59, #76). Sin deploy de producción verificado |
| I18N-2.0 dashboards ES/EN | En `main` git (PR #60, REL-01). Atlas: ANAT-I18N-01 (PR #68). LIVE autenticado: falta comprobación de navegador antes del despliegue |
| Explorador 2.0 | En `main` git (`559df95`, PR #61, REL-01). Cabecera, búsqueda ES/EN, filtros, 5 sustancias, 12 sistemas, 9 NT educativos |
| EXP-EDU fichas educativas | En `main` git (PR #62–#67, REL-01). GAME-05 educativa cubierta por **GAM-02**. **No** se da por desplegado |
| REC-VIS-01 visualización de recuperación | En `main` git (`f346709`, PR #69, REL-01). Curvas educativas + NT cualitativos. **No** medición fisiológica individual |
| ACH-01 sistema de logros y medallas | En `main` git (`c28b31e`, PR #70, REL-01). Galería 2.0; 156 IDs; 149 alcanzables; 7 no disponibles; recaídas no revocan |
| HOME-UI-01 layout | En `main` git (PR #66, REL-01). No reabre UX-03 |
| JRN-01 Bitácora | En `main` git (PR #72, REL-01). **No** se da por desplegado |
| GAM-01 XP, niveles, títulos | En `main` git (`751c6aa`, REL-01). Ledger `XpGrant` / `UserProgression`. **No** se da por desplegado |
| GAM-02 Misiones educativas | En `main` git (PR #74, REL-01). Seis misiones, API, LIVE/DEMO. **No** se da por desplegado |
| GAM-03 integración | **Completado técnicamente** en `develop` local (`19c76a1`; mapa de eventos + aislamiento; unitarias/frontend 64, PG17 32/32). **No** `origin/develop`. **No** segunda economía. **No** `main`. **No** desplegado. Copy educativa vs participación: residual UX, no bloquea el cierre |
| CHR-01 Somi | **Cerrado técnicamente** en local (`79f8360`). Seis WebP; PNG conservados; **no** en Cuenta. **No** `origin/develop`. **No** `main`. **No** desplegado |
| ONB-01 tutorial | **Cerrado en desarrollo local** (A `aca59c6`, B `0132676`, C este commit). Distinto de AUTH-01. Pendiente de comprobación LIVE autenticada antes de la beta. **No** desplegado. **No** publicado |
| UX-PRE-BETA revisión | **En curso.** Primera tanda UX-01 a UX-10 completada localmente. **No** cerrado. No reabre UX-GLO-01 |
| WEB-02 identidad y filosofía | Pendiente. Puede empaquetarse con WEB-01; no es prerrequisito de apertura por sí solo |
| UX-GLO-01 consolidación UX | Completado e integrado en `develop` (`db6385b`, PR #79). **No** `main`. **No** desplegado. Distinto de UX-01 |
| CLEAN-01 legado Soma 1.0 | Completado e integrado en `develop` (`ca3b456`). **No** `main`. **No** desplegado |
| WEB-01 landing Soma 2.0 | Completado e integrado en `develop` (`ff5a359`, PR #82). **No** `main`. **No** desplegado. WEB-02 y SEO-01B siguen pendientes |
| SEO-01 visibilidad de búsqueda | SEO-01A fusionado en `develop` (PR #75). **No** `main`. SEO-01B pendiente (contenido orgánico; no reabre WEB-01) |
| REL-01 release de producción | Completado en git (`main` `8155554`, PR #76). Encima: backups R2/PG17 (`21e5897`/`7f78c32`). **Deploy y migraciones de producción:** no autorizados en este documento |
| FBK-01 centro de feedback | Completado (criterios de aceptación cubiertos). En `develop` (`f1b447f`, PR #77). Aviso post-retirada de consentimiento en git local (`ba65a7c`). **No** `main`. **No** desplegado |
| R-JXP carrera XP | **Cerrado.** Fix en `develop` (`a26585e`, PR #78): `INSERT ON CONFLICT DO NOTHING` + bloqueo de fila. Revalidado PG17 local (20 tests). **No** `main`. **No** desplegado. No reabre GAM-03 |
| BETA-01 beta pública | **No cerrado.** Infra/backups: hechos (R2 cifrado; restore verificado; `main` `7f78c32`). Borradores legales ES/EN: preparados, **no** publicados (`ed33f6b` local). Consentimiento y retirada: implementados y probados (`ba65a7c` local). Validación jurídica: **pendiente**. Registro por invitación: implementado (`65866c2`, PR #83), **no** habilitado en producción. Apertura: **pendiente**. `LEGAL_NOTICE_STATUS=draft` |
| FBK-02 feedback comunitario | Futuro. Después de WEB-01/WEB-02. No implementar en FBK-01 |
| MOB-01 Android / Google Play | Futuro, sin fecha. Capacitor es alternativa preliminar, no decisión. **No** requisito de beta. **No** implementar. **Pospuesto.** |
| MKT-01 presencia digital | Pendiente. **Después** de BETA-01. Identidad profesional, X, Ko-fi, Instagram (evaluación), LinkedIn personal/página. **No** crear cuentas ni publicaciones ahora |
| I18N-04 selector banderas | Pendiente (documentado; no implementar aún; solo ES/EN) |
| SHA desplegado por Render | Requiere investigación |

---

## Publicación (Git ≠ Render)

| Evento | SHA / nota |
| --- | --- |
| PR #49 merge en `main` | `2ca80040504617096d932348a800076a9aff0da6` (NT + UX-05–07) |
| PR #50 merge en `main` | `32aac73ddac9abd012f876d8f4fbfdf9f78aefb7` (UX-04 DEMO + docs) |
| Commits de producto en #50 | `c7f9b37108eb4eaa69d16ca9f6033047fd94f7b1`, `593b6c6595800292ad0e548872f2016b7d243767` |
| PR #51 merge en `main` | `5e38b98f643319629c30ab7fe4174a9a071d148c` (inbox + celebraciones). **Validado LIVE producción** (2026-10-26, confirmación de producto) |
| PR #52 merge en `main` | `0a91e3486c37d127e331d2efd1aed58e05466bb4` (shell autenticado + pulido visual de inbox/celebración). **Validado LIVE producción** (2026-10-26) |
| Validación DEMO tras #49 | `/preview/explore` y NT en `https://somarecovery.app` (2026-10-25). **No** revisión clínica |
| Validación DEMO tras #50 | `/preview/recovery` UX-04 (leyenda día 365, sin Hoy compartido, azulejos 68/72/61, ES/EN, 320/375/430) |
| SHA exacto servido por Render | **No verificado.** El HTML público no expone el commit. Un bundle reciente (`index-dI9UMZa7.js`, Last-Modified 2026-10-25 17:40 UTC) indica despliegue, no el SHA |
| GitHub Deployments / Actions | Vacíos en la comprobación post-merge. **No** se afirma que reflejen Render |

Despliegues en Render han sido **manuales** cuando el usuario los autorizó. Este documento no autoriza despliegues.

---

## Funcionalidades completadas (histórico conservado)

Confirmadas por el usuario y/o por código:

- Orientación anatómica del cuerpo (mirada a la izquierda, órganos situados) — PR #45, commit `d54c133`.
- 60 mensajes motivacionales diarios ES/EN — PR #45, commit `bde004d`, test de longitud 60.
- Atlas 2D, Explorar de sustancias/sistemas, fichas compartidas `DetailSheet`.
- Ajustes de recuperación: tiempo de abstinencia como eje, etiquetas de % de curva, estados de órgano mixtos, gráfico móvil (PR #46–#48: `3edece5`, `2cdeac6`, `591c74f`, `b53892c`, `feb8947`). LIVE mixto/overlay **no** se alteró en UX-04.
- Coherencia DEMO UX-04 (PR #50): sin marcador «Hoy» compartido; leyenda = última muestra (día 365); hitos sin %; azulejos con «día 365»; copy ES/EN «Avance de cada curva» / «Mostrar todas las curvas».
- Infraestructura de Consejos, evidencia NT y ventanas educativas: catálogos **públicos vacíos** a propósito.
- Neurotransmisores `0a49627` y Explorar UX-05–07 (`437c7fa`): merge PR #49 (`2ca8004`). MVP educativo en DEMO. **No** es revisión clínica ni medición individual.
- UX-03: figura de Inicio validada en DEMO producción a 320/375/430 px. VIS-01 (tablet/escritorio) **no** reabre UX-03.
- ACH-NOTIF-01 / ACH-CELEB-01: campana LIVE, panel persistente y celebración modal — **implementados** (PR #51), **fusionados** y **validados en producción LIVE** (2026-10-26). Pulido de filas compactas, modal centrado y grupos densos en PR #52 (`9847690`). DEMO `/preview` sigue sin montar campana ni celebración.
- SHELL-01: sidebar plegable, chrome en el pie del rail, navegación móvil inferior — **implementado, fusionado y validado en producción** (PR #52).

---

## Requisitos originales del usuario (UX-01 a UX-12)

Numeración e intención originales conservadas. Lo no verificado en LIVE no se presenta como validado en LIVE.

### Inicio

#### UX-01 — Orientación anatómica

- **Estado:** Completado
- **Prioridad residual:** P3 (reconfirmar orientación en DEMO/LIVE si se toca la figura)
- **Descripción:** Cuerpo mirando a la izquierda, órganos correctamente situados.
- **Criterio:** En Inicio, la figura no aparece espejada ni con órganos desplazados respecto al atlas acordado.
- **Evidencia:** Usuario: PR #45. Código: `d54c133`. Inicio DEMO carga (2026-10-25); la orientación exacta **no** se reinspeccionó en esa pasada.
- **Dependencias:** Ninguna abierta.

#### UX-02 — Mensajes motivacionales diarios

- **Estado:** Completado y validado
- **Prioridad residual:** ninguna
- **Descripción:** Ampliar a 60 mensajes ES/EN.
- **Criterio:** Hay 60 mensajes distintos en cada idioma y se rotan en Inicio.
- **Evidencia:** PR #45, `bde004d`; `home-daily-message.test.ts` (`es.length === 60`, `en.length === 60`). DEMO Inicio mostró mensaje del día en EN (2026-10-25).
- **Dependencias:** Ninguna abierta.

#### UX-03 — Tamaño de la figura en móvil

- **Estado:** Completado y validado (DEMO pública 320/375/430 px)
- **Prioridad residual:** ninguna para el criterio móvil. Pulido tablet/escritorio → **VIS-01** (no reabre UX-03)
- **Descripción:** Ajustar el tamaño de la figura anatómica en dispositivos móviles.
- **Criterio:** En 320/375/430 px la figura es usable, no recorta órganos relevantes ni deja un vacío excesivo.
- **Evidencia:** DEMO `https://somarecovery.app/preview` (2026-10-25): 320 (~288×268, llena el ancho), 375 y 430 (altura tope 280 px). Cara, cerebro, tórax y abdomen visibles; overflow horizontal 0. Código: `d54c133`, `91724b3`, `HeroFigure` / `HomeStage`.
- **Dependencias:** Ninguna.

### Mi recuperación

#### UX-04 — Resumen general de recuperación

- **Estado:** Completado y validado (DEMO pública tras PR #50). LIVE `/app` **no** retestado
- **Prioridad residual:** P1 solo para recorrido LIVE (véase LIVE-01), no para reabrir el criterio DEMO
- **Descripción:** Aclarar significado y cálculo del resumen. El usuario debe entender que **no** es un porcentaje real de salud.
- **Criterio:** Copy y gráfico hablan de avance de curva educativa; no de salud recuperada; estados mixtos no muestran un % conjunto engañoso; en DEMO no hay un «Hoy» compartido entre sustancias con distintos recuentos.
- **Evidencia:** PR #46–#48 en `main`. PR #50 (`32aac73`). DEMO producción 2026-10-25: eje sin Hoy; leyenda 68/54/72/61/49 con nota día 365; azulejos 68/72/61 + «día 365» / «day 365»; Digestivo/Endocrino/Inmunológico sin etiqueta huérfana; selector «Mostrar todas las curvas» / «Show all curves»; eje «Avance de cada curva (%)» / «Progress along each curve (%)»; sin % global. LIVE (mínimo por sistema, overlay, mixto) no se tocó en #50.
- **Dependencias:** Recorrido LIVE → LIVE-01. Visualización cualitativa de NT y copy de curvas → REC-VIS-01 (fusionado; no reabre el criterio DEMO de UX-04).

#### REC-VIS-01 — Visualización de recuperación

- **Objetivo:** Representar la recuperación como modelo educativo (curvas, hitos, señales neuroquímicas cualitativas) sin presentarla como medición fisiológica individual.
- **Estado:** Fusionado en `develop` (`f346709`, PR #69) y en `main` vía REL-01 (`8155554`, PR #76). **Deploy de producción no verificado aquí.**
- **Prioridad:** P3 residual (regresiones; copy clínico).
- **Decisiones confirmadas:** Las curvas siguen siendo `curveProgress` / avance de trayectoria. El panel de neurotransmisores en Recuperación es **cualitativo** y **no** se acopla a los días de abstinencia como si fueran concentraciones medidas. No se prometen predicciones clínicas individuales.
- **Pendiente de diseño:** Ninguno de implementación de este ID. Pulido editorial futuro no reabre el modelo.
- **Dependencias:** UX-04 (copy de curva). GAME-03B (superficie Recuperación 2.0).
- **Criterio:** Un usuario de Recuperación entiende que ve un modelo ilustrativo, no un laboratorio personal.

### Explorar

#### UX-05 — Lenguaje y repetición de «catálogo»

- **Estado:** Completado y validado (DEMO pública tras PR #49)
- **Prioridad residual:** ninguna
- **Descripción:** Quitar repeticiones innecesarias de «catálogo» y mejorar el lenguaje.
- **Criterio:** En ES, «catálogo» no satura títulos, pistas, errores y fichas; el tono sigue siendo educativo.
- **Evidencia:** `437c7fa`; DEMO `/preview/explore` local y producción. Una mención queda en `ntPhaseNotice` (catálogo vs medición). **No** es revisión clínica. `/app` no comprobado de forma específica.
- **Dependencias:** Ninguna.

#### UX-06 — Enumeración de órganos y zonas (hipocampo)

- **Estado:** Completado y validado (DEMO pública tras PR #49)
- **Prioridad residual:** ninguna
- **Descripción:** Mejorar la lista de órganos y zonas, incluyendo el hipocampo cuando corresponda.
- **Criterio:** Si el índice educativo asocia hipocampo (u otra zona) a la sustancia, aparece en la ficha con el nombre localizado; no se inventan órganos.
- **Evidencia:** Título «Órganos y zonas». Agrupación por `atlasSystems`. Alcohol/cannabis: hipocampo bajo SNC en DEMO local y producción.
- **Dependencias:** UX-07.

#### UX-07 — Navegar de órganos mencionados al atlas

- **Estado:** Completado y validado (DEMO pública tras PR #49)
- **Prioridad residual:** P1 solo si se recorre LIVE Explorar (LIVE-01), no para reabrir el criterio DEMO
- **Descripción:** Desde órganos y zonas de Explorar, ir a su ubicación en el explorador anatómico.
- **Criterio:** Cada órgano listado abre el atlas en el sistema/órgano correcto, **sin** afirmar que un neurotransmisor «pertenece» a un solo órgano.
- **Evidencia:** Hipocampo → `/preview/anatomy?system=nervous-central&organ=brain-hippocampus`. `DetailSheet` cierra y restaura foco. Tarjetas NT no enlazan un órgano dueño.
- **Dependencias:** `anatomy-explorer-query.ts`.

### Explorador anatómico

#### UX-08 — Fases educativas por sustancia

- **Estado:** Pendiente (contenido). Infra lista; **no** inventar ventanas
- **Prioridad:** P2
- **Descripción:** Investigar e incorporar, **solo con respaldo suficiente**, estimaciones educativas de fase aguda, postaguda y normalización **por sustancia**. No usar 1–7/8–56/57+ como evidencia clínica.
- **Criterio:** Si se muestran días, salen de `educationalPhaseWindowCatalog` con fuente e incertidumbre; si no hay evidencia, no se inventa rango. `narrativePhaseWindows` no se presenta como calendario universal en el atlas.
- **Evidencia:** `educationalPhaseWindowCatalog` está **vacío** a propósito. El reloj global sigue en `narrative-catalog.ts` para seeds/tests, no como UI educativa del atlas.
- **Dependencias:** Trabajo editorial/bibliográfico. No seeds automáticos.

#### UX-09 — Efectos ausentes sustancia × órgano

- **Estado:** Pendiente (cobertura incompleta de narrativas)
- **Prioridad:** P2
- **Descripción:** Auditar combinaciones sin efecto o descripción. Ejemplo del usuario: **cocaína y corazón**.
- **Criterio:** Inventario de huecos vs. pares con narrativa/curvas/señalización; no rellenar sin fuente; el atlas no finge cobertura completa.
- **Evidencia (auditoría 2026-10-25):** corazón tiene narrativa solo de **cafeína**. Existe curva cocaína–corazón (`[NEEDS-VERIFICATION]`), sin `organ-narrative`. Explorar lista el órgano por la curva. CNS: curvas cerebrales, **0** narrativas de órgano. Alcohol–riñones: narrativa sí, curva no. No rellenar automáticamente.
- **Dependencias:** Decisión editorial.

### Logros (requisitos originales)

El catálogo de **106** ítems debe distinguirse así: **existencia** (seed/generador) ≠ **publicación en UI** ≠ **alcanzabilidad** (`ruleReview` / curva) ≠ **comportamiento de desbloqueo** (umbral vs conjunto; persistencia).

#### UX-10 — Logros pendientes de revisión

- **Estado:** Implementado, pendiente de validación
- **Prioridad:** P1
- **Descripción:** Identificar con claridad los logros pendientes de revisión y explicar el motivo.
- **Criterio:** La UI distingue `ruleReview` (u homólogo) y explica por qué no es un objetivo alcanzable (p. ej. falta de curva).
- **Evidencia:** Generador: 7 ítems sin regla válida (p. ej. `cocaine-hippocampus-gold-1`, seis VTA de cafeína). ACH-01 las muestra como **no disponibles** y las excluye del progreso de colección. Falta validación LIVE de comprensión. La ruta legacy `/achievements` redirige a `/app/achievements` (LEG-01 / ACH-01).
- **Dependencias:** I18N-02 cubierto en Logros 2.0. ACH-01 (superficie). Validación LIVE.

#### UX-11 — Lógica de platino

- **Estado:** Pendiente
- **Prioridad:** P1
- **Descripción:** El platino debe exigir los demás logros pertinentes, no un umbral arbitrario de progreso.
- **Criterio:** Un platino no se desbloquea solo con `threshold` de curva (p. ej. 0,99); requiere el conjunto de logros acordado de esa sustancia.
- **Evidencia:** Cuatro platinos de soberanía (`alcohol|nicotine|cannabis|cocaine-sovereignty-platinum`): `threshold: 0.99`, `organId: brain-vta`, `hidden: true`. `planAchievementUnlocks` usa el mismo umbral que el resto. Cafeína no tiene platino. Este roadmap **no** autoriza cambiar el seed.
- **Dependencias:** Diseño de reglas + autorización para catálogo/API. Relacionado con UX-12.

#### UX-12 — Secretos y platinos

- **Estado:** Parcialmente implementado
- **Prioridad:** P1
- **Descripción:** Los secretos no deben revelar bronce/plata/oro de antemano. Los platinos **no** son secretos.
- **Criterio:** Ficha sellada de un secreto no muestra el tramo; los platinos son visibles como platino y no usan el patrón «???».
- **Evidencia:** 8 `hidden` (incluidos los 4 platinos). `achievementHiddenCopy` / «???». Ficha sellada: `Bloqueado. {tierLabel}` (filtra Platino/Bronce). `b5dadaf` oculta el tramo solo en la medalla destacada de Inicio **desbloqueada**. Landing muestra un disco de platino sellado.
- **Dependencias:** UX-11 (definición de platino). I18N-02.

---

## Cuenta, autenticación y onboarding

Código existente (JWT en memoria, cookie de refresh, PUT `/me/profile`, onboarding skip/complete). **No** hay E2E de navegador. LIVE **producción** no recorrido.

#### AUTH-01 — Validar registro, onboarding, sesión y `/app`

- **Descripción:** Recorrer de punta a punta: registro o login, restauración de sesión, onboarding (completar o omitir), acceso a `/app`, logout y estados de carga/error.
- **Estado:** Validado funcionalmente en local; pendiente de validación en producción o entorno de staging autorizado
- **Prioridad:** P1
- **Evidencia:** `AuthContext`, `ProtectedRoute`, `auth.controller.ts`, tests `auth-session.test.ts`, `auth.refresh.http.test.ts`, `onboarding-actions.test.ts`. Sin tests de montaje de `AuthProvider`/`ProtectedRoute`/`OnboardingPage`. **Sin Playwright/Cypress** (esta validación no es cobertura E2E automatizada).
- **Recorrido local 2026-10-25** (PostgreSQL local, API `localhost:3000`, web `localhost:5173`, cuenta sintética nueva `soma.auth01.live01@example.test`; **no** producción): registro OK; creación de sesión OK; onboarding OK; persistencia de sesión tras recargar `/app` OK; acceso a `/app` OK; logout OK (landing `/`); nuevo login OK. No se usó ninguna cuenta existente.
- **Dependencias:** Q-E2E para automatizar después del humo manual. No usar cuenta de producción real salvo autorización explícita.
- **Criterio:** Un operador puede completar el flujo en un entorno autorizado y documentar pases/fallos por paso (login, refresh, onboarding, `/app`, logout) sin ambigüedad DEMO/LIVE.

#### LIVE-01 — Sustancias, fechas, persistencia y recálculo

- **Descripción:** Validar edición de sustancias y fechas (hoy en `/onboarding` vía PUT `/me/profile`, no en la página Cuenta), persistencia Prisma, y que recuperación LIVE se actualiza al refetch. Los logros **añaden** desbloqueos en `GET /me/achievements`; no revocan (ACH-REV).
- **Estado:** Validado funcionalmente en local para los casos probados
- **Prioridad:** P1
- **Evidencia:** `profile.service.ts` (replace de usages); `useLiveProfile` + `adapt-live-dashboard.ts`; `detectAndPersistUnlocks` insert-only. Tests de adapter (fechas faltantes, activo, vacío); **no** hay PUT→GET dashboard automatizado.
- **Recorrido local 2026-10-25** (misma cuenta sintética; **no** producción, **no** recaídas, **no** múltiples pestañas): nicotina abstinente desde el 11/10/2026 → **14 días**; cannabis **activo** (sin recuento de abstinencia). Recuperación LIVE diferenciada por sustancia. Tras cambiar nicotina al 15/09/2026 → **40 días**; perfil e Inicio («Desde el 15 sept 2026») y curvas actualizados. Marcador de gráfico **`Hoy · N días · Nicotina`**: identificado con nicotina, sin porcentaje global ficticio que mezcle cannabis activo. Logros insert-only: **3** desbloqueos iniciales (bronces nicotina) y **5** adicionales retroactivos (total **8**); los `unlockedAt` de los 3 primeros no se reescribieron. Anuncios de entonces: toasts (histórico); hoy ACH-NOTIF-01 / ACH-CELEB-01 en `main`, sin validar en producción.
- **Dependencias:** AUTH-01. ACH-REV (política; no implementar revocación en este ítem).
- **Criterio:** Tras cambiar fechas/sustancias en un entorno autorizado, Home/Recuperación LIVE muestran el modelo actualizado; se anota qué ocurre en Logros (nuevos unlocks sí/no; unlocks previos intactos). Vacío y error tienen UI utilizable.

---

## Internacionalización

UI selectable: solo ES/EN (`INTERFACE_LANGUAGES`). I18N-2.0 cubre Inicio, Mi recuperación y Logros 2.0. Explorador 2.0 cubre chrome ES/EN de Explorar (PR #61). Atlas: ANAT-I18N-01 (PR #68). `/achievements` legacy redirige a Logros 2.0 (ACH-01).

#### I18N-01 — DEMO que permanece en español con UI inglesa

- **Descripción:** Corregir recuentos (`42 días`), badge DEMO / `demoDisclaimer`, y cuerpos de hitos DEMO cuando el idioma es EN.
- **Estado:** Fusionado en `develop` (`5a451bd`, PR #60). El defecto original se observó en DEMO producción 2026-10-25; esa superficie desplegada **no** se revalidó aquí.
- **Prioridad:** P1 residual (integrar; comprobar LIVE autenticado en navegador **antes del despliegue**)
- **Evidencia:** `DemoNotice` usa `recovery:demoDisclaimer`. Las etiquetas DEMO se presentan con i18n (`presentDemoSubstances` / series / sistemas / cambios); `elapsedDays` intactos. Comprobado en `/preview` ES y EN (Inicio, Recuperación, Logros), overflow 0 a 320 px.
- **Dependencias:** Ninguna de producto. No mezclar con traducción de ciencia.
- **Criterio:** Con UI EN en `/preview/recovery` e Inicio DEMO, recuentos, disclaimer e hitos están en inglés (o en claves i18n); no hay literales ES en esos puntos. 320/375/430 sin overflow nuevo.

#### I18N-02 — Logros: chrome y catálogo

- **Descripción:** Internacionalizar `AchievementsPage` (hoy «Logros», «Bronce», «Revisión pendiente») y el catálogo mostrado (seed/generador en español).
- **Estado:** Fusionado en `develop` (`5a451bd`, PR #60). Cubre Logros 2.0 (`/preview/achievements` y `/app/achievements`). Atlas: PR #68. La ruta legacy `/achievements` redirige (ACH-01). El chrome de Explorar: Explorador 2.0 (PR #61).
- **Prioridad:** P1 residual (integrar; LIVE autenticado en navegador pendiente)
- **Evidencia:** Chrome `achievements:ui` ES/EN. Títulos y descripciones vía `achievements:{id}`. Búsqueda con nombre de sustancia del idioma activo (y `substanceId`); secretos sellados no coinciden por título. Órganos de ficha vía `organs`. El generador sigue en ES como fallback.
- **Dependencias:** UX-10 (misma pantalla). No cambia reglas de desbloqueo.
- **Criterio:** Con UI EN, filtros, stats, estados y títulos/descripciones visibles siguen EN (o el fallback documentado), incluidos `ruleReview` y secretos.

#### I18N-03 — Textos educativos de Anatomía

- **Descripción:** Las fichas de resumen (`anatomy-education.ts`, `system-education.ts`) en inglés; el chrome del atlas ya estaba i18n.
- **Estado:** Fusionado en `develop` (ANAT-I18N-01, PR #68, `774ec82`). LIVE autenticado no retestado aquí. **No** desplegado.
- **Prioridad:** P3 residual
- **Evidencia:** PR #68 localiza fichas educativas del atlas en inglés. No es revisión clínica de contenido nuevo.
- **Dependencias:** Editorial; no inventar fisiología.
- **Criterio:** Con UI EN, el cuerpo de las fichas educativas del atlas está en inglés.

#### I18N-04 — Selector visual de idiomas

- **Descripción:** Sustituir las etiquetas visibles ES/EN del selector actual por **banderas circulares**, manteniendo accesibilidad y facilidad de uso. Solo los idiomas de interfaz ya soportados (ES/EN). **No** añadir idiomas nuevos. Coherencia visual con la campana ACH-NOTIF-01 (ya implementada; no reabrirla aquí).
- **Estado:** Pendiente. UX-PRE-BETA usa banderas **circulares** junto al nombre y al código; **no** sustituye las etiquetas ES/EN del disparador.
- **Prioridad:** P2
- **Evidencia:** El selector sigue nombrando el idioma (accesible y visible). Este ID no corrige I18N-01 ni I18N-02 (copy DEMO/logros).
- **Dependencias:** Ninguna de catálogo. No bloquea AUTH-01/LIVE-01. Alinear estilo con la campana ya existente (ACH-NOTIF-01 / SHELL-01), **sin** reabrir esos hitos aquí.
- **Criterio:**
  - Español: bandera de España circular.
  - Inglés: bandera del Reino Unido circular.
  - El botón muestra el idioma actualmente seleccionado.
  - Al pulsarlo, aparece un desplegable con las opciones Español y English.
  - Cada opción muestra bandera y nombre completo.
  - El idioma activo se distingue visualmente.
  - Funciona con teclado y lector de pantalla.
  - Mantiene el idioma seleccionado al navegar y recargar.
  - Se adapta a móvil y escritorio.
  - Conserva coherencia visual con la campana de notificaciones existente.

Locales ca/gl/eu/fr/it/de en disco **no** son UI Soma 2.0; no se tratan como deuda de lanzamiento.

---

## Logros (compromisos adicionales)

No duplicar UX-10–12. El catálogo 106 existe; cafeína 8 ítems sin platino; 7 `ruleReview`; 8 `hidden`; 4 platinos.

#### ACH-REV — Política de persistencia ante recaídas y correcciones de fechas

- **Descripción:** Hoy los `UserAchievement` son **insert-only**: recaer, borrar una sustancia o corregir `lastUseDate` **no** borra ni reescribe `unlockedAt`. PUT `/me/profile` no llama al servicio de logros; el siguiente GET puede **añadir** unlocks nuevos.
- **Estado:** Recaídas **no revocan** medallas: **confirmado** en ACH-01 (historial permanente). Insert-only intacto. Distinción recaída vs **corrección de fecha errónea** sigue abierta. **No implementar revocación automática.**
- **Prioridad:** P2 (solo el caso «corregir fecha»)
- **Evidencia:** `planAchievementUnlocks`, `achievements.service.ts`. Auditoría 2026-10-25: no había tests nombrados de recaída ni de corrección de fecha. Posterior (ACH-01 / persistencia): `ON CONFLICT DO NOTHING` cubierto en `user-achievement-persist.test.ts`; la política de recaída es insert-only (las filas no se borran). **Sigue pendiente** un escenario explícito de corrección de fecha y la política de producto de ese caso.
- **Dependencias:** LIVE-01 documenta el hecho. GAME-08 y GAM-01 (XP) **no** borran historial en recaída.
- **Criterio:** Recaer no quita medallas, XP ni niveles. Si se corrige una fecha por error, la política se documenta **antes** de código.

#### ACH-NOTIF-01 — Centro de notificaciones

- **Descripción:** Disponer de una campana de notificaciones en el encabezado, extensible a futuras novedades de Soma. La **primera implementación se limita a logros**. No es UX-10–12 (catálogo, revisión, secretos/platinos). No es ACH-CELEB-01 (esa es la celebración puntual). No es ACH-REV (política de persistencia de `UserAchievement`).
- **Estado:** Completado y validado (LIVE producción, 2026-10-26). Implementado PR #51 (`5e38b98`); pulido visual PR #52 (`9847690`, merge `0a91e34`). DEMO `/preview` no monta la campana.
- **Prioridad:** P3 residual (regresiones; tipos futuros vía GAME-*)
- **Evidencia / superficie actual:** `AchievementInboxBell` (portal, `placeAnchoredPanel`) en pie del sidebar de escritorio y header móvil (SHELL-01). Persistencia `inboxReadAt`; agrupación; digest inicial. `TrophyToastStack` ya no es el anuncio LIVE. Medallas de bandeja: tamaño `compact` (48 px), fila horizontal.
- **Observado en local 2026-10-25** (cuenta sintética; **antes** de implementar): toasts al navegar, hasta tres simultáneos, lotes posteriores. Ese patrón **motivó** este ID; el código de #51 lo sustituye.
- **Dependencias:** AUTH-01 / LIVE-01 para el contexto LIVE. ACH-CELEB-01 (celebración ≠ notificación). ACH-REV (qué filas existen). Extensibilidad de tipos futuros **sin** implementar esos tipos en este hito. Reutilizar esta campana para GAME-* cuando se autorice; **no** ampliar tipos aquí.
- **Criterio:**
  - Indicador de notificaciones sin leer.
  - Panel accesible desde el encabezado.
  - Listado de logros notificados y acceso a sus fichas.
  - Persistencia del estado leído/no leído; sincronización sin recargar la página.
  - Agrupación de desbloqueos simultáneos; aviso **único** al regresar si hay varios logros nuevos.
  - Sin repetir notificaciones ya comunicadas.
  - Distinguir **fecha del logro** (`unlockedAt`) y **fecha de comunicación**.
  - La campana debe admitir nuevos tipos de notificación más adelante **sin** implementarlos ahora.
  - Las notificaciones **persisten**; no se confunden con celebraciones visuales puntuales. Una notificación futura no tiene por qué generar celebración.

#### ACH-CELEB-01 — Celebraciones de logros

- **Descripción:** Sustituir las interrupciones masivas (toasts apilados de `TrophyToastStack`, o una cascada de modales) por **una** celebración visual cuidada. No es UX-10–12. No es ACH-NOTIF-01. No implementa revocación (ACH-REV).
- **Estado:** Completado y validado (LIVE producción, 2026-10-26). Implementado PR #51 (`5e38b98`); pulido PR #52 (`9847690`).
- **Prioridad:** P3 residual (regresiones; reutilizar para GAME-01). **Pendiente futuro:** celebración agrupada para reconocimientos masivos (`live` ≥ 8 inserts). GAME-01 suprime el modal en ese caso (`BULK_RECOGNITION_MIN`); no es un sistema paralelo.
- **Evidencia / superficie actual:** `AchievementCelebrationModal` + `AchievementCelebrationHost` (LIVE only). Layout `solo` / `featured` / `grid` (`celebrationMedalLayout`). Escape, foco, `prefers-reduced-motion`, sonido opcional apagado por defecto. `celebratedAt` evita repetición.
- **Observado en local 2026-10-25** (antes de implementar): toasts apilados, no celebración colectiva. Ese patrón **motivó** este ID.
- **Dependencias:** ACH-NOTIF-01 (el registro persistente vs el evento visual). Reutilizar medallas/`AchievementMedal` e i18n de logros. GAME-01 reutilizará esta celebración cuando exista catálogo temporal; **no** implementar esa familia aquí.
- **Criterio:**
  - Modal centrado con fondo oscurecido; medalla, nombre y descripción.
  - Animación breve de partículas y medallas; **celebración colectiva** si hay varios desbloqueos.
  - **Nunca** mostrar 14 modales consecutivos.
  - Cierre accesible (botón y Escape); gestión correcta del foco.
  - Respeto por `prefers-reduced-motion`; sin destellos estroboscópicos.
  - Sonido breve opcional, **desactivado inicialmente**.
  - No repetir celebraciones ya vistas.
  - Diseño responsive.
  - Las celebraciones son **eventos visuales puntuales**; no sustituyen el historial persistente de notificaciones.

Separación conceptual (ACH-NOTIF-01 / ACH-CELEB-01 / `TrophyToastStack` / ACH-REV): las notificaciones persisten; las celebraciones ocurren una vez y se acaban; `TrophyToastStack` fue el anuncio LIVE **histórico** (sustituido en #51); ACH-REV decide si una fila de logro sigue existiendo, no cómo se comunica. Las notificaciones futuras (no-logro) no tienen por qué celebrarse. Reutilizar infraestructura existente cuando sea adecuado.

#### LEG-01 — Ruta legacy `/achievements`

- **Descripción:** Evaluar la página Soma 1.0 (`pages/AchievementsPage.tsx`, `TrophyCard`) frente a Soma 2.0 (`recovery-dashboard/pages/AchievementsPage.tsx`).
- **Estado:** Fusionado en `develop` vía ACH-01 (PR #70): `/achievements` **redirige** a `/app/achievements`. La galería 2.0 es la experiencia principal.
- **Prioridad:** P3 residual
- **Problema original (galería 1.0):** no mostraba `ruleReview`; coloreaba tramos en secretos (contradecía UX-10/UX-12).
- **Evidencia:** Rutas históricas en `App.tsx`: `/achievements` autenticada legacy; `/preview/achievements` y `/app/achievements` Soma 2.0. ACH-01 sustituye la experiencia principal por la galería 2.0 y redirige la ruta legacy.
- **Dependencias:** UX-10–12 y ACH-01 (no reabrir la galería 1.0).
- **Criterio:** Un enlace a `/achievements` llega a Logros 2.0; no hay una galería paralela como experiencia principal.

#### ACH-01 — Sistema de logros y medallas

- **Objetivo:** Galería 2.0 como experiencia principal de medallas: catálogo claro, progreso honesto, historial permanente.
- **Estado:** Fusionado en `develop` (`c28b31e`, PR #70) y en `main` vía REL-01 (`8155554`, PR #76). **Deploy de producción no verificado aquí.** Última validación conocida de la rama ACH-01: 665 tests web, TypeScript y build correctos.
- **Prioridad:** P3 residual (regresiones; no reabrir reglas de las 149 medallas alcanzables)
- **Decisiones confirmadas:**
  - 156 identificadores en el catálogo; 149 alcanzables; 7 sin regla válida, mostradas como no disponibles y **excluidas** del progreso de colección.
  - Familias temporal (GAME-01) y de curva; medallas asociadas a modelos educativos.
  - Historial permanente; las recaídas **no** revocan medallas.
  - `/achievements` redirige a `/app/achievements`.
  - Traducciones ES/EN de la superficie 2.0.
- **Pendiente de diseño:** UX-11 (platino como conjunto). UX-12 (secretos vs platinos visibles). Economía XP y misiones **no** forman parte de este ID (GAM-01 / GAM-02).
- **Dependencias:** GAME-01, GAME-03C, UX-10, ACH-REV (recaída), LEG-01.
- **Criterio:** La galería 2.0 es la única experiencia principal; el porcentaje de colección no cuenta medallas inalcanzables; el historial sobrevive a una recaída.

---

## Soma Expeditions — Gamificación de la recuperación

Línea de producto **parcialmente implementada** en `main` git (GAME-01–03, NAV-01–02, Explorador 2.0, EXP-EDU, REC-VIS-01, ACH-01, JRN-01, GAM-01, GAM-02). Atlas 2.0 (UX-GLO-01) está en `develop`. Mapa de expedición (GAME-07) **sigue pendiente**. Somi: primera fase técnica **local** (`97ef60d`; CHR-01 **abierto**). Tutorial (ONB-01) **cerrado en desarrollo local**; **no** publicado. Pendiente LIVE autenticada y despliegue. Combina mecánicas de RPG científico con una aventura **personal** de recuperación. El usuario es el protagonista de su expedición. El progreso debe ser comprensible, motivador y **voluntario**.

Principios (no negociables hasta que un hito los reabra por escrito):

- No rankings competitivos de abstinencia.
- No penalizar la inactividad en la aplicación.
- No recompensas diarias obligatorias.
- No presentar las curvas educativas como mediciones clínicas.
- No castigar recaídas eliminando automáticamente conocimientos, experiencia o reconocimientos históricos.
- Mantener la estética científica y la identidad visual actual de Soma.
- Reutilizar logros, notificaciones (ACH-NOTIF-01) y celebraciones (ACH-CELEB-01).
- Las familias **temporales** se separan con claridad de las **fisiológicas** (catálogo 106 / UX-10–12).

Filosofía: *la ciencia explica el camino; los logros reconocen los pasos; el horizonte recuerda por qué merece la pena recorrerlo.* El componente visual de naturaleza se llama **Horizonte** (tranquilidad y propósito). No es retención compulsiva.

**Dirección visual** (2026-10-26): pantallas `docs/design/*-2.0.png` **aprobadas como dirección**, no como especificación de datos ni como reemplazo del shell. Cifras, fechas, nombres de medallas, XP y porcentajes de los PNG son **ilustrativos**. Si un detalle del mockup choca con este documento o con UX-01–12, **gana el documento**.

Inventario real de `docs/design/` (2026-10-26):

| Archivo | Rol |
| --- | --- |
| `inicio-2.0.png` | Inicio 2.0 (dirección visual) |
| `mi-recuperacion-2.0.png` | Mi recuperación 2.0 |
| `explorador-2.0.png` | Explorador / Explorar 2.0 |
| `explorador-anatomico-2.0.png` | Explorador anatómico 2.0 |
| `logros-2.0.png` | Logros 2.0 |
| `expedicion-2.0.png` | Expedición 2.0 (única versión en disco; dos familias de rutas) |
| `bitacora-2.0.png` | Bitácora 2.0 (dirección visual; JRN-01 **sí** está en `main` git, **no** producción) |
| `misiones-2.0.png` | Presente en disco **sin seguimiento** (2026-10-28). Dirección local; **no** autoriza GAM-02 ni se afirma como mockup aprobado en Git |
| `soma-2-reference.png` | Referencia del producto **actual** (Inicio), no 2.0 |
| `soma-mi-recuperacion-reference.png` | Referencia actual |
| `soma-explorar-reference.png` | Referencia actual |
| `soma-explorador-anatomico-reference.png` | Referencia actual |
| `soma-logros-reference.png` | Referencia actual |
| `visual-organs.png` | Recurso de órganos, no pantalla |

No hay una segunda imagen de expedición en el inventario versionado. Las misiones siguen pudiendo aparecer como **tarjetas embebidas** en Inicio, Explorador y Expedición. Un PNG local `misiones-2.0.png` **no** equivale a GAM-02 implementado ni a un catálogo aprobado.

#### GAME-DESIGN-01 — Navegación y diseño de Expeditions

- **Descripción:** Cómo entra Expeditions en SHELL-01 **sin** segundo sistema de navegación. Dirección visual de ocho pantallas. Siete PNG 2.0 del inventario 2026-10-26 más `misiones-2.0.png` **local y sin seguimiento** (no está en Git; no es asset de producción ni mockup validado en el repositorio). Las misiones también aparecen como tarjetas embebidas en Inicio, Explorador y Expedición.
- **Estado:** Dirección visual **aprobada**. NAV-01 fusionado en `develop` (`f107bc8`, PR #55). NAV-02 fusionado en `develop` (`d0c4c78`, PR #56). GAME-03A fusionado en `develop` (`6658e6b`, PR #57). GAME-03B fusionado en `develop` (`2d897bd`, PR #58). GAME-03C fusionado en `develop` (`ac595c2`, PR #59). I18N-2.0 fusionado en `develop` (`5a451bd`, PR #60). Explorador 2.0 fusionado (`559df95`, PR #61). REC-VIS-01 (PR #69) y ACH-01 (PR #70) fusionados. **No** desplegado.
- **Prioridad:** P1
- **Horizonte:** cabecera de naturaleza + (en Inicio) mochilero ante el paisaje. Reutilizar identidad Soma; no sustituir la figura anatómica de Inicio. Fotos de mockup **no** son assets de producción hasta licencia/arte propio.
- **Mapeo pantalla → hitos:**

  | Pantalla | Mockup | Hitos | Reutilizar | Nuevo (no implementar aún) |
  | --- | --- | --- | --- | --- |
  | Inicio 2.0 | `inicio-2.0.png` | GAME-02, GAM-02, GAM-01, GAME-07 (resumen), UX-02 | `HeroFigure`, mensajes diarios, chips de sustancia, `AchievementMedal` | Horizonte, próximo hito, misión recomendada, nivel (tras GAM-01) |
  | Recuperación 2.0 | `mi-recuperacion-2.0.png` | GAME-02, GAME-03, UX-04 | Curvas, filtros, órganos/sistemas, días de abstinencia | Línea temporal de medallas **temporales**; no duplicar tarjetas de sustancia vs órganos |
  | Explorador 2.0 | `explorador-2.0.png` | GAME-05, EXP-EDU-01, UX-05–07 | 5 sustancias, 12 sistemas, buscador, NT publicados, cabecera, filtros | Fichas EXP-EDU-01; misiones GAME-05; **sin** síntomas no publicados |
  | Atlas 2.0 | `explorador-anatomico-2.0.png` | GAME-05 | Visor, zoom, ilustraciones **originales**, 12 sistemas | Panel contextual; **quitar** la cuadrícula duplicada de sistemas a la derecha del mockup; órganos del sistema; enlaces a misiones |
  | Logros 2.0 | `logros-2.0.png` | GAME-01–03, UX-10–12 | 106 fisiológicos, nombres originales, secretos, `ruleReview`, filtros | Familia temporal aparte; colecciones; platino como culminación; **sin** cambiar reglas aún |
  | Misiones 2.0 | PNG local sin seguimiento; no versionado | GAME-05 (intención), **GAM-02** (hito actual) | Atlas, sustancias, NT, procesos existentes | Sección + catálogo; sin XP hasta **GAM-01** |
  | Bitácora 2.0 | `bitacora-2.0.png` | GAME-04 (intención), **JRN-01** (hito actual) | Auth / cuenta | Persistencia, privacidad, export; **rechazar** racha obligatoria y «bienestar medio» clínico del mockup |
  | Expedición 2.0 | `expedicion-2.0.png` | GAME-07, GAME-01–05 | Medallas, misiones, GAME-02 | Mapa; rutas de **conocimiento** vs **perseverancia** (reglas distintas) |

- **Ilustrativo vs aprobado (auditoría):**
  - Aprobado: bloques, tono Horizonte, dualidad de rutas, chips por sustancia + próximo hito, timeline temporal ≠ curvas, NT y procesos en Explorar, visor anatómico conservado, dos familias de logros (intención), bitácora voluntaria.
  - Ilustrativo / no copiar: días 47/4/161, nivel 12, 320/500 XP, 106/32/7 del mockup de Logros si no coinciden con LIVE, nombres «El despertar de la fuerza», Jedi, Matrix, Tony Stark, «Maestro del equilibrio»; fechas 2024; racha 12 días; bienestar 7,2/10; cuerpo 3D generado del atlas; alcohol ausente en una fila de Recuperación.
  - Conflicto atlas: el PNG aún muestra «Sistemas con ilustración» a la derecha; producto **elimina** esa duplicación.
  - Conflicto logros: el PNG mezcla hitos de días con estética de catálogo 106 y **no** muestra con claridad fisiológico vs temporal ni platinos como colecciones. La especificación de producto prevalece.
- **Navegación (propuesta, no código). Conservar SHELL-01** (sidebar plegable, chrome en pie del rail, bottom nav de 5, sin header `lg+`). Los mockups pintan 8 ítems + Ajustes: **no** sustituyen el shell.

  Escritorio (rail expandido, dos grupos):
  1. Primario: Inicio · Mi recuperación · Expedición · Explorar · Anatomía · Logros
  2. Secundario (más abajo o «Más»): Misiones · Bitácora  
  Rail contraído: iconos de los 6 primarios; Misiones y Bitácora en menú «Más» o solo desde Expedición/Inicio hasta que existan rutas.

  Móvil (máximo 5 en la barra): Inicio · Recuperación · Expedición · Explorar · Más.  
  «Más» (hoja): Anatomía, Logros, Misiones, Bitácora, Cuenta.  
  No 8 pestañas inferiores. No un mapa de navegación paralelo al `NavLink` actual.

- **Dependencias:** SHELL-01 (base). ACH-NOTIF-01 / ACH-CELEB-01 (reutilizar). No bloquea la definición editorial de GAME-01. **Sí** bloquea meter 8 rutas vacías en el menú.
- **Criterio:** Dirección visual citada por archivo. Nav desktop/móvil documentada aquí. Wireframe de «Más» móvil **antes** de tocar `shellSections`. Este ID **no** implementa catálogo, misiones, mapa ni bitácora.

#### GAME-01 — Logros temporales por sustancia

- **Descripción:** Familia `temporal`: 50 medallas (10 umbrales × 5 sustancias), IDs `{sustancia}-temporal-{días}`. Distinta del catálogo fisiológico (`family: curve`, 106). Umbrales 1, 3, 7, 14, 21, 30, 60, 90, 180, 365. Rareza bronce/plata/oro. Sin órgano ni umbral de curva.
- **Estado:** Fusionado en `develop` (`d0cafd8`, PR #53). Copy ES/EN cerrado. **No** desplegado en producción. GAME-02 lee esta familia.
- **Prioridad:** P1 (siguiente: autorización de commit/PR → migrate+upsert de producción; no seed wipe)
- **Nombres:** aprobados en `apps/api/prisma/seed/temporal-achievements.ts` (títulos canónicos).
- **Motor:** rama `temporal` en `planAchievementUnlocks` con `daysBetween` (24 h). Insert-only. Recaída/`active`: sin unlocks nuevos. ACH-REV intacto.
- **Celebración:** un lote live ≥ 8 inserts no abre modal (`BULK_RECOGNITION_MIN`). El primer GET `initial` sigue sin celebrar. Un hito suelto (p. ej. día 7) sí celebra.
- **Dependencias:** ACH-NOTIF-01 / ACH-CELEB-01. UX-10 `ruleReview` solo curva. UX-11/12 sin tocar. GAME-02 leerá esta familia.
- **Criterio:** 156 filas de catálogo; 106 IDs fisiológicos intactos; GET sigue array; campos `family` y `triggerAbstinenceDays` aditivos.

#### GAME-02 — Próximo hito

- **Descripción:** Mostrar el siguiente logro temporal, el progreso acumulado y el tiempo restante. Varias sustancias y `lastUseDate` distintas a la vez.
- **Estado:** Fusionado en `develop` (`8eb4a3e`, PR #54). **No** desplegado en producción.
- **Prioridad:** P1
- **Dependencias:** GAME-01 (familia definida, en `develop`). LIVE-01 (fechas por sustancia). Superficies mínimas: Inicio + Mi recuperación. Expedición 2.0 y paisaje de Inicio **no** incluidos.
- **Criterio:** Cada sustancia abstinente muestra como máximo **un** próximo hito comprensible. El % hacia la medalla temporal **no** es el % de curva (UX-04). Sustancia activa: sin cuenta atrás punitiva. Inactividad de app **no** retrasa el hito (el reloj es la abstinencia, no los logins).
- **Producto posterior:** **Después de GAME-02 adelantaremos la navegación 2.0, antes del rediseño completo GAME-03.** Trabajo separado. No forma parte de esta rama.

#### GAME-03 — Inicio 2.0, Mi recuperación 2.0 y Logros 2.0

- **Descripción:** Rediseño visual de las tres pantallas principales. El criterio original de **cronología temporal** (línea 1–365, no un segundo gráfico de curvas) permanece en GAME-03B / Recuperación 2.0 (`mi-recuperacion-2.0.png`).
- **Estado:** GAME-03A fusionado en `develop` (`6658e6b`, PR #57). GAME-03B fusionado en `develop` (`2d897bd`, PR #58). GAME-03C fusionado en `develop` (`ac595c2`, PR #59). **No** desplegado.
- **Prioridad:** P1
- **Dependencias:** GAME-01, GAME-02, NAV-01, NAV-02. ACH-NOTIF-01 no sustituye al árbol/timeline.
- **Entregas:**
  - **GAME-03A — Inicio 2.0:** tablero de expedición (situación, próxima medalla temporal, descubrimiento fisiológico compacto, hasta 4 logros LIVE reales, tarjeta de paisaje con `nature-1.png`). Sin XP ni niveles.
  - **GAME-03B — Mi recuperación 2.0:** cabecera `nature-2.png`, tarjetas de sustancia, panel de foco, rail de 10 umbrales GAME-01 con interpolación, curvas y sistemas. Fórmulas y catálogos intactos.
  - **GAME-03C — Logros 2.0:** cabecera `nature-3.png`, resumen 156 (106+50), filtros y búsqueda, destacados reales, galería temporal y fisiológica, platinos visibles. Sync y reglas de desbloqueo intactos.
- **Criterio (03B):** usable con teclado y en 320 px; sin scroll horizontal accidental; copy de que los hitos son tiempo de abstinencia. Futuras temporales no spoilean secretos **fisiológicos** (UX-12).

#### GAME-04 — Bitácora de recuperación

- **Descripción:** Registros **voluntarios** de ánimo, sueño, energía y notas. No son diagnósticos. **No** atribuir automáticamente sus variaciones a la abstinencia. **JRN-01 amplia este ID** (emoción opcional, intensidad de deseo, desencadenantes, consulta de evolución); no lo sustituye ni crea un segundo diario.
- **Estado:** Implementado en `develop` vía **JRN-01** (PR #72). **No** producción. Dirección visual: `bitacora-2.0.png`. Residual: política de retención/exportación pública y copy de privacidad en landing.
- **Prioridad:** P1 (implementación vía JRN-01)
- **Dependencias:** GAME-DESIGN-01. Decisión de retención/exportación (cuenta, dispositivo, GDPR). AUTH-01. No mezclar con síntomas clínicos publicados. JRN-01 (campos adicionales).
- **Criterio (histórico, vigente):**
  - UI opt-in.
  - Campos acordados: ánimo, sueño, energía, ansiedad/estrés, notas personales, calendario, tendencias, reflexiones y aprendizajes **marcados por el usuario**.
  - Nota de privacidad aprobada (qué se guarda, quién lo ve, cómo se exporta/borra) **antes** de tocar Prisma.
  - Del mockup **no** se implementan: racha de uso como meta, «bienestar medio» 0–10 como evaluación, causalidad automática con la abstinencia.

#### Explorador 2.0 — Descubrimiento educativo

- **Descripción:** Rediseño de Explorar (`/preview/explore` y `/app/explore`) como tablero de descubrimiento educativo. Reutiliza contratos existentes (5 sustancias, 12 sistemas, perfiles NT, selector de fase). No es Atlas 2.0 ni GAME-05.
- **Estado:** Fusionado en `develop` (`559df95`, PR #61). **No** desplegado.
- **Prioridad:** P3 residual.
- **Capacidades entregadas:**
  - Cabecera con `nature-4.png`.
  - Búsqueda ES/EN.
  - Filtros por categoría.
  - Cinco sustancias.
  - Doce sistemas anatómicos.
  - Ilustraciones individuales para los doce sistemas.
  - Nueve neurotransmisores educativos (cinco destacados + expansión).
  - Selector manual de fases conservado.
  - Procesos clave y neurotransmisores con fichas EXP-EDU (PR #62–#67).
  - Panel de misiones educativas: teaser hacia `/missions` (GAM-02 en `develop`; **no** producción).
  - Diseño responsive (sin overflow horizontal a 1440, 390 y 320 px).
  - Reutilización de los contratos existentes.
- **No entregado en producción:** GAM-02 y GAM-01 están en `main` git (REL-01) **sin** deploy verificado aquí. Atlas 2.0 está en `develop` (UX-GLO-01, PR #79), **no** en `main`. Síntomas no publicados.
- **Dependencias:** UX-05–07. I18N-2.0 (chrome de dashboards 2.0). No GAME-01/02.
- **Criterio:** Explorar usable en DEMO y LIVE local; NT educativos no se presentan como medición; procesos y misiones no fingen catálogo publicado.

#### EXP-EDU-01 — Fichas educativas de neurotransmisores y procesos clave

- **Descripción:** Ampliar las fichas de los nueve neurotransmisores educativos y desarrollar fichas para cinco procesos clave, con contenido ES/EN, explicación científica accesible y referencias verificables.
- **Estado:** Entregado en `develop` mediante EXP-EDU-01c / 02a / 02b / 03 / 04 (PR #62–#67) y enlaces atlas (PR #67). **No** es GAME-05. **No** desplegado.
- **Prioridad:** P3 residual
- **Alcance previsto:**
  1. Ampliar las fichas de los nueve neurotransmisores.
  2. Desarrollar fichas educativas para cinco procesos: receptores, tolerancia, dependencia, neuroadaptación, metabolismo.
  3. Contenido ES/EN.
  4. Explicaciones científicas accesibles.
  5. Referencias bibliográficas verificables.
  6. Revisión editorial y científica **antes** de publicar.
  7. Navegación desde las tarjetas de Explorador.
  8. Diferenciación explícita entre información educativa y mediciones individuales.
- **Dependencias:** Explorador 2.0 (superficie). No inventar ventanas UX-08. No medición de NT. No contenido `pending_clinical_review`.
- **Criterio:** Fichas publicadas solo tras revisión; las tarjetas de Explorador enlazan a contenido revisado; copy deja claro que no son mediciones individuales.

#### GAME-05 — Misiones educativas

- **Descripción:** Misiones cortas ligadas al atlas, sustancias y neurotransmisores. Recompensan **aprendizaje y exploración**, no abstinencia. **GAM-02 amplia este ID** con una clasificación general de misiones; no lo sustituye ni crea un segundo catálogo.
- **Estado:** Capa educativa piloto **implementada en `develop`** vía **GAM-02** (PR #74; seis `reading_check`). **No** producción. Bienestar y objetivos personales **siguen pendientes**. Dirección: `inicio-2.0.png`, `explorador-2.0.png`; mockup `misiones-2.0.png` local sin seguimiento.
- **Prioridad:** P1 (implementación vía GAM-02, categoría de descubrimiento y aprendizaje)
- **Dependencias:** GAME-DESIGN-01. GAM-01 **después** (no puntuar hasta reglas de XP). Atlas / Explorar / NT **publicados**. No inventar ventanas UX-08 ni medición de NT. No contenido `pending_clinical_review`.
- **Criterio (histórico, vigente):**
  - Áreas temáticas educativas: neurociencia, anatomía, sustancias, fisiología/procesos.
  - Cada misión educativa: título con personalidad, objetivo, contenido de atlas, actividad o pregunta, estado, recompensa educativa (no loot aleatorio).
  - Disponibles **con o sin** abstinencia. No bloquean conocimientos. Granja repetible ilimitada **fuera de alcance**.

#### GAME-06 — XP y niveles

- **Descripción:** Intención original: estudiar experiencia a partir de logros (fisiológicos y temporales) y de aprendizaje. El «Nivel 12 / Explorador neuronal» de `inicio-2.0.png` es **ilustrativo**.
- **Estado:** Economía **implementada en `develop`** vía **GAM-01** (`751c6aa`). **No** producción. Este ID no se reabre como segunda economía.
- **Prioridad:** P1 (vía GAM-01)
- **Dependencias:** ACH-01 (qué medallas existen). GAM-02 (aprendizaje). ACH-REV: el XP histórico **no** se borra en recaída.
- **Criterio:** Los de GAM-01. Nada de recompensas repetibles ilimitadas ni mecánicas de uso compulsivo (racha diaria obligatoria, FOMO de login).

#### GAME-07 — Centro de expedición

- **Descripción:** Sección **propia** Expedición (dirección: `expedicion-2.0.png`) **más** resumen en Inicio. Mapa de montaña; selector conocimiento vs perseverancia; no mezclar reglas.
- **Estado:** Pendiente (dirección visual aprobada; implementación no)
- **Prioridad:** P2 (mapa). Nav de la sección: con GAME-DESIGN-01 / Fase C.
- **Dependencias:** GAME-DESIGN-01 (ítem de menú sin vaciar el bottom nav). GAME-01/02 para metas temporales. GAM-02 para rutas de conocimiento. SHELL-01.
- **Criterio:** Rutas de conocimiento = aprendizaje. Rutas de perseverancia = hitos temporales por sustancia (alcohol, nicotina, cannabis, cocaína, cafeína). Mapa exploratorio, no ranking. Sin segundo router.

#### GAME-08 — Capítulos de recuperación

- **Descripción:** Representación **respetuosa** de etapas de recuperación (no calendarios clínicos UX-08). Las decisiones de persistencia se vinculan a **ACH-REV**.
- **Estado:** Pendiente
- **Prioridad:** P2
- **Dependencias:** ACH-REV (política **antes** de código). GAME-01 / GAM-01 (qué se conserva). **No** implementar revocaciones ni cambios de `lastUseDate` en este ID.
- **Criterio:** Copy y estados de capítulo aprobados. Recaer no borra el historial de reconocimientos salvo que ACH-REV lo autorice por escrito. Este ID **no** escribe Prisma de logros.

---

## Siguiente bloque de producto (ROADMAP-02)

Hitos del siguiente bloque. JRN-01, GAM-01 y GAM-02 están **en `main` git y no se dan por desplegados**. FBK-01, R-JXP, UX-GLO-01, CLEAN-01 y WEB-01 están **en `develop` y no en `main`**. El resto permanece planificado. No anuncian funcionalidades como disponibles en `somarecovery.app`. Los IDs `GAM-*` no sustituyen a `GAME-01`–`GAME-08`. El identificador **UX-01** sigue siendo orientación anatómica; la revisión global de experiencia es **UX-GLO-01**.

Orden vigente (**ROADMAP-REORG-01**; no usar el orden que colocaba MKT-01 antes de la beta ni el tutorial como opcional para abrir):

- **Hecho en git de `develop` (no desplegado):** FBK-01 (cerrado) → R-JXP (cerrado, PG17 20/20) → UX-GLO-01 (completado, PR #79) → CLEAN-01 (`ca3b456`) → WEB-01 (PR #82). GAM-03 **cerrado técnicamente** en local (`19c76a1`; no `origin/develop`).
- **Carril de producto hasta la beta:** **CHR-01** (A → B) → **ONB-01** → **UX-PRE-BETA** → **BETA-01** (D.3 jurídica, avisos, consentimiento, git/deploy, migraciones/backups, registro, humo, autorización).
- **Tras la apertura:** **MKT-01**.
- **Paralelo (no cierra BETA-01):** preparación jurídica BETA-01D.3.
- **Residual / posterior:** WEB-02; SEO-01B; FBK-02; GAME-07; GAME-08 (tras ACH-REV residual). MOB-01 pospuesto.

La beta pública **espera** Somi usable (**CHR-01** cerrado), tutorial (**ONB-01**) y la revisión del propietario (**UX-PRE-BETA**), además de los bloqueadores legales y técnicos de BETA-01.

#### JRN-01 — Bitácora personal

- **Objetivo:** Ampliar GAME-04: diario privado y voluntario que conserva los campos históricos y añade registro emocional opcional, intensidad del deseo de consumir, desencadenantes y consulta de la evolución personal.
- **Prioridad:** P1
- **Estado:** Completado e integrado en `develop` (PR #72, merge `9b5bb63`). **No** producción. No es un segundo diario: implementa GAME-04 más los campos nuevos. Residual: nota de privacidad pública / retención GDPR.
- **Dependencias:** AUTH-01 (cuenta LIVE). GAME-DESIGN-01 (navegación; Bitácora en secundario / «Más», no 8 pestañas). Nota de privacidad **antes** de Prisma/API (criterio GAME-04). No depende de GAM-01 ni de CHR-01.
- **Criterios acordados (GAME-04, vigentes):** ánimo, sueño, energía, ansiedad/estrés, notas, calendario, tendencias, reflexiones destacadas por el usuario; sin racha; sin «bienestar medio» clínico; sin causalidad automática con la abstinencia; no diagnóstico.
- **Decisiones confirmadas (ampliación):**
  - Privada y voluntaria.
  - No penalizar días sin escribir.
  - Convivencia de los campos GAME-04 con emoción opcional, intensidad de deseo y desencadenantes (no son un reemplazo).
- **Pendiente de diseño:** Cómo se presentan juntos esos campos en la UI; escalas de intensidad; taxonomía de desencadenantes; retención/exportación/borrado (detalle GDPR); si las tendencias son solo consulta personal.
- **Criterio:** El usuario puede escribir, consultar el calendario y dejar de escribir sin perder progreso de Soma. Nadie más ve las entradas. La nota de privacidad existe **antes** de Prisma.

#### GAM-01 — Experiencia y niveles

- **Objetivo:** XP por acciones significativas y niveles **permanentes**, con recompensas educativas y de participación.
- **Prioridad:** P1
- **Estado:** Completado e integrado en `develop` (`751c6aa`, 2026-10-28). **No** producción. GAME-06 es la intención previa; **no** hay una segunda economía. Las cifras de los PNG (nivel 12, 320/500 XP) siguen siendo **ilustrativas** respecto a la curva real (`T(L)`, techo `PROGRESS_XP_MAX`).
- **Entregado en `develop`:**
  - XP por fuentes catalogadas (`mission_complete` 12, `journal_create_day` 12, hito personal 10, etc.).
  - Niveles permanentes y títulos equipables.
  - Ledger `XpGrant` con unicidad `(userId, source, sourceKey)`.
  - Idempotencia y techo; recaída no borra XP.
  - LIVE vía `GET/PATCH /me/progress`; DEMO no escribe el ledger.
- **Dependencias:** ACH-01 (medallas existentes conservan reglas; no se rediseña el catálogo 156 aquí). JRN-01 no es requisito para el documento de economía, pero el orden acordado la antepone. GAM-02 puede puntuar **después** de cerrar fuentes y techos. ACH-REV: recaída no borra XP.
- **Decisiones confirmadas:**
  - XP por acciones significativas, no por login compulsivo.
  - Niveles permanentes.
  - Protección frente a acumulación abusiva.
  - Sin pérdida de XP por recaídas.
  - Sin pérdida de XP por inactividad en la app.
- **Pendiente de diseño (residual):** Copy de nombres de nivel en landing; si exploración pura puntúa; presentación pública de la curva. Las cantidades de las fuentes ya catalogadas **no** se reabren aquí.
- **Criterio:** Fuentes y techos viven en `@soma/shared-types` (`PROGRESS_XP_AMOUNT`, `T(L)`). No hay granja ilimitada ni FOMO de racha diaria. Recaída no borra XP.

#### GAM-02 — Misiones

- **Objetivo:** Ampliar GAME-05 con una **clasificación general** de misiones. No sustituye las áreas temáticas educativas.
- **Prioridad:** P1
- **Estado:** Completado e integrado en `develop` (PR #74, squash `6d73877`). **No** producción. El piloto cubre la capa **descubrimiento y aprendizaje** (GAME-05 educativa). Bienestar/habilidades y objetivos personales **siguen pendientes**. El PNG `misiones-2.0.png` local no forma parte del commit.
- **Entregado en `develop`:**
  - Seis misiones `reading_check` publicadas (dopamina, serotonina, GABA, receptores, tolerancia, neuroadaptación).
  - Catálogo editorial en `@soma/shared-types` (sin claves de respuesta).
  - Evaluación privada en API (`mission-answers.ts`).
  - Persistencia `MissionCompletion` (única por usuario y misión).
  - 12 XP en la primera finalización LIVE (`mission_complete`); repetición 0; DEMO `xpGranted: 0`.
  - Endpoints autenticados `GET/POST /me/missions`.
  - `useMissions` LIVE/DEMO.
  - Página de Misiones (seis secciones), `nature-7.png`, navegación e i18n ES/EN.
- **Dependencias (históricas, cubiertas para el piloto):** EXP-EDU / Explorador 2.0. GAME-05 (temas educativos). GAM-01 (XP) integrado en el mismo `develop`. Objetivos personales / bienestar: hito futuro, no reabrir este ID.
- **Dos capas (no son alternativas incompatibles):**
  1. **Clasificación general (GAM-02):** descubrimiento y aprendizaje; bienestar y habilidades; objetivos personales.
  2. **Áreas temáticas de las misiones educativas (GAME-05):** neurociencia, anatomía, sustancias, fisiología/procesos. Viven dentro de «descubrimiento y aprendizaje».
- **Criterios acordados (GAME-05, vigentes para la capa educativa):** cada misión educativa tiene título, objetivo, contenido de atlas, actividad o pregunta y estado; recompensa educativa, no loot aleatorio; disponibles con o sin abstinencia.
- **Decisiones confirmadas (ampliación):**
  - Las tres categorías generales citadas arriba.
  - No introducir objetivos potencialmente perjudiciales.
  - No recompensar solo «no consumir».
- **Pendiente de diseño:** Catálogo de bienestar y objetivos personales (no forma parte del piloto PR #74); tono; frecuencia; relación con GAME-07. La pantalla propia de Misiones **ya existe** en `develop`.
- **Criterio:** Hay misiones útiles con o sin abstinencia. Ninguna misión pide privación peligrosa ni sustituye consejo clínico. La capa educativa conserva GAME-05.

#### GAM-03 — Integración de gamificación

- **Objetivo:** Conectar Bitácora, Misiones, XP y Logros sin duplicar eventos ni recompensas.
- **Prioridad:** P3 residual (copy UX; regresiones). **Cerrado técnicamente.** No reabre la economía.
- **Estado:** Completado técnicamente en `develop` **local** (`19c76a1`). **No** `origin/develop`. **No** `main`. **No** desplegado. Sin tabla Prisma ni segunda economía: el mapa vive en `@soma/shared-types` (`gamification-events.ts`). Fórmulas XP y reglas de medallas/misiones **intactas**.
- **Entregado:**
  - Tabla canónica de acciones → XP / misión / medalla / idempotencia.
  - 12 XP de bitácora y 12 XP de misión son recompensas **legítimas distintas**; repetir la misma clave no concede de nuevo.
  - Tests: **64** unitarias/frontend; **32/32** PG17 (`journal.progress`, `r-jxp`, `progress.pg`, `missions.pg`, consentimiento).
- **Dependencias reales:** JRN-01, GAM-01 (ledger + R-JXP), GAM-02, ACH-01. Reutilizar ACH-NOTIF-01 y ACH-CELEB-01. GAME-07 puede leer el mismo progreso; no crea un segundo motor. **No** depende de CHR-01 ni ONB-01.
- **Decisiones confirmadas:**
  - Las medallas existentes conservan sus reglas.
  - Un mismo hecho no genera dos recompensas no declaradas.
  - Recaídas no revocan medallas ni XP.
  - `achievement_eligible`, `onboarding_complete` y `referral_qualified` siguen **reservados y no concedidos**.
  - El copy «educativa vs participación» era **pendiente de diseño**, no el criterio de cierre. Queda como **mejora UX residual** (sin ID nuevo).
- **Residual:** copy de recompensa educativa vs participación (no implementar sin diseño). Promo a `main`/producción.
- **Criterio:** Completar una misión, escribir en la bitácora o desbloquear una medalla se explica una sola vez en la economía acordada. **Cumplido** en el ledger y el mapa de eventos.

#### CHR-01 — Somi, mascota oficial

- **Objetivo:** Personaje original de fantasía que acompaña la experiencia (educación, humor, guía), no un indicador de salud. Para la beta: **ilustraciones estáticas** coherentes, no una máquina de animación CSS.
- **Prioridad:** P1 (técnico local hecho; siguiente código: ONB-01).
- **Estado:** **Técnicamente completado, pendiente de revisión final y commit.** CHR-01A (sin animación CSS) y CHR-01B (seis ilustraciones estáticas WebP) en local. Decisión del propietario: **Somi solo en ONB-01**; retirada de Cuenta. PNG originales conservados. Animación avanzada pospuesta. **No** `origin/develop` hasta commit autorizado. **No** `main`. **No** desplegado. Landing **no** anuncia a Somi como disponible.
- **Dependencias:** No bloquea JRN-01 ni GAM-01 (ya entregados). Tutorial (**ONB-01**) reutiliza el componente `Somi` y los seis WebP. Cosmética ligada a XP, si existe, **después** de un diseño usable; **nunca** como medidor de salud. WEB-01 no presenta a Somi como disponible hasta que CHR-01 esté cerrado y desplegado.
- **Decisiones confirmadas (identidad; se conservan):**
  - Criatura original flotante; ~80 % magia / ~20 % inspiración biológica sutil.
  - Cuerpo pequeño y compacto; silueta reconocible; ojos expresivos; dos orejas o prolongaciones; cola luminosa algo translúcida; azules, turquesas y violetas; marcas bioluminiscentes discretas.
  - Personalidad: curiosa, inteligente, algo traviesa, con humor, empática sin paternalismo; tono serio cuando corresponda.
  - Original: no copiar mascotas de videojuegos existentes.
  - Evolución cosmética, si existe, se relaciona con XP y aprendizaje, **nunca** con una supuesta recuperación fisiológica.
  - **Animación avanzada (CSS de respiración/flotación, partículas, deformaciones) queda pospuesta** a una versión futura. La beta usa ilustraciones estáticas.
  - **Somi aparece exclusivamente en el tutorial ONB-01.** No hay presencia permanente en Cuenta ni en otras pantallas.
- **Pendiente de diseño (ONB-01):** qué ilustración de Somi va en cada paso del tutorial. Hoja de personaje / licencia de arte si se exige un corte de producción.
- **Criterio de cierre git:** componente reutilizable, seis WebP con alfa, PNG conservados, Cuenta sin Somi, tests verdes. **Cierre de producto / deploy:** no. Pendiente revisión final y commit autorizado.

##### CHR-01A — Retirada de la preview animada (Cuenta)

- **Objetivo:** Quitar la presentación animada de Somi **sin** borrar el trabajo reutilizable.
- **Estado:** **Hecho.** Keyframes y `animated` retirados. `SomiAccountPreview` eliminado; Cuenta DEMO/LIVE ya no muestra a Somi. Conservados: PNG originales, módulo `features/somi`. Landing intacta.
- **Criterio:** Cuenta no usa animación CSS de Somi. No hay pérdida no analizada de assets.

##### CHR-01B — Ilustraciones estáticas

- **Objetivo:** Sustituir el planteamiento de animación CSS por **ilustraciones estáticas** con identidad visual coherente.
- **Estado:** **Hecho.** API `Somi` con seis estados; el runtime sirve WebP ≤512 px (lado mayor), con alfa; PNG originales sin alterar. `object-fit: contain`. Tamaños S/M/L. **No** hay animación avanzada. Listo para ONB-01.
- **Expresiones entregadas:** idle, celebrating, thinking, sleeping, waving, supportive.
- **Criterio:** Set estático WebP servido por `Somi`, PNG conservados, listo para ONB-01.

#### ONB-01 — Tutorial interactivo

- **Objetivo:** Presentar Soma 2.0 a usuarios nuevos, explicar las funcionalidades **principales que existan de verdad**, y usar a Somi como guía visual. Distinto de AUTH-01 (registro, perfil, sustancias).
- **Prioridad:** P1 (después de **CHR-01B**; antes de UX-PRE-BETA y de abrir BETA-01)
- **Estado:** **Cerrado en desarrollo local.** AUTH-01 se reutiliza y **no** se modifica. **ONB-01A** `aca59c6`. **ONB-01B** `0132676`. **ONB-01C** cerrado técnicamente en este commit (foco, Escape, `inert`/`aria-hidden`, bloqueo de fondo, restauración). Pendiente de comprobación LIVE autenticada antes de la beta. **No** desplegado. **No** publicado.
- **Dependencias:** **CHR-01B** (componente `Somi` + seis WebP estáticos). REC-VIS-01, Explorador, ACH-01, JRN-01, GAM-01 y GAM-02 ya en git (`develop`/`main` según ID) para explicar solo lo real. Persistencia de «tutorial hecho».
- **Decisiones confirmadas:**
  - Somi como guía visual (ilustraciones estáticas de CHR-01B).
  - Explica las superficies principales reales (Recuperación, Explorar, Logros, Bitácora, Misiones/XP **si** están en el corte desplegado).
  - Se puede **omitir** el tutorial.
  - Se puede **retomar** después (p. ej. desde Configuración / Cuenta).
  - ES/EN; responsive; accesible.
  - El **diseño exacto del recorrido y sus pantallas se acuerda antes de implementar**.
- **Pendiente:** comprobación LIVE autenticada antes de la beta; despliegue. El tutorial **no** está publicado.
##### ONB-01A — Motor
- **Estado:** **Completado** (`aca59c6`). Nueve pasos; avance/atrás/omitir; persistencia LIVE por `userId`; DEMO solo manual; sin Prisma/API.
##### ONB-01B — Presentación y Somi
- **Estado:** **Completado** (`0132676`). Tarjeta Soma, Somi asomado, spotlight, invitaciones no bloqueantes.
##### ONB-01C — Accesibilidad, responsive y validación
- **Estado:** **Completado técnicamente** (este commit). Foco en el diálogo antes del lock; Tab/Escape; snapshot de `inert`/`aria-hidden`; restauración del shell antes de devolver el foco; invitaciones no modales.

- **Criterio:** Un usuario nuevo entiende las superficies reales. Nada del tutorial afirma que una función planificada ya está viva. Omitir y repetir funcionan.

#### UX-PRE-BETA — Revisión integral previa a la beta

- **Objetivo:** El **propietario del producto** recorre las superficies **públicas**, **DEMO** (`/preview`) y **LIVE** (`/app`) y aprueba explícitamente que la experiencia es suficientemente estable, coherente y usable para abrir la beta. **No** es UX-GLO-01 (ya completado). **No** es una refactorización general.
- **Prioridad:** P1 (después de **ONB-01**; **antes** de autorizar BETA-01)
- **Estado:** **En curso.** Primera tanda **UX-01 a UX-10** completada localmente (más ajustes visuales de contraste, medallas ocultas, banderas y copy público de Logros). El hito general **sigue abierto**. **No** cerrado. **No** desplegado.
- **Tamaños de referencia:**
  - Móvil: 320, 375 y 430 px.
  - Tablet: 768 y 1024 px.
  - Escritorio: 1280, 1440 y 1920 px.
- **Áreas:** navegación; diseño visual; proporciones y espaciados; legibilidad; accesibilidad básica; comportamiento responsive; coherencia entre pantallas; experiencia de usuario; funcionamiento de las funcionalidades principales.
- **Salida:** lista de incidencias priorizadas por **impacto**. Solo se corrige lo que el propietario priorice para abrir. El pulido no bloqueante queda residual (VIS-01, I18N-04, etc.).
- **Dependencias:** CHR-01 cerrado (ilustraciones integradas). ONB-01 implementado o, si el propietario lo autoriza por escrito, un recorte mínimo del tutorial. Superficies 2.0 ya en el corte candidato a deploy.
- **Criterio:** Aprobación **explícita** del propietario del producto sobre el recorrido en los tamaños citados. Sin esa aprobación no se abre BETA-01.

#### WEB-01 — Renovación de la landing

- **Objetivo:** Nueva landing de Soma 2.0: funcionalidades **reales**, propuesta educativa y de seguimiento, y un camino claro al registro.
- **Prioridad:** P1 (**antes** de abrir BETA-01; no adelantar implementación en FBK-01)
- **Estado:** Completado e integrado en `develop` (`ff5a359`, PR #82). **No** en `main`. **No** desplegado. El copy público solo describe lo que esté en producción; **no** anunciar Somi, GAM-03 ni Android.
- **Dependencias:** REL-01 (funciones ya en `main`). Coordinar SEO-01A residual y **SEO-01B**. WEB-02 puede ir en el mismo trabajo visual. No espera GAM-03 ni MOB-01.
- **Decisiones confirmadas:**
  - Presentar las funcionalidades reales (Recuperación, Explorador, Logros, Bitácora, Misiones/XP **si** están desplegadas).
  - Explicar la propuesta educativa y de seguimiento, sin promesas clínicas.
  - Facilitar el registro (invite hasta BETA-01; CTA público cuando se autorice).
  - Mantener SEO y responsive.
  - Identidad visual Soma 2.0. Preparar hueco para Somi (CHR-01) sin presentarlo como disponible.
- **Identidad visual y recursos de marca (no implementar en FBK-01):**
  - Favicon definitivo.
  - Iconos web y PWA.
  - Apple Touch Icon.
  - Imagen Open Graph.
  - Comprobación de visualización en navegadores y dispositivos.
  - Coherencia con la identidad de Soma y el futuro Somi (CHR-01).
- **Residual:** WEB-02 (origen del nombre / filosofía) no se empaquetó aquí. SEO-01B (posicionamiento orgánico) sigue pendiente. El copy público **no** describe funciones que no estén en producción.
- **Criterio:** Un visitante de `somarecovery.app` entiende qué es Soma 2.0, qué puede hacer hoy, y no cree que hay mascota, app Android u otras funciones planificadas si aún no están en producción. Favicon, iconos y OG coinciden con la identidad acordada. **Cumplido en `develop`; no desplegado.**

#### WEB-02 — Identidad y filosofía

- **Objetivo:** Sección pública sobre el origen del nombre y la filosofía educativa, sin promesas médicas exageradas.
- **Prioridad:** P2
- **Estado:** Pendiente. Puede empaquetarse con WEB-01.
- **Dependencias:** WEB-01 (superficie). No depende de JRN/GAM.
- **Decisiones confirmadas:**
  - Soma procede del griego antiguo σῶμα, «cuerpo».
  - Etimología de σῶμα y por qué se eligió el nombre.
  - Filosofía: conocimiento, recuperación y autonomía personal.
  - No diagnóstico, no predicción clínica individual.
- **Pendiente de diseño:** Longitud del texto, tono (accesible, no académico opaco), si hay página propia o bloque en landing. Coordinar con **SEO-01B**.
- **Criterio:** La historia del nombre está publicada en ES/EN y no contradice UX-04 / REC-VIS-01.

#### SEO-01 — Search Visibility & Indexing

Visibilidad de búsqueda de las superficies **públicas**. No indexar `/app`, `/preview` autenticado, ni APIs. No publicar contenido `pending_clinical_review`.

##### SEO-01A — Fundamentos técnicos

- **Objetivo:** Base técnica de indexación junto con **REL-01**.
- **Prioridad:** P2 residual (Search Console / CWV).
- **Estado:** Fusionado en `develop` (`cdf038c`, PR #75). Landing estática indexable; superficies privadas con `noindex`. Core Web Vitals y Search Console **no** medidos aquí.
- **Alcance:**
  - Títulos y metadescripciones de páginas públicas.
  - Canonical.
  - Open Graph.
  - `robots.txt` y `sitemap.xml`.
  - Indexabilidad de la landing; renderizado público (SPA: crawlers que no ejecutan JS pueden ver solo `web`).
  - Evitar indexación de páginas privadas (`/app`, reset/invite con secretos).
  - Revisar Core Web Vitals / rendimiento.
  - Preparar Google Search Console.
  - `hreflang` solo si hay URLs públicas distintas por idioma (hoy el idioma es cliente, no path).
- **Dependencias:** REL-01 (misma ventana). No espera WEB-01.
- **Criterio:** Un crawler recibe metadatos coherentes de la landing y no indexa el diario ni las misiones autenticadas.

##### SEO-01B — Posicionamiento orgánico

- **Objetivo:** Contenido y autoridad, junto con **WEB-01** y **WEB-02**.
- **Prioridad:** P2
- **Estado:** Pendiente. No iniciar copy de posicionamiento clínico.
- **Alcance:** Investigación de palabras clave; arquitectura de contenidos públicos; educación sobre recuperación; enlaces internos; datos estructurados cuando correspondan; calidad científica y referencias verificables; autoridad y confianza.
- **Dependencias:** WEB-01 / WEB-02. SEO-01A. Revisión clínica para cualquier síntoma/consejo.
- **Criterio:** Contenido público alineado con UX-04; sin promesas individuales de curación.

#### REL-01 — Release de producción

- **Objetivo:** Preparar el paso de `develop` a `main` y desplegar los avances acumulados **después** de PR #52, sin poner en riesgo datos existentes.
- **Prioridad:** P2 residual (deploy de producción y migraciones, cuando se autoricen)
- **Estado:** Squash-merge en `main` (`8155554`, PR #76). **No** hay deploy autorizado aquí. **No** hay migraciones en Supabase autorizadas. El registro sigue por invitación.
- **Incluye (ahora en `main` git, no necesariamente desplegado):** GAME-01–03, NAV-01–02, I18N-2.0, Explorador 2.0, EXP-EDU, HOME-UI-01, REC-VIS-01, ACH-01, JRN-01, GAM-01, GAM-02.
- **En `develop` y aún no en `main`:** SEO-01A (PR #75), FBK-01 (PR #77), R-JXP (PR #78), UX-GLO-01 (PR #79), CLEAN-01 (`ca3b456`), WEB-01 (PR #82), registro/privacidad (PR #83), CI (PR #84). **Local sin push:** backups `78e3b1d`, legales `ed33f6b`, consentimiento `ba65a7c`, GAM-03 `19c76a1`, Somi `97ef60d`. **En `main` encima de REL-01:** backups R2 (`21e5897`) y pin PG17 (`7f78c32`).
- **Dependencias:** Inventario de migraciones Prisma vs producción (estado de `_prisma_migrations` en Supabase **desconocido** sin consulta autorizada). Variables de producción (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `APP_PUBLIC_URL`, mailer). Backup antes de migrar.
- **Convención del PR de producción (cuando se autorice):** título y descripción **íntegramente en inglés** (summary, features, migrations, testing, deployment, known issues, rollback).
- **Criterio:** `main` avanza un squash/merge acordado; migraciones aplicadas con backup; DEMO y un humo LIVE de staging o producción autorizado; rollback documentado (revertir deploy; **no** asumir `migrate down`). El registro sigue **por invitación** hasta **BETA-01**.

#### FBK-01 — Feedback Center

- **Objetivo:** Espacio **integrado** en Soma para sugerir funciones, proponer mejoras y comunicar errores.
- **Prioridad:** P3 residual (regresiones). Ya no es la prioridad inmediata de producto. Cierre revisado el 2026-10-30: **cumple** los criterios de aceptación originales.
- **Estado:** Completado e integrado en `develop` (`f1b447f`, PR #77). **No** en `main`. **No** desplegado. No formaba parte del squash REL-01. Revisión de cierre: formulario, validación, `GET/POST /me/feedback` con JWT, persistencia PostgreSQL (`FeedbackReport`), asociación al usuario de sesión, errores/carga, ES/EN, throttle 8 POST / 15 min y huella 24 h. Tras retirar consentimiento de categoría especial (`ba65a7c` local): historial LIVE purgado; el envío sigue permitido con aviso. Gestión interna = SQL/estado; **sin** UI de administración (no estaba en el criterio original).
- **Primera versión:** Formularios **privados** y gestión **interna**.
- **Decisiones confirmadas:**
  - No publicar automáticamente lo que envíen los usuarios.
  - No conceder XP por enviar feedback.
  - No es un foro ni un tablero público (eso es **FBK-02**).
  - DEMO no persiste ni llama a la API; LIVE usa `GET/POST /me/feedback`.
- **Dependencias:** REL-01 (árbol en `main`). AUTH-01 (identidad LIVE). No espera GAM-03 ni Somi.
- **Criterio:** Un usuario autenticado puede enviar sugerencia, mejora o error sin que el contenido salga a la vista pública ni sume XP. En móvil, «Enviar» no queda bajo la barra inferior.

#### BETA-01 — Public Beta Launch

- **Objetivo:** Permitir registros **públicos** y abrir Soma a usuarios reales, identificada como **beta pública**, cuando estabilidad, seguridad, coherencia visual y usabilidad sean suficientes.
- **Prioridad:** P1 de **apertura**, **después** de CHR-01, ONB-01 y UX-PRE-BETA. CLEAN-01, WEB-01, FBK-01, R-JXP, UX-GLO-01 y GAM-03 cubiertos en git de `develop` (GAM-03 local). El siguiente requisito **legal** para abrir sigue siendo **BETA-01D.3**, más la publicación de avisos y la autorización humana.
- **Estado:** Preparación **parcial**. **No** cerrado. **No** activar registros públicos. `AUTH_REGISTRATION_MODE=invite`. `LEGAL_NOTICE_STATUS=draft`. Esta reorganización **no** cambia esos valores.

Preparación y autorización son **fases distintas** del mismo ID. Completar la lista de preparación **no** abre la beta.

##### Preparación (trabajo; no abre registros)

- Registro por invitación **implementado** (`65866c2`, PR #83; `c00b908` y confirmación de contraseña). **No** habilitado en producción. El registro en producción permanece bloqueado mientras los avisos estén en `draft`.
- Privacidad y RGPD: borradores ES/EN **preparados** (`ed33f6b` local), **no** publicados. Consentimiento explícito de datos sensibles y retirada **implementados y probados** (`ba65a7c` local). **BETA-01D.3 pendiente:** validación jurídica, identificación del responsable, proveedores y transferencias internacionales.
- Seguridad y prevención de abuso (auth, throttle, superficies privadas; CI/ops PR #84).
- Recuperación de acceso (reset existente; humo autorizado).
- Copias de seguridad cifradas PostgreSQL → Cloudflare R2, con prueba de restauración (**hechas**; `main` `21e5897` / `7f78c32`; local `develop` `78e3b1d`).
- Corrección de **R-JXP** (**cerrada** en `develop`, PR #78; revalidada PG17 local 2026-10-30; no en `main`; no desplegada).
- **GAM-03** (**cerrado técnicamente** en `develop` local `19c76a1`; 64 unitarias/frontend + 32 PG17; sin segunda economía; **no** `origin/develop`).
- **CHR-01** cerrado (ilustraciones estáticas integradas; preview CSS de Cuenta retirada según CHR-01A).
- **ONB-01** (tutorial con Somi; se puede omitir y retomar).
- **UX-PRE-BETA** aprobado por el propietario del producto.
- **FBK-01** operativo en `develop` (PR #77; no en `main`; no desplegado). Criterios originales cubiertos.
- Git del corte, migraciones Prisma vs producción, backups y restore, configuración de registro (invite hasta autorización).
- Validación final de producto (recorrido DEMO + humo LIVE en entorno **autorizado**).

##### Autorización de apertura (decisión humana)

- Confirmación explícita para cambiar el registro de `invite` a público.
- Identificación visible de la aplicación como beta pública.
- Deploy de producción de los cortes acordados, **cuando se autorice**.
- Esta subfase no se ejecuta por el hecho de marcar ítems de preparación.

- **Dependencias:** FBK-01, R-JXP, UX-GLO-01, CLEAN-01, WEB-01 y GAM-03 (técnico) **cubiertos en git de `develop`**. **Espera** CHR-01, ONB-01 y UX-PRE-BETA. Siguen BETA-01D.3, publicación de avisos validados, consentimiento/privacidad ya implementados en local, corte Git desplegable, verificación de migraciones y backups, configuración de registro, pruebas en entorno autorizado y **autorización humana**. **No** espera FBK-02, GAME-07/08, MOB-01, MKT-01 ni animación avanzada de Somi. La D.3 **puede prepararse en paralelo**.
- **Criterio:** Una persona nueva puede crear cuenta sin invitación **solo después** de la autorización; entiende que está en beta; el diario/misiones/XP de usuarios existentes no se ponen en riesgo. Sin promesas clínicas.

#### FBK-02 — Community Feedback

- **Objetivo:** Superficie **pública moderada** de propuestas (futuro).
- **Prioridad:** P3 (después de WEB-01 / WEB-02 / SEO-01B)
- **Estado:** Futuro. **No** implementar durante REL-01 ni como parte de FBK-01.
- **Posibles funcionalidades (no son requisitos cerrados de esta fase):** propuestas públicas moderadas; votaciones; estados de desarrollo; seguimiento de propuestas.
- **Dependencias:** FBK-01, BETA-01, WEB-01. Moderación y privacidad **antes** de cualquier muro público. No adelantar a la consolidación UX.
- **Criterio:** Nada enviado en FBK-01 se vuelve público sin moderación y consentimiento explícitos. Sigue sin XP por feedback.

#### UX-GLO-01 — Experiencia global (consolidación funcional, visual y responsive)

Este es el hito de consolidación UX de Soma 2.0. **No** reabre ni sustituye **UX-01** (orientación anatómica).

- **Objetivo:** Revisar coherencia de Inicio, Recuperación, Explorar, Logros, Bitácora, Misiones, XP, Configuración y Feedback. Evitar navegación duplicada y pantallas innecesarias. Comprobar que la experiencia es **cómoda** en cada formato, no solo que «no desborda».
- **Prioridad:** P3 residual (regresiones; no reabrir el barrido). Ya no es la prioridad inmediata. La revisión previa a la beta es **UX-PRE-BETA**, no un segundo UX-GLO-01.
- **Estado:** Completado e integrado en `develop` (`db6385b`, squash PR #79). **No** en `main`. **No** desplegado. Incluye atlas 2.0 (NATURE-8), a11y de autenticación/onboarding/cuenta/bitácora, idioma del documento ES/EN, skip-link, dock móvil, calendario semántico de bitácora y corrección de `set-state-in-effect` en pestañas relacionadas. GLO-04 (XP en Cuenta) se cerró **sin cambios** por decisión de producto. LIVE autenticado, teclado real y lector de pantalla **no** se recorrieron de punta a punta. ESLint: cero errores nuevos pendientes respecto a la base.
- **Formatos a comprobar:**
  - Móvil vertical
  - Móvil horizontal
  - Tablet vertical
  - Tablet horizontal
  - Escritorio
- **Superficies a revisar:** navegación, formularios, botones, modales, estados de carga, errores, accesibilidad y coherencia de componentes.
- **Dependencias:** FBK-01 cerrado. SHELL-01 / GAME-DESIGN-01 (cinco huecos móviles). VIS-01 sigue siendo pulido de la figura de Inicio y **no** se mezcla. GAM-03 y ONB-01 **no** bloquean este barrido de lo ya existente.
- **Decisiones confirmadas:** No competición entre usuarios. No segundo sistema de navegación. No penalizar recaídas con pérdida de XP, niveles o medallas. Corregir bloqueos de uso (controles tapados, teclado, scroll) antes de la beta; el pulido no crítico puede quedar residual.
- **Pendiente de diseño:** Lista viva de incidencias por formato; qué ítems entran en el rail vs «Más» si GAME-07 añade Expedición.
- **Criterio:** Un usuario nuevo puede completar los recorridos principales en los cinco formatos sin controles inaccesibles ni sensación de interfaz «a medias». No hay dos galerías de logros ni dos diarios.

#### CLEAN-01 — Retirada de rutas y componentes heredados

- **Objetivo:** Inventariar y retirar rutas y componentes de Soma 1.0 que ya no deban ser accesibles, sin romper las funcionalidades vigentes de Soma 2.0.
- **Prioridad:** P1 (**antes** de abrir BETA-01)
- **Estado:** Completado e integrado en `develop` (`ca3b456`). **No** en `main`. **No** desplegado. LEG-01 (`/achievements` → `/app/achievements`) ya cubría una redirección puntual.
- **Alcance:**
  - Inventariar rutas y componentes antiguos.
  - Identificar dependencias reales (imports, deep links, SEO, tests).
  - Retirar lo obsoleto o redirigir de forma explícita.
  - Evitar que rutas antiguas queden accesibles innecesariamente.
- **Dependencias:** Superficies 2.0 estables (SHELL-01, Explorador, ACH-01, JRN-01, GAM-01/02, FBK-01). No espera MOB-01.
- **Criterio:** Un visitante o crawler no entra en una UI 1.0 paralela. Nada vigente de 2.0 deja de funcionar por la limpieza.

#### MOB-01 — Android / Google Play

- **Objetivo:** Distribuir Soma 2.0 en Android (Google Play) en un horizonte **futuro**.
- **Prioridad:** P3. **Sin fecha.**
- **Estado:** Documentado. **No** iniciar implementación. **No** es requisito de la beta pública. **No** desplaza FBK-01, UX-GLO-01, CLEAN-01, WEB-01 ni BETA-01.
- **Tecnología:** Capacitor queda como **alternativa preliminar**, no como decisión irreversible. Cualquier empaquetado se reevaluará cuando este ID se autorice.
- **Dependencias:** Beta pública usable (BETA-01). No bloquea ni es bloqueado por CHR-01 / ONB-01 salvo copy de tienda.
- **Criterio (cuando se autorice, no ahora):** un artefacto instalable coherente con las funciones reales; sin promesas clínicas ni APK paralelo no gobernado.

#### MKT-01 — Producto, identidad profesional y marketing

- **Objetivo:** Preparar la visibilidad de Soma y la identidad pública del proyecto **después** de abrir la beta (BETA-01). ONB-01 ya estará previsto **antes** de la beta; MKT-01 **no** espera el tutorial como requisito futuro distinto.
- **Prioridad:** P2 de producto (comunicación). **Inmediatamente después de BETA-01** en la secuencia. No desplaza CHR-01, ONB-01 ni UX-PRE-BETA.
- **Estado:** Pendiente. **No** crear cuentas ni publicaciones. **No** iniciar campañas. Primera fase, cuando se autorice: auditoría de la presencia actual y propuesta de estrategia. Este documento **no** autoriza publicaciones ni cambios automáticos de perfiles.
- **Secuencia vigente:** **CHR-01 → ONB-01 → UX-PRE-BETA → BETA-01 → MKT-01**.
- **Alcance previsto (evaluación y propuesta; no ejecución ahora):**
  1. Actualización del **perfil profesional personal de LinkedIn**.
  2. Presentación de Soma como **proyecto propio**.
  3. Evaluación de una **página de LinkedIn para Soma** (no crearla en este hito documental).
  4. Revisión de la presencia en **X**.
  5. Evaluación de **Ko-fi**.
  6. Evaluación de **Instagram**.
  7. Identidad pública y comunicación del proyecto.
  8. Estrategia inicial de contenidos y difusión.
  9. GitHub del proyecto y del perfil personal (README alineado con funciones **reales**).
- **Decisiones confirmadas:**
  - No prometer fechas de apertura no confirmadas.
  - No publicar afirmaciones médicas sin respaldo.
  - No iniciar publicaciones ni modificar perfiles de forma automática.
  - No crear cuentas en esta reorganización.
  - Priorizar recursos existentes y crecimiento orgánico.
  - Mantener una frecuencia de publicación sostenible.
- **Dependencias:** **BETA-01** (producto público o beta identificada). El copy debe alinearse con funciones **reales**. No espera MOB-01. CHR-01 y ONB-01 forman parte del corte de beta, no de un bloqueo posterior de MKT-01.
- **Criterio:** Hay un inventario de canales y una estrategia acordada. Nada publicado desde este hito afirma que Soma es un dispositivo médico, o que hay funciones que aún no existen.

---

## Calidad y lanzamiento

#### Q-CI — Integración continua

- **Descripción:** Automatizar tests (al menos web + API unit/http) en cada PR a `develop`/`main`.
- **Estado:** Parcialmente implementado. **No** cerrado. Workflows en `develop`: `.github/workflows/ci.yml` y `.github/workflows/database-backups.yml` (CI PR #84 `2152424`; backups también en `main`). **No** se da por cubierto el criterio en `main` de producto 2.0 completo. Residual: scripts raíz, cobertura, pg tests sin `DATABASE_URL`.
- **Prioridad:** P2 residual
- **Evidencia (2026-10-30):** existen `ci.yml` y `database-backups.yml`. Root `package.json` sin `test`/`lint` globales. Web `pnpm test`. API `tsx --test src/**/*.test.ts`. Pg tests se saltan sin `DATABASE_URL`.
- **Dependencias:** Ninguna de producto.
- **Criterio:** Un PR muestra checks verdes o fallo explícito de test; no se exige cobertura 100 %.

#### Q-E2E — Pruebas de navegador de recorridos críticos

- **Descripción:** Cubrir DEMO recovery/explore y, cuando se autorice un entorno, login→`/app` (sin datos reales de producción).
- **Estado:** Pendiente (no hay Playwright/Cypress de proyecto)
- **Prioridad:** P2
- **Evidencia:** Tests web mayoritariamente de contrato de fuente. AUTH-01/LIVE-01 son el humo manual previo.
- **Dependencias:** AUTH-01 (definir el recorrido). No instalar dependencias hasta autorización de implementación.
- **Criterio:** Al menos un flujo DEMO y un flujo auth de staging pasan en CI o script documentado.

#### Q-OBS — Errores y observabilidad

- **Descripción:** Gestión visible de errores de cliente y telemetría mínima de API (hoy `Logger` Nest + `GET /health`; no Sentry ni ErrorBoundary).
- **Estado:** Parcialmente implementado
- **Prioridad:** P2
- **Evidencia:** `health.controller.ts`; Recovery tiene UI `loadError`; no hay `@sentry` ni filtro global Nest.
- **Dependencias:** Decisión de herramienta. No es P0: no hay incidente evidenciado.
- **Criterio:** Fallos de API en LIVE no dejan pantalla en blanco sin mensaje; existe un canal acordado para errores 5xx (log o servicio).

#### Q-05 — Pruebas de `recovery-math`

- **Descripción:** `packages/shared-types/src/recovery-math.test.ts` existe y no está en un script `test` del paquete (`package.json` solo `build`/`clean`).
- **Estado:** Parcialmente implementado
- **Prioridad:** P2
- **Evidencia:** Archivo de test en disco; `packages/shared-types/package.json` sin `test`.
- **Dependencias:** Q-CI (para ejecutarlo siempre).
- **Criterio:** `pnpm --filter @soma/shared-types test` (o el glob raíz) ejecuta `recovery-math.test.ts` en local y en CI.

#### R-SHA — Trazabilidad del commit desplegado

- **Descripción:** Poder comprobar qué git SHA sirve `https://somarecovery.app` sin inferirlo solo por el copy visible.
- **Estado:** Requiere investigación
- **Prioridad:** P2
- **Evidencia:** HTML sin `32aac73`; GitHub Deployments no listó deploys Render. Last-Modified del bundle ≠ SHA.
- **Dependencias:** Acceso a Render o header/meta de build. Este roadmap no autoriza cambiar el deploy.
- **Criterio:** Un operador documenta el SHA de un deploy (panel Render, variable `RENDER_GIT_COMMIT`, o meta en el index) y coincide con `main` o se explica la diferencia.

#### Deuda ESLint conocida (sin ID de producto)

- **Estado:** Parcialmente implementado (deuda, no P0)
- **Prioridad:** P3
- **Evidencia (preexistente, no introducida por UX-04, UX-GLO-01 ni ONB-01):** en `@soma/web`, 47 errores y 11 avisos (recuento 2026-10-30). Los archivos tocados por ONB-01C quedan limpios. El único error nuevo de la rama UX-GLO-01 (`AnatomyExplorerPage` `set-state-in-effect`) se corrigió antes del squash PR #79. API sin ESLint.
- **Criterio:** No se exigen limpiezas hasta un hito de calidad autorizado. Los hitos nuevos no deben añadir errores en archivos tocados.

---

## Visual

#### VIS-01 — Figura de Inicio en tablet y escritorio

- **Descripción:** En ~768 px hay vacío lateral amplio; en ~1280 px se recortan ~58 px del borde derecho. Usable en 320/375/430 (UX-03 cerrado).
- **Estado:** Pendiente (pulido opcional)
- **Prioridad:** P3
- **Evidencia:** Auditoría UX-03 2026-10-25. `HeroFigure` `object-left` + `overflow-hidden`; `HomeStage` columnas desktop.
- **Dependencias:** **No reabre UX-03.**
- **Criterio:** Si se implementa: tablet sin banda vacía excesiva y escritorio sin recortar órganos relevantes, **sin** romper 320/375/430.

#### SHELL-01 — Shell autenticado responsive

- **Descripción:** Navegación Soma 2.0 en `/app` y `/preview`: sidebar de escritorio plegable, sin header horizontal en `lg+`, chrome (idioma, campana, cuenta) en el pie del rail; móvil con header compacto y barra inferior como única nav principal.
- **Estado:** Completado y validado (LIVE producción, 2026-10-26). PR #52 → `main` `0a91e34`. Incluye `9847690`.
- **Prioridad:** P2 residual (GAME-DESIGN-01 añade rutas **sobre** este shell; no lo sustituye)
- **Evidencia:** PR #52. `localStorage` `soma.shell.sidebarCollapsed`. Inset ~56 px con rail contraído. Bandejas con portal y anclaje al contenido.
- **Dependencias:** ACH-NOTIF-01 (campana). GAME-DESIGN-01 consultará este shell **antes** de añadir «Expedición».
- **Criterio (histórico, cubierto en código):** rail usable expandido/contraído; móvil sin drawer; bandejas dentro del viewport; Escape y clic exterior.

---

## Trabajo editorial (no publicar automáticamente)

| Carril | Estado | Prioridad | Nota |
| --- | --- | --- | --- |
| Síntomas de abstinencia | Bloqueado por revisión clínica | — | 40 candidatos `pending_clinical_review`; **publicado vacío**; sin UI. `ccef9a3`. Interfaz futura **solo** catálogo publicado |
| Consejos | Bloqueado por revisión clínica | — | `publishedAdviceCatalog = []`; 25 drafts no son UI |
| Evidencia NT | Bloqueado por revisión clínica | — | Catálogos publicados vacíos |
| Neurotransmisores (MVP UI) | Completado y validado DEMO (educativo) | — | 14 perfiles; fase **manual**; avisos alcohol GABA/glutamato fuera de `<details>`. **No** medición individual ni fase por días de abstinencia |
| UX-08 ventanas | Pendiente | P2 | Sin rangos inventados |
| UX-09 narrativas | Pendiente | P2 | Cobertura incompleta; no rellenar |

UI de síntomas: cuando se autorice, leer **únicamente** el catálogo publicado (vacío hasta revisión). **No** mostrar candidatos pendientes.

---

## Decisiones de producto pendientes

1. **Persistencia de logros desbloqueados** puede ser intencional (el hito ocurrió). Recaídas **no** revocan medallas (ACH-01). No asumir que «no revocar» es un defecto.
2. **Corregir una fecha errónea** y **recaer** no son el mismo evento; la política puede tratarlos distinto (ACH-REV residual).
3. **No** implementar revocación automática.
4. El catálogo de **156** logros (149 alcanzables) exige distinguir existencia, publicación, alcanzabilidad y desbloqueo (UX-10–12 + ACH-01 + ACH-REV).
5. Platinos: conjunto de logros vs umbral 0,99 (UX-11) — requiere diseño y autorización de catálogo.
6. Fichas de anatomía EN (I18N-03): entregadas en PR #68; residual de validación LIVE.
7. Destino de `/achievements` legacy (LEG-01): **redirige** a `/app/achievements` (ACH-01).
8. Soma Expeditions: Expedición propia (GAME-07) y capítulos (GAME-08) pendientes. XP (**GAM-01**), bitácora (**JRN-01**) y misiones educativas (**GAM-02**) están en `main` git (no se dan por desplegados). Atlas 2.0 (**UX-GLO-01**) en `develop`. GAM-03 cerrado técnicamente en local. **Secuencia hasta beta:** CHR-01 → ONB-01 → UX-PRE-BETA → BETA-01.
9. Naming de GAME-01: la tabla de este roadmap y los nombres frikis de los PNG son **propuestas históricas**, no catálogo a renombrar. Los 106 fisiológicos **no** se renombran.
10. Arte Horizonte / mapa / Somi: los PNG no otorgan licencia; hace falta arte propio o autorizado antes de producción (CHR-01).
11. **GAM-01 residual:** copy público de niveles; fuentes de XP adicionales (exploración). Fórmulas del ledger **cerradas** en `develop`.
12. **JRN-01 residual:** retención/exportación/borrado (detalle GDPR) y nota pública de privacidad.
13. **GAM-02 residual:** catálogo de bienestar y objetivos personales (el piloto educativo está en `develop`).
14. **CHR-01:** técnicamente completado en local (WebP, fuera de Cuenta); **pendiente de revisión final y commit**. Animación avanzada pospuesta. Somi solo en ONB-01.
15. **ONB-01:** cerrado en desarrollo local (A `aca59c6`, B `0132676`, C este commit). Pendiente LIVE autenticada y despliegue. **No** publicado.
16. **UX-PRE-BETA:** en curso. Primera tanda UX-01 a UX-10 completada localmente. **No** cerrado. **BETA-01** y **MKT-01** pendientes.

Este documento **no** autoriza seeds, commits ni despliegue. Las decisiones ya confirmadas de ACH-01, REC-VIS-01 y ROADMAP-02 están en sus hitos; el resto sigue abierto.

---

## Riesgos y bloqueos

| ID | Riesgo / bloqueo | Estado |
| --- | --- | --- |
| R-API | Explorar/sustancias depende del API. Mitigado en local. `/app` autenticado comprobado **en local** (AUTH-01/LIVE-01); no producción. No forzar `.env` ni seeds. | Mitigado en local |
| R-CLIN | Publicar síntomas o Consejos sin revisión clínica. | Bloqueado por revisión clínica |
| R-% | Confundir avance de curva con salud recuperada. | Mitigado en DEMO (UX-04); pendiente con usuarios LIVE |
| R-CAL | Reutilizar 1–7/8–56/57+ como calendario clínico. | Pendiente (guardrails; catálogo educativo vacío) |
| R-NT | SHA Render no verificado; NT no son medición. | Requiere investigación (R-SHA); producto educativo OK |
| R-DUP | Duplicar párrafos NT como lista de síntomas. | Mitigado en catálogo; falta UI de síntomas |
| R-I18N | DEMO/Logros en ES con UI EN. | Mitigado en Inicio, Recuperación, Logros 2.0 (PR #60), Explorar (PR #61) y atlas (PR #68). LEG-01 redirige |
| R-GAME | Rankings, rachas obligatorias o XP que castigue recaídas / inactividad. | Mitigado en código GAM-01 (`develop`); vigilar copy de landing en REL-01 |
| R-LOG | Bitácora (JRN-01) en `develop` sin nota de privacidad pública / retención detallada. | Residual de release; no bloquea el merge si el copy LIVE ya avisa que el diario es privado |
| R-JXP | Carrera en `UserProgression.upsert` (primer XP). Concurrent journal create devolvía HTTP 500 (GAM-02H). | **Cerrado en `develop`** (`a26585e`, PR #78). Revalidado 2026-10-30 en PostgreSQL 17 desechable: creates concurrentes 201+201, ambas entradas, un grant, `totalXp` coherente. Residual: promocionar el corte a `main` / producción. **No** es GAM-03 |
| R-NAV | Ocho destinos en mockups vs cinco huecos del bottom nav. | Mitigado en NAV-01 (Más; sin Expedición hasta GAME-07) |
| R-MIX | Mezclar % temporal con % de curva, o conocimiento con perseverancia. | Mitigado en copy UX-04 + GAME-02/07; vigilar implementación |
| R-ART | Sustituir visor anatómico o medallas reales por arte generado de mockup. | Prohibido; visor y catálogo 106 se conservan |

Ninguno de estos es P0 de incidente en producción evidenciado.

---

## Próximos pasos (por dependencia)

1. **AUTH-01 + LIVE-01:** humo **local** hecho (cuenta sintética). Pendiente producción o staging **autorizado**. No E2E automatizado.
2. **I18N-2.0 / ANAT-I18N-01:** fusionados en `develop` (PR #60, #68). LIVE autenticado: comprobar en navegador **antes del despliegue**.
3. **UX-12** (secretos/platinos) → **UX-11** (regla platino, con autorización de catálogo). UX-10 cubierto en ACH-01.
4. **ACH-REV residual:** recaída ya no revoca (ACH-01). Queda corrección de fecha errónea. Bloquea GAME-08.
5. **ACH-NOTIF-01, ACH-CELEB-01, SHELL-01:** completados y **validados en producción LIVE**.
6. **En `main` (git; deploy no verificado aquí):** GAME-01–03, NAV-01–02, I18N-2.0, Explorador 2.0, EXP-EDU, HOME-UI-01, REC-VIS-01, ACH-01, **JRN-01**, **GAM-01**, **GAM-02**.
7. **En `develop` y no en `main`:** SEO-01A (`cdf038c`, PR #75), FBK-01 (`f1b447f`, PR #77), R-JXP (`a26585e`, PR #78), UX-GLO-01 (`db6385b`, PR #79), CLEAN-01 (`ca3b456`), WEB-01 (`ff5a359`, PR #82), registro (`65866c2`, PR #83), CI (`2152424`, PR #84). Local sin push: backups `78e3b1d` … ONB-01 (A/B/C; ahead 12). **En `main` encima de REL-01:** backups R2 (`21e5897`) y PG17 (`7f78c32`).
8. **Secuencia de producto (ROADMAP-REORG-01):** **CHR-01A/B → ONB-01 → UX-PRE-BETA → BETA-01 → MKT-01**. GAM-03, CHR-01 y ONB-01 cerrados técnicamente en local. Siguiente: **UX-PRE-BETA**. **BETA-01D.3** jurídica puede **prepararse en paralelo**; no cierra ni abre la beta. **SEO-01B** pendiente; no reabre WEB-01. Residual: WEB-02, **FBK-02**, GAME-07/08, copy GAM-03, Q-CI residual. **MOB-01** pospuesto. **No** abrir registro público sin la autorización de BETA-01. **No** cambiar `LEGAL_NOTICE_STATUS` aquí.
9. **I18N-04:** el selector muestra una ayuda visual ES/GB junto al nombre del idioma (UX-PRE-BETA). No trata la bandera como único identificador. No añade idiomas.
10. **UX-08 / UX-09:** editorial; no inventar.
11. **Q-CI, Q-05, Q-E2E, Q-OBS, R-SHA.** VIS-01, ESLint.
12. Revisión clínica de síntomas/consejos: hito humano **posterior**, no el paso 1 de lanzamiento.

---

## Hitos recientes (histórico)

### Neurotransmisores

| Campo | Valor |
| --- | --- |
| Estado | En `main` (PR #49, `2ca8004`). Observado en DEMO producción. SHA Render **no** verificado. **No** revisión clínica |
| Qué es | MVP educativo: 14 perfiles, selector de fase, avisos alcohol GABA/glutamato visibles |
| Commit | `0a49627`; merge `2ca8004` |
| No es | Medición neuroquímica ni fase calculada por abstinencia |

### Síntomas de abstinencia

| Campo | Valor |
| --- | --- |
| Estado | Bloqueado por revisión clínica |
| Qué es | 40 fichas candidatas ES/EN; avisos `alcohol.seizures`, `alcohol.medical_care` |
| Publicación | **Vacío.** No disponible para usuarios |
| Archivos | `ccef9a3`: `educational-withdrawal-symptoms.ts`, `.es.json`, `.en.json`, `.test.ts` |

### PRs de recuperación y anatomía

| PR | Tema | Estado |
| --- | --- | --- |
| #45 | Orientación + mensajes × 60 + sizing móvil | UX-01 Completado; UX-02 Completado y validado; UX-03 Completado y validado DEMO |
| #46 | Abstinencia como eje; % de curva | En `main`; criterio DEMO cerrado en #50 |
| #47 / #48 | Estados mixtos; gráfico móvil | En `main`; LIVE mixto intacto |
| #49 | NT + UX-05–07 | Merge `2ca8004`. Validado DEMO. SHA Render no verificado |
| #50 | UX-04 DEMO + docs | Merge `32aac73`. Validado DEMO 2026-10-25 |
| #51 | Inbox + celebraciones | Merge `5e38b98`. Completado y validado LIVE producción |
| #52 | Shell autenticado + pulido visual ACH | Merge `0a91e34`. Completado y validado LIVE producción |
| #61 | Explorador 2.0 | Fusionado en `develop`. No producción |
| #62–#67 | EXP-EDU fichas y enlaces atlas | Fusionado en `develop`. No producción |
| #68 | ANAT-I18N-01 fichas atlas EN | Fusionado en `develop`. No producción |
| #69 | REC-VIS-01 | Fusionado en `develop`. No producción |
| #70 | ACH-01 Logros 2.0 | Fusionado en `develop` (`c28b31e`). No producción |
| #71 | ROADMAP-02 docs | Fusionado en `develop`. No producción |
| #72 | JRN-01 Bitácora | Fusionado en `develop` (`9b5bb63`). No producción |
| — | GAM-01 XP | `751c6aa` en `develop`. No producción |
| #74 | GAM-02 Misiones | Squash en `develop` (`6d73877`). En `main` vía REL-01 |
| #75 | SEO-01A fundamentos | Squash en `develop` (`cdf038c`). **No** `main` |
| #76 | REL-01 develop→main | Squash en `main` (`8155554`). Deploy no verificado aquí |
| #77 | FBK-01 centro de feedback | Squash en `develop` (`f1b447f`). **No** `main`. **No** desplegado |
| #78 | R-JXP carrera XP | Squash en `develop` (`a26585e`). **Cerrado** (PG17 2026-10-30). **No** `main`. **No** desplegado |
| #79 | UX-GLO-01 atlas 2.0 y a11y | Squash en `develop` (`db6385b`). **No** `main`. **No** desplegado |
| — | CLEAN-01 legado Soma 1.0 | `ca3b456` en `develop`. **No** `main`. **No** desplegado |
| #82 | WEB-01 landing Soma 2.0 | Squash en `develop` (`ff5a359`). **No** `main`. **No** desplegado |
| #83 | Registro y bases de privacidad | Squash en `develop` (`65866c2`). **No** `main`. Invite implementado, **no** habilitado en producción |
| #84 | CI / guía de operaciones | Squash en `develop` (`2152424`). **No** `main` |
| #85 | Backups cifrados R2 | En `main` (`21e5897`). Restore verificado. Local `develop` también tiene `78e3b1d` (sin push) |
| #86 | Pin `pg_dump` PostgreSQL 17 | En `main` (`7f78c32`) |
| — | BETA-01D.1 borradores legales ES/EN | Local `ed33f6b`. **No** publicados. `LEGAL_NOTICE_STATUS=draft` |
| — | BETA-01D.2 consentimiento y retirada | Local `ba65a7c`. Tests de aislamiento PG17 hechos. **No** `origin/develop`. **No** `main` |
| — | GAM-03 aislamiento de eventos | Local `19c76a1`. **Cerrado técnicamente.** **No** `origin/develop`. **No** `main` |
| — | SOMI-02 / SOMI-02B componente y WebP | Local `97ef60d`. CHR-01 **no** cerrado. Preview CSS en Cuenta. **No** `origin/develop`. **No** `main` |

---

## Plan de trabajo detallado

```
Síntomas / Consejos
  → catálogo publicado vacío
  → revisión clínica humana
  → ingestión al catálogo público (otro hito; no automática)
  → UI que solo lee lo publicado

AUTH-01 + LIVE-01 (local hecho; prod/staging pendiente)
  →  I18N-2.0 (PR #60) + ANAT-I18N-01 (PR #68)
  → UX-12  →  UX-11 (autorización de reglas)
  → ACH-REV residual (fecha errónea) antes de cualquier revocación
  → ACH-NOTIF-01 / ACH-CELEB-01 / SHELL-01 (main + validado LIVE producción)
  → I18N-04 (selector banderas; no implementar aún; no nuevos idiomas)

Soma Expeditions (dirección visual OK; parcialmente en main git; atlas 2.0 en develop)
  Fase A  GAME-01 y GAME-02 (en `main` git vía REL-01)
  Fase A2 NAV-01 y NAV-02 → GAME-03A / 03B / 03C → I18N-2.0 (en `main` git)
  Fase B  Explorador 2.0 (PR #61) → EXP-EDU (PR #62–#67) → REC-VIS-01 (PR #69) → ACH-01 (PR #70)
  Fase C  GAME-07 Expedición (mapa + nav Más) sobre SHELL-01 — **pendiente**
  Fase D  Atlas 2.0 — **en `develop`** vía UX-GLO-01 (PR #79). **No** `main`. **No** desplegado
  Fase E  JRN-01 (PR #72) → GAM-01 (`751c6aa`) → GAM-02 (PR #74) — en `main` git
  Fase E2 REL-01 squash `main` (`8155554`, PR #76)
          SEO-01A (`cdf038c`, PR #75) permanece en `develop`
          → deploy producción (invite; no beta pública) [cuando se autorice]
  Fase E3 FBK-01 cerrado (PR #77) → R-JXP cerrado (PR #78, PG17 20/20)
          → UX-GLO-01 completado (PR #79) → CLEAN-01 (`ca3b456`) → WEB-01 (PR #82)
          — **en `develop`; no desplegado**
          → BETA-01 preparación parcial (infra/backups, borradores, consentimiento)
            ≠ BETA-01D.3 jurídica, publicación de avisos, invite en producción
            ≠ BETA-01 autorización de apertura  [carril paralelo; no cierra el hito]
  Fase F  GAM-03 cerrado técnicamente (local `19c76a1`; mapa de eventos; 64 + 32 tests; sin 2.ª economía)
          → CHR-01 cerrado técnicamente (`79f8360`)
          → ONB-01 cerrado en desarrollo local (A `aca59c6`, B `0132676`, C este commit; pendiente LIVE autenticada; no publicado)
          → UX-PRE-BETA en curso (UX-01 a UX-10 local; hito general abierto; no cerrado)
          → BETA-01 (D.3, avisos, deploy, autorización)
          → MKT-01 (después de abrir)
  Fase G  WEB-02 residual → SEO-01B → FBK-02 comunidad
  MOB-01  Android / Play (pospuesto, sin fecha; Capacitor preliminar; no beta; no implementar)
  GAME-08 capítulos (tras ACH-REV residual)

UX-08, UX-09  →  editorial con fuentes; sin inventar

Q-CI / Q-05 / Q-E2E / Q-OBS / R-SHA
VIS-01 (no reabre UX-03)
```

---

## Protocolo de mantenimiento

1. Consultar este archivo **antes** de un hito nuevo.
2. Actualizar estados cuando cambie el alcance o se complete una tarea.
3. **No** borrar requisitos pendientes sin autorización del usuario.
4. **No** marcar Completado y validado sin superficie explícita (DEMO ≠ LIVE ≠ clínico ≠ publicado).
5. Anotar commits y PR relevantes.
6. Diferenciar: local / `develop` / `main` / desplegado / validado.
7. Mantener el roadmap alineado con `git status` y con lo que el usuario autorice.
8. La revisión clínica **no** se marca Completado porque pasen tests.
9. Este documento **no** autoriza commit, push, PR, merge, seeds, migraciones ni despliegue.
10. Conservar `UX-01`–`UX-12`; los IDs nuevos (AUTH, LIVE, I18N-01–04, ACH-REV, ACH-NOTIF-01, ACH-CELEB-01, ACH-01, REC-VIS-01, SHELL-01, GAME-DESIGN-01, GAME-01–08, EXP-EDU-01, JRN-01, GAM-01–03, CHR-01, CHR-01A, CHR-01B, ONB-01, WEB-01–02, SEO-01, REL-01, FBK-01–02, BETA-01, UX-GLO-01, UX-PRE-BETA, CLEAN-01, MOB-01, MKT-01, Q-*, VIS, LEG, R-SHA, R-JXP) no los sustituyen. `GAM-*` ≠ `GAME-*`. `UX-GLO-01` ≠ `UX-01` ≠ `UX-PRE-BETA`. La consolidación responsive **no** reutiliza el ID UX-01.
11. **Regla de avance:** un hito bloqueado por dependencia externa no impide trabajos posteriores técnicamente independientes. El hito bloqueado **no** se marca cerrado.
12. **Cierre de hito:** criterios validados, aprobación, actualización de este archivo, pruebas/referencias, y commit solo autorizado. Un cierre técnico sin fila en el roadmap no cuenta.

---

## Historial breve de decisiones

| Cuándo | Decisión |
| --- | --- |
| PR #45 | Corregir orientación del cuerpo; 60 mensajes diarios ES/EN. |
| PR #46–#48 | Copy y gráfico de recuperación: el % es avance de curva, no salud; estados mixtos en el adaptador, no en el motor. |
| Atlas educativo | No mostrar 1–7/8–56/57+ como evidencia por sustancia; ventanas autoradas vacías hasta cita. |
| Consejos / evidencia NT | Carriles publicados vacíos; borradores no son UI. |
| Neurotransmisores | Reutilizar 14 perfiles; fase manual; advertencias de alcohol no solo en `<details>`. `0a49627`. |
| Síntomas | Catálogo por sustancia (no por NT); 40 candidatos; publicado vacío; sin UI. |
| 2026-10-25 | Se crea este `ROADMAP.md` para no perder requisitos entre sesiones. |
| 2026-10-25 | Validación local `/preview` (API + Postgres): UX-05–07 y MVP NT. No clínico. |
| 2026-10-25 | PR #49 fusionado (`2ca8004`). DEMO funcional en somarecovery.app; SHA Render no verificado. |
| 2026-10-25 | UX-03 cerrado DEMO 320/375/430. VIS-01 opcional. |
| 2026-10-25 | PR #50 fusionado (`32aac73`). UX-04 validado DEMO. LIVE `/app` no retestado. |
| 2026-10-25 | Auditoría integral: se consolidan AUTH/LIVE/I18N/calidad/ACH-REV sin alterar UX-01–12. |
| 2026-10-25 | ACH-NOTIF-01 y ACH-CELEB-01 añadidos como P1 documentados. No se implementan. Distintos de UX-10–12, `TrophyToastStack` y ACH-REV. |
| 2026-10-25 | AUTH-01 y LIVE-01: validación funcional **local** (cuenta sintética). No E2E. No producción. I18N-04 documentado (P2; no implementar). |
| 2026-10-26 | PR #51 fusionada (`5e38b98`): inbox y celebraciones implementados. |
| 2026-10-26 | PR #52 fusionada (`0a91e34`): SHELL-01 + pulido visual ACH (`9847690`). |
| 2026-10-26 | ACH-NOTIF-01, ACH-CELEB-01 y SHELL-01: **validados en producción LIVE** (confirmación de producto). |
| 2026-10-26 | Soma Expeditions: dirección visual de `docs/design/*-2.0.png` aprobada. Mockups ≠ datos ni nav. Falta `misiones-2.0.png`. GAME-* no implementados. |
| 2026-10-26 | GAME-01: implementación local + validación (pg local, unitarios). Copy provisional. Sin commit/PR/deploy. Celebración masiva agrupada queda como residual de ACH-CELEB-01. |
| 2026-10-26 | GAME-01 copy: títulos ES canónicos (`guardián`); 2 descripciones ES sustituidas; 50 títulos/descripciones EN; Logros DEMO 156 + brújula comprobados en navegador. Sin commit/PR/deploy. |
| 2026-10-26 | GAME-01 fusionado en `develop` (`d0cafd8`, PR #53). Sin producción. |
| 2026-10-26 | GAME-02 implementación local: próximo hito temporal, progreso absoluto, cuenta atrás 30 s, Inicio + Mi recuperación. Sin commit/PR/deploy. **Decisión:** navegación 2.0 después de GAME-02 y antes de GAME-03. |
| 2026-10-26 | GAME-02: validación final + PR hacia `develop`. Pendiente de integración. No fusionado. No desplegado. |
| 2026-10-26 | GAME-02 fusionado en `develop` (`8eb4a3e`, PR #54). Sin producción. |
| 2026-10-26 | NAV-01: estructura de menús (Más móvil, rail de 5 secciones reales). Implementado, pendiente de integración en `develop`. No fusionado. No desplegado. NAV-02 siguiente. GAME-03 después de NAV-02. |
| 2026-10-26 | NAV-01 fusionado en `develop` (`f107bc8`, PR #55). Sin producción. |
| 2026-10-27 | NAV-02 fusionado en `develop` (`d0c4c78`, PR #56). Sin producción. |
| 2026-10-27 | GAME-03A Inicio 2.0: implementación local (tablero de expedición, medalla temporal GAME-02, descubrimiento fisiológico compacto, hasta 4 desbloqueos LIVE). Sin commit/PR/deploy. GAME-03B y GAME-03C siguientes. |
| 2026-10-27 | GAME-03A: validación final + PR hacia `develop`. Pendiente de integración. No fusionado. No desplegado. |
| 2026-10-27 | GAME-03A fusionado en `develop` (`6658e6b`, PR #57). Sin producción. |
| 2026-10-27 | GAME-03B Mi recuperación 2.0: implementación local (cabecera `nature-2.png`, tarjetas, panel, rail de 10 umbrales, curvas y sistemas). Sin commit/PR/deploy. GAME-03C siguiente. |
| 2026-10-27 | GAME-03B: validación final + PR hacia `develop`. Pendiente de integración. No fusionado. No desplegado. |
| 2026-10-27 | GAME-03B fusionado en `develop` (`2d897bd`, PR #58). Sin producción. |
| 2026-10-27 | GAME-03C Logros 2.0: implementación local (cabecera `nature-3.png`, resumen 156, filtros, destacados, galería temporal/fisiológica). Sin commit/PR/deploy. |
| 2026-10-27 | GAME-03C: validación final + PR hacia `develop`. Pendiente de integración. No fusionado. No desplegado. |
| 2026-10-27 | GAME-03C fusionado en `develop` (`ac595c2`, PR #59). Sin producción. |
| 2026-10-27 | I18N-2.0 fusionado en `develop` (`5a451bd`, PR #60). Atlas y `/achievements` legacy fuera de alcance. LIVE autenticado: falta comprobación de navegador antes del despliegue. |
| 2026-10-27 | Explorador 2.0: implementado y validado; pendiente de integración en `develop`. Cabecera `nature-4.png`, búsqueda ES/EN, filtros, 5 sustancias, 12 sistemas con ilustraciones, 9 NT educativos, selector de fase, procesos y misiones en preparación. EXP-EDU-01, GAME-05 y GAME-06 no implementados. Atlas 2.0, UX-08 y UX-09 siguen pendientes. |
| 2026-10-28 | Explorador 2.0 fusionado (`559df95`, PR #61). EXP-EDU-01c–04 fusionados (PR #62–#67). HOME-UI-01 (PR #66). ANAT-I18N-01 (PR #68). |
| 2026-10-28 | REC-VIS-01 fusionado en `develop` (`f346709`, PR #69). Curvas educativas y NT cualitativos; no medición individual. |
| 2026-10-28 | ACH-01 fusionado en `develop` (`c28b31e`, PR #70). Galería 2.0; 156 IDs; 149 alcanzables; 7 no disponibles; historial permanente; recaídas no revocan; `/achievements` → `/app/achievements`. |
| 2026-10-28 | ROADMAP-02: se documentan JRN-01, GAM-01, GAM-02, GAM-03, CHR-01, ONB-01, WEB-01, WEB-02, UX-GLO-01 como **planificados**. GAME-04/05/06 no se borran: apuntan a JRN-01 / GAM-02 / GAM-01. Sin implementación. |
| 2026-10-28 | JRN-01 fusionado en `develop` (PR #72). GAM-01 (`751c6aa`) en `develop`. Sin producción. |
| 2026-10-29 | GAM-02 fusionado en `develop` (PR #74, `6d73877`). REL-01 documentado. SEO-01A/B, FBK-01, BETA-01 y FBK-02 añadidos. R-JXP: incidencia antes de BETA-01. Sin PR a `main`, sin deploy, sin registros públicos, sin migraciones de producción. |
| 2026-10-29 | SEO-01A squash `develop` (`cdf038c`, PR #75). REL-01 squash `main` (`8155554`, PR #76). FBK-01 en `feature/fbk-01`. Prioridad inmediata: cerrar FBK-01. Objetivo: beta pública cuando haya estabilidad, seguridad, coherencia visual y usabilidad. BETA-01 se parte en preparación vs autorización. UX-GLO-01 absorbe la consolidación responsive (no se duplica UX-01). WEB-01 y CLEAN-01 pasan a prerrequisitos de apertura. WEB-01 incluye identidad visual (favicon, iconos web/PWA, Apple Touch Icon, Open Graph) **sin implementar ahora**. MOB-01 Android/Play **pospuesto**, sin fecha. Secuencia post-beta: GAM-03 → CHR-01 (Somi) → ONB-01 (tutorial completo) → MKT-01 (X, Ko-fi, LinkedIn, README de repo y perfil). MKT-01 **no** bloquea BETA-01; sin campañas ni publicaciones todavía. |
| 2026-10-29 | ROADMAP-SYNC-01: FBK-01 (`f1b447f`, PR #77), R-JXP (`a26585e`, PR #78) y UX-GLO-01 (`db6385b`, PR #79) integrados en `origin/develop`. **No** en `main`. **No** desplegados. Prioridad inmediata: CLEAN-01. Antes de beta: CLEAN-01 → WEB-01 (+ SEO-01B) → BETA-01 preparación → BETA-01 autorización. Después de abrir: GAM-03 → CHR-01 → ONB-01 → MKT-01. |
| 2026-10-30 | Cierre FBK-01: criterios originales cubiertos (formulario, validación, API JWT, PostgreSQL, usuario, errores, ES/EN, throttle/duplicados, aviso tras retirada). Tests API 20 y web 24 en verde. Sin UI admin (fuera de alcance). BETA-01 **no** cerrado: backups y restore hechos; legales en `draft`; consentimiento local; D.3 jurídica pendiente; invite no en producción; apertura pendiente. CLEAN-01 y WEB-01 hechos en `develop`. Prioridad inmediata: BETA-01D.3. WEB-02, FBK-02, GAME-07/08 y MOB-01 siguen pospuestos. Sin commit de este sync. |
| 2026-10-30 | Cierre R-JXP: carrera de `UserProgression` resuelta en `develop` (`a26585e`, PR #78) con `INSERT ON CONFLICT DO NOTHING` y `FOR UPDATE`. Revalidación PG17 local desechable: 20/20 (`r-jxp.concurrency`, `journal.progress`, `progress.pg.http`). Concurrent creates 201+201; ambas entradas; ledger sin duplicar; `totalXp` coherente. **No** `main`. **No** desplegado. **GAM-03** permanece pendiente e independiente. Prioridad inmediata sigue siendo BETA-01D.3. |
| 2026-10-30 | Consolidación de roadmap: FBK-01 y R-JXP **cerrados**; UX-GLO-01 / CLEAN-01 / WEB-01 **completados** en `develop` (PR #79, `ca3b456`, PR #82). Ninguno se da por desplegado. BETA-01 **parcial**, abierto; BETA-01D.3 jurídica pendiente; sin apertura pública. Regla de avance: dependencia externa no cierra el hito ni bloquea trabajo independiente. Siguiente desarrollo funcional: **GAM-03** (sin implementar aquí) → CHR-01 → ONB-01 → MKT-01. Protocolo de cierre permanente añadido. |
| 2026-10-30 | GAM-03 implementación (sin cierre): mapa de eventos en `@soma/shared-types` (no Prisma). Bitácora 12 XP/día y misión 12 XP son fuentes distintas; medallas sin XP; recaída no revoca; retirada realinea ledger. Tests unitarios + PG17 local 32/32. Copy educativa vs participación **no** inventada. Hito **abierto** hasta autorización. |
| 2026-10-30 | Cierre técnico GAM-03: el copy educativa vs participación era **pendiente de diseño**, no criterio de aceptación. Economía sin duplicar (64 unitarias/frontend + 32 PG17). Sin segunda economía, sin migraciones, sin cambio de fórmulas ni medallas. Residual UX sin ID nuevo. BETA-01 sigue abierto; BETA-01D.3 pendiente. Siguiente funcional: **CHR-01**, luego **ONB-01**. |
| 2026-10-30 | SOMI-02 / SOMI-02B: componente animado CSS + WebP 512 px. Commit local `97ef60d`. Preview en `/preview/account` y `/app/account`. Landing sin Somi. CHR-01 **no** cerrado. Sin push. |
| 2026-10-30 | **ROADMAP-REORG-01:** secuencia **CHR-01A/B → ONB-01 → UX-PRE-BETA → BETA-01 → MKT-01**. Somi pasa a ilustraciones estáticas; animación avanzada pospuesta. Tutorial y revisión del propietario **antes** de abrir. MKT-01 **después** de BETA-01 (LinkedIn, X, Ko-fi, Instagram evaluación). BETA-01 **no** cerrado; `LEGAL_NOTICE_STATUS=draft`. HEAD local `97ef60d` (ahead 7). Q-CI: workflows `ci.yml` y `database-backups.yml` existen. Sin commit de esta reorganización. Sin implementar CHR-01A. |
| 2026-10-30 | CHR-01A/B técnico local: seis PNG estáticos; CSS de movimiento retirado; Cuenta `idle`. **No** cierre de CHR-01 (aprobación visual pendiente). `somi-idle.png` copiado del maestro. Sin commit de esta implementación. |
| 2026-10-30 | CHR-01 ajuste final: propietario aprueba ilustraciones y decide **Somi solo en ONB-01**. Preview de Cuenta retirada. Seis WebP ≤512 px con alfa; PNG sin alterar. **Técnicamente completado; pendiente de revisión final y commit.** Sin push. **No** desplegado. |
| 2026-10-30 | CHR-01 commit local `79f8360`. ONB-01A motor contextual commit `aca59c6`. ONB-01 **abierto**. **No** desplegado. |
| 2026-10-30 | ONB-01B commit local `0132676`. Composición visual aprobada. |
| 2026-10-30 | ONB-01C a11y/robustez local: `inert`, guardia de clics, foco, Escape. ONB-01 **abierto**, pendiente de revisión final y commit. Sin commit. **No** desplegado. |
| 2026-10-30 | ONB-01C commit local (este cierre): lock ordenado (foco → `inert`/`aria-hidden`; unlock → foco), tests 870, a11y puntual en DEMO. ONB-01 **cerrado en desarrollo local**. Pendiente LIVE autenticada y despliegue. **No** publicado. Sin push. |
| 2026-10-30 | UX-PRE-BETA **en curso**: primera tanda de correcciones (landing, idiomas, Misiones, atlas linfático, medallas ocultas) en local. Pendiente de revisión del propietario. **No** cerrado. Sin commit. **No** desplegado. |
| 2026-10-31 | UX-PRE-BETA ajustes visuales (sombra de encabezados, medallas ocultas centradas, banderas circulares, opacidad de tarjetas, a11y «Oculto»). **En curso.** Sin commit. **No** desplegado. |
| 2026-10-31 | UX-PRE-BETA: primera tanda **UX-01 a UX-10** completada localmente; copy público del encabezado de Logros. El hito general **sigue abierto**. **BETA-01** y **MKT-01** pendientes. Sin commit. **No** desplegado. |
