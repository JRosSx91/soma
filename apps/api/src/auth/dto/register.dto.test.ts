import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { currentRegistrationAcceptanceFields } from "@soma/shared-types";
import { RegisterDto } from "./register.dto.js";

function validate(plain: Record<string, unknown>) {
  const dto = plainToInstance(RegisterDto, plain);
  return validateSync(dto);
}

const base = {
  email: "user@example.test",
  password: "password12",
  displayName: "User",
  biologicalSex: "male",
  birthYear: 1990,
  ...currentRegistrationAcceptanceFields(),
};

test("RegisterDto accepts decimal weightKg 68.5 and range bounds", () => {
  assert.equal(validate({ ...base, weightKg: 68.5 }).length, 0);
  assert.equal(validate({ ...base, weightKg: 20 }).length, 0);
  assert.equal(validate({ ...base, weightKg: 400 }).length, 0);
});

test("RegisterDto rejects invalid weightKg", () => {
  assert.ok(validate({ ...base, weightKg: 19.99 }).length > 0);
  assert.ok(validate({ ...base, weightKg: 400.01 }).length > 0);
  assert.ok(validate({ ...base, weightKg: Number.NaN }).length > 0);
  assert.ok(validate({ ...base, weightKg: Number.POSITIVE_INFINITY }).length > 0);
  assert.ok(validate({ ...base, weightKg: "68.5" }).length > 0);
});

test("RegisterDto requires current draft acceptances", () => {
  assert.ok(validate({ ...base, acceptedTerms: false }).length > 0);
  assert.ok(validate({ ...base, acceptedPrivacyNotice: false }).length > 0);
  assert.ok(
    validate({ ...base, acceptedSpecialCategoryProcessing: false }).length > 0,
  );
  assert.ok(validate({ ...base, termsVersion: "other" }).length > 0);
  const missing = { ...base };
  delete (missing as { acceptedTerms?: boolean }).acceptedTerms;
  assert.ok(validate(missing).length > 0);
});
