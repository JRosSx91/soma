import {
  MISSION_CATEGORY_IDS,
  type MissionCatalogItem,
  type MissionCategoryId,
} from "@soma/shared-types";

export type MissionCategoryFilter = "all" | MissionCategoryId;

export const FUTURE_MISSION_CATEGORY_IDS: readonly MissionCategoryId[] = [
  "substances",
  "orientation",
];

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
} {
  return {
    completed: rows.filter((row) => row.state === "completed").length,
    total: rows.length,
  };
}
