import {
  LEGAL_SPECIAL_CATEGORY_WITHDRAWAL_VERSION,
  SPECIAL_CATEGORY_PROCESSING_PURPOSE,
  SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
  SPECIAL_CATEGORY_XP_SOURCES,
  isSpecialCategoryConsentActive,
  isSpecialCategoryProcessingWithdrawn,
  levelFromTotalXp,
  isProgressTitleId,
  isProgressTitleUnlocked,
} from "@soma/shared-types";
import type { Prisma } from "@prisma/client";
import type { PrismaService } from "../prisma/prisma.service.js";
import { CodedForbiddenException } from "../common/exceptions/coded-exception.js";

export const AUTH_SPECIAL_CATEGORY_WITHDRAWN_CODE =
  "AUTH_SPECIAL_CATEGORY_WITHDRAWN";
export const AUTH_SPECIAL_CATEGORY_WITHDRAWN_MESSAGE =
  "Special-category processing consent has been withdrawn";

type ConsentDb = PrismaService | Prisma.TransactionClient;

async function loadSpecialCategoryRecords(
  db: ConsentDb,
  userId: string,
) {
  return db.registrationAcceptance.findMany({
    where: {
      userId,
      purpose: {
        in: [
          SPECIAL_CATEGORY_PROCESSING_PURPOSE,
          SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
        ],
      },
    },
    select: { purpose: true, acceptedAt: true },
  });
}

export async function loadSpecialCategoryConsentActive(
  db: ConsentDb,
  userId: string,
): Promise<boolean> {
  const rows = await loadSpecialCategoryRecords(db, userId);
  return isSpecialCategoryConsentActive(rows);
}

export async function loadSpecialCategoryProcessingWithdrawn(
  db: ConsentDb,
  userId: string,
): Promise<boolean> {
  const rows = await loadSpecialCategoryRecords(db, userId);
  return isSpecialCategoryProcessingWithdrawn(rows);
}

export async function assertSpecialCategoryProcessingAllowed(
  db: ConsentDb,
  userId: string,
): Promise<void> {
  const withdrawn = await loadSpecialCategoryProcessingWithdrawn(db, userId);
  if (withdrawn) {
    throw new CodedForbiddenException(
      AUTH_SPECIAL_CATEGORY_WITHDRAWN_CODE,
      AUTH_SPECIAL_CATEGORY_WITHDRAWN_MESSAGE,
    );
  }
}

/**
 * Writes withdrawal evidence if missing. Does not update acceptedAt on retry.
 * Does not create a grant.
 */
export async function persistSpecialCategoryWithdrawal(
  db: ConsentDb,
  userId: string,
  acceptedAt: Date = new Date(),
): Promise<void> {
  const existing = await db.registrationAcceptance.findUnique({
    where: {
      userId_purpose: {
        userId,
        purpose: SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
      },
    },
    select: { id: true },
  });
  if (existing) return;
  await db.registrationAcceptance.create({
    data: {
      userId,
      purpose: SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
      documentVersion: LEGAL_SPECIAL_CATEGORY_WITHDRAWAL_VERSION,
      acceptedAt,
    },
  });
}

/**
 * Removes special-category product data in the live database and realigns XP.
 * Keeps the account, sessions, and MissionCompletion rows: current missions are
 * catalog reading-checks (neurotransmitters/processes). They store only
 * missionId, contentVersion and completedAt — not substance, abstinence or
 * journal data. `mission_complete` XP uses that catalog id as sourceKey.
 * `referral_qualified` is reserved and is never granted by the API.
 */
export async function purgeSpecialCategoryProductData(
  db: ConsentDb,
  userId: string,
): Promise<void> {
  await db.substanceUsage.deleteMany({ where: { userId } });
  await db.journalEntry.deleteMany({ where: { userId } });
  await db.journalPersonalMilestone.deleteMany({ where: { userId } });
  await db.userAchievement.deleteMany({ where: { userId } });
  await db.feedbackReport.deleteMany({ where: { userId } });
  await db.xpGrant.deleteMany({
    where: {
      userId,
      source: { in: [...SPECIAL_CATEGORY_XP_SOURCES] },
    },
  });

  const remaining = await db.xpGrant.findMany({
    where: { userId },
    select: { amount: true },
  });
  const totalXp = remaining.reduce((sum, row) => sum + BigInt(row.amount), 0n);
  const level = levelFromTotalXp(Number(totalXp));

  const progression = await db.userProgression.findUnique({
    where: { userId },
    select: { equippedTitleId: true },
  });
  if (progression) {
    const stored = progression.equippedTitleId;
    const equippedOk =
      stored !== null &&
      isProgressTitleId(stored) &&
      isProgressTitleUnlocked(stored, level);
    await db.userProgression.update({
      where: { userId },
      data: {
        totalXp,
        equippedTitleId: equippedOk ? stored : null,
      },
    });
  }

  await db.user.update({
    where: { id: userId },
    data: { onboardingStatus: "skipped" },
  });
}
