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

  const sideTrigger = {
    getBoundingClientRect: () => ({
      left: 8,
      right: 72,
      top: 700,
      bottom: 736,
      width: 64,
      height: 36,
    }),
  } as HTMLElement;
  const sidePanel = {
    offsetWidth: 280,
    style: {} as CSSStyleDeclaration,
  } as HTMLElement;
  placeAnchoredPanel(sideTrigger, sidePanel, { anchor: "right", width: 280 });
  const sideLeft = Number.parseFloat(sidePanel.style.left);
  const sideTop = Number.parseFloat(sidePanel.style.top);
  assert.ok(sideLeft >= 72);
  assert.ok(sideLeft + 280 <= window.innerWidth - 8);
  assert.ok(sideTop >= 8);
  assert.ok(sideTop + 160 <= window.innerHeight - 8);

  Object.defineProperty(globalThis, "innerWidth", {
    configurable: true,
    value: previous.innerWidth,
  });
  Object.defineProperty(globalThis, "innerHeight", {
    configurable: true,
    value: previous.innerHeight,
  });
});
