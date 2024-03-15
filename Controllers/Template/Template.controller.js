import prisma from "../../client.js";

const TemplateController = {
  createTemplate: async (req, res, next) => {
    const file = req.file;
    const { name, description, productCatalogDetailId } = req.body;
    const userId = req.userId;
    try {
      await prisma.templates.create({
        data: {
          TemplateName: name,
          Description: description,
          ProductCatalogDetail: {
            connect: { Id: parseInt(productCatalogDetailId) },
          },
          FilePath: `/${file.destination.split("/")[1]}/${file.filename}`,
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
        message: "تم إنشاء القالب بنجاح!",
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
  getTemplates: async (req, res, next) => {
    const page = parseInt(req.headers["page"]) || 1;
    const itemsPerPage = parseInt(req.headers["items-per-page"]) || 7;

    try {
      const skip = (page - 1) * itemsPerPage;
      const templates = await prisma.templates.findMany({
        skip: skip,
        take: itemsPerPage,
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          ProductCatalogDetail: {
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

      const totalTemplates = await prisma.templates.count({
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
        message: "تم جلب القوالب بنجاح!",
        data: {
          templates,
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
  getTemplateById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const template = await prisma.templates.findUnique({
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
      if (!template) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "القالب غير موجود!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب القوالب بنجاح!",
        data: template,
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
  deleteTemplate: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.templates.update({
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
        message: "تم حذف القالب بنجاح!",
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
  updateTemplate: async (req, res, next) => {
    const file = req.file;
    const { name, description, productCatalogDetailId } = req.body;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    console.log("THE ID", req.body);
    try {
      await prisma.templates.update({
        where: {
          Id: +id,
        },
        data: {
          TemplateName: name,
          Description: description,
          ProductCatalogDetail: {
            connect: { Id: parseInt(productCatalogDetailId) },
          },
          FilePath: `/${file.destination.split("/")[1]}/${file.filename}`,
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
        message: "تم تحديث القالب بنجاح!",
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
  getTemplateNames: async (req, res, next) => {
    try {
      const templateNames = await prisma.templates
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            TemplateName: true,
          },
        })
        .then((templates) =>
          templates.map((template) => ({
            id: template.Id,
            name: template.TemplateName,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء القوالب بنجاح!",
        data: templateNames,
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
  searchTemplate: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.templates.findMany({
        where: {
          TemplateName: {
            contains: searchTerm,
            mode: "insensitive",
          },
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          ProductCatalogDetail: {
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

export default TemplateController;
