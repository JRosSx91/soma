import assert from "node:assert/strict";
import { test } from "node:test";
import { mergeAuthUserFromProfile } from "./merge-auth-user.js";
import type { AuthUser } from "../types.js";

const current: AuthUser = {
  id: "u1",
  email: "a@example.test",
  displayName: "Old",
  biologicalSex: "male",
  birthYear: 1990,
  weightKg: null,
};

test("mergeAuthUserFromProfile updates personal fields for the same user", () => {
  const next = mergeAuthUserFromProfile(current, {
    id: "u1",
    email: "a@example.test",
    displayName: "New Name",
    biologicalSex: "female",
    birthYear: 1988,
    weightKg: 68.5,
  });
  assert.equal(next.displayName, "New Name");
  assert.equal(next.biologicalSex, "female");
  assert.equal(next.birthYear, 1988);
  assert.equal(next.weightKg, 68.5);
  assert.equal(next.id, "u1");
  assert.equal(next.email, "a@example.test");
});

test("mergeAuthUserFromProfile refuses a different user id", () => {
  const next = mergeAuthUserFromProfile(current, {
    id: "other",
    email: "x@example.test",
    displayName: "Hacker",
    biologicalSex: "female",
    birthYear: 2000,
    weightKg: 90,
  });
  assert.deepEqual(next, current);
});
