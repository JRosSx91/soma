import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertPasswordResetMailerForRuntime,
  createPasswordResetMailer,
  DisabledPasswordResetMailer,
  MemoryPasswordResetMailer,
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
