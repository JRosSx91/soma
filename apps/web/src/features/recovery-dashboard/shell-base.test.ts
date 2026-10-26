import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enCommon from "../../i18n/locales/en/common.json" with { type: "json" };
import esCommon from "../../i18n/locales/es/common.json" with { type: "json" };
import {
  isAppShellPath,
  shellBaseFromPath,
  shellSectionDefs,
  shellSections,
} from "./shell-base.ts";

test("shell sections stay inside their base", () => {
  const app = shellSections("/app");
  const preview = shellSections("/preview");

  assert.equal(app[0]?.to, "/app");
  assert.equal(app.find((item) => item.id === "recuperacion")?.to, "/app/recovery");
  assert.equal(app.find((item) => item.id === "logros")?.to, "/app/achievements");

  assert.equal(preview[0]?.to, "/preview");
  assert.equal(
    preview.find((item) => item.id === "recuperacion")?.to,
    "/preview/recovery",
  );
  assert.ok(app.every((item) => item.to === "/app" || item.to.startsWith("/app/")));
  assert.ok(
    preview.every(
      (item) => item.to === "/preview" || item.to.startsWith("/preview/"),
    ),
  );
  assert.ok(app.every((item) => !item.to.startsWith("/preview")));
  assert.ok(preview.every((item) => !item.to.startsWith("/app")));
});

test("authenticated shell chrome includes the shared language selector", () => {
  const header = readFileSync(
    new URL("./components/PreviewMobileHeader.tsx", import.meta.url),
    "utf8",
  );
  const sidebar = readFileSync(
    new URL("./components/PreviewSidebar.tsx", import.meta.url),
    "utf8",
  );
  assert.match(header, /LanguageSelector/);
  assert.match(header, /AchievementInboxBell compact/);
  assert.match(sidebar, /LanguageSelector placement="up"/);
  assert.match(sidebar, /AchievementInboxBell compact placement="up"/);
  const selector = readFileSync(
    new URL("../../components/LanguageSelector.tsx", import.meta.url),
    "utf8",
  );
  assert.match(
    selector,
    /placement === "up" \? "left-0 bottom-full mb-2" : "right-0 top-full mt-2"/,
  );
});

test("LIVE celebration copy exists in spanish and english", () => {
  const keys = [
    "soloTitle",
    "groupTitle",
    "continue",
    "viewAll",
    "soundEnable",
    "soundDisable",
  ] as const;
  for (const key of keys) {
    assert.equal(typeof esCommon.celebration[key], "string");
    assert.equal(typeof enCommon.celebration[key], "string");
    assert.notEqual(esCommon.celebration[key].trim(), "");
    assert.notEqual(enCommon.celebration[key].trim(), "");
  }
});

test("notification copy exists in spanish and english", () => {
  const keys = [
    "title",
    "bellLabel",
    "empty",
    "viewAll",
    "markRead",
    "initialSummary",
  ] as const;
  for (const key of keys) {
    assert.equal(typeof esCommon.notifications[key], "string");
    assert.equal(typeof enCommon.notifications[key], "string");
    assert.notEqual(esCommon.notifications[key].trim(), "");
    assert.notEqual(enCommon.notifications[key].trim(), "");
  }
  assert.equal(esCommon.notifications.title, "Notificaciones");
  assert.equal(enCommon.notifications.title, "Notifications");
});

test("shell navigation labels live in spanish and english common copy", () => {
  const keys = [
    "navAria",
    "home",
    "recovery",
    "recoveryShort",
    "explore",
    "anatomy",
    "anatomyShort",
    "achievements",
  ] as const;
  for (const key of keys) {
    assert.equal(typeof esCommon.shell[key], "string");
    assert.equal(typeof enCommon.shell[key], "string");
    assert.notEqual(esCommon.shell[key].trim(), "");
    assert.notEqual(enCommon.shell[key].trim(), "");
  }
  assert.equal(esCommon.shell.home, "Inicio");
  assert.equal(esCommon.shell.recovery, "Mi recuperación");
  assert.equal(esCommon.shell.recoveryShort, "Recuperación");
  assert.equal(esCommon.shell.explore, "Explorar");
  assert.equal(esCommon.shell.anatomy, "Explorador anatómico");
  assert.equal(esCommon.shell.anatomyShort, "Anatomía");
  assert.equal(esCommon.shell.achievements, "Logros");
  assert.equal(enCommon.shell.home, "Home");
  assert.equal(enCommon.shell.recovery, "My recovery");
  assert.equal(enCommon.shell.recoveryShort, "Recovery");
  assert.equal(enCommon.shell.explore, "Explore");
  assert.equal(enCommon.shell.anatomy, "Anatomical explorer");
  assert.equal(enCommon.shell.anatomyShort, "Anatomy");
  assert.equal(enCommon.shell.achievements, "Achievements");

  const source = readFileSync(new URL("./shell-base.ts", import.meta.url), "utf8");
  assert.equal(source.includes("Inicio"), false);
  assert.equal(source.includes("Logros"), false);
  for (const item of shellSectionDefs) {
    assert.equal(item.labelKey in esCommon.shell, true, item.labelKey);
    assert.equal(item.mobileLabelKey in esCommon.shell, true, item.mobileLabelKey);
    assert.equal(item.labelKey in enCommon.shell, true, item.labelKey);
    assert.equal(item.mobileLabelKey in enCommon.shell, true, item.mobileLabelKey);
  }
});

test("sidebar and mobile nav read shell labels from i18n", () => {
  const sidebar = readFileSync(
    new URL("./components/PreviewSidebar.tsx", import.meta.url),
    "utf8",
  );
  const mobile = readFileSync(
    new URL("./components/PreviewMobileNav.tsx", import.meta.url),
    "utf8",
  );
  const shell = readFileSync(
    new URL("./components/PreviewShell.tsx", import.meta.url),
    "utf8",
  );
  assert.match(sidebar, /t\(`shell\.\$\{item\.labelKey\}`\)/);
  assert.match(mobile, /t\(`shell\.\$\{item\.mobileLabelKey\}`\)/);
  assert.match(shell, /t\(`shell\.\$\{current\.labelKey\}`\)/);
  assert.match(sidebar, /t\("shell\.navAria"\)/);
  assert.match(mobile, /t\("shell\.navAria"\)/);
});

test("app shell path detection does not swallow app-legacy", () => {
  assert.equal(isAppShellPath("/app"), true);
  assert.equal(isAppShellPath("/app/recovery"), true);
  assert.equal(isAppShellPath("/app-legacy"), false);
  assert.equal(isAppShellPath("/preview"), false);
  assert.equal(shellBaseFromPath("/app/anatomy"), "/app");
  assert.equal(shellBaseFromPath("/preview/explore"), "/preview");
});
