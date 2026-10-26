import { apiRequest } from "../../auth/client/api.js";
import type { AchievementWithUnlockState } from "../types.js";

let fetchInflight: {
  userId: string | null;
  promise: Promise<AchievementWithUnlockState[]>;
} | null = null;

export function fetchAchievements(
  userId: string | null = null,
  options: { force?: boolean } = {},
): Promise<AchievementWithUnlockState[]> {
  if (!options.force && fetchInflight && fetchInflight.userId === userId) {
    return fetchInflight.promise;
  }

  const promise = apiRequest<AchievementWithUnlockState[]>(
    "/me/achievements",
  ).finally(() => {
    if (fetchInflight?.promise === promise) fetchInflight = null;
  });
  fetchInflight = { userId, promise };
  return promise;
}

export function markAchievementsAsNotified(
  achievementIds: string[],
): Promise<{ updated: number }> {
  return apiRequest<{ updated: number }>("/me/achievements/mark-notified", {
    method: "POST",
    body: { achievementIds },
  });
}

export function markAchievementsInboxRead(
  achievementIds: string[],
): Promise<{ updated: number; readIds: string[] }> {
  return apiRequest<{ updated: number; readIds: string[] }>(
    "/me/achievements/inbox-read",
    {
      method: "POST",
      body: { achievementIds },
    },
  );
}

export function markAchievementsCelebrated(
  achievementIds: string[],
): Promise<{ celebratedIds: string[] }> {
  return apiRequest<{ celebratedIds: string[] }>("/me/achievements/celebrate", {
    method: "POST",
    body: { achievementIds },
  });
}

export function resetAchievementsClientForTests(): void {
  fetchInflight = null;
}
