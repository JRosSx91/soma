import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { test } from "node:test";
import { TrophyToast } from "./TrophyToast.js";
import type { AchievementWithUnlockState } from "../types.js";

async function ensureI18n() {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      lng: "es",
      fallbackLng: "es",
      resources: {
        es: {
          achievements: {
            "cannabis-hippocampus-gold.title": "Memoria de oro",
            "cannabis-hippocampus-gold.description": "Copy de prueba.",
          },
          main: { trophies: { toastEyebrow: "NUEVO LOGRO", toastDismiss: "Descartar" } },
          substances: { cannabis: { name: "Cannabis" } },
        },
      },
      interpolation: { escapeValue: false },
    });
  }
}

test("TrophyToast uses Soma 2.0 medal art instead of the legacy trophy SVG", async () => {
  await ensureI18n();
  const achievement: AchievementWithUnlockState = {
    id: "cannabis-hippocampus-gold",
    tier: "gold",
    titleKey: "cannabis-hippocampus-gold.title",
    descriptionKey: "cannabis-hippocampus-gold.description",
    triggerOrganId: "brain-hippocampus",
    triggerSubstanceId: "cannabis",
    triggerRecoveryThreshold: 0.75,
    hidden: false,
    unlocked: true,
    unlockedAt: "2026-01-01T00:00:00.000Z",
    notifiedAt: null,
  };
  const html = renderToStaticMarkup(
    createElement(
      I18nextProvider,
      { i18n },
      createElement(TrophyToast, { achievement, onDismiss: () => undefined }),
    ),
  );
  assert.match(html, /cannabis-gold\.png/);
  assert.match(html, /Cannabis/);
  assert.match(html, />Oro</);
  assert.match(html, /NUEVO LOGRO/);
  assert.equal(html.includes("viewBox=\"0 0 64 64\""), false);
  assert.equal(html.includes("soma-bg-elevated"), false);
});
