import assert from "node:assert/strict";
import { test } from "node:test";
import { JOURNAL_WELLBEING_WINDOW_DAYS } from "@soma/shared-types";
import {
  appendJournalPage,
  applyJournalListFilters,
  civilMonthRange,
  civilYearMonth,
  countJournalDays,
  currentJournalStreak,
  daysWithEntriesInMonth,
  emotionFrequencies,
  entriesOnDay,
  hasSignificantJournalContent,
  isIsoInCivilMonth,
  localCivilDate,
  shiftCivilDate,
  selectionForVisibleMonth,
  shiftCivilMonth,
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

test("civil months use calendar dates, including February leap years", () => {
  assert.deepEqual(civilYearMonth("2026-10-28"), { year: 2026, monthIndex: 9 });
  assert.deepEqual(shiftCivilMonth(2026, 0, -1), { year: 2025, monthIndex: 11 });
  assert.deepEqual(shiftCivilMonth(2025, 11, 1), { year: 2026, monthIndex: 0 });
  assert.deepEqual(civilMonthRange(2024, 1), {
    from: "2024-02-01",
    to: "2024-02-29",
  });
  assert.deepEqual(civilMonthRange(2025, 1), {
    from: "2025-02-01",
    to: "2025-02-28",
  });
  assert.equal(shiftCivilDate("2024-02-28", 1), "2024-02-29");
  assert.equal(shiftCivilDate("2024-02-29", 1), "2024-03-01");
  assert.equal(isIsoInCivilMonth("2024-02-29", 2024, 1), true);
  assert.equal(isIsoInCivilMonth("2024-02-29", 2024, 2), false);
  assert.equal(
    selectionForVisibleMonth("2026-12-31", 2027, 0),
    null,
  );
  assert.equal(
    selectionForVisibleMonth("2027-01-01", 2027, 0),
    "2027-01-01",
  );
});

test("several entries on one civil day stay distinct and sorted", () => {
  const rows = [
    { id: "a", occurredOn: "2026-05-01", createdAt: "2026-05-01T08:00:00.000Z" },
    { id: "b", occurredOn: "2026-05-01", createdAt: "2026-05-01T18:00:00.000Z" },
    { id: "c", occurredOn: "2026-05-02", createdAt: "2026-05-02T12:00:00.000Z" },
  ] as never;
  const sameDay = entriesOnDay(rows, "2026-05-01");
  assert.deepEqual(
    sameDay.map((row) => row.id),
    ["b", "a"],
  );
  assert.equal(daysWithEntriesInMonth(rows, 2026, 4).size, 2);
});

test("journal list filters combine and appending pages skips duplicates", () => {
  const rows = [
    {
      id: "1",
      occurredOn: "2026-05-10",
      createdAt: "2026-05-10T12:00:00.000Z",
      highlighted: true,
      learning: false,
    },
    {
      id: "2",
      occurredOn: "2026-04-02",
      createdAt: "2026-04-02T12:00:00.000Z",
      highlighted: false,
      learning: true,
    },
  ] as never;
  assert.equal(applyJournalListFilters(rows, { from: "2026-05-01" }).length, 1);
  assert.equal(applyJournalListFilters(rows, { highlighted: true })[0]?.id, "1");
  assert.equal(applyJournalListFilters(rows, { learning: true })[0]?.id, "2");
  assert.equal(
    applyJournalListFilters(rows, { from: "2026-05-01", learning: true }).length,
    0,
  );
  const page = appendJournalPage(rows, [
    rows[0],
    {
      id: "3",
      occurredOn: "2026-03-01",
      createdAt: "2026-03-01T12:00:00.000Z",
    },
  ] as never);
  assert.deepEqual(
    page.map((row) => row.id),
    ["1", "2", "3"],
  );
});

test("demo samples span months and keep two notes on today", () => {
  const today = localCivilDate();
  const sameDay = entriesOnDay(JOURNAL_DEMO_ENTRIES, today);
  assert.ok(sameDay.length >= 2);
  const months = new Set(JOURNAL_DEMO_ENTRIES.map((row) => row.occurredOn.slice(0, 7)));
  assert.ok(months.size >= 2);
});
