import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  PUBLIC_LEARN_PAGE_PATHS,
  PUBLIC_SITE_ORIGIN,
  PUBLIC_SITEMAP_LOCS,
} from "./public-site.js";
import enLanding from "../i18n/locales/en/landing-v2.json" with { type: "json" };
import esLanding from "../i18n/locales/es/landing-v2.json" with { type: "json" };

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

const LEARN_FILES = [
  {
    rel: "public/es/learn/neuroadaptacion/index.html",
    path: "/es/learn/neuroadaptacion/",
    lang: "es",
    h1: "Neuroadaptación: qué cambia en el sistema nervioso (visión educativa)",
    title: "Neuroadaptación: visión educativa | Soma",
    alt: "/en/learn/neuroadaptation/",
    sibling: "/es/learn/modelos-de-recuperacion/",
    marker: "neuroadaptación",
  },
  {
    rel: "public/en/learn/neuroadaptation/index.html",
    path: "/en/learn/neuroadaptation/",
    lang: "en",
    h1: "Neuroadaptation: what changes in the nervous system (an educational view)",
    title: "Neuroadaptation: an educational view | Soma",
    alt: "/es/learn/neuroadaptacion/",
    sibling: "/en/learn/recovery-models/",
    marker: "neuroadaptation",
  },
  {
    rel: "public/es/learn/modelos-de-recuperacion/index.html",
    path: "/es/learn/modelos-de-recuperacion/",
    lang: "es",
    h1: "Curvas de recuperación fisiológica: modelos educativos, no diagnósticos",
    title: "Curvas de recuperación: modelos educativos | Soma",
    alt: "/en/learn/recovery-models/",
    sibling: "/es/learn/neuroadaptacion/",
    marker: "trayectoria educativa parametrizada",
  },
  {
    rel: "public/en/learn/recovery-models/index.html",
    path: "/en/learn/recovery-models/",
    lang: "en",
    h1: "Physiological recovery curves: educational models, not diagnoses",
    title: "Recovery curves: educational models | Soma",
    alt: "/es/learn/modelos-de-recuperacion/",
    sibling: "/en/learn/neuroadaptation/",
    marker: "educational trajectory parameterized",
  },
] as const;

test("four static learn HTML documents exist with distinct content", () => {
  assert.equal(LEARN_FILES.length, 4);
  assert.deepEqual(
    LEARN_FILES.map((f) => f.path),
    [...PUBLIC_LEARN_PAGE_PATHS],
  );

  const bodies: string[] = [];
  for (const page of LEARN_FILES) {
    const file = join(webRoot, page.rel);
    assert.equal(existsSync(file), true, page.rel);
    const html = readFileSync(file, "utf8");
    bodies.push(html);

    assert.match(html, /^<!doctype html>/i);
    assert.match(html, new RegExp(`<html lang="${page.lang}"`));
    assert.match(html, /charset="UTF-8"/i);
    assert.match(html, /name="viewport"/);
    assert.match(html, new RegExp(`<title>${escapeReg(page.title)}</title>`));
    assert.match(html, /name="robots"\s+content="index,follow"/);
    assert.match(
      html,
      new RegExp(
        `rel="canonical"\\s+href="${escapeReg(`${PUBLIC_SITE_ORIGIN}${page.path}`)}"`,
      ),
    );
    assert.match(html, new RegExp(`hreflang="${page.lang}"`));
    assert.match(
      html,
      new RegExp(`href="${escapeReg(`${PUBLIC_SITE_ORIGIN}${page.alt}`)}"`),
    );
    assert.match(html, new RegExp(`<h1>${escapeReg(page.h1)}</h1>`));
    assert.match(html, /<main[^>]*>/);
    assert.match(html, /href="\/learn\/learn\.css"/);
    assert.equal(html.includes('src="/src/main.tsx"'), false);
    assert.equal(html.includes("id=\"root\""), false);
    assert.equal(html.includes("noindex,nofollow"), false);
    assert.equal(
      html.includes('if (path === "/" || path === "") return;'),
      false,
    );
    assert.match(html, new RegExp(escapeReg(page.marker), "i"));
    assert.match(html, new RegExp(`href="${escapeReg(page.sibling)}"`));
    assert.match(html, /href="\/preview"/);
    assert.match(html, /href="\/"/);
    assert.equal(html.includes("FAQPage"), false);
    assert.equal(html.includes("x-default"), false);
    assert.equal(html.includes("curveProgress"), false);
    assert.equal(html.includes("pending_clinical_review"), false);
  }

  assert.notEqual(bodies[0], bodies[1]);
  assert.notEqual(bodies[0], bodies[2]);
  assert.notEqual(bodies[1], bodies[3]);
});

test("neuroadaptation pages keep the four verified references", () => {
  for (const rel of [
    "public/es/learn/neuroadaptacion/index.html",
    "public/en/learn/neuroadaptation/index.html",
  ]) {
    const html = readFileSync(join(webRoot, rel), "utf8");
    assert.match(html, /10\.1038\/35053570/);
    assert.match(html, /10\.1038\/nrn2234/);
    assert.match(html, /10\.1016\/S2215-0366\(16\)00104-8/);
    assert.match(html, /10\.1016\/j\.neuron\.2011\.01\.017/);
    assert.match(html, /Nestler/);
    assert.match(html, /Kauer/);
    assert.match(html, /Koob/);
    assert.match(html, /Lüscher|Luscher|Lüscher C/);
  }
});

test("science.limits no longer claims validated clinical averages", () => {
  assert.match(esLanding.science.limits, /trayectorias educativas parametrizadas/i);
  assert.match(enLanding.science.limits, /educational trajectories parameterized/i);
  assert.equal(esLanding.science.limits.includes("promedios en condiciones estándar"), false);
  assert.equal(enLanding.science.limits.includes("averages under standard conditions"), false);
  assert.match(esLanding.science.limits, /no son promedios clínicos validados/i);
  assert.match(enLanding.science.limits, /not validated clinical averages/i);
});

test("landing exposes learn links in i18n", () => {
  assert.ok(esLanding.science.readModels);
  assert.ok(enLanding.science.readModels);
  assert.ok(esLanding.faq.items.curves.learnMore);
  assert.ok(enLanding.faq.items.curves.learnMore);
  assert.ok(esLanding.closing.learnNeuroadaptation);
  assert.ok(enLanding.closing.learnRecoveryModels);
});

test("sitemap locs match public learn contract", () => {
  assert.equal(PUBLIC_SITEMAP_LOCS.length, 5);
  assert.equal(PUBLIC_SITEMAP_LOCS[0], `${PUBLIC_SITE_ORIGIN}/`);
});

function escapeReg(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
