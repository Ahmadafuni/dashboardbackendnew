import prisma from "../../client.js";

const ProductCatalogDetailController = {
  createDetail: async (req, res, next) => {
    const {
      grammage,
      standardWeight,
      category1,
      category2,
      description,
      templateCatalog,
      season,
      templateType,
      textile,
    } = req.body;
    const userId = req.userId;
    try {
      await prisma.productCatalogDetails.create({
        data: {
          Grammage: grammage,
          StandardWeight: standardWeight,
          CategoryOne: { connect: { Id: category1.id } },
          CategoryTwo: { connect: { Id: category2.id } },
          Description: description,
          ProductCatalog: { connect: { Id: templateCatalog.id } },
          Season: { connect: { Id: season.id } },
          TemplateType: { connect: { Id: templateType.id } },
          Textile: { connect: { Id: textile.id } },
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
        message: "تم إنشاء التفصيل بنجاح!",
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
  getAllDetails: async (req, res, next) => {
    const page = parseInt(req.headers["page"]) || 1;
    const itemsPerPage = parseInt(req.headers["items-per-page"]) || 7;

    try {
      const skip = (page - 1) * itemsPerPage;
      const details = await prisma.productCatalogDetails.findMany({
        skip: skip,
        take: itemsPerPage,
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          CategoryOne: {
            select: {
              Id: true,
              CategoryName: true,
            },
          },
          CategoryTwo: {
            select: {
              Id: true,
              CategoryName: true,
            },
          },
          ProductCatalog: {
            select: {
              Id: true,
              ProductCatalogName: true,
            },
          },
          Season: {
            select: {
              Id: true,
              SeasonName: true,
            },
          },
          TemplateType: {
            select: {
              Id: true,
              TemplateTypeName: true,
            },
          },
          Textile: {
            select: {
              Id: true,
              TextileName: true,
            },
          },
        },
      });

      const totalDetails = await prisma.productCatalogDetails.count({
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
        message: "تم جلب التفاصيل بنجاح!",
        data: {
          details,
          count: totalDetails,
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
  getDetailById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const detail = await prisma.productCatalogDetails.findUnique({
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
      if (!detail) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "التفصيل غير موجود!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب التفاصيل بنجاح!",
        data: season,
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
  deleteDetail: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.productCatalogDetails.update({
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
        message: "تم حذف التفصيل بنجاح!",
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
  updateDetail: async (req, res, next) => {
    const {
      grammage,
      standardWeight,
      category1,
      category2,
      description,
      templateCatalog,
      season,
      templateType,
      textile,
    } = req.body;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.materials.update({
        where: {
          Id: +id,
        },
        data: {
          Grammage: grammage,
          StandardWeight: standardWeight,
          CategoryOne: { connect: { Id: category1.id } },
          CategoryTwo: { connect: { Id: category2.id } },
          Description: description,
          ProductCatalog: { connect: { Id: templateCatalog.id } },
          Season: { connect: { Id: season.id } },
          TemplateType: { connect: { Id: templateType.id } },
          Textile: { connect: { Id: textile.id } },
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
        message: "تم تحديث التفصيل بنجاح!",
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
  getCatalogueDetailNames: async (req, res, next) => {
    try {
      const catalogueDetailNames = await prisma.productCatalogDetails
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          include: {
            ProductCatalog: true,
            Season: true,
            Textile: true,
          },
        })
        .then((details) =>
          details.map((detail) => ({
            id: detail.Id,
            name: `${detail.ProductCatalog.ProductCatalogName} with ${detail.Season.SeasonName}
        and  ${detail.Textile.TextileName}`,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء تفاصيل الكتالوج بنجاح!",
        data: catalogueDetailNames,
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
  searchPCD: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }

      const datas = await prisma.productCatalogDetails.findMany({
        where: {
          OR: [
            {
              ProductCatalog: {
                ProductCatalogName: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
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
            {
              Textile: {
                TextileName: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              CategoryOne: {
                CategoryName: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              CategoryTwo: {
                CategoryName: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              TemplateType: {
                TemplateTypeName: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
          ],
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          CategoryOne: {
            select: {
              Id: true,
              CategoryName: true,
            },
          },
          CategoryTwo: {
            select: {
              Id: true,
              CategoryName: true,
            },
          },
          ProductCatalog: {
            select: {
              Id: true,
              ProductCatalogName: true,
            },
          },
          Season: {
            select: {
              Id: true,
              SeasonName: true,
            },
          },
          TemplateType: {
            select: {
              Id: true,
              TemplateTypeName: true,
            },
          },
          Textile: {
            select: {
              Id: true,
              TextileName: true,
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

export default ProductCatalogDetailController;
