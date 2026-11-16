/**
 * SUP-02E after-use companion (educational, in-memory only).
 *
 * Publication gate: `SUPPORT_AFTER_USE_TOOL_ENABLED` must stay false until
 * independent publication authorization.
 *
 * Privacy: opens via SupportPage React state, or a one-shot module memory
 * flag after a LIVE invite accept (never URL, never location.state, never
 * storage). Query `?tool=` never opens the tool. Internal product id is for
 * docs/tests only — not a public deep-link.
 *
 * Editorial/clinical gates are tracked separately from the technical build.
 */

export const SUPPORT_AFTER_USE_COMPANION_ID = "after.use.companion" as const;
export const SUPPORT_AFTER_USE_ANCHOR_ID = "support-after-use" as const;

/** Independent publication switch. Do not flip without express authorization. */
export const SUPPORT_AFTER_USE_TOOL_ENABLED: boolean = false;

/**
 * One-shot in-memory hand-off from the post-save invite → Support hub.
 * Holds no substances, dates, motives, or user ids. Cleared on consume.
 */
let pendingAfterUseCompanionOpen = false;

export function requestAfterUseCompanionOpen(): void {
  pendingAfterUseCompanionOpen = true;
}

export function consumeAfterUseCompanionOpenRequest(): boolean {
  const pending = pendingAfterUseCompanionOpen;
  pendingAfterUseCompanionOpen = false;
  return pending;
}

/** Test helper — keeps the module flag deterministic across unit runs. */
export function resetAfterUseCompanionOpenRequest(): void {
  pendingAfterUseCompanionOpen = false;
}

export const SUPPORT_AFTER_USE_CONTENT_VERSION = "0.1.0" as const;
export const SUPPORT_AFTER_USE_IMPLEMENTATION_STATUS = "implemented" as const;
export const SUPPORT_AFTER_USE_EDITORIAL_STATUS = "pending" as const;
export const SUPPORT_AFTER_USE_CLINICAL_STATUS = "pending" as const;
export const SUPPORT_AFTER_USE_PUBLICATION_STATUS = "unpublished" as const;
export const SUPPORT_AFTER_USE_PUBLICATION_GATE = "pending_independent_authorization" as const;

export const AFTER_USE_COMPANION_STEPS = ["welcome", "close"] as const;
export type AfterUseCompanionStep = (typeof AFTER_USE_COMPANION_STEPS)[number];

export function isSupportAfterUseToolEnabled(): boolean {
  return SUPPORT_AFTER_USE_TOOL_ENABLED;
}

export function isSupportAfterUseCompanionId(
  value: string,
): value is typeof SUPPORT_AFTER_USE_COMPANION_ID {
  return value === SUPPORT_AFTER_USE_COMPANION_ID;
}
