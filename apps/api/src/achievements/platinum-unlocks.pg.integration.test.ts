/**
 * ACH-02B PostgreSQL checks against local soma only.
 * Creates throwaway users; never truncates or deletes other UserAchievement rows.
 * Never seeds or migrates production.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { platinumRequirementIds } from "@soma/shared-types";
import { createId } from "../auth/create-id.js";
import { persistSpecialCategoryGrant } from "../auth/special-category-consent.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { AchievementsService } from "./achievements.service.js";

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
    await prisma.$queryRaw`SELECT "tier", "hidden" FROM "Achievement" LIMIT 0`;
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
      email: `ach02b-${label}-${id}@example.test`,
      hashedPassword: await bcrypt.hash("ach02b-pass-9k2", 4),
      displayName: `ACH-02B ${label}`,
      biologicalSex: "female",
      birthYear: 1992,
    },
  });
  await persistSpecialCategoryGrant(prisma as unknown as PrismaService, id);
  return id;
}

test("ACH-02B PG: collection gate, same-pass grant, concurrency, preserve prior platinum", async (t) => {
  const outcome = await withLocalDb(async ({ prisma, service }) => {
    const platinum = await prisma.achievement.findUnique({
      where: { id: "alcohol-sovereignty-platinum" },
    });
    if (!platinum || platinum.tier !== "platinum") {
      t.skip("alcohol sovereignty platinum missing from local catalog");
      return;
    }

    const achievements = await prisma.achievement.findMany();
    const curves = await prisma.organRecoveryCurve.findMany();
    const required = platinumRequirementIds(
      achievements.map((item) => ({
        id: item.id,
        organId: item.triggerOrganId,
        substanceId: item.triggerSubstanceId,
        threshold: item.triggerRecoveryThreshold,
        family: item.family,
        abstinenceDays: item.triggerAbstinenceDays,
        tier: item.tier,
      })),
      curves,
      "alcohol",
    );
    assert.ok(required.length > 0);
    assert.equal(required.includes("alcohol-sovereignty-platinum"), false);

    const lastUse = new Date("2018-01-01T00:00:00.000Z");

    // Active use blocks new inserts; collection remains one medal short → no platinum.
    const incompleteUser = await createUser(prisma, "incomplete");
    await prisma.substanceUsage.create({
      data: {
        id: createId(),
        userId: incompleteUser,
        substanceId: "alcohol",
        status: "active",
        lastUseDate: null,
      },
    });
    await prisma.userAchievement.createMany({
      data: required.slice(0, -1).map((achievementId) => ({
        id: createId(),
        userId: incompleteUser,
        achievementId,
        unlockedAt: lastUse,
      })),
    });
    const incompleteIds = await service.detectAndPersistUnlocks(incompleteUser);
    assert.deepEqual(incompleteIds, []);
    const incompleteRow = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId: incompleteUser,
          achievementId: "alcohol-sovereignty-platinum",
        },
      },
    });
    assert.equal(incompleteRow, null);

    const completeUser = await createUser(prisma, "complete");
    await prisma.substanceUsage.create({
      data: {
        id: createId(),
        userId: completeUser,
        substanceId: "alcohol",
        status: "abstinent",
        lastUseDate: lastUse,
      },
    });
    const lastRequired = required[required.length - 1]!;
    await prisma.userAchievement.createMany({
      data: required.slice(0, -1).map((achievementId) => ({
        id: createId(),
        userId: completeUser,
        achievementId,
        unlockedAt: lastUse,
      })),
    });
    const completeIds = await service.detectAndPersistUnlocks(completeUser);
    assert.ok(
      completeIds.includes(lastRequired) || completeIds.includes("alcohol-sovereignty-platinum"),
    );
    assert.ok(completeIds.includes("alcohol-sovereignty-platinum"));

    const [a, b] = await Promise.all([
      service.detectAndPersistUnlocks(completeUser),
      service.detectAndPersistUnlocks(completeUser),
    ]);
    assert.deepEqual(a, []);
    assert.deepEqual(b, []);
    const platinumCount = await prisma.userAchievement.count({
      where: {
        userId: completeUser,
        achievementId: "alcohol-sovereignty-platinum",
      },
    });
    assert.equal(platinumCount, 1);

    const legacyUser = await createUser(prisma, "legacy-platinum");
    await prisma.substanceUsage.create({
      data: {
        id: createId(),
        userId: legacyUser,
        substanceId: "alcohol",
        status: "abstinent",
        lastUseDate: lastUse,
      },
    });
    const legacyUnlockedAt = new Date("2024-06-01T00:00:00.000Z");
    await prisma.userAchievement.create({
      data: {
        id: createId(),
        userId: legacyUser,
        achievementId: "alcohol-sovereignty-platinum",
        unlockedAt: legacyUnlockedAt,
      },
    });
    const legacyIds = await service.detectAndPersistUnlocks(legacyUser);
    assert.equal(legacyIds.includes("alcohol-sovereignty-platinum"), false);
    const legacyRow = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId: legacyUser,
          achievementId: "alcohol-sovereignty-platinum",
        },
      },
    });
    assert.equal(legacyRow?.unlockedAt.toISOString(), legacyUnlockedAt.toISOString());
  });

  if (outcome === "skipped") {
    t.skip("local DATABASE_URL with Achievement catalog not available");
  }
});
