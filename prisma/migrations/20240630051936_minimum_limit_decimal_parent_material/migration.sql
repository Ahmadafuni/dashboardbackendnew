/*
  Warnings:

  - The `MinimumLimit` column on the `ParentMaterials` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ParentMaterials" DROP COLUMN "MinimumLimit",
ADD COLUMN     "MinimumLimit" DECIMAL(65,30) DEFAULT 0.0;
