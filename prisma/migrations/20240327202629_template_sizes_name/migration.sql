/*
  Warnings:

  - Added the required column `Name` to the `TemplateSizes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TemplateSizes" ADD COLUMN     "Name" VARCHAR(255) NOT NULL;
