import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import en from "../../../i18n/locales/en/knowledge.json" with { type: "json" };
import es from "../../../i18n/locales/es/knowledge.json" with { type: "json" };
import { KNOWLEDGE_PREDICATES } from "./knowledge-types.ts";

function leafKeys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object") return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    leafKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

function leafValues(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (!value || typeof value !== "object") return [];
  return Object.values(value).flatMap(leafValues);
}

test("knowledge copy has complete ES/EN parity and non-empty values", () => {
  assert.deepEqual(leafKeys(es).sort(), leafKeys(en).sort());
  for (const value of [...leafValues(es), ...leafValues(en)]) {
    assert.notEqual(value.trim(), "");
  }
  for (const predicate of KNOWLEDGE_PREDICATES) {
    assert.equal(predicate in es.predicates, true, predicate);
    assert.equal(predicate in en.predicates, true, predicate);
  }
});

test("knowledge namespace is registered with explicit ES/EN resources", () => {
  const config = readFileSync(new URL("../../../i18n/config.ts", import.meta.url), "utf8");
  assert.match(config, /import enKnowledge from "\.\/locales\/en\/knowledge\.json"/);
  assert.match(config, /import esKnowledge from "\.\/locales\/es\/knowledge\.json"/);
  assert.match(config, /"knowledge",\s*\n\s*\],/);
  assert.equal((config.match(/knowledge: enKnowledge,/g) ?? []).length, 7);
  assert.equal((config.match(/knowledge: esKnowledge,/g) ?? []).length, 1);
});
