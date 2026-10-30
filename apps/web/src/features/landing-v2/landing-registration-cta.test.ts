import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { test } from "node:test";
import enLanding from "../../i18n/locales/en/landing-v2.json" with { type: "json" };
import { RegistrationModeProvider } from "../auth/context/RegistrationModeContext.js";
import type { RegistrationModeState } from "../auth/client/registration-mode.js";
import { LandingRegistrationActions } from "./LandingRegistrationActions.js";

async function html(mode: RegistrationModeState) {
  const instance = i18n.createInstance();
  await instance.use(initReactI18next).init({
    lng: "en",
    resources: { en: { "landing-v2": enLanding } },
    interpolation: { escapeValue: false },
  });
  return renderToStaticMarkup(
    createElement(
      I18nextProvider,
      { i18n: instance },
      createElement(
        MemoryRouter,
        { initialEntries: ["/"] },
        createElement(
          RegistrationModeProvider,
          { value: mode },
          createElement(LandingRegistrationActions, {
            copyPrefix: "hero",
            layoutClassName: "cta",
          }),
        ),
      ),
    ),
  );
}

test("invite CTAs do not send visitors without an invite to /register", async () => {
  const markup = await html({ status: "ready", mode: "invite" });
  assert.match(markup, /href="\/login"/);
  assert.match(markup, /closed beta/i);
  assert.equal(markup.includes('href="/register"'), false);
  assert.equal(markup.includes("Create an account"), false);
});

test("open CTAs keep create-account copy", async () => {
  const markup = await html({ status: "ready", mode: "open" });
  assert.match(markup, /href="\/register"/);
  assert.match(markup, /Create an account/);
});

test("mode fetch failure does not promise registration", async () => {
  const markup = await html({ status: "error", mode: null });
  assert.match(markup, /temporarily unavailable/i);
  assert.equal(markup.includes('href="/register"'), false);
  assert.equal(markup.includes("Create an account"), false);
});

test("hero and closing no longer hard-code /register", () => {
  const hero = readFileSync(new URL("./LandingV2Hero.tsx", import.meta.url), "utf8");
  const closing = readFileSync(
    new URL("./LandingV2Closing.tsx", import.meta.url),
    "utf8",
  );
  assert.match(hero, /LandingRegistrationActions/);
  assert.match(closing, /LandingRegistrationActions/);
  assert.equal(hero.includes('to="/register"'), false);
  assert.equal(closing.includes('to="/register"'), false);
});
