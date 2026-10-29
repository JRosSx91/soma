import { listPublishedMissions } from "@soma/shared-types";
import {
  exploreEduSheetForOrgan,
  exploreEduSheetForSystem,
} from "../explore/explore-edu-anatomy.ts";
import {
  isPublishedExploreEduSheet,
  type ExploreEduSheetId,
} from "../explore/explore-edu.ts";
import type { AtlasSystem } from "./atlas-types.ts";
import { educationalEffectsSubstances } from "./neurotransmitter-education.ts";
import { recoverySubstances } from "./recovery-catalog.ts";

/**
 * Related educational destinations for an atlas system.
 * Uses explicit explore↔atlas maps, catalog substance indexes, and published
 * missions whose sheetId already matches those articles. Does not infer new
 * associations or invent counts.
 */

export type AtlasRelatedArticle = { sheetId: ExploreEduSheetId };
export type AtlasRelatedSubstance = { id: string; organId: string };
export type AtlasRelatedMission = { id: string; sheetId: string; titleKey: string };

export function relatedArticlesForSystem(system: AtlasSystem): AtlasRelatedArticle[] {
  const seen = new Set<ExploreEduSheetId>();
  const articles: AtlasRelatedArticle[] = [];

  function add(sheetId: string | null) {
    if (!sheetId || !isPublishedExploreEduSheet(sheetId) || seen.has(sheetId)) return;
    seen.add(sheetId);
    articles.push({ sheetId });
  }

  add(exploreEduSheetForSystem(system.id));
  for (const organ of system.organs) {
    add(exploreEduSheetForOrgan(organ.id));
  }
  return articles;
}

export function relatedSubstancesForSystem(system: AtlasSystem): AtlasRelatedSubstance[] {
  const seen = new Set<string>();
  const substances: AtlasRelatedSubstance[] = [];
  for (const organ of system.organs) {
    for (const id of [...educationalEffectsSubstances(organ.id), ...recoverySubstances(organ.id)]) {
      if (seen.has(id)) continue;
      seen.add(id);
      substances.push({ id, organId: organ.id });
    }
  }
  return substances;
}

export function relatedMissionsForSystem(system: AtlasSystem): AtlasRelatedMission[] {
  const sheetIds = new Set(relatedArticlesForSystem(system).map((article) => article.sheetId));
  return listPublishedMissions()
    .filter((mission) => isPublishedExploreEduSheet(mission.sheetId) && sheetIds.has(mission.sheetId))
    .map((mission) => ({
      id: mission.id,
      sheetId: mission.sheetId,
      titleKey: mission.titleKey,
    }));
}

export function relatedContentForSystem(system: AtlasSystem): {
  articles: AtlasRelatedArticle[];
  substances: AtlasRelatedSubstance[];
  missions: AtlasRelatedMission[];
} {
  return {
    articles: relatedArticlesForSystem(system),
    substances: relatedSubstancesForSystem(system),
    missions: relatedMissionsForSystem(system),
  };
}
