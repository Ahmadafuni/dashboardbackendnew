import prisma from "../../client.js";

const TemplateSizeController = {
  createSize: async (req, res, next) => {
    // Adjusted destructuring to match the front-end structure
    const {
      templateSizeType,
      size,
      template,
      description,
      measurements,
      components,
    } = req.body;
    const userId = req.userId;

    const finalMeasurements = measurements.map((item) => ({
      MeasurementName: item.MeasurementName,
      MeasurementValue: item.MeasurementValue,
      MeasurementUnit: item.MeasurementUnit,
      Audit: {
        create: {
          CreatedById: userId,
          UpdatedById: userId,
        },
      },
    }));

    // Adjusted to match the Components model structure
    const finalComponents = components.map((component) => ({
      ComponentName: component.ComponentName,
      Description: component.Description,
      MaterialId: component.Material,
      Quantity: component.Quantity,
      UnitOfMeasure: component.UnitOfMeasure,
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
          Size: { connect: { Id: parseInt(size.id) } },
          Template: { connect: { Id: parseInt(template.id) } },
          Description: description,
          TemplateSizeType: templateSizeType.toLocaleUpperCase(),
          Measurements: { create: finalMeasurements },
          Components: { create: finalComponents },
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
      console.log(error);
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getSizes: async (req, res, next) => {
    const page = parseInt(req.headers["page"]) || 1;
    const itemsPerPage = parseInt(req.headers["items-per-page"]) || 7;

    try {
      const skip = (page - 1) * itemsPerPage;
      const sizes = await prisma.templateSizes.findMany({
        skip: skip,
        take: itemsPerPage,
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          Size: true,
          Template: true,
          Measurements: true,
          Components: true,
        },
      });

      const totalTemplates = await prisma.templateSizes.count({
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
        message: "تم جلب أحجام القوالب بنجاح!",
        data: {
          sizes,
          count: totalTemplates,
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
          message: "حجم القالب غير موجود!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أحجام القوالب بنجاح!",
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
      await prisma.measurements.deleteMany({
        where: {
          TemplateSize: {
            Id: +id,
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
      console.log("THe deletion error", error);
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  updateSize: async (req, res, next) => {
    const {
      templateSizeType,
      size,
      template,
      description,
      measurements,
      components,
    } = req.body;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      // First, delete existing Measurements and Components related to this TemplateSize
      await prisma.measurements.deleteMany({
        where: { TemplateSizeId: id },
      });
      await prisma.components.deleteMany({
        where: { TemplateSizeId: id },
      });

      // Then, update the TemplateSize and recreate Measurements and Components
      await prisma.templateSizes.update({
        where: { Id: id },
        data: {
          SizeId: size,
          TemplateId: template,
          Description: description,
          TemplateSizeType: templateSizeType,
          Measurements: {
            create: measurements.map((item) => ({
              MeasurementName: item.MeasurementName,
              MeasurementValue: item.MeasurementValue,
              MeasurementUnit: item.MeasurementUnit,
              Audit: {
                create: {
                  CreatedById: userId,
                  UpdatedById: userId,
                },
              },
            })),
          },
          Components: {
            create: components.map((component) => ({
              ComponentName: component.ComponentName,
              Description: component.Description,
              MaterialId: component.MaterialId,
              Quantity: component.Quantity,
              UnitOfMeasure: component.UnitOfMeasure,
              Audit: {
                create: {
                  CreatedById: userId,
                  UpdatedById: userId,
                },
              },
            })),
          },
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
      console.error("Error updating template size:", error);
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
