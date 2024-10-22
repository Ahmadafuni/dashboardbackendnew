import prisma from "../../client.js";

const WarehouseController = {
  createWarehouse: async (req, res, next) => {
    const { name, location, capacity, category, description } = req.body;
    const userId = req.userId;
    try {
      await prisma.warehouses.create({
        data: {
          WarehouseName: name,
          Location: location,
          Capacity: capacity,
          CategoryName: category,
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
        message: "تم إنشاء المستودع بنجاح!",
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
  getAllWarehouses: async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const totalRecords = await prisma.warehouses.count({});

    const totalPages = Math.ceil(totalRecords / size);

    try {
      const warehouses = await prisma.warehouses.findMany({
        where: {
          Audit: { IsDeleted: false },
        },
        skip: (page - 1) * size,
        take: size ,
      });

      // Return response
      return res.status(200).send({
        status: 200,
        totalPages,
        message: "تم جلب جميع المستودعات بنجاح!",
        data: warehouses,
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
  getWarehouseById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const warehouse = await prisma.warehouses.findUnique({
        where: {
          Id: +id,
          Audit: { IsDeleted: false },
        },
      });
      // Return response
      if (!warehouse) {
        return res.status(404).send({
          status: 404,
          message: "المستودع غير موجود!",
          data: {},
        });
      }
      return res.status(200).send({
        status: 200,
        message: "تم جلب جميع المستودعات بنجاح!",
        data: {
          name: warehouse.WarehouseName,
          location: warehouse.Location,
          capacity: warehouse.Capacity,
          category: warehouse.CategoryName,
          description: warehouse.Description,
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
  deleteWarehouse: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.warehouses.update({
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
        message: "تم حذف المستودع بنجاح!",
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
  updateWarehouse: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const { name, location, capacity, category, description } = req.body;
    const userId = req.userId;
    try {
      await prisma.warehouses.update({
        where: {
          Id: +id,
        },
        data: {
          WarehouseName: name,
          Location: location,
          Capacity: capacity,
          CategoryName: category,
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
        message: "تم تحديث المستودع بنجاح!",
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
  getWarehouseNames: async (req, res, next) => {
    try {
      const warehouseNames = await prisma.warehouses
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            WarehouseName: true,
          },
        })
        .then((warehouses) =>
          warehouses.map((warehouse) => ({
            value: warehouse.Id.toString(),
            label: warehouse.WarehouseName,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء المستودعات بنجاح!",
        data: warehouseNames,
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
  searchWarehouse: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const warehouses = await prisma.warehouses.findMany({
        where: {
          WarehouseName: {
            contains: searchTerm,
            mode: "insensitive",
          },
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          Manager: {
            select: {
              Firstname: true,
              Lastname: true,
            },
          },
        },
      });

      return res.status(200).send({
        status: 200,
        message: "تم جلب المستودعات بنجاح!",
        data: warehouses,
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

  getWarehouseMaterials: async (req, res) => {
    try {
        const warehouseMaterials = await prisma.warehouses.findMany({
            where: {
                Audit: {
                    IsDeleted: false,
                },
            },
            select: {
                WarehouseName: true,
                Id: true,
                MaterialMovementTo: {
                    where: {
                        Audit: {
                            IsDeleted: false,
                        },
                    },
                    select: {
                        ParentMaterial: {
                            select: { Id: true, Name: true },
                        },
                        ChildMaterial: {
                            select: { Id: true, Name: true },
                        },
                        Quantity: true,
                        UnitOfQuantity: true,
                    },
                },
                MaterialMovementFrom: {
                    where: {
                        Audit: {
                            IsDeleted: false,
                        },
                    },
                    select: {
                        ParentMaterial: {
                            select: { Id: true, Name: true },
                        },
                        ChildMaterial: {
                            select: { Id: true, Name: true },
                        },
                        Quantity: true,
                        UnitOfQuantity: true,
                    },
                },
            },
        });

        const warehouseInventory = warehouseMaterials.map((warehouse) => {
            const parentMaterialsQuantities = {};
            let totalParentMaterials = 0; // To track total parent materials
            let totalChildMaterials = 0; // To track total child materials
            let totalQuantityByUnit = {}; // New object to track total quantities by unit

            // Helper function to add or update quantities in MaterialMovementTo
            const addQuantities = (materialId, materialName, childMaterialId, childMaterialName, quantity, unit) => {
                if (!parentMaterialsQuantities[materialId]) {
                    parentMaterialsQuantities[materialId] = {
                        materialName,
                        childMaterials: {},
                        unitQuantities: {}, // Track total quantities by unit
                    };
                    totalParentMaterials++;
                }

                if (childMaterialId) {
                    if (!parentMaterialsQuantities[materialId].childMaterials[childMaterialId]) {
                        parentMaterialsQuantities[materialId].childMaterials[childMaterialId] = {
                            childMaterialName,
                            quantity: 0,
                            unit,
                        };
                        totalChildMaterials++;
                    }
                    parentMaterialsQuantities[materialId].childMaterials[childMaterialId].quantity += quantity;
                }

                // Track total quantities per unit for the parent material
                if (!parentMaterialsQuantities[materialId].unitQuantities[unit]) {
                    parentMaterialsQuantities[materialId].unitQuantities[unit] = 0;
                }
                parentMaterialsQuantities[materialId].unitQuantities[unit] += quantity;

                // Add to the overall warehouse quantity tracking
                if (!totalQuantityByUnit[unit]) {
                    totalQuantityByUnit[unit] = 0;
                }
                totalQuantityByUnit[unit] += quantity;
            };

            // Helper function to subtract quantities in MaterialMovementFrom
            const subtractQuantities = (materialId, childMaterialId, quantity, unit) => {
                if (parentMaterialsQuantities[materialId]) {
                    if (parentMaterialsQuantities[materialId].childMaterials[childMaterialId]) {
                        parentMaterialsQuantities[materialId].childMaterials[childMaterialId].quantity -= quantity;

                        // Remove the child material if its quantity becomes zero or less
                        if (parentMaterialsQuantities[materialId].childMaterials[childMaterialId].quantity <= 0) {
                            delete parentMaterialsQuantities[materialId].childMaterials[childMaterialId];
                            totalChildMaterials--; // Decrease the child materials count
                        }
                    }

                    // Subtract from the total quantities by unit
                    if (parentMaterialsQuantities[materialId].unitQuantities[unit]) {
                        parentMaterialsQuantities[materialId].unitQuantities[unit] -= quantity;

                        // If the quantity for this unit becomes zero or less, we can remove it
                        if (parentMaterialsQuantities[materialId].unitQuantities[unit] <= 0) {
                            delete parentMaterialsQuantities[materialId].unitQuantities[unit];
                        }
                    }

                    // Subtract from overall warehouse quantity
                    if (totalQuantityByUnit[unit]) {
                        totalQuantityByUnit[unit] -= quantity;

                        // If the quantity for this unit becomes zero or less, remove it
                        if (totalQuantityByUnit[unit] <= 0) {
                            delete totalQuantityByUnit[unit];
                        }
                    }

                    // Remove the parent material if it has no child materials and no quantities left
                    if (
                        Object.keys(parentMaterialsQuantities[materialId].childMaterials).length === 0 &&
                        Object.keys(parentMaterialsQuantities[materialId].unitQuantities).length === 0
                    ) {
                        delete parentMaterialsQuantities[materialId];
                        totalParentMaterials--; // Decrease the parent materials count
                    }
                }
            };

            // Process MaterialMovementTo to add materials and their children
            warehouse.MaterialMovementTo.forEach((movement) => {
                const { ParentMaterial, ChildMaterial, Quantity, UnitOfQuantity } = movement;
                if (ParentMaterial && ChildMaterial) {
                    addQuantities(ParentMaterial.Id, ParentMaterial.Name, ChildMaterial.Id, ChildMaterial.Name, parseFloat(Quantity), UnitOfQuantity);
                }
            });

            // Process MaterialMovementFrom to subtract materials and their children
            warehouse.MaterialMovementFrom.forEach((movement) => {
                const { ParentMaterial, ChildMaterial, Quantity, UnitOfQuantity } = movement;
                if (ParentMaterial && ChildMaterial) {
                    subtractQuantities(ParentMaterial.Id, ChildMaterial.Id, parseFloat(Quantity), UnitOfQuantity);
                }
            });

            // Prepare the final data structure
            const parentMaterialsData = Object.entries(parentMaterialsQuantities).map(([id, details]) => {
                const totalQuantitiesByUnit = Object.entries(details.unitQuantities).map(([unit, totalQuantity]) => ({
                    unit,
                    totalQuantity,
                }));

                return {
                    parentMaterialName: details.materialName,
                    totalQuantitiesByUnit, // Total quantity for each unit for the parent material
                    childMaterials: Object.entries(details.childMaterials).map(([childId, childDetails]) => ({
                        childMaterialId: childId,
                        childMaterialName: childDetails.childMaterialName,
                        quantity: childDetails.quantity,
                        unit: childDetails.unit,
                    })),
                };
            });

            return {
                Id: warehouse.Id,
                warehouseName: warehouse.WarehouseName,
                parentMaterialsData,
                totalParentMaterials, // Include the count of parent materials
                totalChildMaterials, // Include the count of child materials
                totalQuantityByUnit, // New: Total quantity by unit for the entire warehouse
            };
        });

        return res.status(200).send({
            status: 200,
            message: "تم جلب تفاصيل المستودعات بنجاح!",
            data: warehouseInventory,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            status: 500,
            message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
            data: {},
        });
    }
},

  
  
  
  
};

export default WarehouseController;
