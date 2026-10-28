import { apiRequest } from "../auth/client/api.js";
import type {
  JournalEntry,
  JournalEntryWrite,
  JournalMilestone,
  JournalMilestoneWrite,
} from "./journal-model.js";

interface ListResponse {
  items: JournalEntry[];
  nextCursor: string | null;
}

/**
 * Loads every owner entry via keyset pages. Preview/DEMO must not call this.
 */
export async function fetchAllJournalEntries(): Promise<JournalEntry[]> {
  const items: JournalEntry[] = [];
  let cursor: string | undefined;
  do {
    const query = new URLSearchParams({ limit: "50" });
    if (cursor) query.set("cursor", cursor);
    const page = await apiRequest<ListResponse>(`/me/journal?${query.toString()}`);
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
