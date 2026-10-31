import assert from "node:assert/strict";
import { test } from "node:test";
import {
  RegistrationModeError,
  resolveRegistrationMode,
} from "./registration-mode.js";

test("non-production defaults to open when unset", () => {
  assert.equal(resolveRegistrationMode({ NODE_ENV: "test" }), "open");
  assert.equal(resolveRegistrationMode({ NODE_ENV: "development" }), "open");
});

test("explicit open and invite are accepted", () => {
  assert.equal(
    resolveRegistrationMode({ AUTH_REGISTRATION_MODE: "open" }),
    "open",
  );
  assert.equal(
    resolveRegistrationMode({ AUTH_REGISTRATION_MODE: "INVITE" }),
    "invite",
  );
});

test("production requires an explicit open or invite mode", () => {
  assert.throws(
    () => resolveRegistrationMode({ NODE_ENV: "production" }),
    (err: unknown) => {
      assert.ok(err instanceof RegistrationModeError);
      assert.match(err.message, /open" or "invite"/);
      return true;
    },
  );
  assert.equal(
    resolveRegistrationMode({
      NODE_ENV: "production",
      AUTH_REGISTRATION_MODE: "open",
    }),
    "open",
  );
  assert.equal(
    resolveRegistrationMode({
      NODE_ENV: "production",
      AUTH_REGISTRATION_MODE: "invite",
    }),
    "invite",
  );
});

test("unknown values are rejected in every environment", () => {
  assert.throws(
    () =>
      resolveRegistrationMode({
        NODE_ENV: "test",
        AUTH_REGISTRATION_MODE: "closed",
      }),
    RegistrationModeError,
  );
  assert.throws(
    () =>
      resolveRegistrationMode({
        NODE_ENV: "production",
        AUTH_REGISTRATION_MODE: "maybe",
      }),
    RegistrationModeError,
  );
});
