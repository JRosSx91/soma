/**
 * Journal persistence helpers (JRN-01C) and catalogs for emotion/trigger IDs.
 * Input validation and ES/EN copy belong to the API/UI milestones.
 *
 * Civil dates: persist `occurredOn` as PostgreSQL DATE via Prisma `@db.Date`.
 * The wire format is `YYYY-MM-DD`. Convert with the functions below at the
 * API boundary — never `new Date("YYYY-MM-DD")` in the local timezone, and
 * never `toISOString().slice(0, 10)` on a local midnight Date.
 *
 * JRN-01D (not implemented here):
 * - List order: occurredOn DESC, createdAt DESC, id DESC
 * - Cursor over those three fields
 * - External dates YYYY-MM-DD
 * - Full-user JSON export (no 5_000-row cap)
 * - Owner-only authorization; foreign ids → 404
 * - No personal text in logs
 * - DEMO never calls LIVE journal storage
 */

export const JOURNAL_EMOTION_IDS = [
  "calm",
  "optimistic",
  "motivated",
  "anxious",
  "irritable",
  "sad",
  "tired",
  "grateful",
] as const;

export type JournalEmotionId = (typeof JOURNAL_EMOTION_IDS)[number];

export const JOURNAL_TRIGGER_IDS = [
  "conflict",
  "fatigue",
  "boredom",
  "social",
  "place",
  "cue",
  "loneliness",
  "stress",
] as const;

export type JournalTriggerId = (typeof JOURNAL_TRIGGER_IDS)[number];

const CIVIL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isCivilDateString(value: string): boolean {
  const match = CIVIL_DATE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = Date.UTC(year, month - 1, day);
  const check = new Date(utc);
  return (
    check.getUTCFullYear() === year &&
    check.getUTCMonth() === month - 1 &&
    check.getUTCDate() === day
  );
}

/** Map `YYYY-MM-DD` to a UTC calendar Date suitable for Prisma `@db.Date`. */
export function civilDateToUtcDate(isoDate: string): Date {
  if (!isCivilDateString(isoDate)) {
    throw new RangeError(`Invalid civil date: ${isoDate}`);
  }
  const [, year, month, day] = CIVIL_DATE.exec(isoDate)!;
  return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
}

/** Map a Prisma `@db.Date` value back to `YYYY-MM-DD`. */
export function utcDateToCivilDate(value: Date): string {
  if (Number.isNaN(value.getTime())) {
    throw new RangeError("Invalid date");
  }
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
