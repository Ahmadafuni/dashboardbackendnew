/*
  Warnings:

  - You are about to drop the column `SeasonId` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `SeasonId` on the `ProductCatalogDetails` table. All the data in the column will be lost.
  - You are about to drop the `Seasons` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `Season` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Season` to the `ProductCatalogDetails` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TemplatePatternId` to the `ProductCatalogDetails` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Season" AS ENUM ('SUMMER', 'FALL', 'WINTER', 'SPRING');

-- AlterEnum
ALTER TYPE "DepartmentCategory" ADD VALUE 'DRAWING';

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_SeasonId_fkey";

-- DropForeignKey
ALTER TABLE "ProductCatalogDetails" DROP CONSTRAINT "ProductCatalogDetails_SeasonId_fkey";

-- DropForeignKey
ALTER TABLE "Seasons" DROP CONSTRAINT "Seasons_AuditId_fkey";

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "SeasonId",
ADD COLUMN     "Season" "Season" NOT NULL;

-- AlterTable
ALTER TABLE "ProductCatalogDetails" DROP COLUMN "SeasonId",
ADD COLUMN     "Season" "Season" NOT NULL,
ADD COLUMN     "TemplatePatternId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Seasons";

-- AddForeignKey
ALTER TABLE "ProductCatalogDetails" ADD CONSTRAINT "ProductCatalogDetails_TemplatePatternId_fkey" FOREIGN KEY ("TemplatePatternId") REFERENCES "TemplatePatterns"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
