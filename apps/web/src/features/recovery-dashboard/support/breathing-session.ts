/**
 * SUP-01C guided breathing: 4 s in, 6 s out, no holds, repeated until the
 * person pauses or restarts. Time is derived from a monotonic clock, never
 * from counting ticks, so late timers cannot make the phases drift. Nothing
 * here is stored, sent or logged.
 */
export const BREATHING_PHASE_MS = { inhale: 4000, exhale: 6000 } as const;
export const BREATHING_CYCLE_MS = BREATHING_PHASE_MS.inhale + BREATHING_PHASE_MS.exhale;

/** Circle scale at the start of an inhale (and end of an exhale) and at full inhale. */
export const BREATHING_SCALE = { min: 0.62, max: 1 } as const;

export type BreathingStatus = "idle" | "running" | "paused";
export type BreathingPhase = keyof typeof BREATHING_PHASE_MS;

export interface BreathingState {
  status: BreathingStatus;
  /** Exercise time accumulated before the current run segment. */
  elapsedMs: number;
  /** Clock reading when the current run segment began; null unless running. */
  runStartedAt: number | null;
}

export interface BreathingSnapshot {
  status: BreathingStatus;
  phase: BreathingPhase;
  phaseDurationMs: number;
  phaseRemainingMs: number;
  /** Whole seconds left in the phase, as shown to the person (4…1, 6…1). */
  remainingSeconds: number;
  /** 0 at the start of the phase, approaching 1 at its end. */
  phaseProgress: number;
  /** Position in the cycle where the current run segment began; 0 unless running. */
  runOffsetMs: number;
  /** Clock reading when the current run segment began; null unless running. */
  runStartedAt: number | null;
}

export const initialBreathingState: BreathingState = {
  status: "idle",
  elapsedMs: 0,
  runStartedAt: null,
};

export function startBreathing(now: number): BreathingState {
  return { status: "running", elapsedMs: 0, runStartedAt: now };
}

export function pauseBreathing(state: BreathingState, now: number): BreathingState {
  if (state.status !== "running") return state;
  return { status: "paused", elapsedMs: breathingElapsed(state, now), runStartedAt: null };
}

export function resumeBreathing(state: BreathingState, now: number): BreathingState {
  if (state.status !== "paused") return state;
  return { status: "running", elapsedMs: state.elapsedMs, runStartedAt: now };
}

export function resetBreathing(): BreathingState {
  return initialBreathingState;
}

export function breathingElapsed(state: BreathingState, now: number): number {
  if (state.status !== "running" || state.runStartedAt === null) return state.elapsedMs;
  return state.elapsedMs + Math.max(0, now - state.runStartedAt);
}

export function breathingSnapshot(state: BreathingState, now: number): BreathingSnapshot {
  const inCycle = breathingElapsed(state, now) % BREATHING_CYCLE_MS;
  const phase: BreathingPhase = inCycle < BREATHING_PHASE_MS.inhale ? "inhale" : "exhale";
  const phaseDurationMs = BREATHING_PHASE_MS[phase];
  const phaseElapsed = phase === "inhale" ? inCycle : inCycle - BREATHING_PHASE_MS.inhale;
  const phaseRemainingMs = phaseDurationMs - phaseElapsed;
  return {
    status: state.status,
    phase,
    phaseDurationMs,
    phaseRemainingMs,
    remainingSeconds: Math.ceil(phaseRemainingMs / 1000),
    phaseProgress: phaseElapsed / phaseDurationMs,
    runOffsetMs: state.status === "running" ? state.elapsedMs % BREATHING_CYCLE_MS : 0,
    runStartedAt: state.status === "running" ? state.runStartedAt : null,
  };
}

/** Delay until the visible countdown or the phase next changes; null when not running. */
export function msUntilNextBreathingUpdate(snapshot: BreathingSnapshot): number | null {
  if (snapshot.status !== "running") return null;
  const nextDisplayChange = snapshot.phaseRemainingMs - (snapshot.remainingSeconds - 1) * 1000;
  return Math.max(1, nextDisplayChange);
}

/** Linear circle scale for a point in a phase: grows while inhaling, shrinks while exhaling. */
export function breathingScale(phase: BreathingPhase, progress: number): number {
  const clamped = Math.min(1, Math.max(0, progress));
  const span = BREATHING_SCALE.max - BREATHING_SCALE.min;
  return phase === "inhale"
    ? BREATHING_SCALE.min + span * clamped
    : BREATHING_SCALE.max - span * clamped;
}

export interface BreathingClock {
  now(): number;
  setTimeout(callback: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
}

/** Page visibility, so the exercise can pause itself when the tab is hidden. */
export interface BreathingVisibility {
  isHidden(): boolean;
  subscribe(onChange: () => void): () => void;
}

export interface BreathingSession {
  getSnapshot(): BreathingSnapshot;
  subscribe(listener: () => void): () => void;
  start(): void;
  pause(): void;
  resume(): void;
  reset(): void;
  /** Stops timers and listeners and returns to idle. The session stays usable. */
  dispose(): void;
}

export function createBreathingSession(
  clock: BreathingClock,
  visibility: BreathingVisibility | null = null,
): BreathingSession {
  let state = initialBreathingState;
  let snapshot = breathingSnapshot(state, clock.now());
  let timer: unknown = null;
  let stopWatchingVisibility: (() => void) | null = null;
  const listeners = new Set<() => void>();

  function clearTimer() {
    if (timer !== null) clock.clearTimeout(timer);
    timer = null;
  }

  function watchVisibility(active: boolean) {
    if (active && !stopWatchingVisibility && visibility) {
      stopWatchingVisibility = visibility.subscribe(() => {
        if (visibility.isHidden()) pause();
      });
    } else if (!active && stopWatchingVisibility) {
      stopWatchingVisibility();
      stopWatchingVisibility = null;
    }
  }

  function commit(next: BreathingState) {
    state = next;
    refresh();
    watchVisibility(state.status === "running");
  }

  function refresh() {
    clearTimer();
    const next = breathingSnapshot(state, clock.now());
    const changed =
      next.status !== snapshot.status ||
      next.phase !== snapshot.phase ||
      next.remainingSeconds !== snapshot.remainingSeconds;
    if (changed) snapshot = next;
    const delay = msUntilNextBreathingUpdate(next);
    if (delay !== null) timer = clock.setTimeout(refresh, delay);
    if (changed) for (const listener of listeners) listener();
  }

  function pause() {
    commit(pauseBreathing(state, clock.now()));
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    start() {
      if (visibility?.isHidden()) return;
      commit(startBreathing(clock.now()));
    },
    pause,
    resume() {
      if (visibility?.isHidden()) return;
      commit(resumeBreathing(state, clock.now()));
    },
    reset() {
      commit(resetBreathing());
    },
    dispose() {
      clearTimer();
      watchVisibility(false);
      state = initialBreathingState;
      snapshot = breathingSnapshot(state, clock.now());
    },
  };
}
