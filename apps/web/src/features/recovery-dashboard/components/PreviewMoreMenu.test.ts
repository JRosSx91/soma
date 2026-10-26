import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("the more menu closes on escape, outside pointer, and navigation", () => {
  const source = readFileSync(new URL("./PreviewMoreMenu.tsx", import.meta.url), "utf8");
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /pointerdown/);
  assert.match(source, /setOpen\(false\);/);
  assert.match(source, /\[pathname\]/);
  assert.match(source, /triggerRef\.current\?\.focus\(\)/);
  assert.match(source, /ArrowDown/);
  assert.match(source, /role="menu"/);
  assert.match(source, /role="menuitem"/);
  assert.match(source, /min-h-11/);
  assert.match(source, /moreShellSections/);
  assert.equal(source.includes("/expedition"), false);
});

test("mobile nav uses four destinations and does not pad a fifth empty slot", () => {
  const mobile = readFileSync(new URL("./PreviewMobileNav.tsx", import.meta.url), "utf8");
  assert.match(mobile, /PreviewMoreMenu/);
  assert.equal(mobile.includes("grid-cols-5"), false);
  assert.match(mobile, /sections\.length \+ 1/);
});
