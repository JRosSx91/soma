/**
 * External professional-help resources (SUP-01E1-B).
 *
 * Editorial register: `docs/review/support/sup-01e1-a-research.md`.
 * Only IDs in `SUPPORT_PUBLISHED_EXTERNAL_RESOURCE_IDS` may render.
 * Localized copy lives in `support-external-content.ts`.
 */

export const SUPPORT_EXTERNAL_RESOURCE_IDS = [
  "ext.es.112",
  "ext.es.024",
  "ext.es.pnsd.ayuda-cerca",
  "ext.int.iasp.find-a-helpline",
] as const;
export type SupportExternalResourceId = (typeof SUPPORT_EXTERNAL_RESOURCE_IDS)[number];

/** Explicit publication allow-list. Fad/SIOF and regional lines stay out. */
export const SUPPORT_PUBLISHED_EXTERNAL_RESOURCE_IDS = [
  "ext.es.112",
  "ext.es.024",
  "ext.es.pnsd.ayuda-cerca",
  "ext.int.iasp.find-a-helpline",
] as const satisfies readonly SupportExternalResourceId[];

export type SupportPublishedExternalResourceId =
  (typeof SUPPORT_PUBLISHED_EXTERNAL_RESOURCE_IDS)[number];

export type SupportHelpCoverage = "spain" | "other";
export type SupportExternalResourceKind =
  | "emergency"
  | "suicide_helpline"
  | "addiction_directory"
  | "international_directory";

export interface SupportExternalResourceMeta {
  id: SupportExternalResourceId;
  kind: SupportExternalResourceKind;
  /** Geographic applicability of this listing. */
  coverage: readonly SupportHelpCoverage[];
  href: string;
  phone?: string;
  /** ISO date of the last manual editorial check. */
  lastVerified: string;
  verificationSource: string;
}

const publishedSet = new Set<string>(SUPPORT_PUBLISHED_EXTERNAL_RESOURCE_IDS);

export const SUPPORT_EXTERNAL_RESOURCES = {
  "ext.es.112": {
    id: "ext.es.112",
    kind: "emergency",
    coverage: ["spain"],
    href: "https://administracion.gob.es/tu-espacio-europeo/derechos-obligaciones/ciudadanos/asistencia-sanitaria/numeros-urgencia",
    phone: "112",
    lastVerified: "2026-11-12",
    verificationSource:
      "Punto de Acceso General AGE — números de urgencia (administracion.gob.es); número 112 también citado en sanidad.gob.es/linea024.",
  },
  "ext.es.024": {
    id: "ext.es.024",
    kind: "suicide_helpline",
    coverage: ["spain"],
    href: "https://www.sanidad.gob.es/linea024/home.htm",
    phone: "024",
    lastVerified: "2026-11-12",
    verificationSource: "https://www.sanidad.gob.es/linea024/home.htm",
  },
  "ext.es.pnsd.ayuda-cerca": {
    id: "ext.es.pnsd.ayuda-cerca",
    kind: "addiction_directory",
    coverage: ["spain"],
    href: "https://pnsd.sanidad.gob.es/ciudadanos/ayudaCerca/home.htm",
    lastVerified: "2026-11-12",
    verificationSource: "https://pnsd.sanidad.gob.es/ciudadanos/ayudaCerca/home.htm",
  },
  "ext.int.iasp.find-a-helpline": {
    id: "ext.int.iasp.find-a-helpline",
    kind: "international_directory",
    coverage: ["spain", "other"],
    href: "https://findahelpline.com/i/iasp",
    lastVerified: "2026-11-12",
    verificationSource: "https://findahelpline.com/i/iasp ; https://www.iasp.info/crisis-centres-helplines/",
  },
} as const satisfies Record<SupportExternalResourceId, SupportExternalResourceMeta>;

export function isPublishedExternalResourceId(
  value: string,
): value is SupportPublishedExternalResourceId {
  return publishedSet.has(value);
}

export function publishedExternalResourcesForCoverage(
  coverage: SupportHelpCoverage,
): SupportExternalResourceMeta[] {
  return SUPPORT_PUBLISHED_EXTERNAL_RESOURCE_IDS.map((id) => SUPPORT_EXTERNAL_RESOURCES[id]).filter(
    (resource) => (resource.coverage as readonly SupportHelpCoverage[]).includes(coverage),
  );
}

export function emergencyResourcesForCoverage(
  coverage: SupportHelpCoverage,
): SupportExternalResourceMeta[] {
  return publishedExternalResourcesForCoverage(coverage).filter(
    (resource) => resource.kind === "emergency",
  );
}

export function professionalResourcesForCoverage(
  coverage: SupportHelpCoverage,
): SupportExternalResourceMeta[] {
  return publishedExternalResourcesForCoverage(coverage).filter(
    (resource) => resource.kind !== "emergency",
  );
}
