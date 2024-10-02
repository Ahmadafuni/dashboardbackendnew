import prisma from "../../client.js";

const OrderController = {
  createOrder: async (req, res, next) => {
    const {
      orderName,
      collection,
      description,
      deadline,
      quantity,
      stopData,
    } = req.body;
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
          StopData: stopData,
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

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const totalRecords = await prisma.orders.count({});

    const totalPages = Math.ceil(totalRecords / size);
    

    try {
      const orders = await prisma.orders.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        skip: (page - 1) * size,
        take: size ,
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
          FilePath: true,
          RunningStatus: true,
          StopData: true
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب الطلبات بنجاح!",
        totalPages,
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
          runningStatus: order.RunningStatus,
          stopData: order.StopData,
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
        where: { Id: id },
        data: {
          Audit: {
            update: {
              IsDeleted: true,
              UpdatedById: userId,
            },
          },
        },
      });

      const models = await prisma.models.findMany({
        where: {
          OrderId: id,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      for (const model of models) {
        await prisma.models.update({
          where: { Id: model.Id },
          data: {
            Audit: {
              update: {
                IsDeleted: true,
                UpdatedById: userId,
              },
            },
          },
        });

        // Find and update related model variants
        const mVariants = await prisma.modelVarients.findMany({
          where: {
            ModelId: model.Id,
            Audit: { IsDeleted: false },
          },
          select: { Id: true },
        });

        for (const variant of mVariants) {
          await prisma.modelVarients.update({
            where: { Id: variant.Id },
            data: {
              Audit: {
                update: {
                  IsDeleted: true,
                  UpdatedById: userId,
                },
              },
            },
          });

          const trackings = await prisma.trakingModels.findMany({
            where: {
              ModelVariantId: variant.Id,
              Audit: { IsDeleted: false },
            },
          });

          for (const track of trackings) {
            await prisma.trakingModels.update({
              where: { Id: track.Id },
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
        }
      }

      return res.status(200).send({
        status: 200,
        message: "تم حذف الطلب بنجاح!",
        data: {},
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  updateOrder: async (req, res, next) => {
    const {
      orderName,
      collection,
      description,
      deadline,
      quantity,
      stopData,
    } = req.body;
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
          StopData: stopData,
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
            RunningStatus: true,
            StopData: true,
          },
        })
        .then((orders) =>
          orders.map((order) => ({
            id: order.Id,
            name: `Order ${order.OrderNumber} dated ${order.OrderDate.toISOString().split("T")[0]
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
          StopData: true,
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
          RunningStatus: true,
          StopData: true,
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
      // Find the order and ensure it exists and is not started
      const order = await prisma.orders.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
          RunningStatus: "PENDING",
        },
      });
      if (!order) {
        return res.status(405).send({
          status: 405,
          message: "Order not found or the order already started!",
          data: {},
        });
      }

      // Fetch all models associated with the order
      const models = await prisma.models.findMany({
        where: {
          OrderId: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      // Ensure at least one model is added to the order
      if (models.length <= 0) {
        return res.status(405).send({
          status: 405,
          message: "Can't start the order. No models are added to the order!",
          data: {},
        });
      }

      // Check if every model has stages defined
      for (const model of models) {
        const stagesCount = await prisma.manufacturingStagesModel.count({
          where: {
            ModelId: model.Id,
            Audit: {
              IsDeleted: false,
            },
          },
        });

        if (stagesCount === 0) {
          return res.status(400).send({
            status: 400,
            message: `Model ${model.ModelName} has no manufacturing stages defined. Please define stages before starting.`,
            data: {},
          });
        }
      }

      // Update order status to ONGOING
      await prisma.orders.update({
        where: {
          Id: +id,
        },
        data: {
          RunningStatus: "ONGOING",
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

      // Update models to RUNNING status
      await prisma.models.updateMany({
        where: {
          OrderId: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          RunningStatus: "ONGOING",
          StartTime: new Date(),
        },
      });

      // Update modelVarients status
      await prisma.modelVarients.updateMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          Model: {
            OrderId: +id,
          },
          MainStatus: "AWAITING",
        },
        data: {
          MainStatus: "TODO",
          RunningStatus: "ONGOING",
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
      // Update trackings status
      for (let i = 0; i < trackings.length; i++) {
        await prisma.trakingModels.update({
          where: {
            Id: trackings[i].Id,
          },
          data: {
            MainStatus: "TODO",
            RunningStatus: "ONGOING",
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
    const stopDataFromBody = req.body.stopData;

    const newStopData = {
      ...stopDataFromBody,
      userId: req.userId,
      userDepartmentId: req.userDepartmentId,
      StartStopTime: new Date(),
      EndStopTime: null,
    };

    try {
      const order = await prisma.orders.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
          RunningStatus: "ONGOING",
        },
      });

      if (!order) {
        return res.status(405).send({
          status: 405,
          message: "Order not found or the order already completed!",
          data: {},
        });
      }

      // Fetch all models associated with the order
      const models = await prisma.models.findMany({
        where: {
          OrderId: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      // Check if every model has stages defined
      for (const model of models) {
        const stagesCount = await prisma.manufacturingStagesModel.count({
          where: {
            ModelId: model.Id,
            Audit: {
              IsDeleted: false,
            },
          },
        });

        if (stagesCount === 0) {
          return res.status(400).send({
            status: 400,
            message: `Model ${model.ModelName} has no manufacturing stages defined. Please define stages before starting.`,
            data: {},
          });
        }
      }

      let stopDataArray = [];
      if (order.StopData) {
        try {
          stopDataArray = Array.isArray(order.StopData)
              ? order.StopData
              : JSON.parse(order.StopData); // Ensure it's an array
        } catch (error) {
          console.error("Error parsing StopData:", error);
          stopDataArray = [];
        }
      }
      stopDataArray.push(newStopData);

      // Update the order status to ONHOLD
      await prisma.orders.update({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          RunningStatus: "ONHOLD",
          StopData: stopDataArray,
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
          RunningStatus: "ONHOLD",
          StopData: stopDataArray,
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
          RunningStatus: "ONHOLD",
          StopData: stopDataArray,
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
        },
      });
      // Update trackings status
      for (let i = 0; i < trackings.length; i++) {
        await prisma.trakingModels.update({
          where: {
            Id: trackings[i].Id,
          },
          data: {
            RunningStatus: "ONHOLD",
            StopData: stopDataArray,
          },
        });
      }

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
    const userDepartmentId= req.userDepartmentId;

    try {
      const order = await prisma.orders.findFirst({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
          RunningStatus: "ONHOLD",
        },
      });

      if (!order) {
        return res.status(405).send({
          status: 405,
          message: "Order not found or the order already completed!",
          data: {},
        });
      }

      let stopDataArray = [];
      if (order.StopData) {
        try {
          stopDataArray = typeof order.StopData === 'string'
              ? JSON.parse(order.StopData)
              : order.StopData;
        } catch (error) {
          console.error("Error parsing StopData:", error);
          return res.status(500).send({
            status: 500,
            message: "Invalid StopData format. Please check the data.",
            data: {},
          });
        }
      }

      if (stopDataArray.length === 0) {
        return res.status(400).send({
          status: 400,
          message: "No stop data found to update.",
          data: {},
        });
      }

      const latestStopData = stopDataArray[stopDataArray.length - 1];
      latestStopData.EndStopTime = new Date();
      latestStopData.userId =userId;
      latestStopData.userDepartmentId = userDepartmentId;

      await prisma.orders.update({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          RunningStatus: "ONGOING",
          StopData: stopDataArray,
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      // Update the RunningStatus of all related models to RUNNING and save StopData
      await prisma.models.updateMany({
        where: {
          OrderId: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          RunningStatus: "ONGOING",
          StopData: stopDataArray,
        },
      });

      // Update the RunningStatus of all related model variants to RUNNING and save StopData
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
          RunningStatus: "ONGOING",
          StopData: stopDataArray,
        },
      });

      // Update tracking status to ONGOING and save StopData
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
        },
      });

      for (let i = 0; i < trackings.length; i++) {
        await prisma.trakingModels.update({
          where: {
            Id: trackings[i].Id,
          },
          data: {
            RunningStatus: "ONGOING",
            StopData: stopDataArray,
          },
        });
      }

      return res.status(200).send({
        status: 200,
        message: "Order restarted successfully!",
        data: {},
      });
    } catch (error) {
      console.error("Error restarting the order:", error);
      return res.status(500).send({
        status: 500,
        message: "Internal server error. Please try again later!",
        data: {},
      });
    }
  },

};
export default OrderController;
