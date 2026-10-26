import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, test } from "node:test";
import { createAchievementSync } from "../sync/achievement-sync.js";
import type { AchievementWithUnlockState } from "../types.js";
import {
  celebrationAttemptKey,
  celebrationFromClaimed,
  confirmCelebrationClaim,
  planCelebration,
  resetCelebrationClaimQueueForTests,
  shouldCelebrateInShell,
} from "./celebration-plan.js";

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

afterEach(() => {
  resetCelebrationClaimQueueForTests();
});

test("initial sync never plans a celebration", () => {
  const plan = planCelebration({
    liveShell: true,
    kind: "initial",
    insertedIds: ["a", "b"],
    rows: [row("a", { insertedThisCall: true }), row("b", { insertedThisCall: true })],
  });
  assert.equal(plan.mode, "none");
  assert.deepEqual(plan.candidateIds, []);
});

test("live with one eligible unlock plans a solo celebration", () => {
  const plan = planCelebration({
    liveShell: true,
    kind: "live",
    insertedIds: ["a"],
    rows: [row("a", { insertedThisCall: true }), row("old", { celebratedAt: "2026-01-01T00:00:00.000Z" })],
  });
  assert.equal(plan.mode, "solo");
  assert.deepEqual(plan.candidateIds, ["a"]);
});

test("seven live inserts still share one group celebration", () => {
  const insertedIds = Array.from({ length: 7 }, (_, i) => `t-${i}`);
  const plan = planCelebration({
    liveShell: true,
    kind: "live",
    insertedIds,
    rows: insertedIds.map((id) => row(id, { insertedThisCall: true })),
  });
  assert.equal(plan.mode, "group");
  assert.equal(plan.candidateIds.length, 7);
});

test("live bulk inserts are recognized without a celebration party", () => {
  const insertedIds = Array.from({ length: 10 }, (_, i) => `t-${i}`);
  const plan = planCelebration({
    liveShell: true,
    kind: "live",
    insertedIds,
    rows: insertedIds.map((id) => row(id, { insertedThisCall: true })),
  });
  assert.equal(plan.mode, "none");
  assert.deepEqual(plan.candidateIds, []);
});

test("live with several eligible unlocks plans one group celebration", () => {
  const plan = planCelebration({
    liveShell: true,
    kind: "live",
    insertedIds: ["a", "b"],
    rows: [
      row("a", { insertedThisCall: true }),
      row("b", { insertedThisCall: true }),
    ],
  });
  assert.equal(plan.mode, "group");
  assert.deepEqual(plan.candidateIds, ["a", "b"]);
});

test("concurrent claim shows only ids the server actually awarded", async () => {
  const result = await confirmCelebrationClaim({
    userId: "user-1",
    ids: ["a", "b"],
    currentUserId: () => "user-1",
    post: async () => ({ celebratedIds: ["b"] }),
    applyLocal: () => undefined,
  });
  assert.equal(result.status, "ok");
  const shown = celebrationFromClaimed(
    [row("a"), row("b")],
    result.celebratedIds,
  );
  assert.equal(shown.mode, "solo");
  assert.deepEqual(
    shown.achievements.map((item) => item.id),
    ["b"],
  );
});

test("a failed celebrate POST does not produce a modal payload", async () => {
  let applied = 0;
  const result = await confirmCelebrationClaim({
    userId: "user-1",
    ids: ["a"],
    currentUserId: () => "user-1",
    post: async () => {
      throw new Error("network");
    },
    applyLocal: () => {
      applied += 1;
    },
  });
  assert.equal(result.status, "failed");
  assert.deepEqual(result.celebratedIds, []);
  assert.equal(applied, 0);
});

test("already celebrated rows are not eligible again", () => {
  const plan = planCelebration({
    liveShell: true,
    kind: "live",
    insertedIds: ["a"],
    rows: [row("a", { celebratedAt: "2026-03-01T00:00:00.000Z", insertedThisCall: true })],
  });
  assert.equal(plan.mode, "none");
});

test("the same live generation is not celebrated twice while navigating", () => {
  const first = celebrationAttemptKey({
    userId: "user-1",
    generation: 4,
    kind: "live",
    insertedIds: ["a"],
  });
  const second = celebrationAttemptKey({
    userId: "user-1",
    generation: 4,
    kind: "live",
    insertedIds: ["a"],
  });
  const navigated = celebrationAttemptKey({
    userId: "user-1",
    generation: 4,
    kind: "live",
    insertedIds: ["a"],
  });
  assert.equal(first, second);
  assert.equal(first, navigated);
});

test("user change and logout drop local celebration timestamps from the snapshot", async () => {
  const sync = createAchievementSync({
    fetchRows: async (userId) => [row(userId, { insertedThisCall: true })],
  });
  await sync.sync("user-a");
  sync.markCelebratedLocally(["user-a"]);
  assert.ok(sync.getSnapshot().rows?.[0]?.celebratedAt);
  const notified = sync.getSnapshot().rows?.[0]?.notifiedAt;
  const inbox = sync.getSnapshot().rows?.[0]?.inboxReadAt;
  assert.equal(notified, null);
  assert.equal(inbox, null);
  await sync.sync("user-b");
  assert.equal(sync.getSnapshot().rows?.[0]?.id, "user-b");
  assert.equal(sync.getSnapshot().rows?.[0]?.celebratedAt, null);
  sync.reset();
  assert.equal(sync.getSnapshot().rows, null);
});

test("DEMO /preview never enables LIVE celebration", () => {
  assert.equal(shouldCelebrateInShell("/app"), true);
  assert.equal(shouldCelebrateInShell("/preview"), false);
  const plan = planCelebration({
    liveShell: false,
    kind: "live",
    insertedIds: ["a"],
    rows: [row("a", { insertedThisCall: true })],
  });
  assert.equal(plan.mode, "none");
  const shell = readFileSync(
    new URL("../../recovery-dashboard/components/PreviewShell.tsx", import.meta.url),
    "utf8",
  );
  const layout = readFileSync(
    new URL("../../../components/ProtectedLayout.tsx", import.meta.url),
    "utf8",
  );
  assert.match(shell, /base === "\/app" \? <AchievementCelebrationHost/);
  assert.equal(layout.includes("TrophyToastStack"), false);
  assert.equal(layout.includes("AchievementCelebrationHost"), false);
});

test("celebration modal wires escape, focus return, and reduced motion", () => {
  const source = readFileSync(
    new URL("../components/AchievementCelebrationModal.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /useReducedMotion/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /previousFocus\.current\?\.focus/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /platinum \? "ring-2 ring-soma-action/);
});
