import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { test } from "node:test";
import enAuth from "../../../i18n/locales/en/auth.json" with { type: "json" };
import esAuth from "../../../i18n/locales/es/auth.json" with { type: "json" };
import { AuthPasswordField } from "./AuthPasswordField.js";

async function ensureI18n() {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      lng: "en",
      fallbackLng: "en",
      resources: { en: { auth: enAuth } },
      interpolation: { escapeValue: false },
    });
  }
}

test("password fields start hidden and reveal as text without changing the value", () => {
  const source = readFileSync(
    new URL("./AuthPasswordField.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /const \[revealed, setRevealed\] = useState\(false\)/);
  assert.match(source, /revealed \? "text" : "password"/);
  assert.match(source, /type="button"/);
});

test("AuthPasswordField renders a hidden value and a non-submit toggle", async () => {
  await ensureI18n();
  const html = renderToStaticMarkup(
    createElement(
      I18nextProvider,
      { i18n },
      createElement(AuthPasswordField, {
        value: "secret-pass",
        onChange: () => undefined,
        autoComplete: "current-password",
        required: true,
      }),
    ),
  );
  assert.match(html, /type="password"/);
  assert.match(html, /value="secret-pass"/);
  assert.match(html, /type="button"/);
  assert.match(html, /aria-label="Show password"/);
  assert.match(html, /aria-pressed="false"/);
  assert.match(html, /autoComplete="current-password"/);
  assert.equal(html.includes('type="submit"'), false);
});

test("public auth forms reuse AuthPasswordField except forgot-password", () => {
  const login = readFileSync(
    new URL("../../../pages/LoginPage.tsx", import.meta.url),
    "utf8",
  );
  const register = readFileSync(
    new URL("../../../pages/RegisterPage.tsx", import.meta.url),
    "utf8",
  );
  const reset = readFileSync(
    new URL("../../../pages/ResetPasswordPage.tsx", import.meta.url),
    "utf8",
  );
  const forgot = readFileSync(
    new URL("../../../pages/ForgotPasswordPage.tsx", import.meta.url),
    "utf8",
  );

  assert.equal((login.match(/<AuthPasswordField/g) ?? []).length, 1);
  assert.equal((register.match(/<AuthPasswordField/g) ?? []).length, 2);
  assert.equal((reset.match(/<AuthPasswordField/g) ?? []).length, 2);
  assert.equal(forgot.includes("AuthPasswordField"), false);
  assert.equal(forgot.includes('type="password"'), false);
});

test("password visibility copy exists in Spanish and English", () => {
  assert.equal(enAuth.passwordVisibility.show, "Show password");
  assert.equal(enAuth.passwordVisibility.hide, "Hide password");
  assert.equal(esAuth.passwordVisibility.show, "Mostrar contraseña");
  assert.equal(esAuth.passwordVisibility.hide, "Ocultar contraseña");
});
