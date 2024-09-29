import prisma from "../../client.js";


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
                tableFields.forEach(field => {
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
                const fkColumnName = relatedTable.fk_column;  // استخدام الـ FK
    
                // جلب الحقول من الجدول المرتبط
                const relatedFields = await prisma.$queryRaw`
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name = ${relatedTableName} 
                      AND data_type IN ('character varying', 'text');`;
    
                // إضافة الحقول من الجدول المرتبط مع إضافة اسم FK في البداية
                if (relatedFields.length > 0) {
                    relatedFields.forEach(field => {
                        allFields.push({
                            column_name: `${fkColumnName}.${field.column_name}` // تنسيق FK.اسم الحقل
                        });
                    });
                }
            }
            // إرجاع جميع الحقول
            res.json({ fields: allFields });
        } catch (error) {
            console.error('Error fetching fields:', error);
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
                'CollectionId': 'Collection',
                'AuditId': 'Audit',
                'Models': 'Models'
            },
            ProductCatalogCategoryOne: {
                'AuditId': 'Audit',
                'ProductCatalogDetails': 'ProductCatalogDetails',
                'Templates': 'Templates',
                'Models': 'Models'
            },
            ProductCatalogCategoryTwo: {
                'AuditId': 'Audit',
                'ProductCatalogDetails': 'ProductCatalogDetails',
                'Templates': 'Templates',
                'Models': 'Models'
            },
            ProductCatalogs: {
                'AuditId': 'Audit',
                'ProductCatalogDetails': 'ProductCatalogDetails',
                'Templates': 'Templates',
                'Models': 'Models'
            },
            Sizes: {
                'AuditId': 'Audit',
                'OrderDetailSizes': 'OrderDetailSizes',
                'Measurements': 'Measurements'
            },
            Templates: {
                'ProductCatalogId': 'ProductCatalogue',
                'CategoryOneId': 'CategoryOne',
                'CategoryTwoId': 'CategoryTwo',
                'TemplatePatternId': 'TemplatePattern',
                'TemplateTypeId': 'TemplateType',
                'AuditId': 'Audit',
                'ManufacturingStages': 'ManufacturingStages',
                'TemplateSizes': 'TemplateSizes',
                'Models': 'Models'
            },
            Collections: {
                'AuditId': 'Audit',
                'Orders': 'Orders'
            },
            Colors: {
                'AuditId': 'Audit',
                'OrderDetailColors': 'OrderDetailColors',
                'ModelVarients': 'ModelVarients',
                'ParentMaterials': 'ParentMaterials',
                'ChildMaterials': 'ChildMaterials'
            },
            ProductCatalogTextiles: {
                'AuditId': 'Audit',
                'ProductCatalogDetails': 'ProductCatalogDetails',
                'Models': 'Models'
            },
            Notes: {
                'AuditId': 'Audit',
                'CreatedDepartment': 'Departments',
                'AssignedToDepartment': 'Departments'
            },
            Notifications: {
                'ToDepartment': 'Departments'
            },
            OrderDetailColors: {
                'AuditId': 'Audit',
                'OrderDetail': 'OrderDetails',
                'Color': 'Colors'
            },
            OrderDetails: {
                'AuditId': 'Audit',
                'ProductCatalogDetails': 'ProductCatalogDetails',
                'OrderDetailColors': 'OrderDetailColors',
                'OrderDetailSizes': 'OrderDetailSizes'
            },
            OrderDetailSizes: {
                'AuditId': 'Audit',
                'OrderDetail': 'OrderDetails',
                'Size': 'Sizes'
            },
            OrderDetailTemplateTypes: {
                'AuditId': 'Audit',
                'TemplateTypeId': 'TemplateType'
            },
            AuditRecords: {
                'CreatedById': 'Users', 
                'UpdatedById': 'Users',
                'Colors': 'Colors',
                'Departments': 'Departments',
                'ManufacturingStages': 'ManufacturingStages',
                'ManufacturingStagesModel': 'ManufacturingStagesModel',
                'MaterialCategories': 'MaterialCategories',
                'ParentMaterials': 'ParentMaterials',
                'OrderDetailColors': 'OrderDetailColors',
                'OrderDetails': 'OrderDetails',
                'OrderDetailSizes': 'OrderDetailSizes',
                'OrderDetailTemplateTypes': 'OrderDetailTemplateTypes',
                'Orders': 'Orders',
                'ProductCatalogCategoryOne': 'ProductCatalogCategoryOne',
                'ProductCatalogCategoryTwo': 'ProductCatalogCategoryTwo',
                'ProductCatalogDetails': 'ProductCatalogDetails',
                'ProductCatalogs': 'ProductCatalogs',
                'ProductCatalogTextiles': 'ProductCatalogTextiles',
                'Sizes': 'Sizes',
                'Suppliers': 'Suppliers',
                'TemplatePatterns': 'TemplatePatterns',
                'Templates': 'Templates',
                'TemplateSizes': 'TemplateSizes',
                'TemplateTypes': 'TemplateTypes',
                'Users': 'Users',
                'Warehouses': 'Warehouses',
                'Tasks': 'Tasks',
                'Measurements': 'Measurements',
                'Models': 'Models',
                'Collections': 'Collections',
                'ModelVarients': 'ModelVarients',
                'Notes': 'Notes',
                'TrakingModels': 'TrakingModels', // تمت الإضافة هنا
                'ChildMaterials': 'ChildMaterials',
                'MaterialMovement': 'MaterialMovement'
            },
            TemplateTypes: {
                'AuditId': 'Audit',
                'ProductCatalogDetails': 'ProductCatalogDetails',
                'Templates': 'Templates',
                'TemplatePatterns': 'TemplatePatterns'
            },
            TemplatePatterns: {
                'AuditId': 'Audit',
                'ProductCatalogDetails': 'ProductCatalogDetails',
                'Templates': 'Templates',
                'TemplateTypes': 'TemplateTypes'
            },
            ParentMaterials: {
                'CategoryId': 'MaterialCategories',
                'AuditId': 'Audit',
                'ChildMaterials': 'ChildMaterials',
                'MaterialMovement': 'MaterialMovement',
                'ColorId': 'Colors'
            },
            TrakingModels: { 
                'ModelVariantId': 'ModelVarients',
                'PrevStageId': 'ManufacturingStagesModel',
                'CurrentStageId': 'ManufacturingStagesModel',
                'NextStageId': 'ManufacturingStagesModel',
                'AuditId': 'Audit'
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
    
            filters.forEach(filter => {
                if (filter.column && filter.value) {
                    const columnParts = filter.column.split('.'); // إذا كان التنسيق 'relatedTable.field'
    
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
                                            mode: 'insensitive',
                                        },
                                    },
                                };
                            }
                            include[prismaRelationship] = true; 
                        }
                    } else {
                        where[filter.column] = {
                            contains: filter.value,
                            mode: 'insensitive',
                        };
                    }
                }
            });
    
            if (relationshipMap){
            Object.keys(relationshipMap).forEach(key => {
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
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

};

export default DataTableController ;