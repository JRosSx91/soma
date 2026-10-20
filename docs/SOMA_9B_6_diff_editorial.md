# SOMA — 9B.6 Diff editorial (aplicado)

Fecha: 21 de octubre de 2026.

**Estado:** aplicado al sidecar el 21 de octubre de 2026, con las cinco excepciones de copy autorizadas en 9B.6 (ánimo nicotina, síntomas cannabis, neurológico cocaína, interacción cocaína-alcohol, reducción gradual de cafeína). Las 17 revisiones restantes coinciden con el diff de abajo. Tres fichas `unchanged` intactas.

`editorialStatus` y `reference.status` siguen pendientes. `publishedAdviceCatalog` sigue `[]`.

Estados que se mantienen si se aplica más adelante: `editorialStatus: pending_clinical_review`, `reference.status: pending`, `publishedAdviceCatalog: []`. IDs, categorías, `scope: substance_phase` y fases: **sin cambio**.

Leyenda de decisión: `unchanged` (cuerpo de usuario igual) · `revised` (cuerpo propuesto) · `blocked` (no hay).

En cada ficha: **Respaldado** / **Editorial** / **Pendiente**. El copy de usuario no menciona auditorías ni “falta de cita”.

---

## Tabla de decisiones

| ID | Decisión | Motivo breve |
|---|---|---|
| `alcohol.withdrawal.assessment` | revised | Dependencia y retirada brusca (NICE 1.1.1.4) |
| `alcohol.withdrawal.emergency` | revised | Atención inmediata; ingreso no inevitable |
| `alcohol.overdose.emergency` | revised | No esperar todos los síntomas (NIAAA) |
| `alcohol.interactions.sedatives` | revised | Depresores ya comprobados; sin ampliar |
| `alcohol.withdrawal.nutrition` | revised | Valoración profesional; sin prescripción |
| `nicotine.cessation.support` | unchanged | Cuerpo ya habla de tabaco; matiz vapeo solo documental |
| `nicotine.withdrawal.cravings` | revised | Estrategias CDC; contexto dejar de fumar |
| `nicotine.withdrawal.sleep` | revised | Sueño y cafeína al dejar de fumar |
| `nicotine.withdrawal.mood` | revised | Irritabilidad CDC; umbral de consulta editorial |
| `nicotine.cessation.triggers` | revised | Disparadores CDC; alternativas = distraerse/ocuparse |
| `cannabis.withdrawal.symptoms` | revised | Lista NIDA + precaución editorial de no atribución |
| `cannabis.recovery.support` | revised | “Pueden ayudar”; sin eficacia individual |
| `cannabis.withdrawal.sleep` | revised | Síntomas NIDA; se retira “rutinas” (sin fuente) |
| `cannabis.withdrawal.mood` | revised | Consulta prudente; umbral no es de NIDA |
| `cannabis.mental_health.support` | revised | Sin causalidad |
| `cocaine.intoxication.chest_pain` | revised | Valoración urgente; la edad no minimiza |
| `cocaine.intoxication.neurological` | revised | Convulsiones ASAM; signos súbitos CDC ictus (no ASAM) |
| `cocaine.alcohol.interaction` | revised | Mortalidad vs síntomas no fatales (revisión 2024) |
| `cocaine.recovery.behavioral_support` | revised | CM/CBT/CRA; sin garantía individual |
| `cocaine.withdrawal.mood` | revised | Autolesión/emergencias; independiente de fases atlas |
| `caffeine.intake.sensitivity` | unchanged | 400 mg + variabilidad ya correctos |
| `caffeine.withdrawal.gradual_reduction` | revised | Respaldo independiente FDA (no MedlinePlus) |
| `caffeine.withdrawal.headache` | revised | Interrupción brusca + no atribución automática |
| `caffeine.sleep.anxiety` | revised | Sueño/ansiedad; efecto de varias horas, no horario clínico |
| `caffeine.medication.interactions` | unchanged | MedlinePlus cubre la advertencia general |

`blocked`: ninguna.

---

## Diff por ficha

### 1. `alcohol.withdrawal.assessment` — revised

**ES actual:** Si puede existir dependencia física del alcohol, busca asesoramiento sanitario antes de reducir o interrumpir bruscamente el consumo.  
**ES propuesto:** Si puede existir dependencia física del alcohol, busca asesoramiento sanitario antes de reducir o dejar el consumo de forma brusca. Una bajada súbita puede provocar abstinencia grave en personas dependientes.

**EN actual:** If physical alcohol dependence may be present, seek medical advice before abruptly reducing or stopping alcohol use.  
**EN propuesto:** If physical alcohol dependence may be present, seek medical advice before abruptly cutting down or stopping. A sudden drop in intake can cause severe withdrawal in dependent drinkers.

- Respaldado: evitar reducción súbita en dependientes (NICE CG100 1.1.1.4).
- Editorial: formulación para quien “puede” tener dependencia.
- Pendiente: equivalencia exacta “público general” vs pacientes ya dependientes.

**Fuente:** NICE CG100, Recommendations, 1.1.1.4. https://www.nice.org.uk/guidance/cg100/chapter/recommendations

### 2. `alcohol.withdrawal.emergency` — revised

**ES actual:** Las convulsiones, la confusión intensa o la desorientación durante una posible abstinencia requieren atención médica urgente.  
**ES propuesto:** Las convulsiones, la confusión intensa o la desorientación durante una posible abstinencia de alcohol requieren atención médica inmediata.

**EN actual:** Seizures, severe confusion, or disorientation during possible alcohol withdrawal require urgent medical attention.  
**EN propuesto:** Seizures, severe confusion, or disorientation during possible alcohol withdrawal require immediate medical attention.

- Respaldado: convulsiones / DT o alto riesgo → manejo hospitalario (NICE 1.1.1.1).
- Editorial: “inmediata” en lugar de presentar el ingreso como inevitable.
- Pendiente: desorientación ≠ DT literal.

**Fuente:** NICE CG100 1.1.1.1. Misma URL.

### 3. `alcohol.overdose.emergency` — revised

**ES actual:** La pérdida de conciencia, la respiración lenta o irregular o las convulsiones tras consumir alcohol pueden indicar una intoxicación grave. Llama a emergencias.  
**ES propuesto:** La pérdida de conciencia, la respiración lenta o irregular o las convulsiones tras beber pueden ser signos de sobredosis de alcohol. Si las sospechas, llama a emergencias; no esperes a que aparezcan todos los síntomas.

**EN actual:** Loss of consciousness, slow or irregular breathing, or seizures after drinking alcohol may indicate severe poisoning. Call emergency services.  
**EN propuesto:** Loss of consciousness, slow or irregular breathing, or seizures after drinking may be signs of alcohol overdose. If you suspect it, call emergency services; do not wait for every symptom to appear.

- Respaldado: esos signos y “call 911… do not wait for all the symptoms” (NIAAA overdose).
- Editorial: recorte de la lista NIAAA (vómitos, palidez, etc. no se añaden).
- Pendiente: ninguna para el núcleo.

**Fuente:** NIAAA, *Understanding the Dangers of Alcohol Overdose*, “Critical Signs…” y “Know the Danger Signs…”. https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/understanding-dangers-of-alcohol-overdose

### 4. `alcohol.interactions.sedatives` — revised

**ES actual:** Combinar alcohol con benzodiacepinas, opioides o determinados somníferos aumenta el riesgo de sedación intensa y problemas respiratorios.  
**ES propuesto:** Combinar alcohol con benzodiacepinas, opioides o hipnóticos para dormir aumenta el riesgo de sedación intensa y de problemas respiratorios.

**EN actual:** Combining alcohol with benzodiazepines, opioids, or certain sleeping medicines increases the risk of profound sedation and breathing problems.  
**EN propuesto:** Combining alcohol with benzodiazepines, opioids, or hypnotic sleeping medicines increases the risk of profound sedation and breathing problems.

- Respaldado: opioides, BZD, somníferos tipo zolpidem/eszopiclone (NIAAA interacciones + fact sheet overdose).
- Editorial: “hipnóticos para dormir” acota “determinados somníferos” sin listar antihistamínicos (no ampliamos).
- Pendiente: nombres comerciales concretos.

**Fuentes:**  
https://www.niaaa.nih.gov/health-professionals-communities/core-resource-on-alcohol/alcohol-medication-interactions-potentially-dangerous-mixes  
https://www.niaaa.nih.gov/publications/brochures-and-fact-sheets/understanding-dangers-of-alcohol-overdose

### 5. `alcohol.withdrawal.nutrition` — revised

**ES actual:** El consumo perjudicial prolongado puede asociarse con deficiencia de vitamina B1. Un profesional sanitario puede valorar si necesitas tiamina.  
**ES propuesto:** El consumo de alcohol de riesgo puede relacionarse con déficit de vitamina B1. Un profesional sanitario puede valorar si necesitas tiamina.

**EN actual:** Long-term harmful alcohol use may be associated with vitamin B1 deficiency. A healthcare professional can assess whether thiamine is needed.  
**EN propuesto:** Harmful alcohol use may be associated with vitamin B1 deficiency. A healthcare professional can assess whether thiamine is needed.

- Respaldado: tiamina indicada por profesional en perfiles de riesgo (NICE 1.2.1.1–1.2.1.3).
- Editorial: se evita “todo consumo prolongado = déficit”.
- Pendiente: no se copian criterios de desnutrición/hepatopatía al usuario para no convertir la ficha en indicación clínica.

**Fuente:** NICE CG100 1.2.1.1–1.2.1.3.

### 6. `nicotine.cessation.support` — unchanged

Cuerpo ES/EN **sin cambio**.

- Respaldado: consejo conductual y tratamientos de cesación tabáquica (OMS 2024, cap. 3 rec. 1–2 y resumen de farmacoterapia).
- Editorial / documental (no en el cuerpo): la evidencia es de **tabaco**, no se extrapola al vapeo u otras nicotinas.
- Pendiente: eficacia específica por producto de nicotina.

**Fuentes:** https://www.who.int/publications/i/item/9789240096431 · https://www.ncbi.nlm.nih.gov/books/NBK604665/

### 7. `nicotine.withdrawal.cravings` — revised

**ES actual:** Cuando aparezca el deseo de consumir, prueba a cambiar de actividad, caminar o contactar con alguien de confianza. El deseo puede disminuir sin consumir.  
**ES propuesto:** Cuando aparezca el deseo de fumar, prueba a distraerte, caminar o escribir o llamar a alguien de confianza. Ese deseo puede pasar sin fumar.

**EN actual:** When cravings arise, try changing activities, taking a walk, or contacting someone you trust. Cravings can subside without using nicotine.  
**EN propuesto:** When the urge to smoke arises, try distracting yourself, taking a walk, or texting or calling someone you trust. The urge can pass without smoking.

- Respaldado: CDC — ocupar/distraer, actividad física, el craving pasa; Tips For Quitting — paseo, llamar/enviar mensaje.
- Editorial: se ancla a **fumar**, no a “cualquier nicotina”.
- Pendiente: vapeo / otras nicotinas.

**Fuentes:**  
https://www.cdc.gov/tobacco/campaign/tips/quit-smoking/7-common-withdrawal-symptoms/index.html  
https://www.cdc.gov/tobacco/campaign/tips/quit-smoking/tips-for-quitting/

### 8. `nicotine.withdrawal.sleep` — revised

**ES actual:** Mantener horarios regulares de sueño y evitar la cafeína al final del día puede ayudar a manejar las dificultades para dormir durante la abstinencia.  
**ES propuesto:** Al dejar de fumar, mantener horarios regulares de sueño y evitar la cafeína por la tarde o noche puede ayudar: al dejar el tabaco la cafeína puede durar más en el cuerpo.

**EN actual:** Keeping a regular sleep schedule and avoiding caffeine late in the day may help manage sleep difficulties during withdrawal.  
**EN propuesto:** After quitting smoking, a regular sleep schedule and avoiding caffeine in the afternoon or evening may help: caffeine can last longer in the body after you stop smoking.

- Respaldado: CDC “Having trouble sleeping” (misma hora; cafeína tarde/noche porque dura más).
- Editorial: ninguna estrategia extra (parches, pantallas) para no inflar el consejo.
- Pendiente: otras nicotinas.

**Fuente:** CDC 7 Common Withdrawal Symptoms, apartado 5.

### 9. `nicotine.withdrawal.mood` — revised (copy final autorizado, no el párrafo del diff original)

**ES actual:** La irritabilidad y los cambios de ánimo pueden aparecer durante la abstinencia. Si son intensos, persisten o dificultan tu vida cotidiana, consulta con un profesional.  
**ES aplicado:** Es frecuente experimentar irritabilidad al dejar de fumar. Si los cambios de ánimo son intensos, persisten o dificultan tus actividades cotidianas, consulta con un profesional sanitario.

**EN actual:** Irritability and mood changes can occur during withdrawal. Seek professional advice if they are severe, persistent, or interfere with daily life.  
**EN aplicado:** Irritability is common after quitting smoking. If mood changes are severe, persistent, or interfere with daily activities, seek advice from a healthcare professional.

- Respaldado: irritabilidad al dejar de fumar (CDC apartado 2).
- Editorial: umbral de consulta (intenso / persistente / interferencia).
- Pendiente: el CDC no formula ese umbral para el ánimo.

**Fuente:** CDC 7 Common Withdrawal Symptoms, “Feeling irritated…”.

### 10. `nicotine.cessation.triggers` — revised

**ES actual:** Identificar situaciones asociadas al consumo y preparar alternativas puede ayudarte a gestionar los desencadenantes habituales.  
**ES propuesto:** El deseo de fumar a menudo se asocia a personas, lugares o hábitos. Identificar esos disparadores y tener otra actividad a mano (distraerte u ocuparte) puede ayudar.

**EN actual:** Identifying situations associated with nicotine use and preparing alternatives may help you manage common triggers.  
**EN propuesto:** The urge to smoke is often tied to people, places, or habits. Noticing those triggers and having another activity ready (distraction or keeping busy) may help.

- Respaldado: CDC — craving disparado por personas, lugares, hábitos (p. ej. café); Tips — distraerse / mantenerse ocupado.
- Editorial: “alternativas” = esas estrategias CDC, no un plan genérico no citado. No se usa Smokefree/NCI como prueba de la pista CDC.
- Pendiente: lista exhaustiva de triggers.

**Fuentes:** mismas CDC que 7.

### 11. `cannabis.withdrawal.symptoms` — revised (copy final autorizado)

**ES actual:** Tras reducir o abandonar un consumo frecuente pueden aparecer irritabilidad, ansiedad, alteraciones del sueño y cambios del apetito. No atribuyas automáticamente cualquier síntoma a la abstinencia.  
**ES aplicado:** Tras reducir o abandonar un consumo frecuente de cannabis pueden aparecer irritabilidad, ansiedad, problemas de sueño y cambios del apetito. No atribuyas automáticamente cualquier síntoma a la abstinencia.

**EN actual:** Reducing or stopping frequent cannabis use may cause irritability, anxiety, sleep disturbances, and appetite changes. Do not automatically attribute every symptom to withdrawal.  
**EN aplicado:** Reducing or stopping frequent cannabis use may cause irritability, anxiety, sleep problems, and appetite changes. Do not automatically attribute every symptom to withdrawal.

- Respaldado: síntomas NIDA (irritabilidad, ansiedad, insomnio/sueños, apetito).
- Editorial: no atribución automática.
- Pendiente: no se añaden ira, náuseas, etc. del listado NIDA completo.

**Fuentes:** https://nida.nih.gov/research-topics/drugs-a-to-z · https://nida.nih.gov/publications/drugfacts/cannabis-marijuana

### 12. `cannabis.recovery.support` — revised

**ES actual:** Si te resulta difícil reducir o abandonar el cannabis, las intervenciones psicológicas pueden ayudarte. Existen tratamientos conductuales con evidencia de beneficio.  
**ES propuesto:** Si te resulta difícil reducir o dejar el cannabis, hay intervenciones psicológicas que pueden ayudarte, como terapias conductuales. Pregunta por las opciones; no sustituyen un plan individual.

**EN actual:** If reducing or stopping cannabis is difficult, psychological interventions may help. Evidence supports several behavioral approaches.  
**EN propuesto:** If reducing or stopping cannabis is difficult, psychological interventions such as behavioral therapies may help. Ask about options; they are not a personal guarantee.

- Respaldado: NIDA — CBT, MET, contingency management “can be effective”.
- Editorial: se omiten siglas en el cuerpo de usuario.
- Pendiente: magnitud del efecto.

**Fuente:** https://nida.nih.gov/research-topics/cannabis-marijuana (apartado tratamientos).

### 13. `cannabis.withdrawal.sleep` — revised

**ES actual:** Durante la abstinencia pueden aparecer sueños intensos y dificultades para dormir. Mantener rutinas regulares puede ayudar, aunque no sustituye la valoración de síntomas persistentes.  
**ES propuesto:** Durante la abstinencia de cannabis pueden aparecer sueños intensos y dificultades para dormir. Si el problema persiste, pide valoración.

**EN actual:** Vivid dreams and sleep difficulties may occur during withdrawal. Regular routines may help, but persistent symptoms deserve assessment.  
**EN propuesto:** Vivid or unusual dreams and sleep difficulties may occur during cannabis withdrawal. If the problem persists, seek assessment.

- Respaldado: insomnio / sueños extraños (NIDA).
- Editorial: valoración si persiste.
- **Pendiente (se retira del cuerpo):** “rutinas regulares” — no está en NIDA.

**Fuente:** NIDA Drugs A–Z / DrugFacts, síntomas de abstinencia.

### 14. `cannabis.withdrawal.mood` — revised

**ES actual:** Si aparecen cambios importantes del estado de ánimo, ansiedad incapacitante o dificultades para funcionar, solicita valoración profesional.  
**ES propuesto:** Si aparecen cambios importantes del ánimo, ansiedad intensa o dificultades para funcionar, solicita valoración profesional.

**EN actual:** Seek professional assessment if significant mood changes, disabling anxiety, or difficulty functioning occur.  
**EN propuesto:** Seek professional assessment if significant mood changes, intense anxiety, or difficulty functioning occur.

- Respaldado: ansiedad y ánimo bajo pueden formar parte de la abstinencia (NIDA).
- Editorial: umbral de consulta; se evita “incapacitante” como si fuera criterio NIDA.
- Pendiente: NIDA no fija umbral.

**Fuente:** NIDA, síntomas de abstinencia.

### 15. `cannabis.mental_health.support` — revised

**ES actual:** Si el consumo se acompaña de síntomas psicológicos preocupantes o empeoramiento de problemas previos, busca atención sanitaria.  
**ES propuesto:** Si el consumo de cannabis coincide con síntomas psicológicos preocupantes o con el empeoramiento de problemas previos, busca atención sanitaria. Eso no demuestra por sí solo la causa.

**EN actual:** Seek healthcare support if cannabis use is accompanied by concerning psychological symptoms or worsening of existing problems.  
**EN propuesto:** Seek healthcare support if cannabis use coincides with concerning psychological symptoms or with worsening of existing problems. That alone does not prove the cause.

- Respaldado: NIDA asocia cannabis y salud mental; recomienda atención.
- Editorial: se niega la causalidad automática.
- Pendiente: mecanismos.

**Fuente:** NIDA Cannabis topic, *Mental Health Effects*.

### 16. `cocaine.intoxication.chest_pain` — revised

**ES actual:** El dolor torácico durante o después del consumo de cocaína requiere valoración médica urgente, incluso en personas jóvenes.  
**ES propuesto:** El dolor torácico durante o después del consumo de cocaína requiere valoración médica urgente. La edad no lo hace menos importante.

**EN actual:** Chest pain during or after cocaine use requires urgent medical assessment, including in younger people.  
**EN propuesto:** Chest pain during or after cocaine use requires urgent medical assessment. Age does not make it less important.

- Respaldado: ASAM/AAAP rec. 67–69 (evaluar SCA y otras causas).
- Editorial: “urgente” y “la edad no minimiza”; ASAM no dice “jóvenes” en el pasaje leído.
- Pendiente: redacción pública vs protocolo de urgencias.

**Fuente:** https://pmc.ncbi.nlm.nih.gov/articles/PMC11105801/ Chest Pain Recommendations 67–69.

### 17. `cocaine.intoxication.neurological` — revised (copy final autorizado)

**ES actual:** La pérdida de conciencia, las convulsiones o la aparición súbita de debilidad, dificultad para hablar o confusión intensa requieren asistencia urgente.  
**ES aplicado:** Las convulsiones o la pérdida de conciencia tras consumir cocaína requieren atención de urgencias. La aparición súbita de debilidad, dificultad para hablar o confusión intensa también requiere asistencia urgente.

**EN actual:** Loss of consciousness, seizures, or sudden weakness, difficulty speaking, or severe confusion require emergency care.  
**EN aplicado:** Seizures or loss of consciousness after cocaine use require emergency care. Sudden weakness, trouble speaking, or severe confusion also require emergency care.

- Respaldado (convulsiones, contexto estimulantes/ED): ASAM/AAAP rec. 71–72.
- Respaldado (signos súbitos de ictus en general, **no** atribuidos a ASAM ni como “ictus por cocaína”): CDC *Signs and Symptoms of Stroke* (debilidad, habla, confusión; llamar emergencias).
- Editorial: se conserva la alerta urgente; no se diagnostica ictus ni se liga a cocaína en la fuente CDC.
- **Pendiente:** pasaje ASAM/AAAP que una cocaína con signos de ictus; **pérdida de conciencia** no se atribuye a ASAM 71–72 (sigue buscando respaldo adicional). El sidecar solo admite **una** `AdviceReference`: se guardó ASAM/AAAP. CDC ictus queda en este expediente, no concatenado en `source`.

**Fuentes:**  
ASAM/AAAP Seizure Recommendations 71–72, PMC11105801.  
CDC: https://www.cdc.gov/stroke/signs-symptoms/

### 18. `cocaine.alcohol.interaction` — revised (copy final autorizado; matices 2024 en expediente)

**ES actual:** Combinar cocaína y alcohol aumenta los riesgos cardiovasculares. Evita mezclar ambas sustancias.  
**ES aplicado:** Combinar cocaína y alcohol puede aumentar los riesgos cardiovasculares, incluidos algunos desenlaces graves. Evita mezclar ambas sustancias.

**EN actual:** Combining cocaine and alcohol increases cardiovascular risks. Avoid using them together.  
**EN aplicado:** Combining cocaine and alcohol may increase cardiovascular risks, including some serious outcomes. Avoid using them together.

**Expediente (no va al cuerpo):** van Amsterdam et al. 2024 distinguen mayor mortalidad cardiovascular vs hallazgos no fatales heterogéneos. El copy no afirma causalidad demostrada ni pronóstico individual.

- Respaldado: van Amsterdam et al. 2024, conclusión (más mortalidad; síntomas inconsistentes).
- Editorial: “precaución, no pronóstico”.
- Pendiente: cocaetileno no se detalla en el cuerpo.

**Fuente:** van Amsterdam J, Gresnigt F, van den Brink W. J Clin Med. 2024;13(5):1475. https://pmc.ncbi.nlm.nih.gov/articles/PMC10935323/ Abstract/Conclusion.

### 19. `cocaine.recovery.behavioral_support` — revised

**ES actual:** Existen intervenciones psicológicas eficaces para los trastornos por consumo de estimulantes. Pregunta por programas especializados y manejo de contingencias.  
**ES propuesto:** Las guías clínicas recogen intervenciones conductuales para el trastorno por estimulantes, entre ellas el manejo de contingencias. Pregunta por programas especializados. Ningún programa garantiza el resultado.

**EN actual:** Effective behavioral interventions exist for stimulant use disorders. Ask about specialized programs and contingency management.  
**EN propuesto:** Clinical guidelines include behavioral interventions for stimulant use disorder, including contingency management. Ask about specialized programs. No program guarantees an individual outcome.

- Respaldado: ASAM/AAAP rec. 5 (CM componente primario) y 6 (CRA, CBT, Matrix junto a CM).
- Editorial: “eficaces” → “recogen / include”; sin garantía individual. No se listan las cuatro siglas en el copy de usuario (solo CM, que ya estaba).
- Pendiente: disponibilidad local.

**Fuente:** PMC11105801, Behavioral Treatment Recommendations 5–6.

### 20. `cocaine.withdrawal.mood` — revised

**ES actual:** Si después de dejar la cocaína aparecen síntomas depresivos intensos o pensamientos de autolesión, busca ayuda profesional inmediata; ante peligro inmediato, llama a emergencias.  
**ES propuesto:** Si al dejar la cocaína aparecen un ánimo muy bajo o pensamientos de autolesión, busca ayuda profesional ahora. Ante peligro inmediato, llama a emergencias. No esperes a una fase del calendario.

**EN actual:** If severe depressive symptoms or thoughts of self-harm occur after stopping cocaine, seek immediate professional help; call emergency services if there is immediate danger.  
**EN propuesto:** If very low mood or thoughts of self-harm occur after stopping cocaine, seek professional help now. If there is immediate danger, call emergency services. Do not wait for a calendar phase.

- Respaldado: ASAM valora depresión/riesgo en uso y abstinencia de estimulantes; la llamada a emergencias es seguridad general.
- Editorial: independiente de `NarrativePhase` / días del atlas.
- Pendiente: equivalencia depresión mayor.

**Fuente:** ASAM/AAAP, síntomas en uso/abstinencia y evaluación de riesgo (PMC11105801). Emergencias: no se atribuye un recorte ASAM exclusivo.

### 21. `caffeine.intake.sensitivity` — unchanged

Cuerpo ES/EN **sin cambio**.

- Respaldado: 400 mg/día no generalmente asociado a efectos negativos; variación individual (FDA).
- Editorial ya presente: “no es un objetivo”.
- Pendiente: ninguna para el núcleo.

**Fuente:** FDA, *Spilling the Beans*, “Daily Caffeine Consumption for Most Adults”. https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much

### 22. `caffeine.withdrawal.gradual_reduction` — revised (copy final autorizado; fuente FDA)

**Pista original MedlinePlus:** no contiene reducción gradual. **Fuente independiente localizada:** FDA, mismo consumer update, apartado de consejos: *“If you’re used to drinking caffeine-containing beverages every day, and want to cut back, it’s best to do so gradually. Caffeine withdrawal isn’t considered dangerous but can be unpleasant.”*

**ES actual:** Si consumes cafeína habitualmente y quieres reducirla, hacerlo gradualmente puede disminuir las molestias de abstinencia.  
**ES aplicado:** Si consumes cafeína habitualmente y quieres reducirla, hacerlo gradualmente puede ayudarte a evitar molestias asociadas a la retirada brusca.

**EN actual:** If you regularly consume caffeine and want to cut back, gradual reduction may reduce withdrawal discomfort.  
**EN aplicado:** If you regularly consume caffeine and want to cut back, reducing it gradually may help you avoid discomfort associated with stopping suddenly.

- Respaldado: FDA, corte gradual; abstinencia desagradable no peligrosa.
- Editorial: se alinea al verbo FDA (“best to do so gradually”) en lugar de “puede disminuir molestias” (MedlinePlus no lo dice).
- Pendiente: MedlinePlus sigue sin cubrir este claim. El `source` del sidecar pasó de MedlinePlus a FDA; `status` sigue `pending`, no `verified`.

**Fuente:** FDA *Spilling the Beans*, “Check the Product Label and Other Tips…”.

### 23. `caffeine.withdrawal.headache` — revised

**ES actual:** La retirada de cafeína puede causar dolor de cabeza, somnolencia e irritabilidad. No presupongas que un síntoma intenso o inusual se debe solo a la abstinencia.  
**ES propuesto:** Si dejas la cafeína de golpe, pueden aparecer dolor de cabeza, somnolencia e irritabilidad. No presupongas que un síntoma intenso o inusual se debe solo a la abstinencia.

**EN actual:** Caffeine withdrawal may cause headaches, drowsiness, and irritability. Do not assume severe or unusual symptoms are caused solely by withdrawal.  
**EN propuesto:** If you stop caffeine suddenly, headaches, drowsiness, and irritability can occur. Do not assume severe or unusual symptoms are caused solely by withdrawal.

- Respaldado: MedlinePlus, abstinencia tras parar de golpe (cefalea, somnolencia, irritabilidad).
- Editorial: no atribución automática.
- Pendiente: náuseas y concentración (MedlinePlus) no se añaden.

**Fuente:** https://medlineplus.gov/caffeine.html *What is caffeine withdrawal?*

### 24. `caffeine.sleep.anxiety` — revised

**ES actual:** Si la cafeína empeora tu sueño o ansiedad, considera reducir su consumo y evitarla cerca de la hora de dormir.  
**ES propuesto:** Si la cafeína empeora tu sueño o tu ansiedad, considera reducirla. Sus efectos pueden durar varias horas, así que evita tomarla a última hora.

**EN actual:** If caffeine worsens your sleep or anxiety, consider reducing your intake and avoiding it close to bedtime.  
**EN propuesto:** If caffeine worsens your sleep or anxiety, consider cutting back. Effects can last several hours, so avoid it late in the day.

- Respaldado: FDA (insomnio, ansiedad, sensibilidad); MedlinePlus (insomnio, ansiedad; efectos 4–6 h; limitar si hay trastornos de sueño/ansiedad).
- Editorial: “última hora / late in the day” aproxima 4–6 h; no es un horario clínico de “hora de dormir”.
- Pendiente: umbral horario exacto tipo “N horas antes”.

**Fuentes:** FDA *Spilling the Beans* (síntomas). MedlinePlus (efectos 4–6 h; sleep disorders / anxiety).

### 25. `caffeine.medication.interactions` — unchanged

Cuerpo ES/EN **sin cambio**.

- Respaldado: MedlinePlus — medicamentos (estimulantes, ciertos antibióticos, asma, corazón) y enfermedades; consultar.
- Editorial: no se listan fármacos extra.
- Pendiente: interacciones concretas por fármaco.

**Fuente:** MedlinePlus *Who should avoid or limit caffeine?*

---

## Metadatos bibliográficos en el sidecar (`status` sigue `pending`)

No hay `verified`. Sin DOI inventados. `accessedAt` registrado: `2026-10-21` (consulta documental de 9B.5/9B.6). El contrato 9A admite **una** `AdviceReference`; las pistas secundarias no se concatenan en `source`.

| ID | `source` en sidecar | `referenceDetails` |
|---|---|---|
| 1–2, 5 | NICE CG100 | NICE CG100 Recommendations; https://www.nice.org.uk/guidance/cg100/chapter/recommendations |
| 3 | NIAAA | Understanding the Dangers of Alcohol Overdose (URL NIAAA). El fact sheet de interacciones es otra URL; no concatenada. |
| 4 | NIAAA | Alcohol-Medication Interactions: Potentially Dangerous Mixes |
| 6 | WHO 2024 | WHO clinical treatment guideline for tobacco cessation in adults; https://www.who.int/publications/i/item/9789240096431 |
| 7–10 | CDC | 7 Common Withdrawal Symptoms. Tips For Quitting queda en el expediente, no concatenado. |
| 11–15 | NIDA | Cannabis (Marijuana); https://nida.nih.gov/research-topics/cannabis-marijuana |
| 16, 19, 20 | ASAM/AAAP | CPG StUD; https://pmc.ncbi.nlm.nih.gov/articles/PMC11105801/ |
| 17 | ASAM/AAAP | Rec. 71–72 (convulsiones). CDC stroke y pérdida de conciencia: expediente, no concatenados. |
| 18 | van Amsterdam et al. J Clin Med. 2024;13(5):1475 | PMC10935323; matices de mortalidad vs no fatales solo en Markdown |
| 21, 22, 24 | FDA | Spilling the Beans; https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much. Ficha 24: duración 4–6 h MedlinePlus en expediente. |
| 23, 25 | MedlinePlus | https://medlineplus.gov/caffeine.html |

---

## Afirmaciones todavía insuficientes o pendientes

1. `cannabis.withdrawal.sleep`: higiene / “rutinas regulares” — **retirada del cuerpo propuesto**; sigue pendiente de fuente.
2. `cocaine.intoxication.neurological`: nexo cocaína–ictus en ASAM; **pérdida de conciencia** sin respaldo ASAM 71–72 (no atribuirla a esa guía).
3. Nicotina 6–10: evidencia de **tabaco/fumar**, no vapeo u otras nicotinas.
4. Umbrales de consulta (ánimo nicotina/cannabis): orientación editorial.
5. `alcohol.withdrawal.nutrition`: no se trasladan al usuario los criterios NICE de malnutrición/hepatopatía.
6. `caffeine.sleep.anxiety`: no hay “hora de acostarse” literal; solo duración de efecto.
7. Todas las fichas: `reference.status` permanece `pending` hasta revisión afirmación a afirmación + `clinically_reviewed` por profesional.

---

## Tests y TypeScript

Ejecutados sobre el sidecar **con este diff ya aplicado**. Resultado en el mensaje de entrega de 9B.6.
