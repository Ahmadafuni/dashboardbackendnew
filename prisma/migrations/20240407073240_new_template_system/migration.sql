/*
  Warnings:

  - You are about to drop the column `ProductCatalogDetailId` on the `Templates` table. All the data in the column will be lost.
  - You are about to drop the column `ManagerId` on the `Warehouses` table. All the data in the column will be lost.
  - Added the required column `CategoryOneId` to the `Templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CategoryTwoId` to the `Templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ProductCatalogId` to the `Templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Season` to the `Templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TemplatePatternId` to the `Templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TemplateTypeId` to the `Templates` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Templates" DROP CONSTRAINT "Templates_ProductCatalogDetailId_fkey";

-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_DepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "Warehouses" DROP CONSTRAINT "Warehouses_ManagerId_fkey";

-- DropIndex
DROP INDEX "Users_WarehouseId_key";

-- DropIndex
DROP INDEX "Warehouses_ManagerId_key";

-- AlterTable
ALTER TABLE "Templates" DROP COLUMN "ProductCatalogDetailId",
ADD COLUMN     "CategoryOneId" INTEGER NOT NULL,
ADD COLUMN     "CategoryTwoId" INTEGER NOT NULL,
ADD COLUMN     "ProductCatalogId" INTEGER NOT NULL,
ADD COLUMN     "Season" "Season" NOT NULL,
ADD COLUMN     "TemplatePatternId" INTEGER NOT NULL,
ADD COLUMN     "TemplateTypeId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "DepartmentId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Warehouses" DROP COLUMN "ManagerId";

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_ProductCatalogId_fkey" FOREIGN KEY ("ProductCatalogId") REFERENCES "ProductCatalogs"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_CategoryOneId_fkey" FOREIGN KEY ("CategoryOneId") REFERENCES "ProductCatalogCategoryOne"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_CategoryTwoId_fkey" FOREIGN KEY ("CategoryTwoId") REFERENCES "ProductCatalogCategoryTwo"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_TemplatePatternId_fkey" FOREIGN KEY ("TemplatePatternId") REFERENCES "TemplatePatterns"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_TemplateTypeId_fkey" FOREIGN KEY ("TemplateTypeId") REFERENCES "TemplateTypes"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_DepartmentId_fkey" FOREIGN KEY ("DepartmentId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_WarehouseId_fkey" FOREIGN KEY ("WarehouseId") REFERENCES "Warehouses"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
