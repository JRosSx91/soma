import type { UsageInput } from "../hooks/useUserProfile.js";
import {
  completeOnboardingStatusOnly,
  completeOnboardingWithUsages,
  type OnboardingActionResult,
} from "./onboarding-actions.js";
import {
  patchOnboardingStatus,
  saveUserUsages,
} from "../client/profile-api.js";

/** Wire-format row used for equality — matches what we PUT to the API. */
export interface NormalizedUsagePayload {
  substanceId: string;
  yearStarted: number;
  lastUseDate: string | null;
  frequency: UsageInput["frequency"];
  status: UsageInput["status"];
}

/**
 * Normalize a usages array into the comparable payload shape actually sent
 * on PUT /me/profile (sorted by substanceId for stable equality).
 */
export function normalizeUsagesPayload(
  usages: UsageInput[],
): NormalizedUsagePayload[] {
  return usages
    .map((u) => ({
      substanceId: u.substanceId,
      yearStarted: u.yearStarted,
      lastUseDate: u.status === "active" ? null : u.lastUseDate,
      frequency: u.frequency,
      status: u.status,
    }))
    .sort((a, b) => a.substanceId.localeCompare(b.substanceId));
}

/** Deep equality of normalized PUT payloads (not object identity). */
export function usagesPayloadEqual(
  a: UsageInput[],
  b: UsageInput[],
): boolean {
  return (
    JSON.stringify(normalizeUsagesPayload(a)) ===
    JSON.stringify(normalizeUsagesPayload(b))
  );
}

export type PersistPlan = "patch-only" | "put-and-patch";

/**
 * Decide whether a retry may PATCH-only or must PUT again.
 * Patch-only only when we already have a confirmed PUT snapshot and the
 * current form still serializes to that same payload.
 */
export function planOnboardingPersist(
  currentUsages: UsageInput[],
  lastSuccessfulPut: UsageInput[] | null,
  awaitingStatusRetry: boolean,
): PersistPlan {
  if (
    awaitingStatusRetry &&
    lastSuccessfulPut !== null &&
    usagesPayloadEqual(currentUsages, lastSuccessfulPut)
  ) {
    return "patch-only";
  }
  return "put-and-patch";
}

export type PersistOnboardingResult = OnboardingActionResult & {
  /** Snapshot of the last PUT that the backend accepted (null if PUT failed). */
  lastSuccessfulPut: UsageInput[] | null;
};

/**
 * Persist usages (when needed) then mark onboarding completed.
 * Never treats the flow as completed until PATCH succeeds.
 * Updates `lastSuccessfulPut` whenever PUT succeeds (even if PATCH fails).
 */
export async function persistOnboardingCompletion(
  currentUsages: UsageInput[],
  options: {
    lastSuccessfulPut: UsageInput[] | null;
    awaitingStatusRetry: boolean;
    saveUsages?: typeof saveUserUsages;
    patchStatus?: typeof patchOnboardingStatus;
  },
): Promise<PersistOnboardingResult> {
  const plan = planOnboardingPersist(
    currentUsages,
    options.lastSuccessfulPut,
    options.awaitingStatusRetry,
  );

  const deps = {
    saveUsages: options.saveUsages,
    patchStatus: options.patchStatus,
  };

  if (plan === "patch-only") {
    const result = await completeOnboardingStatusOnly({
      patchStatus: deps.patchStatus,
    });
    return {
      ...result,
      lastSuccessfulPut: options.lastSuccessfulPut,
    };
  }

  const result = await completeOnboardingWithUsages(currentUsages, deps);

  if (!result.ok && result.phase === "put") {
    return {
      ...result,
      lastSuccessfulPut: options.lastSuccessfulPut,
    };
  }

  // PUT succeeded (PATCH may have failed) — snapshot the confirmed payload.
  const snapshot = normalizeUsagesPayload(currentUsages).map((row) => ({
    ...row,
  }));

  return {
    ...result,
    lastSuccessfulPut: snapshot,
  };
}
