/*
  Warnings:

  - The `Sizes` column on the `ModelVarients` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ModelVarients" DROP COLUMN "Sizes",
ADD COLUMN     "Sizes" JSONB;
