/*
  Warnings:

  - You are about to drop the column `DepartmentId` on the `ExternalMaterialMovement` table. All the data in the column will be lost.
  - Added the required column `SupplierId` to the `ExternalMaterialMovement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExternalMaterialMovement" DROP CONSTRAINT "ExternalMaterialMovement_DepartmentId_fkey";

-- AlterTable
ALTER TABLE "ExternalMaterialMovement" DROP COLUMN "DepartmentId",
ADD COLUMN     "SupplierId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ExternalMaterialMovement" ADD CONSTRAINT "ExternalMaterialMovement_SupplierId_fkey" FOREIGN KEY ("SupplierId") REFERENCES "Suppliers"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
