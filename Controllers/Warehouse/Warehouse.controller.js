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
    try {
      const warehouses = await prisma.warehouses.findMany({
        where: {
          Audit: { IsDeleted: false },
        },
      });

      // Return response
      return res.status(200).send({
        status: 200,
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
};

export default WarehouseController;
