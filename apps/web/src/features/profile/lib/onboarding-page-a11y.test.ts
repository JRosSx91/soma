import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const page = readFileSync(
  new URL("../../../pages/OnboardingPage.tsx", import.meta.url),
  "utf8",
);
const account = readFileSync(
  new URL("../../recovery-dashboard/pages/AccountPage.tsx", import.meta.url),
  "utf8",
);

test("onboarding gates special-category consent before the substance form", () => {
  assert.match(page, /needsSpecialCategoryConsent\(profile\)/);
  assert.match(page, /SpecialCategoryConsentCard/);
  assert.match(page, /onDecline=\{\(\) => \{\s*void handleSkip\(\);/s);
  assert.match(page, /errors.consentRequired/);
});

test("onboarding mode controls expose pressed state and labelled fields", () => {
  assert.match(page, /aria-pressed=\{state\.mode === "abstinent"\}/);
  assert.match(page, /aria-pressed=\{state\.mode === "active"\}/);
  assert.match(page, /role="group"/);
  assert.match(page, /aria-labelledby=\{modeLabelId\}/);
  assert.match(page, /htmlFor=\{dateId\}/);
  assert.match(page, /htmlFor=\{yearId\}/);
  assert.match(page, /htmlFor=\{frequencyId\}/);
  assert.match(page, /htmlFor=\{`onboarding-\$\{substance\.id\}-active`\}/);
  assert.match(page, /aria-invalid=\{dateInvalid \? true : undefined\}/);
  assert.match(page, /aria-invalid=\{yearInvalid \? true : undefined\}/);
  assert.match(page, /id="onboarding-form-error"/);
  assert.match(page, /previewFocus/);
  assert.match(page, /aria-busy=\{submitting \|\| undefined\}/);
});

test("account form associates field errors without duplicating general alerts", () => {
  assert.match(account, /htmlFor="account-displayName"/);
  assert.match(account, /htmlFor="account-birthYear"/);
  assert.match(account, /htmlFor="account-biologicalSex"/);
  assert.match(account, /htmlFor="account-weightKg"/);
  assert.match(account, /accountFieldFromErrorKey/);
  assert.match(account, /account-field-error/);
  assert.match(account, /account-form-error/);
  assert.match(account, /aria-invalid=\{errorField === "displayName" \? true : undefined\}/);
  assert.match(account, /errors.displayNameRequired/);
  assert.match(account, /errors.saveFailed/);
});
