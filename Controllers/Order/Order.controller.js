import prisma from "../../client.js";

const OrderController = {
  createOrder: async (req, res, next) => {
    const userId = req.userId;

    try {
      // Destructure the order data directly from the request
      const { orderNumber, orderDate, totalAmount, status, season } = req.body;

      // Create a new order with the provided or default details
      const createdOrder = await prisma.orders.create({
        data: {
          OrderNumber: orderNumber,
          OrderDate: orderDate,
          TotalAmount: totalAmount,
          MainStatus: status,
          Season: { connect: { Id: season.id } },
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
        message: "تم إنشاء الطلب بنجاح!",
        data: createdOrder,
      });
    } catch (error) {
      // Server error or unsolved error
      console.log(error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getOrders: async (req, res, next) => {
    const page = parseInt(req.headers["page"]) || 1;
    const itemsPerPage = parseInt(req.headers["items-per-page"]) || 7;

    try {
      const skip = (page - 1) * itemsPerPage;
      const orders = await prisma.orders.findMany({
        skip: skip,
        take: itemsPerPage,
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          OrderNumber: true,
          OrderDate: true,
          TotalAmount: true,
          MainStatus: true,
          Season: {
            select: {
              Id: true,
              SeasonName: true,
            },
          },
        },
      });

      const totalTemplates = await prisma.orders.count({
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
        message: "تم جلب الطلبات بنجاح!",
        data: {
          orders,
          count: totalTemplates,
        },
      });
    } catch (error) {
      console.log(error);
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getOrderById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const order = await prisma.orders.findUnique({
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
      if (!order) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "الطلب غير موجود!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب الطلبات بنجاح!",
        data: order,
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
  deleteOrder: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.orders.update({
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
        message: "تم حذف الطلب بنجاح!",
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
  updateOrder: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;

    try {
      // Destructure the order data directly from the request
      const { orderDate, totalAmount, status, season } = req.body;

      // Update the order with the provided details
      const updatedOrder = await prisma.orders.update({
        where: {
          Id: id,
        },
        data: {
          OrderDate: orderDate,
          TotalAmount: totalAmount,
          MainStatus: status,
          Season: { connect: { Id: season.id } },
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم تحديث الطلب بنجاح!",
        data: updatedOrder,
      });
    } catch (error) {
      // Handle case where order is not found or other server errors
      if (error.code === "P2025") {
        return res.status(404).send({
          status: 404,
          message: "الطلب غير موجود!",
          data: {},
        });
      } else {
        return res.status(500).send({
          status: 500,
          message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
          data: {},
        });
      }
    }
  },
  getOrderNames: async (req, res, next) => {
    try {
      const orderNames = await prisma.orders
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            OrderNumber: true,
            OrderDate: true,
            TotalAmount: true,
          },
        })
        .then((orders) =>
          orders.map((order) => ({
            id: order.Id,
            name: `Order ${order.OrderNumber} dated ${
              order.OrderDate.toISOString().split("T")[0]
            } with amount ${order.TotalAmount}`,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء الطلبات بنجاح!",
        data: orderNames,
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
  getOrdersForDash: async (req, res, next) => {
    const page = parseInt(req.headers["page"]) || 1;
    const itemsPerPage = parseInt(req.headers["items-per-page"]) || 7;

    try {
      const skip = (page - 1) * itemsPerPage;
      const ordersForDash = await prisma.orders.findMany({
        skip: skip,
        take: itemsPerPage,
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          OrderNumber: true,
          OrderDate: true,
          Season: {
            select: {
              SeasonName: true,
            },
          },
          TotalAmount: true,
          MainStatus: true,
          Models: {
            select: {
              Id: true,
              ModelName: true,
              TrakingModels: {
                select: {
                  MainStatus: true,
                  StartTime: true,
                  EndTime: true,
                },
                orderBy: {
                  StartTime: "asc",
                },
              },
            },
          },
        },
      });

      const totalTemplates = await prisma.orders.count({
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

      // Transform the data to include orderStart and adjust the structure as needed
      const transformedData = ordersForDash.map((order) => ({
        orderNumber: order.OrderNumber,
        orderStart: order.Models.reduce((earliest, model) => {
          const modelStart = model.TrakingModels[0]?.StartTime;
          return modelStart < earliest || !earliest ? modelStart : earliest;
        }, null),
        endDate: order.OrderDate,
        season: order.Season.SeasonName,
        totalAmount: order.TotalAmount,
        MainStatus: order.MainStatus,
        models: order.Models.map((model) => ({
          id: model.Id,
          name: model.ModelName,
          statuses: model.TrakingModels.map((trakingModel) => ({
            status: trakingModel.MainStatus,
          })),
        })),
      }));

      return res.status(200).send({
        status: 200,
        message: "تم جلب الطلبات للوحة التحكم بنجاح!",
        data: {
          transformedData,
          count: totalTemplates,
        },
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
  searchOrder: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    const { from, to } = req.query;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }

      const orders = await prisma.orders.findMany({
        where: {
          OR: [
            {
              OrderNumber: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              Season: {
                SeasonName: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
          ],
          OrderDate: {
            gte: from ? new Date(from) : undefined,
            lte: to ? new Date(to) : undefined,
          },
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          OrderNumber: true,
          OrderDate: true,
          TotalAmount: true,
          MainStatus: true,
          Season: {
            select: {
              Id: true,
              SeasonName: true,
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم البحث عن الطلب بنجاح!",
        data: orders,
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
export default OrderController;
