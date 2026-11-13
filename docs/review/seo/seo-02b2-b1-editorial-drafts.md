# SEO-02B2-B1 — Redacción y revisión editorial de páginas educativas públicas

Documento de trabajo. **Borradores editoriales + auditoría de fuentes. No es implementación.**
Fecha: **2026-11-13** (revisión **SEO-02B2-B1-REV**: precisión científica y claridad; misma fecha).
Referencia aprobada: `docs/review/seo/seo-02b2-a-public-learning-architecture.md`.
Hito siguiente (no autorizado aquí): **SEO-02B2-B2** (implementación técnica mínima, si se aprueban estos borradores).

---

## 1. Estado Git

Inspección local **2026-11-13** (**sin** `fetch` obligatorio de sincronización; **sin** merge/FF/push/commit):

| Referencia | Valor |
|---|---|
| Rama | `develop` |
| HEAD | `72e8698327d5c3dc19849c88025b5d8b716ddbe3` |
| `origin/main` | `72e8698` (igual que HEAD) |
| `origin/develop` | `dcd82ee` (local **ahead 1** = merge PR #120; sin push en este hito) |
| PR #120 | **Merged** en `main` — FAQ SEO-02B1-B (`merge_commit_sha` `72e8698`) |
| Working tree tracked | Limpio |
| Untracked | Ajenos (`docs/design/*`, otros `docs/review/`) + `docs/review/seo/seo-02b2-a-public-learning-architecture.md` + **este** documento |

ROADMAP: no modificado. Estado SEO-02B1-B en roadmap sigue desactualizado respecto a #120 (fuera de alcance).

---

## 2. Resumen editorial

| Página | Estado del borrador | Publicabilidad |
|---|---|---|
| **A — Neuroadaptación** | Completa ES/EN; **B1-REV** aplicada (exposición vs trastorno; tolerancia; naming de producto) | **Lista para aprobación final** del propietario antes de B2-B2 |
| **B — Curvas / modelos** | Completa ES/EN; **B1-REV** aplicada (catálogo parametrizado; confianza; sin IDs de código en copy público) | **Lista para aprobación final** del propietario antes de B2-B2 |

**Conjunto:** 2 temas × 2 idiomas = 4 URLs futuras. Página «qué mide / qué no» integrada en B.

**Tono:** educativo, calmado, no comercial agresivo. CTA discreta a `/` y demo `/preview`.

**Ciencia:** cuatro referencias de `neuroadaptation` **identificadas** y consultadas vía PubMed / páginas del editor / manuscritos PMC o abstract+key points (detalle §3). No se declara «revisión clínica» ni se eleva el catálogo in-app a verificación automática.

**B1-REV (alcance):** solo correcciones de precisión/claridad pedidas; sin nuevas fuentes; sin cambiar URLs/metadatos estructurales aprobados.

---

## 3. Auditoría de fuentes

### 3.1 Referencias de la ficha `neuroadaptation`

Consultadas el **2026-11-13** (agente editorial). Nivel de consulta: identidad bibliográfica confirmada + abstract y/o key points del editor y/o manuscrito PMC. **No** equivale a peer-review clínica de SOMA ni a lectura línea a línea de todos los PDFs de pago.

---

#### R1 — Nestler EJ, 2001

| Campo | Valor |
|---|---|
| Identificación | Nestler EJ. Molecular basis of long-term plasticity underlying addiction. *Nat Rev Neurosci.* 2001;2(2):119–128. DOI: [10.1038/35053570](https://doi.org/10.1038/35053570). PMID: [11252991](https://pubmed.ncbi.nlm.nih.gov/11252991/). |
| Consulta directa | Sí: PubMed abstract + página Nature (abstract + Key Points). PDF completo de editorial: no descargado aquí. |
| Qué respalda (con matiz) | Exposición crónica a drogas → cambios moleculares/celulares duraderos; plasticidad relacionada con adicción; paralelismos con aprendizaje/memoria; cambios en transcripción, procesamiento de proteínas y estructura sináptica (p. ej. densidad de espinas en modelos). |
| Limitaciones | Revisión (2001); gran parte en modelos animales; los cambios concretos citados no explican por sí solos la permanencia conductual; **no** es guía clínica ni calendario de recuperación humana. |
| ¿Citable en público con rigor? | **Sí**, como revisión de mecanismos de plasticidad en adicción, con disclaimer de alcance. |
| Verificación adicional | Opcional: PDF completo + corrección 2001 (Box 1) si se citan mecanismos moleculares concretos (CREB, ΔFosB) en copy público — **esos nombres no se usan** en el borrador A. |

**Afirmaciones del borrador A apoyadas por R1 (clase B):** plasticidad a largo plazo ante exposición repetida; cambios estables a nivel molecular/celular/sináptico en el marco de la adicción; analogía con aprendizaje (no identidad clínica).

---

#### R2 — Kauer JA, Malenka RC, 2007

| Campo | Valor |
|---|---|
| Identificación | Kauer JA, Malenka RC. Synaptic plasticity and addiction. *Nat Rev Neurosci.* 2007;8(11):844–858. DOI: [10.1038/nrn2234](https://doi.org/10.1038/nrn2234). PMID: [17948030](https://pubmed.ncbi.nlm.nih.gov/17948030/). |
| Consulta directa | Sí: PubMed + Nature Key Points + extractos de PDF de acceso educativo. |
| Qué respalda | Drogas de abuso pueden «secuestrar» mecanismos de plasticidad sináptica, especialmente en el sistema mesolímbico dopaminérgico; memorias asociadas a la droga; LTP/LTD en circuitos de recompensa (VTA, NAc, etc.) en modelos experimentales. |
| Limitaciones | Revisión; evidencia mayoritariamente preclínica; una exposición no implica adicción; autores advierten límites de extrapolación a humanos y de protocolos de autoadministración. |
| ¿Citable? | **Sí**, para plasticidad sináptica y circuitos de recompensa como marco educativo. |
| Verificación adicional | No necesaria para el nivel de generalidad del borrador; sí si se detallan LTP/LTD por sustancia. |

**Borrador A (B):** plasticidad sináptica; relevancia del sistema de recompensa; cambios que pueden persistir más allá de la presencia aguda de la sustancia.

---

#### R3 — Koob GF, Volkow ND, 2016

| Campo | Valor |
|---|---|
| Identificación | Koob GF, Volkow ND. Neurobiology of addiction: a neurocircuitry analysis. *Lancet Psychiatry.* 2016;3(8):760–773. DOI: [10.1016/S2215-0366(16)00104-8](https://doi.org/10.1016/S2215-0366(16)00104-8). PMID: [27475769](https://pubmed.ncbi.nlm.nih.gov/27475769/). PMC: [PMC6135092](https://pmc.ncbi.nlm.nih.gov/articles/PMC6135092/). |
| Consulta directa | Sí: abstract Lancet + manuscrito de autor en PMC. |
| Qué respalda | Marco de circuitos: recompensa/hábito (ganglios basales), estrés/afecto negativo (amígdala extendida), función ejecutiva (corteza prefrontal); plasticidad en esos dominios; variabilidad individual y recaída como temas de investigación. |
| Limitaciones | Revisión heurística orientada a adicción clínica; **no** describe el motor de curvas de SOMA; no autoriza diagnósticos por regiones ni calendarios universales. |
| ¿Citable? | **Sí**, para el «mapa de trabajo» recompensa–estrés–control, con disclaimer explícito. |
| Verificación adicional | Baja para el nivel del borrador; alta si se nombran neurotransmisores concretos de mini-circuitos. |

**Borrador A (B):** tres dominios de circuitos como marco educativo; experiencia heterogénea entre personas.

---

#### R4 — Lüscher C, Malenka RC, 2011

| Campo | Valor |
|---|---|
| Identificación | Lüscher C, Malenka RC. Drug-evoked synaptic plasticity in addiction: from molecular changes to circuit remodeling. *Neuron.* 2011;69(4):650–663. DOI: [10.1016/j.neuron.2011.01.017](https://doi.org/10.1016/j.neuron.2011.01.017). PMID: [21338877](https://pubmed.ncbi.nlm.nih.gov/21338877/). PMC: [PMC4046255](https://pmc.ncbi.nlm.nih.gov/articles/PMC4046255/). |
| Consulta directa | Sí: abstract Cell/PubMed + manuscrito PMC. |
| Qué respalda | Plasticidad sináptica evocadas por drogas en VTA/NAc/PFC; cambios que pueden perdurar tras aclarar la sustancia; una exposición temprana **no** basta para adicción; contexto importa; remodelación de circuitos con exposición repetida. |
| Limitaciones | Revisión mecanística; no es protocolo clínico; no calibra curvas de SOMA. |
| ¿Citable? | **Sí**, para persistencia de cambios sinápticos y distinción exposición ≠ trastorno. |
| Verificación adicional | Opcional para detalles glutamato/GABA por área. |

**Borrador A (B):** cambios que pueden outlast la droga; acumulación con repetición; no equivalencia automática con «daño» o con diagnóstico.

---

### 3.2 Fuentes de producto (Página B y claims A)

| Fuente | Path | Rol |
|---|---|---|
| Math de curvas | `packages/shared-types/src/recovery-math.ts` | `estimateCurve`, `curveProgress`, `estimatedRecovery` |
| Tipos | `packages/shared-types/src/recovery.ts` | Formas, techo, confianza |
| Landing | `apps/web/src/i18n/locales/{es,en}/landing-v2.json` | science, methodology, FAQ, limits |
| Recovery UI | `apps/web/src/i18n/locales/{es,en}/recovery.json` | Ejes y disclaimers de gráfica |
| Docs curvas | `docs/recovery-curves/README.md` | Limitaciones del modelo |
| SEO | `public-site.ts`, `index.html`, sitemap, robots | Indexabilidad actual |
| Ficha A | `explore-edu.json` ES/EN (`neuroadaptation`) | Base narrativa in-app (noindex) |
| Advice/síntomas | catálogos con `pending_clinical_review` | **Excluidos** del copy público |

---

## 4. Inventario de afirmaciones (A–D)

### Clase A — Verificables en producto
- SOMA es educativa; no dispositivo médico; no diagnostica ni trata (landing, FAQ, legales).
- Curvas/relojes = modelos del catálogo; un punto no es biomarcador del usuario (FAQ, science, recovery copy).
- Avance mostrado en UI = progreso heurístico a lo largo de la curva del catálogo; existe una magnitud interna avance × techo; **ninguna** es % de salud clínica (`recovery-math.ts`). En copy **público** de estas páginas no se nombran identificadores de código.
- Formas documentadas en landing: logarítmica, sigmoidea, lineal (no se publica `stepwise` en landing; tipo existe en código).
- Niveles de confianza del catálogo = **clasificación interna** orientativa sobre fuentes del modelo; **no** garantía de verificación bibliográfica completa ni probabilidad individual.
- Las trayectorias son **parametrizadas desde el catálogo educativo**; no modelan de forma completa la variabilidad individual, comorbilidades ni sinergias reales de policonsumo (README curvas; matiz respecto al copy de landing `science.limits`, que aún dice «promedios en condiciones estándar» — conflicto de redacción existente, no corregido en código en este hito).
- Demo sin cuenta en `/preview` (noindex); Explorar y Misiones publicados accesibles en demo/app.
- Ejes de gráfica educativa: marcas temporales de modelo (p. ej. 1 mes…365 días) y eje Y «avance de la curva educativa (%)» (`recovery.json`).

### Clase B — Científicas con evidencia comprobada en esta auditoría (nivel revisión)
- Neuroadaptación / plasticidad ante estimulación repetida por sustancias (R1–R4).
- Distinción conceptual plasticidad ≠ neurodegeneración por definición (coherente con ficha + literatura de plasticidad; **no** afirmar que nunca hay toxicidad).
- Circuitos de recompensa, estrés y control como marco heurístico (R3), no como diagnóstico regional.
- Heterogeneidad individual y ausencia de calendario universal simple (implícito en R3/R4 + caveats producto).

### Clase C — Pendientes (no publicadas como hecho consolidado en los borradores)
- Detalle claim-a-claim de desensibilización / densidad de receptor / CRF por sustancia.
- Afirmar «modificaciones estructurales» como regla universal (la ficha in-app lo menciona; R1 lo discute en contextos experimentales → en borrador A se **matiza** como posible, no universal).
- Tokens de mecanismo (DAT, nAChR, etc.) en página pública.
- Cualquier ejemplo numérico de `daysTo95Recovery` / techo de un órgano concreto como hecho clínico.

### Clase D — Excluidas
- Plazos («el cerebro se cura en X días»).
- Normalización cerebral completa garantizada.
- «Porcentaje de salud recuperada».
- Diagnóstico, pronóstico individual, tratamiento, dispositivo médico.
- Síntomas/consejos `pending_clinical_review`.
- Fórmulas internas del motor como evidencia clínica.
- Testimonios o datos de usuarios ficticios presentados como reales.
- «Revisado clínicamente por…» / aprobación médica de SOMA.
- Elevar `confidenceLevel` del catálogo a validación bibliográfica de estas páginas.

### Conflictos detectados (no se corrige código en esta fase)
| Observación | Acción editorial |
|---|---|
| Ficha in-app `neuroadaptation` es más densa en mecanismos que el borrador público | Intencional: página pública más corta y cauta |
| Seed de curvas con refs `[NEEDS-VERIFICATION]` | Página B **no** cita esas refs como verificadas; remite a límites |
| Landing `science.limits` aún dice «promedios en condiciones estándar» | B1-REV usa formulación de **trayectorias parametrizadas del catálogo** en las páginas learn; **no** se modifica `landing-v2.json` aquí |
| ROADMAP aún dice SEO-02B1-B «en local» | Desactualizado; no se edita aquí |
| Script `index.html` noindexa todo ≠ `/` | Compatible solo si B2-B2 entrega HTML estático allow-listed |

---

## 5. Página A completa — ES

**URL propuesta:** `https://somarecovery.app/es/learn/neuroadaptacion`

### Neuroadaptación: qué cambia en el sistema nervioso (visión educativa)

El sistema nervioso no es estático. Ante estímulos repetidos —incluida una sustancia— puede modificar cómo responde. Ese conjunto de cambios se resume a menudo con la palabra **neuroadaptación**. Esta página ofrece una visión educativa general: ayuda a situar el concepto, no a diagnosticar ni a predecir lo que ocurrirá en una persona concreta.

Soma es una aplicación web educativa. No es un dispositivo médico, no mide tu cerebro y no sustituye la atención sanitaria.

### ¿Qué significa neuroadaptación?

En términos sencillos, neuroadaptación describe **cambios en la forma de funcionar** del sistema nervioso cuando una estimulación se repite. Puede afectar, por ejemplo, a la sensibilidad de circuitos o a la fuerza de conexiones entre neuronas (plasticidad sináptica). No es, por definición, lo mismo que la **neurodegeneración** (pérdida o lesión de células nerviosas), aunque en algunos contextos clínicos y experimentales ambos fenómenos pueden estudiarse por separado o coexistir.

Una analogía útil: una ciudad que reorganiza semáforos y desvíos ante un tráfico nuevo se está adaptando. Eso no equivale a derribar edificios. La analogía falla si se traduce como «todo vuelve a la foto anterior en un número fijo de días».

### Estimulación repetida, aprendizaje y adaptación

La investigación sobre plasticidad y adicción describe cómo la exposición a sustancias puede dejar huellas en circuitos de motivación y aprendizaje: cambios moleculares, celulares y sinápticos que, en modelos experimentales, pueden durar más que la presencia aguda de la droga. Hay paralelismos con otras formas de plasticidad ligadas al aprendizaje y la memoria; eso **no** convierte la adicción en «solo un hábito».

Importa distinguir dos planos. En el laboratorio, **una exposición aislada** puede asociarse a **cambios neurobiológicos tempranos** (por ejemplo, plasticidad sináptica en circuitos de recompensa). Eso **no** equivale al **desarrollo de un trastorno adictivo**, que la literatura vincula a patrones repetidos, contexto, vulnerabilidad y reorganización acumulativa de circuitos. El contexto, la sustancia, la frecuencia y la persona influyen.

### Un mapa de trabajo: recompensa, estrés y control

Un marco usado en neurobiología de la adicción organiza la motivación en dominios que involucran, de forma simplificada:

- circuitos relacionados con **recompensa y hábito**;
- circuitos relacionados con **estrés y estados afectivos negativos**;
- circuitos relacionados con **control y función ejecutiva**.

Es un **mapa de trabajo**, no un escáner de tu cerebro ni un diagnóstico por regiones. No todos los cambios ocurren en todas las personas ni con todas las sustancias.

### Por qué la experiencia varía entre personas

La misma sustancia no produce la misma trayectoria en dos personas. Influyen la biología, el entorno, la cantidad y el patrón de uso, otras condiciones de salud, el policonsumo y muchos factores que una página general no puede enumerar ni medir. Por eso **no existen calendarios universales** de «recuperación cerebral» que una aplicación educativa pueda aplicar con certeza clínica.

Al cesar el consumo, algunos cambios pueden empezar a revertir y otros pueden persistir más. El ritmo no es uniforme entre regiones, efectos ni individuos. «Ya no está la sustancia» no equivale automáticamente a «el sistema nervioso ha vuelto a un estado de catálogo».

### Relación con tolerancia, dependencia y metabolismo

La neuroadaptación puede contribuir a la **tolerancia**: una **respuesta reducida a la misma dosis** tras exposición repetida. Qué efectos se atenúan, con qué rapidez y en qué medida **varía entre sustancias y entre efectos** de una misma sustancia. También puede relacionarse con la **dependencia física** (el equilibrio del organismo «cuenta» con la sustancia). La abstinencia se asocia, en parte, a esa adaptación cuando falta el fármaco.

El **metabolismo** determina cuánta sustancia hay y durante cuánto tiempo. Vaciar el plasma no restablece por sí solo los «semáforos» de la red. Son procesos relacionados, no sinónimos.

### Limitaciones de esta explicación

- Es general y educativa; no describe tu sistema nervioso.
- No promete normalización completa ni plazos.
- No sustituye evaluación clínica.
- Las revisiones científicas citadas abajo son marcos de investigación; no son pruebas de que Soma mida plasticidad.
- Sustancias distintas empujan mecanismos distintos: no hay un único «cerebro de la sustancia».

### Cómo lo aborda Soma

En Soma, la neuroadaptación aparece como contenido educativo publicado en **Explorar** (ficha de proceso) y en **Misiones** (p. ej. la misión educativa asociada a esa ficha, disponible en la demo y con cuenta). Las **curvas y relojes** de recuperación son modelos del catálogo situados en el tiempo: estimaciones orientativas, no una lectura de tu plasticidad neuronal.

Si quieres ver el producto sin crear cuenta, puedes abrir la [demo](https://somarecovery.app/preview). Para la propuesta general de Soma, vuelve a la [página de inicio](https://somarecovery.app/).

### Referencias (marco educativo)

1. Nestler EJ. Molecular basis of long-term plasticity underlying addiction. *Nat Rev Neurosci.* 2001;2(2):119–128. doi:10.1038/35053570
2. Kauer JA, Malenka RC. Synaptic plasticity and addiction. *Nat Rev Neurosci.* 2007;8(11):844–858. doi:10.1038/nrn2234
3. Koob GF, Volkow ND. Neurobiology of addiction: a neurocircuitry analysis. *Lancet Psychiatry.* 2016;3(8):760–773. doi:10.1016/S2215-0366(16)00104-8
4. Lüscher C, Malenka RC. Drug-evoked synaptic plasticity in addiction: from molecular changes to circuit remodeling. *Neuron.* 2011;69(4):650–663. doi:10.1016/j.neuron.2011.01.017

Estas referencias orientan el lenguaje de esta página. No convierten el texto en consejo médico ni en revisión clínica del producto Soma.

---

## 6. Página A completa — EN

**Proposed URL:** `https://somarecovery.app/en/learn/neuroadaptation`

### Neuroadaptation: what changes in the nervous system (an educational view)

The nervous system is not static. With repeated stimulation — including a substance — how it responds can change. That cluster of changes is often called **neuroadaptation**. This page offers a general educational view: it helps place the concept; it does not diagnose or predict what will happen for any one person.

Soma is an educational web app. It is not a medical device, it does not measure your brain, and it does not replace clinical care.

### What does neuroadaptation mean?

In plain terms, neuroadaptation describes **changes in how the nervous system functions** when stimulation is repeated. It can involve, for example, the sensitivity of circuits or the strength of connections between neurons (synaptic plasticity). It is not, by definition, the same as **neurodegeneration** (loss or injury of nerve cells), even though clinical and experimental work may study either phenomenon separately — or find them together in some contexts.

A useful analogy: a city that retimes traffic lights for new traffic is adapting. That is not the same as demolishing buildings. The analogy fails if it is turned into “everything returns to a previous snapshot in a fixed number of days.”

### Repeated stimulation, learning, and adaptation

Research on plasticity and addiction describes how substance exposure can leave marks in motivational and learning circuits: molecular, cellular, and synaptic changes that, in experimental models, can outlast the acute presence of the drug. There are parallels with other forms of plasticity linked to learning and memory. That does **not** reduce addiction to “just a habit.”

Two levels matter. In experimental work, **a single exposure** can be linked to **early neurobiological changes** (for example, synaptic plasticity in reward circuits). That is **not** the same as the **development of an addictive disorder**, which the literature associates with repeated patterns, context, vulnerability, and cumulative circuit reorganization. Context, substance, frequency, and the person all matter.

### A working map: reward, stress, and control

A framework used in the neurobiology of addiction organizes motivation into domains that involve, in simplified form:

- circuits related to **reward and habit**;
- circuits related to **stress and negative affect**;
- circuits related to **control and executive function**.

This is a **working map**, not a scan of your brain and not a regional diagnosis. Not every change occurs in every person or with every substance.

### Why experience differs between people

The same substance does not produce the same path for two people. Biology, environment, amount and pattern of use, other health conditions, polysubstance use, and many factors a general page cannot list or measure all play a role. That is why there are **no universal calendars** of “brain recovery” that an educational app can apply with clinical certainty.

After use stops, some changes may begin to reverse and others may persist longer. Timing is not uniform across regions, effects, or individuals. “The substance is gone” does not automatically mean “the nervous system has returned to a catalog baseline.”

### Links to tolerance, dependence, and metabolism

Neuroadaptation can contribute to **tolerance**: a **reduced response to the same dose** after repeated exposure. Which effects diminish, how quickly, and by how much **varies across substances and across effects** of the same substance. It can also relate to **physical dependence** (the body’s balance “counts on” the substance). Withdrawal is associated, in part, with that adaptation when the drug is absent.

**Metabolism** governs how much substance is present and for how long. Clearing plasma does not, by itself, reset the network’s “traffic lights.” These are related processes, not synonyms.

### Limits of this explanation

- It is general and educational; it does not describe your nervous system.
- It does not promise complete normalization or fixed timelines.
- It does not replace clinical assessment.
- The reviews cited below are research frameworks; they are not evidence that Soma measures plasticity.
- Different substances push different mechanisms: there is no single “substance brain.”

### How Soma approaches this

In Soma, neuroadaptation appears as published educational content in **Explore** (process sheet) and **Missions** (for example, the educational mission tied to that sheet, available in the demo and with an account). Recovery **curves and clocks** are catalog models placed on a timeline: orientative estimates, not a reading of your neuronal plasticity.

To explore the product without an account, open the [demo](https://somarecovery.app/preview). For Soma’s overall offer, return to the [home page](https://somarecovery.app/).

### References (educational frame)

1. Nestler EJ. Molecular basis of long-term plasticity underlying addiction. *Nat Rev Neurosci.* 2001;2(2):119–128. doi:10.1038/35053570
2. Kauer JA, Malenka RC. Synaptic plasticity and addiction. *Nat Rev Neurosci.* 2007;8(11):844–858. doi:10.1038/nrn2234
3. Koob GF, Volkow ND. Neurobiology of addiction: a neurocircuitry analysis. *Lancet Psychiatry.* 2016;3(8):760–773. doi:10.1016/S2215-0366(16)00104-8
4. Lüscher C, Malenka RC. Drug-evoked synaptic plasticity in addiction: from molecular changes to circuit remodeling. *Neuron.* 2011;69(4):650–663. doi:10.1016/j.neuron.2011.01.017

These references guide the language of this page. They do not turn the text into medical advice or into a clinical review of the Soma product.

---

## 7. Página B completa — ES

**URL propuesta:** `https://somarecovery.app/es/learn/modelos-de-recuperacion`

### Curvas de recuperación fisiológica: modelos educativos, no diagnósticos

Soma muestra trayectorias llamadas **curvas educativas de recuperación**. Sirven para explorar cómo un catálogo describe, de forma orientativa, el avance de un modelo a lo largo del tiempo. **No** miden tu cuerpo, **no** leen biomarcadores y **no** son un diagnóstico.

Esta página explica qué representan esas curvas en el producto, cómo leerlas con cautela y qué queda fuera de su alcance. Complementa las respuestas breves de las [preguntas frecuentes](https://somarecovery.app/#landing-v2-faq) en la página de inicio.

### Qué representa una curva educativa

En Soma, cada curva es una **trayectoria educativa parametrizada** desde el **catálogo** (por ejemplo, una forma de interpolación, un horizonte temporal del modelo y un techo del propio modelo) y se sitúa sobre una línea de tiempo. El producto calcula un **avance a lo largo de esa trayectoria**: una fracción entre 0 y 1 que indica cuánto ha «recorrido» el modelo, no cuánta «salud» has recuperado.

Hay una segunda magnitud —ese avance multiplicado por el techo del modelo— usada en estimaciones relativas a una línea base del catálogo. La interfaz educativa insiste en el **avance de la trayectoria del modelo**, no en un porcentaje médico de órgano recuperado.

Las curvas se asocian a pares del catálogo (estructuras y sustancias cubiertas por el modelo). No inventamos aquí tablas de parámetros: esos valores viven en el catálogo interno y se presentan en la app con avisos de incertidumbre.

### Cómo leer ejes, formas y estimaciones (según el producto)

En la gráfica de recuperación, el producto usa etiquetas de tiempo de **referencia del modelo** (por ejemplo, marcas orientativas como 1 mes, 3 meses, 6 meses o 365 días) y un eje vertical de **avance de la curva educativa (%)**. Ese porcentaje es el avance matemático del modelo en ese punto de referencia, **no** una medición fisiológica ni una concentración de neurotransmisores.

La columna o punto «Hoy», cuando aparece en contextos con cuenta, sitúa el avance según los días transcurridos desde la fecha de uso registrada en el producto. Sigue siendo el mismo tipo de modelo: un reloj educativo sobre el catálogo, no un laboratorio.

Soma describe tres **formas** de curva en la landing pública:

- **Logarítmica:** cambio más marcado al inicio y luego se aplana.
- **Sigmoidea:** empieza despacio, acelera y vuelve a aplanarse.
- **Lineal:** avance constante en el modelo cuando no se justifica otra forma.

Son patrones de interpolación educativa, no trazados clínicos a escala de un paciente.

Los niveles de **confianza** del catálogo son una **clasificación interna** del producto. Orientan sobre cómo el equipo ha etiquetado la solidez relativa de las fuentes usadas al modelar; **no** garantizan una verificación bibliográfica completa frente a cada fuente primaria y **no** son una probabilidad de que tu resultado individual coincida con el trazo.

### Tendencias generales e incertidumbre

Estas trayectorias **no** son mediciones personales ni un promedio estadístico de «todas las personas en condiciones estándar». Son **estimaciones educativas** construidas con parámetros del catálogo. Por diseño, el modelo **no** incorpora de forma completa la variabilidad individual, las comorbilidades ni las sinergias reales del policonsumo. Las escalas internas sirven para visualizar; no son porcentajes médicos.

Por eso una estimación puede ser útil para **aprender el lenguaje del modelo** y, al mismo tiempo, ser una mala guía para decidir sobre tu salud. Distinguimos tres planos: **estimación educativa** (catálogo), **medición personal** (que Soma no realiza) y **pronóstico clínico** (que Soma no ofrece). La incertidumbre no es un detalle fino: forma parte del diseño declarado en la metodología pública de Soma.

### Por qué no describen necesariamente tu evolución

Dos personas con la misma sustancia y un número parecido de días no tienen por qué compartir la misma biología, el mismo entorno ni el mismo historial. El producto puede situar el catálogo en **tu** línea temporal (fecha de último uso), pero **no personaliza** los parámetros clínicos del modelo a tu organismo.

Un punto del trazo no es un dato de un estudio hecho sobre ti. Tampoco es la prueba de que un órgano se haya recuperado.

### Qué no mide Soma

Soma **no** mide:

- biomarcadores ni imágenes clínicas;
- concentraciones reales de neurotransmisores en tu cuerpo;
- un «porcentaje de salud recuperada»;
- la eficacia de un tratamiento;
- urgencias ni riesgo clínico individual.

Existen en la app perfiles **cualitativos** educativos sobre neurotransmisores (fases ilustrativas del catálogo). No son curvas de concentración personal ni un electromiógrafo del ánimo.

### Por qué no deben usarse para decisiones médicas

Porque son heurísticas de visualización y de reglas educativas del producto (por ejemplo, umbrales de logros ligados al avance del modelo), no instrumentos sanitarios validados para diagnóstico, pronóstico o tratamiento. Si necesitas orientación clínica, contacta con profesionales o servicios de tu zona. En peligro inmediato, usa los recursos de emergencia locales.

### Cómo explorar la demo sin cuenta

Puedes abrir la [demo de Soma](https://somarecovery.app/preview) sin registro. Allí las cifras son de ejemplo o de catálogo ilustrativo según la pantalla; no pertenecen a una cuenta real. Crear una cuenta (cuando haya invitación en la beta) permite un uso personalizado según las funciones y consentimientos del producto; no es obligatorio para comprender qué es una curva educativa.

Más contexto en la [página de inicio](https://somarecovery.app/) — secciones de ciencia, metodología y preguntas frecuentes.

### Limitaciones educativas (resumen)

- Estimación educativa del catálogo ≠ medición personal ni pronóstico clínico.
- No todas las referencias internas del catálogo están verificadas frente a la fuente primaria.
- No se publican aquí fórmulas del motor ni tablas de parámetros internas.
- Contenidos clínicos que aún no están listos para publicación educativa (por ejemplo, listas de síntomas o consejos pendientes de revisión) no forman parte de esta página.

---

## 8. Página B completa — EN

**Proposed URL:** `https://somarecovery.app/en/learn/recovery-models`

### Physiological recovery curves: educational models, not diagnoses

Soma shows trajectories called **educational recovery curves**. They help you explore how a catalog describes, in an orientative way, a model’s progress over time. They do **not** measure your body, read biomarkers, or provide a diagnosis.

This page explains what those curves represent in the product, how to read them carefully, and what falls outside their scope. It complements the short answers in the [FAQ](https://somarecovery.app/#landing-v2-faq) on the home page.

### What an educational curve represents

In Soma, each curve is an **educational trajectory parameterized** from the **catalog** (for example, an interpolation shape, a model time horizon, and a model ceiling) and placed on a timeline. The product computes **progress along that trajectory**: a fraction between 0 and 1 for how far the model has “travelled,” not how much “health” you have recovered.

A second quantity — that progress multiplied by the model ceiling — is used in relative baseline estimates. The educational UI emphasizes **trajectory progress of the model**, not a medical percentage of a recovered organ.

Curves are tied to catalog pairs (structures and substances covered by the model). We do not publish parameter tables here: those values live in the internal catalog and appear in-app with uncertainty notices.

### How to read axes, shapes, and estimates (as implemented)

On the recovery chart, the product uses **model reference** time labels (for example, orientative marks such as 1 month, 3 months, 6 months, or 365 days) and a vertical axis for **educational curve progress (%)**. That percentage is the model’s mathematical progress at that reference point — **not** a physiological measurement or a neurotransmitter concentration.

The “Today” column or point, when shown in account contexts, places progress using days elapsed from the use date recorded in the product. It remains the same kind of model: an educational clock on the catalog, not a lab result.

Soma’s public landing describes three curve **shapes**:

- **Logarithmic:** stronger change early, then flattening.
- **Sigmoidal:** slow start, acceleration, then flattening again.
- **Linear:** steady advance in the model when another shape is not justified.

These are educational interpolation patterns, not clinical traces scaled to a patient.

**Confidence** levels in the catalog are an **internal classification**. They reflect how the product team has labeled the relative strength of sources used when modeling; they do **not** guarantee complete bibliographic verification against every primary source, and they are **not** a probability that your individual outcome matches the line.

### General trends and uncertainty

These trajectories are **not** personal measurements and **not** a statistical average of “everyone under standard conditions.” They are **educational estimates** built from catalog parameters. By design, the model does **not** fully incorporate individual variability, comorbidities, or real polysubstance synergies. Internal scales are for visualization; they are not medical percentages.

So an estimate can help you **learn the model’s language** and still be a poor guide for decisions about your health. We distinguish three planes: **educational estimate** (catalog), **personal measurement** (which Soma does not perform), and **clinical prognosis** (which Soma does not offer). Uncertainty is not a fine print detail: it is part of Soma’s declared public methodology.

### Why they do not necessarily describe your path

Two people with the same substance and a similar day count need not share biology, environment, or history. The product can place the catalog on **your** timeline (last-use date) but does **not** personalize clinical parameters of the model to your body.

A point on the line is not a study data point about you. It is also not proof that an organ has recovered.

### What Soma does not measure

Soma does **not** measure:

- biomarkers or clinical imaging;
- real neurotransmitter concentrations in your body;
- a “percent health recovered” score;
- treatment effectiveness;
- emergencies or individual clinical risk.

The app also includes educational **qualitative** neurotransmitter profiles (illustrative catalog phases). They are not personal concentration curves.

### Why they must not drive medical decisions

They are visualization heuristics and educational product rules (for example, achievement thresholds tied to model progress), not healthcare instruments validated for diagnosis, prognosis, or treatment. If you need clinical guidance, contact professionals or local services. In immediate danger, use local emergency resources.

### Exploring the demo without an account

You can open the [Soma demo](https://somarecovery.app/preview) without registering. Figures there are examples or illustrative catalog values depending on the screen; they do not belong to a real account. Creating an account (when an invite is available in the beta) enables personalized use under the product’s features and consents; it is not required to understand what an educational curve is.

More context on the [home page](https://somarecovery.app/) — science, methodology, and FAQ sections.

### Educational limits (summary)

- Educational catalog estimate ≠ personal measurement or clinical prognosis.
- Not every internal catalog reference is verified against the primary source.
- Engine formulas and internal parameter tables are not published here.
- Clinical content that is not yet ready for educational publication (for example, symptom lists or advice still awaiting review) is not part of this page.

---

## 9. Metadatos propuestos

### Página A

| Campo | ES | EN |
|---|---|---|
| Slug | `neuroadaptacion` | `neuroadaptation` |
| SEO title (≤~60) | Neuroadaptación: visión educativa \| Soma | Neuroadaptation: an educational view \| Soma |
| Meta description | Qué es la neuroadaptación en el sistema nervioso, con límites claros. Contenido educativo de Soma; no es diagnóstico ni calendario clínico. | What neuroadaptation means in the nervous system, with clear limits. Educational Soma content — not a diagnosis or clinical timeline. |
| H1 | Neuroadaptación: qué cambia en el sistema nervioso (visión educativa) | Neuroadaptation: what changes in the nervous system (an educational view) |
| Intención | Informacional / educativa | Informational / educational |

### Página B

| Campo | ES | EN |
|---|---|---|
| Slug | `modelos-de-recuperacion` | `recovery-models` |
| SEO title | Curvas de recuperación: modelos educativos \| Soma | Recovery curves: educational models \| Soma |
| Meta description | Cómo interpretar las curvas educativas de Soma: avance del catálogo, incertidumbre y lo que no miden. No son diagnósticos. | How to read Soma’s educational recovery curves: catalog progress, uncertainty, and what they do not measure. Not diagnoses. |
| H1 | Curvas de recuperación fisiológica: modelos educativos, no diagnósticos | Physiological recovery curves: educational models, not diagnoses |
| Intención | Informacional + aclaración de producto | Informational + product clarification |

**Anti-canibalización:** FAQ en `/` responde en 2–4 frases; A profundiza el concepto biológico; B profundiza el mecanismo de producto. Sin keyword stuffing.

---

## 10. URLs definitivas propuestas

| Idioma | Neuroadaptación | Modelos / curvas |
|---|---|---|
| ES | `/es/learn/neuroadaptacion` | `/es/learn/modelos-de-recuperacion` |
| EN | `/en/learn/neuroadaptation` | `/en/learn/recovery-models` |

Canonical: cada URL → sí misma (`https://somarecovery.app{path}`).
hreflang: pares ES↔EN por tema; `x-default` → EN (alineado con shell actual).
Landing `/` sin cambio de estrategia bilingüe.

---

## 11. Relaciones y enlaces internos

| Desde | Hacia | Motivo |
|---|---|---|
| `/` science / methodology | B | Profundidad de modelos |
| `/` FAQ P2 (curvas personales) | B | Evitar solo ancla corta |
| `/` footer | A y B | Descubrimiento discreto |
| A | B | «Modelos educativos de Soma» |
| B | A | «Neuroadaptación (visión educativa)» |
| A, B | `/` | Marca + oferta |
| A, B | `/preview` | Demo (sigue **noindex**) |

Referencias externas: solo las cuatro DOI de §3 en Página A. Página B: sin bibliografía clínica nueva; remite a metodología pública del propio sitio.

Ancla FAQ: el id implementado es `landing-v2-faq` (SEO-02B1-B). Los enlaces `#landing-v2-faq` asumen que esa ancla permanece.

---

## 12. Riesgos científicos y editoriales

| Riesgo | Mitigación en borradores |
|---|---|
| Lectores interpretan A como pronóstico cerebral | Disclaimers + exclusión de plazos |
| Lectores usan B para decisiones médicas | Sección explícita «qué no mide» / «no decisiones médicas» |
| Citar refs como si validaran SOMA | Párrafo final de bibliografía A |
| Duplicar FAQ | Profundidad distinta; enlaces cruzados |
| Filtrar parámetros seed | Explicitamente omitidos |
| Deriva respecto a ficha Explorar | Pública más corta; Explorar sigue noindex |
| Atribuir revisión clínica | Ausente a propósito |

---

## 13. Compatibilidad con arquitectura estática

### Hechos del repo (sin modificar)
- Vite SPA sin prerender (`apps/web/vite.config.ts`).
- Un `index.html` con meta de landing; script noindex si path ≠ `/`.
- `isIndexablePublicPath` solo `/`.
- Sitemap solo `/`.
- **No** hay `render.yaml` en el repositorio; Headers y rewrite SPA viven en el panel Render (documentado en ROADMAP / SEO-02A).
- `public/` se copia tal cual al build: candidatos naturales a HTML estático.

### Cómo se generaría cada HTML (propuesta B2-B2; no implementar)
1. Redactar/generar cuatro documentos HTML (o `…/index.html` bajo carpetas) con `lang`, title, description, canonical, hreflang, robots `index,follow`, H1 y cuerpo de §§5–8.
2. Alojamiento típico: `apps/web/public/es/learn/neuroadaptacion/index.html` (y análogos), de modo que la URL pública coincida tras el publish estático.
3. Resolución de rutas: el estático debe **ganarle** al rewrite SPA (`/* → /index.html`). En Render Static Site esto suele requerir que el archivo exista en la ruta pedida **antes** del fallback; si el rewrite es total, hay que ajustar reglas (evidencia de panel **faltante** en repo).
4. Evitar fallback SPA: checklist de deploy — `curl -s` cada URL sin JS y comprobar que el H1 no es el de la landing.
5. Preservar noindex privado: **no** añadir `/es` ni `/en` ni `/learn` a `RENDER_X_ROBOTS_NOINDEX_PATHS`; mantener `/app`, `/preview`, auth, legales. Ampliar allow-list en `public-site.ts` / script `index.html` solo si alguna ruta learn pudiera servirse aún vía shell SPA.
6. Evidencia faltante en producción: volcado exacto de reglas Rewrite + Headers del servicio SPA Live; prueba HTTP post-deploy autorizada; confirmación de que paths con trailing slash y sin él no duplican contenido.

### Incompatibilidades reales con SEO-02B2-A
Ninguna conceptual. **Riesgo operativo confirmado:** sin ajuste de rewrite/allow-list, las URLs `/es/learn/...` recibirían hoy el shell de landing + noindex del script head. Eso es exactamente el fallo que B2-B2 debe impedir. No justifica Next.js; sí justifica HTML estático + checklist Render.

---

## 14. Criterios de aceptación para implementación (SEO-02B2-B2)

- [ ] Copy ES/EN aprobado (este documento o revisión marcada).
- [ ] Sin claims C como hechos ni D en el HTML publicado.
- [ ] 4 URLs con HTML propio verificable sin JS.
- [ ] Metadatos §9 aplicados.
- [ ] Sitemap + allow-list + hreflang.
- [ ] Privadas/demo siguen noindex.
- [ ] Enlaces internos §11 sin indexar `/preview` como contenido canónico.
- [ ] Tests de contrato SEO + denylist de frases clínicas prohibidas.
- [ ] Verificación HTTP en producción tras deploy **autorizado**.
- [ ] Sin telemetría nueva; sin API; sin datos personales.

---

## 15. Decisiones pendientes de aprobación

1. ¿Aprobar los borradores A/B ES/EN tras **B1-REV**?
2. ~~Identificadores de código en copy público B~~ — **Resuelto en B1-REV:** lenguaje de producto únicamente.
3. ¿Confirmar slugs §10 (`neuroadaptacion` sin tilde en URL)?
4. ¿`x-default` → EN?
5. ¿HTML en `public/` vs generador en build (ambos válidos si el GET sin JS cumple)?
6. ¿Quién firma la re-lectura humana final de R1–R4 antes del merge a `main`?
7. ¿Incluir enlaces footer/science en el mismo PR de implementación?
8. ¿Actualizar ROADMAP en hito documental aparte?
9. ¿Alinear más adelante el copy de landing `science.limits` («promedios…») con la formulación de trayectorias parametrizadas de la página B? (fuera de este REV)

---

**Fin SEO-02B2-B1.**
SIN COMMIT. SIN PUSH. SIN PR. SIN MERGE. SIN DESPLIEGUE.
Detenerse antes de SEO-02B2-B2.
