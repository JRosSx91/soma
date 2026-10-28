import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
  PROGRESS_STARTING_TITLE_ID,
  PROGRESS_XP_AMOUNT,
  PROGRESS_XP_MAX,
  isProgressTitleId,
  isProgressXp,
  isProgressXpSource,
  progressFromTotalXp,
  type ProgressTitleId,
  type ProgressXpSource,
} from "@soma/shared-types";
import { PrismaService } from "../prisma/prisma.service.js";
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

function resolveEquippedTitleId(stored: string | null): ProgressTitleId {
  if (stored && isProgressTitleId(stored)) return stored;
  return PROGRESS_STARTING_TITLE_ID;
}

function toResponse(
  totalXp: number,
  equippedTitleId: string | null,
): ProgressResponse {
  const breakdown = progressFromTotalXp(totalXp);
  return {
    ...breakdown,
    equippedTitleId: resolveEquippedTitleId(equippedTitleId),
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
    const row = await this.prisma.userProgression.upsert({
      where: { userId },
      create: { userId, totalXp: 0n, equippedTitleId: null },
      update: {},
    });
    return toResponse(bigintToXp(row.totalXp), row.equippedTitleId);
  }

  /**
   * Internal grant. Not exposed over HTTP. Amount is taken only from
   * PROGRESS_XP_AMOUNT — never from the caller, and never from a client body.
   * Sources without an approved figure (e.g. referral_qualified) are rejected.
   *
   * Inserts the unique ledger row first, then increments totalXp in the
   * same transaction. A unique collision returns created=false and does
   * not add XP. A cap miss rolls both writes back.
   */
  async awardXp(userId: string, input: AwardXpInput): Promise<AwardXpResult> {
    if (!isProgressXpSource(input.source)) {
      throw new BadRequestException("Invalid XP source");
    }
    const source = input.source;
    const sourceKey = requireSourceKey(input.sourceKey);
    const amount = requireCatalogAmount(source);
    const amountBig = BigInt(amount);
    const cap = BigInt(PROGRESS_XP_MAX);

    return this.prisma.$transaction(async (tx) => {
      await tx.userProgression.upsert({
        where: { userId },
        create: { userId, totalXp: 0n, equippedTitleId: null },
        update: {},
      });

      // ON CONFLICT DO NOTHING — a unique miss must not abort the transaction.
      const inserted = await tx.xpGrant.createMany({
        data: [{ userId, source, sourceKey, amount }],
        skipDuplicates: true,
      });
      if (inserted.count === 0) {
        const existing = await tx.userProgression.findUniqueOrThrow({
          where: { userId },
        });
        return {
          created: false,
          totalXp: bigintToXp(existing.totalXp),
        };
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
        created: true,
        totalXp: bigintToXp(row.totalXp),
      };
    });
  }
}
