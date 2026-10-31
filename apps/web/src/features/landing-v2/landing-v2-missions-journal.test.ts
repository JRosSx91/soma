import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import en from "../../i18n/locales/en/landing-v2.json" with { type: "json" };
import es from "../../i18n/locales/es/landing-v2.json" with { type: "json" };

const section = readFileSync(
  new URL("./LandingV2MissionsJournal.tsx", import.meta.url),
  "utf8",
);
const origin = readFileSync(
  new URL("./LandingV2Origin.tsx", import.meta.url),
  "utf8",
);
const hero = readFileSync(
  new URL("./LandingV2Hero.tsx", import.meta.url),
  "utf8",
);

test("missions-journal section uses the approved decorative background", () => {
  assert.match(section, /\/images\/landing-v2\/soma-missions-journal-bg\.png/);
  assert.match(section, /alt=""/);
  assert.equal(
    existsSync(
      fileURLToPath(
        new URL(
          "../../../public/images/landing-v2/soma-missions-journal-bg.png",
          import.meta.url,
        ),
      ),
    ),
    true,
  );
});

test("missions examples come from the published catalog and real XP", () => {
  assert.match(section, /edu-dopamine-01/);
  assert.match(section, /edu-receptors-01/);
  assert.match(section, /edu-serotonin-01/);
  assert.match(section, /MISSION_XP_AMOUNT/);
  assert.match(section, /statusAvailable/);
  assert.match(section, /statusCompleted/);
  assert.match(section, /to="\/preview\/missions"/);
  assert.doesNotMatch(section, /streak|racha|pending|daily/i);
});

test("journal sample stays within real fields and fictional copy", () => {
  assert.match(section, /journal:form.mood|journal:emotions/);
  assert.match(section, /calm/);
  assert.match(section, /grateful/);
  assert.match(section, /to="\/preview\/journal"/);
  assert.doesNotMatch(section, /emoji|category|ratingStars/i);
  assert.match(es.path.journal.note, /ficticias/);
  assert.match(en.path.journal.note, /Fictional/);
});

test("path copy stays educational in ES and EN", () => {
  assert.equal(es.path.title, "Cada paso cuenta. Cada historia importa.");
  assert.equal(en.path.title, "Every step counts. Every story matters.");
  assert.equal(es.path.missions.title, "Misiones");
  assert.equal(en.path.missions.title, "Missions");
  assert.equal(es.path.journal.title, "Bitácora");
  assert.equal(en.path.journal.title, "Journal");
  assert.match(es.path.missions.body, /desafíos educativos/);
  assert.match(en.path.missions.body, /educational challenges/);
  assert.match(es.path.missions.note, /ilustrativos/);
  assert.match(en.path.missions.note, /Illustrative/);
});

test("path reuses landing motion once including a transform progress fill", () => {
  assert.match(section, /useReducedMotion/);
  assert.match(section, /whileInView=\{\{ opacity: 1, y: 0 \}\}/);
  assert.match(section, /viewport=\{\{ once: true/);
  assert.match(section, /scaleX: 0/);
  assert.match(section, /scaleX: 1/);
  assert.match(section, /origin-left/);
});

test("path section does not rewrite origin or hero", () => {
  assert.match(origin, /soma-origin-bg/);
  assert.doesNotMatch(origin, /soma-missions-journal-bg/);
  assert.match(hero, /hero-holographic-anatomy/);
  assert.doesNotMatch(hero, /soma-missions-journal-bg/);
});
