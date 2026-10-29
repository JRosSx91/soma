import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement, type FormEvent, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { createInstance } from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { test } from "node:test";
import enAccount from "../../../i18n/locales/en/account.json" with { type: "json" };
import esAccount from "../../../i18n/locales/es/account.json" with { type: "json" };
import { AuthContext } from "../../auth/context/AuthContext.js";
import {
  DeleteAccountDialog,
  DeleteAccountSection,
} from "./DeleteAccountSection.js";

async function makeI18n(lng: "en" | "es") {
  const i18n = createInstance();
  await i18n.use(initReactI18next).init({
    lng,
    fallbackLng: "en",
    resources: {
      en: { account: enAccount },
      es: { account: esAccount },
    },
    defaultNS: "account",
    interpolation: { escapeValue: false },
  });
  return i18n;
}

const authValue = {
  user: {
    id: "u1",
    email: "a@example.com",
    displayName: "Ada",
    biologicalSex: "female" as const,
    birthYear: 1990,
    weightKg: null,
  },
  loading: false,
  status: "authenticated" as const,
  error: null,
  sessionNotice: null,
  hasAccessToken: true,
  login: async () => undefined,
  register: async () => undefined,
  logout: async () => ({ remoteRevoked: true }),
  applyProfileUser: () => undefined,
  clearSessionAfterAccountDeletion: () => undefined,
};

function wrap(node: ReactNode, i18n: Awaited<ReturnType<typeof makeI18n>>) {
  return createElement(
    I18nextProvider,
    { i18n },
    createElement(
      AuthContext.Provider,
      { value: authValue },
      createElement(MemoryRouter, { initialEntries: ["/app/account"] }, node),
    ),
  );
}

test("after 204 the section clears session and does not navigate while user may still be set", () => {
  const src = readFileSync(
    new URL("./DeleteAccountSection.tsx", import.meta.url),
    "utf8",
  );
  assert.match(src, /clearSessionAfterAccountDeletion\(\)/);
  assert.equal(/\bnavigate\(/.test(src), false);
});

test("section explains deletion and does not show an immediate delete submit", async () => {
  const i18n = await makeI18n("en");
  const html = renderToStaticMarkup(
    wrap(createElement(DeleteAccountSection), i18n),
  );
  assert.match(html, /Delete my account/);
  assert.match(html, /Registered substances/);
  assert.match(html, /new invitation/);
  assert.match(html, /Review account deletion/);
  assert.equal(html.includes('role="dialog"'), false);
  assert.equal(html.includes("Permanently delete my account"), false);
});

test("open dialog requires checkbox and password before the final button enables", async () => {
  const i18n = await makeI18n("en");
  const closedConfirm = renderToStaticMarkup(
    wrap(
      createElement(DeleteAccountDialog, {
        acknowledged: false,
        password: "",
        errorKind: null,
        submitting: false,
        canSubmit: false,
        onAcknowledgeChange: () => undefined,
        onPasswordChange: () => undefined,
        onClose: () => undefined,
        onSubmit: (event: FormEvent) => event.preventDefault(),
      }),
      i18n,
    ),
  );
  assert.match(closedConfirm, /role="dialog"/);
  assert.match(closedConfirm, /type="checkbox"/);
  assert.match(closedConfirm, /type="password"/);
  assert.match(closedConfirm, /disabled/);
  assert.match(closedConfirm, /Permanently delete my account/);

  const ready = renderToStaticMarkup(
    wrap(
      createElement(DeleteAccountDialog, {
        acknowledged: true,
        password: "secret12",
        errorKind: null,
        submitting: false,
        canSubmit: true,
        onAcknowledgeChange: () => undefined,
        onPasswordChange: () => undefined,
        onClose: () => undefined,
        onSubmit: (event: FormEvent) => event.preventDefault(),
      }),
      i18n,
    ),
  );
  assert.match(ready, /Permanently delete my account/);
  assert.equal(
    /<button type="submit" disabled/.test(closedConfirm),
    true,
  );
  assert.equal(/<button type="submit" disabled/.test(ready), false);
});

test("cancel control is present and dialog copy is translated in ES", async () => {
  const i18n = await makeI18n("es");
  const html = renderToStaticMarkup(
    wrap(
      createElement(DeleteAccountDialog, {
        acknowledged: false,
        password: "",
        errorKind: null,
        submitting: false,
        canSubmit: false,
        onAcknowledgeChange: () => undefined,
        onPasswordChange: () => undefined,
        onClose: () => undefined,
        onSubmit: (event: FormEvent) => event.preventDefault(),
      }),
      i18n,
    ),
  );
  assert.match(html, /Eliminar definitivamente mi cuenta/);
  assert.match(html, /Cancelar/);
});
