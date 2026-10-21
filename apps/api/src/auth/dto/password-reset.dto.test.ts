import assert from "node:assert/strict";
import { test } from "node:test";
import { validateSync } from "class-validator";
import { ForgotPasswordDto } from "./forgot-password.dto.js";
import { ResetPasswordDto } from "./reset-password.dto.js";

test("ForgotPasswordDto rejects empty and non-email values", () => {
  const empty = new ForgotPasswordDto();
  empty.email = "";
  assert.ok(validateSync(empty).length > 0);

  const bad = new ForgotPasswordDto();
  bad.email = "not-an-email";
  assert.ok(validateSync(bad).length > 0);

  const ok = new ForgotPasswordDto();
  ok.email = "user@example.com";
  assert.equal(validateSync(ok).length, 0);
});

test("ResetPasswordDto rejects short passwords and short tokens", () => {
  const shortPw = new ResetPasswordDto();
  shortPw.token = "a".repeat(32);
  shortPw.newPassword = "short";
  assert.ok(validateSync(shortPw).length > 0);

  const ok = new ResetPasswordDto();
  ok.token = "AbCdEfGhIjKlMnOpQrStUvWxYz0123456789_-";
  ok.newPassword = "longenough";
  assert.equal(validateSync(ok).length, 0);
});
