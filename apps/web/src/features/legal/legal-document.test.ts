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
import { LegalDocumentPage, PrivacyPage } from "./LegalDocumentPage.js";
import type { LegalControllerFields } from "./legal-controller.js";

const PUBLISHED_CONTROLLER: LegalControllerFields = {
  name: "Ada Example",
  address: "",
  email: "legal@example.test",
  taxId: "",
  phone: "",
  dpo: "",
};

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

test("legal notices are published in ES and EN when the controller is present", async () => {
  assert.equal(LEGAL_NOTICE_STATUS, "published");
  assert.equal(isLegalNoticePublished(), true);
  assert.equal(LEGAL_TERMS_VERSION.startsWith("draft-"), false);
  assert.equal(LEGAL_PRIVACY_VERSION.startsWith("draft-"), false);
  assert.equal(LEGAL_TERMS_VERSION, "2026-10-31.2");
  assert.equal(LEGAL_PRIVACY_VERSION, "2026-10-31.2");

  const unpublishedEn = renderToStaticMarkup(
    await wrap("en", createElement(PrivacyPage)),
  );
  assert.match(unpublishedEn, /Development draft/);
  assert.match(unpublishedEn, /\[NOMBRE DEL RESPONSABLE\]/);
  assert.match(unpublishedEn, /\[CORREO DE CONTACTO\]/);
  assert.doesNotMatch(unpublishedEn, /\[DOMICILIO A EFECTOS LEGALES\]/);

  const privacyEn = renderToStaticMarkup(
    await wrap(
      "en",
      createElement(LegalDocumentPage, {
        kind: "privacy",
        controller: PUBLISHED_CONTROLLER,
      }),
    ),
  );
  const privacyEs = renderToStaticMarkup(
    await wrap(
      "es",
      createElement(LegalDocumentPage, {
        kind: "privacy",
        controller: PUBLISHED_CONTROLLER,
      }),
    ),
  );
  const termsEn = renderToStaticMarkup(
    await wrap(
      "en",
      createElement(LegalDocumentPage, {
        kind: "terms",
        controller: PUBLISHED_CONTROLLER,
      }),
    ),
  );
  const termsEs = renderToStaticMarkup(
    await wrap(
      "es",
      createElement(LegalDocumentPage, {
        kind: "terms",
        controller: PUBLISHED_CONTROLLER,
      }),
    ),
  );
  const noticeEn = renderToStaticMarkup(
    await wrap(
      "en",
      createElement(LegalDocumentPage, {
        kind: "notice",
        controller: PUBLISHED_CONTROLLER,
      }),
    ),
  );
  const noticeEs = renderToStaticMarkup(
    await wrap(
      "es",
      createElement(LegalDocumentPage, {
        kind: "notice",
        controller: PUBLISHED_CONTROLLER,
      }),
    ),
  );
  const cookiesEn = renderToStaticMarkup(
    await wrap(
      "en",
      createElement(LegalDocumentPage, {
        kind: "cookies",
        controller: PUBLISHED_CONTROLLER,
      }),
    ),
  );
  const cookiesEs = renderToStaticMarkup(
    await wrap(
      "es",
      createElement(LegalDocumentPage, {
        kind: "cookies",
        controller: PUBLISHED_CONTROLLER,
      }),
    ),
  );

  assert.doesNotMatch(privacyEn, /Development draft/);
  assert.doesNotMatch(privacyEs, /Borrador de desarrollo/);
  assert.match(privacyEn, /Ada Example/);
  assert.match(privacyEs, /Ada Example/);
  assert.match(privacyEn, /legal@example\.test/);
  assert.match(privacyEs, /legal@example\.test/);
  assert.match(termsEn, /public beta/i);
  assert.match(termsEs, /beta pública/);
  assert.match(noticeEn, /natural person/);
  assert.match(noticeEs, /persona física/);
  assert.match(privacyEn, /somarecovery\.app/);
  assert.doesNotMatch(privacyEn, /\[CORREO DE CONTACTO\]/);
  assert.doesNotMatch(privacyEs, /\[CORREO DE CONTACTO\]/);
  assert.doesNotMatch(privacyEn, /\[NOMBRE DEL RESPONSABLE\]/);
  assert.doesNotMatch(privacyEs, /\[DOMICILIO A EFECTOS LEGALES\]/);
  assert.doesNotMatch(privacyEn, /\[DOMICILIO A EFECTOS LEGALES\]/);
  assert.doesNotMatch(privacyEn, /soma\.recovery\.app@gmail\.com/);
  assert.doesNotMatch(privacyEs, /soma\.recovery\.app@gmail\.com/);
  assert.match(privacyEn, /Frankfurt/);
  assert.match(privacyEs, /Fráncfort/);
  assert.match(privacyEn, /United Kingdom/);
  assert.match(privacyEs, /Reino Unido/);
  assert.match(privacyEn, /adequacy decision/i);
  assert.match(privacyEs, /decisión de adecuación/);
  assert.match(privacyEn, /WEUR/);
  assert.match(privacyEs, /WEUR/);
  assert.match(privacyEn, /standard contractual clauses/i);
  assert.match(privacyEs, /cláusulas contractuales tipo/);
  assert.match(privacyEn, /does not state that the controller has executed/i);
  assert.match(privacyEs, /No afirma que el responsable haya formalizado/);
  assert.doesNotMatch(privacyEn, /TO BE COMPLETED/);
  assert.doesNotMatch(privacyEs, /PENDIENTE DE COMPLETAR/);
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
  assert.match(termsEn, /Registration is open/i);
  assert.match(termsEs, /registro está abierto/);
  assert.doesNotMatch(termsEn, /invitation/i);
  assert.doesNotMatch(termsEs, /invitación/);
  assert.doesNotMatch(termsEn, /production registration stays closed/i);
  assert.doesNotMatch(termsEs, /registro en producción permanece cerrado/);
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
