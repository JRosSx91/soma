import assert from "node:assert/strict";
import { test } from "node:test";
import enAuth from "../../../i18n/locales/en/auth.json" with { type: "json" };
import esAuth from "../../../i18n/locales/es/auth.json" with { type: "json" };
import { LEGAL_ADULT_AGE_VERSION, LEGAL_PRIVACY_VERSION, LEGAL_TERMS_VERSION } from "@soma/shared-types";
import { prepareRegisterCredentials } from "./registration-passwords.js";

const valid = {
  email: "user@example.com",
  password: "password12",
  confirmPassword: "password12",
  displayName: "Ada",
  biologicalSex: "female" as const,
  birthDate: "1991-04-02",
  inviteToken: "invite_token_value",
  acceptedTerms: true,
  acceptedPrivacyNotice: true,
  acceptedAdultAge: true,
  termsVersion: "ignored",
  privacyNoticeVersion: "ignored",
  adultAgeVersion: "ignored",
};

test("matching passwords yield a payload without confirmPassword", () => {
  const result = prepareRegisterCredentials(valid);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.credentials.password, "password12");
  assert.equal(result.credentials.email, "user@example.com");
  assert.equal(result.credentials.inviteToken, "invite_token_value");
  assert.equal(
    Object.prototype.hasOwnProperty.call(result.credentials, "confirmPassword"),
    false,
  );
  assert.equal(JSON.stringify(result.credentials).includes("confirmPassword"), false);
  assert.equal(
    "acceptedSpecialCategoryProcessing" in result.credentials,
    false,
  );
  assert.equal(
    "specialCategoryProcessingVersion" in result.credentials,
    false,
  );
  assert.equal("birthYear" in result.credentials, false);
  assert.equal(result.credentials.birthDate, "1991-04-02");
  assert.equal(result.credentials.acceptedAdultAge, true);
  assert.equal(result.credentials.termsVersion, LEGAL_TERMS_VERSION);
  assert.equal(result.credentials.privacyNoticeVersion, LEGAL_PRIVACY_VERSION);
  assert.equal(result.credentials.adultAgeVersion, LEGAL_ADULT_AGE_VERSION);
  assert.equal(LEGAL_TERMS_VERSION, "2026-10-31.2");
});

test("mismatched passwords do not produce credentials", () => {
  const result = prepareRegisterCredentials({
    ...valid,
    confirmPassword: "password99",
  });
  assert.deepEqual(result, {
    ok: false,
    messageKey: "register.passwordMismatch",
  });
});

test("empty confirmation does not produce credentials", () => {
  const result = prepareRegisterCredentials({
    ...valid,
    confirmPassword: "",
  });
  assert.deepEqual(result, {
    ok: false,
    messageKey: "register.passwordMismatch",
  });
});

test("short password is rejected before match", () => {
  const result = prepareRegisterCredentials({
    ...valid,
    password: "short",
    confirmPassword: "short",
  });
  assert.deepEqual(result, {
    ok: false,
    messageKey: "register.passwordTooShort",
  });
});

test("unchecked acceptances do not produce credentials", () => {
  const result = prepareRegisterCredentials({
    ...valid,
    acceptedTerms: false,
  });
  assert.deepEqual(result, {
    ok: false,
    messageKey: "register.acceptRequired",
  });
});

test("privacy-only uncheck still blocks registration", () => {
  const result = prepareRegisterCredentials({
    ...valid,
    acceptedPrivacyNotice: false,
  });
  assert.deepEqual(result, {
    ok: false,
    messageKey: "register.acceptRequired",
  });
});

test("unchecked adult-age declaration blocks registration", () => {
  const result = prepareRegisterCredentials({
    ...valid,
    acceptedAdultAge: false,
  });
  assert.deepEqual(result, {
    ok: false,
    messageKey: "register.acceptRequired",
  });
});

test("a birth date that cannot yet be 18 is rejected", () => {
  const year = new Date().getFullYear() - 1;
  const result = prepareRegisterCredentials({
    ...valid,
    birthDate: `${year}-12-31`,
  });
  assert.deepEqual(result, {
    ok: false,
    messageKey: "register.ageRestricted",
  });
});

test("register mismatch copy exists in Spanish and English", () => {
  assert.equal(esAuth.register.passwordMismatch, "Las contraseñas no coinciden");
  assert.equal(enAuth.register.passwordMismatch, "Passwords do not match");
  assert.equal(esAuth.register.confirmPassword, "Confirmar contraseña");
  assert.equal(enAuth.register.confirmPassword, "Confirm password");
});
