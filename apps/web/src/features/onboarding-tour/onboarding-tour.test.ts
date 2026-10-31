import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  ONB_ENGINE_IDLE,
  currentStep,
  isLastStep,
  persistStatusFor,
  reduceTour,
} from "./tour-engine.ts";
import {
  ONB_TOUR_STORAGE_PREFIX,
  liveStorageKey,
  readLiveTour,
  shouldOfferLiveContinue,
  shouldOfferLiveInvite,
  shouldResumeLiveTour,
  writeLiveTour,
  writesLiveTourStorage,
} from "./tour-persist.ts";
import {
  ONB_TOUR_STEPS,
  ONB_TOUR_STEP_IDS,
  queryTourAnchor,
  resolveAnchorId,
  tourHref,
} from "./tour-steps.ts";
import { boxFromElement, inflateBox, placeTourCard } from "./tour-layout.ts";
import {
  captureTourLockSnapshot,
  lockTourBackground,
  tourScrollIntoViewOptions,
  unlockTourBackground,
  wrapFocusIndex,
} from "./tour-a11y.ts";

const engineSrc = readFileSync(new URL("./tour-engine.ts", import.meta.url), "utf8");
const persistSrc = readFileSync(new URL("./tour-persist.ts", import.meta.url), "utf8");
const hostSrc = readFileSync(new URL("./TourHost.tsx", import.meta.url), "utf8");
const contextSrc = readFileSync(new URL("./TourContext.tsx", import.meta.url), "utf8");
const account = readFileSync(
  new URL("../recovery-dashboard/pages/AccountPage.tsx", import.meta.url),
  "utf8",
);
const onboardingPage = readFileSync(new URL("../../pages/OnboardingPage.tsx", import.meta.url), "utf8");

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

test("nine steps stay in the agreed order with one model for both shells", () => {
  assert.deepEqual([...ONB_TOUR_STEP_IDS], [
    "home",
    "nav",
    "recovery",
    "explore",
    "anatomy",
    "missions",
    "journal",
    "achievements",
    "account",
  ]);
  assert.equal(ONB_TOUR_STEPS.length, 9);
  assert.deepEqual(
    ONB_TOUR_STEPS.map((step) => step.id),
    [...ONB_TOUR_STEP_IDS],
  );
  assert.equal(ONB_TOUR_STEPS[0].path, "");
  assert.equal(ONB_TOUR_STEPS[2].path, "/recovery");
  assert.equal(ONB_TOUR_STEPS[8].path, "/account");
  assert.equal(ONB_TOUR_STEPS[8].somi, "idle");
  assert.deepEqual(
    ONB_TOUR_STEPS.map((step) => step.somi),
    ["waving", "idle", "thinking", "thinking", "idle", "celebrating", "supportive", "celebrating", "idle"],
  );
});

test("advance, back, start, finish and skip stay inside the engine", () => {
  let state = reduceTour(ONB_ENGINE_IDLE, { type: "start" });
  assert.equal(currentStep(state)?.id, "home");
  state = reduceTour(state, { type: "next" });
  assert.equal(currentStep(state)?.id, "nav");
  state = reduceTour(state, { type: "back" });
  assert.equal(currentStep(state)?.id, "home");
  state = reduceTour(state, { type: "back" });
  assert.equal(currentStep(state)?.id, "home");
  for (let i = 0; i < 8; i += 1) {
    state = reduceTour(state, { type: "next" });
  }
  assert.equal(currentStep(state)?.id, "account");
  assert.equal(isLastStep(state), true);
  const finished = reduceTour(state, { type: "next" });
  assert.equal(finished.phase, "idle");
  const skipped = reduceTour(reduceTour(ONB_ENGINE_IDLE, { type: "start" }), { type: "skip" });
  assert.equal(skipped.phase, "idle");
  const restarted = reduceTour(skipped, { type: "restart" });
  assert.equal(currentStep(restarted)?.id, "home");
});

test("LIVE persistence is keyed by user id and never stores email or tokens", () => {
  const storage = memoryStorage();
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
  try {
    writeLiveTour("user-1", { v: 1, status: "in_progress", stepId: "missions" });
    writeLiveTour("user-2", { v: 1, status: "done", stepId: "account" });
    assert.equal(liveStorageKey("user-1"), `${ONB_TOUR_STORAGE_PREFIX}user-1`);
    assert.equal(readLiveTour("user-1")?.stepId, "missions");
    assert.equal(readLiveTour("user-2")?.status, "done");
    const raw = storage.getItem(`${ONB_TOUR_STORAGE_PREFIX}user-1`) ?? "";
    assert.equal(raw.includes("@"), false);
    assert.equal(raw.toLowerCase().includes("token"), false);
    assert.equal(raw.includes("password"), false);
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});

test("DEMO never auto-invites and LIVE waits for AUTH-01", () => {
  const ready = {
    base: "/app" as const,
    userId: "user-1",
    authLoading: false,
    profileLoading: false,
    onboardingStatus: "completed" as const,
  };
  assert.equal(shouldOfferLiveInvite({ ...ready, base: "/preview" }, null), false);
  assert.equal(shouldOfferLiveInvite({ ...ready, onboardingStatus: "pending" }, null), false);
  assert.equal(shouldOfferLiveInvite({ ...ready, authLoading: true }, null), false);
  assert.equal(shouldOfferLiveInvite({ ...ready, userId: null }, null), false);
  assert.equal(shouldOfferLiveInvite(ready, null), true);
  assert.equal(shouldOfferLiveInvite(ready, { v: 1, status: "dismissed", stepId: "home" }), false);
  assert.equal(
    shouldResumeLiveTour(ready, { v: 1, status: "in_progress", stepId: "journal" }),
    true,
  );
  assert.equal(shouldResumeLiveTour({ ...ready, base: "/preview" }, { v: 1, status: "in_progress", stepId: "journal" }), false);
});

test("routes stay inside the active shell base", () => {
  assert.equal(tourHref("/preview", ONB_TOUR_STEPS[0]), "/preview");
  assert.equal(tourHref("/app", ONB_TOUR_STEPS[5]), "/app/missions");
  assert.equal(tourHref("/preview", ONB_TOUR_STEPS[8]), "/preview/account");
  assert.equal(tourHref("/app", ONB_TOUR_STEPS[3]).startsWith("/preview"), false);
});

test("missing anchors do not block advancing", () => {
  assert.equal(queryTourAnchor("home-title"), null);
  const started = reduceTour(ONB_ENGINE_IDLE, { type: "start" });
  const advanced = reduceTour(started, { type: "next" });
  assert.equal(currentStep(advanced)?.id, "nav");
  assert.equal(resolveAnchorId(ONB_TOUR_STEPS[1], true), "nav-desktop");
  assert.equal(resolveAnchorId(ONB_TOUR_STEPS[1], false), "nav-mobile");
});

test("engine does not mutate account, missions or journal data", () => {
  assert.equal(engineSrc.includes("fetch("), false);
  assert.equal(persistSrc.includes("fetch("), false);
  assert.equal(engineSrc.includes("patch"), false);
  assert.equal(hostSrc.includes("createJournal"), false);
  assert.equal(hostSrc.includes("useMissions"), false);
  assert.equal(contextSrc.includes("saveProfile"), false);
  assert.equal(contextSrc.includes("setOnboardingStatus"), false);
  assert.equal(onboardingPage.includes("OnboardingTour"), false);
  assert.match(account, /TourRestartControl/);
  assert.equal(persistStatusFor(ONB_ENGINE_IDLE, reduceTour(ONB_ENGINE_IDLE, { type: "skip" }), { type: "skip" }), "dismissed");
});

test("Ahora no persists dismissed, does not auto-invite again, and restart stays available", () => {
  const storage = memoryStorage();
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
  try {
    const invited = reduceTour(ONB_ENGINE_IDLE, { type: "offer-invite" });
    const dismissed = reduceTour(invited, { type: "dismiss-invite" });
    assert.equal(dismissed.phase, "idle");
    assert.equal(persistStatusFor(invited, dismissed, { type: "dismiss-invite" }), "dismissed");
    writeLiveTour("user-1", { v: 1, status: "dismissed", stepId: "home" });
    const ready = {
      base: "/app" as const,
      userId: "user-1",
      authLoading: false,
      profileLoading: false,
      onboardingStatus: "completed" as const,
    };
    assert.equal(shouldOfferLiveInvite(ready, readLiveTour("user-1")), false);
    assert.equal(shouldOfferLiveContinue(ready, readLiveTour("user-1")), false);
    const restarted = reduceTour(dismissed, { type: "restart" });
    assert.equal(currentStep(restarted)?.id, "home");
    assert.equal(writesLiveTourStorage("/preview", "user-1"), false);
    assert.equal(writesLiveTourStorage("/app", null), false);
    assert.equal(writesLiveTourStorage("/app", "user-1"), true);
  } finally {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
});

test("in_progress offers a continue prompt without auto-navigating", () => {
  const ready = {
    base: "/app" as const,
    userId: "user-1",
    authLoading: false,
    profileLoading: false,
    onboardingStatus: "completed" as const,
  };
  const stored = { v: 1 as const, status: "in_progress" as const, stepId: "journal" as const };
  assert.equal(shouldOfferLiveContinue(ready, stored), true);
  assert.equal(shouldOfferLiveInvite(ready, stored), false);
  assert.equal(shouldOfferLiveContinue({ ...ready, onboardingStatus: "pending" }, stored), false);
  assert.equal(shouldOfferLiveContinue({ ...ready, authLoading: true }, stored), false);
  assert.equal(shouldOfferLiveContinue({ ...ready, base: "/preview" }, stored), false);

  const offered = reduceTour(ONB_ENGINE_IDLE, { type: "offer-continue", stepId: "journal" });
  assert.equal(offered.phase, "continue");
  assert.equal(currentStep(offered), null);
  assert.equal(
    persistStatusFor(ONB_ENGINE_IDLE, offered, { type: "offer-continue", stepId: "journal" }),
    null,
  );

  const continued = reduceTour(offered, { type: "resume", stepId: "journal" });
  assert.equal(currentStep(continued)?.id, "journal");
  assert.equal(currentStep(continued)?.path, "/journal");

  const declined = reduceTour(offered, { type: "dismiss-invite" });
  assert.equal(declined.phase, "idle");
  assert.equal(persistStatusFor(offered, declined, { type: "dismiss-invite" }), "dismissed");
  assert.match(contextSrc, /offer-continue/);
  assert.equal(contextSrc.includes("run({ type: \"resume\", stepId: stored.stepId })"), false);
  assert.match(hostSrc, /chrome=\{continueMode \? "continue" : "invite"\}/);
});

test("card placement prefers a non-overlapping desktop slot and a compact mobile bottom", () => {
  const hole = { top: 80, left: 80, width: 200, height: 80 };
  const desktop = placeTourCard({
    viewport: { width: 1280, height: 800 },
    card: { width: 360, height: 240 },
    hole,
    desktop: true,
    bottomReserve: 16,
  });
  const cardBox = { ...desktop, width: 360, height: 240 };
  assert.equal(
    cardBox.left < hole.left + hole.width &&
      cardBox.left + cardBox.width > hole.left &&
      cardBox.top < hole.top + hole.height &&
      cardBox.top + cardBox.height > hole.top,
    false,
  );
  const mobile = placeTourCard({
    viewport: { width: 390, height: 844 },
    card: { width: 358, height: 220 },
    hole,
    desktop: false,
    bottomReserve: 72,
  });
  assert.ok(mobile.top > 500);
  assert.equal(boxFromElement(null), null);
  const ring = inflateBox(hole, 10);
  assert.equal(ring.width, 220);
});

test("desktop placement keeps a 16px bottom margin even when the peek would overflow", () => {
  const hole = { top: 40, left: 80, width: 280, height: 48 };
  const viewport = { width: 1280, height: 520 };
  const card = { width: 360, height: 420 };
  const pos = placeTourCard({
    viewport,
    card,
    hole,
    desktop: true,
    bottomReserve: 16,
  });
  assert.ok(pos.top + card.height <= viewport.height - 16);
  assert.ok(pos.top >= 12);
});

test("visual chrome reuses Somi, exit, and a non-blocking invite", () => {
  const chromeSrc = readFileSync(new URL("./TourChrome.tsx", import.meta.url), "utf8");
  const en = readFileSync(new URL("../../i18n/locales/en/onboarding-tour.json", import.meta.url), "utf8");
  const es = readFileSync(new URL("../../i18n/locales/es/onboarding-tour.json", import.meta.url), "utf8");
  assert.match(chromeSrc, /<Somi /);
  assert.match(chromeSrc, /size=\{compact \? "small" : "medium"\}/);
  assert.match(chromeSrc, /onb-somi-peek/);
  assert.match(chromeSrc, /TOUR_SOMI_PEEK/);
  assert.match(chromeSrc, /--onb-somi-out/);
  assert.match(chromeSrc, /--onb-somi-size/);
  assert.match(chromeSrc, /onb-step-status/);
  assert.match(chromeSrc, /onb-progress-bar/);
  assert.match(chromeSrc, /data-onb-spotlight/);
  const chromeCss = readFileSync(new URL("./tour-chrome.css", import.meta.url), "utf8");
  assert.match(chromeCss, /\.onb-somi-peek[\s\S]*pointer-events:\s*none/);
  assert.match(chromeCss, /\.onb-somi-peek\s*\{[^}]*position:\s*absolute/);
  assert.match(chromeCss, /right:\s*0;/);
  assert.match(chromeCss, /\.onb-card-kicker,/);
  assert.match(chromeCss, /\.onb-invite-title/);
  assert.match(chromeCss, /\.onb-progress\s*\{[^}]*padding-top:/);
  assert.match(hostSrc, /onb-card-kicker/);
  assert.match(hostSrc, /t\("tourLabel"\)/);
  assert.match(es, /"tourLabel": "Recorrido"/);
  assert.match(en, /"tourLabel": "Tour"/);
  assert.match(hostSrc, /t\("exit"\)/);
  assert.equal(hostSrc.includes("engineNote"), false);
  assert.match(hostSrc, /dismissInvite/);
  assert.match(es, /"start": "Empezar"/);
  assert.match(es, /"later": "Ahora no"/);
  assert.match(es, /"continueAction": "Continuar"/);
  assert.match(es, /"exit": "Salir"/);
  assert.match(en, /"start": "Start"/);
  assert.equal(en.toLowerCase().includes("clinical measurement"), false);
  assert.equal(es.includes("mediciones clínicas"), false);
  assert.match(es, /¡Bienvenido a Soma!/);
  assert.match(en, /Welcome to Soma!/);
  assert.match(chromeSrc, /getBoundingClientRect/);
});

test("active tour blocks the app while invites stay non-modal", () => {
  const chromeSrc = readFileSync(new URL("./TourChrome.tsx", import.meta.url), "utf8");
  const lockSrc = readFileSync(new URL("./useTourActiveLock.ts", import.meta.url), "utf8");
  const inviteSrc = readFileSync(new URL("./useInviteEscape.ts", import.meta.url), "utf8");
  const a11ySrc = readFileSync(new URL("./tour-a11y.ts", import.meta.url), "utf8");
  const shellSrc = readFileSync(
    new URL("../recovery-dashboard/components/PreviewShell.tsx", import.meta.url),
    "utf8",
  );
  const chromeCss = readFileSync(new URL("./tour-chrome.css", import.meta.url), "utf8");
  assert.match(hostSrc, /data-onb-guard/);
  assert.match(hostSrc, /swallowBackground/);
  assert.match(hostSrc, /onPointerDown=\{swallowBackground\}/);
  assert.match(shellSrc, /data-onb-app-root/);
  assert.equal(shellSrc.includes("inert={lockApp"), false);
  assert.equal(shellSrc.includes("aria-hidden={lockApp"), false);
  assert.match(shellSrc, /<\/div>\s*<OnboardingTourHost \/>/);
  assert.match(lockSrc, /TOUR_APP_ROOT/);
  assert.match(chromeSrc, /aria-modal=\{chrome === "engine"\}/);
  assert.match(hostSrc, /useInviteEscape\(inviting/);
  assert.equal(hostSrc.includes("lock={{ active: true"), true);
  assert.match(lockSrc, /keydown/);
  assert.match(lockSrc, /focusin/);
  assert.match(lockSrc, /Escape/);
  assert.match(lockSrc, /trapTourTab/);
  assert.match(lockSrc, /restoreTourOpener/);
  assert.match(lockSrc, /removeEventListener/);
  assert.match(lockSrc, /focusTourCard\(card\);[\s\S]*lockTourBackground\(root\)/);
  assert.match(lockSrc, /unlockTourBackground\(root, snapshot\);[\s\S]*restoreTourOpener\(openerRef\.current\)/);
  assert.match(inviteSrc, /removeEventListener/);
  assert.match(a11ySrc, /restoreTourOpener/);
  assert.match(a11ySrc, /TOUR_MAIN_FALLBACK_ID/);
  assert.match(chromeSrc, /aria-describedby=\{describedBy\}/);
  assert.match(hostSrc, /describedBy="onb-step-body"/);
  assert.match(hostSrc, /describedBy="onb-invite-body"/);
  assert.match(chromeCss, /prefers-reduced-motion/);
  assert.equal(tourScrollIntoViewOptions().behavior, "auto");
  assert.equal(wrapFocusIndex(3, 2, false), 0);
  assert.equal(wrapFocusIndex(3, 0, true), 2);
  assert.equal(wrapFocusIndex(1, 0, false), 0);
  const started = reduceTour(ONB_ENGINE_IDLE, { type: "start" });
  const skipped = reduceTour(started, { type: "skip" });
  assert.equal(skipped.phase, "idle");
  assert.equal(persistStatusFor(started, skipped, { type: "skip" }), "dismissed");
});

test("narrow viewports keep the compact card above the reserved dock", () => {
  for (const width of [320, 375, 390, 768]) {
    const card = { width: Math.min(360, width - 16), height: 240 };
    const pos = placeTourCard({
      viewport: { width, height: 640 },
      card,
      hole: { top: 40, left: 16, width: 200, height: 40 },
      desktop: false,
      bottomReserve: 72,
    });
    assert.ok(pos.top + card.height <= 640 - 72);
    assert.ok(pos.left >= 0);
  }
  const wide = placeTourCard({
    viewport: { width: 1440, height: 900 },
    card: { width: 360, height: 260 },
    hole: { top: 80, left: 80, width: 180, height: 48 },
    desktop: true,
    bottomReserve: 16,
  });
  assert.ok(wide.top + 260 <= 900 - 16);
});

test("background lock restores prior inert and aria-hidden values", () => {
  function fakeRoot(init: { inert?: boolean; ariaHidden?: string }) {
    const attrs = new Map<string, string>();
    if (init.inert) attrs.set("inert", "");
    if (init.ariaHidden != null) attrs.set("aria-hidden", init.ariaHidden);
    const el = {
      get inert() {
        return attrs.has("inert");
      },
      set inert(value: boolean) {
        if (value) attrs.set("inert", "");
        else attrs.delete("inert");
      },
      hasAttribute(name: string) {
        return attrs.has(name);
      },
      getAttribute(name: string) {
        return attrs.get(name) ?? null;
      },
      setAttribute(name: string, value: string) {
        attrs.set(name, value);
      },
      removeAttribute(name: string) {
        attrs.delete(name);
      },
    };
    return el;
  }
  const fresh = fakeRoot({});
  const snap = captureTourLockSnapshot(fresh);
  lockTourBackground(fresh);
  assert.equal(fresh.inert, true);
  assert.equal(fresh.getAttribute("aria-hidden"), "true");
  unlockTourBackground(fresh, snap);
  assert.equal(fresh.hasAttribute("inert"), false);
  assert.equal(fresh.hasAttribute("aria-hidden"), false);

  const preset = fakeRoot({ ariaHidden: "false" });
  const presetSnap = captureTourLockSnapshot(preset);
  lockTourBackground(preset);
  unlockTourBackground(preset, presetSnap);
  assert.equal(preset.getAttribute("aria-hidden"), "false");
  assert.equal(preset.hasAttribute("inert"), false);

  const alreadyInert = fakeRoot({ inert: true, ariaHidden: "true" });
  const alreadySnap = captureTourLockSnapshot(alreadyInert);
  lockTourBackground(alreadyInert);
  unlockTourBackground(alreadyInert, alreadySnap);
  assert.equal(alreadyInert.inert, true);
  assert.equal(alreadyInert.getAttribute("aria-hidden"), "true");

  lockTourBackground(fresh);
  lockTourBackground(fresh);
  unlockTourBackground(fresh, snap);
  unlockTourBackground(fresh, snap);
  assert.equal(fresh.hasAttribute("inert"), false);
  assert.equal(fresh.hasAttribute("aria-hidden"), false);
});
