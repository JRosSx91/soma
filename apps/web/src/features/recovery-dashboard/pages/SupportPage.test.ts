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
  SUPPORT_RESOURCE_GROUPS,
  SUPPORT_STRATEGY_TOPICS,
  SUPPORT_TERMS_EMERGENCY_HREF,
  SUPPORT_AVAILABLE_TOOL,
  SUPPORT_TOOLS,
  supportExploreHref,
  supportLearnLinks,
  supportResourceGroups,
} from "../support/support-links.js";
import {
  SUPPORT_ENABLED_STRATEGY_IDS,
  supportStrategyHrefForTopic,
} from "../support/support-strategies.js";
import {
  SUPPORT_ILLUSTRATION_SIZE,
  supportIllustrationSrc,
  supportResourceIllustrations,
  supportToolIllustrations,
} from "../support/support-visuals.js";

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

function blockFor(markup: string, attribute: string, id: string): string {
  const start = markup.indexOf(`${attribute}="${id}"`);
  assert.notEqual(start, -1, `${attribute}=${id}`);
  const ends = [
    markup.indexOf(`${attribute}="`, start + attribute.length + id.length + 3),
    markup.indexOf("</section>", start),
  ].filter((index) => index !== -1);
  return markup.slice(start, Math.min(...ends));
}

test("quick tools: breathing works in DEMO and LIVE, the other three stay planned", async () => {
  assert.deepEqual([...SUPPORT_TOOLS], ["breathing", "mindfulness", "movement", "craving"]);
  assert.equal(SUPPORT_AVAILABLE_TOOL, "breathing");
  for (const base of ["/app", "/preview"] as const) {
    for (const [lng, copy] of [["es", esSupport], ["en", enSupport]] as const) {
      const markup = await render(base, lng);
      for (const tool of SUPPORT_TOOLS) {
        const card = blockFor(markup, "data-tool", tool);
        assert.match(card, new RegExp(`<h3[^>]*>${copy.tools[tool].title}</h3>`));
        assert.equal(card.includes("href="), false, tool);
        assert.match(card, new RegExp(`data-illustration="${supportToolIllustrations[tool]}"`));
        if (tool === "breathing") {
          assert.match(card, /data-breathing-status="idle"/);
          assert.equal((card.match(/<button/g) ?? []).length, 1);
          assert.ok(card.includes(copy.tools.breathing.start));
          assert.equal(card.includes(copy.tools.status.planned), false);
        } else {
          assert.ok(card.includes(copy.tools.status.planned), `${lng} ${tool}`);
          assert.equal(card.includes("<button"), false, tool);
        }
      }
      assert.ok(markup.indexOf('data-tool="breathing"') < markup.indexOf('data-tool="craving"'));
    }
  }
});

test("SUP-ASSET-01 maps each card to its illustration and keeps PNG masters with WebP derivatives", () => {
  assert.deepEqual(supportToolIllustrations, {
    breathing: "support-breathing",
    mindfulness: "support-mindfulness",
    movement: "support-activity",
    craving: "support-craving",
  });
  assert.deepEqual(supportResourceIllustrations, {
    processes: "support-learning",
    reading: "support-reading",
    audio: "support-audio",
  });
  assert.deepEqual(SUPPORT_ILLUSTRATION_SIZE, { width: 768, height: 512 });

  const names = [
    ...Object.values(supportToolIllustrations),
    ...Object.values(supportResourceIllustrations),
  ];
  assert.equal(new Set(names).size, 7);
  const dir = join(publicDir, "images/support");
  for (const name of names) {
    const png = join(dir, `${name}.png`);
    const webp = join(dir, `${name}.webp`);
    assert.equal(existsSync(png), true, png);
    assert.equal(existsSync(webp), true, webp);
    assert.equal(supportIllustrationSrc(name, "png"), `/images/support/${name}.png`);
    assert.equal(supportIllustrationSrc(name, "webp"), `/images/support/${name}.webp`);
  }
  assert.deepEqual(
    readdirSync(dir).filter((file) => file.endsWith(".png")).sort(),
    names.map((name) => `${name}.png`).sort(),
  );
});

test("resource cards group published articles and mark audio as unavailable", async () => {
  assert.deepEqual(
    SUPPORT_RESOURCE_GROUPS.map((group) => group.id),
    ["processes", "reading", "audio"],
  );
  assert.equal(new Set(SUPPORT_LEARN_SHEETS).size, SUPPORT_LEARN_SHEETS.length);
  for (const base of ["/app", "/preview"] as const) {
    const groups = supportResourceGroups(base);
    assert.equal(groups.find((group) => group.id === "audio")?.links.length, 0);
    assert.ok(groups.filter((group) => group.id !== "audio").every((group) => group.links.length > 0));
    const markup = await render(base, "es");
    for (const group of groups) {
      const card = blockFor(markup, "data-resource-group", group.id);
      assert.ok(card.includes(esSupport.learn.groups[group.id].title), group.id);
      assert.match(card, new RegExp(`data-illustration="${supportResourceIllustrations[group.id]}"`));
      assert.equal((card.match(/href="/g) ?? []).length, group.links.length, group.id);
      for (const link of group.links) assert.ok(card.includes(`href="${link.href}"`), link.id);
    }
    assert.ok(blockFor(markup, "data-resource-group", "audio").includes(esSupport.learn.unavailable));
  }
});

test("three strategy topics are navigable; relapse and the personal plan stay unavailable", async () => {
  assert.deepEqual([...SUPPORT_STRATEGY_TOPICS], ["emotions", "relapse", "stress", "habits"]);
  assert.deepEqual([...SUPPORT_ENABLED_STRATEGY_IDS], [
    "stress.pause",
    "habits.small-routines",
    "emotions.naming",
  ]);
  for (const [lng, copy] of [["es", esSupport], ["en", enSupport]] as const) {
    const markup = await render("/app", lng);
    for (const topic of SUPPORT_STRATEGY_TOPICS) {
      const row = blockFor(markup, "data-strategy", topic);
      assert.ok(row.includes(copy.strategies.topics[topic]), topic);
      const href = supportStrategyHrefForTopic("/app", topic);
      if (topic === "relapse") {
        assert.equal(href, null);
        assert.match(row, /data-strategy-state="planned"/);
        assert.ok(row.includes(copy.strategies.status), topic);
        assert.equal(row.includes("href="), false, topic);
      } else {
        assert.ok(href);
        assert.match(row, /data-strategy-state="available"/);
        assert.ok(row.includes(`href="${href}"`), topic);
        assert.equal(row.includes(copy.strategies.status), false, topic);
      }
    }
    const plan = markup.slice(markup.indexOf('id="support-plan-title"'));
    assert.ok(plan.includes(copy.plan.title));
    assert.ok(plan.includes(copy.plan.privacy));
    assert.match(plan, /data-support-guide/);
    assert.equal((plan.match(/type="checkbox"/g) ?? []).length, 4);
    assert.match(plan, /data-support-guide-reset/);
    assert.ok(plan.includes("href="));
    assert.doesNotMatch(plan, /<textarea|<form|<progress|role="progressbar"|aria-valuenow|type="text"|type="tel"/);
  }
  assert.equal(esSupport.strategies.title, "Estrategias de apoyo");
});

test("learn links stay inside the active base and only open published articles", async () => {
  assert.equal(SUPPORT_LEARN_SHEETS.length, 6);
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
    // Learn sheets + Explore + 3 strategies + guide (breathing, strategies hash, help hash).
    // Terms appears twice (help panel + guide) and is filtered out above.
    assert.equal(
      inApp.length,
      SUPPORT_LEARN_SHEETS.length + 1 + SUPPORT_ENABLED_STRATEGY_IDS.length + 3,
    );
    assert.ok(inApp.every((href) => href.startsWith(`${base}/`)), inApp.join(", "));
    assert.ok(inApp.every((href) => !href.startsWith(`${other}/`)));
    assert.equal(hrefs(markup).includes(SUPPORT_TERMS_EMERGENCY_HREF), true);
    for (const id of SUPPORT_ENABLED_STRATEGY_IDS) {
      assert.ok(inApp.includes(`${base}/support?strategy=${id}`), id);
    }
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
  assert.match(en, /What is GABA\?/);
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
  assert.match(page, /resolveSupportStrategyQueryParam/);
  assert.match(page, /SupportStrategySheet/);
  for (const lng of ["es", "en"] as const) {
    const markup = await render("/app", lng);
    const breathing = blockFor(markup, "data-tool", "breathing");
    // Breathing start + coverage chooser (Spain / Other) + guide reset. No tel: until coverage is chosen.
    assert.equal((markup.match(/<button/g) ?? []).length, 4);
    assert.equal((breathing.match(/<button/g) ?? []).length, 1);
    assert.match(markup, /data-support-guide-reset/);
    assert.match(markup, /data-help-coverage="spain"/);
    assert.match(markup, /data-help-coverage="other"/);
    assert.equal(markup.includes('role="button"'), false);
    assert.equal(markup.includes("tel:"), false);
    assert.equal(markup.includes("href=\"tel:"), false);
  }
  const { start: esStart, ...esRest } = esSupport.tools.breathing;
  const { start: enStart, ...enRest } = enSupport.tools.breathing;
  assert.deepEqual([esStart, enStart], ["Comenzar", "Start"]);
  const copy = [
    ...leafValues({ ...esSupport, tools: { ...esSupport.tools, breathing: esRest } }),
    ...leafValues({ ...enSupport, tools: { ...enSupport.tools, breathing: enRest } }),
  ].join("\n");
  assert.doesNotMatch(copy, /\d{3}/);
  assert.doesNotMatch(copy, /evidencia|evidence|eficaz|efectiv|effective|reduce la ansiedad|reduces? anxiety/i);
  assert.doesNotMatch(copy, /Buscar ayuda ahora|Get help now/i);
  assert.doesNotMatch(copy, /hacerlo solo\b/);
  assert.doesNotMatch(copy, /Iniciar|Comenzar|Configurar mi plan|Ver todos|\bStart\b|Set up my plan|View all/);
  assert.doesNotMatch(copy, /que funcionan|that work/i);
  for (const source of [page, sections]) {
    assert.equal(source.includes("lungs"), false);
    assert.equal(source.includes("anatomy/"), false);
  }
  assert.equal(sections.includes("/images/"), false);
  assert.equal(sections.includes("<img"), false);
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
