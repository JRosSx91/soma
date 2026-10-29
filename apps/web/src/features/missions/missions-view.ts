import {
  MISSION_CATEGORY_IDS,
  type MissionCatalogItem,
  type MissionCategoryId,
  type MissionExploreSheetId,
} from "@soma/shared-types";
import {
  exploreNeurotransmitterArt,
  exploreProcessArt,
} from "../recovery-dashboard/explore/explore-art.js";

export type MissionCategoryFilter = "all" | MissionCategoryId;
export type MissionCatalogFilter = MissionCategoryFilter | "completed";
export type MissionSortMode = "catalog" | "title" | "completed";

export const FUTURE_MISSION_CATEGORY_IDS: readonly MissionCategoryId[] = [
  "substances",
  "orientation",
];

export const FEATURED_MISSION_LIMIT = 4;

export function missionCopyPath(key: string): string {
  return key.startsWith("missions.") ? key.slice("missions.".length) : key;
}

export function sortMissions(
  rows: readonly MissionCatalogItem[],
): MissionCatalogItem[] {
  return [...rows].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id),
  );
}

export function filterMissionsByCategory(
  rows: readonly MissionCatalogItem[],
  category: MissionCategoryFilter,
): MissionCatalogItem[] {
  const sorted = sortMissions(rows);
  if (category === "all") return sorted;
  return sorted.filter((row) => row.categoryId === category);
}

export function filterMissionCatalog(
  rows: readonly MissionCatalogItem[],
  filter: MissionCatalogFilter,
): MissionCatalogItem[] {
  if (filter === "completed") {
    return sortMissions(rows).filter((row) => row.state === "completed");
  }
  return filterMissionsByCategory(rows, filter);
}

export function searchMissions(
  rows: readonly MissionCatalogItem[],
  query: string,
  haystack: (row: MissionCatalogItem) => string,
): MissionCatalogItem[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [...rows];
  return rows.filter((row) => haystack(row).toLowerCase().includes(needle));
}

export function sortMissionCatalog(
  rows: readonly MissionCatalogItem[],
  mode: MissionSortMode,
  titleOf: (row: MissionCatalogItem) => string,
): MissionCatalogItem[] {
  if (mode === "title") {
    return [...rows].sort(
      (a, b) => titleOf(a).localeCompare(titleOf(b), undefined, { sensitivity: "base" }) || a.id.localeCompare(b.id),
    );
  }
  if (mode === "completed") {
    return [...rows].sort((a, b) => {
      if (a.state === b.state) return a.sortOrder - b.sortOrder || a.id.localeCompare(b.id);
      return a.state === "completed" ? -1 : 1;
    });
  }
  return sortMissions(rows);
}

export function pickFeaturedMissions(
  rows: readonly MissionCatalogItem[],
  limit = FEATURED_MISSION_LIMIT,
): MissionCatalogItem[] {
  const sorted = sortMissions(rows);
  const available = sorted.filter((row) => row.state !== "completed");
  const completed = sorted.filter((row) => row.state === "completed");
  return [...available, ...completed].slice(0, limit);
}

export function groupMissionsByCategory(
  rows: readonly MissionCatalogItem[],
): { categoryId: MissionCategoryId; missions: MissionCatalogItem[] }[] {
  const sorted = sortMissions(rows);
  return MISSION_CATEGORY_IDS.map((categoryId) => ({
    categoryId,
    missions: sorted.filter((row) => row.categoryId === categoryId),
  }));
}

export function countCompletedMissions(rows: readonly MissionCatalogItem[]): {
  completed: number;
  total: number;
  available: number;
  percent: number;
  discoverable: number;
} {
  const completed = rows.filter((row) => row.state === "completed").length;
  const total = rows.length;
  return {
    completed,
    total,
    available: total - completed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    discoverable: FUTURE_MISSION_CATEGORY_IDS.length,
  };
}

export function categoryProgress(
  rows: readonly MissionCatalogItem[],
  categoryId: MissionCategoryId,
): { completed: number; total: number; percent: number; upcoming: boolean } {
  const group = rows.filter((row) => row.categoryId === categoryId);
  const total = group.length;
  const completed = group.filter((row) => row.state === "completed").length;
  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    upcoming: total === 0,
  };
}

export function missionIllustrationSrc(sheetId: MissionExploreSheetId | string): string | null {
  if (sheetId in exploreNeurotransmitterArt) {
    return exploreNeurotransmitterArt[sheetId as keyof typeof exploreNeurotransmitterArt];
  }
  if (sheetId in exploreProcessArt) {
    return exploreProcessArt[sheetId as keyof typeof exploreProcessArt];
  }
  return null;
}

/** Portrait process plates (~3:4). Landscape neurotransmitter plates fill a wide frame with contain. */
export function missionArtNeedsFrame(sheetId: MissionExploreSheetId | string): boolean {
  return sheetId === "receptors" || sheetId === "tolerance" || sheetId === "neuroadaptation";
}
