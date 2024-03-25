/*
  Warnings:

  - You are about to drop the `Components` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Components" DROP CONSTRAINT "Components_AuditId_fkey";

-- DropForeignKey
ALTER TABLE "Components" DROP CONSTRAINT "Components_MaterialId_fkey";

-- DropForeignKey
ALTER TABLE "Components" DROP CONSTRAINT "Components_TemplateId_fkey";

-- DropForeignKey
ALTER TABLE "Components" DROP CONSTRAINT "Components_TemplateSizeId_fkey";

-- DropTable
DROP TABLE "Components";
