/*
  Warnings:

  - A unique constraint covering the columns `[AuditId]` on the table `TrakingModels` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `AuditId` to the `TrakingModels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TrakingModels" ADD COLUMN     "AuditId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TrakingModels_AuditId_key" ON "TrakingModels"("AuditId");

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
