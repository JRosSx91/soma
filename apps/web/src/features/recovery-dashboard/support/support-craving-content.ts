import type { CravingChoiceId, CravingCompanionStep } from "./support-craving-tool.js";
import type { SomiState } from "../../somi/somi-model.js";

export type SupportCravingLocale = "es" | "en";

export interface CravingChoiceContent {
  id: CravingChoiceId;
  title: string;
  body: string;
  /** Extra hint shown after selecting this option (still voluntary). */
  afterSelect: string;
}

export interface CravingStepContent {
  title: string;
  body: string[];
  primaryCta?: string;
  skipCta?: string;
  secondaryNote?: string;
}

export interface CravingReferenceContent {
  refId: string;
  organization: string;
  title: string;
  href: string;
  /** Short note on scope / substance focus. */
  scopeNote: string;
}

export interface SupportCravingLocalizedContent {
  notice: string;
  emergencyBanner: string;
  helpLinkLabel: string;
  termsLinkLabel: string;
  exitLabel: string;
  backLabel: string;
  continueLabel: string;
  continueWithoutChoiceLabel: string;
  stepProgress: string;
  waveLabel: string;
  waveCaption: string;
  choicesLead: string;
  steps: Record<CravingCompanionStep, CravingStepContent>;
  choices: CravingChoiceContent[];
  closeActions: {
    repeat: string;
    strategies: string;
    hub: string;
    help: string;
  };
  referencesTitle: string;
  referencesIntro: string;
  references: CravingReferenceContent[];
}

export const CRAVING_SOMI_BY_STEP: Record<CravingCompanionStep, SomiState> = {
  welcome: "supportive",
  ground: "idle",
  observe: "thinking",
  choose: "supportive",
  close: "supportive",
};

export const supportCravingContent = {
  es: {
    notice:
      "Pausa educativa y voluntaria. No es terapia, no predice lo que sentirás y no sustituye ayuda profesional ni de emergencia.",
    emergencyBanner:
      "Si sospechas una sobredosis, hay peligro inmediato o síntomas graves, pide ayuda de emergencia ahora. No hace falta terminar este ejercicio.",
    helpLinkLabel: "Ver recursos de ayuda",
    termsLinkLabel: "Situaciones que requieren ayuda profesional",
    exitLabel: "Salir",
    backLabel: "Atrás",
    continueLabel: "Continuar",
    continueWithoutChoiceLabel: "Continuar sin elegir",
    stepProgress: "Paso {{current}} de {{total}}",
    waveLabel: "Imagen orientativa de un impulso",
    waveCaption:
      "La intensidad puede subir y bajar. Esta imagen no mide tu impulso ni dice cuánto durará.",
    choicesLead:
      "Elige solo si te encaja. Son ideas para momentos de impulso de consumir, no un tratamiento ni un protocolo ante intoxicación o sobredosis.",
    steps: {
      welcome: {
        title: "Un momento para ti",
        body: [
          "Si ahora notas un deseo intenso o impulso de consumir, puedes pausar aquí un rato. No tienes que demostrar nada a nadie.",
          "Puedes salir cuando quieras, omitir lo que no te ayude o ir directo a pedir apoyo.",
        ],
        primaryCta: "Comenzar acompañamiento",
      },
      ground: {
        title: "Volver al presente",
        body: [
          "Si te resulta cómodo, mira a tu alrededor y nombra en silencio tres cosas que ves.",
          "Si puedes, apoya los pies en el suelo y respira a tu propio ritmo. No hace falta cerrar los ojos, retener el aire ni seguir un ritmo concreto.",
        ],
        primaryCta: "Continuar",
        skipCta: "Omitir este ejercicio",
        secondaryNote: "Si esto te incomoda, puedes omitirlo o buscar apoyo ahora.",
      },
      observe: {
        title: "Observar el impulso",
        body: [
          "A veces el impulso se describe como una ola: puede crecer, cambiar y, con el tiempo, menguar. Eso no ocurre igual en todas las personas ni con todas las sustancias.",
          "Si te ayuda, observa la sensación con curiosidad, sin pelearte con ella. No necesitas que el impulso desaparezca para continuar. Si sigue siendo intenso, puedes buscar apoyo.",
        ],
        primaryCta: "Continuar",
        skipCta: "Omitir si produce malestar",
        secondaryNote: "Puedes permanecer aquí un momento o seguir adelante.",
      },
      choose: {
        title: "Elegir el siguiente paso",
        body: [
          "Cuando te sientas listo o lista, puedes probar una de estas alternativas ante el impulso. También puedes continuar sin elegir ninguna.",
        ],
      },
      close: {
        title: "Un momento dedicado a ti",
        body: [
          "Has dedicado un momento a ti. Eso importa, aunque el impulso siga presente o vuelva más tarde.",
          "Si lo necesitas, puedes repetir esta pausa, mirar otras estrategias o pedir ayuda.",
        ],
      },
    },
    choices: [
      {
        id: "leave_setting",
        title: "Alejarte del entorno de riesgo",
        body: "Si es seguro hacerlo, cambia de lugar, sal a un espacio distinto o aparta lo que dispara el impulso.",
        afterSelect:
          "Prioriza tu seguridad. Si no puedes moverte ahora, está bien elegir otra opción o pedir ayuda.",
      },
      {
        id: "contact_person",
        title: "Contactar con alguien de confianza",
        body: "Un mensaje o una llamada a alguien que te apoye puede ayudar a no atravesar este momento en soledad.",
        afterSelect: "Usa tu propia agenda o los recursos de ayuda de Soma.",
      },
      {
        id: "recall_reasons",
        title: "Recordar tus motivaciones",
        body: "Piensa en una o dos razones personales para el cambio: salud, vínculos, proyectos o cómo quieres sentirte.",
        afterSelect: "Recordar una sola razón puede ayudarte a orientar tu siguiente paso.",
      },
      {
        id: "safe_activity",
        title: "Hacer una actividad alternativa segura",
        body: "Ante el impulso de consumir, a veces ayuda una actividad breve que no implique consumir: beber agua, dar un paseo corto, escribir, ducharte o poner música. No sustituye atención ante una intoxicación o sobredosis.",
        afterSelect: "Elige solo lo que sea seguro y posible ahora mismo.",
      },
      {
        id: "breathing",
        title: "Abrir la respiración guiada",
        body: "Puedes usar la herramienta de respiración de Soma a tu ritmo, sin retener el aire.",
        afterSelect: "El enlace abre la respiración del Centro de Apoyo.",
      },
      {
        id: "professional",
        title: "Buscar apoyo profesional",
        body: "Si el malestar crece o no sabes cómo seguir, contactar con un profesional o con recursos oficiales puede ser el paso más útil.",
        afterSelect: "Los recursos verificados están en el panel de ayuda de Apoyo.",
      },
    ],
    closeActions: {
      repeat: "Repetir el acompañamiento",
      strategies: "Explorar otras estrategias",
      hub: "Volver a Apoyo",
      help: "Consultar recursos de ayuda",
    },
    referencesTitle: "Referencias educativas",
    referencesIntro:
      "Fuentes de inspiración educativa. No demuestran que esta pausa de Soma sea una intervención clínicamente validada. Algunas se centran en el alcohol; otras describen estrategias más generales.",
    references: [
      {
        refId: "REF-CR-01",
        organization: "U.S. Department of Veterans Affairs",
        title: "Urge Surfing",
        href: "https://www.mirecc.va.gov/MIRECC/visn5/EBT/CBT-SUD/Urge-Surfing.asp",
        scopeNote: "Estrategia general de observación del impulso (contexto clínico VA).",
      },
      {
        refId: "REF-CR-02",
        organization: "Veterans Health Library",
        title: "Planning For and Coping With Alcohol or Drug Setbacks",
        href: "https://veteranshealthlibrary.va.gov/RelatedItems/142%2C41809_va",
        scopeNote: "Orientación general ante setbacks con alcohol u otras drogas (contexto VA).",
      },
      {
        refId: "REF-CR-03",
        organization: "NIAAA",
        title: "How to Stop Alcohol Cravings",
        href: "https://rethinkingdrinking.niaaa.nih.gov/tools/worksheets-more/how-stop-alcohol-cravings",
        scopeNote: "Específica del alcohol; no se extrapola automáticamente a otras sustancias.",
      },
    ],
  },
  en: {
    notice:
      "An educational, voluntary pause. It is not therapy, does not predict what you will feel, and does not replace professional or emergency help.",
    emergencyBanner:
      "If you suspect an overdose, face immediate danger, or have severe symptoms, seek emergency help now. You do not need to finish this exercise.",
    helpLinkLabel: "View help resources",
    termsLinkLabel: "Situations that need professional help",
    exitLabel: "Exit",
    backLabel: "Back",
    continueLabel: "Continue",
    continueWithoutChoiceLabel: "Continue without choosing",
    stepProgress: "Step {{current}} of {{total}}",
    waveLabel: "A simple picture of an urge",
    waveCaption:
      "Intensity can rise and fall. This image does not measure your urge or say how long it will last.",
    choicesLead:
      "Choose only if it fits. These ideas are for moments of craving to use — not a treatment, and not a protocol for intoxication or overdose.",
    steps: {
      welcome: {
        title: "A moment for you",
        body: [
          "If you notice a strong urge or craving to use right now, you can pause here for a while. You do not have to prove anything to anyone.",
          "You can leave whenever you want, skip what does not help, or go straight to support.",
        ],
        primaryCta: "Start accompaniment",
      },
      ground: {
        title: "Come back to the present",
        body: [
          "If it feels comfortable, look around and quietly name three things you can see.",
          "If you can, rest your feet on the floor and breathe at your own pace. You do not need to close your eyes, hold your breath, or follow a set rhythm.",
        ],
        primaryCta: "Continue",
        skipCta: "Skip this exercise",
        secondaryNote: "If this feels uncomfortable, you can skip it or seek support now.",
      },
      observe: {
        title: "Notice the urge",
        body: [
          "Sometimes an urge is described like a wave: it may rise, shift, and later ease. That does not happen the same way for every person or every substance.",
          "If it helps, watch the feeling with curiosity instead of fighting it. The urge does not have to disappear for you to continue. If it stays intense, you can seek support.",
        ],
        primaryCta: "Continue",
        skipCta: "Skip if it feels distressing",
        secondaryNote: "You can stay here a moment or move on.",
      },
      choose: {
        title: "Choose a next step",
        body: [
          "When you feel ready, you can try one of these options for the urge. You can also continue without choosing any.",
        ],
      },
      close: {
        title: "A moment set aside for you",
        body: [
          "You gave yourself a moment. That matters, even if the urge is still here or returns later.",
          "If you need to, you can repeat this pause, look at other strategies, or ask for help.",
        ],
      },
    },
    choices: [
      {
        id: "leave_setting",
        title: "Leave a risky setting",
        body: "If it is safe to do so, change rooms, step outside, or move away from what triggers the urge.",
        afterSelect:
          "Prioritise your safety. If you cannot move right now, another option or asking for help is fine.",
      },
      {
        id: "contact_person",
        title: "Contact someone you trust",
        body: "A message or call to someone who supports you can help so you are not alone in this moment.",
        afterSelect: "Use your own contacts or Soma’s help resources.",
      },
      {
        id: "recall_reasons",
        title: "Recall your reasons for change",
        body: "Think of one or two personal reasons for change: health, relationships, projects, or how you want to feel.",
        afterSelect: "Remembering even one reason can help you choose your next step.",
      },
      {
        id: "safe_activity",
        title: "Do a safe alternative activity",
        body: "When the urge to use appears, a brief activity that does not involve using — drink water, take a short walk, write, shower, or play music — can sometimes help. It does not replace care for intoxication or overdose.",
        afterSelect: "Choose only what is safe and possible right now.",
      },
      {
        id: "breathing",
        title: "Open guided breathing",
        body: "You can use Soma’s breathing tool at your own pace, without holding your breath.",
        afterSelect: "The link opens breathing in the Support centre.",
      },
      {
        id: "professional",
        title: "Seek professional support",
        body: "If distress grows or you do not know how to continue, contacting a professional or official resources may be the most useful step.",
        afterSelect: "Verified resources are in the Support help panel.",
      },
    ],
    closeActions: {
      repeat: "Repeat the accompaniment",
      strategies: "Explore other strategies",
      hub: "Back to Support",
      help: "View help resources",
    },
    referencesTitle: "Educational references",
    referencesIntro:
      "Educational sources of inspiration. They do not show that this Soma pause is a clinically validated intervention. Some focus on alcohol; others describe more general strategies.",
    references: [
      {
        refId: "REF-CR-01",
        organization: "U.S. Department of Veterans Affairs",
        title: "Urge Surfing",
        href: "https://www.mirecc.va.gov/MIRECC/visn5/EBT/CBT-SUD/Urge-Surfing.asp",
        scopeNote: "General urge-observation strategy (VA clinical context).",
      },
      {
        refId: "REF-CR-02",
        organization: "Veterans Health Library",
        title: "Planning For and Coping With Alcohol or Drug Setbacks",
        href: "https://veteranshealthlibrary.va.gov/RelatedItems/142%2C41809_va",
        scopeNote: "General guidance on setbacks with alcohol or other drugs (VA context).",
      },
      {
        refId: "REF-CR-03",
        organization: "NIAAA",
        title: "How to Stop Alcohol Cravings",
        href: "https://rethinkingdrinking.niaaa.nih.gov/tools/worksheets-more/how-stop-alcohol-cravings",
        scopeNote: "Alcohol-specific; not automatically generalised to other substances.",
      },
    ],
  },
} as const satisfies Record<SupportCravingLocale, SupportCravingLocalizedContent>;

export function getSupportCravingContent(locale: SupportCravingLocale): SupportCravingLocalizedContent {
  return supportCravingContent[locale];
}

export function formatCravingStepProgress(
  locale: SupportCravingLocale,
  current: number,
  total: number,
): string {
  return getSupportCravingContent(locale).stepProgress
    .replace("{{current}}", String(current))
    .replace("{{total}}", String(total));
}
