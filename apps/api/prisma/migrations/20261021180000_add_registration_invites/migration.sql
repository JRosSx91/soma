-- Additive closed-beta registration invites (hashed at rest).
-- Down (manual):
--   ALTER TABLE "RegistrationInvite" DROP CONSTRAINT "RegistrationInvite_usedByUserId_fkey";
--   DROP TABLE "RegistrationInvite";

CREATE TABLE "RegistrationInvite" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "usedByUserId" TEXT,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "RegistrationInvite_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RegistrationInvite_tokenHash_key" ON "RegistrationInvite"("tokenHash");

CREATE UNIQUE INDEX "RegistrationInvite_usedByUserId_key" ON "RegistrationInvite"("usedByUserId");

CREATE INDEX "RegistrationInvite_expiresAt_idx" ON "RegistrationInvite"("expiresAt");

CREATE INDEX "RegistrationInvite_usedAt_idx" ON "RegistrationInvite"("usedAt");

ALTER TABLE "RegistrationInvite" ADD CONSTRAINT "RegistrationInvite_usedByUserId_fkey" FOREIGN KEY ("usedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
