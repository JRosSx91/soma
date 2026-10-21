import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { UpsertProfileDto } from "./upsert-profile.dto.js";

test("UpsertProfileDto accepts an explicit usages array including []", () => {
  for (const usages of [
    [],
    [
      {
        substanceId: "nicotine",
        yearStarted: 2020,
        frequency: "daily",
        status: "abstinent",
        lastUseDate: "2024-01-01",
      },
    ],
  ]) {
    const dto = plainToInstance(UpsertProfileDto, { usages });
    assert.equal(validateSync(dto).length, 0, JSON.stringify(usages));
  }
});

test("UpsertProfileDto rejects omitted usages", () => {
  const dto = plainToInstance(UpsertProfileDto, {});
  assert.ok(validateSync(dto).length > 0);
});

test("UpsertProfileDto rejects null usages", () => {
  const dto = plainToInstance(UpsertProfileDto, { usages: null });
  assert.ok(validateSync(dto).length > 0);
});
