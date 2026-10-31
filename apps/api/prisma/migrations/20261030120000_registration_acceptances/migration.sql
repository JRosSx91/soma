-- CreateTable
CREATE TABLE "RegistrationAcceptance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "documentVersion" TEXT NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistrationAcceptance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegistrationAcceptance_userId_idx" ON "RegistrationAcceptance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationAcceptance_userId_purpose_key" ON "RegistrationAcceptance"("userId", "purpose");

-- AddForeignKey
ALTER TABLE "RegistrationAcceptance" ADD CONSTRAINT "RegistrationAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
