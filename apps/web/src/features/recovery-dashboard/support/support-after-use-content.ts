import type { AfterUseCompanionStep } from "./support-after-use-tool.js";
import type { SomiState } from "../../somi/somi-model.js";

export type SupportAfterUseLocale = "es" | "en";

export interface AfterUseStepContent {
  title: string;
  body: string[];
  primaryCta?: string;
}

export interface AfterUseReferenceContent {
  refId: string;
  organization: string;
  title: string;
  href: string;
  scopeNote: string;
}

export interface SupportAfterUseLocalizedContent {
  notice: string;
  emergencyBanner: string;
  helpLinkLabel: string;
  termsLinkLabel: string;
  exitLabel: string;
  continueLabel: string;
  stepProgress: string;
  steps: Record<AfterUseCompanionStep, AfterUseStepContent>;
  closeActions: {
    hub: string;
    help: string;
    breathing: string;
  };
  invitePrompt: string;
  inviteNote: string;
  inviteAccept: string;
  inviteDismiss: string;
  referencesTitle: string;
  referencesIntro: string;
  references: AfterUseReferenceContent[];
}

export const AFTER_USE_SOMI_BY_STEP: Record<AfterUseCompanionStep, SomiState> = {
  welcome: "supportive",
  close: "supportive",
};

export const supportAfterUseContent = {
  es: {
    notice:
      "Acompañamiento educativo y voluntario. No es terapia, no diagnostica una recaída y no sustituye ayuda profesional ni de emergencia.",
    emergencyBanner:
      "Si sospechas una sobredosis, hay peligro inmediato o síntomas graves, pide ayuda de emergencia ahora. No hace falta terminar este acompañamiento.",
    helpLinkLabel: "Ver recursos de ayuda",
    termsLinkLabel: "Situaciones que requieren ayuda profesional",
    exitLabel: "Salir",
    continueLabel: "Continuar",
    stepProgress: "Paso {{current}} de {{total}}",
    steps: {
      welcome: {
        title: "Tu camino no empieza de cero",
        body: [
          "Volver a consumir no borra lo que ya has aprendido ni invalida el camino que has recorrido.",
          "Puedes continuar tu recuperación a tu ritmo, con los apoyos que te encajen.",
          "Si lo necesitas, puedes pedir ayuda profesional o acudir a personas de confianza.",
          "En Soma, los logros y el XP ya reconocidos se conservan con las reglas actuales del producto: actualizar el uso en tu perfil no los elimina.",
        ],
        primaryCta: "Continuar",
      },
      close: {
        title: "Estamos aquí si lo necesitas",
        body: [
          "Puedes volver al Centro de Apoyo, consultar recursos verificados o hacer una pausa breve con la respiración guiada.",
          "Este acompañamiento no mide tu progreso ni predice lo que vendrá. Si el malestar crece, prioriza ayuda profesional o de emergencia.",
        ],
      },
    },
    closeActions: {
      hub: "Volver a Apoyo",
      help: "Consultar recursos de ayuda",
      breathing: "Abrir respiración guiada",
    },
    invitePrompt: "¿Te gustaría recibir apoyo en este momento?",
    inviteNote:
      "Esta invitación aparece tras un cambio en tu perfil. No clasifica ese cambio como una recaída ni te pide que lo justifiques.",
    inviteAccept: "Sí, ver acompañamiento",
    inviteDismiss: "Ahora no",
    referencesTitle: "Referencias educativas",
    referencesIntro:
      "Fuentes de inspiración educativa. No demuestran que este acompañamiento de Soma sea una intervención clínicamente validada.",
    references: [
      {
        refId: "REF-AU-01",
        organization: "Veterans Health Library",
        title: "Planning For and Coping With Alcohol or Drug Setbacks",
        href: "https://veteranshealthlibrary.va.gov/RelatedItems/142%2C41809_va",
        scopeNote: "Orientación general ante setbacks (contexto VA); no es un protocolo de Soma.",
      },
      {
        refId: "REF-AU-02",
        organization: "NIAAA",
        title: "How to Stop Alcohol Cravings",
        href: "https://rethinkingdrinking.niaaa.nih.gov/tools/worksheets-more/how-stop-alcohol-cravings",
        scopeNote: "Específica del alcohol; no se extrapola automáticamente a otras sustancias.",
      },
    ],
  },
  en: {
    notice:
      "An educational, voluntary accompaniment. It is not therapy, does not diagnose a relapse, and does not replace professional or emergency help.",
    emergencyBanner:
      "If you suspect an overdose, face immediate danger, or have severe symptoms, seek emergency help now. You do not need to finish this accompaniment.",
    helpLinkLabel: "View help resources",
    termsLinkLabel: "Situations that need professional help",
    exitLabel: "Exit",
    continueLabel: "Continue",
    stepProgress: "Step {{current}} of {{total}}",
    steps: {
      welcome: {
        title: "Your path does not start from zero",
        body: [
          "Returning to use does not erase what you have already learned or invalidate the path you have walked.",
          "You can continue your recovery at your own pace, with the support that fits you.",
          "If you need it, you can seek professional help or turn to people you trust.",
          "In Soma, achievements and XP already recognized are kept under the product’s current rules: updating use in your profile does not remove them.",
        ],
        primaryCta: "Continue",
      },
      close: {
        title: "We are here if you need us",
        body: [
          "You can return to the Support hub, check verified resources, or take a short pause with guided breathing.",
          "This accompaniment does not measure your progress or predict what comes next. If distress grows, prioritize professional or emergency help.",
        ],
      },
    },
    closeActions: {
      hub: "Back to Support",
      help: "View help resources",
      breathing: "Open guided breathing",
    },
    invitePrompt: "Would you like support right now?",
    inviteNote:
      "This invitation appears after a profile change. It does not classify that change as a relapse or ask you to justify it.",
    inviteAccept: "Yes, see accompaniment",
    inviteDismiss: "Not now",
    referencesTitle: "Educational references",
    referencesIntro:
      "Educational inspiration sources. They do not prove that this Soma accompaniment is a clinically validated intervention.",
    references: [
      {
        refId: "REF-AU-01",
        organization: "Veterans Health Library",
        title: "Planning For and Coping With Alcohol or Drug Setbacks",
        href: "https://veteranshealthlibrary.va.gov/RelatedItems/142%2C41809_va",
        scopeNote: "General guidance on setbacks (VA context); not a Soma protocol.",
      },
      {
        refId: "REF-AU-02",
        organization: "NIAAA",
        title: "How to Stop Alcohol Cravings",
        href: "https://rethinkingdrinking.niaaa.nih.gov/tools/worksheets-more/how-stop-alcohol-cravings",
        scopeNote: "Alcohol-specific; not automatically generalized to other substances.",
      },
    ],
  },
} as const satisfies Record<SupportAfterUseLocale, SupportAfterUseLocalizedContent>;

export function getSupportAfterUseContent(
  locale: SupportAfterUseLocale,
): SupportAfterUseLocalizedContent {
  return supportAfterUseContent[locale];
}

export function formatAfterUseStepProgress(
  template: string,
  current: number,
  total: number,
): string {
  return template.replace("{{current}}", String(current)).replace("{{total}}", String(total));
}
