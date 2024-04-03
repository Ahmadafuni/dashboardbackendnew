import prisma from "../../client.js";

const TemplateSizeController = {
  createSize: async (req, res, next) => {
    // Adjusted destructuring to match the front-end structure
    const { sizeType, measurements, templateId } = req.body;
    const userId = req.userId;

    let finalMeasurements = measurements.map((item) => ({
      MeasurementName: item.MeasurementName,
      MeasurementValue: item.MeasurementValue,
      MeasurementUnit: item.MeasurementUnit,
      Size: { connect: { Id: parseInt(item.SizeId) } },
      Audit: {
        create: {
          CreatedById: userId,
          UpdatedById: userId,
        },
      },
    }));

    try {
      await prisma.templateSizes.create({
        data: {
          Name: "Default",
          Template: { connect: { Id: parseInt(templateId) } },
          Description: "Default",
          TemplateSizeType: sizeType,
          Measurements: { create: finalMeasurements },
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
        message: "تم إنشاء حجم القالب بنجاح!",
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
    const templateId = req.params.id;
    try {
      const sizes = await prisma.templateSizes.findMany({
        where: {
          TemplateId: +templateId,
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          Name: true,
          Description: true,
          TemplateSizeType: true,
          Size: {
            select: {
              Id: true,
              SizeName: true,
            },
          },
          Template: {
            select: {
              Id: true,
              TemplateName: true,
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أحجام القوالب بنجاح!",
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
      const size = await prisma.templateSizes.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      if (!size) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "حجم القالب غير موجود!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أحجام القوالب بنجاح!",
        data: {
          description: size.Description,
          name: size.Name,
          size: size.SizeId.toString(),
          templateSizeType: size.TemplateSizeType,
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
  deleteSize: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.templateSizes.update({
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
      await prisma.measurements.updateMany({
        where: {
          TemplateSizeId: +id,
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
        message: "تم حذف حجم القالب بنجاح!",
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
    const { templateSizeType, size, name, description } = req.body;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      // Then, update the TemplateSize and recreate Measurements and Components
      await prisma.templateSizes.update({
        where: { Id: id },
        data: {
          Name: name,
          Size: { connect: { Id: +size } },
          Description: description,
          TemplateSizeType: templateSizeType,
          Audit: {
            create: {
              CreatedById: userId,
              UpdatedById: userId,
            },
          },
        },
      });

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم تحديث حجم القالب بنجاح!",
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
  getTemplateSizeNames: async (req, res, next) => {
    try {
      const templateSizeNames = await prisma.templateSizes
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          include: {
            Size: true,
          },
        })
        .then((templateSizes) =>
          templateSizes.map((templateSize) => ({
            id: templateSize.Id,
            name: templateSize.Size.SizeName,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء أحجام القوالب بنجاح!",
        data: templateSizeNames,
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
  searchTemplateSize: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.templateSizes.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          OR: [
            {
              Size: {
                SizeName: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
              Template: {
                TemplateName: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
          ],
        },
        include: {
          Size: true,
          Template: true,
          Measurements: true,
          Components: true,
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
export default TemplateSizeController;
