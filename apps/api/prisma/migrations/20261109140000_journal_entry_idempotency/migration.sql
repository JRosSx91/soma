-- JRN-01R: optional create idempotency. Multiple NULL clientOpId remain allowed.

ALTER TABLE "JournalEntry" ADD COLUMN "clientOpId" TEXT;
ALTER TABLE "JournalEntry" ADD COLUMN "requestHash" TEXT;

CREATE UNIQUE INDEX "JournalEntry_userId_clientOpId_key" ON "JournalEntry"("userId", "clientOpId");
