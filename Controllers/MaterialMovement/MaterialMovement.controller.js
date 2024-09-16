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
  getMaterialMovementsByMovementType: async (req, res, next) => {
    const movementType = req.params.type;
    console.log("Requested movement type:", req.params);
    try {
      const materialMovements = await prisma.materialMovement.findMany({
        where: {
          MovementType: movementType,
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

      const materialMovementRecord = materialMovements.map((movement) => {
        let fromLocation =
          movement.Supplier?.Name ||
          movement.DepartmentFrom?.Name ||
          movement.WarehouseFrom?.WarehouseName || "";
        let toLocation = movement.WarehouseTo?.WarehouseName ||
          movement.Supplier?.Name || movement.DepartmentTo?.Name || "";
        return {
          id: movement.Id,
          movedFrom: fromLocation,
          movedTo: toLocation,
          movementType: movement.MovementType,
          invoiceNumber: movement.InvoiceNumber,
          parentMaterialName: movement.ParentMaterial?.Name || "",
          childMaterialName: movement.ChildMaterial?.Name || "",
          parentMaterial: movement.ParentMaterial,
          childMaterial: movement.ChildMaterial ? movement.ChildMaterial : null,
          quantity: movement.Quantity,
          unitOfQuantity: movement.UnitOfQuantity,
          description: movement.Description,
          movementDate: movement.MovementDate,
          warehouseFrom: movement.WarehouseFrom,
          warehouseTo: movement.WarehouseTo,
          supplier: movement.Supplier,
          departmentFrom: movement.DepartmentFrom,
          departmentTo: movement.DepartmentTo,
          modelName: `${movement.Model?.DemoModelNumber ?? ''} ${movement.Model?.ModelName ?? ''}`,
          model: movement.Model
        };
      });

      return res.status(200).send({
        status: 200,
        message: "تم جلب حركات المواد بنجاح!",
        data: materialMovementRecord
      });
    } catch (error) {
      console.error("Error fetching material movements:", error);
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
  getMaterialReportMovements: async (req, res, next) => {
    const { searchTerm, startDate, endDate, parentMaterialId, childMaterialId, movementType } = req.query;

    try {
      const whereConditions = {
        Audit: {
          IsDeleted: false,
        },
      };

      if (searchTerm) {
        whereConditions.OR = [
          {
            DepartmentFrom: {
              Name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
          {
            DepartmentTo: {
              Name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
          {
            WarehouseTo: {
              WarehouseName: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
          {
            WarehouseFrom: {
              WarehouseName: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
          {
            Material: {
              Name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
          {
            UnitOfQuantity: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            Supplier: {
              Name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          },
        ];
      }

      if (startDate && endDate) {
        whereConditions.MovementDate = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      if (parentMaterialId) {
        whereConditions.ParentMaterialId = parseInt(parentMaterialId, 10);
      }

      if (childMaterialId) {
        whereConditions.ChildMaterialId = parseInt(childMaterialId, 10);
      }

      if (movementType) {
        whereConditions.MovementType = movementType;
      }

      const materialMovements = await prisma.materialMovement.findMany({
        where: whereConditions,
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

      const materialReport = materialMovements.map((movement) => ({
        id: movement.Id,
        movementType: movement.MovementType,
        invoiceNumber: movement.InvoiceNumber,
        parentMaterialName: movement.ParentMaterial?.Name || '',
        childMaterialName: movement.ChildMaterial?.Name || '',
        quantity: movement.Quantity,
        unitOfQuantity: movement.UnitOfQuantity,
        description: movement.Description,
        movementDate: movement.MovementDate,
        warehouseFrom: movement.WarehouseFrom?.WarehouseName || '',
        warehouseTo: movement.WarehouseTo?.WarehouseName || '',
        supplier: movement.Supplier?.Name || '',
        departmentFrom: movement.DepartmentFrom?.Name || '',
        departmentTo: movement.DepartmentTo?.Name || '',
        modelName: `${movement.Model?.DemoModelNumber ?? ''} ${movement.Model?.ModelName ?? ''}`,
      }));

      return res.status(200).send({
        status: 200,
        message: 'Material report generated successfully!',
        data: materialReport,
      });
    } catch (error) {
      console.error('Error generating material report:', error);
      return res.status(500).send({
        status: 500,
        message: 'Internal server error. Please try again later!',
        data: {},
      });

    }
  }
};

export default MaterialMovementController;
