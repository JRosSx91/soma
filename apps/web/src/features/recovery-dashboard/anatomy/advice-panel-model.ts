import type { SubstanceId } from "@soma/shared-types";
import {
  partitionAdviceSurfaces,
  publishedAdviceCatalog,
  publishedAdviceSubstanceIds,
  resolveEducationalAdvice,
  resolvePersistentSafetyAdvice,
  type AdviceCategory,
  type AdviceOrganQuery,
  type EducationalAdviceItem,
} from "./advice-catalog.ts";

/**
 * Pure view-model for the atlas Consejos tab.
 * Uses only public resolvers. Does not import the editorial sidecar.
 */

export const adviceContextualCategoryOrder = ["safety", "seek_help", "self_care"] as const satisfies readonly AdviceCategory[];

export type AdvicePanelEmptyReason =
  | "catalog_empty"
  | "no_substance"
  | "no_published_for_selection";

export interface AdviceCategoryGroup {
  category: AdviceCategory;
  items: readonly EducationalAdviceItem[];
}

export interface AdvicePanelModel {
  substanceOptions: readonly SubstanceId[];
  showSelectors: boolean;
  selectedSubstanceInCatalog: boolean;
  persistent: readonly EducationalAdviceItem[];
  contextualGroups: readonly AdviceCategoryGroup[];
  empty: boolean;
  emptyReason: AdvicePanelEmptyReason | null;
}

export function buildAdvicePanelModel(
  organId: AdviceOrganQuery,
  substanceId: string | null | undefined,
  phase: string,
  catalog: readonly EducationalAdviceItem[] = publishedAdviceCatalog,
): AdvicePanelModel {
  const substanceOptions = publishedAdviceSubstanceIds(catalog);
  const showSelectors = substanceOptions.length > 0;
  const selected = typeof substanceId === "string" ? substanceId.trim() : "";
  const selectedSubstanceInCatalog =
    selected.length > 0 && substanceOptions.includes(selected as SubstanceId);

  if (!showSelectors) {
    return {
      substanceOptions,
      showSelectors: false,
      selectedSubstanceInCatalog: false,
      persistent: [],
      contextualGroups: [],
      empty: true,
      emptyReason: "catalog_empty",
    };
  }

  if (!selected) {
    return {
      substanceOptions,
      showSelectors: true,
      selectedSubstanceInCatalog: false,
      persistent: [],
      contextualGroups: [],
      empty: true,
      emptyReason: "no_substance",
    };
  }

  const persistent = resolvePersistentSafetyAdvice(selected, catalog).items;
  const contextual = resolveEducationalAdvice(organId, selected, phase, catalog).items;
  const partitioned = partitionAdviceSurfaces(persistent, contextual);
  const contextualGroups = groupContextualAdvice(partitioned.contextual);
  const hasItems =
    partitioned.persistent.length > 0 || contextualGroups.some((group) => group.items.length > 0);

  return {
    substanceOptions,
    showSelectors: true,
    selectedSubstanceInCatalog,
    persistent: partitioned.persistent,
    contextualGroups,
    empty: !hasItems,
    emptyReason: hasItems ? null : "no_published_for_selection",
  };
}

function groupContextualAdvice(
  items: readonly EducationalAdviceItem[],
): AdviceCategoryGroup[] {
  return adviceContextualCategoryOrder
    .map((category) => ({
      category,
      items: items.filter((item) => item.category === category),
    }))
    .filter((group) => group.items.length > 0);
}
