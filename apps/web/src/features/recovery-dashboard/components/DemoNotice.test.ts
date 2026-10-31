import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enRecovery from "../../../i18n/locales/en/recovery.json" with { type: "json" };
import esRecovery from "../../../i18n/locales/es/recovery.json" with { type: "json" };

test("demo notice uses i18n disclaimer in spanish and english", () => {
  const source = readFileSync(new URL("./DemoNotice.tsx", import.meta.url), "utf8");
  assert.match(source, /t\("demoDisclaimer"\)/);
  assert.match(source, /t\("demoBadge"\)/);
  assert.match(source, /t\("demoAria"/);
  assert.equal(enRecovery.demoBadge, "DEMO");
  assert.equal(esRecovery.demoBadge, "DEMO");
  assert.equal(source.includes("demo-data"), false);
  assert.equal(
    (esRecovery as { demoDisclaimer: string }).demoDisclaimer,
    "Cifras y textos ficticios. No son mediciones clínicas.",
  );
  assert.equal(
    (enRecovery as { demoDisclaimer: string }).demoDisclaimer,
    "Fictional figures and copy. They are not clinical measurements.",
  );
  assert.doesNotMatch((enRecovery as { demoDisclaimer: string }).demoDisclaimer, /Cifras/);
});
