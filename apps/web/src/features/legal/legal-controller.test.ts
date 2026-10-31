import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { test } from "node:test";
import { LEGAL_NOTICE_STATUS } from "@soma/shared-types";
import enLegal from "../../i18n/locales/en/legal.json" with { type: "json" };
import esLegal from "../../i18n/locales/es/legal.json" with { type: "json" };
import {
  applyLegalControllerCopy,
  areLegalDocumentsPublishable,
  hasRequiredLegalController,
  LEGAL_CONTROLLER_MARKERS,
  type LegalControllerFields,
} from "./legal-controller.js";
import { LegalDocumentPage } from "./LegalDocumentPage.js";

const SAMPLE: LegalControllerFields = {
  name: "Ada Example",
  address: "Calle Ficticia 1, 28001 Madrid",
  email: "legal@example.test",
  taxId: "",
  phone: "",
  dpo: "",
};

const MARKER_SNIPPETS = [
  LEGAL_CONTROLLER_MARKERS.name,
  LEGAL_CONTROLLER_MARKERS.address,
  LEGAL_CONTROLLER_MARKERS.email,
  LEGAL_CONTROLLER_MARKERS.taxIdEs,
  LEGAL_CONTROLLER_MARKERS.taxIdEn,
  LEGAL_CONTROLLER_MARKERS.phoneEs,
  LEGAL_CONTROLLER_MARKERS.phoneEn,
  LEGAL_CONTROLLER_MARKERS.dpoEs,
  LEGAL_CONTROLLER_MARKERS.dpoEn,
];

async function wrap(
  lng: "en" | "es",
  node: ReturnType<typeof createElement>,
) {
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
    createElement(MemoryRouter, { initialEntries: ["/"] }, node),
  );
}

test("required name, address and email replace the same markers in ES and EN", () => {
  const es = applyLegalControllerCopy(esLegal.privacy.identityBody, SAMPLE);
  const en = applyLegalControllerCopy(enLegal.privacy.identityBody, SAMPLE);

  assert.match(es, /Ada Example/);
  assert.match(en, /Ada Example/);
  assert.match(es, /Calle Ficticia 1, 28001 Madrid/);
  assert.match(en, /Calle Ficticia 1, 28001 Madrid/);
  assert.match(es, /legal@example\.test/);
  assert.match(en, /legal@example\.test/);
  assert.doesNotMatch(es, /\[NOMBRE DEL RESPONSABLE\]/);
  assert.doesNotMatch(en, /\[NOMBRE DEL RESPONSABLE\]/);
  assert.doesNotMatch(es, /\[DOMICILIO A EFECTOS LEGALES\]/);
  assert.doesNotMatch(en, /\[DOMICILIO A EFECTOS LEGALES\]/);
  assert.doesNotMatch(es, /\[CORREO DE CONTACTO\]/);
  assert.doesNotMatch(en, /\[CORREO DE CONTACTO\]/);
});

test("optional NIF, phone and DPO are omitted when empty", () => {
  const es = applyLegalControllerCopy(esLegal.notice.contactBody, SAMPLE);
  const en = applyLegalControllerCopy(enLegal.notice.contactBody, SAMPLE);
  const esId = applyLegalControllerCopy(esLegal.notice.identityBody, SAMPLE);
  const enId = applyLegalControllerCopy(enLegal.notice.identityBody, SAMPLE);

  assert.doesNotMatch(es, /Teléfono:/);
  assert.doesNotMatch(en, /Telephone:/);
  assert.doesNotMatch(es, /Delegado de protección de datos:/);
  assert.doesNotMatch(en, /Data protection officer:/);
  assert.doesNotMatch(es, /\[TELÉFONO/);
  assert.doesNotMatch(en, /\[TELÉFONO/);
  assert.doesNotMatch(es, /\[DELEGADO/);
  assert.doesNotMatch(en, /\[DELEGADO/);
  assert.doesNotMatch(esId, /\[NIF/);
  assert.doesNotMatch(enId, /\[NIF/);
  assert.doesNotMatch(es, /no designado/);
  assert.doesNotMatch(en, /not appointed/);
});

test("optional fields appear as text when provided", () => {
  const filled: LegalControllerFields = {
    ...SAMPLE,
    taxId: "00000000T",
    phone: "+34 600 000 000",
    dpo: "DPO Example",
  };
  const es = applyLegalControllerCopy(esLegal.notice.contactBody, filled);
  const en = applyLegalControllerCopy(enLegal.notice.contactBody, filled);
  const esId = applyLegalControllerCopy(esLegal.notice.identityBody, filled);

  assert.match(es, /\+34 600 000 000/);
  assert.match(en, /\+34 600 000 000/);
  assert.match(es, /DPO Example/);
  assert.match(en, /DPO Example/);
  assert.match(esId, /00000000T/);
});

test("missing required fields keep documents unpublishable even if status is published", () => {
  assert.equal(LEGAL_NOTICE_STATUS, "draft");
  assert.equal(hasRequiredLegalController(SAMPLE), true);
  assert.equal(areLegalDocumentsPublishable("draft", SAMPLE), false);
  assert.equal(
    areLegalDocumentsPublishable("published", {
      name: "",
      address: SAMPLE.address,
      email: SAMPLE.email,
      taxId: "",
      phone: "",
      dpo: "",
    }),
    false,
  );
  assert.equal(areLegalDocumentsPublishable("published", SAMPLE), true);
});

test("a published status without required env still renders as draft", async () => {
  const incomplete: LegalControllerFields = {
    name: "",
    address: "",
    email: "",
    taxId: "",
    phone: "",
    dpo: "",
  };
  const html = renderToStaticMarkup(
    await wrap(
      "en",
      createElement(LegalDocumentPage, {
        kind: "privacy",
        controller: incomplete,
        noticeStatus: "published",
      }),
    ),
  );
  assert.match(html, /Development draft/);
  assert.match(html, /\[NOMBRE DEL RESPONSABLE\]/);
  assert.equal(areLegalDocumentsPublishable("published", incomplete), false);
});

test("published documents do not show leftover controller markers", async () => {
  const es = renderToStaticMarkup(
    await wrap(
      "es",
      createElement(LegalDocumentPage, {
        kind: "privacy",
        controller: SAMPLE,
        noticeStatus: "published",
      }),
    ),
  );
  const en = renderToStaticMarkup(
    await wrap(
      "en",
      createElement(LegalDocumentPage, {
        kind: "privacy",
        controller: SAMPLE,
        noticeStatus: "published",
      }),
    ),
  );

  assert.doesNotMatch(es, /Borrador de desarrollo/);
  assert.doesNotMatch(en, /Development draft/);
  for (const marker of MARKER_SNIPPETS) {
    assert.equal(es.includes(marker), false, marker);
    assert.equal(en.includes(marker), false, marker);
  }
  assert.doesNotMatch(es, /\[PENDIENTE DE COMPLETAR\]/);
  assert.doesNotMatch(en, /\[TO BE COMPLETED\]/);
  assert.match(es, /Ada Example/);
  assert.match(en, /Ada Example/);
});

test("controller values are escaped as text, not executed as HTML", async () => {
  const payload: LegalControllerFields = {
    name: `<img src=x onerror=alert(1)> & "Ada"`,
    address: "Calle <script>alert(1)</script>",
    email: "a@b.test",
    taxId: "",
    phone: "",
    dpo: "",
  };
  const html = renderToStaticMarkup(
    await wrap(
      "en",
      createElement(LegalDocumentPage, {
        kind: "notice",
        controller: payload,
        noticeStatus: "draft",
      }),
    ),
  );

  assert.doesNotMatch(html, /<img src=x onerror=alert\(1\)>/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.match(html, /&amp;/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});
