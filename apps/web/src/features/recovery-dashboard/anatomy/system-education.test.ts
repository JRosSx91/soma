import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { educationalSystem } from "./system-education.ts";
import { educationalAnatomy } from "./anatomy-education.ts";
import esAnatomy from "../../../i18n/locales/es/anatomy.json" with { type: "json" };

const emptySystemIds = ["endocrine", "nervous-peripheral"] as const;

test("endocrine and peripheral nervous systems have complete system fichas", () => {
  for (const systemId of emptySystemIds) {
    const entry = educationalSystem(systemId);
    assert.ok(entry, systemId);
    assert.equal(entry.systemId, systemId);
    assert.equal("anatomy" in entry, false, systemId);
    assert.ok(entry.sources.length > 0);
    for (const source of entry.sources) {
      assert.equal(source.verified, true);
      assert.match(source.href, /^https:\/\//);
      assert.ok(source.citation.length > 10);
    }
  }

  const endocrine = educationalSystem("endocrine");
  const pns = educationalSystem("nervous-peripheral");
  assert.ok(endocrine && pns);
  assert.notDeepEqual(endocrine.sources, pns.sources);
  assert.match(esAnatomy.education.systems.endocrine.anatomy, /hipófisis|hipotálamo|hormona/i);
  assert.match(esAnatomy.education.systems.endocrine.physiology, /retroalimentación|eje|estrés/i);
  assert.match(esAnatomy.education.systems["nervous-peripheral"].anatomy, /craneales|espinales|autónomo|somático/i);
  assert.match(esAnatomy.education.systems["nervous-peripheral"].physiology, /aferent|eferent|simpático|parasimpático/i);
});

test("system education does not invent organ ids or borrow organ prose", () => {
  assert.equal(educationalSystem("respiratory"), null);
  assert.equal(educationalSystem("digestive"), null);
  assert.equal(educationalSystem("not-a-system"), null);

  const endocrine = educationalSystem("endocrine");
  assert.ok(endocrine);
  assert.ok(educationalAnatomy("pancreas"));
  assert.doesNotMatch(esAnatomy.education.systems.endocrine.anatomy, /OrganId|brain-prefrontal/i);
});

test("system education stays free of personal recovery and substance catalogs", () => {
  const source = readFileSync(new URL("./system-education.ts", import.meta.url), "utf8");
  for (const token of [
    "estimateCurve",
    "computeRecovery",
    "narrative-catalog",
    "recovery-catalog",
    "demo-data",
    "daysAbstinent",
    "substanceId",
    "nicotina",
    "cannabis",
    "cocaína",
    "abstinencia",
    "consumo",
    "%",
  ]) {
    assert.equal(source.toLowerCase().includes(token.toLowerCase()), false, token);
  }
});
