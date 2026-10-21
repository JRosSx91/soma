# SOMA — Informe integral de auditoría editorial 9B.5 para Cursor

Fecha de elaboración: 21 de octubre de 2026. Lote: 25 fichas ES/EN. **Documento de trabajo, no aprobación clínica.**

## Resultado ejecutivo

- 25 fichas incorporadas al sidecar según el reporte de Cursor; catálogo publicado vacío y 41 tests verdes (resultados reportados, no reejecutados aquí).
- Las 25 permanecen `pending_clinical_review` y `reference.status: pending`. No promocionar automáticamente ninguna.
- Se identificaron documentos oficiales concretos para NICE, OMS, ASAM/AAAP y FDA; esto **no equivale a verificar individualmente los 25 textos**.
- Falta verificar por afirmación las fuentes CDC, NIDA, NIAAA y MedlinePlus, así como la revisión sistemática de 2024; y cerrar secciones y traducciones en todos los casos.

## Instrucción operativa para Cursor

1. Leer sidecar, JSON ES/EN, tipos y tests reales; no sobrescribir cuerpos ni títulos sin aprobación explícita.
2. Para cada fila, incorporar referencias *solo* cuando título, URL, sección y correspondencia exacta estén comprobados. Las URLs de abajo son candidatas verificadas a nivel de documento, no evidencia definitiva para todos los claims.
3. Crear informe de trazabilidad con `id`, fragmento/ubicación, evaluación (`total`, `parcial`, `insuficiente`), matices, propuesta ES/EN y revisor.
4. Si una afirmación es parcial, proponer corrección en diff separado; no aplicarla sin aprobación editorial.
5. No usar días del atlas para descartar alertas clínicas. No elevar `presentationPriority` automáticamente.
6. No modificar `publishedAdviceCatalog`, `resolveEducationalAdvice`, runtime i18n, UI, API ni Prisma.
7. No marcar `verified` sin revisión de cada afirmación y no marcar `clinically_reviewed` sin profesional cualificado.
8. Ejecutar tests y TypeScript; documentar resultados y riesgos restantes.

## Fuentes oficiales localizadas (verificación documental, no por ficha)

- **NICE CG100**: NICE CG100 — Recommendations. https://www.nice.org.uk/guidance/cg100/chapter/recommendations — sección orientativa: 1.1.1.4, 1.1.1.1, 1.2.1 según ficha.
- **WHO 2024**: WHO clinical treatment guideline for tobacco cessation in adults (2024). https://www.who.int/publications/i/item/9789240096431 — sección orientativa: 3. Recommendations.
- **ASAM/AAAP**: ASAM/AAAP Clinical Practice Guideline on the Management of Stimulant Use Disorder. https://pmc.ncbi.nlm.nih.gov/articles/PMC11105801/ — sección orientativa: Chest Pain; Behavioral Treatment Recommendations; Withdrawal.
- **FDA**: FDA — Spilling the Beans: How Much Caffeine is Too Much?. https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much — sección orientativa: Daily Caffeine Consumption for Most Adults.

## Matriz individual de las 25 fichas

| ID | Categoría | Fases preliminares | Pista original | Revisión necesaria |
|---|---|---|---|---|
| `alcohol.withdrawal.assessment` | safety | `during_use`, `acute_withdrawal` | NICE CG100 | NICE 1.1.1.4 confirma riesgo por reducción brusca en dependientes; contrastar formulación para público general. |
| `alcohol.withdrawal.emergency` | seek_help | `acute_withdrawal`, `post_acute` | NICE CG100 | NICE 1.1.1.1 exige ingreso si convulsiones/DT o alto riesgo; comprobar urgencia de cada síntoma y no restringir a fase. |
| `alcohol.overdose.emergency` | seek_help | `during_use` | NIAAA | Localizar página NIAAA sobre alcohol overdose y contrastar signos y llamada a emergencias. |
| `alcohol.interactions.sedatives` | safety | `during_use` | NIAAA | Localizar fuente específica que cubra BZD, opioides y somníferos y riesgo de depresión respiratoria. |
| `alcohol.withdrawal.nutrition` | seek_help | `during_use`, `acute_withdrawal` | NICE CG100 | NICE 1.2.1 especifica indicaciones de tiamina por riesgo; no recomendar dosis ni automedicación. |
| `nicotine.cessation.support` | seek_help | `during_use`, `acute_withdrawal`, `post_acute`, `normalizing` | WHO 2024 | OMS 2024 respalda tratamientos conductuales y farmacológicos para tabaco; evitar extrapolar eficacia específica a vapeo sin soporte. |
| `nicotine.withdrawal.cravings` | self_care | `acute_withdrawal`, `post_acute` | CDC | Buscar página CDC sobre manejo de craving y contrastar cada estrategia. |
| `nicotine.withdrawal.sleep` | self_care | `acute_withdrawal`, `post_acute` | CDC | Buscar CDC sobre sueño, horarios y cafeína; evaluar apoyo separado para cada pauta. |
| `nicotine.withdrawal.mood` | seek_help | `acute_withdrawal`, `post_acute` | CDC | Buscar CDC sobre ánimo/irritabilidad y criterio de consulta; no atribuir síntomas graves automáticamente. |
| `nicotine.cessation.triggers` | self_care | `during_use`, `acute_withdrawal`, `post_acute`, `normalizing` | CDC | Buscar CDC sobre desencadenantes y planes conductuales. |
| `cannabis.withdrawal.symptoms` | safety | `acute_withdrawal`, `post_acute` | NIDA | Localizar fuente NIDA sobre abstinencia y síntomas; la frase de no atribución es precaución editorial. |
| `cannabis.recovery.support` | seek_help | `during_use`, `acute_withdrawal`, `post_acute`, `normalizing` | NIDA | Localizar evidencia de CBT/MET/CM y precisar magnitud/limitaciones; evitar promesa de eficacia. |
| `cannabis.withdrawal.sleep` | self_care | `acute_withdrawal`, `post_acute` | NIDA; apoyo general pendiente | Separar fuente sobre sueños/sueño de fuente sobre higiene del sueño. |
| `cannabis.withdrawal.mood` | seek_help | `acute_withdrawal`, `post_acute` | NIDA; criterio clínico pendiente | Justificar recomendación de consulta ante síntomas intensos; “incapacitante” es umbral editorial. |
| `cannabis.mental_health.support` | seek_help | `during_use`, `acute_withdrawal`, `post_acute`, `normalizing` | NIDA; revisión específica pendiente | Distinguir asociación de causalidad y justificar criterio de derivación. |
| `cocaine.intoxication.chest_pain` | seek_help | `during_use` | ASAM/AAAP | ASAM/AAAP apartado Chest Pain apoya evaluación de síndrome coronario; revisar redacción pública de urgencia. |
| `cocaine.intoxication.neurological` | seek_help | `during_use` | ASAM/AAAP; detalle pendiente | Localizar recomendaciones específicas para convulsiones, focalidad y alteración de conciencia. |
| `cocaine.alcohol.interaction` | safety | `during_use` | Revisión sistemática 2024; cita exacta pendiente | Identificar revisión sistemática 2024 exacta y evaluar evidencia sobre cocaetileno/riesgo cardiovascular. |
| `cocaine.recovery.behavioral_support` | seek_help | `during_use`, `acute_withdrawal`, `post_acute`, `normalizing` | ASAM/AAAP | ASAM/AAAP recomendaciones 5–6 respaldan CM y terapias; no extrapolar a éxito individual. |
| `cocaine.withdrawal.mood` | seek_help | `acute_withdrawal`, `post_acute` | ASAM/AAAP; detalle pendiente | Revisar guía ASAM sobre depresión, suicidabilidad y criterios de urgencia; evitar equivalencias. |
| `caffeine.intake.sensitivity` | safety | `during_use` | FDA | FDA describe 400 mg como referencia poblacional y variación individual; “no es objetivo” es aclaración editorial. |
| `caffeine.withdrawal.gradual_reduction` | self_care | `during_use`, `acute_withdrawal` | MedlinePlus | Localizar MedlinePlus con recomendación explícita de reducción gradual. |
| `caffeine.withdrawal.headache` | safety | `acute_withdrawal`, `post_acute` | MedlinePlus | Localizar MedlinePlus para síntomas; distinguir consejo de no atribución automática. |
| `caffeine.sleep.anxiety` | self_care | `during_use`, `acute_withdrawal`, `post_acute`, `normalizing` | FDA; MedlinePlus | FDA para ansiedad y sueño; comprobar consejo de evitar consumo cerca de acostarse en fuente concreta. |
| `caffeine.medication.interactions` | seek_help | `during_use` | MedlinePlus | FDA menciona medicamentos y condiciones individuales; localizar MedlinePlus para interacción específica. |

## Anexo A — Textos exactos transferidos (no reescribir automáticamente)

### 1. `alcohol.withdrawal.assessment`
- Categoría: `safety`; fases: `during_use`, `acute_withdrawal`; pista: NICE CG100
- **ES**: Si puede existir dependencia física del alcohol, busca asesoramiento sanitario antes de reducir o interrumpir bruscamente el consumo.
- **EN**: If physical alcohol dependence may be present, seek medical advice before abruptly reducing or stopping alcohol use.

### 2. `alcohol.withdrawal.emergency`
- Categoría: `seek_help`; fases: `acute_withdrawal`, `post_acute`; pista: NICE CG100
- **ES**: Las convulsiones, la confusión intensa o la desorientación durante una posible abstinencia requieren atención médica urgente.
- **EN**: Seizures, severe confusion, or disorientation during possible alcohol withdrawal require urgent medical attention.

### 3. `alcohol.overdose.emergency`
- Categoría: `seek_help`; fases: `during_use`; pista: NIAAA
- **ES**: La pérdida de conciencia, la respiración lenta o irregular o las convulsiones tras consumir alcohol pueden indicar una intoxicación grave. Llama a emergencias.
- **EN**: Loss of consciousness, slow or irregular breathing, or seizures after drinking alcohol may indicate severe poisoning. Call emergency services.

### 4. `alcohol.interactions.sedatives`
- Categoría: `safety`; fases: `during_use`; pista: NIAAA
- **ES**: Combinar alcohol con benzodiacepinas, opioides o determinados somníferos aumenta el riesgo de sedación intensa y problemas respiratorios.
- **EN**: Combining alcohol with benzodiazepines, opioids, or certain sleeping medicines increases the risk of profound sedation and breathing problems.

### 5. `alcohol.withdrawal.nutrition`
- Categoría: `seek_help`; fases: `during_use`, `acute_withdrawal`; pista: NICE CG100
- **ES**: El consumo perjudicial prolongado puede asociarse con deficiencia de vitamina B1. Un profesional sanitario puede valorar si necesitas tiamina.
- **EN**: Long-term harmful alcohol use may be associated with vitamin B1 deficiency. A healthcare professional can assess whether thiamine is needed.

### 6. `nicotine.cessation.support`
- Categoría: `seek_help`; fases: `during_use`, `acute_withdrawal`, `post_acute`, `normalizing`; pista: WHO 2024
- **ES**: El asesoramiento conductual y los tratamientos para dejar el tabaco pueden aumentar las posibilidades de abandonar el consumo. Consulta las opciones disponibles.
- **EN**: Behavioral counseling and tobacco cessation treatments can improve the chances of quitting. Ask about available options.

### 7. `nicotine.withdrawal.cravings`
- Categoría: `self_care`; fases: `acute_withdrawal`, `post_acute`; pista: CDC
- **ES**: Cuando aparezca el deseo de consumir, prueba a cambiar de actividad, caminar o contactar con alguien de confianza. El deseo puede disminuir sin consumir.
- **EN**: When cravings arise, try changing activities, taking a walk, or contacting someone you trust. Cravings can subside without using nicotine.

### 8. `nicotine.withdrawal.sleep`
- Categoría: `self_care`; fases: `acute_withdrawal`, `post_acute`; pista: CDC
- **ES**: Mantener horarios regulares de sueño y evitar la cafeína al final del día puede ayudar a manejar las dificultades para dormir durante la abstinencia.
- **EN**: Keeping a regular sleep schedule and avoiding caffeine late in the day may help manage sleep difficulties during withdrawal.

### 9. `nicotine.withdrawal.mood`
- Categoría: `seek_help`; fases: `acute_withdrawal`, `post_acute`; pista: CDC
- **ES**: La irritabilidad y los cambios de ánimo pueden aparecer durante la abstinencia. Si son intensos, persisten o dificultan tu vida cotidiana, consulta con un profesional.
- **EN**: Irritability and mood changes can occur during withdrawal. Seek professional advice if they are severe, persistent, or interfere with daily life.

### 10. `nicotine.cessation.triggers`
- Categoría: `self_care`; fases: `during_use`, `acute_withdrawal`, `post_acute`, `normalizing`; pista: CDC
- **ES**: Identificar situaciones asociadas al consumo y preparar alternativas puede ayudarte a gestionar los desencadenantes habituales.
- **EN**: Identifying situations associated with nicotine use and preparing alternatives may help you manage common triggers.

### 11. `cannabis.withdrawal.symptoms`
- Categoría: `safety`; fases: `acute_withdrawal`, `post_acute`; pista: NIDA
- **ES**: Tras reducir o abandonar un consumo frecuente pueden aparecer irritabilidad, ansiedad, alteraciones del sueño y cambios del apetito. No atribuyas automáticamente cualquier síntoma a la abstinencia.
- **EN**: Reducing or stopping frequent cannabis use may cause irritability, anxiety, sleep disturbances, and appetite changes. Do not automatically attribute every symptom to withdrawal.

### 12. `cannabis.recovery.support`
- Categoría: `seek_help`; fases: `during_use`, `acute_withdrawal`, `post_acute`, `normalizing`; pista: NIDA
- **ES**: Si te resulta difícil reducir o abandonar el cannabis, las intervenciones psicológicas pueden ayudarte. Existen tratamientos conductuales con evidencia de beneficio.
- **EN**: If reducing or stopping cannabis is difficult, psychological interventions may help. Evidence supports several behavioral approaches.

### 13. `cannabis.withdrawal.sleep`
- Categoría: `self_care`; fases: `acute_withdrawal`, `post_acute`; pista: NIDA; apoyo general pendiente
- **ES**: Durante la abstinencia pueden aparecer sueños intensos y dificultades para dormir. Mantener rutinas regulares puede ayudar, aunque no sustituye la valoración de síntomas persistentes.
- **EN**: Vivid dreams and sleep difficulties may occur during withdrawal. Regular routines may help, but persistent symptoms deserve assessment.

### 14. `cannabis.withdrawal.mood`
- Categoría: `seek_help`; fases: `acute_withdrawal`, `post_acute`; pista: NIDA; criterio clínico pendiente
- **ES**: Si aparecen cambios importantes del estado de ánimo, ansiedad incapacitante o dificultades para funcionar, solicita valoración profesional.
- **EN**: Seek professional assessment if significant mood changes, disabling anxiety, or difficulty functioning occur.

### 15. `cannabis.mental_health.support`
- Categoría: `seek_help`; fases: `during_use`, `acute_withdrawal`, `post_acute`, `normalizing`; pista: NIDA; revisión específica pendiente
- **ES**: Si el consumo se acompaña de síntomas psicológicos preocupantes o empeoramiento de problemas previos, busca atención sanitaria.
- **EN**: Seek healthcare support if cannabis use is accompanied by concerning psychological symptoms or worsening of existing problems.

### 16. `cocaine.intoxication.chest_pain`
- Categoría: `seek_help`; fases: `during_use`; pista: ASAM/AAAP
- **ES**: El dolor torácico durante o después del consumo de cocaína requiere valoración médica urgente, incluso en personas jóvenes.
- **EN**: Chest pain during or after cocaine use requires urgent medical assessment, including in younger people.

### 17. `cocaine.intoxication.neurological`
- Categoría: `seek_help`; fases: `during_use`; pista: ASAM/AAAP; detalle pendiente
- **ES**: La pérdida de conciencia, las convulsiones o la aparición súbita de debilidad, dificultad para hablar o confusión intensa requieren asistencia urgente.
- **EN**: Loss of consciousness, seizures, or sudden weakness, difficulty speaking, or severe confusion require emergency care.

### 18. `cocaine.alcohol.interaction`
- Categoría: `safety`; fases: `during_use`; pista: Revisión sistemática 2024; cita exacta pendiente
- **ES**: Combinar cocaína y alcohol aumenta los riesgos cardiovasculares. Evita mezclar ambas sustancias.
- **EN**: Combining cocaine and alcohol increases cardiovascular risks. Avoid using them together.

### 19. `cocaine.recovery.behavioral_support`
- Categoría: `seek_help`; fases: `during_use`, `acute_withdrawal`, `post_acute`, `normalizing`; pista: ASAM/AAAP
- **ES**: Existen intervenciones psicológicas eficaces para los trastornos por consumo de estimulantes. Pregunta por programas especializados y manejo de contingencias.
- **EN**: Effective behavioral interventions exist for stimulant use disorders. Ask about specialized programs and contingency management.

### 20. `cocaine.withdrawal.mood`
- Categoría: `seek_help`; fases: `acute_withdrawal`, `post_acute`; pista: ASAM/AAAP; detalle pendiente
- **ES**: Si después de dejar la cocaína aparecen síntomas depresivos intensos o pensamientos de autolesión, busca ayuda profesional inmediata; ante peligro inmediato, llama a emergencias.
- **EN**: If severe depressive symptoms or thoughts of self-harm occur after stopping cocaine, seek immediate professional help; call emergency services if there is immediate danger.

### 21. `caffeine.intake.sensitivity`
- Categoría: `safety`; fases: `during_use`; pista: FDA
- **ES**: La tolerancia a la cafeína varía entre personas. Los 400 mg diarios citados por la FDA para la mayoría de adultos no son un objetivo ni garantizan seguridad individual.
- **EN**: Caffeine tolerance varies between individuals. The FDA's 400 mg daily reference for most adults is neither a target nor a guarantee of individual safety.

### 22. `caffeine.withdrawal.gradual_reduction`
- Categoría: `self_care`; fases: `during_use`, `acute_withdrawal`; pista: MedlinePlus
- **ES**: Si consumes cafeína habitualmente y quieres reducirla, hacerlo gradualmente puede disminuir las molestias de abstinencia.
- **EN**: If you regularly consume caffeine and want to cut back, gradual reduction may reduce withdrawal discomfort.

### 23. `caffeine.withdrawal.headache`
- Categoría: `safety`; fases: `acute_withdrawal`, `post_acute`; pista: MedlinePlus
- **ES**: La retirada de cafeína puede causar dolor de cabeza, somnolencia e irritabilidad. No presupongas que un síntoma intenso o inusual se debe solo a la abstinencia.
- **EN**: Caffeine withdrawal may cause headaches, drowsiness, and irritability. Do not assume severe or unusual symptoms are caused solely by withdrawal.

### 24. `caffeine.sleep.anxiety`
- Categoría: `self_care`; fases: `during_use`, `acute_withdrawal`, `post_acute`, `normalizing`; pista: FDA; MedlinePlus
- **ES**: Si la cafeína empeora tu sueño o ansiedad, considera reducir su consumo y evitarla cerca de la hora de dormir.
- **EN**: If caffeine worsens your sleep or anxiety, consider reducing your intake and avoiding it close to bedtime.

### 25. `caffeine.medication.interactions`
- Categoría: `seek_help`; fases: `during_use`; pista: MedlinePlus
- **ES**: Algunos medicamentos y enfermedades pueden modificar los riesgos de la cafeína. Consulta con un profesional sanitario si tienes dudas sobre posibles interacciones.
- **EN**: Certain medicines and medical conditions may affect caffeine-related risks. Ask a healthcare professional if you are concerned about interactions.

## Riesgos transversales

- **Nicotina**: distinguir evidencia de cesación de tabaco frente a vapeo u otras formas de nicotina.
- **Cannabis**: síntomas de abstinencia no permiten diagnosticar; las medidas de higiene del sueño requieren respaldo separado.
- **Cocaína**: signos agudos no deben minimizarse; tratamiento de uso de estimulantes y manejo de intoxicación son dominios distintos.
- **Cafeína**: 400 mg/día no es un umbral de seguridad universal.
- **Alcohol**: dependencia física, abstinencia complicada, intoxicación y combinación con depresores deben permanecer diferenciadas.
- **Internacionalización**: comprobar equivalencia clínica ES/EN, no solo que existan claves.
- **Sistemas y órganos**: no crear consejos `scope: organ` sin evidencia específica.

## Criterios de aceptación del informe bibliográfico

- Las 25 fichas tienen fila de auditoría y estado individual.
- Cada claim tiene documento y localización precisa o queda `pending` con causa explícita.
- Los cambios de texto se presentan como propuesta bilingüe revisable.
- No hay referencias ni fechas inventadas; ninguna promoción editorial o clínica automática.
- 25 borradores permanecen fuera de runtime; 0 consejos publicados.
- Tests y TypeScript siguen verdes; sin commit ni push.

## Límite del presente informe

Se realizó una comprobación documental puntual de NICE, OMS, ASAM/AAAP y FDA. No se ha completado una revisión exhaustiva, línea a línea, de todas las fuentes de las 25 fichas. Este documento es un paquete de trabajo de auditoría para Cursor, no un dictamen clínico ni un permiso de publicación.