-- GAM-02C: one educational-mission completion per user.
-- Does not alter UserProgression, XpGrant, JournalEntry, or XP amounts.
-- Apply only on local / preview databases. Do not run against production here.

CREATE TABLE "MissionCompletion" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "contentVersion" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MissionCompletion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MissionCompletion_userId_missionId_key" ON "MissionCompletion"("userId", "missionId");

CREATE INDEX "MissionCompletion_userId_idx" ON "MissionCompletion"("userId");

ALTER TABLE "MissionCompletion" ADD CONSTRAINT "MissionCompletion_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "MissionCompletion" ADD CONSTRAINT "MissionCompletion_contentVersion_positive"
  CHECK ("contentVersion" >= 1);

ALTER TABLE "MissionCompletion" ADD CONSTRAINT "MissionCompletion_missionId_nonempty"
  CHECK (char_length("missionId") > 0);
