# SUP-01E2-A — Diseño funcional y evaluación de privacidad del Plan Personal de Apoyo

Documento de trabajo. **No publicado. No es implementación.**
Fecha de análisis: **2026-11-12**.
Hito siguiente (no autorizado aquí): SUP-01E2-B.

Contexto: SUP-01D desplegado (PR #117); SUP-01E1 desplegado (PR #118). Esta fase no modifica código ejecutable, traducciones, backend, textos legales ni ROADMAP.

---

## 1. Estado Git

| Referencia | SHA (inspección 2026-11-12, tras `git fetch`) |
|---|---|
| Rama local | `develop` |
| HEAD local / `origin/develop` | `11337a0570ea5156befd4bdbdfa69552955ef9d5` (commit SUP-01E1-B) |
| `origin/main` | `8bdca1cc7ef3953da61c55933590a99e4b427494` (merge PR #118) |

Observaciones:

- PR #118 ya está en `main`. El merge commit `8bdca1c` es el único commit en `HEAD..origin/main`.
- `origin/develop` y el HEAD local **aún no incluyen** ese merge commit; el contenido de producto de E1 sí está en `11337a0`.
- **Alineación opcional** de `develop` con `main` (fast-forward del merge #118): posible y recomendable **antes de SUP-01E2-B**, pero **no** se ejecuta en esta fase (instrucción explícita).
- Working tree: solo untracked ajenos (`docs/design/*`, otros `docs/review/` históricos). Este documento es el único entregable nuevo previsto.

Sin commit, push, PR, merge ni despliegue en SUP-01E2-A.

---

## 2. Arquitectura actual del Centro de Apoyo

Rutas compartidas DEMO/LIVE: `/preview/support` y `/app/support` (`SupportPage.tsx` → hub `SupportSections.tsx` o ficha `SupportStrategySheet` si `?strategy=` es válido).

| Bloque | Estado | Persistencia / datos |
|---|---|---|
| Respiración guiada (SUP-01C) | Publicado | Solo estado de sesión de UI; sin storage ni red |
| Estrategias educativas (SUP-01D) | Tres fichas ES/EN; `relapse` «Prevista» | Catálogo estático; query `?strategy=` |
| Recursos de aprendizaje | Enlaces a Explorar publicados | Sin datos de usuario |
| Panel «Si necesitas ayuda ahora» + recursos oficiales (SUP-01E1) | 112, 024, PNSD, Find A Helpline; cobertura ES/Otros | Solo `useState`; sin geo; `tel:` / HTTPS explícitos |
| **Tu plan de apoyo** | Placeholder «En desarrollo» | Copy: *«Todavía no está disponible y no guarda ningún dato.»* — sin formulario ni progreso |

Patrones reutilizables: catálogos tipados + allow-list; `previewFocus` + `min-h-11`; secciones `aria-labelledby`; i18n `support` ES/EN; sin telemetría de uso de herramientas.

Auth (contexto, no cambio): JWT de acceso en memoria; cookie HttpOnly de refresh; `terms.accountsBody` pide **no introducir datos de terceras personas**; `privacy.specialBody` ya contempla categorías especiales (art. 9) para sustancias/bitácora con consentimiento explícito **aparte del registro**.

---

## 3. Objetivo del Plan Personal de Apoyo

Ofrecer un espacio **educativo y orientativo** donde la persona adulta pueda:

1. Recordar que existen recursos y estrategias ya publicados en Soma.
2. Orientarse hacia ayuda profesional / emergencias **sin** que Soma actúe como canal de crisis.
3. Ejercer autonomía: elegir qué leer o practicar, sin protocolo terapéutico ni promesa de prevención de recaídas.

**No es:** plan clínico, evaluación de riesgo, diario de salud, agenda de contactos, ni sistema de supervisión.

Nombre de producto propuesto (MVP): mantener **«Tu plan de apoyo»** (ya en UI), con subtítulo que deje claro el carácter no clínico y la política de datos (ver §9).

---

## 4. Evaluación de necesidad real

### Pregunta

¿Es necesario que el Plan Personal de Apoyo **almacene** información introducida por el usuario?

### Respuesta corta

**No para el MVP.** La utilidad demostrable del plan, en el estado actual del Centro de Apoyo, proviene de **organizar y reutilizar lo ya publicado** (herramientas, estrategias, ayuda profesional), no de capturar narrativa personal, síntomas o teléfonos de terceros.

Almacenar texto libre o contactos:

- Añade sensibilidad (posible categoría especial / datos de terceros).
- Exige transparencia, bases legales, borrado, seguridad y probablemente cambios legales.
- Compite con Bitácora (ya pensada para textos personales con consentimiento sanitario) y con el panel de ayuda (ya orienta a profesionales).
- Genera expectativas de «mi plan guardado» difíciles de cumplir de forma segura en DEMO y en dispositivos compartidos.

Conclusión de producto: **priorizar un plan orientativo sin datos personales**. Cualquier campo editable o persistente queda fuera hasta decisión explícita + revisión jurídica.

---

## 5. Comparación de alternativas A / B / C

| Criterio | A — Orientativo sin datos | B — Editable solo en memoria | C — Persistente |
|---|---|---|---|
| Utilidad MVP | Alta si enlaza respiración, estrategias, ayuda | Media: personalización efímera; riesgo de falsa sensación de guardado | Alta a largo plazo; baja si se lanza sin marco legal |
| Datos personales | Ninguno (solo IDs de contenido publicado) | Posibles textos/contactos en RAM | Textos, IDs, posiblemente contactos en servidor |
| Privacidad | Mínima superficie | Menor que C, **no nula** (pantallas compartidas, capturas, shoulder surfing) | Máxima superficie; probable art. 9 si hay salud/recuperación |
| Complejidad técnica | Baja (UI + enlaces) | Media (estado, avisos anti-guardado, tests) | Alta (API, cifrado/acceso, export, borrado, legal, DEMO) |
| Mantenimiento | Bajo | Medio (UX de volatilidad) | Alto |
| Adecuación MVP | **Sí** | Solo si se limita a selección de recursos publicados **sin** texto libre ni teléfonos | **No** sin análisis jurídico y diseño de seguridad |

### Alternativa A — Plan orientativo sin datos personales

Lista o checklist educativa con enlaces internos a:

- Respiración (`#support-breathing`).
- Estrategias publicadas (`?strategy=`).
- Panel de ayuda / cobertura.
- Términos `#terms-emergency`.

Sin inputs de texto, sin contactos, sin progreso persistente. El «plan» es una **guía de recorrido**, no un documento del usuario.

### Alternativa B — Editable en memoria

Estado React durante la visita. Desaparece al recargar/cerrar. Sin `localStorage` / `sessionStorage` / cookies / backend.

Riesgos que **no** desaparecen:

- Expectativa falsa de guardado.
- Texto sensible visible en pantalla (o en capturas).
- Datos de terceros en dispositivo compartido.
- Exportación manual (portapapeles, archivo, impresión) → copia fuera de control de Soma.

Si algún día se explorara B, el alcance máximo aceptable sería: **marcar IDs de recursos publicados** (booleanos), nunca nombres/teléfonos/texto libre. Aun así, A sigue siendo preferible para el primer lanzamiento.

### Alternativa C — Persistente

Requisitos de decisión (no diseño de implementación):

- Inventario de datos y posible art. 9 RGPD.
- Base jurídica / consentimiento contextual (como bitácora).
- Actualización de `legal.json` / privacidad / cookies.
- API autenticada, aislamiento por usuario, borrado, export, retención.
- Política DEMO (sin datos reales) vs LIVE.
- Prohibición de notificaciones a terceros y de contacto automático (ya en ROADMAP).
- Evaluación de dispositivos compartidos y sesiones.

**Coste:** alto; **bloqueante** sin revisión jurídica. No es MVP.

### Recomendación única

**Alternativa A** para SUP-01E2-B.

Justificación: maximiza utilidad demostrable con el inventario ya publicado; minimiza tratamiento de datos; evita contradicción con `accountsBody` (terceros) y con el copy actual del panel («no guarda ningún dato»); mantiene DEMO/LIVE idénticos; encaja en privacidad por diseño y en el tamaño del MVP.

---

## 6. Análisis de datos y riesgos de privacidad

### Por área propuesta

#### A. Situaciones difíciles que deseo reconocer

| | |
|---|---|
| Finalidad | Autoreflexión / preparación |
| Utilidad real | Alta en terapia; **baja en Soma** sin acompañamiento clínico |
| Datos | Texto libre (posible salud / adicciones) |
| Sensibilidad | Alta (posible categoría especial) |
| Almacenamiento | No necesario para MVP |
| Alternativa sin datos | Frases **preescritas educativas** (no personalizadas) + enlace a estrategias; sin campo libre |
| MVP | **No** incluir input. Opcional: 2–3 ejemplos genéricos no editables |

#### B. Recursos educativos o herramientas que me pueden ayudar

| | |
|---|---|
| Finalidad | Orientar hacia lo ya publicado |
| Utilidad real | **Alta** — núcleo del plan |
| Datos | Solo IDs de catálogo (no personales) |
| Sensibilidad | Nula si no hay preferencias persistidas del usuario |
| Almacenamiento | No |
| Alternativa | Checklist estática o enlaces agrupados |
| MVP | **Sí** — imprescindible |

#### C. Personas de confianza

| | |
|---|---|
| Finalidad | Recordar red social de apoyo |
| Utilidad real | Conceptualmente alta; **en app, riesgo > beneficio** si se piden nombres/teléfonos |
| Datos | Identificadores de terceros |
| Sensibilidad | Alta (terceros; `accountsBody` ya desaconseja) |
| Almacenamiento | No |
| Alternativa | Orientación genérica («elige fuera de Soma a quién contar») |
| MVP | **Solo texto orientativo**; sin campos |

#### D. Recursos profesionales disponibles

| | |
|---|---|
| Finalidad | Derivación segura |
| Utilidad real | **Alta** — ya resuelto en SUP-01E1 |
| Datos | Ninguno nuevo (reutilizar panel) |
| Sensibilidad | N/A |
| MVP | **Sí** — enlace/ancla al panel de ayuda, sin duplicar catálogo |

#### E. Recordatorios personales o próximos pasos

| | |
|---|---|
| Finalidad | Compromiso personal |
| Utilidad real | Media; se solapa con Bitácora / hábitos futuros |
| Datos | Texto libre |
| Sensibilidad | Media–alta |
| Almacenamiento | No en MVP |
| Alternativa | «Próximo paso» genérico preescrito (p. ej. «probar respiración 2 minutos») |
| MVP | **No** campo libre; como mucho 1–2 sugerencias fijas |

### Riesgos transversales

| Riesgo | Notas |
|---|---|
| Datos de salud | Texto sobre craving, ánimo, ideación → posible art. 9; no tratar en plan sin análisis jurídico |
| Texto libre | Imprevisible; dificulta minimización |
| Terceros | Nombres/teléfonos; contradicción con términos actuales |
| Consentimiento | Registro ≠ consentimiento sanitario (`specialBody`) |
| Exposición local | Pantalla, historial, capturas, compartir dispositivo |
| Persistencia involuntaria | Autocompletado del navegador en inputs; evitar inputs |
| Telemetría | No introducir eventos de «plan completado» con contenido |
| Logs | No registrar cuerpo de plan en frontend/backend |
| Scripts externos | Mantener ausencia de analytics de terceros en Support |
| Exportaciones | Fuera de MVP; si se plantean, son copia fuera de Soma |
| Borrado | Con A, no hay datos que borrar |
| DEMO | No es «privado por definición»; no pedir datos reales en DEMO |
| LIVE autenticado | No autoriza automáticamente tratar salud en un plan nuevo |

Distinción:

- **Requisito técnico (A):** cero inputs personales; cero storage; reutilizar allow-lists.
- **Recomendación de privacidad:** no B/C en MVP; contactos fuera de Soma.
- **Pendiente jurídico:** cualquier paso a B con texto libre o a C; mención opcional en términos de «plan orientativo sin datos» (no bloqueante si A no añade tratamiento).

---

## 7. Evaluación de contactos de confianza

| Opción | Veredicto |
|---|---|
| Guardar nombre/teléfono en Soma | **Rechazado** para MVP (y desaconsejado en general sin marco legal fuerte) |
| Campos opcionales sin persistencia | Sigue exponiendo terceros en pantalla; útil poco tiempo; riesgo de expectativa de guardado |
| Acceso a agenda del dispositivo | **Fuera de alcance**; permisos, plataformas, superficie de ataque |
| Llamadas / SMS / notificaciones a terceros | **Prohibido** (ROADMAP y principios de apoyo) |
| Orientación genérica + recursos oficiales | **Recomendado** |

**Solución mínima:** un párrafo educativo («Ten presente a personas de confianza fuera de Soma; no las registres aquí») + enlace al panel de ayuda profesional / emergencias. Los contactos **permanecen fuera de Soma**.

---

## 8. Emergencias y seguridad (producto)

El plan **no** es respuesta ante emergencia.

Distinción obligatoria en copy y UI:

1. Autocuidado general (respiración, estrategias educativas).
2. Personas de confianza (fuera de la app).
3. Atención profesional (024, PNSD, Find A Helpline, etc.).
4. Emergencias (112 / servicios locales).

Prohibiciones de diseño: detección automática de crisis; cuestionarios de riesgo suicida; decisiones automatizadas de salud; promesa de supervisión humana; promesa de prevención de recaídas.

Reutilizar `SupportHelpResources` y `/terms#terms-emergency`.

---

## 9. Propuesta funcional de MVP (Alternativa A)

### Imprescindible

1. Sustituir el placeholder «En desarrollo» por un panel usable **orientativo**.
2. Título + 2–3 frases: educativo, no clínico, **no guarda datos**.
3. Secciones cortas con enlaces a:
   - Respiración.
   - Las tres estrategias publicadas.
   - «Si necesitas ayuda ahora» (scroll/ancla interna).
   - Términos de situaciones que requieren ayuda profesional.
4. Bloque breve «Personas de confianza» **sin formulario** (solo orientación).
5. Paridad ES/EN y DEMO/LIVE.
6. Tests de ausencia de storage, inputs de texto libre, `tel:` no autorizados y telemetría nueva.

### Opcional (solo si no alarga el MVP)

- Checklist visual de «recorrido sugerido» **sin estado persistente** (puramente presentacional, o toggles que no se guardan y se reinician al salir — preferible evitar toggles para no sugerir guardado).
- Ancla `#support-plan` para deep-link desde otras zonas.

### Posponer

- Texto libre (situaciones, recordatorios).
- Contactos / agenda.
- Persistencia (C).
- Exportación / impresión / PDF.
- Progreso «3 pasos completados» del mockup `apoyo-2.0` si implica estado de usuario.
- Gamificación / logros ligados al plan.
- Notificaciones.
- Prevención de recaídas (hito editorial/clínico propio).
- Asistente conversacional.

### Criterios de aceptación (alto nivel → detalle en §14)

Panel publicado, sin datos personales, enlaces correctos DEMO/LIVE, a11y básica, copy anti-emergencia y anti-guardado verificados por tests.

### Condiciones previas a publicación

- Aprobación de este documento (SUP-01E2-A).
- Autorización expresa de SUP-01E2-B.
- (Recomendado) alinear `develop` con `origin/main` (`8bdca1c`) antes de implementar.
- Revisión rápida de copy legal: si A no añade tratamiento, **no** es obligatorio cambiar `legal.json`; cualquier mención nueva requiere autorización aparte.

---

## 10. Navegación y UX

### Acceso

Desde el propio Centro de Apoyo: el panel inferior derecho actual («Tu plan de apoyo») pasa de placeholder a contenido. **Sin** pestaña nueva ni página aparte (coherente con SUP-01B–E1: sin tabs del mockup).

### Al empezar

1. Qué es (orientación educativa).
2. Qué **no** es (tratamiento, emergencia, plan clínico).
3. Qué datos se conservan: **ninguno**.

### Pasos

Máximo **una pantalla** con 3–4 bloques cortos. Evitar wizard multipaso.

### Formularios

Ninguno en MVP.

### Regreso a recursos

Enlaces internos con `previewFocus`, mismos patrones que estrategias/ayuda (`Link` / hash).

### Abandono / recarga

Sin estado que perder. Copy estable: no hay «borrador».

### Falsas expectativas de guardado

- No usar verbos «Guardar», «Mi plan guardado», «Continuar más tarde».
- Mantener hint explícito de no almacenamiento (evolución del `plan.statusHint` actual).
- No mostrar barras de progreso de usuario.

### Estética

Misma familia visual (`panelClass`, tipografía, acentos). Sin ilustraciones nuevas. Sin chat.

---

## 11. Arquitectura técnica mínima

### Alternativa A (recomendada)

| Pieza | Propuesta |
|---|---|
| Componentes | Extender sección plan en `SupportSections` o extraer `SupportPersonalPlan.tsx` de solo lectura |
| Estado | Ninguno, o UI efímera sin datos personales |
| Storage | Prohibido |
| Backend / endpoints | Ninguno |
| DEMO/LIVE | Mismo árbol; bases `/preview` y `/app` en links |
| Reutilización | `supportBreathingLocation`, `supportStrategyHref`, ancla ayuda, `SUPPORT_TERMS_EMERGENCY_HREF` |
| i18n | Ampliar claves `support:plan.*` ES/EN |
| Tests | Render hub; hrefs; ausencia de `<textarea>`/`tel:` nuevos; sin `localStorage` |
| A11y | `aria-labelledby`, listas semánticas, foco visible |
| Seguridad | Allow-list de destinos internos; externos solo vía panel E1 ya controlado |
| Mantenimiento | Bajo: copy + enlaces |

### Alternativa B (no MVP)

Estado React; avisos de volatilidad; prohibir export en primera iteración; tests anti-storage. Coste UX > beneficio si A cubre el valor.

### Alternativa C (no MVP)

Fuera de alcance de implementación aquí. Implica API, modelo de datos, consentimiento, legal, borrado, posiblemente cifrado en reposo, política DEMO.

---

## 12. Requisitos de accesibilidad

- Contraste acorde al tema Soma.
- Teclado: todos los enlaces/controles alcanzables; `previewFocus`.
- Objetivos táctiles ≥ `min-h-11`.
- Encabezados en orden; una `h2` de sección plan.
- Enlaces descriptivos (no «clic aquí»).
- Avisos de emergencia comprensibles y no solo por color.
- Responsive 320 / 375 / 768 / 1440 sin overflow horizontal.
- Paridad ES/EN y DEMO/LIVE.
- Sin dependencia de hover para información crítica.
- `prefers-reduced-motion` si se añade cualquier movimiento (preferible: ninguno nuevo).

---

## 13. Implicaciones legales pendientes

**No son dictámenes jurídicos.** Distinguir:

| Tema | Estado con Alternativa A | Si se eligiera B/C |
|---|---|---|
| Tratamiento nuevo de datos | En principio **no** (solo contenido editorial + enlaces) | Sí — requiere análisis |
| Categorías especiales (art. 9) | Evitadas si no hay texto de salud del usuario | Probable con texto libre / plan de recuperación |
| Datos de terceros | Evitados | Conflicto con `accountsBody`; base legal y transparencia |
| Consentimiento sanitario | No aplicable al plan A | Reutilizar o extender el modelo de bitácora; **no** asumir el del registro |
| Textos legales | Cambio **no obligatorio** para A; revisión opcional de redacción de emergencia/plan | **Obligatorio** actualizar privacidad/términos/cookies según almacenamiento |
| BETA-01D.3 | Sigue abierto a nivel jurídico de responsables/proveedores; no lo resuelve E2 | Persiste |

Cualquier conclusión de «cumplimiento RGPD» queda **pendiente de revisión jurídica** externa antes de persistir datos sensibles.

---

## 14. Criterios de aceptación para SUP-01E2-B

1. Panel «Tu plan de apoyo» deja de mostrar solo «En desarrollo» y ofrece contenido orientativo A.
2. Cero campos de texto libre, nombres o teléfonos de usuario/terceros.
3. Cero `localStorage` / `sessionStorage` / cookies / endpoints nuevos ligados al plan.
4. Enlaces verificados a respiración, estrategias publicadas, ayuda profesional y términos de emergencia.
5. Copy ES/EN: no clínico; no emergencia suficiente; no guarda datos; no promete prevención de recaídas.
6. DEMO y LIVE idénticos en comportamiento del plan.
7. Tests automatizados de los puntos 2–6 + a11y básica (roles/labels).
8. Typecheck, suite web y build OK.
9. Sin cambios en documentos legales salvo autorización expresa separada.
10. ROADMAP actualizado solo cuando se autorice el hito B (o al cerrar B).
11. Sin commit/push/PR/despliegue fuera del proceso autorizado por el propietario.

---

## 15. Propuesta de ROADMAP (no aplicar en esta fase)

Registrar, cuando se autorice actualizar `ROADMAP.md`:

- **SUP-01D:** completado y desplegado (PR #117).
- **SUP-01E1:** completado y desplegado (PR #118, merge `8bdca1c`).
- **SUP-01E2-A:** investigación / diseño / privacidad **en revisión** (`docs/review/support/sup-01e2-a-design-privacy.md`).
- **SUP-01E2-B:** implementación del plan orientativo (Alternativa A) **pendiente de aprobación**.
- **Prevención de recaídas:** pendiente de alcance editorial y clínico propio (no mezclar con E2).

No reabrir hitos completados.

---

## 16. Decisiones que requieren aprobación del propietario

1. **Adoptar Alternativa A** como alcance de SUP-01E2-B (recomendación de este documento).
2. Confirmar **exclusión** de contactos, texto libre y persistencia en el MVP.
3. Autorizar o no una mención legal opcional del plan orientativo (no bloqueante para A).
4. Autorizar **SUP-01E2-B** (implementación) tras revisar este documento.
5. Decidir cuándo alinear `develop` con `origin/main` (`8bdca1c`) — recomendado antes de B; no hecho aquí.
6. Mantener prevención de recaídas **fuera** de E2.
7. Si se rechaza A en favor de B o C: nueva pasada de diseño + **revisión jurídica** antes de código.

---

## Riesgos y mitigaciones (resumen)

| Riesgo | Mitigación |
|---|---|
| El mockup sugiere progreso y plan «personal» guardado | Copy explícito + no implementar progreso de usuario |
| Presión por añadir contactos | Orientación genérica; reutilizar E1 |
| Deslizar hacia Bitácora 2.0 dentro de Apoyo | Separar finalidades; no duplicar diario |
| Falsa sensación de seguridad ante crisis | Reutilizar avisos E1 + términos |
| Implementar C «porque la cuenta ya existe» | Consentimiento sanitario ≠ registro; bloquear hasta jurídico |
| A demasiado «pobre» | Valor = orquestar lo publicado; medir utilidad cualitativa tras B |

---

## Referencias de inspección

- `SupportPage.tsx`, `SupportSections.tsx`, `SupportHelpResources.tsx`
- `support-strategies.ts`, `BreathingTool.tsx`, `support-links.ts`
- `apps/web/src/i18n/locales/{es,en}/support.json` (`plan.*`, `help.*`)
- `apps/web/src/i18n/locales/{es,en}/legal.json` (`emergency*`, `accountsBody`, `specialBody`, `medicalBody`)
- `ROADMAP.md` (bloque SUP-01 / E2)
- `docs/review/support/sup-01e1-a-research.md`, `sup-01e1-b-editorial-note.md`

---

**Fin SUP-01E2-A.**
SIN COMMIT. SIN PUSH. SIN PR. SIN MERGE. SIN DESPLIEGUE.
No iniciar SUP-01E2-B sin aprobación expresa.
