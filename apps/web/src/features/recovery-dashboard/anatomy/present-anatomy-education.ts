import type { TFunction } from "i18next";

export const anatomyEducationCopyFields = [
  "location",
  "anatomy",
  "physiology",
  "relations",
] as const;

export type AnatomyEducationCopyField = (typeof anatomyEducationCopyFields)[number];

export interface AnatomyEducationCopy {
  location: string;
  anatomy: string;
  physiology: string;
  relations: string;
}

function fieldCopy(t: TFunction, key: string): string {
  const value = t(key, { defaultValue: "" });
  if (typeof value !== "string" || value.length === 0 || value === key) return "";
  return value;
}

function educationCopy(t: TFunction, prefix: string): AnatomyEducationCopy | null {
  const location = fieldCopy(t, `${prefix}.location`);
  const anatomy = fieldCopy(t, `${prefix}.anatomy`);
  const physiology = fieldCopy(t, `${prefix}.physiology`);
  const relations = fieldCopy(t, `${prefix}.relations`);
  if (!location || !anatomy || !physiology || !relations) return null;
  return { location, anatomy, physiology, relations };
}

export function anatomyOrganEducationCopy(
  t: TFunction,
  organId: string,
): AnatomyEducationCopy | null {
  return educationCopy(t, `education.organs.${organId}`);
}

export function anatomySystemEducationCopy(
  t: TFunction,
  systemId: string,
): AnatomyEducationCopy | null {
  return educationCopy(t, `education.systems.${systemId}`);
}

const SPANISH_CATALOG_MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

const SPANISH_CATALOG_DATE = `(\\d{1,2}) de (${SPANISH_CATALOG_MONTHS.join("|")}) de (\\d{4})`;

function presentSpanishCatalogDate(
  day: string,
  monthEs: string,
  year: string,
  t: TFunction,
): string {
  const monthKey = `education.citation.months.${monthEs.toLowerCase()}`;
  const month = t(monthKey, { defaultValue: "" });
  if (typeof month !== "string" || month.length === 0 || month === monthKey) {
    return `${day} de ${monthEs} de ${year}`;
  }
  const formatted = t("education.citation.date", { day, month, year });
  if (typeof formatted !== "string" || formatted.includes("education.citation.date")) {
    return `${day} de ${monthEs} de ${year}`;
  }
  return formatted;
}

/**
 * Present catalog citations with localized editorial labels and Spanish
 * catalog dates. Stored citation strings, titles, ids and hrefs stay intact.
 */
export function localizeAnatomyCitation(citation: string, t: TFunction): string {
  const datePattern = SPANISH_CATALOG_DATE;
  return citation
    .replace(
      new RegExp(`Actualización del ${datePattern}`, "g"),
      (_match, day: string, monthEs: string, year: string) =>
        `${t("education.citation.updated")} ${presentSpanishCatalogDate(day, monthEs, year, t)}`,
    )
    .replace(
      new RegExp(`Revisión del ${datePattern}`, "g"),
      (_match, day: string, monthEs: string, year: string) =>
        `${t("education.citation.revision")} ${presentSpanishCatalogDate(day, monthEs, year, t)}`,
    )
    .replace(/\bSección\b/g, () => String(t("education.citation.section")));
}
