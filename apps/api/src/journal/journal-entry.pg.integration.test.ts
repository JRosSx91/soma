/**
 * Live PostgreSQL JournalEntry persistence (JRN-01C). No HTTP.
 * Skips when DATABASE_URL is unset, unreachable, or the table is missing.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import {
  JOURNAL_EMOTION_IDS,
  JOURNAL_TRIGGER_IDS,
  civilDateToUtcDate,
  utcDateToCivilDate,
} from "@soma/shared-types";
import { seedSubstances } from "../../prisma/seed/substances.js";
import { createId } from "../auth/create-id.js";

const PASSWORD = "journal-persist-pass-1";

async function withLiveDb(
  run: (prisma: PrismaClient) => Promise<void>,
): Promise<"ran" | "skipped"> {
  if (!process.env.DATABASE_URL) return "skipped";
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$queryRaw`SELECT "occurredOn" FROM "JournalEntry" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    return "skipped";
  }

  try {
    await run(prisma);
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
      email: `journal-${label}-${id}@example.test`,
      hashedPassword: await bcrypt.hash(PASSWORD, 4),
      displayName: "Journal Persist",
      biologicalSex: "female",
      birthYear: 1991,
    },
  });
  return { id };
}

test("pg: several journal rows share a civil date for one user", async (t) => {
  const result = await withLiveDb(async (prisma) => {
    const { id: userId } = await createTestUser(prisma, "same-day");
    const occurredOn = civilDateToUtcDate("2026-04-29");
    try {
      const first = await prisma.journalEntry.create({
        data: {
          userId,
          occurredOn,
          mood: 4,
          title: "Morning",
        },
      });
      const second = await prisma.journalEntry.create({
        data: {
          userId,
          occurredOn,
          energy: 2,
          body: "Later the same civil day",
        },
      });
      assert.notEqual(first.id, second.id);
      assert.equal(utcDateToCivilDate(first.occurredOn), "2026-04-29");
      assert.equal(utcDateToCivilDate(second.occurredOn), "2026-04-29");
      const count = await prisma.journalEntry.count({
        where: { userId, occurredOn },
      });
      assert.equal(count, 2);
    } finally {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
  });
  if (result === "skipped") t.skip("DATABASE_URL unavailable or journal migration not applied");
});

test("pg: journal row belongs to user; craving substance is optional catalog FK", async (t) => {
  const result = await withLiveDb(async (prisma) => {
    const { id: userId } = await createTestUser(prisma, "fk");
    try {
      const blank = await prisma.journalEntry.create({
        data: {
          userId,
          occurredOn: civilDateToUtcDate("2026-05-01"),
          body: "No craving substance",
        },
        include: { user: true, cravingSubstance: true },
      });
      assert.equal(blank.user.id, userId);
      assert.equal(blank.cravingSubstanceId, null);
      assert.equal(blank.cravingSubstance, null);
      assert.equal(blank.highlighted, false);
      assert.equal(blank.learning, false);
      assert.deepEqual(blank.emotionIds, []);
      assert.deepEqual(blank.triggerIds, []);

      let cannabis = await prisma.substance.findUnique({ where: { id: "cannabis" } });
      if (!cannabis) {
        await seedSubstances(prisma);
        cannabis = await prisma.substance.findUnique({ where: { id: "cannabis" } });
      }
      assert.ok(cannabis, "catalog substance cannabis must exist");

      const withCraving = await prisma.journalEntry.create({
        data: {
          userId,
          occurredOn: civilDateToUtcDate("2026-05-01"),
          cravingIntensity: 3,
          cravingSubstanceId: "cannabis",
          emotionIds: [JOURNAL_EMOTION_IDS[0]],
          triggerIds: [JOURNAL_TRIGGER_IDS[0]],
        },
        include: { cravingSubstance: true },
      });
      assert.equal(withCraving.cravingSubstance?.id, "cannabis");
      const usages = await prisma.substanceUsage.count({ where: { userId } });
      assert.equal(usages, 0);
    } finally {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
  });
  if (result === "skipped") t.skip("DATABASE_URL unavailable or journal migration not applied");
});

test("pg: deleting the user cascades journal rows; other users stay isolated", async (t) => {
  const result = await withLiveDb(async (prisma) => {
    const owner = await createTestUser(prisma, "cascade-a");
    const other = await createTestUser(prisma, "cascade-b");
    try {
      const owned = await prisma.journalEntry.create({
        data: {
          userId: owner.id,
          occurredOn: civilDateToUtcDate("2026-06-02"),
          title: "private-a",
        },
      });
      const kept = await prisma.journalEntry.create({
        data: {
          userId: other.id,
          occurredOn: civilDateToUtcDate("2026-06-02"),
          title: "private-b",
        },
      });

      const leaked = await prisma.journalEntry.findMany({
        where: { userId: other.id, id: owned.id },
      });
      assert.equal(leaked.length, 0);

      await prisma.user.delete({ where: { id: owner.id } });
      const after = await prisma.journalEntry.findUnique({ where: { id: owned.id } });
      assert.equal(after, null);
      const stillThere = await prisma.journalEntry.findUnique({ where: { id: kept.id } });
      assert.ok(stillThere);
      assert.equal(stillThere?.userId, other.id);
    } finally {
      await prisma.user.delete({ where: { id: other.id } }).catch(() => undefined);
      await prisma.user.delete({ where: { id: owner.id } }).catch(() => undefined);
    }
  });
  if (result === "skipped") t.skip("DATABASE_URL unavailable or journal migration not applied");
});
