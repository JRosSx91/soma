# SUP-02B — Registro de referencias (prevención de recaídas)

Documento de trabajo. Complementa `sup-02b-relapse-prevention.md` y `support-relapse-draft-content.ts` (cableado al catálogo publicado localmente).

**Revisión editorial:** completada (2026-11-16, correcciones de seguridad y copy).
**Revisión de seguridad:** completada.
**Validación clínica externa:** **no realizada**. Editorial ≠ clínica.
**Habilitación local:** `relapse.prevention` en allow-list.
**Publicación en producción:** desplegada según confirmación visual del propietario tras PR #127/#128; SHA Render no verificado independientemente.

---

## 1. Fuentes (URL comprobadas o aportadas para el hito)

| ID | Fuente | Tipo | URL / localizador | Afirmaciones respaldadas en la ficha | Limitaciones |
|---|---|---|---|---|---|
| REF-RP-01 | NIDA — *Treatment and Recovery* | Divulgación institucional | https://nida.nih.gov/publications/drugs-brains-behavior-science-addiction/treatment-recovery | Recaída no = fracaso automático del tratamiento; retomar/ajustar/cambiar plan; desencadenantes (estrés, señales, contacto con sustancia); riesgo tras pérdida de tolerancia | No es revisión sistemática; no valida Soma como terapia; no es protocolo de sobredosis |
| REF-RP-02 | NIDA — *Understanding Drug Use and Addiction DrugFacts* | Ficha institucional | https://nida.nih.gov/publications/drugfacts/understanding-drug-use-addiction | Adicción crónica con riesgo de retorno al uso; el tratamiento suele requerir ajustes | Resumido; no guía por sustancia |
| REF-RP-03 | SAMHSA — *Working Definition of Recovery* (PEP12-RECDEF) | Definición de trabajo | https://library.samhsa.gov/sites/default/files/pep12-recdef.pdf | Recuperación no lineal; pueden aparecer retrocesos; resiliencia como parte del proceso | Política/orientación, no ensayo clínico |
| REF-RP-04 | SAMHSA TIP 65 — capítulo HTML (NCBI Bookshelf) | Guía TIP (HTML) | https://www.ncbi.nlm.nih.gov/books/NBK601486/ | Marco: recurrencia puede formar parte de la recuperación; no implica fracaso; puede requerir ajustar enfoques (contexto profesional) | Dirigida a profesionales; **no** se copian técnicas clínicas del Cap. 3 a la app |
| REF-RP-05 | WHO — *Opioid overdose* (fact sheet) | Ficha institucional | https://www.who.int/news-room/fact-sheets/detail/opioid-overdose | Contexto de riesgo de sobredosis por opioides; remisión a ayuda de emergencia ante sospecha (sin protocolos de tratamiento en Soma) | No se reproduce el contenido clínico operativo de la ficha WHO |
| REF-RP-06 | CDC — *What to Do If You Think Someone Is Overdosing* | Orientación institucional (EE. UU.) | https://www.cdc.gov/stop-overdose/response/ | Refuerza buscar ayuda de emergencia ante sospecha de sobredosis | Página orientada a respuesta ante sobredosis; Soma **no** reproduce pasos clínicos (naloxona, posición, etc.) |
| REF-SO-01 | Soma — Condiciones / panel de ayuda | Producto | `/terms#terms-emergency` + recursos E1 | Remisión a ayuda profesional/emergencias sin inventar teléfonos | No es evidencia científica externa |

PDF TIP 65 (mismo documento): https://library.samhsa.gov/sites/default/files/pep23-02-01-003.pdf — el localizador HTML anterior es el preferido para el capítulo pertinente.

### Fuentes consultadas y **no** usadas como eficacia de Soma

| Fuente | Motivo |
|---|---|
| NICE CG51 / NG64 | Clínica / prevención poblacional; no autoayuda en app |
| Protocolos CBT / MBRP | Intervenciones formales |
| Pasos operativos CDC/WHO (naloxona, etc.) | No introducir instrucciones de tratamiento en la ficha |

**Ninguna fuente se presenta como evidencia de eficacia clínica de SOMA.**

---

## 2. Correspondencia afirmación ↔ fuente (post-correcciones)

| Afirmación en ficha | REF |
|---|---|
| Retorno al uso no demuestra fracaso; puede indicar retomar/ajustar/cambiar acompañamiento | RP-01, RP-02 |
| Desencadenantes: estrés, señales, contacto con sustancia | RP-01 |
| Recuperación no lineal; altibajos; resiliencia forma parte del proceso | RP-03, RP-04 |
| Tras abstinencia, tolerancia puede disminuir; mayor riesgo de sobredosis al volver, esp. opioides; emergencias si se sospecha sobredosis | RP-01, RP-05, RP-06 |
| Opción 5: priorizar seguridad / emergencias / contacto de confianza o profesional; valor de lo aprendido | RP-05, RP-06, SO-01 (remisión); tono no punitivo alineado con RP-01/RP-04 |
| Remisión general a profesionales y emergencias locales | SO-01 |

---

## 3. Afirmaciones deliberadamente **no** incluidas

- Eficacia de esta ficha para prevenir recaídas.
- Predicción individual.
- Desintoxicación, dosificación, «uso más seguro».
- Protocolos de actuación clínica ante sobredosis (naloxona, posición, etc.).
- Comparación cuantitativa «resiliencia vs abstinencia puntual».
- Autocuidado genérico post-consumo (agua/comida/sueño) como consejo post-uso.
- Teléfonos inventados; XP por craving o recaída.

---

## 4. Publicación en producto

| Campo | Valor |
|---|---|
| ID previsto | `relapse.prevention` |
| Allow-list | `relapse.prevention` habilitada |
| `SUPPORT_STRATEGY_BY_TOPIC.relapse` | `relapse.prevention` |
| Runtime publicado | Sí, según confirmación del propietario; SHA no verificado |
| SUP-02C | **No** bloqueado por esta dependencia externa |
