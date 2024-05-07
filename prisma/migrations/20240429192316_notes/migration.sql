/*
  Warnings:

  - A unique constraint covering the columns `[AuditId]` on the table `Collections` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[AuditId]` on the table `Measurements` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[AuditId]` on the table `ModelVarients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[AuditId]` on the table `Models` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('GENERAL', 'REMINDER', 'ATTENTION');

-- CreateTable
CREATE TABLE "Notes" (
    "Id" SERIAL NOT NULL,
    "NoteType" "NoteType" NOT NULL DEFAULT 'GENERAL',
    "AssignedToDepartmentId" INTEGER,
    "Description" TEXT NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Notes_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Notes_AuditId_key" ON "Notes"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Collections_AuditId_key" ON "Collections"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Measurements_AuditId_key" ON "Measurements"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "ModelVarients_AuditId_key" ON "ModelVarients"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Models_AuditId_key" ON "Models"("AuditId");

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_AssignedToDepartmentId_fkey" FOREIGN KEY ("AssignedToDepartmentId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
