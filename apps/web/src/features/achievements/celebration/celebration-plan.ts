import type { AchievementWithUnlockState } from "../types.js";
import type { AchievementSyncKind } from "../sync/achievement-sync.js";

export type CelebrationMode = "none" | "solo" | "group";

export interface CelebrationPlan {
  mode: CelebrationMode;
  candidateIds: string[];
}

export function shouldCelebrateInShell(base: string): boolean {
  return base === "/app";
}

export function eligibleCelebrationIds(
  rows: readonly AchievementWithUnlockState[] | null,
  insertedIds: readonly string[],
): string[] {
  if (!rows || insertedIds.length === 0) return [];
  const inserted = new Set(insertedIds);
  return rows
    .filter(
      (row) =>
        inserted.has(row.id) &&
        row.unlocked === true &&
        row.celebratedAt == null,
    )
    .map((row) => row.id);
}

export function planCelebration(input: {
  liveShell: boolean;
  kind: AchievementSyncKind | null;
  rows: readonly AchievementWithUnlockState[] | null;
  insertedIds: readonly string[];
}): CelebrationPlan {
  if (!input.liveShell || input.kind !== "live") {
    return { mode: "none", candidateIds: [] };
  }
  const candidateIds = eligibleCelebrationIds(input.rows, input.insertedIds);
  if (candidateIds.length === 0) return { mode: "none", candidateIds };
  return {
    mode: candidateIds.length === 1 ? "solo" : "group",
    candidateIds,
  };
}

export function celebrationFromClaimed(
  rows: readonly AchievementWithUnlockState[] | null,
  claimedIds: readonly string[],
): { mode: CelebrationMode; achievements: AchievementWithUnlockState[] } {
  if (!rows || claimedIds.length === 0) {
    return { mode: "none", achievements: [] };
  }
  const wanted = new Set(claimedIds);
  const achievements = rows.filter((row) => wanted.has(row.id));
  if (achievements.length === 0) return { mode: "none", achievements };
  return {
    mode: achievements.length === 1 ? "solo" : "group",
    achievements,
  };
}

export function celebrationAttemptKey(input: {
  userId: string | null;
  generation: number;
  kind: AchievementSyncKind | null;
  insertedIds: readonly string[];
}): string {
  return `${input.userId ?? ""}:${input.generation}:${input.kind ?? ""}:${input.insertedIds.join(",")}`;
}

let celebrateTail: Promise<unknown> = Promise.resolve();

export async function confirmCelebrationClaim(input: {
  userId: string;
  ids: readonly string[];
  currentUserId: () => string | null;
  post: (ids: string[]) => Promise<{ celebratedIds: string[] }>;
  applyLocal: (ids: string[]) => void;
}): Promise<{ status: "ok" | "failed" | "ignored"; celebratedIds: string[] }> {
  const unique = [...new Set(input.ids.filter((id) => id.length > 0))];
  if (unique.length === 0) {
    return { status: "ignored", celebratedIds: [] };
  }

  const run = async (): Promise<{
    status: "ok" | "failed" | "ignored";
    celebratedIds: string[];
  }> => {
    if (input.currentUserId() !== input.userId) {
      return { status: "ignored", celebratedIds: [] };
    }
    try {
      const result = await input.post(unique);
      if (input.currentUserId() !== input.userId) {
        return { status: "ignored", celebratedIds: [] };
      }
      const celebratedIds = result.celebratedIds.filter((id) =>
        unique.includes(id),
      );
      if (celebratedIds.length > 0) input.applyLocal(celebratedIds);
      return { status: "ok", celebratedIds };
    } catch {
      return { status: "failed", celebratedIds: [] };
    }
  };

  const next = celebrateTail.then(run, run);
  celebrateTail = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

export function resetCelebrationClaimQueueForTests(): void {
  celebrateTail = Promise.resolve();
}
