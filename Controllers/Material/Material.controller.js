import prisma from "../../client.js";

const MaterialController = {
  createMaterialParent: async (req, res, next) => {
    const {
      name,
      unitOfMeasure,
      category,
      description,
      usageLocation,
      alternativeMaterials,
      minimumLimit,
      isRelevantToProduction,
      hasChildren,
      color
    } = req.body;
    const userId = req.userId;
    try {
      await prisma.parentMaterials.create({
        data: {
          Name: name,
          Category: { connect: { Id: +category } },
          Description: description,
          UnitOfMeasure: unitOfMeasure,
          UsageLocation: usageLocation,
          AlternativeMaterials: alternativeMaterials,
          MinimumLimit: parseFloat(minimumLimit),
          IsRelevantToProduction: isRelevantToProduction,
          HasChildren: hasChildren,
          ...(color && { Color: { connect: { Id: +color } } }),
          Audit: {
            create: {
              CreatedById: userId,
              UpdatedById: userId,
            },
          },
        },
      });
      // Return response
      return res.status(201).send({
        status: 201,
        message: "تم إنشاء المادة بنجاح!",
        data: {},
      });
    } catch (error) {
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  createMaterialChild: async (req, res, next) => {
    const {
      Name,
      DyeNumber,
      Kashan,
      Halil,
      Phthalate,
      GramWeight,
      Description,
    } = req.body;
    const userId = req.userId;
    const ParentMaterialId = req.params.id;
    try {
      await prisma.childMaterials.create({
        data: {
          Name: Name,
          Description: Description,
          DyeNumber: DyeNumber,
          Kashan: Kashan,
          Halil: Halil,
          Phthalate: Phthalate,
          GramWeight: parseFloat(GramWeight),
          ParentMaterial: {
            connect: {
              Id: +ParentMaterialId,
            },
          },
          Audit: {
            create: {
              CreatedById: userId,
              UpdatedById: userId,
            },
          },
        },
      });
      // Return response
      return res.status(201).send({
        status: 201,
        message: "تم إنشاء المادة بنجاح!",
        data: {},
      });
    } catch (error) {
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getAllParentMaterials: async (req, res, next) => {

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const totalRecords = await prisma.parentMaterials.count({});

    const totalPages = Math.ceil(totalRecords / size);
    try {
      const materials = await prisma.parentMaterials.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        skip: (page - 1) * size,
        take: size ,
        include: {
          Category: {
            select: {
              Id: true,
              CategoryName: true,
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        totalPages,
        message: "تم جلب المواد بنجاح!",
        data: materials,
      });
    } catch (error) {
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getAllChildMaterials: async (req, res, next) => {
    try {
      const materials = await prisma.childMaterials.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          ParentMaterial: {
            select: {
              Id: true,
              Name: true,
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب المواد بنجاح!",
        data: materials,
      });
    } catch (error) {
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getParentMaterialById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const material = await prisma.parentMaterials.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (!material) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "المادة غير موجودة!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم إنشاء المادة بنجاح!",
        data: {
          id: material.Id,
          name: material.Name,
          unitOfMeasure: material.UnitOfMeasure,
          category: material.CategoryId.toString(),
          description: material.Description,
          usageLocation: material.UsageLocation,
          alternativeMaterials: material.AlternativeMaterials,
          minimumLimit: material.MinimumLimit.toString(),
          isRelevantToProduction: material.IsRelevantToProduction,
          hasChildren: material.HasChildren,
          ...(material.ColorId && ({color: material.ColorId.toString()}))
        },
      });
    } catch (error) {
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getChildMaterialById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const material = await prisma.childMaterials.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      if (!material) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "المادة غير موجودة!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم إنشاء المادة بنجاح!",
        data: {
          Name: material.Name,
          DyeNumber: material.DyeNumber,
          Kashan: material.Kashan,
          Halil: material.Halil,
          Phthalate: material.Phthalate,
          GramWeight: material.GramWeight.toString(),
          Description: material.Description,
        },
      });
    } catch (error) {
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  
  getChildMaterialByParentId: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      // جلب المواد الفرعية بناءً على معرف المادة الرئيسية
      const materials = await prisma.childMaterials.findMany({
        where: {
          ParentMaterialId: id,
          Audit: {
            IsDeleted: false,
          },
        },
      });
  
      if (!materials || materials.length === 0) {
        // Return response if no materials are found
        return res.send({
          status: 200,
          message: "No child materials found!",
          data: [],
        });
      }
  
      // جلب حركات المواد
      const materialMovements = await prisma.materialMovement.findMany({
        where: {
          ChildMaterialId: {
            in: materials.map((material) => material.Id), // ربط المواد بحركاتها
          },
        },
        include: {
          WarehouseFrom: true, // جلب معلومات المستودع الصادرة منه الحركة
          WarehouseTo: true,   // جلب معلومات المستودع الواردة إليه الحركة
        },
      });
  
      // حساب الكميات الواردة والصادرة بناءً على نوع الحركة وحسب وحدة القياس
      const materialQuantities = materialMovements.reduce((acc, movement) => {
        const key = `${movement.ChildMaterialId}-${movement.UnitOfQuantity}`;
        const quantity = Number(movement.Quantity);
  
        if (!acc[key]) {
          acc[key] = 0;
        }
  
        // إضافة الكميات بناءً على نوع الحركة (مثلاً، "INCOMING" للوارد و"OUTGOING" للصادر)
        if (movement.MovementType === 'INCOMING') {
          acc[key] += quantity;
        } else if (movement.MovementType === 'OUTGOING') {
          acc[key] -= quantity;
        }
  
        return acc;
      }, {});
  
      // حساب الكميات حسب المستودعات مع مراعاة وحدات القياس
      const warehouseQuantities = materialMovements.reduce((acc, movement) => {
        if (movement.WarehouseTo) {
          const key = `${movement.ChildMaterialId}-${movement.WarehouseTo.Id}-${movement.UnitOfQuantity}`;
          const quantity = Number(movement.Quantity);
  
          if (!acc[key]) {
            acc[key] = {
              WarehouseName: movement.WarehouseTo.WarehouseName,
              Quantity: 0,
              Unit: movement.UnitOfQuantity,
            };
          }
  
          if (movement.MovementType === 'INCOMING') {
            acc[key].Quantity += quantity;
          }
        }
  
        if (movement.WarehouseFrom) {
          const key = `${movement.ChildMaterialId}-${movement.WarehouseFrom.Id}-${movement.UnitOfQuantity}`;
          const quantity = Number(movement.Quantity);
  
          if (!acc[key]) {
            acc[key] = {
              WarehouseName: movement.WarehouseFrom.WarehouseName,
              Quantity: 0,
              Unit: movement.UnitOfQuantity,
            };
          }
  
          if (movement.MovementType === 'OUTGOING') {
            acc[key].Quantity -= quantity;
          }
        }
  
        return acc;
      }, {});
  
      // تعديل تنسيق البيانات لتضمين الكميات المتبقية والكميات في المستودعات
      const formattedMaterials = materials.map((material) => {
        const generalQuantities = Object.keys(materialQuantities)
          .filter((key) => key.startsWith(`${material.Id}-`))
          .map((key) => ({
            unit: key.split('-')[1],
            quantity: materialQuantities[key], // تنسيق الكمية إلى خانتين عشريتين
          }));
  
        const warehouseData = Object.keys(warehouseQuantities)
          .filter((key) => key.startsWith(`${material.Id}-`))
          .map((key) => {
            const [_, warehouseId, unit] = key.split('-');
            return {
              WarehouseName: warehouseQuantities[key].WarehouseName,
              Unit: unit,
              Quantity: warehouseQuantities[key].Quantity,
            };
          });
  
        return {
          Id: material.Id,
          Name: material.Name,
          DyeNumber: material.DyeNumber,
          Kashan: material.Kashan,
          Halil: material.Halil,
          Phthalate: material.Phthalate,
          GramWeight: material.GramWeight ? material.GramWeight.toString() : "",
          Description: material.Description,
          Quantities: generalQuantities, // الكميات المتبقية بشكل عام
          WarehouseQuantities: warehouseData, // الكميات المتبقية في كل مستودع مع اسم المستودع
        };
      });
  
      // Return response
      return res.status(200).send({
        status: 200,
        message: "Materials retrieved successfully!",
        data: formattedMaterials,
      });
    } catch (error) {
      // Server error or unsolved error
      console.error("Error retrieving child materials:", error);
      return res.status(500).send({
        status: 500,
        message: "Internal server error. Please try again later!",
        data: {},
      });
    }
  },
  
  

  
 
 
  deleteParentMaterial: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.materials.update({
        where: {
          Id: +id,
        },
        data: {
          Audit: {
            update: {
              IsDeleted: true,
              UpdatedById: userId,
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم حذف المادة بنجاح!",
        data: {},
      });
    } catch (error) {
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  deleteChildMaterial: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.childMaterials.update({
        where: {
          Id: +id,
        },
        data: {
          Audit: {
            update: {
              IsDeleted: true,
              UpdatedById: userId,
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم حذف المادة بنجاح!",
        data: {},
      });
    } catch (error) {
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  updateParentMaterial: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const {
      name,
      unitOfMeasure,
      category,
      description,
      usageLocation,
      alternativeMaterials,
      minimumLimit,
      isRelevantToProduction,
      hasChildren,
    } = req.body;
    const userId = req.userId;
    try {
      await prisma.parentMaterials.update({
        where: {
          Id: +id,
        },
        data: {
          Name: name,
          Category: { connect: { Id: +category } },
          Description: description,
          UnitOfMeasure: unitOfMeasure,
          UsageLocation: usageLocation,
          AlternativeMaterials: alternativeMaterials,
          MinimumLimit: parseFloat(minimumLimit),
          IsRelevantToProduction: isRelevantToProduction,
          HasChildren: hasChildren,
          Audit: {
            create: {
              CreatedById: userId,
              UpdatedById: userId,
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم تحديث المادة بنجاح!",
        data: {},
      });
    } catch (error) {
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  updateChildMaterial: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const {
      Name,
      DyeNumber,
      Kashan,
      Halil,
      Phthalate,
      GramWeight,
      Description,
    } = req.body;
    const userId = req.userId;
    try {
      await prisma.childMaterials.update({
        where: {
          Id: +id,
        },
        data: {
          Name: Name,
          Description: Description,
          DyeNumber: DyeNumber,
          Kashan: Kashan,
          Halil: Halil,
          Phthalate: Phthalate,
          GramWeight: parseFloat(GramWeight),
          Audit: {
            create: {
              CreatedById: userId,
              UpdatedById: userId,
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم تحديث المادة بنجاح!",
        data: {},
      });
    } catch (error) {
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getMaterialNames: async (req, res, next) => {
    try {
      const materialNames = await prisma.materials
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            Name: true,
          },
        })
        .then((materials) =>
          materials.map((material) => ({
            id: material.Id,
            name: material.Name,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء المواد بنجاح!",
        data: materialNames,
      });
    } catch (error) {
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getChildMaterialNames: async (req, res, next) => {
    const materialId = req.params.id;
    try {
      const materialNames = await prisma.childMaterials
        .findMany({
          where: {
            ParentMaterialId: parseInt(materialId),
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            Name: true,
          },
        })
        .then((materials) =>
          materials.map((material) => ({
            value: material.Id.toString(),
            label: material.Name,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء المواد بنجاح!",
        data: materialNames,
      });
    } catch (error) {
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  searchMaterial: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.materials.findMany({
        where: {
          Name: {
            contains: searchTerm,
            mode: "insensitive",
          },
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          Category: {
            select: {
              Id: true,
              CategoryName: true,
            },
          },
          Supplier: {
            select: {
              Id: true,
              Name: true,
            },
          },
        },
      });
      return res.status(200).send({
        status: 200,
        message: "تم البحث بنجاح!",
        data: datas,
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
};

export default MaterialController;
