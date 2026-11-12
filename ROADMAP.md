# Roadmap Soma 2.0

Documento de planificación permanente. Se consulta **antes** de abrir un hito nuevo.  
**No otorga permiso** para commit, push, PR, merge ni despliegue.

Última actualización editorial: 2026-11-12 (**SEO-01B** y **MKT-01C** cerrados; **AUTH-01** / **LIVE-01** completados según confirmación del propietario; **WEB-01** y **WEB-01-FIX** integrados (PR #108, #109) y **desplegados en producción** según el propietario; **PWA-01D** **aplazado**; **MKT-PR-01D** en seguimiento; **UX-POLISH** A/B/C completado (PR #110) y **desplegado** según el propietario; **Q-05** y **Q-OBS** completados (PR #111) y **desplegados** según el propietario; **BETA-01D.3-FIX** completado y **desplegado** (PR #112); **BETA-01D.3** en revisión jurídica; **SUP-01A** completado y aprobado; **SUP-01B** completado y desplegado (PR #113); **SUP-01B.1** completado y publicado (PR #114); **SUP-01C** completado y publicado (PR #115); **SUP-ASSET-01** publicado (PR #116); **SUP-01D** completado y desplegado (PR #117, merge `e21be40`); **SUP-01E1-A** investigación aprobada; **SUP-01E1-B** implementación local pendiente de revisión). Git: `origin/main` = `e21be403a9703729f798d8baf458cd2cd879e1e1` (merge PR #117); `origin/develop` = `c06595e` (local puede ir alineado con `main`). **SPA Live:** el propietario confirma el despliegue de PR #112; el bundle público (`index-BzTb-IBq.js`) contiene los textos legales corregidos (lectura 2026-11-12); SHA de panel **no** recopiado (último inventario SPA: `c519bb3`, 2026-11-11). **API Live** documentada: `4520530` (PR #101, inventario 2026-11-10); SHA del deploy de API posterior a #105 **no** recopiado — **no** se afirma aquí. **GAME-07** / **GAME-07F** / **IMG-PERF-01A** (PR #106) e **IMG-PERF-01B** (PR #107) integrados y desplegados en SPA; QA **DEMO Chromium** (no Safari, no PWA iOS, no LIVE `/app`). **PWA-01D** aplazado (instalación iPhone comprobada; resto de pruebas iOS sin dispositivo; no bloquea la beta). **MOB-01** pospuesto. **JRN-01R** y **BETA-COPY-01** en `main` (PR #101); JRN-01R también en inventario API Live `4520530`. Bloqueador abierto: **BETA-01D.3**. Una auditoría sin P0 evidenciado **no** es prueba de seguridad completa.

Hay documentación científica y editorial en `docs/` (curvas, 9B Consejos). Eso **no** es este roadmap de producto.

---

## Objetivo y alcance

Soma 2.0 es un compañero **educativo** para explorar la recuperación fisiológica tras el consumo de sustancias: dashboard personal, atlas anatómico, catálogo de sustancias y logros. Está identificada como **beta pública** (`README.md`; somarecovery.app). **Soma Expeditions** está en `main` (`c519bb3`): shell, Inicio/Recuperación/Logros 2.0, hitos temporales, Bitácora, XP/niveles/títulos, **14** misiones educativas publicadas, atlas 2.0 (UX-GLO-01), landing (WEB-01), Somi (CHR-01), tutorial (ONB-01) y **Centro de Expedición (GAME-07)** (`/expedition`, GAME-07F, IMG-PERF-01A/01B). SPA Live sirve ese SHA (confirmación de panel, 2026-11-11). Safari iOS, PWA standalone y LIVE autenticado de Expedición **no** se dan por validados. El usuario es protagonista de una expedición personal; **no** es ranking, clínica ni obligación de uso diario. **Integrado en `main` no equivale por sí solo a SHA Render verificado** (hoy SPA Live sí coincide). DEMO `/preview` no equivale a LIVE `/app`.

No es un dispositivo médico. Las curvas son modelos ilustrativos (`curveProgress` / avance de curva), **no** un porcentaje de salud recuperada ni una medición clínica. No se miden neurotransmisores. Las estimaciones de recuperación **no** se presentan como mediciones fisiológicas individuales. Las fases educativas se eligen para comparar; no se calculan a partir de los días de abstinencia salvo que un hito futuro lo autorice con evidencia.

Alcance de contenido canónico actual: cinco sustancias (alcohol, nicotina, cannabis, cocaína, cafeína), 12 sistemas, 21 estructuras, 56 curvas, **156** identificadores de logros (106 de curva + 50 temporales); **149** medallas alcanzables y **7** sin regla válida (no disponibles). ES/EN para la interfaz Soma 2.0. Superficies `/preview` (DEMO) y `/app` (LIVE, sesión).

Los **doce requisitos originales** (`UX-01`–`UX-12`) se conservan íntegros (identificadores y criterios). El resto de este documento organiza compromisos recuperados, calidad y trabajo editorial **sin duplicarlos**. **UX-01** sigue siendo la orientación anatómica; la consolidación visual y responsive de Soma 2.0 es **UX-GLO-01**, no un segundo UX-01.

Fuera de alcance hasta autorización: síntomas de abstinencia **publicados**, consejos clínicos, migraciones/seeds, ventanas 1–7/8–56/57+ como evidencia por sustancia, revocación automática de logros.

---

## Prioridad inmediata (beta ya publicada)

La secuencia **CHR-01 → ONB-01 → UX-PRE-BETA → BETA-01** se usó para **abrir**. Ese corte está **integrado en `main`**. `LEGAL_NOTICE_STATUS=published` (`packages/shared-types/src/legal-notices.ts`). El README identifica **beta pública**. **No** se reabre esa secuencia. SHA Live: tabla **Publicación (Git ≠ Render)**. `AUTH_REGISTRATION_MODE` del host **no** verificado.

**BETA-01D.3** (validación jurídica: responsable, proveedores, transferencias) **en revisión** (comprobación puntual 2026-11-12; correcciones documentales C1–C3 desplegadas con PR #112); sigue sin cierre formal ni valoración jurídica especializada. No se inventa esa autorización aquí.

**Prioridad inmediata (no ampliar producto):** seguimiento de prensa (**MKT-PR-01D**); valoración jurídica especializada de **BETA-01D.3** (C1–C3 ya desplegados con PR #112); análisis opcional **UX-BOOT**. **SUP-01** (Centro de Apoyo y Herramientas): **SUP-01A** completado y aprobado; **SUP-01B** (página base) completado y desplegado (PR #113); **SUP-01B.1** (fidelidad visual) completado y publicado (PR #114); **SUP-01C** (respiración guiada) completado y publicado (PR #115); **SUP-ASSET-01** (ilustraciones) publicado (PR #116); **SUP-01D** completado y desplegado (PR #117); **SUP-01E1-A** investigación aprobada; **SUP-01E1-B** implementación local pendiente de revisión; SUP-01E2 y prevención de recaídas pendientes. **WEB-01** / **WEB-01-FIX** / **UX-POLISH** / **Q-05** / **Q-OBS** / **BETA-01D.3-FIX** integrados y desplegados (propietario). **PWA-01D** **aplazado**: no bloquea la beta. **AUTH-01** / **LIVE-01** completados (local y producción, según confirmación del propietario): **no** se repiten salvo regresión o cambio funcional relevante. Instalación PWA Android/iOS básica ya comprobada. No es empaquetado nativo (**MOB-01**, pospuesto). No es offline completo ni push.

Siguen visibles, y **no** se marcan cerrados: **BETA-01D.3** (en revisión); **PWA-01D** (aplazado); **MKT-PR-01D**; residual de Q-CI (ESLint con deuda previa; **no** el PG). **Q-E2E** pendiente (hito aparte). **R-SHA** cerrado como procedimiento (2026-11-10); inventario SPA recopiado 2026-11-11 (`c519bb3`); API Live post-#105 **sin** SHA de panel. **No** nuevas obligaciones diarias ni un segundo motor de XP. Gamificación extra, nativo y expansión editorial: **P3 / posterior**.

### Próximos hitos (orden)

| Orden | ID / trabajo | Notas |
| --- | --- | --- |
| 1 | **MKT-PR-01D** | Seguimiento de prensa (seis medios). El Referente: requisito editorial de sociedad/CIF; respuesta aclaratoria enviada. Sin cobertura confirmada. |
| 2 | **BETA-01D.3** | **En revisión.** Comprobación puntual hecha (2026-11-12). C1–C3 completados y desplegados (BETA-01D.3-FIX, PR #112); C4 aplazado. Identificación y domicilio del responsable, y demás puntos jurídicos, pendientes de asesoramiento profesional. |
| 3 | **UX-BOOT** | Análisis opcional de la espera inicial del backend (landing de anónimos tras `/auth/refresh` en *cold start*). Solo análisis; cambiar el arranque toca autenticación. |
| 4 | **WEB-02** | Solo si hay necesidades reales. |

**Q-05** y **Q-OBS** completados y desplegados (PR #111): ya no figuran en la lista. **SUP-01** no se inserta en la lista: **SUP-01A**–**SUP-01D** y **SUP-ASSET-01** están publicados (PR #113–#117); **SUP-01E1-B** está implementado en local (sin publicar); el orden de E1 publicación / E2 lo decide el propietario. **PWA-01D** **aplazado**: no figura en la lista; se retoma solo con acceso a dispositivo o ante una incidencia real. **BETA-01D.3** (jurídica: responsable, proveedores, transferencias) **en revisión**; los avisos en código **no** se marcan revisados por un jurista. **R-SHA recopy API:** procedimiento cerrado; falta SHA Live de API tras #105 (no inventar). **AUTH-01** / **LIVE-01** completados: no se proponen como validación pendiente.

**JRN-01R** (POST `/me/journal` idempotente) está **en `origin/main`** (PR #101) y en la **API Live** (`4520530`, panel Render 2026-11-10). Commits de producto `4967da2` + `996af6c`.

Después, según diseño: sostenibilidad XP **sin** Bitácora (catálogo de misiones finito: 14×12 XP), categorías GAM-02 bienestar/objetivos, WEB-02, resto de **MKT-01** (canales; **MKT-01C** medición básica ya cerrada). **FBK-02**, **GAME-08**, **MOB-01** e **I18N-04** no son el siguiente código. **SEO-01B** cerrado.

**Regla de avance:** un bloqueo externo (clínico, jurídico D.3) no impide trabajo técnico independiente. El hito bloqueado **no** se marca cerrado.

Hitos de apertura **ya en `main`** (`c519bb3`; SPA Live el mismo SHA; **no** implica QA LIVE de cada superficie):

| Orden | ID | Estado en git `c519bb3` |
| --- | --- | --- |
| 1 | FBK-01 | Completado. En `main` (vía trenes post-#77) |
| 2 | R-JXP | Cerrado. En `main` |
| 3 | UX-GLO-01 | Completado. En `main` |
| 4 | CLEAN-01 | Completado. En `main` |
| 5 | WEB-01 | Landing original completada en `main` (PR #82). **SEO-01B** completado (GSC / indexación). Actualización 2026-11-12 (funcionalidades actuales + Expedición): PR #108; **WEB-01-FIX** PR #109. Integrados y desplegados (propietario) |
| — | GAM-03 | Cerrado técnicamente. Mapa en `gamification-events.ts` en `main` |
| 6 | CHR-01 | Cerrado técnicamente. En `main`. Solo ONB-01; no en Cuenta |
| 7 | ONB-01 | Completado en git (A/B/C). En `main`. Recorrido LIVE autenticado de punta a punta: no reauditado aquí. Tour **sin** paso Expedición propio; UX-POLISH (PR #110) la menciona en el paso de navegación |
| 8 | UX-PRE-BETA | **Cerrado** como hito histórico de apertura (ROADMAP-SYNC-01). Residual en VIS-01, I18N-04, PWA-01D (AUTH-01/LIVE-01 completados) |
| 9 | BETA-01 | Apertura **de producto** ejecutada. Residual: D.3 jurídica; env de registro en el host |
| 10 | BETA-02A/B/C | Estabilización post-apertura. En `main` (PR #94, #95) |
| 11 | MKT-01 | **MKT-01C** (medición básica) **Completado**. Resto (canales, campañas, perfiles): pendiente. P3/posterior. Sin campañas automáticas |
| — | MKT-PR-01 | Comunicación a prensa: dos rondas enviadas (seis medios). **MKT-PR-01D** en curso (El Referente: requisito de sociedad/CIF; aclaración enviada). Sin cobertura confirmada |
| — | JRN-01R | En `main` (PR #101) y API Live `4520530` (inventario 2026-11-10) |
| — | BETA-COPY-01 | En `main` (PR #101, `4967da2`). Copy de registro alineada con beta pública. **No** es D.3 jurídica |
| — | GAME-07 | En `main` (PR #106) y SPA Live. QA DEMO Chromium. Safari/PWA/LIVE **no** validados |
| — | IMG-PERF-01B | En `main` (PR #107) y SPA Live. QA DEMO Chromium |

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

Validación **DEMO** (`/preview` en `https://somarecovery.app`) **no** equivale a validación **LIVE** (`/app` autenticado).

Cuatro capas (no se mezclan):

| Capa | Significado |
| --- | --- |
| Implementado | Hay código que cubre el criterio |
| Integrado | Está en `main` (hoy el mismo SHA que `develop`) |
| Desplegado | Lo sirve el host. SHA Live: **Publicación (Git ≠ Render)**. Un merge en `main` **no** es un despliegue |
| Validado en producción | Recorrido DEMO o LIVE confirmado por producto en somarecovery.app |

**Cierre de hito (permanente):** (1) validar criterios de aceptación; (2) aprobación explícita de cierre; (3) actualizar este archivo; (4) registrar pruebas y referencias; (5) commit **solo** cuando se autorice. No dejar un cierre técnico sin reflejo en el roadmap.

---

## Estado general

| Superficie | Estado |
| --- | --- |
| Producto Soma 2.0 en `develop` / `main` | Git: `origin/develop` = `origin/main` = `c519bb3043734179e2a5f1ba9c0d30b0aa496eaf` (merge PR #107, 2026-11-11). Beta pública. Avisos `published` en código (**no** revisión jurídica D.3). SPA Live: mismo SHA (panel, propietario). API Live: inventario `4520530` (2026-11-10); post-#105 **sin** SHA de panel. `AUTH_REGISTRATION_MODE` del host no verificado |
| UX-01 orientación corporal | Completado (PR #45). Orientación exacta en prod no reauditada el 2026-10-25 |
| UX-02 mensajes diarios × 60 | Completado y validado (tests) |
| UX-03 figura móvil | Completado y validado DEMO 320/375/430 |
| UX-04 recuperación DEMO | Completado y validado DEMO (PR #50). LIVE `/app` no retestado |
| UX-05–07 Explorar | Completados y validados DEMO (PR #49). LIVE no reauditado aquí. Explorador 2.0 en `main` (PR #61, REL-01) |
| UX-08–09 atlas editorial | Pendiente (contenido / evidencia) |
| UX-10 logros en revisión | Cubierto en ACH-01 (7 no disponibles). UX-11/12 siguen abiertos |
| UX-11 platino | Pendiente (umbral 0,99 insuficiente) |
| UX-12 secretos y platinos | Parcialmente implementado |
| Neurotransmisores educativos | Publicados como MVP educativo (PR #49). REC-VIS-01 añade panel cualitativo en Recuperación. No son mediciones. Ilustraciones NT siguen en PNG (fuera de IMG-PERF-01B). LIVE `/app` no reauditado aquí |
| Síntomas / Consejos | Bloqueado por revisión clínica; catálogos **publicados vacíos** |
| LIVE `/app` | **AUTH-01** y **LIVE-01** completados: validación funcional en local (2026-10-25, cuenta sintética) y en producción (confirmación del propietario; sin fecha ni detalle registrados aquí). Pendientes como validaciones específicas nuevas, no como LIVE-01: recaídas, múltiples pestañas, Expedición LIVE en Safari/PWA |
| ACH-NOTIF-01 campana | Completado y validado (LIVE producción). PR #51 + pulido #52 |
| ACH-CELEB-01 celebraciones | Completado y validado (LIVE producción). PR #51 + pulido #52 |
| SHELL-01 shell autenticado | Completado y validado (LIVE producción). PR #52 |
| Soma Expeditions (GAME-*) | GAME-01–03, NAV-01–02, Explorador, EXP-EDU, GAM-01/02, GAME-07 en `main` `c519bb3` y SPA Live. QA DEMO Chromium de Expedición e IMG-PERF-01B. LIVE `/app` y Safari **no** validados aquí |
| I18N-2.0 dashboards ES/EN | En `main` git (PR #60, REL-01). Atlas: ANAT-I18N-01 (PR #68). LIVE autenticado: falta comprobación de navegador antes del despliegue |
| Explorador 2.0 | En `main` git (`559df95`, PR #61, REL-01). Cabecera, búsqueda ES/EN, filtros, 5 sustancias, 12 sistemas, 9 NT educativos |
| EXP-EDU fichas educativas | En `main` (PR #62–#67, REL-01). GAME-05 educativa cubierta por **GAM-02** (14 publicadas, PR #96) |
| REC-VIS-01 visualización de recuperación | En `main` git (`f346709`, PR #69, REL-01). Curvas educativas + NT cualitativos. **No** medición fisiológica individual |
| ACH-01 sistema de logros y medallas | En `main` git (`c28b31e`, PR #70, REL-01). Galería 2.0; 156 IDs; 149 alcanzables; 7 no disponibles; recaídas no revocan |
| HOME-UI-01 layout | En `main` git (PR #66, REL-01). No reabre UX-03 |
| JRN-01 Bitácora | En `main` (PR #72 + BETA-02C). **JRN-01R** en `main` y API Live `4520530` (PR #101). Recorrido Bitácora LIVE en producción **no** reauditado aquí |
| GAM-01 XP, niveles, títulos | En `main`. Ledger `XpGrant`. Medallas no conceden XP. Sin Bitácora el techo de misiones es 14×12 XP |
| GAM-02 / GAME-05 Misiones | En `main`. **14** `reading_check` publicadas (PR #96) + 1 draft. Bienestar/objetivos personales pendientes |
| GAM-03 integración | Cerrado técnicamente. En `main`. Sin segunda economía. Copy educativa vs participación: residual UX |
| CHR-01 Somi | Cerrado técnicamente. En `main`. Seis WebP; no en Cuenta; solo ONB-01 |
| ONB-01 tutorial | Completado en git (A/B/C). En `main`. Distinto de AUTH-01. Nueve pasos; **sin** Expedición |
| UX-PRE-BETA revisión | **Cerrado** (histórico de apertura, ROADMAP-SYNC-01). No reabre UX-GLO-01. Residual: VIS-01, I18N-04, PWA-01D |
| WEB-02 identidad y filosofía | Pendiente |
| UX-GLO-01 consolidación UX | Completado. En `main` (`db6385b`, PR #79). Distinto de UX-01 |
| CLEAN-01 legado Soma 1.0 | Completado. En `main` |
| WEB-01 landing Soma 2.0 | Landing original en `main`. Actualización 2026-11-12 (funcionalidades actuales + Centro de Expedición, PR #108) y **WEB-01-FIX** (PR #109): integrados en `main` y **desplegados en producción** (propietario; SHA de panel no recopiado). WEB-02 pendiente. **SEO-01B** completado |
| UX-POLISH | **Completado** (A pantalla de carga, B Expedición desde Inicio, C mención en ONB-01). PR #110 (merge `cf17b47`) y **desplegado** (propietario) |
| SEO-01 visibilidad | SEO-01A en `main` (PR #75 / #93). **SEO-01B** Completado (2026-11-12): GSC, canonical, `robots.txt`/`sitemap.xml`, landing indexada, `noindex` en rutas funcionales |
| FAV-01 favicon | Completado. En `main` (PR #92). Favicon + Apple Touch 180. **Manifest e iconos 192/512:** PWA-01B (desplegados). **Sin** service worker (PWA-01A) |
| REL-01 release git | Completado (`8155554`, PR #76). Superado por merges posteriores hasta `c519bb3` |
| FBK-01 centro de feedback | Completado. En `main` |
| R-JXP carrera XP | Cerrado. En `main` (`a26585e`, PR #78). No reabre GAM-03 |
| BETA-01 beta pública | Apertura de producto ejecutada. Código `LEGAL_NOTICE_STATUS=published`. Residual: **D.3 jurídica** (abierta). R-SHA: procedimiento cerrado; recopia API pendiente |
| BETA-02A/B/C | Completado en git. En `main` (PR #94, #95) |
| UX-REC-01 tarjetas Inicio | Completado. En `main` (PR #97, `4ca43af`) |
| I18N-JOURNAL-01 sustancias Bitácora | Completado. En `main` (PR #98, `e04e3aa`). Preview vacío ≠ LIVE |
| GAME-07 Centro de Expedición | Integrado (PR #106, `8ee1ee8` en `main` vía `f27cc2e`) y **SPA Live** `c519bb3`. QA DEMO Chromium. Incluye GAME-07F e IMG-PERF-01A. Safari / PWA / LIVE **no** validados |
| IMG-PERF-01A cabeceras naturaleza | Integrado con GAME-07 (PR #106). WebP de plates de paisaje. Desplegado SPA Live |
| IMG-PERF-01B ilustraciones educativas | Integrado (PR #107, `d24f032`) y **SPA Live**. QA DEMO Chromium: `process-*-240.webp` y `educational-missions-960.webp`. Catálogo: **dependence**, no `withdrawal`. NT siguen PNG |
| FBK-02 feedback comunitario | Futuro. Después de WEB-01/WEB-02. No implementar en FBK-01 |
| PWA-01 instalación web | **Parcial.** A/B/C desplegados. Instalación básica Android/iOS validada (iOS: BrowserStack, no iPhone físico propio). **D** **aplazado**: resto de pruebas Safari/iOS sin dispositivo; no bloquea la beta. Distinto de MOB-01 |
| MOB-01 Android / Google Play | Futuro, sin fecha. Capacitor es alternativa preliminar, no decisión. **No** requisito de beta. **No** es PWA-01. Publicación en tiendas **pospuesta.** |
| MKT-01 presencia digital | **MKT-01C** Completado (medición básica, 2026-11-12). Canales/campañas/perfiles: pendiente. Sin analítica de producto ni campañas automáticas |
| MKT-PR-01 prensa | Dos rondas enviadas: VIA Empresa, NacióDigital, El Referente; Genbeta, Salud a Diario, Xataka (seis medios). **MKT-PR-01D** en curso: El Referente pidió sociedad/CIF; se envió aclaración (persona física); pendiente de respuesta. Ni rechazo ni aceptación. Sin cobertura confirmada |
| I18N-04 selector banderas | Pendiente (documentado; no implementar aún; solo ES/EN) |
| SHA desplegado por Render | Procedimiento **R-SHA** cerrado. Inventario **2026-11-11:** SPA `c519bb3` (PR #107, propietario). Inventario API **2026-11-10:** `4520530` (PR #101). SHA API post-#105 **no** copiado. Fechas UTC **no** comunicadas |

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
| Inventario Live (comprobación **2026-11-10**) | Fuente: panel Render (propietario). Fechas UTC de esos deploys **no** comunicadas. Rama/autodeploy del servicio **no** comunicadas. GitHub Deployments **no** es la fuente. SPA entonces `4c67c2b`; API `4520530`. |
| SPA `https://somarecovery.app` (2026-11-10) | `4c67c2b26214f642821fa38ce590c1220d055fd1` (merge PR #103, iconos PWA y splash). Superado por el inventario 2026-11-11. |
| API `https://api.somarecovery.app` | `4520530b1242398103aead689fead05eb212f425` (merge PR #101, **BETA-COPY-01** + **JRN-01R**). Último SHA de API **copiado del panel**. Ancestro de `origin/main`. |
| `origin/main` en git (2026-11-10, tras #105) | `455cdf5439f12e2babac4bdda343050409e9a1c1` (merge PR #105). **No** se afirma como SHA Live de API. |
| PR #105 (git) | Q-CI PostgreSQL + deadlock UserProgression (`5eaa05c`). Actions: 329 API, 968 web, 115 PG; 0 fallos, 0 skips (propietario). |
| Inventario Live vs #105 | Propietario confirma **API desplegada** (2026-11-10). SHA Live de ese deploy **no** comunicado. **No** recopiar como `455cdf5` ni `5eaa05c`. |
| `origin/main` en la comprobación R-SHA (2026-11-10) | `d37a818` (merge PR #104) era `main` al cerrar R-SHA. Superado en git por `#105` y luego `#106`/`#107`. |
| PR #106 merge en `main` | `f27cc2e` — GAME-07, GAME-07F, IMG-PERF-01A. Producto `8ee1ee8`. |
| PR #107 merge en `main` | `c519bb3043734179e2a5f1ba9c0d30b0aa496eaf` — IMG-PERF-01B. Producto `d24f032`. |
| Fast-forward `develop` (2026-11-11) | `origin/develop` = `origin/main` = `c519bb3`. ROADMAP-SYNC-01. |
| PR #108 merge en `main` | `99c398557ab8033c2b42aca315cbca994123b5e9` — WEB-01 (funcionalidades actuales + Expedición). Producto `e3a55e1`. |
| PR #109 merge en `main` | `7c9fe07d08475d256cfe245a666832cdbde7efa9` — WEB-01-FIX (alturas y fondos). Producto `cadf893`. |
| SPA Live tras #109 | Desplegado según el propietario (2026-11-12). SHA de panel **no** recopiado: **no** se afirma `7c9fe07` como Live. |
| PR #110 merge en `main` | `cf17b47915a8246b2396948f82789526aa77b108` — UX-POLISH A/B/C. Producto `83556cf`. Check `Typecheck and unit tests` en verde sobre `83556cf` antes del merge (API pública de GitHub). |
| SPA Live tras #110 | Desplegado según el propietario (2026-11-12). SHA de panel **no** recopiado: **no** se afirma `cf17b47` como Live. |
| PR #111 merge en `main` | `35a9b112b04fc1180be1c192b319ed2bf90fcf13` — Q-05 + Q-OBS. Producto `36a7da4`. Check `Typecheck and unit tests` en verde sobre `36a7da4`, con el paso «Shared types tests» en verde (API pública de GitHub, 2026-11-12). |
| SPA Live tras #111 | Desplegado según el propietario (2026-11-12). El bundle público (`index-CNpJIZEq.js`) contiene los textos del fallback ES/EN. SHA de panel **no** recopiado: **no** se afirma `35a9b11` como Live. |
| PR #112 merge en `main` | `68ce47e0ad61d959d23d90bbddc3b1d5c35501fd` — BETA-01D.3-FIX (textos legales ES/EN). Producto `0349dda`. Check `Typecheck and unit tests` en verde sobre `0349dda` (API pública de GitHub). |
| SPA Live tras #112 | Desplegado según el propietario (2026-11-12). El bundle público (`index-BzTb-IBq.js`) contiene `soma.journal.createOp.{identificador de usuario}` y ya no la frase anterior de C1. SHA de panel **no** recopiado: **no** se afirma `68ce47e` como Live. |
| Inventario SPA Live (**2026-11-11**) | Propietario: Render Live SPA = `c519bb3`. QA DEMO Chromium GAME-07 + IMG-PERF-01B. **No** es QA LIVE `/app` ni Safari. |
| SPA vs `main` (2026-11-11) | Coinciden (`c519bb3`). |
| API vs `main` (2026-11-11) | Inventario API sigue `4520530` hasta recopia de panel. `main` adelanta con #105–#107. **No** afirmar SHA Live de API distinto de `4520530`. | |

Despliegues en Render han sido **manuales** cuando el usuario los autorizó. Un merge en `main` **no** equivale a un despliegue. Este documento no autoriza despliegues.

**Comprobar de nuevo (tras cada deploy autorizado):** (1) panel Render → Deploy **Live** de SPA y de API; (2) copiar SHA y fecha UTC si el panel la muestra; (3) contrastar con Git (`git merge-base --is-ancestor <sha> origin/main` o explicar la diferencia); (4) actualizar esta tabla; (5) no tratar el merge como despliegue.

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
- **Prioridad:** P3
- **Descripción:** Investigar e incorporar, **solo con respaldo suficiente**, estimaciones educativas de fase aguda, postaguda y normalización **por sustancia**. No usar 1–7/8–56/57+ como evidencia clínica.
- **Criterio:** Si se muestran días, salen de `educationalPhaseWindowCatalog` con fuente e incertidumbre; si no hay evidencia, no se inventa rango. `narrativePhaseWindows` no se presenta como calendario universal en el atlas.
- **Evidencia:** `educationalPhaseWindowCatalog` está **vacío** a propósito. El reloj global sigue en `narrative-catalog.ts` para seeds/tests, no como UI educativa del atlas.
- **Dependencias:** Trabajo editorial/bibliográfico. No seeds automáticos.

#### UX-09 — Efectos ausentes sustancia × órgano

- **Estado:** Pendiente (cobertura incompleta de narrativas)
- **Prioridad:** P3
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

Código existente (JWT en memoria, cookie de refresh, PUT `/me/profile`, onboarding skip/complete). **No** hay E2E de navegador. AUTH-01 y LIVE-01 completados en local y en producción (esta última según confirmación del propietario).

#### AUTH-01 — Validar registro, onboarding, sesión y `/app`

- **Descripción:** Recorrer de punta a punta: registro o login, restauración de sesión, onboarding (completar o omitir), acceso a `/app`, logout y estados de carga/error.
- **Estado:** **Completado.** Validación funcional en local (recorrido 2026-10-25, abajo) y en producción (confirmación del propietario; fecha y resultados detallados **no** registrados en este archivo). No se repite salvo regresión o cambio funcional relevante. Validaciones específicas nuevas (p. ej. E2E automatizado, Q-E2E) se abren con su propio ID.
- **Prioridad:** Cerrado (antes P1)
- **Evidencia:** `AuthContext`, `ProtectedRoute`, `auth.controller.ts`, tests `auth-session.test.ts`, `auth.refresh.http.test.ts`, `onboarding-actions.test.ts`. Sin tests de montaje de `AuthProvider`/`ProtectedRoute`/`OnboardingPage`. **Sin Playwright/Cypress** (esta validación no es cobertura E2E automatizada).
- **Recorrido local 2026-10-25** (PostgreSQL local, API `localhost:3000`, web `localhost:5173`, cuenta sintética nueva `soma.auth01.live01@example.test`; **no** producción): registro OK; creación de sesión OK; onboarding OK; persistencia de sesión tras recargar `/app` OK; acceso a `/app` OK; logout OK (landing `/`); nuevo login OK. No se usó ninguna cuenta existente.
- **Dependencias:** Q-E2E para automatizar después del humo manual. No usar cuenta de producción real salvo autorización explícita.
- **Criterio:** Un operador puede completar el flujo en un entorno autorizado y documentar pases/fallos por paso (login, refresh, onboarding, `/app`, logout) sin ambigüedad DEMO/LIVE.

#### LIVE-01 — Sustancias, fechas, persistencia y recálculo

- **Descripción:** Validar edición de sustancias y fechas (hoy en `/onboarding` vía PUT `/me/profile`, no en la página Cuenta), persistencia Prisma, y que recuperación LIVE se actualiza al refetch. Los logros **añaden** desbloqueos en `GET /me/achievements`; no revocan (ACH-REV).
- **Estado:** **Completado.** Validación funcional en local (casos del recorrido 2026-10-25, abajo) y en producción (confirmación del propietario; fecha y resultados detallados **no** registrados en este archivo). No se repite salvo regresión o cambio funcional relevante. Recaídas y múltiples pestañas no se documentaron como probadas: si se necesitan, son validaciones específicas nuevas.
- **Prioridad:** Cerrado (antes P1)
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
- **Estado:** Integrado en `main` (ANAT-I18N-01, PR #68, `774ec82`, vía REL-01). En SPA Live `c519bb3`; LIVE `/app` no reauditado aquí.
- **Prioridad:** P3 residual
- **Evidencia:** PR #68 localiza fichas educativas del atlas en inglés. No es revisión clínica de contenido nuevo.
- **Dependencias:** Editorial; no inventar fisiología.
- **Criterio:** Con UI EN, el cuerpo de las fichas educativas del atlas está en inglés.

#### I18N-04 — Selector visual de idiomas

- **Descripción:** Sustituir las etiquetas visibles ES/EN del selector actual por **banderas circulares**, manteniendo accesibilidad y facilidad de uso. Solo los idiomas de interfaz ya soportados (ES/EN). **No** añadir idiomas nuevos. Coherencia visual con la campana ACH-NOTIF-01 (ya implementada; no reabrirla aquí).
- **Estado:** Pendiente. UX-PRE-BETA usa banderas **circulares** junto al nombre y al código; **no** sustituye las etiquetas ES/EN del disparador.
- **Prioridad:** P3 (trasladado desde UX-PRE-BETA; no bloquea beta)
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

Línea de producto **implementada** en `main` (`c519bb3`) y servida por SPA Live (mismo SHA): GAME-01–03, NAV-01–02, Explorador 2.0, EXP-EDU, REC-VIS-01, ACH-01, JRN-01, GAM-01, GAM-02 (14 misiones), GAM-03, UX-GLO-01, CHR-01, ONB-01, **GAME-07** (mapa `/expedition`, GAME-07F, IMG-PERF-01A/01B). QA **DEMO Chromium** de Expedición e ilustraciones educativas. Safari, PWA standalone y LIVE `/app` **no** se dan por validados. Combina mecánicas de RPG científico con una aventura **personal** de recuperación. El usuario es el protagonista de su expedición. El progreso debe ser comprensible, motivador y **voluntario**. Sin racha diaria obligatoria ni penalización por descanso o recaída.

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
| `bitacora-2.0.png` | Bitácora 2.0 (dirección visual; JRN-01 en `main` y SPA Live; LIVE `/app` no reauditado aquí) |
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
- **Estado:** Dirección visual **aprobada**. NAV-01–02, GAME-03A–C, I18N-2.0, Explorador 2.0, REC-VIS-01, ACH-01 y **GAME-07** **en `main`** (`c519bb3`) y SPA Live. QA DEMO Chromium del mapa. Safari/PWA/LIVE **no** validados.
- **Prioridad:** P3 residual (no reabrir NAV-01/02; Expedición ya está en «Más»)
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
- **Estado:** Integrado en `main` (`d0cafd8`, PR #53, vía REL-01). Copy ES/EN cerrado. En SPA Live `c519bb3`; LIVE `/app` no reauditado aquí. GAME-02 lee esta familia.
- **Prioridad:** P3 residual (migraciones de producción: no reauditadas aquí; no seed wipe)
- **Nombres:** aprobados en `apps/api/prisma/seed/temporal-achievements.ts` (títulos canónicos).
- **Motor:** rama `temporal` en `planAchievementUnlocks` con `daysBetween` (24 h). Insert-only. Recaída/`active`: sin unlocks nuevos. ACH-REV intacto.
- **Celebración:** un lote live ≥ 8 inserts no abre modal (`BULK_RECOGNITION_MIN`). El primer GET `initial` sigue sin celebrar. Un hito suelto (p. ej. día 7) sí celebra.
- **Dependencias:** ACH-NOTIF-01 / ACH-CELEB-01. UX-10 `ruleReview` solo curva. UX-11/12 sin tocar. GAME-02 leerá esta familia.
- **Criterio:** 156 filas de catálogo; 106 IDs fisiológicos intactos; GET sigue array; campos `family` y `triggerAbstinenceDays` aditivos.

#### GAME-02 — Próximo hito

- **Descripción:** Mostrar el siguiente logro temporal, el progreso acumulado y el tiempo restante. Varias sustancias y `lastUseDate` distintas a la vez.
- **Estado:** Integrado en `main` (`8eb4a3e`, PR #54, vía REL-01). En SPA Live `c519bb3`; LIVE `/app` no reauditado aquí.
- **Prioridad:** P3 residual
- **Dependencias:** GAME-01 (familia definida, en `develop`). LIVE-01 (fechas por sustancia). Superficies mínimas: Inicio + Mi recuperación. Expedición 2.0 y paisaje de Inicio **no** incluidos.
- **Criterio:** Cada sustancia abstinente muestra como máximo **un** próximo hito comprensible. El % hacia la medalla temporal **no** es el % de curva (UX-04). Sustancia activa: sin cuenta atrás punitiva. Inactividad de app **no** retrasa el hito (el reloj es la abstinencia, no los logins).
- **Producto posterior:** **Después de GAME-02 adelantaremos la navegación 2.0, antes del rediseño completo GAME-03.** Trabajo separado. No forma parte de esta rama.

#### GAME-03 — Inicio 2.0, Mi recuperación 2.0 y Logros 2.0

- **Descripción:** Rediseño visual de las tres pantallas principales. El criterio original de **cronología temporal** (línea 1–365, no un segundo gráfico de curvas) permanece en GAME-03B / Recuperación 2.0 (`mi-recuperacion-2.0.png`).
- **Estado:** GAME-03A–C integrados en `main` (PR #57–#59, vía REL-01). En SPA Live `c519bb3`; LIVE `/app` no reauditado aquí.
- **Prioridad:** P3 residual
- **Dependencias:** GAME-01, GAME-02, NAV-01, NAV-02. ACH-NOTIF-01 no sustituye al árbol/timeline.
- **Entregas:**
  - **GAME-03A — Inicio 2.0:** tablero de expedición (situación, próxima medalla temporal, descubrimiento fisiológico compacto, hasta 4 logros LIVE reales, tarjeta de paisaje con `nature-1.png`). Sin XP ni niveles.
  - **GAME-03B — Mi recuperación 2.0:** cabecera `nature-2.png`, tarjetas de sustancia, panel de foco, rail de 10 umbrales GAME-01 con interpolación, curvas y sistemas. Fórmulas y catálogos intactos.
  - **GAME-03C — Logros 2.0:** cabecera `nature-3.png`, resumen 156 (106+50), filtros y búsqueda, destacados reales, galería temporal y fisiológica, platinos visibles. Sync y reglas de desbloqueo intactos.
- **Criterio (03B):** usable con teclado y en 320 px; sin scroll horizontal accidental; copy de que los hitos son tiempo de abstinencia. Futuras temporales no spoilean secretos **fisiológicos** (UX-12).

#### GAME-04 — Bitácora de recuperación

- **Descripción:** Registros **voluntarios** de ánimo, sueño, energía y notas. No son diagnósticos. **No** atribuir automáticamente sus variaciones a la abstinencia. **JRN-01 amplia este ID** (emoción opcional, intensidad de deseo, desencadenantes, consulta de evolución); no lo sustituye ni crea un segundo diario.
- **Estado:** Implementado e integrado en `main` vía **JRN-01** (PR #72 + BETA-02C). En SPA Live `c519bb3`; LIVE `/app` no reauditado aquí. Dirección visual: `bitacora-2.0.png`. Residual: política de retención/exportación pública y copy de privacidad en landing.
- **Prioridad:** P3 residual (vía JRN-01)
- **Dependencias:** GAME-DESIGN-01. Decisión de retención/exportación (cuenta, dispositivo, GDPR). AUTH-01. No mezclar con síntomas clínicos publicados. JRN-01 (campos adicionales).
- **Criterio (histórico, vigente):**
  - UI opt-in.
  - Campos acordados: ánimo, sueño, energía, ansiedad/estrés, notas personales, calendario, tendencias, reflexiones y aprendizajes **marcados por el usuario**.
  - Nota de privacidad aprobada (qué se guarda, quién lo ve, cómo se exporta/borra) **antes** de tocar Prisma.
  - Del mockup **no** se implementan: racha de uso como meta, «bienestar medio» 0–10 como evaluación, causalidad automática con la abstinencia.

#### Explorador 2.0 — Descubrimiento educativo

- **Descripción:** Rediseño de Explorar (`/preview/explore` y `/app/explore`) como tablero de descubrimiento educativo. Reutiliza contratos existentes (5 sustancias, 12 sistemas, perfiles NT, selector de fase). No es Atlas 2.0 ni GAME-05.
- **Estado:** Integrado en `main` (`559df95`, PR #61, vía REL-01). En SPA Live `c519bb3`; LIVE `/app` no reauditado aquí.
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
  - Panel de misiones educativas: teaser hacia `/missions` (GAM-02 en `main`; 14 publicadas).
  - Diseño responsive (sin overflow horizontal a 1440, 390 y 320 px).
  - Reutilización de los contratos existentes.
- **Producción:** GAM-01/02 y atlas 2.0 están **integrados en `main`**. En SPA Live `c519bb3`; LIVE `/app` no reauditado aquí. Síntomas no publicados.
- **Dependencias:** UX-05–07. I18N-2.0 (chrome de dashboards 2.0). No GAME-01/02.
- **Criterio:** Explorar usable en DEMO y LIVE local; NT educativos no se presentan como medición; procesos y misiones no fingen catálogo publicado.

#### EXP-EDU-01 — Fichas educativas de neurotransmisores y procesos clave

- **Descripción:** Ampliar las fichas de los nueve neurotransmisores educativos y desarrollar fichas para cinco procesos clave, con contenido ES/EN, explicación científica accesible y referencias verificables.
- **Estado:** Integrado en `main` mediante EXP-EDU-01c / 02a / 02b / 03 / 04 (PR #62–#67) y enlaces atlas (PR #67). **No** es GAME-05. En SPA Live `c519bb3`; LIVE `/app` no reauditado aquí.
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
- **Estado:** Capa educativa **implementada e integrada en `main`** vía **GAM-02**: piloto PR #74 (seis) **ampliado** a **catorce** `reading_check` publicadas (PR #96, `68c8649`). Una misión permanece `draft` (`edu-unpublished-01`). Bienestar y objetivos personales **siguen pendientes**. **GAME-07 no cubre este ID.**
- **Prioridad:** P3 residual (capa educativa publicada; bienestar/objetivos no reabren este ID)
- **Dependencias:** GAME-DESIGN-01. GAM-01 **después** (no puntuar hasta reglas de XP). Atlas / Explorar / NT **publicados**. No inventar ventanas UX-08 ni medición de NT. No contenido `pending_clinical_review`.
- **Criterio (histórico, vigente):**
  - Áreas temáticas educativas: neurociencia, anatomía, sustancias, fisiología/procesos.
  - Cada misión educativa: título con personalidad, objetivo, contenido de atlas, actividad o pregunta, estado, recompensa educativa (no loot aleatorio).
  - Disponibles **con o sin** abstinencia. No bloquean conocimientos. Granja repetible ilimitada **fuera de alcance**.

#### GAME-06 — XP y niveles

- **Descripción:** Intención original: estudiar experiencia a partir de logros (fisiológicos y temporales) y de aprendizaje. El «Nivel 12 / Explorador neuronal» de `inicio-2.0.png` es **ilustrativo**.
- **Estado:** Economía **implementada e integrada en `main`** vía **GAM-01**. Este ID no se reabre como segunda economía. Usuarios **sin** Bitácora no reciben `journal_create_day` (12 XP/día UTC). Siguen disponibles misiones (12 XP, una vez) e hitos personales (10). Fuentes `onboarding_complete`, `achievement_eligible` y `referral_qualified` **reservadas y no concedidas**. Techo educativo actual sin diario ≈ **14×12 = 168 XP** de misiones.
- **Prioridad:** P1 (vía GAM-01)
- **Dependencias:** ACH-01 (qué medallas existen). GAM-02 (aprendizaje). ACH-REV: el XP histórico **no** se borra en recaída.
- **Criterio:** Los de GAM-01. Nada de recompensas repetibles ilimitadas ni mecánicas de uso compulsivo (racha diaria obligatoria, FOMO de login).

#### GAME-07 — Centro de expedición

- **Descripción:** Sección **propia** Expedición (dirección: `expedicion-2.0.png`) **más** resumen en Inicio. Mapa de montaña; selector conocimiento vs perseverancia; no mezclar reglas.
- **Estado:** **Completado** en git e **integrado** en `main` (PR #106, merge `f27cc2e`; producto `8ee1ee8`). **Desplegado** en SPA Live `c519bb3` (panel, 2026-11-11). **Validado DEMO Chromium** (`/preview/expedition`, 375 px / DPR 2): mapa, rutas conocimiento/perseverancia, acceso desde «Más» (no dock). Incluye **GAME-07F** (iluminación artística WebP) e **IMG-PERF-01A** (cabeceras naturaleza WebP). Ruta `/expedition` existe también bajo `/app`; **LIVE autenticado no recorrido**. Safari iOS y PWA standalone **pendientes**. **No** reutilizar este ID para misiones, XP ni Inicio.
- **Prioridad:** P3 residual (Safari / LIVE / PWA; no reabrir el mapa).
- **Dependencias:** GAME-DESIGN-01 (ítem de menú sin vaciar el bottom nav). GAME-01/02 para metas temporales. GAM-02 para rutas de conocimiento. SHELL-01.
- **Criterio:** Rutas de conocimiento = aprendizaje. Rutas de perseverancia = hitos temporales por sustancia (alcohol, nicotina, cannabis, cocaína, cafeína). Mapa exploratorio, no ranking. Sin segundo router. **Cubierto en DEMO Chromium.** Residual: Safari, PWA, LIVE.

##### GAME-07F — Iluminación artística del mapa

- **Estado:** Integrado con GAME-07 (PR #106). WebP de marcas/sendero. Desplegado SPA Live. QA DEMO Chromium (misma pasada que GAME-07).
- **Criterio:** Iluminación de trail sin PNG de paisaje a resolución nativa innecesaria. **No** es IMG-PERF-01B (procesos/misiones).

##### IMG-PERF-01A — Cabeceras de naturaleza WebP

- **Objetivo:** Servir plates de paisaje (cabeceras Horizonte) en WebP con PNG de reserva, sin cambiar composición.
- **Estado:** Integrado con GAME-07 (PR #106) y **SPA Live**. Completado en el corte DEMO Chromium de Expedición.
- **Criterio:** Cabeceras `nature-*` vía `PhotoPlateImg` / srcset WebP. PNG maestros conservados.
- **Fuera de alcance:** ilustraciones de procesos y misiones (**IMG-PERF-01B**); NT PNG.

##### IMG-PERF-01B — Ilustraciones educativas de procesos y misiones

- **Objetivo:** Dejar de descargar PNG maestros (~500–600 KB) en miniaturas de Explorar / Atlas / banner de Misiones.
- **Estado:** **Completado** en git (PR #107, producto `d24f032`, merge `c519bb3`). **Desplegado** SPA Live. **Validado DEMO Chromium** (2026-11-11, 375 px / DPR 2).
- **Catálogo:** cinco procesos — `receptors`, `tolerance`, **`dependence`**, `neuroadaptation`, `metabolism`. **No** existe `process-withdrawal` en disco ni en IDs. «Withdrawal» es fase NT y copy de la ficha de dependencia, no un sexto plate.
- **Recursos observados en Chromium (DEMO):** `process-receptors-240.webp`, `process-tolerance-240.webp`, `process-dependence-240.webp`, `process-neuroadaptation-240.webp`, `process-metabolism-240.webp` (thumbs ~17–22 KB; encoded ≈ disco; transfer a veces ~300 B por HIT de caché); banner `educational-missions-960.webp` (~103 KB). PNG maestros siguen en origen (fallback) y **no** se pidieron en ese flujo. Atlas: miniatura relacionada `process-metabolism-240.webp` 32×32.
- **Fuera de alcance / residual:** NT siguen PNG; Safari/LIVE no verificados; no es GAME-07.
- **Prioridad:** P3 residual (NT WebP opcional; no hito obligatorio nuevo).
- **Criterio:** DEMO móvil pide WebP 240w / 960w, no PNG de proceso. **Cubierto en Chromium.** No afirmar otros navegadores.

#### GAME-08 — Capítulos de recuperación

- **Descripción:** Representación **respetuosa** de etapas de recuperación (no calendarios clínicos UX-08). Las decisiones de persistencia se vinculan a **ACH-REV**.
- **Estado:** Pendiente. **P3 / posterior** (no es el siguiente código).
- **Prioridad:** P3
- **Dependencias:** ACH-REV (política **antes** de código). GAME-01 / GAM-01 (qué se conserva). **No** implementar revocaciones ni cambios de `lastUseDate` en este ID.
- **Criterio:** Copy y estados de capítulo aprobados. Recaer no borra el historial de reconocimientos salvo que ACH-REV lo autorice por escrito. Este ID **no** escribe Prisma de logros.

---

## Siguiente bloque de producto (ROADMAP-02)

Hitos del siguiente bloque. JRN-01, GAM-01, GAM-02, FBK-01, R-JXP, UX-GLO-01, CLEAN-01, WEB-01, GAM-03, CHR-01, ONB-01, **GAME-07** e **IMG-PERF-01A/01B** están **en `main`** y en SPA Live `c519bb3`. Los IDs `GAM-*` no sustituyen a `GAME-01`–`GAME-08`. **UX-01** sigue siendo orientación anatómica; **UX-GLO-01** es la consolidación; **UX-PRE-BETA** es hito **histórico de apertura** (cerrado ROADMAP-SYNC-01).

Orden vigente **después** de la apertura (ROADMAP-SYNC-01, 2026-11-11):

- **Hecho e integrado en `main`:** FBK-01 → R-JXP → UX-GLO-01 → CLEAN-01 → WEB-01 → GAM-03 → CHR-01 → ONB-01 → BETA-02 → GAM-02 (14 misiones) → UX-REC-01 → I18N-JOURNAL-01 → JRN-01R / BETA-COPY-01 (PR #101) → PWA-01A–C → GAME-07 / 07F / IMG-PERF-01A (PR #106) → IMG-PERF-01B (PR #107).
- **Apertura:** ejecutada en producto. Avisos `published` en código (**no** equivale a D.3). SPA Live: `c519bb3` (2026-11-11). API Live copiada: `4520530` (2026-11-10).
- **Paralelo abierto:** BETA-01D.3 jurídica (no cerrada aquí). MKT-PR-01D seguimiento de prensa. PWA-01D **aplazado**. WEB-01 / WEB-01-FIX / UX-POLISH integrados (PR #108, #109, #110) y desplegados (propietario).
- **Siguiente trabajo (prioridad):** MKT-PR-01D; valoración jurídica de BETA-01D.3 (BETA-01D.3-FIX desplegado, PR #112); UX-BOOT (análisis opcional); WEB-02 si procede. SUP-01B–D y SUP-ASSET-01 publicados (PR #113–#117). SUP-01E1-A investigación aprobada; SUP-01E1-B implementación local pendiente de revisión; E2 / relapse pendientes. Q-05 + Q-OBS desplegados (PR #111). **No** más mapa ni catálogo educativo de procesos.
- **Paralelo / ops:** Q-CI residual (**Q-05**, cobertura, scripts raíz); recopia SHA Live de **API** tras #105: **pendiente**.
- **Residual / posterior (P3):** WEB-02; resto de MKT-01 (no MKT-01C); FBK-02; GAME-08 (tras ACH-REV residual); bienestar GAM-02; MOB-01 (tiendas, no PWA); NT WebP opcional. **SEO-01B** y **MKT-01C** cerrados (2026-11-12).

#### JRN-01 — Bitácora personal

- **Objetivo:** Ampliar GAME-04: diario privado y voluntario que conserva los campos históricos y añade registro emocional opcional, intensidad del deseo de consumir, desencadenantes y consulta de la evolución personal.
- **Prioridad:** P1
- **Estado:** Completado e integrado en `main` (PR #72 + BETA-02C). No es un segundo diario: implementa GAME-04 más los campos nuevos. **JRN-01R** (idempotencia de alta LIVE) en `main` (PR #101, `996af6c` cherry-pick) y en API Live `4520530` (R-SHA, 2026-11-10). Residual: nota de privacidad / retención GDPR. Preview usa `GET /substances` (lista vacía si el catálogo no carga); **I18N-JOURNAL-01-FIX cancelado** (no era LIVE).
- **Dependencias:** AUTH-01 (cuenta LIVE). GAME-DESIGN-01 (navegación; Bitácora en secundario / «Más», no 8 pestañas). Nota de privacidad **antes** de Prisma/API (criterio GAME-04). No depende de GAM-01 ni de CHR-01.
- **Criterios acordados (GAME-04, vigentes):** ánimo, sueño, energía, ansiedad/estrés, notas, calendario, tendencias, reflexiones destacadas por el usuario; sin racha; sin «bienestar medio» clínico; sin causalidad automática con la abstinencia; no diagnóstico.
- **Decisiones confirmadas (ampliación):**
  - Privada y voluntaria.
  - No penalizar días sin escribir.
  - Convivencia de los campos GAME-04 con emoción opcional, intensidad de deseo y desencadenantes (no son un reemplazo).
- **Pendiente de diseño:** Cómo se presentan juntos esos campos en la UI; escalas de intensidad; taxonomía de desencadenantes; retención/exportación/borrado (detalle GDPR); si las tendencias son solo consulta personal.
- **Criterio:** El usuario puede escribir, consultar el calendario y dejar de escribir sin perder progreso de Soma. Nadie más ve las entradas. La nota de privacidad existe **antes** de Prisma.

#### JRN-01R — Idempotencia de alta LIVE

- **Objetivo:** Una misma operación de creación LIVE produce como máximo una fila (clave `Idempotency-Key`, unique `(userId, clientOpId)`).
- **Prioridad:** P3 residual (cerrada en git y en inventario API Live).
- **Estado:** Implementado e integrado en `main` (PR #101, `996af6c`). Tests PG locales 29/29 sobre Postgres efímero. **Desplegado** según inventario API Live `4520530` (panel 2026-11-10). Clientes sin cabecera conservan el alta múltiple. Recorrido Bitácora LIVE en producción **no** reauditado en ROADMAP-SYNC-01.
- **Criterio:** Replay idéntico → 200 y el mismo `id`; clave reutilizada con otro cuerpo → 409; sin XP duplicado. **Cubierto en código y en el SHA de API copiado.** No afirma QA funcional de `/app`.

#### PWA-01 — Instalación desde la web (sin tiendas)

- **Objetivo:** Que un usuario de la beta pública pueda **instalar Soma desde el navegador** (Android Chromium; iOS «Añadir a pantalla de inicio») y abrirla en modo *standalone* donde el SO lo permita, con el **icono y el nombre oficiales**, sin Google Play ni App Store.
- **Prioridad:** **P1 de producto** (acceso y recurrencia en beta). No desplaza BETA-01D.3 ni R-SHA.
- **Estado:** **Parcial.** **PWA-01A/B/C** completados y **desplegados**. Instalación básica **Android** (Chrome, recorrido LIVE) e **iOS** (BrowserStack Live, iPhone 15 Pro, Safari 17.0: añadir a inicio y abrir) **validada**. **PWA-01D** **aplazado** (2026-11-12): QA funcional iOS sin dispositivo; no bloquea la beta. No se afirma recorrido LIVE en iOS ni iPhone físico propio. **MOB-01** pospuesto. Hito global **no** cerrado.
- **Fuera de alcance de este ID:** empaquetado nativo / tiendas (**MOB-01**); offline complejo; cola de Bitácora offline; notificaciones push; nuevas dependencias salvo justificación en PWA-01A; reinterpretar el icono oficial.
- **Dependencias:** Superficie web 2.0 y FAV-01 en git. **JRN-01R** en `main` (no cachear `/me/journal`). AUTH-01 (sesión). SHELL-01 (nav móvil). No espera GAME-07, WEB-02, MKT-01 ni MOB-01.
- **Criterio de cierre (las cuatro fases):** instalable en Android compatible; instrucciones iOS de pantalla de inicio; standalone donde exista; auth/nav/logout; sin secretos ni Bitácora LIVE en caché opaca; actualizaciones del JS nuevo; copy ES/EN; sin tiendas.

##### PWA-01A — Auditoría técnica y alcance

- **Objetivo:** Congelar el recorte mínimo: qué archivos, qué *start_url*, qué no cachear, si hace falta service worker (y cuál) **sin** librería nueva por defecto.
- **Prioridad:** P1
- **Estado:** **Completado** técnicamente y **desplegado** con B/C (auditoría + aprobación del propietario, 2026-11-10). Decisiones: `start_url` `/`; **sin** SW; sin librerías PWA; no cachear `/me` ni `/auth`.
- **Alcance:**
  - Inventario: `index.html`, `public/` (FAV-01), `vite.config.ts`, `document-meta.ts` / JSON-LD `WebApplication`, Render rewrite + Headers.
  - Criterio de instalabilidad Chromium (manifest + iconos + *served over HTTPS*).
  - iOS: Apple Touch existente; `apple-mobile-web-app-capable` / `mobile-web-app-capable`; limitaciones (no `beforeinstallprompt`).
  - Decidir *start_url* (`/` vs `/app`) sin indexar `/app` (SEO-01A).
  - Lista blanca de estáticos vs red: **prohibido** cachear `GET/POST /me/journal`, `/auth/*`, JWT.
  - No introducir `vite-plugin-pwa` / Workbox salvo que A demuestre que un SW a mano no cubre actualizaciones.
- **Criterio:** Informe de alcance aprobado por el propietario **antes** de B. **Cumplido** (autorización PWA-01B).

##### PWA-01B — Instalación y experiencia standalone

- **Objetivo:** Manifest + iconos oficiales (192/512, **sin** rediseñar la marca) + apertura *standalone*. **Sin** service worker en esta fase.
- **Prioridad:** P1
- **Estado:** **Completado técnicamente y desplegado.** QA Android cubierto en D. iOS: instalación y apertura comprobadas en D (BrowserStack); recorrido funcional iOS **no** cubierto aquí.
- **Entregado:**
  - `public/manifest.webmanifest`: `name`/`short_name` **SOMA**, `display: standalone`, `theme_color`/`background_color` `#061018`, `start_url` `/`, `scope` `/`.
  - Iconos `/pwa-192x192.png` y `/pwa-512x512.png` reescalados de `soma-favicon.png` (1254², FAV-01). `apple-touch-icon` 180 sin cambiar.
  - `index.html`: `rel=manifest`, `theme-color`, `mobile-web-app-capable`, metas Apple, `viewport-fit=cover`.
- **No entregado aquí:** SW; copy de instalación (C); Lighthouse en dispositivo real; deploy (D).
- **Criterio residual de B:** Chromium «Installable» (Android) e iOS «Añadir a inicio» + apertura **validados en D** sobre HTTPS. Recorrido funcional iOS sigue en D.

##### PWA-01C — UX de instalación ES/EN y validación móvil

- **Objetivo:** El usuario entiende **cómo** instalar según plataforma. No un *prompt* agresivo ni copy de «app de tienda».
- **Prioridad:** P1
- **Estado:** **Completado técnicamente y desplegado.** QA Android en D: control «Instalar SOMA» oculto en standalone. iOS: «Añadir a inicio» y apertura vistos en D (BrowserStack). Ocultación del control en standalone iOS **no** verificada.
- **Alcance:**
  - Copy ES/EN: Android (menú del navegador / `beforeinstallprompt` si existe); iOS Safari (Compartir → Añadir a pantalla de inicio).
  - Superficie mínima: pie de landing pública + sección Cuenta LIVE. Sin modal automático ni banner persistente.
  - `userChoice.accepted` ≠ instalación confirmada; éxito solo con `appinstalled` o standalone.
  - No afirmar disponibilidad en Play/App Store. No afirmar offline.
  - Validación real Android **hecha en D.** iOS: añadir a inicio y abrir **hechos en D** (BrowserStack). QA funcional iOS y otras versiones **pendientes.** Tamaños UX-PRE-BETA 320/375/430 + safe-area del dock: no reabiertos aquí.
- **Criterio residual:** Instalar o añadir a inicio sin tienda. Android (funcional LIVE) e iOS (instalación/apertura remota) cubiertos en D. Recorrido LIVE iOS **no** afirmado. DEMO `/preview` y LIVE `/app` no se confunden.

##### PWA-01D — Seguridad, actualizaciones, QA y publicación controlada

- **Objetivo:** Publicar la PWA **sin** filtrar diario/sesión y **sin** dejar clientes eternos en un bundle viejo. Incluye icono de launcher correcto, primer arranque sin FOUC blanco, MIME/caché de manifest y assets, y QA móvil real.
- **Prioridad:** P1
- **Estado:** **APLAZADO** (2026-11-12). **PWA-01A/B/C** completados y desplegados. Instalación en iPhone ya comprobada. Las pruebas adicionales de Safari/iOS (persistencia, caché, actualizaciones) quedan aplazadas por no disponer de dispositivo. **No** bloquea la beta. Se retoma solo con acceso a un dispositivo o ante una incidencia real. **No** se prevé comprar hardware. Recorrido funcional LIVE **solo** en Android. **MOB-01** pospuesto. PWA-01 global **parcial**.
  - **Android:** instalación real y recorrido LIVE satisfactorios (propietario): Chrome; icono oficial **aprobado**; standalone; login; persistencia al cerrar/reabrir; nav; Bitácora LIVE crear/editar; logout y nuevo login; «Instalar SOMA» oculto en standalone. Primer arranque sin CSS **no** reproducido tras reinstalación.
  - **iOS:** validación real de **instalación y apertura** en dispositivo remoto BrowserStack Live (2026-11-10): iPhone 15 Pro, Safari 17.0, https://somarecovery.app. Landing con estilos; añadir a pantalla de inicio; abrir la app instalada. **No** es un iPhone físico propio. **No** es solo emulación responsive. La sesión gratuita terminó antes del recorrido funcional.
  - **Infraestructura:** MIME del manifest y políticas CDN: revisión **pendiente, no bloqueante** mientras no haya incidencia. Causa raíz histórica del primer arranque sin CSS **no confirmada**.
- **Hecho:** iconos any/maskable y CSS crítico (mitigación visual). Tests de contrato del manifest. Sin service worker.
- **Aplazado (sin dispositivo; no se infieren resultados):**
  - QA funcional iOS en la PWA instalada: login; persistencia al cerrar/reabrir; refresh token; nav DEMO/LIVE; Bitácora LIVE crear/editar; logout y nuevo login; ocultación de «Instalar SOMA» en standalone; icono y estilos **dentro** de la PWA; otras versiones de iOS. No inferir resultados de lo no probado. No asumir `beforeinstallprompt`.
  - MIME `application/manifest+json` y caché HTML vs `/assets/*`; Polish solo si un fallo lo exige.
  - SHA SPA Live (2026-11-11): `c519bb3` (incluye PWA-01A–C y entregas posteriores). API inventario 2026-11-10: `4520530`. PWA-01D **no** se cierra por el SHA.
- **Criterio residual:** QA funcional iOS cuando haya dispositivo o incidencia; no tiendas (**MOB-01** pospuesto).

#### GAM-01 — Experiencia y niveles

- **Objetivo:** XP por acciones significativas y niveles **permanentes**, con recompensas educativas y de participación.
- **Prioridad:** P1
- **Estado:** Completado e integrado en `main`. GAME-06 es la intención previa; **no** hay una segunda economía. Las cifras de los PNG siguen siendo **ilustrativas** (`T(L)=10n(3n+4)`).
- **Entregado:**
  - XP por fuentes catalogadas (`mission_complete` 12, `journal_create_day` 12, hito personal 10). `onboarding_complete` / `achievement_eligible` / `referral_qualified` reservados y no concedidos.
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
- **Pendiente de diseño (residual):** Copy de nombres de nivel; si exploración pura puntúa; techo para quien **no** usa Bitácora (hoy 14 misiones × 12 XP). Las cantidades ya catalogadas **no** se reabren aquí. **No** introducir racha diaria ni penalizar inactividad.
- **Criterio:** Fuentes y techos viven en `@soma/shared-types` (`PROGRESS_XP_AMOUNT`, `T(L)`). No hay granja ilimitada ni FOMO de racha diaria. Recaída no borra XP.

#### GAM-02 — Misiones

- **Objetivo:** Ampliar GAME-05 con una **clasificación general** de misiones. No sustituye las áreas temáticas educativas.
- **Prioridad:** P3 residual (14 educativas en `main`; bienestar/objetivos: diseño, **no** código inmediato)
- **Estado:** Completado e integrado en `main`. Piloto PR #74 (seis) **ampliado** PR #96 a **catorce** publicadas. Capa **descubrimiento y aprendizaje** (GAME-05). Bienestar/habilidades y objetivos personales **siguen pendientes**. El PNG `misiones-2.0.png` local no forma parte del git.
- **Entregado:**
  - Catorce misiones `reading_check` publicadas (dopamina, serotonina, GABA, receptores, tolerancia, neuroadaptación, dependencia, metabolismo, glutamato, noradrenalina, acetilcolina, adenosina, endorfina, endocannabinoide) más `edu-unpublished-01` en draft.
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
- **Pendiente de diseño:** Catálogo de bienestar y objetivos personales (no forma parte del piloto ni de las 14 educativas); tono; frecuencia; relación con GAME-07. La pantalla de Misiones **ya existe** en `main`.
- **Criterio:** Hay misiones útiles con o sin abstinencia. Ninguna misión pide privación peligrosa ni sustituye consejo clínico. La capa educativa conserva GAME-05.

#### GAM-03 — Integración de gamificación

- **Objetivo:** Conectar Bitácora, Misiones, XP y Logros sin duplicar eventos ni recompensas.
- **Prioridad:** P3 residual (copy UX; regresiones). **Cerrado técnicamente.** No reabre la economía.
- **Estado:** Completado técnicamente e integrado en `main`. Sin tabla Prisma ni segunda economía: el mapa vive en `@soma/shared-types` (`gamification-events.ts`). Fórmulas XP y reglas de medallas/misiones **intactas**.
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
- **Residual:** copy de recompensa educativa vs participación (no implementar sin diseño).
- **Criterio:** Completar una misión, escribir en la bitácora o desbloquear una medalla se explica una sola vez en la economía acordada. **Cumplido** en el ledger y el mapa de eventos.

#### CHR-01 — Somi, mascota oficial

- **Objetivo:** Personaje original de fantasía que acompaña la experiencia (educación, humor, guía), no un indicador de salud. Para la beta: **ilustraciones estáticas** coherentes, no una máquina de animación CSS.
- **Prioridad:** P3 residual (animación avanzada pospuesta).
- **Estado:** **Cerrado técnicamente e integrado en `main`.** CHR-01A (sin animación CSS) y CHR-01B (seis WebP). **Somi solo en ONB-01**; no en Cuenta. PNG originales conservados. Animación avanzada pospuesta. En SPA Live `c519bb3`; LIVE `/app` no reauditado aquí.
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
- **Criterio de cierre git:** componente reutilizable, seis WebP con alfa, PNG conservados, Cuenta sin Somi, tests verdes. **Cumplido en `main`.** Animación avanzada: no.

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
- **Prioridad:** P3 residual (recorrido LIVE de punta a punta no reauditado aquí).
- **Estado:** **Completado e integrado en `main`.** AUTH-01 se reutiliza y **no** se modifica. Nueve pasos. DEMO no auto-invita. **No** afirma GAME-07.
- **Dependencias:** **CHR-01B** (componente `Somi` + seis WebP estáticos). REC-VIS-01, Explorador, ACH-01, JRN-01, GAM-01 y GAM-02 ya en git (`develop`/`main` según ID) para explicar solo lo real. Persistencia de «tutorial hecho».
- **Decisiones confirmadas:**
  - Somi como guía visual (ilustraciones estáticas de CHR-01B).
  - Explica las superficies principales reales (Recuperación, Explorar, Logros, Bitácora, Misiones/XP **si** están en el corte desplegado).
  - Se puede **omitir** el tutorial.
  - Se puede **retomar** después (p. ej. desde Configuración / Cuenta).
  - ES/EN; responsive; accesible.
  - El **diseño exacto del recorrido y sus pantallas se acuerda antes de implementar**.
- **Pendiente residual:** reinspección LIVE autenticada de punta a punta (no bloquea el ID). En SPA Live `c519bb3`. Tour **sin** paso Expedición (no abre un ID nuevo).
##### ONB-01A — Motor
- **Estado:** **Completado** (`aca59c6`). Nueve pasos; avance/atrás/omitir; persistencia LIVE por `userId`; DEMO solo manual; sin Prisma/API.
##### ONB-01B — Presentación y Somi
- **Estado:** **Completado** (`0132676`). Tarjeta Soma, Somi asomado, spotlight, invitaciones no bloqueantes.
##### ONB-01C — Accesibilidad, responsive y validación
- **Estado:** **Completado.** En `main`. Foco en el diálogo antes del lock; Tab/Escape; snapshot de `inert`/`aria-hidden`; restauración del shell antes de devolver el foco; invitaciones no modales.

- **Criterio:** Un usuario nuevo entiende las superficies reales. Nada del tutorial afirma que una función planificada ya está viva. Omitir y repetir funcionan.

#### UX-PRE-BETA — Revisión integral previa a la beta

- **Objetivo:** El **propietario del producto** recorre las superficies **públicas**, **DEMO** (`/preview`) y **LIVE** (`/app`) y aprueba explícitamente que la experiencia es suficientemente estable, coherente y usable para abrir la beta. **No** es UX-GLO-01 (ya completado). **No** es una refactorización general.
- **Prioridad:** P3 residual (ya no es candado de apertura).
- **Estado:** **Cerrado** como hito histórico de apertura (ROADMAP-SYNC-01, 2026-11-11). La beta **ya está publicada**; no se reabre como barrido general ni como segundo UX-GLO-01. Pendientes trasladados: **VIS-01** (figura tablet/escritorio); **I18N-04** (banderas en el disparador); **AUTH-01 / LIVE-01** (recorrido `/app`); **PWA-01D** (iOS funcional); pulido no bloqueante que el propietario priorice. **No** absorbe BETA-01D.3.
- **Tamaños de referencia:**
  - Móvil: 320, 375 y 430 px.
  - Tablet: 768 y 1024 px.
  - Escritorio: 1280, 1440 y 1920 px.
- **Áreas:** navegación; diseño visual; proporciones y espaciados; legibilidad; accesibilidad básica; comportamiento responsive; coherencia entre pantallas; experiencia de usuario; funcionamiento de las funcionalidades principales.
- **Salida:** lista de incidencias priorizadas por **impacto**. Solo se corrige lo que el propietario priorice para abrir. El pulido no bloqueante queda residual (VIS-01, I18N-04, etc.).
- **Dependencias:** CHR-01 cerrado (ilustraciones integradas). ONB-01 implementado o, si el propietario lo autoriza por escrito, un recorte mínimo del tutorial. Superficies 2.0 ya en el corte candidato a deploy.
- **Criterio histórico:** aprobación explícita antes de abrir BETA-01. **Cumplido** al publicar la beta. No se usa este ID para revertirla ni para QA iOS/LIVE.

#### WEB-01 — Renovación de la landing

- **Objetivo:** Nueva landing de Soma 2.0: funcionalidades **reales**, propuesta educativa y de seguimiento, y un camino claro al registro.
- **Prioridad:** P3 residual (regresiones); WEB-02 sigue P2/P3.
- **Estado:** Landing original completada e integrada en `main` (`ff5a359`, PR #82). **Actualización 2026-11-12: integrada y desplegada** (PR #108, producto `e3a55e1`; despliegue confirmado por el propietario, SHA de panel no recopiado). Añade:
  - Sección «Lo que puedes explorar hoy en Soma»: recuperación/modelos, nueve perfiles cualitativos de NT, explorador de sustancias, atlas anatómico, Bitácora, misiones, logros/medallas/niveles y Centro de Expedición. Cada tarjeta enlaza a su ruta DEMO `/preview/*`.
  - Sección del Centro de Expedición (beta pública): rutas de conocimiento y de perseverancia, con el mapa real (`expedition-map.webp`/`.png`) y los iconos existentes. CTA a `/preview/expedition`.
  - Copy ES/EN educativa y motivacional, sin promesas clínicas. Se conservan los CTA DEMO / crear cuenta / entrar y los contratos SEO-01B (`index.html`, `robots.txt`, `sitemap.xml` sin cambios).
  - QA local: tests web, typecheck y build OK; revisión visual DEMO Chromium escritorio (1440) y móvil (375) en `vite preview`. **No** Safari.
  - **WEB-01-FIX** (PR #109, producto `cadf893`): altura mínima de escritorio de las nuevas secciones, fondos decorativos con recursos existentes y legibilidad del texto sobre ellos. Tests web 1011/1011. Integrado y desplegado (propietario).
- **No** anunciar Android / Play Store (**MOB-01** pospuesto).
- **Dependencias:** REL-01 (funciones ya en `main`). **SEO-01A** y **SEO-01B** cerrados. WEB-02 puede ir en el mismo trabajo visual. No espera GAM-03 ni MOB-01.
- **Decisiones confirmadas:**
  - Presentar las funcionalidades reales (Recuperación, Explorador, Logros, Bitácora, Misiones/XP **si** están desplegadas).
  - Explicar la propuesta educativa y de seguimiento, sin promesas clínicas.
  - Facilitar el registro (CTA público; el modo del host no se infiere de git).
  - Mantener SEO y responsive.
  - Identidad visual Soma 2.0. Preparar hueco para Somi (CHR-01) sin presentarlo como disponible.
- **Identidad visual y recursos de marca (no implementar en FBK-01):**
  - Favicon definitivo.
  - Iconos web y PWA.
  - Apple Touch Icon.
  - Imagen Open Graph.
  - Comprobación de visualización en navegadores y dispositivos.
  - Coherencia con la identidad de Soma y el futuro Somi (CHR-01).
- **Residual:** WEB-02 (origen del nombre / filosofía) no se empaquetó aquí. **SEO-01B** cerrado (2026-11-12). Iconos de **instalación PWA** (manifest 192/512, standalone) pasan a **PWA-01**; FAV-01 cubre pestaña/Apple Touch 180, no el instalador. El copy público **no** describe funciones que no estén en producción.
- **Criterio:** Un visitante de `somarecovery.app` entiende qué es Soma 2.0 y qué puede hacer hoy. No afirma tienda nativa. Favicon: **FAV-01** (PR #92); instalabilidad: **PWA-01**. SHA SPA Live `c519bb3` (2026-11-11, último inventario copiado). Expedición en copy público: cubierta por PR #108/#109, desplegados según el propietario.

#### UX-POLISH — Pantalla de carga y descubrimiento de Expedición

- **Objetivo:** Sustituir el «Cargando…» genérico por una pantalla de marca y hacer visible el Centro de Expedición desde Inicio y desde el tutorial, sin tocar autenticación, progreso ni lógica de Expedición.
- **Prioridad:** P3 residual (regresiones).
- **Estado:** **Completado** (2026-11-12). PR #110 (producto `83556cf`, merge `cf17b47`) fusionado y **desplegado** según el propietario. Tests web 1019/1019 en el momento del hito. La presentación animada original del logo en la landing se conserva (comprobado por el propietario en ventana privada).
  - **A — Pantalla de carga:** **completado.** Se muestra mientras `AuthProvider` restaura la sesión (`POST /auth/refresh` y `/auth/me`) en `/` y en rutas protegidas. Fondo azul oscuro, `SomaMark`, tres puntos con `motion-safe:animate-pulse`, «Preparando tu espacio…» y, tras 6 s, aviso de que la primera conexión con el servidor puede tardar. Solo cambia el texto: sin barra falsa, sin error por tiempo, sin reintentos ni botón. ES/EN.
  - **B — Expedición desde Inicio:** **completado.** Enlace «Abrir el Centro de Expedición» en la tarjeta de horizonte de Inicio, hacia `${base}/expedition` (DEMO `/preview`, LIVE `/app`). Solo en el Inicio completo (con sustancias).
  - **C — Tutorial ONB-01:** **completado.** El paso de navegación menciona el Centro de Expedición en «Más». Sigue con nueve pasos; sin cambios de lógica ni persistencia.
- **Residual (tarea aparte **UX-BOOT**, no implementada):** para visitantes anónimos la landing espera a `/auth/refresh`, así que con la API en reposo (*cold start*) se ve la pantalla de carga hasta que responde. Mostrarla de forma optimista o reintentar requiere cambiar la lógica de autenticación.
- **Criterio:** revisión del propietario, publicación y comprobación en producción. **Cumplido.**

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
- **Pendiente de diseño:** Longitud del texto, tono (accesible, no académico opaco), si hay página propia o bloque en landing. **SEO-01B** ya cerrado; no bloquea WEB-02.
- **Criterio:** La historia del nombre está publicada en ES/EN y no contradice UX-04 / REC-VIS-01.

#### SEO-01 — Search Visibility & Indexing

Visibilidad de búsqueda de las superficies **públicas**. No indexar `/app`, `/preview` autenticado, ni APIs. No publicar contenido `pending_clinical_review`.

##### SEO-01A — Fundamentos técnicos

- **Objetivo:** Base técnica de indexación junto con **REL-01**.
- **Prioridad:** P2 residual (Search Console / CWV).
- **Estado:** Integrado en `main` (PR #75 y refuerzo PR #93). Landing estática indexable; superficies privadas con `noindex`. Core Web Vitals y Search Console **no** medidos aquí.
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

- **Objetivo:** Comprobar que la landing pública es visible en búsqueda con la configuración SEO ya desplegada (SEO-01A / WEB-01), sin ampliar arquitectura de contenidos ni copy clínico.
- **Prioridad:** P2 (cerrado)
- **Estado:** **Completado** (2026-11-12). Revisión de la configuración SEO de la landing pública. Sin cambios adicionales de código, SSR, prerenderizado ni infraestructura para cerrar este hito.
- **Hecho (cierre):**
  - Dominio canónico: `https://somarecovery.app/`.
  - `robots.txt` y `sitemap.xml` correctos.
  - Google Search Console configurado y recibe datos.
  - Landing indexada en Google.
  - Rutas funcionales y privadas mantienen `noindex`.
  - Prueba en tiempo real de Search Console: `/reset-password` excluida por `noindex`.
  - Entradas antiguas que aún aparecen indexadas: pendientes de nuevos rastreos, no de código.
- **Dependencias:** WEB-01 y SEO-01A cumplidas. WEB-02 (filosofía / origen del nombre) **sigue pendiente** y no forma parte de este cierre.
- **Criterio:** Un crawler recibe la landing pública; las superficies privadas no se tratan como indexables. Cumplido.

#### REL-01 — Release de producción

- **Objetivo:** Preparar el paso de `develop` a `main` y desplegar los avances acumulados **después** de PR #52, sin poner en riesgo datos existentes.
- **Prioridad:** P2 residual (deploy de producción y migraciones, cuando se autoricen)
- **Estado:** Squash-merge en `main` (`8155554`, PR #76). Superado por merges posteriores hasta `c519bb3` (`main` = `develop`). SPA Live coincide con ese SHA (2026-11-11). Migraciones de Supabase **no** reauditadas en este sync.
- **Incluye (histórico REL-01, ahora en `main`):** GAME-01–03, NAV-01–02, I18N-2.0, Explorador 2.0, EXP-EDU, HOME-UI-01, REC-VIS-01, ACH-01, JRN-01, GAM-01, GAM-02 (piloto).
- **Después de REL-01, también en `main`:** SEO-01A, FBK-01, R-JXP, UX-GLO-01, CLEAN-01, WEB-01, registro/privacidad, CI, backups R2, pin PG17, GAM-03, avisos `published`, CHR-01, ONB-01, BETA-02, GAM-02 (14 misiones), UX-REC-01, I18N-JOURNAL-01.
- **Dependencias:** Inventario de migraciones Prisma vs producción (estado de `_prisma_migrations` en Supabase **desconocido** sin consulta autorizada). Variables de producción (`DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `APP_PUBLIC_URL`, mailer). Backup antes de migrar.
- **Convención del PR de producción (cuando se autorice):** título y descripción **íntegramente en inglés** (summary, features, migrations, testing, deployment, known issues, rollback).
- **Criterio:** `main` avanza un squash/merge acordado; migraciones aplicadas con backup; DEMO y un humo LIVE de staging o producción autorizado; rollback documentado (revertir deploy; **no** asumir `migrate down`). El modo de registro del **host** (`open` vs `invite`) no se infiere de git.

#### FBK-01 — Feedback Center

- **Objetivo:** Espacio **integrado** en Soma para sugerir funciones, proponer mejoras y comunicar errores.
- **Prioridad:** P3 residual (regresiones). Ya no es la prioridad inmediata de producto. Cierre revisado el 2026-10-30: **cumple** los criterios de aceptación originales.
- **Estado:** Completado e integrado en `main` (`f1b447f`, PR #77). Formulario, validación, `GET/POST /me/feedback` con JWT, `FeedbackReport`, ES/EN, throttle. Tras retirar consentimiento de categoría especial: historial LIVE purgado; el envío sigue permitido con aviso. **Sin** UI de administración.
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
- **Prioridad:** P1 residual **jurídico** (D.3), no de “volver a abrir”.
- **Estado:** Apertura de **producto** ejecutada: README «Public Beta»; código `LEGAL_NOTICE_STATUS=published` (**no** es dictamen jurídico). Preparación git **integrada en `main`**. **BETA-01D.3** **en revisión** (2026-11-12). Registro en producción: `GET /auth/registration-mode` = `open` (lectura pública 2026-11-12). SPA Live `c519bb3` (2026-11-11). API Live copiada `4520530` (2026-11-10).

##### BETA-01D.3 — comprobación puntual (2026-11-12)

Solo diagnóstico: **no** se han modificado textos. **No** es dictamen jurídico.

- **Revisado:** `legal.json` ES/EN (aviso legal, privacidad, condiciones, cookies), `LegalDocumentPage`, `legal-controller.ts`, versiones en `legal-notices.ts` (`2026-10-31.2`), textos de alta y edad (`auth.json`), landing, feedback, README e `index.html`. Bundle publicado en somarecovery.app y `GET /auth/registration-mode` (lectura pública).
- **Confirmado en producción:** nombre del responsable y correo de contacto inyectados en el build (`VITE_LEGAL_CONTROLLER_NAME`, `VITE_LEGAL_CONTROLLER_EMAIL`); domicilio, NIF, teléfono y DPO vacíos, y sus cláusulas se omiten sin dejar marcadores. Sin aviso de borrador. Persona física, sin sociedad. Beta pública gratuita sin fecha de fin ni promesa de gratuidad permanente en los textos legales. Carácter educativo, no sanitario, coherente en los cuatro documentos, landing y meta. Edad 18+ coherente entre condiciones, privacidad, aviso, alta y API (`MINIMUM_SERVICE_AGE_YEARS = 18`, `Europe/Madrid`). Registro `open`, coherente con «registro abierto» (la nota de invitación de la landing solo aparece en modo `invite`).
- **Incoherencias demostrables (pendientes de corrección mínima autorizada):**
  1. Privacidad, «Qué está confirmado» y «Destinatarios»: afirman que no constan las regiones de los proveedores, mientras «Transferencias internacionales» las confirma (Fráncfort, Reino Unido, WEUR, Estados Unidos para Resend).
  2. Cookies: no recoge la clave de `sessionStorage` `soma.journal.createOp.{usuario}` (UUID y huella SHA-256, sin texto), introducida con JRN-01R después de la versión `2026-10-31.2`.
  3. Redacción interna en texto público: «el domicilio postal no se publica si no se configura», «en el repositorio», «según el inventario del producto».
- **Menores (decisión del propietario):** el feedback habla de «el equipo» y en primera persona del plural; el README dice «Soma is free to use» sin acotarlo a la beta.
- **Para revisión jurídica profesional:** suficiencia de la identificación sin domicilio ni NIF (LSSI-CE art. 10, si aplica a un servicio gratuito sin actividad económica); acuerdos de encargo efectivamente aceptados con Render, Supabase, Cloudflare y Resend, y la transferencia a EE. UU. de Resend; necesidad de EIPD y registro de actividades por tratar datos de salud (RGPD art. 35 y 30.5); base jurídica del feedback; suficiencia de la verificación de edad para datos de categoría especial; ausencia de ley aplicable y fuero en las condiciones; si un cambio de texto exige nueva versión y nueva aceptación.

##### BETA-01D.3-FIX — correcciones documentales mínimas (2026-11-12)

**Completado y desplegado:** PR #112 (producto `0349dda`, merge `68ce47e`), check `Typecheck and unit tests` en verde; despliegue confirmado por el propietario y textos corregidos presentes en el bundle público (SHA de panel no recopiado). BETA-01D.3 **no** queda resuelto jurídicamente. Solo `legal.json` ES/EN y `legal-document.test.ts`. **No** es dictamen jurídico.

- **C1 (privacidad):** «Qué está confirmado» y «Destinatarios» ya no dicen que las regiones no constan; remiten a «Transferencias internacionales», que queda como única descripción de ubicaciones y garantías (sin cambios en esa sección).
- **C2 (cookies):** `soma.journal.createOp.{identificador de usuario}` documentada en «Almacenamiento de sesión» (UUID y huella SHA-256 del contenido; sin título ni cuerpo; evita duplicados al reintentar; se borra al crear la entrada o al cambiar de usuario). «Alcance» y «Banner» ajustados para no contradecir esa clave.
- **C3 (aviso legal y privacidad):** eliminadas «el domicilio postal no se publica si no se configura», «según el inventario del producto», «en el código» y «en el código de Soma». Sin domicilio inventado ni datos personales nuevos; **no** se afirma que el correo sustituya al domicilio ni que la identificación cumpla la LSSI-CE. Residual fuera de C3: el documento de cookies conserva «en el código» y «según el inventario actual».
- **Versiones:** **sin cambios** (`2026-10-31.2`). Las versiones solo se validan al registrarse (`@Equals` en `register.dto.ts`) y se guardan como evidencia en `RegistrationAcceptance`; no existe flujo de re-aceptación para cuentas existentes, ni versión propia de cookies o aviso legal, ni revisión editorial separada. Subir la versión no obligaría a re-aceptar, pero exigiría desplegar SPA y API a la vez (si no, el alta falla con `AUTH_ACCEPTANCE_REQUIRED`). Las correcciones no cambian finalidades, bases ni condiciones; la trazabilidad queda en git y en este documento.
- **C4 aplazado:** «el equipo» y primera persona del plural en feedback; README «free to use» sin acotar a la beta.
- **Sigue pendiente de asesoramiento profesional**, en especial la **información identificativa y el domicilio** del responsable (aplicabilidad del art. 10 LSSI-CE), además de los demás puntos listados arriba.

Preparación y autorización siguen siendo fases distintas. Este sync **no** cambia env de producción.

##### Preparación (en git)

- Registro invite/open implementado en código (`65866c2`, PR #83). El valor **real** del host no se afirma aquí.
- Avisos ES/EN **`published`** en `legal-notices.ts` (versiones `2026-10-31.2`). Consentimiento de categoría especial y retirada en código.
- **BETA-01D.3 en revisión:** comprobación puntual hecha (ver arriba); validación jurídica formal pendiente.
- Backups R2/PG17 en `main`. R-JXP, GAM-03, CHR-01, ONB-01, FBK-01, WEB-01, CLEAN-01, UX-GLO-01 en `main`.

##### Autorización de apertura

- Identificación como beta pública: **sí** en README.
- SHA SPA Live (2026-11-11): `c519bb3`. SHA API copiado (2026-11-10): `4520530`.
- No se infiere `AUTH_REGISTRATION_MODE=open` en Render.

- **Dependencias residuales:** D.3 jurídica. **No** espera FBK-02, GAME-08, MOB-01 ni animación de Somi. GAME-07 ya está en SPA Live.
- **Criterio:** Quien se registra entiende que está en beta; sin promesas clínicas; diario/misiones/XP de existentes no se ponen en riesgo.

#### BETA-COPY-01 — Copy de registro y beta pública

- **Objetivo:** Alinear el copy de registro / alta con el hecho de que Soma está identificada como beta pública (no reabre D.3).
- **Prioridad:** P3 residual.
- **Estado:** **Completado** en git (PR #101, `4967da2`) e integrado en `main`. Va en el mismo merge que **JRN-01R**. Inventario API Live `4520530` incluye este commit. **No** sustituye BETA-01D.3 ni valida avisos legales.
- **Criterio:** El usuario que se registra lee copy de beta pública, no de acceso privado por invitación, salvo que el host esté en `invite`. El modo del host **no** se infiere de este ID.

#### BETA-02A / BETA-02B / BETA-02C — Estabilización post-apertura

- **Objetivo:** Pulir primer arranque, onboarding LIVE, Bitácora y autenticación **después** de publicar la beta. No reabre BETA-01 ni GAME-07.
- **Prioridad:** P3 residual (regresiones).
- **Estado:** Completado e integrado en `main`. PR #94 (`6bdd5ee`) primer arranque; PR #95 (`0b032a8`) onboarding LIVE, journal (consultas de mes, save vs refresh) y auth (login tras logout).
- **Criterio:** Recorridos LIVE de cuenta nueva y Bitácora no se rompen por los fallos de primer uso ya corregidos.

#### UX-REC-01 — Fila única de tarjetas «Mi recuperación»

- **Objetivo:** En Inicio, las tarjetas de sustancias activas (1–5) permanecen en **una fila**; si no caben, scroll interno con snap y teclado. No cambia abstinencia, hitos ni XP.
- **Prioridad:** P3 residual (regresiones de layout).
- **Estado:** Completado e integrado en `main` (`4ca43af`, PR #97). Validación visual del propietario. En SPA Live `c519bb3`; LIVE `/app` no reauditado aquí.
- **Criterio:** 4–5 sustancias no crean una segunda fila ni aíslan la figura anatómica.

#### I18N-JOURNAL-01 — Nombres de sustancias en Bitácora

- **Objetivo:** El selector «Sustancia asociada» muestra etiquetas ES/EN del namespace `substances` (`Cafeína` / `Caffeine`, etc.). Los `option value` siguen siendo IDs de catálogo.
- **Prioridad:** P3 residual.
- **Estado:** Completado e integrado en `main` (`e04e3aa`, PR #98). **I18N-JOURNAL-01-FIX cancelado:** el selector solo con «Ninguna» era **Preview** (`GET /substances` vacío), no LIVE.
- **Criterio:** Presentación localizada; POST/PATCH y filas existentes intactos.

#### FBK-02 — Community Feedback

- **Objetivo:** Superficie **pública moderada** de propuestas (futuro).
- **Prioridad:** P3 (después de WEB-01 / WEB-02; **SEO-01B** cerrado)
- **Estado:** Futuro. **No** implementar durante REL-01 ni como parte de FBK-01.
- **Posibles funcionalidades (no son requisitos cerrados de esta fase):** propuestas públicas moderadas; votaciones; estados de desarrollo; seguimiento de propuestas.
- **Dependencias:** FBK-01, BETA-01, WEB-01. Moderación y privacidad **antes** de cualquier muro público. No adelantar a la consolidación UX.
- **Criterio:** Nada enviado en FBK-01 se vuelve público sin moderación y consentimiento explícitos. Sigue sin XP por feedback.

#### SUP-01 — Centro de Apoyo y Herramientas

- **Objetivo:** sección educativa con herramientas prácticas breves y recursos para situaciones habituales de la recuperación. **No** es terapia, asistencia clínica, intervención profesional ni servicio de emergencias.
- **Estado:** **SUP-01A** completado y aprobado por el propietario (2026-11-12). **SUP-01B** completado y desplegado mediante PR #113. **SUP-01B.1** publicado mediante PR #114. **SUP-01C** publicado mediante PR #115. **SUP-ASSET-01** publicado mediante PR #116. **SUP-01D** (estrategias educativas) completado y desplegado mediante PR #117 (commit `c06595e`, merge `e21be40`). **SUP-01E1-A** investigación de recursos externos aprobada. **SUP-01E1-B** implementación local de recursos oficiales (112, 024, PNSD, Find A Helpline) pendiente de revisión técnica y de autorización de publicación. **SUP-01E2** y prevención de recaídas pendientes. Cada fase posterior requiere autorización expresa.
- **SUP-01B (completado, PR #113):** primera versión de la página; SUP-01B.1 sustituye la composición de las secciones (ver abajo).
  - **Rutas y navegación:** `/preview/support` y `/app/support`, ambas en `soma2Pages`. Entrada «Apoyo» (id `apoyo`, icono `HeartHandshake`) solo en «Más», entre Logros y «Ayuda y sugerencias». La barra lateral (7 destinos) y el dock móvil (4 + «Más») no cambian. ONB-01 sin cambios.
  - **Página** (`SupportPage` + `support/SupportSections`):
    - `RecoveryHero` con `nature-11`, imagen exclusiva de la sección aprobada por el propietario. Está registrada en `photo-plate.ts` y tiene variantes WebP de 960 y 1600 px y a tamaño completo, generadas con `optimize-img-perf-01a.mjs --only=nature-11` (las mismas opciones que el resto de `nature-*`). El PNG maestro no se ha modificado. Encuadre `object-position: 62% 55%` y degradados de lectura propios. Eyebrow «Apoyo», título «Apoyo y herramientas.» y cita.
    - Tarjeta «Respiración guiada» marcada «En preparación», sin botón ni acción.
    - «Comprender lo que pasa»: cuatro enlaces a artículos ya publicados de Explorar (`dependence`, `tolerance`, `neuroadaptation`, `dopamine`), con los títulos existentes de `explore-edu`, más «Ir a Explorar»; todos en la base activa.
    - Panel violeta «Si necesitas ayuda ahora», sin teléfonos, con enlace a `/terms#terms-emergency`.
  - **Textos:** namespace `support` ES/EN; los demás idiomas usan el inglés como respaldo explícito.
  - **Condiciones de uso:** `LegalDocumentPage` desplaza al `#apartado` al navegar dentro de la SPA (cambio aprobado). Comprobado en navegación interna y en apertura directa: sin hash o con un hash inexistente no hay desplazamiento, y no añade entradas al historial. Sin cambios en textos legales.
  - **QA:**
    - `SupportPage.test.ts` y `shell-base.test.ts` actualizados. Suite web 1034/1034, `tsc -b`, build y ESLint de los archivos modificados correctos.
    - Revisión visual en Chromium (DEMO, ES/EN): 1440 y 1024 px de escritorio; 768, 375 y 320 px sin desbordamiento horizontal y con enlaces de al menos 44 px. Comprobados «Más» en escritorio y móvil, el enlace a Explorar y el ancla de las condiciones.
    - **No** verificado visualmente: LIVE `/app/support` (requiere sesión; misma ruta y componente cubiertos por tests).
- **SUP-01B.1 (completado y publicado, PR #114):** iteración de fidelidad visual a `apoyo-2.0`. Solo cambia la presentación de `SupportSections`; se mantienen hero `nature-11`, rutas, entrada en «Más», enlace de urgencias y namespace `support`.
  - **Herramientas rápidas (antes de SUP-ASSET-01):** cuatro tarjetas con zona visual superior (icono Lucide sobre halo y degradado CSS). SUP-01C sustituyó «En preparación» por la herramienta activa; las otras tres siguen «Prevista».
  - **Recursos de aprendizaje:** tres tarjetas. «Procesos clave» (dependencia, tolerancia, neuroadaptación) y «Lecturas recomendadas» (dopamina, serotonina, GABA) enlazan artículos publicados de Explorar. «Audios y meditaciones» marcada «No disponible». «Guías prácticas» del mockup se renombra a «Procesos clave» porque Soma no tiene guías prácticas.
  - **Estrategias de apoyo** (en lugar de «Estrategias que funcionan», para no afirmar eficacia): Manejo de emociones, Prevención de recaídas, Gestión del estrés, Hábitos y rutinas saludables, todas «Prevista» y sin enlace. No hay contenido publicado equivalente; su contenido corresponde a SUP-01D.
  - **Ayuda inmediata:** mismo texto y enlace a las condiciones, en un panel con tono rosado y el enlace con forma de botón secundario. Sin teléfonos ni botón de emergencia.
  - **Plan personal:** panel «Tu plan de apoyo», «En desarrollo», sin progreso, pasos completados, formulario, botón ni datos guardados (corresponde a SUP-01E2).
  - **Pestañas del mockup:** no se implementan; la página es una sola columna de secciones y las pestañas duplicarían el título de la página sin aportar navegación real.
  - **Recursos gráficos — SUP-ASSET-01** (publicado, PR #116): siete ilustraciones del propietario en `apps/web/public/images/support/` (PNG maestros 1536×1024 + un WebP 768×512 por imagen).
  - **QA:** `SupportPage.test.ts` ampliado (10 tests); suite web 1037/1037; `tsc -b`, build y ESLint de los archivos modificados correctos. Revisión visual en Chromium (DEMO, ES/EN) a 1440, 1024, 768, 375 y 320 px sin desbordamiento horizontal y con enlaces de al menos 44 px; navegación real comprobada a un artículo de Explorar y al apartado de urgencias. LIVE no revisado visualmente.
- **Referencia visual aprobada:** `docs/design/apoyo-2.0.png` (1199×1312, escritorio; local, sin versionar en git, como el resto de `docs/design/`). Estructura: hero fotográfico con cita; pestañas (Vista general, Estrategias, Recursos, Apoyo, Plan personal); cuatro tarjetas de herramientas rápidas con ilustración (Respiración guiada, Atención plena, Activación física, Manejo del craving); paneles «Recursos de aprendizaje» (guías, lecturas, audios) y «Estrategias que funcionan» (cuatro filas); panel rojo «Si ahora lo necesitas» con «Buscar ayuda ahora»; panel «Tu plan de apoyo» con progreso en tres pasos.
- **Prioridad:** sin asignar; **no** desplaza MKT-PR-01D, BETA-01D.3, UX-BOOT ni WEB-02.

##### Propuesta de MVP (SUP-01B + SUP-01C; sin backend)

- Ruta `support` dentro de `soma2Pages` (`/preview/support` y `/app/support`), mismo componente; sin datos de usuario, por lo que DEMO y LIVE se comportan igual (DEMO muestra `DemoNotice`). Ya cubierta por el `noindex` de `/preview/*` y `/app/*`.
- Entrada en «Más» (escritorio y móvil) con id `apoyo`; el dock móvil sigue en cinco huecos. Enlace desde Inicio solo como decisión aparte. El id `ayuda` ya es Feedback («Ayuda y sugerencias»).
- Página sin pestañas: `RecoveryHero` (sin promesas en el texto) → herramienta de respiración guiada funcional → «Comprender lo que pasa» con enlaces a contenido ya publicado (Explorar, misiones) → panel «Si necesitas ayuda ahora» solo con texto seguro y sin números hasta su verificación.
- **Fuera del MVP:** atención plena, activación física y manejo del craving (sin tarjetas falsas ni «próximamente» clicable); catálogo de estrategias; audios; plan personal; recursos telefónicos sin verificar; ilustraciones del mockup (no existen como assets; se usan iconos `lucide-react`).
- **Privacidad:** sin almacenamiento, sin telemetría, sin llamadas nuevas a la API, sin permisos, sin registrar el uso de herramientas, sin XP ni medallas por usarlas.

##### Fases

| Fase | Alcance | Dependencias |
| --- | --- | --- |
| **SUP-01A** (completado, aprobado) | Análisis del mockup, definición funcional, integración, MVP, riesgos. | — |
| **SUP-01B** (completado, PR #113) | Página base, ruta, entrada en «Más», hero, textos ES/EN, panel de ayuda sin números, enlaces a contenido publicado. | Decisiones del propietario (abajo). Tests de navegación (`shell-base.test.ts`) actualizados. |
| **SUP-01B.1** (completado, PR #114) | Fidelidad visual al mockup: cuatro herramientas, tres tarjetas de recursos, estrategias, ayuda y plan personal, sin controles ficticios. | SUP-01B. |
| **SUP-01C** (completado y publicado, PR #115) | Respiración guiada: 4 s de inspiración y 6 s de espiración, sin retenciones, iniciar/pausar/reiniciar, texto accesible, `prefers-reduced-motion`, pausa al ocultar la pestaña, limpieza de temporizadores, aviso de detenerse ante malestar o mareo. | SUP-01B. |
| **SUP-ASSET-01** (publicado, PR #116) | Siete ilustraciones propias en las tarjetas de herramientas y recursos, con WebP 768 px; sin cambiar la lógica de SUP-01C. | PNG del propietario; script local `optimize-sup-asset-01.mjs`. |
| **SUP-01D-A** (completado) | Diagnóstico: estrategias como fichas propias de Apoyo (opción B); sin reutilizar consejos; `relapse` fuera de B1. | Decisión del propietario. |
| **SUP-01D-B1** (aprobado editorialmente para integración; sin validación clínica) | Tres fichas ES/EN (`stress.pause`, `habits.small-routines`, `emotions.naming`) en `docs/review/support/`. | Fuentes + B1-FINAL + correcciones menores B2. |
| **SUP-01D-B2** (completado y desplegado, PR #117) | Catálogo tipado, `?strategy=`, UI de lectura, enlace a respiración, tests. | B1 aprobado; publicado. |
| **SUP-01E1-A** (investigación aprobada) | Inventario y diseño de recursos externos oficiales. | `docs/review/support/sup-01e1-a-research.md`. |
| **SUP-01E1-B** (implementación local; pendiente de revisión) | Panel de ayuda: selector España/Otros; 112, 024, PNSD, Find A Helpline. | Sin geo-IP ni persistencia; sin Fad/SIOF. |
| **SUP-01E2** (pendiente) | Plan personal (estrategias y contactos de confianza). | Decisión de producto, evaluación de privacidad (datos de terceros y de salud), modelo de persistencia, consentimiento, actualización de textos legales. Sin contacto automático ni notificaciones. |
| **Prevención de recaídas** (pendiente) | Contenido de categoría `relapse` (fuera de B1). | Alcance, evidencia y seguridad propios. |

##### Decisiones del propietario

- **Aprobadas (SUP-01B):**
  - Rutas `/preview/support` y `/app/support`.
  - Página «Apoyo y herramientas» y etiqueta «Apoyo».
  - Acceso inicial solo desde «Más».
  - «Ayuda y sugerencias» sin cambios.
  - Hero fotográfico con `nature-11`, imagen definitiva y exclusiva de la sección (sustituye a `nature-3`, propuesta inicialmente).
  - ES/EN, sin backend ni almacenamiento.
  - Cambio en `LegalDocumentPage` para el ancla de urgencias.
- **Aprobadas para SUP-01C (publicadas, PR #115):**
  - Ritmo inicial: 4 s de inspiración y 6 s de espiración, sin retenciones.
  - Sin ritmo alternativo en la primera versión.
  - Controles: comenzar, pausar y reiniciar. Sin duración obligatoria.
  - Ejercicio opcional, que se presenta como adaptable al ritmo natural de cada persona.
  - Indicación de detenerse si aparece mareo o incomodidad.
  - Sin backend, almacenamiento ni seguimiento.
- **SUP-01C — publicado (PR #115; despliegue confirmado por el propietario):**
  - Modelo puro con reloj monotónico, hook `useSyncExternalStore`, pausa al ocultar la pestaña, animación del círculo anclada al reloj, `prefers-reduced-motion`, región en vivo solo con la fase, ES/EN. Las otras tres herramientas siguen «Prevista».
- **SUP-ASSET-01 — publicado (PR #116; merge `be03918`):**
  - **Alcance:** sustituir iconos Lucide y halos provisionales por las siete ilustraciones del propietario en las tarjetas de herramientas y de recursos. Sin nuevas funcionalidades.
  - **Archivos:** PNG maestros intactos en `apps/web/public/images/support/` (1536×1024). Un WebP 768×512 por imagen (calidad 86, ImageMagick), generado con `apps/web/scripts/optimize-sup-asset-01.mjs`. Una sola variante responsive: las tarjetas no superan ~360 CSS px de ancho.
  - **Asignación:** respiración → `support-breathing`; atención plena → `support-mindfulness`; activación → `support-activity`; craving → `support-craving`; procesos → `support-learning`; lecturas → `support-reading`; audios → `support-audio`.
  - **Componente:** `SupportIllustration` (`<picture>` + WebP, `alt=""`, dimensiones 768×512, `loading` lazy salvo herramientas above-the-fold). Mapas centralizados en `support-visuals.ts`.
  - **Respiración:** en reposo la ilustración es protagonista; en activo/pausado baja a opacidad 0,2 y el círculo funcional queda encima. Misma caja `aspect-[8/5]` en los tres estados (salto de altura 0). Sin cambios en el modelo temporal, controles, visibilidad ni movimiento reducido.
  - **Responsive:** rejilla de herramientas sin cambio (`sm:2` / `xl:4`). Miniaturas laterales en móvil con `items-start` para respetar la relación de aspecto. Sin botones recortados a 1024 px.
  - **Tests:** asignación de las siete imágenes, existencia de PNG/WebP, rutas; DEMO/LIVE; ES/EN; respiración intacta.
- **SUP-01D-A — diagnóstico completado:** estrategias como fichas propias de Apoyo (opción B); sin reutilizar el catálogo de consejos; prevención de recaídas fuera de B1.
- **SUP-01D-B1 — aprobado editorialmente para integración (sin validación clínica):** tres fichas ES/EN en `docs/review/support/`; `contentVersion: 0.1.0`.
- **SUP-01D-B2 — completado y desplegado (PR #117; merge `e21be40`):** tres fichas ES/EN; `?strategy=`; relapse «Prevista».
- **SUP-01E1-A — investigación aprobada:** `docs/review/support/sup-01e1-a-research.md`.
- **SUP-01E1-B — implementación local (sin commit/push/PR/despliegue en este hito):** allow-list `ext.es.112`, `ext.es.024`, `ext.es.pnsd.ayuda-cerca`, `ext.int.iasp.find-a-helpline`; selector de cobertura España/Otros sin persistencia; panel «Si necesitas ayuda ahora» extendido.
- **Pendientes:**
  - Revisión técnica y autorización de publicación de SUP-01E1-B.
  - Prevención de recaídas (categoría `relapse`).
  - Enlace desde Inicio.
  - Si SUP-01E2 se plantea en algún momento.

- **Criterio (MVP):** la página abre en DEMO y LIVE desde «Más», la respiración guiada funciona sin conexión a la API y sin guardar nada, no hay tarjetas que aparenten funciones inexistentes ni números sin verificar, y los textos ES/EN no prometen resultados ni se presentan como terapia.

#### UX-GLO-01 — Experiencia global (consolidación funcional, visual y responsive)

Este es el hito de consolidación UX de Soma 2.0. **No** reabre ni sustituye **UX-01** (orientación anatómica).

- **Objetivo:** Revisar coherencia de Inicio, Recuperación, Explorar, Logros, Bitácora, Misiones, XP, Configuración y Feedback. Evitar navegación duplicada y pantallas innecesarias. Comprobar que la experiencia es **cómoda** en cada formato, no solo que «no desborda».
- **Prioridad:** P3 residual (regresiones; no reabrir el barrido). Ya no es la prioridad inmediata. **UX-PRE-BETA** es histórico de apertura (cerrado); no un segundo UX-GLO-01.
- **Estado:** Completado e integrado en `main` (`db6385b`, squash PR #79). Atlas 2.0, a11y de auth/onboarding/cuenta/bitácora, idioma del documento ES/EN, skip-link, dock móvil. GLO-04 (XP en Cuenta) se cerró **sin cambios**. LIVE teclado/lector de pantalla de punta a punta: no reauditado aquí.
- **Formatos a comprobar:**
  - Móvil vertical
  - Móvil horizontal
  - Tablet vertical
  - Tablet horizontal
  - Escritorio
- **Superficies a revisar:** navegación, formularios, botones, modales, estados de carga, errores, accesibilidad y coherencia de componentes.
- **Dependencias:** FBK-01 cerrado. SHELL-01 / GAME-DESIGN-01 (cinco huecos móviles). VIS-01 sigue siendo pulido de la figura de Inicio y **no** se mezcla. GAM-03 y ONB-01 **no** bloquean este barrido de lo ya existente.
- **Decisiones confirmadas:** No competición entre usuarios. No segundo sistema de navegación. No penalizar recaídas con pérdida de XP, niveles o medallas. Corregir bloqueos de uso (controles tapados, teclado, scroll) antes de la beta; el pulido no crítico puede quedar residual.
- **Pendiente de diseño:** Lista viva de incidencias por formato. Expedición (GAME-07) **entra por «Más»**, no por el dock de cinco (**cumplido** en `shell-base.ts` y QA DEMO).
- **Criterio:** Un usuario nuevo puede completar los recorridos principales en los cinco formatos sin controles inaccesibles ni sensación de interfaz «a medias». No hay dos galerías de logros ni dos diarios.

#### CLEAN-01 — Retirada de rutas y componentes heredados

- **Objetivo:** Inventariar y retirar rutas y componentes de Soma 1.0 que ya no deban ser accesibles, sin romper las funcionalidades vigentes de Soma 2.0.
- **Prioridad:** P3 residual (regresiones; la apertura ya ocurrió)
- **Estado:** Completado e integrado en `main` (`ca3b456`). LEG-01 (`/achievements` → `/app/achievements`) ya cubría una redirección puntual.
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
- **Estado:** Documentado. Publicación en tiendas **pospuesta**. **No** iniciar implementación. **No** es requisito de la beta pública. **No** es **PWA-01** (PWA-01 es instalación desde el navegador; MOB-01 es ficha de tienda / binario nativo). La entrega PWA Android **no** abre Play Store.
- **Tecnología:** Capacitor queda como **alternativa preliminar**, no como decisión irreversible. Cualquier empaquetado se reevaluará cuando este ID se autorice.
- **Dependencias:** Beta pública usable (BETA-01). No bloquea ni es bloqueado por CHR-01 / ONB-01 salvo copy de tienda.
- **Criterio (cuando se autorice, no ahora):** un artefacto instalable coherente con las funciones reales; sin promesas clínicas ni APK paralelo no gobernado.

#### MKT-01 — Producto, identidad profesional y marketing

- **Objetivo:** Preparar la visibilidad de Soma y la identidad pública del proyecto **después** de abrir la beta (BETA-01). ONB-01 ya estará previsto **antes** de la beta; MKT-01 **no** espera el tutorial como requisito futuro distinto.
- **Prioridad:** P3 / posterior (comunicación). Elegible **después** de la apertura (ya ocurrida). No desplaza D.3 ni PWA-01D.
- **Estado:** Parcial. **MKT-01C** (medición básica) **Completado** (2026-11-12). Canales, campañas, perfiles y estrategia de contenidos: **pendiente**. **No** crear cuentas ni publicaciones desde este archivo. **No** iniciar campañas automáticas. Este documento **no** autoriza publicaciones ni cambios automáticos de perfiles.
- **Secuencia vigente:** apertura ya hecha → **MKT-01C** cerrado → resto de MKT-01 cuando se autorice. No crear cuentas ni publicaciones en un sync documental.
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

##### MKT-01C — Medición básica de visibilidad

- **Objetivo:** Medir la visibilidad pública de Soma **sin** instrumentar la SPA ni recoger rutas internas de recuperación.
- **Prioridad:** P3 (cerrado en este alcance)
- **Estado:** **Completado** en su alcance de medición básica (2026-11-12). No hay código de analítica en el producto.
- **Hecho (cierre):**
  - Impresiones y clics orgánicos: **Google Search Console**.
  - Alcance, interacciones y clics de redes: **Instagram** y **LinkedIn** (estadísticas de cada plataforma).
  - Revisión **semanal** de esos indicadores.
  - **Cloudflare Web Analytics descartado:** el beacon puede transmitir rutas internas en cierre u ocultación de página, incluso con `spa: false`.
  - **Cloudflare HTTP Analytics** no registra tráfico mientras el dominio esté en **DNS only**.
  - Se mantiene **DNS only**; no se cambia infraestructura.
  - No se añaden herramientas de analítica, píxeles publicitarios ni seguimiento de usuarios.
- **Limitación aceptada:** no hay medición consolidada de visitantes únicos ni de conversiones internas (registro, DEMO, LIVE).
- **Criterio:** visibilidad orgánica y de redes observable sin beacon ni píxeles. Cumplido en este recorte.

#### MKT-PR-01 — Comunicación a prensa

- **Objetivo:** Dar a conocer la beta pública de Soma a medios, con mensajes alineados con funciones **reales** y sin afirmaciones clínicas.
- **Prioridad:** P2 (seguimiento).
- **Estado:** En curso. Dos rondas enviadas; seis medios contactados en total.
  - **Primera ronda — enviados:** VIA Empresa, NacióDigital, El Referente.
  - **Segunda ronda — enviados:** Genbeta, Salud a Diario, Xataka.
- **MKT-PR-01D — Seguimiento:** **en curso** sobre los seis medios.
  - **El Referente:** respondió con un requisito editorial: piden una sociedad constituida / CIF. SOMA es una iniciativa individual (persona física). Se envió una respuesta aclaratoria; queda pendiente su posible contestación. **No** es un rechazo ni una aceptación.
  - Resto de medios: sin respuesta registrada. **No** hay cobertura editorial confirmada.
- **Dependencias:** BETA-01 (producto público). Independiente de **MKT-01C** (medición básica, cerrado).
- **Criterio:** Respuestas y publicaciones registradas solo cuando estén confirmadas.

---

## Calidad y lanzamiento

#### Q-CI — Integración continua

- **Descripción:** Automatizar tests (al menos web + API unit/http) en cada PR a `develop`/`main`.
- **Estado:** Residual PostgreSQL **completado y validado** (PR #105, merge `455cdf5`). El hito **no** está cerrado del todo: quedan scripts raíz, cobertura y **Q-05**. **Q-E2E** es un hito aparte (pendiente). `ci.yml` job `check`, PRs a `develop` y `main`. Postgres 16 efímero, `migrate deploy`, seed, `test:pg`; skips TAP o suite vacía fallan el job.
- **Prioridad:** P2 residual (cobertura / **Q-05**). Siguiente trabajo de calidad junto a **Q-OBS**; no desplaza D.3.
- **Evidencia (2026-11-10, Actions, propietario):** 329 tests API, 968 web, 115 PostgreSQL; 0 fallos, 0 skips. Deadlock `40P01` en init concurrente de `UserProgression` corregido en `5eaa05c` (mismo PR).
- **Evidencia previa (2026-10-30):** `ci.yml` y `database-backups.yml`. Root sin `test`/`lint` globales. Eso **sigue** (no cerrado por el PG).
- **Diagnóstico 2026-11-12 (Q-OBS / Q-05):**
  - Disparadores confirmados: `pull_request` hacia `develop` **y** `main` (desde `ce72761`). PR #110 → `main` ejecutó el job en verde. **No** hay `push`; un push directo a una rama no lanza CI.
  - Cubierto: typecheck API/web, `prisma validate`, unitarios API (todo `src` salvo `*.pg.*`), tests web (154 archivos, todos dentro de las raíces del runner) y PostgreSQL efímero.
  - **Fuera de CI:** ESLint (49 errores y 12 avisos previos en web, mayoría reglas `react-hooks` de estilo; no hay fallo funcional demostrado). `vite build` (lo ejecuta Render al desplegar). Los 82 tests de `packages/shared-types` están en CI desde **Q-05** (PR #111, paso en verde en Actions).
- **Dependencias:** Ninguna de producto.
- **Criterio:** Un PR muestra checks verdes o fallo explícito de test; no se exige cobertura 100 %. **Cumplido** para typecheck, unitarios, web y PG.

#### Q-E2E — Pruebas de navegador de recorridos críticos

- **Descripción:** Cubrir DEMO recovery/explore y, cuando se autorice un entorno, login→`/app` (sin datos reales de producción).
- **Estado:** Pendiente (no hay Playwright/Cypress de proyecto)
- **Prioridad:** P2
- **Evidencia:** Tests web mayoritariamente de contrato de fuente. AUTH-01/LIVE-01 son el humo manual previo.
- **Dependencias:** AUTH-01 (definir el recorrido). No instalar dependencias hasta autorización de implementación.
- **Criterio:** Al menos un flujo DEMO y un flujo auth de staging pasan en CI o script documentado.

#### Q-OBS — Errores y observabilidad

- **Descripción:** Gestión visible de errores de cliente y telemetría mínima de API (hoy `Logger` Nest + `GET /health`; no Sentry ni ErrorBoundary).
- **Estado:** **Completado y desplegado** (2026-11-12): PR #111 (producto `36a7da4`, merge `35a9b11`), despliegue confirmado por el propietario; el bundle público contiene el fallback. SHA de panel no recopiado. Canal 5xx = logs de Render. Error Boundary raíz añadido (`AppErrorBoundary` en `main.tsx`, envolviendo `AuthProvider`, `AchievementSyncProvider` y `App`). La gestión de errores de API por pantalla no cambia. Sin telemetría.
  - Fallback ES/EN («Algo ha salido mal» / «Something went wrong») con `SomaMark`, fondo azul oscuro, `h1`, texto y botón «Recargar página» / «Reload page». No muestra el mensaje ni el *stack* de la excepción. Los textos salen de `common.errorBoundary` en los JSON de locales, sin depender de `I18nextProvider`; el idioma se toma de la instancia `i18next`, después de `<html lang>` y del navegador.
  - Tests: 8 en `src/components/app-error-boundary.test.ts` (raíz añadida al runner web). Verificación en Chromium (`vite preview`) forzando un error real de render en Bitácora: aparece el fallback ES y EN (375 px), sin el mensaje interno; el botón recarga y la página vuelve a funcionar.
- **Prioridad:** P2 (prioridad de calidad inmediata; **no** P0 ni P1 evidenciado)
- **Evidencia:** `health.controller.ts`; Recovery tiene UI `loadError`; no hay `@sentry` ni filtro global Nest.
- **Diagnóstico 2026-11-12:**
  - **API — suficiente para el criterio de 5xx:** `Logger` de Nest por defecto (texto a stdout → logs de Render). Las excepciones no controladas pasan por el `ExceptionsHandler` por defecto, que registra mensaje y *stack* y responde un 500 genérico. Logs de dominio sin datos sensibles (ids, categorías y nombres de error; destinatario y URL de reset ocultos en producción). `GET /health` comprueba PostgreSQL (`SELECT 1`). No hay id de petición ni log de acceso; no hay alertas versionadas (no hay `render.yaml`). Retención y alertas del panel Render: **no** verificadas desde el repositorio.
  - **SPA — falta el Error Boundary:** no existe ninguno (`main.tsx` monta `AuthProvider` → `App` sin barrera). Un error de render desmonta toda la app y deja el fondo oscuro sin mensaje. No se ha observado ningún caso; es la carencia exacta frente al criterio. Los errores de red sí se convierten en estados de error por pantalla (Recovery, Bitácora, Misiones, Feedback, Onboarding, Login). Sin `console.*` en producción (solo un `console.debug` limitado a dev).
- **Mínimo para cerrar:** un Error Boundary raíz con mensaje ES/EN y botón de recarga; sin envío de datos a terceros (**hecho**, PR #111). Cerrado con «canal 5xx = logs de Render».
- **Fuera de alcance (P3):** ids de petición, logs JSON, Sentry, monitor externo de disponibilidad.
- **Dependencias:** Ninguna de herramienta para el mínimo. Ausencia de P0 en una auditoría **no** prueba observabilidad suficiente.
- **Criterio:** Fallos de API en LIVE no dejan pantalla en blanco sin mensaje; existe un canal acordado para errores 5xx (log o servicio).

#### Q-05 — Pruebas de `recovery-math`

- **Descripción:** `packages/shared-types/src/recovery-math.test.ts` existe y no está en un script `test` del paquete (`package.json` solo `build`/`clean`).
- **Estado:** **Completado y desplegado** (2026-11-12): PR #111 (producto `36a7da4`, merge `35a9b11`). En Actions, el paso «Shared types tests» pasó en verde sobre `36a7da4` (API pública de GitHub).
  - `packages/shared-types/package.json`: script `"test": "tsx --test src/*.test.ts"` y `tsx` `^4.21.0` como devDependency (misma versión 4.21.0 ya resuelta en el lockfile; solo cambia la entrada del importador).
  - `pnpm --filter @soma/shared-types test` desde la raíz: 9 archivos, **82/82** OK.
  - `ci.yml`: paso «Shared types tests» justo después de «Build @soma/shared-types». Disparadores sin cambios (PR a `develop` y `main`).
  - Tests y cálculos de `recovery-math` sin cambios.
- **Prioridad:** P2
- **Evidencia:** Archivo de test en disco; `packages/shared-types/package.json` sin `test`.
- **Diagnóstico 2026-11-12:** el alcance real es mayor que `recovery-math`: `packages/shared-types/src` tiene **9** archivos de test (`recovery-math`, `temporal-milestone`, `progress`, `missions`, `journal`, `feedback`, `gamification-events`, `legal-notices`, `registration-age`), **82** tests. Ningún script los ejecuta: ni el runner web, ni `test:unit` de la API, ni `ci.yml`; `tsconfig` del paquete los excluye. Ejecutados una vez en local con el `tsx` de la API: **82/82 OK**. Los tests web que tocan `recovery-math.ts` leen el fuente como texto (contrato), no prueban su comportamiento: hoy una regresión del cálculo de curvas no la detecta CI.
- **Mínimo para cerrar:** script `test` en `@soma/shared-types` y un paso en `ci.yml` tras el build del paquete (**hecho**). Cerrado: el paso pasó en Actions (PR #111).
- **Dependencias:** Q-CI (para ejecutarlo siempre).
- **Criterio:** `pnpm --filter @soma/shared-types test` (o el glob raíz) ejecuta `recovery-math.test.ts` en local y en CI.

#### R-SHA — Trazabilidad del commit desplegado

- **Descripción:** Poder comprobar qué git SHA sirve producción (SPA `https://somarecovery.app` y API `https://api.somarecovery.app`) sin inferirlo solo por el copy visible.
- **Estado:** **Cerrado** como procedimiento (2026-11-10). Inventarios en **Publicación (Git ≠ Render)**. Recopia **SPA** 2026-11-11 (`c519bb3`). Recopia **API** post-#105 **pendiente**.
- **Prioridad:** P2 (cerrado; recopia operativa).
- **Evidencia:** panel Render, propietario. **2026-11-10:** SPA `4c67c2b` (PR #103), API `4520530` (PR #101); `main` era `d37a818` luego `455cdf5`. **2026-11-11:** SPA Live `c519bb3` (PR #107) = `origin/main`. API copiada sigue `4520530`; **no** se afirma otro SHA de API. El HTML público **sigue** sin exponer el commit; GitHub Deployments **no** es la fuente. Fechas UTC **no** comunicadas.
- **Dependencias:** Acceso al panel Render. Este roadmap no autoriza cambiar el deploy ni añadir meta/endpoints de diagnóstico.
- **Criterio:** Un operador documenta el SHA de un deploy y coincide con `main` o se explica la diferencia. **Cumplido** para SPA el 2026-11-11. API: diferencia con `main` explicada (sin SHA de panel post-#105).
- **Residual (no reabre el hito):** fecha UTC si el panel la muestra; SHA Live de API tras #105. **No** asumir `455cdf5`, `5eaa05c` ni `c519bb3` como SHA de API.

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
- **Dependencias:** ACH-NOTIF-01 (campana). GAME-07 añadió Expedición en «Más» **sobre** este shell (no lo sustituye).
- **Criterio (histórico, cubierto en código):** rail usable expandido/contraído; móvil sin drawer; bandejas dentro del viewport; Escape y clic exterior.

---

## Trabajo editorial (no publicar automáticamente)

| Carril | Estado | Prioridad | Nota |
| --- | --- | --- | --- |
| Síntomas de abstinencia | Bloqueado por revisión clínica | — | 40 candidatos `pending_clinical_review`; **publicado vacío**; sin UI. `ccef9a3`. Interfaz futura **solo** catálogo publicado |
| Consejos | Bloqueado por revisión clínica | — | `publishedAdviceCatalog = []`; 25 drafts no son UI |
| Evidencia NT | Bloqueado por revisión clínica | — | Catálogos publicados vacíos |
| Neurotransmisores (MVP UI) | Completado y validado DEMO (educativo) | — | 14 perfiles; fase **manual**; avisos alcohol GABA/glutamato fuera de `<details>`. **No** medición individual ni fase por días de abstinencia |
| UX-08 ventanas | Pendiente | P3 | Sin rangos inventados. Baja prioridad editorial |
| UX-09 narrativas | Pendiente | P3 | Cobertura incompleta; no rellenar |

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
8. Soma Expeditions: Expedición propia (**GAME-07**) en `main` y SPA Live `c519bb3` (QA DEMO Chromium). Capítulos (**GAME-08**) pendientes (P3). XP (**GAM-01**), bitácora (**JRN-01**), misiones (**GAM-02**, 14 publicadas), atlas 2.0, GAM-03, CHR-01 y ONB-01 en `main`. DEMO ≠ LIVE. Apertura de beta ejecutada; D.3 jurídica abierta.
9. Naming de GAME-01: la tabla de este roadmap y los nombres frikis de los PNG son **propuestas históricas**, no catálogo a renombrar. Los 106 fisiológicos **no** se renombran.
10. Arte Horizonte / mapa: los PNG no otorgan licencia. Somi (CHR-01) está en `main` (WebP estáticos, solo ONB-01); animación avanzada pospuesta.
11. **GAM-01 residual:** copy público de niveles; fuentes de XP adicionales (exploración). Fórmulas del ledger **cerradas** en `main`. Techo sin Bitácora ≈ 14×12 XP.
12. **JRN-01 residual:** retención/exportación/borrado (detalle GDPR) y nota pública de privacidad.
13. **GAM-02 residual:** catálogo de bienestar y objetivos personales (14 educativas publicadas en `main`).
14. **CHR-01:** cerrado técnicamente en `main`. Animación avanzada pospuesta. Somi solo en ONB-01.
15. **ONB-01 / CHR-01:** en `main`.
16. **UX-PRE-BETA:** **cerrado** (histórico de apertura). Residual en VIS-01, I18N-04, PWA-01D (AUTH-01/LIVE-01 completados). **MKT-01C** cerrado (medición básica). **MKT-PR-01D** (prensa) en curso. Resto de **MKT-01** pendiente (P3). **SEO-01B** cerrado. **GAME-07** en origin y SPA Live. **PWA-01** instalación básica Android/iOS hecha; **PWA-01D** aplazado (sin dispositivo iOS); **MOB-01** pospuesto (tiendas).

Este documento **no** autoriza seeds, commits ni despliegue. Las decisiones ya confirmadas de ACH-01, REC-VIS-01 y ROADMAP-02 están en sus hitos; el resto sigue abierto.

---

## Riesgos y bloqueos

| ID | Riesgo / bloqueo | Estado |
| --- | --- | --- |
| R-API | Explorar/sustancias depende del API. `/app` autenticado comprobado en local y en producción (AUTH-01/LIVE-01; producción según confirmación del propietario). No forzar `.env` ni seeds. | Mitigado |
| R-CLIN | Publicar síntomas o Consejos sin revisión clínica. | Bloqueado por revisión clínica |
| R-% | Confundir avance de curva con salud recuperada. | Mitigado en DEMO (UX-04); pendiente con usuarios LIVE |
| R-CAL | Reutilizar 1–7/8–56/57+ como calendario clínico. | Pendiente (guardrails; catálogo educativo vacío) |
| R-NT | NT no son medición. SPA Live `c519bb3` (2026-11-11). Ilustraciones NT siguen PNG. | Producto educativo OK |
| R-DUP | Duplicar párrafos NT como lista de síntomas. | Mitigado en catálogo; falta UI de síntomas |
| R-I18N | DEMO/Logros en ES con UI EN. | Mitigado en Inicio, Recuperación, Logros 2.0 (PR #60), Explorar (PR #61) y atlas (PR #68). LEG-01 redirige |
| R-GAME | Rankings, rachas obligatorias o XP que castigue recaídas / inactividad. | Mitigado en GAM-01 (`main`). Techo bajo sin Bitácora (14×12 XP): diseño futuro, no racha |
| R-LOG | Nota de privacidad / retención detallada de Bitácora. | Residual GDPR. **JRN-01R** en API Live `4520530` (PR #101) |
| R-JXP | Carrera en `UserProgression.upsert`. | **Cerrado en `main`** (`a26585e`, PR #78). **No** es GAM-03 |
| R-PREV | Confundir Preview (`/preview`) con LIVE. | I18N-JOURNAL-01-FIX cancelado. Preview no se iguala a LIVE sin autorización |
| R-NAV | Ocho destinos en mockups vs cinco huecos del bottom nav. | Mitigado en NAV-01 (Más). GAME-07 añade Expedición en «Más», no en el dock |
| R-MIX | Mezclar % temporal con % de curva, o conocimiento con perseverancia. | Mitigado en copy UX-04 + GAME-02/07; vigilar implementación |
| R-ART | Sustituir visor anatómico o medallas reales por arte generado de mockup. | Prohibido; visor y catálogo 106 se conservan |

Ninguno de estos es un **incidente P0 evidenciado** en esta auditoría. Eso **no** prueba seguridad, cumplimiento jurídico ni cobertura LIVE completas.

---

## Próximos pasos (por dependencia)

0. **Q-05 + Q-OBS:** completados y desplegados (PR #111). Q-E2E aparte (no instalar Playwright sin autorización).
1. **MKT-PR-01D:** seguimiento de prensa (seis medios; El Referente pendiente tras la aclaración sobre CIF; sin cobertura confirmada).
2. **BETA-01D.3:** **en revisión**. C1–C3 desplegados (BETA-01D.3-FIX, PR #112). C4 aplazado. Revisión jurídica profesional de los puntos abiertos (identificación y domicilio en primer lugar).
3. **UX-BOOT:** análisis opcional de la espera inicial del backend (sin cambiar autenticación en el análisis).
4. **WEB-02:** solo si hay necesidades reales.
- **Aplazado:** **PWA-01D** (pruebas Safari/iOS sin dispositivo; no bloquea la beta). **WEB-01** / **WEB-01-FIX** / **UX-POLISH** integrados y desplegados (PR #108, #109, #110).
- **En paralelo:** **BETA-01D.3** validación jurídica formal (responsable, proveedores, transferencias), en revisión; los avisos `published` **no** están revisados por un jurista en este documento. **R-SHA recopy API:** falta SHA Live de API tras #105 (no inventar). **AUTH-01 / LIVE-01** completados: no se reproponen.
6. **JRN-01R / BETA-COPY-01:** en `main` (PR #101) y API inventario `4520530`. Preview ≠ LIVE.
7. **GAME-07 / IMG-PERF-01B:** integrados y SPA Live; residual Safari / LIVE / NT PNG (opcional).
8. **XP sin Bitácora / GAM-02 bienestar / UX-11–12 / GAME-08 / WEB-02 / resto de MKT-01:** P3 o diseño, no el siguiente código. **SEO-01B** y **MKT-01C** cerrados.
9. **ACH-REV residual:** fecha errónea. Bloquea GAME-08.
10. **UX-08 / UX-09** y síntomas: revisión clínica humana. Baja prioridad; **no** inventar.
11. **VIS-01, I18N-04, FBK-02.** Q-CI: PG en Actions (PR #105); residual cobertura / scripts raíz / Q-05.

---

## Hitos recientes (histórico)

### Neurotransmisores

| Campo | Valor |
| --- | --- |
| Estado | En `main` (PR #49, `2ca8004`). Observado en DEMO producción. En SPA Live `c519bb3`; LIVE `/app` no reauditado aquí. **No** revisión clínica |
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
| #75 | SEO-01A fundamentos | En `main` (vía trenes posteriores a `cdf038c`) |
| #76 | REL-01 develop→main | Squash en `main` (`8155554`). Superado por merges hasta `c519bb3` |
| #77 | FBK-01 | En `main` |
| #78 | R-JXP | En `main`. Cerrado |
| #79 | UX-GLO-01 | En `main` |
| — | CLEAN-01 | En `main` (`ca3b456`) |
| #82 | WEB-01 | En `main` |
| #83 | Registro / privacidad | En `main`. Invite/open en código; env del host no verificado |
| #84 | CI | En `main`. Checks entonces solo en PRs a `develop`; ampliado a PRs a `main` en `ce72761` (2026-11-02), confirmado con PR #110 |
| #85–#86 | Backups R2 / PG17 | En `main` |
| #92 | FAV-01 | En `main` |
| #93 | SEO-01A refuerzo | En `main` |
| #94 | BETA-02A/B primer arranque | En `main` |
| #95 | BETA-02C onboarding/journal/auth | En `main` (`0b032a8`) |
| #96 | GAM-02 / GAME-05: 14 misiones | En `main` (`68c8649` / merge `d23e587`) |
| #97 | UX-REC-01 | En `main` (`4ca43af`) |
| #98 | I18N-JOURNAL-01 | En `main` (`e04e3aa`). Merge `42594a0` |
| #101 | JRN-01R + BETA-COPY-01 | En `main` (`4520530`). API inventario Live 2026-11-10 |
| #103 | PWA iconos / splash | En `main` (`4c67c2b`). Superado por SPA Live `c519bb3` |
| #105 | Q-CI PostgreSQL | En `main` (`455cdf5`). SHA API Live de ese deploy **no** copiado |
| #106 | GAME-07 / 07F / IMG-PERF-01A | Merge `f27cc2e`. SPA Live `c519bb3`. QA DEMO Chromium |
| #107 | IMG-PERF-01B | Merge `c519bb3`. SPA Live. QA DEMO Chromium |

---

## Plan de trabajo detallado

```
Síntomas / Consejos
  → catálogo publicado vacío
  → revisión clínica humana
  → ingestión al catálogo público (otro hito; no automática)
  → UI que solo lee lo publicado

AUTH-01 + LIVE-01 (completados: local + producción según propietario)
  →  I18N-2.0 (PR #60) + ANAT-I18N-01 (PR #68)
  → UX-12  →  UX-11 (autorización de reglas)
  → ACH-REV residual (fecha errónea) antes de cualquier revocación
  → ACH-NOTIF-01 / ACH-CELEB-01 / SHELL-01 (main + validado LIVE producción)
  → I18N-04 (selector banderas; no implementar aún; no nuevos idiomas)

Soma Expeditions (dirección visual OK; en `main` `c519bb3` + SPA Live)
  Fase A–E  GAME-01–03, NAV, Explorador, EXP-EDU, REC-VIS, ACH-01, JRN-01, GAM-01 — en `main`
  Fase C    GAME-07 Expedición (mapa + nav Más) — PR #106; SPA Live; QA DEMO Chromium
            GAME-07F + IMG-PERF-01A con #106; IMG-PERF-01B PR #107
            Residual: Safari / PWA standalone / LIVE `/app`
  Fase D    Atlas 2.0 UX-GLO-01 — en `main`
  Fase E    GAM-02: 6 (PR #74) luego 14 (PR #96) — en `main`
  Fase E2   REL-01 y trenes #77–#107 hasta `c519bb3`
  Fase F    GAM-03, CHR-01, ONB-01, BETA-02, avisos `published` — en `main`
            BETA-01D.3 jurídica — **en revisión** (comprobación puntual 2026-11-12; C1–C3 en local, sin publicar)
            AUTH-01 / LIVE-01 — completados (local + producción según propietario)
            PWA-01 instalación Android/iOS hecha; PWA-01D **aplazado** (sin dispositivo iOS). R-SHA procedimiento cerrado. SPA Live recopiada `c519bb3`. API copiada `4520530`; recopia post-#105 pendiente. Q-CI PG en Actions (PR #105). JRN-01R + BETA-COPY-01 (PR #101)
  Fase G    WEB-01 + WEB-01-FIX (PR #108, #109) → UX-POLISH (PR #110) → Q-05 + Q-OBS (PR #111) — desplegados
            MKT-PR-01: 2 rondas / 6 medios; MKT-PR-01D seguimiento en curso (El Referente: CIF)
            WEB-02 → resto de MKT-01 → FBK-02  (P3 / cuando se autorice)
            SEO-01B y MKT-01C — cerrados (2026-11-12)
  MOB-01    pospuesto (Play/App Store; ≠ PWA-01)
  GAME-08   tras ACH-REV residual (P3)

UX-08, UX-09  →  editorial con fuentes; sin inventar; P3

Q-CI: PG validado (PR #105); PR a develop y main; Q-05 shared-types en CI (PR #111); residual ESLint / scripts raíz
Q-E2E pendiente; Q-OBS Error Boundary (PR #111; desplegado)
R-SHA: SPA `c519bb3` (2026-11-11); API `4520530` (2026-11-10)
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
10. Conservar `UX-01`–`UX-12`; los IDs nuevos (AUTH, LIVE, I18N-01–04, I18N-JOURNAL-01, ACH-REV, ACH-NOTIF-01, ACH-CELEB-01, ACH-01, REC-VIS-01, SHELL-01, GAME-DESIGN-01, GAME-01–08, GAME-07F, EXP-EDU-01, IMG-PERF-01A, IMG-PERF-01B, JRN-01, JRN-01R, GAM-01–03, CHR-01, CHR-01A, CHR-01B, ONB-01, WEB-01–02, SEO-01, SEO-01A, SEO-01B, FAV-01, REL-01, FBK-01–02, BETA-01, BETA-COPY-01, BETA-02A/B/C, UX-GLO-01, UX-PRE-BETA, UX-REC-01, CLEAN-01, PWA-01, PWA-01A–D, MOB-01, MKT-01, MKT-01C, MKT-PR-01, MKT-PR-01D, UX-POLISH, UX-BOOT, SUP-01, Q-*, VIS, LEG, R-SHA, R-JXP) no los sustituyen. `GAM-*` ≠ `GAME-*`. **GAME-07** = Centro de Expedición, no misiones. `UX-GLO-01` ≠ `UX-01` ≠ `UX-PRE-BETA`. **PWA-01** ≠ **MOB-01**. **FAV-01** ≠ manifest PWA. **MKT-01C** ≠ el resto de MKT-01.
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
| 2026-11-02 | **ROADMAP-SYNC** (ROADMAP-AUDIT). `main`=`develop`=`42594a0`. Beta pública (README); avisos `published`. 14 misiones (PR #96). CHR-01, ONB-01, BETA-02, UX-REC-01, I18N-JOURNAL-01 en `main`. GAME-07 pendiente. SHA Render no verificado. I18N-JOURNAL-01-FIX cancelado (Preview). Sin commit de este sync. |
| 2026-11-10 | **PWA-01** añadido (A–D), pendiente. Diagnóstico: sin manifest, sin SW, FAV-01 no basta para instalar. Prioridad de producto tras **JRN-01R** (PR #101 → `main` `4520530`). MOB-01 sigue siendo tiendas, no PWA. Sin implementación. Sin commit de este sync. |
| 2026-11-10 | **PWA-01A** aprobada. **PWA-01B** implementado en local: manifest SOMA, `start_url` `/`, iconos 192/512 desde `soma-favicon.png`, metas iOS, **sin** SW ni dependencias nuevas. C/D pendientes. Sin commit. Sin deploy. |
| 2026-11-10 | **PWA-01A/B** commit local autorizado: implementados y validados técnicamente. PWA-01 sigue **parcial**. C/D pendientes. Instalación Android/iOS real pendiente. MOB-01 pospuesto. **No** publicado. |
| 2026-11-10 | **PWA-01C** implementado en local: «Instalar SOMA» en landing y Cuenta LIVE, diálogo `DetailSheet`, `beforeinstallprompt` diferido, instrucciones iOS/manual, ocultar en standalone, i18n ES/EN. Sin SW. Sin commit. Instalación móvil real **no** verificada. **D** pendiente. **No** publicado. |
| 2026-11-10 | **PWA-01C** revisión final + commit local: `userChoice.accepted` no confirma instalación; éxito con `appinstalled`/standalone; listeners únicos. Validado técnicamente. Instalación Android/iOS real **no** verificada. **D** pendiente. **No** publicado. |
| 2026-11-10 | **PWA-01D** implementación local parcial: iconos any/maskable opacos `#061018` desde `soma-favicon.png`; manifest; CSS crítico en `index.html`. Sin SW. Sin commit. Sin deploy. Sin tocar Render/Cloudflare. Icono Android y primer arranque **no** cerrados. |
| 2026-11-10 | **PWA-01D** commit local: **D-ICON** implementado (pendiente Android real); **D-BOOT** mitigación visual (causa raíz no confirmada). PWA-01 **parcial**. **D** pendiente de QA y cierre. Sin push. Sin deploy. |
| 2026-11-10 | **PWA-01D** QA Android del propietario: instalación Chrome, icono oficial aprobado, primer arranque de instalación nueva **con** estilos, standalone, login, persistencia de sesión, nav, Bitácora LIVE, logout/re-login, control de instalación oculto. FOUC histórico **no** reproducido tras reinstalación; causa raíz **no** confirmada. **iOS no validado.** MIME/CDN no bloqueante. A/B/C desplegados. Entrega Android hecha; PWA-01 **parcial**. **MOB-01** pospuesto. Commit local de este registro. |
| 2026-11-10 | **PWA-01D** iOS BrowserStack Live (iPhone 15 Pro, Safari 17.0, somarecovery.app): landing con estilos; añadir a pantalla de inicio; abrir la app instalada. Dispositivo remoto, **no** iPhone físico propio. Sesión gratuita cortó el recorrido funcional (login, persistencia, Bitácora, logout, control en standalone, icono/estilos en PWA, otras versiones iOS). **D** parcial. PWA-01 **parcial**. Commit local de este registro. |
| 2026-11-10 | **R-SHA** cerrado: panel Render. SPA Live `4c67c2b` (PR #103). API Live `4520530` (PR #101). `origin/main` `d37a818` no es Live. Fechas UTC de deploy no comunicadas. Commit local de este registro. |
| 2026-11-10 | **Q-CI** residual PostgreSQL: PR #105 en `origin/main` `455cdf5`. Actions: 329 API, 968 web, 115 PG; 0 fallos, 0 skips. Deadlock UserProgression `5eaa05c`. Q-05, cobertura, scripts raíz y **Q-E2E** no se cierran. R-SHA sigue cerrado. API desplegada (propietario); SHA Live de ese deploy **no** recopiado. Commit local de este registro. |
| 2026-11-11 | **GAME-07** implementación local completada (`8ee1ee8`): Centro de Expedición, GAME-07F, IMG-PERF-01A. Tests web 999/999; typecheck y build OK; DEMO Chromium. Safari iOS, PWA standalone y LIVE autenticado **pendientes**. Integración remota y producción **pendientes** *en ese momento*. Commit local de este registro. |
| 2026-11-11 | **GAME-07** integrado: PR #106 merge `f27cc2e` (`8ee1ee8` en `main`). |
| 2026-11-11 | **IMG-PERF-01B** integrado: PR #107 merge `c519bb3` (`d24f032`). Catálogo `dependence` (no `process-withdrawal`). |
| 2026-11-11 | Fast-forward `develop` → `c519bb3` (`git merge --ff-only origin/main`; `git push origin develop`). `origin/develop` = `origin/main`. |
| 2026-11-11 | SPA Live = `c519bb3` (panel Render, propietario). QA DEMO Chromium GAME-07 + IMG-PERF-01B. API Live copiada permanece `4520530` (2026-11-10); SHA post-#105 **no** recopiado. |
| 2026-11-11 | **ROADMAP-SYNC-01** (este registro): actualiza estados a git/SPA reales. Cierra UX-PRE-BETA como histórico. GAME-07 / 07F / IMG-PERF-01A/01B integrados y desplegados (DEMO Chromium). BETA-01D.3, LIVE-01, PWA-01D **abiertos**. Sin commit de código. **No** dictamen jurídico. **No** QA iOS/LIVE. |
| 2026-11-12 | **SEO-01B** Completado: GSC, canonical `https://somarecovery.app/`, `robots.txt`/`sitemap.xml`, landing indexada, `noindex` en rutas funcionales (prueba en tiempo real `/reset-password`). URLs antiguas: recrawl. Sin código/SSR/infra. **MKT-01C** Completado (medición básica): GSC + Instagram/LinkedIn, revisión semanal. Cloudflare Web Analytics descartado (`spa: false` no evita rutas internas al ocultar). HTTP Analytics CF inactivo con DNS only (se mantiene). Sin visitantes únicos ni conversiones internas (limitación aceptada). Resto de MKT-01 pendiente. Solo este archivo. Sin commit. |
| 2026-11-12 | **AUTH-01** / **LIVE-01** Completados: validación funcional local (2026-10-25) y en producción según confirmación del propietario (sin fecha ni detalle registrados). No se repiten salvo regresión o cambio funcional relevante. **WEB-01** actualización de landing (funcionalidades actuales + Centro de Expedición, ES/EN, assets existentes): implementada en local, pendiente de revisión/despliegue; tests/typecheck/build OK; revisión visual DEMO Chromium escritorio/móvil. **MKT-PR-01**: dos rondas enviadas (VIA Empresa, NacióDigital, El Referente; Genbeta, Salud a Diario, Xataka); **MKT-PR-01D** en curso, sin cobertura confirmada. Prioridades: WEB-01 → PWA-01D → UX-POLISH → MKT-PR-01D → Q-OBS/Q-05. Sin commit. |
| 2026-11-12 | **WEB-01** (PR #108, merge `99c3985`) y **WEB-01-FIX** (PR #109, merge `7c9fe07`; altura mínima de escritorio, fondos decorativos, legibilidad; tests web 1011) integrados y **desplegados en producción** según el propietario; SHA de panel no recopiado. **PWA-01D** **APLAZADO**: instalación iPhone comprobada; resto de pruebas Safari/iOS sin dispositivo; no bloquea la beta. **MKT-PR-01D**: El Referente pidió sociedad/CIF; aclaración enviada (persona física); ni rechazo ni aceptación. **UX-POLISH** A/B/C implementado en local (pantalla de carga de marca; enlace a Expedición desde Inicio; mención en el paso de navegación de ONB-01, nueve pasos); tests web 1019, typecheck/build OK; **no** desplegado. Prioridades: UX-POLISH → MKT-PR-01D → Q-OBS/Q-05 → BETA-01D.3 → WEB-02 (si procede). Sin commit. |
| 2026-11-12 | **UX-POLISH** A/B/C completado: PR #110 (producto `83556cf`, merge `cf17b47`), CI en verde, desplegado según el propietario; presentación animada del logo conservada (ventana privada); 1019 tests web en el hito. **Diagnóstico Q-OBS / Q-05** (sin cambios de código): CI corre en PR a `develop` y `main`; 82 tests de `shared-types` (9 archivos) fuera de toda ejecución, 82/82 OK en local; ESLint web con 49 errores previos fuera de CI; API registra 5xx con el handler por defecto de Nest en logs de Render; SPA sin Error Boundary. Sin P0 ni P1 evidenciados. Prioridades: MKT-PR-01D → Q-05 → Q-OBS → BETA-01D.3 → WEB-02 (si procede). PWA-01D aplazado. Sin commit. |
| 2026-11-12 | **Q-05** y **Q-OBS** implementados en local (sin commit). Q-05: script `test` en `@soma/shared-types` (`tsx` 4.21.0, ya en el lockfile), 9 archivos / 82 tests OK, paso «Shared types tests» en `ci.yml`; Actions **pendiente**. Q-OBS: `AppErrorBoundary` raíz con fallback ES/EN, sin detalles internos ni telemetría; 8 tests; verificado en Chromium forzando un error de render. Tests web 1027/1027, API unit 329/329, typecheck y build OK. Siguiente: publicar; después MKT-PR-01D → BETA-01D.3 → UX-BOOT (análisis) → WEB-02 (si procede). PWA-01D aplazado. |
| 2026-11-12 | **Q-05** y **Q-OBS** completados y desplegados: PR #111 (producto `36a7da4`, merge `35a9b11`); «Shared types tests» en verde en Actions; despliegue confirmado por el propietario y fallback presente en el bundle público (SHA de panel no recopiado). **BETA-01D.3** en revisión: comprobación puntual de los textos legales ES/EN frente a producción (nombre y correo del responsable inyectados; persona física; beta gratuita sin promesa permanente; carácter educativo; 18+ coherente; registro `open`). Incoherencias documentales: regiones de proveedores «no documentadas» frente a la sección de transferencias; clave `soma.journal.createOp.*` ausente de cookies; redacción interna en texto público. Puntos para jurista registrados en BETA-01. Textos sin modificar. MKT-PR-01D en seguimiento; PWA-01D aplazado. Sin commit. |
| 2026-11-12 | **BETA-01D.3-FIX** (validado en local; commit local, sin push): C1 (regiones remitidas a «Transferencias internacionales»), C2 (`soma.journal.createOp.*` en cookies, con «Alcance» y «Banner» ajustados) y C3 (redacción interna eliminada del aviso legal y la privacidad) en `legal.json` ES/EN; aserciones nuevas en `legal-document.test.ts` (12/12 tests legales OK). Versiones legales **sin cambios** (`2026-10-31.2`): solo se validan en el alta y no hay re-aceptación; subirlas exigiría desplegar SPA y API a la vez. C4 aplazado. Identificación y domicilio del responsable pendientes de asesoramiento profesional. Pendiente de publicación. **SUP-01** (Centro de Apoyo y Herramientas) registrado como propuesta futura, sin iniciar; referencia visual `apoyo-2.0`. Q-05/Q-OBS desplegados (PR #111); PWA-01D aplazado; MKT-PR-01D en seguimiento; UX-BOOT pendiente de análisis. |
| 2026-11-12 | **BETA-01D.3-FIX** completado y desplegado: PR #112 (producto `0349dda`, merge `68ce47e`), CI en verde, despliegue confirmado por el propietario y textos corregidos en el bundle público (SHA de panel no recopiado). BETA-01D.3 sigue en revisión jurídica. **SUP-01A** en análisis (sin código): mockup `apoyo-2.0` analizado; MVP propuesto sin backend (página `support` en DEMO y LIVE desde «Más», respiración guiada local, enlaces a contenido ya publicado, panel de ayuda sin números sin verificar); fases SUP-01B–E2 y decisiones pendientes del propietario registradas en SUP-01. Prioridades sin cambios: MKT-PR-01D → BETA-01D.3 → UX-BOOT → WEB-02. PWA-01D aplazado. Sin commit. |
| 2026-11-12 | **SUP-01A** aprobado. **SUP-01B** implementado en local (sin commit): página «Apoyo y herramientas» en `/preview/support` y `/app/support` con entrada «Apoyo» solo en «Más»; hero con `nature-3` reutilizada; respiración guiada «En preparación», sin acción; cuatro enlaces a artículos publicados de Explorar; panel de ayuda sin teléfonos, con enlace al apartado de urgencias de las condiciones (que ahora desplaza al ancla); namespace `support` ES/EN. QA: tests web 1034/1034; typecheck, build y ESLint de los archivos modificados OK; revisión visual en Chromium (DEMO, ES/EN, 1440/1024/768/375/320 px). LIVE no revisado visualmente. SUP-01C pendiente. Demás hitos sin cambios. |
| 2026-11-12 | **SUP-01B-FINAL** (local, sin commit): hero con `nature-11`, imagen exclusiva aprobada, en lugar de `nature-3`. Registrada en `photo-plate.ts`, con WebP de tamaño completo, 960 y 1600 px generadas con las opciones de IMG-PERF-01A (`--only=nature-11`); PNG sin modificar; `object-position: 62% 55%`. Ancla de urgencias de `LegalDocumentPage` aprobada y comprobada: navegación interna, apertura directa, otras páginas legales sin cambios, sin bucles. Decisiones de SUP-01C registradas: 4 s de inspiración y 6 s de espiración, sin retenciones ni ritmo alternativo; comenzar, pausar y reiniciar; sin duración obligatoria; aviso ante mareo; sin backend ni seguimiento. QA: tests afectados 31/31; typecheck, build y ESLint OK; revisión visual en Chromium a 1440/1024/375/320 px. SUP-01B pendiente de commit y publicación. SUP-01C sin implementar; SUP-01D/E1/E2 sin iniciar. |
| 2026-11-12 | **SUP-01B** completado y desplegado mediante PR #113 (commit `07a83cd`, merge `33dba83`). **SUP-01B.1** (validado en local, pendiente de publicación): fidelidad visual a `apoyo-2.0` en `SupportSections`. Cuatro tarjetas de herramientas (respiración «En preparación»; atención plena, activación física y craving «Prevista»); recursos en tres tarjetas («Procesos clave» y «Lecturas recomendadas» con seis artículos publicados de Explorar; «Audios y meditaciones» no disponible); «Estrategias de apoyo» con cuatro temas previstos sin enlace; panel de ayuda reorganizado con el mismo texto y enlace; panel «Tu plan de apoyo» en desarrollo, sin progreso ni controles. Sin pestañas, imágenes nuevas ni dependencias. Siete ilustraciones del mockup registradas como SUP-ASSET-01 (opcional). QA: suite web 1037/1037; typecheck, build y ESLint OK; Chromium a 1440/1024/768/375/320 px. SUP-01C pendiente; SUP-01D/E1/E2 sin iniciar. |
| 2026-11-12 | **SUP-01B.1** publicado mediante PR #114 (commit `55dd0ae`, merge `f93418e`). **SUP-01C** implementado y validado en local, pendiente de publicación: respiración guiada (4 s de inspiración y 6 s de espiración, sin retenciones) con comenzar, pausar, continuar y reiniciar; reloj monotónico, pausa automática al ocultar la pestaña sin reanudación automática, animación del círculo anclada al reloj, `prefers-reduced-motion`, región en vivo solo con la fase, ES/EN, sin almacenamiento ni red. Las otras tres herramientas siguen «Prevista». Rejilla de herramientas a cuatro columnas desde `xl`. QA: suite web 1061/1061; tests afectados 34/34; typecheck, build y ESLint OK; Chromium a 1440/1280/1024/768/375/320 px; comprobaciones manuales del propietario completadas. SUP-ASSET-01, SUP-01D/E1/E2 pendientes. |
| 2026-11-12 | **SUP-01C** completado y publicado mediante PR #115 (commit `a08eb05`, merge `e5ebd08`); despliegue confirmado por el propietario. **SUP-ASSET-01** implementado y validado localmente, pendiente de publicación: siete ilustraciones del propietario en herramientas y recursos (`SupportIllustration`, PNG 1536×1024 intactos, WebP 768×512 vía `optimize-sup-asset-01.mjs`); en respiración la ilustración cede al círculo durante el ejercicio sin saltos de altura; sin cambios de lógica en SUP-01C. QA: suite web 1063/1063; tests afectados 36/36; typecheck, build y ESLint OK; Chromium a 1440/1024/375/320 px. SUP-01D/E1/E2 pendientes. |
| 2026-11-12 | **SUP-ASSET-01** publicado mediante PR #116 (commit `925b8b3`, merge `be03918`). **SUP-01D-A** diagnóstico completado (fichas propias de Apoyo; sin consejos; `relapse` fuera de B1). **SUP-01D-B1-FINAL**: ajustes editoriales en las tres fichas ES/EN (`docs/review/support/`); `unpublished`; `contentVersion` 0.1.0; pendiente de aprobación final. **SUP-01D-B2**, **SUP-01E1**, **SUP-01E2** y prevención de recaídas pendientes. Sin código de producto, sin publicación de fichas, sin commit. |
| 2026-11-12 | **SUP-01D-B2** (local, sin commit): B1 aprobado editorialmente para integración (sin validación clínica). Correcciones menores: «insomnio»; precauciones de estrés vs valoración urgente; consumo «recurres / está aumentando». Catálogo tipado (`support-strategies.ts` + `support-strategy-content.ts`); UI `SupportStrategySheet`; `?strategy=` DEMO/LIVE; relapse «Prevista»; enlace a `#support-breathing`; referencias públicas con notas de verificación parcial. QA: suite web 1070/1070; typecheck y build OK. Pendiente revisión técnica y autorización de publicación. E1/E2/relapse pendientes. |
| 2026-11-12 | **SUP-01D-B2** publicado mediante PR #117 (commit `c06595e`, merge `e21be40`); despliegue según propietario. **SUP-01E1-A** investigación aprobada. **SUP-01E1-B** (local, sin commit): recursos externos 112, 024, PNSD «Ayuda cerca de ti», Find A Helpline; selector España/Otros sin geo ni persistencia; Fad/SIOF excluido. QA pendiente en el informe del hito. E2/relapse pendientes. |
