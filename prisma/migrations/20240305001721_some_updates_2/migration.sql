-- DropForeignKey
ALTER TABLE "TrakingModels" DROP CONSTRAINT "TrakingModels_DeliveredToId_fkey";

-- DropForeignKey
ALTER TABLE "TrakingModels" DROP CONSTRAINT "TrakingModels_ReceivedFromId_fkey";

-- AlterTable
ALTER TABLE "TrakingModels" ALTER COLUMN "QuantityReceived" DROP NOT NULL,
ALTER COLUMN "ReceivedFromId" DROP NOT NULL,
ALTER COLUMN "DamagedItem" DROP NOT NULL,
ALTER COLUMN "ReplacedItem" DROP NOT NULL,
ALTER COLUMN "QuantityDelivered" DROP NOT NULL,
ALTER COLUMN "DeliveredToId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_ReceivedFromId_fkey" FOREIGN KEY ("ReceivedFromId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_DeliveredToId_fkey" FOREIGN KEY ("DeliveredToId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;
