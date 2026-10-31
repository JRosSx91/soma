import {
  LEGAL_SPECIAL_CATEGORY_VERSION,
  LEGAL_SPECIAL_CATEGORY_WITHDRAWAL_VERSION,
  SPECIAL_CATEGORY_PROCESSING_PURPOSE,
  SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
  SPECIAL_CATEGORY_XP_SOURCES,
  isSpecialCategoryConsentActive,
  isSpecialCategoryProcessingWithdrawn,
  levelFromTotalXp,
  isProgressTitleId,
  isProgressTitleUnlocked,
  specialCategoryConsentStatus,
  type SpecialCategoryConsentStatus,
} from "@soma/shared-types";
import type { Prisma } from "@prisma/client";
import type { PrismaService } from "../prisma/prisma.service.js";
import { CodedForbiddenException } from "../common/exceptions/coded-exception.js";

export const AUTH_SPECIAL_CATEGORY_WITHDRAWN_CODE =
  "AUTH_SPECIAL_CATEGORY_WITHDRAWN";
export const AUTH_SPECIAL_CATEGORY_WITHDRAWN_MESSAGE =
  "Special-category processing consent has been withdrawn";

export const AUTH_SPECIAL_CATEGORY_REQUIRED_CODE =
  "AUTH_SPECIAL_CATEGORY_REQUIRED";
export const AUTH_SPECIAL_CATEGORY_REQUIRED_MESSAGE =
  "Special-category processing consent is required";

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
    select: { purpose: true, acceptedAt: true, documentVersion: true },
  });
}

export async function loadSpecialCategoryConsentStatus(
  db: ConsentDb,
  userId: string,
): Promise<SpecialCategoryConsentStatus> {
  const rows = await loadSpecialCategoryRecords(db, userId);
  return specialCategoryConsentStatus(rows);
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
  const status = await loadSpecialCategoryConsentStatus(db, userId);
  if (status === "active") return;
  if (status === "withdrawn") {
    throw new CodedForbiddenException(
      AUTH_SPECIAL_CATEGORY_WITHDRAWN_CODE,
      AUTH_SPECIAL_CATEGORY_WITHDRAWN_MESSAGE,
    );
  }
  throw new CodedForbiddenException(
    AUTH_SPECIAL_CATEGORY_REQUIRED_CODE,
    AUTH_SPECIAL_CATEGORY_REQUIRED_MESSAGE,
  );
}

/**
 * Serializes special-category mutations against the user row so a completed
 * withdrawal cannot race with a write that checked consent beforehand.
 */
export async function lockUserForSpecialCategoryMutation(
  db: ConsentDb,
  userId: string,
): Promise<void> {
  await db.$queryRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
}

export async function requireSpecialCategoryWrite(
  db: ConsentDb,
  userId: string,
): Promise<void> {
  await lockUserForSpecialCategoryMutation(db, userId);
  await assertSpecialCategoryProcessingAllowed(db, userId);
}

function nextAcceptedAt(
  rows: Array<{ acceptedAt: Date }>,
  proposed: Date,
): Date {
  let latest = 0;
  for (const row of rows) {
    const at = row.acceptedAt.getTime();
    if (at > latest) latest = at;
  }
  const t = proposed.getTime();
  if (t > latest) return proposed;
  return new Date(latest + 1);
}

/**
 * Inserts a grant when consent is not already active on the current version.
 * Does not update or delete earlier grant or withdrawal rows.
 */
export async function persistSpecialCategoryGrant(
  db: ConsentDb,
  userId: string,
  acceptedAt: Date = new Date(),
): Promise<{ created: boolean }> {
  const rows = await loadSpecialCategoryRecords(db, userId);
  if (isSpecialCategoryConsentActive(rows)) {
    let latestGrantVersion: string | null = null;
    let latestGrantAt = -1;
    for (const row of rows) {
      if (row.purpose !== SPECIAL_CATEGORY_PROCESSING_PURPOSE) continue;
      const at = row.acceptedAt.getTime();
      if (at >= latestGrantAt) {
        latestGrantAt = at;
        latestGrantVersion = row.documentVersion;
      }
    }
    if (latestGrantVersion === LEGAL_SPECIAL_CATEGORY_VERSION) {
      return { created: false };
    }
  }

  await db.registrationAcceptance.create({
    data: {
      userId,
      purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
      documentVersion: LEGAL_SPECIAL_CATEGORY_VERSION,
      acceptedAt: nextAcceptedAt(rows, acceptedAt),
    },
  });
  return { created: true };
}

/**
 * Inserts withdrawal evidence when the latest special-category event is not
 * already a withdrawal. Does not bump acceptedAt and does not create a grant.
 */
export async function persistSpecialCategoryWithdrawal(
  db: ConsentDb,
  userId: string,
  acceptedAt: Date = new Date(),
): Promise<void> {
  const rows = await loadSpecialCategoryRecords(db, userId);
  if (isSpecialCategoryProcessingWithdrawn(rows)) return;
  await db.registrationAcceptance.create({
    data: {
      userId,
      purpose: SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
      documentVersion: LEGAL_SPECIAL_CATEGORY_WITHDRAWAL_VERSION,
      acceptedAt: nextAcceptedAt(rows, acceptedAt),
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
