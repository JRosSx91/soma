import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { CreateJournalMilestoneDto } from "./create-journal-milestone.dto.js";

function validate(plain: Record<string, unknown>) {
  const dto = plainToInstance(CreateJournalMilestoneDto, plain);
  return validateSync(dto);
}

test("CreateJournalMilestoneDto accepts a catalog kind and civil date", () => {
  assert.equal(
    validate({ kind: "clarity", occurredOn: "2026-04-29" }).length,
    0,
  );
});

test("CreateJournalMilestoneDto rejects unknown kinds and invalid dates", () => {
  assert.ok(validate({ kind: "medal", occurredOn: "2026-04-29" }).length > 0);
  assert.ok(validate({ kind: "clarity", occurredOn: "2026-02-30" }).length > 0);
});
