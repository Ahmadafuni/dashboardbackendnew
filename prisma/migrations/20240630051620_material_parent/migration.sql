/*
  Warnings:

  - You are about to drop the `Materials` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MaterialMovements" DROP CONSTRAINT "MaterialMovements_MaterialId_fkey";

-- DropForeignKey
ALTER TABLE "Materials" DROP CONSTRAINT "Materials_AuditId_fkey";

-- DropForeignKey
ALTER TABLE "Materials" DROP CONSTRAINT "Materials_CategoryId_fkey";

-- DropForeignKey
ALTER TABLE "Materials" DROP CONSTRAINT "Materials_SupplierId_fkey";

-- DropTable
DROP TABLE "Materials";

-- CreateTable
CREATE TABLE "ParentMaterials" (
    "Id" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "CategoryId" INTEGER NOT NULL,
    "Description" TEXT,
    "UnitOfMeasure" VARCHAR(10),
    "UsageLocation" TEXT,
    "AlternativeMaterials" TEXT,
    "MinimumLimit" TEXT,
    "IsRelevantToProduction" BOOLEAN NOT NULL DEFAULT false,
    "HasChildren" BOOLEAN NOT NULL DEFAULT false,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "ParentMaterials_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ParentMaterials_AuditId_key" ON "ParentMaterials"("AuditId");

-- AddForeignKey
ALTER TABLE "MaterialMovements" ADD CONSTRAINT "MaterialMovements_MaterialId_fkey" FOREIGN KEY ("MaterialId") REFERENCES "ParentMaterials"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentMaterials" ADD CONSTRAINT "ParentMaterials_CategoryId_fkey" FOREIGN KEY ("CategoryId") REFERENCES "MaterialCategories"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentMaterials" ADD CONSTRAINT "ParentMaterials_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
