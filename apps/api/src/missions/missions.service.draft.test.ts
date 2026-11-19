import assert from "node:assert/strict";
import { test } from "node:test";
import { MissionsService } from "./missions.service.js";

test("the historical draft is rejected before Prisma or ProgressService", async () => {
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

  const outcome = await service.submitAnswer("user-draft-guard", {
    missionId: "edu-unpublished-01",
    selectedOptionId: "wanting",
  });
  assert.deepEqual(outcome, { ok: false, reason: "unpublished_mission" });

  assert.equal(dependencyAccessed, false);
});
