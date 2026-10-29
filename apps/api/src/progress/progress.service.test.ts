import assert from "node:assert/strict";
import { test } from "node:test";
import { BadRequestException } from "@nestjs/common";
import { ProgressService } from "./progress.service.js";
import { PrismaService } from "../prisma/prisma.service.js";

function serviceWithUnusedPrisma(): ProgressService {
  return new ProgressService({} as PrismaService);
}

test("awardXp rejects unknown sources, empty keys, and sources without an amount", async () => {
  const progress = serviceWithUnusedPrisma();
  await assert.rejects(
    () =>
      progress.awardXp("user-1", {
        source: "login",
        sourceKey: "x",
      }),
    BadRequestException,
  );
  await assert.rejects(
    () =>
      progress.awardXp("user-1", {
        source: "journal_create_day",
        sourceKey: "   ",
      }),
    BadRequestException,
  );
  await assert.rejects(
    () =>
      progress.awardXp("user-1", {
        source: "referral_qualified",
        sourceKey: "invite-1",
      }),
    BadRequestException,
  );
});
