import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError } from "../client/api.js";
import { translateAuthError } from "./translate-error.js";
import esAuth from "../../../i18n/locales/es/auth.json" with { type: "json" };
import enAuth from "../../../i18n/locales/en/auth.json" with { type: "json" };

test("AUTH_REGISTRATION_UNAVAILABLE maps to generic ES/EN copy", () => {
  const err = new ApiError(
    403,
    "Registration is unavailable",
    "AUTH_REGISTRATION_UNAVAILABLE",
  );
  const es = translateAuthError(
    err,
    ((key: string) => {
      const parts = key.split(".");
      let cur: unknown = esAuth;
      for (const part of parts) {
        cur = (cur as Record<string, unknown>)[part];
      }
      return String(cur);
    }) as never,
    "errors.registrationFailed",
  );
  const en = translateAuthError(
    err,
    ((key: string) => {
      const parts = key.split(".");
      let cur: unknown = enAuth;
      for (const part of parts) {
        cur = (cur as Record<string, unknown>)[part];
      }
      return String(cur);
    }) as never,
    "errors.registrationFailed",
  );
  assert.equal(
    es,
    "Esta invitación no es válida o el registro no está disponible",
  );
  assert.equal(
    en,
    "This invitation is invalid or registration is unavailable",
  );
  assert.equal(es.toLowerCase().includes("caduc"), false);
  assert.equal(en.toLowerCase().includes("expired"), false);
  assert.equal(en.toLowerCase().includes("revoked"), false);
});
