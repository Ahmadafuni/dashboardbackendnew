/*
  Warnings:

  - You are about to drop the column `ordersId` on the `OrderDetails` table. All the data in the column will be lost.
  - You are about to drop the column `MainStatus` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `OrderDate` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `Season` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `TotalAmount` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `OrderId` on the `TrakingModels` table. All the data in the column will be lost.
  - Added the required column `Amount` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Collection` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `DeadlineDate` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `OrderName` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderDetails" DROP CONSTRAINT "OrderDetails_ordersId_fkey";

-- DropForeignKey
ALTER TABLE "TrakingModels" DROP CONSTRAINT "TrakingModels_OrderId_fkey";

-- AlterTable
ALTER TABLE "OrderDetails" DROP COLUMN "ordersId";

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "MainStatus",
DROP COLUMN "OrderDate",
DROP COLUMN "Season",
DROP COLUMN "TotalAmount",
ADD COLUMN     "Amount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "Collection" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "DeadlineDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "Description" TEXT,
ADD COLUMN     "FilePath" TEXT,
ADD COLUMN     "OrderName" VARCHAR(256) NOT NULL;

-- AlterTable
ALTER TABLE "TrakingModels" DROP COLUMN "OrderId";
