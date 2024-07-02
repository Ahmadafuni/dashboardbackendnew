/*
  Warnings:

  - You are about to drop the column `email` on the `Suppliers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Suppliers" DROP COLUMN "email",
ADD COLUMN     "Description" TEXT;
