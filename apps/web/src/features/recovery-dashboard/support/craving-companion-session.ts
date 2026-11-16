import {
  CRAVING_CHOICE_IDS,
  CRAVING_COMPANION_STEPS,
  type CravingChoiceId,
  type CravingCompanionStep,
} from "./support-craving-tool.js";

/**
 * Pure in-memory session for SUP-02C. No timers that predict urge duration,
 * no scoring, no persistence hooks.
 */

export interface CravingCompanionSession {
  step: CravingCompanionStep;
  /** Last voluntary choice on the options step; never sent anywhere. */
  selectedChoice: CravingChoiceId | null;
  /** True after the user leaves the flow (exit / back to hub). */
  exited: boolean;
}

export function createCravingCompanionSession(
  step: CravingCompanionStep = "welcome",
): CravingCompanionSession {
  return { step, selectedChoice: null, exited: false };
}

export function cravingStepIndex(step: CravingCompanionStep): number {
  return CRAVING_COMPANION_STEPS.indexOf(step);
}

export function cravingStepCount(): number {
  return CRAVING_COMPANION_STEPS.length;
}

export function canGoBack(session: CravingCompanionSession): boolean {
  if (session.exited) return false;
  return cravingStepIndex(session.step) > 0;
}

export function canGoForward(session: CravingCompanionSession): boolean {
  if (session.exited) return false;
  return cravingStepIndex(session.step) < CRAVING_COMPANION_STEPS.length - 1;
}

export function goToCravingStep(
  session: CravingCompanionSession,
  step: CravingCompanionStep,
): CravingCompanionSession {
  if (session.exited) return session;
  return { ...session, step };
}

export function goForward(session: CravingCompanionSession): CravingCompanionSession {
  if (!canGoForward(session)) return session;
  const next = CRAVING_COMPANION_STEPS[cravingStepIndex(session.step) + 1]!;
  return { ...session, step: next };
}

export function goBack(session: CravingCompanionSession): CravingCompanionSession {
  if (!canGoBack(session)) return session;
  const prev = CRAVING_COMPANION_STEPS[cravingStepIndex(session.step) - 1]!;
  return { ...session, step: prev };
}

/** Skip the current exercise step (ground / observe) without recording why. */
export function skipCurrentStep(session: CravingCompanionSession): CravingCompanionSession {
  if (session.step !== "ground" && session.step !== "observe") return session;
  return goForward(session);
}

export function selectChoice(
  session: CravingCompanionSession,
  choiceId: CravingChoiceId,
): CravingCompanionSession {
  if (session.exited || session.step !== "choose") return session;
  if (!(CRAVING_CHOICE_IDS as readonly string[]).includes(choiceId)) return session;
  return { ...session, selectedChoice: choiceId };
}

export function clearChoice(session: CravingCompanionSession): CravingCompanionSession {
  if (session.exited) return session;
  return { ...session, selectedChoice: null };
}

export function restartSession(): CravingCompanionSession {
  return createCravingCompanionSession("welcome");
}

export function exitSession(session: CravingCompanionSession): CravingCompanionSession {
  return { ...session, exited: true };
}
