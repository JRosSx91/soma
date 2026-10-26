-- Additive columns only. Existing UserAchievement rows are preserved.
-- notifiedAt semantics are unchanged (toast ack).
-- ALTER TABLE ADD COLUMN and this UPDATE are valid inside a PostgreSQL
-- transaction. Prisma Migrate does not wrap PostgreSQL migrations for us,
-- so BEGIN/COMMIT make both statements atomic.

BEGIN;

ALTER TABLE "UserAchievement" ADD COLUMN "inboxReadAt" TIMESTAMP(3);
ALTER TABLE "UserAchievement" ADD COLUMN "celebratedAt" TIMESTAMP(3);

-- Historical toast-notified rows are treated as already read in the inbox
-- and already claimed for celebration, so they do not re-badge or re-modal.
UPDATE "UserAchievement"
SET
    "inboxReadAt" = "notifiedAt",
    "celebratedAt" = "notifiedAt"
WHERE "notifiedAt" IS NOT NULL;

COMMIT;

-- No extra indexes: lookups use (userId, achievementId) unique, and a user
-- has at most the catalog size (~106) rows. (userId, notifiedAt) already exists.
