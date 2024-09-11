/*
  Warnings:

  - Made the column `IsArchived` on table `Collections` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Collections" ALTER COLUMN "IsArchived" SET NOT NULL;
