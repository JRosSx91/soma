import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test } from "node:test";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import enPwa from "../../i18n/locales/en/pwa.json" with { type: "json" };
import esPwa from "../../i18n/locales/es/pwa.json" with { type: "json" };
import { InstallSomaDialogBody } from "./InstallSomaControl.js";
import {
  deferNativeInstallEvent,
  initialPwaInstallSnapshot,
  instructionKind,
  isLikelyIosDevice,
  isLikelyIosSafari,
  isStandaloneDisplay,
  reducePwaInstall,
  shouldOfferInstall,
} from "./pwa-install.js";

const config = readFileSync(new URL("../../i18n/config.ts", import.meta.url), "utf8");
const hook = readFileSync(new URL("./usePwaInstall.ts", import.meta.url), "utf8");
const host = readFileSync(new URL("./pwa-install-host.ts", import.meta.url), "utf8");
const control = readFileSync(new URL("./InstallSomaControl.tsx", import.meta.url), "utf8");
const landing = readFileSync(
  new URL("../landing-v2/LandingV2Closing.tsx", import.meta.url),
  "utf8",
);
const account = readFileSync(
  new URL("../recovery-dashboard/pages/AccountPage.tsx", import.meta.url),
  "utf8",
);
const sheet = readFileSync(
  new URL("../recovery-dashboard/components/DetailSheet.tsx", import.meta.url),
  "utf8",
);

function flattenKeys(value: unknown, prefix = ""): string[] {
  if (value == null || typeof value !== "object") return prefix ? [prefix] : [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) =>
    flattenKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
}

test("standalone uses display-mode and iOS navigator.standalone, not user-agent", () => {
  assert.equal(isStandaloneDisplay({ displayModeStandalone: true }), true);
  assert.equal(
    isStandaloneDisplay({
      displayModeStandalone: false,
      displayModeWindowControlsOverlay: true,
    }),
    true,
  );
  assert.equal(
    isStandaloneDisplay({
      displayModeStandalone: false,
      iosNavigatorStandalone: true,
    }),
    true,
  );
  assert.equal(isStandaloneDisplay({ displayModeStandalone: false }), false);
  assert.equal(shouldOfferInstall({ standalone: true, confirmed: false }), false);
  assert.equal(shouldOfferInstall({ standalone: false, confirmed: true }), false);
  assert.equal(shouldOfferInstall({ standalone: false, confirmed: false }), true);
});

test("platform hints distinguish iOS Safari, iOS Chrome, Android, and desktop", () => {
  assert.equal(isLikelyIosDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"), true);
  assert.equal(
    isLikelyIosSafari("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"),
    true,
  );
  assert.equal(
    isLikelyIosSafari(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1",
    ),
    false,
  );
  assert.equal(isLikelyIosDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 5), true);
  assert.equal(isLikelyIosDevice("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 0), false);
  assert.equal(
    isLikelyIosDevice(
      "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
    ),
    false,
  );
});

test("instruction kind prefers native prompt, then iOS copy, then manual", () => {
  const base = {
    standalone: false,
    confirmed: false,
    phase: "idle" as const,
    hasNativePrompt: false,
    iosDevice: false,
  };
  assert.equal(
    instructionKind({ ...base, standalone: true, hasNativePrompt: true, iosDevice: true }),
    "hidden",
  );
  assert.equal(
    instructionKind({ ...base, confirmed: true, hasNativePrompt: true }),
    "hidden",
  );
  assert.equal(
    instructionKind({ ...base, hasNativePrompt: true, phase: "available" }),
    "prompt",
  );
  assert.equal(
    instructionKind({ ...base, phase: "accepted", iosDevice: false }),
    "pending",
  );
  assert.equal(instructionKind({ ...base, iosDevice: true }), "ios");
  assert.equal(instructionKind(base), "manual");
});

test("install phases distinguish presented, accepted, confirmed, cancelled, and unknown", () => {
  const idle = initialPwaInstallSnapshot();
  const available = reducePwaInstall(idle, { type: "native-prompt-captured" });
  assert.deepEqual(available, {
    phase: "available",
    hasNativePrompt: true,
    confirmed: false,
  });

  const presented = reducePwaInstall(available, { type: "prompt-started" });
  assert.equal(presented.phase, "presented");
  assert.equal(presented.confirmed, false);

  const accepted = reducePwaInstall(presented, {
    type: "user-choice",
    outcome: "accepted",
  });
  assert.deepEqual(accepted, {
    phase: "accepted",
    hasNativePrompt: false,
    confirmed: false,
  });
  assert.equal(shouldOfferInstall({ standalone: false, confirmed: accepted.confirmed }), true);

  const confirmed = reducePwaInstall(accepted, { type: "appinstalled" });
  assert.deepEqual(confirmed, {
    phase: "confirmed",
    hasNativePrompt: false,
    confirmed: true,
  });

  const dismissed = reducePwaInstall(presented, {
    type: "user-choice",
    outcome: "dismissed",
  });
  assert.equal(dismissed.phase, "dismissed");
  assert.equal(dismissed.confirmed, false);

  const unknown = reducePwaInstall(presented, { type: "prompt-failed" });
  assert.equal(unknown.phase, "unknown");
  assert.equal(unknown.confirmed, false);
});

test("beforeinstallprompt is deferred and prompt() is not implied by capture", () => {
  let prevented = false;
  deferNativeInstallEvent({
    preventDefault() {
      prevented = true;
    },
  });
  assert.equal(prevented, true);
  assert.match(host, /deferNativeInstallEvent/);
  assert.match(host, /beforeinstallprompt/);
  assert.match(host, /appinstalled/);
  assert.match(host, /event\.prompt\(\)/);
  assert.match(host, /attachCount/);
  assert.match(hook, /subscribePwaInstallHost/);
  assert.match(hook, /requestNativeInstall/);
  assert.match(control, /onClick=\{openDialog\}/);
  assert.match(control, /void install\.promptNativeInstall\(\)/);
});

test("accepted userChoice is not treated as a confirmed install", () => {
  assert.match(control, /phase === "confirmed"/);
  assert.match(control, /outcomeConfirmed/);
  assert.match(control, /phase === "accepted"/);
  assert.match(control, /outcomeAccepted/);
  assert.match(control, /phase === "dismissed"/);
  assert.match(control, /phase === "unknown"/);
  assert.equal(enPwa.outcomeConfirmed.includes("was added"), true);
  assert.equal(enPwa.outcomeAccepted.includes("was added"), false);
  assert.equal(esPwa.outcomeAccepted.includes("se añadió"), false);
  assert.match(host, /type: "user-choice"/);
  assert.match(host, /type: "appinstalled"/);
  assert.match(host, /type: "prompt-failed"/);
});

test("landing and LIVE account expose install without auto-opening a dialog", () => {
  assert.match(landing, /InstallSomaControl/);
  assert.match(landing, /tone="footer"/);
  assert.match(account, /InstallSomaControl/);
  assert.match(account, /tone="account"/);
  const demoBranch = account.slice(
    account.indexOf('if (base !== "/app")'),
    account.indexOf("if (loading && !profile)"),
  );
  assert.equal(demoBranch.includes("InstallSomaControl"), false);
  assert.equal(control.includes("useState(true)"), false);
  assert.match(control, /useState\(false\)/);
  assert.equal(landing.includes("beforeinstallprompt"), false);
  assert.equal(hook.includes("setOpen(true)"), false);
});

test("install UX does not change authentication", () => {
  assert.equal(control.includes("useAuth"), false);
  assert.equal(hook.includes("useAuth"), false);
  assert.equal(host.includes("useAuth"), false);
  assert.match(account, /useAuth/);
});

test("install dialog reuses DetailSheet keyboard and roles", () => {
  assert.match(control, /DetailSheet/);
  assert.match(sheet, /role="dialog"/);
  assert.match(sheet, /aria-modal="true"/);
  assert.match(sheet, /event\.key === "Escape"/);
  assert.match(control, /previewFocus/);
  assert.match(control, /aria-haspopup="dialog"/);
});

test("ES and EN PWA catalogs share keys and do not claim stores or offline", () => {
  assert.deepEqual(flattenKeys(esPwa).sort(), flattenKeys(enPwa).sort());
  for (const key of flattenKeys(esPwa)) {
    const es = (esPwa as Record<string, string>)[key];
    const en = (enPwa as Record<string, string>)[key];
    assert.equal(typeof es, "string", key);
    assert.equal(typeof en, "string", key);
    assert.ok(es.length > 0, key);
    assert.ok(en.length > 0, key);
  }
  assert.equal(enPwa.installAction, "Install SOMA");
  assert.equal(esPwa.installAction, "Instalar SOMA");
  const blob = `${JSON.stringify(enPwa)} ${JSON.stringify(esPwa)}`.toLowerCase();
  assert.equal(blob.includes("offline"), false);
  assert.equal(blob.includes("play store"), false);
  assert.match(enPwa.intro, /browser/i);
  assert.match(esPwa.intro, /navegador/i);
  assert.match(config, /"pwa"/);
  assert.match(config, /pwa: enPwa/);
  assert.match(config, /pwa: esPwa/);
});

test("dialog body shows native install, iOS, or manual copy without auto success", async () => {
  async function html(
    lng: "en" | "es",
    kind: "prompt" | "ios" | "manual" | "pending" | "hidden",
    phase: "idle" | "accepted" | "confirmed" | "dismissed" | "unknown" = "idle",
  ) {
    const instance = i18n.createInstance();
    await instance.use(initReactI18next).init({
      lng,
      resources: { en: { pwa: enPwa }, es: { pwa: esPwa } },
      interpolation: { escapeValue: false },
    });
    return renderToStaticMarkup(
      createElement(
        I18nextProvider,
        { i18n: instance },
        createElement(InstallSomaDialogBody, {
          kind,
          phase,
          iosSafari: true,
          prompting: false,
          onPrompt() {},
        }),
      ),
    );
  }

  const prompt = await html("en", "prompt");
  assert.match(prompt, /Your browser can add SOMA/);
  assert.match(prompt, />Install</);
  assert.equal(prompt.includes("SOMA was added"), false);
  assert.equal(prompt.includes('role="dialog"'), false);

  const accepted = await html("en", "pending", "accepted");
  assert.match(accepted, /accepted the install request/);
  assert.equal(accepted.includes("SOMA was added"), false);

  const confirmed = await html("en", "hidden", "confirmed");
  assert.match(confirmed, /SOMA was added/);

  const ios = await html("es", "ios");
  assert.match(ios, /Compartir/);
  assert.equal(ios.includes("Instalar aplicación"), false);

  const manual = await html("en", "manual");
  assert.match(manual, /Chrome or Edge/);
});
