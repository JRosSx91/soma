import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { celebrationMedalLayout } from "./celebration-layout.ts";

test("celebration medal layout covers one through fifteen unlocks", () => {
  assert.equal(celebrationMedalLayout(1), "solo");
  assert.equal(celebrationMedalLayout(2), "featured");
  assert.equal(celebrationMedalLayout(3), "featured");
  assert.equal(celebrationMedalLayout(5), "grid");
  assert.equal(celebrationMedalLayout(10), "grid");
  assert.equal(celebrationMedalLayout(15), "grid");
});

test("celebration modal centers in the viewport and scrolls dense groups", () => {
  const source = readFileSync(
    new URL("../components/AchievementCelebrationModal.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /createPortal/);
  assert.match(source, /max-h-\[90dvh\]/);
  assert.match(source, /items-center justify-center/);
  assert.match(source, /celebrationMedalLayout/);
  assert.match(source, /min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-5 pb-6 pt-5/);
  assert.equal(source.includes("top-1/2"), false);
  assert.equal(source.includes("-translate-y-1/2"), false);
});
