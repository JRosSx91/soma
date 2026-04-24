-- CreateEnum
CREATE TYPE "BodySystem" AS ENUM ('respiratory', 'cardiovascular', 'hepatic', 'renal', 'nervous_central', 'nervous_peripheral', 'endocrine', 'reproductive', 'digestive', 'immune', 'integumentary');

-- CreateEnum
CREATE TYPE "RecoveryCurveShape" AS ENUM ('logarithmic', 'sigmoidal', 'linear', 'stepwise');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('high', 'medium', 'low');

-- CreateEnum
CREATE TYPE "AchievementTier" AS ENUM ('bronze', 'silver', 'gold', 'platinum');

-- CreateTable
CREATE TABLE "Organ" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "system" "BodySystem" NOT NULL,
    "shortDescription" TEXT NOT NULL,

    CONSTRAINT "Organ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganDamageProfile" (
    "id" TEXT NOT NULL,
    "organId" TEXT NOT NULL,
    "substanceId" TEXT NOT NULL,
    "maxSeverity" DOUBLE PRECISION NOT NULL,
    "confidenceLevel" "ConfidenceLevel" NOT NULL,
    "referenceSource" TEXT NOT NULL,

    CONSTRAINT "OrganDamageProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganRecoveryCurve" (
    "id" TEXT NOT NULL,
    "organId" TEXT NOT NULL,
    "substanceId" TEXT NOT NULL,
    "shape" "RecoveryCurveShape" NOT NULL,
    "daysTo95Recovery" INTEGER NOT NULL,
    "recoveryCeiling" DOUBLE PRECISION NOT NULL,
    "confidenceLevel" "ConfidenceLevel" NOT NULL,
    "referenceSource" TEXT NOT NULL,

    CONSTRAINT "OrganRecoveryCurve_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "tier" "AchievementTier" NOT NULL,
    "title" TEXT NOT NULL,
    "physiologicalDescription" TEXT NOT NULL,
    "triggerOrganId" TEXT NOT NULL,
    "triggerSubstanceId" TEXT NOT NULL,
    "triggerRecoveryThreshold" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganDamageProfile_substanceId_idx" ON "OrganDamageProfile"("substanceId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganDamageProfile_organId_substanceId_key" ON "OrganDamageProfile"("organId", "substanceId");

-- CreateIndex
CREATE INDEX "OrganRecoveryCurve_substanceId_idx" ON "OrganRecoveryCurve"("substanceId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganRecoveryCurve_organId_substanceId_key" ON "OrganRecoveryCurve"("organId", "substanceId");

-- CreateIndex
CREATE INDEX "Achievement_triggerSubstanceId_idx" ON "Achievement"("triggerSubstanceId");

-- CreateIndex
CREATE INDEX "Achievement_triggerOrganId_idx" ON "Achievement"("triggerOrganId");

-- AddForeignKey
ALTER TABLE "OrganDamageProfile" ADD CONSTRAINT "OrganDamageProfile_organId_fkey" FOREIGN KEY ("organId") REFERENCES "Organ"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganDamageProfile" ADD CONSTRAINT "OrganDamageProfile_substanceId_fkey" FOREIGN KEY ("substanceId") REFERENCES "Substance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganRecoveryCurve" ADD CONSTRAINT "OrganRecoveryCurve_organId_fkey" FOREIGN KEY ("organId") REFERENCES "Organ"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganRecoveryCurve" ADD CONSTRAINT "OrganRecoveryCurve_substanceId_fkey" FOREIGN KEY ("substanceId") REFERENCES "Substance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_triggerOrganId_fkey" FOREIGN KEY ("triggerOrganId") REFERENCES "Organ"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_triggerSubstanceId_fkey" FOREIGN KEY ("triggerSubstanceId") REFERENCES "Substance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
