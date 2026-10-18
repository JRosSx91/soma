import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeEmail } from "./normalize-email.js";

test("normalizeEmail trims and lowercases", () => {
  assert.equal(normalizeEmail("  User.Name+Tag@Example.COM  "), "user.name+tag@example.com");
});

test("normalizeEmail is idempotent on already-canonical addresses", () => {
  assert.equal(normalizeEmail("a@b.co"), "a@b.co");
});
