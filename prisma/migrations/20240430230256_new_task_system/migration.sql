/*
  Warnings:

  - You are about to drop the column `CreatedAt` on the `Tasks` table. All the data in the column will be lost.
  - You are about to drop the column `CreatedByManagerId` on the `Tasks` table. All the data in the column will be lost.
  - You are about to drop the column `Notes` on the `Tasks` table. All the data in the column will be lost.
  - You are about to drop the column `Priority` on the `Tasks` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tasks" DROP CONSTRAINT "Tasks_AssignedToDepartmentId_fkey";

-- DropForeignKey
ALTER TABLE "Tasks" DROP CONSTRAINT "Tasks_CreatedByManagerId_fkey";

-- AlterTable
ALTER TABLE "Tasks" DROP COLUMN "CreatedAt",
DROP COLUMN "CreatedByManagerId",
DROP COLUMN "Notes",
DROP COLUMN "Priority",
ADD COLUMN     "AssignedFile" TEXT,
ADD COLUMN     "Description" TEXT,
ADD COLUMN     "Feedback" TEXT,
ADD COLUMN     "FeedbackFile" TEXT,
ALTER COLUMN "AssignedToDepartmentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_AssignedToDepartmentId_fkey" FOREIGN KEY ("AssignedToDepartmentId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
