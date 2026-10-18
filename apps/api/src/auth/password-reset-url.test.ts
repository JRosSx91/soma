import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildPasswordResetUrl,
  PasswordResetUrlError,
  resolveAppPublicOrigin,
} from "./password-reset-url.js";

test("resolveAppPublicOrigin rejects missing and invalid values", () => {
  const prev = process.env.APP_PUBLIC_URL;
  const prevNode = process.env.NODE_ENV;
  try {
    delete process.env.APP_PUBLIC_URL;
    assert.throws(() => resolveAppPublicOrigin(), PasswordResetUrlError);

    process.env.APP_PUBLIC_URL = "not-a-url";
    assert.throws(() => resolveAppPublicOrigin(), PasswordResetUrlError);

    process.env.NODE_ENV = "production";
    process.env.APP_PUBLIC_URL = "http://example.com";
    assert.throws(() => resolveAppPublicOrigin(), PasswordResetUrlError);

    process.env.APP_PUBLIC_URL = "https://app.example.com/";
    assert.equal(resolveAppPublicOrigin(), "https://app.example.com");
  } finally {
    process.env.APP_PUBLIC_URL = prev;
    process.env.NODE_ENV = prevNode;
  }
});

test("buildPasswordResetUrl uses configured origin only", () => {
  const prev = process.env.APP_PUBLIC_URL;
  const prevNode = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "development";
    process.env.APP_PUBLIC_URL = "http://localhost:5173";
    const url = buildPasswordResetUrl("tok_abc");
    assert.equal(
      url,
      "http://localhost:5173/reset-password?token=tok_abc",
    );
  } finally {
    process.env.APP_PUBLIC_URL = prev;
    process.env.NODE_ENV = prevNode;
  }
});
