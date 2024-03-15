import prisma from "../../client.js";

const MaterialMovementController = {
  createMaterialMovement: async (req, res, next) => {
    const {
      materialName,
      internalOrder,
      from,
      to,
      movementType,
      quantity,
      unitOfMeasure,
      status,
      notes,
    } = req.body;
    const userId = req.userId;

    // Initialize the data object with fields that are always set
    let movementData = {
      MovementType: movementType,
      Quantity: quantity,
      UnitOfMeasure: unitOfMeasure,
      InternalOrder: { connect: { Id: internalOrder.id } },
      Material: { connect: { Id: materialName.id } },
      Notes: notes,
      Status: status,
      Audit: {
        create: {
          CreatedById: userId,
          UpdatedById: userId,
        },
      },
    };

    // Dynamically update the 'from' field
    if (from.frTo === "Department") {
      movementData.FromDepartment = { connect: { Id: from.id } };
    } else if (from.frTo === "Supplier") {
      movementData.FromSupplier = { connect: { Id: from.id } };
    } else if (from.frTo === "Warehouse") {
      movementData.FromWarehouse = { connect: { Id: from.id } };
    }

    // Dynamically update the 'to' field
    if (to.frTo === "Department") {
      movementData.ToDepartment = { connect: { Id: to.id } };
    } else if (to.frTo === "Warehouse") {
      movementData.ToWarehouse = { connect: { Id: to.id } };
    } else if (to.frTo === "Supplier" && from.frTo !== "Supplier") {
      movementData.ToSupplier = { connect: { Id: to.id } };
    }

    try {
      await prisma.materialMovements.create({
        data: movementData,
      });
      // Return success response
      return res.status(201).send({
        status: 201,
        message: "تم إنشاء حركة المواد الجديدة بنجاح!",
        data: {},
      });
    } catch (error) {
      console.log(error);
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
      const materialMovements = await prisma.materialMovements.findMany({
        skip: skip,
        take: itemsPerPage,
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          FromDepartment: {
            select: {
              Id: true,
              Name: true,
            },
          },
          FromSupplier: {
            select: {
              Id: true,
              Name: true,
            },
          },
          FromWarehouse: {
            select: {
              Id: true,
              WarehouseName: true,
            },
          },
          InternalOrder: {
            select: {
              Id: true,
              Material: {
                select: {
                  Id: true,
                  Name: true,
                },
              },
              ApprovedBy: {
                select: {
                  Id: true,
                  Firstname: true,
                  Lastname: true,
                },
              },
              Department: {
                select: {
                  Id: true,
                  Name: true,
                },
              },
            },
          },
          Material: {
            select: {
              Id: true,
              Name: true,
            },
          },
          ToDepartment: {
            select: {
              Id: true,
              Name: true,
            },
          },
          ToWarehouse: {
            select: {
              Id: true,
              WarehouseName: true,
            },
          },
          ToSupplier: {
            select: {
              Id: true,
              Name: true,
            },
          },
        },
      });

      const updatedMaterialMovements = materialMovements.map((movement) => {
        let fromLocation = movement.FromSupplier
          ? {
              id: movement.FromSupplier.Id,
              name: movement.FromSupplier.Name,
              from: "Supplier",
            }
          : movement.FromDepartment
          ? {
              id: movement.FromDepartment.Id,
              name: movement.FromDepartment.Name,
              from: "Department",
            }
          : {
              id: movement.FromWarehouse.Id,
              name: movement.FromWarehouse.WarehouseName,
              from: "Warehouse",
            };
        let toLocation = movement.ToDepartment
          ? {
              id: movement.ToDepartment.Id,
              name: movement.ToDepartment.Name,
              to: "Department",
            }
          : movement.ToWarehouse
          ? {
              id: movement.ToWarehouse.Id,
              name: movement.ToWarehouse.WarehouseName,
              to: "Warehouse",
            }
          : {
              id: movement.ToSupplier.Id,
              name: movement.ToSupplier.Name,
              from: "Supplier",
            };

        return {
          id: movement.Id,
          materialName: {
            id: movement.Material.Id,
            name: movement.Material.Name,
          },
          internalOrder: {
            id: movement.InternalOrder.Id,
            name: `${movement.InternalOrder.Material.Name} in ${movement.InternalOrder.Department.Name} approved by ${movement.InternalOrder.ApprovedBy.Firstname} ${movement.InternalOrder.ApprovedBy.Lastname}`,
          },
          from: fromLocation,
          to: toLocation,
          movementType: movement.MovementType,
          quantity: movement.Quantity,
          unitOfMeasure: movement.UnitOfMeasure,
          status: movement.Status,
          notes: movement.Notes,
        };
      });

      const totalTemplates = await prisma.materialMovements.count({
        where: {
          AND: [
            {
              Audit: {
                IsDeleted: false,
              },
            },
          ],
        },
      });

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب حركات المواد بنجاح!",
        data: {
          updatedMaterialMovements,
          count: totalTemplates,
        },
      });
    } catch (error) {
      console.log("THE ERROR", error);
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getcreateMaterialMovementById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const materialMovements = await prisma.materialMovements.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
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
      if (!materialMovements) {
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
        data: materialMovements,
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
  deleteMaterialMovement: async (req, res, next) => {
    const userId = req.userId;
    const id = parseInt(req.params.id);
    try {
      await prisma.materialMovements.update({
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
      materialName,
      internalOrder,
      from,
      to,
      movementType,
      quantity,
      unitOfMeasure,
      status,
      notes,
    } = req.body;
    const userId = req.userId;
    const id = parseInt(req.params.id);

    // Initialize the data object with fields that are always set
    let updateData = {
      MovementType: movementType,
      Quantity: quantity,
      UnitOfMeasure: unitOfMeasure,
      InternalOrder: { connect: { Id: internalOrder.id } },
      Material: { connect: { Id: materialName.id } },
      Notes: notes,
      Status: status,
      Audit: {
        update: {
          UpdatedById: userId,
        },
      },
    };

    if (status === "COMPLETED") {
      updateData.CompletedAt = new Date();
    }

    // Dynamically update the 'from' field
    if (from.frTo === "Department") {
      updateData.FromDepartment = { connect: { Id: from.id } };
    } else if (from.frTo === "Supplier") {
      updateData.FromSupplier = { connect: { Id: from.id } };
    } else if (from.frTo === "Warehouse") {
      updateData.FromWarehouse = { connect: { Id: from.id } };
    }

    // Dynamically update the 'to' field
    if (to.frTo === "Department") {
      updateData.ToDepartment = { connect: { Id: to.id } };
    } else if (to.frTo === "Warehouse") {
      updateData.ToWarehouse = { connect: { Id: to.id } };
    }

    try {
      await prisma.materialMovements.update({
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
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getMaterialMovementNames: async (req, res, next) => {
    try {
      const materialMovements = await prisma.materialMovements.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          Material: true,
          FromSupplier: true,
          FromDepartment: true,
          FromWarehouse: true,
          ToDepartment: true,
          ToWarehouse: true,
        },
      });

      const materialMovementNames = materialMovements.map((movement) => {
        let fromLocation =
          movement.FromSupplier?.Name ||
          movement.FromDepartment?.Name ||
          movement.FromWarehouse?.WarehouseName;
        let toLocation =
          movement.ToDepartment?.Name || movement.ToWarehouse?.WarehouseName;

        return {
          id: movement.Id,
          name: `${movement.Material.Name} moved from ${fromLocation} to ${toLocation}`,
        };
      });

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء حركات المواد بنجاح!",
        data: materialMovementNames,
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

      const datas = await prisma.materialMovements.findMany({
        where: {
          OR: [
            {
              FromDepartment: {
                Name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              ToDepartment: {
                Name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              ToWarehouse: {
                WarehouseName: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              FromWarehouse: {
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
              UnitOfMeasure: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              FromSupplier: {
                Name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              ToSupplier: {
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
          FromDepartment: {
            select: {
              Id: true,
              Name: true,
            },
          },
          FromSupplier: {
            select: {
              Id: true,
              Name: true,
            },
          },
          FromWarehouse: {
            select: {
              Id: true,
              WarehouseName: true,
            },
          },
          InternalOrder: {
            select: {
              Id: true,
              Material: {
                select: {
                  Id: true,
                  Name: true,
                },
              },
              ApprovedBy: {
                select: {
                  Id: true,
                  Firstname: true,
                  Lastname: true,
                },
              },
              Department: {
                select: {
                  Id: true,
                  Name: true,
                },
              },
            },
          },
          Material: {
            select: {
              Id: true,
              Name: true,
            },
          },
          ToDepartment: {
            select: {
              Id: true,
              Name: true,
            },
          },
          ToWarehouse: {
            select: {
              Id: true,
              WarehouseName: true,
            },
          },
          ToSupplier: {
            select: {
              Id: true,
              Name: true,
            },
          },
        },
      });

      const updatedMaterialMovements = datas.map((movement) => {
        let fromLocation = movement.FromSupplier
          ? {
              id: movement.FromSupplier.Id,
              name: movement.FromSupplier.Name,
              from: "Supplier",
            }
          : movement.FromDepartment
          ? {
              id: movement.FromDepartment.Id,
              name: movement.FromDepartment.Name,
              from: "Department",
            }
          : {
              id: movement.FromWarehouse.Id,
              name: movement.FromWarehouse.WarehouseName,
              from: "Warehouse",
            };
        let toLocation = movement.ToDepartment
          ? {
              id: movement.ToDepartment.Id,
              name: movement.ToDepartment.Name,
              to: "Department",
            }
          : movement.ToWarehouse
          ? {
              id: movement.ToWarehouse.Id,
              name: movement.ToWarehouse.WarehouseName,
              to: "Warehouse",
            }
          : {
              id: movement.ToSupplier.Id,
              name: movement.ToSupplier.Name,
              from: "Supplier",
            };

        return {
          id: movement.Id,
          materialName: {
            id: movement.Material.Id,
            name: movement.Material.Name,
          },
          internalOrder: {
            id: movement.InternalOrder.Id,
            name: `${movement.InternalOrder.Material.Name} in ${movement.InternalOrder.Department.Name} approved by ${movement.InternalOrder.ApprovedBy.Firstname} ${movement.InternalOrder.ApprovedBy.Lastname}`,
          },
          from: fromLocation,
          to: toLocation,
          movementType: movement.MovementType,
          quantity: movement.Quantity,
          unitOfMeasure: movement.UnitOfMeasure,
          status: movement.Status,
          notes: movement.Notes,
        };
      });
      return res.status(200).send({
        status: 200,
        message: "تم البحث بنجاح!",
        data: updatedMaterialMovements,
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

export default MaterialMovementController;
