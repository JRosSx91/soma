import { apiRequest } from "../auth/client/api.js";
import {
  parseMissionAnswer,
  parseMissionCatalog,
} from "./missions-model.js";
import type { MissionAnswerResponse, MissionCatalogResponse } from "@soma/shared-types";

let fetchInflight: Promise<MissionCatalogResponse> | null = null;

/** LIVE only. Preview/DEMO must not call this. */
export function fetchMyMissions(): Promise<MissionCatalogResponse> {
  if (fetchInflight) return fetchInflight;
  const promise = apiRequest<unknown>("/me/missions")
    .then(parseMissionCatalog)
    .finally(() => {
      if (fetchInflight === promise) fetchInflight = null;
    });
  fetchInflight = promise;
  return promise;
}

/** LIVE only. Body is optionId; the server evaluates and awards XP. */
export function postMissionAnswer(
  missionId: string,
  optionId: string,
): Promise<MissionAnswerResponse> {
  return apiRequest<unknown>(`/me/missions/${missionId}/answer`, {
    method: "POST",
    body: { optionId },
  }).then(parseMissionAnswer);
}

export function resetMissionsClientForTests(): void {
  fetchInflight = null;
}
