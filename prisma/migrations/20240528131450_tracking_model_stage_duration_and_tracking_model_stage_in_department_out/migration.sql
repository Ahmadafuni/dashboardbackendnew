/*
  Warnings:

  - You are about to drop the column `CurrentDepartmentId` on the `TrakingModels` table. All the data in the column will be lost.
  - You are about to drop the column `DeliveredToId` on the `TrakingModels` table. All the data in the column will be lost.
  - Added the required column `CurrentStageId` to the `TrakingModels` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TrakingModels" DROP CONSTRAINT "TrakingModels_CurrentDepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "TrakingModels" DROP CONSTRAINT "TrakingModels_DeliveredToId_fkey";

-- AlterTable
ALTER TABLE "TrakingModels" DROP COLUMN "CurrentDepartmentId",
DROP COLUMN "DeliveredToId",
ADD COLUMN     "CurrentStageId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "TrackingModelStageDurations" (
    "Id" SERIAL NOT NULL,
    "TrackingId" INTEGER NOT NULL,
    "StageId" INTEGER NOT NULL,
    "StartTime" TIMESTAMP(3),
    "EndTime" TIMESTAMP(3),
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "TrackingModelStageDurations_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrackingModelStageDurations_AuditId_key" ON "TrackingModelStageDurations"("AuditId");

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_CurrentStageId_fkey" FOREIGN KEY ("CurrentStageId") REFERENCES "ManufacturingStages"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingModelStageDurations" ADD CONSTRAINT "TrackingModelStageDurations_TrackingId_fkey" FOREIGN KEY ("TrackingId") REFERENCES "TrakingModels"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingModelStageDurations" ADD CONSTRAINT "TrackingModelStageDurations_StageId_fkey" FOREIGN KEY ("StageId") REFERENCES "ManufacturingStages"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrackingModelStageDurations" ADD CONSTRAINT "TrackingModelStageDurations_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
