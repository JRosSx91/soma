-- CreateEnum
CREATE TYPE "UsageStatus" AS ENUM ('abstinent', 'active');

-- AlterTable
ALTER TABLE "SubstanceUsage" ADD COLUMN     "status" "UsageStatus" NOT NULL DEFAULT 'abstinent',
ALTER COLUMN "lastUseDate" DROP NOT NULL;
