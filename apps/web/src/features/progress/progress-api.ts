import { apiRequest } from "../auth/client/api.js";
import {
  parseProgressPayload,
  type ProgressView,
} from "./progress-model.js";
import type { ProgressTitleId } from "@soma/shared-types";

let fetchInflight: Promise<ProgressView> | null = null;

/** LIVE only. Preview/DEMO must not call this. */
export function fetchMyProgress(): Promise<ProgressView> {
  if (fetchInflight) return fetchInflight;
  const promise = apiRequest<unknown>("/me/progress")
    .then(parseProgressPayload)
    .finally(() => {
      if (fetchInflight === promise) fetchInflight = null;
    });
  fetchInflight = promise;
  return promise;
}

/** LIVE only. Body is equippedTitleId; the server derives level from XP. */
export function patchEquippedTitle(equippedTitleId: ProgressTitleId): Promise<ProgressView> {
  return apiRequest<unknown>("/me/progress", {
    method: "PATCH",
    body: { equippedTitleId },
  }).then(parseProgressPayload);
}

export function resetProgressClientForTests(): void {
  fetchInflight = null;
}
