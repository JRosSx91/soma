import { Injectable } from '@nestjs/common';
import type { Achievement, AchievementTier, UserAchievement } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  computeProgress,
  dateAfterDays,
  daysBetween,
  daysToReachThreshold,
} from './recovery-math.js';

export interface AchievementWithUnlockState {
  id: string;
  tier: AchievementTier;
  title: string;
  physiologicalDescription: string;
  triggerOrganId: string;
  triggerSubstanceId: string;
  triggerRecoveryThreshold: number;
  unlocked: boolean;
  unlockedAt: Date | null;
  notifiedAt: Date | null;
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
   * returns the rows that were newly inserted.
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
  ): Promise<NewlyUnlockedAchievement[]> {
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

    // Index curves by (organId, substanceId) for fast lookup.
    const curveByPair = new Map<string, (typeof curves)[number]>();
    for (const curve of curves) {
      curveByPair.set(`${curve.organId}:${curve.substanceId}`, curve);
    }

    // Index usages by substanceId.
    const usageBySubstance = new Map<string, (typeof usages)[number]>();
    for (const usage of usages) {
      usageBySubstance.set(usage.substanceId, usage);
    }

    const now = new Date();
    const newUnlocks: NewlyUnlockedAchievement[] = [];

    for (const achievement of achievements) {
      // Skip already-unlocked achievements.
      if (alreadyUnlockedIds.has(achievement.id)) continue;

      const usage = usageBySubstance.get(achievement.triggerSubstanceId);
      // The user is not tracking this substance — achievement does
      // not apply.
      if (!usage) continue;

      const curve = curveByPair.get(
        `${achievement.triggerOrganId}:${achievement.triggerSubstanceId}`,
      );
      // No curve defined for this (organ, substance). Should be
      // impossible if seed data is consistent; skip defensively.
      if (!curve) continue;

      const daysAbstinent = daysBetween(usage.lastUseDate, now);
      const currentProgress = computeProgress(daysAbstinent, {
        shape: curve.shape,
        daysTo95Recovery: curve.daysTo95Recovery,
      });

      // Threshold not yet crossed.
      if (currentProgress < achievement.triggerRecoveryThreshold) continue;

      // Compute the actual date the threshold was crossed.
      const daysAtThreshold = daysToReachThreshold(
        achievement.triggerRecoveryThreshold,
        {
          shape: curve.shape,
          daysTo95Recovery: curve.daysTo95Recovery,
        },
      );
      // Defensive: if the inversion returned Infinity, the threshold
      // is mathematically unreachable for this curve. Use now() as a
      // fallback so the achievement still unlocks visibly.
      const unlockedAt = Number.isFinite(daysAtThreshold)
        ? dateAfterDays(usage.lastUseDate, daysAtThreshold)
        : now;

      newUnlocks.push({ achievement, unlockedAt });
    }

    // Insert all in one batch.
    if (newUnlocks.length > 0) {
      await this.prisma.userAchievement.createMany({
        data: newUnlocks.map((u) => ({
          userId,
          achievementId: u.achievement.id,
          unlockedAt: u.unlockedAt,
        })),
        skipDuplicates: true,
      });
    }

    return newUnlocks;
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
  ): Promise<AchievementWithUnlockState[]> {
    const [achievements, unlocks] = await Promise.all([
      this.prisma.achievement.findMany({
        orderBy: [
          { triggerSubstanceId: 'asc' },
          { triggerRecoveryThreshold: 'asc' },
        ],
      }),
      this.prisma.userAchievement.findMany({ where: { userId } }),
    ]);

    const unlockByAchievementId = new Map<string, UserAchievement>();
    for (const u of unlocks) {
      unlockByAchievementId.set(u.achievementId, u);
    }

    return achievements.map((a) => {
      const unlock = unlockByAchievementId.get(a.id);
      return {
        id: a.id,
        tier: a.tier,
        title: a.title,
        physiologicalDescription: a.physiologicalDescription,
        triggerOrganId: a.triggerOrganId,
        triggerSubstanceId: a.triggerSubstanceId,
        triggerRecoveryThreshold: a.triggerRecoveryThreshold,
        unlocked: !!unlock,
        unlockedAt: unlock?.unlockedAt ?? null,
        notifiedAt: unlock?.notifiedAt ?? null,
      };
    });
  }
}