import prisma from "../../client.js";

const ModelController = {
  createModel: async (req, res, next) => {
    const {
      order,
      modelName,
      template,
      color,
      size,
      quantity,
      quantityDetails,
      orderDetails,
      notes,
    } = req.body;

    const parsedOrder = JSON.parse(order);
    const parsedTemplate = JSON.parse(template);
    const parsedColor = JSON.parse(color);
    const parsedSize = JSON.parse(size);
    const parsedOrderDetails = JSON.parse(orderDetails);

    const file = req.file;
    const userId = req.userId;
    try {
      const model = await prisma.models.create({
        data: {
          ModelName: modelName,
          Note: notes,
          Quantity: parseInt(quantity),
          QuantityDetails: quantityDetails,
          OrderDetail: { connect: { Id: parsedOrderDetails.id } },
          Color: { connect: { Id: parsedColor.id } },
          Orders: { connect: { Id: parsedOrder.id } },
          Size: { connect: { Id: parsedSize.id } },
          Template: { connect: { Id: parsedTemplate.id } },
          ModelImage: `/${file.destination.split("/")[1]}/${file.filename}`,
          Audit: {
            create: {
              CreatedById: userId,
              UpdatedById: userId,
            },
          },
        },
      });

      // Assuming `model` is the created model instance
      const manufacturingStages = await prisma.manufacturingStages.findMany({
        where: {
          TemplateId: model.TemplateId,
        },
        include: {
          Department: true,
        },
      });

      // Iterate over the manufacturing stages to create TrakingModels
      for (const stage of manufacturingStages) {
        const isInitialStage = stage.StageNumber === 1;
        await prisma.trakingModels.create({
          data: {
            DepartmentId: stage.Department.Id,
            ModelId: model.Id,
            OrderId: parsedOrder.id,
            MainStatus: isInitialStage ? "TODO" : "AWAITING",
            QuantityReceived: isInitialStage ? parseInt(quantity) : 0,
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
    const page = parseInt(req.headers["page"]) || 1;
    const itemsPerPage = parseInt(req.headers["items-per-page"]) || 7;

    try {
      const skip = (page - 1) * itemsPerPage;
      const models = await prisma.models.findMany({
        skip: skip,
        take: itemsPerPage,
        where: {
          Audit: {
            IsDeleted: false,
          },
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

      const totalTemplates = await prisma.models.count({
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
        message: "تم جلب النماذج بنجاح!",
        data: {
          models,
          count: totalTemplates,
        },
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
        data: model,
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
      order,
      modelName,
      template,
      color,
      size,
      quantity,
      quantityDetails,
      orderDetails,
      notes,
    } = req.body;

    const parsedOrder = JSON.parse(order);
    const parsedTemplate = JSON.parse(template);
    const parsedColor = JSON.parse(color);
    const parsedSize = JSON.parse(size);
    const parsedOrderDetails = JSON.parse(orderDetails);

    const file = req.file;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.models.update({
        where: {
          Id: +id,
        },
        data: {
          ModelName: modelName,
          Note: notes,
          Quantity: parseInt(quantity),
          QuantityDetails: quantityDetails,
          OrderDetail: { connect: { Id: parsedOrderDetails.id } },
          Color: { connect: { Id: parsedColor.id } },
          Orders: { connect: { Id: parsedOrder.id } },
          Size: { connect: { Id: parsedSize.id } },
          Template: { connect: { Id: parsedTemplate.id } },
          ModelImage: `/${file.destination.split("/")[1]}/${file.filename}`,
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
};

export default ModelController;
