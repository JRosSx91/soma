import { Injectable } from '@nestjs/common';
import type {
  Neurotransmitter,
  NeurotransmitterDirection,
  NeurotransmitterSeverity,
  WithdrawalPhase,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { ORGAN_NEUROTRANSMITTERS } from './organ-neurotransmitter-map.js';

const DAY_MS = 1000 * 60 * 60 * 24;

/**
 * Severity ordering, used to pick the "worst" state when multiple
 * substances affect the same neurotransmitter for a single user.
 */
const SEVERITY_RANK: Record<NeurotransmitterSeverity, number> = {
  severe: 3,
  moderate: 2,
  mild: 1,
  normalizing: 0,
};

export interface NeurotransmitterStateEntry {
  neurotransmitter: Neurotransmitter;
  organId: string;
  phase: WithdrawalPhase;
  direction: NeurotransmitterDirection;
  severity: NeurotransmitterSeverity;
  symptomKey: string;
  daysSinceLastUse: number;
  sourceSubstanceId: string;
  confidenceLevel: 'high' | 'medium' | 'low';
}

@Injectable()
export class NeurotransmitterStateService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns, for every (organ, neurotransmitter) pair that's affected
   * by the user's tracked substances, the current state.
   *
   * If multiple substances affect the same neurotransmitter, the
   * worst severity wins.
   */
  async getStateForUser(userId: string): Promise<NeurotransmitterStateEntry[]> {
    const usages = await this.prisma.substanceUsage.findMany({
      where: { userId },
      include: {
        substance: {
          include: {
            neurotransmitterProfiles: {
              include: { phases: true },
            },
          },
        },
      },
    });

    const now = Date.now();
    // Map of `${organId}:${neurotransmitter}` -> entry
    const bestByOrganNT = new Map<string, NeurotransmitterStateEntry>();

    for (const usage of usages) {
      // Active consumption: the substance is being used right now. We
      // surface the `during_use` phase narrative so the user sees what
      // their neurotransmitter system is enduring in this moment,
      // rather than calculating a recovery phase that doesn't apply.
      if (usage.status === 'active') {
        for (const profile of usage.substance.neurotransmitterProfiles) {
          const duringUsePhase = profile.phases.find(
            (p) => p.phase === 'during_use',
          );
          if (!duringUsePhase) continue;

          for (const [organId, neurotransmitters] of Object.entries(
            ORGAN_NEUROTRANSMITTERS,
          )) {
            if (!neurotransmitters.includes(profile.neurotransmitter)) continue;

            const key = `${organId}:${profile.neurotransmitter}`;
            const candidate: NeurotransmitterStateEntry = {
              neurotransmitter: profile.neurotransmitter,
              organId,
              phase: 'during_use',
              direction: duringUsePhase.direction,
              severity: duringUsePhase.severity,
              symptomKey: duringUsePhase.symptomKey,
              daysSinceLastUse: 0,
              sourceSubstanceId: usage.substanceId,
              confidenceLevel: profile.confidenceLevel,
            };

            const existing = bestByOrganNT.get(key);
            if (
              !existing ||
              SEVERITY_RANK[candidate.severity] >
                SEVERITY_RANK[existing.severity]
            ) {
              bestByOrganNT.set(key, candidate);
            }
          }
        }
        continue;
      }

      // Abstinence path: we know lastUseDate is non-null because the
      // DTO + service enforce that abstinent usages have a date.
      // The non-null assertion is safe by domain invariant.
      if (!usage.lastUseDate) continue;
      const daysSinceLastUse = Math.floor(
        (now - usage.lastUseDate.getTime()) / DAY_MS,
      );
      // Day 0 is "during use" — we don't surface that phase to users
      // because by definition they've abstained for at least a moment
      // to be using Soma. Day 1+ is where we start.
      if (daysSinceLastUse < 1) continue;

      for (const profile of usage.substance.neurotransmitterProfiles) {
        const activePhase = profile.phases.find(
          (p) =>
            daysSinceLastUse >= p.startDay &&
            (p.endDay === null || daysSinceLastUse <= p.endDay),
        );
        if (!activePhase) continue;
        // Skip during_use phase as noted above.
        if (activePhase.phase === 'during_use') continue;

        // Find which organs this neurotransmitter is expressed in.
        for (const [organId, neurotransmitters] of Object.entries(
          ORGAN_NEUROTRANSMITTERS,
        )) {
          if (!neurotransmitters.includes(profile.neurotransmitter)) continue;

          const key = `${organId}:${profile.neurotransmitter}`;
          const candidate: NeurotransmitterStateEntry = {
            neurotransmitter: profile.neurotransmitter,
            organId,
            phase: activePhase.phase,
            direction: activePhase.direction,
            severity: activePhase.severity,
            symptomKey: activePhase.symptomKey,
            daysSinceLastUse,
            sourceSubstanceId: usage.substanceId,
            confidenceLevel: profile.confidenceLevel,
          };

          const existing = bestByOrganNT.get(key);
          if (
            !existing ||
            SEVERITY_RANK[candidate.severity] >
              SEVERITY_RANK[existing.severity]
          ) {
            bestByOrganNT.set(key, candidate);
          }
        }
      }
    }

    return Array.from(bestByOrganNT.values());
  }
}