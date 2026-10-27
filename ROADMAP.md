# Roadmap Soma 2.0

Documento de planificación permanente. Se consulta **antes** de abrir un hito nuevo.  
**No otorga permiso** para commit, push, PR, merge ni despliegue.

Última actualización editorial: 2026-10-26 (dirección visual Expeditions aprobada vía `docs/design/*-2.0.png`; ACH-NOTIF-01 / ACH-CELEB-01 / SHELL-01 validados en producción; GAME-* **no** implementados).
Rama de trabajo: `develop`.
HEAD local al actualizar: `98476900f71c683d5b039d32a81301a844a46fa2` (`fix(web): improve achievement inbox and celebration layout`), alineado con `origin/develop`.
`origin/main`: incluye PR #51 (`5e38b98f643319629c30ab7fe4174a9a071d148c`) y PR #52 (`0a91e3486c37d127e331d2efd1aed58e05466bb4`).

Hay documentación científica y editorial en `docs/` (curvas, 9B Consejos). Eso **no** es este roadmap de producto.

---

## Objetivo y alcance

Soma 2.0 es un compañero **educativo** para explorar la recuperación fisiológica tras el consumo de sustancias: dashboard personal, atlas anatómico, catálogo de sustancias y logros. La línea futura **Soma Expeditions** (gamificación de la recuperación) se documenta más abajo: el usuario es protagonista de una expedición personal; **no** es ranking, clínica ni obligación de uso diario.

No es un dispositivo médico. Las curvas son modelos ilustrativos (`curveProgress` / avance de curva), **no** un porcentaje de salud recuperada ni una medición clínica. No se miden neurotransmisores. Las fases educativas se eligen para comparar; no se calculan a partir de los días de abstinencia salvo que un hito futuro lo autorice con evidencia.

Alcance de contenido canónico actual: cinco sustancias (alcohol, nicotina, cannabis, cocaína, cafeína), 12 sistemas, 21 estructuras, 56 curvas, 106 logros. ES/EN para la interfaz Soma 2.0. Superficies `/preview` (DEMO) y `/app` (LIVE, sesión).

Los **doce requisitos originales** (`UX-01`–`UX-12`) se conservan íntegros (identificadores y criterios). El resto de este documento organiza compromisos recuperados, calidad y trabajo editorial **sin duplicarlos**.

Fuera de alcance hasta autorización: síntomas de abstinencia **publicados**, consejos clínicos, migraciones/seeds, ventanas 1–7/8–56/57+ como evidencia por sustancia, revocación automática de logros.

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

---

## Estado general

| Superficie | Estado |
| --- | --- |
| Producto Soma 2.0 en `develop` / `main` | En desarrollo; `main` incluye PR #49–#52 |
| UX-01 orientación corporal | Completado (PR #45). Orientación exacta en prod no reauditada el 2026-10-25 |
| UX-02 mensajes diarios × 60 | Completado y validado (tests) |
| UX-03 figura móvil | Completado y validado DEMO 320/375/430 |
| UX-04 recuperación DEMO | Completado y validado DEMO (PR #50). LIVE `/app` no retestado |
| UX-05–07 Explorar | Completados y validados DEMO (PR #49). LIVE no comprobado |
| UX-08–09 atlas editorial | Pendiente (contenido / evidencia) |
| UX-10 logros en revisión | Implementado, pendiente de validación |
| UX-11 platino | Pendiente (umbral 0,99 insuficiente) |
| UX-12 secretos y platinos | Parcialmente implementado |
| Neurotransmisores educativos | Publicados como MVP educativo (PR #49). No son mediciones. SHA Render no verificado |
| Síntomas / Consejos | Bloqueado por revisión clínica; catálogos **publicados vacíos** |
| LIVE `/app` | AUTH-01 y LIVE-01 validados funcionalmente **en local** (cuenta sintética). No producción, no staging, no recaídas, no múltiples pestañas |
| ACH-NOTIF-01 campana | Completado y validado (LIVE producción). PR #51 + pulido #52 |
| ACH-CELEB-01 celebraciones | Completado y validado (LIVE producción). PR #51 + pulido #52 |
| SHELL-01 shell autenticado | Completado y validado (LIVE producción). PR #52 |
| Soma Expeditions (GAME-*) | GAME-01, GAME-02, NAV-01 y NAV-02 fusionados en `develop` (`d0c4c78`, PR #53–#56). Sin deploy a producción. GAME-03A implementado, pendiente de integración. GAME-03B/C pendientes |
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
- **Dependencias:** Recorrido LIVE → LIVE-01.

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
- **Evidencia:** Generador: 7 ítems `ruleReview: true` (p. ej. `cocaine-hippocampus-gold-1`, seis VTA de cafeína). `AchievementsPage` muestra `reviewCount` y copy si no hay curva. Falta validar comprensión y que el listado sea obvio. La página legacy `/achievements` no aplica este tratamiento (LEG-01).
- **Dependencias:** I18N-02 (chrome de Logros aún en ES). Validación LIVE.

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

UI selectable: solo ES/EN (`INTERFACE_LANGUAGES`). DEMO validada en ambos para **copy de recuperación** (UX-04). Fallos EN observados en **datos DEMO** y **Logros**.

#### I18N-01 — DEMO que permanece en español con UI inglesa

- **Descripción:** Corregir recuentos (`42 días`), badge DEMO / `demoDisclaimer`, y cuerpos de hitos DEMO cuando el idioma es EN.
- **Estado:** Pendiente (defecto observado en producción 2026-10-25)
- **Prioridad:** P1
- **Evidencia:** `demo-data.ts` (`abstinence`, `demoChanges`); `DemoNotice.tsx` (literal + `demoDisclaimer`). El eje y el selector SÍ usan `recovery.json`.
- **Dependencias:** Ninguna de producto. No mezclar con traducción de ciencia.
- **Criterio:** Con UI EN en `/preview/recovery` e Inicio DEMO, recuentos, disclaimer e hitos están en inglés (o en claves i18n); no hay literales ES en esos puntos. 320/375/430 sin overflow nuevo.

#### I18N-02 — Logros: chrome y catálogo

- **Descripción:** Internacionalizar `AchievementsPage` (hoy «Logros», «Bronce», «Revisión pendiente») y el catálogo mostrado (seed/generador en español).
- **Estado:** Parcialmente implementado (`en/achievements.json` existe; la página Soma 2.0 y el catálogo generado no lo usan de forma coherente)
- **Prioridad:** P1
- **Evidencia:** `AchievementsPage.tsx`; `achievement-catalog.generated.ts` desde seed ES. Home LIVE puede usar `achievements.json`; `/preview/achievements` permanece en ES.
- **Dependencias:** UX-10 (misma pantalla). No cambia reglas de desbloqueo.
- **Criterio:** Con UI EN, filtros, stats, estados y títulos/descripciones visibles siguen EN (o el fallback documentado), incluidos `ruleReview` y secretos.

#### I18N-03 — Textos educativos de Anatomía

- **Descripción:** Las fichas de resumen (`anatomy-education.ts`, `system-education.ts`) están en español; el chrome del atlas sí está i18n.
- **Estado:** Parcialmente implementado
- **Prioridad:** P2
- **Evidencia:** `OrganSheetSummary` usa `education.anatomy`; `anatomy.json` traduce pestañas.
- **Dependencias:** Editorial; no es revisión clínica de nuevo contenido.
- **Criterio:** Con UI EN, el cuerpo de las fichas educativas del atlas está en inglés o se declara explícitamente monolingüe ES (decisión de producto). No inventar fisiología.

#### I18N-04 — Selector visual de idiomas

- **Descripción:** Sustituir las etiquetas visibles ES/EN del selector actual por **banderas circulares**, manteniendo accesibilidad y facilidad de uso. Solo los idiomas de interfaz ya soportados (ES/EN). **No** añadir idiomas nuevos. Coherencia visual con la campana ACH-NOTIF-01 (ya implementada; no reabrirla aquí).
- **Estado:** Pendiente. **No implementar todavía.**
- **Prioridad:** P2
- **Evidencia:** El chrome actual expone `Language: Español` / equivalente EN como texto. Este ID no corrige I18N-01 ni I18N-02 (copy DEMO/logros).
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
- **Estado:** Implementado (comportamiento actual). Política de producto **pendiente**. **No implementar revocación automática** hasta decidir.
- **Prioridad:** P2
- **Evidencia:** `planAchievementUnlocks`, `achievements.service.ts`. Sin tests de recaída/corrección de fecha.
- **Dependencias:** Decisión de producto (sección siguiente). LIVE-01 documenta el hecho; no lo cambia. GAME-08 **espera** esta decisión; no revoca ni altera fechas.
- **Criterio:** Documento de política aprobado (conservar / revocar en recaída / revocar solo en corrección de error / otro) **antes** de cualquier cambio de código. Corregir fechas erróneas y recaer **no** se tratan como el mismo evento.

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

- **Descripción:** Evaluar la página Soma 1.0 (`pages/AchievementsPage.tsx`, `TrophyCard`) frente a Soma 2.0 (`recovery-dashboard/pages/AchievementsPage.tsx`). La legacy no muestra `ruleReview` y colorea tramos en secretos.
- **Estado:** Pendiente (evaluación)
- **Prioridad:** P3
- **Evidencia:** Rutas en `App.tsx`: `/achievements` autenticada legacy; `/preview/achievements` y `/app/achievements` Soma 2.0.
- **Dependencias:** UX-10–12 (no romper el criterio en la superficie que se conserve).
- **Criterio:** Decisión documentada: retirar, redirigir a Soma 2.0, o adaptar ruleReview/secretos. Nada a medias sin dueño.

---

## Soma Expeditions — Gamificación de la recuperación

Línea de producto **documentada, no implementada**. Combina mecánicas de RPG científico con una aventura **personal** de recuperación. El usuario es el protagonista de su expedición. El progreso debe ser comprensible, motivador y **voluntario**.

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
| `bitacora-2.0.png` | Bitácora 2.0 |
| `soma-2-reference.png` | Referencia del producto **actual** (Inicio), no 2.0 |
| `soma-mi-recuperacion-reference.png` | Referencia actual |
| `soma-explorar-reference.png` | Referencia actual |
| `soma-explorador-anatomico-reference.png` | Referencia actual |
| `soma-logros-reference.png` | Referencia actual |
| `visual-organs.png` | Recurso de órganos, no pantalla |

**No existe** `misiones-2.0.png` ni una segunda imagen de expedición. Las misiones aparecen como **tarjetas embebidas** en Inicio, Explorador y Expedición. No se inventa un archivo.

#### GAME-DESIGN-01 — Navegación y diseño de Expeditions

- **Descripción:** Cómo entra Expeditions en SHELL-01 **sin** segundo sistema de navegación. Dirección visual de ocho pantallas (siete PNG 2.0 + Misiones sin mockup propio).
- **Estado:** Dirección visual **aprobada**. NAV-01 fusionado en `develop` (`f107bc8`, PR #55). NAV-02 fusionado en `develop` (`d0c4c78`, PR #56). **No** desplegado. GAME-03A implementado, pendiente de integración; GAME-03B/C siguientes.
- **Prioridad:** P1
- **Horizonte:** cabecera de naturaleza + (en Inicio) mochilero ante el paisaje. Reutilizar identidad Soma; no sustituir la figura anatómica de Inicio. Fotos de mockup **no** son assets de producción hasta licencia/arte propio.
- **Mapeo pantalla → hitos:**

  | Pantalla | Mockup | Hitos | Reutilizar | Nuevo (no implementar aún) |
  | --- | --- | --- | --- | --- |
  | Inicio 2.0 | `inicio-2.0.png` | GAME-02, GAME-05, GAME-06, GAME-07 (resumen), UX-02 | `HeroFigure`, mensajes diarios, chips de sustancia, `AchievementMedal` | Horizonte, próximo hito, misión recomendada, nivel (tras GAME-06) |
  | Recuperación 2.0 | `mi-recuperacion-2.0.png` | GAME-02, GAME-03, UX-04 | Curvas, filtros, órganos/sistemas, días de abstinencia | Línea temporal de medallas **temporales**; no duplicar tarjetas de sustancia vs órganos |
  | Explorador 2.0 | `explorador-2.0.png` | GAME-05, UX-05–07 | 5 sustancias, 12 sistemas, buscador, NT publicados | Procesos clave; más protagonismo NT; **sin** síntomas no publicados |
  | Atlas 2.0 | `explorador-anatomico-2.0.png` | GAME-05 | Visor, zoom, ilustraciones **originales**, 12 sistemas | Panel contextual; **quitar** la cuadrícula duplicada de sistemas a la derecha del mockup; órganos del sistema; enlaces a misiones |
  | Logros 2.0 | `logros-2.0.png` | GAME-01–03, UX-10–12 | 106 fisiológicos, nombres originales, secretos, `ruleReview`, filtros | Familia temporal aparte; colecciones; platino como culminación; **sin** cambiar reglas aún |
  | Misiones 2.0 | **sin PNG** | GAME-05 | Atlas, sustancias, NT, procesos existentes | Sección + catálogo de misiones; sin XP hasta GAME-06 |
  | Bitácora 2.0 | `bitacora-2.0.png` | GAME-04 | Auth / cuenta | Persistencia, privacidad, export; **rechazar** racha obligatoria y «bienestar medio» clínico del mockup |
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
- **Estado:** GAME-03A implementado (rama `feature/game-03a-home-2`), pendiente de integración en `develop`. GAME-03B y GAME-03C pendientes. **No** fusionado. **No** desplegado.
- **Prioridad:** P1
- **Dependencias:** GAME-01, GAME-02, NAV-01, NAV-02. ACH-NOTIF-01 no sustituye al árbol/timeline.
- **Entregas:**
  - **GAME-03A — Inicio 2.0:** tablero de expedición (situación, próxima medalla temporal, descubrimiento fisiológico compacto, hasta 4 logros LIVE reales, tarjeta de paisaje con `nature-1.png`). Sin XP ni niveles.
  - **GAME-03B — Mi recuperación 2.0:** línea temporal de medallas temporales. Fórmulas y catálogos intactos.
  - **GAME-03C — Logros 2.0:** colección por familias 106+50. Sync y reglas de desbloqueo intactos.
- **Criterio (03B):** usable con teclado y en 320 px; sin scroll horizontal accidental; copy de que los hitos son tiempo de abstinencia. Futuras temporales no spoilean secretos **fisiológicos** (UX-12).

#### GAME-04 — Bitácora de recuperación

- **Descripción:** Registros **voluntarios** de ánimo, sueño, energía y notas. No son diagnósticos. **No** atribuir automáticamente sus variaciones a la abstinencia.
- **Estado:** Pendiente. Dirección visual: `bitacora-2.0.png`. **Estudiar privacidad, almacenamiento y exportación antes de implementar.**
- **Prioridad:** P1
- **Dependencias:** GAME-DESIGN-01. Decisión de retención/exportación (cuenta, dispositivo, GDPR). AUTH-01. No mezclar con síntomas clínicos publicados. Prisma/API nuevos **después** de la nota de privacidad.
- **Criterio:** Nota de privacidad aprobada (qué se guarda, quién lo ve, cómo se exporta/borra). UI opt-in. Campos: ánimo, sueño, energía, ansiedad/estrés, notas, calendario, tendencias, reflexiones y aprendizajes **marcados por el usuario**. Del mockup **no** se implementan: racha de uso como meta, «bienestar medio» 0–10 como evaluación, causalidad con abstinencia.

#### GAME-05 — Misiones educativas

- **Descripción:** Misiones cortas ligadas al atlas, sustancias y neurotransmisores. Recompensan **aprendizaje y exploración**, no abstinencia.
- **Estado:** Pendiente. **Sin mockup de pantalla propia.** Dirección: tarjetas en `inicio-2.0.png`, `explorador-2.0.png`, `expedicion-2.0.png`.
- **Prioridad:** P2
- **Dependencias:** GAME-DESIGN-01. GAME-06 **después** (no puntuar hasta reglas de XP). Atlas / Explorar / NT **publicados**. No inventar ventanas UX-08 ni medición de NT. No contenido `pending_clinical_review`.
- **Criterio:** Categorías: neurociencia, anatomía, sustancias, fisiología/procesos. Título con personalidad, objetivo, contenido de atlas, actividad o pregunta, estado, recompensa educativa (no loot aleatorio). Disponibles **con o sin** abstinencia. No bloquean conocimientos. Granja repetible ilimitada **fuera de alcance**.

#### GAME-06 — XP y niveles

- **Descripción:** Estudiar experiencia a partir de logros (fisiológicos y temporales) y de aprendizaje (GAME-05). El «Nivel 12 / Explorador neuronal» de `inicio-2.0.png` es **ilustrativo**.
- **Estado:** Pendiente (estudio; no implementar economía). Inicio 2.0 puede enviarse **sin** XP hasta cerrar este ID.
- **Prioridad:** P2
- **Dependencias:** GAME-01 (qué logros puntúan). GAME-05 (aprendizaje). ACH-REV / GAME-08: el XP histórico **no** se borra en recaída salvo política explícita (principio: no castigar borrando reconocimientos).
- **Criterio:** Documento de economía: fuentes de XP, techos, nada de recompensas repetibles ilimitadas ni mecánicas de uso compulsivo (racha diaria obligatoria, FOMO de login).

#### GAME-07 — Centro de expedición

- **Descripción:** Sección **propia** Expedición (dirección: `expedicion-2.0.png`) **más** resumen en Inicio. Mapa de montaña; selector conocimiento vs perseverancia; no mezclar reglas.
- **Estado:** Pendiente (dirección visual aprobada; implementación no)
- **Prioridad:** P2 (mapa). Nav de la sección: con GAME-DESIGN-01 / Fase C.
- **Dependencias:** GAME-DESIGN-01 (ítem de menú sin vaciar el bottom nav). GAME-01/02 para metas temporales. GAME-05 para rutas de conocimiento. SHELL-01.
- **Criterio:** Rutas de conocimiento = aprendizaje. Rutas de perseverancia = hitos temporales por sustancia (alcohol, nicotina, cannabis, cocaína, cafeína). Mapa exploratorio, no ranking. Sin segundo router.

#### GAME-08 — Capítulos de recuperación

- **Descripción:** Representación **respetuosa** de etapas de recuperación (no calendarios clínicos UX-08). Las decisiones de persistencia se vinculan a **ACH-REV**.
- **Estado:** Pendiente
- **Prioridad:** P2
- **Dependencias:** ACH-REV (política **antes** de código). GAME-01 / GAME-06 (qué se conserva). **No** implementar revocaciones ni cambios de `lastUseDate` en este ID.
- **Criterio:** Copy y estados de capítulo aprobados. Recaer no borra el historial de reconocimientos salvo que ACH-REV lo autorice por escrito. Este ID **no** escribe Prisma de logros.

---

## Calidad y lanzamiento

#### Q-CI — Integración continua

- **Descripción:** Automatizar tests (al menos web + API unit/http) en cada PR a `develop`/`main`.
- **Estado:** Pendiente. En el repo solo `.github/FUNDING.yml` (sin workflows de CI observados).
- **Prioridad:** P2
- **Evidencia:** Root `package.json` sin `test`/`lint` globales. Web `pnpm test` (globs de features). API `tsx --test src/**/*.test.ts`. Pg tests se saltan sin `DATABASE_URL`.
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
- **Evidencia (preexistente, no introducida por UX-04):** `react-hooks/set-state-in-effect` en `RecoveryPage.tsx`, `TrophyToastStack.tsx`, `AuthContext.tsx`; avisos `exhaustive-deps` en `usePreviewDashboard.ts`. API sin ESLint.
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

1. **Persistencia de logros desbloqueados** puede ser intencional (el hito ocurrió). No asumir que «no revocar» es un defecto.
2. **Corregir una fecha errónea** y **recaer** no son el mismo evento; la política puede tratarlos distinto.
3. **No** implementar revocación automática hasta cerrar ACH-REV.
4. El catálogo de **106** logros exige distinguir existencia, publicación, alcanzabilidad y desbloqueo (UX-10–12 + ACH-REV).
5. Platinos: conjunto de logros vs umbral 0,99 (UX-11) — requiere diseño y autorización de catálogo.
6. Fichas de anatomía EN (I18N-03): traducir vs declarar monolingüe ES.
7. Destino de `/achievements` legacy (LEG-01).
8. Soma Expeditions: Expedición es sección propia **más** resumen en Inicio (GAME-07). Economía de XP (GAME-06). Privacidad de bitácora (GAME-04). ACH-REV antes de capítulos (GAME-08).
9. Naming de GAME-01: la tabla de este roadmap y los nombres frikis de los PNG son **propuestas**, no catálogo aprobado. Los 106 fisiológicos **no** se renombran.
10. Arte Horizonte / mapa: los PNG no otorgan licencia de foto; hace falta arte propio o autorizado antes de producción.

Este documento **no** decide esos puntos ni autoriza seeds.

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
| R-I18N | DEMO/Logros en ES con UI EN. | Pendiente (I18N-01, I18N-02) |
| R-GAME | Rankings, rachas obligatorias o XP que castigue recaídas / inactividad. | Mitigado en principios de Expeditions; vigente hasta implementar |
| R-LOG | Bitácora (GAME-04) sin política de privacidad/exportación. | Pendiente de estudio; **no** implementar UI antes |
| R-NAV | Ocho destinos en mockups vs cinco huecos del bottom nav. | Mitigado en NAV-01 (Más; sin Expedición hasta GAME-07) |
| R-MIX | Mezclar % temporal con % de curva, o conocimiento con perseverancia. | Mitigado en copy UX-04 + GAME-02/07; vigilar implementación |
| R-ART | Sustituir visor anatómico o medallas reales por arte generado de mockup. | Prohibido; visor y catálogo 106 se conservan |

Ninguno de estos es P0 de incidente en producción evidenciado.

---

## Próximos pasos (por dependencia)

1. **AUTH-01 + LIVE-01:** humo **local** hecho (cuenta sintética). Pendiente producción o staging **autorizado**. No E2E automatizado.
2. **I18N-01 e I18N-02:** defecto EN ya visto en DEMO pública.
3. **UX-10** (validar) → **UX-12** (secretos/platinos) → **UX-11** (regla platino, con autorización de catálogo).
4. **ACH-REV:** decidir política **antes** de código (bloquea GAME-08 y cualquier revocación).
5. **ACH-NOTIF-01, ACH-CELEB-01, SHELL-01:** completados y **validados en producción LIVE**. Distintos de UX-10–12 y de ACH-REV.
6. **Expeditions:** GAME-01, GAME-02, NAV-01 y NAV-02 en `develop`. GAME-03A pendiente de integración. **Siguiente:** GAME-03B. Mapa GAME-07 y bitácora GAME-04 después.
7. **I18N-04:** selector de banderas; **no implementar** todavía. No añade idiomas.
8. **UX-08 / UX-09:** editorial; no inventar.
9. **Q-CI, Q-05, Q-E2E, Q-OBS, R-SHA.**
10. **VIS-01, I18N-03, LEG-01, ESLint.** GAME-04/05/06/07/08 en P1–P2 según sección Expeditions.
11. Revisión clínica de síntomas/consejos: hito humano **posterior**, no el paso 1 de lanzamiento.

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

---

## Plan de trabajo detallado

```
Síntomas / Consejos
  → catálogo publicado vacío
  → revisión clínica humana
  → ingestión al catálogo público (otro hito; no automática)
  → UI que solo lee lo publicado

AUTH-01 + LIVE-01 (local hecho; prod/staging pendiente)
  →  I18N-01 / I18N-02
  → UX-10 validar  →  UX-12  →  UX-11 (autorización de reglas)
  → ACH-REV (decisión) antes de cualquier revocación
  → ACH-NOTIF-01 / ACH-CELEB-01 / SHELL-01 (main + validado LIVE producción)
  → I18N-04 (selector banderas; no implementar aún; no nuevos idiomas)

Soma Expeditions (dirección visual OK)
  Fase A  GAME-01 y GAME-02 (en develop)
  Fase A2 NAV-01 y NAV-02 (en develop) → GAME-03A (Inicio 2.0, pendiente de integración) → GAME-03B → GAME-03C
  Fase B  GAME-03B timeline en Recuperación + GAME-03C Logros 2.0 (familias)
  Fase C  GAME-07 Expedición (mapa + nav Más) sobre SHELL-01
  Fase D  Explorador / atlas 2.0 (NT, procesos, panel) → GAME-05 misiones
  Fase E  GAME-04 bitácora (privacidad primero) → GAME-06 XP → GAME-08 (tras ACH-REV)

UX-08, UX-09  →  editorial con fuentes; sin inventar

Q-CI / Q-05 / Q-E2E / Q-OBS / R-SHA
VIS-01 (no reabre UX-03), I18N-03, LEG-01
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
10. Conservar `UX-01`–`UX-12`; los IDs nuevos (AUTH, LIVE, I18N-01–04, ACH-REV, ACH-NOTIF-01, ACH-CELEB-01, SHELL-01, GAME-DESIGN-01, GAME-01–08, Q-*, VIS, LEG, R-SHA) no los sustituyen.

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
