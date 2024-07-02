-- CreateTable
CREATE TABLE "ChildMaterials" (
    "Id" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "ParentMaterialId" INTEGER NOT NULL,
    "DyeNumber" TEXT,
    "Kashan" TEXT,
    "Halil" TEXT,
    "Phthalate" TEXT,
    "GramWeight" DECIMAL(65,30) DEFAULT 0.0,
    "Description" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "ChildMaterials_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "ChildMaterials" ADD CONSTRAINT "ChildMaterials_ParentMaterialId_fkey" FOREIGN KEY ("ParentMaterialId") REFERENCES "ParentMaterials"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildMaterials" ADD CONSTRAINT "ChildMaterials_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
