import assert from "node:assert/strict";
import { test } from "node:test";
import {
  JOURNAL_EMOTION_IDS,
  JOURNAL_TRIGGER_IDS,
  civilDateToUtcDate,
  isCivilDateString,
  utcDateToCivilDate,
} from "./journal.js";

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
