/**
 * Real PostgreSQL integration for User.onboardingStatus.
 * Skips when DATABASE_URL is unset or unreachable.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { BadRequestException } from "@nestjs/common";
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

  // Ensure migration column exists before exercising behaviour.
  try {
    await prisma.$queryRaw`SELECT "onboardingStatus" FROM "User" LIMIT 0`;
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

test("pg: User.onboardingStatus column exists", async (t) => {
  const result = await withLiveDb(async ({ prisma }) => {
    const cols = await prisma.$queryRaw<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'User'
        AND column_name = 'onboardingStatus'
    `;
    assert.equal(cols.length, 1);
  });
  if (result === "skipped") t.skip("DATABASE_URL unavailable or migration not applied");
});

test("pg: new user defaults to pending", async (t) => {
  const result = await withLiveDb(async ({ prisma, service }) => {
    const userId = createId();
    const email = `ob-pending-${userId}@example.test`;
    try {
      await prisma.user.create({
        data: {
          id: userId,
          email,
          hashedPassword: await hash("password12", 4),
          displayName: "OB Pending",
          biologicalSex: "female",
          birthYear: 1992,
        },
      });
      const profile = await service.getProfile(userId);
      assert.equal(profile.onboardingStatus, OnboardingStatus.pending);
      assert.equal(profile.usages.length, 0);
    } finally {
      await prisma.substanceUsage.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
  });
  if (result === "skipped") t.skip("DATABASE_URL unavailable or migration not applied");
});

test("pg: status persists across getProfile calls (new session)", async (t) => {
  const result = await withLiveDb(async ({ prisma, service }) => {
    const userId = createId();
    const email = `ob-persist-${userId}@example.test`;
    try {
      await prisma.user.create({
        data: {
          id: userId,
          email,
          hashedPassword: await hash("password12", 4),
          displayName: "OB Persist",
          biologicalSex: "male",
          birthYear: 1988,
        },
      });
      await service.updateOnboardingStatus(userId, OnboardingStatus.skipped);
      const again = new ProfileService(prisma as never);
      const profile = await again.getProfile(userId);
      assert.equal(profile.onboardingStatus, OnboardingStatus.skipped);
    } finally {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
  });
  if (result === "skipped") t.skip("DATABASE_URL unavailable or migration not applied");
});

test("pg: upsert usages does not alter onboardingStatus; empty PUT clears only usages", async (t) => {
  const result = await withLiveDb(async ({ prisma, service }) => {
    const userId = createId();
    const email = `ob-usages-${userId}@example.test`;
    try {
      await prisma.user.create({
        data: {
          id: userId,
          email,
          hashedPassword: await hash("password12", 4),
          displayName: "OB Usages",
          biologicalSex: "male",
          birthYear: 1990,
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
      let profile = await service.getProfile(userId);
      assert.equal(profile.onboardingStatus, OnboardingStatus.completed);
      assert.equal(profile.usages.length, 1);

      profile = await service.upsertProfile(userId, { usages: [] });
      assert.equal(profile.onboardingStatus, OnboardingStatus.completed);
      assert.equal(profile.usages.length, 0);
    } finally {
      await prisma.substanceUsage.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
  });
  if (result === "skipped") t.skip("DATABASE_URL unavailable or migration not applied");
});

test("pg: invalid transition rejected; users isolated", async (t) => {
  const result = await withLiveDb(async ({ prisma, service }) => {
    const a = createId();
    const b = createId();
    try {
      await prisma.user.create({
        data: {
          id: a,
          email: `ob-a-${a}@example.test`,
          hashedPassword: await hash("password12", 4),
          displayName: "A",
          biologicalSex: "male",
          birthYear: 1990,
          onboardingStatus: OnboardingStatus.completed,
        },
      });
      await prisma.user.create({
        data: {
          id: b,
          email: `ob-b-${b}@example.test`,
          hashedPassword: await hash("password12", 4),
          displayName: "B",
          biologicalSex: "female",
          birthYear: 1991,
          onboardingStatus: OnboardingStatus.pending,
        },
      });

      await assert.rejects(
        () => service.updateOnboardingStatus(a, OnboardingStatus.pending),
        (err: unknown) => err instanceof BadRequestException,
      );

      await service.updateOnboardingStatus(b, OnboardingStatus.skipped);
      const profileA = await service.getProfile(a);
      const profileB = await service.getProfile(b);
      assert.equal(profileA.onboardingStatus, OnboardingStatus.completed);
      assert.equal(profileB.onboardingStatus, OnboardingStatus.skipped);
    } finally {
      await prisma.user.deleteMany({ where: { id: { in: [a, b] } } });
    }
  });
  if (result === "skipped") t.skip("DATABASE_URL unavailable or migration not applied");
});

test("pg: backfill semantics — usage rows imply completed when set explicitly in SQL style", async (t) => {
  /**
   * Migration already ran for the DB. This test documents the policy by
   * simulating the backfill predicate for a user created with usages.
   */
  const result = await withLiveDb(async ({ prisma }) => {
    const userId = createId();
    try {
      await prisma.user.create({
        data: {
          id: userId,
          email: `ob-bf-${userId}@example.test`,
          hashedPassword: await hash("password12", 4),
          displayName: "BF",
          biologicalSex: "male",
          birthYear: 1990,
          onboardingStatus: OnboardingStatus.pending,
        },
      });
      const substances = await prisma.substance.findMany({ take: 1 });
      if (substances.length === 0) {
        t.skip("no catalog substances seeded");
        return;
      }
      await prisma.substanceUsage.create({
        data: {
          userId,
          substanceId: substances[0]!.id,
          yearStarted: 2018,
          frequency: "weekly",
          status: "abstinent",
          lastUseDate: new Date("2024-01-01"),
        },
      });

      // Same predicate as the migration UPDATE.
      await prisma.$executeRaw`
        UPDATE "User" AS u
        SET "onboardingStatus" = 'completed'
        WHERE u."id" = ${userId}
          AND EXISTS (
            SELECT 1 FROM "SubstanceUsage" su WHERE su."userId" = u."id"
          )
      `;

      const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
      assert.equal(user.onboardingStatus, OnboardingStatus.completed);
    } finally {
      await prisma.substanceUsage.deleteMany({ where: { userId } });
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
  });
  if (result === "skipped") t.skip("DATABASE_URL unavailable or migration not applied");
});
