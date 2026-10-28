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

export interface TriggerFrequency {
  id: JournalTriggerId;
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
  return tagFrequencies(
    entries,
    (row) => row.emotionIds,
    isJournalEmotionId,
  ) as EmotionFrequency[];
}

export function triggerFrequencies(
  entries: readonly JournalEntry[],
): TriggerFrequency[] {
  return tagFrequencies(
    entries,
    (row) => row.triggerIds,
    isJournalTriggerId,
  ) as TriggerFrequency[];
}

function tagFrequencies<T extends string>(
  entries: readonly JournalEntry[],
  tagsOf: (row: JournalEntry) => readonly string[],
  isId: (value: string) => value is T,
): Array<{ id: T; count: number; percent: number }> {
  const tagged = entries.filter((row) => tagsOf(row).some((id) => isId(id)));
  const denom = tagged.length;
  if (denom === 0) return [];
  const counts = new Map<T, number>();
  for (const row of tagged) {
    const unique = new Set(tagsOf(row).filter((id): id is T => isId(id)));
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

export const JOURNAL_SCALE_IDS = [
  "wellbeing",
  "mood",
  "sleep",
  "energy",
  "anxiety",
  "craving",
] as const;

export type JournalScaleId = (typeof JOURNAL_SCALE_IDS)[number];

export const JOURNAL_SCALE_RANGE: Record<
  JournalScaleId,
  { min: number; max: number; field: keyof JournalEntry }
> = {
  wellbeing: { min: 0, max: 10, field: "wellbeingRating" },
  mood: { min: 1, max: 5, field: "mood" },
  sleep: { min: 1, max: 5, field: "sleep" },
  energy: { min: 1, max: 5, field: "energy" },
  anxiety: { min: 1, max: 5, field: "anxiety" },
  craving: { min: 1, max: 5, field: "cravingIntensity" },
};

export const JOURNAL_TREND_WINDOWS = [28, 90, "all"] as const;
export type JournalTrendWindow = (typeof JOURNAL_TREND_WINDOWS)[number];
export const JOURNAL_COINCIDENCE_MIN = 3;
export const JOURNAL_COINCIDENCE_MAX = 8;
export const JOURNAL_TAG_ENTRY_PAGE = 8;

export interface DailyScalePoint {
  occurredOn: string;
  value: number;
}

export function filterEntriesInCivilWindow(
  entries: readonly JournalEntry[],
  today: string,
  window: JournalTrendWindow,
): JournalEntry[] {
  if (window === "all") return [...entries];
  const from = shiftCivilDate(today, -(window - 1));
  return entries.filter(
    (row) => row.occurredOn >= from && row.occurredOn <= today,
  );
}

/**
 * One civil-day point per scale: mean of present ratings that day.
 * Nulls omitted. Wellbeing 0 is kept. Days without ratings are skipped.
 */
export function dailyScaleSeries(
  entries: readonly JournalEntry[],
  scale: JournalScaleId,
): DailyScalePoint[] {
  const field = JOURNAL_SCALE_RANGE[scale].field;
  const buckets = new Map<string, number[]>();
  for (const row of entries) {
    const raw = row[field];
    if (typeof raw !== "number") continue;
    const list = buckets.get(row.occurredOn) ?? [];
    list.push(raw);
    buckets.set(row.occurredOn, list);
  }
  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([occurredOn, values]) => ({
      occurredOn,
      value: values.reduce((sum, value) => sum + value, 0) / values.length,
    }));
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
  return dailyScaleSeries(entries, "mood").map((point) => ({
    occurredOn: point.occurredOn,
    mood: point.value,
  }));
}

export function wellbeingSeries(
  entries: readonly JournalEntry[],
): WellbeingPoint[] {
  return dailyScaleSeries(entries, "wellbeing").map((point) => ({
    occurredOn: point.occurredOn,
    wellbeingRating: point.value,
  }));
}

export function entriesWithEmotion(
  entries: readonly JournalEntry[],
  emotionId: JournalEmotionId,
): JournalEntry[] {
  return sortJournalEntries(
    entries.filter((row) => row.emotionIds.includes(emotionId)),
  );
}

export function entriesWithTrigger(
  entries: readonly JournalEntry[],
  triggerId: JournalTriggerId,
): JournalEntry[] {
  return sortJournalEntries(
    entries.filter((row) => row.triggerIds.includes(triggerId)),
  );
}

export interface TagCoincidence {
  emotionId: JournalEmotionId;
  triggerId: JournalTriggerId;
  count: number;
}

/**
 * Descriptive co-occurrence of emotion and trigger on the same entry.
 * Counts entries, not days. Presentation threshold is not a statistic.
 */
export function emotionTriggerCoincidences(
  entries: readonly JournalEntry[],
  minCount = JOURNAL_COINCIDENCE_MIN,
): TagCoincidence[] {
  const counts = new Map<string, TagCoincidence>();
  for (const row of entries) {
    const emotions = [
      ...new Set(
        row.emotionIds.filter((id): id is JournalEmotionId => isJournalEmotionId(id)),
      ),
    ];
    const triggers = [
      ...new Set(
        row.triggerIds.filter((id): id is JournalTriggerId => isJournalTriggerId(id)),
      ),
    ];
    for (const emotionId of emotions) {
      for (const triggerId of triggers) {
        const key = `${emotionId}\0${triggerId}`;
        const current = counts.get(key);
        if (current) current.count += 1;
        else counts.set(key, { emotionId, triggerId, count: 1 });
      }
    }
  }
  return [...counts.values()]
    .filter((row) => row.count >= minCount)
    .sort(
      (a, b) =>
        b.count - a.count ||
        a.emotionId.localeCompare(b.emotionId) ||
        a.triggerId.localeCompare(b.triggerId),
    )
    .slice(0, JOURNAL_COINCIDENCE_MAX);
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

export const JOURNAL_LIST_PAGE_SIZE = 20;
export const JOURNAL_DEMO_LIST_PAGE_SIZE = 8;

export function civilYearMonth(iso: string): { year: number; monthIndex: number } {
  const year = Number(iso.slice(0, 4));
  const monthIndex = Number(iso.slice(5, 7)) - 1;
  return { year, monthIndex };
}

export function isIsoInCivilMonth(
  iso: string,
  year: number,
  monthIndex: number,
): boolean {
  const visible = civilYearMonth(iso);
  return visible.year === year && visible.monthIndex === monthIndex;
}

export function selectionForVisibleMonth(
  selectedIso: string | null,
  year: number,
  monthIndex: number,
): string | null {
  if (!selectedIso) return null;
  return isIsoInCivilMonth(selectedIso, year, monthIndex) ? selectedIso : null;
}

export function shiftCivilMonth(
  year: number,
  monthIndex: number,
  delta: number,
): { year: number; monthIndex: number } {
  const utc = new Date(Date.UTC(year, monthIndex + delta, 1));
  return { year: utc.getUTCFullYear(), monthIndex: utc.getUTCMonth() };
}

export function civilMonthRange(
  year: number,
  monthIndex: number,
): { from: string; to: string } {
  const month = String(monthIndex + 1).padStart(2, "0");
  const last = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  return {
    from: `${year}-${month}-01`,
    to: `${year}-${month}-${String(last).padStart(2, "0")}`,
  };
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

export function sortJournalEntries(
  entries: readonly JournalEntry[],
): JournalEntry[] {
  return [...entries].sort(
    (a, b) =>
      b.occurredOn.localeCompare(a.occurredOn) ||
      b.createdAt.localeCompare(a.createdAt) ||
      b.id.localeCompare(a.id),
  );
}

export function entriesOnDay(
  entries: readonly JournalEntry[],
  iso: string,
): JournalEntry[] {
  return sortJournalEntries(entries.filter((row) => row.occurredOn === iso));
}

export interface JournalListFilters {
  from?: string;
  to?: string;
  highlighted?: boolean;
  learning?: boolean;
}

export function applyJournalListFilters(
  entries: readonly JournalEntry[],
  filters: JournalListFilters,
): JournalEntry[] {
  return sortJournalEntries(
    entries.filter((row) => {
      if (filters.from && row.occurredOn < filters.from) return false;
      if (filters.to && row.occurredOn > filters.to) return false;
      if (filters.highlighted && !row.highlighted) return false;
      if (filters.learning && !row.learning) return false;
      return true;
    }),
  );
}

export function appendJournalPage(
  existing: readonly JournalEntry[],
  incoming: readonly JournalEntry[],
): JournalEntry[] {
  const seen = new Set(existing.map((row) => row.id));
  const extra = incoming.filter((row) => !seen.has(row.id));
  return extra.length === 0 ? [...existing] : [...existing, ...extra];
}

export function entryPreview(entry: JournalEntry, untitled: string): string {
  if (entry.title && entry.title.trim()) return entry.title.trim();
  if (entry.body && entry.body.trim()) {
    const text = entry.body.trim();
    return text.length > 140 ? `${text.slice(0, 137)}…` : text;
  }
  return untitled;
}
