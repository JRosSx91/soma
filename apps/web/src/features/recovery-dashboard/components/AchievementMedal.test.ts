import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test } from "node:test";
import { AchievementMedal } from "./AchievementMedal.js";

test("home recent medals hide the tier caption", () => {
  const home = readFileSync(new URL("./PreviewHome.tsx", import.meta.url), "utf8");
  const card = readFileSync(new URL("./AchievementGalleryCard.tsx", import.meta.url), "utf8");

  const recent = home.slice(home.indexOf("function RecentAchievements"));
  assert.match(recent, /showTierLabel=\{false\}/);
  assert.match(recent, /size="compact"/);
  assert.match(card, /showTierLabel=\{false\}/);
});

test("AchievementMedal omits the Spanish tier caption when showTierLabel is false", () => {
  const hidden = renderToStaticMarkup(
    createElement(AchievementMedal, {
      substanceId: "alcohol",
      tier: "bronze",
      locked: false,
      showTierLabel: false,
    }),
  );
  const shown = renderToStaticMarkup(
    createElement(AchievementMedal, {
      substanceId: "alcohol",
      tier: "bronze",
      locked: false,
    }),
  );

  assert.match(hidden, /alcohol-bronze\.png/);
  assert.equal(hidden.includes("Bronce"), false);
  assert.match(shown, /alcohol-bronze\.png/);
  assert.match(shown, />Bronce</);
});

test("compact medals are a 48px frame instead of the card height", () => {
  const markup = renderToStaticMarkup(
    createElement(AchievementMedal, {
      substanceId: "alcohol",
      tier: "bronze",
      locked: false,
      size: "compact",
      showTierLabel: false,
    }),
  );
  assert.match(markup, /h-12 w-12/);
  assert.equal(markup.includes("h-36"), false);
  assert.equal(markup.includes("Bronce"), false);
});

test("temporal medals keep substance art and add a compass stamp", () => {
  const markup = renderToStaticMarkup(
    createElement(AchievementMedal, {
      substanceId: "cannabis",
      tier: "gold",
      locked: false,
      family: "temporal",
      showTierLabel: false,
    }),
  );
  assert.match(markup, /cannabis-gold\.png/);
  assert.match(markup, /lucide-compass|aria-hidden="true"/);
});
