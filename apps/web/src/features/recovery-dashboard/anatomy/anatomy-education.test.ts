import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { educationalAnatomy } from "./anatomy-education.ts";
import { anatomyEducationCopyFields } from "./present-anatomy-education.ts";
import enAnatomy from "../../../i18n/locales/en/anatomy.json" with { type: "json" };
import esAnatomy from "../../../i18n/locales/es/anatomy.json" with { type: "json" };

export const respiratoryOrganIds = ["lungs", "bronchi", "nasal-mucosa"] as const;
export const centralNervousOrganIds = [
  "brain-prefrontal-cortex",
  "brain-hippocampus",
  "brain-amygdala",
  "brain-nucleus-accumbens",
  "brain-vta",
] as const;
export const digestiveOrganIds = ["stomach", "pancreas", "intestines", "oral-mucosa"] as const;

export const allCanonicalOrganIds = [
  ...respiratoryOrganIds,
  ...centralNervousOrganIds,
  ...digestiveOrganIds,
  "heart",
  "liver",
  "kidneys",
  "spleen",
  "testes",
  "ovaries",
  "skin",
  "teeth",
  "eyes",
] as const;

test("all twenty-one canonical organs keep identity and verified sources", () => {
  assert.equal(allCanonicalOrganIds.length, 21);
  for (const organId of allCanonicalOrganIds) {
    const entry = educationalAnatomy(organId);
    assert.ok(entry, organId);
    assert.equal(entry.organId, organId);
    assert.equal("anatomy" in entry, false, organId);
    assert.ok(entry.sources.length > 0, organId);
    for (const source of entry.sources) {
      assert.equal(source.verified, true, source.href);
      assert.match(source.href, /^https:\/\//);
      assert.ok(source.citation.length > 10);
    }
  }
});

test("bronchial cartilage and the alveolar barrier stay distinct in bibliography", () => {
  const lungs = educationalAnatomy("lungs");
  const bronchi = educationalAnatomy("bronchi");
  assert.ok(lungs && bronchi);
  assert.notEqual(lungs.sources, bronchi.sources);
  assert.equal(lungs.sources.every((source) => source.verified), true);
  assert.equal(bronchi.sources.every((source) => source.verified), true);
});

test("an unknown organ id does not receive another organ's sources", () => {
  assert.equal(educationalAnatomy("lungs-copy"), null);
  assert.equal(educationalAnatomy("not-an-organ"), null);

  const lungs = educationalAnatomy("lungs");
  const bronchi = educationalAnatomy("bronchi");
  const nasal = educationalAnatomy("nasal-mucosa");
  const liver = educationalAnatomy("liver");
  const kidneys = educationalAnatomy("kidneys");
  assert.ok(lungs && bronchi && nasal && liver && kidneys);
  assert.notDeepEqual(lungs.sources, bronchi.sources);
  assert.notDeepEqual(liver.sources, kidneys.sources);
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

test("the TypeScript catalog is not a second source of educational prose", () => {
  const source = readFileSync(new URL("./anatomy-education.ts", import.meta.url), "utf8");
  assert.equal(source.includes("Los pulmones alojan"), false);
  assert.equal(source.includes("The lungs house"), false);
  assert.equal(typeof esAnatomy.education.organs.lungs.anatomy, "string");
  assert.equal(typeof enAnatomy.education.organs.lungs.anatomy, "string");
  for (const field of anatomyEducationCopyFields) {
    assert.equal(field in educationalAnatomy("lungs")!, false, field);
  }
});

test("the summary uses the anatomical catalog and the other tabs stay in place", () => {
  const page = readFileSync(new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url), "utf8");
  assert.match(page, /organ-sheet\.js/);
  assert.match(page, /system-sheet\.js/);
  assert.match(page, /OrganSheetSummary/);
  assert.match(page, /SystemSheetSummary/);
  assert.match(page, /resolveSystemSheet/);
  assert.match(page, /narrative-catalog\.js/);
  assert.match(page, /recovery-catalog\.js/);
  assert.match(page, /id=\{`anatomy-tab-\$\{item\}`\}/);
  for (const tab of ["resumen", "efectos", "recuperacion", "consejos"]) {
    assert.match(page, new RegExp(`"${tab}"`));
  }
  assert.match(page, /AdvicePanel/);
  assert.equal(page.includes("advice-drafts"), false);
  assert.equal(page.includes("matchApplicableAdvice"), false);
  assert.match(page, /recoveryDisclaimer/);
  assert.match(page, /resolveEducationalRecovery/);
});
