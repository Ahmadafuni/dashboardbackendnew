import prisma from "../../client.js";

const ModelController = {
  createModel: async (req, res, next) => {
    const {
      ProductCatalog,
      CategoryOne,
      CategoryTwo,
      Textile,
      Template,
      Characteristics,
      Barcode,
      LabelType,
      PrintName,
      PrintLocation,
      Description,
      Varients,
      DemoModelNumber,
      ReasonText,
    } = req.body;

    const orderId = req.params.id;
    const files = req.files;
    const userId = req.userId;
    try {
      const order = await prisma.orders.findUnique({
        where: {
          Id: +orderId,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      if (!order) {
        return res.status(404).send({
          status: 404,
          message: "Order not found!",
          data: {},
        });
      }
      if (order.Status !== "ONHOLD" && order.Status !== "PENDING") {
        return res.status(405).send({
          status: 405,
          message: "Order already started. Can't add new model!",
          data: {},
        });
      }

      const template = await prisma.templates.findUnique({
        where: {
          Id: +Template,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      if (!template) {
        return res.status(404).send({
          status: 404,
          message: "Template not found!",
          data: {},
        });
      }

      const mStages = await prisma.manufacturingStages.findMany({
        where: {
          TemplateId: template.Id,
          Audit: {
            IsDeleted: false,
          },
        },
        orderBy: {
          StageNumber: "asc",
        },
      });

      if (mStages.length <= 0) {
        return res.status(405).send({
          status: 405,
          message: "Please add stages to template!",
          data: {},
        });
      }

      const pCatalogue = await prisma.productCatalogs.findUnique({
        where: {
          Id: +ProductCatalog,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      if (!pCatalogue) {
        return res.status(404).send({
          status: 404,
          message: "Product catalogue not found!",
          data: {},
        });
      }

      const cOne = await prisma.productCatalogCategoryOne.findUnique({
        where: {
          Id: +CategoryOne,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      if (!cOne) {
        return res.status(404).send({
          status: 404,
          message: "Category one not found!",
          data: {},
        });
      }

      const modelImages = [];
      if (files.length > 0) {
        files.forEach((e) => {
          modelImages.push(`/${e.destination.split("/")[1]}/${e.filename}`);
        });
      }
      let modelCount = await prisma.models.count({});
      modelCount++;

      const model = await prisma.models.create({
        data: {
          ModelName: `${pCatalogue.ProductCatalogName}-${cOne.CategoryName}`,
          ModelNumber: `MN${modelCount.toString().padStart(18, "0")}`,
          DemoModelNumber: DemoModelNumber,
          Order: {
            connect: {
              Id: +orderId,
            },
          },
          OrderNumber: order.OrderNumber,
          CategoryOne: {
            connect: {
              Id: +CategoryOne,
            },
          },
          categoryTwo: {
            connect: {
              Id: +CategoryTwo,
            },
          },
          Textile: {
            connect: {
              Id: +Textile,
            },
          },
          ProductCatalog: {
            connect: {
              Id: +ProductCatalog,
            },
          },
          Template: {
            connect: {
              Id: +Template,
            },
          },
          Characteristics: Characteristics,
          Barcode: Barcode,
          LabelType: LabelType,
          PrintName: PrintName,
          Description: Description,
          PrintLocation: PrintLocation,
          ReasonText: ReasonText,
          Images: modelImages.join(","),
          Audit: {
            create: {
              CreatedById: userId,
              UpdatedById: userId,
            },
          },
        },
      });

      const revertVarients = JSON.parse(Varients);

      for (let i = 0; i < revertVarients.length; i++) {
        const nextStage = mStages[1] ? { connect: { Id: mStages[1].Id } } : {};
        await prisma.modelVarients.create({
          data: {
            Model: {
              connect: {
                Id: model.Id,
              },
            },
            Color: {
              connect: {
                Id: +revertVarients[i].Color,
              },
            },
            Sizes: JSON.stringify(revertVarients[i].Sizes),
            Quantity: +revertVarients[i].Quantity,
            Audit: {
              create: {
                CreatedById: userId,
                UpdatedById: userId,
              },
            },
            TrakingModels: {
              create: {
                CurrentStage: {
                  connect: {
                    Id: mStages[0].Id,
                  },
                },
                Audit: {
                  create: {
                    CreatedById: userId,
                    UpdatedById: userId,
                  },
                },
                NextStage: nextStage,
              },
            },
          },
        });
      }
      // Return response
      return res.status(201).send({
        status: 201,
        message: "تم إنشاء الموديل بنجاح!",
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

  getModelsByOrderId: async (req, res, next) => {
    const orderId = req.params.id;
    try {
      const models = await prisma.models.findMany({
        where: {
          OrderId: +orderId,
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          CategoryOne: true,
          categoryTwo: true,
          ProductCatalog: true,
          Template: true,
          Textile: true,
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب النماذج بنجاح!",
        data: models,
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

  getAllModels: async (req, res, next) => {
    try {
      const models = await prisma.models.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          CategoryOne: true,
          categoryTwo: true,
          ProductCatalog: true,
          Template: true,
          Textile: true,
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب النماذج بنجاح!",
        data: models,
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

  getModelById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const model = await prisma.models.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      if (!model) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "النموذج غير موجود!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب النماذج بنجاح!",
        data: {
          ProductCatalog: model.ProductCatalogId.toString(),
          CategoryOne: model.CategoryOneId.toString(),
          CategoryTwo: model.CategoryTwoId.toString(),
          Textile: model.TextileId.toString(),
          Template: model.TemplateId.toString(),
          ModelName: model.ModelName,
          Characteristics: model.Characteristics,
          Barcode: model.Barcode,
          LabelType: model.LabelType,
          PrintName: model.PrintName,
          PrintLocation: model.PrintLocation,
          Description: model.Description,
          DemoModelNumber: !model.DemoModelNumber ? "" : model.DemoModelNumber,
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

  deleteModel: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.models.update({
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
        message: "تم حذف النموذج بنجاح!",
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

  updateModel: async (req, res, next) => {
    const {
      ProductCatalog,
      CategoryOne,
      CategoryTwo,
      Textile,
      Template,
      Characteristics,
      Barcode,
      LabelType,
      PrintName,
      PrintLocation,
      Description,
      ModelName,
      DemoModelNumber,
    } = req.body;

    const files = req.files;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      const template = await prisma.templates.findUnique({
        where: {
          Id: +Template,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      if (!template) {
        return res.status(404).send({
          status: 404,
          message: "Template not found!",
          data: {},
        });
      }

      const modelImages = [];
      if (files.length > 0) {
        files.forEach((e) => {
          modelImages.push(`/${e.destination.split("/")[1]}/${e.filename}`);
        });
      }

      const model = await prisma.models.findUnique({
        where: {
          Id: id,
        },
      });

      await prisma.models.update({
        where: {
          Id: id,
        },
        data: {
          ModelName: ModelName,
          DemoModelNumber: DemoModelNumber,
          CategoryOne: {
            connect: {
              Id: +CategoryOne,
            },
          },
          categoryTwo: {
            connect: {
              Id: +CategoryTwo,
            },
          },
          Textile: {
            connect: {
              Id: +Textile,
            },
          },
          ProductCatalog: {
            connect: {
              Id: +ProductCatalog,
            },
          },
          Template: {
            connect: {
              Id: +Template,
            },
          },
          Characteristics: Characteristics,
          Barcode: Barcode,
          LabelType: LabelType,
          PrintName: PrintName,
          Description: Description,
          PrintLocation: PrintLocation,
          Images: modelImages.length > 0 ? modelImages.join(",") : model.Images,
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
        message: "تم تحديث النموذج بنجاح!",
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

  getModelNames: async (req, res, next) => {
    try {
      const modelNames = await prisma.models
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            ModelName: true,
          },
        })
        .then((models) =>
          models.map((model) => ({
            id: model.Id,
            name: model.ModelName,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء النماذج بنجاح!",
        data: modelNames,
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

  getProdModels: async (req, res, next) => {
    const userId = req.userId;
    try {
      // Find the department ID associated with the userId
      const user = await prisma.users.findUnique({
        where: {
          Id: parseInt(userId),
        },
        select: {
          Department: {
            select: {
              Id: true,
            },
          },
        },
      });

      const departId = user.Department.Id;

      // Find models that have tracking models associated with the user's department
      const prodModels = await prisma.models.findMany({
        where: {
          TrakingModels: {
            some: {
              DepartmentId: departId,
            },
          },
        },
        select: {
          Id: true,
          ModelName: true,
          Template: {
            select: {
              TemplateName: true,
            },
          },
          Color: {
            select: {
              ColorName: true,
            },
          },
          Size: {
            select: {
              SizeName: true,
            },
          },
          Quantity: true,
          Note: true,
          ModelImage: true,
          TrakingModels: {
            where: {
              DepartmentId: user.Department.Id,
            },
            select: {
              Id: true,
              MainStatus: true,
            },
          },
        },
      });

      // Transform the data to match the requested structure
      const transformedData = prodModels.map((model) => ({
        id: model.Id,
        departmentId: departId,
        modelName: model.ModelName,
        templateName: model.Template.TemplateName,
        color: model.Color.ColorName,
        size: model.Size.SizeName,
        quantity: model.Quantity,
        notes: model.Note,
        modelImage: model.ModelImage,
        trackingModels: model.TrakingModels.map((trackingModel) => ({
          trackingModelId: trackingModel.Id,
          status: trackingModel.MainStatus,
        })),
      }));

      return res.status(200).send({
        status: 200,
        message: "تم جلب نماذج الإنتاج بنجاح!",
        data: transformedData,
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

  searchModel: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    const { from, to } = req.query;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.models.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          OR: [
            {
              ModelName: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              Orders: {
                OrderNumber: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              Color: {
                ColorName: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              Size: {
                SizeName: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              Template: {
                TemplateName: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
          ],
          AND: [
            {
              Orders: {
                OrderDate: {
                  gte: from ? new Date(from) : undefined,
                  lte: to ? new Date(to) : undefined,
                },
              },
            },
          ],
        },
        select: {
          Id: true,
          ModelName: true,
          Quantity: true,
          QuantityDetails: true,
          Note: true,
          Color: {
            select: {
              Id: true,
              ColorName: true,
              ColorCode: true,
            },
          },
          Size: {
            select: {
              Id: true,
              SizeName: true,
            },
          },
          Orders: {
            select: {
              Id: true,
              OrderNumber: true,
            },
          },
          Template: {
            select: {
              Id: true,
              TemplateName: true,
            },
          },
          OrderDetail: {
            select: {
              Id: true,
              QuantityDetails: true,
            },
          },
        },
      });
      // Return Response
      return res.status(200).send({
        status: 200,
        message: "تم البحث عن النماذج بنجاح!",
        data: datas,
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

  getAllModelVarients: async (req, res, next) => {
    const id = req.params.id;
    try {
      const varients = await prisma.modelVarients
        .findMany({
          where: {
            ModelId: +id,
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            Color: {
              select: {
                ColorName: true,
              },
            },
            Sizes: true,
            Quantity: true,
            Status: true,
            ReasonText: true,
            RunningStatus: true,
            Model: {
              select: {
                ModelName: true,
                TemplateId: true,
              },
            },
          },
        })
        .then((varientss) =>
          varientss.map((e) => ({
            Id: e.Id,
            Color: e.Color.ColorName,
            Sizes: JSON.parse(e.Sizes),
            Model: e.Model.ModelName,
            Status: e.Status,
            Quantity: e.Quantity,
            TemplateId: e.Model.TemplateId,
            ReasonText: e.ReasonText,
            RunningStatus: e.RunningStatus,
          }))
        );

      // Return Response
      return res.status(200).send({
        status: 200,
        message: "Model varients :( fetched successfully!",
        data: varients,
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

  getModelVarientById: async (req, res, next) => {
    const id = req.params.id;
    try {
      const varient = await prisma.modelVarients.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          ColorId: true,
          Sizes: true,
          Quantity: true,
          RunningStatus: true,
          ReasonText: true,
        },
      });

      if (!varient) {
        return res.status(404).send({
          status: 404,
          message: "Varient not found!",
          data: {},
        });
      }

      return res.status(200).send({
        status: 200,
        message: "Model varients :) fetched successfully!",
        data: {
          Color: varient.ColorId.toString(),
          Sizes: JSON.parse(varient.Sizes),
          Quantity: varient.Quantity.toString(),
          RunningStatus: varient.RunningStatus.toString(),
          ReasonText: varient.ReasonText ? varient.ReasonText.toString() : "",
        },
      });
    } catch (error) {
      // Server error or unsolved error
      console.error(error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  createModelVarient: async (req, res, next) => {
    const id = req.params.id;
    const { Sizes, Color, Quantity } = req.body;
    const userId = req.userId;
    try {
      const isThere = await prisma.modelVarients.findFirst({
        where: {
          ColorId: +Color,
          ModelId: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (isThere) {
        return res.status(409).send({
          status: 409,
          message: "Color already exist!",
          data: {},
        });
      }

      await prisma.modelVarients.create({
        data: {
          Model: {
            connect: {
              Id: +id,
            },
          },
          Color: {
            connect: {
              Id: +Color,
            },
          },
          Sizes: JSON.stringify(Sizes),
          Quantity: +Quantity,
          Audit: {
            create: {
              CreatedById: +userId,
              UpdatedById: +userId,
            },
          },
        },
      });
      return res.status(201).send({
        status: 201,
        message: "Model varient created successfully!",
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

  updateModelVarient: async (req, res, next) => {
    const id = req.params.id;
    const { Sizes, Color, Quantity } = req.body;
    const userId = req.userId;
    try {
      const varient = await prisma.modelVarients.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (varient.Status !== "AWAITING") {
        return res.status(405).send({
          status: 405,
          message: "Model varient already in production. Cann't update!",
          data: {},
        });
      }

      await prisma.modelVarients.update({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          Color: {
            connect: {
              Id: +Color,
            },
          },
          Sizes: JSON.stringify(Sizes),
          Quantity: +Quantity,
          Audit: {
            update: {
              data: {
                UpdatedById: +userId,
              },
            },
          },
        },
      });
      return res.status(200).send({
        status: 200,
        message: "Model varient updated successfully!",
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

  deleteModelVarient: async (req, res, next) => {
    const id = req.params.id;
    const userId = req.userId;
    try {
      await prisma.modelVarients.update({
        where: {
          Id: +id,
        },
        data: {
          Audit: {
            update: {
              data: {
                UpdatedById: +userId,
                IsDeleted: true,
              },
            },
          },
        },
      });
      return res.status(200).send({
        status: 200,
        message: "Model varient deleted successfully!",
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

  getModelSummary: async (req, res, next) => {
    const id = req.params.id;
    try {
      const modelSummary = {};

      const model = await prisma.models.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          Template: true,
          CategoryOne: true,
          categoryTwo: true,
          Order: true,
          ProductCatalog: true,
          Textile: true,
          Audit: true,
          ModelVarients: {
            where: {
              Audit: {
                IsDeleted: false,
              },
            },
            include: {
              Color: true,
            },
          },
        },
      });

      const sizes = [];
      model.ModelVarients.forEach((e) => {
        let sizeArray;

        try {
          // Attempt to parse Sizes as JSON
          sizeArray = JSON.parse(e.Sizes);
          // Ensure that sizeArray is an array
          if (!Array.isArray(sizeArray)) {
            sizeArray = [sizeArray];
          }
        } catch (err) {
          // If parsing fails, treat Sizes as a plain string
          sizeArray = [e.Sizes];
        }

        // Iterate over the size array and collect unique sizes
        sizeArray.forEach((f) => {
          const sizeLabel = typeof f === "string" ? f : f.label;
          if (!sizes.includes(sizeLabel)) {
            sizes.push(sizeLabel);
          }
        });
      });

      modelSummary.modelInfo = {
        ModelDate: model.Audit.CreatedAt.toDateString(),
        ModelName: model.ModelName,
        ModelNumber: model.ModelNumber,
        OrderNumber: model.OrderNumber,
        Template: model.Template.TemplateName,
        CategoryOne: model.CategoryOne.CategoryName,
        CategoryTwo: model.categoryTwo.CategoryName,
        ProductCatalog: model.ProductCatalog.ProductCatalogName,
        FabricType: model.Textile.TextileType,
        Specification: model.Textile.TextileName,
        Characteristics: model.Characteristics,
        Barcode: model.Barcode,
        LabelType: model.LabelType,
        PrintName: model.PrintName,
        PrintLocation: model.PrintLocation,
        Description: model.Description,
        DeliveryDate: model.Order.DeadlineDate.toDateString(),
        Quantity: model.ModelVarients.reduce((a, c) => a + c.Quantity, 0),
        Colors: model.ModelVarients.map((v) => v.Color.ColorName).join("-"),
        Sizes: sizes.join("-"),
        Images: model.Images,
      };

      const cutting = await prisma.measurements.findMany({
        where: {
          TemplateSize: {
            TemplateId: model.TemplateId,
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

      const cuttingSizes = [];
      cutting.forEach((m) => {
        if (!cuttingSizes.includes(m.Size.SizeName)) {
          cuttingSizes.push(m.Size.SizeName);
        }
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

      formatedCutting.forEach((m) => {
        cuttingSizes.forEach((s) => {
          if (!m[s]) {
            m[s] = "0";
          }
        });
      });
      const dressup = await prisma.measurements.findMany({
        where: {
          TemplateSize: {
            TemplateId: model.TemplateId,
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

      const dressupSizes = [];
      dressup.forEach((m) => {
        if (!dressupSizes.includes(m.Size.SizeName)) {
          dressupSizes.push(m.Size.SizeName);
        }
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

      formatedDressup.forEach((m) => {
        dressupSizes.forEach((s) => {
          if (!m[s]) {
            m[s] = "0";
          }
        });
      });

      modelSummary.cutting = formatedCutting;
      modelSummary.dressup = formatedDressup;

      return res.status(200).send({
        status: 200,
        message: "Model summary fetched successfully!",
        data: modelSummary,
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

  holdModel: async (req, res, next) => {
    const id = req.params.id;
    const userId = req.userId;
    const { reasonText } = req.body;

    try {
      const model = await prisma.models.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
          RunningStatus: "RUNNING",
        },
      });

      if (!model) {
        return res.status(405).send({
          status: 405,
          message: "Model not found or already on hold!",
          data: {},
        });
      }

      // Update the model status to PAUSED
      await prisma.models.update({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          RunningStatus: "PAUSED",
          ReasonText: reasonText,
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      // Update the RunningStatus of all related model variants to PAUSED
      await prisma.modelVarients.updateMany({
        where: {
          ModelId: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          RunningStatus: "PAUSED",
          ReasonText: reasonText,
        },
      });

      return res.status(200).send({
        status: 200,
        message: "Model and its variants on hold successfully!",
        data: {},
      });
    } catch (error) {
      // Server error or unsolved error
      console.error(error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  restartModel: async (req, res, next) => {
    const id = req.params.id; // Model ID
    const userId = req.userId;
    const { reasonText } = req.body;

    try {
      const model = await prisma.models.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
          RunningStatus: "PAUSED",
        },
      });

      if (!model) {
        return res.status(405).send({
          status: 405,
          message: "Model not found or already running!",
          data: {},
        });
      }

      // Update the model status to RUNNING
      await prisma.models.update({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          RunningStatus: "RUNNING",
          ReasonText: reasonText,
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      // Update the RunningStatus of all related model variants to RUNNING
      await prisma.modelVarients.updateMany({
        where: {
          ModelId: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          RunningStatus: "RUNNING",
          ReasonText: reasonText,
        },
      });

      return res.status(200).send({
        status: 200,
        message: "Model and its variants restarted successfully!",
        data: {},
      });
    } catch (error) {
      // Server error or unsolved error
      console.error(error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  holdModelVarient: async (req, res, next) => {
    const id = req.params.id; // Model Variant ID
    const userId = req.userId;
    const { reasonText } = req.body;

    try {
      const modelVariant = await prisma.modelVarients.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
          RunningStatus: "RUNNING",
        },
      });

      if (!modelVariant) {
        return res.status(405).send({
          status: 405,
          message: "Model variant not found or already on hold!",
          data: {},
        });
      }

      // Update the model variant status to PAUSED
      await prisma.modelVarients.update({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          RunningStatus: "PAUSED",
          ReasonText: reasonText,
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      return res.status(200).send({
        status: 200,
        message: "Model variant on hold successfully!",
        data: {},
      });
    } catch (error) {
      // Server error or unsolved error
      console.error(error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  restartModelVarient: async (req, res, next) => {
    const id = req.params.id; // Model Variant ID
    const userId = req.userId;
    const { reasonText } = req.body;

    try {
      const modelVariant = await prisma.modelVarients.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
          RunningStatus: "PAUSED",
        },
      });

      if (!modelVariant) {
        return res.status(405).send({
          status: 405,
          message: "Model variant not found or already running!",
          data: {},
        });
      }

      // Update the model variant status to RUNNING
      await prisma.modelVarients.update({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          RunningStatus: "RUNNING",
          ReasonText: reasonText,
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      return res.status(200).send({
        status: 200,
        message: "Model variant restarted successfully!",
        data: {},
      });
    } catch (error) {
      // Server error or unsolved error
      console.error(error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  filterModel: async (req, res, next) => {
    const {
      status,
      productCatalogue,
      productCategoryOne,
      productCategoryTwo,
      textiles,
      templateType,
      templatePattern,
      startDate,
      endDate,
      orderNumber,
      demoModelNumber,
      barcode,
      currentStage,
    } = req.body;

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    const totalRecords = await prisma.models.count({});

    const totalPages = Math.ceil(totalRecords / size);

    let filter = {};

    if (status) {
      filter.Status = status;
    }

    if (productCatalogue) {
      filter.ProductCatalogId = parseInt(productCatalogue);
    }

    if (productCategoryOne) {
      filter.CategoryOneId = parseInt(productCategoryOne);
    }

    if (productCategoryTwo) {
      filter.CategoryTwoId = parseInt(productCategoryTwo);
    }

    if (textiles) {
      filter.TextileId = parseInt(textiles);
    }

    if (templateType || templatePattern) {
      filter.Template = {
        AND: [],
      };

      if (templateType) {
        filter.Template.AND.push({
          TemplateType: {
            TemplateTypeName: templateType,
          },
        });
      }

      if (templatePattern) {
        filter.Template.AND.push({
          TemplatePattern: {
            TemplatePatternName: templatePattern,
          },
        });
      }
    }

    if (startDate || endDate) {
      filter.Audit = {
        CreatedAt: {},
      };
      if (startDate) {
        filter.Audit.CreatedAt.gte = new Date(startDate);
      }
      if (endDate) {
        filter.Audit.CreatedAt.lte = new Date(endDate);
      }
    }

    if (orderNumber) {
      filter.OrderNumber = orderNumber;
    }

    if (demoModelNumber) {
      filter.DemoModelNumber = demoModelNumber;
    }

    if (barcode) {
      filter.Barcode = barcode;
    }

    try {
      if (currentStage) {
        const maxIds = await prisma.trakingModels.groupBy({
          by: ["ModelVariantId"],
          _max: {
            Id: true,
          },
        });

        const latestVariantsInCurrentStage =
          await prisma.trakingModels.findMany({
            where: {
              CurrentStageId: parseInt(currentStage),
              Id: {
                in: maxIds.map((item) => item._max.Id),
              },
            },
            select: {
              ModelVariantId: true,
            },
          });

        const modelVariants = await prisma.modelVarients.findMany({
          where: {
            Id: {
              in: latestVariantsInCurrentStage.map(
                (variantId) => variantId.ModelVariantId
              ),
            },
          },
          select: {
            ModelId: true,
          },
        });

        const modelIds = modelVariants.map((mv) => mv.ModelId);

        filter.Id = {
          in: modelIds,
        };
      }

      const models = await prisma.models.findMany({
        where: filter,
        orderBy: {
          Audit: {
            CreatedAt: "desc",
          },
        },
        skip: (page - 1) * size,
        take: size,

        select: {
          OrderId: true,
          DemoModelNumber: true,
          ModelName: true,
          Id: true,
          ProductCatalog: {
            select: {
              ProductCatalogName: true,
            },
          },
          CategoryOne: {
            select: {
              CategoryName: true,
            },
          },
          categoryTwo: {
            select: {
              CategoryName: true,
            },
          },
          Textile: {
            select: {
              TextileName: true,
            },
          },
          ModelVarients: {
            select: {
              Color: true,
              Sizes: true,
              Status: true,
              TrakingModels: {
                orderBy: {
                  Id: "desc",
                },
                take: 1,
                select: {
                  Id: true,
                  CurrentStage: {
                    select: {
                      StageName: true,
                    },
                  },
                  QuantityDelivered: true,
                  QuantityReceived: true,
                },
              },
            },
          },
          Audit: {
            select: {
              CreatedAt: true,
              UpdatedAt: true,
            },
          },
        },
      });

      const modelsWithProgress = models.map((model) => {
        const totalVarients = model.ModelVarients.length;
        const doneVarients = model.ModelVarients.filter(
          (varient) => varient.Status === "DONE"
        ).length;
        const donePercentage =
          totalVarients > 0 ? (doneVarients / totalVarients) * 100 : 0;

        return {
          ModelId: model.Id,
          DonePercentage: donePercentage.toFixed(2),
        };
      });

      const statuses = ["AWAITING", "TODO", "INPROGRESS", "DONE", "CHECKING"];
      const results = await Promise.all(
        statuses.map(async (status) => {
          const count = await prisma.modelVarients.groupBy({
            by: ["ModelId", "ColorId"],
            _count: {
              _all: true,
            },
            where: {
              Status: status,
            },
          });

          // Fetch color details
          const colorIds = [...new Set(count.map((item) => item.ColorId))];
          const colors = await prisma.colors.findMany({
            where: {
              Id: { in: colorIds },
            },
            select: {
              Id: true,
              ColorName: true,
            },
          });

          const colorMap = colors.reduce((acc, color) => {
            acc[color.Id] = color;
            return acc;
          }, {});

          return count.map((item) => ({
            status,
            modelId: item.ModelId,
            color: colorMap[item.ColorId],
          }));
        })
      );

      const finalResult = results.flat().reduce((acc, item) => {
        if (!acc[item.modelId]) {
          acc[item.modelId] = {};
        }
        acc[item.modelId][item.color.ColorName] = item.status;
        return acc;
      }, {});

      const modelsForOrdersColumn = await prisma.models.findMany({
        select: {
          OrderId: true,
          DemoModelNumber: true,
          Status: true,
        },
      });

      const groupedModelsForOrdersColumn = modelsForOrdersColumn.reduce(
        (acc, model) => {
          if (!acc[model.OrderId]) {
            acc[model.OrderId] = [];
          }
          acc[model.OrderId].push(model);
          return acc;
        },
        {}
      );

      const finalResultForOrdersColumn = Object.entries(
        groupedModelsForOrdersColumn
      ).reduce((acc, [orderId, orderModels]) => {
        const doneCount = orderModels.filter(
          (model) => model.Status === "DONE"
        ).length;
        const totalCount = orderModels.length;
        const percentage = ((doneCount / totalCount) * 100).toFixed(2);

        const stats = orderModels.reduce((modelAcc, model) => {
          modelAcc[model.DemoModelNumber] = model.Status;
          return modelAcc;
        }, {});

        acc[orderId] = {
          percentage: parseFloat(percentage),
          stats,
        };

        return acc;
      }, {});

      const result = await Promise.all(
        models.map(async (model) => {
          const totalDuration = Math.floor(
            (new Date(model.Audit.UpdatedAt) -
              new Date(model.Audit.CreatedAt)) /
              (1000 * 60 * 60 * 24)
          );

          const modelProgress = modelsWithProgress.find(
            (mod) => mod.ModelId == model.Id
          ).DonePercentage;

          const details = model.ModelVarients.flatMap((varient) => {
            return {
              Color: varient.Color.ColorName,
              Sizes: varient.Sizes,
              Quantity: varient.TrakingModels.map((trackingModel) => ({
                StageName: trackingModel.CurrentStage.StageName,
                QuantityDelivered: trackingModel.QuantityReceived
                  ? trackingModel.QuantityReceived.reduce(
                      (receivedOgj, received) => {
                        receivedOgj[received.size] = received.value;
                        return receivedOgj;
                      },
                      {}
                    )
                  : JSON.parse(varient.Sizes).reduce((emptyObj, size) => {
                      emptyObj[size] = "";
                      return emptyObj;
                    }, {}),
              }))[0],
            };
          });

          const modelStats = Object.keys(finalResult).reduce((acc, key) => {
            if (model.Id == key) {
              acc = finalResult[key];
            }
            return acc;
          }, {});

          const orderInfo = Object.keys(finalResultForOrdersColumn).reduce(
            (acc, key) => {
              if (model.OrderId == key) {
                acc = finalResultForOrdersColumn[key];
              }
              return acc;
            },
            {}
          );

          return {
            ModelId: model.Id,
            ModelStats: modelStats,
            ModelProgress: modelProgress,
            OrderId: model.OrderId,
            OrderStats: orderInfo.stats,
            OrderProgress: orderInfo.percentage,
            DemoModelNumber: model.DemoModelNumber,
            ModelName: model.ModelName,
            ProductCatalog: model.ProductCatalog.ProductCatalogName,
            CategoryOne: model.CategoryOne.CategoryName,
            CategoryTwo: model.categoryTwo.CategoryName,
            Textiles: model.Textile.TextileName,
            TotalDurationInDays: totalDuration,
            Details: details,
          };
        })
      );
      return res.status(200).send({
        status: 200,
        message: "Models fetched successfully!",
        totalPages,
        data: result,
      });
    } catch (error) {
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message:
          "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا! " + error,
        data: {},
      });
    }
  },

  getTasksStats: async (req, res) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const tasksStats = { PENDING: 0, ONGOING: 0, COMPLETED: 0 };
    const type = req.query.type || "monthly";

    const getDateRanges = (type) => {
      let start, end;

      if (type === "daily") {
        start = new Date(now.setDate(now.getDate() - now.getDay()));
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return [{ start, end }];
      } else if (type === "weekly") {
        start = new Date(currentYear, currentMonth, 1);
        end = new Date(currentYear, currentMonth + 1, 0);
        end.setHours(23, 59, 59, 999);
        return [{ start, end }];
      } else if (type === "monthly") {
        start = new Date(currentYear, 0, 1);
        end = new Date(currentYear, 11, 31);
        end.setHours(23, 59, 59, 999);
        return [{ start, end }];
      }
    };

    try {
      const dateRanges = getDateRanges(type);
      const tasksPromises = dateRanges.map(({ start, end }) =>
        prisma.tasks.findMany({
          include: {
            Audit: true,
          },
          where: {
            Audit: {
              CreatedAt: {
                gte: start,
                lte: end,
              },
            },
          },
        })
      );

      const allTasks = await Promise.all(tasksPromises);
      allTasks.forEach((tasks) => {
        tasks.forEach((taskay) => {
          switch (taskay.Status) {
            case "PENDING":
              tasksStats.PENDING++;
              break;
            case "ONGOING":
              tasksStats.ONGOING++;
              break;
            case "COMPLETED":
              tasksStats.COMPLETED++;
              break;
          }
        });
      });

      res.send(tasksStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getCollectionStats: async (req, res) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const collectionsStats = { PENDING: 0, ONGOING: 0, COMPLETED: 0 };
    const type = req.query.type || "monthly";

    const getDateRanges = (type) => {
      let start, end;

      if (type === "daily") {
        start = new Date(now.setDate(now.getDate() - now.getDay()));
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return [{ start, end }];
      } else if (type === "weekly") {
        start = new Date(currentYear, currentMonth, 1);
        end = new Date(currentYear, currentMonth + 1, 0);
        end.setHours(23, 59, 59, 999);
        return [{ start, end }];
      } else if (type === "monthly") {
        start = new Date(currentYear, 0, 1);
        end = new Date(currentYear, 11, 31);
        end.setHours(23, 59, 59, 999);
        return [{ start, end }];
      }
    };

    try {
      const dateRanges = getDateRanges(type);
      const collectionPromises = dateRanges.map(({ start, end }) =>
        prisma.collections.findMany({
          include: {
            Audit: true,
          },
          where: {
            Audit: {
              CreatedAt: {
                gte: start,
                lte: end,
              },
            },
          },
        })
      );

      const allCollections = await Promise.all(collectionPromises);
      allCollections.forEach((collection) => {
        collection.forEach((collec) => {
          switch (collec.Status) {
            case "PENDING":
              collectionsStats.PENDING++;
              break;
            case "ONGOING":
              collectionsStats.ONGOING++;
              break;
            case "COMPLETED":
              collectionsStats.COMPLETED++;
              break;
          }
        });
      });

      res.send(collectionsStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getModelStats: async (req, res) => {
    const { type } = req.query;
    const now = new Date();

    if (type == "daily") {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      try {
        const models = await prisma.models.findMany({
          include: { Audit: true },
          where: {
            Audit: {
              CreatedAt: {
                gte: startOfWeek,
                lte: endOfWeek,
              },
            },
          },
        });

        const modelsStats = Array(7)
          .fill()
          .map(() => ({
            awaiting: 0,
            inprogress: 0,
            done: 0,
          }));

        models.forEach((model) => {
          const day = model.Audit.CreatedAt.getDay();
          switch (model.Status) {
            case "AWAITING":
              modelsStats[day].awaiting += 1;
              break;
            case "INPROGRESS":
              modelsStats[day].inprogress += 1;
              break;
            case "DONE":
              modelsStats[day].done += 1;
              break;
          }
        });

        res.json(modelsStats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else if (type == "weekly") {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const daysInMonth = lastDayOfMonth.getDate();

      const weeks = [];
      let currentStart = new Date(firstDayOfMonth);

      for (let day = 1; day <= daysInMonth; day += 7) {
        let currentEnd = new Date(now.getFullYear(), now.getMonth(), day + 6);
        if (day + 6 >= 22) {
          currentEnd = new Date(now.getFullYear(), now.getMonth(), daysInMonth);
          weeks.push({
            startOfWeek: new Date(currentStart),
            endOfWeek: new Date(currentEnd),
          });
          break;
        }
        weeks.push({
          startOfWeek: new Date(currentStart),
          endOfWeek: new Date(currentEnd),
        });
        currentStart = new Date(currentEnd);
        currentStart.setDate(currentStart.getDate() + 1);
      }

      try {
        const modelsStats = weeks.map(() => ({
          awaiting: 0,
          inprogress: 0,
          done: 0,
        }));

        for (let i = 0; i < weeks.length; i++) {
          const { startOfWeek, endOfWeek } = weeks[i];

          const models = await prisma.models.findMany({
            include: { Audit: true },
            where: {
              Audit: {
                CreatedAt: {
                  gte: startOfWeek,
                  lte: endOfWeek,
                },
              },
            },
          });

          models.forEach((model) => {
            switch (model.Status) {
              case "AWAITING":
                modelsStats[i].awaiting += 1;
                break;
              case "INPROGRESS":
                modelsStats[i].inprogress += 1;
                break;
              case "DONE":
                modelsStats[i].done += 1;
                break;
            }
          });
        }

        res.json(modelsStats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else if (type == "monthly") {
      const currentYear = now.getFullYear();
      const months = [];

      for (let month = 0; month < 12; month++) {
        const firstDayOfMonth = new Date(currentYear, month, 1);
        const lastDayOfMonth = new Date(currentYear, month + 1, 0);
        months.push({
          startOfMonth: firstDayOfMonth,
          endOfMonth: lastDayOfMonth,
        });
      }

      try {
        const modelsStats = months.map(() => ({
          awaiting: 0,
          inprogress: 0,
          done: 0,
        }));

        for (let i = 0; i < months.length; i++) {
          const { startOfMonth, endOfMonth } = months[i];

          const models = await prisma.models.findMany({
            include: { Audit: true },
            where: {
              Audit: {
                CreatedAt: {
                  gte: startOfMonth,
                  lte: endOfMonth,
                },
              },
            },
          });

          models.forEach((model) => {
            switch (model.Status) {
              case "AWAITING":
                modelsStats[i].awaiting += 1;
                break;
              case "INPROGRESS":
                modelsStats[i].inprogress += 1;
                break;
              case "DONE":
                modelsStats[i].done += 1;
                break;
            }
          });
        }

        res.json(modelsStats);
      } catch (error) {
        console.error("Error generating report:", error);
        return res.status(500).send({
          status: 500,
          message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
          data: {},
        });
      }
    }
  },

  getOrdersStats: async (req, res) => {
    const { type } = req.query;
    const now = new Date();

    if (type == "daily") {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      try {
        const orders = await prisma.orders.findMany({
          include: { Audit: true },
          where: {
            Audit: {
              CreatedAt: {
                gte: startOfWeek,
                lte: endOfWeek,
              },
            },
          },
        });

        const ordersStats = Array(7)
          .fill()
          .map(() => ({
            pending: 0,
            ongoing: 0,
            completed: 0,
          }));

        orders.forEach((order) => {
          const day = order.Audit.CreatedAt.getDay();
          switch (order.Status) {
            case "PENDING":
              ordersStats[day].pending += 1;
              break;
            case "ONGOING":
              ordersStats[day].ongoing += 1;
              break;
            case "COMPLETED":
              ordersStats[day].completed += 1;
              break;
          }
        });

        res.json(ordersStats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else if (type == "weekly") {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const daysInMonth = lastDayOfMonth.getDate();

      const weeks = [];
      let currentStart = new Date(firstDayOfMonth);

      for (let day = 1; day <= daysInMonth; day += 7) {
        let currentEnd = new Date(now.getFullYear(), now.getMonth(), day + 6);
        if (day + 6 >= 22) {
          currentEnd = new Date(now.getFullYear(), now.getMonth(), daysInMonth);
          weeks.push({
            startOfWeek: new Date(currentStart),
            endOfWeek: new Date(currentEnd),
          });
          break;
        }
        weeks.push({
          startOfWeek: new Date(currentStart),
          endOfWeek: new Date(currentEnd),
        });
        currentStart = new Date(currentEnd);
        currentStart.setDate(currentStart.getDate() + 1);
      }

      try {
        const ordersStats = weeks.map(() => ({
          pending: 0,
          ongoing: 0,
          completed: 0,
        }));

        for (let i = 0; i < weeks.length; i++) {
          const { startOfWeek, endOfWeek } = weeks[i];

          const models = await prisma.models.findMany({
            include: { Audit: true },
            where: {
              Audit: {
                CreatedAt: {
                  gte: startOfWeek,
                  lte: endOfWeek,
                },
              },
            },
          });

          const orders = await prisma.orders.findMany({
            include: { Audit: true },
            where: {
              Audit: {
                CreatedAt: {
                  gte: startOfWeek,
                  lte: endOfWeek,
                },
              },
            },
          });

          orders.forEach((order) => {
            switch (order.Status) {
              case "PENDING":
                ordersStats[i].pending += 1;
                break;
              case "ONGOING":
                ordersStats[i].ongoing += 1;
                break;
              case "COMPLETED":
                ordersStats[i].completed += 1;
                break;
            }
          });
        }

        res.json(ordersStats);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    } else if (type == "monthly") {
      const currentYear = now.getFullYear();
      const months = [];

      for (let month = 0; month < 12; month++) {
        const firstDayOfMonth = new Date(currentYear, month, 1);
        const lastDayOfMonth = new Date(currentYear, month + 1, 0);
        months.push({
          startOfMonth: firstDayOfMonth,
          endOfMonth: lastDayOfMonth,
        });
      }

      try {
        const ordersStats = months.map(() => ({
          pending: 0,
          ongoing: 0,
          completed: 0,
        }));

        for (let i = 0; i < months.length; i++) {
          const { startOfMonth, endOfMonth } = months[i];

          const orders = await prisma.orders.findMany({
            include: { Audit: true },
            where: {
              Audit: {
                CreatedAt: {
                  gte: startOfMonth,
                  lte: endOfMonth,
                },
              },
            },
          });

          orders.forEach((order) => {
            switch (order.Status) {
              case "PENDING":
                ordersStats[i].pending += 1;
                break;
              case "ONGOING":
                ordersStats[i].ongoing += 1;
                break;
              case "COMPLETED":
                ordersStats[i].completed += 1;
                break;
            }
          });
        }

        res.json(ordersStats);
      } catch (error) {
        console.error("Error generating report:", error);
        return res.status(500).send({
          status: 500,
          message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
          data: {},
        });
      }
    }
  },
};

export default ModelController;
