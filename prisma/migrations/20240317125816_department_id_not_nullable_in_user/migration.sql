/*
  Warnings:

  - Made the column `DepartmentId` on table `Users` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_DepartmentId_fkey";

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "DepartmentId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_DepartmentId_fkey" FOREIGN KEY ("DepartmentId") REFERENCES "Departments"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
