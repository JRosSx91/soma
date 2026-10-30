import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  ONB_ENGINE_IDLE,
  ONB_TOUR_STEPS,
  ONB_TOUR_STEP_IDS,
  ONB_TOUR_STORAGE_PREFIX,
  currentStep,
  isLastStep,
  liveStorageKey,
  persistStatusFor,
  queryTourAnchor,
  readLiveTour,
  reduceTour,
  resolveAnchorId,
  shouldOfferLiveContinue,
  shouldOfferLiveInvite,
  shouldResumeLiveTour,
  tourHref,
  writeLiveTour,
  writesLiveTourStorage,
} from "./index.ts";

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
  assert.match(hostSrc, /aria-modal="false"/);
});
