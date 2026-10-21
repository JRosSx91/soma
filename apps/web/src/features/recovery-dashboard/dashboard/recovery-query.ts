import type { ShellBase } from "../shell-base.js";

/** Resolve a `?substance=` id against known substance ids. Unknown values are ignored. */
export function resolveRecoverySubstance(
  param: string | null | undefined,
  knownIds: readonly string[],
): string | null {
  if (!param || knownIds.length === 0) return null;
  return knownIds.includes(param) ? param : null;
}

export function recoveryHref(base: ShellBase, substanceId?: string | null): string {
  const path = `${base}/recovery`;
  if (!substanceId) return path;
  const params = new URLSearchParams();
  params.set("substance", substanceId);
  return `${path}?${params.toString()}`;
}
