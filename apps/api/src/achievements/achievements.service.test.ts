import assert from "node:assert/strict";
import { test } from "node:test";
import { AchievementsService } from "./achievements.service.js";

test("detectAndPersistUnlocks does not insert without an active grant", async () => {
  let inserted = 0;
  const prisma = {
    $queryRaw: async () => [{ id: "user-1" }],
    $transaction: async (fn: (tx: typeof prisma) => Promise<string[]>) =>
      fn(prisma),
    registrationAcceptance: {
      findMany: async () => [],
    },
    substanceUsage: {
      findMany: async () => [
        {
          substanceId: "nicotine",
          status: "abstinent",
          lastUseDate: new Date("2026-01-01"),
        },
      ],
    },
    organRecoveryCurve: { findMany: async () => [] },
    achievement: { findMany: async () => [] },
    userAchievement: {
      findMany: async () => [],
      createMany: async () => {
        inserted += 1;
        return { count: 1 };
      },
    },
  };
  const service = new AchievementsService(prisma as never);
  const ids = await service.detectAndPersistUnlocks("user-1");
  assert.deepEqual(ids, []);
  assert.equal(inserted, 0);
});


test("getUserAchievements maps detectedAt from createdAt and insertedThisCall from RETURNING", async () => {
  const createdAt = new Date("2026-10-25T12:00:00.000Z");
  const unlockedAt = new Date("2026-10-11T00:00:00.000Z");
  const prisma = {
    achievement: {
      findMany: async () => [
        {
          id: "nic-a",
          tier: "bronze",
          titleKey: "t",
          descriptionKey: "d",
          triggerOrganId: "lungs",
          triggerSubstanceId: "nicotine",
          triggerRecoveryThreshold: 0.1,
          hidden: false,
        },
        {
          id: "nic-b",
          tier: "bronze",
          titleKey: "t2",
          descriptionKey: "d2",
          triggerOrganId: "mouth",
          triggerSubstanceId: "nicotine",
          triggerRecoveryThreshold: 0.2,
          hidden: false,
        },
      ],
    },
    userAchievement: {
      findMany: async () => [
        {
          achievementId: "nic-a",
          unlockedAt,
          notifiedAt: null,
          createdAt,
          inboxReadAt: null,
          celebratedAt: null,
        },
        {
          achievementId: "nic-b",
          unlockedAt,
          notifiedAt: new Date("2026-10-20T00:00:00.000Z"),
          createdAt,
          inboxReadAt: new Date("2026-10-20T00:00:00.000Z"),
          celebratedAt: new Date("2026-10-20T00:00:00.000Z"),
        },
      ],
    },
    organRecoveryCurve: { findMany: async () => [] },
    substanceUsage: { findMany: async () => [] },
  };

  const service = new AchievementsService(prisma as never);
  const rows = await service.getUserAchievements("user-1", ["nic-a"]);
  const a = rows.find((row) => row.id === "nic-a");
  const b = rows.find((row) => row.id === "nic-b");
  assert.equal(a?.detectedAt?.toISOString(), createdAt.toISOString());
  assert.equal(a?.insertedThisCall, true);
  assert.equal(a?.inboxReadAt, null);
  assert.equal(a?.celebratedAt, null);
  assert.equal(b?.insertedThisCall, false);
  assert.ok(b?.notifiedAt);
  assert.ok(b?.inboxReadAt);
  assert.ok(b?.celebratedAt);
});

test("markInboxRead returns only claimed ids from the persist helper", async () => {
  const prisma = {
    $queryRaw: async () => [{ achievementId: "own" }],
  };
  const service = new AchievementsService(prisma as never);
  const result = await service.markInboxRead("user-1", ["own", "foreign"]);
  assert.deepEqual(result, { updated: 1, readIds: ["own"] });
});

test("claimCelebrations returns ids won by this request", async () => {
  const prisma = {
    $queryRaw: async () => [{ achievementId: "new-live" }],
  };
  const service = new AchievementsService(prisma as never);
  const result = await service.claimCelebrations("user-1", [
    "new-live",
    "already",
  ]);
  assert.deepEqual(result, { celebratedIds: ["new-live"] });
});

test("markAsNotified still updates notifiedAt only via updateMany", async () => {
  let where: unknown;
  let data: unknown;
  const prisma = {
    userAchievement: {
      updateMany: async (args: { where: unknown; data: unknown }) => {
        where = args.where;
        data = args.data;
        return { count: 2 };
      },
    },
  };
  const service = new AchievementsService(prisma as never);
  const result = await service.markAsNotified("user-1", ["a", "b"]);
  assert.deepEqual(result, { updated: 2 });
  assert.deepEqual(where, {
    userId: "user-1",
    achievementId: { in: ["a", "b"] },
    notifiedAt: null,
  });
  assert.equal(typeof (data as { notifiedAt: Date }).notifiedAt.getTime, "function");
});
