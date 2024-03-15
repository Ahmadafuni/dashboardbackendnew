import prisma from "../../client.js";

const OrderDetailsController = {
  createOrderDetails: async (req, res, next) => {
    const userId = req.userId;

    const { productCatalogue, orderNumber, quantityDetails, modelQuantity } =
      req.body;

    try {
      const orderDetail = await prisma.orderDetails.create({
        data: {
          ProductCatalogDetails: { connect: { Id: productCatalogue.id } },
          Orders: { connect: { Id: orderNumber.id } },
          QuantityDetails: quantityDetails,
          ModelQuantity: parseInt(modelQuantity),
          Audit: {
            create: {
              CreatedById: userId,
              UpdatedById: userId,
            },
          },
        },
      });

      return res.status(201).send({
        status: 201,
        message: "تم إنشاء تفاصيل الطلب بنجاح!",
        data: {},
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
  getOrderDetails: async (req, res, next) => {
    const page = parseInt(req.headers["page"]) || 1;
    const itemsPerPage = parseInt(req.headers["items-per-page"]) || 7;

    try {
      const skip = (page - 1) * itemsPerPage;
      const orderDetails = await prisma.orderDetails.findMany({
        skip: skip,
        take: itemsPerPage,
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          QuantityDetails: true,
          ModelQuantity: true,
          Orders: {
            select: {
              Id: true,
              OrderNumber: true,
            },
          },
          ProductCatalogDetails: {
            select: {
              Id: true,
              ProductCatalog: {
                select: {
                  ProductCatalogName: true,
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

      return res.status(200).send({
        status: 200,
        message: "تم جلب تفاصيل الطلب بنجاح.",
        data: {
          orderDetails,
          count: totalTemplates,
        },
      });
    } catch (error) {
      console.error("Failed to fetch order details:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا.",
      });
    }
  },
  updateOrderDetails: async (req, res, next) => {
    const orderDetailsId = req.params.id;
    const { productCatalogue, orderNumber, quantityDetails, modelQuantity } =
      req.body;

    try {
      const existingOrderDetail = await prisma.orderDetails.findUnique({
        where: {
          Id: parseInt(orderDetailsId),
        },
      });

      if (!existingOrderDetail) {
        return res.status(404).send({
          status: 404,
          message: "تفاصيل الطلب غير موجودة.",
        });
      }
      // Update the OrderDetails record
      const updatedOrderDetail = await prisma.orderDetails.update({
        where: {
          Id: parseInt(orderDetailsId),
        },
        data: {
          ProductCatalogDetails: { connect: { Id: productCatalogue.id } },
          Orders: { connect: { Id: orderNumber.id } },
          QuantityDetails: quantityDetails,
          ModelQuantity: parseInt(modelQuantity),
        },
      });

      return res.status(200).send({
        status: 200,
        message: "تم تحديث تفاصيل الطلب بنجاح.",
        data: updatedOrderDetail,
      });
    } catch (error) {
      console.error("Failed to update order details:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا.",
      });
    }
  },
  deleteOrderDetails: async (req, res, next) => {
    const id = req.params.id;

    const userId = req.userId;

    try {
      await prisma.orderDetails.update({
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

      return res.status(200).send({
        status: 200,
        message: "تم حذف تفاصيل الطلب بنجاح.",
      });
    } catch (error) {
      console.error("Failed to delete order details:", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا.",
      });
    }
  },
  getOrderDetailNames: async (req, res, next) => {
    try {
      const orderDetailNames = await prisma.orderDetails
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            QuantityDetails: true,
            Orders: {
              select: {
                Id: true,
              },
            },
          },
        })
        .then((orderDetails) =>
          orderDetails.map((orderDetail) => ({
            id: orderDetail.Id,
            name: `${orderDetail.Orders.Id} with ${orderDetail.QuantityDetails}`,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء تفاصيل الطلب بنجاح!",
        data: orderDetailNames,
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
  searchOrderDetails: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.orderDetails.findMany({
        where: {
          Orders: {
            OrderNumber: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          QuantityDetails: true,
          ModelQuantity: true,
          Orders: {
            select: {
              Id: true,
              OrderNumber: true,
            },
          },
          ProductCatalogDetails: {
            select: {
              Id: true,
              ProductCatalog: {
                select: {
                  ProductCatalogName: true,
                },
              },
            },
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
};

export default OrderDetailsController;
