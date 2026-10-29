/**
 * Pure reading-check evaluation. Does not persist, award XP, or inspect
 * whether the user already completed the mission (GAM-02C).
 */

import {
  getMissionById,
  isMissionOptionId,
  type MissionReadingCheckEvaluation,
} from "@soma/shared-types";
import { MISSION_CORRECT_OPTION_ID } from "./mission-answers.js";

export function evaluateReadingCheckAnswer(input: {
  missionId: string;
  selectedOptionId: string;
}): MissionReadingCheckEvaluation {
  const mission = getMissionById(input.missionId);
  if (!mission) {
    return { ok: false, reason: "unknown_mission" };
  }
  if (!isMissionOptionId(mission, input.selectedOptionId)) {
    return { ok: false, reason: "unknown_option" };
  }

  return {
    ok: true,
    missionId: mission.id,
    selectedOptionId: input.selectedOptionId,
    correct: MISSION_CORRECT_OPTION_ID[mission.id] === input.selectedOptionId,
  };
}
