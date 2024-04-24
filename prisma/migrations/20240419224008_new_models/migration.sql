/*
  Warnings:

  - You are about to drop the column `ModelImage` on the `Models` table. All the data in the column will be lost.
  - You are about to drop the column `Note` on the `Models` table. All the data in the column will be lost.
  - You are about to drop the column `OrderDetailId` on the `Models` table. All the data in the column will be lost.
  - You are about to drop the column `QuantityDetails` on the `Models` table. All the data in the column will be lost.
  - You are about to drop the column `ordersId` on the `Models` table. All the data in the column will be lost.
  - Added the required column `CategoryOneId` to the `Models` table without a default value. This is not possible if the table is not empty.
  - Added the required column `CategoryTwoId` to the `Models` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ModelNumber` to the `Models` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ModelNumberTest` to the `Models` table without a default value. This is not possible if the table is not empty.
  - Added the required column `OrderNumber` to the `Models` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ProductCatalogId` to the `Models` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TextileId` to the `Models` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TotalQuantity` to the `Models` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Models" DROP CONSTRAINT "Models_OrderDetailId_fkey";

-- DropForeignKey
ALTER TABLE "Models" DROP CONSTRAINT "Models_ordersId_fkey";

-- DropIndex
DROP INDEX "Models_TemplateId_key";

-- AlterTable
ALTER TABLE "Models" DROP COLUMN "ModelImage",
DROP COLUMN "Note",
DROP COLUMN "OrderDetailId",
DROP COLUMN "QuantityDetails",
DROP COLUMN "ordersId",
ADD COLUMN     "Barcode" TEXT,
ADD COLUMN     "CategoryOneId" INTEGER NOT NULL,
ADD COLUMN     "CategoryTwoId" INTEGER NOT NULL,
ADD COLUMN     "Characteristics" TEXT,
ADD COLUMN     "Images" TEXT,
ADD COLUMN     "LabelType" TEXT,
ADD COLUMN     "ModelNumber" VARCHAR(255) NOT NULL,
ADD COLUMN     "ModelNumberTest" VARCHAR(255) NOT NULL,
ADD COLUMN     "OrderId" INTEGER,
ADD COLUMN     "OrderNumber" TEXT NOT NULL,
ADD COLUMN     "PrintLocation" TEXT,
ADD COLUMN     "PrintName" TEXT,
ADD COLUMN     "ProductCatalogId" INTEGER NOT NULL,
ADD COLUMN     "Status" "MainStatus" NOT NULL DEFAULT 'AWAITING',
ADD COLUMN     "TextileId" INTEGER NOT NULL,
ADD COLUMN     "TotalQuantity" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "Status" "Status" DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_OrderId_fkey" FOREIGN KEY ("OrderId") REFERENCES "Orders"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_ProductCatalogId_fkey" FOREIGN KEY ("ProductCatalogId") REFERENCES "ProductCatalogs"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_CategoryOneId_fkey" FOREIGN KEY ("CategoryOneId") REFERENCES "ProductCatalogCategoryOne"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_CategoryTwoId_fkey" FOREIGN KEY ("CategoryTwoId") REFERENCES "ProductCatalogCategoryTwo"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_TextileId_fkey" FOREIGN KEY ("TextileId") REFERENCES "ProductCatalogTextiles"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
