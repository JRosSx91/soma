import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import enSupport from "../../../i18n/locales/en/support.json" with { type: "json" };
import esSupport from "../../../i18n/locales/es/support.json" with { type: "json" };
import { ShellBaseProvider } from "../context/ShellBaseContext.js";
import type { ShellBase } from "../shell-base.js";
import { SupportSections } from "./SupportSections.js";
import { SupportSupportGuide } from "./SupportSupportGuide.js";
import {
  SUPPORT_GUIDE_ANCHOR_ID,
  SUPPORT_GUIDE_SECTION_IDS,
  SUPPORT_HELP_PANEL_HASH,
  SUPPORT_STRATEGIES_PANEL_HASH,
  emptyGuideChecked,
  supportGuideHelpHref,
  supportGuideStrategiesHref,
  toggleGuideChecked,
} from "./support-guide.js";
import { SUPPORT_BREATHING_ANCHOR_ID, supportBreathingHref } from "./support-strategies.js";
import { SUPPORT_TERMS_EMERGENCY_HREF } from "./support-links.js";

async function withSupportI18n(lng: "es" | "en", tree: ReactElement) {
  const instance = i18n.createInstance();
  await instance.use(initReactI18next).init({
    lng,
    resources: { es: { support: esSupport }, en: { support: enSupport } },
    interpolation: { escapeValue: false },
  });
  return renderToStaticMarkup(createElement(I18nextProvider, { i18n: instance }, tree));
}

async function renderGuide(
  base: ShellBase,
  lng: "es" | "en",
  initialChecked = emptyGuideChecked(),
) {
  return withSupportI18n(
    lng,
    createElement(
      MemoryRouter,
      { initialEntries: [`${base}/support`] },
      createElement(
        ShellBaseProvider,
        { base },
        createElement(SupportSupportGuide, { initialChecked }),
      ),
    ),
  );
}

async function renderHub(base: ShellBase, lng: "es" | "en") {
  return withSupportI18n(
    lng,
    createElement(
      MemoryRouter,
      { initialEntries: [`${base}/support`] },
      createElement(ShellBaseProvider, { base }, createElement(SupportSections)),
    ),
  );
}

test("guide exposes four educational sections without personal inputs", async () => {
  assert.deepEqual([...SUPPORT_GUIDE_SECTION_IDS], [
    "moments",
    "tools",
    "people",
    "professional",
  ]);
  for (const base of ["/app", "/preview"] as const) {
    for (const lng of ["es", "en"] as const) {
      const markup = await renderGuide(base, lng);
      assert.match(markup, new RegExp(`id="${SUPPORT_GUIDE_ANCHOR_ID}"`));
      assert.match(markup, /data-support-guide/);
      assert.match(markup, /data-support-guide-privacy/);
      for (const id of SUPPORT_GUIDE_SECTION_IDS) {
        assert.match(markup, new RegExp(`data-support-guide-section="${id}"`));
        assert.match(markup, new RegExp(`data-support-guide-check="${id}"`));
        assert.match(markup, new RegExp(`type="checkbox"[^>]*data-support-guide-check="${id}"|data-support-guide-check="${id}"[^>]*type="checkbox"`));
      }
      assert.equal(markup.includes("<textarea"), false);
      assert.equal(markup.includes('type="text"'), false);
      assert.equal(markup.includes('type="tel"'), false);
      assert.equal(markup.includes('type="email"'), false);
      assert.equal(markup.includes("<form"), false);
      assert.equal(markup.includes("tel:"), false);
      assert.doesNotMatch(markup, /role="progressbar"|aria-valuenow|<progress/);
    }
  }
});

test("checkbox helpers toggle and reset without persistence primitives", () => {
  const empty = emptyGuideChecked();
  assert.deepEqual(empty, {
    moments: false,
    tools: false,
    people: false,
    professional: false,
  });
  const once = toggleGuideChecked(empty, "tools");
  assert.equal(once.tools, true);
  assert.equal(once.moments, false);
  const twice = toggleGuideChecked(once, "tools");
  assert.equal(twice.tools, false);
  assert.deepEqual(emptyGuideChecked(), empty);

  const guideSource = readFileSync(new URL("./SupportSupportGuide.tsx", import.meta.url), "utf8");
  assert.match(guideSource, /useState<SupportGuideChecked>/);
  assert.match(guideSource, /toggleGuideChecked/);
  assert.match(guideSource, /emptyGuideChecked\(\)/);
  assert.doesNotMatch(guideSource, /localStorage|sessionStorage|indexedDB|cookie|fetch\(/i);
  assert.doesNotMatch(guideSource, /URLSearchParams|history\.replaceState|searchParams/);
});

test("checked initial state and reset control render for session-only marks", async () => {
  const unchecked = await renderGuide("/preview", "es");
  assert.match(unchecked, /data-support-guide-reset/);
  assert.match(unchecked, /disabled/);
  assert.equal((unchecked.match(/checked(?:=\{?true\}?|=\"\"|=\"checked\")?/g) ?? []).length, 0);

  const checked = await renderGuide("/app", "en", {
    moments: true,
    tools: false,
    people: true,
    professional: false,
  });
  assert.match(checked, /data-support-guide-check="moments"[^>]*checked|checked[^>]*data-support-guide-check="moments"/);
  assert.match(checked, /data-support-guide-check="people"[^>]*checked|checked[^>]*data-support-guide-check="people"/);
  assert.doesNotMatch(
    checked,
    /data-support-guide-check="tools"[^>]*checked|checked[^>]*data-support-guide-check="tools"/,
  );
});

test("guide links reuse published Support destinations in DEMO and LIVE", async () => {
  for (const base of ["/app", "/preview"] as const) {
    assert.equal(supportBreathingHref(base), `${base}/support#${SUPPORT_BREATHING_ANCHOR_ID}`);
    assert.equal(
      supportGuideStrategiesHref(base),
      `${base}/support#${SUPPORT_STRATEGIES_PANEL_HASH}`,
    );
    assert.equal(supportGuideHelpHref(base), `${base}/support#${SUPPORT_HELP_PANEL_HASH}`);

    const markup = await renderGuide(base, "es");
    assert.ok(markup.includes(`href="${supportBreathingHref(base)}"`));
    assert.ok(markup.includes(`href="${supportGuideStrategiesHref(base)}"`));
    assert.ok(markup.includes(`href="${supportGuideHelpHref(base)}"`));
    assert.ok(markup.includes(`href="${SUPPORT_TERMS_EMERGENCY_HREF}"`));
    assert.equal(markup.includes("data-support-guide-link=\"people\""), false);
    assert.doesNotMatch(markup, /https?:\/\/|tel:/);
  }
});

test("guide checkboxes are native interactive inputs without readOnly", () => {
  const guideSource = readFileSync(new URL("./SupportSupportGuide.tsx", import.meta.url), "utf8");
  assert.match(guideSource, /type="checkbox"/);
  assert.match(guideSource, /checked=\{checked\[id\]\}/);
  assert.match(guideSource, /onChange=\{/);
  assert.match(guideSource, /htmlFor=\{checkboxId\}/);
  assert.doesNotMatch(guideSource, /readOnly|aria-readonly|aria-disabled/);
  assert.doesNotMatch(guideSource, /role="checkbox"/);
});

test("SupportPage scrolls allow-listed in-page hashes used by the guide", () => {
  const page = readFileSync(new URL("../pages/SupportPage.tsx", import.meta.url), "utf8");
  assert.match(page, /SUPPORT_HASH_SCROLL_IDS/);
  assert.match(page, /SUPPORT_STRATEGIES_PANEL_HASH/);
  assert.match(page, /SUPPORT_HELP_PANEL_HASH/);
  assert.match(page, /SUPPORT_GUIDE_ANCHOR_ID/);
  assert.match(page, /scrollIntoView\(\{ block: "start" \}\)/);
  assert.match(page, /SUPPORT_BREATHING_ANCHOR_ID/);
  assert.match(page, /focus\(\{ preventScroll: true \}\)/);
});

test("hub mounts the guide with ES/EN titles and no clinical claims", async () => {
  const es = await renderHub("/preview", "es");
  const en = await renderHub("/app", "en");
  assert.match(es, /data-support-guide/);
  assert.match(en, /data-support-guide/);
  assert.ok(es.includes(esSupport.plan.title));
  assert.ok(en.includes(enSupport.plan.title));
  assert.ok(es.includes(esSupport.plan.privacy));
  assert.ok(en.includes(enSupport.plan.privacy));
  for (const id of SUPPORT_GUIDE_SECTION_IDS) {
    assert.ok(es.includes(esSupport.plan.sections[id].title));
    assert.ok(en.includes(enSupport.plan.sections[id].title));
  }
  const copy = JSON.stringify({ es: esSupport.plan, en: enSupport.plan });
  assert.doesNotMatch(copy, /previene reca|prevents? relapse|diagn[oó]stic|treatment plan|plan cl[ií]nico individual|supervisi[oó]n profesional|garantiza bienestar/i);
  assert.doesNotMatch(copy, /\b112\b|\b024\b/);
});
