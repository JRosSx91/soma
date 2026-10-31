import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { test } from "node:test";
import {
  isLegalNoticePublished,
  LEGAL_NOTICE_STATUS,
  LEGAL_PRIVACY_VERSION,
  LEGAL_TERMS_VERSION,
} from "@soma/shared-types";
import enLegal from "../../i18n/locales/en/legal.json" with { type: "json" };
import esLegal from "../../i18n/locales/es/legal.json" with { type: "json" };
import {
  CookiesPage,
  LegalNoticePage,
  PrivacyPage,
  TermsPage,
} from "./LegalDocumentPage.js";

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (value == null || typeof value !== "object") return prefix ? [prefix] : [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    flattenKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
}

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

test("ES and EN legal catalogs share the same keys", () => {
  assert.deepEqual(flattenKeys(esLegal).sort(), flattenKeys(enLegal).sort());
  for (const key of flattenKeys(esLegal)) {
    const es = key.split(".").reduce<unknown>((acc, part) => {
      if (acc == null || typeof acc !== "object") return undefined;
      return (acc as Record<string, unknown>)[part];
    }, esLegal);
    const en = key.split(".").reduce<unknown>((acc, part) => {
      if (acc == null || typeof acc !== "object") return undefined;
      return (acc as Record<string, unknown>)[part];
    }, enLegal);
    assert.equal(typeof es, "string", key);
    assert.equal(typeof en, "string", key);
    assert.ok((es as string).length > 0, key);
    assert.ok((en as string).length > 0, key);
  }
});

test("legal notices stay marked as drafts in ES and EN", async () => {
  assert.equal(LEGAL_NOTICE_STATUS, "draft");
  assert.equal(isLegalNoticePublished(), false);
  assert.equal(LEGAL_TERMS_VERSION.startsWith("draft-"), true);
  assert.equal(LEGAL_PRIVACY_VERSION.startsWith("draft-"), true);

  const privacyEn = renderToStaticMarkup(
    await wrap("en", createElement(PrivacyPage)),
  );
  const privacyEs = renderToStaticMarkup(
    await wrap("es", createElement(PrivacyPage)),
  );
  const termsEn = renderToStaticMarkup(await wrap("en", createElement(TermsPage)));
  const termsEs = renderToStaticMarkup(await wrap("es", createElement(TermsPage)));
  const noticeEn = renderToStaticMarkup(
    await wrap("en", createElement(LegalNoticePage)),
  );
  const noticeEs = renderToStaticMarkup(
    await wrap("es", createElement(LegalNoticePage)),
  );
  const cookiesEn = renderToStaticMarkup(
    await wrap("en", createElement(CookiesPage)),
  );
  const cookiesEs = renderToStaticMarkup(
    await wrap("es", createElement(CookiesPage)),
  );

  assert.match(privacyEn, /Development draft/);
  assert.match(privacyEs, /Borrador de desarrollo/);
  assert.match(termsEn, /not a published contract/i);
  assert.match(termsEs, /no son un contrato publicado/i);
  assert.match(noticeEn, /natural person/);
  assert.match(noticeEs, /persona física/);
  assert.match(privacyEn, /somarecovery\.app/);
  assert.match(privacyEn, /\[CORREO DE CONTACTO\]/);
  assert.match(privacyEs, /\[CORREO DE CONTACTO\]/);
  assert.match(privacyEn, /\[NOMBRE DEL RESPONSABLE\]/);
  assert.match(privacyEs, /\[DOMICILIO A EFECTOS LEGALES\]/);
  assert.doesNotMatch(privacyEn, /soma\.recovery\.app@gmail\.com/);
  assert.doesNotMatch(privacyEs, /soma\.recovery\.app@gmail\.com/);
  assert.match(privacyEn, /has not confirmed those safeguards/);
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
  assert.match(privacyEn, /date of birth/);
  assert.match(privacyEs, /fecha de nacimiento/);
  assert.match(privacyEn, /identity document/);
  assert.match(privacyEs, /documento de identidad/);
  assert.match(termsEn, /false date/);
  assert.match(termsEs, /fecha falsa/);
  assert.match(privacyEn, /Article 9/);
  assert.match(privacyEs, /artículo 9/);
  assert.match(privacyEn, /id="privacy-special"/);
  assert.match(privacyEn, /id="privacy-bases"/);
  assert.match(privacyEn, /contextual/);
  assert.match(privacyEs, /contextual/);
  assert.doesNotMatch(privacyEn, /current registration checkboxes are valid explicit consent/i);
  assert.doesNotMatch(privacyEs, /casillas actuales del registro basten/);
  assert.match(privacyEn, /not requested at registration/i);
  assert.match(privacyEs, /no se pide en el registro/i);
  assert.match(privacyEn, /not a complete export/i);
  assert.match(privacyEs, /no una exportación completa/i);
  assert.match(privacyEn, /does not instantly erase backups/i);
  assert.match(privacyEs, /no elimina.*copias de seguridad de forma instantánea/s);
  assert.match(termsEn, /invitation/i);
  assert.match(termsEs, /invitación/);
  assert.match(termsEn, /no advertising/i);
  assert.match(termsEs, /sin publicidad/);
  assert.match(termsEn, /DEMO/);
  assert.match(termsEs, /demo/i);
  assert.match(noticeEn, /does not describe a commercial company/i);
  assert.match(noticeEs, /No describe una sociedad mercantil/);
  assert.match(cookiesEn, /soma\.i18n\.lang/);
  assert.match(cookiesEs, /soma\.landing-v2\.intro\.seen/);
  assert.match(cookiesEn, /does not introduce a cookie-consent banner/i);
  assert.match(cookiesEs, /no introduce un banner de consentimiento/i);
  assert.match(noticeEn, /href="\/privacy"/);
  assert.match(cookiesEs, /href="\/legal"/);
  assert.doesNotMatch(privacyEn, /this is the official privacy policy/i);
  assert.doesNotMatch(termsEn, /exclude all liability|sin ninguna responsabilidad/i);
});
