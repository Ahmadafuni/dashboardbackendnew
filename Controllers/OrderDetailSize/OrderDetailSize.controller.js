import prisma from "../../client.js";

const OrderDetailSizeController = {
  createSize: async (req, res, next) => {
    const { orderDetailId, sizeId } = req.body;
    const userId = req.userId;
    try {
      await prisma.orderDetailSizes.create({
        data: {
          OrderDetailId: orderDetailId,
          SizeId: sizeId,
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
        message: "تم إنشاء الحجم بنجاح!",
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
  getSizes: async (req, res, next) => {
    try {
      const sizes = await prisma.orderDetailSizes.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          OrderDetail: true,
          Size: true,
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب الأحجام بنجاح!",
        data: sizes,
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
  getSizeById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const size = await prisma.orderDetailSizes.findUnique({
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
      if (!size) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "الحجم غير موجود!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب الأحجام بنجاح!",
        data: size,
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
  deleteSize: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.orderDetailSizes.update({
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
        message: "تم حذف الحجم بنجاح!",
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
  updateSize: async (req, res, next) => {
    const { orderDetailId, sizeId } = req.body;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.orderDetailSizes.update({
        where: {
          Id: +id,
        },
        data: {
          OrderDetailId: orderDetailId,
          SizeId: sizeId,
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
        message: "تم تحديث الحجم بنجاح!",
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
  getOrderDetailSizes: async (req, res, next) => {
    try {
      const orderDetailSizes = await prisma.orderDetailSizes
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          include: {
            OrderDetail: true,
            Size: true,
          },
        })
        .then((details) =>
          details.map((detail) => ({
            id: detail.Id,
            name: `${detail.OrderDetail.OrderId} of size ${detail.Size.SizeName}`,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أحجام تفاصيل الطلب بنجاح!",
        data: orderDetailSizes,
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

export default OrderDetailSizeController;
