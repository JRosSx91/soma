# Roadmap Soma 2.0

Documento de planificación permanente. Se consulta **antes** de abrir un hito nuevo.  
**No otorga permiso** para commit, push, PR, merge ni despliegue.

Última actualización editorial: 2026-10-25.  
Rama de trabajo: `develop`.  
HEAD local al actualizar: implementación UX-04 `c7f9b37` en `develop`. `origin/main` está en el merge `2ca8004` (PR #49). UX-04 **Pendiente de validación**: en `develop`, pendiente de integración en `main` y de validación funcional en producción.

Hay documentación científica y editorial en `docs/` (curvas, 9B Consejos). Eso **no** es este roadmap de producto.

---

## Objetivo y alcance

Soma 2.0 es un compañero **educativo** para explorar la recuperación fisiológica tras el consumo de sustancias: dashboard personal, atlas anatómico, catálogo de sustancias y logros.

No es un dispositivo médico. Las curvas son modelos ilustrativos (`curveProgress` / avance de curva), **no** un porcentaje de salud recuperada ni una medición clínica. No se miden neurotransmisores. Las fases educativas se eligen para comparar; no se calculan a partir de los días de abstinencia salvo que un hito futuro lo autorice con evidencia.

Alcance de contenido canónico actual: cinco sustancias (alcohol, nicotina, cannabis, cocaína, cafeína), 12 sistemas, 21 estructuras, 56 curvas, 106 logros. ES/EN para la interfaz Soma 2.0. Superficies `/preview` (DEMO) y `/app` (sesión).

Fuera de alcance hasta autorización: síntomas de abstinencia **publicados**, consejos clínicos, migraciones/seeds, ventanas 1–7/8–56/57+ como evidencia por sustancia.

---

## Estado general

| Superficie | Estado |
| --- | --- |
| Producto Soma 2.0 en `develop` | En desarrollo |
| UX-01 orientación corporal | Completado (PR #45, confirmar en producto desplegado) |
| UX-02 mensajes diarios × 60 | Completado (PR #45; test `home-daily-message.test.ts`) |
| Recuperación (copy, gráfico, estados mixtos) | Código PR #46–#48 en `main`; UX-04 DEMO en `develop` (`c7f9b37`), **Pendiente de validación** |
| Neurotransmisores educativos | Funcionalidad del PR #49 observada en `https://somarecovery.app` (SHA de Render **no** verificado; **no** es revisión clínica) |
| Síntomas de abstinencia | En desarrollo (40 candidatos `pending_clinical_review`; catálogo **publicado vacío**) |
| Requisitos UX-03 a UX-12 | UX-03 Completado (validación DEMO 320/375/430); UX-04 Pendiente de validación (en `develop`, `c7f9b37`); UX-05–07 Completado; UX-08–12 Pendiente |
| API local para fichas de Explorar | Disponible en esta sesión (`soma-postgres` + `pnpm dev:api`); `/app` autenticado no comprobado |

---

## Funcionalidades completadas

Confirmadas por el usuario y/o por código en `develop`:

- Orientación anatómica del cuerpo (mirada a la izquierda, órganos situados) — PR #45, commit `d54c133`.
- 60 mensajes motivacionales diarios ES/EN — PR #45, commit `bde004d`, test de longitud 60.
- Atlas 2D, Explorar de sustancias/sistemas, fichas compartidas `DetailSheet`.
- Ajustes de recuperación en código: tiempo de abstinencia como eje, etiquetas de % de curva, estados de órgano mixtos, gráfico móvil (PR #46–#48). Coherencia DEMO de leyenda/hitos: en `develop` (`c7f9b37`), **Pendiente de validación**.
- Infraestructura de Consejos, evidencia NT y ventanas educativas: catálogos **públicos vacíos** a propósito.
- Neurotransmisores `0a49627` y Explorar UX-05–07 (`437c7fa`): fusionados en `main` vía PR #49 (`2ca8004`). **Publicación funcional** observada en `https://somarecovery.app` (2026-10-25). El SHA servido por Render **no** se pudo verificar. **No** es revisión clínica. `/app` autenticado no se comprobó de forma específica.
- UX-03: figura de Inicio validada en producción DEMO a 320/375/430 px. Seguimientos opcionales (tablet, recorte de escritorio) no bloquean el cierre.

---

## Funcionalidades en desarrollo

- Catálogo editorial de **síntomas de abstinencia** (40 candidatos, **publicado vacío**, todas `pending_clinical_review`). Sin interfaz de usuario; sin revisión clínica.
- Coherencia DEMO de **UX-04** (leyenda = muestra del eje; sin «hoy» compartido): implementada en `develop` (`c7f9b37`); pendiente de integración en `main` y de validación funcional en producción.

---

## Backlog pendiente

Los 12 puntos originales (`UX-01`–`UX-12`) más:

- Revisión clínica de síntomas y decisión de publicación (no se cierra con tests).
- Interfaz de síntomas **sin** mostrar candidatos pendientes de revisión.
- Validación de producto de UX-04 (copy y gráfico DEMO coherentes; LIVE ya tenía reglas de overlay/mixto).
- Comprobación específica de Explorar en `/app` autenticado (misma UI que `/preview`; no es un requisito nuevo).
- Estimaciones de fase por sustancia solo con respaldo (`educationalPhaseWindowCatalog` vacío).
- Auditoría de huecos órgano × sustancia (p. ej. cocaína–corazón).
- Logros: `ruleReview`, platino y secretos.

---

## Riesgos y bloqueos

| ID | Riesgo / bloqueo | Estado |
| --- | --- | --- |
| R-API | Explorar/sustancias depende del API. Mitigado en local (`soma-postgres` + Nest en :3000). `/app` autenticado no comprobado. No forzar `.env` ni seeds sin autorización. | Mitigado en local |
| R-CLIN | La revisión clínica no es una casilla de tests. Publicar síntomas o Consejos sin ella sería un error de producto. | Pendiente |
| R-% | Confundir avance de curva con salud recuperada. | Pendiente de validación con usuarios |
| R-CAL | Reutilizar 1–7/8–56/57+ (`narrativePhaseWindows`) como calendario clínico. | Pendiente (guardrails de código existen; contenido de ventanas aún vacío) |
| R-NT | Neurotransmisores integrados en `main` (PR #49). SHA de Render no verificado. | Mitigado en git; despliegue SHA pendiente |
| R-DUP | Duplicar párrafos NT como lista de síntomas. | Mitigado en catálogo editorial; falta UI |

---

## Próximos pasos (por dependencia, sin fechas)

1. **Síntomas:** interfaz futura solo sobre el catálogo **publicado** (vacío); 40 candidatos siguen `pending_clinical_review`. Revisión clínica humana **después**.
2. **UX-04:** integrar `c7f9b37` en `main` y validar funcionalmente en producción (`/preview/recovery`: leyenda = día 365 de cada curva; sin marcador «Hoy» compartido; hitos sin % contradictorios).
3. **UX-08–UX-09** (atlas) y **UX-10–UX-12** (logros). `/app` autenticado de Explorar sigue pendiente, sin ser un requisito nuevo.

La revisión clínica de síntomas es un hito humano posterior, no el paso 1.

---

## Requisitos originales del usuario (UX-01 a UX-12)

Numeración e intención originales conservadas. Estados según **código inspeccionado** y **comunicación del usuario**. Lo no verificado no se marca Completado.

### Inicio

#### UX-01 — Orientación anatómica

- **Estado:** Completado
- **Descripción:** Cuerpo mirando a la izquierda, órganos correctamente situados.
- **Criterio:** En Inicio, la figura no aparece espejada ni con órganos desplazados respecto al atlas acordado.
- **Evidencia:** Usuario: PR #45. Código: `d54c133` (*correct home anatomy orientation and mobile sizing*).
- **Dependencias:** Ninguna abierta.

#### UX-02 — Mensajes motivacionales diarios

- **Estado:** Completado
- **Descripción:** Ampliar a 60 mensajes ES/EN.
- **Criterio:** Hay 60 mensajes distintos en cada idioma y se rotan en Inicio.
- **Evidencia:** Usuario: PR #45. Código: `bde004d`; `home-daily-message.test.ts` afirma `es.length === 60` y `en.length === 60`.
- **Dependencias:** Ninguna abierta.

#### UX-03 — Tamaño de la figura en móvil

- **Estado:** Completado
- **Descripción:** Ajustar el tamaño de la figura anatómica en dispositivos móviles.
- **Criterio:** En 320/375/430 px la figura es usable, no recorta órganos relevantes ni deja un vacío excesivo.
- **Evidencia:** Validación visual en producción DEMO `https://somarecovery.app/preview` (2026-10-25): 320 (288×268, llena el ancho), 375 y 430 (altura tope 280 px). Cara, cerebro, tórax y abdomen visibles; overflow horizontal 0. Código: `d54c133`, `91724b3`, `HeroFigure` / `HomeStage` (sin cambios en este hito).
- **Limitaciones no bloqueantes:** en tablet (~768 px) queda un vacío lateral amplio; en escritorio (~1280 px) se recortan ~58 px del borde derecho de la imagen. Mejoras visuales opcionales; **no** reabren UX-03.
- **Dependencias:** Ninguna.

### Mi recuperación

#### UX-04 — Resumen general de recuperación

- **Estado:** Pendiente de validación
- **Descripción:** Aclarar significado y cálculo del resumen. El usuario debe entender la agregación y que **no** es un porcentaje real de salud.
- **Criterio:** Copy y gráfico hablan de avance de curva educativa; no de salud recuperada; estados mixtos no muestran un % conjunto engañoso.
- **Evidencia:** PR #46–#48 en `main`. Implementación DEMO en `develop` (`c7f9b37`): sin marcador «Hoy» compartido; leyenda = última muestra de cada serie (día 365 del eje); hitos sin %; azulejos con serie reutilizan esa muestra y muestran «día 365»; copy ES/EN «Avance de cada curva» / «Mostrar todas las curvas». LIVE (mínimo por sistema, overlay, mixto) no se ha tocado. Falta integración en `main` y validación funcional en producción.
- **Dependencias:** Integración en `main` y validación funcional en producción. **Pendiente de validación**; no Completado.

### Explorar

#### UX-05 — Lenguaje y repetición de «catálogo»

- **Estado:** Completado
- **Descripción:** Quitar repeticiones innecesarias de «catálogo» y mejorar el lenguaje.
- **Criterio:** En ES, «catálogo» no satura títulos, pistas, errores y fichas; el tono sigue siendo educativo.
- **Evidencia:** Copy ES/EN reescrito (`437c7fa`). Validado en `/preview/explore` local y **observado en producción** `https://somarecovery.app` (PR #49). Una mención queda en `ntPhaseNotice`. **No** es revisión clínica. SHA de Render no verificado. `/app` autenticado no se comprobó de forma específica.
- **Dependencias:** Ninguna.

#### UX-06 — Enumeración de órganos y zonas (hipocampo)

- **Estado:** Completado
- **Descripción:** Mejorar la lista de órganos y zonas, incluyendo el hipocampo cuando corresponda.
- **Criterio:** Si el índice educativo asocia hipocampo (u otra zona) a la sustancia, aparece en la ficha con el nombre localizado; no se inventan órganos.
- **Evidencia:** Título «Órganos y zonas». Agrupación por `atlasSystems`. Fichas alcohol/cannabis en `/preview` local y en producción (PR #49): hipocampo bajo SNC. **No** es revisión clínica. SHA de Render no verificado.
- **Dependencias:** UX-07 (nombres enlazables).

#### UX-07 — Navegar de órganos mencionados al atlas

- **Estado:** Completado
- **Descripción:** Desde órganos y zonas de Explorar, ir a su ubicación en el explorador anatómico.
- **Criterio:** Cada órgano listado abre el atlas en el sistema/órgano correcto, **sin** afirmar que un neurotransmisor «pertenece» a un solo órgano.
- **Evidencia:** Hipocampo abre `/preview/anatomy?system=nervous-central&organ=brain-hippocampus` en local y en producción (PR #49). `DetailSheet` cierra y restaura foco. **No** es revisión clínica. SHA de Render no verificado.
- **Dependencias:** Query del atlas (`anatomy-explorer-query.ts`).

### Explorador anatómico

#### UX-08 — Fases educativas por sustancia

- **Estado:** Pendiente
- **Descripción:** Investigar e incorporar, **solo con respaldo suficiente**, estimaciones educativas de fase aguda, postaguda y normalización **por sustancia**. No usar 1–7/8–56/57+ como evidencia clínica.
- **Criterio:** Si se muestran días, salen de `educationalPhaseWindowCatalog` con fuente e incertidumbre; si no hay evidencia, no se inventa rango. `narrativePhaseWindows` no se presenta como calendario universal en el atlas.
- **Evidencia:** `educationalPhaseWindowCatalog` está **vacío** a propósito. El reloj global sigue en `narrative-catalog.ts` para no desviar seeds/tests.
- **Dependencias:** Trabajo editorial/bibliográfico. Bloqueado como contenido hasta respaldo; la infra no está bloqueada.

#### UX-09 — Efectos ausentes sustancia × órgano

- **Estado:** Pendiente
- **Descripción:** Auditar combinaciones sin efecto o descripción. Ejemplo del usuario: **cocaína y corazón**.
- **Criterio:** Inventario de huecos vs. pares con narrativa/curvas/señalización; no rellenar sin fuente; el atlas no finge cobertura completa.
- **Evidencia:** `organ-narrative` de `heart` solo tiene **cafeína**. Narrativa de corazón no incluye cocaína. El ejemplo del usuario se confirma como hueco. Auditoría completa no hecha.
- **Dependencias:** Decisión editorial; no seeds automáticos.

### Logros

#### UX-10 — Logros pendientes de revisión

- **Estado:** Pendiente
- **Descripción:** Identificar con claridad los logros pendientes de revisión y explicar el motivo.
- **Criterio:** La UI distingue `ruleReview` (u homólogo) y explica por qué no es un objetivo alcanzable (p. ej. falta de curva).
- **Evidencia:** Catálogo generado: al menos 7 ítems con `"ruleReview": true`. `AchievementsPage` cuenta `reviewCount` y muestra texto si no hay curva. Falta validar que el usuario lo entiende y que el listado es completo y obvio.
- **Dependencias:** Ninguna.

#### UX-11 — Lógica de platino

- **Estado:** Pendiente
- **Descripción:** El platino debe exigir los demás logros pertinentes, no un umbral arbitrario de progreso.
- **Criterio:** Un platino no se desbloquea solo con `threshold` de curva (p. ej. 0,99); requiere el conjunto de logros acordado de esa sustancia.
- **Evidencia:** P. ej. `alcohol-sovereignty-platinum` tiene `"threshold": 0.99` y `"hidden": true`. No hay regla de «todos los logros pertinentes» en el fragmento inspeccionado.
- **Dependencias:** Diseño de reglas; posible cambio de seed/catálogo (solo con autorización; este roadmap no la da).

#### UX-12 — Secretos y platinos

- **Estado:** Pendiente
- **Descripción:** Los secretos no deben revelar bronce/plata/oro de antemano. Los platinos **no** son secretos.
- **Criterio:** Ficha sellada de un secreto no muestra el tramo; los platinos son visibles como platino y no usan el patrón «???».
- **Evidencia:** `achievementHiddenCopy` usa «???». Platinos de soberanía tienen `"hidden": true`. La ficha sellada renderiza `Bloqueado. {tierLabel}` (puede filtrar el tramo). Commit `b5dadaf` oculta la etiqueta de tramo en la medalla de Inicio: **parcial**, no cierra el requisito.
- **Dependencias:** Relacionado con UX-11.

---

## Hitos recientes

### Neurotransmisores

| Campo | Valor |
| --- | --- |
| Estado | En `main` (PR #49). **Publicación funcional** en `https://somarecovery.app`. SHA de Render **no** verificado. **No** revisión clínica. |
| Qué es | MVP educativo en Explorar: tarjetas compactas, selector de fase, perfiles existentes, sin mediciones ni calendarios personales. Advertencias de alcohol (GABA/glutamato, abstinencia aguda) visibles fuera de un `<details>` cerrado. |
| Commit | `0a49627` en `develop`; merge `2ca8004` en `main` (PR #49). |
| Validación | `/preview` local y producción DEMO (alcohol/cannabis, 320/375/430 px). |
| No hecho | Verificar SHA de Render. Comprobación específica en `/app` autenticado. |
| No es | Medición neuroquímica, fase calculada por días de abstinencia, ni revisión clínica del copy. |

### Síntomas de abstinencia

| Campo | Valor |
| --- | --- |
| Estado | En desarrollo |
| Qué es | 40 fichas candidatas ES/EN (5 sustancias), 2 advertencias de alcohol (`alcohol.seizures`, `alcohol.medical_care`). |
| Publicación | **Catálogo publicado vacío.** Resolver público no devuelve pendientes de revisión. **No está disponible para usuarios.** |
| Revisión | Todas `pending_clinical_review` / `clinicalReview: "pending"`. |
| Archivos | Commit local `ccef9a3`: `educational-withdrawal-symptoms.ts`, `.es.json`, `.en.json`, `.test.ts` |
| Copy | Refinamiento editorial hecho; **sigue pendiente revisión clínica**. No se marca revisado clínicamente. |
| No hecho | Interfaz, publicación, i18n de runtime, ingestión al catálogo público. |

### Recuperación y anatomía (PR #45–#48)

| PR (según usuario) | Tema | Estado en este roadmap |
| --- | --- | --- |
| #45 | Orientación + mensajes × 60 (+ sizing móvil en el mismo frente) | UX-01, UX-02 y UX-03 Completado |
| #46 | Abstinencia como eje; % de curva | Código en `main`; UX-04 Pendiente de validación (DEMO en `develop`, `c7f9b37`) |
| #47 / #48 | Estados mixtos; gráfico móvil | Código en `main` (`591c74f`, `b53892c`, `feb8947`); LIVE mixto intacto |
| #49 | NT + Explorar UX-05–07 | Fusionado en `main` (`2ca8004`). Publicación funcional en somarecovery.app; SHA Render no verificado |

No confundir progreso de curvas educativas con medición de salud.

---

## Plan de trabajo detallado

```
Síntomas (editorial local)
  → (autorización) commit del catálogo
  → UI que solo lee el catálogo publicado (vacío)
  → revisión clínica humana
  → ingestión al catálogo público (otro hito)

Neurotransmisores + UX-05–07
  → en `main` (PR #49); publicación funcional observada
  → SHA de Render no verificado; `/app` autenticado pendiente (no es requisito nuevo)

UX-03 Completado (DEMO 320/375/430)
UX-04 en `develop` (`c7f9b37`) → integración en `main` → validación funcional en producción

UX-08, UX-09
  → atlas (ventanas por sustancia; huecos de cobertura)

UX-10, UX-11, UX-12
  → logros (revisión, platino, secretos)
```

---

## Protocolo de mantenimiento

1. Consultar este archivo **antes** de un hito nuevo.
2. Actualizar estados cuando cambie el alcance o se complete una tarea.
3. **No** borrar requisitos pendientes sin autorización del usuario.
4. **No** marcar `Completado` hasta cumplir el criterio de aceptación (implementación local ≠ integración ≠ publicación ≠ validación).
5. Anotar commits y PR relevantes.
6. Diferenciar: local / integrado en `develop` / en `main` / desplegado / validado.
7. Mantener el roadmap alineado con `git status` y con lo que el usuario autorice.
8. La revisión clínica **no** se marca Completado porque pasen tests.
9. Este documento **no** autoriza commit, push, PR, merge ni despliegue.

Estados permitidos: `Completado` · `Pendiente de validación` · `En desarrollo` · `Pendiente` · `Bloqueado`.

---

## Historial breve de decisiones

| Cuándo | Decisión |
| --- | --- |
| PR #45 | Corregir orientación del cuerpo; 60 mensajes diarios ES/EN. |
| PR #46–#48 | Copy y gráfico de recuperación: el % es avance de curva, no salud; estados mixtos en el adaptador, no en el motor. |
| Atlas educativo | No mostrar 1–7/8–56/57+ como evidencia por sustancia; ventanas autoradas vacías hasta cita. |
| Consejos / evidencia NT | Carriles publicados vacíos; borradores no son UI. |
| Neurotransmisores | Reutilizar 14 perfiles; fase manual; advertencias de alcohol no solo en `<details>`. Commit local `0a49627`. |
| Síntomas | Catálogo por sustancia (no por NT); 40 candidatos; publicado vacío; sin UI todavía. |
| 2026-10-25 | Se crea este `ROADMAP.md` para no perder requisitos entre sesiones. |
| 2026-10-25 | Validación técnica y visual en `/preview` (API + Postgres locales): UX-05–07 y MVP NT. No es revisión clínica ni producción. `/app` no comprobado de forma específica. |
| 2026-10-25 | PR #49 fusionado en `main` (`2ca8004`). Publicación funcional en somarecovery.app; SHA de Render no verificado. |
| 2026-10-25 | UX-03 cerrado con evidencia DEMO 320/375/430. UX-04 DEMO en `develop` (`c7f9b37`): leyenda = muestra día 365; sin «hoy» compartido. Pendiente de `main` y de validación en producción. |
