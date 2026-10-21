import { atlasSystems } from "./atlas-config.js";

export interface AnatomyExplorerSelection {
  systemId: string | null;
  organId: string | null;
}

/** Resolve atlas ids from URL search params. Unknown values fall back to the body view. */
export function resolveAnatomyExplorerSelection(
  systemParam: string | null,
  organParam: string | null = null,
): AnatomyExplorerSelection {
  const system = atlasSystems.find((item) => item.id === systemParam) ?? null;
  if (!system) return { systemId: null, organId: null };
  const organId =
    organParam && system.organs.some((item) => item.id === organParam) ? organParam : null;
  return { systemId: system.id, organId };
}

export function anatomySearchParams(selection: AnatomyExplorerSelection): URLSearchParams {
  const params = new URLSearchParams();
  if (selection.systemId) params.set("system", selection.systemId);
  if (selection.organId) params.set("organ", selection.organId);
  return params;
}

export function anatomyExplorerHref(
  base: "/app" | "/preview",
  systemId: string,
  organId?: string | null,
): string {
  const query = anatomySearchParams(
    resolveAnatomyExplorerSelection(systemId, organId ?? null),
  ).toString();
  return query ? `${base}/anatomy?${query}` : `${base}/anatomy`;
}
