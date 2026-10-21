import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  educationalNtClaimKinds,
  educationalNtClaimSupports,
  educationalNtClinicalReviews,
  educationalNtEvidenceId,
  educationalNtEvidenceIssues,
  educationalNtEvidenceScopes,
  educationalNtProfilePhaseToken,
  educationalNtSourceStatuses,
  educationalNtWorkIdentifications,
  isEducationalNtEvidenceConsistent,
  publishedEducationalNtEvidenceCatalog,
  resolveEducationalNtEvidence,
  type EducationalNtEvidenceRecord,
} from "./educational-nt-evidence.ts";
import { narrativePhases } from "./narrative-catalog.ts";
import { educationalNtProfiles } from "./neurotransmitter-education.ts";

function record(
  patch: Partial<EducationalNtEvidenceRecord> &
    Pick<EducationalNtEvidenceRecord, "phase" | "claimKind" | "slug">,
): EducationalNtEvidenceRecord {
  const base = {
    substanceId: "alcohol" as const,
    neurotransmitter: "gaba" as const,
    mechanismKey: "GABAA_POTENTIATION",
    reference: {
      source: "",
      identification: "absent" as const,
      status: "insufficient" as const,
    },
    claimSupport: "unverified" as const,
    clinicalReview: "not_applicable" as const,
    evidenceScope: "mechanism_only" as const,
    limitations: "",
    ...patch,
  };
  return {
    ...base,
    id: educationalNtEvidenceId(base),
  };
}

const fixtures = {
  profileMechanism: record({
    phase: null,
    claimKind: "mechanism",
    slug: "gaba-a-potentiation",
    reference: {
      source: "Fixture Review (1999).",
      identification: "identified",
      status: "verified",
    },
    claimSupport: "partial",
    evidenceScope: "mechanism_only",
    limitations: "Fixture: mechanism only, not a recovery timeline.",
  }),
  acuteSafety: record({
    phase: "acute_withdrawal",
    claimKind: "clinical_safety",
    slug: "seizure-risk",
    reference: {
      source: "Fixture Criteria (2022).",
      identification: "identified",
      status: "verified",
    },
    claimSupport: "partial",
    clinicalReview: "pending",
    evidenceScope: "this_phase",
    limitations: "Fixture: clinical withdrawal risk, not GABA concentration.",
  }),
  acuteSymptom: record({
    phase: "acute_withdrawal",
    claimKind: "withdrawal_symptom",
    slug: "anxiety-tremor",
    evidenceScope: "symptoms_not_receptors",
  }),
  postAcuteAdaptation: record({
    phase: "post_acute",
    claimKind: "neuroadaptation",
    slug: "inhibitory-tone",
    evidenceScope: "not_individual_timeline",
  }),
  cocaineDat: record({
    substanceId: "cocaine",
    neurotransmitter: "dopamine",
    mechanismKey: "DAT_BLOCKADE",
    phase: null,
    claimKind: "mechanism",
    slug: "dat-blockade",
    reference: {
      source: "Fixture Stimulant Review (2016).",
      identification: "identified",
      status: "verified",
    },
    claimSupport: "supported",
    evidenceScope: "mechanism_only",
  }),
} as const;

const fixtureCatalog: readonly EducationalNtEvidenceRecord[] = [
  fixtures.profileMechanism,
  fixtures.acuteSafety,
  fixtures.acuteSymptom,
  fixtures.postAcuteAdaptation,
  fixtures.cocaineDat,
];

test("the published neurotransmitter evidence catalog stays empty", () => {
  assert.deepEqual(publishedEducationalNtEvidenceCatalog, []);
  for (const profile of educationalNtProfiles) {
    const resolved = resolveEducationalNtEvidence(
      profile.substanceId,
      profile.neurotransmitter,
      "during_use",
    );
    assert.equal(resolved.empty, true);
    assert.deepEqual(resolved.items, []);
  }
});

test("claim ids are deterministic and unique across fixtures", () => {
  assert.equal(
    educationalNtEvidenceId({
      substanceId: "alcohol",
      neurotransmitter: "gaba",
      phase: null,
      claimKind: "mechanism",
      slug: "gaba-a-potentiation",
    }),
    `alcohol.gaba.${educationalNtProfilePhaseToken}.mechanism.gaba-a-potentiation`,
  );
  assert.equal(
    educationalNtEvidenceId(fixtures.acuteSafety),
    "alcohol.gaba.acute_withdrawal.clinical_safety.seizure-risk",
  );
  const ids = fixtureCatalog.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.notEqual(fixtures.acuteSafety.id, fixtures.acuteSymptom.id);
});

test("references are optional and missing sources stay unverified", () => {
  const absent = fixtures.acuteSymptom;
  assert.equal(absent.reference.source, "");
  assert.equal(absent.reference.identification, "absent");
  assert.equal(absent.reference.status, "insufficient");
  assert.equal(absent.claimSupport, "unverified");
  assert.equal(isEducationalNtEvidenceConsistent(absent), true);
});

test("identified work is independent of claim support", () => {
  const identifiedUnverified: EducationalNtEvidenceRecord = record({
    phase: null,
    claimKind: "mechanism",
    slug: "identified-unverified",
    reference: {
      source: "Fixture Textbook, 5th ed.",
      identification: "identified",
      status: "unverified",
    },
    claimSupport: "unverified",
  });
  assert.equal(isEducationalNtEvidenceConsistent(identifiedUnverified), true);
  assert.equal(identifiedUnverified.claimSupport, "unverified");
  assert.equal(identifiedUnverified.reference.identification, "identified");
});

test("supported partial and unsupported require an identified verified source", () => {
  for (const support of ["supported", "partial", "unsupported"] as const) {
    const invalid = record({
      phase: null,
      claimKind: "mechanism",
      slug: `invalid-${support}`,
      claimSupport: support,
    });
    assert.equal(isEducationalNtEvidenceConsistent(invalid), false);
    assert.ok(
      educationalNtEvidenceIssues(invalid).some((issue) => issue.code.endsWith("without_verified_source")),
    );
  }
  assert.equal(isEducationalNtEvidenceConsistent(fixtures.cocaineDat), true);
  assert.equal(fixtures.cocaineDat.claimSupport, "supported");
  assert.equal(fixtures.profileMechanism.claimSupport, "partial");
});

test("a missing reference is not recorded as a false claim", () => {
  const markedFalse = record({
    phase: "normalizing",
    claimKind: "neuroadaptation",
    slug: "false-without-source",
    claimSupport: "unsupported",
  });
  const issues = educationalNtEvidenceIssues(markedFalse).map((issue) => issue.code);
  assert.equal(issues.includes("missing_reference_marked_false"), true);
  assert.equal(issues.includes("unsupported_without_verified_source"), true);
});

test("clinical safety cannot skip clinical review", () => {
  const skipped = record({
    phase: "acute_withdrawal",
    claimKind: "clinical_safety",
    slug: "skip-review",
    clinicalReview: "not_applicable",
  });
  assert.equal(
    educationalNtEvidenceIssues(skipped).some((issue) => issue.code === "clinical_safety_not_applicable"),
    true,
  );
  assert.equal(isEducationalNtEvidenceConsistent(fixtures.acuteSafety), true);
  assert.equal(fixtures.acuteSafety.clinicalReview, "pending");
});

test("the resolver includes general mechanisms and isolates phases", () => {
  const during = resolveEducationalNtEvidence("alcohol", "gaba", "during_use", fixtureCatalog);
  assert.equal(during.empty, false);
  assert.deepEqual(
    during.items.map((item) => item.id),
    [fixtures.profileMechanism.id],
  );

  const acute = resolveEducationalNtEvidence("alcohol", "gaba", "acute_withdrawal", fixtureCatalog);
  assert.deepEqual(
    acute.items.map((item) => item.slug).sort(),
    ["anxiety-tremor", "gaba-a-potentiation", "seizure-risk"],
  );
  assert.equal(
    acute.items.some((item) => item.phase === "post_acute"),
    false,
  );

  const post = resolveEducationalNtEvidence("alcohol", "gaba", "post_acute", fixtureCatalog);
  assert.deepEqual(
    post.items.map((item) => item.slug).sort(),
    ["gaba-a-potentiation", "inhibitory-tone"],
  );
  assert.equal(
    post.items.some((item) => item.claimKind === "clinical_safety"),
    false,
  );
});

test("one phase can carry several claims without collapsing them", () => {
  const acute = resolveEducationalNtEvidence("alcohol", "gaba", "acute_withdrawal", fixtureCatalog);
  assert.equal(acute.items.filter((item) => item.phase === "acute_withdrawal").length, 2);
  assert.equal(new Set(acute.items.map((item) => item.claimKind)).size >= 2, true);
});

test("unknown identities resolve empty without inventing citations", () => {
  const unknown = resolveEducationalNtEvidence("unknown", "gaba", "during_use", fixtureCatalog);
  assert.equal(unknown.empty, true);
  assert.deepEqual(unknown.items, []);
  const badPhase = resolveEducationalNtEvidence("alcohol", "gaba", "week-two", fixtureCatalog);
  assert.equal(badPhase.empty, true);
  const emptyCatalog = resolveEducationalNtEvidence("alcohol", "gaba", "during_use", []);
  assert.equal(emptyCatalog.empty, true);
  assert.equal(emptyCatalog.items.length, 0);
});

test("the sidecar does not inherit narrative recovery or seed bibliography", () => {
  const source = readFileSync(new URL("./educational-nt-evidence.ts", import.meta.url), "utf8");
  for (const token of [
    "narrativeCatalogPairs",
    "publishedAdviceCatalog",
    "recoveryCatalogPairs",
    "prisma",
    "neurotransmitter-profiles",
    "useNeurotransmitterState",
    "/me/neurotransmitter-state",
    "daysTo95Recovery",
  ]) {
    assert.equal(source.includes(token), false, token);
  }
  assert.equal(
    source.includes("Koob") || source.includes("Stahl") || source.includes("Fredholm"),
    false,
  );
  assert.equal(narrativePhases.length, 4);
});

test("the atlas still does not present sidecar evidence or verified badges", () => {
  const page = readFileSync(new URL("../pages/AnatomyExplorerPage.tsx", import.meta.url), "utf8");
  const card = readFileSync(
    new URL("../components/EducationalSignalingCard.tsx", import.meta.url),
    "utf8",
  );
  const education = readFileSync(new URL("./neurotransmitter-education.ts", import.meta.url), "utf8");
  assert.equal(page.includes("educational-nt-evidence"), false);
  assert.equal(page.includes("resolveEducationalNtEvidence"), false);
  assert.match(page, /signalingAttribution/);
  assert.equal(card.includes("educational-nt-evidence"), false);
  assert.equal(card.includes("verified"), false);
  assert.equal(education.includes("educational-nt-evidence"), false);
});

test("contract enumerations stay aligned with the sidecar kinds", () => {
  assert.deepEqual(educationalNtClaimKinds, [
    "mechanism",
    "acute_effect",
    "neuroadaptation",
    "withdrawal_symptom",
    "clinical_safety",
  ]);
  assert.deepEqual(educationalNtClaimSupports, ["supported", "partial", "unsupported", "unverified"]);
  assert.deepEqual(educationalNtClinicalReviews, ["not_applicable", "pending", "reviewed"]);
  assert.deepEqual(educationalNtWorkIdentifications, ["identified", "absent"]);
  assert.deepEqual(educationalNtSourceStatuses, ["verified", "unverified", "pending", "insufficient"]);
  assert.deepEqual(educationalNtEvidenceScopes, [
    "mechanism_only",
    "this_phase",
    "symptoms_not_receptors",
    "not_individual_timeline",
  ]);
});
