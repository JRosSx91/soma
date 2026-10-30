import {
  ONB_TOUR_STEPS,
  stepIndexById,
  type OnbTourStep,
  type OnbTourStepId,
} from "./tour-steps.js";

export type OnbTourPhase = "idle" | "invite" | "continue" | "active";

export interface OnbEngineState {
  phase: OnbTourPhase;
  index: number;
}

export type OnbEngineAction =
  | { type: "offer-invite" }
  | { type: "offer-continue"; stepId: OnbTourStepId }
  | { type: "dismiss-invite" }
  | { type: "start" }
  | { type: "resume"; stepId: OnbTourStepId }
  | { type: "next" }
  | { type: "back" }
  | { type: "skip" }
  | { type: "complete" }
  | { type: "restart" };

export const ONB_ENGINE_IDLE: OnbEngineState = { phase: "idle", index: 0 };

export function currentStep(state: OnbEngineState): OnbTourStep | null {
  if (state.phase !== "active") return null;
  return ONB_TOUR_STEPS[state.index] ?? null;
}

export function isLastStep(state: OnbEngineState): boolean {
  return state.phase === "active" && state.index === ONB_TOUR_STEPS.length - 1;
}

export function reduceTour(
  state: OnbEngineState,
  action: OnbEngineAction,
): OnbEngineState {
  switch (action.type) {
    case "offer-invite":
      return state.phase === "idle" ? { phase: "invite", index: 0 } : state;
    case "offer-continue": {
      if (state.phase !== "idle") return state;
      const index = stepIndexById(action.stepId);
      return { phase: "continue", index: index < 0 ? 0 : index };
    }
    case "dismiss-invite":
      return state.phase === "invite" || state.phase === "continue"
        ? ONB_ENGINE_IDLE
        : state;
    case "start":
    case "restart":
      return { phase: "active", index: 0 };
    case "resume": {
      const index = stepIndexById(action.stepId);
      return { phase: "active", index: index < 0 ? 0 : index };
    }
    case "next": {
      if (state.phase !== "active") return state;
      if (state.index >= ONB_TOUR_STEPS.length - 1) {
        return ONB_ENGINE_IDLE;
      }
      return { phase: "active", index: state.index + 1 };
    }
    case "back": {
      if (state.phase !== "active") return state;
      return { phase: "active", index: Math.max(0, state.index - 1) };
    }
    case "skip":
    case "complete":
      return ONB_ENGINE_IDLE;
    default:
      return state;
  }
}

export function persistStatusFor(
  previous: OnbEngineState,
  next: OnbEngineState,
  action: OnbEngineAction,
): "in_progress" | "done" | "dismissed" | null {
  if (action.type === "skip" || action.type === "dismiss-invite") return "dismissed";
  if (action.type === "complete") return "done";
  if (action.type === "next" && previous.phase === "active" && next.phase === "idle") {
    return "done";
  }
  if (next.phase === "active") return "in_progress";
  return null;
}
