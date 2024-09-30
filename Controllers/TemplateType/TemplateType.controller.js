import prisma from "../../client.js";

const TemplateTypeController = {
  createType: async (req, res, next) => {
    const { name, description } = req.body;
    const userId = req.userId;
    try {
      await prisma.templateTypes.create({
        data: {
          TemplateTypeName: name,
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
        message: "تم إنشاء نوع القالب بنجاح!",
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
  getTypes: async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const totalRecords = await prisma.templateTypes.count({});

    const totalPages = Math.ceil(totalRecords / size);
    
    try {
      const types = await prisma.templateTypes.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        skip: (page - 1) * size,
        take: size ,
        select: {
          Id: true,
          TemplateTypeName: true,
          Description: true,
        },
      });

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أنواع القوالب بنجاح!",
        totalPages,
        data: types,
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
  getTypeById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const type = await prisma.templateTypes.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      if (!type) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "نوع القالب غير موجود!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أنواع القوالب بنجاح!",
        data: {
          name: type.TemplateTypeName,
          description: type.Description,
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
  deleteType: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.templateTypes.update({
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
        message: "تم حذف نوع القالب بنجاح!",
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
  updateType: async (req, res, next) => {
    const { name, description } = req.body;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.templateTypes.update({
        where: {
          Id: +id,
        },
        data: {
          TemplateTypeName: name,
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
        message: "تم تحديث نوع القالب بنجاح!",
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
  getTemplateTypeNames: async (req, res, next) => {
    try {
      const templateTypeNames = await prisma.templateTypes
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            TemplateTypeName: true,
          },
        })
        .then((templateTypes) =>
          templateTypes.map((templateType) => ({
            value: templateType.Id.toString(),
            label: templateType.TemplateTypeName,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء أنواع القوالب بنجاح!",
        data: templateTypeNames,
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
  searchTemplateTypes: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.templateTypes.findMany({
        where: {
          TemplateTypeName: {
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
export default TemplateTypeController;
