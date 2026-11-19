# GAM-XP-B1 — Propuesta editorial de seis misiones educativas

## Estado y límites

Cierre editorial aprobado. **GAM-XP-B2 incorpora los seis contratos al catálogo únicamente como `draft`; GAM-XP-B3 añade su copy ES/EN y las claves correctas privadas del backend; GAM-XP-B4 cierra favorablemente la revisión pedagógica y el análisis estático de accesibilidad; GAM-XP-B5 verifica la persistencia existente en PostgreSQL efímero.** No están publicados y no existe backfill. El catálogo público no incluye `correctOptionId` ni un indicador equivalente; tampoco se han modificado la curva de niveles o las fuentes de XP. **GAM-XP-B6 sigue pendiente de autorización y publicación.** Si se autoriza, cada primera respuesta correcta reutilizará el contrato vigente de 12 XP mediante `MissionCompletion` y `XpGrant`.

No se concede XP por visitas, clics, descubrimientos visuales, colecciones, craving, recaídas o solicitudes de ayuda. Los seis objetivos se apoyan exclusivamente en fichas ES/EN ya publicadas y evalúan un aprendizaje distinto de la misión `-01` asociada.

## Inventario comprobado

Las 14 fichas publicadas son: `dopamine`, `serotonin`, `gaba`, `glutamate`, `norepinephrine`, `acetylcholine`, `endocannabinoid`, `endorphin`, `adenosine`, `receptors`, `tolerance`, `dependence`, `neuroadaptation` y `metabolism`.

Fuentes de verdad revisadas:

- Catálogo de fichas: `apps/web/src/features/recovery-dashboard/explore/explore-edu.ts`.
- Contenido y bibliografía ES/EN: `apps/web/src/i18n/locales/{es,en}/explore-edu.json`.
- Misiones actuales: `packages/shared-types/src/missions.ts` y `apps/web/src/i18n/locales/{es,en}/missions.json`.
- Claves correctas actuales, solo servidor: `apps/api/src/missions/mission-answers.ts`.
- Antecedentes editoriales: `docs/review/exp-edu-02a-revision-editorial.md`, `exp-edu-02b-revision-editorial.md` y `exp-edu-03a-revision-editorial.md`.

## Criterios editoriales

- ID estable con sufijo `-02`; una corrección futura de copy incrementaría `contentVersion`, no crearía otra recompensa.
- Tres opciones por pregunta y una sola respuesta inequívoca.
- La opción correcta debe poder justificarse literalmente con la ficha publicada.
- Los distractores representan confusiones que la propia ficha desmiente; no introducen afirmaciones clínicas nuevas.
- Ninguna pregunta interpreta síntomas, abstinencia, recuperación individual o concentraciones personales.
- Las claves candidatas de respuesta son parte de esta revisión editorial; si se implementan, la clave correcta solo debe residir en API.

## Matriz resumen

| ID candidato | Ficha | Objetivo nuevo respecto a `-01` | Correcta candidata | Riesgo editorial |
|---|---|---|---|---|
| `edu-receptors-02` | `receptors` | Diferenciar receptores ionotrópicos y metabotrópicos | `option_b` | Bajo |
| `edu-neuroadaptation-02` | `neuroadaptation` | Reconocer que la adaptación ocurre en varios niveles, no en una cifra de dopamina | `option_c` | Medio |
| `edu-metabolism-02` | `metabolism` | Diferenciar farmacocinética y farmacodinámica | `option_a` | Bajo |
| `edu-dopamine-02` | `dopamine` | Diferenciar recaptación y degradación | `option_b` | Bajo |
| `edu-gaba-02` | `gaba` | Diferenciar GABA-A y GABA-B | `option_a` | Medio |
| `edu-adenosine-02` | `adenosine` | Diferenciar adenosina, ATP y cafeína | `option_c` | Bajo |

## 1. `edu-receptors-02`

**Ficha:** `receptors`, sección `how` / «¿Cómo funcionan?».

**Objetivo:** distinguir un receptor ionotrópico —receptor y canal en una misma proteína— de un receptor metabotrópico que inicia una cascada mediante proteínas asociadas. La misión `edu-receptors-01` evalúa agonismo frente a antagonismo, por lo que no hay duplicación.

### ES

**Pregunta:** ¿Qué diferencia presenta la ficha entre receptores ionotrópicos y metabotrópicos?

- `option_a` — Los ionotrópicos activan primero una cascada de proteínas G; los metabotrópicos forman directamente el poro por el que pasan iones.
- `option_b` — Los ionotrópicos son receptor y canal y suelen actuar rápido; los metabotrópicos activan una cascada mediante proteínas asociadas y suelen ser más lentos. **[correcta]**
- `option_c` — Los ionotrópicos responden a neurotransmisores propios, mientras que los metabotrópicos responden únicamente a fármacos u hormonas.

**Explicación:** La ficha describe los ionotrópicos como receptor y canal en uno: la unión abre o modula un poro en milisegundos. Los metabotrópicos no son el canal; suelen acoplarse a proteínas G e iniciar una cascada más lenta y a menudo más duradera.

### EN

**Question:** How does the sheet distinguish ionotropic from metabotropic receptors?

- `option_a` — Ionotropic receptors first activate a G-protein cascade; metabotropic receptors directly form the pore through which ions flow.
- `option_b` — Ionotropic receptors are receptor and channel in one and usually act quickly; metabotropic receptors start a cascade through partner proteins and are usually slower. **[correct]**
- `option_c` — Ionotropic receptors respond to native neurotransmitters, while metabotropic receptors respond only to drugs or hormones.

**Explanation:** The sheet describes ionotropic receptors as receptor and channel in one: binding opens or modulates a pore within milliseconds. Metabotropic receptors are not the channel; they commonly couple to G proteins and start a slower, often longer-lasting cascade.

**Base existente:** Rang & Dale; Goodman & Gilman; *Molecular Neuropharmacology*, ya citados en la ficha. Revisión necesaria: consistencia terminológica ES/EN y accesibilidad cognitiva.

## 2. `edu-neuroadaptation-02`

**Ficha:** `neuroadaptation`, sección `how` / «¿Cómo cambia el sistema nervioso?».

**Objetivo:** reconocer que la neuroadaptación puede incluir cambios de receptor, liberación, fuerza sináptica y circuitos. `edu-neuroadaptation-01` evalúa adaptación frente a neurodegeneración; esta propuesta evalúa las escalas del cambio.

### ES

**Pregunta:** ¿Por qué la ficha no resume la neuroadaptación como «más o menos dopamina»?

- `option_a` — Porque toda adaptación consiste únicamente en que cambia una concentración de dopamina.
- `option_b` — Porque todas las sustancias producen exactamente la misma adaptación en todas las personas.
- `option_c` — Porque pueden cambiar receptores, liberación de mensajeros, fuerza de las conexiones y el funcionamiento de varios circuitos. **[correcta]**

**Explicación:** La ficha sitúa cambios posibles tanto en la sinapsis —receptores, desensibilización, liberación y fuerza de conexión— como en redes de recompensa, estrés y control. No los reduce a un único mensajero ni afirma que sean iguales entre sustancias o personas.

### EN

**Question:** Why does the sheet not summarise neuroadaptation as “more or less dopamine”?

- `option_a` — Because every adaptation consists only of a change in one dopamine concentration.
- `option_b` — Because every substance produces exactly the same adaptation in every person.
- `option_c` — Because receptors, transmitter release, connection strength and the behaviour of several circuits can all change. **[correct]**

**Explanation:** The sheet places possible changes both at the synapse — receptors, desensitisation, release and connection strength — and across reward, stress and control networks. It does not reduce them to one messenger or claim that they are identical across substances or people.

**Base existente:** Nestler 2001; Kauer y Malenka 2007; Koob y Volkow 2016; Lüscher y Malenka 2011. Revisión necesaria: editorial y de seguridad reforzada para evitar que «circuitos de estrés/control» se interprete como diagnóstico individual.

## 3. `edu-metabolism-02`

**Ficha:** `metabolism`, sección `kinds` / «Farmacocinética y farmacodinámica».

**Objetivo:** diferenciar lo que el organismo hace con una sustancia de lo que la sustancia hace en sus blancos. `edu-metabolism-01` evalúa eliminación frente a recuperación y semivida frente a duración del efecto.

### ES

**Pregunta:** ¿Qué emparejamiento coincide con la ficha?

- `option_a` — Farmacocinética: lo que el cuerpo hace con la sustancia; farmacodinámica: lo que la sustancia hace en receptores, enzimas o canales. **[correcta]**
- `option_b` — Farmacocinética: lo que la sustancia hace en receptores; farmacodinámica: cómo la elimina el cuerpo.
- `option_c` — Ambas expresiones significan únicamente que el hígado elimina la sustancia.

**Explicación:** La farmacocinética describe absorción, distribución, metabolismo y eliminación. La farmacodinámica describe la acción en los blancos. Están relacionadas, pero no son intercambiables.

### EN

**Question:** Which pairing matches the sheet?

- `option_a` — Pharmacokinetics: what the body does with the substance; pharmacodynamics: what the substance does at receptors, enzymes or channels. **[correct]**
- `option_b` — Pharmacokinetics: what the substance does at receptors; pharmacodynamics: how the body clears it.
- `option_c` — Both terms mean only that the liver clears the substance.

**Explanation:** Pharmacokinetics covers absorption, distribution, metabolism and elimination. Pharmacodynamics covers action at targets. They are related, but they are not interchangeable.

**Base existente:** Rang & Dale y Goodman & Gilman, ya citados en la ficha. Revisión necesaria: comprobar que las siglas y términos sean comprensibles sin exigir conocimientos previos.

## 4. `edu-dopamine-02`

**Ficha:** `dopamine`, sección `how` / «¿Cómo funciona?».

**Objetivo:** diferenciar reciclaje por recaptación y degradación enzimática. `edu-dopamine-01` evalúa querer/aprender frente a placer.

### ES

**Pregunta:** Según la ficha, ¿en qué se diferencian la recaptación y la degradación de dopamina?

- `option_a` — El DAT degrada químicamente la dopamina en la sinapsis, mientras MAO y COMT la transportan intacta de vuelta a la neurona.
- `option_b` — El DAT devuelve dopamina a la neurona que la liberó, donde puede reciclarse; enzimas como MAO y COMT participan en degradarla. **[correcta]**
- `option_c` — Recaptación y degradación son dos nombres para el mismo proceso: retirar dopamina de la sinapsis sin cambiar qué ocurre después con la molécula.

**Explicación:** El DAT retira el mensajero de la sinapsis y lo devuelve a la neurona que lo liberó, donde puede reciclarse. MAO y COMT participan en su degradación. Recaptar y degradar son procesos distintos.

### EN

**Question:** According to the sheet, how do dopamine reuptake and breakdown differ?

- `option_a` — DAT chemically breaks dopamine down in the synapse, while MAO and COMT carry it intact back into the neuron.
- `option_b` — DAT returns dopamine to the neuron that released it, where it can be recycled; enzymes such as MAO and COMT take part in breaking it down. **[correct]**
- `option_c` — Reuptake and breakdown are two names for the same process: removing dopamine from the synapse without changing what then happens to the molecule.

**Explanation:** DAT removes the messenger from the synapse and returns it to the neuron that released it, where it can be recycled. MAO and COMT take part in breaking it down. Reuptake and breakdown are different processes.

**Base existente:** Purves; *Molecular Neuropharmacology*; Koob y Volkow; Stahl, ya citados en la ficha. Revisión necesaria: conservar el matiz de que la recaptación devuelve el mensajero a la neurona, sin afirmar un retorno directo e inevitable a una vesícula.

## 5. `edu-gaba-02`

**Ficha:** `gaba`, sección `how` / «¿Cómo funciona?».

**Objetivo:** distinguir la señal rápida de GABA-A y la señal más lenta de GABA-B. `edu-gaba-01` evalúa inhibición de red frente a «apagar el cerebro» y frente a identificar alcohol con GABA.

### ES

**Pregunta:** ¿Qué diferencia describe la ficha entre GABA-A y GABA-B?

- `option_a` — GABA-A es receptor y canal de acción rápida; GABA-B se acopla a proteínas G y modula canales más lentamente. **[correcta]**
- `option_b` — Ambos son el mismo canal de cloruro y actúan a idéntica velocidad.
- `option_c` — GABA-B abre directamente el poro de cloruro, mientras GABA-A solo activa una cascada lenta.

**Explicación:** GABA-A abre o modula un poro por el que puede circular cloruro y actúa en milisegundos. GABA-B no es el canal: se acopla a proteínas G y cambia más despacio canales de potasio o calcio.

### EN

**Question:** What difference does the sheet describe between GABA-A and GABA-B?

- `option_a` — GABA-A is a fast receptor-and-channel; GABA-B couples to G proteins and modulates channels more slowly. **[correct]**
- `option_b` — Both are the same chloride channel and act at exactly the same speed.
- `option_c` — GABA-B directly opens the chloride pore, while GABA-A only starts a slow cascade.

**Explanation:** GABA-A opens or modulates a pore through which chloride can flow and acts within milliseconds. GABA-B is not the channel: it couples to G proteins and more slowly changes potassium or calcium channels.

**Base existente:** *Molecular Neuropharmacology*; Rang & Dale; Olsen y Sieghart 2008. Revisión necesaria: seguridad editorial reforzada para que la misión no se mezcle con la sección posterior sobre retirada de alcohol ni se convierta en consejo clínico.

## 6. `edu-adenosine-02`

**Ficha:** `adenosine`, sección `what` / «¿Qué es la adenosina?».

**Objetivo:** diferenciar adenosina, ATP y cafeína. `edu-adenosine-01` evalúa el antagonismo de cafeína en A1/A2A frente al mito del «depósito de sueño».

### ES

**Pregunta:** ¿Cómo describe la ficha la adenosina?

- `option_a` — Es ATP liberado como neurotransmisor clásico desde vesículas; «adenosina» es otro nombre para esa misma molécula en la sinapsis.
- `option_b` — Es el metabolito activo en el que se convierte la cafeína y, por eso, activa directamente los receptores A1 y A2A.
- `option_c` — Es un nucleósido relacionado con el metabolismo energético, distinto del ATP, que actúa como neuromodulador. **[correcta]**

**Explicación:** La adenosina está relacionada con el ATP, pero no es idéntica a él. Puede formarse por su degradación y se describe como neuromodulador; la cafeína es una molécula externa que bloquea receptores de adenosina.

### EN

**Question:** How does the sheet describe adenosine?

- `option_a` — It is ATP released as a classic vesicular neurotransmitter; “adenosine” is another name for that same molecule at the synapse.
- `option_b` — It is the active metabolite into which caffeine is converted and therefore directly activates A1 and A2A receptors.
- `option_c` — It is a nucleoside related to energy metabolism, distinct from ATP, that acts as a neuromodulator. **[correct]**

**Explanation:** Adenosine is related to ATP but is not identical to it. It can form through ATP breakdown and is described as a neuromodulator; caffeine is an external molecule that blocks adenosine receptors.

**Base existente:** Dunwiddie y Masino 2001; Porkka-Heiskanen y Kalinchuk 2011; Fredholm et al. 1999; *Molecular Neuropharmacology*. Revisión necesaria: mantener «puede formarse» y evitar presentar una única ruta metabólica.

## Duplicaciones y ambigüedades detectadas

- **Metabolismo:** la misión `-01` ya menciona semivida y duración del efecto. La propuesta `-02` debe limitarse a farmacocinética frente a farmacodinámica y no volver a preguntar por semivida.
- **Dopamina y receptores:** `edu-receptors-01` ya usa DAT/cocaína como contraste. `edu-dopamine-02` debe centrarse en recaptación frente a degradación, no volver a preguntar por el mecanismo de la cocaína.
- **GABA y receptores:** `edu-receptors-02` introduce ionotrópico/metabotrópico de forma general; `edu-gaba-02` lo aplica específicamente a GABA-A/GABA-B. Es una progresión aceptable, pero conviene no mostrarlas consecutivamente como preguntas casi gemelas.
- **Neuroadaptación:** es la candidata con mayor riesgo de interpretarse clínicamente. Debe mantener lenguaje general y no relacionarse con el perfil, días de abstinencia o curvas personales.
- **Adenosina:** la misión `-01` ya desmiente el depósito de sueño. La `-02` no debe reutilizar ese distractor como objetivo central.

No fue necesario sustituir ninguno de los seis temas: todos contienen un segundo objetivo materialmente distinto y respaldado por el contenido publicado. El copy ES/EN y las respuestas correctas se incorporan en GAM-XP-B3 sin publicar las misiones. Los option IDs públicos se neutralizan como `option_a/b/c`; la correspondencia correcta reside solo en API.

## QA de GAM-XP-B4/B5 y publicación posterior

- **B4:** revisión pedagógica y análisis estático de accesibilidad favorables; 132 tests focalizados y tres typechecks superados. El orden de catálogo separa receptores y GABA. No se realizó una previsualización de los seis drafts en navegador ni una prueba manual con lector de pantalla, por lo que esa accesibilidad no se declara validada empíricamente.
- **B5 (2026-11-18):** PostgreSQL 16 efímero en `tmpfs`, bind exclusivo a `127.0.0.1`, base y credenciales únicas; 27 migraciones aplicadas, incluida la de `JournalEntry.clientOpId`. Superados 28/28 tests sin skips: servicio de misiones 10/10, HTTP de misiones 11/11 y progreso 7/7.
- **Garantías B5:** primera finalización y grant únicos, repetición sin XP, concurrencia sin duplicados, rollback íntegro, aislamiento entre usuarios, límite global y conservación de `contentVersion`. La persistencia se probó con misiones históricas publicadas; las seis nuevas siguieron `draft`. Su rechazo antes de Prisma/`ProgressService` permanece cubierto por el test focalizado de B3/B4.
- **Aislamiento B5:** dos preflights fallaron en consultas de metadatos Docker antes de migrar y limpiaron correctamente sus contenedores. La ejecución válida migró y probó una tercera base exclusiva; después destruyó el contenedor y restauró el entorno. No se usó la base local de desarrollo.
- **B6 pendiente:** autorización explícita para publicar y validación de que usuarios existentes reciben las seis como disponibles, sin completion ni XP retroactivo; revisión real en navegador y lector de pantalla antes de afirmar accesibilidad manual.
