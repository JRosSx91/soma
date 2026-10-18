import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { UpdateProfileDetailsDto } from "./update-profile-details.dto.js";

function validate(plain: Record<string, unknown>) {
  const dto = plainToInstance(UpdateProfileDetailsDto, plain);
  return validateSync(dto);
}

test("UpdateProfileDetailsDto accepts a single field", () => {
  assert.equal(validate({ displayName: "Ada" }).length, 0);
});

test("UpdateProfileDetailsDto accepts several fields", () => {
  assert.equal(
    validate({
      displayName: "Ada",
      biologicalSex: "female",
      birthYear: 1991,
      weightKg: 62,
    }).length,
    0,
  );
});

test("UpdateProfileDetailsDto rejects empty object", () => {
  assert.ok(validate({}).length > 0);
});

test("UpdateProfileDetailsDto allows null weightKg", () => {
  assert.equal(validate({ weightKg: null }).length, 0);
});

test("UpdateProfileDetailsDto accepts decimal weightKg including 68.5", () => {
  assert.equal(validate({ weightKg: 68.5 }).length, 0);
  assert.equal(validate({ weightKg: 20 }).length, 0);
  assert.equal(validate({ weightKg: 400 }).length, 0);
  assert.equal(validate({ weightKg: 20.01 }).length, 0);
  assert.equal(validate({ weightKg: 399.99 }).length, 0);
});

test("UpdateProfileDetailsDto rejects null for required columns", () => {
  assert.ok(validate({ displayName: null }).length > 0);
  assert.ok(validate({ biologicalSex: null }).length > 0);
  assert.ok(validate({ birthYear: null }).length > 0);
});

test("UpdateProfileDetailsDto rejects invalid weightKg", () => {
  assert.ok(validate({ weightKg: 10 }).length > 0);
  assert.ok(validate({ weightKg: 500 }).length > 0);
  assert.ok(validate({ weightKg: 19.99 }).length > 0);
  assert.ok(validate({ weightKg: 400.01 }).length > 0);
  assert.ok(validate({ weightKg: Number.NaN }).length > 0);
  assert.ok(validate({ weightKg: Number.POSITIVE_INFINITY }).length > 0);
  assert.ok(validate({ weightKg: "68.5" }).length > 0);
});

test("UpdateProfileDetailsDto rejects invalid values", () => {
  assert.ok(validate({ displayName: "" }).length > 0);
  assert.ok(validate({ biologicalSex: "other" }).length > 0);
  assert.ok(validate({ birthYear: 1800 }).length > 0);
  assert.ok(validate({ birthYear: new Date().getFullYear() + 1 }).length > 0);
});
