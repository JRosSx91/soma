import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError } from "../client/api.js";
import { runForgotPasswordRequest } from "./forgot-password-flow.js";
import { runResetPasswordRequest } from "./reset-password-flow.js";

test("forgot flow: invalid email", async () => {
  const outcome = await runForgotPasswordRequest("not-email", async () => {
    throw new Error("should not call API");
  });
  assert.deepEqual(outcome, {
    status: "error",
    messageKey: "forgotPassword.invalidEmail",
  });
});

test("forgot flow: generic confirmation on success", async () => {
  let called = false;
  const outcome = await runForgotPasswordRequest(
    "user@example.com",
    async () => {
      called = true;
      return { ok: true, message: "…" };
    },
  );
  assert.equal(called, true);
  assert.deepEqual(outcome, { status: "ok" });
});

test("forgot flow: 429", async () => {
  const outcome = await runForgotPasswordRequest(
    "user@example.com",
    async () => {
      throw new ApiError(429, "Too many");
    },
  );
  assert.deepEqual(outcome, {
    status: "error",
    messageKey: "errors.rateLimited",
  });
});

test("forgot flow: network error", async () => {
  const outcome = await runForgotPasswordRequest(
    "user@example.com",
    async () => {
      throw new TypeError("Failed to fetch");
    },
  );
  assert.deepEqual(outcome, {
    status: "error",
    messageKey: "errors.network",
  });
});

test("reset flow: mismatched passwords", async () => {
  const outcome = await runResetPasswordRequest(
    "tok_abcdefghijklmnopqrstuvwxyz",
    "password12",
    "password99",
    async () => {
      throw new Error("should not call API");
    },
  );
  assert.deepEqual(outcome, {
    status: "error",
    messageKey: "resetPassword.mismatch",
  });
});

test("reset flow: missing token", async () => {
  const outcome = await runResetPasswordRequest(
    null,
    "password12",
    "password12",
  );
  assert.deepEqual(outcome, {
    status: "error",
    messageKey: "resetPassword.missingToken",
  });
});

test("reset flow: invalid token", async () => {
  const outcome = await runResetPasswordRequest(
    "tok_abcdefghijklmnopqrstuvwxyz",
    "password12",
    "password12",
    async () => {
      throw new ApiError(400, "Invalid or expired reset token");
    },
  );
  assert.deepEqual(outcome, {
    status: "error",
    messageKey: "errors.invalidResetToken",
  });
});

test("reset flow: success", async () => {
  let seen: { token: string; password: string } | null = null;
  const outcome = await runResetPasswordRequest(
    "tok_abcdefghijklmnopqrstuvwxyz",
    "password12",
    "password12",
    async (token, newPassword) => {
      seen = { token, password: newPassword };
      return { ok: true };
    },
  );
  assert.deepEqual(outcome, { status: "ok" });
  assert.deepEqual(seen, {
    token: "tok_abcdefghijklmnopqrstuvwxyz",
    password: "password12",
  });
});
