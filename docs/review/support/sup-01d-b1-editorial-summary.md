# SUP-01D-B1 / B2 — Resumen editorial

Paquete de fichas educativas de Apoyo.
**SUP-01D-B1** aprobado editorialmente para integración local (sin validación clínica atribuida).
**SUP-01D-B2** implementación local en curso / pendiente de revisión técnica y autorización de publicación.

Fecha: 2026-11-12
Hito siguiente (no autorizado sin OK): publicación / despliegue.

---

## 1. Fichas

| ID editorial | ID producto (`?strategy=`) | Categoría | Nivel | Estado |
|---|---|---|---|---|
| `support.stress.pause` | `stress.pause` | `stress` | A (+B) | Habilitada en catálogo local |
| `support.habits.small-routines` | `habits.small-routines` | `habits` | A | Habilitada en catálogo local |
| `support.emotions.naming` | `emotions.naming` | `emotions` | B | Habilitada en catálogo local |

`contentVersion` = `0.1.0`.
`relapse`: sin ficha; sigue «Prevista».

---

## 2. Correspondencia Markdown ↔ código

| Registro editorial | Runtime |
|---|---|
| `docs/review/support/sup-01d-b1-*.md` | `apps/web/.../support/support-strategy-content.ts` |
| `sup-01d-b1-references.md` | Referencias públicas en el mismo módulo (organismo, título, URL, notas de verificación parcial) |
| Metadatos / allow-list | `support-strategies.ts` |

Los Markdown siguen siendo el registro de revisión. El contenido ejecutable **no** se duplica en i18n ni en un CMS: una sola fuente tipada en Support. Cualquier cambio editorial debe actualizar ambos lados.

---

## 3. Correcciones menores aplicadas en B2

- Hábitos ES: «del insomnia» → «del insomnio».
- Estrés: precauciones distinguen malestar habitual vs síntomas que requieren valoración médica urgente (dolor/opresión torácica nuevos o intensos y acompañantes).
- Emociones: «si recurres al consumo… o notas que está aumentando» (+ EN equivalente).

---

## 4. No publicación en producción

Integración local sí; **sin** commit/push/PR/merge/despliegue autorizados en este informe.
Prevención de recaídas, consejos clínicos y borradores siguen fuera del allow-list.
