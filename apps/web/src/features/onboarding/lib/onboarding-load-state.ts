/**
 * Distinguishes pending catalog/profile fetches from finished failures.
 * A finished request must never keep the onboarding spinner.
 */

export type OnboardingLoadKind =
  | "loading"
  | "catalogError"
  | "profileError"
  | "ready";

export interface OnboardingLoadInput {
  catalogLoading: boolean;
  catalog: readonly unknown[] | null;
  profileLoading: boolean;
  profile: object | null;
  profileError: string | null;
}

export function resolveOnboardingLoadView(
  input: OnboardingLoadInput,
): OnboardingLoadKind {
  // Finished catalog fetch with no list (error or empty-null) is terminal.
  if (!input.catalogLoading && input.catalog === null) {
    return "catalogError";
  }

  if (input.catalogLoading || input.profileLoading) {
    return "loading";
  }

  if (input.profileError || !input.profile) {
    return "profileError";
  }

  return "ready";
}

/** Dev-only payload: load kind only — never tokens, ids, or health data. */
export function onboardingLoadDebugPayload(kind: OnboardingLoadKind): {
  source: "onboarding-load";
  kind: OnboardingLoadKind;
} {
  return { source: "onboarding-load", kind };
}

export function logOnboardingLoadInDev(kind: OnboardingLoadKind): void {
  const dev =
    typeof import.meta !== "undefined" &&
    Boolean(
      (import.meta as ImportMeta & { env?: { DEV?: boolean } }).env?.DEV,
    );
  if (!dev) return;
  console.debug("[soma:onboarding-load]", onboardingLoadDebugPayload(kind));
}
