import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import enExploreEdu from "../../../i18n/locales/en/explore-edu.json" with { type: "json" };
import esExploreEdu from "../../../i18n/locales/es/explore-edu.json" with { type: "json" };
import enSupport from "../../../i18n/locales/en/support.json" with { type: "json" };
import esSupport from "../../../i18n/locales/es/support.json" with { type: "json" };
import enLegal from "../../../i18n/locales/en/legal.json" with { type: "json" };
import esLegal from "../../../i18n/locales/es/legal.json" with { type: "json" };
import { ShellBaseProvider } from "../context/ShellBaseContext.js";
import { isPublishedExploreEduSheet } from "../explore/explore-edu.js";
import { photoPlateFor } from "../photo-plate.js";
import { moreShellSections, railMoreShellSections, type ShellBase } from "../shell-base.js";
import { SupportSections } from "../support/SupportSections.js";
import {
  SUPPORT_LEARN_SHEETS,
  SUPPORT_TERMS_EMERGENCY_HREF,
  supportExploreHref,
  supportLearnLinks,
} from "../support/support-links.js";

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, "../../..");
const publicDir = join(here, "../../../../public");
const page = readFileSync(new URL("./SupportPage.tsx", import.meta.url), "utf8");
const sections = readFileSync(new URL("../support/SupportSections.tsx", import.meta.url), "utf8");
const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");
const legalPage = readFileSync(
  new URL("../../legal/LegalDocumentPage.tsx", import.meta.url),
  "utf8",
);
const i18nConfig = readFileSync(new URL("../../../i18n/config.ts", import.meta.url), "utf8");

async function render(base: ShellBase, lng: "es" | "en") {
  const instance = i18n.createInstance();
  await instance.use(initReactI18next).init({
    lng,
    resources: {
      es: { support: esSupport, "explore-edu": esExploreEdu },
      en: { support: enSupport, "explore-edu": enExploreEdu },
    },
    interpolation: { escapeValue: false },
  });
  return renderToStaticMarkup(
    createElement(
      I18nextProvider,
      { i18n: instance },
      createElement(
        MemoryRouter,
        { initialEntries: [`${base}/support`] },
        createElement(ShellBaseProvider, { base }, createElement(SupportSections)),
      ),
    ),
  );
}

function hrefs(markup: string): string[] {
  return [...markup.matchAll(/href="([^"]+)"/g)].map((match) => match[1] ?? "");
}

function leafKeys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    leafKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

function leafValues(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value !== "object" || value === null) return [];
  return Object.values(value).flatMap(leafValues);
}

test("support route is shared by DEMO and LIVE and reachable only from «Más»", () => {
  assert.match(app, /<Route path="support" element=\{<SupportPage \/>\} \/>/);
  const shared = app.slice(app.indexOf("const soma2Pages"), app.indexOf("function App()"));
  assert.match(shared, /path="support"/);
  for (const base of ["/app", "/preview"] as const) {
    const more = moreShellSections(base).find((item) => item.id === "apoyo");
    assert.equal(more?.to, `${base}/support`);
    assert.equal(more?.desktop, false);
    assert.equal(more?.mobile, false);
    assert.equal(
      railMoreShellSections(base).some((item) => item.id === "apoyo"),
      true,
    );
  }
});

test("learn links stay inside the active base and only open published articles", async () => {
  assert.equal(SUPPORT_LEARN_SHEETS.length >= 3 && SUPPORT_LEARN_SHEETS.length <= 4, true);
  for (const base of ["/app", "/preview"] as const) {
    const links = supportLearnLinks(base);
    assert.equal(links.length, SUPPORT_LEARN_SHEETS.length);
    for (const link of links) {
      assert.equal(isPublishedExploreEduSheet(link.id), true, link.id);
      assert.equal(link.href, `${base}/explore?edu=${link.id}`);
    }
    assert.equal(supportExploreHref(base), `${base}/explore`);

    const markup = await render(base, "es");
    const other = base === "/app" ? "/preview" : "/app";
    const inApp = hrefs(markup).filter((href) => href !== SUPPORT_TERMS_EMERGENCY_HREF);
    assert.equal(inApp.length, SUPPORT_LEARN_SHEETS.length + 1);
    assert.ok(inApp.every((href) => href.startsWith(`${base}/`)), inApp.join(", "));
    assert.ok(inApp.every((href) => !href.startsWith(`${other}/`)));
    assert.equal(hrefs(markup).includes(SUPPORT_TERMS_EMERGENCY_HREF), true);
  }
});

test("learn link titles reuse published explore-edu copy in both languages", async () => {
  for (const id of SUPPORT_LEARN_SHEETS) {
    assert.equal(typeof esExploreEdu.sheets[id].sections.what.title, "string");
    assert.equal(typeof enExploreEdu.sheets[id].sections.what.title, "string");
  }
  const es = await render("/preview", "es");
  const en = await render("/preview", "en");
  assert.match(es, /¿Qué es la dependencia física\?/);
  assert.equal(es.includes("explore-edu:"), false);
  assert.equal(en.includes("explore-edu:"), false);
  assert.equal(es.includes("support:"), false);
  assert.equal(en.includes("support:"), false);
});

test("the emergency link targets the published terms section", () => {
  assert.equal(SUPPORT_TERMS_EMERGENCY_HREF, "/terms#terms-emergency");
  assert.match(legalPage, /"emergency",/);
  assert.match(legalPage, /id=\{`\$\{kind\}-\$\{section\}`\}/);
  assert.match(legalPage, /const \{ hash \} = useLocation\(\);/);
  assert.match(legalPage, /getElementById\(decodeURIComponent\(hash\.slice\(1\)\)\)\?\.scrollIntoView\(\)/);
  assert.equal(typeof esLegal.terms.emergencyTitle, "string");
  assert.equal(typeof enLegal.terms.emergencyTitle, "string");
  assert.match(app, /<Route path="\/terms" element=\{<TermsPage \/>\} \/>/);
});

test("support copy has ES/EN parity and is registered", () => {
  assert.deepEqual(leafKeys(esSupport).sort(), leafKeys(enSupport).sort());
  for (const value of [...leafValues(esSupport), ...leafValues(enSupport)]) {
    assert.notEqual(value.trim(), "");
  }
  assert.equal(esSupport.title, "Apoyo y herramientas.");
  assert.equal(esSupport.eyebrow, "Apoyo");
  assert.match(i18nConfig, /import esSupport from "\.\/locales\/es\/support\.json"/);
  assert.match(i18nConfig, /import enSupport from "\.\/locales\/en\/support\.json"/);
  assert.match(i18nConfig, /"support",\s*\n\s*\],/);
  assert.equal((i18nConfig.match(/support: enSupport,/g) ?? []).length, 7);
  assert.equal((i18nConfig.match(/support: esSupport,/g) ?? []).length, 1);
});

test("no fake actions, phone numbers or efficacy claims", async () => {
  for (const source of [page, sections]) {
    assert.equal(source.includes("<button"), false);
    assert.equal(source.includes("onClick"), false);
    assert.equal(source.includes("tel:"), false);
    assert.equal(source.includes("localStorage"), false);
    assert.equal(source.includes("sessionStorage"), false);
    assert.equal(source.includes("fetch("), false);
  }
  for (const lng of ["es", "en"] as const) {
    const markup = await render("/app", lng);
    assert.equal(markup.includes("<button"), false);
    assert.equal(markup.includes('role="button"'), false);
    assert.equal(markup.includes("tel:"), false);
  }
  const copy = [...leafValues(esSupport), ...leafValues(enSupport)].join("\n");
  assert.doesNotMatch(copy, /\d{3}/);
  assert.doesNotMatch(copy, /evidencia|evidence|eficaz|efectiv|effective|reduce la ansiedad|reduces? anxiety/i);
  assert.doesNotMatch(copy, /Buscar ayuda ahora|Get help now/i);
  assert.doesNotMatch(copy, /hacerlo solo\b/);
  assert.doesNotMatch(copy, /Iniciar|Configurar mi plan|Ver todos/);
  assert.equal(page.includes("lungs"), false);
  assert.equal(page.includes("anatomy/"), false);
});

test("hero uses its exclusive nature-11 plate and shows the DEMO notice only in preview", () => {
  assert.match(page, /RecoveryHero/);
  assert.match(page, /\/images\/decoration\/nature-11\.png/);
  assert.match(page, /objectPosition=\{SUPPORT_HERO_OBJECT_POSITION\}/);
  const plate = photoPlateFor("/images/decoration/nature-11.png");
  assert.ok(plate);
  assert.equal(plate.width, 2172);
  assert.equal(plate.height, 724);
  for (const file of ["nature-11.png", "nature-11.webp", "nature-11-960.webp", "nature-11-1600.webp"]) {
    assert.equal(existsSync(join(publicDir, "images/decoration", file)), true, file);
  }
  const otherSources = readdirSync(srcDir, { recursive: true, encoding: "utf8" })
    .filter((file) => /\.tsx?$/.test(file) && !/SupportPage(\.test)?\.tsx?$/.test(file))
    .filter((file) => readFileSync(join(srcDir, file), "utf8").includes("nature-11"));
  assert.deepEqual(otherSources, [join("features", "recovery-dashboard", "photo-plate.ts")]);
  assert.match(page, /const demo = base === "\/preview";/);
  assert.match(page, /demo=\{demo\}/);
  assert.match(page, /quote=\{t\("quote"\)\}/);
});
