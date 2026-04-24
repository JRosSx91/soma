-- CreateEnum
CREATE TYPE "BiologicalSex" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "SubstanceCategory" AS ENUM ('depressant', 'stimulant', 'cannabinoid', 'nicotine', 'opioid', 'hallucinogen', 'dissociative');

-- CreateEnum
CREATE TYPE "UsageFrequency" AS ENUM ('daily', 'weekly', 'monthly', 'occasional');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "biologicalSex" "BiologicalSex" NOT NULL,
    "birthYear" INTEGER NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Substance" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "SubstanceCategory" NOT NULL,
    "shortDescription" TEXT NOT NULL,

    CONSTRAINT "Substance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubstanceUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "substanceId" TEXT NOT NULL,
    "yearStarted" INTEGER NOT NULL,
    "lastUseDate" TIMESTAMP(3) NOT NULL,
    "frequency" "UsageFrequency" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubstanceUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubstanceUsage_userId_idx" ON "SubstanceUsage"("userId");

-- CreateIndex
CREATE INDEX "SubstanceUsage_substanceId_idx" ON "SubstanceUsage"("substanceId");

-- AddForeignKey
ALTER TABLE "SubstanceUsage" ADD CONSTRAINT "SubstanceUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubstanceUsage" ADD CONSTRAINT "SubstanceUsage_substanceId_fkey" FOREIGN KEY ("substanceId") REFERENCES "Substance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
