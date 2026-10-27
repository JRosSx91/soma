import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { recoveryHref, resolveRecoverySubstance } from "./recovery-query.ts";

test("recovery query uses stable substance ids, not labels", () => {
  const known = ["cannabis", "nicotine", "cocaine"];
  assert.equal(resolveRecoverySubstance("cannabis", known), "cannabis");
  assert.equal(resolveRecoverySubstance("Cannabis", known), null);
  assert.equal(resolveRecoverySubstance("nicotina", known), null);
  assert.equal(resolveRecoverySubstance("missing", known), null);
  assert.equal(resolveRecoverySubstance(null, known), null);
  assert.equal(recoveryHref("/preview", "cannabis"), "/preview/recovery?substance=cannabis");
  assert.equal(recoveryHref("/app"), "/app/recovery");
});

test("home substance cards link with the substance query", () => {
  const home = readFileSync(new URL("../components/PreviewHome.tsx", import.meta.url), "utf8");
  const recovery = readFileSync(new URL("../pages/RecoveryPage.tsx", import.meta.url), "utf8");
  assert.match(home, /recoveryHref\(basePath, substance\.id\)/);
  assert.match(recovery, /useSearchParams/);
  assert.match(recovery, /resolveRecoverySubstance/);
});
