import assert from "node:assert/strict";
import { test } from "node:test";
import { refreshCookieOptions } from "./refresh-cookie.js";

test("refresh cookie is always HttpOnly with path /auth", () => {
  const prevEnv = process.env.NODE_ENV;
  const prevSecure = process.env.AUTH_COOKIE_SECURE;
  const prevSame = process.env.AUTH_COOKIE_SAMESITE;
  try {
    process.env.NODE_ENV = "development";
    delete process.env.AUTH_COOKIE_SECURE;
    delete process.env.AUTH_COOKIE_SAMESITE;
    const options = refreshCookieOptions();
    assert.equal(options.httpOnly, true);
    assert.equal(options.path, "/auth");
  } finally {
    process.env.NODE_ENV = prevEnv;
    process.env.AUTH_COOKIE_SECURE = prevSecure;
    process.env.AUTH_COOKIE_SAMESITE = prevSame;
  }
});

test("SameSite=None forces Secure", () => {
  const prevSecure = process.env.AUTH_COOKIE_SECURE;
  const prevSame = process.env.AUTH_COOKIE_SAMESITE;
  try {
    process.env.AUTH_COOKIE_SAMESITE = "none";
    process.env.AUTH_COOKIE_SECURE = "false";
    const options = refreshCookieOptions();
    assert.equal(options.sameSite, "none");
    assert.equal(options.secure, true);
  } finally {
    process.env.AUTH_COOKIE_SECURE = prevSecure;
    process.env.AUTH_COOKIE_SAMESITE = prevSame;
  }
});
