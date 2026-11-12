import type { ShellBase } from "../shell-base.js";
import { exploreEduHref } from "../explore/explore-edu-query.js";
import type { ExploreEduSheetId } from "../explore/explore-edu.js";

/**
 * Support page content map. Resource groups only link to Explore articles
 * that are already published; titles come from `explore-edu`, never
 * rewritten here. Tools, the audio group and strategy topics have no content
 * yet and must render as unavailable, never as actions.
 */
export const SUPPORT_TOOLS = ["breathing", "mindfulness", "movement", "craving"] as const;
export type SupportTool = (typeof SUPPORT_TOOLS)[number];

/** The only tool with an approved spec (SUP-01C); the rest are planned. */
export const SUPPORT_TOOL_IN_PREPARATION: SupportTool = "breathing";

export const SUPPORT_RESOURCE_GROUPS = [
  { id: "processes", sheets: ["dependence", "tolerance", "neuroadaptation"] },
  { id: "reading", sheets: ["dopamine", "serotonin", "gaba"] },
  { id: "audio", sheets: [] },
] as const satisfies readonly { id: string; sheets: readonly ExploreEduSheetId[] }[];
export type SupportResourceGroupId = (typeof SUPPORT_RESOURCE_GROUPS)[number]["id"];

export const SUPPORT_LEARN_SHEETS = SUPPORT_RESOURCE_GROUPS.flatMap(
  (group): readonly ExploreEduSheetId[] => group.sheets,
);

export const SUPPORT_STRATEGY_TOPICS = ["emotions", "relapse", "stress", "habits"] as const;
export type SupportStrategyTopic = (typeof SUPPORT_STRATEGY_TOPICS)[number];

export interface SupportLearnLink {
  id: ExploreEduSheetId;
  href: string;
  titleKey: `explore-edu:sheets.${ExploreEduSheetId}.sections.what.title`;
}

export interface SupportResourceGroup {
  id: SupportResourceGroupId;
  links: SupportLearnLink[];
}

/** Published «Situaciones que requieren ayuda profesional» section of the terms. */
export const SUPPORT_TERMS_EMERGENCY_HREF = "/terms#terms-emergency";

export function supportLearnLinks(
  base: ShellBase,
  sheets: readonly ExploreEduSheetId[] = SUPPORT_LEARN_SHEETS,
): SupportLearnLink[] {
  return sheets.flatMap((id) => {
    const href = exploreEduHref(base, id);
    if (!href) return [];
    return [{ id, href, titleKey: `explore-edu:sheets.${id}.sections.what.title` as const }];
  });
}

export function supportResourceGroups(base: ShellBase): SupportResourceGroup[] {
  return SUPPORT_RESOURCE_GROUPS.map((group) => ({
    id: group.id,
    links: supportLearnLinks(base, group.sheets),
  }));
}

export function supportExploreHref(base: ShellBase): string {
  return `${base}/explore`;
}
