import type { ShellBase } from "../shell-base.js";
import type { SupportStrategyTopic } from "./support-links.js";

/**
 * Support strategy catalog (SUP-01D-B2).
 *
 * Editorial Markdown in `docs/review/support/` remains the review register.
 * Runtime copy lives in `support-strategy-content.ts` and must stay aligned
 * with those sheets. Only IDs listed in `SUPPORT_ENABLED_STRATEGY_IDS` resolve
 * from `?strategy=`; unknown or blocked values never open content.
 */
export const SUPPORT_STRATEGY_QUERY_KEY = "strategy";

/** Product IDs (query values). Editorial register uses `support.${id}`. */
export const SUPPORT_STRATEGY_IDS = [
  "stress.pause",
  "habits.small-routines",
  "emotions.naming",
] as const;
export type SupportStrategyId = (typeof SUPPORT_STRATEGY_IDS)[number];

/** Explicit allow-list. Relapse and any draft clinical tips stay out. */
export const SUPPORT_ENABLED_STRATEGY_IDS = [
  "stress.pause",
  "habits.small-routines",
  "emotions.naming",
] as const satisfies readonly SupportStrategyId[];

export type SupportEnabledStrategyId = (typeof SUPPORT_ENABLED_STRATEGY_IDS)[number];

export const SUPPORT_STRATEGY_CONTENT_VERSION = "0.1.0" as const;

export const SUPPORT_BREATHING_ANCHOR_ID = "support-breathing";

/** Topic → sheet. Topics without a sheet stay planned in the hub. */
export const SUPPORT_STRATEGY_BY_TOPIC = {
  stress: "stress.pause",
  habits: "habits.small-routines",
  emotions: "emotions.naming",
  relapse: null,
} as const satisfies Record<SupportStrategyTopic, SupportStrategyId | null>;

const enabledSet = new Set<string>(SUPPORT_ENABLED_STRATEGY_IDS);

export function isSupportStrategyId(value: string): value is SupportStrategyId {
  return (SUPPORT_STRATEGY_IDS as readonly string[]).includes(value);
}

export function isEnabledSupportStrategyId(value: string): value is SupportEnabledStrategyId {
  return enabledSet.has(value);
}

/** Only enabled IDs resolve; everything else is treated as absent. */
export function resolveSupportStrategyQueryParam(
  value: string | null | undefined,
): SupportEnabledStrategyId | null {
  if (value == null || value.trim() === "") return null;
  if (!isEnabledSupportStrategyId(value)) return null;
  return value;
}

export function writeSupportStrategySearchParams(
  current: URLSearchParams,
  strategyId: SupportEnabledStrategyId | null,
): URLSearchParams {
  const next = new URLSearchParams(current);
  if (strategyId && isEnabledSupportStrategyId(strategyId)) {
    next.set(SUPPORT_STRATEGY_QUERY_KEY, strategyId);
  } else {
    next.delete(SUPPORT_STRATEGY_QUERY_KEY);
  }
  return next;
}

export function supportStrategyHref(
  base: ShellBase,
  strategyId: SupportStrategyId,
): string | null {
  if (!isEnabledSupportStrategyId(strategyId)) return null;
  return `${base}/support?${SUPPORT_STRATEGY_QUERY_KEY}=${strategyId}`;
}

export function supportStrategyHrefForTopic(
  base: ShellBase,
  topic: SupportStrategyTopic,
): string | null {
  const id = SUPPORT_STRATEGY_BY_TOPIC[topic];
  if (!id) return null;
  return supportStrategyHref(base, id);
}

/**
 * Hub + breathing tool hash. Explicit empty `search` so a prior `?strategy=`
 * cannot linger when leaving a sheet via this link.
 */
export function supportBreathingLocation(base: ShellBase): {
  pathname: `${ShellBase}/support`;
  search: "";
  hash: typeof SUPPORT_BREATHING_ANCHOR_ID;
} {
  return {
    pathname: `${base}/support`,
    search: "",
    hash: SUPPORT_BREATHING_ANCHOR_ID,
  };
}

/** Serialized form of `supportBreathingLocation` (no query string). */
export function supportBreathingHref(base: ShellBase): string {
  const to = supportBreathingLocation(base);
  return `${to.pathname}#${to.hash}`;
}

export function supportStrategyEditorialId(id: SupportStrategyId): `support.${SupportStrategyId}` {
  return `support.${id}`;
}
