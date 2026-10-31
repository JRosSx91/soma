import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enCommon from "../../i18n/locales/en/common.json" with { type: "json" };
import esCommon from "../../i18n/locales/es/common.json" with { type: "json" };
import enRecovery from "../../i18n/locales/en/recovery.json" with { type: "json" };
import esRecovery from "../../i18n/locales/es/recovery.json" with { type: "json" };
import enAuth from "../../i18n/locales/en/auth.json" with { type: "json" };
import esAuth from "../../i18n/locales/es/auth.json" with { type: "json" };

const selector = readFileSync(
  new URL("../../components/LanguageSelector.tsx", import.meta.url),
  "utf8",
);
const skip = readFileSync(
  new URL("../../components/SkipToContent.tsx", import.meta.url),
  "utf8",
);
const preview = readFileSync(
  new URL("./components/PreviewShell.tsx", import.meta.url),
  "utf8",
);
const auth = readFileSync(
  new URL("../auth/components/AuthShell.tsx", import.meta.url),
  "utf8",
);
const onboarding = readFileSync(
  new URL("../onboarding/components/OnboardingShell.tsx", import.meta.url),
  "utf8",
);
const landing = readFileSync(
  new URL("../landing-v2/LandingV2Page.tsx", import.meta.url),
  "utf8",
);
const notFound = readFileSync(
  new URL("../../pages/NotFoundPage.tsx", import.meta.url),
  "utf8",
);
const demo = readFileSync(
  new URL("./components/DemoNotice.tsx", import.meta.url),
  "utf8",
);
const i18nConfig = readFileSync(
  new URL("../../i18n/config.ts", import.meta.url),
  "utf8",
);

test("language selector accessible name follows ES/EN without hardcoded English", () => {
  assert.equal(enCommon.language.selector, "Language: {{language}}");
  assert.equal(esCommon.language.selector, "Idioma: {{language}}");
  assert.equal(enCommon.language.list, "Languages");
  assert.equal(esCommon.language.list, "Idiomas");
  assert.match(selector, /t\("language\.selector"/);
  assert.match(selector, /t\("language\.list"\)/);
  assert.doesNotMatch(selector, /aria-label=\{`Language:/);
  assert.doesNotMatch(selector, /aria-label="Select language"/);
  assert.match(selector, /code: "es"/);
  assert.match(selector, /code: "en"/);
});

test("DEMO badge stays DEMO while the accessible name is translated", () => {
  assert.equal(enRecovery.demoBadge, "DEMO");
  assert.equal(esRecovery.demoBadge, "DEMO");
  assert.equal(enRecovery.demoAria, "DEMO. {{disclaimer}}");
  assert.equal(esRecovery.demoAria, "DEMO. {{disclaimer}}");
  assert.match(demo, /t\("demoBadge"\)/);
  assert.match(demo, /t\("demoAria"/);
  assert.match(demo, /t\("demoDisclaimer"\)/);
  assert.doesNotMatch(demo, />DEMO</);
});

test("each layout exposes one skip link to a single main landmark", () => {
  assert.equal(enCommon.skipToContent, "Skip to main content");
  assert.equal(esCommon.skipToContent, "Saltar al contenido principal");
  assert.match(skip, /href=\{`#\$\{targetId\}`\}/);
  assert.match(skip, /MAIN_CONTENT_ID = "main-content"/);
  assert.equal((preview.match(/<SkipToContent/g) ?? []).length, 1);
  assert.match(preview, /id=\{MAIN_CONTENT_ID\}/);
  assert.equal((auth.match(/<SkipToContent/g) ?? []).length, 1);
  assert.match(auth, /id=\{MAIN_CONTENT_ID\}/);
  assert.equal((onboarding.match(/<SkipToContent/g) ?? []).length, 1);
  assert.match(onboarding, /id=\{MAIN_CONTENT_ID\}/);
  assert.equal((landing.match(/<SkipToContent/g) ?? []).length, 1);
  assert.match(landing, /targetId="landing-v2-main"/);
  assert.match(landing, /id="landing-v2-main"/);
  assert.equal((notFound.match(/<SkipToContent/g) ?? []).length, 1);
  assert.match(notFound, /id=\{MAIN_CONTENT_ID\}/);
});

test("login pending loading copy exists in spanish and english", () => {
  assert.equal(enAuth.login.pendingLoading, "Checking your setup…");
  assert.equal(esAuth.login.pendingLoading, "Comprobando tu configuración…");
});

test("document language follows i18n on init and languageChanged", () => {
  assert.match(i18nConfig, /syncDocumentLanguage\(resolved\)/);
  assert.match(i18nConfig, /i18n\.on\("initialized", applyInterfaceLanguage\)/);
  assert.match(i18nConfig, /i18n\.on\("languageChanged", applyInterfaceLanguage\)/);
  assert.match(auth, /document\.title = `\$\{t\("appName"\)\} — \$\{t\(authTitleKey\(pathname\)\)\}`/);
});
