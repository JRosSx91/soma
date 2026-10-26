import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test } from "node:test";
import { AchievementMedal } from "./AchievementMedal.js";

test("the home featured medal is the only surface that hides the tier caption", () => {
  const home = readFileSync(new URL("./PreviewHome.tsx", import.meta.url), "utf8");
  const page = readFileSync(new URL("../pages/AchievementsPage.tsx", import.meta.url), "utf8");

  const featured = home.slice(home.indexOf("function FeaturedAchievementCard"));
  assert.match(featured, /showTierLabel=\{false\}/);
  assert.equal(page.includes("showTierLabel={false}"), false);
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
