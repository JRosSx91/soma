import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { CreateJournalEntryDto } from "./create-journal-entry.dto.js";

function validate(plain: Record<string, unknown>) {
  const dto = plainToInstance(CreateJournalEntryDto, plain);
  return validateSync(dto);
}

test("CreateJournalEntryDto accepts a scale-only entry", () => {
  assert.equal(
    validate({ occurredOn: "2026-04-29", mood: 3 }).length,
    0,
  );
});

test("CreateJournalEntryDto accepts text, tags, and craving catalog id", () => {
  assert.equal(
    validate({
      occurredOn: "2026-04-29",
      title: "Quiet morning",
      body: "Walked.",
      emotionIds: ["calm", "grateful"],
      triggerIds: ["fatigue"],
      cravingSubstanceId: "alcohol",
      cravingIntensity: 2,
    }).length,
    0,
  );
});

test("CreateJournalEntryDto rejects empty content", () => {
  assert.ok(validate({ occurredOn: "2026-04-29" }).length > 0);
});

test("CreateJournalEntryDto rejects highlighted/learning as sole content", () => {
  assert.ok(
    validate({
      occurredOn: "2026-04-29",
      highlighted: true,
      learning: true,
    }).length > 0,
  );
});

test("CreateJournalEntryDto rejects out-of-range scales", () => {
  assert.ok(validate({ occurredOn: "2026-04-29", mood: 0 }).length > 0);
  assert.ok(validate({ occurredOn: "2026-04-29", sleep: 6 }).length > 0);
  assert.ok(validate({ occurredOn: "2026-04-29", energy: 1.5 }).length > 0);
});

test("CreateJournalEntryDto rejects unknown catalog ids and duplicates", () => {
  assert.ok(
    validate({
      occurredOn: "2026-04-29",
      emotionIds: ["calm", "not-an-emotion"],
    }).length > 0,
  );
  assert.ok(
    validate({
      occurredOn: "2026-04-29",
      triggerIds: ["stress", "stress"],
    }).length > 0,
  );
  assert.ok(
    validate({
      occurredOn: "2026-04-29",
      emotionIds: ["calm", "sad", "tired", "grateful", "anxious", "motivated"],
    }).length > 0,
  );
  assert.ok(
    validate({
      occurredOn: "2026-04-29",
      mood: 3,
      cravingSubstanceId: "heroin",
    }).length > 0,
  );
});

test("CreateJournalEntryDto rejects invalid civil dates", () => {
  assert.ok(validate({ occurredOn: "2026-02-30", mood: 3 }).length > 0);
  assert.ok(validate({ occurredOn: "29/04/2026", mood: 3 }).length > 0);
  assert.ok(validate({ occurredOn: "1969-12-31", mood: 3 }).length > 0);
});
