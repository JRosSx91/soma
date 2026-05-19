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

const SEVERITY_RANK: Record<NeurotransmitterSeverity, number> = {
  severe: 3,
  moderate: 2,
  mild: 1,
  normalizing: 0,
};

const CONFIDENCE_RANK: Record<'high' | 'medium' | 'low', number> = {
  high: 2,
  medium: 1,
  low: 0,
} as const;

export interface NTSource {
  substanceId: string;
  mechanismKey: string | null;
  phase: WithdrawalPhase;
  direction: NeurotransmitterDirection;
  severity: NeurotransmitterSeverity;
  symptomKey: string;
  daysSinceLastUse: number;
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface ComposedNTState {
  neurotransmitter: Neurotransmitter;
  organId: string;
  resultingSeverity: NeurotransmitterSeverity;
  resultingDirection: NeurotransmitterDirection;
  resultingSymptomKey: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  sources: NTSource[];
}

function worstSource(sources: NTSource[]): NTSource {
  return sources.reduce((worst, current) =>
    SEVERITY_RANK[current.severity] > SEVERITY_RANK[worst.severity]
      ? current
      : worst,
  );
}

function lowestConfidence(sources: NTSource[]): 'high' | 'medium' | 'low' {
  return sources.reduce((lowest, current) => {
    const currentRank = CONFIDENCE_RANK[current.confidenceLevel];
    const lowestRank = CONFIDENCE_RANK[lowest.confidenceLevel];
    return currentRank < lowestRank ? current : lowest;
  }).confidenceLevel;
}

@Injectable()
export class NeurotransmitterStateService {
  constructor(private readonly prisma: PrismaService) {}

  async getStateForUser(userId: string): Promise<ComposedNTState[]> {
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
    // Map of `${organId}:${neurotransmitter}` -> list of sources
    const sourcesByOrganNT = new Map<string, NTSource[]>();

    for (const usage of usages) {
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
            const source: NTSource = {
              substanceId: usage.substanceId,
              mechanismKey: profile.mechanismKey,
              phase: 'during_use',
              direction: duringUsePhase.direction,
              severity: duringUsePhase.severity,
              symptomKey: duringUsePhase.symptomKey,
              daysSinceLastUse: 0,
              confidenceLevel: profile.confidenceLevel,
            };

            const existing = sourcesByOrganNT.get(key) ?? [];
            existing.push(source);
            sourcesByOrganNT.set(key, existing);
          }
        }
        continue;
      }

      if (!usage.lastUseDate) continue;
      const daysSinceLastUse = Math.floor(
        (now - usage.lastUseDate.getTime()) / DAY_MS,
      );
      if (daysSinceLastUse < 1) continue;

      for (const profile of usage.substance.neurotransmitterProfiles) {
        const activePhase = profile.phases.find(
          (p) =>
            daysSinceLastUse >= p.startDay &&
            (p.endDay === null || daysSinceLastUse <= p.endDay),
        );
        if (!activePhase) continue;
        if (activePhase.phase === 'during_use') continue;

        for (const [organId, neurotransmitters] of Object.entries(
          ORGAN_NEUROTRANSMITTERS,
        )) {
          if (!neurotransmitters.includes(profile.neurotransmitter)) continue;

          const key = `${organId}:${profile.neurotransmitter}`;
          const source: NTSource = {
            substanceId: usage.substanceId,
            mechanismKey: profile.mechanismKey,
            phase: activePhase.phase,
            direction: activePhase.direction,
            severity: activePhase.severity,
            symptomKey: activePhase.symptomKey,
            daysSinceLastUse,
            confidenceLevel: profile.confidenceLevel,
          };

          const existing = sourcesByOrganNT.get(key) ?? [];
          existing.push(source);
          sourcesByOrganNT.set(key, existing);
        }
      }
    }

    const result: ComposedNTState[] = [];

    for (const [key, sources] of sourcesByOrganNT.entries()) {
      const [organId, neurotransmitter] = key.split(':') as [string, string];
      const worst = worstSource(sources);

      result.push({
        neurotransmitter: neurotransmitter as Neurotransmitter,
        organId,
        resultingSeverity: worst.severity,
        resultingDirection: worst.direction,
        resultingSymptomKey: worst.symptomKey,
        confidenceLevel: lowestConfidence(sources),
        sources,
      });
    }

    return result;
  }
}