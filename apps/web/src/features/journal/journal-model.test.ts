import assert from "node:assert/strict";
import { test } from "node:test";
import { JOURNAL_WELLBEING_WINDOW_DAYS } from "@soma/shared-types";
import {
  JOURNAL_COINCIDENCE_MIN,
  appendJournalPage,
  applyJournalListFilters,
  civilMonthRange,
  civilYearMonth,
  countJournalDays,
  currentJournalStreak,
  dailyScaleSeries,
  daysWithEntriesInMonth,
  emotionFrequencies,
  emotionTriggerCoincidences,
  entriesOnDay,
  entriesWithEmotion,
  filterEntriesInCivilWindow,
  hasSignificantJournalContent,
  isIsoInCivilMonth,
  localCivilDate,
  shiftCivilDate,
  selectionForVisibleMonth,
  shiftCivilMonth,
  triggerFrequencies,
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

test("dailyScaleSeries means same-day ratings and keeps wellbeing zero", () => {
  const points = dailyScaleSeries(
    [
      { occurredOn: "2026-05-01", mood: 2 },
      { occurredOn: "2026-05-01", mood: 3 },
      { occurredOn: "2026-05-01", mood: 4 },
      { occurredOn: "2026-05-02", mood: null },
      { occurredOn: "2026-05-03", mood: 5 },
    ] as never,
    "mood",
  );
  assert.deepEqual(
    points.map((row) => ({ occurredOn: row.occurredOn, value: row.value })),
    [
      { occurredOn: "2026-05-01", value: 3 },
      { occurredOn: "2026-05-03", value: 5 },
    ],
  );
  const wellbeing = dailyScaleSeries(
    [
      { occurredOn: "2026-05-01", wellbeingRating: 0 },
      { occurredOn: "2026-05-02", wellbeingRating: null },
    ] as never,
    "wellbeing",
  );
  assert.equal(wellbeing.length, 1);
  assert.equal(wellbeing[0]?.value, 0);
  assert.equal(dailyScaleSeries(wellbeing as never, "sleep").length, 0);
});

test("civil windows of 28 and 90 days include today and skip empty days", () => {
  const today = "2026-10-28";
  const rows = [
    { occurredOn: "2026-10-28", mood: 3 },
    { occurredOn: "2026-10-01", mood: 2 },
    { occurredOn: "2026-09-30", mood: 4 },
    { occurredOn: "2026-07-31", mood: 5 },
    { occurredOn: "2026-07-30", mood: 1 },
  ] as never;
  const days28 = filterEntriesInCivilWindow(rows, today, 28);
  assert.deepEqual(
    days28.map((row) => row.occurredOn),
    ["2026-10-28", "2026-10-01"],
  );
  const days90 = filterEntriesInCivilWindow(rows, today, 90);
  assert.equal(days90.some((row) => row.occurredOn === "2026-07-31"), true);
  assert.equal(days90.some((row) => row.occurredOn === "2026-07-30"), false);
  assert.equal(filterEntriesInCivilWindow(rows, today, "all").length, 5);
  const sleep = dailyScaleSeries(rows, "sleep");
  assert.equal(sleep.length, 0);
});

test("trigger frequencies and coincidences count entries with a stable threshold", () => {
  const rows = [
    { id: "a", occurredOn: "2026-05-01", createdAt: "1", emotionIds: ["tired"], triggerIds: ["fatigue"] },
    { id: "b", occurredOn: "2026-05-02", createdAt: "2", emotionIds: ["tired", "calm"], triggerIds: ["fatigue"] },
    { id: "c", occurredOn: "2026-05-03", createdAt: "3", emotionIds: ["tired"], triggerIds: ["fatigue", "stress"] },
    { id: "d", occurredOn: "2026-05-04", createdAt: "4", emotionIds: ["anxious"], triggerIds: ["conflict"] },
    { id: "e", occurredOn: "2026-05-05", createdAt: "5", emotionIds: [], triggerIds: [] },
  ] as never;
  const triggers = triggerFrequencies(rows);
  assert.equal(triggers.find((row) => row.id === "fatigue")?.percent, 75);
  assert.equal(JOURNAL_COINCIDENCE_MIN, 3);
  const hits = emotionTriggerCoincidences(rows);
  assert.equal(hits.length, 1);
  assert.equal(hits[0]?.emotionId, "tired");
  assert.equal(hits[0]?.triggerId, "fatigue");
  assert.equal(hits[0]?.count, 3);
  assert.equal(emotionTriggerCoincidences(rows.slice(0, 2)).length, 0);
  assert.equal(entriesWithEmotion(rows, "tired").length, 3);
  const today = "2026-10-28";
  const windowed = [
    {
      id: "w1",
      occurredOn: "2026-10-20",
      createdAt: "1",
      emotionIds: ["tired"],
      triggerIds: ["fatigue"],
    },
    {
      id: "w2",
      occurredOn: "2026-10-22",
      createdAt: "2",
      emotionIds: ["tired"],
      triggerIds: ["fatigue"],
    },
    {
      id: "w3",
      occurredOn: "2026-07-01",
      createdAt: "3",
      emotionIds: ["tired"],
      triggerIds: ["fatigue"],
    },
  ] as never;
  assert.equal(
    emotionTriggerCoincidences(filterEntriesInCivilWindow(windowed, today, 28))
      .length,
    0,
  );
  assert.equal(
    emotionTriggerCoincidences(filterEntriesInCivilWindow(windowed, today, "all"))[0]
      ?.count,
    3,
  );
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
  assert.deepEqual(civilMonthRange(2026, 10), {
    from: "2026-11-01",
    to: "2026-11-30",
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
  assert.ok(emotionTriggerCoincidences(JOURNAL_DEMO_ENTRIES).length >= 1);
  assert.ok(dailyScaleSeries(JOURNAL_DEMO_ENTRIES, "craving").length >= 1);
});
