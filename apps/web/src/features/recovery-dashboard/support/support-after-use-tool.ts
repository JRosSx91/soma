/**
 * SUP-02E after-use companion (educational, in-memory only).
 *
 * Publication: `SUPPORT_AFTER_USE_TOOL_ENABLED` is on in the local tree for the
 * joint SUP-02 release; production deploy still needs express authorization.
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

/** Local enablement for SUP-02 joint release. Production still pending express auth. */
export const SUPPORT_AFTER_USE_TOOL_ENABLED: boolean = true;

/**
 * Soft post-save LIVE invite. Off for this release: hub voluntary access stays
 * on, but automatic invite needs authenticated LIVE validation first.
 */
export const SUPPORT_AFTER_USE_INVITE_ENABLED: boolean = false;

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

export const SUPPORT_AFTER_USE_CONTENT_VERSION = "0.2.0" as const;
export const SUPPORT_AFTER_USE_IMPLEMENTATION_STATUS = "implemented" as const;
export const SUPPORT_AFTER_USE_EDITORIAL_STATUS = "editorial_review_done" as const;
export const SUPPORT_AFTER_USE_SAFETY_STATUS = "safety_review_done" as const;
export const SUPPORT_AFTER_USE_CLINICAL_STATUS = "external_clinical_validation_not_done" as const;
export const SUPPORT_AFTER_USE_PUBLICATION_STATUS = "enabled_pending_production" as const;
export const SUPPORT_AFTER_USE_PUBLICATION_GATE = "awaiting_express_production_release" as const;

export const AFTER_USE_COMPANION_STEPS = [
  "welcome",
  "care",
  "recognize",
  "forward",
  "close",
] as const;
export type AfterUseCompanionStep = (typeof AFTER_USE_COMPANION_STEPS)[number];

export function isSupportAfterUseToolEnabled(): boolean {
  return SUPPORT_AFTER_USE_TOOL_ENABLED;
}

/** Invite requires both the companion gate and the invite switch. */
export function isSupportAfterUseInviteEnabled(): boolean {
  return SUPPORT_AFTER_USE_TOOL_ENABLED && SUPPORT_AFTER_USE_INVITE_ENABLED;
}

export function isSupportAfterUseCompanionId(
  value: string,
): value is typeof SUPPORT_AFTER_USE_COMPANION_ID {
  return value === SUPPORT_AFTER_USE_COMPANION_ID;
}
