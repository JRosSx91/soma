import assert from "node:assert/strict";
import { test } from "node:test";
import { CodedBadRequestException } from "../common/exceptions/coded-exception.js";
import {
  AUTH_AGE_RESTRICTED_CODE,
  AUTH_BIRTH_DATE_INVALID_CODE,
  assertEligibleRegistrationAge,
} from "./registration-age.js";

test("assertEligibleRegistrationAge accepts an adult civil date", () => {
  assert.equal(assertEligibleRegistrationAge("1990-06-15"), 1990);
});

test("assertEligibleRegistrationAge rejects an invalid date", () => {
  assert.throws(
    () => assertEligibleRegistrationAge("2026-02-30"),
    (err: unknown) => {
      assert.ok(err instanceof CodedBadRequestException);
      assert.equal(err.code, AUTH_BIRTH_DATE_INVALID_CODE);
      return true;
    },
  );
});

test("assertEligibleRegistrationAge rejects a date that cannot yet be 18", () => {
  const nextYear = new Date().getFullYear() + 1;
  assert.throws(
    () => assertEligibleRegistrationAge(`${nextYear}-01-01`),
    (err: unknown) => {
      assert.ok(err instanceof CodedBadRequestException);
      assert.equal(err.code, AUTH_BIRTH_DATE_INVALID_CODE);
      return true;
    },
  );
  const lastYear = new Date().getFullYear() - 1;
  assert.throws(
    () => assertEligibleRegistrationAge(`${lastYear}-12-31`),
    (err: unknown) => {
      assert.ok(err instanceof CodedBadRequestException);
      assert.equal(err.code, AUTH_AGE_RESTRICTED_CODE);
      return true;
    },
  );
});
