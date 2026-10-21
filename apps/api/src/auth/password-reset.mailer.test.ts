import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertPasswordResetMailerForRuntime,
  createPasswordResetMailer,
  DisabledPasswordResetMailer,
  MemoryPasswordResetMailer,
  ResendPasswordResetMailer,
  UnconfiguredPasswordResetMailer,
} from "./password-reset.mailer.js";

test("createPasswordResetMailer defaults to memory outside production", () => {
  const prevNode = process.env.NODE_ENV;
  const prevMode = process.env.AUTH_PASSWORD_RESET_MAILER;
  try {
    process.env.NODE_ENV = "test";
    delete process.env.AUTH_PASSWORD_RESET_MAILER;
    const mailer = createPasswordResetMailer();
    assert.ok(mailer instanceof MemoryPasswordResetMailer);
    assert.equal(mailer.canAcceptSend(), true);
  } finally {
    process.env.NODE_ENV = prevNode;
    process.env.AUTH_PASSWORD_RESET_MAILER = prevMode;
  }
});

test("production rejects memory/log/unconfigured mailers at bootstrap", () => {
  const prevNode = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "production";
    assert.throws(
      () => assertPasswordResetMailerForRuntime(new MemoryPasswordResetMailer()),
      /not allowed in production/,
    );
    assert.throws(
      () =>
        assertPasswordResetMailerForRuntime(new UnconfiguredPasswordResetMailer()),
      /not allowed in production/,
    );
    assert.doesNotThrow(() =>
      assertPasswordResetMailerForRuntime(new DisabledPasswordResetMailer()),
    );
  } finally {
    process.env.NODE_ENV = prevNode;
  }
});

test("disabled mailer cannot accept send", () => {
  const mailer = new DisabledPasswordResetMailer();
  assert.equal(mailer.canAcceptSend(), false);
});

test("production unset mode yields unconfigured mailer instance", () => {
  const prevNode = process.env.NODE_ENV;
  const prevMode = process.env.AUTH_PASSWORD_RESET_MAILER;
  try {
    process.env.NODE_ENV = "production";
    delete process.env.AUTH_PASSWORD_RESET_MAILER;
    const mailer = createPasswordResetMailer();
    assert.ok(mailer instanceof UnconfiguredPasswordResetMailer);
    assert.throws(() => assertPasswordResetMailerForRuntime(mailer));
  } finally {
    process.env.NODE_ENV = prevNode;
    process.env.AUTH_PASSWORD_RESET_MAILER = prevMode;
  }
});

test("resend without credentials falls back to disabled", () => {
  const prevMode = process.env.AUTH_PASSWORD_RESET_MAILER;
  const prevKey = process.env.RESEND_API_KEY;
  const prevFrom = process.env.PASSWORD_RESET_FROM_EMAIL;
  try {
    process.env.AUTH_PASSWORD_RESET_MAILER = "resend";
    delete process.env.RESEND_API_KEY;
    delete process.env.PASSWORD_RESET_FROM_EMAIL;
    const mailer = createPasswordResetMailer();
    assert.ok(mailer instanceof DisabledPasswordResetMailer);
    assert.equal(mailer.canAcceptSend(), false);
  } finally {
    process.env.AUTH_PASSWORD_RESET_MAILER = prevMode;
    process.env.RESEND_API_KEY = prevKey;
    process.env.PASSWORD_RESET_FROM_EMAIL = prevFrom;
  }
});

test("resend with credentials yields provider mailer allowed in production", () => {
  const prevNode = process.env.NODE_ENV;
  const prevMode = process.env.AUTH_PASSWORD_RESET_MAILER;
  const prevKey = process.env.RESEND_API_KEY;
  const prevFrom = process.env.PASSWORD_RESET_FROM_EMAIL;
  try {
    process.env.NODE_ENV = "production";
    process.env.AUTH_PASSWORD_RESET_MAILER = "resend";
    process.env.RESEND_API_KEY = "re_test_placeholder";
    process.env.PASSWORD_RESET_FROM_EMAIL = "Soma <noreply@example.com>";
    const mailer = createPasswordResetMailer();
    assert.ok(mailer instanceof ResendPasswordResetMailer);
    assert.equal(mailer.canAcceptSend(), true);
    assert.doesNotThrow(() => assertPasswordResetMailerForRuntime(mailer));
  } finally {
    process.env.NODE_ENV = prevNode;
    process.env.AUTH_PASSWORD_RESET_MAILER = prevMode;
    process.env.RESEND_API_KEY = prevKey;
    process.env.PASSWORD_RESET_FROM_EMAIL = prevFrom;
  }
});

test("ResendPasswordResetMailer maps HTTP errors without leaking the URL", async () => {
  const prevKey = process.env.RESEND_API_KEY;
  const prevFrom = process.env.PASSWORD_RESET_FROM_EMAIL;
  const originalFetch = globalThis.fetch;
  try {
    process.env.RESEND_API_KEY = "re_test_placeholder";
    process.env.PASSWORD_RESET_FROM_EMAIL = "Soma <noreply@example.com>";
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ message: "bad", url: "secret" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;

    const mailer = new ResendPasswordResetMailer();
    const secretUrl =
      "http://localhost:5173/reset-password?token=super_secret_token_value";
    await assert.rejects(
      () =>
        mailer.sendPasswordReset({
          to: "user@example.com",
          resetUrl: secretUrl,
        }),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.match(err.message, /status 502/);
        assert.equal(err.message.includes(secretUrl), false);
        assert.equal(err.message.includes("super_secret"), false);
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
    process.env.RESEND_API_KEY = prevKey;
    process.env.PASSWORD_RESET_FROM_EMAIL = prevFrom;
  }
});

test("ResendPasswordResetMailer maps network failures without leaking the URL", async () => {
  const prevKey = process.env.RESEND_API_KEY;
  const prevFrom = process.env.PASSWORD_RESET_FROM_EMAIL;
  const originalFetch = globalThis.fetch;
  try {
    process.env.RESEND_API_KEY = "re_test_placeholder";
    process.env.PASSWORD_RESET_FROM_EMAIL = "Soma <noreply@example.com>";
    globalThis.fetch = (async () => {
      throw new TypeError("fetch failed");
    }) as typeof fetch;

    const mailer = new ResendPasswordResetMailer();
    const secretUrl =
      "http://localhost:5173/reset-password?token=super_secret_token_value";
    await assert.rejects(
      () =>
        mailer.sendPasswordReset({
          to: "user@example.com",
          resetUrl: secretUrl,
        }),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        assert.match(err.message, /network/i);
        assert.equal(err.message.includes(secretUrl), false);
        return true;
      },
    );
  } finally {
    globalThis.fetch = originalFetch;
    process.env.RESEND_API_KEY = prevKey;
    process.env.PASSWORD_RESET_FROM_EMAIL = prevFrom;
  }
});
