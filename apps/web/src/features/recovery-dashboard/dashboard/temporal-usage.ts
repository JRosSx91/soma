import type { AbstinenceUsage } from "@soma/shared-types";
import type { DemoSubstance } from "../demo-data.js";

export function parseDashboardLastUse(value: string | null | undefined): Date | null {
  if (value == null || value.trim() === "") return null;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? new Date(ms) : new Date(Number.NaN);
}

export function usagesFromDashboardSubstances(
  substances: readonly DemoSubstance[],
): AbstinenceUsage[] {
  return substances.map((substance) => ({
    substanceId: substance.id,
    status: substance.usageStatus ?? "abstinent",
    lastUseDate: parseDashboardLastUse(substance.lastUseDate),
  }));
}

export function dashboardUsageFingerprint(substances: readonly DemoSubstance[]): string {
  return substances
    .map(
      (substance) =>
        `${substance.id}:${substance.usageStatus ?? "abstinent"}:${substance.lastUseDate ?? ""}`,
    )
    .join("|");
}

export function withSessionLastUseDates(
  substances: readonly DemoSubstance[],
  nowMs: number,
): DemoSubstance[] {
  const MS_PER_DAY = 86_400_000;
  return substances.map((substance) => {
    if (substance.lastUseDate) return substance;
    if (substance.elapsedDays == null || !Number.isFinite(substance.elapsedDays)) {
      return substance;
    }
    return {
      ...substance,
      lastUseDate: new Date(nowMs - substance.elapsedDays * MS_PER_DAY).toISOString(),
    };
  });
}
