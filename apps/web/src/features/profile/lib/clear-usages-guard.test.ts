import assert from "node:assert/strict";
import { test } from "node:test";
import { shouldConfirmClearUsages } from "./clear-usages-guard.js";

test("shouldConfirmClearUsages when previous usages exist and next is empty", () => {
  assert.equal(shouldConfirmClearUsages(2, 0), true);
  assert.equal(shouldConfirmClearUsages(1, 0), true);
});

test("shouldConfirmClearUsages is false when already empty or next has rows", () => {
  assert.equal(shouldConfirmClearUsages(0, 0), false);
  assert.equal(shouldConfirmClearUsages(2, 1), false);
  assert.equal(shouldConfirmClearUsages(0, 3), false);
});
