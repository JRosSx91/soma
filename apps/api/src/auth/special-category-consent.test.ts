import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { MISSION_XP_SOURCE, listMissionsByCategory } from "@soma/shared-types";
import {
  SPECIAL_CATEGORY_PROCESSING_PURPOSE,
  SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
} from "@soma/shared-types";
import { CodedForbiddenException } from "../common/exceptions/coded-exception.js";
import {
  AUTH_SPECIAL_CATEGORY_WITHDRAWN_CODE,
  assertSpecialCategoryProcessingAllowed,
  persistSpecialCategoryWithdrawal,
  purgeSpecialCategoryProductData,
} from "./special-category-consent.js";

test("assertSpecialCategoryProcessingAllowed ignores accounts with no rows", async () => {
  await assert.doesNotThrow(() =>
    assertSpecialCategoryProcessingAllowed(
      {
        registrationAcceptance: {
          findMany: async () => [],
        },
      } as never,
      "user-1",
    ),
  );
});

test("assertSpecialCategoryProcessingAllowed blocks after a withdrawal", async () => {
  await assert.rejects(
    () =>
      assertSpecialCategoryProcessingAllowed(
        {
          registrationAcceptance: {
            findMany: async () => [
              {
                purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
                acceptedAt: new Date("2026-10-30T10:00:00.000Z"),
              },
              {
                purpose: SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
                acceptedAt: new Date("2026-10-30T11:00:00.000Z"),
              },
            ],
          },
        } as never,
        "user-1",
      ),
    (err: unknown) => {
      assert.ok(err instanceof CodedForbiddenException);
      assert.equal(err.code, AUTH_SPECIAL_CATEGORY_WITHDRAWN_CODE);
      return true;
    },
  );
});

test("persistSpecialCategoryWithdrawal is idempotent and is not a grant", async () => {
  const created: Array<Record<string, unknown>> = [];
  const db = {
    registrationAcceptance: {
      findUnique: async () =>
        created.length > 0 ? { id: "existing" } : null,
      create: async ({ data }: { data: Record<string, unknown> }) => {
        created.push(data);
        return data;
      },
    },
  };
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
  assert.equal(created.length, 1);
  assert.equal(created[0]?.purpose, SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE);
  assert.notEqual(created[0]?.purpose, SPECIAL_CATEGORY_PROCESSING_PURPOSE);
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
