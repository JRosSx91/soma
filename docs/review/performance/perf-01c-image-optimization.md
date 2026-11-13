# PERF-01C — Optimización de imágenes de la landing pública

Documento de implementación local. **Sin commit / push / PR / merge / despliegue** en este hito.
Fecha: **2026-11-13**.
Ámbito: imágenes de `LandingV2Page` y componentes asociados.
Precedente: PERF-01A (`perf-01a-landing-audit.md`), PERF-01B (PR #122, merge `ee1d868`).

---

## 0. Estado Git (inicio)

| Ref | SHA / nota |
|---|---|
| Rama | `develop` |
| `HEAD` / `origin/develop` | `851279d` (PERF-01B producto) |
| `origin/main` | `ee1d868` (merge PR #122) |
| Ancestro PERF-01B en main | Sí (`ee1d868` contiene el merge) |
| Untracked ajenos | Preservados (`docs/design/*`, otros `docs/review/*`) |

Sincronización: `develop` ya contenía PERF-01B; no se requirió merge/rebase.

---

## 1. Inventario (recursos afectados)

| Recurso | Ruta PNG | Formato | Resolución | Tamaño PNG | Display | Alpha | 1er viewport | LCP | Fuera landing |
|---|---|---|---|---|---|---|---|---|---|
| Hero | `landing-v2/hero-holographic-anatomy.png` | PNG | 1828×860 | 1,875 MiB | full-bleed | no | sí | **candidato LCP** (no medido en esta pasada) | no |
| Journey BG | `landing-v2/soma-journey-bg.png` | PNG | 1819×865 | 1,737 MiB | sección full | no | no | no | no |
| Atlas BG | `landing-v2/soma-atlas-bg.png` | PNG | 1821×864 | 1,885 MiB | sección full | no | no | no | no |
| Science / Features BG | `landing-v2/soma-science-bg.png` | PNG | 1821×864 | 1,920 MiB | 2 secciones | no | no | no | no |
| Methodology BG | `landing-v2/soma-methodology-bg.png` | PNG | 1821×864 | 1,835 MiB | sección full | no | no | no | no |
| Origin BG | `landing-v2/soma-origin-bg.png` | PNG | 2103×748 | 1,763 MiB | sección full | no | no | no | no |
| Missions/Journal BG | `landing-v2/soma-missions-journal-bg.png` | PNG | 2079×756 | 1,669 MiB | sección full | no | no | no | no |
| Achievements BG | `landing-v2/soma-achievements-bg.png` | PNG | 1829×860 | 2,006 MiB | sección full | no | no | no | no |
| 5 medallas showcase | `achievements/{nicotine,alcohol,cannabis}-{bronze,gold}.png` | PNG | ~1270×1240 | ~11,3 MiB total | 76–144 px | **sí** | no | no | sí (mismas PNG en logros) |
| Atlas plates | `anatomy/body-master-anterior` + 4 sistemas | PNG | 1024×1536 | ~9,8 MiB total | ~20–36 rem | sí | no | no | sí (atlas app) |
| Expedition BG | `decoration/nature-10.png` | ya WebP (IMG-PERF-01A) | — | — | — | — | no | no | sí |

**Fuera de alcance:** bundle JS (~2 MiB), resto del catálogo de medallas, NT PNG, SEO/metadatos, code-splitting.

**Estrategia de reutilización:** se generan WebP junto a los PNG masters. La landing usa `LandingPhotoImg` + catálogo `landing-photo.ts`. Las rutas privadas de logros/atlas **siguen sirviendo PNG** (sin degradación); los WebP de anatomía/medallas quedan disponibles si un hito futuro los cablea globalmente. No se eliminan originales.

---

## 2. Conversión

Script: `apps/web/scripts/optimize-perf-01c.mjs` (ImageMagick, misma línea que IMG-PERF-01A/01B).

- Fondos / hero: WebP quality 82, method 6; pasos 768/1280 (hero) o 960/1600 (fondos).
- Medallas: WebP quality 86 + `alpha-quality=90`; pasos 256/512 + nativo.
- Anatomía landing: WebP quality 86; paso 640 + nativo.
- Sin AVIF (simplicidad / mantenimiento).
- Sin dependencias de runtime nuevas.

---

## 3. Tabla original vs optimizado

Tamaños de **archivo** (nativo WebP vs PNG). El navegador elegirá un paso menor vía `srcset` cuando corresponda.

| Recurso | Original (PNG) | Optimizado (WebP nativo) | Reducción nativa | Paso típico móvil |
|---|---|---|---|---|
| hero-holographic-anatomy | 1,875 MiB | 156,4 KB | 91,9 % | 41,9 KB (768w) |
| soma-journey-bg | 1,737 MiB | 119,7 KB | 93,3 % | 49,4 KB (960w) |
| soma-atlas-bg | 1,885 MiB | 154,8 KB | 92,0 % | 59,7 KB (960w) |
| soma-science-bg | 1,920 MiB | 163,7 KB | 91,7 % | 65,5 KB (960w) |
| soma-methodology-bg | 1,835 MiB | 150,7 KB | 92,0 % | 61,3 KB (960w) |
| soma-origin-bg | 1,763 MiB | 103,5 KB | 94,3 % | 28,5 KB (960w) |
| soma-missions-journal-bg | 1,669 MiB | 81,5 KB | 95,2 % | 25,6 KB (960w) |
| soma-achievements-bg | 2,006 MiB | 178,9 KB | 91,3 % | 71,9 KB (960w) |
| nicotine-bronze | 2,588 MiB | 401,5 KB | 84,8 % | 23,6 KB (256w) |
| alcohol-bronze | 2,302 MiB | 331,9 KB | 85,9 % | 19,7 KB (256w) |
| alcohol-gold | 2,056 MiB | 310,9 KB | 85,2 % | 20,9 KB (256w) |
| nicotine-gold | 2,113 MiB | 324,8 KB | 85,0 % | 20,8 KB (256w) |
| cannabis-gold | 2,208 MiB | 334,2 KB | 85,2 % | 20,4 KB (256w) |
| body-master-anterior | 1,933 MiB | 237,5 KB | 88,0 % | 105,4 KB (640w) |
| system-central-nervous | 1,948 MiB | 227,5 KB | 88,6 % | 104,6 KB (640w) |
| respiratory-highlight-anterior | 1,929 MiB | 233,9 KB | 88,2 % | 104,0 KB (640w) |
| system-digestive | 1,968 MiB | 246,2 KB | 87,8 % | 111,0 KB (640w) |
| system-integumentary | 1,973 MiB | 215,4 KB | 89,3 % | 98,5 KB (640w) |
| **Total afectados** | **35,71 MiB** | **3,88 MiB** (nativo WebP) | **89,1 %** | **~1,01 MiB** (pasos tipicos movil) |

Objetivo orientativo (>60 %): **cumplido** en peso de archivo y en transferencia típica móvil.

---

## 4. Estrategia de carga

| Zona | Comportamiento |
|---|---|
| Hero | `LandingPhotoImg`, **sin** `loading="lazy"`, `fetchPriority="high"`, `sizes` responsive, WebP srcset |
| Fondos below-fold | `loading="lazy"` + WebP srcset (`100vw`) — son `<img>` absolutos, no `background-image` CSS |
| Medallas showcase | `loading="lazy"`, `decoding="async"`, `sizes` 96–144 px → 256/512w |
| Atlas plates | `loading="lazy"` + WebP; crossfade `onLoad` preservado |
| Expedition | Sin cambio (ya PhotoPlateImg + lazy) |

**Carga inicial móvil (esperado):** hero WebP (~42–156 KB según viewport) + JS/CSS existentes. Fondos y medallas diferidos hasta scroll/proximidad.

**Transferencia inicial vs peso en disco:** la reducción de archivo (~89 %) no equivale 1:1 a Lighthouse hasta medir en red; se distingue aquí. **No se inventan mejoras de Lighthouse.**

LCP: el hero sigue siendo el **candidato** más plausible; no se afirmó LCP confirmado sin traza de campo.

---

## 5. Cableado de código

- `landing-photo.ts` — catálogo WebP
- `LandingPhotoImg.tsx` — `<picture>` + PNG fallback (patrón PhotoPlateImg)
- Componentes: Hero, Features, Journey, Atlas, Science, Methodology, Origin, MissionsJournal, Achievements
- Script: `optimize-perf-01c.mjs`

---

## 6. Comprobaciones visuales (PERF-01C-FINAL)

Chromium (cursor-ide-browser) sobre `vite preview` (`127.0.0.1:4173`).

| Viewport | Hero | Fondos | Medallas | Atlas | Overflow-X |
|---|---|---|---|---|---|
| 320 ES | OK (`*-768.webp`) | OK al scroll | OK | OK | no |
| 375 ES | OK; `fetchPriority=high`; sin `loading=lazy` | science-bg cerca del fold se adelanta; resto diferido | `*-256.webp` al scroll | `*-640.webp` | no |
| 768 ES | OK (srcset sube) | OK | `*-512.webp` | OK | no |
| 1440 ES/EN | OK nativo 1828w (paneles visibles) | OK | OK | OK | no |

Red (375, `scrollY=0`, cache deshabilitada):
- Inicial: `hero-holographic-anatomy-768.webp` (~43 KiB) + `soma-science-bg-960.webp` (~67 KiB; Features tras hero).
- Pendientes: 17 imgs lazy (journey/atlas/origin/missions/achievements, anatomía, medallas).
- Tras scroll: WebP responsive; **0** broken; `fetch` muestra **HTTP 200** `image/webp`.
- PNG masters solo como `src` de fallback en el DOM (no transferidos en `currentSrc`).

Comparación PNG vs WebP (ImageMagick): hero, medallas (alpha), atlas y fondos oscuros **sin degradación perceptible** que justifique re-encode. Sin Lighthouse inventado. Sin correcciones de código en FINAL.

---

## 7. Tests

- `landing-photo.test.ts` (existencia WebP + srcset): OK
- Tests landing afectados (origin/web01c/expedition): OK
- Suite web completa: **1108/1108**
- Typecheck (`tsc -b`): OK
- Build (`pnpm build`): OK
- `git diff --check`: OK

---

## 8. Limitaciones y riesgos residuales

- PNG masters permanecen en `public/` (peso de deploy / CDN aún incluye originales).
- Medallas no-showcase y atlas privado siguen en PNG.
- `science-bg` se descarga en Features y Science si ambas entran en viewport (misma URL → caché HTTP).
- Sin medición Lighthouse post-cambio en este documento.
- Safari/iOS no reauditado aquí.
- Bundle JS ~2 MiB fuera de alcance.

---

## 9. Recomendaciones posteriores

1. Cablear WebP de medallas en `AchievementMedal` (beneficio app autenticada).
2. Cablear WebP de anatomía en el atlas privado.
3. PERF code-splitting de rutas privadas (pospuesto).
4. Medir LCP / Lighthouse en producción tras despliegue.
5. Valorar purgar PNG solo cuando el soporte WebP sea el único camino aceptado (hoy se mantienen como fallback).
