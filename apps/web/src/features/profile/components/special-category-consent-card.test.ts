import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { test } from "node:test";
import enAccount from "../../../i18n/locales/en/account.json" with { type: "json" };
import esAccount from "../../../i18n/locales/es/account.json" with { type: "json" };
import { SpecialCategoryConsentCard } from "./SpecialCategoryConsentCard.js";

async function makeI18n(lng: "en" | "es") {
  const i18n = createInstance();
  await i18n.use(initReactI18next).init({
    lng,
    fallbackLng: "en",
    resources: {
      en: { account: enAccount },
      es: { account: esAccount },
    },
    defaultNS: "account",
    interpolation: { escapeValue: false },
  });
  return i18n;
}

function wrap(node: ReactNode, i18n: Awaited<ReturnType<typeof makeI18n>>) {
  return createElement(
    I18nextProvider,
    { i18n },
    createElement(MemoryRouter, { initialEntries: ["/onboarding"] }, node),
  );
}

test("consent card explains purpose, stays unchecked, and does not grant locally", async () => {
  const i18n = await makeI18n("en");
  const html = renderToStaticMarkup(
    wrap(
      createElement(SpecialCategoryConsentCard, { onGranted: () => undefined }),
      i18n,
    ),
  );
  assert.match(html, /Save your path/);
  assert.match(html, /substances you choose/);
  assert.match(html, /It is voluntary/);
  assert.match(html, /withdraw this permission later/);
  assert.match(html, /Educational content stays available/);
  assert.match(html, /Allow saving my data/);
  assert.match(html, /Not now/);
  assert.match(html, /id="special-category-consent-accept"/);
  assert.doesNotMatch(html, /type="checkbox"[^>]*checked/);
  assert.match(html, /disabled/);
  assert.doesNotMatch(html, /AUTH_SPECIAL_CATEGORY/);
  assert.doesNotMatch(html, /localStorage/);
});

test("Spanish copy covers the same consent facts", async () => {
  const i18n = await makeI18n("es");
  const html = renderToStaticMarkup(
    wrap(
      createElement(SpecialCategoryConsentCard, {
        onGranted: () => undefined,
        withdrawn: true,
      }),
      i18n,
    ),
  );
  assert.match(html, /Guardar tu recorrido/);
  assert.match(html, /Permitir guardar mis datos/);
  assert.match(html, /Ahora no/);
  assert.match(html, /no recupera los datos/);
  assert.doesNotMatch(html, /no está implementado/);
});

test("card posts the grant endpoint and refreshes after success", () => {
  const src = readFileSync(
    new URL("./SpecialCategoryConsentCard.tsx", import.meta.url),
    "utf8",
  );
  assert.match(src, /grantSpecialCategoryConsent/);
  assert.match(src, /onGranted/);
  assert.equal(src.includes("localStorage"), false);
  assert.equal(src.includes("sessionStorage"), false);
});

test("onboarding, account and LIVE empty states reuse the same card", () => {
  const onboarding = readFileSync(
    new URL("../../../pages/OnboardingPage.tsx", import.meta.url),
    "utf8",
  );
  const account = readFileSync(
    new URL("../../recovery-dashboard/pages/AccountPage.tsx", import.meta.url),
    "utf8",
  );
  const recovery = readFileSync(
    new URL("../../recovery-dashboard/pages/RecoveryPage.tsx", import.meta.url),
    "utf8",
  );
  const home = readFileSync(
    new URL("../../recovery-dashboard/components/PreviewHome.tsx", import.meta.url),
    "utf8",
  );
  const journal = readFileSync(
    new URL("../../recovery-dashboard/pages/JournalPage.tsx", import.meta.url),
    "utf8",
  );
  const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");
  assert.match(onboarding, /SpecialCategoryConsentCard/);
  assert.match(onboarding, /skipOnboardingWithoutClearingUsages/);
  assert.match(account, /SpecialCategoryConsentCard/);
  assert.match(recovery, /SpecialCategoryConsentCard/);
  assert.match(home, /SpecialCategoryConsentCard/);
  assert.match(journal, /SpecialCategoryConsentCard/);
  assert.doesNotMatch(app, /path="consent"/);
  assert.doesNotMatch(onboarding, /navigate\("\/consent"/);
});
