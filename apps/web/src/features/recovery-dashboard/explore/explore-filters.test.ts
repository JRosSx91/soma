import assert from "node:assert/strict";
import { test } from "node:test";
import {
  exploreScopes,
  isExploreScope,
  scopeShowsComingSoonPanels,
  scopeShowsNeurotransmitters,
  scopeShowsSubstances,
  scopeShowsSystems,
} from "./explore-filters.ts";

test("explore scopes are the four implemented filters", () => {
  assert.deepEqual([...exploreScopes], ["all", "substances", "systems", "neurotransmitters"]);
  assert.equal(isExploreScope("all"), true);
  assert.equal(isExploreScope("organs"), false);
  assert.equal(isExploreScope("processes"), false);
  assert.equal(isExploreScope("missions"), false);
});

test("each scope shows the matching educational collections", () => {
  assert.equal(scopeShowsSubstances("all"), true);
  assert.equal(scopeShowsSystems("all"), true);
  assert.equal(scopeShowsNeurotransmitters("all"), true);
  assert.equal(scopeShowsSubstances("substances"), true);
  assert.equal(scopeShowsSystems("substances"), false);
  assert.equal(scopeShowsNeurotransmitters("substances"), false);
  assert.equal(scopeShowsSystems("systems"), true);
  assert.equal(scopeShowsSubstances("systems"), false);
  assert.equal(scopeShowsNeurotransmitters("neurotransmitters"), true);
  assert.equal(scopeShowsSystems("neurotransmitters"), false);
  assert.equal(scopeShowsComingSoonPanels("all", ""), true);
  assert.equal(scopeShowsComingSoonPanels("all", "dopamina"), false);
  assert.equal(scopeShowsComingSoonPanels("systems", ""), false);
});
