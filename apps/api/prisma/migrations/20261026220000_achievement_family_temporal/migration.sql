-- Additive GAME-01: curve vs temporal families. Existing rows stay `curve`.

CREATE TYPE "AchievementFamily" AS ENUM ('curve', 'temporal');

ALTER TABLE "Achievement" ADD COLUMN "family" "AchievementFamily" NOT NULL DEFAULT 'curve';
ALTER TABLE "Achievement" ADD COLUMN "triggerAbstinenceDays" INTEGER;

ALTER TABLE "Achievement" ALTER COLUMN "triggerOrganId" DROP NOT NULL;
ALTER TABLE "Achievement" ALTER COLUMN "triggerRecoveryThreshold" DROP NOT NULL;

CREATE INDEX "Achievement_family_idx" ON "Achievement"("family");

ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_family_shape_check" CHECK (
  (
    "family" = 'curve'
    AND "triggerOrganId" IS NOT NULL
    AND "triggerRecoveryThreshold" IS NOT NULL
    AND "triggerAbstinenceDays" IS NULL
  )
  OR
  (
    "family" = 'temporal'
    AND "triggerAbstinenceDays" IS NOT NULL
    AND "triggerAbstinenceDays" > 0
    AND "triggerOrganId" IS NULL
    AND "triggerRecoveryThreshold" IS NULL
  )
);
