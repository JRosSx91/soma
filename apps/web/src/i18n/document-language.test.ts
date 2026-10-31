import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  INTERFACE_LANGUAGE_STORAGE_KEY,
  syncDocumentLanguage,
} from "./document-language.ts";
import { resolveInterfaceLanguage } from "./interface-languages.ts";

test("syncDocumentLanguage writes a valid es or en html lang", () => {
  const previous = globalThis.document;
  const html = { lang: "en" };
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { documentElement: html },
  });
  try {
    syncDocumentLanguage("es-ES");
    assert.equal(html.lang, "es");
    syncDocumentLanguage("en-GB");
    assert.equal(html.lang, "en");
    syncDocumentLanguage("ca");
    assert.equal(html.lang, resolveInterfaceLanguage("ca"));
    assert.equal(html.lang, "es");
    syncDocumentLanguage("de");
    assert.equal(html.lang, "en");
  } finally {
    if (previous === undefined) {
      Reflect.deleteProperty(globalThis, "document");
    } else {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: previous,
      });
    }
  }
});

test("i18n init keeps html lang in sync without a second language store", () => {
  const config = readFileSync(new URL("./config.ts", import.meta.url), "utf8");
  const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
  assert.match(config, /lookupLocalStorage:\s*INTERFACE_LANGUAGE_STORAGE_KEY/);
  assert.match(config, /syncDocumentLanguage/);
  assert.match(config, /i18n\.on\("languageChanged", applyInterfaceLanguage\)/);
  assert.match(config, /INTERFACE_LANGUAGE_STORAGE_KEY/);
  assert.equal(INTERFACE_LANGUAGE_STORAGE_KEY, "soma.i18n.lang");
  assert.match(html, /soma\.i18n\.lang/);
  assert.match(html, /document\.documentElement\.lang/);
  assert.match(html, /navigator\.languages && navigator\.languages\[0\]/);
  assert.match(html, /es: 1, ca: 1, gl: 1, eu: 1/);
});

test("interface mapping matches persisted ES/EN, missing, and invalid preferences", () => {
  assert.equal(resolveInterfaceLanguage("es"), "es");
  assert.equal(resolveInterfaceLanguage("es-ES"), "es");
  assert.equal(resolveInterfaceLanguage("en"), "en");
  assert.equal(resolveInterfaceLanguage("en-GB"), "en");
  assert.equal(resolveInterfaceLanguage(""), "en");
  assert.equal(resolveInterfaceLanguage("not-a-locale"), "en");
  assert.equal(resolveInterfaceLanguage("fr"), "en");
  assert.equal(resolveInterfaceLanguage("ca"), "es");
});
