-- FBK-01B: private feedback reports.
-- Additive only. Does not alter Journal, XP, missions, or User columns.
-- No UNIQUE (userId, fingerprint): the same copy may be filed again after 24h.
-- Apply only on local / preview databases. Do not run against production here.

CREATE TYPE "FeedbackCategory" AS ENUM ('bug', 'suggestion', 'general');

CREATE TYPE "FeedbackStatus" AS ENUM ('open', 'in_review', 'resolved', 'closed');

CREATE TABLE "FeedbackReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "FeedbackCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'open',
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedbackReport_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FeedbackReport_userId_createdAt_idx" ON "FeedbackReport"("userId", "createdAt");

CREATE INDEX "FeedbackReport_userId_fingerprint_createdAt_idx" ON "FeedbackReport"("userId", "fingerprint", "createdAt");

ALTER TABLE "FeedbackReport" ADD CONSTRAINT "FeedbackReport_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FeedbackReport" ADD CONSTRAINT "FeedbackReport_fingerprint_sha256_hex"
  CHECK (char_length("fingerprint") = 64);
