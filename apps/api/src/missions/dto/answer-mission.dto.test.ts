import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { AnswerMissionDto } from "./answer-mission.dto.js";

function validate(plain: Record<string, unknown>) {
  const dto = plainToInstance(AnswerMissionDto, plain);
  return validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
}

test("AnswerMissionDto accepts a non-empty optionId", () => {
  assert.equal(validate({ optionId: "wanting" }).length, 0);
});

test("AnswerMissionDto rejects missing, empty, non-string, and extra fields", () => {
  assert.ok(validate({}).length > 0);
  assert.ok(validate({ optionId: "" }).length > 0);
  assert.ok(validate({ optionId: 12 }).length > 0);
  assert.ok(validate({ optionId: "wanting", xp: 12 }).length > 0);
  assert.ok(validate({ optionId: "wanting", userId: "u1" }).length > 0);
  assert.ok(validate({ optionId: "wanting", completed: true }).length > 0);
  assert.ok(validate({ optionId: "wanting", contentVersion: 2 }).length > 0);
});
