-- DropForeignKey
ALTER TABLE "MaterialMovements" DROP CONSTRAINT "MaterialMovements_FromWarehouseId_fkey";

-- DropForeignKey
ALTER TABLE "MaterialMovements" DROP CONSTRAINT "MaterialMovements_ToWarehouseId_fkey";

-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_WarehouseId_fkey";

-- AlterTable
ALTER TABLE "Warehouses" ALTER COLUMN "Capacity" SET DATA TYPE TEXT;
