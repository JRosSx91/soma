import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { educationalAnatomy } from "./anatomy-education.ts";

const respiratoryOrganIds = ["lungs", "bronchi", "nasal-mucosa"] as const;
const centralNervousOrganIds = [
  "brain-prefrontal-cortex",
  "brain-hippocampus",
  "brain-amygdala",
  "brain-nucleus-accumbens",
  "brain-vta",
] as const;

test("the three respiratory organs have complete anatomical entries", () => {
  for (const organId of respiratoryOrganIds) {
    const entry = educationalAnatomy(organId);
    assert.ok(entry);
    assert.equal(entry.organId, organId);
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
});

test("the five central nervous organs have complete anatomical entries", () => {
  for (const organId of centralNervousOrganIds) {
    const entry = educationalAnatomy(organId);
    assert.ok(entry);
    assert.equal(entry.organId, organId);
    assert.ok(entry.location && entry.location.length > 20);
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

  const prefrontal = educationalAnatomy("brain-prefrontal-cortex");
  const hippocampus = educationalAnatomy("brain-hippocampus");
  assert.ok(prefrontal && hippocampus);
  assert.notEqual(prefrontal.anatomy, hippocampus.anatomy);
  assert.match(prefrontal.physiology, /ejecutiv/i);
  assert.match(hippocampus.anatomy, /formación hipocampal|giro dentado|CA1/i);
  assert.match(educationalAnatomy("brain-amygdala")?.anatomy ?? "", /núcleos/i);
  assert.match(educationalAnatomy("brain-nucleus-accumbens")?.anatomy ?? "", /estriado/i);
  assert.match(educationalAnatomy("brain-vta")?.location ?? "", /mesencéfalo/i);
});

test("bronchial cartilage and the alveolar barrier stay anatomically distinct", () => {
  const lungs = educationalAnatomy("lungs");
  const bronchi = educationalAnatomy("bronchi");
  assert.ok(lungs && bronchi);
  assert.match(bronchi.anatomy, /bronquios principales/);
  assert.match(bronchi.anatomy, /placas discontinuas/);
  assert.match(bronchi.anatomy, /carecen de cartílago/);
  assert.doesNotMatch(bronchi.anatomy, /Su pared lleva anillos/);
  assert.match(lungs.physiology, /epitelio alveolar/);
  assert.match(lungs.physiology, /membranas basales/);
  assert.match(lungs.physiology, /endotelio del capilar/);
  assert.match(lungs.anatomy, /carecen de cartílago/);
  assert.equal(lungs.sources.every((source) => source.verified), true);
  assert.equal(bronchi.sources.every((source) => source.verified), true);
});

test("an organ without an entry does not receive another organ's text", () => {
  assert.equal(educationalAnatomy("heart"), null);
  assert.equal(educationalAnatomy("liver"), null);
  assert.equal(educationalAnatomy("oral-mucosa"), null);
  assert.equal(educationalAnatomy("lungs-copy"), null);

  const lungs = educationalAnatomy("lungs");
  const bronchi = educationalAnatomy("bronchi");
  const nasal = educationalAnatomy("nasal-mucosa");
  assert.ok(lungs && bronchi && nasal);
  assert.notEqual(lungs.anatomy, bronchi.anatomy);
  assert.notEqual(lungs.anatomy, nasal.anatomy);
  assert.notEqual(bronchi.anatomy, nasal.anatomy);
  assert.notEqual(lungs.physiology, bronchi.physiology);
  assert.notEqual(nasal.physiology, lungs.physiology);
});

test("the anatomical catalog does not depend on personal or substance data", () => {
  const source = readFileSync(new URL("./anatomy-education.ts", import.meta.url), "utf8");
  for (const token of [
    "estimateCurve",
    "computeRecovery",
    "recoveryCeiling",
    "maxSeverity",
    "curveProgress",
    "demo-data",
    "lastUseDate",
    "daysAbstinent",
    "substanceId",
    "during_use",
    "narrative-catalog",
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

test("the summary uses the anatomical catalog and the other tabs stay in place", () => {
  const page = readFileSync(new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url), "utf8");
  assert.match(page, /organ-sheet\.js/);
  assert.match(page, /OrganSheetSummary/);
  assert.match(page, /narrative-catalog\.js/);
  assert.match(page, /recovery-catalog\.js/);
  assert.match(page, /id=\{`anatomy-tab-\$\{item\}`\}/);
  for (const tab of ["resumen", "efectos", "recuperacion", "consejos"]) {
    assert.match(page, new RegExp(`"${tab}"`));
  }
  assert.match(page, /Todavía no hay consejos para esta ficha/);
  assert.match(page, /No es una estimación personal ni un plazo médico/);
  assert.match(page, /resolveEducationalRecovery/);
});
