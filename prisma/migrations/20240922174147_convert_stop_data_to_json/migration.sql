/*
  Warnings:

  - The `StopData` column on the `Collections` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `StopData` column on the `ModelVarients` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `StopData` column on the `Models` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `StopData` column on the `Orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `StopData` column on the `TrakingModels` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Collections" DROP COLUMN "StopData",
ADD COLUMN     "StopData" JSONB;

-- AlterTable
ALTER TABLE "ModelVarients" DROP COLUMN "StopData",
ADD COLUMN     "StopData" JSONB;

-- AlterTable
ALTER TABLE "Models" DROP COLUMN "StopData",
ADD COLUMN     "StopData" JSONB;

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "StopData",
ADD COLUMN     "StopData" JSONB;

-- AlterTable
ALTER TABLE "TrakingModels" DROP COLUMN "StopData",
ADD COLUMN     "StopData" JSONB;
