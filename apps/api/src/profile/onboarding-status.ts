import { OnboardingStatus } from "@prisma/client";

/**
 * Allowed explicit transitions for onboardingStatus.
 * Status is never derived from usages.length.
 *
 * pending  → skipped | completed
 * skipped  → completed
 * completed → skipped
 * Same → same is treated as an idempotent no-op by the service.
 */
const ALLOWED: ReadonlyMap<OnboardingStatus, ReadonlySet<OnboardingStatus>> =
  new Map([
    [
      OnboardingStatus.pending,
      new Set([OnboardingStatus.skipped, OnboardingStatus.completed]),
    ],
    [OnboardingStatus.skipped, new Set([OnboardingStatus.completed])],
    [OnboardingStatus.completed, new Set([OnboardingStatus.skipped])],
  ]);

export function isOnboardingTransitionAllowed(
  from: OnboardingStatus,
  to: OnboardingStatus,
): boolean {
  if (from === to) return true;
  return ALLOWED.get(from)?.has(to) ?? false;
}
