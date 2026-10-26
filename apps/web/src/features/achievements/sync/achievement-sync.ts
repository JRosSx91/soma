import { fetchAchievements } from "../client/achievements-api.js";
import type { AchievementWithUnlockState } from "../types.js";

export type AchievementSyncKind = "initial" | "live";

export interface AchievementSyncSnapshot {
  userId: string | null;
  rows: AchievementWithUnlockState[] | null;
  kind: AchievementSyncKind | null;
  lastInsertedIds: string[];
  /** Unlock ids inserted by this user's first successful GET. */
  initialInsertedIds: string[];
  loading: boolean;
  error: string | null;
  generation: number;
}

export interface AchievementSync {
  getSnapshot: () => AchievementSyncSnapshot;
  subscribe: (listener: () => void) => () => void;
  bindUser: (userId: string) => void;
  reset: () => void;
  sync: (userId: string) => Promise<AchievementSyncSnapshot>;
  invalidate: () => void;
  markNotifiedLocally: (ids: readonly string[], at?: string) => void;
  markInboxReadLocally: (ids: readonly string[], at?: string) => void;
  markCelebratedLocally: (ids: readonly string[], at?: string) => void;
}

interface AchievementSyncDeps {
  fetchRows: (
    userId: string,
    options: { force: boolean },
  ) => Promise<AchievementWithUnlockState[]>;
}

function emptySnapshot(
  overrides: Partial<AchievementSyncSnapshot> = {},
): AchievementSyncSnapshot {
  return {
    userId: null,
    rows: null,
    kind: null,
    lastInsertedIds: [],
    initialInsertedIds: [],
    loading: false,
    error: null,
    generation: 0,
    ...overrides,
  };
}

function insertedIds(rows: readonly AchievementWithUnlockState[]): string[] {
  return rows.filter((row) => row.insertedThisCall === true).map((row) => row.id);
}

function newlyUnlockedIds(
  previous: readonly AchievementWithUnlockState[] | null,
  next: readonly AchievementWithUnlockState[],
): string[] {
  if (!previous) return [];
  const wasUnlocked = new Set(
    previous.filter((row) => row.unlocked === true).map((row) => row.id),
  );
  return next
    .filter((row) => row.unlocked === true && !wasUnlocked.has(row.id))
    .map((row) => row.id);
}

function uniqueIds(ids: readonly string[]): string[] {
  return [...new Set(ids)];
}

export function createAchievementSync(
  deps: AchievementSyncDeps,
): AchievementSync {
  let snapshot = emptySnapshot();
  let dirty = true;
  let initialCompletedUserId: string | null = null;
  let inflight: {
    userId: string;
    generation: number;
    promise: Promise<AchievementSyncSnapshot>;
  } | null = null;
  const listeners = new Set<() => void>();

  function emit(): void {
    for (const listener of listeners) listener();
  }

  function apply(next: AchievementSyncSnapshot): void {
    snapshot = next;
    emit();
  }

  function bumpGeneration(): number {
    const generation = snapshot.generation + 1;
    snapshot = { ...snapshot, generation };
    return generation;
  }

  function nextKind(userId: string): AchievementSyncKind {
    return initialCompletedUserId === userId ? "live" : "initial";
  }

  function bindUser(userId: string): void {
    if (snapshot.userId === userId) return;
    inflight = null;
    dirty = true;
    initialCompletedUserId = null;
    apply(
      emptySnapshot({
        userId,
        generation: snapshot.generation + 1,
      }),
    );
  }

  function reset(): void {
    inflight = null;
    dirty = true;
    initialCompletedUserId = null;
    apply(emptySnapshot({ generation: snapshot.generation + 1 }));
  }

  async function runFetch(
    userId: string,
    generation: number,
    kind: AchievementSyncKind,
  ): Promise<AchievementSyncSnapshot> {
    apply({
      ...snapshot,
      userId,
      generation,
      loading: true,
      error: null,
    });
    try {
      const rows = await deps.fetchRows(userId, { force: true });
      if (generation !== snapshot.generation || snapshot.userId !== userId) {
        return snapshot;
      }
      dirty = false;
      if (kind === "initial") initialCompletedUserId = userId;
      const inserted = insertedIds(rows);
      const lastInsertedIds =
        kind === "live"
          ? uniqueIds([...inserted, ...newlyUnlockedIds(snapshot.rows, rows)])
          : inserted;
      apply({
        userId,
        rows,
        kind,
        lastInsertedIds,
        initialInsertedIds:
          kind === "initial" ? inserted : snapshot.initialInsertedIds,
        loading: false,
        error: null,
        generation,
      });
      return snapshot;
    } catch (err) {
      if (generation !== snapshot.generation || snapshot.userId !== userId) {
        return snapshot;
      }
      apply({
        ...snapshot,
        userId,
        generation,
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : "No se han podido cargar los logros.",
      });
      return snapshot;
    } finally {
      if (inflight?.generation === generation) inflight = null;
    }
  }

  function startFetch(userId: string): Promise<AchievementSyncSnapshot> {
    const generation = snapshot.generation;
    const promise = runFetch(userId, generation, nextKind(userId));
    inflight = { userId, generation, promise };
    return promise;
  }

  function sync(userId: string): Promise<AchievementSyncSnapshot> {
    bindUser(userId);
    if (
      inflight &&
      inflight.userId === userId &&
      inflight.generation === snapshot.generation
    ) {
      return inflight.promise;
    }
    if (
      !dirty &&
      snapshot.userId === userId &&
      snapshot.rows !== null &&
      inflight === null
    ) {
      return Promise.resolve(snapshot);
    }
    return startFetch(userId);
  }

  function invalidate(): void {
    const userId = snapshot.userId;
    dirty = true;
    bumpGeneration();
    inflight = null;
    emit();
    if (!userId) return;
    void startFetch(userId);
  }

  function markNotifiedLocally(
    ids: readonly string[],
    at = new Date().toISOString(),
  ): void {
    if (!snapshot.rows || ids.length === 0) return;
    const claimed = new Set(ids);
    apply({
      ...snapshot,
      rows: snapshot.rows.map((row) =>
        claimed.has(row.id) && row.notifiedAt === null
          ? { ...row, notifiedAt: at }
          : row,
      ),
    });
  }

  function markInboxReadLocally(
    ids: readonly string[],
    at = new Date().toISOString(),
  ): void {
    if (!snapshot.rows || ids.length === 0) return;
    const claimed = new Set(ids);
    apply({
      ...snapshot,
      rows: snapshot.rows.map((row) =>
        claimed.has(row.id) && row.inboxReadAt == null
          ? { ...row, inboxReadAt: at }
          : row,
      ),
    });
  }

  function markCelebratedLocally(
    ids: readonly string[],
    at = new Date().toISOString(),
  ): void {
    if (!snapshot.rows || ids.length === 0) return;
    const claimed = new Set(ids);
    apply({
      ...snapshot,
      rows: snapshot.rows.map((row) =>
        claimed.has(row.id) && row.celebratedAt == null
          ? { ...row, celebratedAt: at }
          : row,
      ),
    });
  }

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    bindUser,
    reset,
    sync,
    invalidate,
    markNotifiedLocally,
    markInboxReadLocally,
    markCelebratedLocally,
  };
}

export const achievementSync = createAchievementSync({
  fetchRows: (userId, options) => fetchAchievements(userId, options),
});
