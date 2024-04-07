import prisma from "../../client.js";

const TemplateController = {
  createTemplate: async (req, res, next) => {
    const file = req.file;
    const {
      name,
      description,
      productCatalog,
      category1,
      category2,
      templatePattern,
      templateType,
      season,
    } = req.body;
    const userId = req.userId;
    try {
      const template = await prisma.templates.create({
        data: {
          TemplateName: name,
          Description: description,
          Season: season,
          ProductCatalogue: { connect: { Id: +productCatalog } },
          CategoryOne: { connect: { Id: +category1 } },
          CategoryTwo: { connect: { Id: +category2 } },
          TemplatePattern: { connect: { Id: +templatePattern } },
          TemplateType: { connect: { Id: +templateType } },
          FilePath: file
            ? `/${file.destination.split("/")[1]}/${file.filename}`
            : "",
          Audit: {
            create: {
              CreatedById: userId,
              UpdatedById: userId,
            },
          },
        },
        select: {
          Id: true,
        },
      });
      // Return response
      return res.status(201).send({
        status: 201,
        message: "تم إنشاء القالب بنجاح!",
        data: template,
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
    try {
      const templates = await prisma.templates.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          TemplateName: true,
          Description: true,
          Season: true,
          FilePath: true,
          CategoryOne: {
            select: {
              CategoryName: true,
            },
          },
          CategoryTwo: {
            select: {
              CategoryName: true,
            },
          },
          ProductCatalogue: {
            select: {
              ProductCatalogName: true,
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
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب القوالب بنجاح!",
        data: templates,
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
        data: {
          name: template.TemplateName,
          description: template.Description,
          productCatalog: template.ProductCatalogId.toString(),
          category1: template.CategoryOneId.toString(),
          category2: template.CategoryTwoId.toString(),
          templatePattern: template.TemplatePatternId.toString(),
          templateType: template.TemplateTypeId.toString(),
          season: template.Season,
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
    const {
      name,
      description,
      productCatalog,
      category1,
      category2,
      templatePattern,
      templateType,
      season,
    } = req.body;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      const template = await prisma.templates.findUnique({
        where: {
          Id: id,
        },
      });

      if (!template) {
        return res.status(404).send({
          status: 404,
          message: "Template not found!",
          data: {},
        });
      }

      await prisma.templates.update({
        where: {
          Id: id,
        },
        data: {
          TemplateName: name,
          Description: description,
          Season: season,
          ProductCatalogue: { connect: { Id: +productCatalog } },
          CategoryOne: { connect: { Id: +category1 } },
          CategoryTwo: { connect: { Id: +category2 } },
          TemplatePattern: { connect: { Id: +templatePattern } },
          TemplateType: { connect: { Id: +templateType } },
          FilePath: file
            ? `/${file.destination.split("/")[1]}/${file.filename}`
            : template.FilePath,
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
  viewTemplateDetails: async (req, res, next) => {
    const id = +req.params.id;
    try {
      const template = await prisma.templates.findUnique({
        where: {
          Id: id,
        },
        select: {
          TemplateName: true,
          Description: true,
          Season: true,
          CategoryOne: {
            select: {
              CategoryName: true,
            },
          },
          CategoryTwo: {
            select: {
              CategoryName: true,
            },
          },
          ProductCatalogue: {
            select: {
              ProductCatalogName: true,
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
      });

      const cutting = await prisma.measurements.findMany({
        where: {
          TemplateSize: {
            TemplateId: id,
            TemplateSizeType: "CUTTING",
            Audit: {
              IsDeleted: false,
            },
          },
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          MeasurementName: true,
          MeasurementValue: true,
          MeasurementUnit: true,
          Size: {
            select: {
              SizeName: true,
            },
          },
        },
      });
      const formatedCutting = [];
      cutting.forEach((measurement) => {
        const size = measurement.Size.SizeName;

        const isThere = formatedCutting.find(
          (m) => m.MeasurementName === measurement.MeasurementName
        );

        if (!isThere) {
          const temp_object = {
            MeasurementName: measurement.MeasurementName,
            MeasurementUnit: measurement.MeasurementUnit,
          };
          temp_object[size] = measurement.MeasurementValue;
          formatedCutting.push(temp_object);
        } else {
          isThere[size] = measurement.MeasurementValue;
        }
      });

      const dressup = await prisma.measurements.findMany({
        where: {
          TemplateSize: {
            TemplateId: id,
            TemplateSizeType: "DRESSUP",
            Audit: {
              IsDeleted: false,
            },
          },
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          MeasurementName: true,
          MeasurementValue: true,
          MeasurementUnit: true,
          Size: {
            select: {
              SizeName: true,
            },
          },
        },
      });
      const formatedDressup = [];
      dressup.forEach((measurement) => {
        const size = measurement.Size.SizeName;

        const isThere = formatedDressup.find(
          (m) => m.MeasurementName === measurement.MeasurementName
        );

        if (!isThere) {
          const temp_object = {
            MeasurementName: measurement.MeasurementName,
            MeasurementUnit: measurement.MeasurementUnit,
          };
          temp_object[size] = measurement.MeasurementValue;
          formatedDressup.push(temp_object);
        } else {
          isThere[size] = measurement.MeasurementValue;
        }
      });

      const stages = await prisma.manufacturingStages.findMany({
        where: {
          TemplateId: id,
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          StageName: true,
          Department: {
            select: {
              Name: true,
            },
          },
          Duration: true,
          StageNumber: true,
          WorkDescription: true,
        },
      });

      return res.status(200).send({
        status: 200,
        message: "تم البحث بنجاح!",
        data: {
          template: template,
          cutting: formatedCutting,
          dressup: formatedDressup,
          stages: stages,
        },
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
};

export default TemplateController;
