/**
 * Real PostgreSQL integration for PATCH profile details.
 * Skips when DATABASE_URL is unset or unreachable.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { OnboardingStatus, PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { createId } from "../auth/create-id.js";
import { ProfileService } from "./profile.service.js";

async function withLiveDb(
  run: (ctx: {
    prisma: PrismaClient;
    service: ProfileService;
  }) => Promise<void>,
): Promise<"ran" | "skipped"> {
  if (!process.env.DATABASE_URL) return "skipped";
  const prisma = new PrismaClient();

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    return "skipped";
  }

  const service = new ProfileService(prisma as never);
  try {
    await run({ prisma, service });
    return "ran";
  } finally {
    await prisma.$disconnect().catch(() => undefined);
  }
}

test("pg: updateProfileDetails persists fields and preserves usages/status", async (t) => {
  const result = await withLiveDb(async ({ prisma, service }) => {
    const userId = createId();
    const email = `details-${userId}@example.test`;
    try {
      await prisma.user.create({
        data: {
          id: userId,
          email,
          hashedPassword: await hash("password12", 4),
          displayName: "Before",
          biologicalSex: "male",
          birthYear: 1990,
          weightKg: 80,
          onboardingStatus: OnboardingStatus.completed,
        },
      });

      const substances = await prisma.substance.findMany({ take: 1 });
      if (substances.length === 0) {
        t.skip("no catalog substances seeded");
        return;
      }
      const substanceId = substances[0]!.id;

      await service.upsertProfile(userId, {
        usages: [
          {
            substanceId,
            yearStarted: 2015,
            frequency: "daily",
            status: "abstinent",
            lastUseDate: "2024-06-01",
          },
        ],
      });

      const updated = await service.updateProfileDetails(userId, {
        displayName: "After",
        biologicalSex: "female",
        birthYear: 1988,
        weightKg: null,
      });

      assert.equal(updated.user.displayName, "After");
      assert.equal(updated.user.biologicalSex, "female");
      assert.equal(updated.user.birthYear, 1988);
      assert.equal(updated.user.weightKg, null);
      assert.equal(updated.user.email, email);
      assert.equal(updated.onboardingStatus, OnboardingStatus.completed);
      assert.equal(updated.usages.length, 1);
      assert.equal(updated.usages[0]?.substanceId, substanceId);

      const reloaded = await service.getProfile(userId);
      assert.equal(reloaded.user.displayName, "After");
      assert.equal(reloaded.onboardingStatus, OnboardingStatus.completed);
      assert.equal(reloaded.usages.length, 1);
    } finally {
      await prisma.substanceUsage.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable");
  }
});

test("pg: updateProfileDetails persists decimal weightKg 68.5", async (t) => {
  const result = await withLiveDb(async ({ prisma, service }) => {
    const userId = createId();
    try {
      await prisma.user.create({
        data: {
          id: userId,
          email: `details-w-${userId}@example.test`,
          hashedPassword: await hash("password12", 4),
          displayName: "Weight",
          biologicalSex: "male",
          birthYear: 1990,
          weightKg: null,
        },
      });

      const updated = await service.updateProfileDetails(userId, {
        weightKg: 68.5,
      });
      assert.equal(updated.user.weightKg, 68.5);

      const row = await prisma.user.findUnique({ where: { id: userId } });
      assert.equal(row?.weightKg, 68.5);
    } finally {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable");
  }
});

test("pg: updateProfileDetails does not mutate another user", async (t) => {
  const result = await withLiveDb(async ({ prisma, service }) => {
    const idA = createId();
    const idB = createId();
    try {
      await prisma.user.create({
        data: {
          id: idA,
          email: `details-a-${idA}@example.test`,
          hashedPassword: await hash("password12", 4),
          displayName: "UserA",
          biologicalSex: "male",
          birthYear: 1990,
        },
      });
      await prisma.user.create({
        data: {
          id: idB,
          email: `details-b-${idB}@example.test`,
          hashedPassword: await hash("password12", 4),
          displayName: "UserB",
          biologicalSex: "female",
          birthYear: 1991,
        },
      });

      await service.updateProfileDetails(idA, { displayName: "ChangedA" });
      const b = await service.getProfile(idB);
      assert.equal(b.user.displayName, "UserB");
    } finally {
      await prisma.user.delete({ where: { id: idA } }).catch(() => undefined);
      await prisma.user.delete({ where: { id: idB } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable");
  }
});
