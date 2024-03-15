-- DropForeignKey
ALTER TABLE "Tasks" DROP CONSTRAINT "Tasks_CreatedByDepartmentId_fkey";

-- AlterTable
ALTER TABLE "Tasks" ADD COLUMN     "CreatedByManagerId" INTEGER,
ALTER COLUMN "CreatedByDepartmentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_CreatedByDepartmentId_fkey" FOREIGN KEY ("CreatedByDepartmentId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_CreatedByManagerId_fkey" FOREIGN KEY ("CreatedByManagerId") REFERENCES "Users"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
