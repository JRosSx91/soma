import "reflect-metadata";
import assert from "node:assert/strict";
import { test } from "node:test";
import { AchievementsController } from "./achievements.controller.js";

const user = { id: "user-1" } as never;

test("GET passes inserted ids from detect into the catalog mapper", async () => {
  let listedWith: unknown;
  const service = {
    detectAndPersistUnlocks: async (userId: string) => {
      assert.equal(userId, "user-1");
      return ["new-a"];
    },
    getUserAchievements: async (userId: string, inserted: string[]) => {
      listedWith = { userId, inserted };
      return [{ id: "new-a", insertedThisCall: true }];
    },
  };
  const controller = new AchievementsController(service as never);
  const body = await controller.getMyAchievements(user);
  assert.deepEqual(listedWith, { userId: "user-1", inserted: ["new-a"] });
  assert.equal(Array.isArray(body), true);
});

test("inbox-read and celebrate use the authenticated user id", async () => {
  const calls: Array<{ op: string; userId: string; ids: string[] }> = [];
  const service = {
    markInboxRead: async (userId: string, achievementIds: string[]) => {
      calls.push({ op: "inbox", userId, ids: achievementIds });
      return { updated: 1, readIds: achievementIds };
    },
    claimCelebrations: async (userId: string, achievementIds: string[]) => {
      calls.push({ op: "celebrate", userId, ids: achievementIds });
      return { celebratedIds: achievementIds };
    },
  };
  const controller = new AchievementsController(service as never);
  await controller.markInboxRead(user, { achievementIds: ["x"] });
  await controller.claimCelebrations(user, { achievementIds: ["y"] });
  assert.deepEqual(calls, [
    { op: "inbox", userId: "user-1", ids: ["x"] },
    { op: "celebrate", userId: "user-1", ids: ["y"] },
  ]);
});
