import type { ShellBase } from "../shell-base.js";
import {
  isExploreEduNtSheetId,
  isPublishedExploreEduSheet,
  isPublishedExploreProcess,
  type ExploreEduSheetId,
} from "./explore-edu.js";

/**
 * Shareable educational article query.
 *
 * History: atlas `<Link>` to `exploreEduHref` uses the default push, so Back
 * returns to the atlas. In-page open, related-sheet swap, invalid-param
 * cleanup and close use `replace`, so they do not stack Explore entries or
 * reopen the article after Close → Back.
 */
export const EXPLORE_EDU_QUERY_KEY = "edu";

export function resolveExploreEduQueryParam(
  value: string | null | undefined,
): ExploreEduSheetId | null {
  if (value == null || value.trim() === "") return null;
  if (!isPublishedExploreEduSheet(value)) return null;
  return value;
}

export function writeExploreEduSearchParams(
  current: URLSearchParams,
  eduId: ExploreEduSheetId | null,
): URLSearchParams {
  const next = new URLSearchParams(current);
  if (eduId && isPublishedExploreEduSheet(eduId)) {
    next.set(EXPLORE_EDU_QUERY_KEY, eduId);
  } else {
    next.delete(EXPLORE_EDU_QUERY_KEY);
  }
  return next;
}

export function exploreEduHref(base: ShellBase, sheetId: ExploreEduSheetId): string | null {
  if (!isPublishedExploreEduSheet(sheetId)) return null;
  return `${base}/explore?${EXPLORE_EDU_QUERY_KEY}=${sheetId}`;
}

export function exploreEduTargetFromSheetId(sheetId: ExploreEduSheetId): {
  kind: "nt" | "process";
  id: ExploreEduSheetId;
} | null {
  if (!isPublishedExploreEduSheet(sheetId)) return null;
  if (isExploreEduNtSheetId(sheetId)) return { kind: "nt", id: sheetId };
  if (isPublishedExploreProcess(sheetId)) return { kind: "process", id: sheetId };
  return null;
}
