import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  isAdvicePublishable,
  matchApplicableAdvice,
  publishedAdviceCatalog,
  resolveEducationalAdvice,
  type EducationalAdviceItem,
} from "./advice-catalog.ts";
import {
  validateDraftAdviceCatalog,
  type AdviceCatalogIssue,
} from "./advice-catalog-validate.ts";
import {
  draftAdviceCatalog,
  draftAdviceI18nKeyPrefix,
  draftsForFuturePriorityReview,
  PRELIMINARY_PHASES_KEY,
  type DraftAdviceRecord,
} from "./advice-drafts.ts";
import draftEn from "./advice-drafts.en.json" with { type: "json" };
import draftEs from "./advice-drafts.es.json" with { type: "json" };

const sidecarI18n = {
  en: {
    "fixture.advice.safety.alcohol.acute.title": "Fixture safety title",
    "fixture.advice.safety.alcohol.acute.body": "Fixture safety body",
    "fixture.advice.safety.alcohol.acute.notes": "Educational phase, not a personal timeline.",
    "fixture.advice.seek_help.alcohol.acute.title": "Fixture seek-help title",
    "fixture.advice.seek_help.alcohol.acute.body": "Fixture seek-help body",
    "fixture.advice.self_care.testes.cannabis.use.title": "Fixture testes title",
    "fixture.advice.self_care.testes.cannabis.use.body": "Fixture testes body",
    "fixture.advice.self_care.testes.cannabis.use.limits": "Not a clinical diagnosis.",
    "fixture.advice.safety.duplicate.title": "Duplicate title",
    "fixture.advice.safety.duplicate.body": "Duplicate body",
  },
  es: {
    "fixture.advice.safety.alcohol.acute.title": "Título de seguridad",
    "fixture.advice.safety.alcohol.acute.body": "Cuerpo de seguridad",
    "fixture.advice.safety.alcohol.acute.notes": "Fase educativa, no un calendario personal.",
    "fixture.advice.seek_help.alcohol.acute.title": "Título de ayuda",
    "fixture.advice.seek_help.alcohol.acute.body": "Cuerpo de ayuda",
    "fixture.advice.self_care.testes.cannabis.use.title": "Título testes",
    "fixture.advice.self_care.testes.cannabis.use.body": "Cuerpo testes",
    "fixture.advice.self_care.testes.cannabis.use.limits": "No es un diagnóstico clínico.",
    "fixture.advice.safety.duplicate.title": "Título duplicado",
    "fixture.advice.safety.duplicate.body": "Cuerpo duplicado",
  },
};

const draftSafetyAlcoholAcute = {
  item: {
    id: "fixture.safety.alcohol.acute-withdrawal",
    category: "safety",
    scope: "substance_phase",
    substanceIds: ["alcohol"],
    phases: ["acute_withdrawal"],
    titleKey: "fixture.advice.safety.alcohol.acute.title",
    bodyKey: "fixture.advice.safety.alcohol.acute.body",
    reference: { source: "Fixture citation (1999).", status: "unverified" },
    editorialStatus: "draft",
    personalized: false,
  },
  referenceDetails: {
    url: "https://example.test/fixture-citation",
    title: "Fixture citation",
    institution: "Fixture Institute",
    accessedAt: "2026-10-21",
  },
  applicabilityNotesKey: "fixture.advice.safety.alcohol.acute.notes",
} as const satisfies DraftAdviceRecord;

const draftSeekHelpAlcoholAcute = {
  item: {
    id: "fixture.seek-help.alcohol.acute-withdrawal",
    category: "seek_help",
    scope: "substance_phase",
    substanceIds: ["alcohol"],
    phases: ["acute_withdrawal"],
    titleKey: "fixture.advice.seek_help.alcohol.acute.title",
    bodyKey: "fixture.advice.seek_help.alcohol.acute.body",
    reference: { source: "", status: "insufficient" },
    editorialStatus: "draft",
    personalized: false,
  },
  presentationPriority: "routine",
} as const satisfies DraftAdviceRecord;

const draftOrganTestesCannabis = {
  item: {
    id: "fixture.self-care.testes.cannabis.during-use",
    category: "self_care",
    scope: "organ",
    substanceIds: ["cannabis"],
    phases: ["during_use"],
    organIds: ["testes"],
    titleKey: "fixture.advice.self_care.testes.cannabis.use.title",
    bodyKey: "fixture.advice.self_care.testes.cannabis.use.body",
    reference: { source: "Fixture testes source.", status: "pending" },
    editorialStatus: "pending_clinical_review",
    personalized: false,
  },
  audienceLimitationsKey: "fixture.advice.self_care.testes.cannabis.use.limits",
} as const satisfies DraftAdviceRecord;

const fixtureSidecar: readonly DraftAdviceRecord[] = [
  draftSafetyAlcoholAcute,
  draftSeekHelpAlcoholAcute,
  draftOrganTestesCannabis,
];

function codes(issues: readonly AdviceCatalogIssue[]): string[] {
  return issues.map((issue) => issue.code);
}

test("the published catalog stays empty and does not read the sidecar", () => {
  assert.deepEqual(publishedAdviceCatalog, []);
  const published = resolveEducationalAdvice("liver", "alcohol", "acute_withdrawal");
  assert.equal(published.empty, true);
  assert.deepEqual(published.items, []);
  const applicable = matchApplicableAdvice("liver", "alcohol", "acute_withdrawal");
  assert.equal(applicable.empty, true);
});

test("the public resolver module does not import the editorial sidecar", () => {
  const source = readFileSync(new URL("./advice-catalog.ts", import.meta.url), "utf8");
  assert.equal(source.includes("draftAdvice"), false);
  assert.equal(source.includes("advice-drafts"), false);
  assert.equal(source.includes("advice-catalog-validate"), false);
});

test("runtime i18n does not register draft sidecar copy", () => {
  const config = readFileSync(new URL("../../../i18n/config.ts", import.meta.url), "utf8");
  const index = readFileSync(new URL("../../../i18n/index.ts", import.meta.url), "utf8");
  assert.equal(config.includes("advice-drafts"), false);
  assert.equal(index.includes("advice-drafts"), false);
});

test("sidecar rows are still hidden when extracted into the public resolver", () => {
  const extracted = fixtureSidecar.map((record) => record.item);
  assert.equal(
    extracted.every((item) => isAdvicePublishable(item) === false),
    true,
  );
  const published = resolveEducationalAdvice(
    "liver",
    "alcohol",
    "acute_withdrawal",
    extracted,
  );
  assert.equal(published.empty, true);
  assert.deepEqual(published.items, []);
  const testes = resolveEducationalAdvice("testes", "cannabis", "during_use", extracted);
  assert.equal(testes.empty, true);
});

test("the production sidecar validates without integrity issues", () => {
  assert.deepEqual(validateDraftAdviceCatalog(draftAdviceCatalog, { en: draftEn, es: draftEs }), []);
});

test("valid synthetic drafts pass integrity checks", () => {
  assert.deepEqual(validateDraftAdviceCatalog(fixtureSidecar, sidecarI18n), []);
});

test("duplicate ids are reported", () => {
  const issues = validateDraftAdviceCatalog(
    [
      draftSafetyAlcoholAcute,
      {
        item: {
          ...draftSafetyAlcoholAcute.item,
          titleKey: "fixture.advice.safety.duplicate.title",
          bodyKey: "fixture.advice.safety.duplicate.body",
        },
      },
    ],
    sidecarI18n,
  );
  assert.equal(codes(issues).includes("duplicate_id"), true);
});

test("unknown substances, phases, and organs are reported", () => {
  const unknownSubstance = validateDraftAdviceCatalog(
    [
      {
        item: {
          ...draftSafetyAlcoholAcute.item,
          substanceIds: ["opioid" as EducationalAdviceItem["substanceIds"][number]],
        },
      },
    ],
    sidecarI18n,
  );
  assert.equal(codes(unknownSubstance).includes("unknown_substance"), true);

  const unknownPhase = validateDraftAdviceCatalog(
    [
      {
        item: {
          ...draftSafetyAlcoholAcute.item,
          phases: ["day_3" as EducationalAdviceItem["phases"][number]],
        },
      },
    ],
    sidecarI18n,
  );
  assert.equal(codes(unknownPhase).includes("unknown_phase"), true);

  const unknownOrgan = validateDraftAdviceCatalog(
    [
      {
        item: {
          ...draftOrganTestesCannabis.item,
          organIds: ["endocrine" as "testes"],
        },
      },
    ],
    sidecarI18n,
  );
  assert.equal(codes(unknownOrgan).includes("unknown_organ"), true);
});

test("persistent_safety on an organ-scoped draft is reported", () => {
  const issues = validateDraftAdviceCatalog(
    [
      {
        item: {
          ...draftOrganTestesCannabis.item,
          alertSurface: "persistent_safety",
        } as EducationalAdviceItem,
      },
    ],
    sidecarI18n,
  );
  assert.equal(codes(issues).includes("persistent_safety_requires_substance_phase"), true);
});

test("a canonical organ without narrative or recovery is not an integrity error", () => {
  const issues = validateDraftAdviceCatalog([draftOrganTestesCannabis], sidecarI18n);
  assert.deepEqual(issues, []);
});

test("missing EN or ES copy is reported", () => {
  const missingEs = validateDraftAdviceCatalog([draftSafetyAlcoholAcute], {
    en: sidecarI18n.en,
    es: {},
  });
  assert.equal(
    missingEs.some((issue) => issue.code === "missing_i18n" && issue.detail.includes("ES")),
    true,
  );

  const bothPresent = validateDraftAdviceCatalog([draftSafetyAlcoholAcute], sidecarI18n);
  assert.deepEqual(bothPresent, []);
});

test("verified references require a source; URLs do not verify them", () => {
  const emptyVerified = validateDraftAdviceCatalog(
    [
      {
        item: {
          ...draftSafetyAlcoholAcute.item,
          reference: { source: "   ", status: "verified" },
          editorialStatus: "draft",
        },
      },
    ],
    sidecarI18n,
  );
  assert.equal(codes(emptyVerified).includes("verified_without_source"), true);

  const urlWithoutVerification = validateDraftAdviceCatalog(
    [draftSafetyAlcoholAcute],
    sidecarI18n,
  );
  assert.deepEqual(urlWithoutVerification, []);
  assert.equal(draftSafetyAlcoholAcute.item.reference.status, "unverified");
  assert.equal(Boolean(draftSafetyAlcoholAcute.referenceDetails?.url), true);
});

test("publishable items are rejected from the draft lane", () => {
  const issues = validateDraftAdviceCatalog(
    [
      {
        item: {
          ...draftSafetyAlcoholAcute.item,
          id: "fixture.safety.alcohol.acute-withdrawal.publishable",
          titleKey: "fixture.advice.safety.alcohol.acute.title",
          bodyKey: "fixture.advice.safety.alcohol.acute.body",
          reference: { source: "Fixture verified citation.", status: "verified" },
          editorialStatus: "clinically_reviewed",
        },
      },
    ],
    sidecarI18n,
  );
  assert.equal(codes(issues).includes("publishable_in_draft_lane"), true);
  assert.equal(
    isAdvicePublishable({
      ...draftSafetyAlcoholAcute.item,
      reference: { source: "Fixture verified citation.", status: "verified" },
      editorialStatus: "clinically_reviewed",
    }),
    true,
  );
});

test("seek_help is not treated as an emergency or emphasized priority", () => {
  const issues = validateDraftAdviceCatalog([draftSeekHelpAlcoholAcute], sidecarI18n);
  assert.deepEqual(issues, []);
  assert.equal(draftSeekHelpAlcoholAcute.item.category, "seek_help");
  assert.equal(draftSeekHelpAlcoholAcute.presentationPriority, "routine");
});

test("numeric day fields on raw JSON are rejected", () => {
  const issues = validateDraftAdviceCatalog([draftSafetyAlcoholAcute], sidecarI18n, [
    { ...draftSafetyAlcoholAcute, fromDay: 1, toDay: 7, days: 7 },
  ]);
  assert.equal(issues.filter((issue) => issue.code === "numeric_day_field").length >= 3, true);
});

test("the validator does not read narratives, curves, or neurotransmitters", () => {
  const source = readFileSync(new URL("./advice-catalog-validate.ts", import.meta.url), "utf8");
  for (const token of [
    "resolveEducationalNarrative",
    "resolveEducationalRecovery",
    "recovery-curves",
    "achievement-catalog",
    "organ-narrative",
    "neurotransmitter-phases",
    "neurotransmitter-education",
    "daysTo95Recovery",
    "recoveryCeiling",
    "educationalEffectsSubstances",
  ]) {
    assert.equal(source.includes(token), false, token);
  }
});

const sidecarI18nFiles = { en: draftEn, es: draftEs };

function collectLeafKeys(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return prefix ? [prefix] : [];
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value).flatMap(([key, nested]) =>
    collectLeafKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
}

function lookupCopy(tree: unknown, key: string): string | undefined {
  let current: unknown = tree;
  for (const part of key.split(".")) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" ? current : undefined;
}

test("the sidecar holds exactly twenty-five unpublished drafts, five per substance", () => {
  assert.equal(draftAdviceCatalog.length, 25);
  const ids = draftAdviceCatalog.map((record) => record.item.id);
  assert.equal(new Set(ids).size, 25);

  const bySubstance = Object.fromEntries(
    ["alcohol", "nicotine", "cannabis", "cocaine", "caffeine"].map((substanceId) => [
      substanceId,
      draftAdviceCatalog.filter((record) => record.item.substanceIds.includes(substanceId as never))
        .length,
    ]),
  );
  assert.deepEqual(bySubstance, {
    alcohol: 5,
    nicotine: 5,
    cannabis: 5,
    cocaine: 5,
    caffeine: 5,
  });

  assert.equal(
    draftAdviceCatalog.every((record) => record.item.scope === "substance_phase"),
    true,
  );
  assert.equal(
    draftAdviceCatalog.every((record) => record.item.editorialStatus === "pending_clinical_review"),
    true,
  );
  assert.equal(
    draftAdviceCatalog.every((record) => record.item.reference.status === "pending"),
    true,
  );
  assert.equal(
    draftAdviceCatalog.every((record) => record.item.personalized === false),
    true,
  );
  assert.equal(
    draftAdviceCatalog.every((record) => record.presentationPriority === "routine"),
    true,
  );
  assert.equal(
    draftAdviceCatalog.every((record) => isAdvicePublishable(record.item) === false),
    true,
  );
});

test("extracted production drafts remain hidden from the public resolver", () => {
  const extracted = draftAdviceCatalog.map((record) => record.item);
  const alcohol = resolveEducationalAdvice("liver", "alcohol", "acute_withdrawal", extracted);
  assert.equal(alcohol.empty, true);
  assert.deepEqual(alcohol.items, []);
  const caffeine = resolveEducationalAdvice("heart", "caffeine", "during_use", extracted);
  assert.equal(caffeine.empty, true);
  assert.deepEqual(publishedAdviceCatalog, []);
});

test("sidecar ES/EN keys cover every draft field and have no orphans", () => {
  const requiredKeys = new Set<string>();
  for (const record of draftAdviceCatalog) {
    requiredKeys.add(record.item.titleKey);
    requiredKeys.add(record.item.bodyKey);
    if (record.applicabilityNotesKey) requiredKeys.add(record.applicabilityNotesKey);
    if (record.audienceLimitationsKey) requiredKeys.add(record.audienceLimitationsKey);
  }

  for (const locale of ["en", "es"] as const) {
    const present = new Set(collectLeafKeys(sidecarI18nFiles[locale]));
    for (const key of requiredKeys) {
      assert.equal(present.has(key), true, `${locale} missing ${key}`);
      assert.equal(Boolean(lookupCopy(sidecarI18nFiles[locale], key)?.trim()), true, key);
    }
    for (const key of present) {
      assert.equal(requiredKeys.has(key), true, `${locale} orphan ${key}`);
    }
  }
});

test("source hints are pending bibliographic notes, not verified or invented references", () => {
  assert.equal(
    draftAdviceCatalog.every((record) => record.item.reference.status === "pending"),
    true,
  );
  assert.equal(
    draftAdviceCatalog.every((record) => record.item.reference.status !== "verified"),
    true,
  );
  assert.equal(
    draftAdviceCatalog.every((record) => record.item.editorialStatus !== "clinically_reviewed"),
    true,
  );
  assert.equal(
    draftAdviceCatalog.every((record) => record.item.reference.source.trim().length > 0),
    true,
  );
  const gradual = draftAdviceCatalog.find(
    (record) => record.item.id === "caffeine.withdrawal.gradual_reduction",
  );
  assert.equal(gradual?.item.reference.source, "FDA");
  assert.equal(gradual?.referenceDetails?.url?.includes("spilling-beans"), true);
  const interaction = draftAdviceCatalog.find(
    (record) => record.item.id === "cocaine.alcohol.interaction",
  );
  assert.match(interaction?.item.reference.source ?? "", /van Amsterdam/);
  const neurological = draftAdviceCatalog.find(
    (record) => record.item.id === "cocaine.intoxication.neurological",
  );
  assert.equal(neurological?.item.reference.source, "ASAM/AAAP");
  assert.equal(neurological?.item.reference.source.includes("CDC"), false);
});

const unchangedIds = [
  "nicotine.cessation.support",
  "caffeine.intake.sensitivity",
  "caffeine.medication.interactions",
] as const;

const approvedBodies = {
  "alcohol.withdrawal.assessment": {
    es: "Si puede existir dependencia física del alcohol, busca asesoramiento sanitario antes de reducir o dejar el consumo de forma brusca. Una bajada súbita puede provocar abstinencia grave en personas dependientes.",
    en: "If physical alcohol dependence may be present, seek medical advice before abruptly cutting down or stopping. A sudden drop in intake can cause severe withdrawal in dependent drinkers.",
  },
  "alcohol.withdrawal.emergency": {
    es: "Las convulsiones, la confusión intensa o la desorientación durante una posible abstinencia de alcohol requieren atención médica inmediata.",
    en: "Seizures, severe confusion, or disorientation during possible alcohol withdrawal require immediate medical attention.",
  },
  "alcohol.overdose.emergency": {
    es: "La pérdida de conciencia, la respiración lenta o irregular o las convulsiones tras beber pueden ser signos de sobredosis de alcohol. Si las sospechas, llama a emergencias; no esperes a que aparezcan todos los síntomas.",
    en: "Loss of consciousness, slow or irregular breathing, or seizures after drinking may be signs of alcohol overdose. If you suspect it, call emergency services; do not wait for every symptom to appear.",
  },
  "alcohol.interactions.sedatives": {
    es: "Combinar alcohol con benzodiacepinas, opioides o hipnóticos para dormir aumenta el riesgo de sedación intensa y de problemas respiratorios.",
    en: "Combining alcohol with benzodiazepines, opioids, or hypnotic sleeping medicines increases the risk of profound sedation and breathing problems.",
  },
  "alcohol.withdrawal.nutrition": {
    es: "El consumo de alcohol de riesgo puede relacionarse con déficit de vitamina B1. Un profesional sanitario puede valorar si necesitas tiamina.",
    en: "Harmful alcohol use may be associated with vitamin B1 deficiency. A healthcare professional can assess whether thiamine is needed.",
  },
  "nicotine.cessation.support": {
    es: "El asesoramiento conductual y los tratamientos para dejar el tabaco pueden aumentar las posibilidades de abandonar el consumo. Consulta las opciones disponibles.",
    en: "Behavioral counseling and tobacco cessation treatments can improve the chances of quitting. Ask about available options.",
  },
  "nicotine.withdrawal.cravings": {
    es: "Cuando aparezca el deseo de fumar, prueba a distraerte, caminar o escribir o llamar a alguien de confianza. Ese deseo puede pasar sin fumar.",
    en: "When the urge to smoke arises, try distracting yourself, taking a walk, or texting or calling someone you trust. The urge can pass without smoking.",
  },
  "nicotine.withdrawal.sleep": {
    es: "Al dejar de fumar, mantener horarios regulares de sueño y evitar la cafeína por la tarde o noche puede ayudar: al dejar el tabaco la cafeína puede durar más en el cuerpo.",
    en: "After quitting smoking, a regular sleep schedule and avoiding caffeine in the afternoon or evening may help: caffeine can last longer in the body after you stop smoking.",
  },
  "nicotine.withdrawal.mood": {
    es: "Es frecuente experimentar irritabilidad al dejar de fumar. Si los cambios de ánimo son intensos, persisten o dificultan tus actividades cotidianas, consulta con un profesional sanitario.",
    en: "Irritability is common after quitting smoking. If mood changes are severe, persistent, or interfere with daily activities, seek advice from a healthcare professional.",
  },
  "nicotine.cessation.triggers": {
    es: "El deseo de fumar a menudo se asocia a personas, lugares o hábitos. Identificar esos disparadores y tener otra actividad a mano (distraerte u ocuparte) puede ayudar.",
    en: "The urge to smoke is often tied to people, places, or habits. Noticing those triggers and having another activity ready (distraction or keeping busy) may help.",
  },
  "cannabis.withdrawal.symptoms": {
    es: "Tras reducir o abandonar un consumo frecuente de cannabis pueden aparecer irritabilidad, ansiedad, problemas de sueño y cambios del apetito. No atribuyas automáticamente cualquier síntoma a la abstinencia.",
    en: "Reducing or stopping frequent cannabis use may cause irritability, anxiety, sleep problems, and appetite changes. Do not automatically attribute every symptom to withdrawal.",
  },
  "cannabis.recovery.support": {
    es: "Si te resulta difícil reducir o dejar el cannabis, hay intervenciones psicológicas que pueden ayudarte, como terapias conductuales. Pregunta por las opciones; no sustituyen un plan individual.",
    en: "If reducing or stopping cannabis is difficult, psychological interventions such as behavioral therapies may help. Ask about options; they are not a personal guarantee.",
  },
  "cannabis.withdrawal.sleep": {
    es: "Durante la abstinencia de cannabis pueden aparecer sueños intensos y dificultades para dormir. Si el problema persiste, pide valoración.",
    en: "Vivid or unusual dreams and sleep difficulties may occur during cannabis withdrawal. If the problem persists, seek assessment.",
  },
  "cannabis.withdrawal.mood": {
    es: "Si aparecen cambios importantes del ánimo, ansiedad intensa o dificultades para funcionar, solicita valoración profesional.",
    en: "Seek professional assessment if significant mood changes, intense anxiety, or difficulty functioning occur.",
  },
  "cannabis.mental_health.support": {
    es: "Si el consumo de cannabis coincide con síntomas psicológicos preocupantes o con el empeoramiento de problemas previos, busca atención sanitaria. Eso no demuestra por sí solo la causa.",
    en: "Seek healthcare support if cannabis use coincides with concerning psychological symptoms or with worsening of existing problems. That alone does not prove the cause.",
  },
  "cocaine.intoxication.chest_pain": {
    es: "El dolor torácico durante o después del consumo de cocaína requiere valoración médica urgente. La edad no lo hace menos importante.",
    en: "Chest pain during or after cocaine use requires urgent medical assessment. Age does not make it less important.",
  },
  "cocaine.intoxication.neurological": {
    es: "Las convulsiones o la pérdida de conciencia tras consumir cocaína requieren atención de urgencias. La aparición súbita de debilidad, dificultad para hablar o confusión intensa también requiere asistencia urgente.",
    en: "Seizures or loss of consciousness after cocaine use require emergency care. Sudden weakness, trouble speaking, or severe confusion also require emergency care.",
  },
  "cocaine.alcohol.interaction": {
    es: "Combinar cocaína y alcohol puede aumentar los riesgos cardiovasculares, incluidos algunos desenlaces graves. Evita mezclar ambas sustancias.",
    en: "Combining cocaine and alcohol may increase cardiovascular risks, including some serious outcomes. Avoid using them together.",
  },
  "cocaine.recovery.behavioral_support": {
    es: "Las guías clínicas recogen intervenciones conductuales para el trastorno por estimulantes, entre ellas el manejo de contingencias. Pregunta por programas especializados. Ningún programa garantiza el resultado.",
    en: "Clinical guidelines include behavioral interventions for stimulant use disorder, including contingency management. Ask about specialized programs. No program guarantees an individual outcome.",
  },
  "cocaine.withdrawal.mood": {
    es: "Si al dejar la cocaína aparecen un ánimo muy bajo o pensamientos de autolesión, busca ayuda profesional ahora. Ante peligro inmediato, llama a emergencias. No esperes a una fase del calendario.",
    en: "If very low mood or thoughts of self-harm occur after stopping cocaine, seek professional help now. If there is immediate danger, call emergency services. Do not wait for a calendar phase.",
  },
  "caffeine.intake.sensitivity": {
    es: "La tolerancia a la cafeína varía entre personas. Los 400 mg diarios citados por la FDA para la mayoría de adultos no son un objetivo ni garantizan seguridad individual.",
    en: "Caffeine tolerance varies between individuals. The FDA's 400 mg daily reference for most adults is neither a target nor a guarantee of individual safety.",
  },
  "caffeine.withdrawal.gradual_reduction": {
    es: "Si consumes cafeína habitualmente y quieres reducirla, hacerlo gradualmente puede ayudarte a evitar molestias asociadas a la retirada brusca.",
    en: "If you regularly consume caffeine and want to cut back, reducing it gradually may help you avoid discomfort associated with stopping suddenly.",
  },
  "caffeine.withdrawal.headache": {
    es: "Si dejas la cafeína de golpe, pueden aparecer dolor de cabeza, somnolencia e irritabilidad. No presupongas que un síntoma intenso o inusual se debe solo a la abstinencia.",
    en: "If you stop caffeine suddenly, headaches, drowsiness, and irritability can occur. Do not assume severe or unusual symptoms are caused solely by withdrawal.",
  },
  "caffeine.sleep.anxiety": {
    es: "Si la cafeína empeora tu sueño o tu ansiedad, considera reducirla. Sus efectos pueden durar varias horas, así que evita tomarla a última hora.",
    en: "If caffeine worsens your sleep or anxiety, consider cutting back. Effects can last several hours, so avoid it late in the day.",
  },
  "caffeine.medication.interactions": {
    es: "Algunos medicamentos y enfermedades pueden modificar los riesgos de la cafeína. Consulta con un profesional sanitario si tienes dudas sobre posibles interacciones.",
    en: "Certain medicines and medical conditions may affect caffeine-related risks. Ask a healthcare professional if you are concerned about interactions.",
  },
} as const;

test("titleKey and bodyKey follow the sidecar i18n convention and are not clinical prose", () => {
  assert.equal(draftAdviceI18nKeyPrefix, "draft.advice");
  assert.equal(PRELIMINARY_PHASES_KEY, "draft.advice.meta.preliminaryPhases");
  for (const record of draftAdviceCatalog) {
    assert.equal(record.item.titleKey, `${draftAdviceI18nKeyPrefix}.${record.item.id}.title`);
    assert.equal(record.item.bodyKey, `${draftAdviceI18nKeyPrefix}.${record.item.id}.body`);
    assert.notEqual(record.item.titleKey, record.item.bodyKey);
    assert.equal(record.item.titleKey.includes(" "), false);
    assert.equal(record.item.bodyKey.includes(" "), false);
  }
});

test("each draft has independent ES and EN titles that differ from the body", () => {
  const titles = { en: new Set<string>(), es: new Set<string>() };
  for (const record of draftAdviceCatalog) {
    const enTitle = lookupCopy(draftEn, record.item.titleKey);
    const esTitle = lookupCopy(draftEs, record.item.titleKey);
    const enBody = lookupCopy(draftEn, record.item.bodyKey);
    const esBody = lookupCopy(draftEs, record.item.bodyKey);
    assert.ok(enTitle && esTitle && enBody && esBody, record.item.id);
    assert.notEqual(enTitle, enBody, record.item.id);
    assert.notEqual(esTitle, esBody, record.item.id);
    assert.equal(enTitle.length < enBody.length, true, record.item.id);
    assert.equal(esTitle.length < esBody.length, true, record.item.id);
    titles.en.add(enTitle);
    titles.es.add(esTitle);
  }
  assert.equal(titles.en.size, 25);
  assert.equal(titles.es.size, 25);
});

test("approved editorial bodies match ES and EN sidecar copy", () => {
  assert.equal(Object.keys(approvedBodies).length, 25);
  const revisedCount = draftAdviceCatalog.filter(
    (record) => !unchangedIds.includes(record.item.id as (typeof unchangedIds)[number]),
  ).length;
  assert.equal(revisedCount, 22);
  assert.equal(unchangedIds.length, 3);
  for (const record of draftAdviceCatalog) {
    const expected = approvedBodies[record.item.id as keyof typeof approvedBodies];
    assert.ok(expected, record.item.id);
    assert.equal(lookupCopy(draftEn, record.item.bodyKey), expected.en, record.item.id);
    assert.equal(lookupCopy(draftEs, record.item.bodyKey), expected.es, record.item.id);
  }
});

test("mandatory safety wording is preserved on urgent and withdrawal cards", () => {
  const moodEn = lookupCopy(draftEn, "draft.advice.nicotine.withdrawal.mood.body");
  const moodEs = lookupCopy(draftEs, "draft.advice.nicotine.withdrawal.mood.body");
  assert.match(moodEs, /irritabilidad/);
  assert.match(moodEn, /Irritability/);
  assert.match(moodEs, /profesional sanitario/);
  assert.match(moodEn, /healthcare professional/);

  const cannabisEn = lookupCopy(draftEn, "draft.advice.cannabis.withdrawal.symptoms.body");
  const cannabisEs = lookupCopy(draftEs, "draft.advice.cannabis.withdrawal.symptoms.body");
  assert.match(cannabisEs, /reducir o abandonar/);
  assert.match(cannabisEn, /Reducing or stopping/);
  assert.match(cannabisEs, /No atribuyas automáticamente/);
  assert.match(cannabisEn, /Do not automatically attribute/);

  const neuroEn = lookupCopy(draftEn, "draft.advice.cocaine.intoxication.neurological.body");
  const neuroEs = lookupCopy(draftEs, "draft.advice.cocaine.intoxication.neurological.body");
  assert.match(neuroEs, /convulsiones/i);
  assert.match(neuroEn, /Seizures/);
  assert.match(neuroEs, /p[eé]rdida de conciencia/i);
  assert.match(neuroEn, /loss of consciousness/i);
  assert.match(neuroEs, /urgencias|urgente/);
  assert.match(neuroEn, /emergency/i);

  const mixEn = lookupCopy(draftEn, "draft.advice.cocaine.alcohol.interaction.body");
  const mixEs = lookupCopy(draftEs, "draft.advice.cocaine.alcohol.interaction.body");
  assert.match(mixEs, /Evita mezclar/);
  assert.match(mixEn, /Avoid using them together/);
  assert.equal(mixEs.includes("pronóstico"), false);
  assert.equal(mixEn.toLowerCase().includes("prognosis"), false);

  const gradualEn = lookupCopy(draftEn, "draft.advice.caffeine.withdrawal.gradual_reduction.body");
  const gradualEs = lookupCopy(draftEs, "draft.advice.caffeine.withdrawal.gradual_reduction.body");
  assert.match(gradualEs, /gradualmente/);
  assert.match(gradualEn, /gradually/);
});

test("seek_help does not auto-promote presentation priority", () => {
  const seekHelp = draftAdviceCatalog.filter((record) => record.item.category === "seek_help");
  assert.equal(seekHelp.length > 0, true);
  assert.equal(
    seekHelp.every((record) => record.presentationPriority === "routine"),
    true,
  );
  for (const id of draftsForFuturePriorityReview) {
    const record = draftAdviceCatalog.find((entry) => entry.item.id === id);
    assert.ok(record, id);
    assert.equal(record.presentationPriority, "routine", id);
    assert.equal(record.item.scope, "substance_phase", id);
  }
});
