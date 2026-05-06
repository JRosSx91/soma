-- CreateEnum
CREATE TYPE "Neurotransmitter" AS ENUM ('dopamine', 'serotonin', 'gaba', 'glutamate', 'acetylcholine', 'norepinephrine', 'endocannabinoid', 'endorphin');

-- CreateEnum
CREATE TYPE "WithdrawalPhase" AS ENUM ('during_use', 'acute_withdrawal', 'post_acute', 'normalizing');

-- CreateEnum
CREATE TYPE "NeurotransmitterDirection" AS ENUM ('depleted', 'elevated', 'oscillating', 'normalizing');

-- CreateEnum
CREATE TYPE "NeurotransmitterSeverity" AS ENUM ('severe', 'moderate', 'mild', 'normalizing');

-- CreateTable
CREATE TABLE "NeurotransmitterProfile" (
    "id" TEXT NOT NULL,
    "substanceId" TEXT NOT NULL,
    "neurotransmitter" "Neurotransmitter" NOT NULL,
    "confidenceLevel" "ConfidenceLevel" NOT NULL,
    "referenceSource" TEXT NOT NULL,

    CONSTRAINT "NeurotransmitterProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeurotransmitterPhase" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "phase" "WithdrawalPhase" NOT NULL,
    "startDay" INTEGER NOT NULL,
    "endDay" INTEGER,
    "severity" "NeurotransmitterSeverity" NOT NULL,
    "direction" "NeurotransmitterDirection" NOT NULL,
    "symptomKey" TEXT NOT NULL,

    CONSTRAINT "NeurotransmitterPhase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NeurotransmitterProfile_substanceId_idx" ON "NeurotransmitterProfile"("substanceId");

-- CreateIndex
CREATE UNIQUE INDEX "NeurotransmitterProfile_substanceId_neurotransmitter_key" ON "NeurotransmitterProfile"("substanceId", "neurotransmitter");

-- CreateIndex
CREATE INDEX "NeurotransmitterPhase_profileId_idx" ON "NeurotransmitterPhase"("profileId");

-- AddForeignKey
ALTER TABLE "NeurotransmitterProfile" ADD CONSTRAINT "NeurotransmitterProfile_substanceId_fkey" FOREIGN KEY ("substanceId") REFERENCES "Substance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeurotransmitterPhase" ADD CONSTRAINT "NeurotransmitterPhase_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "NeurotransmitterProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
