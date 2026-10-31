import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { MISSION_XP_SOURCE, listMissionsByCategory } from "@soma/shared-types";
import {
  LEGAL_SPECIAL_CATEGORY_VERSION,
  LEGAL_SPECIAL_CATEGORY_WITHDRAWAL_VERSION,
  SPECIAL_CATEGORY_PROCESSING_PURPOSE,
  SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
} from "@soma/shared-types";
import { CodedForbiddenException } from "../common/exceptions/coded-exception.js";
import {
  AUTH_SPECIAL_CATEGORY_REQUIRED_CODE,
  AUTH_SPECIAL_CATEGORY_WITHDRAWN_CODE,
  assertSpecialCategoryProcessingAllowed,
  persistSpecialCategoryGrant,
  persistSpecialCategoryWithdrawal,
  purgeSpecialCategoryProductData,
} from "./special-category-consent.js";

function dbWithRows(
  rows: Array<{
    purpose: string;
    acceptedAt: Date;
    documentVersion?: string;
  }>,
) {
  return {
    registrationAcceptance: {
      findMany: async () => rows,
      create: async ({ data }: { data: Record<string, unknown> }) => {
        rows.push({
          purpose: String(data.purpose),
          acceptedAt: data.acceptedAt as Date,
          documentVersion: String(data.documentVersion),
        });
        return data;
      },
    },
  };
}

test("assertSpecialCategoryProcessingAllowed blocks accounts with no grant", async () => {
  await assert.rejects(
    () =>
      assertSpecialCategoryProcessingAllowed(
        dbWithRows([]) as never,
        "user-1",
      ),
    (err: unknown) => {
      assert.ok(err instanceof CodedForbiddenException);
      assert.equal(err.code, AUTH_SPECIAL_CATEGORY_REQUIRED_CODE);
      return true;
    },
  );
});

test("assertSpecialCategoryProcessingAllowed allows an active grant", async () => {
  await assert.doesNotThrow(() =>
    assertSpecialCategoryProcessingAllowed(
      dbWithRows([
        {
          purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
          acceptedAt: new Date("2026-10-30T10:00:00.000Z"),
          documentVersion: LEGAL_SPECIAL_CATEGORY_VERSION,
        },
      ]) as never,
      "user-1",
    ),
  );
});

test("assertSpecialCategoryProcessingAllowed blocks after a withdrawal", async () => {
  await assert.rejects(
    () =>
      assertSpecialCategoryProcessingAllowed(
        dbWithRows([
          {
            purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
            acceptedAt: new Date("2026-10-30T10:00:00.000Z"),
          },
          {
            purpose: SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
            acceptedAt: new Date("2026-10-30T11:00:00.000Z"),
          },
        ]) as never,
        "user-1",
      ),
    (err: unknown) => {
      assert.ok(err instanceof CodedForbiddenException);
      assert.equal(err.code, AUTH_SPECIAL_CATEGORY_WITHDRAWN_CODE);
      return true;
    },
  );
});

test("persistSpecialCategoryGrant is append-only and idempotent while active", async () => {
  const rows: Array<{
    purpose: string;
    acceptedAt: Date;
    documentVersion?: string;
  }> = [];
  const db = dbWithRows(rows);
  const first = await persistSpecialCategoryGrant(
    db as never,
    "user-1",
    new Date("2026-10-30T10:00:00.000Z"),
  );
  const second = await persistSpecialCategoryGrant(
    db as never,
    "user-1",
    new Date("2026-10-30T10:05:00.000Z"),
  );
  assert.equal(first.created, true);
  assert.equal(second.created, false);
  assert.equal(rows.length, 1);
  assert.equal(rows[0]?.purpose, SPECIAL_CATEGORY_PROCESSING_PURPOSE);
});

test("persistSpecialCategoryWithdrawal is idempotent and is not a grant", async () => {
  const rows: Array<{
    purpose: string;
    acceptedAt: Date;
    documentVersion?: string;
  }> = [
    {
      purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
      acceptedAt: new Date("2026-10-30T10:00:00.000Z"),
      documentVersion: LEGAL_SPECIAL_CATEGORY_VERSION,
    },
  ];
  const db = dbWithRows(rows);
  await persistSpecialCategoryWithdrawal(
    db as never,
    "user-1",
    new Date("2026-10-30T12:00:00.000Z"),
  );
  await persistSpecialCategoryWithdrawal(
    db as never,
    "user-1",
    new Date("2026-10-30T13:00:00.000Z"),
  );
  assert.equal(rows.length, 2);
  assert.equal(rows[1]?.purpose, SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE);
  assert.notEqual(rows[1]?.purpose, SPECIAL_CATEGORY_PROCESSING_PURPOSE);
  assert.equal(
    rows[1]?.documentVersion,
    LEGAL_SPECIAL_CATEGORY_WITHDRAWAL_VERSION,
  );
  assert.equal(LEGAL_SPECIAL_CATEGORY_WITHDRAWAL_VERSION, "2026-10-30");
});

test("a grant after a same-timestamp withdrawal is stored strictly later", async () => {
  const at = new Date("2026-10-30T12:00:00.000Z");
  const rows: Array<{
    purpose: string;
    acceptedAt: Date;
    documentVersion?: string;
  }> = [
    {
      purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
      acceptedAt: at,
      documentVersion: LEGAL_SPECIAL_CATEGORY_VERSION,
    },
    {
      purpose: SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
      acceptedAt: at,
      documentVersion: "draft-2026-10-30",
    },
  ];
  const db = dbWithRows(rows);
  const result = await persistSpecialCategoryGrant(db as never, "user-1", at);
  assert.equal(result.created, true);
  assert.equal(rows[2]?.acceptedAt.getTime(), at.getTime() + 1);
  await assert.doesNotThrow(() =>
    assertSpecialCategoryProcessingAllowed(db as never, "user-1"),
  );
});

test("a later grant keeps the earlier grant and withdrawal rows", async () => {
  const rows: Array<{
    purpose: string;
    acceptedAt: Date;
    documentVersion?: string;
  }> = [
    {
      purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
      acceptedAt: new Date("2026-10-30T10:00:00.000Z"),
      documentVersion: LEGAL_SPECIAL_CATEGORY_VERSION,
    },
    {
      purpose: SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
      acceptedAt: new Date("2026-10-30T11:00:00.000Z"),
      documentVersion: "draft-2026-10-30",
    },
  ];
  const db = dbWithRows(rows);
  const result = await persistSpecialCategoryGrant(
    db as never,
    "user-1",
    new Date("2026-10-30T12:00:00.000Z"),
  );
  assert.equal(result.created, true);
  assert.equal(rows.length, 3);
  assert.equal(rows[0]?.acceptedAt.toISOString(), "2026-10-30T10:00:00.000Z");
  assert.equal(rows[1]?.purpose, SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE);
  assert.equal(rows[2]?.purpose, SPECIAL_CATEGORY_PROCESSING_PURPOSE);
  await assert.doesNotThrow(() =>
    assertSpecialCategoryProcessingAllowed(db as never, "user-1"),
  );
});

test("schema allows more than one special-category row per user", () => {
  const schema = readFileSync(
    new URL("../../prisma/schema.prisma", import.meta.url),
    "utf8",
  );
  const model = schema.slice(
    schema.indexOf("model RegistrationAcceptance"),
    schema.indexOf("model RegistrationInvite"),
  );
  assert.equal(model.includes("@@unique([userId, purpose])"), false);
  assert.match(model, /@@index\(\[userId, purpose, acceptedAt\]\)/);
});

test("purgeSpecialCategoryProductData removes sensitive rows and keeps mission XP", async () => {
  const deleted: string[] = [];
  const grants = [
    { source: "journal_create_day", amount: 12 },
    { source: "personal_milestone", amount: 10 },
    { source: "onboarding_complete", amount: 30 },
    { source: "mission_complete", amount: 12 },
  ];
  let totalXp = 64n;
  let equippedTitleId: string | null = "explorer";
  let onboardingStatus = "completed";

  await purgeSpecialCategoryProductData(
    {
      substanceUsage: {
        deleteMany: async () => {
          deleted.push("usages");
          return { count: 1 };
        },
      },
      journalEntry: {
        deleteMany: async () => {
          deleted.push("journal");
          return { count: 1 };
        },
      },
      journalPersonalMilestone: {
        deleteMany: async () => {
          deleted.push("milestones");
          return { count: 1 };
        },
      },
      userAchievement: {
        deleteMany: async () => {
          deleted.push("achievements");
          return { count: 1 };
        },
      },
      feedbackReport: {
        deleteMany: async () => {
          deleted.push("feedback");
          return { count: 1 };
        },
      },
      xpGrant: {
        deleteMany: async ({
          where,
        }: {
          where: { source: { in: string[] } };
        }) => {
          const drop = new Set(where.source.in);
          for (let i = grants.length - 1; i >= 0; i -= 1) {
            const row = grants[i];
            if (row && drop.has(row.source)) grants.splice(i, 1);
          }
          deleted.push("xp");
          return { count: 3 };
        },
        findMany: async () => grants,
      },
      userProgression: {
        findUnique: async () => ({ equippedTitleId }),
        update: async ({
          data,
        }: {
          data: { totalXp: bigint; equippedTitleId: string | null };
        }) => {
          totalXp = data.totalXp;
          equippedTitleId = data.equippedTitleId;
          return data;
        },
      },
      user: {
        update: async ({
          data,
        }: {
          data: { onboardingStatus: string };
        }) => {
          onboardingStatus = data.onboardingStatus;
          return data;
        },
      },
    } as never,
    "user-1",
  );

  assert.deepEqual(deleted, [
    "usages",
    "journal",
    "milestones",
    "achievements",
    "feedback",
    "xp",
  ]);
  assert.deepEqual(
    grants.map((row) => row.source),
    ["mission_complete"],
  );
  assert.equal(totalXp, 12n);
  assert.equal(equippedTitleId, null);
  assert.equal(onboardingStatus, "skipped");
});

test("kept missions and XP sources do not store personal recovery history", () => {
  assert.equal(listMissionsByCategory("substances").length, 0);
  assert.equal(MISSION_XP_SOURCE, "mission_complete");
  const schema = readFileSync(new URL("../../prisma/schema.prisma", import.meta.url), "utf8");
  const completion = schema.slice(
    schema.indexOf("model MissionCompletion"),
    schema.indexOf("model FeedbackReport"),
  );
  assert.match(completion, /missionId/);
  assert.match(completion, /contentVersion/);
  assert.match(completion, /completedAt/);
  assert.equal(completion.includes("substanceId"), false);
  assert.equal(completion.includes("lastUseDate"), false);
  assert.equal(completion.includes("wellbeing"), false);
  const progress = readFileSync(
    new URL("../progress/progress.service.ts", import.meta.url),
    "utf8",
  );
  assert.match(progress, /referral_qualified/);
  assert.match(progress, /no approved amount/);
});
