/*
  Warnings:

  - Added the required column `Description` to the `Warehouses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CategoryName` to the `Warehouses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Warehouses" ADD COLUMN     "Description" TEXT NOT NULL,
DROP COLUMN "CategoryName",
ADD COLUMN     "CategoryName" TEXT NOT NULL;
