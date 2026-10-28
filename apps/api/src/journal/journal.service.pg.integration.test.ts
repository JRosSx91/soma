/**
 * Live PostgreSQL JournalService (JRN-01D). No HTTP.
 * Skips when DATABASE_URL is unset, unreachable, or JournalEntry is missing.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service.js";
import { createId } from "../auth/create-id.js";
import { JournalService } from "./journal.service.js";
import type { CreateJournalEntryDto } from "./dto/create-journal-entry.dto.js";

const PASSWORD = "journal-api-pass-1";

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
  run: (journal: JournalService, prisma: PrismaClient) => Promise<void>,
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
    await run(new JournalService(prisma as unknown as PrismaService), prisma);
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
      email: `journal-api-${label}-${id}@example.test`,
      hashedPassword: await bcrypt.hash(PASSWORD, 4),
      displayName: "Journal Api",
      biologicalSex: "female",
      birthYear: 1991,
    },
  });
  return { id };
}

function createDto(
  over: Partial<CreateJournalEntryDto> & { occurredOn?: string } = {},
): CreateJournalEntryDto {
  return {
    occurredOn: "2026-04-29",
    mood: 3,
    ...over,
  } as CreateJournalEntryDto;
}

test("pg service: create, get own, foreign id is 404, patch, delete", async (t) => {
  const result = await withLiveDb(async (journal, prisma) => {
    const a = await createTestUser(prisma, "crud-a");
    const b = await createTestUser(prisma, "crud-b");
    try {
      const created = await journal.create(a.id, createDto({ title: "Morning" }));
      assert.equal(created.occurredOn, "2026-04-29");
      assert.equal(created.title, "Morning");
      assert.equal(created.mood, 3);

      const own = await journal.getOne(a.id, created.id);
      assert.equal(own.id, created.id);

      await assert.rejects(
        () => journal.getOne(b.id, created.id),
        NotFoundException,
      );
      await assert.rejects(
        () => journal.patch(b.id, created.id, { mood: 5 }),
        NotFoundException,
      );
      await assert.rejects(
        () => journal.remove(b.id, created.id),
        NotFoundException,
      );

      const patched = await journal.patch(a.id, created.id, { mood: 5, sleep: 2 });
      assert.equal(patched.mood, 5);
      assert.equal(patched.sleep, 2);

      await assert.rejects(
        () =>
          journal.patch(a.id, created.id, {
            mood: null,
            sleep: null,
            title: null,
            body: null,
            emotionIds: [],
            triggerIds: [],
            anxiety: null,
            energy: null,
            cravingIntensity: null,
          }),
        BadRequestException,
      );

      await journal.remove(a.id, created.id);
      await assert.rejects(() => journal.getOne(a.id, created.id), NotFoundException);
    } finally {
      await prisma.user.delete({ where: { id: a.id } }).catch(() => undefined);
      await prisma.user.delete({ where: { id: b.id } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable or journal migration not applied");
  }
});

test("pg service: empty create rejected; several same-day rows; list cursor; filters", async (t) => {
  const result = await withLiveDb(async (journal, prisma) => {
    const a = await createTestUser(prisma, "list-a");
    const b = await createTestUser(prisma, "list-b");
    try {
      await assert.rejects(
        () =>
          journal.create(a.id, {
            occurredOn: "2026-04-29",
            highlighted: true,
            learning: true,
          } as CreateJournalEntryDto),
        BadRequestException,
      );

      const day = "2026-07-10";
      const first = await journal.create(a.id, createDto({ occurredOn: day, title: "one" }));
      const second = await journal.create(a.id, createDto({
        occurredOn: day,
        title: "two",
        mood: undefined,
        body: "later",
      }));
      const third = await journal.create(a.id, createDto({
        occurredOn: day,
        title: "three",
        highlighted: true,
        learning: true,
      }));
      const older = await journal.create(a.id, createDto({
        occurredOn: "2026-07-09",
        title: "older",
      }));
      await journal.create(b.id, createDto({ occurredOn: day, title: "peer-secret" }));

      const page1 = await journal.list(a.id, { limit: 2 });
      assert.equal(page1.items.length, 2);
      assert.ok(page1.nextCursor);
      assert.equal(page1.items[0]?.id, third.id);
      assert.equal(page1.items[1]?.id, second.id);
      assert.ok(page1.items.every((row) => row.title !== "peer-secret"));

      const page2 = await journal.list(a.id, { limit: 2, cursor: page1.nextCursor! });
      assert.equal(page2.items.length, 2);
      assert.equal(page2.items[0]?.id, first.id);
      assert.equal(page2.items[1]?.id, older.id);
      const seen = new Set([
        ...page1.items.map((row) => row.id),
        ...page2.items.map((row) => row.id),
      ]);
      assert.equal(seen.size, 4);

      const highlighted = await journal.list(a.id, { highlighted: true });
      assert.equal(highlighted.items.length, 1);
      assert.equal(highlighted.items[0]?.id, third.id);

      const ranged = await journal.list(a.id, { from: day, to: day });
      assert.equal(ranged.items.length, 3);
      assert.ok(ranged.items.every((row) => row.occurredOn === day));
    } finally {
      await prisma.user.delete({ where: { id: a.id } }).catch(() => undefined);
      await prisma.user.delete({ where: { id: b.id } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable or journal migration not applied");
  }
});

test("pg service: export is complete and owner-only; wipe is owner-only", async (t) => {
  const result = await withLiveDb(async (journal, prisma) => {
    const a = await createTestUser(prisma, "export-a");
    const b = await createTestUser(prisma, "export-b");
    try {
      const titles = Array.from({ length: 12 }, (_, i) => `row-${i}`);
      for (const title of titles) {
        await journal.create(a.id, createDto({
          occurredOn: "2026-08-01",
          title,
        }));
      }
      await journal.create(b.id, createDto({
        occurredOn: "2026-08-01",
        title: "b-only",
      }));

      const sparse = await journal.create(a.id, createDto({
        occurredOn: "2026-08-02",
        mood: 2,
        title: undefined,
      }));
      assert.equal(sparse.title, null);
      assert.equal(sparse.body, null);
      assert.equal(sparse.sleep, null);

      const ownMilestone = await journal.createMilestone(a.id, {
        kind: "clarity",
        occurredOn: "2026-08-01",
        note: "Clearer morning",
      });
      await journal.createMilestone(b.id, {
        kind: "rest",
        occurredOn: "2026-08-01",
      });
      await assert.rejects(
        () => journal.getMilestone(b.id, ownMilestone.id),
        NotFoundException,
      );

      const exported = await journal.exportAll(a.id);
      assert.equal(exported.entries.length, 13);
      assert.equal(exported.personalMilestones.length, 1);
      assert.equal(exported.personalMilestones[0]?.kind, "clarity");
      assert.ok(exported.exportedAt);
      assert.ok(exported.entries.every((row) => row.title !== "b-only"));
      const sparseExported = exported.entries.find((row) => row.id === sparse.id);
      assert.equal(sparseExported?.mood, 2);
      assert.equal(sparseExported?.title, null);
      assert.equal(sparseExported?.body, null);
      assert.equal(sparseExported?.sleep, null);
      assert.equal(sparseExported?.cravingSubstanceId, null);
      assert.deepEqual(
        exported.entries
          .map((row) => row.title)
          .filter((title): title is string => title !== null)
          .sort(),
        [...titles].sort(),
      );

      await journal.wipeAll(a.id);
      const afterA = await journal.list(a.id, {});
      assert.equal(afterA.items.length, 0);
      assert.equal((await journal.listMilestones(a.id)).length, 0);
      const stillB = await journal.list(b.id, {});
      assert.equal(stillB.items.length, 1);
      assert.equal(stillB.items[0]?.title, "b-only");
      assert.equal((await journal.listMilestones(b.id)).length, 1);

      const usages = await prisma.substanceUsage.count({ where: { userId: a.id } });
      assert.equal(usages, 0);
      const user = await prisma.user.findUnique({ where: { id: a.id } });
      assert.ok(user);
    } finally {
      await prisma.user.delete({ where: { id: a.id } }).catch(() => undefined);
      await prisma.user.delete({ where: { id: b.id } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable or journal migration not applied");
  }
});

test("pg service: civil dates round-trip without timezone shift", async (t) => {
  const result = await withLiveDb(async (journal, prisma) => {
    const a = await createTestUser(prisma, "dates");
    try {
      const created = await journal.create(a.id, createDto({
        occurredOn: "2026-01-01",
        body: "new year",
      }));
      assert.equal(created.occurredOn, "2026-01-01");
      const patched = await journal.patch(a.id, created.id, {
        occurredOn: "2026-12-31",
      });
      assert.equal(patched.occurredOn, "2026-12-31");
      const stored = await prisma.journalEntry.findUnique({ where: { id: created.id } });
      assert.equal(stored?.occurredOn.toISOString(), "2026-12-31T00:00:00.000Z");
    } finally {
      await prisma.user.delete({ where: { id: a.id } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable or journal migration not applied");
  }
});

test("pg service: same occurredOn and createdAt tie-break by id DESC", async (t) => {
  const result = await withLiveDb(async (journal, prisma) => {
    const a = await createTestUser(prisma, "tie-id");
    try {
      const occurredOn = new Date("2026-03-03T00:00:00.000Z");
      const createdAt = new Date("2026-03-03T12:00:00.000Z");
      await prisma.journalEntry.create({
        data: {
          id: "jrn-tie-aaa",
          userId: a.id,
          occurredOn,
          createdAt,
          mood: 1,
        },
      });
      await prisma.journalEntry.create({
        data: {
          id: "jrn-tie-zzz",
          userId: a.id,
          occurredOn,
          createdAt,
          mood: 2,
        },
      });
      const page = await journal.list(a.id, { limit: 10 });
      assert.deepEqual(
        page.items.map((row) => row.id),
        ["jrn-tie-zzz", "jrn-tie-aaa"],
      );
    } finally {
      await prisma.user.delete({ where: { id: a.id } }).catch(() => undefined);
    }
  });
  if (result === "skipped") {
    t.skip("DATABASE_URL unavailable or journal migration not applied");
  }
});
