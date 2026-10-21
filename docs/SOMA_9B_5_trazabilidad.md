# SOMA — 9B.5 Trazabilidad por afirmación (lote de 25)

Fecha de auditoría: 21 de octubre de 2026. **Documento de trabajo, no aprobación clínica ni permiso de publicación.**

Revisor de esta pasada: auditoría documental Cursor (no es profesional clínico cualificado).

**Actualización 9B.6 (21 oct 2026):** los cuerpos de usuario se reescribieron según [`SOMA_9B_6_diff_editorial.md`](./SOMA_9B_6_diff_editorial.md) (22 revisiones + 3 unchanged). Los estados siguen `pending`. El sidecar guarda **una** referencia 9A por ficha; fuentes secundarias (CDC ictus en la ficha 17; MedlinePlus 4–6 h en la 24; Tips For Quitting en craving/triggers; fact sheet NIAAA overdose junto a interacciones) permanecen en este expediente y no se concatenaron en `item.reference.source`.

## Alcance y método

- Se leyeron sidecar, JSON ES/EN y el paquete [`SOMA_9B_informe_completo_para_Cursor.md`](./SOMA_9B_informe_completo_para_Cursor.md).
- Cada claim se contrastó con el documento de la pista (o con el documento oficial candidato cuando la pista era un acrónimo). **No se aceptó una coincidencia temática como verificación.**
- Evaluación por afirmación: `total` | `parcial` | `insuficiente`.
- La pasada 9B.5 **no** modificó cuerpos. La pasada 9B.6 **sí** reescribió 22 cuerpos (títulos intactos) según el diff aprobado.
- **No se escribió `verified` ni `clinically_reviewed`.** `publishedAdviceCatalog` permanece `[]`.
- Las URL localizadas están ahora en `referenceDetails` del sidecar, una por ficha, con `accessedAt: 2026-10-21`.

## Resultado ejecutivo

| Evaluación global de la ficha | IDs |
|---|---|
| `parcial` (hay anclaje documental, falta cobertura exacta o hay matiz editorial) | 1–16, 18–25 (tras 9B.6: se retiraron rutinas de sueño cannabis; la reducción gradual de cafeína se ancla a FDA, no a MedlinePlus) |
| `insuficiente` (falta pasaje para un claim que sigue en el cuerpo) | `cocaine.intoxication.neurological` (pérdida de conciencia no anclada a ASAM 71–72; signos súbitos de ictus anclados a CDC general, no a ASAM) |
| `total` | ninguna: ningún texto queda cubierto línea a línea sin añadidos editoriales |

Ninguna ficha pasa a publicación.

## Matriz

Leyenda: **A** = afirmación; **Ubic.** = documento y pasaje comprobado; **Eval.**; **Matiz**; **Propuesta** (no aplicada).

### 1. `alcohol.withdrawal.assessment` — NICE CG100 — pending

- **A:** Si puede haber dependencia física, pedir consejo sanitario antes de reducir o parar en seco.
- **Ubic.:** [NICE CG100 rec. 1.1.1.4](https://www.nice.org.uk/guidance/cg100/chapter/recommendations): a personas *alcohol dependent* no ingresadas, aconsejar evitar una reducción súbita.
- **Eval.:** parcial.
- **Matiz:** NICE habla de personas ya dependientes, no del público que “sospecha” dependencia. Es consejo clínico a profesionales, no copy de consumidor.
- **Propuesta ES:** Si crees que puedes tener dependencia física del alcohol, consulta a un profesional sanitario antes de reducir o dejar el consumo de forma brusca. Una bajada súbita puede provocar abstinencia grave en personas dependientes.
- **Propuesta EN:** If you may be physically dependent on alcohol, ask a health professional before cutting down or stopping suddenly. A sudden drop in intake can cause severe withdrawal in dependent drinkers.

### 2. `alcohol.withdrawal.emergency` — NICE CG100 — pending

- **A:** Convulsiones, confusión intensa o desorientación en posible abstinencia → atención urgente.
- **Ubic.:** CG100 **1.1.1.1**: ingreso para abstinencia asistida si hay convulsiones o delirium tremens, o alto riesgo.
- **Eval.:** parcial.
- **Matiz:** NICE indica **ingreso hospitalario**, no genérico “urgente”. Confusión/desorientación no equivalen automáticamente a DT. La fase atlas `post_acute` no figura en esta rec.; no usar días del atlas para silenciar la alerta.
- **Propuesta ES:** Las convulsiones o un cuadro de confusión grave durante una posible abstinencia de alcohol requieren valoración médica inmediata; en muchos casos se indica ingreso.
- **Propuesta EN:** Seizures or severe confusion during possible alcohol withdrawal need prompt medical assessment; hospital admission is often indicated.

### 3. `alcohol.overdose.emergency` — NIAAA — pending

- **A:** Pérdida de conciencia, respiración lenta/irregular o convulsiones tras beber pueden indicar intoxicación grave; llamar a emergencias.
- **Ubic.:** [NIAAA — Understanding the Dangers of Alcohol Overdose](https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/understanding-dangers-of-alcohol-overdose). Signos: dificultad para permanecer consciente, convulsiones, respiración lenta (<8/min) o irregular (≥10 s entre respiraciones). Si se sospecha overdose, llamar al 911; no esperar a todos los síntomas.
- **Eval.:** parcial.
- **Matiz:** El listado NIAAA es más amplio (vómitos, piel fría, palidez, etc.). “Pérdida de conciencia” es un recorte. “Intoxicación grave” ≠ término NIAAA “alcohol overdose”.
- **Propuesta ES:** La dificultad para mantenerse consciente, la respiración lenta o irregular o las convulsiones tras beber pueden ser signos de sobredosis de alcohol. Si las sospechas, llama a emergencias; no esperes a que aparezcan todos los síntomas.
- **Propuesta EN:** Trouble staying conscious, slow or irregular breathing, or seizures after drinking can be signs of alcohol overdose. If you suspect it, call emergency services; do not wait for every symptom.

### 4. `alcohol.interactions.sedatives` — NIAAA — pending

- **A:** Alcohol + BZD, opioides o ciertos somníferos aumenta sedación intensa y problemas respiratorios.
- **Ubic.:** [NIAAA Core Resource — Alcohol-Medication Interactions](https://www.niaaa.nih.gov/health-professionals-communities/core-resource-on-alcohol/alcohol-medication-interactions-potentially-dangerous-mixes) (opioides/BZD y depresión respiratoria) y el mismo fact sheet de overdose (zolpidem, eszopiclone, diazepam, alprazolam).
- **Eval.:** parcial.
- **Matiz:** Cubiertas las tres clases. “Determinados somníferos” es vago; no se listan antihistamínicos, que NIAAA también señala.
- **Propuesta ES:** Mezclar alcohol con opioides, benzodiacepinas o hipnóticos (p. ej. algunos somníferos de prescripción) puede deprimir la respiración y la alerta. Evita combinarlos y consulta a un profesional sobre tus medicamentos.
- **Propuesta EN:** Mixing alcohol with opioids, benzodiazepines, or hypnotic sleep medicines can suppress breathing and alertness. Avoid combining them and ask a clinician about your medicines.

### 5. `alcohol.withdrawal.nutrition` — NICE CG100 — pending

- **A:** Consumo perjudicial prolongado puede asociarse a déficit de B1; un profesional puede valorar tiamina.
- **Ubic.:** CG100 **1.2.1.1–1.2.1.3**: tiamina en alto riesgo de Wernicke; oral profiláctica si bebedor harmful/dependent **y** desnutrición, hepatopatía descompensada, abstinencia aguda o desintoxicación planificada.
- **Eval.:** parcial.
- **Matiz:** NICE no dice que todo consumo perjudicial prolongado implique déficit. No hay dosis ni automedicación en el texto actual (correcto). El “puede asociarse” es más amplio que las indicaciones.
- **Propuesta ES:** El consumo de alcohol de riesgo, sobre todo con desnutrición o enfermedad hepática, puede relacionarse con déficit de vitamina B1. Solo un profesional puede indicar si necesitas tiamina; no te automediques.
- **Propuesta EN:** Harmful alcohol use, especially with malnutrition or liver disease, can be linked to vitamin B1 deficiency. Only a health professional can decide whether thiamine is needed; do not self-prescribe.

### 6. `nicotine.cessation.support` — WHO 2024 — pending

- **A:** Asesoramiento conductual y tratamientos para dejar el **tabaco** pueden aumentar las posibilidades de abandono.
- **Ubic.:** WHO *Clinical treatment guideline for tobacco cessation in adults* (2024), [cap. 3 / NBK604665](https://www.ncbi.nlm.nih.gov/books/NBK604665/): rec. 1–2, consejo breve y apoyo conductual más intensivo (fuerte). Noticia OMS: combinar farmacoterapia y conducta aumenta tasas de abandono; NRT, vareniclina, bupropión, citisina.
- **Eval.:** parcial.
- **Matiz:** La guía es de **tabaco**, no de nicotina/vapeo en general. Soma usa `SubstanceId` `nicotine`. El cuerpo actual ya dice “tabaco” (adecuado). No extrapolar eficacia a vapeo.
- **Propuesta:** conservar el cuerpo; añadir limitación editorial “no se aplica automáticamente a cigarrillos electrónicos u otras formas de nicotina”.

### 7. `nicotine.withdrawal.cravings` — CDC — pending

- **A:** Cambiar de actividad, caminar o contactar con alguien de confianza; el deseo puede pasar sin consumir.
- **Ubic.:** [CDC Tips — 7 Common Withdrawal Symptoms](https://www.cdc.gov/tobacco/campaign/tips/quit-smoking/7-common-withdrawal-symptoms/index.html) (mantenerse ocupado, actividad física, el craving pasa); [Tips For Quitting](https://www.cdc.gov/tobacco/campaign/tips/quit-smoking/tips-for-quitting/) (paseo, llamar/enviar mensaje a un amigo; las urgencias se desvanecen).
- **Eval.:** parcial.
- **Matiz:** CDC habla de **dejar de fumar**, no de nicotina en abstracto. “Alguien de confianza” ≈ “call or text a friend”, no idéntico.
- **Propuesta ES:** Si aparece el deseo de fumar, prueba a distraerte, moverte (p. ej. caminar) o escribir/llamar a alguien. El CDC indica que esas urgencias pueden pasar sin fumar.
- **Propuesta EN:** When a smoking urge hits, try distraction, light activity such as walking, or texting/calling someone. CDC notes that urges can pass without smoking.

### 8. `nicotine.withdrawal.sleep` — CDC — pending

- **A:** Horarios regulares de sueño y evitar cafeína al final del día pueden ayudar en la abstinencia.
- **Ubic.:** CDC *7 Common Withdrawal Symptoms*, apartado “Having trouble sleeping”: misma hora de acostarse/levantarse; no cafeína a última hora de la tarde/noche **porque, al dejar de fumar, la cafeína dura más**.
- **Eval.:** parcial.
- **Matiz:** El consejo de cafeína está ligado al abandono del **tabaco**. No está validado para otras nicotinas. Si el sueño es problemático, CDC dice hablar con un profesional.
- **Propuesta ES:** Al dejar de fumar, horarios regulares de sueño y evitar cafeína por la tarde/noche pueden ayudar (la cafeína puede durar más). Si el insomnio es intenso, consulta.
- **Propuesta EN:** After quitting smoking, a regular sleep schedule and avoiding caffeine in the late afternoon or evening may help (caffeine can last longer). Ask a clinician if sleep stays difficult.

### 9. `nicotine.withdrawal.mood` — CDC — pending

- **A (copy 9B.6 aplicado):** irritabilidad frecuente al dejar de fumar; consultar si los cambios de ánimo son intensos, persisten o dificultan las actividades cotidianas.
- **Ubic.:** CDC: “Feeling irritated, grouchy, or upset” es común. El umbral de consulta del CDC está más claro en **sueño** (“talk with your healthcare provider”) que en ánimo.
- **Eval.:** parcial.
- **Matiz:** La irritabilidad está respaldada. El criterio “intensos / persisten / dificultan las actividades cotidianas” es umbral editorial, no una rec. CDC citada.
- **ES aplicado:** Es frecuente experimentar irritabilidad al dejar de fumar. Si los cambios de ánimo son intensos, persisten o dificultan tus actividades cotidianas, consulta con un profesional sanitario.
- **EN aplicado:** Irritability is common after quitting smoking. If mood changes are severe, persistent, or interfere with daily activities, seek advice from a healthcare professional.

### 10. `nicotine.cessation.triggers` — CDC — pending

- **A:** Identificar situaciones asociadas al consumo y preparar alternativas.
- **Ubic.:** CDC craving: disparadores (personas, lugares, café). Tips For Quitting: cambiar la rutina / distraerse.
- **Eval.:** parcial.
- **Matiz:** No hay una receta CDC de “plan de alternativas” tan genérica. Smokefree.gov (NCI) es más explícito en triggers; **no es CDC** y no se usa como prueba de la pista.
- **Propuesta ES:** Los deseos a menudo se asocian a personas, lugares o hábitos (p. ej. el café). Identificar esos disparadores y tener otra actividad a mano puede ayudar a no fumar.
- **Propuesta EN:** Urges are often tied to people, places, or habits (such as coffee). Noticing those triggers and having another activity ready may help you not smoke.

### 11. `cannabis.withdrawal.symptoms` — NIDA — pending

- **A (copy 9B.6 aplicado):** Tras reducir o abandonar un uso frecuente: irritabilidad, ansiedad, problemas de sueño, apetito. No atribuir automáticamente cualquier síntoma a la abstinencia.
- **Ubic.:** [NIDA Drugs A–Z / Cannabis](https://nida.nih.gov/research-topics/drugs-a-to-z) y [DrugFacts](https://nida.nih.gov/publications/drugfacts/cannabis-marijuana): irritabilidad, ansiedad, insomnio o sueños extraños, apetito reducido, etc.
- **Eval.:** parcial.
- **Matiz:** Lista NIDA más amplia (ira, depresión, náuseas). La segunda frase es **precaución editorial**, no un pasaje NIDA. Se conserva “reducir o abandonar” / “Reducing or stopping”.
- **ES aplicado:** Tras reducir o abandonar un consumo frecuente de cannabis pueden aparecer irritabilidad, ansiedad, problemas de sueño y cambios del apetito. No atribuyas automáticamente cualquier síntoma a la abstinencia.
- **EN aplicado:** Reducing or stopping frequent cannabis use may cause irritability, anxiety, sleep problems, and appetite changes. Do not automatically attribute every symptom to withdrawal.

### 12. `cannabis.recovery.support` — NIDA — pending

- **A:** Intervenciones psicológicas pueden ayudar; hay tratamientos conductuales con evidencia de beneficio.
- **Ubic.:** [NIDA Cannabis topic](https://nida.nih.gov/research-topics/cannabis-marijuana): CBT, MET y *contingency management* “can be effective”; no hay fármacos FDA.
- **Eval.:** parcial.
- **Matiz:** “Evidencia de beneficio” es más rotundo que “can be effective”. No promete abstinencia. No citar síntesis europeas 2024 como si fueran NIDA.
- **Propuesta ES:** Si te cuesta reducir el cannabis, hay terapias conductuales (p. ej. cognitivo-conductual, entrevistas motivacionales, manejo de contingencias) que NIDA considera útiles. Pregunta por ellas; no sustituyen un plan individual.
- **Propuesta EN:** If cutting down cannabis is hard, NIDA notes that behavioral therapies (such as CBT, motivational enhancement, and contingency management) can be effective. Ask about them; they are not a personal guarantee.

### 13. `cannabis.withdrawal.sleep` — NIDA; apoyo general pendiente — pending

- **A1:** Sueños intensos y dificultades de sueño en abstinencia. **Eval.:** parcial (NIDA: insomnia / strange or unsettling dreams).
- **A2:** Mantener rutinas regulares puede ayudar. **Eval.:** **insuficiente** en NIDA. La higiene del sueño aparece en literatura clínica (p. ej. PMC9110555), **no** en la pista NIDA.
- **Propuesta ES:** Durante la abstinencia de cannabis pueden aparecer insomnio o sueños extraños. Si el problema persiste, pide valoración. Aún no hay respaldo NIDA para recomendar “rutinas regulares” como tratamiento.
- **Propuesta EN:** Cannabis withdrawal can include insomnia or unusual dreams. If sleep problems persist, seek assessment. NIDA does not, in the cited pages, support “regular routines” as a treatment claim.

### 14. `cannabis.withdrawal.mood` — NIDA; criterio clínico pendiente — pending

- **A:** Cambios importantes de ánimo, ansiedad incapacitante o dificultad para funcionar → valoración profesional.
- **Ubic.:** NIDA lista ansiedad y depresión como síntomas de abstinencia; no define “incapacitante” ni un umbral de derivación.
- **Eval.:** parcial (síntomas) / insuficiente (umbral).
- **Propuesta ES:** La abstinencia de cannabis puede incluir ansiedad o ánimo bajo. Si te impide funcionar o te alarma, pide valoración; “incapacitante” no es un umbral NIDA.
- **Propuesta EN:** Cannabis withdrawal can include anxiety or low mood. If you cannot function or you are worried, seek assessment; “disabling” is not a NIDA threshold.

### 15. `cannabis.mental_health.support` — NIDA; revisión específica pendiente — pending

- **A:** Si el consumo se acompaña de síntomas psicológicos preocupantes o empeoramiento previo, buscar atención.
- **Ubic.:** NIDA Cannabis: enlace a efectos en salud mental; asociaciones (p. ej. psicosis en personas con riesgo, depresión/suicidabilidad en jóvenes) en la bibliografía de esa página. **No demuestra causalidad** en el copy.
- **Eval.:** parcial.
- **Matiz:** Derivación prudente sí; no afirmar que el cannabis “cause” el empeoramiento.
- **Propuesta ES:** El consumo de cannabis se ha asociado a problemas de salud mental en algunas personas. Si aparecen síntomas psicológicos preocupantes o empeoran problemas previos, busca atención. Eso no prueba que el cannabis sea la causa.
- **Propuesta EN:** Cannabis use has been linked to mental-health problems in some people. If concerning psychological symptoms appear or existing problems worsen, seek care. That does not prove cannabis caused them.

### 16. `cocaine.intoxication.chest_pain` — ASAM/AAAP — pending

- **A:** Dolor torácico durante o después del consumo requiere valoración urgente, incluso en jóvenes.
- **Ubic.:** [ASAM/AAAP StUD guideline](https://pmc.ncbi.nlm.nih.gov/articles/PMC11105801/) rec. **67–69** (Chest Pain): evaluar SCA y otras causas mientras se trata la intoxicación; el dolor que no cede se maneja según estándar.
- **Eval.:** parcial.
- **Matiz:** La guía es para clínicos en servicio de urgencias, no un triaje de consumidor. **No se localizó** un pasaje que diga “incluso en personas jóvenes”. “Urgente” es adaptación pública razonable pero no literal.
- **Propuesta ES:** El dolor torácico durante o tras el consumo de estimulantes (incluida la cocaína) debe valorarse médicamente; puede ser de origen cardíaco u otro. No lo ignores por la edad.
- **Propuesta EN:** Chest pain during or after stimulant (including cocaine) use should be medically assessed; cardiac and other causes are considered. Age alone does not make it safe to ignore.

### 17. `cocaine.intoxication.neurological` — ASAM/AAAP (sidecar); CDC ictus y LOC en expediente — pending

- **A (copy 9B.6 aplicado):** convulsiones o pérdida de conciencia tras cocaína → urgencias; debilidad súbita, dificultad para hablar o confusión intensa → también urgencias.
- **Ubic. (convulsiones):** Rec. **71–72** ASAM/AAAP: convulsiones tras uso de estimulantes se tratan en el servicio de urgencias.
- **Ubic. (signos súbitos de ictus, no cocaína-específicos):** CDC *Signs and Symptoms of Stroke* (debilidad, habla, confusión; llamar emergencias). No es un pasaje ASAM.
- **Ubic. (pérdida de conciencia):** **no** localizada en ASAM 71–72. Se conserva en el cuerpo por seguridad; **no** se atribuye a ASAM. Sigue buscando respaldo adicional.
- **Eval.:** convulsiones: parcial. Ictus: CDC general, no ASAM. Pérdida de conciencia: insuficiente respecto a ASAM.
- **Limitación de contrato:** una sola `AdviceReference` → sidecar `source: ASAM/AAAP`. CDC no concatenado.
- **ES aplicado:** Las convulsiones o la pérdida de conciencia tras consumir cocaína requieren atención de urgencias. La aparición súbita de debilidad, dificultad para hablar o confusión intensa también requiere asistencia urgente.
- **EN aplicado:** Seizures or loss of consciousness after cocaine use require emergency care. Sudden weakness, trouble speaking, or severe confusion also require emergency care.

### 18. `cocaine.alcohol.interaction` — van Amsterdam et al. 2024 — pending

- **A (copy 9B.6 aplicado):** combinar cocaína y alcohol puede aumentar riesgos cardiovasculares, incluidos algunos desenlaces graves; evitar mezclarlas.
- **Ubic.:** van Amsterdam J, Gresnigt F, van den Brink W. *Cardiovascular Risks of Simultaneous Use of Alcohol and Cocaine—A Systematic Review.* J Clin Med. 2024;13(5):1475. https://pmc.ncbi.nlm.nih.gov/articles/PMC10935323/ Conclusión: más mortalidad CV que cocaína sola; síntomas no fatales **inconsistentes**; cocaetileno asociado a muerte súbita en algunos datos.
- **Eval.:** parcial.
- **Matiz (expediente, no cuerpo):** la revisión distingue mortalidad cardiovascular de hallazgos no fatales heterogéneos. El copy no afirma causalidad demostrada ni pronóstico individual.
- **ES aplicado:** Combinar cocaína y alcohol puede aumentar los riesgos cardiovasculares, incluidos algunos desenlaces graves. Evita mezclar ambas sustancias.
- **EN aplicado:** Combining cocaine and alcohol may increase cardiovascular risks, including some serious outcomes. Avoid using them together.

### 19. `cocaine.recovery.behavioral_support` — ASAM/AAAP — pending

- **A:** Hay intervenciones psicológicas eficaces para TUS por estimulantes; preguntar por programas y manejo de contingencias.
- **Ubic.:** Guía ASAM/AAAP, recomendaciones de tratamiento conductual (CM entre las opciones de la guía). PMC11105801.
- **Eval.:** parcial.
- **Matiz:** “Eficaces” suena a garantía. CM está en la guía; el éxito individual no.
- **Propuesta ES:** Las guías ASAM/AAAP recogen intervenciones conductuales para el trastorno por estimulantes, incluido el manejo de contingencias. Pregunta por programas especializados. Ningún programa garantiza el resultado.
- **Propuesta EN:** ASAM/AAAP guidelines include behavioral interventions for stimulant use disorder, including contingency management. Ask about specialist programmes. No programme guarantees an individual outcome.

### 20. `cocaine.withdrawal.mood` — ASAM/AAAP; detalle pendiente — pending

- **A:** Depresión intensa o pensamientos de autolesión tras dejar cocaína → ayuda inmediata; si hay peligro inmediato, emergencias.
- **Ubic.:** Guía: valorar y tratar depresión/ansiedad en uso o abstinencia de estimulantes (p. ej. rec. sobre síntomas en fases de uso/abstinencia). La llamada a emergencias ante peligro inmediato es **seguridad general**, no un recorte literal de ASAM.
- **Eval.:** parcial.
- **Matiz:** No convertir abstinencia en diagnóstico de depresión mayor. No atar la alerta a la ventana de días del atlas.
- **Propuesta ES:** Tras dejar estimulantes puede haber ánimo muy bajo. Si hay pensamientos de autolesión, busca ayuda profesional ahora; si hay peligro inmediato, llama a emergencias. No esperes a una “fase” del atlas.
- **Propuesta EN:** Low mood can follow stopping stimulants. If you have thoughts of self-harm, seek professional help now; if there is immediate danger, call emergency services. Do not wait for an atlas “phase”.

### 21. `caffeine.intake.sensitivity` — FDA — pending

- **A:** La tolerancia varía. 400 mg/día de la FDA para la mayoría de adultos no es un objetivo ni garantiza seguridad individual.
- **Ubic.:** [FDA — Spilling the Beans](https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much): 400 mg/día como cantidad **no generalmente asociada a efectos negativos** para la mayoría de adultos; amplia variación de sensibilidad y de medicamentos/condiciones.
- **Eval.:** parcial.
- **Matiz:** “No es un objetivo” es aclaración editorial fiel al sentido FDA, no una cita literal.
- **Propuesta:** se puede conservar; opcional aclarar “cantidad de referencia poblacional, no una meta diaria”.

### 22. `caffeine.withdrawal.gradual_reduction` — FDA — pending

- **A (copy 9B.6 aplicado):** si se consume cafeína de forma habitual y se quiere reducir, hacerlo gradualmente puede ayudar a evitar molestias de la retirada brusca.
- **Ubic.:** [FDA — Spilling the Beans](https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much), apartado de consejos para reducir: *“If you’re used to drinking caffeine-containing beverages every day, and want to cut back, it’s best to do so gradually. Caffeine withdrawal isn’t considered dangerous but can be unpleasant.”*
- **Pista original MedlinePlus:** no contiene reducción gradual; **no** se usa como fuente del sidecar.
- **Eval.:** parcial respecto a FDA (el copy no dice que la abstinencia “no sea peligrosa”; se queda en molestias de la retirada brusca). Estado `pending`.
- **ES aplicado:** Si consumes cafeína habitualmente y quieres reducirla, hacerlo gradualmente puede ayudarte a evitar molestias asociadas a la retirada brusca.
- **EN aplicado:** If you regularly consume caffeine and want to cut back, reducing it gradually may help you avoid discomfort associated with stopping suddenly.

### 23. `caffeine.withdrawal.headache` — MedlinePlus — pending

- **A:** La retirada puede causar cefalea, somnolencia e irritabilidad. No presuponer que un síntoma intenso o inusual es solo abstinencia.
- **Ubic.:** MedlinePlus *What is caffeine withdrawal?*: headaches, drowsiness, irritability (también náuseas y concentración).
- **Eval.:** parcial.
- **Matiz:** Segunda frase editorial. MedlinePlus dice que los síntomas suelen pasar en un par de días (no copiado al cuerpo, correcto por no usar días como diagnóstico).
- **Propuesta ES:** Dejar la cafeína de golpe puede causar dolor de cabeza, somnolencia e irritabilidad. Si un síntoma es intenso o inusual, no asumas que es solo la abstinencia.
- **Propuesta EN:** Stopping caffeine suddenly can cause headache, drowsiness, and irritability. If a symptom is severe or unusual, do not assume it is only withdrawal.

### 24. `caffeine.sleep.anxiety` — FDA; MedlinePlus — pending

- **A:** Si la cafeína empeora sueño o ansiedad, reducir y evitarla cerca de dormir.
- **Ubic.:** MedlinePlus: exceso → insomnia, anxiety; limitar si hay trastornos de sueño o ansiedad. Efectos 4–6 h. FDA: sensibilidad individual; problemas de sueño mencionados en el consumer update. **No** hay frase FDA/MedlinePlus “cerca de la hora de dormir”.
- **Eval.:** parcial.
- **Propuesta ES:** El exceso de cafeína puede asociarse a insomnio y ansiedad, y la sensibilidad varía. Si te ocurre, reduce la cantidad y evita tomarla en las horas previas a dormir (efecto típico de varias horas; no es un horario clínico).
- **Propuesta EN:** Too much caffeine can be linked to insomnia and anxiety, and sensitivity varies. If that happens, cut back and avoid it in the hours before bed (effects can last several hours; this is not a clinical timetable).

### 25. `caffeine.medication.interactions` — MedlinePlus — pending

- **A:** Algunos medicamentos y enfermedades pueden modificar los riesgos; consultar si hay dudas.
- **Ubic.:** MedlinePlus *Who should avoid or limit*: arritmia, HTA, ansiedad, etc.; “certain medicines or supplements, including stimulants, certain antibiotics, asthma medicines, and heart medicines” + preguntar al profesional. FDA: medicamentos y condiciones individuales.
- **Eval.:** parcial (MedlinePlus cubre el consejo de consultar; la pista era MedlinePlus, FDA es apoyo extra no sustituye).
- **Propuesta:** cuerpo actual aceptable con atribución MedlinePlus; no listar fármacos no citados.

## Propuestas 9B.5 y aplicación 9B.6

Las reescrituras de cuerpo se aplicaron en 9B.6 (22 revisiones + 3 unchanged), con cinco excepciones de copy autorizadas (fichas 9, 11, 17, 18, 22). `referenceDetails` está en el sidecar. Prioridad y `seek_help` no se remapearon. Nicotina vs vapeo sigue como limitación documental.

## Estado del código (tras 9B.6)

- Cuerpos: 22 revisados, 3 unchanged, títulos intactos.
- `editorialStatus`: `pending_clinical_review` en las 25.
- `reference.status`: `pending` en las 25.
- `publishedAdviceCatalog`: `[]`.
- Sin `scope: organ`.
- `presentationPriority`: `routine`.
- JSON de borrador **no** registrados en i18n runtime.

## Tests

Resultado en el mensaje de entrega de 9B.6.
