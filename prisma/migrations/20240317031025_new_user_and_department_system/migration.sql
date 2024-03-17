/*
  Warnings:

  - You are about to drop the column `CategoryName` on the `Departments` table. All the data in the column will be lost.
  - You are about to drop the column `ManagerId` on the `Departments` table. All the data in the column will be lost.
  - You are about to drop the column `Category` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `DOB` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `HashedRefreshToken` on the `Users` table. All the data in the column will be lost.
  - You are about to drop the column `Role` on the `Users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[Name]` on the table `Departments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[NameShort]` on the table `Departments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `Category` to the `Departments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `NameShort` to the `Departments` table without a default value. This is not possible if the table is not empty.
  - Made the column `AuditId` on table `Users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "DepartmentCategory" AS ENUM ('CUTTING', 'TAILORING', 'PRINTING', 'QUALITYASSURANCE', 'ENGINEERING', 'FACTORYMANAGER', 'WAREHOUSEMANAGER');

-- DropForeignKey
ALTER TABLE "AuditRecords" DROP CONSTRAINT "AuditRecords_CreatedById_fkey";

-- DropForeignKey
ALTER TABLE "AuditRecords" DROP CONSTRAINT "AuditRecords_UpdatedById_fkey";

-- DropForeignKey
ALTER TABLE "Departments" DROP CONSTRAINT "Departments_ManagerId_fkey";

-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_AuditId_fkey";

-- DropIndex
DROP INDEX "Departments_ManagerId_key";

-- AlterTable
ALTER TABLE "AuditRecords" ALTER COLUMN "CreatedById" DROP NOT NULL,
ALTER COLUMN "UpdatedById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Departments" DROP COLUMN "CategoryName",
DROP COLUMN "ManagerId",
ADD COLUMN     "Category" "DepartmentCategory" NOT NULL,
ADD COLUMN     "NameShort" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "Category",
DROP COLUMN "DOB",
DROP COLUMN "HashedRefreshToken",
DROP COLUMN "Role",
ALTER COLUMN "AuditId" SET NOT NULL;

-- DropEnum
DROP TYPE "Role";

-- CreateIndex
CREATE UNIQUE INDEX "Departments_Name_key" ON "Departments"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "Departments_NameShort_key" ON "Departments"("NameShort");

-- AddForeignKey
ALTER TABLE "AuditRecords" ADD CONSTRAINT "AuditRecords_CreatedById_fkey" FOREIGN KEY ("CreatedById") REFERENCES "Users"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecords" ADD CONSTRAINT "AuditRecords_UpdatedById_fkey" FOREIGN KEY ("UpdatedById") REFERENCES "Users"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_DepartmentId_fkey" FOREIGN KEY ("DepartmentId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
