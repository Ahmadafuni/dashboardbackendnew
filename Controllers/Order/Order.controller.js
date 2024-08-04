import prisma from "../../client.js";

const OrderController = {

  createOrder: async (req, res, next) => {
    const { orderName, collection, description, deadline, quantity, reasonText } = req.body;
    const file = req.file;
    const userId = req.userId;
    try {
      let currentOrder = await prisma.orders.count();
      currentOrder++;
      const createdOrder = await prisma.orders.create({
        data: {
          OrderNumber: `FO${currentOrder.toString().padStart(18, "0")}`,
          OrderName: orderName,
          Collection: {
            connect: {
              Id: +collection,
            },
          },
          Quantity: +quantity,
          Description: description,
          ReasonText: reasonText,
          DeadlineDate: new Date(deadline),
          FilePath: file
            ? `/${file.destination.split("/")[1]}/${file.filename}`
            : "",
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
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  getOrders: async (req, res, next) => {
    try {
      const orders = await prisma.orders.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          OrderName: true,
          OrderNumber: true,
          Collection: {
            select: {
              CollectionName: true,
            },
          },
          Description: true,
          DeadlineDate: true,
          Quantity: true,
          ReasonText: true,
          FilePath: true,
          Status: true,
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب الطلبات بنجاح!",
        data: orders,
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
        data: {
          collection: order.CollectionId.toString(),
          description: order.Description,
          orderName: order.OrderName,
          quantity: order.Quantity.toString(),
          deadline: order.DeadlineDate.toISOString().split("T")[0],
          reasonText: order.reasonText,
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
      // Delete all models
      const models = await prisma.models.findMany({
        where: {
          OrderId: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      for (var model of models) {
        await prisma.models.update({
          where: {
            Id: model.Id,
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
      }
      // Delete all variants
      const mVariants = await prisma.modelVarients.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          Model: {
            OrderId: +id,
          },
        },
      });

      for (const variant of mVariants) {
        await prisma.modelVarients.update({
          where: {
            Id: variant.Id,
          },
          data: {
            Audit: {
              update: {
                IsDeleted: true,
                UpdatedById: userId,
              },
            },
            TrakingModels: {
              update: {
                Audit: {
                  update: {
                    IsDeleted: true,
                    UpdatedById: userId,
                  },
                },
              },
            },
          },
        });
      }

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم حذف الطلب بنجاح!",
        data: {},
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

  updateOrder: async (req, res, next) => {
    const { orderName, collection, description, deadline, quantity, reasonText } = req.body;
    const file = req.file;
    const id = parseInt(req.params.id);
    const userId = req.userId;

    try {
      // Update the order with the provided details
      const isThere = await prisma.orders.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      const updatedOrder = await prisma.orders.update({
        where: {
          Id: id,
        },
        data: {
          OrderName: orderName,
          Collection: {
            connect: {
              Id: +collection,
            },
          },
          Quantity: +quantity,
          Description: description,
          DeadlineDate: new Date(deadline),
          ReasonText: reasonText,
          FilePath: file
            ? `/${file.destination.split("/")[1]}/${file.filename}`
            : isThere.FilePath,
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
            ReasonText: true,
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
          Status: true,
          ReasonText: true,
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
          ReasonText: true,
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

  startOrder: async (req, res, next) => {
    const id = req.params.id;
    const userId = req.userId;
    try {
      const order = await prisma.orders.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
          Status: "PENDING",
        },
      });
      if (!order) {
        return res.status(405).send({
          status: 405,
          message: "Order not found or the order already started!",
          data: {},
        });
      }

      const models = await prisma.models.count({
        where: {
          Order: {
            Id: +id,
          },
          Audit: {
            IsDeleted: false,
          },
        },
      });
      if (models <= 0) {
        return res.status(405).send({
          status: 405,
          message:
            "Can't start the order. Either there is no model added to the order or the order already started!",
          data: {},
        });
      }

      await prisma.orders.update({
        where: {
          Id: +id,
        },
        data: {
          Status: "ONGOING",
          Audit: {
            update: {
              data: {
                UpdatedById: userId,
              },
            },
          },
        },
      });

      await prisma.models.updateMany({
        where: {
          OrderId: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          RunningStatus: "RUNNING",
        },
      });

      await prisma.modelVarients.updateMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          Model: {
            OrderId: +id,
          },
          Status: "AWAITING",
        },
        data: {
          Status: "TODO",
        },
      });

      const trackings = await prisma.trakingModels.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          ModelVariant: {
            Model: {
              OrderId: +id,
            },
          },
          MainStatus: "AWAITING",
        },
      });

      for (let i = 0; i < trackings.length; i++) {
        await prisma.trakingModels.update({
          where: {
            Id: trackings[i].Id,
          },
          data: {
            MainStatus: "TODO",
            StartTime: new Date(),
            Audit: {
              update: {
                data: {
                  UpdatedById: userId,
                },
              },
            },
          },
        });
      }

      return res.status(200).send({
        status: 200,
        message: "Order Started!",
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

  holdOrder: async (req, res, next) => {
    const id = req.params.id;
    const userId = req.userId;
    const { reasonText } = req.body;

    try {
      const order = await prisma.orders.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
          Status: "ONGOING",
        },
      });

      if (!order) {
        return res.status(405).send({
          status: 405,
          message: "Order not found or the order already completed!",
          data: {},
        });
      }

      // Update the order status to ONHOLD
      await prisma.orders.update({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          Status: "ONHOLD",
          ReasonText: reasonText,
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      // Update the RunningStatus of all related models to PAUSED
      await prisma.models.updateMany({
        where: {
          OrderId: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          RunningStatus: "PAUSED",
          ReasonText: reasonText,
        },
      });

      // Update the RunningStatus of all related model variants to PAUSED
      await prisma.modelVarients.updateMany({
        where: {
          Model: {
            OrderId: +id,
            Audit: {
              IsDeleted: false,
            },
          },
        },
        data: {
          RunningStatus: "PAUSED",
          ReasonText: reasonText,
        },
      });

      return res.status(200).send({
        status: 200,
        message: "Order on hold successfully!",
        data: {},
      });
    } catch (error) {
      // Server error or unsolved error
      console.error(error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  restartOrder: async (req, res, next) => {
    const id = req.params.id;
    const userId = req.userId;
    try {
      const order = await prisma.orders.findFirst({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
          Status: "ONHOLD",
        },
      });

      if (!order) {
        return res.status(405).send({
          status: 405,
          message: "Order not found or the order already completed!",
          data: {},
        });
      }

      // Update the order status to ONGOING
      await prisma.orders.update({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          Status: "ONGOING",
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      // Update the RunningStatus of all related models to RUNNING
      await prisma.models.updateMany({
        where: {
          OrderId: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          RunningStatus: "RUNNING",
        },
      });

      // Update the RunningStatus of all related model variants to RUNNING
      await prisma.modelVarients.updateMany({
        where: {
          Model: {
            OrderId: +id,
            Audit: {
              IsDeleted: false,
            },
          },
        },
        data: {
          RunningStatus: "RUNNING",
        },
      });

      return res.status(200).send({
        status: 200,
        message: "Order restarted successfully!",
        data: {},
      });
    } catch (error) {
      // Server error or unsolved error
      console.error(error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  getOrderPercentage: async (req , res) => {

    try {
      const orders = await prisma.orders.findMany({
        include: { Models: true }
      });
  
      const ordersWithProgress = orders.map(order => {
        const totalModels = order.Models.length;
        const doneModels = order.Models.filter(model => model.Status === 'DONE').length;
        const donePercentage = totalModels > 0 ? (doneModels / totalModels) * 100 : 0;
  
        return {
          OrderId: order.Id,
          DonePercentage: donePercentage.toFixed(2), 
        };
      });
  
      res.json(ordersWithProgress);
    } catch (error) {
      // Server error or unsolved error
      console.error(error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }


  },


};
export default OrderController;
