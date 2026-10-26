import type { AchievementWithUnlockState } from "../types.js";

/** Presentation row for the achievement inbox. Other kinds can join later. */
export type AchievementInboxItem = {
  kind: "achievement";
  id: string;
  achievement: AchievementWithUnlockState;
  unread: boolean;
};

export function shouldShowAchievementInbox(base: string): boolean {
  return base === "/app";
}

export function isInboxUnread(row: AchievementWithUnlockState): boolean {
  return row.unlocked === true && row.inboxReadAt == null;
}

export function unreadInboxCount(
  rows: readonly AchievementWithUnlockState[] | null,
): number {
  if (!rows) return 0;
  return rows.reduce((count, row) => count + (isInboxUnread(row) ? 1 : 0), 0);
}

function detectedTime(row: AchievementWithUnlockState): number {
  const raw = row.detectedAt ?? row.unlockedAt;
  if (!raw) return 0;
  const time = Date.parse(raw);
  return Number.isNaN(time) ? 0 : time;
}

export function compareInboxDetectedDesc(
  a: AchievementWithUnlockState,
  b: AchievementWithUnlockState,
): number {
  return detectedTime(b) - detectedTime(a);
}

export function selectInboxItems(
  rows: readonly AchievementWithUnlockState[] | null,
): AchievementInboxItem[] {
  if (!rows) return [];
  return rows
    .filter((row) => row.unlocked)
    .slice()
    .sort(compareInboxDetectedDesc)
    .map((achievement) => ({
      kind: "achievement" as const,
      id: achievement.id,
      achievement,
      unread: isInboxUnread(achievement),
    }));
}

export function unreadInboxIds(items: readonly AchievementInboxItem[]): string[] {
  return items.filter((item) => item.unread).map((item) => item.id);
}

/** Several new unlocks on the first client sync share one digest, not N alerts. */
export function shouldShowInitialUnlockDigest(
  insertedIds: readonly string[],
  alreadyShown: boolean,
): boolean {
  return !alreadyShown && insertedIds.length >= 2;
}

export function shouldSuppressToastsForInitialDigest(
  insertedIds: readonly string[],
): boolean {
  return insertedIds.length >= 2;
}

let digestShownUserId: string | null = null;

export function peekInitialDigestShown(userId: string | null): boolean {
  return userId !== null && digestShownUserId === userId;
}

export function rememberInitialDigestShown(userId: string): void {
  digestShownUserId = userId;
}

export function resetInitialDigestMemory(): void {
  digestShownUserId = null;
}

let inboxReadTail: Promise<unknown> = Promise.resolve();

export async function confirmInboxRead(input: {
  userId: string;
  ids: readonly string[];
  currentUserId: () => string | null;
  post: (ids: string[]) => Promise<unknown>;
  applyLocal: (ids: string[]) => void;
}): Promise<"ok" | "failed" | "ignored"> {
  const unique = [...new Set(input.ids.filter((id) => id.length > 0))];
  if (unique.length === 0) return "ignored";

  const run = async (): Promise<"ok" | "failed" | "ignored"> => {
    if (input.currentUserId() !== input.userId) return "ignored";
    try {
      await input.post(unique);
      if (input.currentUserId() !== input.userId) return "ignored";
      input.applyLocal(unique);
      return "ok";
    } catch {
      return "failed";
    }
  };

  const next = inboxReadTail.then(run, run);
  inboxReadTail = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

export function resetInboxReadQueueForTests(): void {
  inboxReadTail = Promise.resolve();
  digestShownUserId = null;
}
