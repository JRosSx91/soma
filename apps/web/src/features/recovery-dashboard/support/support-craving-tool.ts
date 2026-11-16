/**
 * SUP-02C craving companion tool (educational, in-memory only).
 *
 * Publication gate: `SUPPORT_CRAVING_TOOL_ENABLED` must stay false until
 * independent publication authorization.
 *
 * Privacy: the companion opens via SupportPage in-memory state only.
 * Query `?tool=` (including legacy `craving.companion`) never opens the
 * tool and is stripped when present. The product id remains an internal
 * constant for docs/tests — it must not appear in the URL during normal use.
 *
 * Editorial/clinical gates are tracked separately from the technical build.
 */

export const SUPPORT_TOOL_QUERY_KEY = "tool" as const;
/** Internal product id (docs/tests). Not used as a public deep-link. */
export const SUPPORT_CRAVING_COMPANION_ID = "craving.companion" as const;
export const SUPPORT_CRAVING_ANCHOR_ID = "support-craving" as const;

/** Independent publication switch. Do not flip without express authorization. */
export const SUPPORT_CRAVING_TOOL_ENABLED: boolean = false;

export const SUPPORT_CRAVING_CONTENT_VERSION = "0.1.2" as const;
export const SUPPORT_CRAVING_IMPLEMENTATION_STATUS = "implemented" as const;
export const SUPPORT_CRAVING_EDITORIAL_STATUS = "editorial_review_done" as const;
export const SUPPORT_CRAVING_CLINICAL_STATUS = "pending" as const;
export const SUPPORT_CRAVING_PUBLICATION_STATUS = "unpublished" as const;
export const SUPPORT_CRAVING_PUBLICATION_GATE = "pending_independent_authorization" as const;

export const CRAVING_COMPANION_STEPS = [
  "welcome",
  "ground",
  "observe",
  "choose",
  "close",
] as const;
export type CravingCompanionStep = (typeof CRAVING_COMPANION_STEPS)[number];

export const CRAVING_CHOICE_IDS = [
  "leave_setting",
  "contact_person",
  "recall_reasons",
  "safe_activity",
  "breathing",
  "professional",
] as const;
export type CravingChoiceId = (typeof CRAVING_CHOICE_IDS)[number];

export function isSupportCravingToolEnabled(): boolean {
  return SUPPORT_CRAVING_TOOL_ENABLED;
}

export function isSupportCravingCompanionId(value: string): value is typeof SUPPORT_CRAVING_COMPANION_ID {
  return value === SUPPORT_CRAVING_COMPANION_ID;
}

/**
 * Legacy/deep-link resolver: always null.
 * Opening the companion must never depend on the URL.
 */
export function resolveSupportToolQueryParam(
  _value: string | null | undefined,
): null {
  return null;
}

/** Always strips `tool` from the query string (legacy values included). */
export function writeSupportToolSearchParams(
  current: URLSearchParams,
  _toolId?: typeof SUPPORT_CRAVING_COMPANION_ID | null,
): URLSearchParams {
  const next = new URLSearchParams(current);
  next.delete(SUPPORT_TOOL_QUERY_KEY);
  return next;
}
