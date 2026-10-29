import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { TFunction } from "i18next";
import { educationalAnatomy } from "./anatomy-education.ts";
import { educationalSystem } from "./system-education.ts";
import {
  anatomyEducationCopyFields,
  anatomyOrganEducationCopy,
  anatomySystemEducationCopy,
  localizeAnatomyCitation,
} from "./present-anatomy-education.ts";
import { allCanonicalOrganIds } from "./anatomy-education.test.ts";
import enAnatomy from "../../../i18n/locales/en/anatomy.json" with { type: "json" };
import esAnatomy from "../../../i18n/locales/es/anatomy.json" with { type: "json" };

const emptySystemIds = ["endocrine", "nervous-peripheral"] as const;
const spanishResidue = /(?:\blos\b|\blas\b|\buna\b|\bhacia\b|\bórgano\b|bronquios|hipocampo|mesencéfalo|fotorreceptores|fotoreceptores)/i;

function tFromBundle(bundle: typeof esAnatomy): TFunction {
  return ((key: string, options?: Record<string, unknown>) => {
    let cursor: unknown = bundle;
    for (const part of key.split(".")) {
      if (cursor == null || typeof cursor !== "object") {
        cursor = undefined;
        break;
      }
      cursor = (cursor as Record<string, unknown>)[part];
    }
    if (typeof cursor !== "string") {
      return typeof options?.defaultValue === "string" ? options.defaultValue : "";
    }
    return cursor.replace(/\{\{(\w+)\}\}/g, (_match, name: string) => {
      const value = options?.[name];
      return value == null ? _match : String(value);
    });
  }) as TFunction;
}

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (value == null || typeof value !== "object") return prefix ? [prefix] : [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    flattenKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
}

test("spanish and english education bundles cover twenty-one organs and two systems", () => {
  assert.deepEqual(Object.keys(esAnatomy.education.organs).sort(), [...allCanonicalOrganIds].sort());
  assert.deepEqual(
    Object.keys(esAnatomy.education.organs).sort(),
    Object.keys(enAnatomy.education.organs).sort(),
  );
  assert.deepEqual(Object.keys(esAnatomy.education.systems).sort(), [...emptySystemIds].sort());
  assert.deepEqual(
    Object.keys(esAnatomy.education.systems).sort(),
    Object.keys(enAnatomy.education.systems).sort(),
  );
  assert.deepEqual(
    flattenKeys(esAnatomy.education).sort(),
    flattenKeys(enAnatomy.education).sort(),
  );
});

test("each educational sheet has four non-empty fields in spanish and english", () => {
  for (const organId of allCanonicalOrganIds) {
    const es = esAnatomy.education.organs[organId];
    const en = enAnatomy.education.organs[organId];
    assert.ok(es, organId);
    assert.ok(en, organId);
    for (const field of anatomyEducationCopyFields) {
      assert.equal(typeof es[field], "string", `${organId}.${field}.es`);
      assert.equal(typeof en[field], "string", `${organId}.${field}.en`);
      assert.ok(es[field].trim().length > 20, `${organId}.${field}.es`);
      assert.ok(en[field].trim().length > 20, `${organId}.${field}.en`);
      assert.notEqual(es[field], en[field], `${organId}.${field}`);
      assert.notEqual(es[field], `education.organs.${organId}.${field}`);
    }
  }
  for (const systemId of emptySystemIds) {
    const es = esAnatomy.education.systems[systemId];
    const en = enAnatomy.education.systems[systemId];
    for (const field of anatomyEducationCopyFields) {
      assert.ok(es[field].trim().length > 20, `${systemId}.${field}.es`);
      assert.ok(en[field].trim().length > 20, `${systemId}.${field}.en`);
      assert.notEqual(es[field], en[field], `${systemId}.${field}`);
    }
  }
});

test("english educational copy does not leave spanish anatomy prose visible", () => {
  for (const organId of allCanonicalOrganIds) {
    for (const field of anatomyEducationCopyFields) {
      assert.equal(
        spanishResidue.test(enAnatomy.education.organs[organId][field]),
        false,
        `${organId}.${field}`,
      );
    }
  }
  for (const systemId of emptySystemIds) {
    for (const field of anatomyEducationCopyFields) {
      assert.equal(
        spanishResidue.test(enAnatomy.education.systems[systemId][field]),
        false,
        `${systemId}.${field}`,
      );
    }
  }
  assert.match(esAnatomy.education.organs.eyes.anatomy, /fotorreceptores/);
  assert.match(esAnatomy.education.organs.eyes.physiology, /fotorreceptores/);
  assert.equal(esAnatomy.education.organs.eyes.anatomy.includes("fotoreceptores"), false);
});

test("scientific distinctions survive in both languages", () => {
  assert.match(esAnatomy.education.organs.bronchi.anatomy, /bronquios principales/);
  assert.match(esAnatomy.education.organs.bronchi.anatomy, /placas discontinuas/);
  assert.match(esAnatomy.education.organs.bronchi.anatomy, /carecen de cartílago/);
  assert.match(enAnatomy.education.organs.bronchi.anatomy, /main bronchi/);
  assert.match(enAnatomy.education.organs.bronchi.anatomy, /discontinuous plates/);
  assert.match(enAnatomy.education.organs.bronchi.anatomy, /lack cartilage/);
  assert.match(esAnatomy.education.organs.lungs.physiology, /epitelio alveolar/);
  assert.match(enAnatomy.education.organs.lungs.physiology, /alveolar epithelium/);
  assert.match(esAnatomy.education.organs["brain-vta"].physiology, /no «decide» sola/i);
  assert.match(enAnatomy.education.organs["brain-vta"].physiology, /does not .decide. on its own/i);
  assert.match(esAnatomy.education.organs["brain-nucleus-accumbens"].physiology, /centro del placer/);
  assert.match(enAnatomy.education.organs["brain-nucleus-accumbens"].physiology, /pleasure centre/);
  assert.match(esAnatomy.education.organs["brain-hippocampus"].physiology, /se asocian/);
  assert.match(enAnatomy.education.organs["brain-hippocampus"].physiology, /are associated/);
  assert.match(esAnatomy.education.systems.endocrine.anatomy, /hipófisis|hipotálamo|hormona/i);
  assert.match(enAnatomy.education.systems.endocrine.anatomy, /pituitary|hypothalamus|hormone/i);
});

test("i18n resolves organ and system copy without borrowing keys", () => {
  const tes = tFromBundle(esAnatomy);
  const ten = tFromBundle(enAnatomy);
  const lungsEs = anatomyOrganEducationCopy(tes, "lungs");
  const lungsEn = anatomyOrganEducationCopy(ten, "lungs");
  assert.ok(lungsEs && lungsEn);
  assert.match(lungsEs.anatomy, /alvéolos/);
  assert.match(lungsEn.anatomy, /alveoli/);
  assert.equal(anatomyOrganEducationCopy(tes, "not-an-organ"), null);
  const endocrineEs = anatomySystemEducationCopy(tes, "endocrine");
  const endocrineEn = anatomySystemEducationCopy(ten, "endocrine");
  assert.ok(endocrineEs && endocrineEn);
  assert.notEqual(endocrineEs.anatomy, endocrineEn.anatomy);
  assert.equal(anatomySystemEducationCopy(tes, "respiratory"), null);
});

test("bibliographic hrefs and verified flags stay on the TypeScript catalog", () => {
  const lungs = educationalAnatomy("lungs");
  assert.ok(lungs);
  assert.equal(
    lungs.sources[0]?.href,
    "https://openstax.org/books/anatomy-and-physiology-2e/pages/22-1-organs-and-structures-of-the-respiratory-system",
  );
  assert.equal(lungs.sources[0]?.verified, true);
  assert.match(lungs.sources[0]?.citation ?? "", /Sección 22\.1/);
  const tes = tFromBundle(esAnatomy);
  const ten = tFromBundle(enAnatomy);
  assert.equal(
    localizeAnatomyCitation(lungs.sources[0]!.citation, tes),
    "OpenStax. Anatomy and Physiology 2e. Sección 22.1, Organs and Structures of the Respiratory System.",
  );
  assert.equal(
    localizeAnatomyCitation(lungs.sources[0]!.citation, ten),
    "OpenStax. Anatomy and Physiology 2e. Section 22.1, Organs and Structures of the Respiratory System.",
  );

  const hypothalamus = educationalSystem("endocrine")?.sources.find((source) =>
    source.citation.includes("NBK535380"),
  );
  assert.ok(hypothalamus);
  assert.match(hypothalamus.citation, /Actualización del 1 de mayo de 2023/);
  assert.equal(
    localizeAnatomyCitation(hypothalamus.citation, tes),
    "Shahid Z, Asuka E, Singh G. Physiology, Hypothalamus. StatPearls, NCBI Bookshelf. Actualización del 1 de mayo de 2023. NBK535380.",
  );
  assert.equal(
    localizeAnatomyCitation(hypothalamus.citation, ten),
    "Shahid Z, Asuka E, Singh G. Physiology, Hypothalamus. StatPearls, NCBI Bookshelf. Updated 1 May 2023. NBK535380.",
  );
  assert.match(hypothalamus.citation, /Actualización del 1 de mayo de 2023/);
  assert.equal(hypothalamus.verified, true);

  const kenhub = educationalAnatomy("bronchi")?.sources.find((source) =>
    source.citation.includes("Kenhub"),
  );
  assert.ok(kenhub);
  assert.match(kenhub.citation, /Revisión del 12 de octubre de 2026/);
  assert.equal(
    localizeAnatomyCitation(kenhub.citation, tes),
    "Crumbie L, Mytilinaios D. Histology of the lower respiratory tract. Kenhub. Revisión del 12 de octubre de 2026.",
  );
  assert.equal(
    localizeAnatomyCitation(kenhub.citation, ten),
    "Crumbie L, Mytilinaios D. Histology of the lower respiratory tract. Kenhub. Revised 12 October 2026.",
  );
  assert.match(kenhub.citation, /Revisión del 12 de octubre de 2026/);

  const endocrine = educationalSystem("endocrine");
  assert.ok(endocrine);
  assert.equal(endocrine.sources.every((source) => source.verified), true);
  assert.equal(esAnatomy.education.citation.section, "Sección");
  assert.equal(enAnatomy.education.citation.section, "Section");
  assert.equal(esAnatomy.education.citation.updated, "Actualización del");
  assert.equal(enAnatomy.education.citation.updated, "Updated");
  assert.equal(esAnatomy.education.citation.revision, "Revisión del");
  assert.equal(enAnatomy.education.citation.revision, "Revised");
});

test("summaries resolve education copy from the anatomy namespace", () => {
  const summary = readFileSync(new URL("../components/OrganSheetSummary.tsx", import.meta.url), "utf8");
  assert.match(summary, /anatomyOrganEducationCopy/);
  assert.match(summary, /anatomySystemEducationCopy/);
  assert.match(summary, /localizeAnatomyCitation/);
  assert.equal(summary.includes("education.anatomy"), false);
  assert.equal(summary.includes("sheet.location"), false);
});
