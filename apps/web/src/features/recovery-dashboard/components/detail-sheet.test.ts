import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import i18n from "i18next";
import { test } from "node:test";
import caCommon from "../../../i18n/locales/ca/common.json" with { type: "json" };
import deCommon from "../../../i18n/locales/de/common.json" with { type: "json" };
import enCommon from "../../../i18n/locales/en/common.json" with { type: "json" };
import esCommon from "../../../i18n/locales/es/common.json" with { type: "json" };
import euCommon from "../../../i18n/locales/eu/common.json" with { type: "json" };
import frCommon from "../../../i18n/locales/fr/common.json" with { type: "json" };
import glCommon from "../../../i18n/locales/gl/common.json" with { type: "json" };
import itCommon from "../../../i18n/locales/it/common.json" with { type: "json" };
import { resolveInterfaceLanguage } from "../../../i18n/interface-languages.ts";

test("detail sheet close label is localized in spanish and english", () => {
  assert.equal(esCommon.close, "Cerrar");
  assert.equal(enCommon.close, "Close");
  const sheet = readFileSync(new URL("./DetailSheet.tsx", import.meta.url), "utf8");
  assert.match(sheet, /useTranslation\("common"\)/);
  assert.match(sheet, /\{t\("close"\)\}/);
  assert.equal(sheet.includes(">Cerrar<"), false);
  assert.match(sheet, /shrink-0 items-start/);
  assert.match(sheet, /overflow-y-auto/);
  assert.match(sheet, /aria-modal="true"/);
  assert.match(sheet, /event\.key !== "Tab"/);
  assert.match(sheet, /summary/);
  assert.match(sheet, /focusin/);
  assert.match(sheet, /a\[href\]/);
  assert.match(sheet, /openerRef/);
});

test("inactive locale common bundles fall back to english close instead of the key", async () => {
  assert.equal("close" in esCommon, true);
  assert.equal("close" in enCommon, true);
  const unpublished = {
    ca: caCommon,
    gl: glCommon,
    eu: euCommon,
    fr: frCommon,
    it: itCommon,
    de: deCommon,
  } as const;
  for (const [lng, bundle] of Object.entries(unpublished)) {
    assert.equal("close" in bundle, false, lng);
    assert.equal(resolveInterfaceLanguage(lng) === "es" || resolveInterfaceLanguage(lng) === "en", true);
  }
  assert.equal(resolveInterfaceLanguage("ca"), "es");
  assert.equal(resolveInterfaceLanguage("fr"), "en");

  const instance = i18n.createInstance();
  await instance.init({
    lng: "ca",
    fallbackLng: "en",
    defaultNS: "common",
    resources: {
      ca: { common: caCommon },
      en: { common: enCommon },
    },
    interpolation: { escapeValue: false },
  });
  assert.equal(instance.t("close"), "Close");
  assert.notEqual(instance.t("close"), "close");
});
