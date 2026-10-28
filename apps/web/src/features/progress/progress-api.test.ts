import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const api = readFileSync(new URL("./progress-api.ts", import.meta.url), "utf8");
const hook = readFileSync(new URL("./useProgress.ts", import.meta.url), "utf8");
const demo = readFileSync(new URL("./progress-demo.ts", import.meta.url), "utf8");
const home = readFileSync(
  new URL("../recovery-dashboard/components/PreviewHome.tsx", import.meta.url),
  "utf8",
);

test("LIVE client uses GET and PATCH /me/progress", () => {
  assert.match(api, /apiRequest/);
  assert.match(api, /\/me\/progress/);
  assert.match(api, /method: "PATCH"/);
  assert.match(api, /equippedTitleId/);
  assert.match(api, /parseProgressPayload/);
});

test("DEMO fixture and PreviewHome do not call the progress API yet", () => {
  assert.equal(demo.includes("apiRequest"), false);
  assert.equal(demo.includes("/me/progress"), false);
  assert.equal(home.includes("useProgress"), false);
  assert.equal(home.includes("/me/progress"), false);
  assert.equal(home.includes("HomeProgressIdentity"), false);
  assert.equal(home.includes("TitleEmblem"), false);
  assert.equal(home.includes("TitlePicker"), false);
});

test("LIVE hook never substitutes DEMO data on error", () => {
  assert.match(hook, /live: boolean/);
  assert.match(hook, /fetchMyProgress/);
  assert.match(hook, /setProgress\(null\)/);
  assert.match(hook, /setState\("error"\)/);
  assert.match(hook, /if \(!live\)/);
  assert.match(hook, /buildDemoProgress\(\)/);
  assert.match(
    hook,
    /setProgress\(null\);\s*setState\("error"\)/,
  );
});
