/*
  Warnings:

  - You are about to drop the column `description` on the `Models` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Models" DROP COLUMN "description",
ADD COLUMN     "Description" TEXT;
