import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  PASSWORD_RESET_BOOTSTRAP_KEY,
  captureAndStripResetToken,
  clearHeldPasswordResetToken,
  isPasswordLongEnough,
  isValidEmailFormat,
  passwordsMatch,
  resetHeldPasswordResetTokenForTests,
  takePasswordResetToken,
} from "./password-reset-validation.js";

afterEach(() => {
  resetHeldPasswordResetTokenForTests();
});

test("isValidEmailFormat accepts basic addresses and rejects junk", () => {
  assert.equal(isValidEmailFormat("user@example.com"), true);
  assert.equal(isValidEmailFormat("  user@example.com  "), true);
  assert.equal(isValidEmailFormat(""), false);
  assert.equal(isValidEmailFormat("not-an-email"), false);
  assert.equal(isValidEmailFormat("@example.com"), false);
});

test("password helpers enforce length and match", () => {
  assert.equal(isPasswordLongEnough("short"), false);
  assert.equal(isPasswordLongEnough("longenough"), true);
  assert.equal(passwordsMatch("abcdefghi", "abcdefghi"), true);
  assert.equal(passwordsMatch("abcdefghi", "other"), false);
  assert.equal(passwordsMatch("", ""), false);
});

test("captureAndStripResetToken removes token from URL and returns it", () => {
  const replaced: string[] = [];
  const token = captureAndStripResetToken(
    "?token=abc_secret_token_value&x=1",
    (url) => replaced.push(url),
    "/reset-password",
    "",
  );
  assert.equal(token, "abc_secret_token_value");
  assert.deepEqual(replaced, ["/reset-password?x=1"]);
});

test("captureAndStripResetToken returns null when token absent", () => {
  const replaced: string[] = [];
  const token = captureAndStripResetToken(
    "?x=1",
    (url) => replaced.push(url),
    "/reset-password",
    "",
  );
  assert.equal(token, null);
  assert.equal(replaced.length, 0);
});

test("captureAndStripResetToken never writes to persistent storage", () => {
  const store = new Map<string, string>();
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, String(v));
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear(),
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    value: storage,
    configurable: true,
  });

  const secret = "tok_should_not_persist_anywhere_12345";
  const captured = captureAndStripResetToken(
    `?token=${secret}`,
    () => undefined,
    "/reset-password",
    "",
  );
  assert.equal(captured, secret);
  assert.equal(store.size, 0);
  assert.equal(localStorage.getItem("token"), null);
  assert.equal(sessionStorage.getItem("token"), null);
  for (const value of store.values()) {
    assert.equal(value.includes(secret), false);
  }
});

test("takePasswordResetToken prefers HTML bootstrap and survives remount", () => {
  const secret = "tok_bootstrap_survives_strict_mode";
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      [PASSWORD_RESET_BOOTSTRAP_KEY]: secret,
      history: { replaceState: () => undefined },
      location: { pathname: "/reset-password", hash: "", search: "" },
    },
  });

  const first = takePasswordResetToken("");
  const second = takePasswordResetToken(""); // StrictMode remount / empty search
  assert.equal(first, secret);
  assert.equal(second, secret);
  assert.equal(
    (globalThis.window as { [PASSWORD_RESET_BOOTSTRAP_KEY]?: string })[
      PASSWORD_RESET_BOOTSTRAP_KEY
    ],
    undefined,
  );

  clearHeldPasswordResetToken();
  assert.equal(takePasswordResetToken(""), null);
});

test("takePasswordResetToken falls back to URL strip once", () => {
  const replaced: string[] = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      history: {
        replaceState: (_s: unknown, _t: string, url: string) => {
          replaced.push(String(url));
        },
      },
      location: {
        pathname: "/reset-password",
        hash: "",
        search: "?token=from_query_token_value",
      },
    },
  });

  const first = takePasswordResetToken("?token=from_query_token_value");
  const second = takePasswordResetToken("");
  assert.equal(first, "from_query_token_value");
  assert.equal(second, "from_query_token_value");
  assert.ok(replaced.some((u) => !u.includes("token=")));
});
