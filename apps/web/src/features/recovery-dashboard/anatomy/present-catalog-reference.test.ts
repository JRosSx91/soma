import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { recoveryCatalogPairs, resolveEducationalRecovery } from "./recovery-catalog.ts";
import {
  presentAnatomySource,
  presentCatalogReference,
} from "./present-catalog-reference.ts";

test("pending markers match regardless of case and surrounding spaces", () => {
  const variants = [
    "Cosgrove et al. (2009). nAChR upregulation. [NEEDS-VERIFICATION]",
    "Cosgrove et al. (2009). nAChR upregulation. [needs-verification]",
    "Cosgrove et al. (2009). nAChR upregulation. [ Needs-Verification ]",
    "Cosgrove et al. (2009). nAChR upregulation. [NEEDS VERIFICATION]",
  ];
  for (const raw of variants) {
    const presented = presentCatalogReference(raw);
    assert.equal(presented.status, "pending", raw);
    assert.equal(presented.hadNeedsVerificationMarker, true);
    assert.equal(presented.raw, raw);
    assert.equal(presented.displayText.includes("NEEDS"), false, raw);
    assert.equal(presented.displayText.includes("["), false, raw);
    assert.match(presented.displayText, /Cosgrove et al\. \(2009\)/);
  }
});

test("an abbreviated author-year citation is unverified, not insufficient", () => {
  const presented = presentCatalogReference("Lieber (2004). Early steatosis reverses in 2-6 weeks.");
  assert.equal(presented.status, "unverified");
  assert.equal(presented.hadNeedsVerificationMarker, false);
  assert.equal(presented.displayText, "Lieber (2004). Early steatosis reverses in 2-6 weeks.");
});

test("a descriptive physiology sentence without a source is insufficient", () => {
  const presented = presentCatalogReference(
    "Gastric mucosa regenerates rapidly; complete recovery typical without chronic gastritis.",
  );
  assert.equal(presented.status, "insufficient");
  assert.equal(presented.hadNeedsVerificationMarker, false);
  assert.match(presented.displayText, /Gastric mucosa regenerates rapidly/);
});

test("an empty reference is insufficient", () => {
  assert.equal(presentCatalogReference("").status, "insufficient");
  assert.equal(presentCatalogReference("   ").status, "insufficient");
  assert.equal(presentCatalogReference(null).status, "insufficient");
  assert.equal(presentCatalogReference(undefined).status, "insufficient");
});

test("a marker-only string stays pending without inventing a citation", () => {
  const presented = presentCatalogReference(" [NEEDS-VERIFICATION] ");
  assert.equal(presented.status, "pending");
  assert.equal(presented.displayText, "");
  assert.equal(presented.raw, " [NEEDS-VERIFICATION] ");
});

test("high catalog confidence can coexist with a pending reference", () => {
  const curve = resolveEducationalRecovery("brain-nucleus-accumbens", "nicotine");
  assert.ok(curve);
  assert.equal(curve.confidenceLevel, "high");
  assert.match(curve.referenceSource, /\[NEEDS-VERIFICATION\]/);
  const presented = presentCatalogReference(curve.referenceSource);
  assert.equal(presented.status, "pending");
  assert.equal(presented.raw, curve.referenceSource);
  assert.equal(presented.displayText.includes("NEEDS-VERIFICATION"), false);
});

test("medium and low confidence strings stay unverified when they look bibliographic", () => {
  assert.equal(
    presentCatalogReference("Pfefferbaum et al. (1995). Gray matter recovery over months.").status,
    "unverified",
  );
  assert.equal(
    presentCatalogReference("AASLD 2019; reviews on portal hypertension and splenomegaly").status,
    "unverified",
  );
});

test("anatomy sources with verified true keep the verified link style", () => {
  const presented = presentAnatomySource({
    citation: "OpenStax. Anatomy and Physiology 2e.",
    href: "https://openstax.org/example",
    verified: true,
  });
  assert.equal(presented.useVerifiedLinkStyle, true);
  assert.equal(presented.href, "https://openstax.org/example");
});

test("anatomy sources with verified false are not presented as verified links", () => {
  const presented = presentAnatomySource({
    citation: "Unconfirmed record",
    href: "https://example.org/record",
    verified: false,
  });
  assert.equal(presented.useVerifiedLinkStyle, false);
  assert.equal(presented.citation, "Unconfirmed record");
});

test("recovery curve numbers stay identical after presenting the reference", () => {
  const curve = resolveEducationalRecovery("liver", "alcohol");
  assert.ok(curve);
  const presented = presentCatalogReference(curve.referenceSource);
  const pair = recoveryCatalogPairs().find(
    (item) => item.organId === "liver" && item.substanceId === "alcohol",
  );
  assert.ok(pair);
  assert.equal(curve.daysTo95Recovery, 90);
  assert.equal(pair.daysTo95Recovery, 90);
  assert.equal(pair.recoveryCeiling, 0.95);
  assert.equal(curve.ceilingPercentLabel, "95%");
  assert.equal(curve.shape, "logarithmic");
  assert.equal(presented.raw, curve.referenceSource);
  assert.match(curve.referenceSource, /Lieber \(2004\)/);
});

test("the explorer surfaces catalog estimate copy and does not invent NT bibliography", () => {
  const page = readFileSync(new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url), "utf8");
  const summary = readFileSync(new URL("../components/OrganSheetSummary.tsx", import.meta.url), "utf8");
  const note = readFileSync(new URL("../components/CatalogEvidenceNote.tsx", import.meta.url), "utf8");
  assert.match(page, /catalogEstimateNotice/);
  assert.match(page, /signalingAttribution/);
  assert.match(note, /presentCatalogReference/);
  assert.match(note, /referenceStatus/);
  assert.match(note, /confidenceMeaning/);
  assert.equal(page.includes("NEEDS-VERIFICATION"), false);
  assert.match(summary, /useVerifiedLinkStyle/);
  const effectsBlock = page.slice(page.indexOf("function EffectsPanel"), page.indexOf("function RecoveryPanel"));
  assert.match(effectsBlock, /signalingAttribution/);
  const signalingChunk = effectsBlock.slice(
    effectsBlock.indexOf("signaling.map"),
    effectsBlock.indexOf("CatalogEvidenceNote"),
  );
  assert.equal(signalingChunk.includes("referenceSource"), false);
});
