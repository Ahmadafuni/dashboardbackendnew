import prisma from "../../client.js";

const SupplierController = {
  createSupplier: async (req, res, next) => {
    const { name, address, phone, description } = req.body;
    const userId = req.userId;
    try {
      await prisma.suppliers.create({
        data: {
          Name: name,
          PhoneNumber: phone,
          Address: address,
          Description: description,
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
        message: "تم إنشاء المورد بنجاح!",
        data: {},
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getAllSuppliers: async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const totalRecords = await prisma.suppliers.count({});

    const totalPages = Math.ceil(totalRecords / size);

    try {
      const suppliers = await prisma.suppliers.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        skip: (page - 1) * size,
        take: size ,
      });
      // Return response
      return res.status(200).send({
        status: 200,
        totalPages,
        message: "تم جلب الموردين بنجاح!",
        data: suppliers,
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
  getSupplierById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const supplier = await prisma.suppliers.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      if (!supplier) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "المورد غير موجود!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب الموردين بنجاح!",
        data: {
          name: supplier.Name,
          address: supplier.Address,
          phone: supplier.PhoneNumber,
          description: supplier.Description,
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
  deleteSupplier: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.suppliers.update({
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
        message: "تم حذف المورد بنجاح!",
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
  updateSupplier: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    const { name, address, phone, description } = req.body;
    try {
      await prisma.suppliers.update({
        where: {
          Id: +id,
        },
        data: {
          Name: name,
          PhoneNumber: phone,
          Address: address,
          Description: description,
          Audit: {
            update: {
              data: {
                UpdatedById: userId,
              },
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم تحديث المورد بنجاح!",
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
  getSupplierNames: async (req, res, next) => {
    try {
      const supplierNames = await prisma.suppliers
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
        .then((suppliers) =>
          suppliers.map((supplier) => ({
            value: supplier.Id.toString(),
            label: supplier.Name,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء الموردين بنجاح!",
        data: supplierNames,
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
  searchSupplier: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.suppliers.findMany({
        where: {
          Name: {
            contains: searchTerm,
            mode: "insensitive",
          },
          Audit: {
            IsDeleted: false,
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

  getMaterialMovementsById: async (req, res) => {
    const supplierId = Number(req.params.id);
  
    try {
      const materialMovements = await prisma.materialMovement.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          SupplierId: supplierId, // جلب جميع الحركات الخاصة بالمزود
        },
        select: {
          Id: true,
          InvoiceNumber: true,
          MovementType: true,
          Quantity: true,
          UnitOfQuantity: true,
          MovementDate: true,
          Description: true,
          ParentMaterial: {
            select: {
              Id: true, // ID المادة الأم
              Name: true, // اسم المادة الأم
              Category: {
                select: {
                  CategoryName: true, // صنف المادة
                },
              },
            },
          },
          ChildMaterial: {
            select: {
              Name: true, // اسم المادة الفرعية في حال وجودها
            },
          },
          WarehouseFrom: {
            select: {
              WarehouseName: true, // المخزن الذي خرجت منه المواد (إذا كانت OUTGOING)
            },
          },
          WarehouseTo: {
            select: {
              WarehouseName: true, // المخزن الذي استقبل المواد (إذا كانت INCOMING)
            },
          },
        },
      });
  
      // تجميع الحركات حسب ParentMaterial.Id ووحدة القياس
      const aggregatedMovements = {};
  
      materialMovements.forEach((movement) => {
        const parentMaterialId = movement.ParentMaterial?.Id;
        const materialName = movement.ParentMaterial?.Name || movement.ChildMaterial?.Name;
        const unit = movement.UnitOfQuantity; // وحدة القياس

        // إذا كانت المادة الأم غير موجودة، يتم تخطي الحركة
        if (!parentMaterialId) return;
  
        // إذا كانت المادة الأم غير موجودة مسبقًا في التجميع، نقوم بإضافتها
        if (!aggregatedMovements[parentMaterialId]) {
          aggregatedMovements[parentMaterialId] = {
            parentMaterialId: parentMaterialId,
            materialName: materialName,
            category: movement.ParentMaterial?.Category?.CategoryName,
            movements: [],  // مصفوفة لحفظ الحركات الفردية
            quantities: {},  // كائن لتخزين الكميات حسب وحدة القياس
          };
        }
  
        // إضافة التفاصيل المتعلقة بكل حركة
        aggregatedMovements[parentMaterialId].movements.push({
          id: movement.Id,
          invoiceNumber: movement.InvoiceNumber,
          quantity: Number(movement.Quantity),  // الكمية الخاصة بكل حركة
          unit: unit, // وحدة القياس الخاصة بكل حركة
          movementDate: movement.MovementDate,
          description: movement.Description,
          movementType: movement.MovementType === 'INCOMING' ? 'Incoming' : movement.MovementType === 'OUTGOING' ? 'Outgoing' : 'Other',
          movementDestination: movement.MovementType === 'OUTGOING' 
            ? `Exported from ${movement.WarehouseFrom?.WarehouseName} to Supplier` 
            : `Imported from Supplier to ${movement.WarehouseTo?.WarehouseName}`,
        });
  
        // تحديث الكمية الواردة أو الصادرة بناءً على نوع الحركة
        const movementQuantity = Number(movement.Quantity);

        if (movement.MovementType === 'INCOMING') {
          if (!aggregatedMovements[parentMaterialId].quantities[unit]) {
            aggregatedMovements[parentMaterialId].quantities[unit] = {
              incomingQuantity: 0,
              outgoingQuantity: 0,
            };
          }
          aggregatedMovements[parentMaterialId].quantities[unit].incomingQuantity += movementQuantity;
        } else if (movement.MovementType === 'OUTGOING') {
          if (!aggregatedMovements[parentMaterialId].quantities[unit]) {
            aggregatedMovements[parentMaterialId].quantities[unit] = {
              incomingQuantity: 0,
              outgoingQuantity: 0,
            };
          }
          aggregatedMovements[parentMaterialId].quantities[unit].outgoingQuantity += movementQuantity;
        }
      });
  
      // حساب الكمية الصافية لكل مادة حسب وحدة القياس
      Object.values(aggregatedMovements).forEach(material => {
        material.quantities = Object.entries(material.quantities).map(([unit, qty]) => ({
          unit,
          incomingQuantity: Number(qty.incomingQuantity),
          outgoingQuantity: Number(qty.outgoingQuantity),
          netQuantity: Number(qty.incomingQuantity) - Number(qty.outgoingQuantity), // حساب الكمية الصافية
        }));
      });
  
      // تحويل النتيجة النهائية إلى مصفوفة
      const processedMovements = Object.values(aggregatedMovements);
  
      return res.status(200).send({
        status: 200,
        message: "تم الحساب بنجاح!",
        data: processedMovements,
      });
  
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  }

  
  
  


};

export default SupplierController;
