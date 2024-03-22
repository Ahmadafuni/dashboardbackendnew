import prisma from "../../client.js";

const ProductCatalogTextileController = {
  createTextile: async (req, res, next) => {
    const { textileName, composition, textileType, description } = req.body;
    const userId = req.userId;
    try {
      await prisma.productCatalogTextiles.create({
        data: {
          TextileName: textileName,
          Composition: composition,
          TextileType: textileType,
          Description: description,
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
        message: "تم إنشاء النسيج بنجاح!",
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
  getAllTextiles: async (req, res, next) => {
    try {
      const textiles = await prisma.productCatalogTextiles.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          TextileName: true,
          Composition: true,
          TextileType: true,
          Description: true,
        },
      });

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب الأنسجة بنجاح!",
        data: textiles,
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
  getTextileById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const textile = await prisma.productCatalogTextiles.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          TextileName: true,
          Composition: true,
          TextileType: true,
          Description: true,
        },
      });
      if (!textile) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "النسيج غير موجود!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب الأنسجة بنجاح!",
        data: {
          textileName: textile.TextileName,
          textileType: textile.TextileType,
          composition: textile.Composition,
          description: textile.Description,
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
  deleteTextile: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.productCatalogTextiles.update({
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
        message: "تم حذف النسيج بنجاح!",
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
  updateTextile: async (req, res, next) => {
    const { textileName, composition, textileType, description } = req.body;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.productCatalogTextiles.update({
        where: {
          Id: +id,
        },
        data: {
          TextileName: textileName,
          Composition: composition,
          TextileType: textileType,
          Description: description,
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
        message: "تم تحديث النسيج بنجاح!",
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
  getCatalogueTextileNames: async (req, res, next) => {
    try {
      const catalogueTextileNames = await prisma.productCatalogTextiles
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            TextileName: true,
          },
        })
        .then((textiles) =>
          textiles.map((textile) => ({
            value: textile.Id,
            label: textile.TextileName,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء الأنسجة في الكتالوج بنجاح!",
        data: catalogueTextileNames,
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
  searchPCT: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.productCatalogTextiles.findMany({
        where: {
          TextileName: {
            contains: searchTerm,
            mode: "insensitive",
          },
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
export default ProductCatalogTextileController;
