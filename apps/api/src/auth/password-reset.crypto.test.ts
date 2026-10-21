import assert from "node:assert/strict";
import { test } from "node:test";
import {
  generatePasswordResetPlaintext,
  hashPasswordResetToken,
} from "./password-reset.crypto.js";

test("generatePasswordResetPlaintext has high entropy and is unique", () => {
  const a = generatePasswordResetPlaintext();
  const b = generatePasswordResetPlaintext();
  assert.notEqual(a, b);
  assert.ok(a.length >= 40);
  assert.match(a, /^[A-Za-z0-9_-]+$/);
});

test("hashPasswordResetToken is deterministic and never equals plaintext", () => {
  const plaintext = generatePasswordResetPlaintext();
  const h1 = hashPasswordResetToken(plaintext);
  const h2 = hashPasswordResetToken(plaintext);
  assert.equal(h1, h2);
  assert.notEqual(h1, plaintext);
  assert.equal(h1.length, 64);
});
