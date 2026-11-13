import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import enLanding from "../../i18n/locales/en/landing-v2.json" with { type: "json" };
import esLanding from "../../i18n/locales/es/landing-v2.json" with { type: "json" };
import {
  DEFAULT_DOCUMENT_DESCRIPTION,
  DEFAULT_DOCUMENT_TITLE,
  isIndexablePublicPath,
  robotsContentForPath,
} from "../../seo/public-site.js";
import {
  LANDING_FAQ_ID,
  LANDING_FAQ_ITEM_IDS,
} from "./LandingV2Faq.js";
import { LANDING_FEATURE_ITEMS } from "./landing-features.js";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");

test("landing page mounts FAQ between achievements and closing", () => {
  const page = readFileSync(
    new URL("./LandingV2Page.tsx", import.meta.url),
    "utf8",
  );
  const faqSource = readFileSync(
    new URL("./LandingV2Faq.tsx", import.meta.url),
    "utf8",
  );
  const achievements = page.indexOf("<LandingV2Achievements");
  const faq = page.indexOf("<LandingV2Faq");
  const closing = page.indexOf("<LandingV2Closing");
  assert.ok(achievements > 0 && faq > achievements && closing > faq);
  assert.match(faqSource, /id=\{LANDING_FAQ_ID\}/);
  assert.match(faqSource, /aria-labelledby="landing-v2-faq-title"/);
  assert.match(faqSource, /id="landing-v2-faq-title"/);
  assert.match(faqSource, /<h2\b/);
  assert.match(faqSource, /<h3\b/);
  assert.doesNotMatch(faqSource, /<details\b|<summary\b|accordion/i);
  assert.equal(LANDING_FAQ_ITEM_IDS.length, 5);
  assert.equal(LANDING_FAQ_ID, "landing-v2-faq");
});

test("FAQ copy keys expose five questions in ES and EN", () => {
  for (const lng of ["es", "en"] as const) {
    const bundle = lng === "es" ? esLanding : enLanding;
    assert.equal(Object.keys(bundle.faq.items).length, 5);
    for (const id of LANDING_FAQ_ITEM_IDS) {
      assert.ok(bundle.faq.items[id].question.length > 8);
      assert.ok(bundle.faq.items[id].answer.length > 40);
    }
  }
  assert.equal(esLanding.faq.title, "Preguntas frecuentes");
  assert.equal(enLanding.faq.title, "Frequently asked questions");
});

test("FAQ copy keeps educational limits and verified demo surfaces", () => {
  const esBlob = JSON.stringify(esLanding.faq);
  const enBlob = JSON.stringify(enLanding.faq);
  assert.match(esBlob, /18 años/);
  assert.match(enBlob, /18\+/);
  assert.match(esBlob, /no es un dispositivo médico/i);
  assert.match(enBlob, /not a medical device/i);
  assert.match(esBlob, /No diagnostica/);
  assert.match(enBlob, /does not diagnose/i);
  assert.match(esBlob, /modelos educativos del catálogo/);
  assert.match(enBlob, /educational catalog models/);
  assert.match(esBlob, /invitación/);
  assert.match(enBlob, /invitation/);
  assert.match(esBlob, /sin publicidad/);
  assert.match(enBlob, /without payment, advertising or subscription/);
  assert.doesNotMatch(esBlob, /cura garantizada|porcentaje de salud|dispositivo clínico/i);
  assert.doesNotMatch(enBlob, /guaranteed cure|percent recovered|clinically validated/i);
  assert.doesNotMatch(esBlob, /Centro de Apoyo|respiración guiada|pending_clinical/i);
  assert.doesNotMatch(enBlob, /Support centre|guided breathing|pending_clinical/i);

  const demoEs = esLanding.faq.items.demo.answer;
  const demoEn = enLanding.faq.items.demo.answer;
  for (const token of [
    "recuperación",
    "explorador",
    "atlas",
    "misiones",
    "logros",
    "expedición",
    "bitácora",
  ]) {
    assert.match(demoEs, new RegExp(token, "i"), token);
  }
  for (const token of [
    "recovery",
    "explorer",
    "atlas",
    "missions",
    "achievements",
    "expedition",
    "journal",
  ]) {
    assert.match(demoEn, new RegExp(token, "i"), token);
  }
  assert.equal(LANDING_FEATURE_ITEMS.length, 8);
  assert.ok(LANDING_FEATURE_ITEMS.every((item) => item.to.startsWith("/preview/")));
});

test("meta description mentions demo without account across sources", () => {
  assert.equal(enLanding.metaTitle, DEFAULT_DOCUMENT_TITLE);
  assert.equal(enLanding.metaDescription, DEFAULT_DOCUMENT_DESCRIPTION);
  assert.match(DEFAULT_DOCUMENT_DESCRIPTION, /demo without an account/i);
  assert.match(esLanding.metaDescription, /demo sin cuenta/i);
  assert.ok(DEFAULT_DOCUMENT_DESCRIPTION.length <= 160);
  assert.equal(esLanding.metaTitle.includes("educativ"), true);

  const html = readFileSync(join(webRoot, "index.html"), "utf8");
  assert.match(html, new RegExp(DEFAULT_DOCUMENT_DESCRIPTION.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(html, /property="og:description"/);
  assert.match(html, /name="twitter:description"/);
  assert.equal(html.includes("FAQPage"), false);
  assert.equal(html.includes("hreflang"), false);
});

test("FAQ does not weaken private-route SEO contracts", () => {
  assert.equal(isIndexablePublicPath("/"), true);
  assert.equal(robotsContentForPath("/"), "index,follow");
  assert.equal(isIndexablePublicPath("/preview"), false);
  assert.equal(robotsContentForPath("/app"), "noindex,nofollow");
  const robots = readFileSync(join(webRoot, "public/robots.txt"), "utf8");
  const sitemap = readFileSync(join(webRoot, "public/sitemap.xml"), "utf8");
  assert.match(robots, /^Allow: \/$/m);
  assert.equal(/^Disallow:/m.test(robots), false);
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.equal(locs[0], "https://somarecovery.app/");
  assert.equal(locs.includes("https://somarecovery.app/preview"), false);
  assert.equal(locs.includes("https://somarecovery.app/app"), false);
  const faqSource = readFileSync(new URL("./LandingV2Faq.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(faqSource, /FAQPage|gtag|analytics|plausible|posthog/i);
  assert.match(faqSource, /faq\.items\.curves\.learnMore/);
  assert.match(faqSource, /\/es\/learn\/modelos-de-recuperacion\/|\/en\/learn\/recovery-models\//);
});
