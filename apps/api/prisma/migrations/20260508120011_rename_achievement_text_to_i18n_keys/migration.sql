/*
  Warnings:

  - You are about to drop the column `physiologicalDescription` on the `Achievement` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Achievement` table. All the data in the column will be lost.
  - Added the required column `descriptionKey` to the `Achievement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `titleKey` to the `Achievement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Achievement" DROP COLUMN "physiologicalDescription",
DROP COLUMN "title",
ADD COLUMN     "descriptionKey" TEXT NOT NULL,
ADD COLUMN     "titleKey" TEXT NOT NULL;
