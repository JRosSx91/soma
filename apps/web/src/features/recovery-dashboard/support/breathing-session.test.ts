import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BREATHING_CYCLE_MS,
  BREATHING_PHASE_MS,
  BREATHING_SCALE,
  breathingScale,
  breathingSnapshot,
  createBreathingSession,
  initialBreathingState,
  msUntilNextBreathingUpdate,
  pauseBreathing,
  resumeBreathing,
  startBreathing,
  type BreathingClock,
  type BreathingVisibility,
} from "./breathing-session.js";
import {
  BREATHING_ANIMATION_NAME,
  breathingCircleStyle,
  breathingKeyframes,
} from "./support-visuals.js";

/** Deterministic clock and timers; `lagMs` makes every timer fire late. */
function fakeEnvironment(lagMs = 0) {
  let now = 1_000;
  let nextId = 1;
  const timers = new Map<number, { at: number; run: () => void }>();
  let hidden = false;
  const visibilityListeners = new Set<() => void>();

  const clock: BreathingClock = {
    now: () => now,
    setTimeout(run, ms) {
      const id = nextId++;
      timers.set(id, { at: now + ms + lagMs, run });
      return id;
    },
    clearTimeout(handle) {
      timers.delete(handle as number);
    },
  };
  const visibility: BreathingVisibility = {
    isHidden: () => hidden,
    subscribe(onChange) {
      visibilityListeners.add(onChange);
      return () => visibilityListeners.delete(onChange);
    },
  };

  function advance(ms: number) {
    const end = now + ms;
    for (;;) {
      let due: [number, { at: number; run: () => void }] | null = null;
      for (const entry of timers) {
        if (entry[1].at <= end && (!due || entry[1].at < due[1].at)) due = entry;
      }
      if (!due) break;
      timers.delete(due[0]);
      now = due[1].at;
      due[1].run();
    }
    now = end;
  }

  function setHidden(value: boolean) {
    hidden = value;
    for (const listener of [...visibilityListeners]) listener();
  }

  return {
    clock,
    visibility,
    advance,
    setHidden,
    pendingTimers: () => timers.size,
    visibilityListeners: () => visibilityListeners.size,
  };
}

function setup(lagMs = 0) {
  const env = fakeEnvironment(lagMs);
  const session = createBreathingSession(env.clock, env.visibility);
  let notifications = 0;
  session.subscribe(() => {
    notifications += 1;
  });
  return { env, session, notifications: () => notifications };
}

test("phases follow the approved 4 s in / 6 s out rhythm with no holds", () => {
  assert.deepEqual(BREATHING_PHASE_MS, { inhale: 4000, exhale: 6000 });
  assert.equal(BREATHING_CYCLE_MS, 10_000);
});

test("starts idle, ready to inhale, without timers or listeners", () => {
  const { env, session } = setup();
  const snapshot = session.getSnapshot();
  assert.equal(snapshot.status, "idle");
  assert.equal(snapshot.phase, "inhale");
  assert.equal(snapshot.remainingSeconds, 4);
  assert.equal(env.pendingTimers(), 0);
  assert.equal(env.visibilityListeners(), 0);
  env.advance(30_000);
  assert.equal(session.getSnapshot().status, "idle");
});

test("start runs the inhale countdown and switches to exhale at 4 s", () => {
  const { env, session } = setup();
  session.start();
  assert.equal(session.getSnapshot().status, "running");
  assert.equal(session.getSnapshot().phase, "inhale");
  assert.equal(session.getSnapshot().remainingSeconds, 4);
  env.advance(1000);
  assert.equal(session.getSnapshot().remainingSeconds, 3);
  env.advance(2999);
  assert.equal(session.getSnapshot().phase, "inhale");
  assert.equal(session.getSnapshot().remainingSeconds, 1);
  env.advance(1);
  assert.equal(session.getSnapshot().phase, "exhale");
  assert.equal(session.getSnapshot().remainingSeconds, 6);
});

test("exhale returns to inhale at 10 s and the cycle repeats", () => {
  const { env, session } = setup();
  session.start();
  env.advance(9_999);
  assert.equal(session.getSnapshot().phase, "exhale");
  env.advance(1);
  assert.equal(session.getSnapshot().phase, "inhale");
  assert.equal(session.getSnapshot().remainingSeconds, 4);
  env.advance(25_000);
  assert.equal(session.getSnapshot().phase, "exhale");
  assert.equal(session.getSnapshot().remainingSeconds, 5);
  env.advance(5_000);
  assert.equal(session.getSnapshot().phase, "inhale");
});

test("listeners are notified once per visible change, not continuously", () => {
  const { env, session, notifications } = setup();
  session.start();
  const afterStart = notifications();
  env.advance(BREATHING_CYCLE_MS);
  assert.equal(notifications() - afterStart, 10);
  assert.equal(env.pendingTimers(), 1);
});

test("late timers do not make the phases drift from the clock", () => {
  const { env, session } = setup(300);
  session.start();
  env.advance(4_350);
  const snapshot = session.getSnapshot();
  assert.equal(snapshot.phase, "exhale");
  assert.equal(snapshot.remainingSeconds, 6);
  env.advance(62_000);
  const later = breathingSnapshot(
    { status: "running", elapsedMs: 0, runStartedAt: 1_000 },
    env.clock.now(),
  );
  assert.equal(session.getSnapshot().phase, later.phase);
});

test("pause freezes phase and remaining time and stops the timer", () => {
  const { env, session } = setup();
  session.start();
  env.advance(6_500);
  session.pause();
  const paused = session.getSnapshot();
  assert.equal(paused.status, "paused");
  assert.equal(paused.phase, "exhale");
  assert.equal(paused.phaseRemainingMs, 3_500);
  assert.equal(paused.remainingSeconds, 4);
  assert.equal(env.pendingTimers(), 0);
  env.advance(120_000);
  assert.deepEqual(session.getSnapshot(), paused);
});

test("resume continues the same phase from the remaining time", () => {
  const { env, session } = setup();
  session.start();
  env.advance(2_500);
  session.pause();
  env.advance(45_000);
  session.resume();
  const resumed = session.getSnapshot();
  assert.equal(resumed.status, "running");
  assert.equal(resumed.phase, "inhale");
  assert.equal(resumed.phaseRemainingMs, 1_500);
  env.advance(1_499);
  assert.equal(session.getSnapshot().phase, "inhale");
  env.advance(1);
  assert.equal(session.getSnapshot().phase, "exhale");
});

test("reset returns to the initial state from running or paused", () => {
  const { env, session } = setup();
  session.start();
  env.advance(7_000);
  session.reset();
  assert.equal(session.getSnapshot().status, "idle");
  assert.equal(session.getSnapshot().phase, "inhale");
  assert.equal(session.getSnapshot().remainingSeconds, 4);
  assert.equal(env.pendingTimers(), 0);
  assert.equal(env.visibilityListeners(), 0);
  session.start();
  env.advance(2_000);
  session.pause();
  session.reset();
  assert.equal(session.getSnapshot().status, "idle");
  assert.equal(env.pendingTimers(), 0);
});

test("hiding the tab pauses and keeps the phase; showing it does not resume", () => {
  const { env, session } = setup();
  session.start();
  assert.equal(env.visibilityListeners(), 1);
  env.advance(5_200);
  env.setHidden(true);
  const paused = session.getSnapshot();
  assert.equal(paused.status, "paused");
  assert.equal(paused.phase, "exhale");
  assert.equal(paused.phaseRemainingMs, 4_800);
  assert.equal(env.pendingTimers(), 0);
  assert.equal(env.visibilityListeners(), 0);
  env.advance(60_000);
  env.setHidden(false);
  assert.equal(session.getSnapshot().status, "paused");
  assert.equal(session.getSnapshot().phaseRemainingMs, 4_800);
  session.resume();
  assert.equal(session.getSnapshot().status, "running");
  assert.equal(session.getSnapshot().phaseRemainingMs, 4_800);
});

test("start and resume are ignored while the tab is hidden", () => {
  const { env, session } = setup();
  env.setHidden(true);
  session.start();
  assert.equal(session.getSnapshot().status, "idle");
  assert.equal(env.pendingTimers(), 0);
});

test("dispose clears timers and listeners and leaves the session reusable", () => {
  const { env, session } = setup();
  session.start();
  env.advance(1_200);
  session.dispose();
  assert.equal(env.pendingTimers(), 0);
  assert.equal(env.visibilityListeners(), 0);
  assert.equal(session.getSnapshot().status, "idle");
  session.start();
  assert.equal(session.getSnapshot().status, "running");
  session.dispose();
  assert.equal(env.pendingTimers(), 0);
});

test("pure transitions ignore invalid moves", () => {
  assert.equal(pauseBreathing(initialBreathingState, 10), initialBreathingState);
  assert.equal(resumeBreathing(initialBreathingState, 10), initialBreathingState);
  const running = startBreathing(0);
  assert.equal(resumeBreathing(running, 10), running);
  assert.equal(msUntilNextBreathingUpdate(breathingSnapshot(initialBreathingState, 0)), null);
  assert.equal(msUntilNextBreathingUpdate(breathingSnapshot(running, 250)), 750);
});

test("circle scale grows on inhale, shrinks on exhale and freezes when paused", () => {
  assert.equal(breathingScale("inhale", 0), BREATHING_SCALE.min);
  assert.equal(breathingScale("inhale", 1), BREATHING_SCALE.max);
  assert.equal(breathingScale("exhale", 0), BREATHING_SCALE.max);
  assert.equal(breathingScale("exhale", 1), BREATHING_SCALE.min);

  const idle = breathingCircleStyle(breathingSnapshot(initialBreathingState, 0));
  assert.equal(idle.transform, `scale(${BREATHING_SCALE.min.toFixed(4)})`);
  assert.equal(idle.animation, undefined);

  const running = startBreathing(0);
  const cycle = `${BREATHING_ANIMATION_NAME} ${BREATHING_CYCLE_MS}ms linear`;
  assert.equal(breathingCircleStyle(breathingSnapshot(running, 1_000)).animation, `${cycle} 0ms infinite`);
  // The animation string must not change while running, or it would restart.
  assert.equal(
    breathingCircleStyle(breathingSnapshot(running, 7_000)).animation,
    breathingCircleStyle(breathingSnapshot(running, 1_000)).animation,
  );

  const paused = pauseBreathing(running, 6_500);
  const frozen = breathingCircleStyle(breathingSnapshot(paused, 50_000));
  assert.equal(frozen.transform, `scale(${breathingScale("exhale", 2_500 / 6_000).toFixed(4)})`);
  assert.equal(frozen.animation, undefined);
  const resumed = breathingCircleStyle(breathingSnapshot(resumeBreathing(paused, 50_000), 50_000));
  assert.equal(resumed.animation, `${cycle} -6500ms infinite`);

  assert.equal(breathingSnapshot(resumeBreathing(paused, 50_000), 51_000).runStartedAt, 50_000);
  assert.equal(breathingSnapshot(paused, 50_000).runStartedAt, null);

  const later = pauseBreathing(resumeBreathing(paused, 50_000), 66_500);
  assert.equal(later.elapsedMs, 23_000);
  assert.equal(
    breathingCircleStyle(breathingSnapshot(resumeBreathing(later, 70_000), 70_000)).animation,
    `${cycle} -3000ms infinite`,
  );
});

test("the cycle keyframes match the 4 s inhale and 6 s exhale", () => {
  const inhaleEnd = (BREATHING_PHASE_MS.inhale / BREATHING_CYCLE_MS) * 100;
  assert.equal(inhaleEnd, 40);
  assert.match(breathingKeyframes, new RegExp(`@keyframes ${BREATHING_ANIMATION_NAME}`));
  assert.match(breathingKeyframes, new RegExp(`0%, 100% \\{ transform: scale\\(${BREATHING_SCALE.min}\\); \\}`));
  assert.match(breathingKeyframes, new RegExp(` 40% \\{ transform: scale\\(${BREATHING_SCALE.max}\\); \\}`));
});
