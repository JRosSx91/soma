import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/index.js";
import { useUserProfile } from "../profile/index.js";
import { useShellBase } from "../recovery-dashboard/context/ShellBaseContext.js";
import {
  ONB_ENGINE_IDLE,
  currentStep,
  isLastStep,
  persistStatusFor,
  reduceTour,
  type OnbEngineAction,
  type OnbEngineState,
} from "./tour-engine.js";
import {
  readLiveTour,
  shouldOfferLiveContinue,
  shouldOfferLiveInvite,
  writeLiveTour,
} from "./tour-persist.js";
import {
  ONB_TOUR_LG_QUERY,
  ONB_TOUR_STEPS,
  isTourPath,
  queryTourAnchor,
  resolveAnchorId,
  tourHref,
} from "./tour-steps.js";
import { TourContext, type OnboardingTourApi } from "./tour-context.js";

function isDesktopViewport(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia(ONB_TOUR_LG_QUERY).matches;
}

function useDesktopViewport(): boolean {
  const [desktop, setDesktop] = useState(() => isDesktopViewport());
  useEffect(() => {
    const media = window.matchMedia(ONB_TOUR_LG_QUERY);
    function onChange() {
      setDesktop(media.matches);
    }
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);
  return desktop;
}

export function OnboardingTourProvider({ children }: { children: ReactNode }) {
  const base = useShellBase();
  const { user, loading: authLoading } = useAuth();
  const live = base === "/app" && Boolean(user);
  const profile = useUserProfile({ enabled: live });
  const navigate = useNavigate();
  const location = useLocation();
  const [engine, dispatch] = useReducer(reduceTour, ONB_ENGINE_IDLE);
  const engineRef = useRef(engine);
  const bootKey = `${base}:${user?.id ?? "anon"}`;
  const bootstrappedFor = useRef<string | null>(null);
  const desktop = useDesktopViewport();
  const userId = user?.id ?? null;

  const eligibility = useMemo(
    () => ({
      base,
      userId,
      authLoading,
      profileLoading: live ? profile.loading && !profile.profile : false,
      onboardingStatus: profile.profile?.onboardingStatus ?? null,
    }),
    [authLoading, base, live, profile.loading, profile.profile, userId],
  );

  const persistLive = useCallback(
    (previous: OnbEngineState, next: OnbEngineState, action: OnbEngineAction) => {
      if (!live || !userId) return;
      const status = persistStatusFor(previous, next, action);
      if (!status) return;
      const step = currentStep(next) ?? currentStep(previous) ?? ONB_TOUR_STEPS[0];
      writeLiveTour(userId, { v: 1, status, stepId: step.id });
    },
    [live, userId],
  );

  const run = useCallback(
    (action: OnbEngineAction) => {
      const previous = engineRef.current;
      const next = reduceTour(previous, action);
      engineRef.current = next;
      persistLive(previous, next, action);
      dispatch(action);
    },
    [persistLive],
  );

  useEffect(() => {
    if (bootstrappedFor.current === bootKey) return;
    if (base === "/preview") {
      bootstrappedFor.current = bootKey;
      return;
    }
    if (authLoading) return;
    if (!userId) {
      bootstrappedFor.current = bootKey;
      return;
    }
    if (profile.loading && !profile.profile) return;
    bootstrappedFor.current = bootKey;
    const stored = readLiveTour(userId);
    if (shouldOfferLiveContinue(eligibility, stored) && stored) {
      run({ type: "offer-continue", stepId: stored.stepId });
      return;
    }
    if (shouldOfferLiveInvite(eligibility, stored)) {
      run({ type: "offer-invite" });
    }
  }, [authLoading, base, bootKey, eligibility, profile.loading, profile.profile, run, userId]);

  const step = currentStep(engine);
  const activeAnchor = step ? resolveAnchorId(step, desktop) : null;
  const missingAnchor = Boolean(step && activeAnchor && !queryTourAnchor(activeAnchor));

  useEffect(() => {
    if (!step) return;
    if (isTourPath(location.pathname, base, step)) return;
    navigate(tourHref(base, step));
  }, [base, location.pathname, navigate, step]);

  const value = useMemo<OnboardingTourApi>(
    () => ({
      phase: engine.phase,
      step,
      stepIndex: engine.index,
      stepCount: ONB_TOUR_STEPS.length,
      last: isLastStep(engine),
      missingAnchor,
      activeAnchor,
      start: () => run({ type: "start" }),
      continueFromSaved: () => {
        const saved = ONB_TOUR_STEPS[engine.index] ?? ONB_TOUR_STEPS[0];
        run({ type: "resume", stepId: saved.id });
      },
      restart: () => run({ type: "restart" }),
      next: () => run({ type: "next" }),
      back: () => run({ type: "back" }),
      skip: () => run({ type: "skip" }),
      finish: () => run({ type: "complete" }),
      dismissInvite: () => run({ type: "dismiss-invite" }),
    }),
    [activeAnchor, engine, missingAnchor, run, step],
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}
