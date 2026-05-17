import { useMemo } from 'react';
import type { OrganId } from '@soma/shared-types';
import { useSubstances } from '../substances/index.js';
import type { ApiSubstance } from '../substances/index.js';
import { computeRecovery } from '../recovery-engine/index.js';
import { MOCK_PROFILE } from './mock.js';
import type { UserProfile } from './types.js';

/**
 * Per-organ computed state for the current user.
 *
 * If multiple substances affect the same organ (e.g. brain-vta is
 * affected by all four substances we model), we report the *worst*
 * current state — the substance with the lowest progressFraction
 * dominates. This reflects how the user's body is actually doing:
 * the organ recovers only as fast as its slowest insult allows.
 */
export interface OrganState {
  organId: OrganId;
  organName: string;
  /** Recovery progress in [0, 1]. Drives organ color. */
  progressFraction: number;
  /** Recovery relative to baseline in [0, recoveryCeiling]. Drives achievements. */
  absoluteRecovery: number;
  /** Days since last use of the dominant substance. */
  daysAbstinent: number;
  /** Substance currently dominating this organ's state (the worst one). */
  dominantSubstanceId: string;
  /** Confidence level reported by the dominant curve. */
  confidenceLevel: 'high' | 'medium' | 'low';
  dominantStatus: 'abstinent' | 'active';
}

interface UseOrganStatesResult {
  /** Map of organId -> OrganState. */
  states: Map<OrganId, OrganState>;
  loading: boolean;
  error: Error | null;
  profile: UserProfile;
}

/**
 * Computes, for every organ affected by any substance the user is
 * currently abstaining from, the current recovery state.
 *
 * Reactive to the substance catalog loading. Stable identity for the
 * resulting Map across renders thanks to useMemo over inputs.
 */
export function useOrganStates(profile: UserProfile = MOCK_PROFILE): UseOrganStatesResult {
  const { data, loading, error } = useSubstances();

  const states = useMemo<Map<OrganId, OrganState>>(() => {
    const result = new Map<OrganId, OrganState>();
    if (!data) return result;

    const now = Date.now();

    // Index substances by id for O(1) lookup.
    const substancesById = new Map<string, ApiSubstance>(
      data.map((s) => [s.id, s]),
    );

    for (const usage of profile.usages) {
      const substance = substancesById.get(usage.substanceId);
      if (!substance) continue;

      // Active consumption: the substance is being used right now. We
      // hold the organ at its damaged state (progressFraction = 0)
      // since recovery hasn't started. The UI will surface this
      // differently from "abstinent and not yet improved" so the user
      // understands the distinction.
      if (usage.status === 'active') {
        for (const curve of substance.recoveryCurves) {
          const existing = result.get(curve.organId);
          const candidate: OrganState = {
            organId: curve.organId,
            organName: curve.organ.name,
            progressFraction: 0,
            absoluteRecovery: 0,
            daysAbstinent: 0,
            dominantSubstanceId: usage.substanceId,
            confidenceLevel: curve.confidenceLevel,
            dominantStatus: 'active',
          };

          // Worst state dominates — an active substance with
          // progressFraction=0 will dominate over any abstinent
          // substance still recovering. That's the desired behavior:
          // the organ is being damaged, that's the dominant story.
          if (!existing || candidate.progressFraction < existing.progressFraction) {
            result.set(curve.organId, candidate);
          }
        }
        continue;
      }

      // Abstinence path: lastUseDate guaranteed by the data model.
      if (!usage.lastUseDate) continue;

      for (const curve of substance.recoveryCurves) {
        const recovery = computeRecovery(
          {
            shape: curve.shape,
            daysTo95Recovery: curve.daysTo95Recovery,
            recoveryCeiling: curve.recoveryCeiling,
            lastUseDate: usage.lastUseDate,
          },
          now,
        );

        const existing = result.get(curve.organId);
        const candidate: OrganState = {
          organId: curve.organId,
          organName: curve.organ.name,
          progressFraction: recovery.progressFraction,
          absoluteRecovery: recovery.absoluteRecovery,
          daysAbstinent: recovery.daysAbstinent,
          dominantSubstanceId: usage.substanceId,
          confidenceLevel: curve.confidenceLevel,
          dominantStatus: 'abstinent',
        };

        if (!existing || candidate.progressFraction < existing.progressFraction) {
          result.set(curve.organId, candidate);
        }
      }
    }

    return result;
  }, [data, profile]);

  return { states, loading, error, profile };
}