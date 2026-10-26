import assert from "node:assert/strict";
import { test } from "node:test";
import { Prisma } from "@prisma/client";
import {
  claimUserAchievementTimestamp,
  insertUserAchievementsIgnoringConflicts,
} from "./user-achievement-persist.js";

test("insertUserAchievementsIgnoringConflicts skips the database when empty", async () => {
  let calls = 0;
  const prisma = {
    $queryRaw: async () => {
      calls += 1;
      return [];
    },
  };
  const ids = await insertUserAchievementsIgnoringConflicts(prisma, "user-1", []);
  assert.deepEqual(ids, []);
  assert.equal(calls, 0);
});

test("insertUserAchievementsIgnoringConflicts returns only RETURNING ids", async () => {
  const prisma = {
    $queryRaw: async (query: Prisma.Sql) => {
      const text = query.strings.join("?");
      assert.match(text, /ON CONFLICT \("userId", "achievementId"\) DO NOTHING/);
      assert.match(text, /RETURNING "achievementId"/);
      return [{ achievementId: "kept-insert" }];
    },
  };
  const ids = await insertUserAchievementsIgnoringConflicts(
    prisma,
    "user-1",
    [
      { achievementId: "kept-insert", unlockedAt: new Date("2026-09-15") },
      { achievementId: "lost-conflict", unlockedAt: new Date("2026-09-16") },
    ],
    new Date("2026-10-25T18:00:00.000Z"),
    () => "fixed-id",
  );
  assert.deepEqual(ids, ["kept-insert"]);
});

test("claimUserAchievementTimestamp is a no-op for an empty id list", async () => {
  let calls = 0;
  const prisma = {
    $queryRaw: async () => {
      calls += 1;
      return [];
    },
  };
  const ids = await claimUserAchievementTimestamp(prisma, {
    userId: "user-1",
    achievementIds: ["", ""],
    column: "celebratedAt",
  });
  assert.deepEqual(ids, []);
  assert.equal(calls, 0);
});

test("claimUserAchievementTimestamp celebrates only RETURNING ids", async () => {
  const prisma = {
    $queryRaw: async (query: Prisma.Sql) => {
      const text = query.strings.join("?");
      assert.match(text, /SET "celebratedAt"/);
      assert.match(text, /AND "celebratedAt" IS NULL/);
      assert.equal(text.includes("inboxReadAt"), false);
      assert.equal(text.includes("notifiedAt"), false);
      return [{ achievementId: "won" }];
    },
  };
  const ids = await claimUserAchievementTimestamp(prisma, {
    userId: "user-1",
    achievementIds: ["won", "already-claimed", "won"],
    column: "celebratedAt",
  });
  assert.deepEqual(ids, ["won"]);
});

test("claimUserAchievementTimestamp inbox-read does not write notifiedAt", async () => {
  const prisma = {
    $queryRaw: async (query: Prisma.Sql) => {
      const text = query.strings.join("?");
      assert.match(text, /SET "inboxReadAt"/);
      assert.match(text, /AND "inboxReadAt" IS NULL/);
      assert.equal(text.includes("notifiedAt"), false);
      assert.equal(text.includes("celebratedAt"), false);
      return [{ achievementId: "a" }, { achievementId: "b" }];
    },
  };
  const ids = await claimUserAchievementTimestamp(prisma, {
    userId: "user-1",
    achievementIds: ["a", "b"],
    column: "inboxReadAt",
  });
  assert.deepEqual(ids, ["a", "b"]);
});
