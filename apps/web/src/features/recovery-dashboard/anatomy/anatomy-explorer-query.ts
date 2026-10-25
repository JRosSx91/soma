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

/** Atlas system that owns this organ id. Null if missing or listed in more than one system. */
export function atlasSystemIdForOrgan(organId: string): string | null {
  let found: string | null = null;
  for (const system of atlasSystems) {
    if (!system.organs.some((item) => item.id === organId)) continue;
    if (found !== null) return null;
    found = system.id;
  }
  return found;
}

/**
 * Deep link to a known atlas organ. Null when the organ is not uniquely
 * placed in atlasSystems — callers must not invent a system.
 */
export function anatomyExplorerHrefForOrgan(
  base: "/app" | "/preview",
  organId: string,
): string | null {
  const systemId = atlasSystemIdForOrgan(organId);
  if (!systemId) return null;
  const selection = resolveAnatomyExplorerSelection(systemId, organId);
  if (selection.systemId !== systemId || selection.organId !== organId) return null;
  return anatomyExplorerHref(base, systemId, organId);
}
