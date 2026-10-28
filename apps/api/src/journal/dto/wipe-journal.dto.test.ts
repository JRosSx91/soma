import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { WipeJournalDto } from "./wipe-journal.dto.js";

function validate(plain: Record<string, unknown>) {
  const dto = plainToInstance(WipeJournalDto, plain);
  return validateSync(dto);
}

test("WipeJournalDto accepts delete-journal", () => {
  assert.equal(validate({ confirm: "delete-journal" }).length, 0);
});

test("WipeJournalDto rejects missing or wrong confirmation", () => {
  assert.ok(validate({}).length > 0);
  assert.ok(validate({ confirm: "yes" }).length > 0);
  assert.ok(validate({ confirm: "DELETE-JOURNAL" }).length > 0);
});
