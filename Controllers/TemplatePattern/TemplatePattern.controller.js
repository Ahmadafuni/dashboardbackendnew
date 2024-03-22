import prisma from "../../client.js";

const TemplatePatterController = {
  createPattern: async (req, res, next) => {
    const { name, description } = req.body;
    const userId = req.userId;
    try {
      await prisma.templatePatterns.create({
        data: {
          TemplatePatternName: name,
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
        message: "تم إنشاء نمط القالب بنجاح!",
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
  getPatterns: async (req, res, next) => {
    try {
      const templates = await prisma.templatePatterns.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          TemplatePatternName: true,
          Description: true,
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أنماط القوالب بنجاح!",
        data: templates,
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
  getPatternById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const pattern = await prisma.templatePatterns.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      if (!pattern) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "نمط القالب غير موجود!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أنماط القوالب بنجاح!",
        data: {
          name: pattern.TemplatePatternName,
          description: pattern.Description,
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
  deletePattern: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.templatePatterns.update({
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
        message: "تم حذف نمط القالب بنجاح!",
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
  updatePattern: async (req, res, next) => {
    const { name, description } = req.body;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.templatePatterns.update({
        where: {
          Id: +id,
        },
        data: {
          TemplatePatternName: name,
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
        message: "تم تحديث نمط القالب بنجاح!",
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
  getTemplatePatternNames: async (req, res, next) => {
    try {
      const templatePatternNames = await prisma.templatePatterns
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            TemplatePatternName: true,
          },
        })
        .then((patterns) =>
          patterns.map((pattern) => ({
            value: pattern.Id.toString(),
            label: pattern.TemplatePatternName,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء أنماط القوالب بنجاح!",
        data: templatePatternNames,
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
      const datas = await prisma.templatePatterns.findMany({
        where: {
          TemplatePatternName: {
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
export default TemplatePatterController;
