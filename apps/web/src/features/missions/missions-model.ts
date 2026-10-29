import {
  isMissionCategoryId,
  isMissionExploreSheetId,
  isMissionId,
  isMissionType,
  isMissionUserState,
  type MissionAnswerResponse,
  type MissionCatalogItem,
  type MissionCatalogResponse,
  type MissionOption,
} from "@soma/shared-types";

function isOption(value: unknown): value is MissionOption {
  return (
    value != null &&
    typeof value === "object" &&
    typeof (value as MissionOption).id === "string" &&
    (value as MissionOption).id.length > 0
  );
}

function isCatalogItem(value: unknown): value is MissionCatalogItem {
  if (value == null || typeof value !== "object") return false;
  const row = value as MissionCatalogItem;
  return (
    isMissionId(row.id) &&
    isMissionCategoryId(row.categoryId) &&
    isMissionType(row.type) &&
    Number.isInteger(row.sortOrder) &&
    Number.isInteger(row.contentVersion) &&
    row.contentVersion >= 1 &&
    isMissionExploreSheetId(row.sheetId) &&
    Array.isArray(row.options) &&
    row.options.every(isOption) &&
    typeof row.titleKey === "string" &&
    typeof row.summaryKey === "string" &&
    typeof row.goalKey === "string" &&
    typeof row.promptKey === "string" &&
    typeof row.explainKey === "string" &&
    isMissionUserState(row.state) &&
    (row.completedAt === null || typeof row.completedAt === "string") &&
    !("correctOptionId" in row)
  );
}

export function parseMissionCatalog(raw: unknown): MissionCatalogResponse {
  if (raw == null || typeof raw !== "object" || !("missions" in raw)) {
    throw new Error("Invalid missions payload");
  }
  const missions = (raw as { missions: unknown }).missions;
  if (!Array.isArray(missions) || !missions.every(isCatalogItem)) {
    throw new Error("Invalid missions payload");
  }
  return { missions };
}

export function parseMissionAnswer(raw: unknown): MissionAnswerResponse {
  if (raw == null || typeof raw !== "object") {
    throw new Error("Invalid mission answer payload");
  }
  const row = raw as MissionAnswerResponse;
  if (
    typeof row.correct !== "boolean" ||
    typeof row.completed !== "boolean" ||
    typeof row.alreadyCompleted !== "boolean" ||
    typeof row.xpGranted !== "number" ||
    !Number.isInteger(row.xpGranted) ||
    row.xpGranted < 0 ||
    typeof row.explainKey !== "string"
  ) {
    throw new Error("Invalid mission answer payload");
  }
  if ("correctOptionId" in row) {
    throw new Error("Invalid mission answer payload");
  }
  return {
    correct: row.correct,
    completed: row.completed,
    alreadyCompleted: row.alreadyCompleted,
    xpGranted: row.xpGranted,
    explainKey: row.explainKey,
  };
}

export function applyAnswerToCatalog(
  missions: readonly MissionCatalogItem[],
  missionId: string,
  result: MissionAnswerResponse,
  completedAt: string,
): MissionCatalogItem[] {
  if (!result.completed) return [...missions];
  return missions.map((row) =>
    row.id === missionId
      ? {
          ...row,
          state: "completed",
          completedAt: row.completedAt ?? completedAt,
        }
      : row,
  );
}

export function shouldBlockMissionSubmit(
  pendingMissionIds: ReadonlySet<string>,
  missionId: string,
): boolean {
  return pendingMissionIds.has(missionId);
}
