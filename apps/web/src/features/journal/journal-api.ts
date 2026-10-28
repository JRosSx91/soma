import { apiRequest } from "../auth/client/api.js";
import {
  civilMonthRange,
  type JournalEntry,
  type JournalEntryWrite,
  type JournalMilestone,
  type JournalMilestoneWrite,
} from "./journal-model.js";

export interface JournalListQuery {
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
  highlighted?: boolean;
  learning?: boolean;
}

export interface JournalListResponse {
  items: JournalEntry[];
  nextCursor: string | null;
}

function journalListSearch(query: JournalListQuery): string {
  const params = new URLSearchParams();
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.cursor) params.set("cursor", query.cursor);
  if (query.limit != null) params.set("limit", String(query.limit));
  if (query.highlighted === true) params.set("highlighted", "true");
  if (query.learning === true) params.set("learning", "true");
  return params.toString();
}

/** One keyset page. Preview/DEMO must not call this. */
export function fetchJournalPage(
  query: JournalListQuery = {},
): Promise<JournalListResponse> {
  const search = journalListSearch(query);
  return apiRequest<JournalListResponse>(
    search ? `/me/journal?${search}` : "/me/journal",
  );
}

/**
 * Every entry in a civil month, paging until the cursor ends.
 * Used for calendar marks so a single list page cannot hide days.
 * Preview/DEMO must not call this.
 */
export async function fetchJournalMonthEntries(
  year: number,
  monthIndex: number,
): Promise<JournalEntry[]> {
  const { from, to } = civilMonthRange(year, monthIndex);
  const items: JournalEntry[] = [];
  let cursor: string | undefined;
  do {
    const page = await fetchJournalPage({ from, to, cursor, limit: 50 });
    for (const row of page.items) {
      if (!items.some((existing) => existing.id === row.id)) items.push(row);
    }
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  return items;
}

/**
 * Loads every owner entry via keyset pages. Preview/DEMO must not call this.
 */
export async function fetchAllJournalEntries(): Promise<JournalEntry[]> {
  const items: JournalEntry[] = [];
  let cursor: string | undefined;
  do {
    const page = await fetchJournalPage({ cursor, limit: 50 });
    items.push(...page.items);
    cursor = page.nextCursor ?? undefined;
  } while (cursor);
  return items;
}

export function createJournalEntry(body: JournalEntryWrite): Promise<JournalEntry> {
  return apiRequest<JournalEntry>("/me/journal", { method: "POST", body });
}

export function patchJournalEntry(
  id: string,
  body: JournalEntryWrite,
): Promise<JournalEntry> {
  return apiRequest<JournalEntry>(`/me/journal/${id}`, {
    method: "PATCH",
    body,
  });
}

export function fetchJournalMilestones(): Promise<JournalMilestone[]> {
  return apiRequest<JournalMilestone[]>("/me/journal/milestones");
}

export function createJournalMilestone(
  body: JournalMilestoneWrite,
): Promise<JournalMilestone> {
  return apiRequest<JournalMilestone>("/me/journal/milestones", {
    method: "POST",
    body,
  });
}

export function patchJournalMilestone(
  id: string,
  body: Partial<JournalMilestoneWrite>,
): Promise<JournalMilestone> {
  return apiRequest<JournalMilestone>(`/me/journal/milestones/${id}`, {
    method: "PATCH",
    body,
  });
}

export function deleteJournalMilestone(id: string): Promise<void> {
  return apiRequest<void>(`/me/journal/milestones/${id}`, { method: "DELETE" });
}
