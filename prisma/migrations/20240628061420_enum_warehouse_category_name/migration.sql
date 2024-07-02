/*
  Warnings:

  - Changed the type of `CategoryName` on the `Warehouses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Warehouses" DROP COLUMN "CategoryName",
ADD COLUMN     "CategoryName" "CategoryName" NOT NULL;
