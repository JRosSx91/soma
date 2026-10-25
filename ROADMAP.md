# Roadmap Soma 2.0

Documento de planificación permanente. Se consulta **antes** de abrir un hito nuevo.  
**No otorga permiso** para commit, push, PR, merge ni despliegue.

Última actualización editorial: 2026-10-25.  
Rama de trabajo: `develop`.  
HEAD local al actualizar: `ccef9a3` (`feat(web): prepare withdrawal symptom catalog and roadmap`).

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
| Recuperación (copy, gráfico, estados mixtos) | Pendiente de validación (PR #46–#48) |
| Neurotransmisores educativos | Pendiente de validación (commit local, sin push) |
| Síntomas de abstinencia | En desarrollo (catálogo editorial local; **no publicado**) |
| Requisitos UX-03 a UX-12 | Pendiente o pendiente de validación (ver tabla) |
| API local para fichas de Explorar | Bloqueado (API no disponible en la última validación visual) |

---

## Funcionalidades completadas

Confirmadas por el usuario y/o por código en `develop`:

- Orientación anatómica del cuerpo (mirada a la izquierda, órganos situados) — PR #45, commit `d54c133`.
- 60 mensajes motivacionales diarios ES/EN — PR #45, commit `bde004d`, test de longitud 60.
- Atlas 2D, Explorar de sustancias/sistemas, fichas compartidas `DetailSheet`.
- Ajustes de recuperación en código: tiempo de abstinencia como eje, etiquetas de % de curva, estados de órgano mixtos, gráfico móvil (PR #46–#48; la **comprensión de usuario** sigue pendiente).
- Infraestructura de Consejos, evidencia NT y ventanas educativas: catálogos **públicos vacíos** a propósito.
- Commit local de neurotransmisores `0a49627` (no integrado en remoto ni desplegado).

---

## Funcionalidades en desarrollo

- Catálogo editorial de **síntomas de abstinencia** (40 candidatos, publicado vacío). Archivos locales sin commit.
- MVP de **neurotransmisores** en Explorar: en `HEAD` local; falta push, PR, merge, despliegue y validación visual con API.

---

## Backlog pendiente

Los 12 puntos originales (`UX-01`–`UX-12`) más:

- Revisión clínica de síntomas y decisión de publicación (no se cierra con tests).
- Interfaz de síntomas **sin** mostrar candidatos pendientes de revisión.
- Validación visual de neurotransmisores y de figura/gráfico móviles.
- Estimaciones de fase por sustancia solo con respaldo (`educationalPhaseWindowCatalog` vacío).
- Auditoría de huecos órgano × sustancia (p. ej. cocaína–corazón).
- Logros: `ruleReview`, platino y secretos.

---

## Riesgos y bloqueos

| ID | Riesgo / bloqueo | Estado |
| --- | --- | --- |
| R-API | Validación de Explorar/sustancias requiere API local; última sesión: `ECONNREFUSED`. No forzar `.env`, Postgres ni seeds. | Bloqueado |
| R-CLIN | La revisión clínica no es una casilla de tests. Publicar síntomas o Consejos sin ella sería un error de producto. | Pendiente |
| R-% | Confundir avance de curva con salud recuperada. | Pendiente de validación con usuarios |
| R-CAL | Reutilizar 1–7/8–56/57+ (`narrativePhaseWindows`) como calendario clínico. | Pendiente (guardrails de código existen; contenido de ventanas aún vacío) |
| R-NT | Neurotransmisores solo en commit local: se puede perder el hito si no se integra cuando el usuario lo autorice. | Pendiente |
| R-DUP | Duplicar párrafos NT como lista de síntomas. | Mitigado en catálogo editorial; falta UI |

---

## Próximos pasos (por dependencia, sin fechas)

1. **Cerrar técnicamente** el catálogo editorial de síntomas (estructura y copy ya locales; commit **solo** cuando el usuario lo autorice).
2. **Preparar la interfaz futura** de síntomas reutilizando el selector de fase de Explorar, con catálogo público vacío y sin filtrar candidatos pendientes.
3. **Integrar y validar neurotransmisores**: push/PR/merge/despliegue cuando se autorice; validación visual 320/375/430 y escritorio **con API**.
4. **Retomar UX-01–UX-12** en orden de producto: validar UX-03 y UX-04; luego Explorar (UX-05–07); atlas (UX-08–09); logros (UX-10–12).

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

- **Estado:** Pendiente de validación
- **Descripción:** Ajustar el tamaño de la figura anatómica en dispositivos móviles.
- **Criterio:** En 320/375/430 px la figura es usable, no recorta órganos relevantes ni deja un vacío excesivo. **No Completado** sin evidencia visual.
- **Evidencia:** Hay implementación (`d54c133`, `91724b3`, tests de clases en `adapt-live-dashboard.test.ts`). Falta validación visual explícita de este criterio.
- **Dependencias:** Dispositivo o emulación; no bloqueado por API.

### Mi recuperación

#### UX-04 — Resumen general de recuperación

- **Estado:** Pendiente de validación
- **Descripción:** Aclarar significado y cálculo del resumen. El usuario debe entender la agregación y que **no** es un porcentaje real de salud.
- **Criterio:** Copy y gráfico hablan de avance de curva educativa; no de salud recuperada; estados mixtos no muestran un % conjunto engañoso.
- **Evidencia:** Usuario: PR #46–#48 mejoraron explicaciones. Código: `3edece5`, `2cdeac6`, `591c74f`, `b53892c`, `feb8947`. Falta confirmar comprensión de usuario.
- **Dependencias:** Ninguna de código abierta; validación de producto pendiente.

### Explorar

#### UX-05 — Lenguaje y repetición de «catálogo»

- **Estado:** Pendiente de validación
- **Descripción:** Quitar repeticiones innecesarias de «catálogo» y mejorar el lenguaje.
- **Criterio:** En ES, «catálogo» no satura títulos, pistas, errores y fichas; el tono sigue siendo educativo.
- **Evidencia:** Copy ES/EN de Explorar reescrito (descripción, carga, errores, vacíos, pistas, categoría, órganos). Se conserva una mención en `ntPhaseNotice` (catálogo vs medición). Tests de paridad y de saturación. Falta validación visual con API en fichas de sustancia.
- **Dependencias:** Ninguna.

#### UX-06 — Enumeración de órganos y zonas (hipocampo)

- **Estado:** Pendiente de validación
- **Descripción:** Mejorar la lista de órganos y zonas, incluyendo el hipocampo cuando corresponda.
- **Criterio:** Si el índice educativo asocia hipocampo (u otra zona) a la sustancia, aparece en la ficha con el nombre localizado; no se inventan órganos.
- **Evidencia:** Título «Órganos y zonas» / «Organs and regions». Agrupación por `atlasSystems`. Alcohol y cannabis incluyen `brain-hippocampus` vía índices. Tests unitarios; falta validación visual de la ficha (API).
- **Dependencias:** UX-07 (los nombres enlazables reutilizan el contrato del atlas).

#### UX-07 — Navegar de órganos mencionados al atlas

- **Estado:** Pendiente de validación
- **Descripción:** Desde órganos y zonas de Explorar, ir a su ubicación en el explorador anatómico.
- **Criterio:** Cada órgano listado abre el atlas en el sistema/órgano correcto, **sin** afirmar que un neurotransmisor «pertenece» a un solo órgano.
- **Evidencia:** `anatomyExplorerHrefForOrgan` y enlaces por zona en fichas de sustancia y de sistema. Hipocampo: `?system=nervous-central&organ=brain-hippocampus`. Sin `substance`/`phase`/`tab`. Las tarjetas NT no enlazan órganos. Falta pulsar los enlaces en `/preview` y `/app` con API.
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
| Estado | Pendiente de validación |
| Qué es | MVP educativo en Explorar: tarjetas compactas, selector de fase, perfiles existentes, sin mediciones ni calendarios personales. Advertencias de alcohol (GABA/glutamato, abstinencia aguda) visibles fuera de un `<details>` cerrado. |
| Commit | `0a496273fa5e8f0dff55ae873ce1b3fd2fad8196` **local** |
| No hecho | Push, PR, merge, despliegue. Validación visual completa de la ficha de sustancia (API caída). |
| No es | Medición neuroquímica ni fase calculada por días de abstinencia. |

### Síntomas de abstinencia

| Campo | Valor |
| --- | --- |
| Estado | En desarrollo |
| Qué es | 40 fichas candidatas ES/EN (5 sustancias), 2 advertencias de alcohol (`alcohol.seizures`, `alcohol.medical_care`). |
| Publicación | **Catálogo publicado vacío.** Resolver público no devuelve pendientes de revisión. **No está disponible para usuarios.** |
| Revisión | Todas `pending_clinical_review` / `clinicalReview: "pending"`. |
| Archivos locales (sin commit) | `educational-withdrawal-symptoms.ts`, `.es.json`, `.en.json`, `.test.ts` |
| Copy | Refinamiento editorial hecho; sigue pendiente revisión clínica. |
| No hecho | Commit, interfaz, publicación, i18n de runtime. |

### Recuperación y anatomía (PR #45–#48)

| PR (según usuario) | Tema | Estado en este roadmap |
| --- | --- | --- |
| #45 | Orientación + mensajes × 60 (+ sizing móvil en el mismo frente) | UX-01 y UX-02 Completado; UX-03 Pendiente de validación |
| #46 | Abstinencia como eje; % de curva | Código integrado; UX-04 Pendiente de validación |
| #47 / #48 | Estados mixtos; gráfico móvil | Código en `develop` (`591c74f`, `b53892c`, `feb8947`); validación de comprensión y layout móvil pendiente |

No confundir progreso de curvas educativas con medición de salud.

---

## Plan de trabajo detallado

```
Síntomas (editorial local)
  → (autorización) commit del catálogo
  → UI que solo lee el catálogo publicado (vacío)
  → revisión clínica humana
  → ingestión al catálogo público (otro hito)

Neurotransmisores (0a49627)
  → (autorización) push / PR / merge
  → validación visual con API
  → despliegue solo si se autoriza

UX-03, UX-04
  → evidencia visual / de comprensión
  → entonces Completado

UX-05, UX-06, UX-07
  → Explorar (copy, listas, enlaces al atlas)

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
