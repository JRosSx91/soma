# PERF-01E — Desacoplar el LCP de la introducción visual

Implementación local. **Sin commit / push / PR / merge / despliegue** en este hito.
Fecha: **2026-11-13**.
Precedente: PERF-01A–01D (`perf-01d-react-startup-audit.md` R1).

---

## 0. Estado Git (al iniciar)

| Ref | Valor |
|---|---|
| Rama | `develop` |
| `HEAD` / `origin/develop` | `5db598b` (PERF-01C) |
| `origin/main` | `7a77e42` (merge PR #123) |
| Working tree | Cambios PERF-01E + untracked ajenos preservados |

No se ejecutó merge, rebase, reset ni cherry-pick.

---

## 1. Causa exacta

Confirmado en PERF-01D y en código previo:

1. El LCP es la fotografía del hero (`LandingPhotoImg` / WebP).
2. En primera visita, `introComplete` permanece `false` hasta `SomaIntro.beginFade` (`FADE_AT_MS`, antes **3000 ms**, o Skip).
3. `LandingV2Hero` animaba el contenedor del arte desde **`opacity: 0`** hasta que `shown = introComplete || reduceMotion`.
4. Un elemento con `opacity: 0` **no puede completar LCP** aunque la imagen ya esté descargada → encaja con el **retraso de renderizado ~2.870 ms** de Lighthouse de campo.

Partes **puramente visuales** (se conservan): marca SOMA, letras, overlay dialog, Skip/Escape, `sessionStorage`, copy/CTA gated por `introComplete`, `aria-hidden`/`inert` del main mientras el overlay está visible.

Parte que **bloqueaba el LCP**: la opacidad del arte del hero ligada a `introComplete`.

---

## 2. Solución implementada

Cambio mínimo (R1):

1. **`LandingV2Hero`:** el contenedor `.landing-v2-hero__art` es un `div` estático a **opacity 1** desde el montaje. Ya no anima desde opacity 0 ni depende de `introComplete`.
2. **Copy / CTA / velo radial:** siguen gated por `copyShown = introComplete || reduceMotion` (misma transición estética al revelar).
3. **`SomaIntro`:** `FADE_AT_MS` deja de ser un hold ocioso fijo de 3000 ms y se **deriva** de las constantes de animación de la marca:
   `WORD_DELAY_S + (LETTERS.length - 1) * LETTER_STAGGER_S + LETTER_FADE_S` → **~2170 ms**.
   No es un temporizador de intro distinto: es el mismo sistema de fade, alineado al fin de la animación de letras.
4. Skip, Escape, `markLandingV2IntroSeen`, `prefers-reduced-motion` (`shouldPlayLandingV2Intro`) y portal overlay: **sin cambio de contrato**.

### Overlay opaco y LCP (residual documentado)

El overlay sigue siendo `bg-[#081018]` a pantalla completa hasta el fade. En Chromium, la **visibilidad para LCP** se basa en opacidad/`visibility` del propio elemento LCP, no en oclusión por otro nodo. Por tanto, con el hero a opacity 1, el navegador **puede contabilizar LCP** mientras el usuario aún ve solo la intro.

- **Perceptibilidad humana** del hero en primera visita sigue limitada por el overlay hasta ~`FADE_AT_MS` (+ fade).
- **Métrica LCP** ya no espera a `introComplete` ni a un fade-in 0→1 del arte.

**Alternativa menos invasiva si hiciera falta acortar la percepción humana** (no implementada aquí): adelantar aún más el `beginFade` o suavizar la opacidad del fondo del overlay (no del logo) tras el trazo de la marca, sin sustituir el intro por otro sistema.

No se manipuló Lighthouse con contenido invisible artificial.

---

## 3. Comportamiento visual antes / después

| Momento | Antes | Después |
|---|---|---|
| Primera visita, t≈0 tras montar React | Arte hero `opacity: 0`; overlay opaco | Arte hero `opacity: 1` bajo overlay; copy aún oculto |
| Primera visita, fin de marca | Hold hasta 3000 ms, luego fade + hero 0→1 | Fade desde ~2170 ms; hero ya pintado; copy entra con `introComplete` |
| Skip / Escape | Fade rápido + reveal | Igual; hero ya estaba pintado |
| Intro ya visto | Sin overlay; hero aún animaba 0→1 (0,8 s) | Sin overlay; hero visible de inmediato |
| `prefers-reduced-motion` | Sin overlay; hero shown | Sin overlay; hero shown (sin cambios de contrato) |

---

## 4. Medición

### 4.1 Antes (referencia — no local de este hito)

Campo Lighthouse móvil (PERF-01D): FCP 3,8 s · LCP 3,9 s · render delay LCP **2.870 ms** · elemento = hero WebP.

### 4.2 Después — Chromium local (`vite preview` :4173)

Herramienta: `apps/web/scripts/perf-01e-measure.mjs` (CDP headless, viewport 375×812@2, **sin** throttling CPU/red).
**No comparable** numéricamente con Lighthouse de campo / producción.

| Escenario | FCP (ms) | LCP (ms) | Hero perceptible\* (ms) | CLS | Elemento LCP |
|---|---:|---:|---:|---:|---|
| Primera visita (intro completa) | 160 | 160 | ~2375 | 0 | `IMG.landing-v2-hero__art-img` → WebP 768 |
| Intro ya visto | 160 | 160 | ~134 | 0 | mismo |
| Skip | 200 | 200 | ~255 | 0 | mismo |
| `prefers-reduced-motion` | 180 | 180 | ~160 | 0 | mismo |

\*Perceptible = arte opacity > 0,05 **y** overlay opacity < 0,85 (juicio visual, no splash).

Observaciones:

- En todos los escenarios el LCP atribuido es la **imagen del hero**, no el splash ni el logo del intro.
- En primera visita, LCP métrico (~160 ms) ≪ percepción humana (~2,4 s) porque el overlay opaco aún tapa visualmente el hero ya pintado.
- Cache HTTP caliente + sin throttle → tiempos locales muy bajos; sirven para **comparar escenarios entre sí** y confirmar el elemento LCP, no para citar mejora de score de producción.
- TBT no instrumentado en este probe (requeriría Lighthouse/lab completo).

---

## 5. QA funcional (local)

- Landing EN carga; hero/title visibles tras intro o Skip.
- Skip presente en intro (`Skip`); Escape / click overlay siguen en código.
- CTA registro: copy gated; reglas `LandingRegistrationActions` / registration-mode **no tocadas**.
- `AuthProvider`, `ProtectedRoute`, `AppBootScreen` en rutas privadas: **sin cambios**.
- Overlay: `role="dialog"`, focus en Skip, `aria-hidden`/`inert` del main mientras visible: **intactos**.
- Sin cambios de textos de landing ni diseño de secciones.

---

## 6. Tests y build

- Tests afectados (hero + intro session) OK.
- Suite web completa: **1111** pass.
- `tsc -b` + `vite build` OK.
- `git diff --check` OK.

---

## 7. Riesgos residuales

- Primera visita: la **experiencia percibida** del hero sigue detrás del overlay hasta el fade (~2,2 s + 0,8 s).
- Mediciones locales sin throttle no predicen Lighthouse móvil de producción.
- Bundle monolítico (PERF-01D R2) sigue afectando FCP/TBT/discovery; **fuera de alcance**.
- Si un motor futuro exigiera “pixels uncovered” para LCP, el overlay opaco volvería a ser el cuello; la alternativa de fondo semitransparente quedaría entonces justificada.

---

## 8. Alcance respetado

No se modificó: backend, AuthProvider, ProtectedRoute, WebP masters/pipeline, medallas, catálogos, SEO, Vite config, bundle splitting, infra, rutas educativas.
