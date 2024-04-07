import prisma from "../../client.js";

const ProductCatalogDetailController = {
  createDetail: async (req, res, next) => {
    const {
      grammage,
      standardWeight,
      category1,
      category2,
      description,
      productCatalog,
      season,
      templateType,
      textile,
      templatePattern,
    } = req.body;
    const userId = req.userId;
    try {
      await prisma.productCatalogDetails.create({
        data: {
          Grammage: grammage,
          StandardWeight: standardWeight,
          CategoryOne: { connect: { Id: +category1 } },
          CategoryTwo: { connect: { Id: +category2 } },
          Description: description,
          ProductCatalog: { connect: { Id: +productCatalog } },
          Season: season,
          TemplateType: { connect: { Id: +templateType } },
          TemplatePattern: { connect: { Id: +templatePattern } },
          Textile: { connect: { Id: +textile } },
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
    const catalogueId = req.params.id;
    try {
      const details = await prisma.productCatalogs.findUnique({
        where: {
          Id: +catalogueId,
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          ProductCatalogName: true,
          ProductCatalogDetails: {
            select: {
              Id: true,
              Grammage: true,
              StandardWeight: true,
              Description: true,
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
              Season: true,
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
              TemplatePattern: {
                select: {
                  Id: true,
                  TemplatePatternName: true,
                },
              },
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب التفاصيل بنجاح!",
        data: details,
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
          Id: id,
          Audit: {
            IsDeleted: false,
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
        data: {
          category1: detail.CategoryOneId.toString(),
          category2: detail.CategoryTwoId.toString(),
          description: detail.Description,
          grammage: detail.Grammage.toString(),
          standardWeight: detail.StandardWeight.toString(),
          season: detail.Season,
          templatePattern: detail.TemplatePatternId.toString(),
          templateType: detail.TemplateTypeId.toString(),
          textile: detail.TextileId.toString(),
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
      season,
      templateType,
      textile,
      templatePattern,
    } = req.body;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.productCatalogDetails.update({
        where: {
          Id: +id,
        },
        data: {
          Grammage: grammage,
          StandardWeight: standardWeight,
          CategoryOne: { connect: { Id: +category1 } },
          CategoryTwo: { connect: { Id: +category2 } },
          Description: description,
          Season: season,
          TemplateType: { connect: { Id: +templateType } },
          Textile: { connect: { Id: +textile } },
          TemplatePattern: { connect: { Id: +templatePattern } },
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
  // getCatalogueDetailNames: async (req, res, next) => {
  //   try {
  //     const catalogueDetailNames = await prisma.productCatalogDetails
  //       .findMany({
  //         where: {
  //           Audit: {
  //             IsDeleted: false,
  //           },
  //         },
  //         include: {
  //           ProductCatalog: true,
  //           Season: true,
  //           Textile: true,
  //         },
  //       })
  //       .then((details) =>
  //         details.map((detail) => ({
  //           id: detail.Id,
  //           name: `${detail.ProductCatalog.ProductCatalogName} with ${detail.Season.SeasonName}
  //       and  ${detail.Textile.TextileName}`,
  //         }))
  //       );

  //     // Return response
  //     return res.status(200).send({
  //       status: 200,
  //       message: "تم جلب أسماء تفاصيل الكتالوج بنجاح!",
  //       data: catalogueDetailNames,
  //     });
  //   } catch (error) {
  //     // Server error or unsolved error
  //     return res.status(500).send({
  //       status: 500,
  //       message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
  //       data: {},
  //     });
  //   }
  // },
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
  searchByCategory: async (req, res, next) => {
    const { categoryOne, categoryTwo, productCatalogue } = req.body;
    let whereClause = {};
    try {
      if (
        productCatalogue.length <= 0 &&
        categoryOne.length > 0 &&
        categoryTwo.length > 0
      ) {
        whereClause = {
          Audit: {
            IsDeleted: false,
          },
          AND: [
            {
              CategoryOneId: +categoryOne,
            },
            {
              CategoryTwoId: +categoryTwo,
            },
          ],
        };
      } else if (
        productCatalogue.length <= 0 &&
        (categoryOne.length > 0 || categoryTwo.length > 0)
      ) {
        whereClause = {
          Audit: {
            IsDeleted: false,
          },
          OR: [
            {
              CategoryOneId: +categoryOne | undefined,
            },
            {
              CategoryTwoId: +categoryTwo | undefined,
            },
          ],
        };
      } else if (
        productCatalogue.length > 0 &&
        categoryOne.length < 0 &&
        categoryTwo.length < 0
      ) {
        whereClause = {
          Audit: {
            IsDeleted: false,
          },
          ProductCatalogId: +productCatalogue,
        };
      } else if (
        productCatalogue.length > 0 &&
        categoryOne.length > 0 &&
        categoryTwo.length > 0
      ) {
        whereClause = {
          Audit: {
            IsDeleted: false,
          },
          AND: [
            {
              CategoryOneId: +categoryOne | undefined,
            },
            {
              CategoryTwoId: +categoryTwo | undefined,
            },
            {
              ProductCatalogId: +productCatalogue,
            },
          ],
        };
      } else if (
        productCatalogue.length > 0 &&
        (categoryOne.length > 0 || categoryTwo.length > 0)
      ) {
        whereClause = {
          Audit: {
            IsDeleted: false,
          },
          ProductCatalogId: +productCatalogue,
          OR: [
            {
              CategoryOneId: +categoryOne | undefined,
            },
            {
              CategoryTwoId: +categoryTwo | undefined,
            },
          ],
        };
      }

      const pcds = await prisma.productCatalogDetails
        .findMany({
          where: whereClause,
          select: {
            Id: true,
            ProductCatalog: {
              select: {
                ProductCatalogName: true,
              },
            },
            Season: true,
            Textile: {
              select: {
                TextileName: true,
              },
            },
            TemplatePattern: {
              select: {
                TemplatePatternName: true,
              },
            },
            TemplateType: {
              select: {
                TemplateTypeName: true,
              },
            },
          },
        })
        .then((details) =>
          details.map((detail) => ({
            value: detail.Id.toString(),
            label: `${detail.ProductCatalog.ProductCatalogName} for ${detail.Season} season, Textile: ${detail.Textile.TextileName}, Template Type: ${detail.TemplateType.TemplateTypeName}, Template Pattern: ${detail.TemplatePattern.TemplatePatternName}`,
          }))
        );
      if (pcds.length <= 0) {
        return res.status(404).send({
          status: 404,
          message: "Product catalogue details not found!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء تفاصيل الكتالوج بنجاح!",
        data: pcds,
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

export default ProductCatalogDetailController;
