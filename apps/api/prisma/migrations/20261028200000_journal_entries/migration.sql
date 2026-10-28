-- JRN-01C: personal journal. occurredOn is DATE (civil day), not timestamptz.

CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "occurredOn" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "mood" INTEGER,
    "sleep" INTEGER,
    "energy" INTEGER,
    "anxiety" INTEGER,
    "cravingIntensity" INTEGER,
    "cravingSubstanceId" TEXT,
    "title" TEXT,
    "body" TEXT,
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "learning" BOOLEAN NOT NULL DEFAULT false,
    "emotionIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "triggerIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "JournalEntry_userId_occurredOn_idx" ON "JournalEntry"("userId", "occurredOn");
CREATE INDEX "JournalEntry_userId_createdAt_idx" ON "JournalEntry"("userId", "createdAt");
CREATE INDEX "JournalEntry_userId_highlighted_idx" ON "JournalEntry"("userId", "highlighted");

ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_cravingSubstanceId_fkey"
  FOREIGN KEY ("cravingSubstanceId") REFERENCES "Substance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
