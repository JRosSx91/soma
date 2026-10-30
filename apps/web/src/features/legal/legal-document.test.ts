import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { test } from "node:test";
import { isLegalNoticePublished } from "@soma/shared-types";
import enLegal from "../../i18n/locales/en/legal.json" with { type: "json" };
import esLegal from "../../i18n/locales/es/legal.json" with { type: "json" };
import { PrivacyPage, TermsPage } from "./LegalDocumentPage.js";

async function wrap(lng: "en" | "es", node: ReturnType<typeof createElement>) {
  const instance = i18n.createInstance();
  await instance.use(initReactI18next).init({
    lng,
    fallbackLng: "en",
    resources: {
      en: { legal: enLegal },
      es: { legal: esLegal },
    },
    interpolation: { escapeValue: false },
  });
  return createElement(
    I18nextProvider,
    { i18n: instance },
    createElement(MemoryRouter, { initialEntries: ["/" ] }, node),
  );
}

test("privacy and terms stay marked as drafts in ES and EN", async () => {
  assert.equal(isLegalNoticePublished(), false);
  const privacyEn = renderToStaticMarkup(
    await wrap("en", createElement(PrivacyPage)),
  );
  const privacyEs = renderToStaticMarkup(
    await wrap("es", createElement(PrivacyPage)),
  );
  const termsEn = renderToStaticMarkup(await wrap("en", createElement(TermsPage)));
  const termsEs = renderToStaticMarkup(await wrap("es", createElement(TermsPage)));

  assert.match(privacyEn, /Development draft/);
  assert.match(privacyEs, /Borrador de desarrollo/);
  assert.match(termsEn, /not a published contract/i);
  assert.match(termsEs, /no son un contrato publicado/i);
  assert.match(privacyEn, /somarecovery\.app/);
  assert.match(privacyEn, /soma\.recovery\.app@gmail\.com/);
  assert.match(privacyEn, /natural person/);
  assert.match(privacyEs, /persona física/);
  assert.match(privacyEn, /Pending review/);
  assert.match(privacyEn, /TO BE COMPLETED/);
  assert.match(privacyEs, /PENDIENTE DE COMPLETAR/);
  assert.match(privacyEn, /Render/);
  assert.match(privacyEn, /Supabase/);
  assert.match(privacyEn, /Resend/);
  assert.match(privacyEn, /Cloudflare R2/);
  assert.match(privacyEn, /GitHub Actions/);
  assert.match(privacyEs, /7 días/);
  assert.match(privacyEn, /7 days/);
  assert.match(privacyEn, /28 days/);
  assert.match(privacyEs, /28 días/);
  assert.match(privacyEn, /soma_refresh/);
  assert.match(privacyEn, /18 or over/);
  assert.match(privacyEs, /18 años/);
  assert.match(privacyEn, /Article 9/);
  assert.match(termsEn, /invitation/i);
  assert.match(termsEs, /invitación/);
  assert.match(termsEn, /no advertising/i);
  assert.match(termsEs, /sin publicidad/);
  assert.doesNotMatch(privacyEn, /this is the official privacy policy/i);
  assert.doesNotMatch(termsEn, /exclude all liability|sin ninguna responsabilidad/i);
});
