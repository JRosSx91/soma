import { Injectable } from "@nestjs/common";
import type {
  Achievement,
  AchievementTier,
  UserAchievement,
} from "@prisma/client";
import type { ProgressAvailability } from "@soma/shared-types";
import { PrismaService } from "../prisma/prisma.service.js";
import { planAchievementUnlocks, readAchievementProgress } from "./recovery-math.js";
import {
  claimUserAchievementTimestamp,
  insertUserAchievementsIgnoringConflicts,
} from "./user-achievement-persist.js";

export interface AchievementWithUnlockState {
  id: string;
  tier: AchievementTier;
  titleKey: string;
  descriptionKey: string;
  triggerOrganId: string;
  triggerSubstanceId: string;
  triggerRecoveryThreshold: number;
  hidden: boolean;
  unlocked: boolean;
  unlockedAt: Date | null;
  notifiedAt: Date | null;
  /** Soma inserted the unlock (`UserAchievement.createdAt`). Null if locked. */
  detectedAt: Date | null;
  inboxReadAt: Date | null;
  /**
   * When a celebration presentation was claimed (lock before show).
   * Not proof the modal finished rendering.
   */
  celebratedAt: Date | null;
  /** True only if this GET's INSERT actually created the row. */
  insertedThisCall: boolean;
  /** Derived. Null unless progressAvailability is "ready". Not a clinical measure. */
  achievementProgress: number | null;
  progressAvailability: ProgressAvailability;
}

export interface NewlyUnlockedAchievement {
  achievement: Achievement;
  unlockedAt: Date;
}

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Detects achievements newly crossed by the user's recovery progress
   * since the last detection, persists them in UserAchievement, and
   * returns achievement ids **this statement inserted** (`ON CONFLICT
   * DO NOTHING RETURNING`). Concurrent GETs cannot both list the same
   * row as insertedThisCall.
   *
   * Idempotent: re-calling with no new thresholds crossed inserts
   * nothing and returns an empty array.
   *
   * unlockedAt is computed as the actual date the user's recovery
   * crossed the threshold (by inverting the recovery curve from the
   * lastUseDate), not the time of detection. This gives the user a
   * coherent timeline rather than a clump of "all unlocked today".
   */
  async detectAndPersistUnlocks(
    userId: string,
  ): Promise<string[]> {
    const usages = await this.prisma.substanceUsage.findMany({
      where: { userId },
    });
    if (usages.length === 0) return [];

    // Pull all recovery curves and achievements in one go to avoid N+1.
    const [curves, achievements, alreadyUnlocked] = await Promise.all([
      this.prisma.organRecoveryCurve.findMany(),
      this.prisma.achievement.findMany(),
      this.prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      }),
    ]);

    const alreadyUnlockedIds = new Set(
      alreadyUnlocked.map((row) => row.achievementId),
    );
    const achievementById = new Map(achievements.map((item) => [item.id, item]));
    const now = new Date();

    // Missing curves stay out of this list. They are pending review
    // and are not granted.
    const planned = planAchievementUnlocks({
      achievements: achievements.map((item) => ({
        id: item.id,
        organId: item.triggerOrganId,
        substanceId: item.triggerSubstanceId,
        threshold: item.triggerRecoveryThreshold,
      })),
      curves,
      usages,
      alreadyUnlockedIds,
      now,
    });

    const newUnlocks: NewlyUnlockedAchievement[] = [];
    for (const unlock of planned) {
      const achievement = achievementById.get(unlock.id);
      if (!achievement) continue;
      newUnlocks.push({ achievement, unlockedAt: unlock.unlockedAt });
    }

    if (newUnlocks.length === 0) return [];

    return insertUserAchievementsIgnoringConflicts(
      this.prisma,
      userId,
      newUnlocks.map((u) => ({
        achievementId: u.achievement.id,
        unlockedAt: u.unlockedAt,
      })),
    );
  }

  /**
   * Returns the user's full achievement state — every achievement in
   * the catalog with unlocked / locked status. Achievements not yet
   * unlocked have unlockedAt = null.
   *
   * Does NOT trigger unlock detection. Call detectAndPersistUnlocks
   * first if you want fresh state.
   */
  async getUserAchievements(
    userId: string,
    insertedThisCallIds: ReadonlySet<string> | readonly string[] = [],
  ): Promise<AchievementWithUnlockState[]> {
    const inserted = new Set(insertedThisCallIds);
    const [achievements, unlocks, curves, usages] = await Promise.all([
      this.prisma.achievement.findMany({
        orderBy: [
          { triggerSubstanceId: "asc" },
          { triggerRecoveryThreshold: "asc" },
        ],
      }),
      this.prisma.userAchievement.findMany({ where: { userId } }),
      this.prisma.organRecoveryCurve.findMany(),
      this.prisma.substanceUsage.findMany({ where: { userId } }),
    ]);

    const unlockByAchievementId = new Map<string, UserAchievement>();
    for (const u of unlocks) {
      unlockByAchievementId.set(u.achievementId, u);
    }
    const curveByPair = new Map(
      curves.map((curve) => [`${curve.organId}:${curve.substanceId}`, curve]),
    );
    const usageBySubstance = new Map(usages.map((usage) => [usage.substanceId, usage]));
    const now = new Date();

    return achievements.map((a) => {
      const unlock = unlockByAchievementId.get(a.id);
      const curve = curveByPair.get(`${a.triggerOrganId}:${a.triggerSubstanceId}`);
      const usage = usageBySubstance.get(a.triggerSubstanceId);
      const reading = readAchievementProgress({
        hidden: a.hidden,
        persisted: Boolean(unlock),
        achievementThreshold: a.triggerRecoveryThreshold,
        curve: curve
          ? {
              shape: curve.shape,
              daysTo95Recovery: curve.daysTo95Recovery,
              recoveryCeiling: curve.recoveryCeiling,
            }
          : null,
        usage: usage
          ? { status: usage.status, lastUseDate: usage.lastUseDate }
          : null,
        now,
      });
      return {
        id: a.id,
        tier: a.tier,
        titleKey: a.titleKey,
        descriptionKey: a.descriptionKey,
        triggerOrganId: a.triggerOrganId,
        triggerSubstanceId: a.triggerSubstanceId,
        triggerRecoveryThreshold: a.triggerRecoveryThreshold,
        hidden: a.hidden,
        unlocked: Boolean(unlock),
        unlockedAt: unlock?.unlockedAt ?? null,
        notifiedAt: unlock?.notifiedAt ?? null,
        detectedAt: unlock?.createdAt ?? null,
        inboxReadAt: unlock?.inboxReadAt ?? null,
        celebratedAt: unlock?.celebratedAt ?? null,
        insertedThisCall: inserted.has(a.id),
        achievementProgress: reading.achievementProgress,
        progressAvailability: reading.progressAvailability,
      };
    });
  }

  /**
   * Marks the given achievements as notified for this user. Used by
   * the frontend after surfacing trophy unlock toasts to the user.
   * Only achievements actually owned by the user are updated — passing
   * arbitrary IDs is a no-op for entries that don't belong to them.
   */
  async markAsNotified(
    userId: string,
    achievementIds: string[],
  ): Promise<{ updated: number }> {
    if (achievementIds.length === 0) return { updated: 0 };

    const now = new Date();
    const result = await this.prisma.userAchievement.updateMany({
      where: {
        userId,
        achievementId: { in: achievementIds },
        notifiedAt: null,
      },
      data: { notifiedAt: now },
    });

    return { updated: result.count };
  }

  /**
   * Marks inbox items read for this user only. Does not touch notifiedAt
   * or celebratedAt. Concurrent repeats are no-ops for already-read rows.
   */
  async markInboxRead(
    userId: string,
    achievementIds: string[],
  ): Promise<{ updated: number; readIds: string[] }> {
    const readIds = await claimUserAchievementTimestamp(this.prisma, {
      userId,
      achievementIds,
      column: "inboxReadAt",
    });
    return { updated: readIds.length, readIds };
  }

  /**
   * Claims celebration presentation for this user only. celebratedAt is
   * the claim instant, not confirmation that a modal was seen through.
   * Does not touch notifiedAt or inboxReadAt. Insert-only unlocks unchanged.
   */
  async claimCelebrations(
    userId: string,
    achievementIds: string[],
  ): Promise<{ celebratedIds: string[] }> {
    const celebratedIds = await claimUserAchievementTimestamp(this.prisma, {
      userId,
      achievementIds,
      column: "celebratedAt",
    });
    return { celebratedIds };
  }
}
