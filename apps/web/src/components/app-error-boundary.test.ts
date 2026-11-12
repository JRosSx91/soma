import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import i18next from "i18next";
import { createElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import enCommon from "../i18n/locales/en/common.json" with { type: "json" };
import esCommon from "../i18n/locales/es/common.json" with { type: "json" };
import { AppErrorBoundary, AppErrorFallback } from "./AppErrorBoundary.js";
import { resolveAppErrorCopy } from "./app-error-copy.js";

const INTERNAL_MESSAGE = "token=eyJ secret journal note at /me/journal/42";

function Thrower(): ReactNode {
  throw new Error(INTERNAL_MESSAGE);
}

function renderFallbackState(onReload?: () => void): string {
  const boundary = new AppErrorBoundary({ children: createElement(Thrower), onReload });
  boundary.state = AppErrorBoundary.getDerivedStateFromError();
  return renderToStaticMarkup(boundary.render() as ReactElement);
}

function findButton(node: ReactNode): ReactElement<{ onClick?: () => void }> | null {
  if (!isValidElement(node)) return null;
  if (node.type === "button") return node as ReactElement<{ onClick?: () => void }>;
  const children = (node.props as { children?: ReactNode }).children;
  for (const child of Array.isArray(children) ? children : [children]) {
    const found = findButton(child);
    if (found) return found;
  }
  return null;
}

test("renders its children untouched when nothing throws", () => {
  const html = renderToStaticMarkup(
    createElement(AppErrorBoundary, null, createElement("p", null, "contenido")),
  );
  assert.equal(html, "<p>contenido</p>");
});

test("a render error switches to the fallback instead of the failing tree", () => {
  assert.deepEqual(AppErrorBoundary.getDerivedStateFromError(), { hasError: true });
  const html = renderFallbackState();
  assert.match(html, /<h1[^>]*>/);
  assert.match(html, /<button type="button"/);
  assert.match(html, /aria-label="soma"/);
  assert.match(html, /bg-\[#081018\]/);
});

test("the fallback never exposes the internal error or unresolved keys", () => {
  const html = renderFallbackState();
  for (const leak of ["token", "secret", "journal", "/me/", "Error", "stack", "errorBoundary."]) {
    assert.equal(html.includes(leak), false, leak);
  }
});

test("before i18n is ready the copy still resolves from the browser language", () => {
  assert.equal(i18next.language, undefined);
  assert.deepEqual(resolveAppErrorCopy({ navigatorLanguage: "es-ES" }), esCommon.errorBoundary);
  assert.deepEqual(resolveAppErrorCopy({ documentLanguage: "ca" }), esCommon.errorBoundary);
  assert.deepEqual(resolveAppErrorCopy({ navigatorLanguage: "de-DE" }), enCommon.errorBoundary);
  assert.deepEqual(resolveAppErrorCopy({}), enCommon.errorBoundary);
});

test("the fallback follows the active i18n language in spanish and english", async () => {
  await i18next.init({ lng: "es", resources: {} });

  const es = renderFallbackState();
  assert.ok(es.includes("Algo ha salido mal"));
  assert.ok(
    es.includes("Se ha producido un error inesperado. Puedes recargar la página para intentarlo de nuevo."),
  );
  assert.ok(es.includes("Recargar página"));

  await i18next.changeLanguage("en");
  const en = renderFallbackState();
  assert.ok(en.includes("Something went wrong"));
  assert.ok(en.includes("An unexpected error occurred. You can reload the page to try again."));
  assert.ok(en.includes("Reload page"));
});

test("the reload button calls the injected handler once", () => {
  let calls = 0;
  const button = findButton(AppErrorFallback({ onReload: () => { calls += 1; } }));
  assert.ok(button);
  button.props.onClick?.();
  assert.equal(calls, 1);
});

test("the default reload action reloads the current page", () => {
  const previous = (globalThis as { window?: unknown }).window;
  let reloads = 0;
  (globalThis as { window?: unknown }).window = { location: { reload: () => { reloads += 1; } } };
  try {
    const button = findButton(AppErrorFallback({}));
    button?.props.onClick?.();
    assert.equal(reloads, 1);
  } finally {
    (globalThis as { window?: unknown }).window = previous;
  }
});

test("the boundary wraps every provider at the SPA root", () => {
  const main = readFileSync(new URL("../main.tsx", import.meta.url), "utf8");
  assert.match(
    main,
    /<StrictMode>\s*<AppErrorBoundary>\s*<AuthProvider>\s*<AchievementSyncProvider>\s*<App \/>\s*<\/AchievementSyncProvider>\s*<\/AuthProvider>\s*<\/AppErrorBoundary>\s*<\/StrictMode>/,
  );
});
