import assert from "node:assert/strict";
import { test } from "node:test";
import { JOURNAL_WELLBEING_WINDOW_DAYS } from "@soma/shared-types";
import {
  countJournalDays,
  currentJournalStreak,
  emotionFrequencies,
  hasSignificantJournalContent,
  localCivilDate,
  shiftCivilDate,
  validateJournalWrite,
  wellbeingAverage,
} from "./journal-model.ts";
import { JOURNAL_DEMO_ENTRIES } from "./journal-demo.ts";

test("significant content ignores highlighted and learning", () => {
  assert.equal(hasSignificantJournalContent({ highlighted: true } as never), false);
  assert.equal(hasSignificantJournalContent({ mood: 3 }), true);
  assert.equal(hasSignificantJournalContent({ wellbeingRating: 0 }), true);
  assert.equal(hasSignificantJournalContent({ title: "Hi" }), true);
});

test("validateJournalWrite rejects empty and overlong title", () => {
  assert.equal(
    validateJournalWrite({ occurredOn: "2026-04-29" }),
    "required",
  );
  assert.equal(
    validateJournalWrite({
      occurredOn: "2026-04-29",
      title: "x".repeat(121),
    }),
    "titleTooLong",
  );
  assert.equal(
    validateJournalWrite({ occurredOn: "2026-04-29", mood: 4 }),
    null,
  );
  assert.equal(
    validateJournalWrite({ occurredOn: "2026-04-29", wellbeingRating: 7 }),
    null,
  );
});

test("currentJournalStreak uses civil days and keeps yesterday if today is empty", () => {
  const today = "2026-10-28";
  const rows = [
    { occurredOn: "2026-10-28" },
    { occurredOn: "2026-10-27" },
    { occurredOn: "2026-10-27" },
    { occurredOn: "2026-10-26" },
  ] as never;
  assert.equal(currentJournalStreak(rows, today), 3);
  assert.equal(
    currentJournalStreak(
      [{ occurredOn: "2026-10-27" }, { occurredOn: "2026-10-26" }] as never,
      today,
    ),
    2,
  );
  assert.equal(
    currentJournalStreak([{ occurredOn: "2026-10-25" }] as never, today),
    0,
  );
});

test("wellbeingAverage uses only voluntary ratings in the 28-day window", () => {
  const today = "2026-10-28";
  const from = shiftCivilDate(today, -(JOURNAL_WELLBEING_WINDOW_DAYS - 1));
  assert.equal(from, "2026-10-01");
  const avg = wellbeingAverage(
    [
      { occurredOn: "2026-10-28", wellbeingRating: 8 },
      { occurredOn: "2026-10-28", wellbeingRating: 6 },
      { occurredOn: "2026-10-10", wellbeingRating: 7 },
      { occurredOn: "2026-09-30", wellbeingRating: 10 },
      { occurredOn: "2026-10-05", wellbeingRating: null },
    ] as never,
    today,
  );
  assert.equal(avg, 7);
  assert.equal(wellbeingAverage([], today), null);
});

test("emotion frequencies use tagged-entry denominator and need not sum to 100", () => {
  const freq = emotionFrequencies([
    { emotionIds: ["calm", "motivated"] },
    { emotionIds: ["calm"] },
    { emotionIds: [] },
  ] as never);
  const calm = freq.find((row) => row.id === "calm");
  const motivated = freq.find((row) => row.id === "motivated");
  assert.equal(calm?.percent, 100);
  assert.equal(motivated?.percent, 50);
});

test("demo samples fill streak, wellbeing, emotions and days", () => {
  const today = localCivilDate();
  assert.ok(countJournalDays(JOURNAL_DEMO_ENTRIES) >= 8);
  assert.ok(currentJournalStreak(JOURNAL_DEMO_ENTRIES, today) >= 3);
  assert.ok(wellbeingAverage(JOURNAL_DEMO_ENTRIES, today) !== null);
  const freq = emotionFrequencies(JOURNAL_DEMO_ENTRIES);
  assert.ok(freq.length >= 4);
});
