-- DropForeignKey
ALTER TABLE "TrakingModels" DROP CONSTRAINT "TrakingModels_CurrentStageId_fkey";

-- DropForeignKey
ALTER TABLE "TrakingModels" DROP CONSTRAINT "TrakingModels_NextStageId_fkey";

-- DropForeignKey
ALTER TABLE "TrakingModels" DROP CONSTRAINT "TrakingModels_PrevStageId_fkey";

-- AlterTable
ALTER TABLE "Collections" ADD COLUMN     "IsArchived" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "ManufacturingStagesModel" (
    "Id" SERIAL NOT NULL,
    "StageNumber" INTEGER NOT NULL,
    "StageName" VARCHAR(255) NOT NULL,
    "WorkDescription" TEXT,
    "Duration" INTEGER NOT NULL,
    "ModelId" INTEGER NOT NULL,
    "DepartmentId" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "ManufacturingStagesModel_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ManufacturingStagesModel_AuditId_key" ON "ManufacturingStagesModel"("AuditId");

-- AddForeignKey
ALTER TABLE "ManufacturingStagesModel" ADD CONSTRAINT "ManufacturingStagesModel_ModelId_fkey" FOREIGN KEY ("ModelId") REFERENCES "Models"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturingStagesModel" ADD CONSTRAINT "ManufacturingStagesModel_DepartmentId_fkey" FOREIGN KEY ("DepartmentId") REFERENCES "Departments"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturingStagesModel" ADD CONSTRAINT "ManufacturingStagesModel_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_PrevStageId_fkey" FOREIGN KEY ("PrevStageId") REFERENCES "ManufacturingStagesModel"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_CurrentStageId_fkey" FOREIGN KEY ("CurrentStageId") REFERENCES "ManufacturingStagesModel"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_NextStageId_fkey" FOREIGN KEY ("NextStageId") REFERENCES "ManufacturingStagesModel"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
