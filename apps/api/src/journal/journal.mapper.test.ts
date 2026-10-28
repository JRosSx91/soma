import assert from "node:assert/strict";
import { test } from "node:test";
import type { JournalEntry } from "@prisma/client";
import {
  hasSignificantJournalContent,
  normalizeOptionalText,
  toJournalEntryResponse,
} from "./journal.mapper.js";

test("hasSignificantJournalContent ignores highlighted and learning", () => {
  assert.equal(hasSignificantJournalContent({}), false);
  assert.equal(
    hasSignificantJournalContent({
      title: "   ",
      body: "",
      emotionIds: [],
      triggerIds: [],
    }),
    false,
  );
  assert.equal(hasSignificantJournalContent({ mood: 3 }), true);
  assert.equal(hasSignificantJournalContent({ title: "Note" }), true);
  assert.equal(hasSignificantJournalContent({ emotionIds: ["calm"] }), true);
});

test("normalizeOptionalText trims empty strings to null", () => {
  assert.equal(normalizeOptionalText(undefined), undefined);
  assert.equal(normalizeOptionalText(null), null);
  assert.equal(normalizeOptionalText("  "), null);
  assert.equal(normalizeOptionalText("  hi  "), "hi");
});

test("toJournalEntryResponse keeps optional scalars as null", () => {
  const row = {
    id: "entry-1",
    userId: "user-a",
    occurredOn: new Date("2026-04-29T00:00:00.000Z"),
    createdAt: new Date("2026-04-29T10:00:00.000Z"),
    updatedAt: new Date("2026-04-29T10:00:00.000Z"),
    mood: 3,
    sleep: null,
    energy: null,
    anxiety: null,
    cravingIntensity: null,
    cravingSubstanceId: null,
    title: null,
    body: null,
    highlighted: false,
    learning: false,
    emotionIds: [],
    triggerIds: [],
  } as JournalEntry;
  const dto = toJournalEntryResponse(row);
  assert.equal(dto.occurredOn, "2026-04-29");
  assert.equal(dto.mood, 3);
  assert.equal(dto.sleep, null);
  assert.equal(dto.title, null);
  assert.equal(dto.body, null);
  assert.equal(dto.cravingSubstanceId, null);
  assert.deepEqual(dto.emotionIds, []);
});
