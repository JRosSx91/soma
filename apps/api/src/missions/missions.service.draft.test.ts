import assert from "node:assert/strict";
import { test } from "node:test";
import { MissionsService } from "./missions.service.js";

const GAM_XP_B3_DRAFT_IDS = [
  "edu-receptors-02",
  "edu-neuroadaptation-02",
  "edu-metabolism-02",
  "edu-dopamine-02",
  "edu-gaba-02",
  "edu-adenosine-02",
] as const;

test("GAM-XP-B3 drafts are rejected before Prisma or ProgressService", async () => {
  let dependencyAccessed = false;
  const forbiddenDependency = new Proxy(
    {},
    {
      get() {
        dependencyAccessed = true;
        throw new Error("draft submission reached a persistence dependency");
      },
    },
  );
  const service = new MissionsService(forbiddenDependency as never, forbiddenDependency as never);

  for (const missionId of GAM_XP_B3_DRAFT_IDS) {
    const outcome = await service.submitAnswer("user-draft-guard", {
      missionId,
      selectedOptionId: "option_a",
    });
    assert.deepEqual(outcome, { ok: false, reason: "unpublished_mission" });
  }

  assert.equal(dependencyAccessed, false);
});
