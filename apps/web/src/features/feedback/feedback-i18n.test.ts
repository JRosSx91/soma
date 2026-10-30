import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  FEEDBACK_CATEGORY_IDS,
  FEEDBACK_STATUS_IDS,
} from "@soma/shared-types";
import enFeedback from "../../i18n/locales/en/feedback.json" with { type: "json" };
import esFeedback from "../../i18n/locales/es/feedback.json" with { type: "json" };

const config = readFileSync(new URL("../../i18n/config.ts", import.meta.url), "utf8");

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (value == null || typeof value !== "object") return prefix ? [prefix] : [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    flattenKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
}

test("ES and EN feedback catalogs share the same keys", () => {
  assert.deepEqual(flattenKeys(esFeedback).sort(), flattenKeys(enFeedback).sort());
  for (const key of flattenKeys(esFeedback)) {
    const es = key.split(".").reduce<unknown>((acc, part) => {
      if (acc == null || typeof acc !== "object") return undefined;
      return (acc as Record<string, unknown>)[part];
    }, esFeedback);
    const en = key.split(".").reduce<unknown>((acc, part) => {
      if (acc == null || typeof acc !== "object") return undefined;
      return (acc as Record<string, unknown>)[part];
    }, enFeedback);
    assert.equal(typeof es, "string", key);
    assert.equal(typeof en, "string", key);
    assert.ok((es as string).length > 0, key);
    assert.ok((en as string).length > 0, key);
  }
});

test("feedback copy covers the approved form, history and notices", () => {
  assert.equal(esFeedback.pageTitle, "Ayuda y sugerencias");
  assert.equal(enFeedback.pageTitle, "Help and suggestions");
  assert.equal(esFeedback.headline, "Tu voz también forma parte de Soma");
  assert.equal(enFeedback.headline, "Your voice is part of Soma too");
  assert.equal(esFeedback.categories.bug, "Error");
  assert.equal(esFeedback.categories.suggestion, "Sugerencia");
  assert.equal(esFeedback.categories.general, "Comentario general");
  assert.equal(esFeedback.historyTitle, "Tus mensajes");
  assert.equal(enFeedback.historyTitle, "Your messages");
  assert.deepEqual(Object.keys(esFeedback.categories).sort(), [...FEEDBACK_CATEGORY_IDS].sort());
  assert.deepEqual(Object.keys(enFeedback.categories).sort(), [...FEEDBACK_CATEGORY_IDS].sort());
  assert.deepEqual(Object.keys(esFeedback.statuses).sort(), [...FEEDBACK_STATUS_IDS].sort());
  assert.deepEqual(Object.keys(enFeedback.statuses).sort(), [...FEEDBACK_STATUS_IDS].sort());
  assert.match(esFeedback.intro, /no es un canal médico/i);
  assert.match(enFeedback.intro, /not a medical channel/i);
  assert.match(esFeedback.privacy, /no es una ficha clínica/i);
  assert.match(enFeedback.privacy, /not a clinical record/i);
  assert.match(esFeedback.demoNotice, /no se guarda/i);
  assert.match(enFeedback.demoNotice, /nothing is saved/i);
  assert.match(esFeedback.withdrawnNotice, /no introduzcas información personal/i);
  assert.match(enFeedback.withdrawnNotice, /do not include personal information/i);
  assert.match(esFeedback.duplicate, /24 horas/);
  assert.match(enFeedback.duplicate, /24 hours/);
  assert.match(esFeedback.confirmation, /hemos recibido/i);
  assert.match(enFeedback.confirmation, /we have received/i);
  assert.equal(typeof esFeedback.empty, "string");
  assert.equal(typeof esFeedback.errors.network, "string");
  assert.equal(typeof esFeedback.errors.title, "string");
  assert.equal(typeof esFeedback.errors.body, "string");
  assert.equal(esFeedback.submit.includes("médic"), false);
  assert.equal(enFeedback.submit.toLowerCase().includes("doctor"), false);
});

test("i18n config registers the feedback namespace with EN fallbacks", () => {
  assert.match(config, /"feedback"/);
  assert.match(config, /enFeedback/);
  assert.match(config, /esFeedback/);
  assert.match(config, /feedback: enFeedback/);
});
