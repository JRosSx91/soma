import {
  deferNativeInstallEvent,
  initialPwaInstallSnapshot,
  readStandaloneFromWindow,
  reducePwaInstall,
  type PwaInstallSnapshot,
  type SomaBeforeInstallPromptEvent,
} from "./pwa-install.js";

type HostWindow = Window & {
  navigator: Navigator & { standalone?: boolean };
};

type HostListener = () => void;

let snapshot = initialPwaInstallSnapshot();
let nativePrompt: SomaBeforeInstallPromptEvent | null = null;
let standalone = false;
let attachCount = 0;
let standaloneMedia: MediaQueryList | null = null;
const listeners = new Set<HostListener>();

function hostWindow(): HostWindow {
  return window as HostWindow;
}

function emit() {
  for (const listener of listeners) listener();
}

function dispatch(
  action: Parameters<typeof reducePwaInstall>[1],
  nextPrompt: SomaBeforeInstallPromptEvent | null = nativePrompt,
) {
  snapshot = reducePwaInstall(snapshot, action);
  if (!snapshot.hasNativePrompt) nativePrompt = null;
  else nativePrompt = nextPrompt;
  emit();
}

function onBeforeInstallPrompt(event: Event) {
  deferNativeInstallEvent(event);
  nativePrompt = event as SomaBeforeInstallPromptEvent;
  dispatch({ type: "native-prompt-captured" }, nativePrompt);
}

function onAppInstalled() {
  nativePrompt = null;
  dispatch({ type: "appinstalled" }, null);
}

function onStandaloneChange() {
  standalone = readStandaloneFromWindow(hostWindow());
  emit();
}

function attach() {
  if (typeof window === "undefined") return;
  const win = hostWindow();
  standalone = readStandaloneFromWindow(win);
  win.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  win.addEventListener("appinstalled", onAppInstalled);
  if (typeof win.matchMedia === "function") {
    standaloneMedia = win.matchMedia("(display-mode: standalone)");
    standaloneMedia.addEventListener("change", onStandaloneChange);
  }
}

function detach() {
  if (typeof window === "undefined") return;
  const win = hostWindow();
  win.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  win.removeEventListener("appinstalled", onAppInstalled);
  standaloneMedia?.removeEventListener("change", onStandaloneChange);
  standaloneMedia = null;
}

export function getPwaInstallHost(): {
  snapshot: PwaInstallSnapshot;
  nativePrompt: SomaBeforeInstallPromptEvent | null;
  standalone: boolean;
} {
  return { snapshot, nativePrompt, standalone };
}

export function subscribePwaInstallHost(listener: HostListener): () => void {
  listeners.add(listener);
  attachCount += 1;
  if (attachCount === 1) attach();
  else if (typeof window !== "undefined") {
    standalone = readStandaloneFromWindow(hostWindow());
  }
  return () => {
    listeners.delete(listener);
    attachCount = Math.max(0, attachCount - 1);
    if (attachCount === 0) detach();
  };
}

export async function requestNativeInstall(): Promise<void> {
  const event = nativePrompt;
  if (!event || snapshot.phase === "presented") return;
  dispatch({ type: "prompt-started" }, event);
  try {
    await event.prompt();
    const choice = await event.userChoice;
    dispatch({ type: "user-choice", outcome: choice.outcome }, null);
  } catch {
    dispatch({ type: "prompt-failed" }, null);
  }
}

export function resetPwaInstallHostForTests() {
  snapshot = initialPwaInstallSnapshot();
  nativePrompt = null;
  standalone = false;
  attachCount = 0;
  listeners.clear();
}
