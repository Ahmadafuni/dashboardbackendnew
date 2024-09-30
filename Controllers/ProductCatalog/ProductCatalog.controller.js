import prisma from "../../client.js";

const ProductCatalogController = {
  createProductCatalog: async (req, res, next) => {
    const { name, description } = req.body;
    const userId = req.userId;
    try {
      await prisma.productCatalogs.create({
        data: {
          ProductCatalogName: name,
          ProductCatalogDescription: description,
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
        message: "تم إنشاء كتالوج المنتجات بنجاح!",
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
  getAllProductCatalogs: async (req, res, next) => {

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const totalRecords = await prisma.productCatalogs.count({});

    const totalPages = Math.ceil(totalRecords / size);
    
    try {
      const productCatalogs = await prisma.productCatalogs.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        skip: (page - 1) * size,
        take: size ,
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب كتالوجات المنتجات بنجاح!",
        totalPages,
        data: productCatalogs,
      });
    } catch (error) {
      console.log(error)
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getProductCatalogById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const productCatalog = await prisma.productCatalogs.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (!productCatalog) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "كتالوج المنتج غير موجود!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب كتالوجات المنتجات بنجاح!",
        data: {
          name: productCatalog.ProductCatalogName,
          description: productCatalog.ProductCatalogDescription,
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
  deleteProductCatalog: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.productCatalogs.update({
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
        message: "تم حذف كتالوجات المنتجات بنجاح!",
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
  updateProductCatalog: async (req, res, next) => {
    const { name, description } = req.body;
    const userId = req.userId;
    const id = parseInt(req.params.id);
    try {
      await prisma.productCatalogs.update({
        where: {
          Id: +id,
        },
        data: {
          ProductCatalogName: name,
          ProductCatalogDescription: description,
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
        message: "تم تحديث كتالوج المنتج بنجاح!",
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
  getProductCatalogueNames: async (req, res, next) => {
    try {
      const productCatalogueNames = await prisma.productCatalogs
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            ProductCatalogName: true,
          },
        })
        .then((catalogues) =>
          catalogues.map((catalogue) => ({
            value: catalogue.Id.toString(),
            label: catalogue.ProductCatalogName,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء كتالوجات المنتجات بنجاح!",
        data: productCatalogueNames,
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
  searchPC: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.productCatalogs.findMany({
        where: {
          ProductCatalogName: {
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

export default ProductCatalogController;
