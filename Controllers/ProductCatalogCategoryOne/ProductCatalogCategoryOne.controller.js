import prisma from "../../client.js";

const ProductCatalogCategoryOneController = {
  createCategory: async (req, res, next) => {


    const { name, description } = req.body;
    const userId = req.userId;
    try {
      await prisma.productCatalogCategoryOne.create({
        data: {
          CategoryName: name,
          CategoryDescription: description,
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
        message: "تم إنشاء الفئة بنجاح!",
        data: {},
      });
    } catch (error) {
      console.log("The Error", error);
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getAllCategories: async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const totalRecords = await prisma.productCatalogCategoryOne.count({});

    const totalPages = Math.ceil(totalRecords / size);
    try {
      const categories = await prisma.productCatalogCategoryOne.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        skip: (page - 1) * size,
        take: size ,
        select: {
          Id: true,
          CategoryName: true,
          CategoryDescription: true,
        },
      });

      // Return response
      return res.status(200).send({
        status: 200,
        totalPages,
        message: "تم جلب الفئات بنجاح!",
        data: categories,
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
  getCategoryById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const category = await prisma.productCatalogCategoryOne.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      if (!category) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "الفئة غير موجودة!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب الفئات بنجاح!",
        data: {
          name: category.CategoryName,
          description: category.CategoryDescription,
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
  deleteCategory: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.productCatalogCategoryOne.update({
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
        message: "تم حذف الفئة بنجاح!",
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
  updateCategory: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    const { name, description } = req.body;
    try {
      await prisma.productCatalogCategoryOne.update({
        where: {
          Id: +id,
        },
        data: {
          CategoryName: name,
          CategoryDescription: description,
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
        message: "تم تحديث الفئة بنجاح!",
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
  getCategoryOneNames: async (req, res, next) => {
    try {
      const categoryOneNames = await prisma.productCatalogCategoryOne
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            CategoryName: true,
          },
        })
        .then((categories) =>
          categories.map((category) => ({
            value: category.Id.toString(),
            label: category.CategoryName,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء الفئة واحد بنجاح!",
        data: categoryOneNames,
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
  searchPCCO: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }

      const datas = await prisma.productCatalogCategoryOne.findMany({
        where: {
          CategoryName: {
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

export default ProductCatalogCategoryOneController;
