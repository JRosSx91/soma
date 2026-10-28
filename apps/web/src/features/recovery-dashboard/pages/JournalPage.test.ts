import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enJournal from "../../../i18n/locales/en/journal.json" with { type: "json" };
import esJournal from "../../../i18n/locales/es/journal.json" with { type: "json" };

const page = readFileSync(new URL("./JournalPage.tsx", import.meta.url), "utf8");
const form = readFileSync(
  new URL("../../journal/JournalEntryForm.tsx", import.meta.url),
  "utf8",
);
const api = readFileSync(
  new URL("../../journal/journal-api.ts", import.meta.url),
  "utf8",
);
const demo = readFileSync(
  new URL("../../journal/journal-demo.ts", import.meta.url),
  "utf8",
);
const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");

test("journal 2.0 uses the shared shell, hero, tabs, nature-5 and nature-6", () => {
  assert.match(page, /RecoveryHero/);
  assert.match(page, /nature-5\.png/);
  assert.match(page, /nature-6\.png/);
  assert.match(page, /SegmentedControl/);
  assert.match(page, /DetailSheet/);
  assert.match(page, /demo=\{demo\}/);
  assert.match(page, /LastEntryCard/);
  assert.match(page, /HighlightQuote/);
  assert.match(page, /SectionTitle/);
  assert.match(page, /journal-chart-fill/);
  assert.match(app, /path="journal"/);
  assert.match(app, /JournalPage/);
});

test("journal streak is informational and wellbeing is a voluntary rating", () => {
  assert.match(page, /currentJournalStreak/);
  assert.match(page, /wellbeingAverage/);
  assert.match(form, /wellbeingRating/);
  assert.match(form, /form\.wellbeing/);
  assert.equal(esJournal.form.cravingIntensity.includes("{{"), false);
  assert.equal(esJournal.form.cravingIntensity.length > 0, true);
  assert.equal(enJournal.form.cravingIntensity.length > 0, true);
  assert.match(esJournal.summary.streakHint, /Cada día cuenta/);
  assert.match(esJournal.summary.streakHelp.toLowerCase(), /penalizaci/);
  assert.match(esJournal.overview.milestonesHint, /mejoras que has descubierto/);
  assert.match(enJournal.summary.streakHint, /Every day counts/);
});

test("LIVE journal fetch is isolated from DEMO samples", () => {
  assert.match(api, /\/me\/journal/);
  assert.match(api, /\/me\/journal\/milestones/);
  assert.match(api, /fetchJournalPage/);
  assert.match(api, /fetchJournalMonthEntries/);
  assert.equal(demo.includes("apiRequest"), false);
  assert.equal(demo.includes("/me/journal"), false);
  assert.match(page, /base === "\/preview"/);
  assert.match(page, /base === "\/app"/);
  assert.match(page, /fetchAllJournalEntries/);
  assert.match(page, /fetchJournalMonthEntries/);
  assert.match(page, /fetchJournalPage/);
  assert.match(page, /fetchJournalMilestones/);
  assert.match(page, /if \(!live\) return/);
  assert.match(page, /JOURNAL_DEMO_ENTRIES/);
  assert.match(page, /JOURNAL_DEMO_MILESTONES/);
});

test("journal calendar and history cover month paging, filters and load more", () => {
  assert.match(page, /shiftCivilMonth/);
  assert.match(page, /selectionForVisibleMonth/);
  assert.match(page, /visibleSelectedDay/);
  assert.match(page, /calendarToday/);
  assert.match(page, /fetchJournalMonthEntries/);
  assert.match(page, /fetchJournalPage/);
  assert.match(page, /appendJournalPage/);
  assert.match(page, /filterHighlighted/);
  assert.match(page, /entries\.loadMore/);
  assert.match(page, /aria-pressed/);
  assert.match(page, /calendarHasEntry/);
  assert.match(page, /setDemoListLimit/);
  assert.match(page, /if \(tab === "entries"\)/);
});

test("journal form covers required fields and catalogs", () => {
  assert.match(form, /occurredOn/);
  assert.match(form, /mood/);
  assert.match(form, /sleep/);
  assert.match(form, /energy/);
  assert.match(form, /anxiety/);
  assert.match(form, /cravingIntensity/);
  assert.match(form, /wellbeingRating/);
  assert.match(form, /JOURNAL_EMOTION_IDS/);
  assert.match(form, /JOURNAL_TRIGGER_IDS/);
  assert.match(form, /highlighted/);
  assert.match(form, /learning/);
  assert.match(form, /form.sectionFeeling/);
});

test("journal patterns and emotions tabs stay descriptive and local for DEMO", () => {
  assert.match(page, /dailyScaleSeries/);
  assert.match(page, /filterEntriesInCivilWindow/);
  assert.match(page, /emotionTriggerCoincidences\(patternEntries\)/);
  assert.match(page, /triggerFrequencies/);
  assert.match(page, /wellbeingAverage\(entries, today\)/);
  assert.match(page, /tagListLimit/);
  assert.match(page, /JOURNAL_TAG_ENTRY_PAGE/);
  assert.match(page, /patterns\.coincidencesHint/);
  assert.match(esJournal.emotionsTab.hint, /todo el historial/);
  assert.match(enJournal.emotionsTab.hint, /full history/);
  assert.match(page, /fetchAllJournalEntries/);
  assert.equal(esJournal.patterns.coincidencesHint.includes("provoque"), true);
  assert.equal(enJournal.patterns.coincidencesHint.includes("cause"), true);
  assert.match(esJournal.emotionsTab.help, /100/);
  assert.equal(demo.includes("/me/journal"), false);
});

test("journal copy exists in spanish and english", () => {
  assert.equal(esJournal.eyebrow, "Bitácora");
  assert.equal(enJournal.eyebrow, "Journal");
  assert.equal(esJournal.tabs.overview, "Vista general");
  assert.equal(enJournal.tabs.patterns, "Patterns");
  assert.ok(Array.isArray(esJournal.quotes) && esJournal.quotes.length > 0);
  assert.equal(typeof esJournal.milestones.kinds.clarity, "string");
  assert.equal(typeof enJournal.milestones.kinds.clarity, "string");
});
