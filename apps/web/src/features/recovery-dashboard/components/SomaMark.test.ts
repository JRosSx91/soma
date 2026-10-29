import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("the expeditions lockup keeps the original waveform and english descriptor", () => {
  const source = readFileSync(new URL("./SomaMark.tsx", import.meta.url), "utf8");
  assert.match(source, /viewBox="0 0 28 16"/);
  assert.match(source, /expeditions/);
  assert.match(source, /Soma Expeditions/);
  assert.match(source, />\s*Expeditions\s*</);
  assert.match(source, />\s*soma\s*</);
  assert.match(source, /--soma-shell-accent/);
  assert.match(source, /stroke="currentColor"/);
  assert.equal(source.includes("createLogo"), false);
  assert.equal(source.includes(".png"), false);
});

test("page headings share a CSS atmosphere without photographs", () => {
  const heading = readFileSync(new URL("./PageHeading.tsx", import.meta.url), "utf8");
  const home = readFileSync(new URL("./PreviewHome.tsx", import.meta.url), "utf8");
  const tokens = readFileSync(
    new URL("../../../shared/styles/tokens.css", import.meta.url),
    "utf8",
  );
  const action = tokens.match(/--soma-action:\s*([^;]+);/);
  const shellAccent = tokens.match(/--soma-shell-accent:\s*([^;]+);/);
  assert.ok(action);
  assert.ok(shellAccent);
  assert.notEqual(action[1]?.trim(), shellAccent[1]?.trim());
  assert.match(heading, /ShellHeadingFrame/);
  assert.match(heading, /text-soma-shell-accent/);
  assert.match(heading, /radial-gradient/);
  assert.equal(heading.includes("<img"), false);
  assert.equal(heading.includes(".png"), false);
  assert.match(home, /SectionFrame/);
  assert.match(home, /homeTitleLead/);
  assert.match(home, /--soma-shell-accent/);
  assert.equal(home.includes("common:shell.home"), false);
});
