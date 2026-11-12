import type { ShellBase } from "../shell-base.js";
import { exploreEduHref } from "../explore/explore-edu-query.js";
import type { ExploreEduSheetId } from "../explore/explore-edu.js";

/**
 * SUP-01B: «Comprender lo que pasa» only links to Explore articles that are
 * already published. Titles come from `explore-edu`, never rewritten here.
 */
export const SUPPORT_LEARN_SHEETS = [
  "dependence",
  "tolerance",
  "neuroadaptation",
  "dopamine",
] as const satisfies readonly ExploreEduSheetId[];

export type SupportLearnSheet = (typeof SUPPORT_LEARN_SHEETS)[number];

export interface SupportLearnLink {
  id: SupportLearnSheet;
  href: string;
  titleKey: `explore-edu:sheets.${SupportLearnSheet}.sections.what.title`;
}

/** Published «Situaciones que requieren ayuda profesional» section of the terms. */
export const SUPPORT_TERMS_EMERGENCY_HREF = "/terms#terms-emergency";

export function supportLearnLinks(base: ShellBase): SupportLearnLink[] {
  return SUPPORT_LEARN_SHEETS.flatMap((id) => {
    const href = exploreEduHref(base, id);
    if (!href) return [];
    return [{ id, href, titleKey: `explore-edu:sheets.${id}.sections.what.title` as const }];
  });
}

export function supportExploreHref(base: ShellBase): string {
  return `${base}/explore`;
}
