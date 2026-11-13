# SEO-02B2-A — Arquitectura y planificación editorial de páginas educativas públicas

Documento de trabajo. **Solo análisis, diseño y documentación. No es implementación.**
Fecha: **2026-11-13**.
Referencias: `docs/review/seo/seo-02a-audit-and-growth-plan.md`, `docs/review/seo/seo-02b1-a-landing-faq-proposal.md`, SEO-02B1-B (PR #120).
Hito siguiente (no autorizado aquí): **SEO-02B2-B** (implementación mínima, si se aprueba).

---

## 1. Resumen ejecutivo

SOMA ya tiene base técnica SEO-01 correcta y una superficie pública indexable de **una sola URL** (`/`), reforzada por la FAQ bilingüe de SEO-02B1-B. El crecimiento orgánico no-marca sigue limitado por esa superficie, no por un fallo de indexación.

**Recomendación de conjunto mínimo:** publicar **dos** páginas educativas indexables en una futura SEO-02B2-B:

| # | Tema | URL propuesta (EN) | URL propuesta (ES) |
|---|---|---|---|
| 1 | Neuroadaptación (visión educativa) | `/en/learn/neuroadaptation` | `/es/learn/neuroadaptacion` |
| 2 | Modelos y curvas de recuperación | `/en/learn/recovery-models` | `/es/learn/modelos-de-recuperacion` |

La tercera candidata («qué puede y qué no puede medir Soma») **no** merece URL propia: se **fusiona** como sección fija de la página de modelos/curvas y permanece resumida en la FAQ de `/`.

**Renderizado recomendado:** HTML estático (o prerender de build) **solo** para las rutas `/learn` (y prefijos de idioma), con metadatos propios en el documento inicial. No SPA pura con meta dinámico. No migración a Next.js.

**Idiomas:** para `/learn`, rutas **diferenciadas por idioma** (opción 2). La landing `/` permanece bilingüe en una sola URL (política SEO-02A intacta). Esta divergencia está justificada: el contenido educativo es el activo indexable nuevo y necesita `lang` + cuerpo HTML coherentes sin JavaScript.

**Ciencia:** redactar solo con claims tipo A/B; claim C requieren re-chequeo frente a fuente primaria; claim D y todo `pending_clinical_review` quedan fuera. No inventar revisión clínica.

**No implementar** en este hito. Sin commit, push, PR, merge ni despliegue.

---

## 2. Estado Git

Inspección local **2026-11-13** tras `git fetch origin` y fast-forward autorizado:

| Referencia | Valor |
|---|---|
| Rama local | `develop` |
| HEAD local | `72e8698327d5c3dc19849c88025b5d8b716ddbe3` |
| `origin/main` | `72e8698` (sincronizado tras FF) |
| `origin/develop` | `dcd82ee7e2ab24265ec0a798b86bc9aad4d01c5c` (local **ahead 1** = merge commit de #120; **sin push** en este hito) |
| PR #120 | **Merged** — `feat(seo): add bilingual landing FAQ (SEO-02B1-B)` → `main` (`merge_commit_sha` = `72e8698`, `merged_at` ≈ 2026-11-13 13:30 UTC) |
| Commit de producto SEO-02B1-B | `dcd82ee` (ancestro de HEAD) |
| Ancestros | `origin/main` es ancestro de HEAD tras FF; HEAD ≡ `origin/main` |
| Working tree | Solo untracked **ajenos** (`docs/design/*`, otros `docs/review/` históricos). Este documento es el único entregable nuevo de SEO-02B2-A |

**Acciones Git realizadas aquí:** `fetch` + `merge --ff-only origin/main` (autorizado).
**No realizadas:** push, rebase, reset, cherry-pick, merge no-FF, force push, commit.

ROADMAP (`ROADMAP.md`): SEO-01A/B cerrados; SEO-02A completada; SEO-02B1-A aprobada; SEO-02B1-B figura aún como «implementado en local / pendiente de revisión» en el texto del roadmap (desactualizado respecto a PR #120 ya en `main` — **no se edita ROADMAP en este hito**). SEO-02B2 pendiente de diseño (este documento). SEO-02C pendiente.

---

## 3. Arquitectura SEO actual

### 3.1 Stack y rutas
| Pieza | Ruta / hecho verificado |
|---|---|
| SPA Vite + React | `apps/web/vite.config.ts` — plugin React; **sin** prerender/SSG |
| Router | `apps/web/src/App.tsx` — `BrowserRouter` / `Routes`; `/` → landing; `/preview/*` demo; `/app/*` protegido; legales/auth |
| HTML shell único | `apps/web/index.html` — title/description/canonical/OG/JSON-LD de la **landing**; script sincrónico `noindex` si `pathname ≠ /` |
| Política indexable | `apps/web/src/seo/public-site.ts` — `isIndexablePublicPath` solo `/`; `RENDER_X_ROBOTS_NOINDEX_PATHS` documenta Headers Render |
| Sync cliente | `DocumentSeo.tsx` + `document-meta.ts` — actualiza robots/meta tras navegación; copy i18n solo en `/` |
| robots | `apps/web/public/robots.txt` — `Allow: /`; Sitemap |
| sitemap | `apps/web/public/sitemap.xml` — solo `https://somarecovery.app/` |
| Tests | `apps/web/src/seo/public-site.test.ts`, `landing-v2-faq.test.ts` |
| Hosting | Static SPA en Render: rewrite a `index.html`; Headers `X-Robots-Tag: noindex, nofollow` en paths privados (no viven en este repo) |
| API | `https://api.somarecovery.app/robots.txt` → `Disallow: /` |

### 3.2 Limitaciones SPA para contenido educativo independiente
1. **Un solo HTML inicial** para todas las rutas: sin JS, un crawler débil ve metadatos (y `noscript`) de la landing, no el cuerpo de `/learn/...`.
2. El script de `index.html` marca **noindex** cualquier path ≠ `/` — hoy correcto; mañana bloquearía nuevas URLs públicas si no se amplía la allow-list **y** se entrega HTML propio.
3. `DocumentSeo` / `syncDocumentSeo` asumen un único documento indexable; canonical siempre `PUBLIC_LANDING_URL` en `/`.
4. i18n de landing es **cliente** (selector); no hay hreflang (correcto hoy).
5. Enlaces internos de valor SEO desde `/` apuntan en gran medida a `/preview` (**noindex**): útiles para UX, no para expandir el índice.
6. Bundle JS de la app (~2 MB medido en SEO-02A) es coste alto si cada página educativa hidrata la aplicación completa.

### 3.3 Qué ya cubre la superficie pública
- Propuesta de producto, límites clínicos, science/methodology, FAQ (SEO-02B1-B).
- Demo sin cuenta (enlace noindex).
- Centro de Apoyo y Explorar **dentro** de `/preview` y `/app` → **no** candidatos a indexación.

---

## 4. Comparativa de páginas candidatas

### Página A — Neuroadaptación

| Campo | Evaluación |
|---|---|
| **Título ES** | Neuroadaptación: qué cambia en el sistema nervioso (visión educativa) |
| **Título EN** | Neuroadaptation: what changes in the nervous system (an educational view) |
| **Propósito** | Explicar el concepto en lenguaje llano, alineado con la ficha in-app `neuroadaptation`, sin calendarios clínicos |
| **Intención de búsqueda** | Informacional / educativa (comprender el término y su relación con tolerancia, dependencia y abstinencia). **Sin** volumen inventado |
| **Público** | Adultos (18+) en abstinencia o curiosos sobre recuperación fisiológica; visitantes que llegan por tema, no solo por marca |
| **Conexión con SOMA** | Ficha publicada `neuroadaptation` (`explore-edu`); misión `edu-neuroadaptation-01`; Support «Procesos clave»; atlas `nervous-central` |
| **Estructura H1/H2/H3** | Ver §4.1 |
| **Contenido imprescindible** | Definición; plasticidad ≠ neurodegeneración; circuitos (mapa de trabajo); relación tolerancia/dependencia/metabolismo; límites; disclaimer; CTA demo + enlace a `/` |
| **Evidencias** | 4 citas de la ficha in-app (Nestler 2001; Kauer & Malenka 2007; Koob & Volkow 2016; Lüscher & Malenka 2011) — **bibliografía editorial**, no registro claim-a-claim `verified` |
| **Riesgos científicos** | Simplificar a «el cerebro se cura»; plazos universales; confundir adaptación con daño; extrapolar mecanismos a toda persona/sustancia |
| **Relación con otras páginas** | Cruza con modelos/curvas (límites); FAQ no sustituye esta profundidad; ficha Explorar permanece noindex |
| **Duplicación** | Media con Explorar in-app (intencional: versión pública más corta). Baja con FAQ |
| **Prioridad** | **Alta** |
| **Recomendación** | **Publicar** (una de las dos URLs del conjunto mínimo) |

#### 4.1 Estructura propuesta — Página A
- **H1:** título de página (ES/EN arriba)
- **H2:** ¿Qué es la neuroadaptación?
- **H2:** Plasticidad frente a neurodegeneración
- **H2:** Recompensa, estrés y control (mapa, no diagnóstico)
- **H2:** Relación con tolerancia, dependencia y metabolismo
- **H2:** Qué no afirma esta página / límites
- **H2:** Cómo lo aborda Soma (educativo; enlace demo)
- **H3** opcionales bajo cada H2 para analogía, sustancias distintas, bibliografía

**No afirmar:** plazos universales; «tu cerebro se reconfigura en X días»; que Soma mide plasticidad; que todas las adaptaciones son daño.

---

### Página B — Curvas educativas de SOMA

| Campo | Evaluación |
|---|---|
| **Título ES** | Curvas de recuperación fisiológica: modelos educativos, no diagnósticos |
| **Título EN** | Physiological recovery curves: educational models, not diagnoses |
| **Propósito** | Explicar qué representan las curvas/relojes del catálogo, cómo se interpretan y qué no miden |
| **Intención** | Informacional + aclaración de producto (reduce malentendidos de UI) |
| **Público** | Visitantes de landing/FAQ que quieren profundidad; usuarios potenciales antes de la demo |
| **Conexión** | Landing science/methodology; FAQ P2; `estimateCurve` / `curveProgress`; docs `docs/recovery-curves/`; seed `recovery-curves.ts` |
| **Estructura** | Ver §4.2 |
| **Contenido imprescindible** | Modelo vs individuo; formas (log/sig/lineal) cualitativas; confianza = solidez de fuentes; techo/horizonte como parámetros de catálogo; incertidumbre; sección «qué mide / qué no»; sin fórmulas internas |
| **Evidencias** | Copy ya publicado en `landing-v2.json` + README de curvas; **no** elevar refs `[NEEDS-VERIFICATION]` del seed a «verificadas» |
| **Riesgos** | Atribuir precisión fisiológica; publicar tablas seed; confundir `curveProgress` con «% de salud»; filtrar parámetros internos sin marco |
| **Relación** | Extiende science/methodology; FAQ se queda en respuesta corta; absorbe Página C |
| **Duplicación** | Media-alta con landing si se copia verbatim → mitigar con profundidad + sección de límites/medición |
| **Prioridad** | **Alta** |
| **Recomendación** | **Publicar** |

#### 4.2 Estructura propuesta — Página B
- **H1:** título de página
- **H2:** Qué es un modelo educativo de recuperación
- **H2:** Formas de curva (logarítmica, sigmoidea, lineal) — cualitativo
- **H2:** Confianza de la evidencia (alta/media/baja)
- **H2:** Población frente a trayectoria individual
- **H2:** Qué puede y qué no puede «medir» Soma *(absorbe Página C)*
- **H2:** Incertidumbre y limitaciones del catálogo
- **H2:** Cómo explorarlo en la demo (sin cuenta)

**Inspección de modelos (verificado en código; no inventar fórmulas públicas):**
- Núcleo: `packages/shared-types/src/recovery-math.ts` — `estimateCurve(daysAbstinent, model)` → `{ curveProgress, estimatedRecovery }`.
- Formas tipadas: `logarithmic` | `sigmoidal` | `linear` | `stepwise` (`recovery.ts`); seed actual sin filas `stepwise`; landing solo documenta tres formas.
- Parámetros de catálogo: `daysTo95Recovery`, `recoveryCeiling`, `confidenceLevel`.
- UI primaria: avance de trayectoria (`curveProgress` / `progressFraction`), **no** «porcentaje de salud recuperada».
- NT en Recuperación: perfiles **cualitativos** + fase ilustrativa fija (`post_acute`); no curvas de concentración personal.
- Atlas educativo: `resolveEducationalRecovery` → `personalized: false`.
- No publicar: constantes del motor, umbrales de logros, tablas seed completas, citas `[NEEDS-VERIFICATION]` como bibliografía verificada.

---

### Página C — Qué puede y qué no puede medir Soma

| Campo | Evaluación |
|---|---|
| **Título ES (si existiera)** | Qué puede y qué no puede medir Soma |
| **Título EN** | What Soma can and cannot measure |
| **Propósito** | Transparencia de límites |
| **Intención** | Aclaración / confianza |
| **Público** | Visitantes escépticos; mismo que FAQ |
| **Valor como URL** | **Bajo** tras SEO-02B1-B: FAQ ya responde curvas personales, no diagnóstico, no tratamiento; landing `science.limits` y methodology cubren el marco |
| **Riesgo de duplicación** | **Alto** |
| **Prioridad** | Baja como URL; **alta como sección** dentro de B |
| **Recomendación** | **Fusionar** en Página B (H2 dedicado) + mantener respuestas cortas en FAQ. **No** crear tercera URL en el conjunto mínimo |

---

### Decisión editorial del conjunto

| Candidata | Decisión |
|---|---|
| A Neuroadaptación | **Publicar** |
| B Curvas / modelos | **Publicar** (incluye sección de medición/límites) |
| C Medición | **Fusionar** → B; no URL propia |

**Conjunto mínimo:** **2 temas × 2 idiomas = 4 URLs indexables** (+ `/` existente).
No abrir blog. No indexar Explorar/Support/demo. No asumir que más páginas = más tráfico.

---

## 5. Evaluación editorial y científica

### 5.1 Clasificación de afirmaciones (A–D)

#### Página A — Neuroadaptación

| Afirmación (borrador) | Clase | Notas |
|---|---|---|
| Soma es app educativa; no dispositivo médico; no diagnostica ni trata | **A** | Landing, FAQ, legales |
| Existe ficha/misión educativas in-app sobre neuroadaptación | **A** | `explore-edu`, `edu-neuroadaptation-01` |
| Neuroadaptación = cambios del SN ante estimulación repetida; no es neurodegeneración por definición | **B** | Alineado ficha + refs citadas; re-leer fuentes en B2-B |
| Plasticidad sináptica / circuitos recompensa–estrés–control como mapa de trabajo | **B/C** | B a nivel general; detalle mecanismo → **C** hasta re-chequeo claim-a-claim |
| Puede contribuir a tolerancia y dependencia física | **B** | Ficha + misión |
| Metabolismo ≠ neuroadaptación | **B** | Ficha |
| Sin calendario universal de «recuperación cerebral» | **A/B** | Caveats producto + coherencia científica general |
| «Modificaciones estructurales de conexiones sinápticas» en todos los casos | **C** | Matizar: a veces / no siempre |
| Detalle DAT / nAChR / CB1 / etc. en página pública | **C** | Preferir remisión cualitativa; tokens internos ocultos |
| Plazos («cura en X días»), % salud, protocolos, dosis | **D** | Excluir |
| Contenido síntomas/consejos `pending_clinical_review` | **D** | Catálogos publicados vacíos; fuera del índice |

#### Página B — Modelos / curvas

| Afirmación | Clase | Notas |
|---|---|---|
| Curvas = modelos del catálogo situados en el tiempo; no biomarcadores | **A** | FAQ, science, recovery copy |
| Formas log/sig/lineal como patrones de interpolación educativa | **A** | `landing-v2` science |
| Confianza = solidez de fuentes del catálogo, no probabilidad individual | **A** | landing + `evidence.ts` |
| Promedios / condiciones estándar; sin comorbilidad ni sinergias de policonsumo modeladas | **A** | `science.limits`, `docs/recovery-curves/README.md` |
| `curveProgress` es avance de trayectoria del modelo | **A** | Código + ROADMAP |
| Valores numéricos concretos de órganos/sustancias como hechos clínicos | **D** / **C** | No tablas seed en público; si se cita un ejemplo orientativo → marco explícito de catálogo + disclaimer |
| Fórmulas internas del motor como «ciencia clínica» | **D** | Excluir |
| Todas las referencias del seed están verificadas | **D** | Landing admite que no; muchas `[NEEDS-VERIFICATION]` |

### 5.2 Qué se puede redactar ahora vs revisión externa

| Contenido | Estado |
|---|---|
| Marco de producto, disclaimers, FAQ ampliada en profundidad de curvas | Redactable ahora (tipo **A**) con revisión editorial humana |
| Neuroadaptación a nivel de ficha publicada (definición, caveats, analogía cuidadosa) | Redactable con **re-lectura** de las 4 refs (**B→confirmar**) antes de publicar |
| Mecanismos moleculares detallados, afirmaciones regionales fuertes | **Posponer** o acotar hasta revisión claim-a-claim (**C**) |
| Síntomas, consejos clínicos, calendarios | **Excluir** (**D**) |
| Autoría médica / «revisado clínicamente por…» | **No atribuir** si no existe |

**Incertidumbre documentada:** las citas de `explore-edu` no llevan flag `verified` tipado como en advice; tratarlas como bibliografía a re-verificar, no como prueba automática de cualquier frase.

---

## 6. Fuentes y limitaciones

### Fuentes inspeccionadas
| Fuente | Path | Uso para `/learn` |
|---|---|---|
| Ficha neuroadaptación ES/EN | `apps/web/src/i18n/locales/{es,en}/explore-edu.json` | Base editorial Página A |
| Allow-list Explorar | `apps/web/src/features/recovery-dashboard/explore/explore-edu.ts` | Confirma publicación in-app |
| Misión | `packages/shared-types/src/missions.ts` + i18n missions | Claim A de producto |
| Landing science/methodology/FAQ | `landing-v2.json`, `LandingV2Science.tsx`, `LandingV2Methodology.tsx`, `LandingV2Faq.tsx` | Base Página B; evitar copia literal |
| Math / tipos | `packages/shared-types/src/recovery-math.ts`, `recovery.ts` | Descripción A del funcionamiento |
| Seed curvas | `apps/api/prisma/seed/recovery-curves.ts` | **No** publicar tablas; entender parámetros |
| Docs metodología | `docs/recovery-curves/README.md` (+ substance md) | Límites del modelo |
| Advice / síntomas | `advice-catalog.ts`, `educational-withdrawal-symptoms.ts` | Gates; publicados vacíos |
| SEO previos | `seo-02a-…`, `seo-02b1-a-…` | Política de crecimiento |
| Política SEO código | `public-site.ts`, `index.html`, sitemap, robots | Contratos a extender en B2-B |

### Limitaciones permanentes a repetir en cada página
1. No diagnóstico, no pronóstico individual, no tratamiento, no dispositivo médico.
2. Modelos poblacionales / catálogo ≠ trayectoria clínica personal.
3. Variabilidad individual, comorbilidades y sinergias reales no modeladas.
4. Escalas internas ≠ porcentajes médicos.
5. Referencias del catálogo: no todas verificadas frente a primaria.
6. Contenido `pending_clinical_review` no entra al índice ni al marketing.

---

## 7. Alternativas de renderizado

| Criterio | A. SPA + meta dinámico | B. Prerender estático de rutas públicas | C. HTML estático independiente |
|---|---|---|---|
| Contenido sin JS | Cuerpo = shell landing / vacío | HTML propio por URL | HTML propio por URL |
| Metadatos por URL | Solo tras JS (frágil) | En documento inicial | En documento inicial |
| Canonical por página | Requiere reescribir `document-meta` | Nativo | Nativo |
| Indexabilidad | Débil para crawlers sin JS; choca con script noindex actual | Fuerte si allow-list + sitemap | Fuerte |
| Compatibilidad Vite | Ya existe | Plugin/build step adicional | `public/` o generador; sin tocar runtime app |
| Hosting Render | OK pero insuficiente solo | OK (archivos estáticos + SPA fallback) | OK |
| ES/EN | Selector cliente | Selector o HTML por idioma | Natural con HTML por idioma |
| Mantenimiento | Bajo código / alto riesgo SEO | Medio | Medio (doble vía visual) |
| Riesgos deploy | Ampliar allow-list sin HTML → soft content | Config rewrite/headers | Drift visual vs React |
| Complejidad / coste | Baja aparente, **alta deuda SEO** | Media | Media-baja si pocas páginas |
| Tests | Extender path allow-list | + snapshots HTML build | + validación archivos estáticos |

### Recomendación única
**Opción C acotada (preferida) o B equivalente en resultado:** generar o mantener **HTML estático por URL educativa** con title, description, canonical, robots `index,follow`, `lang`, H1–H2 y cuerpo educativo en el documento inicial; identidad visual alineada con landing (tokens CSS / clases compartidas o hoja mínima), **sin** cargar el bundle completo de la app como requisito para leer el contenido.

- **No** Opción A sola: no garantiza HTML/meta coherentes por URL con la arquitectura actual.
- **No** Next.js / SSR completo.
- Si en B2-B se prefiere prerender React (B) sobre HTML escrito/generado (C), el criterio de aceptación es el mismo: **GET sin JS** debe devolver cuerpo y meta correctos.

---

## 8. Alternativas de URLs e idiomas

### Opción 1 — Una URL por tema + selector ES/EN
Ejemplos: `/learn/neuroadaptation`, `/learn/recovery-models`.

| Pros | Contras |
|---|---|
| Consistente con landing | HTML inicial suele favorecer un idioma |
| Menos URLs | Sin hreflang real |
| Menos mantenimiento de pares | Peor deep-link por idioma |

### Opción 2 — Prefijo de idioma + slug localizado
Ejemplos:
- `/es/learn/neuroadaptacion` ↔ `/en/learn/neuroadaptation`
- `/es/learn/modelos-de-recuperacion` ↔ `/en/learn/recovery-models`

| Pros | Contras |
|---|---|
| `lang` y cuerpo correctos sin JS | 2× URLs |
| hreflang justificable | Más tests/sitemap |
| Mejor SEO temático bilingüe | Divergencia vs landing |

### Decisión
**Opción 2 para `/learn` únicamente.**
Landing `/` **sin cambio** (opción A de SEO-02A).
No generar hreflang hacia URLs que no existan.
No crear `/es`/`/en` para toda la app.
Slugs estables; evitar duplicar el mismo idioma en dos paths.

**Canonical:** cada URL canónica a sí misma.
**hreflang:** pares ES↔EN + `x-default` → EN (alineado con HTML shell actual en inglés), documentado en B2-B.
**Sitemap:** incluir las 4 URLs + `/`.

---

## 9. Arquitectura recomendada

```
https://somarecovery.app/                          ← landing bilingüe (existente)
https://somarecovery.app/en/learn/neuroadaptation
https://somarecovery.app/es/learn/neuroadaptacion
https://somarecovery.app/en/learn/recovery-models
https://somarecovery.app/es/learn/modelos-de-recuperacion
```

### Componentes lógicos (futuro B2-B; no implementar ahora)
1. **Allow-list indexable** en `public-site.ts` (hoy solo `/`) + script `index.html` alineado **o** rutas servidas como HTML estático que no dependan del shell indexable de la landing.
2. **Artefactos HTML** por URL (opción C/B) bajo convención de build/`public`.
3. **Sitemap** ampliado.
4. **Headers Render:** las nuevas rutas **no** deben aparecer en `RENDER_X_ROBOTS_NOINDEX_PATHS`. Comprobar que un prefijo amplio no las noindexe por accidente. Prefijos `/app`, `/preview`, auth, legales siguen noindex.
5. **Enlaces internos** desde landing (sección science/FAQ/footer) y entre las dos páginas.
6. **Sin** dependencia de API, auth, estado de recuperación, telemetría nueva.

### Estructura de archivos sugerida (propuesta)
```
apps/web/public/learn/…          # o salida de generador en dist/
apps/web/src/seo/public-site.ts  # allow-list + helpers canonical learn
apps/web/src/i18n/locales/{es,en}/learn-*.json  # si se reutiliza React prerender
docs/review/seo/                 # este diseño; runbook B2-B
```
La forma exacta (archivos en `public/` vs plugin prerender) se fija en B2-B; el contrato de aceptación no cambia.

---

## 10. Navegación pública

### Principios
- Arquitectura informativa **pequeña**: 2 páginas + landing.
- Sin nav global compleja ni «blog».
- Sin imágenes nuevas (reutilizar tipografía/color; opcional arte ya existente `process-neuroadaptation-240.webp` solo si no altera LCP de forma no medida — preferible texto-first).

### Descubrimiento
| Origen | Enlace propuesto |
|---|---|
| Landing — science / methodology | «Leer más: modelos de recuperación» → Página B |
| Landing — FAQ (P2) | Enlace textual «Más detalle sobre los modelos» → B |
| Landing — footer | Dos enlaces discretos: Neuroadaptación · Modelos |
| Página A ↔ B | Cruce mutuo al final |
| Ambas | «Volver a Soma» → `/` ; CTA demo → `/preview` (sigue noindex) |

### UX de página
- Breadcrumb simple: `Soma / Aprender / {título}` (o EN equivalente).
- Selector de idioma = **cambio de URL** al par hreflang (no solo `localStorage` en la misma URL).
- Disclaimer visible above-the-fold o tras el primer H2.
- Sin captura de datos de salud. Sin formularios clínicos.

---

## 11. Seguridad y privacidad

| Requisito | Cumplimiento previsto |
|---|---|
| Públicas, sin auth | Sí |
| Sin datos personales / panel privado | Sí — contenido estático de catálogo educativo |
| Sin tokens | Sí |
| Sin endpoints sensibles | Sí — no `fetch` a API |
| Sin estado de recuperación individual | Sí |
| Sin telemetría nueva | Sí — no añadir eventos |
| Sin cambiar recursos profesionales SUP | Sí |
| No ampliar superficie indexable por accidente | Allow-list explícita; privadas/demo/auth/legales siguen noindex; API `Disallow: /` intacto |
| No indexar Explorar/Support internos | Sí — solo `/learn` aprobado |

Cualquier rewrite SPA en Render debe servir el HTML correcto de `/learn` **antes** de caer al `index.html` de la landing (riesgo crítico de B2-B).

---

## 12. Rendimiento

| Aspecto | Evaluación (cualitativa; **sin** CWV nuevos medidos aquí) |
|---|---|
| JS | Páginas estáticas pueden omitir el bundle ~2 MB de la app → mejora probable de TTI frente a hidratar React completo |
| HTML inicial | Cuerpo educativo disponible de inmediato (objetivo LCP de texto) |
| Imágenes | Preferir páginas text-first; evitar hero PNG 1,7 MB de landing |
| CLS/INP | Bajo riesgo si markup simple; no afirmar números |
| Móvil | Tipografía legible, márgenes, disclaimer sin solaparse |

**No** atribuir scores Lighthouse sin medición. Optimización de hero de landing sigue fuera de alcance (SEO-02A B5).

---

## 13. SEO técnico (requisitos por página futura)

Para cada URL `/es|en/learn/...`:

| Requisito | Detalle |
|---|---|
| URL indexable | Allow-list explícita |
| HTTP | 200; sin soft-404 |
| HTML propio | Title, meta description, H1, cuerpo |
| Canonical | Autoreferencia HTTPS apex |
| Robots | `index,follow` (meta y, si aplica, ausencia de X-Robots noindex) |
| Sitemap | Incluida |
| OG/Twitter | Por página; imagen: reutilizar asset existente con alt educativo o omitir imagen grande si no aporta |
| Idioma | `html[lang]` = `es` \| `en` |
| hreflang | Par ES↔EN + x-default |
| Enlaces internos | Desde `/` y entre learn |
| Structured data | **Opcional y mínimo.** Preferible `WebPage`/`Article` genérico solo si el copy es estable; **no** `MedicalWebPage` / claims clínicos; **no** `FAQPage` aquí (FAQ vive en `/`) |
| Prueba sin JS | curl/fetch del HTML muestra H1 + párrafo + meta correctos |
| Privadas | Siguen en `RENDER_X_ROBOTS_NOINDEX_PATHS` |

**Restricción hosting:** Headers Render no están en el repo; B2-B debe incluir checklist operativo de no añadir `/learn` a noindex y de servir estáticos con precedencia correcta.

---

## 14. Plan de implementación SEO-02B2-B

### Separación de frentes
| Frente | Contenido |
|---|---|
| **Arquitectura técnica** | HTML estático/prerender, rutas, allow-list, sitemap, headers, tests, enlaces landing |
| **Redacción editorial** | Copy ES/EN de las 2 páginas; disclaimers; breadcrumbs |
| **Revisión científica** | Re-lectura refs Página A; vetar D/C no resueltos; no atribución clínica falsa |
| **Publicación** | Solo tras aceptación de contenido + rutas + verificación prod |

### Alcance mínimo B2-B
1. **4 URLs** (2 temas × 2 idiomas) según §9.
2. Extender contratos SEO (`public-site.ts`, tests, sitemap).
3. Enlaces desde landing (science/FAQ/footer) — cambios de copy mínimos.
4. **Sin** ROADMAP edit salvo si se autoriza en otro hito; este documento no lo toca.
5. **Sin** indexar demo/app/legales; **sin** Next.js; **sin** analytics nuevos.

### Dependencias reutilizables
- Tokens/visual landing-v2.
- Copy science/limits/FAQ como fuente, no como pegado.
- Ficha `neuroadaptation` + caveats.
- `PUBLIC_SITE_ORIGIN` y helpers SEO.

### Hosting
Cambios **solo si indispensables**: rewrite/orden de estáticos; verificar Headers. No nuevas infraestructuras de pago.

### Tests (previstos)
- Allow-list paths indexables.
- Sitemap contiene exactamente `/` + 4 learn (o el conjunto aprobado).
- HTML de cada learn: title/description/canonical/H1/`lang`.
- hreflang bilateral.
- Rutas privadas siguen noindex en contrato.
- Copy: ausencia de frases **D** (lista de denegación en test de fuente).
- Build produce artefactos esperados.

### Validación en producción (cuando haya deploy autorizado)
- GET sin JS de cada URL.
- Headers: learn sin X-Robots noindex; `/app` y `/preview` con noindex.
- Solicitud de indexación GSC de las nuevas URLs (operativo; SEO-02C).

### Riesgos B2-B
1. Rewrite SPA sirve landing HTML en `/learn` → contenido incorrecto indexado.
2. Olvidar Headers / allow-list → noindex o indexación accidental de privadas.
3. Drift científico respecto a ficha in-app.
4. Duplicación excesiva con landing (canibalización interna).
5. Publicar refs no verificadas como «probadas».

### Criterios de aceptación (producto B2-B)
Ver §15.

---

## 15. Criterios de aceptación

### Este hito SEO-02B2-A (diseño)
- [x] Documento único en `docs/review/seo/seo-02b2-a-public-learning-architecture.md`
- [x] Comparativa A/B/C con decisión de conjunto mínimo
- [x] Arquitectura de renderizado y URLs elegidas
- [x] Fuentes y clasificación A–D
- [x] Plan B2-B sin implementación de código
- [x] Sin commit / push / PR / merge / despliegue
- [x] Untracked ajenos preservados; solo este entregable nuevo

### Futuro SEO-02B2-B (cuando se autorice)
- [ ] 2 temas × 2 idiomas publicados según §9
- [ ] HTML y meta correctos **sin JavaScript**
- [ ] Sitemap y allow-list actualizados
- [ ] Privadas/demo intactas (noindex)
- [ ] Sin claims D; C resueltos o eliminados
- [ ] Enlaces desde landing; breadcrumbs; disclaimer
- [ ] Tests verdes; verificación HTTP en producción tras deploy autorizado
- [ ] Revisión editorial + científica humana documentada antes de merge a `main`

---

## 16. Decisiones pendientes (requieren aprobación)

1. **¿Aprobar el conjunto mínimo de 2 temas (A+B) y fusionar C?** (recomendado: sí)
2. **¿Confirmar Opción 2 de URLs solo para `/learn`?** (recomendado: sí; alternativa: Opción 1 si se prioriza mínima complejidad)
3. **¿HTML estático (C) vs prerender React (B)?** Misma aceptación; elegir en kickoff B2-B
4. **¿Quién firma la re-lectura de las 4 referencias de neuroadaptación?** (no inventar credenciales)
5. **¿Incluir enlace footer + science en el mismo PR de B2-B o en un follow-up?**
6. **¿`x-default` → EN confirmado?**
7. **¿Actualizar ROADMAP (estado SEO-02B1-B / SEO-02B2-A) en un hito documental aparte?**
8. **¿Medir CWV tras publicar learn antes de tocar hero de landing?** (recomendado)

---

## Apéndice — Mapa de riesgos principales

| Riesgo | Mitigación |
|---|---|
| Sobrepromesa científica | Clasificación A–D; caveats; exclusión D |
| Soft content SPA | HTML estático/prerender obligatorio |
| Indexación accidental de privadas | Allow-list + Headers + tests |
| Duplicación FAQ/landing | Página C fusionada; B aporta profundidad, no eco |
| Coste de mantenimiento bilingüe | Solo 2 temas; sin blog |
| Creer que más URLs = tráfico | Medición GSC en SEO-02C; sin promesas de volumen |

---

**Fin SEO-02B2-A.**
SIN COMMIT. SIN PUSH. SIN PR. SIN MERGE. SIN DESPLIEGUE.
