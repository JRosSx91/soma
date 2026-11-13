# SEO-02A — Auditoría técnica, editorial y estrategia de crecimiento orgánico

Documento de trabajo. **Solo lectura de producto. No es implementación.**
Fecha de auditoría: **2026-11-13**.
Método: inspección de repositorio local + peticiones HTTP a producción + inspección del DOM renderizado en Chromium (navegador Cursor) sobre `https://somarecovery.app/`.
Hito siguiente (no autorizado aquí): SEO-02B.

---

## 1. Resumen ejecutivo

La base técnica de SEO-01A/B está **bien implementada** para una SPA Vite/React con una sola URL pública indexable:

- Landing `https://somarecovery.app/` con `index,follow`, canonical, Open Graph, Twitter Cards y JSON-LD en el HTML inicial.
- `robots.txt` permite el rastreo (necesario para que se lean `noindex` / `X-Robots-Tag`).
- `sitemap.xml` declara solo `/`.
- Rutas privadas/demo/auth/legales envían `X-Robots-Tag: noindex, nofollow` en producción (Render Headers).
- API `https://api.somarecovery.app/robots.txt` → `Disallow: /` (correcto; no desbloquear).
- HTTP → HTTPS (301). `www` → apex (301).

El cuello de botella actual **no es un fallo grave de indexación**, sino la **superficie pública**: una sola URL indexable, consultas casi exclusivamente de marca (`soma recovery`), y un volumen GSC muy bajo (19 impresiones / 1 clic en 28 días). Google ya indexa la landing; el crecimiento orgánico depende de contenido público adicional, claridad editorial y descubrimiento externo — no de migrar a Next.js ni de indexar `/app` o `/preview`.

**Prerenderización:** no justificada como bloqueante. El HTML estático de `/` ya aporta título, descripción, canonical y un `noscript` mínimo; Googlebot renderiza JavaScript. Optimizar el HTML inicial del cuerpo sería un refuerzo opcional, no un requisito de SEO-02B.

**Idiomas:** mantener **una única URL pública bilingüe** (opción A). Rutas `/es` `/en` solo merecen consideración cuando existan varias páginas públicas estables.

---

## 2. Contexto y métricas iniciales

### Producto
SOMA es una aplicación web educativa de apoyo a personas adultas en recuperación fisiológica / neuroadaptación. No diagnostica, no pronostica individualmente y no trata. Idiomas de producto: ES y EN. Sitio público: `https://somarecovery.app/`. API: `https://api.somarecovery.app/`.

### Search Console (aportado por el propietario; periodo 28 días)
| Métrica | Valor |
|---|---|
| Impresiones | 19 |
| Clics | 1 |
| CTR medio | 5,3 % |
| Posición media | 18,4 |
| Consultas visibles | `soma recovery` (6), `soma password` (1) |
| URLs indexadas (informe) | 3 |
| URLs no indexadas (informe) | 5 |

URLs que el informe marca como indexadas (pueden incluir estados previos al último rastreo):

1. `https://somarecovery.app/`
2. `https://somarecovery.app/reset-password`
3. `http://somarecovery.app/`

Verificaciones del propietario (aceptadas aquí; contrastadas en parte el 2026-11-13):

- `/reset-password` tiene directiva `noindex` vigente.
- HTTP redirige a HTTPS.
- API bloqueada en `robots.txt`.
- Exclusiones de rutas privadas son intencionadas.

**Interpretación:** con ~19 impresiones, los CTR y posiciones medias **no son estadísticamente útiles** para optimizar snippets. La señal útil es: presencia de marca + posible residual de URLs antiguas en el índice. No atribuir a GSC datos no aportados (CWV de Search Console, cobertura detallada por URL, etc.).

---

## 3. Estado Git

Inspección local **2026-11-13** (sin `fetch` obligatorio; remoto ya alineado tras SUP-01E2-B):

| Referencia | Valor |
|---|---|
| Rama | `develop` |
| HEAD | `7c716200f3648e3f5ace42c6b52db43277210100` |
| `origin/develop` | `7c71620` (sincronizado) |
| `origin/main` | `8bdca1cc7ef3953da61c55933590a99e4b427494` (merge PR #118) |
| Working tree | Solo untracked ajenos (`docs/design/*`, otros `docs/review/` históricos). Este documento es el único entregable nuevo de SEO-02A. |

**Importante:** el código local de SEO (`apps/web/index.html`, `public/robots.txt`, `public/sitemap.xml`, `src/seo/*`) coincide en contratos con lo observado en producción para metadatos estáticos de la landing. El SHA Live de panel Render **no** se recopió en esta auditoría; el bundle público observado fue `index-uRN3u1Vu.js` (distinto de hashes citados históricamente en `ROADMAP.md`). No se afirma equivalencia exacta `main` ↔ Live sin panel.

ROADMAP (`ROADMAP.md`): **SEO-01A** y **SEO-01B** cerrados (2026-11-12). **WEB-02** (identidad/filosofía) pendiente. No existe aún hito SEO-02 en el roadmap (este documento lo propone como fase de diseño previa a implementación).

---

## 4. Auditoría de indexación

### 4.1 Artefactos del repositorio
| Artefacto | Ruta | Hallazgo |
|---|---|---|
| HTML shell | `apps/web/index.html` | Title/description EN; `robots=index,follow`; canonical `https://somarecovery.app/`; OG/Twitter; JSON-LD `WebApplication`; script sincrónico `noindex` fuera de `/`; `noscript` con H1+párrafo |
| robots | `apps/web/public/robots.txt` | `Allow: /`; Sitemap; **sin** `Disallow` de rutas privadas (intencional) |
| sitemap | `apps/web/public/sitemap.xml` | Solo `https://somarecovery.app/` |
| Política código | `apps/web/src/seo/public-site.ts` | Solo `/` indexable; lista `RENDER_X_ROBOTS_NOINDEX_PATHS` |
| Sync cliente | `apps/web/src/seo/document-meta.ts`, `DocumentSeo.tsx` | Actualiza meta/canonical/JSON-LD tras navegación y i18n |
| Tests | `apps/web/src/seo/public-site.test.ts` | Contratos SEO-01A (paths, robots, sitemap, copy no clínico, JSON-LD) |
| Vite | `apps/web/vite.config.ts` | SPA estándar; sin prerender |

### 4.2 Producción (HTTP, 2026-11-13)
| URL | Status | X-Robots-Tag | Notas |
|---|---|---|---|
| `https://somarecovery.app/` | 200 | (ausente) | Meta `index,follow`; canonical presente en HTML |
| `https://somarecovery.app/robots.txt` | 200 | — | Idéntico al repo |
| `https://somarecovery.app/sitemap.xml` | 200 | — | Solo `/` |
| `https://somarecovery.app/reset-password` | 200 | `noindex, nofollow` | HTML shell aún contiene meta estática `index,follow` + canonical **antes** de JS; la cabecera prevalece |
| `/app`, `/login`, `/privacy`, `/terms`, `/cookies`, `/forgot-password`, `/onboarding`, `/preview`, `/achievements`, `/landing-2`, `/register` | 200 | `noindex, nofollow` | Confirmado muestreo |
| `http://somarecovery.app/` | 301 → `https://somarecovery.app/` | — | Canonicalización HTTPS OK |
| `https://www.somarecovery.app/` | 301 → `https://somarecovery.app/` | — | Apex preferido |
| `https://api.somarecovery.app/robots.txt` | 200 | — | `Disallow: /` |

### 4.3 Clasificación
| Caso | Tipo |
|---|---|
| Landing indexable con metadatos en HTML | Correcto |
| Privadas/demo/auth con `X-Robots-Tag` | Exclusión intencionada + implementación correcta |
| API `Disallow: /` | Exclusión intencionada |
| GSC aún lista `/reset-password` o `http://` como indexadas | Dato posiblemente **obsoleto** / cola de desindexación; no defecto de código actual |
| Meta `index,follow` en el HTML crudo de rutas privadas | Particularidad SPA (mismo `index.html`); mitigada por cabecera + script head. Google usa la regla más restrictiva cuando hay conflicto |
| Legales con `noindex` | Intencional hoy (confianza vía producto, no vía ranking). Reconsiderar solo con criterio editorial explícito |
| Sitemap de una URL | Alineado con política actual; limitar crecimiento orgánico hasta ampliar superficie pública |

### 4.4 Defectos reales vs no
- **No se confirma** un defecto técnico que impida indexar la landing.
- **Sí se confirma** tensión SPA: el cuerpo HTML de rutas no `/` sigue siendo el shell de la landing hasta que JS/cabeceras actúan. La **cabecera** es la salvaguarda correcta (y está presente).
- **No proponer** desbloquear la API ni indexar autenticación, cuentas, paneles o DEMO.

---

## 5. Renderizado HTML / SPA

### A. HTML entregado inicialmente (sin ejecutar el bundle React)
Observado en producción para `/`:

- `<title>` y `meta description` educativos en **inglés**.
- `link rel="canonical"`.
- `meta robots=index,follow`.
- Open Graph / Twitter Cards (locale OG fija `en`).
- JSON-LD `WebApplication` / `EducationalApplication`, precio 0 EUR.
- `<noscript>`: H1 «Soma» + párrafo educativo + aviso de que se requiere JavaScript.
- `#root` vacío; el copy largo de la landing **no** está en el HTML estático.
- Script de idioma: ajusta `html[lang]` desde `localStorage` / `navigator` (ES para códigos iberianos; EN en resto).

### B. DOM tras JavaScript (Chromium, 2026-11-13)
- H1: «Your body changes. Discover how it evolves.» (EN) / «Tu cuerpo cambia. Descubre cómo evoluciona.» (ES).
- Secciones H2: features, journey, atlas, science, methodology, origin (WEB-02 parcial ya en landing), missions/journal, expedition, achievements, closing.
- Enlaces públicos a demo (`/preview/...`), registro/login, legales (estos últimos noindex).
- `document.title` y meta description se localizan vía `landing-v2` + `DocumentSeo` al cambiar idioma **sin cambiar la URL**.

### Lectura por tipo de rastreador
| Capacidad | Qué ve |
|---|---|
| Sin JS | Title, description, canonical, OG, JSON-LD, noscript breve |
| Con JS (p. ej. Googlebot moderno) | Landing completa ES o EN según detección/idioma; estructura semántica rica |

**Limitación real:** otros buscadores o previsualizadores débiles en JS verán poco cuerpo. **Solución más simple si se prioriza:** enriquecer el `noscript` o un bloque estático mínimo visible (sin Next.js). Prerender de `/` es alternativa intermedia; migración a SSR completo es sobreingeniería ahora.

---

## 6. Internacionalización SEO

| Aspecto | Estado |
|---|---|
| Idioma HTML inicial | `lang="en"` + script pre-React |
| Detección | `soma.i18n.lang` / navigator → ES o EN |
| Copy localizado | `apps/web/src/i18n/locales/{es,en}/landing-v2.json` (`metaTitle`, `metaDescription`, hero, etc.) |
| Canonical | Siempre `https://somarecovery.app/` |
| hreflang | Ausente (correcto sin URLs por idioma; tests lo afirman) |
| og:locale | Estático `en` en HTML; no se observa actualización dinámica en `document-meta.ts` |
| Indexabilidad por idioma | Una sola URL; Google no puede rankear ES y EN como documentos distintos |

### Comparación de estrategias
| | A. Una URL bilingüe (actual) | B. Rutas `/es` y `/en` |
|---|---|---|
| Complejidad | Baja | Media-alta (rutas, canonical, hreflang, sitemap, tests, redirects) |
| UX | Selector en producto; coherente con app | Mejor deep-link por idioma |
| Indexación | Un documento; idioma dominante según crawler | Dos documentos indexables |
| Mantenimiento | Ya resuelto | Duplicación de contratos SEO + riesgo de soft-404 SPA |
| Recomendación SEO-02A | **Mantener A** | Posponer hasta tener ≥2–3 páginas públicas estables |

No proponer idiomas adicionales.

---

## 7. Landing pública

### Fortalezas
- Propuesta clara: modelos educativos de recuperación fisiológica; límites clínicos repetidos (no dispositivo médico, no diagnóstico, no predicción individual).
- Público implícito: adultos en procesos de abstinencia/recuperación que quieren comprender el cuerpo.
- Oferta: recuperación, NT, sustancias, atlas, bitácora, misiones, logros, expedición; demo sin cuenta.
- Jerarquía H1 → H2 → H3 razonable tras render.
- Bloque «¿Por qué Soma?» / etymology ya cubre parte de WEB-02.
- CTAs: crear cuenta (invitación en beta), demo, entrar.

### Debilidades orientadas a búsqueda (no necesariamente bugs de producto)
- Una sola URL concentra todo el mensaje; pocas anclas indexables temáticas (neuroadaptación, sueño, estrés, etc.).
- Title/description estáticos EN pueden no representar bien consultas ES hasta el render.
- Enlaces internos de valor SEO apuntan mayoritariamente a `/preview` (noindex): útiles para UX, no para expandir el índice.
- Tension marketing vs rigor: bien manejada con disclaimers; hay que preservarlos en cualquier ampliación de contenido.

**No se modifica copy en esta fase.**

---

## 8. Oportunidades de contenido ES/EN

**Sin volúmenes inventados.** Las consultas GSC actuales no aportan temas; las propuestas salen del propio producto (landing, catálogo educativo, Centro de Apoyo, misiones).

| # | Tema | Intención | Público | Título ES (borrador) | Título EN (borrador) | Utilidad | Evidencias / riesgos | Estructura | Vínculo SOMA | Prioridad |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Qué son (y no son) las curvas de recuperación | Educativa / aclaración | Adultos curiosos + usuarios potenciales | «Curvas de recuperación fisiológica: modelos educativos, no diagnósticos» | «Physiological recovery curves: educational models, not diagnoses» | Alta: reduce malentendidos | Fuentes de metodología del catálogo; **no** citar estudios no verificados | Definición → límites → cómo Soma las usa → CTA demo | Landing science/methodology | Alta |
| 2 | Neuroadaptación en lenguaje llano | Educativa | Personas que dejan una sustancia | «Neuroadaptación: qué cambia en el sistema nervioso (visión educativa)» | «Neuroadaptation: what changes in the nervous system (educational view)» | Alta alineación con producto | Evitar “tu cerebro se cura en X días”; separar querer/disfrutar (misión existente) | Concepto → ejemplos cualitativos → límites → misiones/NT | Misiones + NT | Alta |
| 3 | Tiempo y ritmo de la recuperación | Educativa | Quienes esperan cambios lineales | «La recuperación no ocurre de un día para otro» | «Recovery does not happen overnight» | Media-alta; ya es H2 de landing | No inventar calendarios clínicos | Ritmos por sistema → modelo vs individuo → demo timeline | Landing journey | Media |
| 4 | Sueño y recuperación (educativo) | Educativa / hábito | Adultos con sueño irregular en abstinencia | «Sueño y recuperación: una mirada educativa» | «Sleep and recovery: an educational look» | Media; aparece en logros/bitácora | Riesgo de consejo médico; remitir a profesional | Qué observa la ciencia de forma general → qué registra Soma → no es tratamiento | Bitácora / logros sueño | Media |
| 5 | Estrés, pausa y herramientas de apoyo | Educativa / apoyo | Usuarios del Centro de Apoyo | «Estrés y pausas: herramientas educativas en Soma» | «Stress and pauses: educational tools in Soma» | Media; contenido SUP ya existe en app | No sustituir terapia; emergencias → recursos oficiales | Pausas → respiración/estrategias → límites → enlace in-app | Support hub (noindex hoy) | Media (solo si hay URL pública) |
| 6 | Abstinencia vs “porcentaje de salud” | Aclaración de producto | Usuarios que malinterpretan UI | «Por qué Soma no muestra un “porcentaje de salud recuperada”» | «Why Soma does not show a “percent recovered” score» | Alta para confianza | Alineado con ROADMAP / disclaimers | Explicar `curveProgress` → analogía → límites | Recuperación / FAQ | Alta como FAQ corta |

**No** publicar textos masivos generados por IA. **No** reutilizar contenido de terceros sin derechos. Contenido `pending_clinical_review` (p. ej. síntomas de abstinencia en roadmap) **no** es candidato público.

---

## 9. Fiabilidad científica y editorial

Necesidades (estado actual → hueco):

| Necesidad | Estado |
|---|---|
| Distinción educativa vs consejo médico | Fuerte en landing y legales |
| Transparencia de limitaciones del modelo | Fuerte (confidence levels, limits copy) |
| Autoría / responsable editorial visible en páginas públicas | Débil en landing (identidad en legales; BETA-01D.3 en revisión jurídica) |
| Fechas de revisión de artículos | N/A (aún no hay artículos públicos) |
| Fuentes verificables citables | Parcial en producto; no hay bibliografía pública estable por URL |
| Coherencia ES/EN | Buena en `landing-v2` |
| Credenciales médicas | **No inventar**; no atribuir revisión clínica inexistente |
| Contenidos pendientes de revisión clínica | Mantener fuera del índice y del marketing |

Cualquier SEO-02B de contenidos debe exigir: disclaimer fijo, sin promesas individuales, sin “tratamientos”, y revisión editorial humana.

---

## 10. Rendimiento y UX

### Medido (2026-11-13)
| Recurso | Tamaño aprox. |
|---|---|
| JS principal `index-uRN3u1Vu.js` | ~1,98 MB |
| CSS `index-DxKOPtsS.css` | ~86 KB |
| Hero PNG `hero-holographic-anatomy.png` | ~1,72 MB |

### No medido en esta auditoría
- Core Web Vitals de campo (CrUX / GSC).
- Lighthouse lab completo (LCP/CLS/INP numéricos).
- Experiencia móvil de campo.

### Hipótesis (no afirmar como CWV fallido)
El hero PNG ~1,7 MB con `fetchPriority="high"` es un candidato claro a **LCP pesado**. El JS ~2 MB encarece TTI/hidratación. Ya existen hitos IMG-PERF en producto interno; la landing pública aún sirve PNG grande.

**Recomendación:** medir antes de optimizar. Si LCP de campo es pobre, comprimir/WebP/AVIF del hero es alto impacto y bajo riesgo relativo. Microoptimizaciones de CSS o tree-shaking agresivo sin métrica = sobreingeniería.

Accesibilidad básica observada: skip link, H1 único, selector de idioma, disclaimers. No es una auditoría a11y completa.

---

## 11. Autoridad y descubrimiento

Formas legítimas (sin comprar enlaces ni granjas):

1. **Perfiles oficiales** (MKT-01 residual / MKT-PR-01D): LinkedIn, etc., enlazando la landing canónica.
2. **Notas de producto / README** públicos alineados con funciones reales.
3. **Prensa o colaboraciones** educativas (no clínicas) cuando el copy esté revisado.
4. **Citas a fuentes** en futuros artículos públicos (autoridad temática, no manipulación de PageRank).
5. Distinguir tráfico social/directo de orgánico en la revisión semanal MKT-01C.

No prometer posiciones. No spam automatizado.

---

## 12. Matriz de prioridades

| Ítem | Clase | Notas |
|---|---|---|
| Mantener `X-Robots-Tag` + sitemap solo `/` + API disallow | Imprescindible ahora (no tocar) | Ya correcto |
| Higiene GSC: validar desindexación `/reset-password` y `http://` | Imprescindible ahora (operativo) | Sin código |
| Medir CWV / peso hero antes de cambios perf | Imprescindible antes de perf | Evidencia primero |
| Decidir superficie de contenido público (FAQ/artículos) | Imprescindible para crecer | Requiere aprobación |
| Mantener URL única bilingüe | Imprescindible ahora | Evita hreflang prematuro |
| Enriquecer `noscript` / HTML estático mínimo | Recomendable después | Ayuda crawlers débiles |
| Optimizar hero (WebP) si LCP lo justifica | Recomendable después | |
| Rutas `/es` `/en` | Posponer | |
| Prerender/SSR completo / Next.js | Posponer | Sobreingeniería |
| Indexar legales | Posponer / decisión editorial | |
| Indexar demo o app | No hacer | Privacidad y política |

---

## 13. Propuesta de SEO-02B (implementación mínima)

Agrupación propuesta. **No implementar en SEO-02A.**

### B0 — Operación GSC (sin código)
- **Problema:** Informe con URLs residuales.
- **Evidencia:** GSC propietario + HTTP actual con `noindex` / 301.
- **Solución:** Inspección de URL, solicitar indexación solo de `/`, monitorizar salida de `/reset-password` y variante HTTP.
- **Beneficio:** Claridad de cobertura; sin garantías de plazo.
- **Riesgo:** Bajo.
- **Complejidad:** Baja.
- **Prioridad:** Imprescindible ahora.
- **Aceptación:** Documentar estados GSC tras 1–2 ciclos de rastreo.

### B1 — Bloqueantes técnicos
- **Ninguno confirmado** que bloquee la indexación de la landing.
- Opcional menor: documentar en runbook que Headers Render deben incluir siempre la lista de `RENDER_X_ROBOTS_NOINDEX_PATHS` (ya en código como contrato).

### B2 — Landing (copy / claridad)
- **Problema:** Una URL debe trabajar consultas de marca + comprensión del producto.
- **Evidencia:** Consultas GSC solo marca; landing ya rica tras JS.
- **Solución mínima:** Ajustes editoriales puntuales ES/EN (title/description si se aprueba) + posible FAQ corta pública **en la misma landing** o ancla `#faq` indexable; alinear con WEB-02 si se abre.
- **Beneficio:** Mejor snippet/relevancia; sin garantía de tráfico.
- **Riesgo:** Regresión de tono clínico / tests de copy.
- **Complejidad:** Baja–media.
- **Prioridad:** Recomendable.
- **Tests:** Extender contratos `public-site.test.ts` / tests landing-v2; revisión editorial humana.

### B3 — Estrategia de idiomas
- **Solución:** Confirmar opción A (URL única). Opcional: sincronizar `og:locale` / `og:locale:alternate` con el idioma activo en cliente (mejora menor, no crea URLs).
- **Prioridad:** Confirmación documental ahora; código opcional después.

### B4 — Contenido educativo público
- **Problema:** Una URL limita descubrimiento temático.
- **Evidencia:** Sitemap de 1 URL; producto rico detrás de noindex.
- **Solución mínima:** 1–3 páginas públicas estáticas o rutas SPA **indexables** (p. ej. `/learn/...`) con HTML meta por ruta, añadidas al sitemap, disclaimers, ES/EN vía misma estrategia A **o** paths por idioma solo si se aprueba B.
- Empezar por temas 1, 2 y 6 de la tabla §8.
- **Beneficio:** Nuevas puertas de entrada orgánicas; sin garantía de volumen.
- **Riesgo:** Alcance clínico, mantenimiento bilingüe, soft-404 SPA, fuga de contenido no revisado.
- **Complejidad:** Media.
- **Prioridad:** Imprescindible para crecimiento real; **requiere aprobación de alcance**.
- **Aceptación:** Rutas en sitemap; `index,follow` solo en allow-list; tests SEO path; sin datos personales; sin `pending_clinical_review`.

### B5 — Rendimiento
- Solo si medición lo justifica: hero WebP/AVIF + dimensions; posible `srcset`.
- **No** rehacer bundling completo en SEO-02B.

### B6 — Medición
- Continuar MKT-01C: revisión semanal GSC (impresiones, consultas, cobertura).
- Con <100 impresiones/mes: no optimizar por CTR; mirar **nuevas consultas** y **nuevas URLs indexadas**.
- No añadir analytics invasivos que violen la postura de privacidad.

---

## 14. Riesgos

1. Ampliar contenido salud-adjacent sin revisión → riesgo reputacional/legal.
2. Indexar DEMO/app por error de Headers o sitemap → fuga de superficies privadas.
3. Prerender/SSR prematuro → coste de mantenimiento alto para poco tráfico.
4. Rutas por idioma prematuras → deuda y canibalización.
5. Sobreinterpretar GSC con N≈19.
6. Confundir enlaces sociales con SEO.
7. Desalineación Live vs git si no se verifica SHA de panel tras deploys.

---

## 15. Evidencia de cada hallazgo (índice)

| Hallazgo | Evidencia |
|---|---|
| Metadatos landing en HTML | GET `https://somarecovery.app/` 2026-11-13; `apps/web/index.html` |
| Sitemap solo `/` | Prod + `apps/web/public/sitemap.xml` |
| robots Allow + sitemap | Prod + `apps/web/public/robots.txt` |
| X-Robots en privadas | Headers HTTP muestreados §4.2 |
| API disallow | `https://api.somarecovery.app/robots.txt` |
| HTTP→HTTPS / www→apex | 301 observados |
| HTML privado aún con meta index estática | Cuerpo HTML idéntico al shell; mitigado por header |
| Render JS rico | Snapshot Chromium landing EN/ES 2026-11-13 |
| Title ES tras i18n | Cambio de idioma en UI → title ES; URL `/` |
| Pesos assets | Descarga medida JS ~1,98 MB; hero ~1,72 MB |
| Tests SEO | `apps/web/src/seo/public-site.test.ts` |
| Política paths | `RENDER_X_ROBOTS_NOINDEX_PATHS` en `public-site.ts` |
| GSC métricas | Aporte propietario (no re-extraído aquí) |
| SEO-01B cerrado | `ROADMAP.md` § SEO-01B |

---

## 16. Decisiones que requieren aprobación

1. ¿Abrir **páginas educativas públicas** indexables (FAQ /learn) en SEO-02B, o limitar el hito a higiene GSC + medición + copy menor?
2. ¿Confirmar **opción A** (URL única bilingüe) como política hasta nuevo aviso?
3. ¿Medir CWV/Lighthouse en un sub-hito antes de tocar el hero?
4. ¿Incluir WEB-02 en el mismo tren editorial que SEO-02B o mantenerlos separados?
5. ¿Reconsiderar `noindex` de `/privacy` y `/terms` por transparencia (no por ranking)?
6. ¿Autorizar optimización de imagen hero en producción tras medición?

---

## Apéndice — Qué está bien / qué no cambiar

**Bien:** canonical HTTPS, robots permisivo + noindex por header, sitemap mínimo, JSON-LD educativo sin ratings falsos, tests de contrato, disclaimers, API cerrada a bots, privacidad de rutas app/demo.

**No conviene cambiar ahora:** indexar `/app` o `/preview`; abrir API a crawlers; migrar a Next.js; hreflang sin URLs; granjas de contenido IA; comprar enlaces; ampliar analytics de producto solo “por SEO”.

---

**Fin SEO-02A.**
SIN COMMIT. SIN PUSH. SIN PR. SIN MERGE. SIN DESPLIEGUE.
