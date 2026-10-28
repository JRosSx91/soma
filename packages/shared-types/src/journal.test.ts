import assert from "node:assert/strict";
import { test } from "node:test";
import {
  JOURNAL_EMOTION_IDS,
  JOURNAL_OCCURRED_ON_MIN,
  JOURNAL_TRIGGER_IDS,
  civilDateToUtcDate,
  isCivilDateString,
  isJournalOccurredOnInRange,
  journalOccurredOnMax,
  utcDateToCivilDate,
} from "./journal.js";

/** Wall-clock YYYY-MM-DD in a fixed offset, without using the host TZ. */
function civilDateAtOffset(utcNow: Date, offsetHours: number): string {
  return utcDateToCivilDate(
    new Date(utcNow.getTime() + offsetHours * 60 * 60 * 1000),
  );
}

test("journal catalogs expose the v1 emotion and trigger ids", () => {
  assert.deepEqual([...JOURNAL_EMOTION_IDS], [
    "calm",
    "optimistic",
    "motivated",
    "anxious",
    "irritable",
    "sad",
    "tired",
    "grateful",
  ]);
  assert.deepEqual([...JOURNAL_TRIGGER_IDS], [
    "conflict",
    "fatigue",
    "boredom",
    "social",
    "place",
    "cue",
    "loneliness",
    "stress",
  ]);
});

test("civil dates round-trip through UTC midnight without local TZ shift", () => {
  const stored = civilDateToUtcDate("2026-04-29");
  assert.equal(stored.toISOString(), "2026-04-29T00:00:00.000Z");
  assert.equal(utcDateToCivilDate(stored), "2026-04-29");
});

test("civilDateToUtcDate rejects invalid calendar days", () => {
  assert.equal(isCivilDateString("2026-02-30"), false);
  assert.throws(() => civilDateToUtcDate("2026-02-30"), RangeError);
  assert.throws(() => civilDateToUtcDate("29/04/2026"), RangeError);
});

test("occurredOn range is 1970-01-01 through UTC tomorrow", () => {
  const now = new Date("2026-10-28T15:00:00.000Z");
  assert.equal(isJournalOccurredOnInRange(JOURNAL_OCCURRED_ON_MIN, now), true);
  assert.equal(isJournalOccurredOnInRange("2026-10-28", now), true);
  assert.equal(isJournalOccurredOnInRange("2026-10-29", now), true);
  assert.equal(isJournalOccurredOnInRange("2026-10-30", now), false);
  assert.equal(isJournalOccurredOnInRange("1969-12-31", now), false);
});

test("occurredOn +1 UTC day covers local today near midnight in +14 and -12", () => {
  const lateUtc = new Date("2026-10-28T23:45:00.000Z");
  assert.equal(journalOccurredOnMax(lateUtc), "2026-10-29");
  const plus14Today = civilDateAtOffset(lateUtc, 14);
  assert.equal(plus14Today, "2026-10-29");
  assert.equal(isJournalOccurredOnInRange(plus14Today, lateUtc), true);

  const justAfterMidnightUtc = new Date("2026-10-29T00:15:00.000Z");
  assert.equal(journalOccurredOnMax(justAfterMidnightUtc), "2026-10-30");
  const minus12Today = civilDateAtOffset(justAfterMidnightUtc, -12);
  assert.equal(minus12Today, "2026-10-28");
  assert.equal(isJournalOccurredOnInRange(minus12Today, justAfterMidnightUtc), true);
  assert.equal(isJournalOccurredOnInRange("2026-10-29", justAfterMidnightUtc), true);
  assert.equal(isJournalOccurredOnInRange("2026-10-30", justAfterMidnightUtc), true);
  assert.equal(isJournalOccurredOnInRange("2026-10-31", justAfterMidnightUtc), false);
});
