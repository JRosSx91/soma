import { useMemo } from "react";
import type { OrganId } from "@soma/shared-types";
import { useSubstances } from "../substances/index.js";
import type { ApiSubstance } from "../substances/index.js";
import { computeRecovery } from "../recovery-engine/index.js";
import { MOCK_PROFILE } from "./mock.js";
import type { UserProfile } from "./types.js";

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
  confidenceLevel: "high" | "medium" | "low";
  dominantStatus: "abstinent" | "active";
  contributingSubstances: Array<{
    substanceId: string;
    status: "abstinent" | "active";
    progressFraction: number;
  }>;
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
export function useOrganStates(
  profile: UserProfile = MOCK_PROFILE,
): UseOrganStatesResult {
  const { data, loading, error } = useSubstances();

  const states = useMemo<Map<OrganId, OrganState>>(() => {
    const result = new Map<OrganId, OrganState>();
    if (!data) return result;

    const now = Date.now();

    const substancesById = new Map<string, ApiSubstance>(
      data.map((s) => [s.id, s]),
    );

    // First pass: collect all contributions per organ.
    // Each entry tracks one (substance, curve) impact on an organ.
    interface Contribution {
      substanceId: string;
      status: "abstinent" | "active";
      progressFraction: number;
      absoluteRecovery: number;
      daysAbstinent: number;
      organName: string;
      confidenceLevel: "high" | "medium" | "low";
    }
    const contributionsByOrgan = new Map<OrganId, Contribution[]>();

    for (const usage of profile.usages) {
      const substance = substancesById.get(usage.substanceId);
      if (!substance) continue;

      // Active consumption: organ is being damaged in real time.
      // progressFraction is 0; we don't compute recovery for this path.
      if (usage.status === "active") {
        for (const curve of substance.recoveryCurves) {
          const list = contributionsByOrgan.get(curve.organId) ?? [];
          list.push({
            substanceId: usage.substanceId,
            status: "active",
            progressFraction: 0,
            absoluteRecovery: 0,
            daysAbstinent: 0,
            organName: curve.organ.name,
            confidenceLevel: curve.confidenceLevel,
          });
          contributionsByOrgan.set(curve.organId, list);
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

        const list = contributionsByOrgan.get(curve.organId) ?? [];
        list.push({
          substanceId: usage.substanceId,
          status: "abstinent",
          progressFraction: recovery.progressFraction,
          absoluteRecovery: recovery.absoluteRecovery,
          daysAbstinent: recovery.daysAbstinent,
          organName: curve.organ.name,
          confidenceLevel: curve.confidenceLevel,
        });
        contributionsByOrgan.set(curve.organId, list);
      }
    }

    // Second pass: build the final OrganState for each organ,
    // sorting contributions by severity (worst first).
    contributionsByOrgan.forEach((contributions, organId) => {
      const activeContribs = contributions.filter((c) => c.status === 'active');
      const abstinentContribs = contributions.filter((c) => c.status === 'abstinent');

      // Sort abstinent by worst progress first
      abstinentContribs.sort((a, b) => a.progressFraction - b.progressFraction);

      const hasActive = activeContribs.length > 0;
      const worstAbstinent = abstinentContribs[0] ?? null;

      // Dominant for visual progress: worst abstinent substance.
      // If only active substances affect this organ, progress is 0.
      const dominant = worstAbstinent ?? activeContribs[0];

      result.set(organId, {
        organId,
        organName: dominant.organName,
        progressFraction: worstAbstinent?.progressFraction ?? 0,
        absoluteRecovery: worstAbstinent?.absoluteRecovery ?? 0,
        daysAbstinent: worstAbstinent?.daysAbstinent ?? 0,
        dominantSubstanceId: dominant.substanceId,
        confidenceLevel: dominant.confidenceLevel,
        dominantStatus: hasActive ? 'active' : 'abstinent',
        contributingSubstances: contributions.map((c) => ({
          substanceId: c.substanceId,
          status: c.status,
          progressFraction: c.progressFraction,
        })),
      });
    });

    return result;
  }, [data, profile]);

  return { states, loading, error, profile };
}
