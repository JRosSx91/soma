/**
 * Additive GAME-01 catalog upsert. Does not wipe UserAchievement.
 * Do not run against production without an explicit deploy step.
 */
import { PrismaClient } from "@prisma/client";
import { upsertTemporalAchievements } from "../prisma/seed/achievements.js";

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    const count = await upsertTemporalAchievements(prisma);
    console.log(`upserted ${count} temporal achievements`);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
