import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, test } from "node:test";
import type { AchievementWithUnlockState } from "../types.js";
import { createAchievementSync } from "../sync/achievement-sync.js";
import {
  compareInboxDetectedDesc,
  confirmInboxRead,
  peekInitialDigestShown,
  rememberInitialDigestShown,
  resetInboxReadQueueForTests,
  resetInitialDigestMemory,
  selectInboxItems,
  shouldShowAchievementInbox,
  shouldShowInitialUnlockDigest,
  shouldSuppressToastsForInitialDigest,
  unreadInboxCount,
} from "./inbox-notifications.js";

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
    detectedAt: "2026-01-01T00:00:00.000Z",
    inboxReadAt: null,
    celebratedAt: null,
    insertedThisCall: false,
    ...partial,
  };
}

afterEach(() => {
  resetInboxReadQueueForTests();
});

test("badge counts only unlocked rows with inboxReadAt null", () => {
  const rows = [
    row("unread"),
    row("read", { inboxReadAt: "2026-02-01T00:00:00.000Z" }),
    row("locked", { unlocked: false }),
    row("notified-unread", { notifiedAt: "2026-02-01T00:00:00.000Z" }),
  ];
  assert.equal(unreadInboxCount(rows), 2);
  assert.equal(unreadInboxCount(rows.filter((item) => item.id !== "unread" && item.id !== "notified-unread")), 0);
});

test("marking inbox read locally drops the badge and leaves notifiedAt untouched", async () => {
  const sync = createAchievementSync({
    fetchRows: async () => [row("a"), row("b")],
  });
  await sync.sync("user-1");
  assert.equal(unreadInboxCount(sync.getSnapshot().rows), 2);
  sync.markInboxReadLocally(["a", "b"]);
  const rows = sync.getSnapshot().rows ?? [];
  assert.equal(unreadInboxCount(rows), 0);
  assert.equal(rows[0]?.notifiedAt, null);
  assert.equal(rows[1]?.notifiedAt, null);
  assert.ok(rows[0]?.inboxReadAt);
});

test("inbox read is idempotent and serializes rapid confirms", async () => {
  let posts = 0;
  const result = await Promise.all([
    confirmInboxRead({
      userId: "user-1",
      ids: ["a"],
      currentUserId: () => "user-1",
      post: async () => {
        posts += 1;
        return { updated: posts === 1 ? 1 : 0, readIds: posts === 1 ? ["a"] : [] };
      },
      applyLocal: () => undefined,
    }),
    confirmInboxRead({
      userId: "user-1",
      ids: ["a"],
      currentUserId: () => "user-1",
      post: async () => {
        posts += 1;
        return { updated: 0, readIds: [] };
      },
      applyLocal: () => undefined,
    }),
  ]);
  assert.equal(posts, 2);
  assert.deepEqual(result, ["ok", "ok"]);
});

test("a network failure while marking read does not apply local inboxReadAt", async () => {
  let applied = 0;
  const result = await confirmInboxRead({
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
  assert.equal(result, "failed");
  assert.equal(applied, 0);
});

test("inbox items sort by detectedAt descending", () => {
  const items = selectInboxItems([
    row("old", { detectedAt: "2026-01-01T00:00:00.000Z" }),
    row("new", { detectedAt: "2026-03-01T00:00:00.000Z" }),
    row("mid", { detectedAt: "2026-02-01T00:00:00.000Z" }),
  ]);
  assert.deepEqual(
    items.map((item) => item.id),
    ["new", "mid", "old"],
  );
  assert.ok(compareInboxDetectedDesc(items[0]!.achievement, items[1]!.achievement) <= 0);
});

test("initial sync with several new unlocks uses one digest, not N alerts", async () => {
  const sync = createAchievementSync({
    fetchRows: async () => [
      row("a", { insertedThisCall: true }),
      row("b", { insertedThisCall: true }),
    ],
  });
  const snap = await sync.sync("user-1");
  assert.equal(snap.kind, "initial");
  assert.equal(shouldShowInitialUnlockDigest(snap.initialInsertedIds, false), true);
  assert.equal(shouldSuppressToastsForInitialDigest(snap.initialInsertedIds), true);
  assert.equal(selectInboxItems(snap.rows).length, 2);
});

test("the initial digest is not repeated after it has been shown", () => {
  assert.equal(peekInitialDigestShown("user-1"), false);
  rememberInitialDigestShown("user-1");
  assert.equal(peekInitialDigestShown("user-1"), true);
  assert.equal(
    shouldShowInitialUnlockDigest(["a", "b"], peekInitialDigestShown("user-1")),
    false,
  );
  assert.equal(peekInitialDigestShown("user-2"), false);
  resetInitialDigestMemory();
  assert.equal(peekInitialDigestShown("user-1"), false);
});

test("user change and logout drop inbox rows and digest memory", async () => {
  const sync = createAchievementSync({
    fetchRows: async (userId) => [row(userId, { insertedThisCall: true })],
  });
  await sync.sync("user-a");
  rememberInitialDigestShown("user-a");
  await sync.sync("user-b");
  assert.equal(sync.getSnapshot().userId, "user-b");
  assert.equal(sync.getSnapshot().rows?.[0]?.id, "user-b");
  assert.equal(peekInitialDigestShown("user-b"), false);
  sync.reset();
  resetInitialDigestMemory();
  assert.equal(sync.getSnapshot().rows, null);
  assert.equal(peekInitialDigestShown("user-a"), false);
});

test("bell and panel expose basic keyboard and aria wiring", () => {
  const source = readFileSync(
    new URL("../components/AchievementInboxBell.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /aria-expanded=\{open\}/);
  assert.match(source, /aria-controls=\{panelId\}/);
  assert.match(source, /aria-haspopup="dialog"/);
  assert.match(source, /aria-label=\{t\("notifications.bellLabel"\)\}/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /pointerdown/);
  assert.match(source, /triggerRef\.current\?\.focus/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /createPortal/);
  assert.match(source, /placeAnchoredPanel/);
});

test("the achievement inbox is absent from DEMO /preview", () => {
  assert.equal(shouldShowAchievementInbox("/app"), true);
  assert.equal(shouldShowAchievementInbox("/preview"), false);
  const header = readFileSync(
    new URL("../../recovery-dashboard/components/PreviewMobileHeader.tsx", import.meta.url),
    "utf8",
  );
  const sidebar = readFileSync(
    new URL("../../recovery-dashboard/components/PreviewSidebar.tsx", import.meta.url),
    "utf8",
  );
  const bell = readFileSync(
    new URL("../components/AchievementInboxBell.tsx", import.meta.url),
    "utf8",
  );
  assert.match(header, /AchievementInboxBell/);
  assert.match(sidebar, /AchievementInboxBell/);
  assert.match(bell, /if \(!inbox\.visible\) return null/);
  const hook = readFileSync(
    new URL("../hooks/useAchievementInbox.ts", import.meta.url),
    "utf8",
  );
  assert.match(hook, /shouldShowAchievementInbox\(base\)/);
});
