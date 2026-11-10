/**
 * PWA-01C install surface. Installed state uses display-mode / iOS
 * `navigator.standalone` and `appinstalled`, not user-agent.
 * UA is only a hint for instruction copy.
 * `userChoice.accepted` means the install request was accepted, not that
 * the app is confirmed installed.
 */

export type PwaInstructionKind =
  | "hidden"
  | "prompt"
  | "pending"
  | "ios"
  | "manual";

export type PwaInstallPhase =
  | "idle"
  | "available"
  | "presented"
  | "accepted"
  | "confirmed"
  | "dismissed"
  | "unknown";

export type PwaInstallChoice = {
  outcome: "accepted" | "dismissed";
};

export type SomaBeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<PwaInstallChoice>;
};

export type PwaInstallSnapshot = {
  phase: PwaInstallPhase;
  hasNativePrompt: boolean;
  confirmed: boolean;
};

export type PwaInstallAction =
  | { type: "native-prompt-captured" }
  | { type: "prompt-started" }
  | { type: "user-choice"; outcome: "accepted" | "dismissed" }
  | { type: "appinstalled" }
  | { type: "prompt-failed" };

export function initialPwaInstallSnapshot(): PwaInstallSnapshot {
  return { phase: "idle", hasNativePrompt: false, confirmed: false };
}

export function reducePwaInstall(
  state: PwaInstallSnapshot,
  action: PwaInstallAction,
): PwaInstallSnapshot {
  switch (action.type) {
    case "native-prompt-captured":
      if (state.confirmed) return state;
      return { ...state, hasNativePrompt: true, phase: "available" };
    case "prompt-started":
      if (!state.hasNativePrompt || state.confirmed) return state;
      return { ...state, phase: "presented" };
    case "user-choice":
      if (action.outcome === "dismissed") {
        return { phase: "dismissed", hasNativePrompt: false, confirmed: false };
      }
      return { phase: "accepted", hasNativePrompt: false, confirmed: false };
    case "appinstalled":
      return { phase: "confirmed", hasNativePrompt: false, confirmed: true };
    case "prompt-failed":
      return {
        phase: "unknown",
        hasNativePrompt: false,
        confirmed: state.confirmed,
      };
    default:
      return state;
  }
}

export function isStandaloneDisplay(input: {
  displayModeStandalone: boolean;
  displayModeWindowControlsOverlay?: boolean;
  iosNavigatorStandalone?: boolean;
}): boolean {
  return (
    input.displayModeStandalone ||
    Boolean(input.displayModeWindowControlsOverlay) ||
    Boolean(input.iosNavigatorStandalone)
  );
}

export function readStandaloneFromWindow(
  win: Window & { navigator: Navigator & { standalone?: boolean } },
): boolean {
  const standalone =
    typeof win.matchMedia === "function" &&
    win.matchMedia("(display-mode: standalone)").matches;
  const overlay =
    typeof win.matchMedia === "function" &&
    win.matchMedia("(display-mode: window-controls-overlay)").matches;
  return isStandaloneDisplay({
    displayModeStandalone: standalone,
    displayModeWindowControlsOverlay: overlay,
    iosNavigatorStandalone: win.navigator.standalone === true,
  });
}

/** Hint for instruction copy only. Not used to decide if the app is installed. */
export function isLikelyIosDevice(
  userAgent: string,
  maxTouchPoints = 0,
): boolean {
  if (/iPhone|iPod|iPad/i.test(userAgent)) return true;
  return /Macintosh/i.test(userAgent) && maxTouchPoints > 1;
}

export function isLikelyIosSafari(userAgent: string, maxTouchPoints = 0): boolean {
  if (!isLikelyIosDevice(userAgent, maxTouchPoints)) return false;
  return !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(userAgent);
}

export function shouldOfferInstall(input: {
  standalone: boolean;
  confirmed: boolean;
}): boolean {
  return !input.standalone && !input.confirmed;
}

export function instructionKind(input: {
  standalone: boolean;
  confirmed: boolean;
  phase: PwaInstallPhase;
  hasNativePrompt: boolean;
  iosDevice: boolean;
}): PwaInstructionKind {
  if (!shouldOfferInstall(input)) return "hidden";
  if (input.phase === "accepted") return "pending";
  if (input.hasNativePrompt) return "prompt";
  if (input.iosDevice) return "ios";
  return "manual";
}

/** Capture Chromium's event so the mini-infobar is deferred. Never calls prompt(). */
export function deferNativeInstallEvent(event: { preventDefault: () => void }): void {
  event.preventDefault();
}
