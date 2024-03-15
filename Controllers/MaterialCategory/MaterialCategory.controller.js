import prisma from "../../client.js";

const MaterialCategoryController = {
  createMaterialCategory: async (req, res, next) => {
    const { name, description } = req.body;
    const userId = req.userId;
    try {
      await prisma.materialCategories.create({
        data: {
          CategoryName: name,
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
        message: "تم إنشاء فئة المواد الجديدة بنجاح!",
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
  getAllMaterialCategories: async (req, res, next) => {
    const page = parseInt(req.headers["page"]) || 1;
    const itemsPerPage = parseInt(req.headers["items-per-page"]) || 7;

    try {
      const skip = (page - 1) * itemsPerPage;
      const materialCategories = await prisma.materialCategories.findMany({
        skip: skip,
        take: itemsPerPage,
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
      });
      const totalTemplates = await prisma.materialCategories.count({
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
        message: "تم جلب فئات المواد بنجاح!",
        data: {
          materialCategories,
          count: totalTemplates,
        },
      });
    } catch (error) {
      // Server error or unsolved error
      console.log(error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getMaterialCategoryById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const materialCategory = await prisma.materialCategories.findUnique({
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

      if (!materialCategory) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "لم يتم العثور على فئة المواد!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب فئات المواد بنجاح!",
        data: materialCategory,
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
  deleteMaterialCategory: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.materialCategories.update({
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
        message: "تم حذف فئة المواد بنجاح!",
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
  updateMaterialCategory: async (req, res, next) => {
    const { name, description } = req.body;
    const userId = req.userId;
    const id = parseInt(req.params.id);
    try {
      await prisma.materialCategories.update({
        where: {
          Id: +id,
        },
        data: {
          CategoryName: name,
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
        message: "تم تحديث فئة المواد بنجاح!",
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
  getMaterialCategoryNames: async (req, res, next) => {
    try {
      const materialCategoryNames = await prisma.materialCategories
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
        })
        .then((categories) =>
          categories.map((category) => ({
            id: category.Id,
            name: category.CategoryName,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء فئات المواد بنجاح!",
        data: materialCategoryNames,
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
  searchMaterialCategory: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.materialCategories.findMany({
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

export default MaterialCategoryController;
