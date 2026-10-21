-- Additive session table for opaque refresh tokens (hashed at rest).
-- Down (manual): DROP TABLE "RefreshToken";

CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "replacedById" TEXT,
    "userAgent" TEXT,
    "ipHash" TEXT,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

CREATE INDEX "RefreshToken_familyId_idx" ON "RefreshToken"("familyId");

CREATE INDEX "RefreshToken_expiresAt_idx" ON "RefreshToken"("expiresAt");

ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
