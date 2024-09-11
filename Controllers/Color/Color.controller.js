import prisma from "../../client.js";

const ColorController = {
  createColor: async (req, res, next) => {
    const { ColorName, Description, ColorCode } = req.body;
    const userId = req.userId;
    try {
      await prisma.colors.create({
        data: {
          ColorName: ColorName,
          ColorCode: ColorCode,
          Description: Description,
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
      const colors = await prisma.colors.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          ColorName: true,
          ColorCode: true,
          Description: true,
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
      const color = await prisma.colors.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          ColorName: true,
          ColorCode: true,
          Description: true,
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
      await prisma.colors.update({
        where: {
          Id: id,
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
    const { ColorName, Description, ColorCode } = req.body;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.colors.update({
        where: {
          Id: id,
        },
        data: {
          ColorName: ColorName,
          ColorCode: ColorCode,
          Description: Description,
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
  getColorNames: async (req, res, next) => {
    try {
      const colorNames = await prisma.colors
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
        })
        .then((colors) =>
          colors.map((color) => ({
            value: color.Id.toString(),
            label: color.ColorName,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء الألوان بنجاح!",
        data: colorNames,
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
  searchColor: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }

      const datas = await prisma.colors.findMany({
        where: {
          OR: [
            {
              ColorName: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              ColorCode: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          ],
          Audit: {
            IsDeleted: false,
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

export default ColorController;
