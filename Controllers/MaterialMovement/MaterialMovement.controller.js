import prisma from "../../client.js";

const MaterialMovementController = {
  createMaterialMovement: async (req, res, next) => {
    const {
      movementType,
      parentMaterialId,
      childMaterialId,
      quantity,
      unitOfQuantity,
      description,
      movementDate,
      warehouseFromId,
      warehouseToId,
      supplierId,
      departmentFromId,
      departmentToId,
      modelId,
      invoiceNumber,
    } = req.body;
    const userId = req.userId;

    console.log("Received request to create material movement with data:", req.body);

    try {
      const data = {
        MovementType: movementType,
        InvoiceNumber: invoiceNumber,
        ParentMaterial: parentMaterialId ? { connect: { Id: +parentMaterialId } } : undefined,
        ChildMaterial: childMaterialId ? { connect: { Id: +childMaterialId } } : undefined,
        Quantity: parseFloat(quantity),
        UnitOfQuantity: unitOfQuantity,
        Description: description,
        MovementDate: new Date(movementDate),
        WarehouseFrom: warehouseFromId ? { connect: { Id: +warehouseFromId } } : undefined,
        WarehouseTo: warehouseToId ? { connect: { Id: +warehouseToId } } : undefined,
        Supplier: supplierId ? { connect: { Id: +supplierId } } : undefined,
        DepartmentFrom: departmentFromId ? { connect: { Id: +departmentFromId } } : undefined,
        DepartmentTo: departmentToId ? { connect: { Id: +departmentToId } } : undefined,
        Model: modelId ? { connect: { Id: +modelId } } : undefined,
        Audit: {
          create: {
            CreatedById: userId,
            UpdatedById: userId,
          },
        },
      };

      // Remove undefined properties
      Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

      console.log("Processed data for creating material movement:", data);

      const newMovement = await prisma.materialMovement.create({
        data: data,
      });

      console.log("Material movement created successfully:", newMovement);

      // Return success response
      return res.status(201).send({
        status: 201,
        message: "تم إنشاء حركة المواد الجديدة بنجاح!",
        data: newMovement,
      });
    } catch (error) {
      console.error("Error creating material movement:", error);

      // Handle error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  getAllMaterialMovements: async (req, res, next) => {
    const page = parseInt(req.headers["page"]) || 1;
    const itemsPerPage = parseInt(req.headers["items-per-page"]) || 7;

    try {
      const skip = (page - 1) * itemsPerPage;
      const materialMovements = await prisma.materialMovement.findMany({
        skip: skip,
        take: itemsPerPage,
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          ParentMaterial: true,
          ChildMaterial: true,
          WarehouseFrom: true,
          WarehouseTo: true,
          Supplier: true,
          DepartmentFrom: true,
          DepartmentTo: true,
          Model: true,
        },
      });

      const totalTemplates = await prisma.materialMovement.count({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
      });

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب حركات المواد بنجاح!",
        data: {
          materialMovements,
          count: totalTemplates,
        },
      });
    } catch (error) {
      console.error("Error fetching material movements:", error);
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getMaterialMovementById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const materialMovement = await prisma.materialMovement.findUnique({
        where: {
          Id: id,
        },
        include: {
          ParentMaterial: true,
          ChildMaterial: true,
          WarehouseFrom: true,
          WarehouseTo: true,
          Supplier: true,
          DepartmentFrom: true,
          DepartmentTo: true,
          Model: true,
          Audit: {
            include: {
              CreatedBy: {
                select: {
                  Firstname: true,
                  Lastname: true,
                  Username: true,
                  Email: true,
                  PhoneNumber: true,
                },
              },
              UpdatedBy: {
                select: {
                  Firstname: true,
                  Lastname: true,
                  Username: true,
                  Email: true,
                  PhoneNumber: true,
                },
              },
            },
          },
        },
      });
      if (!materialMovement) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "لم يتم العثور على حركة المواد!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب حركات المواد بنجاح!",
        data: materialMovement,
      });
    } catch (error) {
      console.error("Error fetching material movement by ID:", error);
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  deleteMaterialMovement: async (req, res, next) => {
    const userId = req.userId;
    const id = parseInt(req.params.id);
    try {
      await prisma.materialMovement.update({
        where: {
          Id: id,
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
        message: "تم حذف حركة المواد بنجاح!",
        data: {},
      });
    } catch (error) {
      console.error("Error deleting material movement:", error);
      // Return response
      return res.status(404).send({
        status: 404,
        message: "لم يتم العثور على حركة المواد!",
        data: {},
      });
    }
  },
  updateMaterialMovement: async (req, res, next) => {
    const {
      MovementType,
      ParentMaterialId,
      ChildMaterialId,
      Quantity,
      UnitOfQuantity,
      Description,
      MovementDate,
      WarehouseFromId,
      WarehouseToId,
      SupplierId,
      DepartmentFromId,
      DepartmentToId,
      ModelId,
      InvoiceNumber, // Added InvoiceNumber
    } = req.body;
    const userId = req.userId;
    const id = parseInt(req.params.id);

    // Initialize the data object with fields that are always set
    let updateData = {
      MovementType,
      InvoiceNumber, // Added InvoiceNumber
      ParentMaterial: { connect: { Id: +ParentMaterialId } },
      ChildMaterial: ChildMaterialId ? { connect: { Id: +ChildMaterialId } } : {},
      Quantity: parseFloat(Quantity),
      UnitOfQuantity,
      Description,
      MovementDate: new Date(MovementDate),
      WarehouseFrom: WarehouseFromId ? { connect: { Id: +WarehouseFromId } } : {},
      WarehouseTo: WarehouseToId ? { connect: { Id: +WarehouseToId } } : {},
      Supplier: SupplierId ? { connect: { Id: +SupplierId } } : {},
      DepartmentFrom: DepartmentFromId ? { connect: { Id: +DepartmentFromId } } : {},
      DepartmentTo: DepartmentToId ? { connect: { Id: +DepartmentToId } } : {},
      Model: ModelId ? { connect: { Id: +ModelId } } : {},
      Audit: {
        update: {
          UpdatedById: userId,
        },
      },
    };

    try {
      await prisma.materialMovement.update({
        where: {
          Id: id,
        },
        data: updateData,
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم تحديث حركة المواد بنجاح!",
        data: {},
      });
    } catch (error) {
      console.error("Error updating material movement:", error);
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getIncomingMaterialMovements: async (req, res, next) => {
    try {
      const materialMovements = await prisma.materialMovement.findMany({
        where: {
          MovementType: 'INCOMING',
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          ParentMaterial: true,
          ChildMaterial: true,
          WarehouseFrom: true,
          WarehouseTo: true,
          Supplier: true,
          DepartmentFrom: true,
          DepartmentTo: true,
          Model: true,
        },
      });

      const incomingMaterialMovements = materialMovements.map((movement) => {
        let fromLocation =
            movement.Supplier?.Name ||
            movement.DepartmentFrom?.Name ||
            movement.WarehouseFrom?.WarehouseName;
        let toLocation =
            movement.DepartmentTo?.Name || movement.WarehouseTo?.WarehouseName;

        return {
          id: movement.Id,
          movedFrom: fromLocation,
          movedTo: toLocation,
          movementType: movement.MovementType,
          invoiceNumber: movement.InvoiceNumber,
          parentMaterial: movement.ParentMaterial.Name,
          childMaterial: movement.ChildMaterial.Name,
          quantity: movement.Quantity,
          unitOfQuantity: movement.UnitOfQuantity,
          description: movement.Description,
          movementDate: movement.MovementDate,
          warehouseFrom: movement.WarehouseFrom,
          warehouseTo: movement.WarehouseTo,
          supplier: movement.Supplier,
          departmentFrom: movement.DepartmentFrom,
          departmentTo: movement.DepartmentTo,
          model: movement.Model.Name,
        };
      });

      return res.status(200).send({
        status: 200,
        message: "تم جلب حركات المواد الواردة بنجاح!",
        data: incomingMaterialMovements
      });
    } catch (error) {
      console.error("Error fetching incoming material movements:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getMaterialMovementNames: async (req, res, next) => {
    try {
      const materialMovements = await prisma.materialMovement.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          ParentMaterial: true,
          ChildMaterial: true,
          WarehouseFrom: true,
          WarehouseTo: true,
          Supplier: true,
          DepartmentFrom: true,
          DepartmentTo: true,
          Model: true,
        },
      });

      const materialMovementNames = materialMovements.map((movement) => {
        let fromLocation =
            movement.Supplier?.Name ||
            movement.DepartmentFrom?.Name ||
            movement.WarehouseFrom?.WarehouseName;
        let toLocation =
            movement.DepartmentTo?.Name || movement.WarehouseTo?.WarehouseName;

        return {
          id: movement.Id,
          name: `${movement.ParentMaterial.Name} moved from ${fromLocation} to ${toLocation}`,
        };
      });

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء حركات المواد بنجاح!",
        data: materialMovementNames,
      });
    } catch (error) {
      console.error("Error fetching material movement names:", error);
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  searchMaterialMovements: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }

      const datas = await prisma.materialMovement.findMany({
        where: {
          OR: [
            {
              DepartmentFrom: {
                Name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              DepartmentTo: {
                Name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              WarehouseTo: {
                WarehouseName: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              WarehouseFrom: {
                WarehouseName: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              Material: {
                Name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              UnitOfQuantity: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              Supplier: {
                Name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
          ],
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          DepartmentFrom: {
            select: {
              Id: true,
              Name: true,
            },
          },
          Supplier: {
            select: {
              Id: true,
              Name: true,
            },
          },
          WarehouseFrom: {
            select: {
              Id: true,
              WarehouseName: true,
            },
          },
          Material: {
            select: {
              Id: true,
              Name: true,
            },
          },
          DepartmentTo: {
            select: {
              Id: true,
              Name: true,
            },
          },
          WarehouseTo: {
            select: {
              Id: true,
              WarehouseName: true,
            },
          },
        },
      });

      const updatedMaterialMovements = datas.map((movement) => {
        let fromLocation = movement.Supplier
            ? {
              id: movement.Supplier.Id,
              name: movement.Supplier.Name,
              from: "Supplier",
            }
            : movement.DepartmentFrom
                ? {
                  id: movement.DepartmentFrom.Id,
                  name: movement.DepartmentFrom.Name,
                  from: "Department",
                }
                : {
                  id: movement.WarehouseFrom.Id,
                  name: movement.WarehouseFrom.WarehouseName,
                  from: "Warehouse",
                };
        let toLocation = movement.DepartmentTo
            ? {
              id: movement.DepartmentTo.Id,
              name: movement.DepartmentTo.Name,
              to: "Department",
            }
            : movement.WarehouseTo
                ? {
                  id: movement.WarehouseTo.Id,
                  name: movement.WarehouseTo.WarehouseName,
                  to: "Warehouse",
                }
                : {
                  id: movement.Supplier.Id,
                  name: movement.Supplier.Name,
                  to: "Supplier",
                };

        return {
          id: movement.Id,
          materialName: {
            id: movement.Material.Id,
            name: movement.Material.Name,
          },
          from: fromLocation,
          to: toLocation,
          movementType: movement.MovementType,
          quantity: movement.Quantity,
          unitOfQuantity: movement.UnitOfQuantity,
          movementDate: movement.MovementDate,
        };
      });
      return res.status(200).send({
        status: 200,
        message: "تم البحث بنجاح!",
        data: updatedMaterialMovements,
      });
    } catch (error) {
      console.error("Error searching material movements:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
};

export default MaterialMovementController;
