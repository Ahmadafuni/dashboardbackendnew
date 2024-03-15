import prisma from "../../client.js";

const WarehouseController = {
  createWarehouse: async (req, res, next) => {
    const { name, location, capacity, manager } = req.body;
    const userId = req.userId;
    try {
      await prisma.warehouses.create({
        data: {
          WarehouseName: name,
          Location: location,
          Capacity: parseFloat(capacity),
          Manager: { connect: { Id: manager.id } },
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
    const userId = req.userId;

    const page = parseInt(req.headers["page"]) || 1;
    const itemsPerPage = parseInt(req.headers["items-per-page"]) || 7;

    const skip = (page - 1) * itemsPerPage;

    try {
      const warehouses = await prisma.warehouses.findMany({
        skip: skip,
        take: itemsPerPage,
        where: {
          Audit: { IsDeleted: false },
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

      const totalDeparts = await prisma.warehouses.count({
        where: {
          AND: [
            {
              Id: {
                not: userId,
              },
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
        message: "تم جلب جميع المستودعات بنجاح!",
        data: {
          warehouses,
          count: totalDeparts,
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
  getWarehouseById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const warehouse = await prisma.warehouses.findUnique({
        where: {
          Id: +id,
          Audit: { IsDeleted: false },
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
          Manager: {
            select: {
              Firstname: true,
              Lastname: true,
              Username: true,
              Email: true,
              PhoneNumber: true,
            },
          },
        },
      });
      // Return response
      if (!warehouse) {
        return res.status(404).send({
          status: 404,
          message: "المستودع غير موجود!",
          data: warehouse,
        });
      }
      return res.status(200).send({
        status: 200,
        message: "تم جلب جميع المستودعات بنجاح!",
        data: warehouse,
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
    const { name, location, capacity, manager } = req.body;
    const userId = req.userId;
    try {
      await prisma.warehouses.update({
        where: {
          Id: +id,
        },
        data: {
          WarehouseName: name,
          Location: location,
          Capacity: parseFloat(capacity),
          Manager: { connect: { Id: manager.id } },
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
            id: warehouse.Id,
            name: warehouse.WarehouseName,
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
