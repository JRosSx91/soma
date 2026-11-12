import { SUPPORT_TERMS_EMERGENCY_HREF } from "./support-links.js";
import type { SupportStrategyId } from "./support-strategies.js";

/**
 * Localized strategy sheets for SUP-01D-B2.
 *
 * Source of truth for review: `docs/review/support/sup-01d-b1-*.md`.
 * When editors change those Markdown files, update this module to match
 * (same sections, warnings, and public references). Do not keep a second
 * executable copy elsewhere.
 */

export type SupportStrategyLocale = "es" | "en";

export interface SupportStrategyReference {
  /** Internal REF-* code for editorial cross-check / tests; not shown as bibliography. */
  refId: string;
  organization: string;
  title: string;
  href?: string;
}

export interface SupportStrategyOption {
  title: string;
  body: string;
}

export interface SupportStrategyLocalizedContent {
  title: string;
  intro: readonly string[];
  understandTitle: string;
  understand: readonly string[];
  optionsTitle: string;
  optionsLead: string;
  options: readonly SupportStrategyOption[];
  precautionsTitle: string;
  precautions: readonly string[];
  professionalTitle: string;
  professional: readonly string[];
  referencesTitle: string;
  references: readonly SupportStrategyReference[];
  /** Stress sheet only: label for the in-app breathing link. */
  breathingLinkLabel?: string;
}

export type SupportStrategyContentMap = Record<
  SupportStrategyId,
  Record<SupportStrategyLocale, SupportStrategyLocalizedContent>
>;

const refSo01 = {
  es: {
    refId: "REF-SO-01",
    organization: "Soma",
    title: "Situaciones que requieren ayuda profesional (Condiciones de uso)",
    href: SUPPORT_TERMS_EMERGENCY_HREF,
  },
  en: {
    refId: "REF-SO-01",
    organization: "Soma",
    title: "Situations that need professional help (Terms of use)",
    href: SUPPORT_TERMS_EMERGENCY_HREF,
  },
} as const;

export const supportStrategyContent = {
  "stress.pause": {
    es: {
      title: "Una pausa cuando el estrés aumenta",
      intro: [
        "Hay días en los que el cuerpo y la mente se aceleran: tensión en el cuello o la mandíbula, pensamientos que se amontonan, irritabilidad o la sensación de no llegar a todo. Eso es una forma habitual de vivir el estrés. No significa que «falles»; puede ser una respuesta intensa a una situación exigente.",
        "Esta ficha ofrece orientaciones generales y voluntarias. No diagnostica ansiedad ni sustituye el cuidado profesional.",
      ],
      understandTitle: "Comprender lo que ocurre",
      understand: [
        "El estrés aparece cuando las demandas del momento superan, o parecen superar, los recursos que sentimos disponibles. Puede ser puntual (un conflicto, una noticia, una espera) o acumularse a lo largo del día.",
        "No hay una única señal «correcta». Algunas personas notan el corazón más rápido; otras, dificultad para concentrarse; otras, ganas de aislarse o de consumir. Observar esas señales —sin juzgarlas de inmediato— es un primer paso educativo.",
        "Una sensación de presión o molestia en el pecho a veces acompaña al estrés, pero no debe atribuirse automáticamente a él. Si es nueva, intensa, o va con dificultad para respirar, mareo intenso u otros síntomas preocupantes, conviene valorarla con un profesional.",
        "Las técnicas de relajación o de respiración se estudian como posibles ayudas complementarias. La evidencia de que traten por sí solas condiciones clínicas concretas es limitada; no reemplazan la atención sanitaria cuando hace falta.",
      ],
      optionsTitle: "Opciones que se pueden considerar",
      optionsLead: "Elige solo lo que te encaje. Nada de esto es obligatorio ni garantiza un resultado.",
      options: [
        {
          title: "Nombrar el momento",
          body: "En una frase sencilla: «Estoy estresado» o «Ahora mismo me siento desbordado». Ponerle nombre no lo resuelve todo; a veces basta para no pelearte además contigo.",
        },
        {
          title: "Tomar una pausa breve",
          body: "Si puedes, detén un instante lo que estás haciendo. Apoya los pies en el suelo, suelta los hombros, mira alrededor. Materiales de la OMS hablan de «tomar una pausa» y prestar atención a la respiración y al entorno.",
        },
        {
          title: "Respirar con calma, sin forzar",
          body: "Guías del NHS proponen respirar de forma suave y regular durante unos minutos, a tu ritmo, en una postura cómoda. Si te marea o te incomoda, para.",
        },
        {
          title: "Usar la respiración guiada de Soma",
          body: "Ya está disponible en el Centro de Apoyo: una opción visual voluntaria (inspirar y espirar sin retener el aire). No promete calmarte «en X segundos»; es una herramienta más entre otras.",
        },
      ],
      precautionsTitle: "Precauciones",
      precautions: [
        "Si la respiración profunda te genera mareo o pánico, detente y vuelve a un ritmo natural.",
        "El malestar habitual del estrés (tensión, irritabilidad, sensación de no llegar) no es lo mismo que síntomas que requieren valoración médica urgente.",
        "Ante dolor u opresión en el pecho nuevos o intensos, o si van con dificultad para respirar, mareo intenso u otros signos preocupantes, busca valoración médica. No los atribuyas automáticamente al estrés.",
        "Estas ideas no tratan trastornos de ansiedad, depresión ni crisis, ni sustituyen la atención sanitaria cuando hace falta.",
      ],
      professionalTitle: "Cuándo buscar apoyo profesional",
      professional: [
        "Busca ayuda profesional si el estrés te impide dormir, trabajar o relacionarte de forma sostenida; si aparece miedo intenso o desesperanza; o si sientes que no puedes manejarlo solo.",
        "Soma es un recurso educativo. No ofrece asistencia de emergencias. Si hay peligro inmediato para tu vida o la de otra persona, contacta con los servicios de emergencia de tu zona.",
      ],
      referencesTitle: "Referencias",
      breathingLinkLabel: "Abrir la respiración guiada",
      references: [
        {
          refId: "REF-ST-01",
          organization: "NHS",
          title: "Breathing exercises for stress",
          href: "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/",
        },
        {
          refId: "REF-ST-02",
          organization: "OMS / WHO",
          title: "Doing What Matters in Times of Stress (2020)",
          href: "https://www.who.int/publications/i/item/9789240003927",
        },
        {
          refId: "REF-ST-03",
          organization: "NIH News in Health",
          title: "Relaxation Techniques for Stress? (2013)",
          href: "https://newsinhealth.nih.gov/2013/02/relaxation-techniques-stress",
        },
        {
          refId: "REF-ST-04",
          organization: "NIH / NCCIH",
          title: "Mindfulness and relaxation techniques",
          href: "https://health.nih.gov/health-topics-a-z/mindfulness",
        },
        refSo01.es,
      ],
    },
    en: {
      title: "Taking a pause when stress builds",
      intro: [
        "Some days the body and mind speed up: tension in the neck or jaw, racing thoughts, irritability, or the sense that you cannot keep up. That is a common way of experiencing stress. It does not mean you are failing; it can be an intense response to a demanding situation.",
        "This sheet offers general, voluntary suggestions. It does not diagnose anxiety and it does not replace professional care.",
      ],
      understandTitle: "Understanding what is going on",
      understand: [
        "Stress shows up when the demands of the moment exceed — or feel as if they exceed — the resources you sense you have. It can be brief (a conflict, news, waiting) or build across the day.",
        "There is no single “correct” signal. Some people notice a faster heartbeat; others struggle to focus; others want to withdraw or to use a substance. Noticing those signals — without judging them at once — is a useful educational first step.",
        "A feeling of pressure or discomfort in the chest sometimes comes with stress, but it should not be attributed to stress by default. If it is new, intense, or comes with breathing difficulty, severe dizziness, or other worrying symptoms, it is worth having a professional assess it.",
        "Relaxation or breathing practices are studied as possible complementary aids. Evidence that they alone treat specific clinical conditions is limited; they do not replace health care when it is needed.",
      ],
      optionsTitle: "Options you may consider",
      optionsLead: "Choose only what fits. Nothing here is required, and nothing guarantees an outcome.",
      options: [
        {
          title: "Name the moment",
          body: "A simple line: “I am stressed” or “I feel overwhelmed right now.” Naming does not fix everything; sometimes it stops an extra fight with yourself.",
        },
        {
          title: "Take a short pause",
          body: "If you can, stop what you are doing for a moment. Feel your feet on the floor, drop your shoulders, look around. WHO materials describe “taking a pause” and paying attention to breath and surroundings.",
        },
        {
          title: "Breathe calmly, without forcing",
          body: "NHS guidance suggests gentle, regular breathing for a few minutes, at your own pace, in a comfortable position. If you feel dizzy or uncomfortable, stop.",
        },
        {
          title: "Use Soma’s guided breathing",
          body: "It is already available in the Support centre: a voluntary visual option (breathe in and out without holding). It does not promise calm “in X seconds”; it is one tool among others.",
        },
      ],
      precautionsTitle: "Precautions",
      precautions: [
        "If deeper breathing brings dizziness or panic, stop and return to a natural rhythm.",
        "The everyday discomfort of stress (tension, irritability, feeling unable to keep up) is not the same as symptoms that need urgent medical assessment.",
        "With new or intense chest pain or pressure, or if it comes with breathing difficulty, severe dizziness, or other worrying signs, seek medical assessment. Do not attribute these to stress by default.",
        "These ideas do not treat anxiety disorders, depression, or crises, and they do not replace health care when it is needed.",
      ],
      professionalTitle: "When to seek professional support",
      professional: [
        "Seek professional help if stress keeps you from sleeping, working, or relating for a sustained period; if intense fear or hopelessness appears; or if you feel you cannot manage alone.",
        "Soma is an educational resource. It does not provide emergency care. If there is immediate danger to your life or someone else’s, contact local emergency services.",
      ],
      referencesTitle: "References",
      breathingLinkLabel: "Open guided breathing",
      references: [
        {
          refId: "REF-ST-01",
          organization: "NHS",
          title: "Breathing exercises for stress",
          href: "https://www.nhs.uk/mental-health/self-help/guides-tools-and-activities/breathing-exercises-for-stress/",
        },
        {
          refId: "REF-ST-02",
          organization: "WHO",
          title: "Doing What Matters in Times of Stress (2020)",
          href: "https://www.who.int/publications/i/item/9789240003927",
        },
        {
          refId: "REF-ST-03",
          organization: "NIH News in Health",
          title: "Relaxation Techniques for Stress? (2013)",
          href: "https://newsinhealth.nih.gov/2013/02/relaxation-techniques-stress",
        },
        {
          refId: "REF-ST-04",
          organization: "NIH / NCCIH",
          title: "Mindfulness and relaxation techniques",
          href: "https://health.nih.gov/health-topics-a-z/mindfulness",
        },
        refSo01.en,
      ],
    },
  },
  "habits.small-routines": {
    es: {
      title: "Pequeñas rutinas que dan estructura",
      intro: [
        "Cuando la vida se siente desordenada, a veces ayuda tener unos pocos anclajes sencillos: levantarse cerca de la misma hora, preparar algo de comer, salir un rato, o cerrar el día con el mismo gesto. No hace falta un horario perfecto ni una transformación total.",
        "Esta ficha habla de rutinas flexibles y realistas. No prescribe un estilo de vida único ni promete resultados clínicos.",
      ],
      understandTitle: "Comprender lo que ocurre",
      understand: [
        "Las rutinas son patrones que se repiten. Para algunas personas, unos pocos anclajes fijos hacen el día más predecible y dan una sensación de continuidad. Guías de bienestar de SAMHSA describen el uso de rutinas y recordatorios sencillos (calendarios, listas) como parte de un enfoque amplio de wellness.",
        "En recuperación, el sueño y los ritmos del día a menudo se ven afectados. Eso aparece con frecuencia en material educativo para profesionales. No significa que unas rutinas concretas «prevengan» una recaída; solo que el descanso y la estructura pueden ser áreas a cuidar con realismo y, si hace falta, con ayuda profesional.",
        "La higiene del sueño (hábitos cotidianos que favorecen el descanso) no es lo mismo que el tratamiento clínico del insomnio u otros trastornos del sueño.",
      ],
      optionsTitle: "Opciones que se pueden considerar",
      optionsLead: "Elige una o dos. Si no encajan, déjalas. Son opciones, no obligaciones.",
      options: [
        {
          title: "Un ancla al despertar",
          body: "Algo breve y repetible: luz, agua, estirarte, anotar una línea. Prioriza lo que puedas mantener, no lo más ambicioso.",
        },
        {
          title: "Bloques suaves, no un horario rígido",
          body: "Marca dos o tres momentos del día (mañana / comida / noche) en lugar de llenar cada hora. Las rutinas deben poder doblarse cuando el día se complica.",
        },
        {
          title: "Cierre del día",
          body: "Repetir un gesto tranquilo antes de dormir (bajar pantallas, leer algo corto, preparar la ropa) es una orientación habitual de higiene del sueño. Adáptalo a tu contexto.",
        },
        {
          title: "Revisar sin castigarte",
          body: "Cada pocos días, pregunta solo: «¿Qué me funcionó un poco?» Ajusta; no conviertas el fallo de un día en un juicio sobre ti.",
        },
      ],
      precautionsTitle: "Precauciones",
      precautions: [
        "Una rutina rota no es un fracaso moral.",
        "No uses estas ideas para sustituir tratamiento, medicación o seguimiento profesional.",
        "Si el sueño empeora de forma importante, o aparece somnolencia diurna intensa, conviene valorar causas con un profesional.",
      ],
      professionalTitle: "Cuándo buscar apoyo profesional",
      professional: [
        "Busca apoyo si no consigues descansar de forma sostenida, si el desorden del día se asocia a un malestar intenso, o si sientes que no puedes organizar lo básico sin ayuda.",
        "Soma no es un servicio de emergencias. Ante peligro inmediato, contacta con los servicios de tu zona.",
      ],
      referencesTitle: "Referencias",
      references: [
        {
          refId: "REF-HB-01",
          organization: "SAMHSA",
          title: "Creating a Healthier Life: A Step-By-Step Guide to Wellness (SMA16-4958)",
          href: "https://library.samhsa.gov/sites/default/files/sma16-4958.pdf",
        },
        {
          refId: "REF-HB-02",
          organization: "SAMHSA",
          title: "Treating Sleep Problems of People in Recovery From Substance Use Disorders (Fall 2014)",
          href: "https://library.samhsa.gov/sites/default/files/sma14-4859.pdf",
        },
        {
          refId: "REF-HB-03",
          organization: "SAMHSA / NCBI Bookshelf",
          title: "Healthy sleep habits (Exhibit 4.4)",
          href: "https://www.ncbi.nlm.nih.gov/books/NBK601481/box/ch4.b15/",
        },
        refSo01.es,
      ],
    },
    en: {
      title: "Small routines that provide structure",
      intro: [
        "When life feels scattered, a few simple anchors can help: waking near the same time, preparing something to eat, stepping outside, or ending the day with the same small gesture. You do not need a perfect schedule or a total life overhaul.",
        "This sheet is about flexible, realistic routines. It does not prescribe one lifestyle and it does not promise clinical outcomes.",
      ],
      understandTitle: "Understanding what is going on",
      understand: [
        "Routines are patterns that repeat. For some people, a few steady anchors make the day more predictable and offer a sense of continuity. SAMHSA wellness guidance describes using simple routines and reminders (calendars, checklists) as part of a broader wellness approach.",
        "In recovery, sleep and daily rhythms are often affected. That appears frequently in educational material for professionals. It does not mean that particular routines “prevent” relapse; it only means rest and structure can be areas to care for realistically — and with professional help when needed.",
        "Sleep hygiene (everyday habits that support rest) is not the same as clinical treatment for insomnia or other sleep disorders.",
      ],
      optionsTitle: "Options you may consider",
      optionsLead: "Pick one or two. Leave the rest. These are options, not rules.",
      options: [
        {
          title: "A morning anchor",
          body: "Something short and repeatable: light, water, a stretch, one written line. Favour what you can keep up, not the most ambitious plan.",
        },
        {
          title: "Soft blocks, not a rigid timetable",
          body: "Mark two or three moments in the day (morning / meal / evening) instead of filling every hour. Routines should bend when the day gets hard.",
        },
        {
          title: "An evening wind-down",
          body: "Repeating a calm gesture before sleep (fewer screens, a short read, laying out clothes) is a common sleep-hygiene suggestion. Adapt it to your setting.",
        },
        {
          title: "Review without self-punishment",
          body: "Every few days ask only: “What worked a little?” Adjust; do not turn one missed day into a harsh judgement of yourself.",
        },
      ],
      precautionsTitle: "Precautions",
      precautions: [
        "A broken routine is not a moral failure.",
        "Do not use these ideas to replace treatment, medication, or professional follow-up.",
        "If sleep worsens markedly, or daytime sleepiness is intense, it is worth exploring causes with a professional.",
      ],
      professionalTitle: "When to seek professional support",
      professional: [
        "Seek support if you cannot rest in a sustained way, if daily disorganisation comes with intense distress, or if you cannot manage basics without help.",
        "Soma is not an emergency service. If there is immediate danger, contact local services.",
      ],
      referencesTitle: "References",
      references: [
        {
          refId: "REF-HB-01",
          organization: "SAMHSA",
          title: "Creating a Healthier Life: A Step-By-Step Guide to Wellness (SMA16-4958)",
          href: "https://library.samhsa.gov/sites/default/files/sma16-4958.pdf",
        },
        {
          refId: "REF-HB-02",
          organization: "SAMHSA",
          title: "Treating Sleep Problems of People in Recovery From Substance Use Disorders (Fall 2014)",
          href: "https://library.samhsa.gov/sites/default/files/sma14-4859.pdf",
        },
        {
          refId: "REF-HB-03",
          organization: "SAMHSA / NCBI Bookshelf",
          title: "Healthy sleep habits (Exhibit 4.4)",
          href: "https://www.ncbi.nlm.nih.gov/books/NBK601481/box/ch4.b15/",
        },
        refSo01.en,
      ],
    },
  },
  "emotions.naming": {
    es: {
      title: "Poner nombre a lo que sentimos",
      intro: [
        "A veces aparece una emoción fuerte —enojo, vergüenza, tristeza, miedo, vacío— y cuesta saber cuál es. Otras veces varias se mezclan. Intentar una palabra sencilla («estoy enfadado», «tengo miedo», «me siento solo») es una práctica educativa: observar sin convertirlo de inmediato en una condena sobre quién eres.",
        "Esta ficha no diagnostica, no interpreta tu historia personal y no promete «controlar» las emociones.",
        "Las actividades de esta ficha son orientaciones educativas voluntarias. No se presentan como intervenciones clínicamente validadas.",
      ],
      understandTitle: "Comprender lo que ocurre",
      understand: [
        "Las emociones son respuestas afectivas a lo que vivimos: señales, no fallos morales. Conviene distinguirlas de sensaciones o estados físicos (por ejemplo, cansancio, tensión muscular o hambre), que pueden acompañarlas o confundirse con ellas. No hay un listado único que Soma pueda asignarte.",
        "En investigación de laboratorio, etiquetar el afecto (usar palabras para caracterizar una emoción o el tono emocional de una situación) se ha asociado, en algunos estudios de neuroimagen, a una menor respuesta de regiones ligadas a la reactividad emocional (como la amígdala) y a mayor actividad en la corteza prefrontal ventrolateral derecha, un área relacionada con el lenguaje.",
        "Revisiones posteriores describen el etiquetado como una forma posible de regulación implícita: a menudo no se vive como una técnica deliberada de «control».",
        "Eso no significa que nombrar emociones cure un trastorno, elimine el malestar o sustituya a la psicoterapia o al tratamiento. Los hallazgos vienen sobre todo de contextos experimentales; no deben extrapolarse como efecto clínico garantizado en cada persona.",
      ],
      optionsTitle: "Opciones que se pueden considerar",
      optionsLead: "Voluntarias, breves, sin meta de «éxito». No son un tratamiento validado.",
      options: [
        {
          title: "Una palabra para la emoción",
          body: "Elige la etiqueta afectiva más cercana: triste, enfadado, ansioso, avergonzado, confuso. Si lo que notas es sobre todo físico (por ejemplo, cansancio), nómbralo como sensación corporal, no como si fuera automáticamente una emoción.",
        },
        {
          title: "Añadir el cuerpo, si ayuda",
          body: "«Noto tensión en los hombros» o «tengo la mandíbula apretada». A veces el cuerpo da pistas antes que la historia.",
        },
        {
          title: "Separar hecho, interpretación y emoción",
          body: "«Ha pasado X» (hecho), «me estoy diciendo Y» (interpretación) y «siento Z» (emoción). No es negar lo ocurrido; es no fusionar automáticamente los tres.",
        },
        {
          title: "Dejar que pase un momento",
          body: "Tras nombrar, no te obligues a «arreglarlo» al instante. Puedes volver a lo que estabas haciendo, o combinarlo con una pausa breve (ver ficha de estrés), si te encaja.",
        },
      ],
      precautionsTitle: "Precauciones",
      precautions: [
        "Nombrar no es lo mismo que analizar sin límite ni rumiar.",
        "Si etiquetar aumenta el malestar, para y prueba otra cosa, o pide ayuda.",
        "No uses esta ficha para autodiagnosticarte ni para decidir medicación.",
      ],
      professionalTitle: "Cuándo buscar apoyo profesional",
      professional: [
        "Busca ayuda si las emociones te desbordan de forma sostenida, si aparecen ideas de hacerte daño, si recurres al consumo de sustancias para intentar adormecer lo que sientes, o notas que está aumentando, o si no puedes cumplir lo básico del día.",
        "Soma es educativo y no atiende emergencias. Ante peligro inmediato, contacta con los servicios de tu zona.",
      ],
      referencesTitle: "Referencias",
      references: [
        {
          refId: "REF-EM-01",
          organization: "Lieberman et al.",
          title: "Putting Feelings Into Words (Psychological Science, 2007)",
          href: "https://doi.org/10.1111/j.1467-9280.2007.01916.x",
        },
        {
          refId: "REF-EM-02",
          organization: "Torre & Lieberman",
          title: "Putting Feelings Into Words: Affect Labeling as Implicit Emotion Regulation (Emotion Review, 2018)",
          href: "https://doi.org/10.1177/1754073917742706",
        },
        {
          refId: "REF-EM-03",
          organization: "APA Monitor",
          title: "Talking the pain away (October 2006)",
          href: "https://www.apa.org/monitor/oct06/talking.html",
        },
        refSo01.es,
      ],
    },
    en: {
      title: "Putting feelings into words",
      intro: [
        "Sometimes a strong emotion arrives — anger, shame, sadness, fear, emptiness — and it is hard to tell which one it is. Sometimes several mix. Trying a simple word (“I am angry”, “I feel afraid”, “I feel lonely”) is an educational practice: noticing without turning it at once into a harsh judgement of who you are.",
        "This sheet does not diagnose, does not interpret your personal history, and does not promise to “control” emotions.",
        "The activities on this sheet are voluntary educational suggestions. They are not presented as clinically validated interventions.",
      ],
      understandTitle: "Understanding what is going on",
      understand: [
        "Emotions are affective responses to what we live through: signals, not moral failures. It helps to distinguish them from physical sensations or states (for example tiredness, muscle tension, or hunger), which can accompany emotions or be mistaken for them. There is no single list Soma can assign to you.",
        "In laboratory research, affect labeling (using words to characterise an emotion or the emotional tone of a situation) has been linked, in some neuroimaging studies, to a smaller response in regions tied to emotional reactivity (such as the amygdala) and to greater activity in the right ventrolateral prefrontal cortex, a language-related area.",
        "Later reviews describe labeling as a possible form of implicit regulation: it often does not feel like a deliberate “control” technique.",
        "That does not mean naming emotions cures a disorder, removes distress, or replaces psychotherapy or treatment. Findings come mainly from experimental settings; they should not be extrapolated as a guaranteed clinical effect for each person.",
      ],
      optionsTitle: "Options you may consider",
      optionsLead: "Voluntary, brief, with no success quota. They are not a clinically validated treatment.",
      options: [
        {
          title: "One word for the emotion",
          body: "Pick the closest affective label: sad, angry, anxious, ashamed, confused. If what you notice is mainly physical (for example tiredness), name it as a body state rather than assuming it is automatically an emotion.",
        },
        {
          title: "Add the body if it helps",
          body: "“I feel tightness in my shoulders” or “my jaw is clenched.” Sometimes the body speaks before the story.",
        },
        {
          title: "Separate fact, interpretation, and emotion",
          body: "“X happened” (fact), “I am telling myself Y” (interpretation), and “I feel Z” (emotion). That is not denial; it avoids fusing all three at once.",
        },
        {
          title: "Let a moment pass",
          body: "After naming, do not force an instant fix. You can return to what you were doing, or combine it with a short pause (see the stress sheet) if that fits.",
        },
      ],
      precautionsTitle: "Precautions",
      precautions: [
        "Naming is not endless analysing or rumination.",
        "If labeling increases distress, stop and try something else, or ask for help.",
        "Do not use this sheet to self-diagnose or to change medication.",
      ],
      professionalTitle: "When to seek professional support",
      professional: [
        "Seek help if emotions overwhelm you in a sustained way, if thoughts of harming yourself appear, if you turn to substance use to try to numb what you feel, or notice that use is increasing, or if you cannot manage daily basics.",
        "Soma is educational and does not provide emergency care. If there is immediate danger, contact local services.",
      ],
      referencesTitle: "References",
      references: [
        {
          refId: "REF-EM-01",
          organization: "Lieberman et al.",
          title: "Putting Feelings Into Words (Psychological Science, 2007)",
          href: "https://doi.org/10.1111/j.1467-9280.2007.01916.x",
        },
        {
          refId: "REF-EM-02",
          organization: "Torre & Lieberman",
          title: "Putting Feelings Into Words: Affect Labeling as Implicit Emotion Regulation (Emotion Review, 2018)",
          href: "https://doi.org/10.1177/1754073917742706",
        },
        {
          refId: "REF-EM-03",
          organization: "APA Monitor",
          title: "Talking the pain away (October 2006)",
          href: "https://www.apa.org/monitor/oct06/talking.html",
        },
        refSo01.en,
      ],
    },
  },
} as const satisfies SupportStrategyContentMap;

export function getSupportStrategyContent(
  id: SupportStrategyId,
  locale: SupportStrategyLocale,
): SupportStrategyLocalizedContent {
  return supportStrategyContent[id][locale];
}
