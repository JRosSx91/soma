-- Additive onboarding intent on User.
-- Backfill: users with ≥1 SubstanceUsage → completed; others stay pending
-- (cannot infer a historical voluntary skip).

CREATE TYPE "OnboardingStatus" AS ENUM ('pending', 'skipped', 'completed');

ALTER TABLE "User"
ADD COLUMN "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'pending';

UPDATE "User" AS u
SET "onboardingStatus" = 'completed'
WHERE EXISTS (
  SELECT 1
  FROM "SubstanceUsage" su
  WHERE su."userId" = u."id"
);

-- No onboardingStatus index: no list/filter queries by this column yet.
-- Down (manual):
--   ALTER TABLE "User" DROP COLUMN "onboardingStatus";
--   DROP TYPE "OnboardingStatus";
