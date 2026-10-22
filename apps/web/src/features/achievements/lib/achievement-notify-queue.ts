import type { AchievementWithUnlockState } from "../types.js";

export const MAX_VISIBLE_TOASTS = 3;
export const ACHIEVEMENT_NOTIFY_PRESENTED_KEY = "soma.achievements.presented";
export const ACHIEVEMENT_NOTIFY_PENDING_KEY = "soma.achievements.pending-ack";
export const ACHIEVEMENT_NOTIFY_OWNER_KEY = "soma.achievements.notify.owner";

export interface MemoryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function readIds(storage: MemoryStorage, key: string): string[] {
  try {
    const raw = storage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is string => typeof id === "string" && id.length > 0);
  } catch {
    return [];
  }
}

function writeIds(storage: MemoryStorage, key: string, ids: readonly string[]): void {
  const unique = [...new Set(ids)];
  try {
    if (unique.length === 0) storage.removeItem(key);
    else storage.setItem(key, JSON.stringify(unique));
  } catch {
    // sessionStorage may be blocked; in-memory callers still keep their copy.
  }
}

export function mergeUnique(base: readonly string[], extra: readonly string[]): string[] {
  return [...new Set([...base, ...extra])];
}

export function presentedIds(storage: MemoryStorage): string[] {
  return readIds(storage, ACHIEVEMENT_NOTIFY_PRESENTED_KEY);
}

export function pendingAckIds(storage: MemoryStorage): string[] {
  return readIds(storage, ACHIEVEMENT_NOTIFY_PENDING_KEY);
}

export function notifyOwnerId(storage: MemoryStorage): string | null {
  try {
    const owner = storage.getItem(ACHIEVEMENT_NOTIFY_OWNER_KEY);
    return typeof owner === "string" && owner.length > 0 ? owner : null;
  } catch {
    return null;
  }
}

/** Drop presented/pending ids when the tab owner changes. Same user keeps them. */
export function adoptNotifyOwner(storage: MemoryStorage, userId: string): void {
  const current = notifyOwnerId(storage);
  if (current !== userId) {
    writeIds(storage, ACHIEVEMENT_NOTIFY_PRESENTED_KEY, []);
    writeIds(storage, ACHIEVEMENT_NOTIFY_PENDING_KEY, []);
  }
  try {
    storage.setItem(ACHIEVEMENT_NOTIFY_OWNER_KEY, userId);
  } catch {
    // sessionStorage may be blocked; in-memory callers still keep their copy.
  }
}

export function rememberPresented(
  storage: MemoryStorage,
  ids: readonly string[],
): string[] {
  const next = mergeUnique(presentedIds(storage), ids);
  writeIds(storage, ACHIEVEMENT_NOTIFY_PRESENTED_KEY, next);
  return next;
}

export function enqueuePendingAck(
  storage: MemoryStorage,
  ids: readonly string[],
): string[] {
  const next = mergeUnique(pendingAckIds(storage), ids);
  writeIds(storage, ACHIEVEMENT_NOTIFY_PENDING_KEY, next);
  return next;
}

export function dropPendingAck(storage: MemoryStorage, ids: readonly string[]): string[] {
  const drop = new Set(ids);
  const next = pendingAckIds(storage).filter((id) => !drop.has(id));
  writeIds(storage, ACHIEVEMENT_NOTIFY_PENDING_KEY, next);
  return next;
}

/** Unlocked, not yet stored as notified, and not already shown this session. */
export function filterUnannounced(
  rows: readonly AchievementWithUnlockState[],
  presented: ReadonlySet<string>,
): AchievementWithUnlockState[] {
  return rows.filter(
    (row) => row.unlocked && row.notifiedAt === null && !presented.has(row.id),
  );
}

export function selectAnnouncementBatch(
  unread: readonly AchievementWithUnlockState[],
  max = MAX_VISIBLE_TOASTS,
): AchievementWithUnlockState[] {
  return unread.slice(0, Math.max(0, max));
}

/**
 * Mark a presented batch: hide on reload immediately, ack only those ids.
 * Ids still waiting in the unread queue are not queued for ack.
 */
export function recordPresentedBatch(
  storage: MemoryStorage,
  batchIds: readonly string[],
): { presented: string[]; pending: string[] } {
  return {
    presented: rememberPresented(storage, batchIds),
    pending: enqueuePendingAck(storage, batchIds),
  };
}

export async function flushPendingAcks(input: {
  pending: readonly string[];
  mark: (ids: string[]) => Promise<unknown>;
  shouldAbort?: () => boolean;
}): Promise<{ acked: string[]; remaining: string[] }> {
  const pending = [...new Set(input.pending)];
  if (pending.length === 0) return { acked: [], remaining: [] };
  if (input.shouldAbort?.()) return { acked: [], remaining: pending };
  try {
    await input.mark(pending);
    if (input.shouldAbort?.()) return { acked: [], remaining: pending };
    return { acked: pending, remaining: [] };
  } catch {
    return { acked: [], remaining: pending };
  }
}

let markTail: Promise<{ acked: string[]; remaining: string[] }> | null = null;

/** Serialize flushes so concurrent confirmations do not double-POST. */
export function enqueueMarkFlush(
  storage: MemoryStorage,
  mark: (ids: string[]) => Promise<unknown>,
  expectedOwner?: string,
): Promise<{ acked: string[]; remaining: string[] }> {
  const run = async (): Promise<{ acked: string[]; remaining: string[] }> => {
    const owner = notifyOwnerId(storage);
    if (expectedOwner !== undefined && owner !== expectedOwner) {
      return { acked: [], remaining: pendingAckIds(storage) };
    }

    const result = await flushPendingAcks({
      pending: pendingAckIds(storage),
      mark,
      shouldAbort: () =>
        expectedOwner !== undefined && notifyOwnerId(storage) !== expectedOwner,
    });
    if (
      result.acked.length > 0 &&
      notifyOwnerId(storage) === owner
    ) {
      dropPendingAck(storage, result.acked);
    }
    return result;
  };

  markTail = (markTail ?? Promise.resolve({ acked: [], remaining: [] }))
    .then(run, run)
    .then(
      (result) => result,
      () => ({ acked: [] as string[], remaining: pendingAckIds(storage) }),
    );
  return markTail;
}

export function resetAchievementNotifyQueueForTests(): void {
  markTail = null;
}

export function sessionNotifyStorage(): MemoryStorage | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage;
  } catch {
    return null;
  }
}
