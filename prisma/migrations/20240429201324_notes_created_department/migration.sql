-- AlterTable
ALTER TABLE "Notes" ADD COLUMN     "CreatedDepartmentId" INTEGER;

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_CreatedDepartmentId_fkey" FOREIGN KEY ("CreatedDepartmentId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
