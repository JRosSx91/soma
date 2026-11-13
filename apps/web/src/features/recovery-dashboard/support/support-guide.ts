/**
 * Educational support guide (SUP-01E2-B).
 * Session-only checkbox state; no personal data, storage, or telemetry.
 */

export const SUPPORT_GUIDE_SECTION_IDS = [
  "moments",
  "tools",
  "people",
  "professional",
] as const;

export type SupportGuideSectionId = (typeof SUPPORT_GUIDE_SECTION_IDS)[number];

export type SupportGuideChecked = Record<SupportGuideSectionId, boolean>;

/** Anchor for deep-linking to the guide panel on the Support hub. */
export const SUPPORT_GUIDE_ANCHOR_ID = "support-guide";

/** Existing help panel heading — reused so the guide does not invent new tel:/URLs. */
export const SUPPORT_HELP_PANEL_HASH = "support-help-title";

/** Strategies hub heading on the same page. */
export const SUPPORT_STRATEGIES_PANEL_HASH = "support-strategies-title";

export function emptyGuideChecked(): SupportGuideChecked {
  return {
    moments: false,
    tools: false,
    people: false,
    professional: false,
  };
}

export function toggleGuideChecked(
  state: SupportGuideChecked,
  id: SupportGuideSectionId,
): SupportGuideChecked {
  return { ...state, [id]: !state[id] };
}

export function supportGuideHelpHref(base: "/app" | "/preview"): string {
  return `${base}/support#${SUPPORT_HELP_PANEL_HASH}`;
}

export function supportGuideStrategiesHref(base: "/app" | "/preview"): string {
  return `${base}/support#${SUPPORT_STRATEGIES_PANEL_HASH}`;
}
