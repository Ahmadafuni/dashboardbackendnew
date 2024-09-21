/*
  Warnings:

  - You are about to drop the column `Status` on the `Collections` table. All the data in the column will be lost.
  - You are about to drop the column `ReasonText` on the `ModelVarients` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `ModelVarients` table. All the data in the column will be lost.
  - The `RunningStatus` column on the `ModelVarients` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `ReasonText` on the `Models` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `Models` table. All the data in the column will be lost.
  - The `RunningStatus` column on the `Models` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `ReasonText` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `Status` on the `Orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChildMaterials" ADD COLUMN     "ColorId" INTEGER;

-- AlterTable
ALTER TABLE "Collections" DROP COLUMN "Status",
ADD COLUMN     "RunningStatus" "Status" DEFAULT 'PENDING',
ADD COLUMN     "StopData" TEXT;

-- AlterTable
ALTER TABLE "ModelVarients" DROP COLUMN "ReasonText",
DROP COLUMN "Status",
ADD COLUMN     "MainStatus" "MainStatus" NOT NULL DEFAULT 'AWAITING',
ADD COLUMN     "StopData" TEXT,
DROP COLUMN "RunningStatus",
ADD COLUMN     "RunningStatus" "Status" DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Models" DROP COLUMN "ReasonText",
DROP COLUMN "Status",
ADD COLUMN     "StopData" TEXT,
DROP COLUMN "RunningStatus",
ADD COLUMN     "RunningStatus" "Status" DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "ReasonText",
DROP COLUMN "Status",
ADD COLUMN     "RunningStatus" "Status" DEFAULT 'PENDING',
ADD COLUMN     "StopData" TEXT;

-- AlterTable
ALTER TABLE "ParentMaterials" ADD COLUMN     "ColorId" INTEGER;

-- AlterTable
ALTER TABLE "TrakingModels" ADD COLUMN     "RunningStatus" "Status" DEFAULT 'PENDING',
ADD COLUMN     "StopData" TEXT;

-- DropEnum
DROP TYPE "RunningStatus";

-- AddForeignKey
ALTER TABLE "ParentMaterials" ADD CONSTRAINT "ParentMaterials_ColorId_fkey" FOREIGN KEY ("ColorId") REFERENCES "Colors"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildMaterials" ADD CONSTRAINT "ChildMaterials_ColorId_fkey" FOREIGN KEY ("ColorId") REFERENCES "Colors"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
