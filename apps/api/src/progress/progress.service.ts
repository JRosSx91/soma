import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  PROGRESS_STARTING_TITLE_ID,
  PROGRESS_XP_AMOUNT,
  PROGRESS_XP_MAX,
  isProgressTitleId,
  isProgressTitleUnlocked,
  isProgressXp,
  isProgressXpSource,
  isSpecialCategoryXpSource,
  levelFromTotalXp,
  progressFromTotalXp,
  type ProgressTitleId,
  type ProgressXpSource,
} from "@soma/shared-types";
import { PrismaService } from "../prisma/prisma.service.js";
import { assertSpecialCategoryProcessingAllowed } from "../auth/special-category-consent.js";
import type {
  AwardXpInput,
  AwardXpResult,
  ProgressResponse,
} from "./progress.types.js";

/** Prisma Int ceiling for a single ledger amount. */
const GRANT_AMOUNT_MAX = 2_147_483_647;
const SOURCE_KEY_MAX = 191;

function bigintToXp(value: bigint): number {
  if (value < 0n || value > BigInt(PROGRESS_XP_MAX)) {
    throw new BadRequestException("Invalid stored XP");
  }
  const xp = Number(value);
  if (!isProgressXp(xp)) {
    throw new BadRequestException("Invalid stored XP");
  }
  return xp;
}

function resolveEquippedTitleId(
  stored: string | null,
  level: number,
): ProgressTitleId {
  if (
    stored &&
    isProgressTitleId(stored) &&
    isProgressTitleUnlocked(stored, level)
  ) {
    return stored;
  }
  return PROGRESS_STARTING_TITLE_ID;
}

function toResponse(
  totalXp: number,
  equippedTitleId: string | null,
): ProgressResponse {
  const breakdown = progressFromTotalXp(totalXp);
  return {
    ...breakdown,
    equippedTitleId: resolveEquippedTitleId(equippedTitleId, breakdown.level),
  };
}

function requireCatalogAmount(source: ProgressXpSource): number {
  const listed = Object.hasOwn(PROGRESS_XP_AMOUNT, source)
    ? PROGRESS_XP_AMOUNT[source as keyof typeof PROGRESS_XP_AMOUNT]
    : undefined;
  if (listed === undefined) {
    throw new BadRequestException("XP source has no approved amount");
  }
  if (
    !Number.isInteger(listed) ||
    listed < 1 ||
    listed > GRANT_AMOUNT_MAX ||
    !isProgressXp(listed)
  ) {
    throw new BadRequestException("Invalid XP amount");
  }
  return listed;
}

function requireSourceKey(sourceKey: unknown): string {
  if (typeof sourceKey !== "string") {
    throw new BadRequestException("Invalid XP sourceKey");
  }
  const key = sourceKey.trim();
  if (key.length < 1 || key.length > SOURCE_KEY_MAX) {
    throw new BadRequestException("Invalid XP sourceKey");
  }
  return key;
}

type ProgressionWriter = Prisma.TransactionClient | PrismaClientLike;

type PrismaClientLike = {
  $executeRaw: Prisma.TransactionClient["$executeRaw"];
  userProgression: Prisma.TransactionClient["userProgression"];
};

/**
 * Prisma 5.22 compiles `upsert({ update: {} })` to SELECT + INSERT, which
 * races on UserProgression.userId. Insert with ON CONFLICT is atomic.
 * `updatedAt` has no database default; it must be set on insert.
 */
async function ensureProgressionRow(
  db: ProgressionWriter,
  userId: string,
): Promise<void> {
  await db.$executeRaw(
    Prisma.sql`
      INSERT INTO "UserProgression" ("userId", "totalXp", "equippedTitleId", "createdAt", "updatedAt")
      VALUES (${userId}, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("userId") DO NOTHING
    `,
  );
}

@Injectable()
export class ProgressService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  /**
   * Idempotent row so existing users can read 0 XP / level 1.
   * Does not insert grants and does not award XP.
   */
  async getMine(userId: string): Promise<ProgressResponse> {
    await ensureProgressionRow(this.prisma, userId);
    const row = await this.prisma.userProgression.findUniqueOrThrow({
      where: { userId },
    });
    return toResponse(bigintToXp(row.totalXp), row.equippedTitleId);
  }

  /**
   * Equip an unlocked title for the authenticated user. Level is derived
   * from persisted XP only. Does not write grants or totalXp.
   */
  async equipTitle(
    userId: string,
    titleId: string,
  ): Promise<ProgressResponse> {
    if (!isProgressTitleId(titleId)) {
      throw new BadRequestException("Invalid equippedTitleId");
    }

    await ensureProgressionRow(this.prisma, userId);
    const row = await this.prisma.userProgression.findUniqueOrThrow({
      where: { userId },
    });
    const totalXp = bigintToXp(row.totalXp);
    const level = levelFromTotalXp(totalXp);
    if (!isProgressTitleUnlocked(titleId, level)) {
      throw new BadRequestException("Title is not unlocked");
    }

    if (row.equippedTitleId === titleId) {
      return toResponse(totalXp, titleId);
    }

    const updated = await this.prisma.userProgression.update({
      where: { userId },
      data: { equippedTitleId: titleId },
    });
    return toResponse(bigintToXp(updated.totalXp), updated.equippedTitleId);
  }

  /**
   * Internal grant. Not exposed over HTTP. Amount is taken only from
   * PROGRESS_XP_AMOUNT — never from the caller, and never from a client body.
   * Sources without an approved figure (e.g. referral_qualified) are rejected.
   *
   * Pass `tx` to join an existing write (journal / milestone). Otherwise this
   * method opens its own transaction. Duplicate keys return status=duplicate
   * and cap misses return status=capped, both without throwing, so the
   * business row can still commit.
   */
  async awardXp(
    userId: string,
    input: AwardXpInput,
    tx?: Prisma.TransactionClient,
  ): Promise<AwardXpResult> {
    if (!isProgressXpSource(input.source)) {
      throw new BadRequestException("Invalid XP source");
    }
    const source = input.source;
    const sourceKey = requireSourceKey(input.sourceKey);
    const amount = requireCatalogAmount(source);

    if (isSpecialCategoryXpSource(source)) {
      await assertSpecialCategoryProcessingAllowed(tx ?? this.prisma, userId);
    }

    if (tx) {
      return this.applyAward(tx, userId, source, sourceKey, amount);
    }
    return this.prisma.$transaction((inner) =>
      this.applyAward(inner, userId, source, sourceKey, amount),
    );
  }

  private async applyAward(
    tx: Prisma.TransactionClient,
    userId: string,
    source: ProgressXpSource,
    sourceKey: string,
    amount: number,
  ): Promise<AwardXpResult> {
    const amountBig = BigInt(amount);
    const cap = BigInt(PROGRESS_XP_MAX);

    await ensureProgressionRow(tx, userId);
    await tx.$queryRaw(
      Prisma.sql`SELECT "userId" FROM "UserProgression" WHERE "userId" = ${userId} FOR UPDATE`,
    );

    const locked = await tx.userProgression.findUniqueOrThrow({
      where: { userId },
    });
    if (locked.totalXp + amountBig > cap) {
      const already = await tx.xpGrant.findUnique({
        where: {
          userId_source_sourceKey: { userId, source, sourceKey },
        },
        select: { id: true },
      });
      return {
        status: already ? "duplicate" : "capped",
        totalXp: bigintToXp(locked.totalXp),
      };
    }

    const inserted = await tx.xpGrant.createMany({
      data: [{ userId, source, sourceKey, amount }],
      skipDuplicates: true,
    });
    if (inserted.count === 0) {
      return { status: "duplicate", totalXp: bigintToXp(locked.totalXp) };
    }

    const updated = await tx.userProgression.updateMany({
      where: {
        userId,
        totalXp: { lte: cap - amountBig },
      },
      data: {
        totalXp: { increment: amountBig },
      },
    });
    if (updated.count !== 1) {
      throw new BadRequestException("XP cap exceeded");
    }

    const row = await tx.userProgression.findUniqueOrThrow({
      where: { userId },
    });
    return {
      status: "awarded",
      totalXp: bigintToXp(row.totalXp),
    };
  }
}
