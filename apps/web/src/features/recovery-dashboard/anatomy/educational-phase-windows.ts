import type { SubstanceId } from "@soma/shared-types";
import { narrativePhases, type NarrativePhase } from "./narrative-catalog.ts";

/**
 * Optional educational day windows for atlas copy. Distinct from:
 * - `NarrativePhase` catalog identity
 * - Soma 1.0 global seed day bounds
 * - organ recovery curve day estimates
 *
 * This module does not estimate personal recovery, read usage dates,
 * or invent ranges. An empty catalog is the honest default.
 */

export const educationalPhaseWindowKinds = ["symptoms", "neuroadaptation"] as const;
export type EducationalPhaseWindowKind = (typeof educationalPhaseWindowKinds)[number];

export const educationalWindowUncertainties = [
  "approximate",
  "variable",
  "insufficient",
] as const;
export type EducationalWindowUncertainty = (typeof educationalWindowUncertainties)[number];

export interface EducationalDayRange {
  startDay: number;
  /** Null means open-ended. Never inferred. */
  endDay: number | null;
}

export interface EducationalWindowReference {
  /** Citation as recorded. Empty when no source is identified. */
  source: string;
}

export interface EducationalPhaseWindow {
  substanceId: SubstanceId;
  phase: NarrativePhase;
  kind: EducationalPhaseWindowKind;
  /** Null when evidence is insufficient. Callers must not substitute a default. */
  range: EducationalDayRange | null;
  uncertainty: EducationalWindowUncertainty;
  reference: EducationalWindowReference | null;
}

export interface EducationalPhaseWindowQuery {
  substanceId: string;
  phase: string;
  kind: EducationalPhaseWindowKind;
}

/**
 * Authored educational windows. Empty until a later phase cites ranges.
 * Do not copy the legacy global seed bounds into this list.
 */
export const educationalPhaseWindowCatalog: readonly EducationalPhaseWindow[] = [];

export function lookupEducationalPhaseWindow(
  catalog: readonly EducationalPhaseWindow[],
  query: EducationalPhaseWindowQuery,
): EducationalPhaseWindow | null {
  if (!narrativePhases.includes(query.phase as NarrativePhase)) return null;
  if (!educationalPhaseWindowKinds.includes(query.kind)) return null;
  return (
    catalog.find(
      (item) =>
        item.substanceId === query.substanceId &&
        item.phase === query.phase &&
        item.kind === query.kind,
    ) ?? null
  );
}

/** Returns the authored range, or null. Never fills days from another catalog. */
export function educationalDayRangeOf(window: EducationalPhaseWindow | null): EducationalDayRange | null {
  return window?.range ?? null;
}
