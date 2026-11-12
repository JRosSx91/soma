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
import { SupportStrategySheet } from "./SupportStrategySheet.js";
import { SUPPORT_STRATEGY_TOPICS, SUPPORT_TERMS_EMERGENCY_HREF } from "./support-links.js";
import { getSupportStrategyContent, supportStrategyContent } from "./support-strategy-content.js";
import {
  SUPPORT_BREATHING_ANCHOR_ID,
  SUPPORT_ENABLED_STRATEGY_IDS,
  SUPPORT_STRATEGY_BY_TOPIC,
  SUPPORT_STRATEGY_CONTENT_VERSION,
  SUPPORT_STRATEGY_IDS,
  SUPPORT_STRATEGY_QUERY_KEY,
  isEnabledSupportStrategyId,
  resolveSupportStrategyQueryParam,
  supportBreathingHref,
  supportBreathingLocation,
  supportStrategyEditorialId,
  supportStrategyHref,
  supportStrategyHrefForTopic,
  writeSupportStrategySearchParams,
  type SupportEnabledStrategyId,
} from "./support-strategies.js";

async function withI18n(lng: "es" | "en", tree: ReactElement) {
  const instance = i18n.createInstance();
  await instance.use(initReactI18next).init({
    lng,
    resources: {
      es: { support: esSupport },
      en: { support: enSupport },
    },
    interpolation: { escapeValue: false },
  });
  return renderToStaticMarkup(
    createElement(I18nextProvider, { i18n: instance }, tree),
  );
}

async function renderHub(base: ShellBase, lng: "es" | "en") {
  return withI18n(
    lng,
    createElement(
      MemoryRouter,
      { initialEntries: [`${base}/support`] },
      createElement(ShellBaseProvider, { base }, createElement(SupportSections)),
    ),
  );
}

async function renderSheet(base: ShellBase, id: SupportEnabledStrategyId, lng: "es" | "en") {
  return withI18n(
    lng,
    createElement(
      MemoryRouter,
      { initialEntries: [`${base}/support?strategy=${id}`] },
      createElement(ShellBaseProvider, { base }, createElement(SupportStrategySheet, { strategyId: id })),
    ),
  );
}

test("only the three approved strategy sheets are enabled", () => {
  assert.deepEqual([...SUPPORT_STRATEGY_IDS], [
    "stress.pause",
    "habits.small-routines",
    "emotions.naming",
  ]);
  assert.deepEqual([...SUPPORT_ENABLED_STRATEGY_IDS], [...SUPPORT_STRATEGY_IDS]);
  assert.equal(SUPPORT_STRATEGY_CONTENT_VERSION, "0.1.0");
  assert.equal(SUPPORT_STRATEGY_BY_TOPIC.relapse, null);
  assert.equal(supportStrategyHref("/app", "stress.pause"), "/app/support?strategy=stress.pause");
  assert.equal(supportStrategyHrefForTopic("/preview", "relapse"), null);
  assert.equal(
    supportStrategyHrefForTopic("/preview", "emotions"),
    "/preview/support?strategy=emotions.naming",
  );
  assert.equal(supportStrategyEditorialId("habits.small-routines"), "support.habits.small-routines");
});

test("unknown or blocked strategy query values never resolve", () => {
  assert.equal(resolveSupportStrategyQueryParam(null), null);
  assert.equal(resolveSupportStrategyQueryParam(""), null);
  assert.equal(resolveSupportStrategyQueryParam("relapse"), null);
  assert.equal(resolveSupportStrategyQueryParam("relapse.prevention"), null);
  assert.equal(resolveSupportStrategyQueryParam("consejos.draft"), null);
  assert.equal(resolveSupportStrategyQueryParam("../secrets"), null);
  assert.equal(resolveSupportStrategyQueryParam("stress.pause"), "stress.pause");
  assert.equal(isEnabledSupportStrategyId("emotions.naming"), true);
  assert.equal(isEnabledSupportStrategyId("relapse"), false);

  const cleaned = writeSupportStrategySearchParams(
    new URLSearchParams("strategy=relapse&x=1"),
    null,
  );
  assert.equal(cleaned.get(SUPPORT_STRATEGY_QUERY_KEY), null);
  assert.equal(cleaned.get("x"), "1");

  const page = readFileSync(new URL("../pages/SupportPage.tsx", import.meta.url), "utf8");
  assert.match(page, /resolveSupportStrategyQueryParam/);
  assert.match(page, /writeSupportStrategySearchParams\(current, null\)/);
  assert.match(page, /SupportStrategySheet/);
  assert.match(page, /SupportSections/);
});

test("catalog content exists in ES/EN with public references, not only REF codes", () => {
  for (const id of SUPPORT_ENABLED_STRATEGY_IDS) {
    for (const lng of ["es", "en"] as const) {
      const content = getSupportStrategyContent(id, lng);
      assert.ok(content.title.trim());
      assert.ok(content.intro.length >= 2);
      assert.ok(content.options.length >= 3);
      assert.ok(content.precautions.length >= 2);
      assert.ok(content.professional.length >= 1);
      assert.ok(content.references.length >= 2);
      for (const ref of content.references) {
        assert.ok(ref.organization.trim());
        assert.ok(ref.title.trim());
        assert.match(ref.refId, /^REF-/);
      }
    }
  }
  assert.match(supportStrategyContent["habits.small-routines"].es.understand.join("\n"), /insomnio/);
  assert.doesNotMatch(
    supportStrategyContent["habits.small-routines"].es.understand.join("\n"),
    /del insomnia/,
  );
  assert.match(
    supportStrategyContent["emotions.naming"].es.professional.join("\n"),
    /recurres al consumo de sustancias/,
  );
  assert.match(
    supportStrategyContent["emotions.naming"].en.professional.join("\n"),
    /turn to substance use/,
  );
  assert.match(
    supportStrategyContent["stress.pause"].es.precautions.join("\n"),
    /valoración médica urgente/,
  );
});

test("strategy sheets open with shareable content in DEMO and LIVE, ES and EN", async () => {
  for (const base of ["/app", "/preview"] as const) {
    for (const id of SUPPORT_ENABLED_STRATEGY_IDS) {
      for (const lng of ["es", "en"] as const) {
        const markup = await renderSheet(base, id, lng);
        assert.match(markup, new RegExp(`data-strategy-sheet="${id}"`));
        assert.ok(markup.includes(getSupportStrategyContent(id, lng).title));
        assert.ok(markup.includes(lng === "es" ? esSupport.strategies.back : enSupport.strategies.back));
        assert.match(markup, /data-strategy-ref="REF-/);
        assert.ok(markup.includes(`href="${base}/support"`));
        assert.doesNotMatch(markup, /data-strategy="relapse"/);
        assert.equal(markup.includes("localStorage"), false);
        assert.equal(markup.includes("<button"), false);
      }
    }
  }
});

test("relapse stays planned and unauthorized content never appears", async () => {
  for (const base of ["/app", "/preview"] as const) {
    const hub = await renderHub(base, "es");
    assert.match(hub, /data-strategy="relapse"/);
    assert.match(hub, /data-strategy-state="planned"/);
    assert.equal(hub.includes("strategy=relapse"), false);
    assert.doesNotMatch(hub, /data-strategy-sheet=/);
  }
  assert.equal(resolveSupportStrategyQueryParam("relapse"), null);
  assert.equal(resolveSupportStrategyQueryParam("consejos.draft"), null);
  assert.deepEqual([...SUPPORT_STRATEGY_TOPICS], ["emotions", "relapse", "stress", "habits"]);
});

test("back link and breathing deep-link clear strategy query and preserve the shell base", async () => {
  for (const base of ["/app", "/preview"] as const) {
    assert.deepEqual(supportBreathingLocation(base), {
      pathname: `${base}/support`,
      search: "",
      hash: SUPPORT_BREATHING_ANCHOR_ID,
    });
    assert.equal(supportBreathingHref(base), `${base}/support#${SUPPORT_BREATHING_ANCHOR_ID}`);
  }

  for (const base of ["/app", "/preview"] as const) {
    const markup = await renderSheet(base, "stress.pause", "es");
    assert.ok(markup.includes(`href="${base}/support"`));
    assert.ok(markup.includes(`href="${base}/support#${SUPPORT_BREATHING_ANCHOR_ID}"`));
    assert.equal(markup.includes(`strategy=`), false);
    assert.ok(markup.includes(supportStrategyContent["stress.pause"].es.breathingLinkLabel!));
    assert.equal(markup.includes(SUPPORT_TERMS_EMERGENCY_HREF), true);
    assert.doesNotMatch(markup, /no se releyó|not re-read|timeout|download|íntegramente en esta fase/i);
    assert.match(markup, /NHS/);
    assert.match(markup, /Breathing exercises for stress/);
  }

  const page = readFileSync(new URL("../pages/SupportPage.tsx", import.meta.url), "utf8");
  assert.match(page, /target\.focus\(\{ preventScroll: true \}\)/);
  const breathing = readFileSync(new URL("./BreathingTool.tsx", import.meta.url), "utf8");
  assert.match(breathing, /id=\{SUPPORT_BREATHING_ANCHOR_ID\}/);
  assert.match(breathing, /tabIndex=\{-1\}/);
});

test("enabled strategy rows are links; no clinical tip drafts are wired", async () => {
  const markup = await renderHub("/preview", "en");
  for (const topic of ["emotions", "stress", "habits"] as const) {
    assert.match(markup, new RegExp(`data-strategy="${topic}"`));
    assert.match(markup, /data-strategy-state="available"/);
    const href = supportStrategyHrefForTopic("/preview", topic);
    assert.ok(href);
    assert.ok(markup.includes(`href="${href}"`));
  }
  assert.match(markup, /data-strategy="relapse"/);
  assert.match(markup, /data-strategy-state="planned"/);
  assert.doesNotMatch(markup, /consejos|clinical tip|borrador clínico/i);

  const contentSource = readFileSync(new URL("./support-strategy-content.ts", import.meta.url), "utf8");
  assert.doesNotMatch(contentSource, /"relapse\.|"relapse"/);
});
