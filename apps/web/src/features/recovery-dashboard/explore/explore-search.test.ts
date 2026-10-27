import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enExplore from "../../../i18n/locales/en/explore.json" with { type: "json" };
import esExplore from "../../../i18n/locales/es/explore.json" with { type: "json" };
import enSubstances from "../../../i18n/locales/en/substances.json" with { type: "json" };
import esSubstances from "../../../i18n/locales/es/substances.json" with { type: "json" };
import {
  foldSearchText,
  localizedCatalogLabel,
  neurotransmitterSearchHaystack,
  searchHaystackIncludes,
  substanceSearchHaystack,
  systemSearchHaystack,
} from "./explore-search.ts";

const SUBSTANCE_IDS = ["alcohol", "nicotine", "cannabis", "cocaine", "caffeine"] as const;

function nestedKeys(value: unknown, prefix = ""): string[] {
  if (!value || typeof value !== "object") return prefix ? [prefix] : [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof nested === "object" && nested !== null ? nestedKeys(nested, path) : [path];
  });
}

test("spanish and english explore bundles expose the same keys", () => {
  assert.deepEqual(nestedKeys(esExplore).sort(), nestedKeys(enExplore).sort());
});

test("five substances resolve localized name and description in es and en", () => {
  for (const id of SUBSTANCE_IDS) {
    const es = esSubstances[id];
    const en = enSubstances[id];
    assert.ok(es?.name && es.shortDescription);
    assert.ok(en?.name && en.shortDescription);
    assert.equal(localizedCatalogLabel(es.name, "API", id), es.name);
    assert.equal(localizedCatalogLabel(en.name, "API", id), en.name);
    assert.equal(
      localizedCatalogLabel(es.shortDescription, "API desc", id),
      es.shortDescription,
    );
    assert.equal(
      localizedCatalogLabel(en.shortDescription, "API desc", id),
      en.shortDescription,
    );
  }
  assert.equal(esSubstances.cocaine.name, "Cocaína");
  assert.equal(enSubstances.cocaine.name, "Cocaine");
  assert.notEqual(esSubstances.nicotine.name, enSubstances.nicotine.name);
});

test("spanish search matches cocaine with and without accents", () => {
  const haystack = substanceSearchHaystack({
    localizedName: esSubstances.cocaine.name,
    localizedDescription: esSubstances.cocaine.shortDescription,
    catalogName: "Cocaine",
    catalogDescription: "Powerful stimulant",
    category: "stimulant",
    categoryLabel: esExplore.categories.stimulant,
  });
  assert.equal(searchHaystackIncludes(haystack, "cocaina"), true);
  assert.equal(searchHaystackIncludes(haystack, "cocaína"), true);
  assert.equal(searchHaystackIncludes(haystack, "COCAÍNA"), true);
  assert.equal(searchHaystackIncludes(haystack, "alcohol"), false);
});

test("english search matches cocaine by english spelling", () => {
  const haystack = substanceSearchHaystack({
    localizedName: enSubstances.cocaine.name,
    localizedDescription: enSubstances.cocaine.shortDescription,
    catalogName: "Cocaine",
    catalogDescription: enSubstances.cocaine.shortDescription,
    category: "stimulant",
    categoryLabel: enExplore.categories.stimulant,
  });
  assert.equal(searchHaystackIncludes(haystack, "cocaine"), true);
  assert.equal(searchHaystackIncludes(haystack, "Cocaine"), true);
});

test("switching language changes searchable labels without a page reload", () => {
  const query = "nicotina";
  const esHaystack = substanceSearchHaystack({
    localizedName: esSubstances.nicotine.name,
    localizedDescription: esSubstances.nicotine.shortDescription,
    catalogName: "Nicotine",
    catalogDescription: "API",
    category: "nicotine",
    categoryLabel: esExplore.categories.nicotine,
  });
  const enHaystack = substanceSearchHaystack({
    localizedName: enSubstances.nicotine.name,
    localizedDescription: enSubstances.nicotine.shortDescription,
    catalogName: "Nicotine",
    catalogDescription: "API",
    category: "nicotine",
    categoryLabel: enExplore.categories.nicotine,
  });
  assert.equal(searchHaystackIncludes(esHaystack, query), true);
  assert.equal(foldSearchText(enSubstances.nicotine.name).includes("nicotina"), false);
  assert.equal(searchHaystackIncludes(enHaystack, "nicotine"), true);
  assert.notEqual(esExplore.title, enExplore.title);
  assert.equal(esExplore.eyebrow, "Explorar");
  assert.equal(enExplore.eyebrow, "Explore");
});

test("missing translation falls back to the catalog value", () => {
  assert.equal(localizedCatalogLabel(undefined, "Nicotine", "nicotine"), "Nicotine");
  assert.equal(localizedCatalogLabel("", "Nicotine", "nicotine"), "Nicotine");
  assert.equal(localizedCatalogLabel("nicotine", "Nicotine", "nicotine"), "Nicotine");
  assert.equal(localizedCatalogLabel("nicotine.name", "Nicotine", "nicotine"), "Nicotine");
  assert.equal(localizedCatalogLabel("Nicotina", "Nicotine", "nicotine"), "Nicotina");
});

test("system search uses localized organ labels", () => {
  const haystack = systemSearchHaystack({
    localizedName: esExplore.systems.hepatic,
    catalogName: "Sistema hepático",
    organLabels: ["Hígado", "liver"],
  });
  assert.equal(searchHaystackIncludes(haystack, "higado"), true);
  assert.equal(searchHaystackIncludes(haystack, "pancreas"), false);
});

test("neurotransmitter search matches spanish and english labels", () => {
  const esHaystack = neurotransmitterSearchHaystack({
    id: "dopamine",
    localizedName: "Dopamina",
    localizedDescription: "Recompensa, motivación, placer",
    catalogName: "dopamine",
    catalogDescription: "",
    relatedLabels: ["Alcohol", "Cocaína"],
  });
  const enHaystack = neurotransmitterSearchHaystack({
    id: "dopamine",
    localizedName: "Dopamine",
    localizedDescription: "Reward, motivation, pleasure",
    catalogName: "dopamine",
    catalogDescription: "",
    relatedLabels: ["Alcohol", "Cocaine"],
  });
  assert.equal(searchHaystackIncludes(esHaystack, "dopamina"), true);
  assert.equal(searchHaystackIncludes(esHaystack, "recompensa"), true);
  assert.equal(searchHaystackIncludes(enHaystack, "dopamine"), true);
  assert.equal(searchHaystackIncludes(enHaystack, "reward"), true);
  assert.equal(searchHaystackIncludes(esHaystack, "higado"), false);
});

test("explore page wires the explore namespace (source)", () => {
  const page = readFileSync(new URL("../pages/ExplorePage.tsx", import.meta.url), "utf8");
  const config = readFileSync(new URL("../../../i18n/config.ts", import.meta.url), "utf8");
  assert.match(page, /useTranslation\("explore"\)/);
  assert.match(page, /ns: "substances"/);
  assert.match(page, /ns: "organs"/);
  assert.match(page, /searchHaystackIncludes/);
  assert.equal(page.includes("exploreSubstances"), false);
  assert.match(config, /"explore"/);
  assert.match(config, /explore: esExplore/);
});

test("search still matches localized names after educational copy replaces counters", () => {
  const haystack = substanceSearchHaystack({
    localizedName: esSubstances.cannabis.name,
    localizedDescription: esSubstances.cannabis.shortDescription,
    catalogName: "Cannabis",
    catalogDescription: "API",
    category: "cannabinoid",
    categoryLabel: esExplore.categories.cannabinoid,
  });
  assert.equal(searchHaystackIncludes(haystack, "cannabis"), true);
  assert.equal(searchHaystackIncludes(haystack, "memoria"), true);
});
