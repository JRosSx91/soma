import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import enCommon from "../../i18n/locales/en/common.json" with { type: "json" };
import esCommon from "../../i18n/locales/es/common.json" with { type: "json" };
import {
  readSidebarCollapsed,
  SHELL_CONTENT_COLLAPSED_ALIGN_CLASS,
  SHELL_CONTENT_COLLAPSED_PAD_CLASS,
  SHELL_CONTENT_EXPANDED_PAD_CLASS,
  SHELL_SIDEBAR_COLLAPSED_CLASS,
  SHELL_SIDEBAR_EXPANDED_CLASS,
  SHELL_SIDEBAR_STORAGE_KEY,
  writeSidebarCollapsed,
} from "./shell-sidebar.ts";

test("sidebar collapsed preference round-trips through localStorage", () => {
  const memory = new Map<string, string>();
  const original = globalThis.localStorage;
  const stub = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
    clear: () => memory.clear(),
    key: () => null,
    length: 0,
  };
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: stub,
  });
  try {
    assert.equal(readSidebarCollapsed(), false);
    writeSidebarCollapsed(true);
    assert.equal(memory.get(SHELL_SIDEBAR_STORAGE_KEY), "1");
    assert.equal(readSidebarCollapsed(), true);
    writeSidebarCollapsed(false);
    assert.equal(readSidebarCollapsed(), false);
  } finally {
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: original,
    });
  }
});

test("shell chrome collapse copy exists in spanish and english", () => {
  for (const key of ["collapseNav", "expandNav"] as const) {
    assert.equal(typeof esCommon.shell[key], "string");
    assert.equal(typeof enCommon.shell[key], "string");
    assert.notEqual(esCommon.shell[key].trim(), "");
    assert.notEqual(enCommon.shell[key].trim(), "");
  }
});

test("authenticated chrome keeps language, inbox and account in the header", () => {
  const header = readFileSync(
    new URL("./components/PreviewMobileHeader.tsx", import.meta.url),
    "utf8",
  );
  const sidebar = readFileSync(
    new URL("./components/PreviewSidebar.tsx", import.meta.url),
    "utf8",
  );
  const shell = readFileSync(
    new URL("./components/PreviewShell.tsx", import.meta.url),
    "utf8",
  );
  assert.match(header, /LanguageSelector/);
  assert.match(header, /AchievementInboxBell compact/);
  assert.match(header, /AccountMenu compact/);
  assert.match(header, /<SomaMark \/>/);
  assert.match(header, /bg-soma-shell-rail/);
  assert.match(header, /lg:hidden/);
  assert.equal(header.includes("shell.openNav"), false);
  assert.equal(header.includes("titleLabel"), false);
  assert.match(sidebar, /LanguageSelector compact=\{collapsed\} floating/);
  assert.match(sidebar, /AchievementInboxBell compact=\{collapsed\} anchor="right"/);
  assert.match(sidebar, /AccountMenu compact=\{collapsed\} anchor="right"/);
  assert.equal(sidebar.includes("mobileOpen"), false);
  assert.match(sidebar, /hidden flex-col/);
  assert.match(sidebar, /lg:flex/);
  assert.match(sidebar, /lg:w-\[4\.5rem\]/);
  assert.match(sidebar, /ChevronLeft/);
  assert.match(sidebar, /h-3\.5 w-3\.5/);
  assert.match(sidebar, /SomaMark compact=\{collapsed\}/);
  assert.equal(sidebar.includes("expeditions"), false);
  assert.match(sidebar, /shellNavActiveClass/);
  assert.match(sidebar, /bg-soma-shell-rail/);
  assert.equal(sidebar.includes("bg-[#081018]"), false);
  assert.match(sidebar, /shell\.collapseNav/);
  assert.equal(sidebar.includes("flex-col lg:justify-center"), false);
  assert.match(sidebar, /mt-auto/);
  assert.match(sidebar, /translate-x-1\/2/);
  assert.match(shell, /PreviewMobileNav/);
  assert.match(shell, /--soma-shell-canvas/);
  assert.match(shell, /--soma-shell-rail/);
  assert.equal(shell.includes("bg-[#081018]"), false);
  assert.match(shell, /safe-area-inset-bottom/);
  assert.match(shell, /SHELL_SIDEBAR_COLLAPSED_CLASS/);
  assert.match(shell, /SHELL_CONTENT_COLLAPSED_PAD_CLASS/);
  assert.match(shell, /SHELL_CONTENT_COLLAPSED_ALIGN_CLASS/);
  assert.equal(SHELL_SIDEBAR_EXPANDED_CLASS, "lg:pl-60");
  assert.equal(SHELL_SIDEBAR_COLLAPSED_CLASS, "lg:pl-[4.5rem]");
  assert.equal(SHELL_CONTENT_EXPANDED_PAD_CLASS, "lg:px-6");
  assert.equal(SHELL_CONTENT_COLLAPSED_PAD_CLASS, "lg:pl-14 lg:pr-6");
  assert.equal(SHELL_CONTENT_COLLAPSED_ALIGN_CLASS, "lg:ml-0");
});
