# PERF-01D — Diagnóstico del arranque React y LCP

Documento de auditoría. **Sin cambios de código**, sin commit / push / PR / merge / despliegue.
Fecha: **2026-11-13**.
Precedente: PERF-01A, PERF-01B (PR #122), PERF-01C (PR #123).

---

## 0. Estado Git

| Ref | Valor |
|---|---|
| Rama | `develop` |
| `HEAD` / `origin/develop` | `5db598b` (PERF-01C) |
| `origin/main` | `7a77e42` (merge PR #123) |
| PR #122 en main | Sí (`ee1d868` ancestro) |
| PR #123 en main | Sí (`7a77e42` / producto `5db598b`) |
| Working tree | Limpia de código PERF; untracked ajenos preservados (`docs/design/*`, capturas, inventarios) |

No se ejecutó merge, rebase, reset ni cherry-pick.

---

## 1. Evidencia disponible

### 1.1 Campo (propietario — Lighthouse móvil)

| Métrica | Valor |
|---|---|
| Performance | 71/100 |
| FCP | 3,8 s |
| LCP | 3,9 s |
| TBT | 190 ms |
| CLS | 0,008 |
| Speed Index | 7,2 s |
| JS transferido | ~572,7 KiB |
| JS no usado (estimado LH) | ~187,2 KiB |
| CSS bloqueante | ~300 ms |

Desglose LCP (elemento = hero holográfico WebP):

| Fase | Tiempo |
|---|---|
| Retraso de carga del recurso | 890 ms |
| Descarga de imagen | 230 ms |
| **Retraso de renderizado** | **2.870 ms** |

LH indica que el LCP no es descubrible desde el HTML inicial, pese a `fetchPriority="high"` y ausencia de `loading="lazy"`.

### 1.2 Chromium local (cursor-ide-browser, `vite preview` :4173)

- Dispositivo emulado 375×812, DPR 2.
- **Limitación:** sin throttling CPU/red tipo Lighthouse; cache caliente → FCP ~204 ms en una pasada sin intro. **No se inventan mejoras de Lighthouse** a partir de estas cifras.
- Confirmado en runtime: intro presente en primera visita (`Skip introduction`); tras `sessionStorage` marcado, no hay overlay.
- Bundle producción local: `index-*.js` ~2.040 KiB en disco (~593 KiB gzip, coherente con ~573 KiB transferidos en LH).
- Un solo chunk JS; CSS ~86 KiB en disco.

---

## 2. Arranque React (confirmado)

Cadena real hasta el hero:

1. `index.html` — `#root` vacío; splash `#061018`; scripts de lang/SEO/token; **sin** markup del hero; **sin** `<link rel="preload">` de imagen.
2. `type="module"` → `main.tsx`.
3. Sync: `index.css`, i18n, `AuthProvider`, `AchievementSyncProvider`, `App`.
4. `App.tsx` importa **síncronamente** todas las rutas (`/app`, `/preview`, auth pages, legal, landing).
5. `RootRoute` (PERF-01B) pinta `<LandingV2Page />` mientras `loading` — **no espera** `/auth/refresh`.
6. `LandingV2Page` monta **todas** las secciones de la landing de una vez (Hero…Closing) + posible `SomaIntro`.
7. Solo entonces el DOM incluye `<picture>` / `img` del hero → el navegador descubre el WebP.

**Obligatorio antes del primer paint útil de la landing:** descarga + parse/eval del bundle monolítico + primer commit de React + CSS.

**No obligatorio para mostrar el hero (pero se carga igual hoy):** árbol `recovery-dashboard` (~1,5 MiB de fuentes), páginas `/app`/`/preview`, gran parte de achievements sync UI, páginas legales/auth.

---

## 3. Diagnóstico LCP (confirmado + hipótesis)

### 3.1 Confirmado: el hero no existe en HTML

Coincide con el aviso de Lighthouse. El recurso LCP solo aparece tras hidratar React → contribuye al **retraso de carga del recurso (~890 ms)** (JS debe llegar y ejecutarse antes de la petición de imagen).

### 3.2 Confirmado: opacidad del hero condicionada al intro

En `LandingV2Hero`:

- `shown = introComplete || reduceMotion`
- Contenedor del arte: `initial={{ opacity: 0, … }}` y `animate={shown ? { opacity: 1 } : { opacity: 0 }}`

En `LandingV2Page` / `SomaIntro`:

- Primera visita: `shouldPlayLandingV2Intro()` → `introComplete` empieza en `false`.
- `SomaIntro` llama `onReveal` → `setIntroComplete(true)` en `beginFade`, por defecto a **`FADE_AT_MS = 3000`** (o antes si se omite).

Mientras `introComplete` es false, el arte del hero permanece en **opacity 0**. Un elemento con opacidad 0 **no puede completar LCP** aunque la imagen ya esté descargada.

Esto encaja cuantitativamente con el **retraso de renderizado ~2.870 ms** del informe Lighthouse (misma escala que la espera del intro + animación de entrada ~0,8 s).

**Hipótesis fuerte (muy alineada con datos):** en auditorías de primera visita / storage limpio, el LCP del hero espera al reveal del intro.

**Matiz:** en visitas siguientes (`sessionStorage` marcado) el intro no se muestra; aún así el hero **sigue** animando desde opacity 0 → 1 (0,8 s), lo que añade retraso de renderizado residual.

### 3.3 Confirmado: descarga de imagen ya no es el cuello principal

PERF-01C: hero móvil ~42 KiB WebP. LH: descarga **230 ms**. Secundario frente a render delay.

### 3.4 Bundle monolítico (confirmado)

- `grep` de `React.lazy` / `import()` dinámico en `apps/web/src`: **cero usos**.
- `App.tsx` importa en estático Recovery, Explore, Anatomy, Journal, Missions, Expedition, Support, etc.
- Impacto principal esperado: **FCP / TBT / Speed Index** (parse/eval), y parte del retraso hasta descubrir el `<img>`.
- No explica por sí solo los ~2,87 s de render delay del LCP si la imagen ya está lista y el elemento está invisible.

### 3.5 Auth / API (confirmado no bloqueante del paint)

- `AuthProvider` hace `restoreSession()` en `useEffect` (después del primer render).
- `RootRoute` pinta landing en `loading`.
- `RegistrationModeProvider` solo afecta CTAs (estado `loading` → sin registro), no el hero.
- `/auth/refresh` y `/auth/registration-mode` pueden ser lentos (arranque en frío API) pero **no** son dependencia del render del LCP.

---

## 4. Análisis del bundle / code-splitting

| Oportunidad | Excluible del arranque `/` | Complejidad | Riesgo | Impacto esperado |
|---|---|---|---|---|
| Lazy de árbol `/app` + `/preview` (`soma2Pages` + `PreviewShell` + dashboard) | Alto (dashboard es el mayor árbol) | Media | Medio (rutas, prefetch, tests) | FCP/TBT/SI; LCP solo vía JS más temprano |
| Lazy de páginas auth/legal | Bajo–medio | Baja | Bajo | Marginal en `/` |
| Lazy de secciones below-fold de la landing | Medio | Media | Medio (SEO visual, UX scroll) | Menor que route-split; hero ya está arriba |

No se recomienda una refactorización global de arquitectura: bastaría con **límites `React.lazy` en rutas privadas/demo** + quizá auth pages.

---

## 5. Preload del hero desde `index.html`

| Aspecto | Evaluación |
|---|---|
| `srcset` / `sizes` actuales | 768 / 1280 / nativo; `sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 1828px"` |
| Beneficio | Podría recortar parte de los **890 ms** de discovery |
| No resuelve | Opacity 0 / intro (los **2.870 ms**) |
| Riesgos | Precargar variante equivocada; duplicar petición si el `picture` elige otra URL; ES/EN irrelevante para la imagen |
| og:image | Sigue apuntando al **PNG** del hero (SEO), no es el LCP runtime |

**Conclusión:** preload es táctica secundaria; no priorizarla antes de corregir la visibilidad del LCP.

---

## 6. Riesgos residuales

- Mediciones locales sin throttling no reproducen FCP/LCP de campo.
- Lighthouse de primera visita puede incluir intro; visitas reales con intro visto tendrán otro perfil.
- Code-splitting mal hecho puede empeorar navegación a `/app` o `/preview`.
- Quitar animación del hero sin cuidado altera la identidad visual del intro.

---

## 7. Hasta tres recomendaciones (ordenadas)

### R1 — Desacoplar el paint del LCP del intro / fade-in (prioridad alta)

- **Qué:** Mantener el `<img>` del hero visible (opacity 1) desde el montaje; el overlay del intro puede taparlo. Evitar `animate` desde opacity 0 en el elemento LCP (animar solo copy/velos si hace falta).
- **Beneficio esperado:** Recortar la mayor parte del **retraso de renderizado (~2,9 s)** en primera visita; LCP mucho más cercano a “imagen lista”.
- **Riesgo:** Bajo–medio (revisión visual del intro).
- **Complejidad:** Baja.
- **Seguridad / auth:** Ningún impacto.
- **Estado:** Causa **confirmada** en código; impacto alineado con LH.

### R2 — Code-splitting de rutas `/app` y `/preview` (prioridad media)

- **Qué:** `React.lazy` + `Suspense` para el árbol dashboard; dejar landing + providers mínimos en el chunk inicial.
- **Beneficio esperado:** Mejor FCP/TBT/SI; descubrimiento algo más temprano del hero.
- **Riesgo:** Medio.
- **Complejidad:** Media (no global).
- **Estado:** Oportunidad **confirmada** (cero lazy hoy).

### R3 — Preload responsive del WebP móvil del hero (prioridad baja)

- **Qué:** `<link rel="preload" as="image" …>` acotado a la variante 768w / `imagesrcset`+`imagesizes` alineados.
- **Beneficio esperado:** Parcial sobre los ~890 ms de resource delay.
- **Riesgo:** Medio (variante incorrecta / duplicados).
- **Complejidad:** Baja, pero frágil.
- **Estado:** Hipótesis de mejora menor; **no** ataca el render delay dominante.

---

## 8. Decisión propuesta

**No cerrar** la fase de optimización todavía: existe una intervención **sencilla, segura y medible** (R1) cuya hipótesis encaja con el desglose LCP de Lighthouse.

**Siguiente hito sugerido:** PERF-01E (o similar) — implementar solo R1, medir Lighthouse móvil (primera visita y visita con intro ya visto), y solo entonces valorar R2.

R3 queda aparcada salvo que tras R1 el resource delay siga siendo material.

**Fuera de alcance de cualquier follow-up inmediato:** backend, AuthProvider, registration-mode, SEO copy, más conversión de imágenes, bundle splitting agresivo de la landing.

---

## 9. Resumen ejecutivo

| Pregunta | Respuesta |
|---|---|
| ¿Auth bloquea el paint? | **No** (PERF-01B). |
| ¿Imágenes son el cuello? | **Ya no** (PERF-01C; descarga LCP ~230 ms). |
| ¿Por qué LCP ~3,9 s? | Principalmente **render delay**: hero invisible hasta intro (~3 s) + fade; secundariamente JS monolítico que retrasa el discovery. |
| ¿Qué hacer? | **R1 primero**; R2 después si FCP/TBT lo exigen; no preload como primer paso. |
