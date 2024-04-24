/*
  Warnings:

  - You are about to drop the column `ColorId` on the `Models` table. All the data in the column will be lost.
  - You are about to drop the column `ModelNumberTest` on the `Models` table. All the data in the column will be lost.
  - You are about to drop the column `Quantity` on the `Models` table. All the data in the column will be lost.
  - You are about to drop the column `SizeId` on the `Models` table. All the data in the column will be lost.
  - You are about to drop the column `TotalQuantity` on the `Models` table. All the data in the column will be lost.
  - You are about to drop the column `Amount` on the `Orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Models" DROP CONSTRAINT "Models_ColorId_fkey";

-- DropForeignKey
ALTER TABLE "Models" DROP CONSTRAINT "Models_SizeId_fkey";

-- AlterTable
ALTER TABLE "Models" DROP COLUMN "ColorId",
DROP COLUMN "ModelNumberTest",
DROP COLUMN "Quantity",
DROP COLUMN "SizeId",
DROP COLUMN "TotalQuantity";

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "Amount";

-- CreateTable
CREATE TABLE "ModelVarients" (
    "Id" SERIAL NOT NULL,
    "ModelId" INTEGER NOT NULL,
    "Status" "MainStatus" NOT NULL DEFAULT 'AWAITING',
    "ColorId" INTEGER NOT NULL,
    "Sizes" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "ModelVarients_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "ModelVarients" ADD CONSTRAINT "ModelVarients_ModelId_fkey" FOREIGN KEY ("ModelId") REFERENCES "Models"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelVarients" ADD CONSTRAINT "ModelVarients_ColorId_fkey" FOREIGN KEY ("ColorId") REFERENCES "Colors"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelVarients" ADD CONSTRAINT "ModelVarients_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
