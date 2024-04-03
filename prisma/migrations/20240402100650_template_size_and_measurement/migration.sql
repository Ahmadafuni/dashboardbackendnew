/*
  Warnings:

  - You are about to drop the column `SizeId` on the `TemplateSizes` table. All the data in the column will be lost.
  - Added the required column `SizeId` to the `Measurements` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TemplateSizes" DROP CONSTRAINT "TemplateSizes_SizeId_fkey";

-- AlterTable
ALTER TABLE "Measurements" ADD COLUMN     "SizeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "TemplateSizes" DROP COLUMN "SizeId";

-- AddForeignKey
ALTER TABLE "Measurements" ADD CONSTRAINT "Measurements_SizeId_fkey" FOREIGN KEY ("SizeId") REFERENCES "Sizes"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
