/*
  Warnings:

  - You are about to drop the `MaterialMovements` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MaterialMovements" DROP CONSTRAINT "MaterialMovements_AuditId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialMovements" DROP CONSTRAINT "MaterialMovements_FromDepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialMovements" DROP CONSTRAINT "MaterialMovements_FromSupplierId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialMovements" DROP CONSTRAINT "MaterialMovements_MaterialId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialMovements" DROP CONSTRAINT "MaterialMovements_ToDepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialMovements" DROP CONSTRAINT "MaterialMovements_ToSupplierId_fkey";

-- DropTable
DROP TABLE "MaterialMovements";

-- CreateTable
CREATE TABLE "InternalMaterialMovement" (
    "Id" SERIAL NOT NULL,
    "MovementType" "MovementType" NOT NULL,
    "ParentMaterialId" INTEGER NOT NULL,
    "ChildMaterialId" INTEGER,
    "Quantity" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "UnitOfQuantity" TEXT NOT NULL,
    "MovementDate" TIMESTAMP(3) NOT NULL,
    "WarehouseFromId" INTEGER,
    "WarehouseToId" INTEGER,
    "DepartmentFromId" INTEGER,
    "DepartmentToId" INTEGER,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "InternalMaterialMovement_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ExternalMaterialMovement" (
    "Id" SERIAL NOT NULL,
    "MovementType" "MovementType" NOT NULL,
    "ParentMaterialId" INTEGER NOT NULL,
    "ChildMaterialId" INTEGER,
    "Quantity" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "UnitOfQuantity" TEXT NOT NULL,
    "MovementDate" TIMESTAMP(3) NOT NULL,
    "WarehouseId" INTEGER NOT NULL,
    "DepartmentId" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "ExternalMaterialMovement_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InternalMaterialMovement_AuditId_key" ON "InternalMaterialMovement"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalMaterialMovement_AuditId_key" ON "ExternalMaterialMovement"("AuditId");

-- AddForeignKey
ALTER TABLE "InternalMaterialMovement" ADD CONSTRAINT "InternalMaterialMovement_ParentMaterialId_fkey" FOREIGN KEY ("ParentMaterialId") REFERENCES "ParentMaterials"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalMaterialMovement" ADD CONSTRAINT "InternalMaterialMovement_ChildMaterialId_fkey" FOREIGN KEY ("ChildMaterialId") REFERENCES "ChildMaterials"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalMaterialMovement" ADD CONSTRAINT "InternalMaterialMovement_WarehouseFromId_fkey" FOREIGN KEY ("WarehouseFromId") REFERENCES "Warehouses"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalMaterialMovement" ADD CONSTRAINT "InternalMaterialMovement_WarehouseToId_fkey" FOREIGN KEY ("WarehouseToId") REFERENCES "Warehouses"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalMaterialMovement" ADD CONSTRAINT "InternalMaterialMovement_DepartmentFromId_fkey" FOREIGN KEY ("DepartmentFromId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalMaterialMovement" ADD CONSTRAINT "InternalMaterialMovement_DepartmentToId_fkey" FOREIGN KEY ("DepartmentToId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalMaterialMovement" ADD CONSTRAINT "InternalMaterialMovement_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalMaterialMovement" ADD CONSTRAINT "ExternalMaterialMovement_ParentMaterialId_fkey" FOREIGN KEY ("ParentMaterialId") REFERENCES "ParentMaterials"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalMaterialMovement" ADD CONSTRAINT "ExternalMaterialMovement_ChildMaterialId_fkey" FOREIGN KEY ("ChildMaterialId") REFERENCES "ChildMaterials"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalMaterialMovement" ADD CONSTRAINT "ExternalMaterialMovement_WarehouseId_fkey" FOREIGN KEY ("WarehouseId") REFERENCES "Warehouses"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalMaterialMovement" ADD CONSTRAINT "ExternalMaterialMovement_DepartmentId_fkey" FOREIGN KEY ("DepartmentId") REFERENCES "Departments"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalMaterialMovement" ADD CONSTRAINT "ExternalMaterialMovement_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
