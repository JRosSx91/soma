-- JRN-01E: personal perceived-improvement milestones. Owner-only, not medals.

CREATE TABLE "JournalPersonalMilestone" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "occurredOn" DATE NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalPersonalMilestone_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "JournalPersonalMilestone_userId_occurredOn_idx"
  ON "JournalPersonalMilestone"("userId", "occurredOn");

ALTER TABLE "JournalPersonalMilestone" ADD CONSTRAINT "JournalPersonalMilestone_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
