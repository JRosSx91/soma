/**
 * Live PostgreSQL MissionsService (GAM-02C). No HTTP.
 * Skips when DATABASE_URL is unset, unreachable, or MissionCompletion is missing.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  MISSION_XP_AMOUNT,
  PROGRESS_XP_MAX,
  getMissionById,
  type MissionDefinition,
} from "@soma/shared-types";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProgressService } from "../progress/progress.service.js";
import { createId } from "../auth/create-id.js";
import { MissionsService } from "./missions.service.js";

const PASSWORD = "missions-api-pass-1";
const DOPAMINE = "edu-dopamine-01";
const GABA = "edu-gaba-01";
const SEROTONIN = "edu-serotonin-01";

function loadLocalEnvFile(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(process.cwd(), ".env"), join(here, "../../.env")];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
    break;
  }
}

loadLocalEnvFile();

async function withLiveDb(
  run: (missions: MissionsService, prisma: PrismaClient, progress: ProgressService) => Promise<void>,
): Promise<"ran" | "skipped"> {
  if (!process.env.DATABASE_URL) return "skipped";
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$queryRaw`SELECT "sourceKey" FROM "XpGrant" LIMIT 0`;
    await prisma.$queryRaw`SELECT "missionId" FROM "MissionCompletion" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    return "skipped";
  }

  try {
    const prismaSvc = prisma as unknown as PrismaService;
    const progress = new ProgressService(prismaSvc);
    await run(new MissionsService(prismaSvc, progress), prisma, progress);
    return "ran";
  } finally {
    await prisma.$disconnect().catch(() => undefined);
  }
}

async function createTestUser(
  prisma: PrismaClient,
  label: string,
): Promise<{ id: string }> {
  const id = createId();
  await prisma.user.create({
    data: {
      id,
      email: `missions-${label}-${id}@example.test`,
      hashedPassword: await bcrypt.hash(PASSWORD, 4),
      displayName: "Missions Api",
      biologicalSex: "female",
      birthYear: 1991,
    },
  });
  return { id };
}

async function totalXp(prisma: PrismaClient, userId: string): Promise<number> {
  const row = await prisma.userProgression.findUnique({ where: { userId } });
  return Number(row?.totalXp ?? 0n);
}

async function grantCount(
  prisma: PrismaClient,
  userId: string,
  missionId: string,
): Promise<number> {
  return prisma.xpGrant.count({
    where: { userId, source: "mission_complete", sourceKey: missionId },
  });
}

async function completionCount(
  prisma: PrismaClient,
  userId: string,
  missionId?: string,
): Promise<number> {
  return prisma.missionCompletion.count({
    where: missionId ? { userId, missionId } : { userId },
  });
}

test("pg service: first correct answer completes once and grants 12 XP", async (t) => {
  const result = await withLiveDb(async (missions, prisma) => {
    const user = await createTestUser(prisma, "correct");
    try {
      const outcome = await missions.submitAnswer(user.id, {
        missionId: DOPAMINE,
        selectedOptionId: "wanting",
      });
      assert.deepEqual(outcome, {
        ok: true,
        result: {
          correct: true,
          completed: true,
          alreadyCompleted: false,
          xpGranted: MISSION_XP_AMOUNT,
        },
      });
      assert.equal(await missions.hasCompleted(user.id, DOPAMINE), true);
      assert.equal(await totalXp(prisma, user.id), 12);
      assert.equal(await grantCount(prisma, user.id, DOPAMINE), 1);
      assert.equal(await completionCount(prisma, user.id, DOPAMINE), 1);
      const grant = await prisma.xpGrant.findUniqueOrThrow({
        where: {
          userId_source_sourceKey: {
            userId: user.id,
            source: "mission_complete",
            sourceKey: DOPAMINE,
          },
        },
      });
      assert.equal(grant.amount, 12);
      const listed = await missions.listCompleted(user.id);
      assert.equal(listed.length, 1);
      assert.equal(listed[0]?.missionId, DOPAMINE);
      assert.equal(listed[0]?.state, "completed");
      assert.equal(listed[0]?.contentVersion, 1);
    } finally {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable or mission completion migration not applied");
  }
});

test("pg service: known incorrect answer does not persist or grant XP", async (t) => {
  const result = await withLiveDb(async (missions, prisma) => {
    const user = await createTestUser(prisma, "wrong");
    try {
      const outcome = await missions.submitAnswer(user.id, {
        missionId: DOPAMINE,
        selectedOptionId: "pleasure",
      });
      assert.deepEqual(outcome, {
        ok: true,
        result: {
          correct: false,
          completed: false,
          alreadyCompleted: false,
          xpGranted: 0,
        },
      });
      assert.equal(await completionCount(prisma, user.id, DOPAMINE), 0);
      assert.equal(await grantCount(prisma, user.id, DOPAMINE), 0);
      const retry = await missions.submitAnswer(user.id, {
        missionId: DOPAMINE,
        selectedOptionId: "wanting",
      });
      assert.equal(retry.ok, true);
      if (retry.ok) {
        assert.equal(retry.result.xpGranted, 12);
        assert.equal(retry.result.completed, true);
      }
      assert.equal(await completionCount(prisma, user.id, DOPAMINE), 1);
    } finally {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable or mission completion migration not applied");
  }
});

test("pg service: unknown option and unknown mission are rejected without writes", async (t) => {
  const result = await withLiveDb(async (missions, prisma) => {
    const user = await createTestUser(prisma, "reject");
    try {
      assert.deepEqual(
        await missions.submitAnswer(user.id, {
          missionId: DOPAMINE,
          selectedOptionId: "not-an-option",
        }),
        { ok: false, reason: "unknown_option" },
      );
      assert.deepEqual(
        await missions.submitAnswer(user.id, {
          missionId: "edu-unknown-01",
          selectedOptionId: "wanting",
        }),
        { ok: false, reason: "unknown_mission" },
      );
      assert.equal(await completionCount(prisma, user.id), 0);
      assert.equal(await prisma.xpGrant.count({ where: { userId: user.id } }), 0);
      assert.equal(await totalXp(prisma, user.id), 0);
    } finally {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable or mission completion migration not applied");
  }
});

test("pg service: unpublished mission is rejected without writes", async (t) => {
  const result = await withLiveDb(async (missions, prisma) => {
    const user = await createTestUser(prisma, "draft");
    const published = getMissionById(DOPAMINE);
    assert.ok(published);
    const draftCatalog: readonly MissionDefinition[] = [{ ...published, status: "draft" }];
    try {
      assert.deepEqual(
        await missions.submitAnswer(
          user.id,
          { missionId: DOPAMINE, selectedOptionId: "wanting" },
          { catalog: draftCatalog },
        ),
        { ok: false, reason: "unpublished_mission" },
      );
      assert.equal(await completionCount(prisma, user.id, DOPAMINE), 0);
      assert.equal(await grantCount(prisma, user.id, DOPAMINE), 0);
    } finally {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable or mission completion migration not applied");
  }
});

test("pg service: repeating a correct answer is idempotent", async (t) => {
  const result = await withLiveDb(async (missions, prisma) => {
    const user = await createTestUser(prisma, "repeat");
    try {
      await missions.submitAnswer(user.id, {
        missionId: GABA,
        selectedOptionId: "network_brake",
      });
      const second = await missions.submitAnswer(user.id, {
        missionId: GABA,
        selectedOptionId: "network_brake",
      });
      assert.deepEqual(second, {
        ok: true,
        result: {
          correct: true,
          completed: true,
          alreadyCompleted: true,
          xpGranted: 0,
        },
      });
      assert.equal(await completionCount(prisma, user.id, GABA), 1);
      assert.equal(await grantCount(prisma, user.id, GABA), 1);
      assert.equal(await totalXp(prisma, user.id), 12);
    } finally {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable or mission completion migration not applied");
  }
});

test("pg service: concurrent correct answers complete and grant XP once", async (t) => {
  const result = await withLiveDb(async (missions, prisma) => {
    const user = await createTestUser(prisma, "race");
    try {
      const [a, b] = await Promise.all([
        missions.submitAnswer(user.id, {
          missionId: SEROTONIN,
          selectedOptionId: "many_systems",
        }),
        missions.submitAnswer(user.id, {
          missionId: SEROTONIN,
          selectedOptionId: "many_systems",
        }),
      ]);
      assert.equal(a.ok, true);
      assert.equal(b.ok, true);
      if (a.ok && b.ok) {
        const granted = [a.result, b.result].filter((row) => row.xpGranted === 12);
        const duplicates = [a.result, b.result].filter((row) => row.alreadyCompleted);
        assert.equal(granted.length, 1);
        assert.equal(duplicates.length, 1);
        assert.ok([a.result, b.result].every((row) => row.completed && row.correct));
      }
      assert.equal(await completionCount(prisma, user.id, SEROTONIN), 1);
      assert.equal(await grantCount(prisma, user.id, SEROTONIN), 1);
      assert.equal(await totalXp(prisma, user.id), 12);
    } finally {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable or mission completion migration not applied");
  }
});

test("pg service: completions and XP stay isolated between users", async (t) => {
  const result = await withLiveDb(async (missions, prisma) => {
    const a = await createTestUser(prisma, "iso-a");
    const b = await createTestUser(prisma, "iso-b");
    try {
      await missions.submitAnswer(a.id, {
        missionId: DOPAMINE,
        selectedOptionId: "wanting",
      });
      assert.equal(await missions.hasCompleted(b.id, DOPAMINE), false);
      assert.equal(await totalXp(prisma, b.id), 0);
      assert.equal(await grantCount(prisma, b.id, DOPAMINE), 0);
      assert.equal((await missions.listCompleted(b.id)).length, 0);

      await missions.submitAnswer(b.id, {
        missionId: DOPAMINE,
        selectedOptionId: "wanting",
      });
      assert.equal(await totalXp(prisma, a.id), 12);
      assert.equal(await totalXp(prisma, b.id), 12);
      assert.equal(await completionCount(prisma, a.id, DOPAMINE), 1);
      assert.equal(await completionCount(prisma, b.id, DOPAMINE), 1);
    } finally {
      await prisma.user.delete({ where: { id: a.id } }).catch(() => undefined);
      await prisma.user.delete({ where: { id: b.id } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable or mission completion migration not applied");
  }
});

test("pg service: first completion at the XP ceiling records the mission without a grant", async (t) => {
  const result = await withLiveDb(async (missions, prisma) => {
    const user = await createTestUser(prisma, "capped");
    const nearCap = BigInt(PROGRESS_XP_MAX) - 5n;
    try {
      await prisma.userProgression.create({
        data: {
          userId: user.id,
          totalXp: nearCap,
          equippedTitleId: null,
          updatedAt: new Date(),
        },
      });
      const outcome = await missions.submitAnswer(user.id, {
        missionId: GABA,
        selectedOptionId: "network_brake",
      });
      assert.deepEqual(outcome, {
        ok: true,
        result: {
          correct: true,
          completed: true,
          alreadyCompleted: false,
          xpGranted: 0,
        },
      });
      assert.equal(await completionCount(prisma, user.id, GABA), 1);
      assert.equal(await grantCount(prisma, user.id, GABA), 0);
      assert.equal(await prisma.xpGrant.count({ where: { userId: user.id } }), 0);
      assert.equal(await totalXp(prisma, user.id), PROGRESS_XP_MAX - 5);

      const repeat = await missions.submitAnswer(user.id, {
        missionId: GABA,
        selectedOptionId: "network_brake",
      });
      assert.deepEqual(repeat, {
        ok: true,
        result: {
          correct: true,
          completed: true,
          alreadyCompleted: true,
          xpGranted: 0,
        },
      });
      assert.equal(await completionCount(prisma, user.id, GABA), 1);
      assert.equal(await grantCount(prisma, user.id, GABA), 0);
      assert.equal(await totalXp(prisma, user.id), PROGRESS_XP_MAX - 5);
    } finally {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable or mission completion migration not applied");
  }
});

test("pg service: XP grant failure rolls back the completion", async (t) => {
  const result = await withLiveDb(async (_missions, prisma) => {
    const user = await createTestUser(prisma, "rollback");
    const prismaSvc = prisma as unknown as PrismaService;
    const boom = {
      awardXp: async () => {
        throw new Error("forced-xp-failure");
      },
    } as unknown as ProgressService;
    const missions = new MissionsService(prismaSvc, boom);
    try {
      await assert.rejects(
        () =>
          missions.submitAnswer(user.id, {
            missionId: DOPAMINE,
            selectedOptionId: "wanting",
          }),
        /forced-xp-failure/,
      );
      assert.equal(await completionCount(prisma, user.id, DOPAMINE), 0);
      assert.equal(await grantCount(prisma, user.id, DOPAMINE), 0);
      assert.equal(await totalXp(prisma, user.id), 0);
    } finally {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable or mission completion migration not applied");
  }
});

test("pg service: stores contentVersion and a later version does not duplicate XP", async (t) => {
  const result = await withLiveDb(async (missions, prisma) => {
    const user = await createTestUser(prisma, "version");
    const published = getMissionById(DOPAMINE);
    assert.ok(published);
    try {
      await missions.submitAnswer(user.id, {
        missionId: DOPAMINE,
        selectedOptionId: "wanting",
      });
      const stored = await prisma.missionCompletion.findUniqueOrThrow({
        where: { userId_missionId: { userId: user.id, missionId: DOPAMINE } },
      });
      assert.equal(stored.contentVersion, 1);

      const v2: readonly MissionDefinition[] = [{ ...published, contentVersion: 2 }];
      const again = await missions.submitAnswer(
        user.id,
        { missionId: DOPAMINE, selectedOptionId: "wanting" },
        { catalog: v2 },
      );
      assert.deepEqual(again, {
        ok: true,
        result: {
          correct: true,
          completed: true,
          alreadyCompleted: true,
          xpGranted: 0,
        },
      });
      const after = await prisma.missionCompletion.findUniqueOrThrow({
        where: { userId_missionId: { userId: user.id, missionId: DOPAMINE } },
      });
      assert.equal(after.contentVersion, 1);
      assert.equal(await grantCount(prisma, user.id, DOPAMINE), 1);
      assert.equal(await completionCount(prisma, user.id, DOPAMINE), 1);
      assert.equal(await totalXp(prisma, user.id), 12);
    } finally {
      await prisma.user.delete({ where: { id: user.id } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable or mission completion migration not applied");
  }
});
