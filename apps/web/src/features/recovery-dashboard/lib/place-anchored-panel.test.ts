import assert from "node:assert/strict";
import { test } from "node:test";
import { placeAnchoredPanel } from "./place-anchored-panel.ts";

test("anchored panels stay inside the viewport", () => {
  const previous = {
    innerWidth: globalThis.innerWidth,
    innerHeight: globalThis.innerHeight,
  };
  Object.defineProperty(globalThis, "innerWidth", { configurable: true, value: 1024 });
  Object.defineProperty(globalThis, "innerHeight", { configurable: true, value: 768 });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: globalThis,
  });

  const trigger = {
    getBoundingClientRect: () => ({
      left: 900,
      right: 940,
      top: 20,
      bottom: 56,
      width: 40,
      height: 36,
    }),
  } as HTMLElement;
  const panel = {
    offsetWidth: 352,
    style: {} as CSSStyleDeclaration,
  } as HTMLElement;

  placeAnchoredPanel(trigger, panel, { align: "end", width: 280 });
  const left = Number.parseFloat(panel.style.left);
  const top = Number.parseFloat(panel.style.top);
  const width = Number.parseFloat(panel.style.width);
  assert.equal(width, 280);
  assert.ok(left >= 8);
  assert.ok(left + width <= window.innerWidth - 8);
  assert.ok(top >= 8);
  assert.ok(Number.parseFloat(panel.style.maxHeight) > 0);
  Object.defineProperty(globalThis, "innerWidth", {
    configurable: true,
    value: previous.innerWidth,
  });
  Object.defineProperty(globalThis, "innerHeight", {
    configurable: true,
    value: previous.innerHeight,
  });
});
