import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { PatchJournalEntryDto } from "./patch-journal-entry.dto.js";

function validate(plain: Record<string, unknown>) {
  const dto = plainToInstance(PatchJournalEntryDto, plain);
  return validateSync(dto);
}

test("PatchJournalEntryDto allows null to clear nullable fields", () => {
  assert.equal(
    validate({
      mood: null,
      title: null,
      body: null,
      emotionIds: null,
      cravingSubstanceId: null,
    }).length,
    0,
  );
});

test("PatchJournalEntryDto accepts a partial scale change", () => {
  assert.equal(validate({ sleep: 4 }).length, 0);
});

test("PatchJournalEntryDto rejects invalid scales and catalogs", () => {
  assert.ok(validate({ anxiety: 9 }).length > 0);
  assert.ok(validate({ triggerIds: ["unknown"] }).length > 0);
});

test("PatchJournalEntryDto rejects occurredOn after UTC tomorrow", () => {
  const errors = validate({ occurredOn: "2099-01-01" });
  assert.ok(errors.length > 0);
  assert.match(
    errors.flatMap((error) => Object.values(error.constraints ?? {})).join("; "),
    /occurredOn must be a YYYY-MM-DD civil date between 1970-01-01 and UTC tomorrow/,
  );
});
