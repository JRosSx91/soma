import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptPath = fileURLToPath(import.meta.url);
const defaultRoot = path.resolve(path.dirname(scriptPath), "../../..");

const DEFAULT_POLICY = Object.freeze({
  blocksAccess: false,
  grantsXp: false,
  incomingAreCumulative: false,
});

function fail(message) {
  throw new Error(`Knowledge publication: ${message}`);
}

function record(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object.`);
  }
  return value;
}

function array(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array.`);
  return value;
}

function nonEmptyString(value, label) {
  if (typeof value !== "string" || !value.trim()) {
    fail(`${label} must be a non-empty string.`);
  }
  return value;
}

function publicUrl(value, label) {
  const raw = nonEmptyString(value, label);
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    fail(`${label} must be a valid public URL.`);
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    fail(`${label} must use HTTP or HTTPS.`);
  }
  return parsed.toString();
}

function bilingual(value, label) {
  const text = record(value, label);
  return {
    es: nonEmptyString(text.es, `${label}.es`),
    en: nonEmptyString(text.en, `${label}.en`),
  };
}

function uniqueStrings(value, label) {
  const values = array(value, label).map((item, index) =>
    nonEmptyString(item, `${label}[${index}]`),
  );
  if (new Set(values).size !== values.length) fail(`${label} contains duplicate ids.`);
  return values;
}

function indexById(values, label) {
  const index = new Map();
  for (const [position, value] of array(values, label).entries()) {
    const item = record(value, `${label}[${position}]`);
    const id = nonEmptyString(item.id, `${label}[${position}].id`);
    if (index.has(id)) fail(`${label} contains duplicate id ${id}.`);
    index.set(id, item);
  }
  return index;
}

function requireDecision(authorization, key) {
  const decision = record(authorization[key], `manifest.authorization.${key}`);
  nonEmptyString(decision.decisionId, `manifest.authorization.${key}.decisionId`);
  nonEmptyString(decision.approvedBy, `manifest.authorization.${key}.approvedBy`);
  nonEmptyString(decision.approvedOn, `manifest.authorization.${key}.approvedOn`);
}

function requireAuthorization(manifest, selections) {
  const selectionCount = Object.values(selections).reduce(
    (total, count) => total + count,
    0,
  );
  if (selectionCount === 0) {
    if (manifest.authorization !== null) {
      fail("an empty manifest must not contain a publication authorization.");
    }
    return;
  }
  const authorization = record(manifest.authorization, "manifest.authorization");
  if (selections.concepts > 0) requireDecision(authorization, "concepts");
  if (selections.relations > 0) requireDecision(authorization, "relations");
  if (selections.prerequisites > 0) requireDecision(authorization, "prerequisites");
}

function validateSourceReferences(item, registry, label) {
  for (const reference of uniqueStrings(item.references ?? [], `${label}.references`)) {
    if (!(reference in registry)) fail(`${label} references unknown source ${reference}.`);
    nonEmptyString(registry[reference], `source registry ${reference}`);
  }
}

function validateReviewSources(review, sourceIndex, label) {
  for (const sourceId of uniqueStrings(review.sourceIds ?? [], `${label}.sourceIds`)) {
    if (!sourceIndex.has(sourceId)) fail(`${label} references unknown source ${sourceId}.`);
    publicUrl(sourceIndex.get(sourceId).url, `editorial source ${sourceId}.url`);
  }
}

export function createPublicKnowledgeCatalog({
  conceptsCatalog,
  relationsCatalog,
  learningCatalog,
  editorialBatch,
  manifest,
}) {
  record(conceptsCatalog, "concepts catalog");
  record(relationsCatalog, "relations catalog");
  record(learningCatalog, "learning catalog");
  record(editorialBatch, "editorial batch");
  record(manifest, "manifest");

  if (manifest.schemaVersion !== 1) fail("manifest.schemaVersion must be 1.");
  nonEmptyString(manifest.manifestId, "manifest.manifestId");

  const authorizedConceptIds = uniqueStrings(
    manifest.authorizedConceptIds,
    "manifest.authorizedConceptIds",
  );
  const authorizedRelationIds = uniqueStrings(
    manifest.authorizedRelationIds,
    "manifest.authorizedRelationIds",
  );
  const authorizedPrerequisiteIds = uniqueStrings(
    manifest.authorizedPrerequisiteIds,
    "manifest.authorizedPrerequisiteIds",
  );
  requireAuthorization(manifest, {
    concepts: authorizedConceptIds.length,
    relations: authorizedRelationIds.length,
    prerequisites: authorizedPrerequisiteIds.length,
  });

  const conceptIndex = indexById(conceptsCatalog.concepts, "concepts");
  const relationIndex = indexById(relationsCatalog.relations, "relations");
  const prerequisiteIndex = indexById(
    learningCatalog.prerequisites,
    "prerequisites",
  );
  const cardIndex = indexById(editorialBatch.conceptCards, "editorial cards");
  const relationReviewIndex = indexById(
    editorialBatch.relationReviews,
    "relation reviews",
  );
  const sourceIndex = indexById(editorialBatch.sources, "editorial sources");
  const sourceRegistry = record(
    conceptsCatalog.sourceRegistry,
    "concepts.sourceRegistry",
  );
  const allowedPredicates = new Set(
    uniqueStrings(relationsCatalog.allowedPredicates, "relations.allowedPredicates"),
  );
  const authorizedConceptSet = new Set(authorizedConceptIds);

  const concepts = authorizedConceptIds
    .map((id) => {
      const source = conceptIndex.get(id);
      const card = cardIndex.get(id);
      if (!source) fail(`authorized concept ${id} does not exist.`);
      if (!card) fail(`authorized concept ${id} has no reviewed editorial card.`);
      validateSourceReferences(source, sourceRegistry, `concept ${id}`);
      validateReviewSources(card, sourceIndex, `editorial card ${id}`);
      const explanation = bilingual(
        card.explanation,
        `editorial card ${id}.explanation`,
      );
      const example =
        card.example === undefined
          ? undefined
          : bilingual(card.example, `editorial card ${id}.example`);
      const references = uniqueStrings(
        card.sourceIds,
        `editorial card ${id}.sourceIds`,
      )
        .map((sourceId) => {
          const reference = sourceIndex.get(sourceId);
          if (!reference) fail(`editorial card ${id} references unknown source ${sourceId}.`);
          return {
            id: sourceId,
            title: nonEmptyString(reference.title, `editorial source ${sourceId}.title`),
            publisher: nonEmptyString(
              reference.publisher,
              `editorial source ${sourceId}.publisher`,
            ),
            url: publicUrl(reference.url, `editorial source ${sourceId}.url`),
          };
        })
        .sort((left, right) => left.id.localeCompare(right.id));
      const clarifications = array(
        card.publicClarifications ?? [],
        `editorial card ${id}.publicClarifications`,
      ).map((clarification, index) =>
        bilingual(
          clarification,
          `editorial card ${id}.publicClarifications[${index}]`,
        ),
      );
      const illustration =
        card.visualProposal === undefined
          ? undefined
          : {
              kind: nonEmptyString(
                record(card.visualProposal, `editorial card ${id}.visualProposal`).kind,
                `editorial card ${id}.visualProposal.kind`,
              ),
              assetGroup: nonEmptyString(
                card.visualProposal.assetGroup,
                `editorial card ${id}.visualProposal.assetGroup`,
              ),
            };
      const bindings = array(source.bindings, `concept ${id}.bindings`).map(
        (binding, index) => {
          const value = record(binding, `concept ${id}.bindings[${index}]`);
          return {
            surface: nonEmptyString(
              value.surface,
              `concept ${id}.bindings[${index}].surface`,
            ),
            id: nonEmptyString(value.id, `concept ${id}.bindings[${index}].id`),
          };
        },
      );
      return {
        id,
        labels: bilingual(card.title, `editorial card ${id}.title`),
        definition: bilingual(
          card.shortDefinition,
          `editorial card ${id}.shortDefinition`,
        ),
        explanation,
        ...(example ? { example } : {}),
        references,
        ...(clarifications.length > 0 ? { clarifications } : {}),
        ...(illustration ? { illustration } : {}),
        ontologyType: nonEmptyString(
          source.ontologyType,
          `concept ${id}.ontologyType`,
        ),
        families: uniqueStrings(source.families, `concept ${id}.families`),
        scale: nonEmptyString(source.scale, `concept ${id}.scale`),
        strata: uniqueStrings(source.strata, `concept ${id}.strata`),
        editorialStatus: "published",
        bindings,
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));

  const relations = authorizedRelationIds
    .map((id) => {
      const source = relationIndex.get(id);
      const review = relationReviewIndex.get(id);
      if (!source) fail(`authorized relation ${id} does not exist.`);
      if (!review) fail(`authorized relation ${id} has no editorial review.`);
      if (review.includeInFirstRelease !== true) {
        fail(`relation ${id} is not eligible for the first release.`);
      }
      if (typeof source.scope === "string" && source.scope.trim()) {
        fail(`relation ${id} depends on scope that the runtime contract cannot represent.`);
      }
      if (!authorizedConceptSet.has(source.subject)) {
        fail(`relation ${id} has unauthorized subject ${source.subject}.`);
      }
      if (!authorizedConceptSet.has(source.object)) {
        fail(`relation ${id} has unauthorized object ${source.object}.`);
      }
      const predicate = nonEmptyString(source.predicate, `relation ${id}.predicate`);
      if (!allowedPredicates.has(predicate)) fail(`relation ${id} has unknown predicate ${predicate}.`);
      validateSourceReferences(source, sourceRegistry, `relation ${id}`);
      validateReviewSources(review, sourceIndex, `relation review ${id}`);
      return {
        id,
        subject: source.subject,
        predicate,
        object: source.object,
        editorialStatus: "published",
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));

  const prerequisites = authorizedPrerequisiteIds
    .map((id) => {
      const source = prerequisiteIndex.get(id);
      if (!source) fail(`authorized prerequisite ${id} does not exist.`);
      if (!authorizedConceptSet.has(source.prerequisite)) {
        fail(`prerequisite ${id} has unauthorized source ${source.prerequisite}.`);
      }
      if (!authorizedConceptSet.has(source.concept)) {
        fail(`prerequisite ${id} has unauthorized target ${source.concept}.`);
      }
      const strength = nonEmptyString(source.strength, `prerequisite ${id}.strength`);
      if (!new Set(["recommended", "important"]).has(strength)) {
        fail(`prerequisite ${id} has unknown strength ${strength}.`);
      }
      return {
        id,
        prerequisite: source.prerequisite,
        concept: source.concept,
        strength,
        rationale: bilingual(source.rationale, `prerequisite ${id}.rationale`),
        editorialStatus: "published",
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));

  return {
    concepts,
    relations,
    prerequisites,
    prerequisitePolicy: { ...DEFAULT_POLICY },
  };
}

export function renderPublicKnowledgeModule(catalog) {
  return `/* Generated by apps/web/scripts/build-public-knowledge-catalog.mjs. Do not edit.\n * The publication manifest is the only authorization boundary.\n */\nimport type { KnowledgeCatalog } from "./knowledge-types.js";\n\nexport const GENERATED_PUBLIC_KNOWLEDGE_SOURCE = ${JSON.stringify(catalog, null, 2)} satisfies KnowledgeCatalog;\n`;
}

export function writePublicKnowledgeModule(output, input) {
  const catalog = createPublicKnowledgeCatalog(input);
  fs.writeFileSync(output, renderPublicKnowledgeModule(catalog));
  return catalog;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function buildPublicKnowledgeCatalog(root = defaultRoot) {
  const designRoot = path.join(root, "docs/design/gam-03b");
  const input = {
    conceptsCatalog: readJson(path.join(designRoot, "concepts.json")),
    relationsCatalog: readJson(path.join(designRoot, "relations.json")),
    learningCatalog: readJson(path.join(designRoot, "learning-paths.json")),
    editorialBatch: readJson(
      path.join(designRoot, "content-01-editorial-batch.json"),
    ),
    manifest: readJson(path.join(designRoot, "publication-manifest.json")),
  };
  const output = path.join(
    root,
    "apps/web/src/features/recovery-dashboard/knowledge/public-knowledge-catalog.generated.ts",
  );
  const catalog = writePublicKnowledgeModule(output, input);
  process.stdout.write(
    `public knowledge catalog: ${catalog.concepts.length} concepts, ${catalog.relations.length} relations, ${catalog.prerequisites.length} prerequisites\n`,
  );
  return catalog;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  buildPublicKnowledgeCatalog();
}
