-- CreateTable
CREATE TABLE "OrganNarrativeProfile" (
    "id" TEXT NOT NULL,
    "organId" TEXT NOT NULL,
    "substanceId" TEXT NOT NULL,
    "confidenceLevel" "ConfidenceLevel" NOT NULL,
    "referenceSource" TEXT NOT NULL,

    CONSTRAINT "OrganNarrativeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganNarrativePhase" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "phase" "WithdrawalPhase" NOT NULL,
    "startDay" INTEGER NOT NULL,
    "endDay" INTEGER,
    "narrativeKey" TEXT NOT NULL,

    CONSTRAINT "OrganNarrativePhase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrganNarrativeProfile_organId_idx" ON "OrganNarrativeProfile"("organId");

-- CreateIndex
CREATE INDEX "OrganNarrativeProfile_substanceId_idx" ON "OrganNarrativeProfile"("substanceId");

-- CreateIndex
CREATE UNIQUE INDEX "OrganNarrativeProfile_organId_substanceId_key" ON "OrganNarrativeProfile"("organId", "substanceId");

-- CreateIndex
CREATE INDEX "OrganNarrativePhase_profileId_idx" ON "OrganNarrativePhase"("profileId");

-- AddForeignKey
ALTER TABLE "OrganNarrativeProfile" ADD CONSTRAINT "OrganNarrativeProfile_organId_fkey" FOREIGN KEY ("organId") REFERENCES "Organ"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganNarrativeProfile" ADD CONSTRAINT "OrganNarrativeProfile_substanceId_fkey" FOREIGN KEY ("substanceId") REFERENCES "Substance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganNarrativePhase" ADD CONSTRAINT "OrganNarrativePhase_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "OrganNarrativeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
