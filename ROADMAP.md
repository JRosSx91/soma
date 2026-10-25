# Roadmap Soma 2.0

Documento de planificación permanente. Se consulta **antes** de abrir un hito nuevo.  
**No otorga permiso** para commit, push, PR, merge ni despliegue.

Última actualización editorial: 2026-10-25 (consolidación post auditoría).
Rama de trabajo: `develop`.
HEAD local al actualizar: `593b6c6595800292ad0e548872f2016b7d243767` (`docs: update UX-04 integration status`), alineado con `origin/develop`.
`origin/main`: merge commit `32aac73ddac9abd012f876d8f4fbfdf9f78aefb7` (PR #50).

Hay documentación científica y editorial en `docs/` (curvas, 9B Consejos). Eso **no** es este roadmap de producto.

---

## Objetivo y alcance

Soma 2.0 es un compañero **educativo** para explorar la recuperación fisiológica tras el consumo de sustancias: dashboard personal, atlas anatómico, catálogo de sustancias y logros.

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
| Producto Soma 2.0 en `develop` / `main` | En desarrollo; `main` incluye PR #49 y #50 |
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
| LIVE `/app` | Pendiente de recorrido manual completo |
| SHA desplegado por Render | Requiere investigación |

---

## Publicación (Git ≠ Render)

| Evento | SHA / nota |
| --- | --- |
| PR #49 merge en `main` | `2ca80040504617096d932348a800076a9aff0da6` (NT + UX-05–07) |
| PR #50 merge en `main` | `32aac73ddac9abd012f876d8f4fbfdf9f78aefb7` (UX-04 DEMO + docs) |
| Commits de producto en #50 | `c7f9b37108eb4eaa69d16ca9f6033047fd94f7b1`, `593b6c6595800292ad0e548872f2016b7d243767` |
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

Código existente (JWT en memoria, cookie de refresh, PUT `/me/profile`, onboarding skip/complete). **No** hay E2E de navegador. LIVE producción no recorrido.

#### AUTH-01 — Validar registro, onboarding, sesión y `/app`

- **Descripción:** Recorrer de punta a punta: registro o login, restauración de sesión, onboarding (completar o omitir), acceso a `/app`, logout y estados de carga/error.
- **Estado:** Implementado, pendiente de validación
- **Prioridad:** P1
- **Evidencia:** `AuthContext`, `ProtectedRoute`, `auth.controller.ts`, tests `auth-session.test.ts`, `auth.refresh.http.test.ts`, `onboarding-actions.test.ts`. Sin tests de montaje de `AuthProvider`/`ProtectedRoute`/`OnboardingPage`. Sin Playwright/Cypress.
- **Dependencias:** Q-E2E para automatizar después del humo manual. No usar cuenta de producción real salvo autorización explícita.
- **Criterio:** Un operador puede completar el flujo en un entorno autorizado y documentar pases/fallos por paso (login, refresh, onboarding, `/app`, logout) sin ambigüedad DEMO/LIVE.

#### LIVE-01 — Sustancias, fechas, persistencia y recálculo

- **Descripción:** Validar edición de sustancias y fechas (hoy en `/onboarding` vía PUT `/me/profile`, no en la página Cuenta), persistencia Prisma, y que recuperación LIVE se actualiza al refetch. Los logros **añaden** desbloqueos en `GET /me/achievements`; no revocan (ACH-REV).
- **Estado:** Implementado, pendiente de validación
- **Prioridad:** P1
- **Evidencia:** `profile.service.ts` (replace de usages); `useLiveProfile` + `adapt-live-dashboard.ts`; `detectAndPersistUnlocks` insert-only. Tests de adapter (fechas faltantes, activo, vacío); **no** hay PUT→GET dashboard.
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

Locales ca/gl/eu/fr/it/de en disco **no** son UI Soma 2.0; no se tratan como deuda de lanzamiento.

---

## Logros (compromisos adicionales)

No duplicar UX-10–12. El catálogo 106 existe; cafeína 8 ítems sin platino; 7 `ruleReview`; 8 `hidden`; 4 platinos.

#### ACH-REV — Política de persistencia ante recaídas y correcciones de fechas

- **Descripción:** Hoy los `UserAchievement` son **insert-only**: recaer, borrar una sustancia o corregir `lastUseDate` **no** borra ni reescribe `unlockedAt`. PUT `/me/profile` no llama al servicio de logros; el siguiente GET puede **añadir** unlocks nuevos.
- **Estado:** Implementado (comportamiento actual). Política de producto **pendiente**. **No implementar revocación automática** hasta decidir.
- **Prioridad:** P2
- **Evidencia:** `planAchievementUnlocks`, `achievements.service.ts`. Sin tests de recaída/corrección de fecha.
- **Dependencias:** Decisión de producto (sección siguiente). LIVE-01 documenta el hecho; no lo cambia.
- **Criterio:** Documento de política aprobado (conservar / revocar en recaída / revocar solo en corrección de error / otro) **antes** de cualquier cambio de código. Corregir fechas erróneas y recaer **no** se tratan como el mismo evento.

#### LEG-01 — Ruta legacy `/achievements`

- **Descripción:** Evaluar la página Soma 1.0 (`pages/AchievementsPage.tsx`, `TrophyCard`) frente a Soma 2.0 (`recovery-dashboard/pages/AchievementsPage.tsx`). La legacy no muestra `ruleReview` y colorea tramos en secretos.
- **Estado:** Pendiente (evaluación)
- **Prioridad:** P3
- **Evidencia:** Rutas en `App.tsx`: `/achievements` autenticada legacy; `/preview/achievements` y `/app/achievements` Soma 2.0.
- **Dependencias:** UX-10–12 (no romper el criterio en la superficie que se conserve).
- **Criterio:** Decisión documentada: retirar, redirigir a Soma 2.0, o adaptar ruleReview/secretos. Nada a medias sin dueño.

`TrophyToastStack` (LIVE, no DEMO): implementado en `ProtectedLayout`; comprensión de usuario no validada (cubre AUTH-01/LIVE-01, no un ID extra).

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

Este documento **no** decide esos puntos ni autoriza seeds.

---

## Riesgos y bloqueos

| ID | Riesgo / bloqueo | Estado |
| --- | --- | --- |
| R-API | Explorar/sustancias depende del API. Mitigado en local. `/app` autenticado no comprobado. No forzar `.env` ni seeds. | Mitigado en local |
| R-CLIN | Publicar síntomas o Consejos sin revisión clínica. | Bloqueado por revisión clínica |
| R-% | Confundir avance de curva con salud recuperada. | Mitigado en DEMO (UX-04); pendiente con usuarios LIVE |
| R-CAL | Reutilizar 1–7/8–56/57+ como calendario clínico. | Pendiente (guardrails; catálogo educativo vacío) |
| R-NT | SHA Render no verificado; NT no son medición. | Requiere investigación (R-SHA); producto educativo OK |
| R-DUP | Duplicar párrafos NT como lista de síntomas. | Mitigado en catálogo; falta UI de síntomas |
| R-I18N | DEMO/Logros en ES con UI EN. | Pendiente (I18N-01, I18N-02) |

Ninguno de estos es P0 de incidente en producción evidenciado.

---

## Próximos pasos (por dependencia)

1. **AUTH-01 + LIVE-01:** humo autenticado (entorno autorizado; no producción real sin permiso).
2. **I18N-01 e I18N-02:** defecto EN ya visto en DEMO pública.
3. **UX-10** (validar) → **UX-12** (secretos/platinos) → **UX-11** (regla platino, con autorización de catálogo).
4. **ACH-REV:** decidir política **antes** de código.
5. **UX-08 / UX-09:** editorial; no inventar.
6. **Q-CI, Q-05, Q-E2E, Q-OBS, R-SHA.**
7. **VIS-01, I18N-03, LEG-01, ESLint.**
8. Revisión clínica de síntomas/consejos: hito humano **posterior**, no el paso 1 de lanzamiento.

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

---

## Plan de trabajo detallado

```
Síntomas / Consejos
  → catálogo publicado vacío
  → revisión clínica humana
  → ingestión al catálogo público (otro hito; no automática)
  → UI que solo lee lo publicado

AUTH-01 + LIVE-01  →  I18N-01 / I18N-02
  → UX-10 validar  →  UX-12  →  UX-11 (autorización de reglas)
  → ACH-REV (decisión) antes de cualquier revocación

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
10. Conservar `UX-01`–`UX-12`; los IDs nuevos (AUTH, LIVE, I18N, ACH-REV, Q-*, VIS, LEG, R-SHA) no los sustituyen.

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
