-- AlterTable
ALTER TABLE "Collections" ADD COLUMN     "EndTime" TIMESTAMP(3),
ADD COLUMN     "StartTime" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Models" ADD COLUMN     "EndTime" TIMESTAMP(3),
ADD COLUMN     "StartTime" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "EndTime" TIMESTAMP(3),
ADD COLUMN     "StartTime" TIMESTAMP(3);
