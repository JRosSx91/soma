import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { currentRegisterClientFields } from "@soma/shared-types";
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
  ...currentRegisterClientFields(),
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

test("RegisterDto requires current published acceptances including adult age", () => {
  assert.ok(validate({ ...base, acceptedTerms: false }).length > 0);
  assert.ok(validate({ ...base, acceptedPrivacyNotice: false }).length > 0);
  assert.ok(validate({ ...base, acceptedAdultAge: false }).length > 0);
  assert.equal(
    validate({
      email: "user@example.test",
      password: "password12",
      displayName: "User",
      biologicalSex: "male",
      ...currentRegisterClientFields(),
    }).length,
    0,
  );
  assert.ok(validate({ ...base, termsVersion: "other" }).length > 0);
  const missing = { ...base };
  delete (missing as { acceptedTerms?: boolean }).acceptedTerms;
  assert.ok(validate(missing).length > 0);
});

test("RegisterDto requires an ISO civil birth date and rejects leftover birthYear", () => {
  assert.ok(validate({ ...base, birthDate: "1990-6-15" }).length > 0);
  const extra = {
    ...base,
    birthYear: 1990,
  };
  const dto = plainToInstance(RegisterDto, extra);
  const errors = validateSync(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  assert.ok(errors.length > 0);
});

test("RegisterDto rejects leftover special-category registration fields", () => {
  const extra = {
    ...base,
    acceptedSpecialCategoryProcessing: true,
    specialCategoryProcessingVersion: base.privacyNoticeVersion,
  };
  const dto = plainToInstance(RegisterDto, extra);
  const errors = validateSync(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  assert.ok(errors.length > 0);
});
