import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { journalOccurredOnMax } from "@soma/shared-types";
import { ListJournalQueryDto } from "./list-journal-query.dto.js";

function validate(plain: Record<string, unknown>) {
  const dto = plainToInstance(ListJournalQueryDto, plain);
  return validateSync(dto);
}

function messages(plain: Record<string, unknown>): string {
  return validate(plain)
    .flatMap((error) => Object.values(error.constraints ?? {}))
    .join("; ");
}

test("ListJournalQueryDto accepts the current month including days after UTC tomorrow", () => {
  const now = new Date("2026-11-01T12:00:00.000Z");
  assert.equal(journalOccurredOnMax(now), "2026-11-02");
  assert.equal(
    validate({ from: "2026-11-01", to: "2026-11-30", limit: 50 }).length,
    0,
  );
});

test("ListJournalQueryDto accepts a past civil month", () => {
  assert.equal(
    validate({ from: "2026-10-01", to: "2026-10-31", limit: 50 }).length,
    0,
  );
});

test("ListJournalQueryDto rejects inverted and malformed ranges", () => {
  assert.ok(validate({ from: "2026-11-30", to: "2026-11-01" }).length > 0);
  assert.match(messages({ from: "2026-11-30", to: "2026-11-01" }), /from must be on or before to/);
  assert.ok(validate({ from: "2026-02-30", to: "2026-02-30" }).length > 0);
  assert.ok(validate({ from: "29/04/2026" }).length > 0);
  assert.equal(messages({ from: "2099-01-01" }).includes("occurredOn"), false);
});
