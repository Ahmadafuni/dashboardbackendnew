/*
  Warnings:

  - You are about to drop the column `Collection` on the `Orders` table. All the data in the column will be lost.
  - Added the required column `CollectionId` to the `Orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Quantity` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "Collection",
ADD COLUMN     "CollectionId" INTEGER NOT NULL,
ADD COLUMN     "Quantity" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Collections" (
    "Id" SERIAL NOT NULL,
    "CollectionName" VARCHAR(255) NOT NULL,
    "Description" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Collections_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "Collections" ADD CONSTRAINT "Collections_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_CollectionId_fkey" FOREIGN KEY ("CollectionId") REFERENCES "Collections"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
