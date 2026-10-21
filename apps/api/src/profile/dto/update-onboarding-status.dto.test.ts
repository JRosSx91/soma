import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { UpdateOnboardingStatusDto } from "./update-onboarding-status.dto.js";

test("UpdateOnboardingStatusDto accepts pending|skipped|completed", () => {
  for (const status of ["pending", "skipped", "completed"]) {
    const dto = plainToInstance(UpdateOnboardingStatusDto, { status });
    assert.equal(validateSync(dto).length, 0);
  }
});

test("UpdateOnboardingStatusDto rejects unknown status values", () => {
  const dto = plainToInstance(UpdateOnboardingStatusDto, {
    status: "not-a-status",
  });
  assert.ok(validateSync(dto).length > 0);
});
