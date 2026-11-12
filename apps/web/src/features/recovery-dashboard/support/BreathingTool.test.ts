import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import enSupport from "../../../i18n/locales/en/support.json" with { type: "json" };
import esSupport from "../../../i18n/locales/es/support.json" with { type: "json" };
import {
  breathingSnapshot,
  initialBreathingState,
  pauseBreathing,
  startBreathing,
  type BreathingSnapshot,
} from "./breathing-session.js";
import { BreathingToolView } from "./BreathingTool.js";

const sources = ["./breathing-session.ts", "./useBreathingSession.ts", "./BreathingTool.tsx"].map(
  (path) => readFileSync(new URL(path, import.meta.url), "utf8"),
);
const hook = sources[1] ?? "";
const view = sources[2] ?? "";

const idle = breathingSnapshot(initialBreathingState, 0);
const running = breathingSnapshot(startBreathing(0), 1_200);
const exhaling = breathingSnapshot(startBreathing(0), 5_000);
const paused = breathingSnapshot(pauseBreathing(startBreathing(0), 6_500), 90_000);

async function render(snapshot: BreathingSnapshot, lng: "es" | "en" = "es") {
  const instance = i18n.createInstance();
  await instance.use(initReactI18next).init({
    lng,
    resources: { es: { support: esSupport }, en: { support: enSupport } },
    interpolation: { escapeValue: false },
  });
  return renderToStaticMarkup(
    createElement(
      I18nextProvider,
      { i18n: instance },
      createElement("ul", null, createElement(BreathingToolView, { snapshot })),
    ),
  );
}

function buttons(markup: string): string[] {
  return [...markup.matchAll(/<button[^>]*>([\s\S]*?)<\/button>/g)].map((match) =>
    (match[1] ?? "").replace(/<[^>]+>/g, "").trim(),
  );
}

function liveRegion(markup: string): string {
  const match = markup.match(/<p[^>]*aria-live="polite"[^>]*>([\s\S]*?)<\/p>/);
  assert.ok(match, "live region");
  return match[1] ?? "";
}

test("initial state shows the rhythm, the safety note and only «Comenzar»", async () => {
  const markup = await render(idle);
  assert.match(markup, /data-breathing-status="idle"/);
  assert.ok(markup.includes(esSupport.tools.breathing.title));
  assert.ok(markup.includes(esSupport.tools.breathing.rhythm));
  assert.ok(markup.includes(esSupport.tools.breathing.notice));
  assert.deepEqual(buttons(markup), ["Comenzar"]);
  assert.equal(liveRegion(markup), "");
  assert.doesNotMatch(markup, /Prevista|En preparación/);
});

test("running state shows the phase, its countdown, «Pausar» and «Reiniciar»", async () => {
  const markup = await render(running);
  assert.match(markup, /data-breathing-status="running"/);
  assert.deepEqual(buttons(markup), ["Pausar", "Reiniciar"]);
  assert.ok(markup.includes(">Inspira<"));
  assert.ok(markup.includes(">3 s<"));
  assert.equal(liveRegion(markup), "Inspira");
  const out = await render(exhaling);
  assert.ok(out.includes(">Espira<"));
  assert.ok(out.includes(">5 s<"));
  assert.equal(liveRegion(out), "Espira");
});

test("paused state keeps phase and time and offers «Continuar» and «Reiniciar»", async () => {
  const markup = await render(paused);
  assert.match(markup, /data-breathing-status="paused"/);
  assert.deepEqual(buttons(markup), ["Continuar", "Reiniciar"]);
  assert.ok(markup.includes(">Espira<"));
  assert.ok(markup.includes(">4 s<"));
  assert.equal(liveRegion(markup), "Ejercicio pausado");
  const circle = markup.match(/<span data-breathing-circle[^>]*>/)?.[0] ?? "";
  assert.match(circle, /transform:scale\(0\.8417\)/);
  assert.doesNotMatch(circle, /animation:/);
});

test("English labels cover every state", async () => {
  assert.deepEqual(buttons(await render(idle, "en")), ["Start"]);
  const en = await render(running, "en");
  assert.deepEqual(buttons(en), ["Pause", "Restart"]);
  assert.equal(liveRegion(en), "Breathe in");
  const enPaused = await render(paused, "en");
  assert.deepEqual(buttons(enPaused), ["Resume", "Restart"]);
  assert.equal(liveRegion(enPaused), "Exercise paused");
  assert.ok((await render(exhaling, "en")).includes(">Breathe out<"));
});

test("controls are semantic, grouped, labelled and keyboard focusable", async () => {
  for (const snapshot of [idle, running, paused]) {
    const markup = await render(snapshot);
    const tags = [...markup.matchAll(/<button[^>]*>/g)].map((match) => match[0]);
    assert.ok(tags.length > 0);
    for (const tag of tags) {
      assert.match(tag, /type="button"/);
      assert.match(tag, /focus-visible:/);
      assert.match(tag, /min-h-11/);
      assert.doesNotMatch(tag, /tabindex="-1"|disabled/);
    }
    assert.match(markup, /role="group" aria-label="Controles de la respiración guiada"/);
    assert.equal((markup.match(/aria-live=/g) ?? []).length, 1);
  }
  assert.doesNotMatch(view, /autoFocus/);
  assert.equal((view.match(/\.focus\(\)/g) ?? []).length, 1);
  assert.match(view, /const onRestart = \(\) => \{\s*session\.reset\(\);\s*primaryRef\.current\?\.focus\(\);/);
});

test("phase is not conveyed by color or animation alone, and the countdown is not live", async () => {
  const markup = await render(running);
  const live = liveRegion(markup);
  assert.doesNotMatch(live, /\d/);
  assert.match(markup, /data-breathing-circle[^>]*aria-hidden="true"/);
});

test("reduced motion disables the circle animation and scaling", async () => {
  const markup = await render(running);
  const circle = markup.match(/<span data-breathing-circle[^>]*>/)?.[0] ?? "";
  assert.match(circle, /motion-reduce:!animate-none/);
  assert.match(circle, /motion-reduce:!\[transform:none\]/);
  assert.match(circle, /animation:soma-breathing-cycle 10000ms linear/);
  assert.doesNotMatch(circle, /transition/);
  assert.match(markup, /<style>@keyframes soma-breathing-cycle/);
});

test("the circle animation is anchored to the session clock, not to the compositor", () => {
  assert.match(view, /animation\.startTime = runStartedAt;/);
  assert.match(view, /\}, \[runStartedAt\]\);/);
});

test("the exercise stores, sends and logs nothing and has no sound or vibration", () => {
  for (const source of sources) {
    assert.doesNotMatch(
      source,
      /localStorage|sessionStorage|document\.cookie|indexedDB|fetch\(|XMLHttpRequest|sendBeacon|navigator\.vibrate|new Audio|AudioContext|Notification|console\./,
    );
    assert.doesNotMatch(source, /setInterval/);
  }
  assert.match(hook, /performance\.now\(\)/);
  assert.match(hook, /visibilitychange/);
  assert.match(hook, /useEffect\(\(\) => \(\) => session\.dispose\(\), \[session\]\)/);
});
