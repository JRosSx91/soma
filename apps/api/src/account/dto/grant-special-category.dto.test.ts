import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { currentSpecialCategoryGrantFields } from "@soma/shared-types";
import { GrantSpecialCategoryDto } from "./grant-special-category.dto.js";

function validate(plain: Record<string, unknown>) {
  const dto = plainToInstance(GrantSpecialCategoryDto, plain);
  return validateSync(dto, { whitelist: true, forbidNonWhitelisted: true });
}

test("GrantSpecialCategoryDto accepts the current published grant", () => {
  assert.equal(validate(currentSpecialCategoryGrantFields()).length, 0);
});

test("GrantSpecialCategoryDto rejects a missing or false acceptance", () => {
  assert.ok(validate({}).length > 0);
  assert.ok(
    validate({
      ...currentSpecialCategoryGrantFields(),
      acceptedSpecialCategoryProcessing: false,
    }).length > 0,
  );
  assert.ok(
    validate({
      ...currentSpecialCategoryGrantFields(),
      specialCategoryProcessingVersion: "other",
    }).length > 0,
  );
  assert.ok(
    validate({
      ...currentSpecialCategoryGrantFields(),
      userId: "other-user",
    }).length > 0,
  );
});
