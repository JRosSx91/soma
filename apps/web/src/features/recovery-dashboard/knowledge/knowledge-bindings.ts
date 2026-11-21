import { listPublishedMissions } from "@soma/shared-types";
import type { ShellBase } from "../shell-base.js";
import {
  anatomyExplorerHref,
  anatomyExplorerHrefForOrgan,
  resolveAnatomyExplorerSelection,
} from "../anatomy/anatomy-explorer-query.js";
import {
  isPublishedExploreEduSheet,
  type ExploreEduSheetId,
} from "../explore/explore-edu.js";
import { exploreEduHref } from "../explore/explore-edu-query.js";
import type { KnowledgeBinding } from "./knowledge-types.js";

export interface ResolvedKnowledgeBinding {
  surface: KnowledgeBinding["surface"];
  id: string;
  href: string;
}

/** Only bindings resolvable against an already published SOMA surface link. */
export function resolveKnowledgeBinding(
  binding: KnowledgeBinding,
  base: ShellBase,
): ResolvedKnowledgeBinding | null {
  if (binding.surface === "explore_sheet") {
    if (!isPublishedExploreEduSheet(binding.id)) return null;
    const href = exploreEduHref(base, binding.id as ExploreEduSheetId);
    return href ? { ...binding, href } : null;
  }
  if (binding.surface === "mission") {
    const published = listPublishedMissions().some(
      (mission) => mission.id === binding.id,
    );
    return published ? { ...binding, href: `${base}/missions` } : null;
  }
  if (binding.surface === "atlas_system") {
    const selection = resolveAnatomyExplorerSelection(binding.id);
    if (selection.systemId !== binding.id) return null;
    return { ...binding, href: anatomyExplorerHref(base, binding.id) };
  }
  if (binding.surface === "atlas_organ") {
    const href = anatomyExplorerHrefForOrgan(base, binding.id);
    return href ? { ...binding, href } : null;
  }
  return null;
}
