import assert from "node:assert/strict";
import { test } from "node:test";
import {
  INTERFACE_LANGUAGES,
  isInterfaceLanguage,
  resolveInterfaceLanguage,
} from "./interface-languages.ts";

test("the interface only offers spanish and english", () => {
  assert.deepEqual([...INTERFACE_LANGUAGES], ["es", "en"]);
  assert.equal(isInterfaceLanguage("es"), true);
  assert.equal(isInterfaceLanguage("en"), true);
  assert.equal(isInterfaceLanguage("ca"), false);
  assert.equal(isInterfaceLanguage("de"), false);
});

test("unpublished iberian preferences fall back to spanish", () => {
  assert.equal(resolveInterfaceLanguage("es"), "es");
  assert.equal(resolveInterfaceLanguage("es-ES"), "es");
  assert.equal(resolveInterfaceLanguage("ca"), "es");
  assert.equal(resolveInterfaceLanguage("gl-ES"), "es");
  assert.equal(resolveInterfaceLanguage("eu"), "es");
});

test("other unpublished preferences fall back to english", () => {
  assert.equal(resolveInterfaceLanguage("en"), "en");
  assert.equal(resolveInterfaceLanguage("en-US"), "en");
  assert.equal(resolveInterfaceLanguage("fr"), "en");
  assert.equal(resolveInterfaceLanguage("it-IT"), "en");
  assert.equal(resolveInterfaceLanguage("de"), "en");
  assert.equal(resolveInterfaceLanguage("pt"), "en");
});
