import { Injectable } from '@nestjs/common';
import type { WithdrawalPhase } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

const DAY_MS = 1000 * 60 * 60 * 24;

export interface OrganNarrativeStateEntry {
  organId: string;
  sourceSubstanceId: string;
  phase: WithdrawalPhase;
  narrativeKey: string;
  daysSinceLastUse: number;
  confidenceLevel: 'high' | 'medium' | 'low';
}

@Injectable()
export class OrganNarrativeStateService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns, for every (organ, substance) pair tracked by the user,
   * the active narrative phase based on days since last use.
   *
   * Multiple substances affecting the same organ produce multiple
   * entries — they describe parallel processes (e.g. alcohol's
   * effect on the stomach and nicotine's effect on the stomach are
   * different mechanisms and shown separately).
   */
  async getStateForUser(userId: string): Promise<OrganNarrativeStateEntry[]> {
    const usages = await this.prisma.substanceUsage.findMany({
      where: { userId },
      include: {
        substance: {
          include: {
            narrativeProfiles: {
              include: { phases: true },
            },
          },
        },
      },
    });

    const now = Date.now();
    const entries: OrganNarrativeStateEntry[] = [];

    for (const usage of usages) {
      const daysSinceLastUse = Math.floor(
        (now - usage.lastUseDate.getTime()) / DAY_MS,
      );
      // Match the convention used in neurotransmitter-state: skip
      // day 0 because the user is at least one day into abstinence
      // by the time they consult the app.
      if (daysSinceLastUse < 1) continue;

      for (const profile of usage.substance.narrativeProfiles) {
        const activePhase = profile.phases.find(
          (p) =>
            daysSinceLastUse >= p.startDay &&
            (p.endDay === null || daysSinceLastUse <= p.endDay),
        );
        if (!activePhase) continue;
        if (activePhase.phase === 'during_use') continue;

        entries.push({
          organId: profile.organId,
          sourceSubstanceId: usage.substanceId,
          phase: activePhase.phase,
          narrativeKey: activePhase.narrativeKey,
          daysSinceLastUse,
          confidenceLevel: profile.confidenceLevel,
        });
      }
    }

    return entries;
  }
}