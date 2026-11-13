# SEO-02B1-A — Propuesta editorial y técnica: FAQ de la landing

Documento de trabajo. **Solo análisis y propuesta. No es implementación.**
Fecha: **2026-11-13**.
Referencia: `docs/review/seo/seo-02a-audit-and-growth-plan.md` (aprobado).
Hito siguiente (no autorizado aquí): **SEO-02B1-B** (implementación mínima, si se aprueba).

---

## 1. Estado Git

Inspección local **2026-11-13** (tras `git fetch origin`; **sin** sincronizar ramas):

| Referencia | Valor |
|---|---|
| Rama local | `develop` |
| HEAD local / `origin/develop` | `7c716200f3648e3f5ace42c6b52db43277210100` |
| `origin/main` | `04820c99724495644cb6f4a778e2072106c6a7d7` |
| PR #119 | **Merged** — `feat(support): privacy-first support guide (SUP-01E2-B)` → `main` (`https://github.com/JRosSx91/soma/pull/119`) |
| Ancestro | `7c71620` es ancestro de `origin/main`; el único commit en `origin/develop..origin/main` es el merge `04820c9` |
| Working tree | Untracked ajenos (`docs/design/*`, otros `docs/review/`) + carpeta `docs/review/seo/` (SEO-02A y este documento). **Sin** cambios staged de código |

**Separación de hitos:** SUP-01E2-B ya está en `main` vía #119. Este documento **no** modifica ni reabre ese alcance. No mezclar SEO con Support en el mismo cambio de implementación.

ROADMAP: SEO-01A/B cerrados; WEB-02 pendiente (bloque «¿Por qué Soma?» ya existe en landing). SEO-02 aún no figura como hito cerrado en `ROADMAP.md` (no se edita aquí).

---

## 2. Diagnóstico editorial de la landing

### Fortalezas (ya presentes)
- Hero y features explican oferta y límites (no dispositivo médico, no diagnóstico, no predicción individual).
- Bloques science / methodology detallan formas de curva y niveles de confianza.
- Origin cubre etimología σῶμα (parcialmente WEB-02).
- Closing y CTAs aclaran beta con invitación y demo.
- Copy ES/EN coherente en `apps/web/src/i18n/locales/{es,en}/landing-v2.json`.
- Metadatos estáticos + `DocumentSeo` / `public-site.ts` alineados con SEO-01.

### Huecos que una FAQ corta puede cubrir
La landing es **narrativa y exploratoria**; las dudas binarias típicas de un visitante nuevo quedan dispersas:

| Duda del visitante | ¿Dónde está hoy? | Problema |
|---|---|---|
| ¿Qué es exactamente? | Hero + features | Largo; no formato pregunta-respuesta |
| ¿La curva soy yo? | Disclaimers repartidos | Fácil de malinterpretar el timeline demo |
| ¿Sustituye terapia/médico? | Closing note / legales | No destacado como respuesta directa |
| ¿Puedo mirar sin cuenta? | Features intro + CTAs demo | No aparece como FAQ explícita |
| ¿Cuesta dinero / cómo entro? | Invite notes + legales | Fragmentado (invitación ≠ pago) |

Una FAQ de **5 preguntas** concentra confianza y relevancia de marca/educativa **en la misma URL** `/`, sin nuevas rutas ni sitemap.

### Lo que la FAQ no debe hacer
- Repetir párrafos enteros de science/methodology/origin.
- Prometer recuperación, plazos clínicos o «porcentajes de salud».
- Inventar autoría médica o revisiones clínicas.
- Usar ejemplos de bitácora/demo como si fueran datos de usuarios reales (las notas ficticias ya están etiquetadas; no reutilizarlas como prueba social).
- Añadir telemetría de clics en preguntas.

---

## 3. FAQ propuesta completa (ES / EN)

**Selección:** 5 preguntas (dentro del máximo 4–6).
**Descartadas a propósito:**
- «¿Cómo funcionan los modelos?» → ya cubierto por science/methodology; la FAQ solo aclara el malentendido individual (P2).
- Temas clínicos (síntomas de abstinencia, dosis, protocolos) → fuera de alcance; contenido `pending_clinical_review` no entra.

### ES

**Sección — título propuesto:** Preguntas frecuentes
**Eyebrow opcional:** Antes de empezar
**Intro corta:** Respuestas breves sobre qué es Soma y qué no es. No sustituyen la lectura de las condiciones ni de la política de privacidad.

#### P1. ¿Qué es Soma?
Soma es una aplicación web educativa y motivacional para personas adultas (18 años o más) que quieren explorar, con calma, cómo se describen en un catálogo educativo algunos cambios fisiológicos asociados a la abstinencia y a la recuperación. Visualiza trayectorias orientativas y ofrece herramientas para aprender (atlas, misiones, bitácora, expedición, entre otras). **No** es un centro sanitario, **no** es un dispositivo médico y **no** ofrece diagnóstico ni tratamiento.

#### P2. ¿Las curvas representan mi recuperación personal?
No. Las curvas y relojes son **modelos educativos del catálogo**: estimaciones orientativas a partir de literatura y de reglas del producto, situadas en una línea temporal. No miden tu cuerpo, no leen biomarcadores y no garantizan un resultado individual. Un punto en la curva no es un dato clínico tuyo.

#### P3. ¿Soma sustituye la atención médica o psicológica?
No. Soma es un compañero educativo. No diagnostica, no prescribe y no sustituye a profesionales de la salud, ni a servicios de emergencia. Si hay peligro inmediato o necesitas atención clínica, contacta con los recursos sanitarios de tu zona.

#### P4. ¿Qué puedo explorar sin crear una cuenta?
La **demo** permite recorrer superficies educativas del producto (por ejemplo recuperación ilustrativa, explorador, atlas, misiones, expedición y bitácora de ejemplo) **sin registro**. Los datos de ejemplo de la demo no son de ninguna cuenta real. Crear una cuenta (cuando tengas invitación) permite un uso personalizado según las funciones y consentimientos del producto; no es obligatorio para conocer Soma.

#### P5. ¿Soma es gratuita durante la beta?
Sí. En la beta pública el acceso al servicio se ofrece **sin pago, sin publicidad y sin suscripción** según los textos legales vigentes. El alta general no está abierta: hace falta una **invitación**. La gratuidad de la beta no promete una duración indefinida ni un resultado de recuperación.

---

### EN

**Section title:** Frequently asked questions
**Optional eyebrow:** Before you begin
**Short intro:** Brief answers about what Soma is and what it is not. They do not replace the terms of use or the privacy policy.

#### Q1. What is Soma?
Soma is an educational and motivational web app for adults (18+) who want to explore, at their own pace, how an educational catalog describes some physiological changes linked to abstinence and recovery. It visualizes orientative trajectories and offers learning tools (atlas, missions, journal, expedition, and more). It is **not** a healthcare provider, **not** a medical device, and it does **not** diagnose or treat.

#### Q2. Do the curves represent my personal recovery?
No. The curves and clocks are **educational catalog models**: orientative estimates grounded in literature and product rules, placed on a timeline. They do not measure your body, read biomarkers, or guarantee an individual outcome. A point on a curve is not a clinical data point about you.

#### Q3. Does Soma replace medical or psychological care?
No. Soma is an educational companion. It does not diagnose, prescribe, or replace health professionals or emergency services. If there is immediate danger or you need clinical care, contact the health resources in your area.

#### Q4. What can I explore without creating an account?
The **demo** lets you browse educational surfaces of the product (for example illustrative recovery, the explorer, atlas, missions, expedition and sample journal) **without signing up**. Demo sample data does not belong to any real account. Creating an account (when you have an invitation) enables personalized use according to the product’s features and consents; it is not required to learn what Soma is.

#### Q5. Is Soma free during the beta?
Yes. In the public beta, access is offered **without payment, advertising or subscription**, according to the current legal texts. General sign-up is not open: an **invitation** is required. A free beta does not promise an indefinite duration or a recovery outcome.

---

## 4. Ajustes opcionales de título y descripción

### Actual (fuente de verdad)
| Clave | ES | EN / HTML estático |
|---|---|---|
| `metaTitle` | Soma — Modelos educativos de recuperación fisiológica | Soma — Educational models of physiological recovery |
| `metaDescription` | Soma es una aplicación web educativa para explorar la recuperación fisiológica modelada tras el consumo de sustancias. Las curvas son estimaciones, no diagnósticos. | Soma is an educational web app for exploring modelled physiological recovery after substance use. Catalog curves are estimates, not diagnoses. |

(`index.html` y `DEFAULT_*` en `public-site.ts` alineados con EN.)

### Recomendación
| Elemento | Decisión | Motivo |
|---|---|---|
| **Title** | **No cambiar** | Ya nombra marca + naturaleza educativa + tema; alargar con keywords sería stuffing y diluiría la marca |
| **Description** | **Opcional, cambio menor** | Solo si se quiere reflejar demo + límite en el snippet |

#### Descripción propuesta (opcional)
- **ES:** `Soma es una app web educativa para explorar modelos de recuperación fisiológica tras el consumo de sustancias. Hay demo sin cuenta. Las curvas son estimaciones, no diagnósticos.`
- **EN:** `Soma is an educational web app for exploring modelled physiological recovery after substance use. Try the demo without an account. Catalog curves are estimates, not diagnoses.`

| Criterio | Valoración |
|---|---|
| Intención | Marca + comprensión del producto; no una keyword clínica inventada |
| Beneficio esperado | Snippet ligeramente más concreto (demo); **sin garantía** de CTR |
| Riesgo de sobrepromesa | Bajo si se mantiene «estimaciones / not diagnoses» |
| Duplicación | Parcial con hero; aceptable en meta (rol distinto al H1) |
| Keyword stuffing | Evitado (no encadenar neuroadaptación/abstinencia/sueño en el title) |

**No recomendado:** renombrar el title a listas del tipo «Soma recovery neuroadaptation abstinence app»; afirmar «scientifically proven» o plazos de cura; mencionar «free forever» sin anclar a beta.

---

## 5. Ubicación UX recomendada

### Orden en `LandingV2Page`
Insertar **después de** `LandingV2Achievements` y **antes de** `LandingV2Closing`:

`… → Achievements → **FAQ** → Closing (CTA)`

**Por qué:** el visitante ya ha visto oferta, método y límites; la FAQ resuelve dudas binarias justo antes del CTA final (cuenta / demo), sin competir con el hero ni cortar el arco science → origin → tools.

### Patrón visual
- Misma cáscara que otras secciones: fondo `#081018`, eyebrow uppercase `text-soma-action`, `h2` de sección, intro corta, `max-w` coherente con methodology/origin.
- **Sin** cards decorativas innecesarias; la unidad es pregunta + respuesta.
- Sin imágenes nuevas.

### Estática vs acordeón
| Opción | Pros | Contras |
|---|---|---|
| **Lista estática (recomendada)** | Todo el texto en DOM visible; teclado trivial; mejor para rastreador y a11y; 5 ítems no saturan | Ocupa más scroll |
| Acordeón `<details>`/`<summary>` | Compacto en móvil | Respuestas «cerradas» por defecto; más estados foco/ARIA; tentación de JS custom |

**Decisión propuesta para B1-B:** sección estática con:
- `section` + `aria-labelledby`
- `h2` título de sección
- cada pregunta como `h3`
- respuesta en `<p>` (o lista si hace falta)
- opcionalmente un `<dl>` semántico (dt/dd) **o** artículos con h3+p; preferir **h3+p** para jerarquía clara con el resto de la landing

No implementar aquí. No inventar componente de librería.

### Navegación
- Incluible en skip/main ya existente (`#landing-v2-main`).
- Ancla opcional `#faq` / `#preguntas-frecuentes` (un id estable EN, p. ej. `landing-v2-faq`) para enlaces internos futuros; **sin** entrada de nav obligatoria en B1-B.

---

## 6. Justificación SEO

1. **Misma URL indexable** `/` → sin cambiar `sitemap.xml`, canonical ni robots.
2. Aporta texto pregunta-respuesta que Google (tras render JS) puede asociar a consultas de marca y de comprensión («qué es», «es médico», «gratis», «demo»).
3. Refuerza E-E-A-T percibido (límites claros) sin fingir autoría clínica.
4. Complementa, no sustituye, science/methodology.
5. Volumen GSC actual (~19 impresiones) → el valor principal es **claridad y confianza**, no un salto de tráfico medible a corto plazo.

### Datos estructurados
- **No** añadir `FAQPage` JSON-LD en B1-B por defecto.
- Motivo: el HTML visible basta; los resultados enriquecidos de FAQ están restringidos / inciertos; un JSON-LD duplicado mal mantenido ES/EN añade riesgo sin beneficio asegurado.
- Si en el futuro se propone schema: debe reflejar **exactamente** el FAQ visible, bilingüe con cuidado (una URL), y separarse de promesas de rich results.

Mantener: canonical actual, política robots, noindex privadas, sitemap de una URL, SPA.

---

## 7. Requisitos de accesibilidad (para B1-B)

- Un `h2` de sección; preguntas en `h3` (no saltar a `h4`).
- Contraste acorde al tema oscuro existente.
- Texto completo legible sin interacción (si se elige estática).
- Si se usara `<details>`: `summary` enfocable, teclado nativo, no atrapar foco; respetar `prefers-reduced-motion` si hubiera animación (preferible ninguna).
- Idioma: claves i18n en `landing-v2` ES/EN; sin literales mezclados.
- No depender del color solo para «respuesta correcta».
- Enlaces a demo/legales con nombres accesibles claros.
- Sin tracking de expansión/clic.

---

## 8. Riesgos editoriales

| Riesgo | Mitigación |
|---|---|
| Sonar a consejo médico | Lenguaje «educativo / no sustituye» |
| Confundir demo con cuenta | Explicitar datos de ejemplo |
| «Gratis» malentendido como perpetuo | Anclar a beta + textos legales |
| Invitación vs registro abierto | Mantener nota de invitación |
| Duplicar origin/science | FAQ más corta y directa |
| Desalineación ES/EN | Redacción emparejada (este doc) + tests de claves |
| Usar historias de usuarios | Prohibido |

---

## 9. Límites clínicos

La FAQ **debe** afirmar o implicar:
- ≥ 18 años.
- No diagnóstico, no tratamiento, no dispositivo médico.
- Curvas ≠ medición individual.
- Emergencias → fuera de Soma.

La FAQ **no debe**:
- Citar estudios no verificados ni inventar revisiones clínicas.
- Dar plazos de abstinencia «garantizados».
- Describir síntomas clínicos detallados.
- Incluir contenido `pending_clinical_review`.
- Presentar estimaciones como porcentaje de salud recuperada.

---

## 10. Impacto técnico estimado (B1-B, si se aprueba)

| Área | Impacto |
|---|---|
| Rutas / sitemap / robots / headers | **Ninguno** |
| `index.html` estático | Solo si se aprueba el cambio opcional de meta description EN |
| i18n | Nuevas claves en `landing-v2.json` ES/EN |
| Componentes | Nuevo `LandingV2Faq.tsx` (o nombre equivalente) + import en `LandingV2Page.tsx` |
| SEO runtime | Sin cambio de `isIndexablePublicPath`; opcional sync de description vía `DocumentSeo` ya existente |
| JSON-LD | Sin `FAQPage` |
| Backend / DB / infra | Ninguno |
| Bundle | Texto + markup mínimo (despreciable frente a ~1,98 MB JS / ~1,72 MB hero ya medidos en SEO-02A) |
| Tests | Claves presentes ES/EN; sección renderiza; ausencia de promesas clínicas en copy de FAQ; jerarquía h2/h3; no regresión SEO-01 (`public-site.test.ts`) |

### Rendimiento (nota, sin optimizar aquí)
SEO-02A midió hero PNG ≈ 1,72 MB y JS principal ≈ 1,98 MB. **No** se convierten aquí en conclusiones LCP/INP/CLS. Medición posterior sugerida (herramientas gratuitas): PageSpeed Insights / CrUX en GSC cuando haya datos, Lighthouse en lab sobre `/` móvil. La FAQ no sustituye ese trabajo.

### Arquitectura futura (SEO-02B2 — solo nota)
Páginas educativas independientes (`/learn/...` u homólogo) requerirán, cuando se aprueben: contenido propio, metadatos por URL, canonical correcto, sitemap ampliado, render verificable, y seguir protegiendo privadas/demo. **Fuera de B1.**

---

## 11. Criterios de aceptación para SEO-02B1-B

1. FAQ visible en `/` ES y EN con las 5 preguntas aprobadas (o el subconjunto explícitamente autorizado).
2. Ubicación: entre achievements y closing (salvo decisión contraria documentada).
3. Semántica: `section` + `h2` + `h3` por pregunta; respuestas legibles sin acordeón obligatorio.
4. Sin nuevas rutas; sitemap y robots intactos; privadas siguen noindex.
5. Sin `FAQPage` JSON-LD salvo aprobación explícita posterior.
6. Sin telemetría de FAQ; sin ejemplos presentados como datos de usuarios reales.
7. Límites clínicos del §9 presentes en el copy.
8. Si se toca meta description: actualizar `landing-v2` ES/EN + defaults EN en `index.html` / `public-site.ts` de forma coherente; tests SEO-01 verdes.
9. Typecheck / tests web afectados / `git diff --check` OK.
10. ROADMAP actualizado solo si el propietario lo autoriza en B1-B (no en A).

---

## 12. Decisiones pendientes de aprobación

1. ¿Autorizar las **5 preguntas** tal cual, o reducir/ampliar (máx. 6)?
2. ¿Aprobar el **cambio opcional** de meta description, o dejar metas intactas?
3. ¿Confirmar ubicación **Achievements → FAQ → Closing**?
4. ¿Confirmar patrón **estático** (vs `<details>`)?
5. ¿Incluir ancla `#` estable para la sección?
6. ¿Pasar a SEO-02B1-B (implementación) tras esta revisión?
7. ¿Actualizar ROADMAP en B1-B para registrar SEO-02?

---

## Apéndice — Archivos de referencia (solo lectura)

- `docs/review/seo/seo-02a-audit-and-growth-plan.md`
- `apps/web/src/features/landing-v2/LandingV2Page.tsx`
- `apps/web/src/features/landing-v2/LandingV2Closing.tsx`
- `apps/web/src/i18n/locales/es/landing-v2.json`
- `apps/web/src/i18n/locales/en/landing-v2.json`
- `apps/web/index.html`
- `apps/web/src/seo/public-site.ts`
- `apps/web/src/seo/DocumentSeo.tsx`
- `apps/web/src/seo/public-site.test.ts`
- `apps/web/src/i18n/locales/es/legal.json` (beta gratuita, ≥18; no copiar bloques legales enteros a la FAQ)

---

**Fin SEO-02B1-A.**
SIN COMMIT. SIN PUSH. SIN PR. SIN MERGE. SIN DESPLIEGUE.
