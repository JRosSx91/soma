import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError } from "../../auth/client/api.js";
import {
  canConfirmDeleteAccount,
  isWrongPasswordDeleteError,
  submitDeleteAccount,
} from "./delete-account.js";
import { unauthenticatedDestination } from "../../auth/lib/unauthenticated-destination.js";
import enAccount from "../../../i18n/locales/en/account.json" with { type: "json" };
import esAccount from "../../../i18n/locales/es/account.json" with { type: "json" };

function keysOf(value: unknown, prefix = ""): string[] {
  if (value == null || typeof value !== "object") return [prefix];
  return Object.entries(value as Record<string, unknown>).flatMap(
    ([key, nested]) => keysOf(nested, prefix ? `${prefix}.${key}` : key),
  );
}

test("checkbox and password are both required before confirm is allowed", () => {
  assert.equal(
    canConfirmDeleteAccount({
      acknowledged: false,
      password: "secret12",
      submitting: false,
    }),
    false,
  );
  assert.equal(
    canConfirmDeleteAccount({
      acknowledged: true,
      password: "  ",
      submitting: false,
    }),
    false,
  );
  assert.equal(
    canConfirmDeleteAccount({
      acknowledged: true,
      password: "secret12",
      submitting: true,
    }),
    false,
  );
  assert.equal(
    canConfirmDeleteAccount({
      acknowledged: true,
      password: "secret12",
      submitting: false,
    }),
    true,
  );
});

test("wrong-password 401 is recognized without personal data", () => {
  const err = new ApiError(401, "Invalid credentials");
  assert.equal(isWrongPasswordDeleteError(err), true);
  assert.equal(
    isWrongPasswordDeleteError(new ApiError(401, "Unauthorized")),
    false,
  );
  assert.equal(isWrongPasswordDeleteError(new Error("network")), false);
  assert.equal(err.message.toLowerCase().includes("email"), false);
});

test("cancel path: submit is ignored so no deleteFn call", async () => {
  let calls = 0;
  const result = await submitDeleteAccount({
    acknowledged: false,
    password: "secret12",
    inFlight: { current: false },
    deleteFn: async () => {
      calls += 1;
    },
    onSuccess: () => undefined,
    onWrongPassword: () => undefined,
    onKeepSessionFailure: () => undefined,
  });
  assert.equal(result, "ignored");
  assert.equal(calls, 0);
});

test("wrong password keeps the session and does not call success", async () => {
  const events: string[] = [];
  const result = await submitDeleteAccount({
    acknowledged: true,
    password: "wrong-pass",
    inFlight: { current: false },
    deleteFn: async () => {
      throw new ApiError(401, "Invalid credentials");
    },
    onSuccess: () => events.push("success"),
    onWrongPassword: () => events.push("wrong"),
    onKeepSessionFailure: () => events.push("failed"),
  });
  assert.equal(result, "wrong_password");
  assert.deepEqual(events, ["wrong"]);
});

test("network error keeps the session and allows retry", async () => {
  const events: string[] = [];
  const result = await submitDeleteAccount({
    acknowledged: true,
    password: "secret12",
    inFlight: { current: false },
    deleteFn: async () => {
      throw new TypeError("Failed to fetch");
    },
    onSuccess: () => events.push("success"),
    onWrongPassword: () => events.push("wrong"),
    onKeepSessionFailure: () => events.push("failed"),
  });
  assert.equal(result, "failed");
  assert.deepEqual(events, ["failed"]);
});

test("success 204 path calls onSuccess once", async () => {
  const events: string[] = [];
  const result = await submitDeleteAccount({
    acknowledged: true,
    password: "secret12",
    inFlight: { current: false },
    deleteFn: async () => undefined,
    onSuccess: () => events.push("success"),
    onWrongPassword: () => events.push("wrong"),
    onKeepSessionFailure: () => events.push("failed"),
  });
  assert.equal(result, "success");
  assert.deepEqual(events, ["success"]);
  assert.equal(unauthenticatedDestination("account_deleted"), "/");
  assert.equal(unauthenticatedDestination(null), "/login");
});

test("double submit is ignored while in flight", async () => {
  const inFlight = { current: false };
  let started = 0;
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });

  const first = submitDeleteAccount({
    acknowledged: true,
    password: "secret12",
    inFlight,
    deleteFn: async () => {
      started += 1;
      await gate;
    },
    onSuccess: () => undefined,
    onWrongPassword: () => undefined,
    onKeepSessionFailure: () => undefined,
  });

  const second = await submitDeleteAccount({
    acknowledged: true,
    password: "secret12",
    inFlight,
    deleteFn: async () => {
      started += 1;
    },
    onSuccess: () => undefined,
    onWrongPassword: () => undefined,
    onKeepSessionFailure: () => undefined,
  });

  assert.equal(second, "ignored");
  assert.equal(started, 1);
  release();
  assert.equal(await first, "success");
  assert.equal(started, 1);
});

test("account delete copy exists in ES and EN with the same keys", () => {
  assert.deepEqual(keysOf(esAccount).sort(), keysOf(enAccount).sort());
  assert.match(enAccount.delete.title, /Delete my account/);
  assert.match(esAccount.delete.title, /Eliminar mi cuenta/);
  assert.match(esAccount.delete.confirm, /Eliminar definitivamente mi cuenta/);
  assert.match(enAccount.delete.confirm, /Permanently delete my account/);
  assert.equal(enAccount.delete.success.includes("@"), false);
  assert.equal(esAccount.delete.success.includes("@"), false);
});
