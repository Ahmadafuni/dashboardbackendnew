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
      DemoModelNumber,
      StopData,
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
      if (order.Status === "COMPLETED") {
        return res.status(405).send({
          status: 405,
          message: "Order already COMPLETED. Can't add new model!",
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

      const createdModel = await prisma.models.create({
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
          StopData: StopData,
          Images: modelImages.join(","),
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
        message: "تم إنشاء الموديل بنجاح!",
        data: createdModel,
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

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const totalRecords = await prisma.models.count({});

    const totalPages = Math.ceil(totalRecords / size);
    try {
      const models = await prisma.models.findMany({
        where: {
          OrderId: +orderId,
          Audit: {
            IsDeleted: false,
          },
        },
        skip: (page - 1) * size,
        take: size,
        include: {
          CategoryOne: true,
          categoryTwo: true,
          ProductCatalog: true,
          Template: true,
          Textile: true,
          Order: {
            select: {
              RunningStatus: true,
              StopData: true,
              OrderName: true,
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        totalPages,
        message: "تم جلب الموديلات بنجاح!",
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
        message: "تم جلب الموديلات بنجاح!",
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
          message: "الموديل غير موجود!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب الموديلات بنجاح!",
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
        message: "تم حذف الموديل بنجاح!",
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
        message: "تم جلب أسماء الموديلات بنجاح!",
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
        message: "تم جلب الموديل الإنتاج بنجاح!",
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
              OrderName: true,
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
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    try {
      const allVarients = await prisma.modelVarients.findMany({
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
          MainStatus: true,
          RunningStatus: true,
          StopData: true,
          Model: {
            select: {
              ModelName: true,
              TemplateId: true,
            },
          },
        },
      });

      const processedVarients = allVarients.map((e) => ({
        Id: e.Id,
        Color: e.Color.ColorName,
        Sizes: e.Sizes,
        Model: e.Model.ModelName,
        MainStatus: e.MainStatus,
        Quantity: e.Quantity,
        TemplateId: e.Model.TemplateId,
        StopData: e.StopData,
        RunningStatus: e.RunningStatus,
      }));

      const totalRecords = processedVarients.length;
      const totalPages = Math.ceil(totalRecords / size);

      const varients = processedVarients.slice((page - 1) * size, page * size);

      return res.status(200).send({
        status: 200,
        message: "Model varients fetched successfully!",
        totalPages,
        data: varients,
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
          StopData: true,
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
          Sizes: varient.Sizes,
          Quantity: varient.Quantity.toString(),
          RunningStatus: varient.RunningStatus.toString(),
          StopData: varient.StopData,
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
    const id = req.params.id; // Model ID
    const { Sizes, Color, Quantity } = req.body;
    const userId = req.userId;

    try {
      // Check if the variant with the same color already exists for the model
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
          message: "Color already exists!",
          data: {},
        });
      }

      // Fetch manufacturing stages for the specific model
      const mStages = await prisma.manufacturingStagesModel.findMany({
        where: {
          ModelId: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        orderBy: {
          StageNumber: "asc",
        },
      });

      if (mStages.length === 0) {
        return res.status(400).send({
          status: 400,
          message: "No manufacturing stages found for this model.",
          data: {},
        });
      }

      // Create the model variant and track it in the manufacturing stages
      const newVariant = await prisma.modelVarients.create({
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
          Sizes: Sizes,
          Quantity: +Quantity,
          Audit: {
            create: {
              CreatedById: +userId,
              UpdatedById: +userId,
            },
          },
          TrakingModels: {
            create: {
              CurrentStage: {
                connect: {
                  Id: mStages[0].Id, // Start with the first stage of this specific model
                },
              },
              NextStage: mStages[1]
                ? { connect: { Id: mStages[1].Id } }
                : undefined, // Connect to the next stage if available
              Audit: {
                create: {
                  CreatedById: +userId,
                  UpdatedById: +userId,
                },
              },
            },
          },
        },
      });

      return res.status(201).send({
        status: 201,
        message: "Model variant created successfully!",
        data: { Id: newVariant.Id },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        status: 500,
        message: "Internal server error. Please try again later.",
        data: {},
      });
    }
  },

  updateModelVarient: async (req, res, next) => {
    const id = req.params.id;
    const { Sizes, Color, Quantity } = req.body;
    console.log(Sizes);

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
          Sizes: Sizes,
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
              TrakingModels: {
                include: {
                  CurrentStage: {
                    include: {
                      Department: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const sizes = [];
      model?.ModelVarients.forEach((e) => {
        let sizeArray;

        try {
          sizeArray = e.Sizes;
          if (!Array.isArray(sizeArray)) {
            sizeArray = [sizeArray];
          }
        } catch (err) {
          sizeArray = [e.Sizes];
        }

        sizeArray.forEach((f) => {
          const sizeLabel = typeof f === "string" ? f : f.label;
          if (!sizes.includes(sizeLabel)) {
            sizes.push(sizeLabel);
          }
        });
      });

      // Summarize model information
      modelSummary.modelInfo = {
        ModelDate: model.Audit.CreatedAt.toDateString(),
        ModelName: model.ModelName,
        ModelNumber: model.ModelNumber,
        OrderNumber: model.OrderNumber,
        OrderName: model.OrderName,
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
        Sizes: sizes,
        Images: model.Images,
      };

      // Fetch model stages for each ModelVarient
      const stages = model.ModelVarients.flatMap((variant) =>
        variant.TrakingModels.map((tracking) => ({
          StageNumber: tracking.CurrentStage.StageNumber,
          StageName: tracking.CurrentStage.StageName,
          WorkDescription: tracking.CurrentStage.WorkDescription,
          DepartmentName: tracking.CurrentStage.Department.Name,
        }))
      ).sort((a, b) => a.StageNumber - b.StageNumber);

      const uniqueStages = Array.from(
        new Map(stages.map((stage) => [stage.StageNumber, stage])).values()
      );

      modelSummary.stages = uniqueStages;

      const cuttingDepartmentVariants = [];
      const printingDepartmentVariants = [];
      const sewingDepartmentVariants = [];
      const emballageDepartmentVariants = [];
      const warehouseSummary = [];
      const otherDepartmentVariants = [];

      // Filter ModelVarients based on DepartmentId in TrakingModels
      model.ModelVarients.forEach((variant) => {
        let belongsToCutting = false;
        let belongsToPrinting = false;
        let belongsToSewing = false;
        let belongsToEmballage = false;

        variant.TrakingModels.forEach((tracking) => {
          switch (tracking.CurrentStage.Department.Id) {
            case 3:
              belongsToCutting = true;
              belongsToPrinting = false;
              belongsToSewing = false;
              belongsToEmballage = false;
              break;
            case 10:
              belongsToCutting = false;
              belongsToPrinting = true;
              belongsToSewing = false;
              belongsToEmballage = false;
              break;
            case 11:
              belongsToCutting = false;
              belongsToPrinting = true;
              belongsToSewing = false;
              belongsToEmballage = false;
              break;
            case 4:
              belongsToCutting = false;
              belongsToPrinting = false;
              belongsToSewing = true;
              belongsToEmballage = false;
              break;
            case 5:
              belongsToCutting = false;
              belongsToPrinting = false;
              belongsToSewing = true;
              belongsToEmballage = false;
              break;
            case 6:
              belongsToCutting = false;
              belongsToPrinting = false;
              belongsToSewing = true;
              belongsToEmballage = false;
              break;
            case 7:
              belongsToCutting = false;
              belongsToPrinting = false;
              belongsToSewing = true;
              belongsToEmballage = false;
              break;
            case 8:
              belongsToCutting = false;
              belongsToPrinting = false;
              belongsToSewing = true;
              belongsToEmballage = false;
              break;
            case 9:
              belongsToCutting = false;
              belongsToPrinting = false;
              belongsToSewing = false;
              belongsToEmballage = true;
              break;
          }

          let startDate = new Date(tracking.StartTime);
          let endDate = new Date(tracking.EndTime);
          const differenceInMilliseconds = endDate - startDate;
          const differenceInDays = Math.floor(
            differenceInMilliseconds / (1000 * 60 * 60 * 24)
          );
          const differenceInHours = Math.floor(
            (differenceInMilliseconds % (1000 * 60 * 60 * 24)) /
              (1000 * 60 * 60)
          );
          const differenceInMinutes = Math.floor(
            (differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
          );

          const variantData = {
            Id: variant.Id,
            MainStatus: variant.MainStatus,
            RunningStatus: variant.RunningStatus,
            StopData: variant.StopData,
            ColorName: variant.Color.ColorName,
            Sizes: variant.Sizes,
            Quantity: variant.Quantity,
            TrakingModels: tracking,
            StartDataTime: startDate,
            EndDataTime: endDate,
            Duration: `${differenceInDays} يوم، ${differenceInHours} ساعة، ${differenceInMinutes} دقيقة`,
          };

          // Add the variant to the appropriate department array
          if (belongsToCutting) {
            cuttingDepartmentVariants.push(variantData);
          } else if (belongsToPrinting) {
            printingDepartmentVariants.push(variantData);
          } else if (belongsToSewing) {
            sewingDepartmentVariants.push(variantData);
          } else if (belongsToEmballage) {
            emballageDepartmentVariants.push(variantData);
          } else {
            otherDepartmentVariants.push(variantData);
          }
        });
      });

      const materials = await prisma.materialMovement.findMany({
        where: {
          ModelId: Number(id),
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          ChildMaterial: {
            select: {
              Id: true,
              Name: true,
              ParentMaterial: {
                select: {
                  Id: true,
                  Name: true,
                  Category: true,
                  UnitOfMeasure: true,
                  UsageLocation: true,
                  AlternativeMaterials: true,
                  MinimumLimit: true,
                  IsRelevantToProduction: true,
                  HasChildren: true,
                  Color: true,
                },
              },
              DyeNumber: true,
              Kashan: true,
              Halil: true,
              Phthalate: true,
              GramWeight: true,
              Description: true,
              Color: true,
              Audit: true,
            },
          },
          Quantity: true,
          UnitOfQuantity: true,
        },
      });

      // Summarize model variants based on the department
      modelSummary.modelVarients = {
        cuttingDepartment: cuttingDepartmentVariants,
        printingDepartment: printingDepartmentVariants,
        sewingDepartment: sewingDepartmentVariants,
        emballageDepartment: emballageDepartmentVariants,
        otherDepartments: otherDepartmentVariants,
      };

      modelSummary.warehouseSummary = materials;

      // Fetch cutting and dressup measurements (already exists in your code)
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

      // Format cutting sizes and measurements
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

      // Same logic for dressup
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
      console.log(error);
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
    const stopDataFromBody = req.body.stopData;

    const newStopData = {
      ...stopDataFromBody,
      userId: req.userId,
      userDepartmentId: req.userDepartmentId,
      StartStopTime: new Date(),
      EndStopTime: null,
    };

    try {
      const model = await prisma.models.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
          RunningStatus: "ONGOING",
        },
      });

      if (!model) {
        return res.status(405).send({
          status: 405,
          message: "Model not found or already on hold!",
          data: {},
        });
      }
      let stopDataArray = [];
      if (model.StopData) {
        try {
          stopDataArray = Array.isArray(model.StopData)
            ? model.StopData
            : JSON.parse(model.StopData); // Ensure it's an array
        } catch (error) {
          console.error("Error parsing StopData:", error);
          stopDataArray = [];
        }
      }
      stopDataArray.push(newStopData);

      // Update the model status to PAUSED
      await prisma.models.update({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          RunningStatus: "ONHOLD",
          StopData: stopDataArray,
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
          RunningStatus: "ONHOLD",
          StopData: stopDataArray,
        },
      });

      // Update the RunningStatus of all related model Trakinng to PAUSED
      const trackings = await prisma.trakingModels.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          ModelVariant: {
            Model: {
              Id: +id,
            },
          },
        },
      });
      // Update trackings status
      for (let i = 0; i < trackings.length; i++) {
        await prisma.trakingModels.update({
          where: {
            Id: trackings[i].Id,
          },
          data: {
            RunningStatus: "ONHOLD",
            StopData: stopDataArray,
          },
        });
      }

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
    const userDepartmentId = req.userDepartmentId;

    try {
      const model = await prisma.models.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
          RunningStatus: {
            in: ["ONHOLD", "PENDING"],
          },
        },
      });

      if (!model) {
        return res.status(405).send({
          status: 405,
          message: "Model not found or already running!",
          data: {},
        });
      }

      const order = await prisma.orders.findUnique({
        where: {
          Id: model.OrderId,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      // Check if the parent order is ONHOLD (paused)
      if (
        order.RunningStatus === "ONHOLD" ||
        order.RunningStatus === "PENDING"
      ) {
        return res.status(400).send({
          status: 400,
          message: "We cannot start the model; its parent order is on hold!",
          data: {},
        });
      }

      // If RunningStatus is ONHOLD
      if (model.RunningStatus === "ONHOLD") {
        let stopDataArray = [];
        if (model.StopData) {
          try {
            stopDataArray =
              typeof model.StopData === "string"
                ? JSON.parse(model.StopData)
                : model.StopData;
          } catch (error) {
            console.error("Error parsing StopData:", error);
            return res.status(500).send({
              status: 500,
              message: "Invalid StopData format. Please check the data.",
              data: {},
            });
          }
        }
        if (stopDataArray.length === 0) {
          return res.status(400).send({
            status: 400,
            message: "No stop data found to update.",
            data: {},
          });
        }

        const latestStopData = stopDataArray[stopDataArray.length - 1];
        latestStopData.EndStopTime = new Date();
        latestStopData.userId = userId;
        latestStopData.userDepartmentId = userDepartmentId;

        // Update the model status to ONGOING with StopData
        await prisma.models.update({
          where: {
            Id: +id,
            Audit: {
              IsDeleted: false,
            },
          },
          data: {
            RunningStatus: "ONGOING",
            StopData: stopDataArray,
            Audit: {
              update: {
                UpdatedById: userId,
              },
            },
          },
        });

        // Update the RunningStatus of all related model variants to ONGOING with StopData
        await prisma.modelVarients.updateMany({
          where: {
            ModelId: +id,
            Audit: {
              IsDeleted: false,
            },
          },
          data: {
            RunningStatus: "ONGOING",
            StopData: stopDataArray,
          },
        });

        // Update the RunningStatus of all related model Trakinng to ONGOING with StopData
        const trackings = await prisma.trakingModels.findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
            ModelVariant: {
              Model: {
                Id: +id,
              },
            },
          },
        });

        for (let i = 0; i < trackings.length; i++) {
          await prisma.trakingModels.update({
            where: {
              Id: trackings[i].Id,
            },
            data: {
              RunningStatus: "ONGOING",
              StopData: stopDataArray,
            },
          });
        }
      } else if (model.RunningStatus === "PENDING") {
        // If RunningStatus is PENDING, just update RunningStatus to ONGOING
        await prisma.models.update({
          where: {
            Id: +id,
            Audit: {
              IsDeleted: false,
            },
          },
          data: {
            RunningStatus: "ONGOING",
            StartTime: new Date(),
            Audit: {
              update: {
                UpdatedById: userId,
              },
            },
          },
        });

        // Update the RunningStatus of all related model variants to ONGOING without StopData
        await prisma.modelVarients.updateMany({
          where: {
            ModelId: +id,
            Audit: {
              IsDeleted: false,
            },
            MainStatus: "AWAITING",
          },
          data: {
            RunningStatus: "ONGOING",
            MainStatus: "TODO",
          },
        });

        // Update the RunningStatus of all related model Trakinng to ONGOING without StopData
        const trackings = await prisma.trakingModels.findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
            ModelVariant: {
              Model: {
                Id: +id,
              },
            },
            MainStatus: "AWAITING",
          },
        });

        for (let i = 0; i < trackings.length; i++) {
          await prisma.trakingModels.update({
            where: {
              Id: trackings[i].Id,
            },
            data: {
              RunningStatus: "ONGOING",
              MainStatus: "TODO",
              StartTime: new Date(),
            },
          });
        }
      }

      return res.status(200).send({
        status: 200,
        message:
          model.RunningStatus === "ONHOLD"
            ? "Model and its variants restarted successfully!"
            : "Model and its variants started successfully!",
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
    const stopDataFromBody = req.body.stopData;

    const newStopData = {
      userId: req.userId,
      userDepartmentId: req.userDepartmentId,
      StartStopTime: new Date(),
      EndStopTime: null,
      ReasonText: stopDataFromBody,
    };

    console.log("newStopData", newStopData);

    try {
      const modelVariant = await prisma.modelVarients.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
          RunningStatus: "ONGOING",
        },
      });

      if (!modelVariant) {
        return res.status(405).send({
          status: 405,
          message: "Model variant not found or already on hold!",
          data: {},
        });
      }

      let stopDataArray = [];
      if (modelVariant.StopData) {
        try {
          stopDataArray = Array.isArray(modelVariant.StopData)
            ? modelVariant.StopData
            : JSON.parse(modelVariant.StopData); // Ensure it's an array
        } catch (error) {
          console.error("Error parsing StopData:", error);
          stopDataArray = [];
        }
      }
      stopDataArray.push(newStopData);

      // Update the model variant status to PAUSED
      await prisma.modelVarients.update({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          RunningStatus: "ONHOLD",
          StopData: stopDataArray,
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      // Update the RunningStatus of all related model Trakinng to PAUSED
      const trackings = await prisma.trakingModels.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          ModelVariant: {
            Id: +id,
          },
        },
      });

      // Update trackings status
      for (let i = 0; i < trackings.length; i++) {
        await prisma.trakingModels.update({
          where: {
            Id: trackings[i].Id,
          },
          data: {
            RunningStatus: "ONHOLD",
            StopData: stopDataArray,
          },
        });
      }

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
    const userDepartmentId = req.userDepartmentId;

    try {
      const modelVariant = await prisma.modelVarients.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
          RunningStatus: {
            in: ["ONHOLD", "PENDING"],
          },
        },
      });

      if (!modelVariant) {
        return res.status(405).send({
          status: 405,
          message: "Model variant not found or already running!",
          data: {},
        });
      }

      const model = await prisma.models.findUnique({
        where: {
          Id: modelVariant.ModelId,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      // Check if the parent model is ONHOLD
      if (
        model.RunningStatus === "ONHOLD" ||
        model.RunningStatus === "PENDING"
      ) {
        return res.status(400).send({
          status: 400,
          message:
            "We cannot start the model variant; its parent model is on hold!",
          data: {},
        });
      }

      let stopDataArray = [];
      if (modelVariant.StopData) {
        try {
          stopDataArray =
            typeof modelVariant.StopData === "string"
              ? JSON.parse(modelVariant.StopData)
              : modelVariant.StopData;
        } catch (error) {
          console.error("Error parsing StopData:", error);
          return res.status(500).send({
            status: 500,
            message: "Invalid StopData format. Please check the data.",
            data: {},
          });
        }
      }

      // Handle restart if RunningStatus is ONHOLD
      if (modelVariant.RunningStatus === "ONHOLD") {
        if (stopDataArray.length === 0) {
          return res.status(400).send({
            status: 400,
            message: "No stop data found to update.",
            data: {},
          });
        }

        const latestStopData = stopDataArray[stopDataArray.length - 1];
        latestStopData.EndStopTime = new Date();
        latestStopData.userId = userId;
        latestStopData.userDepartmentId = userDepartmentId;

        // Update the model variant status to ONGOING and StopData
        await prisma.modelVarients.update({
          where: {
            Id: +id,
            Audit: {
              IsDeleted: false,
            },
          },
          data: {
            RunningStatus: "ONGOING",
            StopData: stopDataArray,
            Audit: {
              update: {
                UpdatedById: userId,
              },
            },
          },
        });

        // Update the RunningStatus of all related tracking models to ONGOING with StopData
        const trackings = await prisma.trakingModels.findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
            ModelVariant: {
              Id: +id,
            },
          },
        });

        for (let i = 0; i < trackings.length; i++) {
          await prisma.trakingModels.update({
            where: {
              Id: trackings[i].Id,
            },
            data: {
              RunningStatus: "ONGOING",
              StopData: stopDataArray,
            },
          });
        }
      } else if (modelVariant.RunningStatus === "PENDING") {
        // Handle start if RunningStatus is PENDING (no need to handle StopData)
        await prisma.modelVarients.update({
          where: {
            Id: +id,
            Audit: {
              IsDeleted: false,
            },
          },
          data: {
            RunningStatus: "ONGOING",
            MainStatus: "TODO",
            Audit: {
              update: {
                UpdatedById: userId,
              },
            },
          },
        });

        // Update the RunningStatus of all related tracking models to ONGOING (no StopData needed)
        const trackings = await prisma.trakingModels.findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
            ModelVariant: {
              Id: +id,
            },
          },
        });

        for (let i = 0; i < trackings.length; i++) {
          await prisma.trakingModels.update({
            where: {
              Id: trackings[i].Id,
            },
            data: {
              RunningStatus: "ONGOING",
              MainStatus: "TODO",
            },
          });
        }
      }

      return res.status(200).send({
        status: 200,
        message:
          modelVariant.RunningStatus === "ONHOLD"
            ? "Model variant restarted successfully!"
            : "Model variant started successfully!",
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
      filter.StartTime = {};
      filter.EndTime = {};

      if (startDate) {
        filter.StartTime.gte = new Date(startDate);
      }

      if (endDate) {
        filter.EndTime.lte = new Date(endDate);
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
          Order: {
            select: {
              CollectionId: true,
            },
          },
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
      console.log(models);
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
            let sizes = [];

            try {
              sizes = JSON.parse(varient.Sizes);
              if (!Array.isArray(sizes)) {
                sizes = [];
              }
            } catch (e) {
              sizes = [];
            }

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
                  : sizes.reduce((emptyObj, size) => {
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
            CollectionId: model.Order.CollectionId,
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
      console.log(error);
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
    const type = req.query.type || "monthly";

    try {
      const dateRanges = getDateRanges(type, now);
      const tasks = await fetchStatsForRanges("tasks", dateRanges);
      const tasksStats = calculateStats(tasks, "Status");
      res.send(tasksStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getCollectionStats: async (req, res) => {
    const now = new Date();
    const type = req.query.type || "monthly";

    try {
      const dateRanges = getDateRanges(type, now);
      const collections = await fetchStatsForRanges("collections", dateRanges);
      const collectionsStats = calculateStats(collections);
      res.send(collectionsStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getModelStats: async (req, res) => {
    const now = new Date();
    const type = req.query.type || "monthly";

    try {
      const dateRanges = getDateRanges(type, now);
      const models = await fetchStatsForRanges("models", dateRanges);

      // Ensure you are processing the models correctly
      console.log("Fetched models:", models); // Debug log to check the fetched data

      const modelsStats = calculateStats(models);
      console.log("modelsStats", modelsStats);
      res.json(modelsStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getOrdersStats: async (req, res) => {
    const now = new Date();
    const type = req.query.type || "monthly";

    try {
      const dateRanges = getDateRanges(type, now);
      const orders = await fetchStatsForRanges("orders", dateRanges);
      const ordersStats = calculateStats(orders);
      res.json(ordersStats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  addFileXsl: async (req, res) => {
    const orderId = req.params.id;
    const { Models } = req.body;
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

      if (order.RunningStatus === "COMPLETED") {
        return res.status(405).send({
          status: 405,
          message: "Order already COMPLETED. Can't add new models!",
          data: {},
        });
      }

      const renameFields = (data) => {
        const fieldNamesMap = {
          "رقم الموديل": "ModelNumber",
          الصنف: "CategoryOne",
          الفئة: "CategoryTwo",
          الزمرة: "ProductName",
          القماش: "Textiles",
          القالب: "templateId",
          المراحل: "Stages",
          القياس: "scale",
        };

        let renamedRecord = {};

        Object.keys(data).forEach((key) => {
          const trimmedKey = key.trim();
          const newKey = fieldNamesMap[trimmedKey] || trimmedKey;
          renamedRecord[newKey] = data[key];
        });

        return renamedRecord;
      };

      for (let model of Models) {
        const renamedData = renameFields(model);

        const {
          ModelNumber,
          CategoryOne,
          CategoryTwo,
          ProductName,
          Textiles,
          templateId,
          Stages,
          scale,
          ...color
        } = renamedData;

        const colors = { ...color };
        console.log(colors);

        const stageCodeToIdMap = {
          S: 2,
          C: 3,
          T1: 4,
          T2: 5,
          T3: 6,
          T4: 7,
          T5: 8,
          A: 9,
          PM: 10,
          PA: 11,
        };

        const colorNameToIdMap = await prisma.colors.findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            ColorName: true,
          },
        });

        console.log(colorNameToIdMap);

        const stageIds = Stages.split("-").map(
          (stage) => stageCodeToIdMap[stage]
        );

        const pCatalogue = await prisma.productCatalogs.findUnique({
          where: {
            Id: +ProductName,
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

        let modelCount = await prisma.models.count({});
        modelCount++;

        const createdModel = await prisma.models.create({
          data: {
            ModelName: `${pCatalogue.ProductCatalogName}-${cOne.CategoryName}`,
            ModelNumber: `MN${modelCount.toString().padStart(18, "0")}`,
            DemoModelNumber: ModelNumber.toString(),
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
                Id: +Textiles,
              },
            },
            ProductCatalog: {
              connect: {
                Id: +ProductName,
              },
            },
            Template: {
              connect: {
                // 26 is undefined Template in Production
                Id: templateId ? +Number(templateId) : 26,
              },
            },
            Audit: {
              create: {
                CreatedById: +userId,
                UpdatedById: +userId,
              },
            },
          },
        });

        for (const stageId of stageIds) {
          const stagesCount = await prisma.manufacturingStagesModel.count({
            where: {
              ModelId: createdModel.Id,
              Audit: {
                IsDeleted: false,
              },
            },
          });

          await prisma.manufacturingStagesModel.create({
            data: {
              Duration: 0,
              StageName: "",

              StageNumber: stagesCount + 1,
              Department: { connect: { Id: stageId } },
              Model: { connect: { Id: createdModel.Id } },
              WorkDescription: "",
              Audit: {
                create: {
                  CreatedById: +userId,
                  UpdatedById: +userId,
                },
              },
            },
          });
        }

        for (const [colorKey, colorValue] of Object.entries(colors)) {
          const colorIdObj = colorNameToIdMap.find(
            (colorObj) =>
              colorObj.ColorName.trim().toLowerCase() ===
              colorKey.trim().toLowerCase()
          );

          if (!colorIdObj) {
            return res.status(400).send({
              status: 400,
              message: `Color '${colorKey}' not recognized.`,
              data: {},
            });
          }
          const colorId = colorIdObj.Id;

          const isThere = await prisma.modelVarients.findFirst({
            where: {
              ColorId: +colorId,
              ModelId: createdModel.Id,
              Audit: {
                IsDeleted: false,
              },
            },
          });

          if (isThere) {
            return res.status(409).send({
              status: 409,
              message: `Color '${colorKey}' already exists for this model!`,
              data: {},
            });
          }

          const mStages = await prisma.manufacturingStagesModel.findMany({
            where: {
              ModelId: createdModel.Id,
              Audit: {
                IsDeleted: false,
              },
            },
            orderBy: {
              StageNumber: "asc",
            },
          });

          if (mStages.length === 0) {
            return res.status(400).send({
              status: 400,
              message: "No manufacturing stages found for this model.",
              data: {},
            });
          }

          const sizesArray = scale.split("-").map((size) => {
            const value = (colorValue / scale.split("-").length).toFixed(2);
            return { label: size.trim(), value: value };
          });

          await prisma.modelVarients.create({
            data: {
              Model: {
                connect: {
                  Id: createdModel.Id,
                },
              },
              Color: {
                connect: {
                  Id: +colorId,
                },
              },
              Sizes: sizesArray,
              Quantity: colorValue,
              Audit: {
                create: {
                  CreatedById: +userId,
                  UpdatedById: +userId,
                },
              },
              TrakingModels: {
                create: {
                  CurrentStage: {
                    connect: {
                      Id: mStages[0].Id,
                    },
                  },
                  NextStage: mStages[1]
                    ? { connect: { Id: mStages[1].Id } }
                    : undefined, // إذا كانت المرحلة التالية موجودة
                  Audit: {
                    create: {
                      CreatedById: +userId,
                      UpdatedById: +userId,
                    },
                  },
                },
              },
            },
          });
        }
      }

      return res.status(201).send({
        status: 201,
        message: "تم إنشاء جميع الموديلات والألوان بنجاح!",
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

  getStagesWithDetailsByModelVariantId: async (req, res) => {
    try {
      const { modelVariantId } = req.params;

      // التأكد من أن المعرف هو رقم صالح
      if (!modelVariantId || isNaN(Number(modelVariantId))) {
        return res.status(400).json({
          error: "ModelVariantId is required and must be a valid number",
        });
      }

      // جلب جميع السجلات التي لها نفس ModelVariantId
      const trackingRecords = await prisma.trakingModels.findMany({
        where: {
          ModelVariantId: Number(modelVariantId),
        },
        select: {
          CurrentStage: {
            select: {
              StageName: true,
            },
          },
          StartTime: true,
          EndTime: true,
          QuantityReceived: true,
          QuantityDelivered: true,
        },
      });

      // التحقق مما إذا كانت السجلات موجودة
      if (trackingRecords.length === 0) {
        return res
          .status(404)
          .json({ error: "No stages found for the given ModelVariantId" });
      }

      // استخراج تفاصيل المراحل
      const stagesWithDetails = trackingRecords.map((record) => {
        const startTime = record.StartTime ? new Date(record.StartTime) : null;
        const endTime = record.EndTime ? new Date(record.EndTime) : null;

        // حساب المدة الزمنية بين StartTime و EndTime
        let duration = null;
        if (startTime && endTime) {
          const durationInMilliseconds =
            endTime.getTime() - startTime.getTime();
          const durationInHours = durationInMilliseconds / (1000 * 60 * 60); // تحويل إلى ساعات
          duration = durationInHours;
        }

        return {
          stageName: record.CurrentStage.StageName,
          startTime: record.StartTime,
          endTime: record.EndTime,
          quantityReceived: record.QuantityReceived,
          quantityDelivered: record.QuantityDelivered,
          duration, // المدة الزمنية بالساعات
        };
      });

      // إعادة الرد مع تفاصيل المراحل
      res.status(200).json({ stages: stagesWithDetails });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "An error occurred while fetching stages" });
    }
  },
};

// Helper function to get date ranges based on the requested type
const getDateRanges = (type, now) => {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  let start, end;

  if (type === "daily") {
    start = new Date(now.setDate(now.getDate() - now.getDay()));
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (type === "weekly") {
    start = new Date(currentYear, currentMonth, 1);
    end = new Date(currentYear, currentMonth + 1, 0);
    end.setHours(23, 59, 59, 999);
  } else if (type === "monthly") {
    start = new Date(currentYear, 0, 1);
    end = new Date(currentYear, 11, 31);
    end.setHours(23, 59, 59, 999);
  }

  return [{ start, end }];
};

// Helper function to calculate stats for a given set of tasks or models
const calculateStats = (items, statusField = "RunningStatus") => {
  const stats = { PENDING: 0, ONGOING: 0, COMPLETED: 0, ONHOLD: 0 }; // Add statuses as needed

  items.forEach((item) => {
    const status = item[statusField]; // Dynamically access the status field

    switch (status) {
      case "PENDING":
        stats.PENDING++;
        break;
      case "ONGOING":
        stats.ONGOING++;
        break;
      case "COMPLETED":
        stats.COMPLETED++;
        break;
      case "ONHOLD":
        stats.ONHOLD++;
        break;
      default:
        if (!stats[status]) {
          stats[status] = 1; // Dynamically add new statuses
        } else {
          stats[status]++;
        }
        break;
    }
  });

  return stats;
};

// Helper function to fetch data for the given date ranges
const fetchStatsForRanges = async (model, dateRanges) => {
  const promises = dateRanges.map(({ start, end }) =>
    prisma[model].findMany({
      where: {
        Audit: {
          CreatedAt: {
            gte: start, // Start of the range
            lte: end, // End of the range
          },
        },
      },
      include: { Audit: true }, // Include Audit records to access CreatedAt field
    })
  );

  const results = await Promise.all(promises);
  console.log("Fetched models:", results.flat());
  return results.flat();
};

export default ModelController;
