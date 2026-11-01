/**
 * DEMO-only catalog and answer keys. Never used by LIVE fetch/submit.
 * Keys are duplicated here on purpose so the web bundle does not import
 * `apps/api/src/missions/mission-answers.ts`.
 * A correct DEMO answer completes the mission in memory; xpGranted stays 0.
 */

import {
  listPublishedMissions,
  missionUserState,
  type MissionAnswerResponse,
  type MissionCatalogItem,
  type MissionId,
} from "@soma/shared-types";

export const DEMO_MISSION_CORRECT_OPTION_ID = {
  "edu-dopamine-01": "wanting",
  "edu-serotonin-01": "many_systems",
  "edu-gaba-01": "network_brake",
  "edu-receptors-01": "occupancy",
  "edu-tolerance-01": "sensitivity",
  "edu-neuroadaptation-01": "plasticity",
  "edu-dependence-01": "not_disorder",
  "edu-metabolism-01": "not_reset",
  "edu-glutamate-01": "favours_transmission",
  "edu-norepinephrine-01": "not_blood_map",
  "edu-acetylcholine-01": "mimic_some",
  "edu-adenosine-01": "antagonist",
  "edu-endorphin-01": "own_peptides",
  "edu-endocannabinoid-01": "not_the_ligands",
} as const satisfies Record<
  Exclude<MissionId, "edu-unpublished-01">,
  string
>;

export function buildDemoMissions(
  completedIds: ReadonlySet<string>,
  now = new Date(),
): MissionCatalogItem[] {
  const completedAt = now.toISOString();
  return listPublishedMissions().map((mission) => {
    const done = completedIds.has(mission.id);
    return {
      id: mission.id,
      categoryId: mission.categoryId,
      type: mission.type,
      sortOrder: mission.sortOrder,
      contentVersion: mission.contentVersion,
      sheetId: mission.sheetId,
      options: mission.options,
      titleKey: mission.titleKey,
      summaryKey: mission.summaryKey,
      goalKey: mission.goalKey,
      promptKey: mission.promptKey,
      explainKey: mission.explainKey,
      state: missionUserState(done),
      completedAt: done ? completedAt : null,
    };
  });
}

export function evaluateDemoAnswer(
  missionId: string,
  optionId: string,
  alreadyCompleted: boolean,
): MissionAnswerResponse {
  const catalog = listPublishedMissions();
  const mission = catalog.find((row) => row.id === missionId);
  if (!mission) {
    throw new Error("Mission not found");
  }
  if (!mission.options.some((option) => option.id === optionId)) {
    throw new Error("Unknown option");
  }
  const correct =
    mission.id in DEMO_MISSION_CORRECT_OPTION_ID &&
    DEMO_MISSION_CORRECT_OPTION_ID[mission.id as keyof typeof DEMO_MISSION_CORRECT_OPTION_ID] ===
      optionId;
  if (alreadyCompleted) {
    return {
      correct,
      completed: true,
      alreadyCompleted: true,
      xpGranted: 0,
      explainKey: mission.explainKey,
    };
  }
  if (!correct) {
    return {
      correct: false,
      completed: false,
      alreadyCompleted: false,
      xpGranted: 0,
      explainKey: mission.explainKey,
    };
  }
  return {
    correct: true,
    completed: true,
    alreadyCompleted: false,
    xpGranted: 0,
    explainKey: mission.explainKey,
  };
}
