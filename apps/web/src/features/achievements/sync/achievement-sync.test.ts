import assert from "node:assert/strict";
import { test } from "node:test";
import type { AchievementWithUnlockState } from "../types.js";
import { createAchievementSync } from "./achievement-sync.js";

function row(
  id: string,
  partial: Partial<AchievementWithUnlockState> = {},
): AchievementWithUnlockState {
  return {
    id,
    tier: "bronze",
    titleKey: `${id}.title`,
    descriptionKey: `${id}.description`,
    triggerOrganId: "lungs",
    triggerSubstanceId: "nicotine",
    triggerRecoveryThreshold: 0.1,
    hidden: false,
    unlocked: true,
    unlockedAt: "2026-01-01T00:00:00.000Z",
    notifiedAt: null,
    inboxReadAt: null,
    celebratedAt: null,
    insertedThisCall: false,
    ...partial,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

test("concurrent views share a single initial GET", async () => {
  let calls = 0;
  const sync = createAchievementSync({
    fetchRows: async () => {
      calls += 1;
      return [row("a", { insertedThisCall: true })];
    },
  });

  const [first, second] = await Promise.all([
    sync.sync("user-1"),
    sync.sync("user-1"),
  ]);

  assert.equal(calls, 1);
  assert.equal(first.kind, "initial");
  assert.equal(second.kind, "initial");
  assert.deepEqual(first.lastInsertedIds, ["a"]);
  assert.equal(first, second);
});

test("invalidate after a successful profile save starts a live GET", async () => {
  const kinds: string[] = [];
  const payloads = [
    [row("a", { insertedThisCall: true })],
    [row("a"), row("b", { insertedThisCall: true })],
  ];
  const sync = createAchievementSync({
    fetchRows: async () => {
      const next = payloads.shift() ?? [];
      kinds.push("fetch");
      return next;
    },
  });

  const initial = await sync.sync("user-1");
  assert.equal(initial.kind, "initial");
  assert.deepEqual(initial.lastInsertedIds, ["a"]);

  const liveDone = new Promise<void>((resolve) => {
    const unsub = sync.subscribe(() => {
      const snap = sync.getSnapshot();
      if (snap.kind === "live" && snap.loading === false) {
        unsub();
        resolve();
      }
    });
  });
  sync.invalidate();
  await liveDone;

  const live = sync.getSnapshot();
  assert.equal(kinds.length, 2);
  assert.equal(live.kind, "live");
  assert.deepEqual(live.lastInsertedIds, ["b"]);
  assert.deepEqual(live.initialInsertedIds, ["a"]);
  assert.equal(live.rows?.length, 2);
});

test("a stale GET after invalidate does not replace the newer snapshot", async () => {
  const first = deferred<AchievementWithUnlockState[]>();
  const second = deferred<AchievementWithUnlockState[]>();
  const pending = [first, second];
  const sync = createAchievementSync({
    fetchRows: async () => {
      const next = pending.shift();
      if (!next) throw new Error("unexpected fetch");
      return next.promise;
    },
  });

  const initialPromise = sync.sync("user-1");
  sync.invalidate();
  second.resolve([row("fresh", { insertedThisCall: true })]);
  first.resolve([row("stale", { insertedThisCall: true })]);
  await initialPromise;

  const snap = sync.getSnapshot();
  assert.equal(snap.rows?.[0]?.id, "fresh");
  assert.equal(snap.kind, "initial");
  assert.deepEqual(snap.lastInsertedIds, ["fresh"]);
});

test("consecutive live invalidates still surface newly unlocked ids", async () => {
  let calls = 0;
  const firstLive = deferred<AchievementWithUnlockState[]>();
  const secondLive = deferred<AchievementWithUnlockState[]>();
  const sync = createAchievementSync({
    fetchRows: async () => {
      calls += 1;
      if (calls === 1) return [row("a", { insertedThisCall: true })];
      if (calls === 2) return firstLive.promise;
      if (calls === 3) return secondLive.promise;
      throw new Error("unexpected fetch");
    },
  });

  await sync.sync("user-1");
  assert.deepEqual(sync.getSnapshot().lastInsertedIds, ["a"]);

  const liveDone = new Promise<void>((resolve) => {
    const unsub = sync.subscribe(() => {
      const snap = sync.getSnapshot();
      if (snap.kind === "live" && snap.loading === false) {
        unsub();
        resolve();
      }
    });
  });
  sync.invalidate();
  sync.invalidate();
  firstLive.resolve([
    row("a"),
    row("b", { insertedThisCall: true }),
    row("c", { insertedThisCall: true }),
  ]);
  secondLive.resolve([row("a"), row("b"), row("c")]);
  await liveDone;

  const live = sync.getSnapshot();
  assert.equal(calls, 3);
  assert.equal(live.kind, "live");
  assert.deepEqual(live.lastInsertedIds, ["b", "c"]);
});

test("switching users drops the previous catalog", async () => {
  const sync = createAchievementSync({
    fetchRows: async (userId) => [row(userId)],
  });
  await sync.sync("user-a");
  assert.equal(sync.getSnapshot().rows?.[0]?.id, "user-a");

  const next = await sync.sync("user-b");
  assert.equal(next.userId, "user-b");
  assert.equal(next.kind, "initial");
  assert.equal(next.rows?.[0]?.id, "user-b");
  assert.equal(sync.getSnapshot().rows?.some((row) => row.id === "user-a"), false);
});

test("logout clears in-memory rows", async () => {
  const sync = createAchievementSync({
    fetchRows: async () => [row("kept")],
  });
  await sync.sync("user-1");
  sync.reset();
  const snap = sync.getSnapshot();
  assert.equal(snap.userId, null);
  assert.equal(snap.rows, null);
  assert.equal(snap.kind, null);
});

test("a failed initial GET can recover as initial", async () => {
  let calls = 0;
  const sync = createAchievementSync({
    fetchRows: async () => {
      calls += 1;
      if (calls === 1) throw new Error("network down");
      return [row("recovered", { insertedThisCall: true })];
    },
  });

  const failed = await sync.sync("user-1");
  assert.equal(failed.error, "network down");
  assert.equal(failed.kind, null);
  assert.equal(failed.rows, null);

  const recovered = await sync.sync("user-1");
  assert.equal(recovered.kind, "initial");
  assert.equal(recovered.error, null);
  assert.deepEqual(recovered.lastInsertedIds, ["recovered"]);
});

test("shared snapshot does not duplicate catalog rows", async () => {
  const sync = createAchievementSync({
    fetchRows: async () => [
      row("fresh", { insertedThisCall: true }),
      row("acked", { notifiedAt: "2026-01-02T00:00:00.000Z" }),
    ],
  });
  await Promise.all([sync.sync("user-1"), sync.sync("user-1")]);
  const ids = (sync.getSnapshot().rows ?? []).map((item) => item.id);
  assert.deepEqual(ids, ["fresh", "acked"]);
});
