import prisma from "../../client.js";

const OrderDetailColorController = {
  createColor: async (req, res, next) => {
    const { orderDetailId, colorId } = req.body;
    const userId = req.userId;
    try {
      await prisma.orderDetailColors.create({
        data: {
          OrderDetailId: orderDetailId,
          ColorId: colorId,
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
        message: "تم إنشاء اللون بنجاح!",
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
  getColors: async (req, res, next) => {
    try {
      const colors = await prisma.orderDetailColors.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          Color: true,
          OrderDetail: true,
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب اللون بنجاح!",
        data: colors,
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
  getColorById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const color = await prisma.orderDetailColors.findUnique({
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
      if (!color) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "اللون غير موجود!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب اللون بنجاح!",
        data: color,
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
  deleteColor: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.orderDetailColors.update({
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
        message: "تم حذف اللون بنجاح!",
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
  updateColor: async (req, res, next) => {
    const { orderDetailId, colorId } = req.body;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.orderDetailColors.update({
        where: {
          Id: +id,
        },
        data: {
          OrderDetailId: orderDetailId,
          ColorId: colorId,
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
        message: "تم تحديث اللون بنجاح!",
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
  getOrderDetailColorNames: async (req, res, next) => {
    try {
      const orderDetailColorNames = await prisma.orderDetailColors
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          include: {
            Color: true,
          },
        })
        .then((orderDetailColors) =>
          orderDetailColors.map((orderDetailColor) => ({
            id: orderDetailColor.Id,
            name: orderDetailColor.Color.ColorName,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء ألوان تفاصيل الطلب بنجاح!",
        data: orderDetailColorNames,
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

export default OrderDetailColorController;
