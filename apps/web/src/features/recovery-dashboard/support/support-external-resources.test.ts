import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import enSupport from "../../../i18n/locales/en/support.json" with { type: "json" };
import esSupport from "../../../i18n/locales/es/support.json" with { type: "json" };
import { ShellBaseProvider } from "../context/ShellBaseContext.js";
import type { ShellBase } from "../shell-base.js";
import { SupportHelpResources } from "./SupportHelpResources.js";
import { SupportSections } from "./SupportSections.js";
import { supportExternalContent } from "./support-external-content.js";
import {
  SUPPORT_EXTERNAL_RESOURCE_IDS,
  SUPPORT_EXTERNAL_RESOURCES,
  SUPPORT_PUBLISHED_EXTERNAL_RESOURCE_IDS,
  emergencyResourcesForCoverage,
  isPublishedExternalResourceId,
  professionalResourcesForCoverage,
  publishedExternalResourcesForCoverage,
  type SupportHelpCoverage,
} from "./support-external-resources.js";

async function withSupportI18n(lng: "es" | "en", tree: ReactElement) {
  const instance = i18n.createInstance();
  await instance.use(initReactI18next).init({
    lng,
    resources: { es: { support: esSupport }, en: { support: enSupport } },
    interpolation: { escapeValue: false },
  });
  return renderToStaticMarkup(createElement(I18nextProvider, { i18n: instance }, tree));
}

async function renderHub(base: ShellBase, lng: "es" | "en") {
  return withSupportI18n(
    lng,
    createElement(
      MemoryRouter,
      { initialEntries: [`${base}/support`] },
      createElement(ShellBaseProvider, { base }, createElement(SupportSections)),
    ),
  );
}

async function renderHelp(coverage: SupportHelpCoverage, lng: "es" | "en") {
  return withSupportI18n(lng, createElement(SupportHelpResources, { initialCoverage: coverage }));
}

test("only the four approved external resources are published", () => {
  assert.deepEqual([...SUPPORT_EXTERNAL_RESOURCE_IDS], [...SUPPORT_PUBLISHED_EXTERNAL_RESOURCE_IDS]);
  assert.deepEqual([...SUPPORT_PUBLISHED_EXTERNAL_RESOURCE_IDS], [
    "ext.es.112",
    "ext.es.024",
    "ext.es.pnsd.ayuda-cerca",
    "ext.int.iasp.find-a-helpline",
  ]);
  assert.equal(isPublishedExternalResourceId("ext.es.fad.siof"), false);
  assert.equal(isPublishedExternalResourceId("ext.es.112"), true);
});

test("catalog metadata keeps HTTPS URLs, verified dates, and authorized phones only", () => {
  for (const id of SUPPORT_PUBLISHED_EXTERNAL_RESOURCE_IDS) {
    const meta = SUPPORT_EXTERNAL_RESOURCES[id];
    assert.match(meta.href, /^https:\/\//);
    assert.match(meta.lastVerified, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(meta.verificationSource.trim());
    for (const lng of ["es", "en"] as const) {
      const copy = supportExternalContent[id][lng];
      assert.ok(copy.name.trim());
      assert.ok(copy.body.trim());
      assert.ok(copy.webAction.trim());
    }
  }
  assert.equal(SUPPORT_EXTERNAL_RESOURCES["ext.es.112"].phone, "112");
  assert.equal(SUPPORT_EXTERNAL_RESOURCES["ext.es.024"].phone, "024");
  assert.equal(SUPPORT_EXTERNAL_RESOURCES["ext.es.pnsd.ayuda-cerca"].phone, undefined);
  assert.equal(SUPPORT_EXTERNAL_RESOURCES["ext.int.iasp.find-a-helpline"].phone, undefined);
  assert.ok(supportExternalContent["ext.es.024"].es.schedule);
});

test("Spain coverage lists Spanish phones; other coverage does not", () => {
  const spain = publishedExternalResourcesForCoverage("spain");
  const other = publishedExternalResourcesForCoverage("other");
  assert.deepEqual(
    spain.map((item) => item.id),
    [
      "ext.es.112",
      "ext.es.024",
      "ext.es.pnsd.ayuda-cerca",
      "ext.int.iasp.find-a-helpline",
    ],
  );
  assert.deepEqual(
    other.map((item) => item.id),
    ["ext.int.iasp.find-a-helpline"],
  );
  assert.ok(spain.some((item) => item.phone === "112"));
  assert.ok(spain.some((item) => item.phone === "024"));
  assert.equal(
    other.some((item) => item.phone === "112" || item.phone === "024"),
    false,
  );
  assert.equal(emergencyResourcesForCoverage("spain").length, 1);
  assert.equal(emergencyResourcesForCoverage("other").length, 0);
  assert.ok(professionalResourcesForCoverage("spain").length >= 3);
  assert.equal(professionalResourcesForCoverage("other").length, 1);
});

test("help panel mounts coverage controls without persisting or tracking", async () => {
  for (const base of ["/app", "/preview"] as const) {
    for (const lng of ["es", "en"] as const) {
      const markup = await renderHub(base, lng);
      assert.match(markup, /data-help-resources/);
      assert.match(markup, /data-help-coverage="spain"/);
      assert.match(markup, /data-help-coverage="other"/);
      assert.match(markup, /data-help-coverage-empty/);
      assert.doesNotMatch(markup, /data-help-resource=/);
      assert.doesNotMatch(markup, /data-help-tel=/);
      assert.equal(markup.includes("localStorage"), false);
      assert.equal(markup.includes("sessionStorage"), false);
      assert.doesNotMatch(markup, /fad\.siof|900 161 515|geolocation|navigator\.language/i);
    }
  }

  const helpSource = readFileSync(new URL("./SupportHelpResources.tsx", import.meta.url), "utf8");
  assert.match(helpSource, /useState<SupportHelpCoverage \| null>\(initialCoverage\)/);
  assert.match(helpSource, /initialCoverage = null/);
  assert.doesNotMatch(helpSource, /localStorage|sessionStorage|cookie|fetch\(/i);
  assert.match(helpSource, /rel: "noopener noreferrer"/);
});

test("authorized resource hrefs and tel values are encoded in the catalog source", () => {
  const catalog = readFileSync(new URL("./support-external-resources.ts", import.meta.url), "utf8");
  assert.match(
    catalog,
    /https:\/\/administracion\.gob\.es\/tu-espacio-europeo\/derechos-obligaciones\/ciudadanos\/asistencia-sanitaria\/numeros-urgencia/,
  );
  assert.doesNotMatch(catalog, /https?:\/\/(?:www\.)?112\.es/);
  assert.equal(SUPPORT_EXTERNAL_RESOURCES["ext.es.112"].href.includes("112.es"), false);
  assert.match(catalog, /https:\/\/www\.sanidad\.gob\.es\/linea024\/home\.htm/);
  assert.match(
    catalog,
    /https:\/\/pnsd\.sanidad\.gob\.es\/ciudadanos\/ayudaCerca\/home\.htm/,
  );
  assert.match(catalog, /https:\/\/findahelpline\.com\/i\/iasp/);
  assert.doesNotMatch(catalog, /900161515|900 161 515/);
});

test("Spain view exposes authorized tel and HTTPS links; other view keeps Spanish phones out", async () => {
  const spain = await renderHelp("spain", "es");
  assert.match(spain, /data-help-resource="ext.es.112"/);
  assert.match(spain, /data-help-resource="ext.es.024"/);
  assert.match(spain, /data-help-resource="ext.es.pnsd.ayuda-cerca"/);
  assert.match(spain, /data-help-resource="ext.int.iasp.find-a-helpline"/);
  assert.match(spain, /data-help-tel="112"/);
  assert.match(spain, /data-help-tel="024"/);
  assert.match(spain, /href="tel:112"/);
  assert.match(spain, /href="tel:024"/);
  assert.match(
    spain,
    /https:\/\/administracion\.gob\.es\/tu-espacio-europeo\/derechos-obligaciones\/ciudadanos\/asistencia-sanitaria\/numeros-urgencia/,
  );
  assert.doesNotMatch(spain, /112\.es/);
  assert.match(spain, /https:\/\/www\.sanidad\.gob\.es\/linea024\/home\.htm/);
  assert.match(spain, /noopener noreferrer/);
  assert.match(spain, /Comprobado: 2026-11-12/);
  assert.doesNotMatch(spain, /tiempo real|real-time|disponible ahora|available now/i);

  const other = await renderHelp("other", "en");
  assert.match(other, /data-help-resource="ext.int.iasp.find-a-helpline"/);
  assert.match(other, /data-help-local-emergency/);
  assert.doesNotMatch(other, /data-help-resource="ext.es.112"/);
  assert.doesNotMatch(other, /data-help-resource="ext.es.024"/);
  assert.doesNotMatch(other, /data-help-resource="ext.es.pnsd/);
  assert.doesNotMatch(other, /data-help-tel="112"|data-help-tel="024"|href="tel:112"|href="tel:024"/);
  assert.match(other, /https:\/\/findahelpline\.com\/i\/iasp/);
});
