import type { TemporalMilestoneState } from "@soma/shared-types";
import type { DemoSubstance } from "../demo-data.js";
import {
  educationalNtPhaseWindows,
  educationalNtQualitativeProfiles,
  type EducationalNtConfidence,
  type EducationalNtDirection,
  type EducationalNtPhase,
  type EducationalNtQualitativeProfile,
  type EducationalNtSeverity,
} from "./educational-nt-qualitative-catalog.js";
import type { EducationalNeurotransmitter } from "./neurotransmitter-education.js";

export type EducationalNtClockStatus =
  | "active"
  | "abstinent"
  | "missing_date"
  | "day_zero";

export interface EducationalNtRecoveryInput {
  substanceId: string;
  usageStatus: "active" | "abstinent";
  /** Elapsed 24h days from the Recovery 2.0 clock. Null when the clock cannot run. */
  daysAbstinent: number | null;
}

export interface EducationalNtRecoveryRow {
  substanceId: string;
  neurotransmitter: EducationalNeurotransmitter;
  mechanismKey: string;
  direction: EducationalNtDirection;
  severity: EducationalNtSeverity;
  educationalPhase: EducationalNtPhase;
  daysUsed: number | null;
  clockStatus: "active" | "abstinent";
  confidence: EducationalNtConfidence;
  calendarKind: "shared_educational_windows";
  window: { startDay: number; endDay: number | null };
}

export interface EducationalNtRecoveryView {
  substanceId: string;
  clockStatus: EducationalNtClockStatus;
  daysUsed: number | null;
  educationalPhase: EducationalNtPhase | null;
  window: { startDay: number; endDay: number | null } | null;
  rows: readonly EducationalNtRecoveryRow[];
}

function abstinencePhaseForDays(days: number): EducationalNtPhase | null {
  if (!Number.isFinite(days) || days < 1) return null;
  const elapsed = Math.floor(days);
  for (const phase of ["acute_withdrawal", "post_acute", "normalizing"] as const) {
    const window = educationalNtPhaseWindows[phase];
    if (elapsed < window.startDay) continue;
    if (window.endDay != null && elapsed > window.endDay) continue;
    return phase;
  }
  return null;
}

function rowsForPhase(
  substanceId: string,
  phase: EducationalNtPhase,
  daysUsed: number | null,
  clockStatus: "active" | "abstinent",
  catalog: readonly EducationalNtQualitativeProfile[],
): EducationalNtRecoveryRow[] {
  const window = educationalNtPhaseWindows[phase];
  const rows: EducationalNtRecoveryRow[] = [];
  for (const profile of catalog) {
    if (profile.substanceId !== substanceId) continue;
    const qualitative = profile.cells.find((item) => item.phase === phase);
    if (!qualitative) continue;
    rows.push({
      substanceId,
      neurotransmitter: profile.neurotransmitter,
      mechanismKey: profile.mechanismKey,
      direction: qualitative.direction,
      severity: qualitative.severity,
      educationalPhase: phase,
      daysUsed,
      clockStatus,
      confidence: profile.confidenceLevel,
      calendarKind: "shared_educational_windows",
      window: { startDay: window.startDay, endDay: window.endDay },
    });
  }
  return rows;
}

export function presentEducationalNtRecovery(
  input: EducationalNtRecoveryInput,
  catalog: readonly EducationalNtQualitativeProfile[] = educationalNtQualitativeProfiles,
): EducationalNtRecoveryView {
  const substanceId = input.substanceId;

  if (input.usageStatus === "active") {
    const phase = "during_use" as const;
    const window = educationalNtPhaseWindows[phase];
    return {
      substanceId,
      clockStatus: "active",
      daysUsed: null,
      educationalPhase: phase,
      window,
      rows: rowsForPhase(substanceId, phase, null, "active", catalog),
    };
  }

  if (input.daysAbstinent == null) {
    return {
      substanceId,
      clockStatus: "missing_date",
      daysUsed: null,
      educationalPhase: null,
      window: null,
      rows: [],
    };
  }

  const elapsed = Math.floor(input.daysAbstinent);
  if (elapsed < 1) {
    return {
      substanceId,
      clockStatus: "day_zero",
      daysUsed: elapsed,
      educationalPhase: null,
      window: null,
      rows: [],
    };
  }

  const phase = abstinencePhaseForDays(elapsed);
  if (!phase) {
    return {
      substanceId,
      clockStatus: "missing_date",
      daysUsed: elapsed,
      educationalPhase: null,
      window: null,
      rows: [],
    };
  }

  const window = educationalNtPhaseWindows[phase];
  return {
    substanceId,
    clockStatus: "abstinent",
    daysUsed: elapsed,
    educationalPhase: phase,
    window,
    rows: rowsForPhase(substanceId, phase, elapsed, "abstinent", catalog),
  };
}

/** Map Recovery 2.0 substance + temporal clock. Does not invent a second clock. */
export function educationalNtInputFromRecovery(
  substance: Pick<DemoSubstance, "id" | "usageStatus">,
  temporal: TemporalMilestoneState | undefined,
): EducationalNtRecoveryInput {
  if (substance.usageStatus === "active" || temporal?.status === "active_use") {
    return {
      substanceId: substance.id,
      usageStatus: "active",
      daysAbstinent: null,
    };
  }
  if (
    temporal == null ||
    temporal.status === "missing_date" ||
    temporal.status === "invalid_date"
  ) {
    return {
      substanceId: substance.id,
      usageStatus: "abstinent",
      daysAbstinent: null,
    };
  }
  return {
    substanceId: substance.id,
    usageStatus: "abstinent",
    daysAbstinent: temporal.daysAbstinent,
  };
}
