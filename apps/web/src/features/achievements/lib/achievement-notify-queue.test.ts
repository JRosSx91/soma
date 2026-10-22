import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import type { AchievementWithUnlockState } from "../types.js";
import {
  MAX_VISIBLE_TOASTS,
  adoptNotifyOwner,
  enqueueMarkFlush,
  filterUnannounced,
  flushPendingAcks,
  notifyOwnerId,
  pendingAckIds,
  presentedIds,
  recordPresentedBatch,
  resetAchievementNotifyQueueForTests,
  selectAnnouncementBatch,
  type MemoryStorage,
} from "./achievement-notify-queue.js";

function memoryStorage(): MemoryStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

function row(
  id: string,
  partial: Partial<AchievementWithUnlockState> = {},
): AchievementWithUnlockState {
  return {
    id,
    tier: "bronze",
    titleKey: `${id}.title`,
    descriptionKey: `${id}.description`,
    triggerOrganId: "liver",
    triggerSubstanceId: "alcohol",
    triggerRecoveryThreshold: 0.1,
    hidden: false,
    unlocked: true,
    unlockedAt: "2026-01-01T00:00:00.000Z",
    notifiedAt: null,
    ...partial,
  };
}

afterEach(() => {
  resetAchievementNotifyQueueForTests();
});

test("already notified or presented rows do not re-enter the toast queue", () => {
  const unread = filterUnannounced(
    [
      row("fresh"),
      row("seen-server", { notifiedAt: "2026-01-02T00:00:00.000Z" }),
      row("seen-session"),
      row("locked", { unlocked: false }),
    ],
    new Set(["seen-session"]),
  );
  assert.deepEqual(
    unread.map((item) => item.id),
    ["fresh"],
  );
});

test("a queue longer than three keeps extras unmarked until a later batch", () => {
  const unread = [row("a"), row("b"), row("c"), row("d"), row("e")];
  const batch = selectAnnouncementBatch(unread, MAX_VISIBLE_TOASTS);
  assert.deepEqual(
    batch.map((item) => item.id),
    ["a", "b", "c"],
  );
  const storage = memoryStorage();
  recordPresentedBatch(
    storage,
    batch.map((item) => item.id),
  );
  const remaining = filterUnannounced(unread, new Set(pendingAckIds(storage)));
  assert.deepEqual(
    remaining.map((item) => item.id),
    ["d", "e"],
  );
  assert.deepEqual(pendingAckIds(storage), ["a", "b", "c"]);
});

test("failed mark-notified keeps pending ids for a later retry", async () => {
  const storage = memoryStorage();
  recordPresentedBatch(storage, ["a", "b"]);
  const first = await flushPendingAcks({
    pending: pendingAckIds(storage),
    mark: async () => {
      throw new Error("network");
    },
  });
  assert.deepEqual(first.acked, []);
  assert.deepEqual(first.remaining, ["a", "b"]);
  assert.deepEqual(pendingAckIds(storage), ["a", "b"]);

  const second = await flushPendingAcks({
    pending: pendingAckIds(storage),
    mark: async () => ({ updated: 2 }),
  });
  assert.deepEqual(second.acked, ["a", "b"]);
  assert.deepEqual(second.remaining, []);
});

test("switching the tab owner drops another user's presented and pending ids", () => {
  const storage = memoryStorage();
  adoptNotifyOwner(storage, "user-a");
  recordPresentedBatch(storage, ["alcohol-liver-bronze"]);
  assert.equal(notifyOwnerId(storage), "user-a");
  assert.deepEqual(presentedIds(storage), ["alcohol-liver-bronze"]);
  assert.deepEqual(pendingAckIds(storage), ["alcohol-liver-bronze"]);

  adoptNotifyOwner(storage, "user-b");
  assert.equal(notifyOwnerId(storage), "user-b");
  assert.deepEqual(presentedIds(storage), []);
  assert.deepEqual(pendingAckIds(storage), []);
});

test("the same user keeps presented ids across a later adopt", () => {
  const storage = memoryStorage();
  adoptNotifyOwner(storage, "user-a");
  recordPresentedBatch(storage, ["alcohol-liver-bronze"]);
  adoptNotifyOwner(storage, "user-a");
  assert.deepEqual(presentedIds(storage), ["alcohol-liver-bronze"]);
  assert.deepEqual(pendingAckIds(storage), ["alcohol-liver-bronze"]);
});

test("a queued flush does not mark ids after the tab owner changes", async () => {
  const storage = memoryStorage();
  adoptNotifyOwner(storage, "user-a");
  recordPresentedBatch(storage, ["alcohol-liver-bronze"]);

  let calls = 0;
  const mark = async () => {
    calls += 1;
    return { updated: 1 };
  };

  adoptNotifyOwner(storage, "user-b");
  const result = await enqueueMarkFlush(storage, mark, "user-a");
  assert.equal(calls, 0);
  assert.deepEqual(result.acked, []);
  assert.deepEqual(pendingAckIds(storage), []);
});

test("a completed flush does not drop the next owner's pending ids", async () => {
  const storage = memoryStorage();
  adoptNotifyOwner(storage, "user-a");
  recordPresentedBatch(storage, ["from-a"]);

  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const mark = async () => {
    await gate;
    return { updated: 1 };
  };

  const flush = enqueueMarkFlush(storage, mark, "user-a");
  adoptNotifyOwner(storage, "user-b");
  recordPresentedBatch(storage, ["from-b"]);
  release();
  await flush;
  assert.deepEqual(pendingAckIds(storage), ["from-b"]);
  assert.deepEqual(presentedIds(storage), ["from-b"]);
});

test("storage writes only owner and achievement ids", () => {
  const storage = memoryStorage();
  adoptNotifyOwner(storage, "user-a");
  recordPresentedBatch(storage, ["alcohol-liver-bronze"]);
  const keys = ["soma.achievements.notify.owner", "soma.achievements.presented", "soma.achievements.pending-ack"];
  for (const key of keys) {
    const value = storage.getItem(key);
    assert.ok(value);
    assert.equal(value.includes("Bearer"), false);
    assert.equal(value.includes("password"), false);
    assert.equal(value.includes("token"), false);
  }
  assert.equal(storage.getItem("soma.achievements.notify.owner"), "user-a");
  assert.equal(storage.getItem("soma.achievements.presented"), '["alcohol-liver-bronze"]');
  assert.equal(storage.getItem("soma.achievements.pending-ack"), '["alcohol-liver-bronze"]');
});

test("concurrent flushes share one mark call for the same pending batch", async () => {
  const storage = memoryStorage();
  recordPresentedBatch(storage, ["a", "b", "c"]);
  let calls = 0;
  const mark = async (ids: string[]) => {
    calls += 1;
    await Promise.resolve();
    return { updated: ids.length };
  };
  await Promise.all([
    enqueueMarkFlush(storage, mark),
    enqueueMarkFlush(storage, mark),
  ]);
  assert.equal(calls, 1);
  assert.deepEqual(pendingAckIds(storage), []);
});
