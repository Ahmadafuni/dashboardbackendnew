-- CreateEnum
CREATE TYPE "CategoryName" AS ENUM ('MANAGEMENT', 'PRODUCTION', 'SERVICES');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FULFILLED', 'CANCELLED', 'COMPLETED', 'ONGOING');

-- CreateEnum
CREATE TYPE "MainStatus" AS ENUM ('AWAITING', 'TODO', 'INPROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('INCOMING', 'OUTGOING', 'TRANSFER', 'RETURN');

-- CreateEnum
CREATE TYPE "TemplateSizeType" AS ENUM ('CUTTING', 'DRESSUP');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUTTING', 'TAILORING', 'PRINTING', 'QUALITYASSURANCE', 'ENGINEERING', 'FACTORYMANAGER', 'WAREHOUSEMANAGER');

-- CreateTable
CREATE TABLE "AuditRecords" (
    "Id" SERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CreatedById" INTEGER NOT NULL,
    "UpdatedById" INTEGER NOT NULL,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AuditRecords_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Colors" (
    "Id" SERIAL NOT NULL,
    "ColorName" VARCHAR(50) NOT NULL,
    "ColorCode" VARCHAR(10) NOT NULL,
    "Description" TEXT NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Colors_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Components" (
    "Id" SERIAL NOT NULL,
    "ComponentName" VARCHAR(255) NOT NULL,
    "Description" TEXT,
    "MaterialId" INTEGER NOT NULL,
    "TemplateId" INTEGER NOT NULL,
    "TemplateSizeId" INTEGER NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "UnitOfMeasure" VARCHAR(255) NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Components_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Departments" (
    "Id" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "ManagerId" INTEGER NOT NULL,
    "Location" VARCHAR(255),
    "Description" TEXT,
    "CategoryName" "CategoryName",
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Departments_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "InternalOrders" (
    "Id" SERIAL NOT NULL,
    "ApprovedAt" TIMESTAMP(3),
    "ApprovedById" INTEGER NOT NULL,
    "DepartmentId" INTEGER NOT NULL,
    "OrderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ExpectedDeliveryDate" TIMESTAMP(3),
    "Priority" "Priority" NOT NULL DEFAULT 'LOW',
    "Status" "Status" NOT NULL DEFAULT 'PENDING',
    "MaterialId" INTEGER NOT NULL,
    "Quantity" DECIMAL(10,2) NOT NULL,
    "Specifics" TEXT,
    "Notes" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "InternalOrders_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ManufacturingStages" (
    "Id" SERIAL NOT NULL,
    "StageNumber" INTEGER NOT NULL,
    "StageName" VARCHAR(255) NOT NULL,
    "WorkDescription" TEXT,
    "Duration" INTEGER NOT NULL,
    "Description" TEXT,
    "TemplateId" INTEGER NOT NULL,
    "DepartmentId" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "ManufacturingStages_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "MaterialCategories" (
    "Id" SERIAL NOT NULL,
    "CategoryName" VARCHAR(255) NOT NULL,
    "Description" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "MaterialCategories_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "MaterialMovements" (
    "Id" SERIAL NOT NULL,
    "CompletedAt" TIMESTAMP(3),
    "InternalOrderId" INTEGER NOT NULL,
    "MaterialId" INTEGER NOT NULL,
    "FromSupplierId" INTEGER,
    "FromDepartmentId" INTEGER,
    "FromWarehouseId" INTEGER,
    "ToDepartmentId" INTEGER,
    "ToWarehouseId" INTEGER,
    "ToSupplierId" INTEGER,
    "MovementType" "MovementType" NOT NULL,
    "Quantity" DECIMAL(10,2) NOT NULL,
    "UnitOfMeasure" VARCHAR(10) NOT NULL,
    "Status" "Status" NOT NULL DEFAULT 'PENDING',
    "Notes" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "MaterialMovements_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Materials" (
    "Id" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Type" VARCHAR(255),
    "Color" VARCHAR(45),
    "CategoryId" INTEGER NOT NULL,
    "SupplierId" INTEGER NOT NULL,
    "Description" TEXT,
    "UnitOfMeasure" VARCHAR(10),
    "Quantity" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Materials_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Measurements" (
    "Id" SERIAL NOT NULL,
    "TemplateSizeId" INTEGER NOT NULL,
    "MeasurementName" VARCHAR(255) NOT NULL,
    "MeasurementValue" VARCHAR(255) NOT NULL,
    "MeasurementUnit" VARCHAR(255) NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Measurements_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Models" (
    "Id" SERIAL NOT NULL,
    "ModelName" VARCHAR(255) NOT NULL,
    "OrderDetailId" INTEGER NOT NULL,
    "ColorId" INTEGER NOT NULL,
    "SizeId" INTEGER NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "QuantityDetails" TEXT NOT NULL,
    "Note" TEXT NOT NULL,
    "ModelImage" TEXT NOT NULL,
    "ordersId" INTEGER,
    "TemplateId" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Models_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "OrderDetailColors" (
    "Id" SERIAL NOT NULL,
    "OrderDetailId" INTEGER NOT NULL,
    "ColorId" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "OrderDetailColors_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "OrderDetails" (
    "Id" SERIAL NOT NULL,
    "QuantityDetails" TEXT,
    "productCatalogDetailsId" INTEGER NOT NULL,
    "ModelQuantity" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,
    "ordersId" INTEGER,

    CONSTRAINT "OrderDetails_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "OrderDetailSizes" (
    "Id" SERIAL NOT NULL,
    "OrderDetailId" INTEGER NOT NULL,
    "SizeId" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "OrderDetailSizes_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "OrderDetailTemplateTypes" (
    "Id" SERIAL NOT NULL,
    "OrderDetailId" INTEGER NOT NULL,
    "TemplateTypeId" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "OrderDetailTemplateTypes_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "Id" SERIAL NOT NULL,
    "OrderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "OrderNumber" VARCHAR(20) NOT NULL,
    "MainStatus" "MainStatus" NOT NULL DEFAULT 'AWAITING',
    "TotalAmount" DECIMAL(10,2) NOT NULL,
    "SeasonId" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProductCatalogCategoryOne" (
    "Id" SERIAL NOT NULL,
    "CategoryName" VARCHAR(255) NOT NULL,
    "CategoryDescription" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "ProductCatalogCategoryOne_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProductCatalogCategoryTwo" (
    "Id" SERIAL NOT NULL,
    "CategoryName" VARCHAR(255) NOT NULL,
    "CategoryDescription" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "ProductCatalogCategoryTwo_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProductCatalogDetails" (
    "Id" SERIAL NOT NULL,
    "ProductCatalogId" INTEGER NOT NULL,
    "CategoryOneId" INTEGER NOT NULL,
    "CategoryTwoId" INTEGER NOT NULL,
    "SeasonId" INTEGER NOT NULL,
    "TextileId" INTEGER NOT NULL,
    "TemplateTypeId" INTEGER NOT NULL,
    "StandardWeight" DECIMAL(10,2) NOT NULL,
    "Grammage" DECIMAL(10,2) NOT NULL,
    "Description" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "ProductCatalogDetails_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProductCatalogs" (
    "Id" SERIAL NOT NULL,
    "ProductCatalogName" VARCHAR(255) NOT NULL,
    "ProductCatalogDescription" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "ProductCatalogs_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProductCatalogTextiles" (
    "Id" SERIAL NOT NULL,
    "TextileName" VARCHAR(255) NOT NULL,
    "TextileType" VARCHAR(255) NOT NULL,
    "Composition" VARCHAR(255) NOT NULL,
    "Description" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "ProductCatalogTextiles_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Seasons" (
    "Id" SERIAL NOT NULL,
    "SeasonName" VARCHAR(255) NOT NULL,
    "StartDate" DATE NOT NULL,
    "EndDate" DATE NOT NULL,
    "Description" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Seasons_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Sizes" (
    "Id" SERIAL NOT NULL,
    "SizeName" VARCHAR(255) NOT NULL,
    "Description" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Sizes_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Suppliers" (
    "Id" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "Address" TEXT,
    "PhoneNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Tasks" (
    "Id" SERIAL NOT NULL,
    "TaskName" VARCHAR(255) NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "DueAt" TIMESTAMP(3) NOT NULL,
    "Status" "Status" NOT NULL DEFAULT 'PENDING',
    "Priority" "Priority" NOT NULL DEFAULT 'LOW',
    "AssignedToDepartmentId" INTEGER NOT NULL,
    "Notes" VARCHAR(255) NOT NULL,
    "CreatedByDepartmentId" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Tasks_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "TemplatePatterns" (
    "Id" SERIAL NOT NULL,
    "TemplatePatternName" VARCHAR(255) NOT NULL,
    "Description" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "TemplatePatterns_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Templates" (
    "Id" SERIAL NOT NULL,
    "ProductCatalogDetailId" INTEGER NOT NULL,
    "TemplateName" VARCHAR(255) NOT NULL,
    "Description" TEXT,
    "FilePath" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Templates_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "TemplateSizes" (
    "Id" SERIAL NOT NULL,
    "SizeId" INTEGER NOT NULL,
    "TemplateId" INTEGER NOT NULL,
    "Description" TEXT,
    "TemplateSizeType" "TemplateSizeType",
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "TemplateSizes_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "TemplateTypes" (
    "Id" SERIAL NOT NULL,
    "TemplateTypeName" VARCHAR(255) NOT NULL,
    "Description" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "TemplateTypes_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "TrakingModels" (
    "Id" SERIAL NOT NULL,
    "DepartmentId" INTEGER NOT NULL,
    "ModelId" INTEGER NOT NULL,
    "OrderId" INTEGER NOT NULL,
    "StartTime" TIMESTAMP(3) NOT NULL,
    "EndTime" TIMESTAMP(3),
    "MainStatus" "MainStatus" NOT NULL DEFAULT 'AWAITING',
    "QuantityReceived" INTEGER NOT NULL,
    "ReceivedFromId" INTEGER NOT NULL,
    "DamagedItem" INTEGER NOT NULL DEFAULT 0,
    "ReplacedItem" INTEGER NOT NULL DEFAULT 0,
    "QuantityDelivered" INTEGER NOT NULL,
    "DeliveredToId" INTEGER NOT NULL,
    "Notes" TEXT,

    CONSTRAINT "TrakingModels_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Users" (
    "Id" SERIAL NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT false,
    "Role" "Role" NOT NULL,
    "Username" VARCHAR(255) NOT NULL,
    "Email" VARCHAR(255) NOT NULL,
    "Firstname" VARCHAR(255) NOT NULL,
    "Lastname" VARCHAR(255) NOT NULL,
    "DOB" DATE NOT NULL,
    "PhotoPath" TEXT,
    "Category" "CategoryName",
    "PasswordHash" TEXT NOT NULL,
    "HashedRefreshToken" TEXT,
    "PhoneNumber" VARCHAR(50) NOT NULL,
    "LastLogin" TIMESTAMP(3),
    "AuditId" INTEGER,
    "DepartmentId" INTEGER,
    "WarehouseId" INTEGER,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Warehouses" (
    "Id" SERIAL NOT NULL,
    "WarehouseName" VARCHAR(255) NOT NULL,
    "CategoryName" "CategoryName",
    "Location" VARCHAR(255) NOT NULL,
    "Capacity" DECIMAL(10,2) NOT NULL,
    "ManagerId" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Warehouses_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Colors_AuditId_key" ON "Colors"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Components_AuditId_key" ON "Components"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Departments_ManagerId_key" ON "Departments"("ManagerId");

-- CreateIndex
CREATE UNIQUE INDEX "Departments_AuditId_key" ON "Departments"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "InternalOrders_AuditId_key" ON "InternalOrders"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "ManufacturingStages_AuditId_key" ON "ManufacturingStages"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialCategories_AuditId_key" ON "MaterialCategories"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialMovements_AuditId_key" ON "MaterialMovements"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Materials_AuditId_key" ON "Materials"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Models_TemplateId_key" ON "Models"("TemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderDetailColors_AuditId_key" ON "OrderDetailColors"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderDetails_AuditId_key" ON "OrderDetails"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderDetailSizes_AuditId_key" ON "OrderDetailSizes"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderDetailTemplateTypes_AuditId_key" ON "OrderDetailTemplateTypes"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_OrderNumber_key" ON "Orders"("OrderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Orders_AuditId_key" ON "Orders"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCatalogCategoryOne_AuditId_key" ON "ProductCatalogCategoryOne"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCatalogCategoryTwo_AuditId_key" ON "ProductCatalogCategoryTwo"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCatalogDetails_AuditId_key" ON "ProductCatalogDetails"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCatalogs_AuditId_key" ON "ProductCatalogs"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCatalogTextiles_AuditId_key" ON "ProductCatalogTextiles"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Seasons_AuditId_key" ON "Seasons"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Sizes_AuditId_key" ON "Sizes"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Suppliers_AuditId_key" ON "Suppliers"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Tasks_AuditId_key" ON "Tasks"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplatePatterns_AuditId_key" ON "TemplatePatterns"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Templates_AuditId_key" ON "Templates"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateSizes_AuditId_key" ON "TemplateSizes"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateTypes_AuditId_key" ON "TemplateTypes"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_Username_key" ON "Users"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_Email_key" ON "Users"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_PhoneNumber_key" ON "Users"("PhoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Users_AuditId_key" ON "Users"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_WarehouseId_key" ON "Users"("WarehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouses_ManagerId_key" ON "Warehouses"("ManagerId");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouses_AuditId_key" ON "Warehouses"("AuditId");

-- AddForeignKey
ALTER TABLE "AuditRecords" ADD CONSTRAINT "AuditRecords_CreatedById_fkey" FOREIGN KEY ("CreatedById") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecords" ADD CONSTRAINT "AuditRecords_UpdatedById_fkey" FOREIGN KEY ("UpdatedById") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colors" ADD CONSTRAINT "Colors_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Components" ADD CONSTRAINT "Components_MaterialId_fkey" FOREIGN KEY ("MaterialId") REFERENCES "Materials"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Components" ADD CONSTRAINT "Components_TemplateId_fkey" FOREIGN KEY ("TemplateId") REFERENCES "Templates"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Components" ADD CONSTRAINT "Components_TemplateSizeId_fkey" FOREIGN KEY ("TemplateSizeId") REFERENCES "TemplateSizes"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Components" ADD CONSTRAINT "Components_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departments" ADD CONSTRAINT "Departments_ManagerId_fkey" FOREIGN KEY ("ManagerId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departments" ADD CONSTRAINT "Departments_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalOrders" ADD CONSTRAINT "InternalOrders_ApprovedById_fkey" FOREIGN KEY ("ApprovedById") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalOrders" ADD CONSTRAINT "InternalOrders_DepartmentId_fkey" FOREIGN KEY ("DepartmentId") REFERENCES "Departments"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalOrders" ADD CONSTRAINT "InternalOrders_MaterialId_fkey" FOREIGN KEY ("MaterialId") REFERENCES "Materials"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalOrders" ADD CONSTRAINT "InternalOrders_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturingStages" ADD CONSTRAINT "ManufacturingStages_TemplateId_fkey" FOREIGN KEY ("TemplateId") REFERENCES "Templates"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturingStages" ADD CONSTRAINT "ManufacturingStages_DepartmentId_fkey" FOREIGN KEY ("DepartmentId") REFERENCES "Departments"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturingStages" ADD CONSTRAINT "ManufacturingStages_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialCategories" ADD CONSTRAINT "MaterialCategories_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovements" ADD CONSTRAINT "MaterialMovements_InternalOrderId_fkey" FOREIGN KEY ("InternalOrderId") REFERENCES "InternalOrders"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovements" ADD CONSTRAINT "MaterialMovements_MaterialId_fkey" FOREIGN KEY ("MaterialId") REFERENCES "Materials"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovements" ADD CONSTRAINT "MaterialMovements_FromSupplierId_fkey" FOREIGN KEY ("FromSupplierId") REFERENCES "Suppliers"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovements" ADD CONSTRAINT "MaterialMovements_FromDepartmentId_fkey" FOREIGN KEY ("FromDepartmentId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovements" ADD CONSTRAINT "MaterialMovements_FromWarehouseId_fkey" FOREIGN KEY ("FromWarehouseId") REFERENCES "Warehouses"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovements" ADD CONSTRAINT "MaterialMovements_ToDepartmentId_fkey" FOREIGN KEY ("ToDepartmentId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovements" ADD CONSTRAINT "MaterialMovements_ToWarehouseId_fkey" FOREIGN KEY ("ToWarehouseId") REFERENCES "Warehouses"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovements" ADD CONSTRAINT "MaterialMovements_ToSupplierId_fkey" FOREIGN KEY ("ToSupplierId") REFERENCES "Suppliers"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovements" ADD CONSTRAINT "MaterialMovements_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materials" ADD CONSTRAINT "Materials_CategoryId_fkey" FOREIGN KEY ("CategoryId") REFERENCES "MaterialCategories"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materials" ADD CONSTRAINT "Materials_SupplierId_fkey" FOREIGN KEY ("SupplierId") REFERENCES "Suppliers"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Materials" ADD CONSTRAINT "Materials_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurements" ADD CONSTRAINT "Measurements_TemplateSizeId_fkey" FOREIGN KEY ("TemplateSizeId") REFERENCES "TemplateSizes"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurements" ADD CONSTRAINT "Measurements_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_OrderDetailId_fkey" FOREIGN KEY ("OrderDetailId") REFERENCES "OrderDetails"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_ColorId_fkey" FOREIGN KEY ("ColorId") REFERENCES "Colors"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_SizeId_fkey" FOREIGN KEY ("SizeId") REFERENCES "Sizes"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_ordersId_fkey" FOREIGN KEY ("ordersId") REFERENCES "Orders"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_TemplateId_fkey" FOREIGN KEY ("TemplateId") REFERENCES "Templates"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetailColors" ADD CONSTRAINT "OrderDetailColors_OrderDetailId_fkey" FOREIGN KEY ("OrderDetailId") REFERENCES "OrderDetails"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetailColors" ADD CONSTRAINT "OrderDetailColors_ColorId_fkey" FOREIGN KEY ("ColorId") REFERENCES "Colors"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetailColors" ADD CONSTRAINT "OrderDetailColors_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetails" ADD CONSTRAINT "OrderDetails_productCatalogDetailsId_fkey" FOREIGN KEY ("productCatalogDetailsId") REFERENCES "ProductCatalogDetails"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetails" ADD CONSTRAINT "OrderDetails_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetails" ADD CONSTRAINT "OrderDetails_ordersId_fkey" FOREIGN KEY ("ordersId") REFERENCES "Orders"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetailSizes" ADD CONSTRAINT "OrderDetailSizes_OrderDetailId_fkey" FOREIGN KEY ("OrderDetailId") REFERENCES "OrderDetails"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetailSizes" ADD CONSTRAINT "OrderDetailSizes_SizeId_fkey" FOREIGN KEY ("SizeId") REFERENCES "Sizes"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetailSizes" ADD CONSTRAINT "OrderDetailSizes_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetailTemplateTypes" ADD CONSTRAINT "OrderDetailTemplateTypes_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_SeasonId_fkey" FOREIGN KEY ("SeasonId") REFERENCES "Seasons"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogCategoryOne" ADD CONSTRAINT "ProductCatalogCategoryOne_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogCategoryTwo" ADD CONSTRAINT "ProductCatalogCategoryTwo_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogDetails" ADD CONSTRAINT "ProductCatalogDetails_ProductCatalogId_fkey" FOREIGN KEY ("ProductCatalogId") REFERENCES "ProductCatalogs"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogDetails" ADD CONSTRAINT "ProductCatalogDetails_CategoryOneId_fkey" FOREIGN KEY ("CategoryOneId") REFERENCES "ProductCatalogCategoryOne"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogDetails" ADD CONSTRAINT "ProductCatalogDetails_CategoryTwoId_fkey" FOREIGN KEY ("CategoryTwoId") REFERENCES "ProductCatalogCategoryTwo"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogDetails" ADD CONSTRAINT "ProductCatalogDetails_SeasonId_fkey" FOREIGN KEY ("SeasonId") REFERENCES "Seasons"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogDetails" ADD CONSTRAINT "ProductCatalogDetails_TextileId_fkey" FOREIGN KEY ("TextileId") REFERENCES "ProductCatalogTextiles"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogDetails" ADD CONSTRAINT "ProductCatalogDetails_TemplateTypeId_fkey" FOREIGN KEY ("TemplateTypeId") REFERENCES "TemplateTypes"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogDetails" ADD CONSTRAINT "ProductCatalogDetails_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogs" ADD CONSTRAINT "ProductCatalogs_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogTextiles" ADD CONSTRAINT "ProductCatalogTextiles_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seasons" ADD CONSTRAINT "Seasons_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sizes" ADD CONSTRAINT "Sizes_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suppliers" ADD CONSTRAINT "Suppliers_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_AssignedToDepartmentId_fkey" FOREIGN KEY ("AssignedToDepartmentId") REFERENCES "Departments"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_CreatedByDepartmentId_fkey" FOREIGN KEY ("CreatedByDepartmentId") REFERENCES "Departments"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePatterns" ADD CONSTRAINT "TemplatePatterns_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_ProductCatalogDetailId_fkey" FOREIGN KEY ("ProductCatalogDetailId") REFERENCES "ProductCatalogDetails"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSizes" ADD CONSTRAINT "TemplateSizes_SizeId_fkey" FOREIGN KEY ("SizeId") REFERENCES "Sizes"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSizes" ADD CONSTRAINT "TemplateSizes_TemplateId_fkey" FOREIGN KEY ("TemplateId") REFERENCES "Templates"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSizes" ADD CONSTRAINT "TemplateSizes_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateTypes" ADD CONSTRAINT "TemplateTypes_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_DepartmentId_fkey" FOREIGN KEY ("DepartmentId") REFERENCES "Departments"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_ModelId_fkey" FOREIGN KEY ("ModelId") REFERENCES "Models"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_OrderId_fkey" FOREIGN KEY ("OrderId") REFERENCES "Orders"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_ReceivedFromId_fkey" FOREIGN KEY ("ReceivedFromId") REFERENCES "Departments"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_DeliveredToId_fkey" FOREIGN KEY ("DeliveredToId") REFERENCES "Departments"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouses" ADD CONSTRAINT "Warehouses_ManagerId_fkey" FOREIGN KEY ("ManagerId") REFERENCES "Users"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouses" ADD CONSTRAINT "Warehouses_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
