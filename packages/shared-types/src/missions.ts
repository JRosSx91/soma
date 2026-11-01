/**
 * GAM-02B: educational mission contracts and the public catalog.
 * No Prisma, HTTP, React, or answer keys. The client must not award XP or
 * decide correctness — that belongs to a later server milestone.
 *
 * XP uses the existing `mission_complete` source (12). The GAM-01 curve is
 * unchanged. Educational content is not gated by level.
 *
 * `substances` and `orientation` are reserved categories with no missions yet.
 * Correct option ids live in `@soma/api` (`missions/mission-answers.ts`) and
 * must not appear in this package.
 */

import { PROGRESS_XP_AMOUNT } from "./progress.js";

export const MISSION_XP_SOURCE = "mission_complete" as const;
export const MISSION_XP_AMOUNT = PROGRESS_XP_AMOUNT.mission_complete;

export const MISSION_CATEGORY_IDS = [
  "neurotransmitters",
  "processes",
  "substances",
  "orientation",
] as const;

export type MissionCategoryId = (typeof MISSION_CATEGORY_IDS)[number];

export const MISSION_TYPES = ["reading_check"] as const;
export type MissionType = (typeof MISSION_TYPES)[number];

export const MISSION_PUBLICATION_STATES = ["draft", "published"] as const;
export type MissionPublicationState = (typeof MISSION_PUBLICATION_STATES)[number];

export const MISSION_USER_STATES = ["available", "completed"] as const;
export type MissionUserState = (typeof MISSION_USER_STATES)[number];

/**
 * Published Explore educational sheets that a mission may reference.
 * Keep in lockstep with `publishedExploreEduSheets` in the web app.
 */
export const MISSION_EXPLORE_SHEET_IDS = [
  "dopamine",
  "serotonin",
  "gaba",
  "glutamate",
  "norepinephrine",
  "acetylcholine",
  "endocannabinoid",
  "endorphin",
  "adenosine",
  "receptors",
  "tolerance",
  "dependence",
  "neuroadaptation",
  "metabolism",
] as const;

export type MissionExploreSheetId = (typeof MISSION_EXPLORE_SHEET_IDS)[number];

export const MISSION_IDS = [
  "edu-dopamine-01",
  "edu-serotonin-01",
  "edu-gaba-01",
  "edu-receptors-01",
  "edu-tolerance-01",
  "edu-neuroadaptation-01",
  "edu-dependence-01",
  "edu-metabolism-01",
  "edu-glutamate-01",
  "edu-norepinephrine-01",
  "edu-acetylcholine-01",
  "edu-adenosine-01",
  "edu-endorphin-01",
  "edu-endocannabinoid-01",
  "edu-unpublished-01",
] as const;

export type MissionId = (typeof MISSION_IDS)[number];

export interface MissionOption {
  readonly id: string;
}

/**
 * Public catalog row. Copy lives in i18n (`missions` namespace).
 * No correct option, no level gate, no streaks, no countdowns.
 */
export interface MissionDefinition {
  readonly id: MissionId;
  readonly categoryId: MissionCategoryId;
  readonly type: MissionType;
  readonly sortOrder: number;
  readonly status: MissionPublicationState;
  readonly contentVersion: number;
  readonly sheetId: MissionExploreSheetId;
  readonly options: readonly MissionOption[];
  readonly titleKey: string;
  readonly summaryKey: string;
  readonly goalKey: string;
  readonly promptKey: string;
  readonly explainKey: string;
}

export interface MissionUserProgress {
  readonly missionId: MissionId;
  readonly state: MissionUserState;
  readonly completedAt: string | null;
  readonly contentVersion: number | null;
}

/**
 * Verdict of a reading-check attempt before persistence.
 * Unknown mission/option is a rejection (future HTTP 400).
 * A known wrong option is `ok: true` with `correct: false`.
 * This type does not grant XP or record completion.
 */
export type MissionReadingCheckRejection = "unknown_mission" | "unknown_option";

/** Submit-layer rejections, including draft catalog rows. Future HTTP 400. */
export type MissionSubmitRejection =
  | MissionReadingCheckRejection
  | "unpublished_mission";

export type MissionReadingCheckEvaluation =
  | {
      readonly ok: true;
      readonly missionId: MissionId;
      readonly selectedOptionId: string;
      readonly correct: boolean;
    }
  | {
      readonly ok: false;
      readonly reason: MissionReadingCheckRejection;
    };

/**
 * Public outcome after persistence (GAM-02C): whether the attempt was
 * correct, whether the mission is complete, whether it already was, and
 * how much XP this attempt actually granted via `mission_complete`.
 * Evaluation of the option does not fill these fields.
 */
export interface MissionAnswerResult {
  readonly correct: boolean;
  readonly completed: boolean;
  readonly alreadyCompleted: boolean;
  readonly xpGranted: number;
}

/** Authenticated catalog item: published mission plus this user's state. */
export interface MissionCatalogItem {
  readonly id: MissionId;
  readonly categoryId: MissionCategoryId;
  readonly type: MissionType;
  readonly sortOrder: number;
  readonly contentVersion: number;
  readonly sheetId: MissionExploreSheetId;
  readonly options: readonly MissionOption[];
  readonly titleKey: string;
  readonly summaryKey: string;
  readonly goalKey: string;
  readonly promptKey: string;
  readonly explainKey: string;
  readonly state: MissionUserState;
  readonly completedAt: string | null;
}

export interface MissionCatalogResponse {
  readonly missions: readonly MissionCatalogItem[];
}

/** Answer outcome for the client, including the public explanation key. */
export interface MissionAnswerResponse extends MissionAnswerResult {
  readonly explainKey: string;
}

function option(id: string): MissionOption {
  return { id };
}

function keys(id: MissionId) {
  const base = `missions.items.${id}`;
  return {
    titleKey: `${base}.title`,
    summaryKey: `${base}.summary`,
    goalKey: `${base}.goal`,
    promptKey: `${base}.prompt`,
    explainKey: `${base}.explain`,
  } as const;
}

export const MISSION_CATALOG: readonly MissionDefinition[] = [
  {
    id: "edu-dopamine-01",
    categoryId: "neurotransmitters",
    type: "reading_check",
    sortOrder: 10,
    status: "published",
    contentVersion: 1,
    sheetId: "dopamine",
    options: [option("wanting"), option("pleasure"), option("meter")],
    ...keys("edu-dopamine-01"),
  },
  {
    id: "edu-serotonin-01",
    categoryId: "neurotransmitters",
    type: "reading_check",
    sortOrder: 20,
    status: "published",
    contentVersion: 1,
    sheetId: "serotonin",
    options: [option("many_systems"), option("blood_equals_brain"), option("happiness_tank")],
    ...keys("edu-serotonin-01"),
  },
  {
    id: "edu-gaba-01",
    categoryId: "neurotransmitters",
    type: "reading_check",
    sortOrder: 30,
    status: "published",
    contentVersion: 1,
    sheetId: "gaba",
    options: [option("brain_off"), option("network_brake"), option("alcohol_is_gaba")],
    ...keys("edu-gaba-01"),
  },
  {
    id: "edu-receptors-01",
    categoryId: "processes",
    type: "reading_check",
    sortOrder: 40,
    status: "published",
    contentVersion: 1,
    sheetId: "receptors",
    options: [option("same_name"), option("occupancy"), option("cocaine_is_key")],
    ...keys("edu-receptors-01"),
  },
  {
    id: "edu-tolerance-01",
    categoryId: "processes",
    type: "reading_check",
    sortOrder: 50,
    status: "published",
    contentVersion: 1,
    sheetId: "tolerance",
    options: [option("equals_addiction"), option("empty_tank"), option("sensitivity")],
    ...keys("edu-tolerance-01"),
  },
  {
    id: "edu-neuroadaptation-01",
    categoryId: "processes",
    type: "reading_check",
    sortOrder: 60,
    status: "published",
    contentVersion: 1,
    sheetId: "neuroadaptation",
    options: [option("cell_death"), option("fixed_calendar"), option("plasticity")],
    ...keys("edu-neuroadaptation-01"),
  },
  {
    id: "edu-dependence-01",
    categoryId: "processes",
    type: "reading_check",
    sortOrder: 70,
    status: "published",
    contentVersion: 1,
    sheetId: "dependence",
    options: [option("not_disorder"), option("same_as_addiction"), option("soma_meter")],
    ...keys("edu-dependence-01"),
  },
  {
    id: "edu-metabolism-01",
    categoryId: "processes",
    type: "reading_check",
    sortOrder: 80,
    status: "published",
    contentVersion: 1,
    sheetId: "metabolism",
    options: [option("half_life_is_effect"), option("not_reset"), option("soma_hours")],
    ...keys("edu-metabolism-01"),
  },
  {
    id: "edu-glutamate-01",
    categoryId: "neurotransmitters",
    type: "reading_check",
    sortOrder: 90,
    status: "published",
    contentVersion: 1,
    sheetId: "glutamate",
    options: [option("poison"), option("one_drink"), option("favours_transmission")],
    ...keys("edu-glutamate-01"),
  },
  {
    id: "edu-norepinephrine-01",
    categoryId: "neurotransmitters",
    type: "reading_check",
    sortOrder: 100,
    status: "published",
    contentVersion: 1,
    sheetId: "norepinephrine",
    options: [option("not_blood_map"), option("urine_is_focus"), option("same_as_dopamine")],
    ...keys("edu-norepinephrine-01"),
  },
  {
    id: "edu-acetylcholine-01",
    categoryId: "neurotransmitters",
    type: "reading_check",
    sortOrder: 110,
    status: "published",
    contentVersion: 1,
    sheetId: "acetylcholine",
    options: [option("is_the_messenger"), option("mimic_some"), option("raises_store")],
    ...keys("edu-acetylcholine-01"),
  },
  {
    id: "edu-adenosine-01",
    categoryId: "neurotransmitters",
    type: "reading_check",
    sortOrder: 120,
    status: "published",
    contentVersion: 1,
    sheetId: "adenosine",
    options: [option("empties_tank"), option("blocks_dat"), option("antagonist")],
    ...keys("edu-adenosine-01"),
  },
  {
    id: "edu-endorphin-01",
    categoryId: "neurotransmitters",
    type: "reading_check",
    sortOrder: 130,
    status: "published",
    contentVersion: 1,
    sheetId: "endorphin",
    options: [option("own_peptides"), option("are_morphine"), option("runner_meter")],
    ...keys("edu-endorphin-01"),
  },
  {
    id: "edu-endocannabinoid-01",
    categoryId: "neurotransmitters",
    type: "reading_check",
    sortOrder: 140,
    status: "published",
    contentVersion: 1,
    sheetId: "endocannabinoid",
    options: [option("body_cannabis"), option("not_the_ligands"), option("makes_anandamide")],
    ...keys("edu-endocannabinoid-01"),
  },
  {
    id: "edu-unpublished-01",
    categoryId: "neurotransmitters",
    type: "reading_check",
    sortOrder: 999,
    status: "draft",
    contentVersion: 1,
    sheetId: "dopamine",
    options: [option("wanting"), option("pleasure"), option("meter")],
    ...keys("edu-unpublished-01"),
  },
];

export function isMissionCategoryId(value: string): value is MissionCategoryId {
  return (MISSION_CATEGORY_IDS as readonly string[]).includes(value);
}

export function isMissionType(value: string): value is MissionType {
  return (MISSION_TYPES as readonly string[]).includes(value);
}

export function isMissionPublicationState(value: string): value is MissionPublicationState {
  return (MISSION_PUBLICATION_STATES as readonly string[]).includes(value);
}

export function isMissionUserState(value: string): value is MissionUserState {
  return (MISSION_USER_STATES as readonly string[]).includes(value);
}

export function isMissionExploreSheetId(value: string): value is MissionExploreSheetId {
  return (MISSION_EXPLORE_SHEET_IDS as readonly string[]).includes(value);
}

export function isMissionId(value: string): value is MissionId {
  return (MISSION_IDS as readonly string[]).includes(value);
}

export function missionUserState(completed: boolean): MissionUserState {
  return completed ? "completed" : "available";
}

export function getMissionById(id: string): MissionDefinition | undefined {
  return MISSION_CATALOG.find((row) => row.id === id);
}

export function isMissionOptionId(mission: MissionDefinition, optionId: string): boolean {
  return mission.options.some((row) => row.id === optionId);
}

export function listPublishedMissions(): readonly MissionDefinition[] {
  return MISSION_CATALOG.filter((row) => row.status === "published").slice().sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.id.localeCompare(b.id);
  });
}

export function listMissionsByCategory(
  categoryId: MissionCategoryId,
): readonly MissionDefinition[] {
  return listPublishedMissions().filter((row) => row.categoryId === categoryId);
}

export function optionLabelKey(missionId: MissionId, optionId: string): string {
  return `missions.items.${missionId}.options.${optionId}`;
}
