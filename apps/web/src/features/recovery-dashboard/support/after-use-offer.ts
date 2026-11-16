import type { UsageStatus } from "@soma/shared-types";

/**
 * Client-side heuristic for a soft support invite after a LIVE profile save.
 *
 * Detects data transitions that *may* warrant a voluntary support offer
 * (status active after abstinence, or a newer lastUseDate). The same diffs
 * appear when fixing a typo or clarifying a date. It does **not** assume
 * recent consumption, does **not** classify a relapse, and must never label
 * the invite as “recaída”.
 *
 * Skips: identical payloads, failed saves (caller), brand-new substances with
 * no prior row, active→abstinent, and older lastUseDate corrections.
 */

export interface AfterUseUsageSnapshot {
  substanceId: string;
  status: UsageStatus;
  /** ISO date (YYYY-MM-DD) or null when active. */
  lastUseDate: string | null;
}

function normalizeDate(value: string | null | undefined): string | null {
  if (value == null || value.trim() === "") return null;
  return value.split("T")[0] ?? null;
}

function fingerprint(usages: readonly AfterUseUsageSnapshot[]): string {
  return JSON.stringify(
    usages
      .map((item) => ({
        substanceId: item.substanceId,
        status: item.status,
        lastUseDate: item.status === "active" ? null : normalizeDate(item.lastUseDate),
      }))
      .sort((a, b) => a.substanceId.localeCompare(b.substanceId)),
  );
}

/** True when the save changed data in a way that may warrant a soft support invite. */
export function shouldOfferAfterUseSupport(
  previous: readonly AfterUseUsageSnapshot[],
  next: readonly AfterUseUsageSnapshot[],
): boolean {
  if (fingerprint(previous) === fingerprint(next)) return false;

  const prevById = new Map(previous.map((item) => [item.substanceId, item]));
  for (const candidate of next) {
    const prior = prevById.get(candidate.substanceId);
    if (!prior) continue;

    if (prior.status === "abstinent" && candidate.status === "active") {
      return true;
    }

    if (prior.status === "abstinent" && candidate.status === "abstinent") {
      const before = normalizeDate(prior.lastUseDate);
      const after = normalizeDate(candidate.lastUseDate);
      if (before && after && after > before) {
        return true;
      }
    }
  }

  return false;
}
