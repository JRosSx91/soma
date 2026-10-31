import { isOnbTourStepId, type OnbTourStepId } from "./tour-steps.js";
import type { OnboardingStatus } from "../profile/onboarding-status.js";
import type { ShellBase } from "../recovery-dashboard/shell-base.js";

export const ONB_TOUR_STORAGE_PREFIX = "soma.onb01.";

export type OnbTourPersistStatus = "in_progress" | "done" | "dismissed";

export interface OnbTourRecord {
  v: 1;
  status: OnbTourPersistStatus;
  stepId: OnbTourStepId;
}

const USER_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export function liveStorageKey(userId: string): string | null {
  if (!USER_ID_PATTERN.test(userId)) return null;
  return `${ONB_TOUR_STORAGE_PREFIX}${userId}`;
}

function asRecord(value: unknown): OnbTourRecord | null {
  if (!value || typeof value !== "object") return null;
  const row = value as { v?: unknown; status?: unknown; stepId?: unknown };
  if (row.v !== 1) return null;
  if (row.status !== "in_progress" && row.status !== "done" && row.status !== "dismissed") {
    return null;
  }
  if (!isOnbTourStepId(row.stepId)) return null;
  return { v: 1, status: row.status, stepId: row.stepId };
}

export function readLiveTour(userId: string): OnbTourRecord | null {
  const key = liveStorageKey(userId);
  if (!key) return null;
  try {
    const raw = globalThis.localStorage?.getItem(key);
    if (!raw) return null;
    return asRecord(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function writeLiveTour(userId: string, record: OnbTourRecord): void {
  const key = liveStorageKey(userId);
  if (!key) return;
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(record));
  } catch {
    // Private mode must not break the shell.
  }
}

export function clearLiveTour(userId: string): void {
  const key = liveStorageKey(userId);
  if (!key) return;
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    // ignore
  }
}

export interface TourEligibility {
  base: ShellBase;
  userId: string | null;
  authLoading: boolean;
  profileLoading: boolean;
  onboardingStatus: OnboardingStatus | null;
}

export function liveIdentityReady(input: TourEligibility): boolean {
  return (
    input.base === "/app" &&
    !input.authLoading &&
    !input.profileLoading &&
    typeof input.userId === "string" &&
    input.userId.length > 0
  );
}

export function liveAuthOnboardingReady(input: TourEligibility): boolean {
  return (
    liveIdentityReady(input) &&
    (input.onboardingStatus === "completed" || input.onboardingStatus === "skipped")
  );
}

export function writesLiveTourStorage(
  base: TourEligibility["base"],
  userId: string | null,
): boolean {
  return base === "/app" && typeof userId === "string" && userId.length > 0;
}

/** First-time LIVE invite. Never DEMO. Never while AUTH-01 is pending. */
export function shouldOfferLiveInvite(
  input: TourEligibility,
  stored: OnbTourRecord | null,
): boolean {
  if (!liveAuthOnboardingReady(input)) return false;
  return stored == null;
}

/** Interrupted LIVE tour: offer to continue. Never auto-jump. Never DEMO. */
export function shouldOfferLiveContinue(
  input: TourEligibility,
  stored: OnbTourRecord | null,
): boolean {
  if (!liveAuthOnboardingReady(input)) return false;
  return stored?.status === "in_progress";
}

export function shouldResumeLiveTour(
  input: TourEligibility,
  stored: OnbTourRecord | null,
): boolean {
  return shouldOfferLiveContinue(input, stored);
}
