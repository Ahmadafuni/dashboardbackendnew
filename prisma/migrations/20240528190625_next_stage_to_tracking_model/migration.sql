-- AlterTable
ALTER TABLE "TrakingModels" ADD COLUMN     "NextStageId" INTEGER;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_NextStageId_fkey" FOREIGN KEY ("NextStageId") REFERENCES "ManufacturingStages"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
