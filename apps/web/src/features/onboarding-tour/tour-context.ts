import { createContext } from "react";
import type { OnbEngineState } from "./tour-engine.js";
import type { OnbTourAnchorId, OnbTourStep } from "./tour-steps.js";

export interface OnboardingTourApi {
  phase: OnbEngineState["phase"];
  step: OnbTourStep | null;
  stepIndex: number;
  stepCount: number;
  last: boolean;
  missingAnchor: boolean;
  activeAnchor: OnbTourAnchorId | null;
  start: () => void;
  continueFromSaved: () => void;
  restart: () => void;
  next: () => void;
  back: () => void;
  skip: () => void;
  finish: () => void;
  dismissInvite: () => void;
}

export const TourContext = createContext<OnboardingTourApi | null>(null);
