import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { educationalSystem } from "./system-education.ts";
import { educationalAnatomy } from "./anatomy-education.ts";

const emptySystemIds = ["endocrine", "nervous-peripheral"] as const;

test("endocrine and peripheral nervous systems have complete system fichas", () => {
  for (const systemId of emptySystemIds) {
    const entry = educationalSystem(systemId);
    assert.ok(entry, systemId);
    assert.equal(entry.systemId, systemId);
    assert.ok(entry.location.length > 20);
    assert.ok(entry.anatomy.length > 40);
    assert.ok(entry.physiology.length > 40);
    assert.ok(entry.relations.length > 40);
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
  assert.match(endocrine.anatomy, /hipófisis|hipotálamo|hormona/i);
  assert.match(endocrine.physiology, /retroalimentación|eje|estrés/i);
  assert.match(pns.anatomy, /craneales|espinales|autónomo|somático/i);
  assert.match(pns.physiology, /aferent|eferent|simpático|parasimpático/i);
  assert.notEqual(endocrine.anatomy, pns.anatomy);
});

test("system education does not invent organ ids or borrow organ prose", () => {
  assert.equal(educationalSystem("respiratory"), null);
  assert.equal(educationalSystem("digestive"), null);
  assert.equal(educationalSystem("not-a-system"), null);

  const endocrine = educationalSystem("endocrine");
  assert.ok(endocrine);
  assert.equal(educationalAnatomy("pancreas")?.anatomy === endocrine.anatomy, false);
  assert.doesNotMatch(endocrine.anatomy, /OrganId|brain-prefrontal/i);
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
