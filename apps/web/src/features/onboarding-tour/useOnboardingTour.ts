import { useContext } from "react";
import { TourContext, type OnboardingTourApi } from "./tour-context.js";

export function useOnboardingTour(): OnboardingTourApi {
  const value = useContext(TourContext);
  if (!value) {
    throw new Error("useOnboardingTour must run inside OnboardingTourProvider");
  }
  return value;
}

export function useOnboardingTourOptional(): OnboardingTourApi | null {
  return useContext(TourContext);
}
