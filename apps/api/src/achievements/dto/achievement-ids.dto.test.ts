import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import {
  ACHIEVEMENT_IDS_MAX_BATCH,
  AchievementIdsDto,
} from "./achievement-ids.dto.js";

function validate(plain: Record<string, unknown>) {
  const dto = plainToInstance(AchievementIdsDto, plain);
  return validateSync(dto);
}

test("AchievementIdsDto accepts a single id", () => {
  assert.equal(validate({ achievementIds: ["nicotine-bronchi-bronze-1"] }).length, 0);
});

test("AchievementIdsDto accepts an empty list", () => {
  assert.equal(validate({ achievementIds: [] }).length, 0);
});

test("AchievementIdsDto does not declare userId (forged keys are pipe-rejected)", () => {
  const dto = plainToInstance(AchievementIdsDto, {
    achievementIds: ["a"],
    userId: "someone-else",
  });
  assert.deepEqual(Object.getOwnPropertyNames(AchievementIdsDto.prototype).includes("userId"), false);
  assert.equal(dto.achievementIds[0], "a");
});

test("AchievementIdsDto rejects missing achievementIds", () => {
  assert.ok(validate({}).length > 0);
});

test("AchievementIdsDto rejects duplicate ids", () => {
  assert.ok(validate({ achievementIds: ["a", "a"] }).length > 0);
});

test("AchievementIdsDto rejects empty string ids", () => {
  assert.ok(validate({ achievementIds: [""] }).length > 0);
});

test("AchievementIdsDto rejects oversized batches", () => {
  const ids = Array.from(
    { length: ACHIEVEMENT_IDS_MAX_BATCH + 1 },
    (_, i) => `id-${i}`,
  );
  assert.ok(validate({ achievementIds: ids }).length > 0);
});

test("AchievementIdsDto accepts a catalog-sized batch", () => {
  const ids = Array.from({ length: 106 }, (_, i) => `id-${i}`);
  assert.equal(validate({ achievementIds: ids }).length, 0);
});
