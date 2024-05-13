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
      if (order.Status !== "PENDING") {
        return res.status(405).send({
          status: 405,
          message: "Order already started. Cann't add new model!",
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
          },
        });
      }
      // Return response
      return res.status(201).send({
        status: 201,
        message: "تم إنشاء النموذج بنجاح!",
        data: {},
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
  getModels: async (req, res, next) => {
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
          }))
        );
      // Return Response
      return res.status(200).send({
        status: 200,
        message: "Model varients fetched successfully!",
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
        message: "Model varients fetched successfully!",
        data: {
          Color: varient.ColorId.toString(),
          Sizes: JSON.parse(varient.Sizes),
          Quantity: varient.Quantity.toString(),
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
        JSON.parse(e.Sizes).forEach((f) => {
          if (!sizes.includes(f.label)) {
            sizes.push(f.label);
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
};

export default ModelController;
