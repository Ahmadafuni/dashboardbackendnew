/*
  Warnings:

  - You are about to drop the column `DepartmentId` on the `TrakingModels` table. All the data in the column will be lost.
  - You are about to drop the column `ModelId` on the `TrakingModels` table. All the data in the column will be lost.
  - You are about to drop the column `ReceivedFromId` on the `TrakingModels` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ModelVariantId]` on the table `TrakingModels` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `CurrentDepartmentId` to the `TrakingModels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ModelVariantId` to the `TrakingModels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "MainStatus" ADD VALUE 'CHECKING';

-- DropForeignKey
ALTER TABLE "TrakingModels" DROP CONSTRAINT "TrakingModels_DepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "TrakingModels" DROP CONSTRAINT "TrakingModels_ModelId_fkey";

-- DropForeignKey
ALTER TABLE "TrakingModels" DROP CONSTRAINT "TrakingModels_ReceivedFromId_fkey";

-- AlterTable
ALTER TABLE "TrakingModels" DROP COLUMN "DepartmentId",
DROP COLUMN "ModelId",
DROP COLUMN "ReceivedFromId",
ADD COLUMN     "CurrentDepartmentId" INTEGER NOT NULL,
ADD COLUMN     "ModelVariantId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TrakingModels_ModelVariantId_key" ON "TrakingModels"("ModelVariantId");

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_CurrentDepartmentId_fkey" FOREIGN KEY ("CurrentDepartmentId") REFERENCES "Departments"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_ModelVariantId_fkey" FOREIGN KEY ("ModelVariantId") REFERENCES "ModelVarients"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
