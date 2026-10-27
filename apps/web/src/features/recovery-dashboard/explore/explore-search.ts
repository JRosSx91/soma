/**
 * Accent-tolerant catalog search for Explorar.
 * Presentation only: does not change catalog identity.
 */

export function foldSearchText(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

export function searchHaystackIncludes(haystack: string, query: string): boolean {
  const needle = foldSearchText(query.trim());
  if (!needle) return true;
  return foldSearchText(haystack).includes(needle);
}

/** Prefer a translated label; never surface a missing-key path or raw id. */
export function localizedCatalogLabel(
  translated: string | undefined,
  fallback: string,
  identity: string,
): string {
  if (
    translated == null ||
    translated === "" ||
    translated === identity ||
    translated.endsWith(`.${identity}`) ||
    translated === `${identity}.name` ||
    translated === `${identity}.shortDescription`
  ) {
    return fallback;
  }
  return translated;
}

export function substanceSearchHaystack(input: {
  localizedName: string;
  localizedDescription: string;
  catalogName: string;
  catalogDescription: string;
  category: string;
  categoryLabel: string;
}): string {
  return [
    input.localizedName,
    input.localizedDescription,
    input.catalogName,
    input.catalogDescription,
    input.category,
    input.categoryLabel,
  ].join(" ");
}

export function systemSearchHaystack(input: {
  localizedName: string;
  catalogName: string;
  organLabels: readonly string[];
}): string {
  return [input.localizedName, input.catalogName, ...input.organLabels].join(" ");
}

export function neurotransmitterSearchHaystack(input: {
  id: string;
  localizedName: string;
  localizedDescription: string;
  catalogName: string;
  catalogDescription: string;
  relatedLabels: readonly string[];
}): string {
  return [
    input.id,
    input.localizedName,
    input.localizedDescription,
    input.catalogName,
    input.catalogDescription,
    ...input.relatedLabels,
  ].join(" ");
}
