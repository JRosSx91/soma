import { useCallback, useEffect, useState } from "react";
import {
  instructionKind,
  isLikelyIosDevice,
  isLikelyIosSafari,
  readStandaloneFromWindow,
  shouldOfferInstall,
} from "./pwa-install.js";
import {
  getPwaInstallHost,
  requestNativeInstall,
  subscribePwaInstallHost,
} from "./pwa-install-host.js";

function hostWindow(): Window & {
  navigator: Navigator & { standalone?: boolean };
} {
  return window as Window & {
    navigator: Navigator & { standalone?: boolean };
  };
}

function readIosHints() {
  if (typeof window === "undefined") {
    return { iosDevice: false, iosSafari: false };
  }
  const nav = hostWindow().navigator;
  const ua = nav.userAgent ?? "";
  const touch = nav.maxTouchPoints ?? 0;
  return {
    iosDevice: isLikelyIosDevice(ua, touch),
    iosSafari: isLikelyIosSafari(ua, touch),
  };
}

export function usePwaInstall() {
  const [host, setHost] = useState(() => getPwaInstallHost());
  const [standalone, setStandalone] = useState(() => {
    if (typeof window === "undefined") return false;
    return readStandaloneFromWindow(hostWindow());
  });
  const [{ iosDevice, iosSafari }] = useState(readIosHints);
  const [prompting, setPrompting] = useState(false);

  useEffect(() => {
    return subscribePwaInstallHost(() => {
      const next = getPwaInstallHost();
      setHost(next);
      setStandalone(next.standalone);
    });
  }, []);

  const promptNativeInstall = useCallback(async () => {
    if (prompting) return;
    setPrompting(true);
    try {
      await requestNativeInstall();
    } finally {
      setPrompting(false);
    }
  }, [prompting]);

  const confirmed = host.snapshot.confirmed;
  const offer = shouldOfferInstall({
    standalone,
    confirmed,
  });
  const kind = instructionKind({
    standalone,
    confirmed,
    phase: host.snapshot.phase,
    hasNativePrompt: host.snapshot.hasNativePrompt,
    iosDevice,
  });

  return {
    offer,
    kind,
    phase: host.snapshot.phase,
    standalone,
    confirmed,
    hasNativePrompt: host.snapshot.hasNativePrompt,
    iosDevice,
    iosSafari,
    prompting: prompting || host.snapshot.phase === "presented",
    promptNativeInstall,
  };
}
