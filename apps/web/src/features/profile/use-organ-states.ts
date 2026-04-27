import { useMemo } from 'react';
import type { OrganId } from '@soma/shared-types';
import { useSubstances } from '../substances/index.js';
import type { ApiSubstance } from '../substances/index.js';
import { computeRecovery } from '../recovery-engine/index.js';
import { MOCK_PROFILE } from './mock.js';
import type { UserProfile } from './types.js';

export interface OrganState {
  organId: OrganId;
  organName: string;
  progressFraction: number;
  absoluteRecovery: number;
  daysAbstinent: number;
  dominantSubstanceId: string;
  confidenceLevel: 'high' | 'medium' | 'low';
}

interface UseOrganStatesResult {
  states: Map<OrganId, OrganState>;
  loading: boolean;
  error: Error | null;
  profile: UserProfile;
}

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
        };

        // Keep the worst (lowest progressFraction) — it dominates the
        // visible state of the organ.
        if (!existing || candidate.progressFraction < existing.progressFraction) {
          result.set(curve.organId, candidate);
        }
      }
    }

    return result;
  }, [data, profile]);

  return { states, loading, error, profile };
}