# PERF-01A — Auditoría de rendimiento móvil de la landing

Documento de trabajo. **Solo análisis y propuesta. No es implementación.**
Fecha: **2026-11-13**.
Ámbito: landing pública `/` (Soma 2.0 / `LandingV2Page`).
Restricción: sin cambios de código, imágenes, autenticación, infraestructura ni ROADMAP en este hito.

---

## 0. Estado Git (inspección)

| Ref | SHA |
|---|---|
| Rama | `develop` |
| `HEAD` | `093cd2a5f544c521abbe59ea9cdff3712bbcc2cb` |
| `origin/develop` | `093cd2a` (sincronizado) |
| `origin/main` | `72e8698327d5c3dc19849c88025b5d8b716ddbe3` |
| Working tree tracked | limpio |
| Untracked ajenos | preservados (p. ej. `docs/design/*`, otros `docs/review/*`) |

Sin sync de ramas. Sin commits en este hito.

---

## 1. Evidencia externa (Lighthouse) — no mezclar trazas

Las cifras siguientes vienen de **ejecuciones distintas** comunicadas por el propietario. **No** se tratan como una sola traza coherente.

| Señal (ejecución A/B) | Valor reportado |
|---|---|
| Performance | 85/100 (una ejecución) |
| Accessibility / SEO | 100 / 100 |
| LCP | 3,8 s (una ejecución) |
| Retraso de renderizado de elementos | 6.530 ms (otra ejecución) |
| Cadena crítica máxima | 10.536 ms |
| Carga útil total | 29.161 KiB |
| Hero PNG | ~1.920 KiB |
| Ahorro estimado imágenes (hero) | ~1.855 KiB |
| JS sin utilizar | ~187 KiB |
| CSS sin utilizar | ~11 KiB |
| CSS bloqueante (ahorro est.) | ~330 ms |
| Peticiones en cadena crítica | `/auth/registration-mode`, `/auth/refresh` |

En este documento se aportan **mediciones propias controladas** (red/API, tamaños de archivo, bundle de producción) y análisis de código. **No** se ejecutó Lighthouse ni un Performance panel completo de Chromium en este hito; el elemento LCP exacto en campo queda como hipótesis pendiente (§3).

---

## 2. Hallazgos confirmados

### 2.1 El paint de `/` espera a `POST /auth/refresh`

1. `AuthProvider` (`apps/web/src/features/auth/context/AuthContext.tsx`) arranca `restoreSession()` → `refreshAccessSession()` → `POST /auth/refresh` con cookie HttpOnly.
2. `RootRoute` en `App.tsx` hace `if (loading) return <AppBootScreen />` mientras `status === "checking"`.
3. Mientras dura el bootstrap, **no se monta** `LandingV2Page` (ni hero, ni intro).
4. Si la API está fría o lenta, el visitante anónimo ve solo el splash (`AppBootScreen`) aunque no tenga sesión.
5. Ante fallo/red lenta, el bootstrap captura y pasa a `anonymous` (no hard-crash), pero **sigue esperando** la respuesta (o timeout de red) antes de pintar la landing.
6. Tras ~6 s, `AppBootScreen` solo cambia el copy (`boot.slowServer`); **no deja de esperar**.

Consecuencia: para una visita anónima, `/auth/refresh` es **necesario para decidir** si hay sesión (cookie HttpOnly no legible en JS), pero **no es necesario bloquear el primer paint** de la landing pública. Bloquearlo acopla LCP/UX a la latencia de la API.

### 2.2 `/auth/registration-mode` se pide al montar el árbol, no bloquea el HTML de la landing

1. `RegistrationModeProvider` envuelve **todas** las rutas en `App.tsx` y, sin `value` inyectado, llama `fetchRegistrationMode()` en `useEffect` (GET anónimo, `skipRefresh: true`).
2. La landing **sí se puede pintar** sin el resultado: `LandingRegistrationActions` muestra siempre el CTA secundario (demo); el CTA primario (registro o login) aparece cuando `status === "ready"`.
3. En error: mensaje `registrationUnavailable`; la demo sigue disponible.
4. El modo invitación **no** exige la respuesta antes de pintar copy/hero; solo condiciona qué CTA primario mostrar.

Consecuencia: la petición aparece en la cascada crítica (competencia de red con JS/CSS/imágenes y, si la API está fría, latencia extrema), pero **no** es la causa directa del `AppBootScreen`. Puede diferirse hasta el montaje de los CTAs o hasta interacción, con bajo riesgo funcional.

### 2.3 API de producción: cold start vs cálida (medición propia)

Host confirmado en el bundle de producción: `https://api.somarecovery.app`.

| Llamada | Condición | HTTP | TTFB (aprox.) |
|---|---|---|---|
| `GET /auth/registration-mode` | 1.ª sonda (fría) | 200 `{"mode":"open"}` | **~22,6 s** |
| `GET /auth/registration-mode` | cálida (seguida) | 200 | ~0,11–0,14 s |
| `POST /auth/refresh` + `Origin: https://somarecovery.app` + `X-Soma-Requested-With` | anónimo | **401** | ~0,20 s (cálida) |
| `POST /auth/refresh` sin Origin válido | — | 403 | rápido |

Interpretación: la cadena crítica de ~10,5 s en Lighthouse es **compatible** con un cold start (o latencia alta) de la API en paralelo al arranque; **no** implica que ambas peticiones sumen siempre 10 s en caliente. Correlación fuerte con cold start; causalidad del bloqueo de paint → refresh + `RootRoute`.

### 2.4 Bundle inicial monolítico

- Producción (2026-11-13): `assets/index-Dnl3TUIC.js` ≈ **2,0 MiB** (2.086.021 bytes); CSS `index-lDk-_U0G.css` (en `dist` local ~86 KiB).
- `App.tsx` importa **de forma eager** landing + login/register + **todo** el árbol `/preview` y `/app` (Recovery, Explore, Anatomy, Journal, Missions, Expedition, etc.).
- **No** hay `React.lazy` / `import()` de rutas.
- Lighthouse “JS sin utilizar ~187 KiB” es plausible como subconjunto reportado; el riesgo real es el **peso total** del chunk único en móvil.

### 2.5 Imágenes: peso y descarga prematura

**Fondos `public/images/landing-v2/`** (8 PNG ≈ **14,7 MiB**):

| Recurso | KiB (aprox.) | Intrínseco | Above-the-fold | `loading` | Notas |
|---|---|---|---|---|---|
| `hero-holographic-anatomy.png` | 1.920 | 1828×860 | **Sí** (hero) | (eager implícito) + `fetchPriority="high"` | Coincide con hallazgo Lighthouse |
| `soma-journey-bg.png` | 1.779 | 1819×865 | No | **sin lazy** | Eager al montar landing |
| `soma-atlas-bg.png` | 1.931 | 1821×864 | No | sin lazy | |
| `soma-science-bg.png` | 1.966 | 1821×864 | No (Features/Science) | sin lazy | Features es 2.ª sección |
| `soma-methodology-bg.png` | 1.879 | 1821×864 | No | sin lazy | |
| `soma-origin-bg.png` | 1.805 | 2103×748 | No | sin lazy | |
| `soma-missions-journal-bg.png` | 1.709 | 2079×756 | No | sin lazy | |
| `soma-achievements-bg.png` | 2.054 | 1829×860 | No | sin lazy | |

Solo `LandingV2Expedition` usa `loading="lazy"` de forma consistente. El resto de fondos/secciones: `decoding="async"` sin `lazy` → el navegador puede solicitar muchos MiB **antes** de hacer scroll.

**Medallas showcase** (5 PNG catalogadas, sin `loading="lazy"`):

| Archivo | MiB | Display típico |
|---|---|---|
| `nicotine-bronze.png` | ~2,59 | miniatura UI (≪ 1280 CSS px) |
| `alcohol-bronze.png` | ~2,30 | idem |
| `alcohol-gold.png` | ~2,06 | idem |
| `nicotine-gold.png` | ~2,11 | idem |
| `cannabis-gold.png` | ~2,21 | idem |

Suma showcase ≈ **11,3 MiB** para iconos mostrados pequeños (`width`/`height` HTML 1280×1240). Carpeta completa achievements ≈ **47,3 MiB** (20 PNG).

**Anatomía (Atlas, below-fold):** placas ~1024×1536 ≈ **~2 MiB c/u**; varias capas sin `lazy`.

**Expedición:** iconos ya en WebP; fondo `nature-10.png` ~1,85 MiB con `lazy`.

Compatibilidad WebP/AVIF: el pipeline ya usa WebP en expedición; fondos/hero/medallas siguen en PNG pesado → ahorro alto esperado (Lighthouse ~1,85 MiB solo en hero; el resto multiplica).

### 2.6 Intro y LCP (correlación)

Tras salir del splash de auth:

1. Primera visita de sesión: `SomaIntro` (~3 s a fade + animaciones; `FADE_AT_MS = 3000`).
2. El hero mantiene `opacity: 0` hasta `introComplete` (salvo `prefers-reduced-motion`).
3. La imagen hero ya puede estar en descarga (`fetchPriority="high"`) mientras el intro cubre el viewport.

Por tanto, en primera visita, el **retraso de renderizado** del LCP puede incluir: auth splash + intro + animación, además de red. En visitas posteriores (intro en `sessionStorage`) el intro se omite.

### 2.7 CSS bloqueante

Un único CSS de app (~86 KiB en build) bloquea render de forma esperable en Vite/SPA. Ahorro Lighthouse ~330 ms: **bajo** frente a auth cold start e imágenes. No se recomienda reingeniería de Tailwind/Vite en PERF-01B solo por este margen.

### 2.8 Seguridad / sesión (límites de diseño)

- No se recomienda **eliminar** `POST /auth/refresh` del bootstrap global sin un plan de rutas protegidas: las cookies HttpOnly exigen refresh para restaurar access token.
- `AchievementSyncProvider` no llama red en anónimo; solo `reset` / `bindUser` tras auth.
- Cualquier desbloqueo del paint de `/` debe preservar: sesiones existentes, redirect de autenticados, ProtectedRoute, registro invite/open, CSRF/`X-Soma-Requested-With`, Origin allowlist.

---

## 3. Hipótesis pendientes (sin traza Performance completa)

| ID | Hipótesis | Cómo falsarla en PERF-01B |
|---|---|---|
| H1 | El LCP en móvil es la **imagen hero** (no el H1) en la mayoría de runs con caché fría de imágenes | Lighthouse/DevTools → “LCP element” en 3 runs controlados |
| H2 | En primera visita, el intro aporta una fracción material del “element render delay” | Comparar first-visit vs `sessionStorage` intro visto |
| H3 | En API cálida, el bloqueo de `RootRoute` aporta ≪ 1 s; el peor caso Lighthouse es cold start | Medir TTFB refresh/registration-mode justo antes del Lighthouse |
| H4 | `loading="lazy"` en fondos reduce bytes en LCP window sin cambiar LCP element | Network waterfall antes/después |
| H5 | Code-splitting de `/preview`+`/app` reduce “unused JS” y TTI más que el LCP | Coverage + LCP/INP antes/después |

---

## 4. Evidencia de mediciones propias

### 4.1 Condiciones

| Parámetro | Valor |
|---|---|
| Fecha | 2026-11-13 |
| Origen | Máquina de desarrollo → producción pública |
| Herramienta | `curl` (no emulación móvil de CPU) |
| Caché navegador | N/A (curl) |
| API | `https://api.somarecovery.app` |
| Front | `https://somarecovery.app` |

No se afirma equivalencia con Lighthouse Moto G / Slow 4G; las mediciones acotan latencia de API y pesos de assets.

### 4.2 Bundle producción

| Asset | Bytes |
|---|---|
| `assets/index-Dnl3TUIC.js` | 2.086.021 |
| CSS principal | presente (build local ~86 KiB; sin `Content-Length` fiable vía CDN en HEAD) |

### 4.3 Cadena lógica de arranque (código + red)

```
HTML shell (bg #061018)
  → CSS + JS (~2 MiB)
  → React: AuthProvider.restoreSession → POST /auth/refresh  ─┐
  → App: RegistrationModeProvider → GET /auth/registration-mode ┤ (en paralelo)
  → RootRoute: loading? AppBootScreen : LandingV2Page          ← gated por refresh
  → (opcional) SomaIntro ~3s
  → Hero visible + competencia de descarga de fondos/medallas sin lazy
```

---

## 5. Análisis LCP (síntesis)

| Fase | Qué ocurre | Impacto plausible en LCP |
|---|---|---|
| Document + CSS/JS | Splash de color en `index.html`; sin hero en HTML estático | LCP **no** puede ser el hero hasta React |
| Auth bootstrap | `AppBootScreen` hasta terminar refresh | **Bloqueo duro** del montaje del hero |
| Intro 1.ª visita | Overlay; hero en opacity 0 | Retraso de pintado del candidato LCP |
| Hero img | PNG 1,9 MiB, `fetchPriority=high`, sin `srcset` | Decodificación/descarga costosa en móvil |
| Below-fold | Fondos/medallas/anatomía eager | Contención de ancho de banda (correlación con LCP) |

**Elemento LCP:** no confirmado instrumentado aquí. Candidatos: `img.landing-v2-hero__art-img` o el `h1` del hero tras intro. Priorizar confirmación en PERF-01B.

---

## 6. Máximo tres mejoras recomendadas (ordenadas)

Criterios: impacto esperado → riesgo → complejidad → mantenimiento → medibilidad.

### Mejora 1 — Desacoplar el primer paint de `/` del bootstrap de sesión

**Qué:** Dejar de renderizar `AppBootScreen` en `RootRoute` mientras `loading`; pintar `LandingV2Page` para anónimos de forma optimista; completar `restoreSession` en segundo plano; si resulta autenticado, navegar a `/login` (comportamiento actual). Mantener `AppBootScreen` en `ProtectedRoute` / rutas que exigen sesión. Opcional en el mismo hito: **diferir** `fetchRegistrationMode` hasta montar CTAs (o hasta idle), sin eliminarlo.

**Impacto:** Elimina el acoplamiento LCP ↔ TTFB de API (crítico en cold start ~10–20 s observados).
**Riesgo:** Flash breve de landing para usuarios con sesión válida; hay que cubrir `sessionNotice` / post-logout / account deleted.
**Complejidad:** Media-baja (cirugía en `RootRoute` + tests de auth/landing).
**Mantenimiento:** Bajo si se documenta el contrato “público no espera refresh”.
**Medición:** LCP + tiempo hasta hero con API fría/cálida; tests e2e login cookie.

**No hacer:** Eliminar `/auth/refresh` del producto ni debilitar ProtectedRoute.

### Mejora 2 — Reducir y diferir peso de imágenes de la landing

**Qué (mínimo viable, sin rediseño):**

1. Generar variantes WebP/AVIF (y anchos responsive) del **hero**; `srcset`/`sizes`; mantener PNG como fallback si hace falta OG.
2. Añadir `loading="lazy"` (y opcionalmente `fetchPriority="low"`) a fondos de sección, medallas showcase y placas de anatomía **fuera del primer viewport**.
3. Redimensionar medallas a tamaños de UI reales (p. ej. ≤256–512 px) — hoy ~2 MiB c/u para thumbs.

**Impacto:** Recorte potencial de decenas de MiB de payload; Lighthouse ya estima ~1,85 MiB solo en hero.
**Riesgo:** Artefactos de compresión / diferencia visual en fondos; OG image debe seguir siendo aceptable.
**Complejidad:** Media (assets + attrs; sin tocar Tailwind).
**Medición:** Transfer size, LCP, screenshots ES/EN 320–1440.

### Mejora 3 — Code-splitting de rutas privadas y demo

**Qué:** `React.lazy` + `Suspense` para el árbol `/preview` y `/app` (y páginas auth no críticas si aplica), dejando el chunk inicial centrado en landing + shell auth mínimo.

**Impacto:** Reduce JS inicial (hoy ~2 MiB monolítico); alinea con “unused JS”. Efecto en LCP **secundario** frente a 1 y 2 si el LCP es imagen.
**Riesgo:** Waterfalls de chunk al entrar en demo; estados de carga; regresiones de tests de import.
**Complejidad:** Media; más superficie de QA.
**Medición:** peso del entry JS, Coverage, TTI/INP al abrir `/preview`.

---

## 7. Riesgos globales

| Riesgo | Mitigación |
|---|---|
| Flash de landing para sesión autenticada | Tests con cookie de refresh; transición inmediata a `/login` |
| CTA primario ausente hasta `registration-mode` | Mantener CTA demo; skeleton/disabled opcional; no bloquear hero |
| Regenerar imágenes empeora look de marca | Comparación visual obligatoria; quality presets documentados |
| Lazy mal aplicado al hero | Nunca `lazy` en LCP; conservar `fetchPriority="high"` en hero |
| Splitting rompe Prefetch/PWA expectations | Smoke DEMO/LIVE + checklist §8 |
| Perseguir score Lighthouse | Criterio de éxito = LCP/UX medible, no un número mágico |

---

## 8. Criterios de aceptación (para implementación futura)

1. Visita anónima a `/`: hero visible **sin** esperar TTFB largo de API en el camino crítico de paint (Mejora 1).
2. Sesión válida: no se pierde restauración; acceso a `/app` intacto.
3. Registro invite vs open: CTAs correctos cuando el modo está listo; fallo de API no rompe demo.
4. Payload de imágenes de landing reducido de forma medible (hero + lazy below-fold como mínimo).
5. Sin regresión a11y/SEO (Lighthouse a11y/SEO ≥ umbral actual; canonical/robots landing intactos).
6. Suites web relevantes en verde (auth session, landing registration CTA, landing-v2 keys/visual contracts existentes).

---

## 9. QA requerido antes/después (PERF-01B+)

| Área | Comprobación |
|---|---|
| Landing ES/EN | Copy, CTAs, intro 1.ª visita / revisit |
| Hero / diseño | Screenshot 320 / 375 / 768 / 1440; comparar compresión |
| Auth | Login, logout, refresh cookie, multi-tab |
| Sesiones | Recarga en `/` con sesión; deep link `/app/*` |
| Registro | Modo open e invite; token invite en memoria |
| DEMO / LIVE | `/preview` y `/app` navegan tras split |
| A11y | Skip link, foco post-intro, contraste |
| SEO | title/description/canonical/robots en `/`; no indexar privadas |
| Responsive | Sin overflow; medallas nítidas tras resize |
| Perf | 3 runs Lighthouse móvil controlados (caché fría/cálida API documentada) |

---

## 10. Propuesta PERF-01B

**Alcance sugerido (implementación mínima):**

1. Implementar **Mejora 1** (desbloqueo de paint en `/` + tests auth/landing).
2. Implementar el subconjunto barato de **Mejora 2**: `loading="lazy"` en fondos/medallas/anatomía below-fold + compresión/variantes del **hero** únicamente.
3. Dejar code-splitting (**Mejora 3**) para PERF-01C si las métricas post-01B aún lo exigen.

**Fuera de PERF-01B:** cambiar Tailwind/Vite por CSS crítico; eliminar refresh; reescribir intro; optimizar las 20 medallas del catálogo completo salvo las del showcase.

**Entregable PERF-01B:** PR pequeño + tabla before/after (LCP, transfer size, TTFB API en el run) + checklist §9.

---

## 11. Resumen ejecutivo

El rendimiento móvil de la landing está limitado por tres factores confirmados en código y medición:

1. **Gate de auth en `/`** (`AppBootScreen` hasta `/auth/refresh`), que en API fría puede retrasar segundos el montaje del hero.
2. **Payload de imágenes** (~15 MiB de fondos landing + ~11 MiB de medallas showcase + anatomía), casi sin `loading="lazy"`.
3. **JS monolítico ~2 MiB** que incluye rutas privadas/demo en el entry.

`/auth/registration-mode` es necesario para el CTA de registro, **no** para pintar la landing; puede diferirse. No eliminar la renovación de sesión: sí dejar de bloquear el paint público.

---

**Fin PERF-01A.**
SIN COMMIT. SIN PUSH. SIN PR. SIN MERGE. SIN DESPLIEGUE.
