import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { DeleteAccountDto } from "./delete-account.dto.js";

function validate(plain: Record<string, unknown>) {
  const dto = plainToInstance(DeleteAccountDto, plain);
  return validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
}

test("DeleteAccountDto accepts password only", () => {
  assert.equal(validate({ password: "password123" }).length, 0);
});

test("DeleteAccountDto rejects empty password", () => {
  assert.ok(validate({ password: "" }).length > 0);
});

test("DeleteAccountDto rejects extra userId", () => {
  const errors = validate({ password: "password123", userId: "other-user" });
  assert.ok(errors.length > 0);
});
