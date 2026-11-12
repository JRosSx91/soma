import type { SupportExternalResourceId } from "./support-external-resources.js";

export type SupportExternalLocale = "es" | "en";

export interface SupportExternalLocalizedCopy {
  name: string;
  organization: string;
  body: string;
  /** Confirmed schedule text only; omit when not verified. */
  schedule?: string;
  phoneAction?: string;
  webAction: string;
}

export const supportExternalContent = {
  "ext.es.112": {
    es: {
      name: "Emergencias — 112",
      organization: "Servicios de emergencia (España)",
      body: "Para peligro inmediato o una emergencia. No es una línea de orientación ordinaria sobre adicciones.",
      phoneAction: "Llamar al 112",
      webAction: "Abrir información oficial del 112",
    },
    en: {
      name: "Emergency — 112",
      organization: "Emergency services (Spain)",
      body: "For immediate danger or an emergency. Not an ordinary addiction-guidance line.",
      phoneAction: "Call 112",
      webAction: "Open official 112 information",
    },
  },
  "ext.es.024": {
    es: {
      name: "Línea 024 — Atención a la conducta suicida",
      organization: "Ministerio de Sanidad",
      body: "Para personas con ideación o riesgo de conducta suicida, y para familiares o allegados. No sustituye al 112 ante una emergencia vital inminente, ni reemplaza la atención sanitaria presencial.",
      schedule: "Gratuito, confidencial, 24 horas, todos los días.",
      phoneAction: "Llamar al 024",
      webAction: "Abrir la página oficial del 024",
    },
    en: {
      name: "Line 024 — Suicidal behaviour support",
      organization: "Spanish Ministry of Health",
      body: "For people with suicidal ideation or risk, and for family or close contacts. It does not replace 112 in an imminent life-threatening emergency, and it does not replace in-person health care.",
      schedule: "Free, confidential, 24 hours a day, every day.",
      phoneAction: "Call 024",
      webAction: "Open the official 024 page",
    },
  },
  "ext.es.pnsd.ayuda-cerca": {
    es: {
      name: "Ayuda cerca de ti — Plan Nacional sobre Drogas",
      organization: "Plan Nacional sobre Drogas / Ministerio de Sanidad",
      body: "Directorio para localizar recursos y centros de atención a las adicciones en España. No es un servicio de emergencias.",
      webAction: "Abrir el directorio oficial",
    },
    en: {
      name: "Help near you — National Drugs Plan",
      organization: "National Drugs Plan / Spanish Ministry of Health",
      body: "A directory to find addiction care resources and centres in Spain. Not an emergency service.",
      webAction: "Open the official directory",
    },
  },
  "ext.int.iasp.find-a-helpline": {
    es: {
      name: "Find A Helpline",
      organization: "IASP / ThroughLine",
      body: "Directorio internacional para buscar líneas de apoyo emocional y de crisis según el país. No es una línea de atención de Soma ni un servicio de emergencias.",
      webAction: "Abrir Find A Helpline",
    },
    en: {
      name: "Find A Helpline",
      organization: "IASP / ThroughLine",
      body: "An international directory to find emotional-support and crisis helplines by country. Not a Soma helpline and not an emergency service.",
      webAction: "Open Find A Helpline",
    },
  },
} as const satisfies Record<
  SupportExternalResourceId,
  Record<SupportExternalLocale, SupportExternalLocalizedCopy>
>;

export function getSupportExternalContent(
  id: SupportExternalResourceId,
  locale: SupportExternalLocale,
): SupportExternalLocalizedCopy {
  return supportExternalContent[id][locale];
}
