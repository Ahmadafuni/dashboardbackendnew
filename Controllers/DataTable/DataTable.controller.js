import prisma from "../../client.js";

// Calculate duration in hours
const durationInHours = (startTime, endTime) => {
  if (!startTime || !endTime) return null;

  const start = new Date(startTime);
  const end = new Date(endTime);

  const differenceInMilliseconds = end - start;
  const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60); // Convert milliseconds to hours

  return differenceInHours.toFixed(2); // Return the duration in hours rounded to 2 decimal places
};

const DataTableController = {
  getAllFields: async (req, res) => {
    const { tableName } = req.params;

    try {
      // التحقق من وجود الجدول
      const tableExists = await prisma.$queryRaw`
                SELECT EXISTS (
                    SELECT 1 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public' AND table_name = ${tableName}
                ) AS "exists";`;

      if (!tableExists[0].exists) {
        return res.status(404).json({
          status: 500,
          message: "لايوجد جدول بهذا الاسم",
          data: {},
        });
      }

      // جلب الحقول الخاصة بالجدول الرئيسي والتي من نوع string فقط
      const tableFields = await prisma.$queryRaw`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = ${tableName} `;

      const allFields = [];

      // التأكد من وجود حقول وإضافتها إلى القائمة
      if (tableFields.length > 0) {
        tableFields.forEach((field) => {
          allFields.push({ column_name: field.column_name });
        });
      }

      // جلب الجداول المرتبطة (التي تملك علاقات Foreign Key)
      const relatedTables = await prisma.$queryRaw`
                SELECT 
                    kcu.table_name AS main_table,
                    ccu.table_name AS related_table,
                    ccu.column_name AS related_column,
                    kcu.column_name AS fk_column,  -- تعديل هنا لإرجاع اسم FK
                    tc.constraint_name
                FROM information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                  ON tc.constraint_name = kcu.constraint_name
                JOIN information_schema.constraint_column_usage AS ccu
                  ON ccu.constraint_name = tc.constraint_name
                WHERE tc.constraint_type = 'FOREIGN KEY' 
                  AND kcu.table_name = ${tableName};`;

      // جلب الحقول من الجداول المرتبطة
      for (const relatedTable of relatedTables) {
        const relatedTableName = relatedTable.related_table;
        const fkColumnName = relatedTable.fk_column; // استخدام الـ FK

        // جلب الحقول من الجدول المرتبط
        const relatedFields = await prisma.$queryRaw`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = ${relatedTableName} 
                      AND data_type IN ('character varying', 'text');`;

        // إضافة الحقول من الجدول المرتبط مع إضافة اسم FK في البداية
        if (relatedFields.length > 0) {
          relatedFields.forEach((field) => {
            allFields.push({
              column_name: `${fkColumnName}.${field.column_name}`, // تنسيق FK.اسم الحقل
            });
          });
        }
      }
      // إرجاع جميع الحقول
      res.json({ fields: allFields });
    } catch (error) {
      console.error("Error fetching fields:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  filterTable: async (req, res) => {
    const { tableName } = req.params;
    const { filters } = req.body;

    // خريطة العلاقات لكل جدول في قاعدة البيانات
    const relationshipMaps = {
      Orders: {
        CollectionId: "Collection",
        AuditId: "Audit",
        Models: "Models",
      },
      ProductCatalogCategoryOne: {
        AuditId: "Audit",
        ProductCatalogDetails: "ProductCatalogDetails",
        Templates: "Templates",
        Models: "Models",
      },
      ProductCatalogCategoryTwo: {
        AuditId: "Audit",
        ProductCatalogDetails: "ProductCatalogDetails",
        Templates: "Templates",
        Models: "Models",
      },
      ProductCatalogs: {
        AuditId: "Audit",
        ProductCatalogDetails: "ProductCatalogDetails",
        Templates: "Templates",
        Models: "Models",
      },
      Sizes: {
        AuditId: "Audit",
        OrderDetailSizes: "OrderDetailSizes",
        Measurements: "Measurements",
      },
      Templates: {
        ProductCatalogId: "ProductCatalogue",
        CategoryOneId: "CategoryOne",
        CategoryTwoId: "CategoryTwo",
        TemplatePatternId: "TemplatePattern",
        TemplateTypeId: "TemplateType",
        AuditId: "Audit",
        ManufacturingStages: "ManufacturingStages",
        TemplateSizes: "TemplateSizes",
        Models: "Models",
      },
      Collections: {
        AuditId: "Audit",
        Orders: "Orders",
      },
      Colors: {
        AuditId: "Audit",
        OrderDetailColors: "OrderDetailColors",
        ModelVarients: "ModelVarients",
        ParentMaterials: "ParentMaterials",
        ChildMaterials: "ChildMaterials",
      },
      ProductCatalogTextiles: {
        AuditId: "Audit",
        ProductCatalogDetails: "ProductCatalogDetails",
        Models: "Models",
      },
      Notes: {
        AuditId: "Audit",
        CreatedDepartment: "Departments",
        AssignedToDepartment: "Departments",
      },
      Notifications: {
        ToDepartment: "Departments",
      },
      OrderDetailColors: {
        AuditId: "Audit",
        OrderDetail: "OrderDetails",
        Color: "Colors",
      },
      OrderDetails: {
        AuditId: "Audit",
        ProductCatalogDetails: "ProductCatalogDetails",
        OrderDetailColors: "OrderDetailColors",
        OrderDetailSizes: "OrderDetailSizes",
      },
      OrderDetailSizes: {
        AuditId: "Audit",
        OrderDetail: "OrderDetails",
        Size: "Sizes",
      },
      OrderDetailTemplateTypes: {
        AuditId: "Audit",
        TemplateTypeId: "TemplateType",
      },
      AuditRecords: {
        CreatedById: "Users",
        UpdatedById: "Users",
        Colors: "Colors",
        Departments: "Departments",
        ManufacturingStages: "ManufacturingStages",
        ManufacturingStagesModel: "ManufacturingStagesModel",
        MaterialCategories: "MaterialCategories",
        ParentMaterials: "ParentMaterials",
        OrderDetailColors: "OrderDetailColors",
        OrderDetails: "OrderDetails",
        OrderDetailSizes: "OrderDetailSizes",
        OrderDetailTemplateTypes: "OrderDetailTemplateTypes",
        Orders: "Orders",
        ProductCatalogCategoryOne: "ProductCatalogCategoryOne",
        ProductCatalogCategoryTwo: "ProductCatalogCategoryTwo",
        ProductCatalogDetails: "ProductCatalogDetails",
        ProductCatalogs: "ProductCatalogs",
        ProductCatalogTextiles: "ProductCatalogTextiles",
        Sizes: "Sizes",
        Suppliers: "Suppliers",
        TemplatePatterns: "TemplatePatterns",
        Templates: "Templates",
        TemplateSizes: "TemplateSizes",
        TemplateTypes: "TemplateTypes",
        Users: "Users",
        Warehouses: "Warehouses",
        Tasks: "Tasks",
        Measurements: "Measurements",
        Models: "Models",
        Collections: "Collections",
        ModelVarients: "ModelVarients",
        Notes: "Notes",
        TrakingModels: "TrakingModels", // تمت الإضافة هنا
        ChildMaterials: "ChildMaterials",
        MaterialMovement: "MaterialMovement",
      },
      TemplateTypes: {
        AuditId: "Audit",
        ProductCatalogDetails: "ProductCatalogDetails",
        Templates: "Templates",
        TemplatePatterns: "TemplatePatterns",
      },
      TemplatePatterns: {
        AuditId: "Audit",
        ProductCatalogDetails: "ProductCatalogDetails",
        Templates: "Templates",
        TemplateTypes: "TemplateTypes",
      },
      ParentMaterials: {
        CategoryId: "MaterialCategories",
        AuditId: "Audit",
        ChildMaterials: "ChildMaterials",
        MaterialMovement: "MaterialMovement",
        ColorId: "Colors",
      },
      TrakingModels: {
        ModelVariantId: "ModelVarients",
        PrevStageId: "ManufacturingStagesModel",
        CurrentStageId: "ManufacturingStagesModel",
        NextStageId: "ManufacturingStagesModel",
        AuditId: "Audit",
      },
      // Users: {
      //     'DepartmentId': 'Departments',
      //     'AuditId': 'Audit',
      //     'WarehouseId': 'Warehouses',
      //     'AuditCreatedBy': 'AuditRecords',
      //     'AuditUpdatedBy': 'AuditRecords'
      // }
    };

    try {
      const where = {};
      const include = {};

      const relationshipMap = relationshipMaps[tableName];

      // if (!relationshipMap) {
      //     return res.status(400).json({ error: 'Invalid table name' });
      // }

      filters.forEach((filter) => {
        if (filter.column && filter.value) {
          const columnParts = filter.column.split("."); // إذا كان التنسيق 'relatedTable.field'

          if (columnParts.length === 2) {
            const [relationshipName, columnName] = columnParts;

            // التحقق مما إذا كان اسم العلاقة موجود في خريطة العلاقات الخاصة بالجدول
            const prismaRelationship = relationshipMap[relationshipName];
            if (prismaRelationship) {
              // استخدام صيغة Prisma الصحيحة للتعامل مع الفلترة في الجداول المرتبطة
              if (!where[prismaRelationship]) {
                where[prismaRelationship] = {
                  is: {
                    [columnName]: {
                      contains: filter.value,
                      mode: "insensitive",
                    },
                  },
                };
              }
              include[prismaRelationship] = true;
            }
          } else {
            where[filter.column] = {
              contains: filter.value,
              mode: "insensitive",
            };
          }
        }
      });

      if (relationshipMap) {
        Object.keys(relationshipMap).forEach((key) => {
          const prismaRelationship = relationshipMap[key];
          if (!include[prismaRelationship]) {
            include[prismaRelationship] = true;
          }
        });
      }
      const results = await prisma[tableName].findMany({
        where: where,
        include: include,
      });

      res.json(results);
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  filterDashboard: async (req, res) => {
    const { demoModelNumber, stage } = req.params;

    try {
      // التحقق مما إذا كان demoModelNumber متاحًا
      if (!demoModelNumber) {
        return res.status(400).json({ error: "DemoModelNumber is required" });
      }

      // إنشاء الاستعلام للبحث عن البيانات في TrakingModels بناءً على DemoModelNumber
      const results = await prisma.trakingModels.findMany({
        where: {
          Audit: { IsDeleted: false },
          ModelVariant: {
            Audit: { IsDeleted: false },
            Model: {
              Audit: { IsDeleted: false },
              DemoModelNumber: {
                contains: demoModelNumber,
                mode: "insensitive", // البحث غير حساس لحالة الأحرف
              },
              Order: {
                Audit: { IsDeleted: false },
                Collection: { Audit: { IsDeleted: false } },
              },
            },
          },

          ...(stage === "1"
            ? {
              OR: [{ MainStatus: "CHECKING" }, { MainStatus: "TODO" }],
            }
            : stage === "2"
              ? {
                MainStatus: "INPROGRESS",
              }
              : stage === "3"
                ? {
                  MainStatus: "DONE",
                }
                : stage === "4"
                  ? {
                    MainStatus: "CHECKING",
                  }
                  : {
                    RunningStatus: "COMPLETED",
                  }),
        },
        select: {
          Id: true,
          PrevStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              ModelId: true,
              AuditId: true,
              Department: {
                select: {
                  Name: true,
                },
              },
            },
          },
          NextStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              ModelId: true,
              AuditId: true,
              Department: {
                select: {
                  Name: true,
                },
              },
            },
          },
          CurrentStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              ModelId: true,
              AuditId: true,
              Department: {
                select: {
                  Name: true,
                },
              },
            },
          },
          DamagedItem: true,
          StartTime: true,
          EndTime: true,
          Notes: true,
          QuantityInNum: true,
          QuantityInKg: true,
          MainStatus: true,
          RunningStatus: true,
          StopData: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
              Color: {
                select: {
                  ColorName: true,
                },
              },
              Model: {
                select: {
                  Textile: {
                    select: {
                      TextileName: true,
                    },
                  },
                  Order: {
                    select: {
                      OrderNumber: true,
                      OrderName: true,
                      Collection: {
                        select: {
                          CollectionName: true,
                        },
                      },
                    },
                  },
                  Barcode: true,
                  ModelName: true,
                  ModelNumber: true,
                  DemoModelNumber: true,
                  Id: true,
                  CategoryOne: {
                    select: {
                      CategoryName: true,
                    },
                  },
                  categoryTwo: {
                    select: {
                      CategoryName: true,
                    },
                  },
                  Template: {
                    select: {
                      TemplatePattern: {
                        select: {
                          TemplatePatternName: true,
                        },
                      },
                    },
                  },
                  ProductCatalog: {
                    select: {
                      ProductCatalogName: true,
                    },
                  },
                },
              },
              Sizes: true,
              Quantity: true,
            },
          },
        },
      });

      const addNameField = (items, stage) =>
        items.map((item) => {
          const modelName = item.ModelVariant.Model.ModelName;
          const TemplatePatternName =
            item.ModelVariant.Model.Template.TemplatePattern
              .TemplatePatternName;
          const categoryOneName =
            item.ModelVariant.Model.CategoryOne.CategoryName;
          const ProductCatalogName =
            item.ModelVariant.Model.ProductCatalog.ProductCatalogName;
          const categoryTwoName =
            item.ModelVariant.Model.categoryTwo.CategoryName;

          return {
            ...item,
            name: `${ProductCatalogName} - ${categoryOneName} - ${categoryTwoName} - ${TemplatePatternName}`,
            Barcode: item.ModelVariant.Model.Barcode,
            CollectionName:
              item.ModelVariant.Model.Order.Collection.CollectionName,
            OrderNumber: item.ModelVariant.Model.Order.OrderNumber,
            OrderName: item.ModelVariant.Model.Order.OrderName,
            TextileName: item.ModelVariant.Model.Textile.TextileName,
          };
        });

      const finalResults = addNameField(results, 1);

      // التحقق مما إذا كانت النتائج فارغة
      if (results.length === 0) {
        return res.status(404).json({ message: "No data found" });
      }

      return res.status(200).send({
        status: 200,
        message: "",
        data: finalResults,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  filterModels: async (req, res) => {
    const { filters } = req.body;

    try {
      const whereCondition = {
        Audit: {
          IsDeleted: false,
        },
      };

      filters.forEach((filter) => {
        if (filter.column == "ModelNumber")
          whereCondition["DemoModelNumber"] = filter.value;
        else whereCondition[filter.column] = filter.value;
      });

      const models = await prisma.models.findMany({
        where: whereCondition,
        orderBy: { StartTime: "desc" },
        // skip: (page - 1) * size,
        // take: size,
        select: {
          //Order: { select: { CollectionId: true, Collection: { select: { Name: true } } } },
          OrderId: true,
          DemoModelNumber: true,
          ModelName: true,
          Id: true,
          ProductCatalog: { select: { ProductCatalogName: true } },
          CategoryOne: { select: { CategoryName: true } },
          categoryTwo: { select: { CategoryName: true } },
          Textile: { select: { TextileName: true } },
          Template: {
            select: {
              TemplateName: true,
            },
          },
          RunningStatus: true,
          Barcode: true,
          ModelVarients: {
            select: {
              Color: true,
              Sizes: true,
              RunningStatus: true,
              MainStatus: true,
              TrakingModels: {
                orderBy: { Id: "desc" },
                take: 1,
                select: {
                  Id: true,
                  CurrentStage: {
                    select: {
                      StageName: true,
                      Department: { select: { Name: true } },
                      DepartmentId: true,
                    },
                  },
                  QuantityDelivered: true,
                  QuantityReceived: true,
                  DamagedItem: true,
                },
              },
            },
          },
          Audit: { select: { CreatedAt: true, UpdatedAt: true } },
        },
      });

      const groupedModels = models.reduce((acc, model) => {
        const existingModel = acc.find(
          (entry) => entry.DemoModelNumber === model.DemoModelNumber
        );

        const modelVariantDetails = model.ModelVarients.map((variant) => ({
          Color: variant.Color,
          Sizes: variant.Sizes,
          MainStatus: variant.MainStatus,
          RunningStatus: variant.RunningStatus,
          StageName: variant.TrakingModels[0]?.CurrentStage.StageName || null,
          DepartmentName:
            variant.TrakingModels[0]?.CurrentStage.Department.Name || null,
          QuantityDelivered:
            variant.TrakingModels[0]?.QuantityDelivered || null,
          QuantityReceived: variant.TrakingModels[0]?.QuantityReceived || null,
          DamagedItem: variant.TrakingModels[0]?.DamagedItem || null,
          StartTime: variant.TrakingModels[0]?.StartTime || null,
          EndTime: variant.TrakingModels[0]?.EndTime || null,
          DurationInHours: durationInHours(
            variant.TrakingModels[0]?.StartTime,
            variant.TrakingModels[0]?.EndTime
          ),

        }));

        if (existingModel) {
          existingModel.Details.push(...modelVariantDetails);
        } else {
          acc.push({
            Id: model.Id,
            DemoModelNumber: model.DemoModelNumber,
            ModelId: model.Id,
            ModelName: model.ModelName,
            ProductCatalog: model.ProductCatalog,
            CategoryOne: model.CategoryOne,
            categoryTwo: model.categoryTwo,
            Textile: model.Textile,
            Details: modelVariantDetails,
            Template: model.Template,
            RunningStatus: model.RunningStatus,
            Barcode: model.Barcode,
            Audit: {
              CreatedAt: model.Audit.CreatedAt,
              UpdatedAt: model.Audit.UpdatedAt,
            },
          });
        }

        return acc;
      }, []);

      console.log(groupedModels);

      return res.status(200).send({
        status: 200,
        message: "Models fetched successfully!",
        data: groupedModels,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        status: 500,
        message: "Internal server error. Please try again later!",
        data: {},
      });
    }
  },
};

export default DataTableController;
