/**
 * GAME-01 PostgreSQL checks against local soma only.
 * Creates throwaway users; never truncates or deletes other UserAchievement rows.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { createId } from "../auth/create-id.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { upsertTemporalAchievements } from "../../prisma/seed/achievements.js";
import { AchievementsService } from "./achievements.service.js";

const MS_DAY = 86_400_000;

function isLocalPostgresUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    return false;
  }
  const host = url.hostname.toLowerCase();
  const allowed = new Set(["localhost", "127.0.0.1", "::1", "host.docker.internal"]);
  if (!allowed.has(host)) return false;
  return !/prod|staging|amazonaws|neon\.tech|supabase|railway|render\.com|heroku|fly\.io/.test(
    raw.toLowerCase(),
  );
}

async function withLocalDb(
  run: (ctx: { prisma: PrismaClient; service: AchievementsService }) => Promise<void>,
): Promise<"ran" | "skipped"> {
  const url = process.env.DATABASE_URL;
  if (!url) return "skipped";
  if (!isLocalPostgresUrl(url)) return "skipped";
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$queryRaw`SELECT "family", "triggerAbstinenceDays" FROM "Achievement" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    return "skipped";
  }
  const service = new AchievementsService(prisma as unknown as PrismaService);
  try {
    await run({ prisma, service });
    return "ran";
  } finally {
    await prisma.$disconnect().catch(() => undefined);
  }
}

async function createUser(prisma: PrismaClient, label: string): Promise<string> {
  const id = createId();
  await prisma.user.create({
    data: {
      id,
      email: `game01-${label}-${id}@example.test`,
      hashedPassword: await bcrypt.hash("game01-pass-9k2", 4),
      displayName: `GAME-01 ${label}`,
      biologicalSex: "female",
      birthYear: 1992,
    },
  });
  return id;
}

async function putUsage(
  prisma: PrismaClient,
  userId: string,
  substanceId: string,
  status: "abstinent" | "active",
  lastUseDate: Date | null,
): Promise<void> {
  const existing = await prisma.substanceUsage.findFirst({
    where: { userId, substanceId },
  });
  if (existing) {
    await prisma.substanceUsage.update({
      where: { id: existing.id },
      data: { status, lastUseDate },
    });
    return;
  }
  await prisma.substanceUsage.create({
    data: {
      userId,
      substanceId,
      yearStarted: 2020,
      frequency: "daily",
      status,
      lastUseDate,
    },
  });
}

test("pg: GAME-01 catalog shape, upsert idempotence, and family CHECK", async (t) => {
  const result = await withLocalDb(async ({ prisma }) => {
    const first = await upsertTemporalAchievements(prisma);
    const second = await upsertTemporalAchievements(prisma);
    assert.equal(first, 50);
    assert.equal(second, 50);

    const family = await prisma.achievement.groupBy({
      by: ["family"],
      _count: { _all: true },
    });
    const counts = Object.fromEntries(family.map((row) => [row.family, row._count._all]));
    assert.equal(counts.curve, 106);
    assert.equal(counts.temporal, 50);

    const curveBroken = await prisma.achievement.count({
      where: {
        family: "curve",
        OR: [
          { triggerOrganId: null },
          { triggerRecoveryThreshold: null },
          { triggerAbstinenceDays: { not: null } },
        ],
      },
    });
    const temporalBroken = await prisma.achievement.count({
      where: {
        family: "temporal",
        OR: [
          { triggerAbstinenceDays: null },
          { triggerOrganId: { not: null } },
          { triggerRecoveryThreshold: { not: null } },
        ],
      },
    });
    assert.equal(curveBroken, 0);
    assert.equal(temporalBroken, 0);

    await assert.rejects(
      prisma.achievement.create({
        data: {
          id: `game01-bad-${createId()}`,
          family: "temporal",
          tier: "bronze",
          titleKey: "x",
          descriptionKey: "y",
          triggerSubstanceId: "cannabis",
          triggerAbstinenceDays: 1,
          triggerOrganId: "lungs",
          triggerRecoveryThreshold: 0.1,
        },
      }),
    );
  });
  if (result === "skipped") t.skip("local DATABASE_URL unavailable or migration not applied");
});

test("pg: temporal unlocks A–F persist insert-only without mixing substances", async (t) => {
  const result = await withLocalDb(async ({ prisma, service }) => {
    const userId = await createUser(prisma, "clock");
    const otherUnlocks = await prisma.userAchievement.count({
      where: { userId: { not: userId } },
    });
    try {
      await putUsage(prisma, userId, "cannabis", "abstinent", new Date());
      await putUsage(prisma, userId, "nicotine", "abstinent", new Date());

      await prisma.substanceUsage.updateMany({
        where: { userId, substanceId: "cannabis" },
        data: { lastUseDate: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      });
      const insertedDay0 = await service.detectAndPersistUnlocks(userId);
      const temporalDay0 = insertedDay0.filter((id) => id.includes("-temporal-"));
      assert.deepEqual(temporalDay0, []);

      await prisma.substanceUsage.updateMany({
        where: { userId, substanceId: "cannabis" },
        data: { lastUseDate: new Date(Date.now() - 7 * MS_DAY) },
      });
      const insertedDay7 = await service.detectAndPersistUnlocks(userId);
      const cannabis7 = insertedDay7.filter((id) => id.startsWith("cannabis-temporal-")).sort();
      assert.deepEqual(cannabis7, [
        "cannabis-temporal-1",
        "cannabis-temporal-3",
        "cannabis-temporal-7",
      ]);
      assert.equal(insertedDay7.some((id) => id === "cannabis-temporal-14"), false);
      assert.equal(insertedDay7.some((id) => id.startsWith("nicotine-temporal-")), false);

      const again = await service.detectAndPersistUnlocks(userId);
      assert.equal(again.filter((id) => id.includes("-temporal-")).length, 0);

      const [firstRace, secondRace] = await Promise.all([
        service.detectAndPersistUnlocks(userId),
        service.detectAndPersistUnlocks(userId),
      ]);
      assert.equal(
        [...firstRace, ...secondRace].filter((id) => id.includes("-temporal-")).length,
        0,
      );

      const catalog = await service.getUserAchievements(userId, insertedDay7);
      assert.equal(Array.isArray(catalog), true);
      assert.equal(catalog.length, 156);
      const unlockedTemporal = catalog.filter(
        (row) => row.family === "temporal" && row.unlocked,
      );
      assert.equal(unlockedTemporal.length, 3);
      for (const row of unlockedTemporal) {
        assert.equal(row.triggerOrganId, null);
        assert.equal(row.triggerRecoveryThreshold, null);
        assert.ok((row.triggerAbstinenceDays ?? 0) > 0);
        assert.equal(row.insertedThisCall, insertedDay7.includes(row.id));
      }
      const curveRows = catalog.filter((row) => row.family === "curve");
      assert.equal(curveRows.length, 106);
      for (const row of curveRows) {
        assert.ok(row.triggerOrganId);
        assert.equal(typeof row.triggerRecoveryThreshold, "number");
        assert.equal(row.triggerAbstinenceDays, null);
      }

      await prisma.substanceUsage.updateMany({
        where: { userId, substanceId: "cannabis" },
        data: { status: "active" },
      });
      const afterActive = await service.detectAndPersistUnlocks(userId);
      assert.equal(afterActive.filter((id) => id.includes("-temporal-")).length, 0);
      const still = await prisma.userAchievement.findMany({
        where: { userId, achievementId: { startsWith: "cannabis-temporal-" } },
      });
      assert.equal(still.length, 3);

      await prisma.substanceUsage.updateMany({
        where: { userId, substanceId: "cannabis" },
        data: {
          status: "abstinent",
          lastUseDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
      });
      const afterDateCorrection = await service.detectAndPersistUnlocks(userId);
      assert.equal(afterDateCorrection.length, 0);
      assert.equal(
        await prisma.userAchievement.count({
          where: { userId, achievementId: { startsWith: "cannabis-temporal-" } },
        }),
        3,
      );
    } finally {
      await prisma.user.delete({ where: { id: userId } });
      assert.equal(
        await prisma.userAchievement.count({
          where: { userId: { not: userId } },
        }),
        otherUnlocks,
      );
    }
  });
  if (result === "skipped") t.skip("local DATABASE_URL unavailable or migration not applied");
});

test("pg: 365-day cannabis clock grants ten temporal medals and none of nicotine", async (t) => {
  const result = await withLocalDb(async ({ prisma, service }) => {
    const userId = await createUser(prisma, "year");
    try {
      await putUsage(
        prisma,
        userId,
        "cannabis",
        "abstinent",
        new Date(Date.now() - 365 * MS_DAY),
      );
      await putUsage(
        prisma,
        userId,
        "nicotine",
        "abstinent",
        new Date(Date.now() - 12 * 60 * 60 * 1000),
      );
      const [first, second] = await Promise.all([
        service.detectAndPersistUnlocks(userId),
        service.detectAndPersistUnlocks(userId),
      ]);
      const cannabis = [
        ...new Set(
          [...first, ...second].filter((id) => id.startsWith("cannabis-temporal-")),
        ),
      ];
      assert.equal(cannabis.length, 10);
      assert.equal(
        [...first, ...second].some((id) => id.startsWith("nicotine-temporal-")),
        false,
      );
      assert.equal(
        await prisma.userAchievement.count({
          where: { userId, achievementId: { startsWith: "cannabis-temporal-" } },
        }),
        10,
      );
      const third = await service.detectAndPersistUnlocks(userId);
      assert.equal(third.filter((id) => id.startsWith("cannabis-temporal-")).length, 0);
    } finally {
      await prisma.user.delete({ where: { id: userId } });
    }
  });
  if (result === "skipped") t.skip("local DATABASE_URL unavailable or migration not applied");
});
