import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enCommon from "../../i18n/locales/en/common.json" with { type: "json" };
import esCommon from "../../i18n/locales/es/common.json" with { type: "json" };
import {
  desktopShellSections,
  isAppShellPath,
  isSectionPathActive,
  mobileShellSections,
  moreShellSections,
  railMoreShellSections,
  shellBaseFromPath,
  shellSectionDefs,
  shellSectionForPathname,
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
  assert.match(header, /lg:hidden/);
  assert.match(header, /AchievementInboxBell compact/);
  assert.match(header, /AccountMenu compact/);
  assert.match(sidebar, /LanguageSelector/);
  assert.match(sidebar, /AchievementInboxBell/);
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
    "journal",
    "missions",
    "feedback",
    "account",
    "more",
    "moreMenuAria",
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
  assert.equal(esCommon.shell.journal, "Bitácora");
  assert.equal(esCommon.shell.missions, "Misiones");
  assert.equal(esCommon.shell.feedback, "Ayuda y sugerencias");
  assert.equal(esCommon.shell.account, "Cuenta");
  assert.equal(esCommon.shell.more, "Más");
  assert.equal(enCommon.shell.home, "Home");
  assert.equal(enCommon.shell.recovery, "My recovery");
  assert.equal(enCommon.shell.recoveryShort, "Recovery");
  assert.equal(enCommon.shell.explore, "Explore");
  assert.equal(enCommon.shell.anatomy, "Anatomical explorer");
  assert.equal(enCommon.shell.anatomyShort, "Anatomy");
  assert.equal(enCommon.shell.achievements, "Achievements");
  assert.equal(enCommon.shell.journal, "Journal");
  assert.equal(enCommon.shell.missions, "Missions");
  assert.equal(enCommon.shell.feedback, "Help and suggestions");
  assert.equal(enCommon.shell.account, "Account");
  assert.equal(enCommon.shell.more, "More");

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
  assert.match(mobile, /PreviewMoreMenu/);
  assert.match(sidebar, /PreviewMoreMenu variant="rail"/);
  assert.match(sidebar, /desktopShellSections/);
  assert.match(mobile, /mobileShellSections/);
  assert.match(sidebar, /SomaMark compact=\{collapsed\}/);
  assert.equal(sidebar.includes("expeditions"), false);
  const mark = readFileSync(new URL("./components/SomaMark.tsx", import.meta.url), "utf8");
  assert.match(mark, /Expeditions/);
});

test("app shell path detection does not swallow app-legacy", () => {
  assert.equal(isAppShellPath("/app"), true);
  assert.equal(isAppShellPath("/app/recovery"), true);
  assert.equal(isAppShellPath("/app-legacy"), false);
  assert.equal(isAppShellPath("/preview"), false);
  assert.equal(shellBaseFromPath("/app/anatomy"), "/app");
  assert.equal(shellBaseFromPath("/preview/explore"), "/preview");
});

test("desktop, mobile and more menus split one section table", () => {
  const desktop = desktopShellSections("/app").map((item) => item.id);
  const mobile = mobileShellSections("/preview").map((item) => item.id);
  const more = moreShellSections("/app").map((item) => item.id);
  assert.deepEqual(desktop, [
    "inicio",
    "recuperacion",
    "explorar",
    "misiones",
    "anatomia",
    "logros",
    "bitacora",
  ]);
  assert.equal(desktop.includes("ayuda"), false);
  assert.deepEqual(mobile, ["inicio", "recuperacion", "explorar"]);
  assert.equal(mobile.includes("ayuda"), false);
  assert.deepEqual(more, [
    "misiones",
    "anatomia",
    "logros",
    "bitacora",
    "ayuda",
    "cuenta",
  ]);
  assert.deepEqual(
    railMoreShellSections("/app").map((item) => item.id),
    ["ayuda"],
  );
  assert.equal(
    shellSectionDefs.some((item) => item.id === "expedicion" || item.path === "/expedition"),
    false,
  );
});

test("account is a real shell section and titles it instead of home", () => {
  assert.equal(shellSectionForPathname("/app", "/app")?.id, "inicio");
  assert.equal(shellSectionForPathname("/app", "/app/journal")?.id, "bitacora");
  assert.equal(shellSectionForPathname("/preview", "/preview/journal")?.id, "bitacora");
  assert.equal(shellSectionForPathname("/app", "/app/missions")?.id, "misiones");
  assert.equal(shellSectionForPathname("/preview", "/preview/missions")?.id, "misiones");
  assert.equal(shellSectionForPathname("/app", "/app/feedback")?.id, "ayuda");
  assert.equal(shellSectionForPathname("/preview", "/preview/feedback")?.id, "ayuda");
  assert.equal(shellSectionForPathname("/app", "/app/account")?.id, "cuenta");
  assert.equal(shellSectionForPathname("/preview", "/preview/account")?.id, "cuenta");
  assert.equal(shellSectionForPathname("/app", "/app/recovery")?.id, "recuperacion");
  assert.equal(isSectionPathActive("/app", "/app/recovery", { end: true }), false);
  assert.equal(isSectionPathActive("/app/recovery", "/app/recovery", { end: false }), true);
});

test("shell keeps the existing app and preview destinations", () => {
  const app = shellSections("/app");
  assert.equal(app.find((item) => item.id === "inicio")?.to, "/app");
  assert.equal(app.find((item) => item.id === "recuperacion")?.to, "/app/recovery");
  assert.equal(app.find((item) => item.id === "explorar")?.to, "/app/explore");
  assert.equal(app.find((item) => item.id === "misiones")?.to, "/app/missions");
  assert.equal(app.find((item) => item.id === "anatomia")?.to, "/app/anatomy");
  assert.equal(app.find((item) => item.id === "logros")?.to, "/app/achievements");
  assert.equal(app.find((item) => item.id === "bitacora")?.to, "/app/journal");
  assert.equal(app.find((item) => item.id === "ayuda")?.to, "/app/feedback");
  assert.equal(app.find((item) => item.id === "cuenta")?.to, "/app/account");
  assert.equal(
    shellSections("/preview").find((item) => item.id === "ayuda")?.to,
    "/preview/feedback",
  );
});
