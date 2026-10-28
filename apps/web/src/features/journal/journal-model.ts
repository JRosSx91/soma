import {
  JOURNAL_EMOTION_IDS,
  JOURNAL_MILESTONE_KIND_IDS,
  JOURNAL_TRIGGER_IDS,
  JOURNAL_WELLBEING_MAX,
  JOURNAL_WELLBEING_MIN,
  JOURNAL_WELLBEING_WINDOW_DAYS,
  civilDateToUtcDate,
  isJournalOccurredOnInRange,
  utcDateToCivilDate,
  type JournalEmotionId,
  type JournalMilestoneKindId,
  type JournalTriggerId,
} from "@soma/shared-types";

export const JOURNAL_TITLE_MAX = 120;
export const JOURNAL_BODY_MAX = 8_000;
export const JOURNAL_TAG_MAX = 5;
export const JOURNAL_SCALE_MIN = 1;
export const JOURNAL_SCALE_MAX = 5;
export const JOURNAL_WELLBEING_SCALE_MIN = JOURNAL_WELLBEING_MIN;
export const JOURNAL_WELLBEING_SCALE_MAX = JOURNAL_WELLBEING_MAX;
export const JOURNAL_MILESTONE_NOTE_MAX = 400;

export interface JournalEntry {
  id: string;
  occurredOn: string;
  createdAt: string;
  updatedAt: string;
  mood: number | null;
  sleep: number | null;
  energy: number | null;
  anxiety: number | null;
  cravingIntensity: number | null;
  cravingSubstanceId: string | null;
  wellbeingRating: number | null;
  title: string | null;
  body: string | null;
  highlighted: boolean;
  learning: boolean;
  emotionIds: string[];
  triggerIds: string[];
}

export interface JournalEntryWrite {
  occurredOn: string;
  mood?: number | null;
  sleep?: number | null;
  energy?: number | null;
  anxiety?: number | null;
  cravingIntensity?: number | null;
  cravingSubstanceId?: string | null;
  wellbeingRating?: number | null;
  title?: string | null;
  body?: string | null;
  highlighted?: boolean;
  learning?: boolean;
  emotionIds?: string[] | null;
  triggerIds?: string[] | null;
}

export interface JournalMilestone {
  id: string;
  kind: JournalMilestoneKindId | string;
  occurredOn: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JournalMilestoneWrite {
  kind: string;
  occurredOn: string;
  note?: string | null;
}

export type JournalTab =
  | "overview"
  | "entries"
  | "emotions"
  | "patterns"
  | "notes";

export const JOURNAL_TABS: readonly JournalTab[] = [
  "overview",
  "entries",
  "emotions",
  "patterns",
  "notes",
];

export function isJournalEmotionId(value: string): value is JournalEmotionId {
  return (JOURNAL_EMOTION_IDS as readonly string[]).includes(value);
}

export function isJournalTriggerId(value: string): value is JournalTriggerId {
  return (JOURNAL_TRIGGER_IDS as readonly string[]).includes(value);
}

export function isJournalMilestoneKind(
  value: string,
): value is JournalMilestoneKindId {
  return (JOURNAL_MILESTONE_KIND_IDS as readonly string[]).includes(value);
}

export function hasSignificantJournalContent(fields: {
  mood?: number | null;
  sleep?: number | null;
  energy?: number | null;
  anxiety?: number | null;
  cravingIntensity?: number | null;
  wellbeingRating?: number | null;
  title?: string | null;
  body?: string | null;
  emotionIds?: string[] | null;
  triggerIds?: string[] | null;
}): boolean {
  const scales = [
    fields.mood,
    fields.sleep,
    fields.energy,
    fields.anxiety,
    fields.cravingIntensity,
    fields.wellbeingRating,
  ];
  if (scales.some((value) => typeof value === "number")) return true;
  if (Array.isArray(fields.emotionIds) && fields.emotionIds.length > 0) {
    return true;
  }
  if (Array.isArray(fields.triggerIds) && fields.triggerIds.length > 0) {
    return true;
  }
  if (typeof fields.title === "string" && fields.title.trim().length > 0) {
    return true;
  }
  if (typeof fields.body === "string" && fields.body.trim().length > 0) {
    return true;
  }
  return false;
}

export function localCivilDate(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function shiftCivilDate(iso: string, days: number): string {
  const utc = civilDateToUtcDate(iso);
  utc.setUTCDate(utc.getUTCDate() + days);
  return utcDateToCivilDate(utc);
}

export function countJournalDays(entries: readonly JournalEntry[]): number {
  return new Set(entries.map((row) => row.occurredOn)).size;
}

/**
 * Consecutive civil days with at least one entry.
 * If today has an entry, the run ends today. If not, keep yesterday's run.
 * No entry today or yesterday → 0. Not abstinence. Never punitive.
 */
export function currentJournalStreak(
  entries: readonly JournalEntry[],
  today = localCivilDate(),
): number {
  const days = new Set(entries.map((row) => row.occurredOn));
  let cursor = days.has(today) ? today : shiftCivilDate(today, -1);
  if (!days.has(cursor)) return 0;
  let count = 0;
  while (days.has(cursor)) {
    count += 1;
    cursor = shiftCivilDate(cursor, -1);
  }
  return count;
}

/**
 * Mean of voluntary wellbeingRating values in the last 28 local civil days,
 * inclusive of today. Same-day ratings are all included. Null if none.
 */
export function wellbeingAverage(
  entries: readonly JournalEntry[],
  today = localCivilDate(),
): number | null {
  const from = shiftCivilDate(today, -(JOURNAL_WELLBEING_WINDOW_DAYS - 1));
  const ratings = entries
    .filter(
      (row) =>
        typeof row.wellbeingRating === "number" &&
        row.occurredOn >= from &&
        row.occurredOn <= today,
    )
    .map((row) => row.wellbeingRating as number);
  if (ratings.length === 0) return null;
  const mean = ratings.reduce((sum, value) => sum + value, 0) / ratings.length;
  return Math.round(mean * 10) / 10;
}

export function latestJournalEntry(
  entries: readonly JournalEntry[],
): JournalEntry | null {
  return entries[0] ?? null;
}

export function highlightedEntries(
  entries: readonly JournalEntry[],
): JournalEntry[] {
  return entries.filter((row) => row.highlighted);
}

export function learningEntries(
  entries: readonly JournalEntry[],
): JournalEntry[] {
  return entries.filter((row) => row.learning);
}

export interface EmotionFrequency {
  id: JournalEmotionId;
  count: number;
  percent: number;
}

/**
 * Percent of entries that include the emotion, among entries that have at
 * least one emotion. One entry may carry several tags, so percents need not
 * sum to 100.
 */
export function emotionFrequencies(
  entries: readonly JournalEntry[],
): EmotionFrequency[] {
  const withEmotions = entries.filter((row) =>
    row.emotionIds.some((id) => isJournalEmotionId(id)),
  );
  const denom = withEmotions.length;
  if (denom === 0) return [];
  const counts = new Map<JournalEmotionId, number>();
  for (const row of withEmotions) {
    const unique = new Set(
      row.emotionIds.filter((id): id is JournalEmotionId => isJournalEmotionId(id)),
    );
    for (const id of unique) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([id, count]) => ({
      id,
      count,
      percent: Math.round((count / denom) * 100),
    }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}

export interface MoodPoint {
  occurredOn: string;
  mood: number;
}

export interface WellbeingPoint {
  occurredOn: string;
  wellbeingRating: number;
}

export function moodSeries(entries: readonly JournalEntry[]): MoodPoint[] {
  return [...entries]
    .filter((row): row is JournalEntry & { mood: number } => typeof row.mood === "number")
    .reverse()
    .map((row) => ({ occurredOn: row.occurredOn, mood: row.mood }));
}

export function wellbeingSeries(
  entries: readonly JournalEntry[],
): WellbeingPoint[] {
  return [...entries]
    .filter(
      (row): row is JournalEntry & { wellbeingRating: number } =>
        typeof row.wellbeingRating === "number",
    )
    .reverse()
    .map((row) => ({
      occurredOn: row.occurredOn,
      wellbeingRating: row.wellbeingRating,
    }));
}

export type JournalFormIssue =
  | "required"
  | "tooManyTags"
  | "titleTooLong"
  | "bodyTooLong"
  | "invalidDate"
  | "invalidWellbeing";

export function validateJournalWrite(draft: JournalEntryWrite): JournalFormIssue | null {
  if (!isJournalOccurredOnInRange(draft.occurredOn)) return "invalidDate";
  const title = draft.title?.trim() ?? "";
  const body = draft.body?.trim() ?? "";
  if (title.length > JOURNAL_TITLE_MAX) return "titleTooLong";
  if (body.length > JOURNAL_BODY_MAX) return "bodyTooLong";
  if (
    draft.wellbeingRating != null &&
    (draft.wellbeingRating < JOURNAL_WELLBEING_MIN ||
      draft.wellbeingRating > JOURNAL_WELLBEING_MAX ||
      !Number.isInteger(draft.wellbeingRating))
  ) {
    return "invalidWellbeing";
  }
  const emotions = uniqueTags(draft.emotionIds);
  const triggers = uniqueTags(draft.triggerIds);
  if (emotions.length > JOURNAL_TAG_MAX || triggers.length > JOURNAL_TAG_MAX) {
    return "tooManyTags";
  }
  if (
    !hasSignificantJournalContent({
      mood: draft.mood,
      sleep: draft.sleep,
      energy: draft.energy,
      anxiety: draft.anxiety,
      cravingIntensity: draft.cravingIntensity,
      wellbeingRating: draft.wellbeingRating,
      title,
      body,
      emotionIds: emotions,
      triggerIds: triggers,
    })
  ) {
    return "required";
  }
  return null;
}

function uniqueTags(ids: string[] | null | undefined): string[] {
  if (!ids) return [];
  return [...new Set(ids)];
}

export function daysWithEntriesInMonth(
  entries: readonly JournalEntry[],
  year: number,
  monthIndex: number,
): Set<string> {
  const prefix = `${year}-${String(monthIndex + 1).padStart(2, "0")}-`;
  const days = new Set<string>();
  for (const row of entries) {
    if (row.occurredOn.startsWith(prefix)) days.add(row.occurredOn);
  }
  return days;
}

export function entriesOnDay(
  entries: readonly JournalEntry[],
  iso: string,
): JournalEntry[] {
  return entries.filter((row) => row.occurredOn === iso);
}

export function entryPreview(entry: JournalEntry, untitled: string): string {
  if (entry.title && entry.title.trim()) return entry.title.trim();
  if (entry.body && entry.body.trim()) {
    const text = entry.body.trim();
    return text.length > 140 ? `${text.slice(0, 137)}…` : text;
  }
  return untitled;
}
