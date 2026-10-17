/**
 * Builds the preview achievement catalog from the Soma 1.0 sources.
 *
 * Reads:
 *   apps/api/prisma/seed/achievements.ts
 *   apps/api/prisma/seed/recovery-curves.ts
 *   apps/web/src/i18n/locales/es/achievements.json
 *   apps/web/src/i18n/locales/es/organs.json
 *   apps/web/src/i18n/locales/es/substances.json
 *
 * Writes:
 *   apps/web/src/features/recovery-dashboard/achievement-catalog.generated.ts
 *
 * The web app imports that file. It does not import Prisma or the API.
 * `pnpm --filter @soma/web build` and `dev` run this script first, so the
 * generated catalog cannot drift from the seed while those commands are used.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const seedPath = path.join(root, "apps/api/prisma/seed/achievements.ts");
const curvesPath = path.join(root, "apps/api/prisma/seed/recovery-curves.ts");
const copyPath = path.join(root, "apps/web/src/i18n/locales/es/achievements.json");
const organsPath = path.join(root, "apps/web/src/i18n/locales/es/organs.json");
const substancesPath = path.join(root, "apps/web/src/i18n/locales/es/substances.json");
const outPath = path.join(
  root,
  "apps/web/src/features/recovery-dashboard/achievement-catalog.generated.ts",
);

const TIERS = new Set(["bronze", "silver", "gold", "platinum"]);

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function arrayBody(source) {
  const marker = source.indexOf("] satisfies");
  if (marker === -1) throw new Error("Could not find the seed array terminator.");
  return source.slice(0, marker);
}

function parseAchievements(source) {
  const body = arrayBody(source);
  const items = [];
  let id = null;
  let tier = null;
  let organId = null;
  let substanceId = null;
  let threshold = null;

  for (const line of body.split(/\n/)) {
    const idMatch = line.match(/^\s+id:\s*"([^"]+)"/);
    const tierMatch = line.match(/tier:\s*"(bronze|silver|gold|platinum)"/);
    const organMatch = line.match(/triggerOrganId:\s*"([^"]+)"/);
    const substanceMatch = line.match(/triggerSubstanceId:\s*"([^"]+)"/);
    const thresholdMatch = line.match(/triggerRecoveryThreshold:\s*([0-9.]+)/);

    if (idMatch) id = idMatch[1];
    if (tierMatch) tier = tierMatch[1];
    if (organMatch) organId = organMatch[1];
    if (substanceMatch) substanceId = substanceMatch[1];
    if (thresholdMatch) threshold = Number(thresholdMatch[1]);

    if (id && tier && organId && substanceId && threshold !== null) {
      items.push({ id, tier, organId, substanceId, threshold, hidden: false });
      id = null;
      tier = null;
      organId = null;
      substanceId = null;
      threshold = null;
    } else if (/hidden:\s*true/.test(line)) {
      const last = items.at(-1);
      if (!last) throw new Error(`hidden flag before any achievement near: ${line}`);
      last.hidden = true;
    }
  }

  const declared = [...body.matchAll(/^\s+id:\s*"([^"]+)"/gm)].map((match) => match[1]);
  if (declared.length !== items.length) {
    throw new Error(`Parsed ${items.length} achievements but found ${declared.length} ids.`);
  }
  return items;
}

function parseCurves(source) {
  const body = arrayBody(source);
  const pairs = new Set();
  let substanceId = null;
  let organId = null;
  for (const line of body.split(/\n/)) {
    const substanceMatch = line.match(/substanceId:\s*"([^"]+)"/);
    const organMatch = line.match(/organId:\s*"([^"]+)"/);
    if (substanceMatch) substanceId = substanceMatch[1];
    if (organMatch) organId = organMatch[1];
    if (substanceId && organId) {
      pairs.add(`${organId}|${substanceId}`);
      substanceId = null;
      organId = null;
    }
  }
  if (pairs.size === 0) throw new Error("No recovery curves parsed.");
  return pairs;
}

const achievements = parseAchievements(read(seedPath));
const curves = parseCurves(read(curvesPath));
const copy = JSON.parse(read(copyPath));
const organs = JSON.parse(read(organsPath));
const substances = JSON.parse(read(substancesPath));

if (typeof copy.hidden?.title !== "string" || typeof copy.hidden?.description !== "string") {
  throw new Error("Spanish hidden achievement copy is missing.");
}

const catalog = achievements.map((item) => {
  if (!TIERS.has(item.tier)) throw new Error(`Unknown tier for ${item.id}`);
  const entry = copy[item.id];
  if (!entry?.title || !entry?.description) {
    throw new Error(`Missing Spanish copy for ${item.id}`);
  }
  const substanceName = substances[item.substanceId]?.name;
  const organName = organs[item.organId];
  if (typeof substanceName !== "string") {
    throw new Error(`Missing Spanish substance name for ${item.substanceId}`);
  }
  if (typeof organName !== "string") {
    throw new Error(`Missing Spanish organ name for ${item.organId} (${item.id})`);
  }
  return {
    id: item.id,
    tier: item.tier,
    substanceId: item.substanceId,
    substanceName,
    organId: item.organId,
    organName,
    threshold: item.threshold,
    hidden: item.hidden,
    ruleReview: !curves.has(`${item.organId}|${item.substanceId}`),
    title: entry.title,
    description: entry.description,
  };
});

const ids = new Set(catalog.map((item) => item.id));
if (ids.size !== catalog.length) throw new Error("Duplicate achievement ids.");

const file = `/* Generated by apps/web/scripts/build-achievement-catalog.mjs. Do not edit.
 * Sources: achievements seed, recovery-curve seed, and Spanish locale files.
 * Refresh with pnpm --filter @soma/web build or pnpm --filter @soma/web dev.
 */
export const achievementHiddenCopy = ${JSON.stringify(
  { title: copy.hidden.title, description: copy.hidden.description },
  null,
  2,
)} as const;

export const achievementCatalog = ${JSON.stringify(catalog, null, 2)} as const;
`;

fs.writeFileSync(outPath, file);
const hidden = catalog.filter((item) => item.hidden).length;
const review = catalog.filter((item) => item.ruleReview).length;
console.log(
  `achievement catalog: ${catalog.length} items, ${hidden} hidden, ${review} pending rule review`,
);
