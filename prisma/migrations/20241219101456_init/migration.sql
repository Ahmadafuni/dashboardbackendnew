-- CreateEnum
CREATE TYPE "CategoryName" AS ENUM ('MANAGEMENT', 'PRODUCTION', 'SERVICES');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'COMPLETED', 'ONGOING', 'ONHOLD');

-- CreateEnum
CREATE TYPE "MainStatus" AS ENUM ('AWAITING', 'TODO', 'INPROGRESS', 'DONE', 'CHECKING');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('INCOMING', 'OUTGOING', 'TRANSFER', 'RETURN');

-- CreateEnum
CREATE TYPE "TemplateSizeType" AS ENUM ('CUTTING', 'DRESSUP');

-- CreateEnum
CREATE TYPE "DepartmentCategory" AS ENUM ('CUTTING', 'DRAWING', 'ENGINEERING', 'FACTORYMANAGER', 'PRINTING', 'QUALITYASSURANCE', 'TAILORING', 'WAREHOUSEMANAGER', 'HumanResource', 'MotherCompany', 'Accounting');

-- CreateEnum
CREATE TYPE "Season" AS ENUM ('SUMMER', 'FALL', 'WINTER', 'SPRING');

-- CreateEnum
CREATE TYPE "NoteType" AS ENUM ('GENERAL', 'REMINDER', 'ATTENTION');

-- CreateTable
CREATE TABLE "AuditRecords" (
    "Id" SERIAL NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP(3) NOT NULL,
    "CreatedById" INTEGER,
    "UpdatedById" INTEGER,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AuditRecords_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Collections" (
    "Id" SERIAL NOT NULL,
    "CollectionName" VARCHAR(255) NOT NULL,
    "Description" TEXT,
    "IsArchived" BOOLEAN NOT NULL DEFAULT false,
    "AuditId" INTEGER NOT NULL,
    "RunningStatus" "Status" DEFAULT 'PENDING',
    "StopData" JSONB,
    "StartTime" TIMESTAMP(3),
    "EndTime" TIMESTAMP(3),

    CONSTRAINT "Collections_pkey" PRIMARY KEY ("Id")
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
CREATE TABLE "Departments" (
    "Id" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "NameShort" VARCHAR(255) NOT NULL,
    "Location" VARCHAR(255),
    "Description" TEXT,
    "Category" "DepartmentCategory" NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Departments_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ManufacturingStages" (
    "Id" SERIAL NOT NULL,
    "StageNumber" INTEGER NOT NULL,
    "StageName" VARCHAR(255) NOT NULL,
    "WorkDescription" TEXT,
    "Duration" INTEGER NOT NULL,
    "TemplateId" INTEGER NOT NULL,
    "DepartmentId" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "ManufacturingStages_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ManufacturingStagesModel" (
    "Id" SERIAL NOT NULL,
    "StageNumber" INTEGER NOT NULL,
    "StageName" VARCHAR(255) NOT NULL,
    "WorkDescription" TEXT,
    "Duration" INTEGER NOT NULL,
    "ModelId" INTEGER NOT NULL,
    "DepartmentId" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "ManufacturingStagesModel_pkey" PRIMARY KEY ("Id")
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
CREATE TABLE "ParentMaterials" (
    "Id" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "CategoryId" INTEGER NOT NULL,
    "Description" TEXT,
    "UnitOfMeasure" VARCHAR(10),
    "UsageLocation" TEXT,
    "AlternativeMaterials" TEXT,
    "MinimumLimit" DECIMAL(65,30) DEFAULT 0.0,
    "IsRelevantToProduction" BOOLEAN NOT NULL DEFAULT false,
    "HasChildren" BOOLEAN NOT NULL DEFAULT false,
    "AuditId" INTEGER NOT NULL,
    "ColorId" INTEGER,

    CONSTRAINT "ParentMaterials_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ChildMaterials" (
    "Id" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
    "ParentMaterialId" INTEGER NOT NULL,
    "DyeNumber" TEXT,
    "Kashan" TEXT,
    "Halil" TEXT,
    "Phthalate" TEXT,
    "GramWeight" DECIMAL(65,30) DEFAULT 0.0,
    "Description" TEXT,
    "AuditId" INTEGER NOT NULL,
    "ColorId" INTEGER,

    CONSTRAINT "ChildMaterials_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "MaterialMovement" (
    "Id" SERIAL NOT NULL,
    "InvoiceNumber" TEXT,
    "MovementType" "MovementType" NOT NULL,
    "ParentMaterialId" INTEGER NOT NULL,
    "ChildMaterialId" INTEGER,
    "Quantity" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "UnitOfQuantity" TEXT NOT NULL,
    "Description" TEXT,
    "MovementDate" TIMESTAMP(3) NOT NULL,
    "WarehouseFromId" INTEGER,
    "WarehouseToId" INTEGER,
    "SupplierId" INTEGER,
    "DepartmentFromId" INTEGER,
    "DepartmentToId" INTEGER,
    "ModelId" INTEGER,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "MaterialMovement_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Measurements" (
    "Id" SERIAL NOT NULL,
    "TemplateSizeId" INTEGER NOT NULL,
    "MeasurementName" VARCHAR(255) NOT NULL,
    "MeasurementValue" VARCHAR(255) NOT NULL,
    "MeasurementUnit" VARCHAR(255) NOT NULL,
    "SizeId" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Measurements_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Models" (
    "Id" SERIAL NOT NULL,
    "OrderId" INTEGER,
    "OrderNumber" TEXT NOT NULL,
    "ProductCatalogId" INTEGER NOT NULL,
    "CategoryOneId" INTEGER NOT NULL,
    "CategoryTwoId" INTEGER NOT NULL,
    "TextileId" INTEGER NOT NULL,
    "TemplateId" INTEGER NOT NULL,
    "ModelName" VARCHAR(255) NOT NULL,
    "ModelNumber" VARCHAR(255) NOT NULL,
    "DemoModelNumber" VARCHAR(255),
    "Characteristics" TEXT,
    "Barcode" TEXT,
    "LabelType" TEXT,
    "PrintName" TEXT,
    "PrintLocation" TEXT,
    "Description" TEXT,
    "RunningStatus" "Status" DEFAULT 'PENDING',
    "StopData" JSONB,
    "StartTime" TIMESTAMP(3),
    "EndTime" TIMESTAMP(3),
    "Images" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Models_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ModelVarients" (
    "Id" SERIAL NOT NULL,
    "ModelId" INTEGER NOT NULL,
    "MainStatus" "MainStatus" NOT NULL DEFAULT 'AWAITING',
    "RunningStatus" "Status" DEFAULT 'PENDING',
    "StopData" JSONB,
    "ColorId" INTEGER NOT NULL,
    "Sizes" JSONB,
    "Quantity" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "ModelVarients_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Notes" (
    "Id" SERIAL NOT NULL,
    "NoteType" "NoteType" NOT NULL DEFAULT 'GENERAL',
    "CreatedDepartmentId" INTEGER,
    "AssignedToDepartmentId" INTEGER,
    "Description" TEXT NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Notes_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Notifications" (
    "Id" SERIAL NOT NULL,
    "Title" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "URL" TEXT,
    "IsSeen" BOOLEAN NOT NULL DEFAULT false,
    "ToDepartmentId" INTEGER NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("Id")
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
    "OrderName" VARCHAR(256) NOT NULL,
    "OrderNumber" VARCHAR(20) NOT NULL,
    "DeadlineDate" TIMESTAMP(3) NOT NULL,
    "CollectionId" INTEGER NOT NULL,
    "Quantity" INTEGER NOT NULL,
    "RunningStatus" "Status" DEFAULT 'PENDING',
    "StopData" JSONB,
    "StartTime" TIMESTAMP(3),
    "EndTime" TIMESTAMP(3),
    "Description" TEXT,
    "FilePath" TEXT,
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
    "Season" "Season" NOT NULL,
    "TextileId" INTEGER NOT NULL,
    "TemplateTypeId" INTEGER NOT NULL,
    "TemplatePatternId" INTEGER NOT NULL,
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
    "Description" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Suppliers_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Tasks" (
    "Id" SERIAL NOT NULL,
    "TaskName" VARCHAR(255) NOT NULL,
    "DueAt" TIMESTAMP(3) NOT NULL,
    "Status" "Status" NOT NULL DEFAULT 'PENDING',
    "Description" TEXT,
    "Feedback" TEXT,
    "AssignedFile" TEXT,
    "FeedbackFile" TEXT,
    "StartTime" TIMESTAMP(3),
    "EndTime" TIMESTAMP(3),
    "AssignedToDepartmentId" INTEGER,
    "CreatedByDepartmentId" INTEGER,
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
    "TemplateName" VARCHAR(255) NOT NULL,
    "ProductCatalogId" INTEGER NOT NULL,
    "CategoryOneId" INTEGER NOT NULL,
    "CategoryTwoId" INTEGER NOT NULL,
    "TemplatePatternId" INTEGER NOT NULL,
    "TemplateTypeId" INTEGER NOT NULL,
    "Season" "Season" NOT NULL,
    "Description" TEXT,
    "FilePath" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Templates_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "TemplateSizes" (
    "Id" SERIAL NOT NULL,
    "Name" VARCHAR(255) NOT NULL,
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
    "ModelVariantId" INTEGER NOT NULL,
    "PrevStageId" INTEGER,
    "CurrentStageId" INTEGER NOT NULL,
    "NextStageId" INTEGER,
    "StartTime" TIMESTAMP(3),
    "EndTime" TIMESTAMP(3),
    "MainStatus" "MainStatus" NOT NULL DEFAULT 'AWAITING',
    "RunningStatus" "Status" DEFAULT 'PENDING',
    "StopData" JSONB,
    "QuantityReceived" JSONB,
    "QuantityDelivered" JSONB,
    "DamagedItem" JSONB,
    "ReplacedItemInKG" TEXT,
    "CuttingName" TEXT,
    "ClothCount" TEXT,
    "QuantityInKg" TEXT,
    "ClothLength" TEXT,
    "ClothWidth" TEXT,
    "ClothWeight" TEXT,
    "QuantityInNum" JSONB,
    "AdditonalInfo1" TEXT,
    "AdditonalInfo2" TEXT,
    "AdditonalInfo3" TEXT,
    "AdditonalInfo4" TEXT,
    "Notes" TEXT,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "TrakingModels_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Users" (
    "Id" SERIAL NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT false,
    "Username" VARCHAR(255) NOT NULL,
    "Email" VARCHAR(255) NOT NULL,
    "Firstname" VARCHAR(255) NOT NULL,
    "Lastname" VARCHAR(255) NOT NULL,
    "PhotoPath" TEXT,
    "PasswordHash" TEXT NOT NULL,
    "PhoneNumber" VARCHAR(50) NOT NULL,
    "LastLogin" TIMESTAMP(3),
    "DepartmentId" INTEGER,
    "WarehouseId" INTEGER,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Warehouses" (
    "Id" SERIAL NOT NULL,
    "WarehouseName" VARCHAR(255) NOT NULL,
    "CategoryName" "CategoryName" NOT NULL,
    "Location" VARCHAR(255) NOT NULL,
    "Capacity" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "AuditId" INTEGER NOT NULL,

    CONSTRAINT "Warehouses_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Collections_AuditId_key" ON "Collections"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Colors_AuditId_key" ON "Colors"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Departments_Name_key" ON "Departments"("Name");

-- CreateIndex
CREATE UNIQUE INDEX "Departments_NameShort_key" ON "Departments"("NameShort");

-- CreateIndex
CREATE UNIQUE INDEX "Departments_AuditId_key" ON "Departments"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "ManufacturingStages_AuditId_key" ON "ManufacturingStages"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "ManufacturingStagesModel_AuditId_key" ON "ManufacturingStagesModel"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialCategories_AuditId_key" ON "MaterialCategories"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "ParentMaterials_AuditId_key" ON "ParentMaterials"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialMovement_AuditId_key" ON "MaterialMovement"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Measurements_AuditId_key" ON "Measurements"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Models_AuditId_key" ON "Models"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "ModelVarients_AuditId_key" ON "ModelVarients"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Notes_AuditId_key" ON "Notes"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Notifications_AuditId_key" ON "Notifications"("AuditId");

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
CREATE UNIQUE INDEX "TrakingModels_AuditId_key" ON "TrakingModels"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_Username_key" ON "Users"("Username");

-- CreateIndex
CREATE UNIQUE INDEX "Users_Email_key" ON "Users"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Users_PhoneNumber_key" ON "Users"("PhoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Users_AuditId_key" ON "Users"("AuditId");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouses_AuditId_key" ON "Warehouses"("AuditId");

-- AddForeignKey
ALTER TABLE "AuditRecords" ADD CONSTRAINT "AuditRecords_CreatedById_fkey" FOREIGN KEY ("CreatedById") REFERENCES "Users"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecords" ADD CONSTRAINT "AuditRecords_UpdatedById_fkey" FOREIGN KEY ("UpdatedById") REFERENCES "Users"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collections" ADD CONSTRAINT "Collections_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colors" ADD CONSTRAINT "Colors_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departments" ADD CONSTRAINT "Departments_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturingStages" ADD CONSTRAINT "ManufacturingStages_TemplateId_fkey" FOREIGN KEY ("TemplateId") REFERENCES "Templates"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturingStages" ADD CONSTRAINT "ManufacturingStages_DepartmentId_fkey" FOREIGN KEY ("DepartmentId") REFERENCES "Departments"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturingStages" ADD CONSTRAINT "ManufacturingStages_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturingStagesModel" ADD CONSTRAINT "ManufacturingStagesModel_ModelId_fkey" FOREIGN KEY ("ModelId") REFERENCES "Models"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturingStagesModel" ADD CONSTRAINT "ManufacturingStagesModel_DepartmentId_fkey" FOREIGN KEY ("DepartmentId") REFERENCES "Departments"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ManufacturingStagesModel" ADD CONSTRAINT "ManufacturingStagesModel_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialCategories" ADD CONSTRAINT "MaterialCategories_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentMaterials" ADD CONSTRAINT "ParentMaterials_CategoryId_fkey" FOREIGN KEY ("CategoryId") REFERENCES "MaterialCategories"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentMaterials" ADD CONSTRAINT "ParentMaterials_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentMaterials" ADD CONSTRAINT "ParentMaterials_ColorId_fkey" FOREIGN KEY ("ColorId") REFERENCES "Colors"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildMaterials" ADD CONSTRAINT "ChildMaterials_ParentMaterialId_fkey" FOREIGN KEY ("ParentMaterialId") REFERENCES "ParentMaterials"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildMaterials" ADD CONSTRAINT "ChildMaterials_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChildMaterials" ADD CONSTRAINT "ChildMaterials_ColorId_fkey" FOREIGN KEY ("ColorId") REFERENCES "Colors"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovement" ADD CONSTRAINT "MaterialMovement_ParentMaterialId_fkey" FOREIGN KEY ("ParentMaterialId") REFERENCES "ParentMaterials"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovement" ADD CONSTRAINT "MaterialMovement_ChildMaterialId_fkey" FOREIGN KEY ("ChildMaterialId") REFERENCES "ChildMaterials"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovement" ADD CONSTRAINT "MaterialMovement_WarehouseFromId_fkey" FOREIGN KEY ("WarehouseFromId") REFERENCES "Warehouses"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovement" ADD CONSTRAINT "MaterialMovement_WarehouseToId_fkey" FOREIGN KEY ("WarehouseToId") REFERENCES "Warehouses"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovement" ADD CONSTRAINT "MaterialMovement_SupplierId_fkey" FOREIGN KEY ("SupplierId") REFERENCES "Suppliers"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovement" ADD CONSTRAINT "MaterialMovement_DepartmentFromId_fkey" FOREIGN KEY ("DepartmentFromId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovement" ADD CONSTRAINT "MaterialMovement_DepartmentToId_fkey" FOREIGN KEY ("DepartmentToId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovement" ADD CONSTRAINT "MaterialMovement_ModelId_fkey" FOREIGN KEY ("ModelId") REFERENCES "Models"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaterialMovement" ADD CONSTRAINT "MaterialMovement_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurements" ADD CONSTRAINT "Measurements_TemplateSizeId_fkey" FOREIGN KEY ("TemplateSizeId") REFERENCES "TemplateSizes"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurements" ADD CONSTRAINT "Measurements_SizeId_fkey" FOREIGN KEY ("SizeId") REFERENCES "Sizes"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurements" ADD CONSTRAINT "Measurements_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_OrderId_fkey" FOREIGN KEY ("OrderId") REFERENCES "Orders"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_ProductCatalogId_fkey" FOREIGN KEY ("ProductCatalogId") REFERENCES "ProductCatalogs"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_CategoryOneId_fkey" FOREIGN KEY ("CategoryOneId") REFERENCES "ProductCatalogCategoryOne"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_CategoryTwoId_fkey" FOREIGN KEY ("CategoryTwoId") REFERENCES "ProductCatalogCategoryTwo"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_TextileId_fkey" FOREIGN KEY ("TextileId") REFERENCES "ProductCatalogTextiles"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_TemplateId_fkey" FOREIGN KEY ("TemplateId") REFERENCES "Templates"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Models" ADD CONSTRAINT "Models_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelVarients" ADD CONSTRAINT "ModelVarients_ModelId_fkey" FOREIGN KEY ("ModelId") REFERENCES "Models"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelVarients" ADD CONSTRAINT "ModelVarients_ColorId_fkey" FOREIGN KEY ("ColorId") REFERENCES "Colors"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelVarients" ADD CONSTRAINT "ModelVarients_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_CreatedDepartmentId_fkey" FOREIGN KEY ("CreatedDepartmentId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_AssignedToDepartmentId_fkey" FOREIGN KEY ("AssignedToDepartmentId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_ToDepartmentId_fkey" FOREIGN KEY ("ToDepartmentId") REFERENCES "Departments"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "OrderDetailSizes" ADD CONSTRAINT "OrderDetailSizes_OrderDetailId_fkey" FOREIGN KEY ("OrderDetailId") REFERENCES "OrderDetails"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetailSizes" ADD CONSTRAINT "OrderDetailSizes_SizeId_fkey" FOREIGN KEY ("SizeId") REFERENCES "Sizes"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetailSizes" ADD CONSTRAINT "OrderDetailSizes_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetailTemplateTypes" ADD CONSTRAINT "OrderDetailTemplateTypes_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_CollectionId_fkey" FOREIGN KEY ("CollectionId") REFERENCES "Collections"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "ProductCatalogDetails" ADD CONSTRAINT "ProductCatalogDetails_TextileId_fkey" FOREIGN KEY ("TextileId") REFERENCES "ProductCatalogTextiles"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogDetails" ADD CONSTRAINT "ProductCatalogDetails_TemplateTypeId_fkey" FOREIGN KEY ("TemplateTypeId") REFERENCES "TemplateTypes"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogDetails" ADD CONSTRAINT "ProductCatalogDetails_TemplatePatternId_fkey" FOREIGN KEY ("TemplatePatternId") REFERENCES "TemplatePatterns"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogDetails" ADD CONSTRAINT "ProductCatalogDetails_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogs" ADD CONSTRAINT "ProductCatalogs_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCatalogTextiles" ADD CONSTRAINT "ProductCatalogTextiles_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sizes" ADD CONSTRAINT "Sizes_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Suppliers" ADD CONSTRAINT "Suppliers_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_AssignedToDepartmentId_fkey" FOREIGN KEY ("AssignedToDepartmentId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_CreatedByDepartmentId_fkey" FOREIGN KEY ("CreatedByDepartmentId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tasks" ADD CONSTRAINT "Tasks_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePatterns" ADD CONSTRAINT "TemplatePatterns_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_ProductCatalogId_fkey" FOREIGN KEY ("ProductCatalogId") REFERENCES "ProductCatalogs"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_CategoryOneId_fkey" FOREIGN KEY ("CategoryOneId") REFERENCES "ProductCatalogCategoryOne"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_CategoryTwoId_fkey" FOREIGN KEY ("CategoryTwoId") REFERENCES "ProductCatalogCategoryTwo"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_TemplatePatternId_fkey" FOREIGN KEY ("TemplatePatternId") REFERENCES "TemplatePatterns"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_TemplateTypeId_fkey" FOREIGN KEY ("TemplateTypeId") REFERENCES "TemplateTypes"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSizes" ADD CONSTRAINT "TemplateSizes_TemplateId_fkey" FOREIGN KEY ("TemplateId") REFERENCES "Templates"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateSizes" ADD CONSTRAINT "TemplateSizes_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateTypes" ADD CONSTRAINT "TemplateTypes_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_ModelVariantId_fkey" FOREIGN KEY ("ModelVariantId") REFERENCES "ModelVarients"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_PrevStageId_fkey" FOREIGN KEY ("PrevStageId") REFERENCES "ManufacturingStagesModel"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_CurrentStageId_fkey" FOREIGN KEY ("CurrentStageId") REFERENCES "ManufacturingStagesModel"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_NextStageId_fkey" FOREIGN KEY ("NextStageId") REFERENCES "ManufacturingStagesModel"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrakingModels" ADD CONSTRAINT "TrakingModels_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_DepartmentId_fkey" FOREIGN KEY ("DepartmentId") REFERENCES "Departments"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warehouses" ADD CONSTRAINT "Warehouses_AuditId_fkey" FOREIGN KEY ("AuditId") REFERENCES "AuditRecords"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
