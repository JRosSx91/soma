import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  RELAPSE_PREVENTION_CLINICAL_STATUS,
  RELAPSE_PREVENTION_CONTENT_VERSION,
  RELAPSE_PREVENTION_DRAFT_ID,
  RELAPSE_PREVENTION_EDITORIAL_STATUS,
  RELAPSE_PREVENTION_PUBLICATION_GATE,
  RELAPSE_PREVENTION_PUBLICATION_STATUS,
  getRelapsePreventionDraftContent,
  relapsePreventionDraftContent,
} from "./support-relapse-draft-content.js";
import { resolveSupportStrategyQueryParam } from "./support-strategies.js";

test("relapse prevention draft stays unpublished and off the query allow-list", () => {
  assert.equal(RELAPSE_PREVENTION_DRAFT_ID, "relapse.prevention");
  assert.equal(RELAPSE_PREVENTION_CONTENT_VERSION, "0.1.1");
  assert.equal(RELAPSE_PREVENTION_PUBLICATION_STATUS, "unpublished");
  assert.equal(RELAPSE_PREVENTION_PUBLICATION_GATE, "pending_independent_authorization");
  assert.equal(RELAPSE_PREVENTION_EDITORIAL_STATUS, "editorial_review_done");
  assert.equal(RELAPSE_PREVENTION_CLINICAL_STATUS, "pending");
  assert.equal(resolveSupportStrategyQueryParam(RELAPSE_PREVENTION_DRAFT_ID), null);
  assert.equal(resolveSupportStrategyQueryParam("relapse"), null);
  assert.equal(resolveSupportStrategyQueryParam("relapse.prevention"), null);

  const publishedCatalog = readFileSync(
    new URL("./support-strategy-content.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(publishedCatalog, /relapse\.prevention/);
  assert.doesNotMatch(publishedCatalog, /"relapse"/);
});

test("draft sheet has ES/EN parity and required educational sections", () => {
  for (const lng of ["es", "en"] as const) {
    const content = getRelapsePreventionDraftContent(lng);
    assert.ok(content.title.trim());
    assert.ok(content.intro.length >= 2);
    assert.ok(content.understand.length >= 3);
    assert.ok(content.options.length >= 5);
    assert.ok(content.precautions.length >= 4);
    assert.ok(content.professional.length >= 2);
    assert.ok(content.references.length >= 6);
    for (const ref of content.references) {
      assert.match(ref.refId, /^REF-/);
      assert.ok(ref.organization.trim());
      assert.ok(ref.title.trim());
    }
  }

  const es = relapsePreventionDraftContent.es;
  const en = relapsePreventionDraftContent.en;
  assert.equal(es.title, "Cómo prevenir y afrontar una recaída");
  assert.equal(en.title, "How to prevent and cope with relapse");
  assert.equal(es.options.length, en.options.length);
  assert.equal(es.references.length, en.references.length);
  assert.deepEqual(
    es.references.map((item) => item.refId),
    en.references.map((item) => item.refId),
  );
  assert.match(es.options[0]!.body, /craving/);
  assert.match(es.options[0]!.body, /deseo intenso o impulso/);
  assert.match(es.options[1]!.body, /más vulnerable/);
  assert.match(es.options[1]!.body, /aumenta mis ganas de consumir/);
  assert.match(es.options[3]!.title, /Buscar apoyo en otras personas/);
  assert.match(es.options[4]!.title, /prioriza tu seguridad/i);
  assert.match(es.options[4]!.body, /sobredosis/);
  assert.match(en.options[4]!.body, /overdose/i);
  assert.match(es.understand.join("\n"), /evitarlas todas/);
  assert.match(es.understand.join("\n"), /opioides/);
  assert.match(en.understand.join("\n"), /opioids/i);
  assert.doesNotMatch(es.options.map((item) => item.body).join("\n"), /Beber agua|comer algo|dormir/);
  assert.doesNotMatch(en.options.map((item) => item.body).join("\n"), /Drink water|eat something|sleep if you can/i);
  assert.doesNotMatch(es.understand.join("\n"), /importa tanto como la abstinencia/);
  assert.doesNotMatch(en.understand.join("\n"), /matters as much as any single stretch of abstinence/i);
  assert.match(
    es.references.map((item) => item.href).join("\n"),
    /NBK601486|opioid-overdose|stop-overdose\/response/,
  );
});

test("editorial register documents unpublished status after editorial review", () => {
  const sheet = readFileSync(
    new URL(
      "../../../../../../docs/review/support/sup-02b-relapse-prevention.md",
      import.meta.url,
    ),
    "utf8",
  );
  const refs = readFileSync(
    new URL(
      "../../../../../../docs/review/support/sup-02b-references.md",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(sheet, /publicationStatus.*unpublished/i);
  assert.match(sheet, /editorial_review_done/);
  assert.match(sheet, /Cómo prevenir y afrontar una recaída/);
  assert.match(sheet, /How to prevent and cope with relapse/);
  assert.match(refs, /REF-RP-05/);
  assert.match(refs, /REF-RP-06/);
  assert.match(refs, /Validación clínica.*pendiente/i);
  assert.match(refs, /Revisión editorial.*realizada/i);
});
