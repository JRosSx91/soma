-- GAM-01C: XP ledger + denormalized progression.
-- totalXp is BIGINT so T(100000) = 299997999990 fits (INTEGER does not).
-- Apply only on local / preview databases. Do not run against production here.

CREATE TABLE "XpGrant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpGrant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "XpGrant_userId_source_sourceKey_key" ON "XpGrant"("userId", "source", "sourceKey");

CREATE INDEX "XpGrant_userId_idx" ON "XpGrant"("userId");

ALTER TABLE "XpGrant" ADD CONSTRAINT "XpGrant_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "XpGrant" ADD CONSTRAINT "XpGrant_amount_positive"
  CHECK ("amount" > 0);

CREATE TABLE "UserProgression" (
    "userId" TEXT NOT NULL,
    "totalXp" BIGINT NOT NULL DEFAULT 0,
    "equippedTitleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProgression_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "UserProgression" ADD CONSTRAINT "UserProgression_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserProgression" ADD CONSTRAINT "UserProgression_totalXp_nonnegative"
  CHECK ("totalXp" >= 0);
