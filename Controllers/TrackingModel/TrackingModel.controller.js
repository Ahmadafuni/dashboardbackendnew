import prisma from "../../client.js";

const safeParseJSON = (data) => {
  if (typeof data === "string" && data.trim() !== "") {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error parsing JSON: ${error.message}`);
      return null;
    }
  }
  return data ? data : null; // If data is falsy (null, undefined, empty string), return null
};

const TrackingModelController = {
  startVariant: async (req, res, next) => {
    const userId = req.userId;
    const variantId = +req.params.id;
    const userDepartmentId = req.userDepartmentId;
    try {
      await prisma.modelVarients.update({
        where: {
          Id: variantId,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          Status: "INPROGRESS",
          Audit: {
            update: {
              data: {
                UpdatedById: userId,
              },
            },
          },
        },
      });
      const tracking = await prisma.trakingModels.findFirst({
        where: {
          ModelVariantId: variantId,
          MainStatus: "TODO",
          CurrentStage: {
            DepartmentId: userDepartmentId,
          },
          Audit: {
            IsDeleted: false,
          },
        },
      });

      await prisma.trakingModels.update({
        where: {
          Id: tracking.Id,
        },
        data: {
          MainStatus: "INPROGRESS",
          Audit: {
            update: {
              data: {
                UpdatedById: userId,
              },
            },
          },
        },
      });

      return res.status(200).send({
        status: 200,
        message: "Variant started successfully!",
        data: {},
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  sendForCheckingCutting: async (req, res, next) => {
    const userId = req.userId;
    const variantId = +req.params.id;
    const userDepartmentId = req.userDepartmentId;
    const {
      DamagedItem,
      ReplacedItemInKG,
      ClothCount,
      QuantityInKg,
      ClothLength,
      ClothWidth,
      ClothWeight,
      QuantityInNum,
      Notes,
    } = req.body;
    try {
      const tracking = await prisma.trakingModels.findFirst({
        where: {
          ModelVariantId: variantId,
          MainStatus: "INPROGRESS",
          CurrentStage: {
            DepartmentId: userDepartmentId,
          },
          Audit: {
            IsDeleted: false,
          },
        },
      });
      await prisma.trakingModels.update({
        where: {
          Id: tracking.Id,
        },
        data: {
          MainStatus: "CHECKING",
          DamagedItem: DamagedItem ? JSON.parse(DamagedItem) : [],
          ReplacedItemInKG: ReplacedItemInKG,
          ClothCount: +ClothCount,
          QuantityInKg: QuantityInKg,
          ClothLength: ClothLength,
          ClothWidth: ClothWidth,
          ClothWeight: ClothWeight,
          QuantityInNum: QuantityInNum ? JSON.parse(QuantityInNum) : [],
          Notes: Notes,
          Audit: {
            update: {
              data: {
                UpdatedById: userId,
              },
            },
          },
        },
      });

      return res.status(200).send({
        status: 200,
        message: "Variant sent for checking successfully!",
        data: {},
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  sendForCheckingOthers: async (req, res, next) => {
    const userId = req.userId;
    const variantId = +req.params.id;
    const userDepartmentId = req.userDepartmentId;
    const { QuantityReceived, QuantityDelivered, DamagedItem, Notes } =
      req.body;

    try {
      const tracking = await prisma.trakingModels.findFirst({
        where: {
          ModelVariantId: variantId,
          MainStatus: "INPROGRESS",
          CurrentStage: {
            DepartmentId: userDepartmentId,
          },
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          CurrentStage: {
            include: {
              Department: true,
            },
          },
          NextStage: true,
          ModelVariant: {
            include: {
              Model: true,
              Color: true,
            },
          },
        },
      });

      // Log tracking details
      console.log("Tracking found:", tracking);

      await prisma.trakingModels.update({
        where: {
          Id: tracking.Id,
        },
        data: {
          MainStatus: "CHECKING",
          DamagedItem: DamagedItem ? JSON.parse(DamagedItem) : [],
          QuantityReceived: QuantityReceived
            ? JSON.parse(QuantityReceived)
            : [],
          QuantityDelivered: QuantityDelivered
            ? JSON.parse(QuantityDelivered)
            : [],
          Notes: Notes,
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      await prisma.notifications.create({
        data: {
          Title: `${tracking.ModelVariant.Model.DemoModelNumber}-${tracking.ModelVariant.Color.ColorName} came for checking`,
          Description: `${tracking.ModelVariant.Model.DemoModelNumber}-${tracking.ModelVariant.Color.ColorName} came for checking from ${tracking.CurrentStage.Department.Name}`,
          ToDepartment: {
            connect: {
              Id: tracking.NextStage.DepartmentId,
            },
          },
        },
      });

      return res.status(200).send({
        status: 200,
        message: "Variant sent for checking successfully!",
        data: {},
      });
    } catch (error) {
      console.error("Error in sendForCheckingOthers:", error); // Log the error details
      return res.status(500).send({
        status: 500,
        message: "Internal server error. Please try again later!",
        data: {},
      });
    }
  },

  rejectVariant: async (req, res, next) => {
    const userId = req.userId;
    const trackingId = +req.params.id;
    try {
      const tracking = await prisma.trakingModels.findUnique({
        where: {
          Id: trackingId,
        },
        include: {
          CurrentStage: true,
          NextStage: {
            include: {
              Department: true,
            },
          },
          ModelVariant: {
            include: {
              Model: true,
              Color: true,
            },
          },
        },
      });

      await prisma.trakingModels.update({
        where: {
          Id: trackingId,
        },
        data: {
          MainStatus: "INPROGRESS",
          Audit: {
            update: {
              data: {
                UpdatedById: userId,
              },
            },
          },
        },
      });

      await prisma.notifications.create({
        data: {
          Title: `${tracking.ModelVariant.Model.DemoModelNumber}-${tracking.ModelVariant.Color.ColorName} got rejected!`,
          Description: `${tracking.ModelVariant.Model.DemoModelNumber}-${tracking.ModelVariant.Color.ColorName} got rejected by ${tracking.NextStage.Department.Name}`,
          ToDepartment: {
            connect: {
              Id: tracking.CurrentStage.DepartmentId,
            },
          },
        },
      });

      return res.status(200).send({
        status: 200,
        message: "Variant rejected successfully!",
        data: {},
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  confirmVariant: async (req, res, next) => {
    const userId = req.userId;
    const trackingId = +req.params.id;
    try {
      // Find Current Tracking Id
      const tracking = await prisma.trakingModels.findFirst({
        where: {
          Id: trackingId,
        },
        include: {
          CurrentStage: true,
          NextStage: {
            include: {
              Department: true,
            },
          },
          ModelVariant: {
            include: {
              Model: true,
              Color: true,
            },
          },
        },
      });

      if (!tracking) {
        console.log("Tracking not found!");
        return res.status(404).send({
          status: 404,
          message: "Tracking not found!",
          data: {},
        });
      }

      const QuantityInNum = safeParseJSON(tracking.QuantityInNum);
      const QuantityReceived = safeParseJSON(tracking.QuantityReceived);
      const QuantityDelivered = safeParseJSON(tracking.QuantityDelivered);
      const QuantityInKg = safeParseJSON(tracking.QuantityInKg);

      // Update Current Tracking Status to DONE
      await prisma.trakingModels.update({
        where: {
          Id: trackingId,
        },
        data: {
          MainStatus: "DONE",
          EndTime: new Date(),
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      // Get Manufacturing Stages
      const mStages = await prisma.manufacturingStages.findMany({
        where: {
          Template: {
            Models: {
              some: {
                ModelVarients: { some: { Id: tracking.ModelVariantId } },
              },
            },
          },
          Audit: {
            IsDeleted: false,
          },
        },
        orderBy: {
          StageNumber: "asc",
        },
      });

      const currentStageIndex = mStages.findIndex(
        (e) => e.Id === tracking.CurrentStageId
      );

      const newCurrentStageId = mStages[currentStageIndex + 1].Id;
      const ifNewNextStage = mStages[currentStageIndex + 2]
        ? { connect: { Id: mStages[currentStageIndex + 2].Id } }
        : {};

      const quantityReceivedFromPreviousDep =
        QuantityInKg !== null ? QuantityInNum : QuantityDelivered;

      console.log(
        "quantityReceivedFromPreviousDep",
        quantityReceivedFromPreviousDep
      );

      // Create New Tracking with Next Stage and assign QuantityReceived from previous stage's QuantityDelivered
      const newTracking = await prisma.trakingModels.create({
        data: {
          ModelVariant: {
            connect: {
              Id: tracking.ModelVariantId,
            },
          },
          MainStatus: "TODO",
          StartTime: new Date(),
          QuantityReceived: quantityReceivedFromPreviousDep,
          PrevStage: {
            connect: {
              Id: tracking.CurrentStageId,
            },
          },
          CurrentStage: {
            connect: {
              Id: newCurrentStageId,
            },
          },
          NextStage: ifNewNextStage,
          Audit: {
            create: {
              UpdatedById: userId,
              CreatedById: userId,
            },
          },
        },
      });

      await prisma.notifications.create({
        data: {
          Title: `${tracking.ModelVariant.Model.DemoModelNumber}-${tracking.ModelVariant.Color.ColorName} got confirmed!`,
          Description: `${tracking.ModelVariant.Model.DemoModelNumber}-${tracking.ModelVariant.Color.ColorName} got confirmed by ${tracking.NextStage.Department.Name}`,
          ToDepartment: {
            connect: {
              Id: tracking.CurrentStage.DepartmentId,
            },
          },
        },
      });

      // Response with data
      const responseData = {
        QuantityInNum,
        QuantityReceived,
        QuantityDelivered,
        QuantityInKg,
      };
      return res.status(200).send({
        status: 200,
        message: "Variant confirmed successfully!",
        data: responseData,
      });
    } catch (error) {
      console.error("Error updating tracking:", error);
      return res.status(500).send({
        status: 500,
        message: "Internal server error",
        data: {},
      });
    }
  },

  //todo pause on model varinte level
  pauseUnpause: async (req, res, next) => {
    const userId = req.userId;
    const userDepartmentId = req.userDepartmentId;
    const variantId = +req.params.id;
    const { Reasone } = req.body;
    try {
      const variant = await prisma.modelVarients.findFirst({
        where: {
          Id: +variantId,
          Status: "INPROGRESS",
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          Model: true,
          Color: true,
        },
      });

      const tracking = await prisma.trakingModels.findFirst({
        where: {
          ModelVariantId: variantId,
          MainStatus: "INPROGRESS",
          CurrentStage: {
            DepartmentId: userDepartmentId,
          },
          Audit: {
            IsDeleted: false,
          },
        },
      });

      const managerialDep = await prisma.departments.findFirst({
        where: {
          Category: "FACTORYMANAGER",
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (tracking.RunningStatus === "RUNNING") {
        await prisma.trakingModels.update({
          where: {
            Id: tracking.Id,
          },
          data: {
            RunningStatus: "PUASED",
            Audit: {
              update: {
                data: {
                  UpdatedById: userId,
                },
              },
            },
          },
        });
      } else {
        await prisma.trakingModels.update({
          where: {
            Id: tracking.Id,
          },
          data: {
            RunningStatus: "RUNNING",
            Audit: {
              update: {
                data: {
                  UpdatedById: userId,
                },
              },
            },
          },
        });
      }

      await prisma.notifications.create({
        data: {
          Description: Reasone,
          Title: `${
            tracking.RunningStatus === "RUNNING" ? "Pausing" : "Unpausing"
          }${variant.Model.DemoModelNumber} Variant ${variant.Color.ColorName}`,
          ToDepartment: {
            connect: {
              Id: managerialDep.Id,
            },
          },
        },
      });

      return res.status(200).send({
        status: 200,
        message: `Variant ${
          tracking.RunningStatus === "RUNNING" ? "Paused" : "Unpaused"
        } successfully!`,
        data: {},
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  completeVariant: async (req, res, next) => {
    const trackingId = +req.params.id;
    const userId = req.userId;
    const { QuantityReceived, QuantityDelivered, DamagedItem, Notes } =
      req.body;

    console.log(`Received request to complete variant with ID: ${trackingId}`);
    console.log(`User ID: ${userId}`);
    console.log(`Payload:`, req.body);

    try {
      const tracking = await prisma.trakingModels.findUnique({
        where: {
          Id: trackingId,
        },
        include: {
          ModelVariant: {
            include: {
              Model: {
                include: {
                  Order: true,
                },
              },
            },
          },
        },
      });

      if (!tracking) {
        console.log(`Tracking not found for ID: ${trackingId}`);
        return res.status(404).send({
          status: 404,
          message: "Tracking not found",
          data: {},
        });
      }

      console.log(`Tracking found:`, tracking);

      let parsedQuantityReceived, parsedQuantityDelivered, parsedDamagedItem;
      try {
        parsedQuantityReceived = QuantityReceived
          ? JSON.parse(QuantityReceived)
          : [];
        parsedQuantityDelivered = QuantityDelivered
          ? JSON.parse(QuantityDelivered)
          : [];
        parsedDamagedItem = DamagedItem ? JSON.parse(DamagedItem) : [];
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        return res.status(400).send({
          status: 400,
          message: "Invalid JSON in request body",
          data: {},
        });
      }

      console.log(`Parsed QuantityReceived:`, parsedQuantityReceived);
      console.log(`Parsed QuantityDelivered:`, parsedQuantityDelivered);
      console.log(`Parsed DamagedItem:`, parsedDamagedItem);

      await prisma.trakingModels.update({
        where: {
          Id: trackingId,
        },
        data: {
          MainStatus: "DONE",
          EndTime: new Date(),
          QuantityReceived: parsedQuantityReceived,
          QuantityDelivered: parsedQuantityDelivered,
          DamagedItem: parsedDamagedItem,
          Notes: Notes,
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      console.log(`Tracking updated successfully for ID: ${trackingId}`);

      await prisma.modelVarients.update({
        where: {
          Id: tracking.ModelVariantId,
        },
        data: {
          Status: "DONE",
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      console.log(
        `ModelVariant updated successfully for ID: ${tracking.ModelVariantId}`
      );

      const remainingVariants = await prisma.modelVarients.findMany({
        where: {
          ModelId: tracking.ModelVariant.ModelId,
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Status: true,
        },
      });

      const variantStatuses = remainingVariants.map(
        (variant) => variant.Status
      );

      if (variantStatuses.every((status) => status === "DONE")) {
        await prisma.models.update({
          where: {
            Id: tracking.ModelVariant.ModelId,
          },
          data: {
            Status: "DONE",
            Audit: {
              update: {
                UpdatedById: userId,
              },
            },
          },
        });
        console.log(
          `Model updated to DONE for ID: ${tracking.ModelVariant.ModelId}`
        );
      } else if (variantStatuses.includes("INPROGRESS")) {
        await prisma.models.update({
          where: {
            Id: tracking.ModelVariant.ModelId,
          },
          data: {
            Status: "INPROGRESS",
            Audit: {
              update: {
                UpdatedById: userId,
              },
            },
          },
        });
        console.log(
          `Model updated to INPROGRESS for ID: ${tracking.ModelVariant.ModelId}`
        );
      }

      const remainingModels = await prisma.models.findMany({
        where: {
          OrderId: tracking.ModelVariant.Model.OrderId,
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Status: true,
        },
      });

      const modelStatuses = remainingModels.map((model) => model.Status);

      if (modelStatuses.every((status) => status === "DONE")) {
        await prisma.orders.update({
          where: {
            Id: tracking.ModelVariant.Model.OrderId,
          },
          data: {
            Status: "COMPLETED",
            Audit: {
              update: {
                UpdatedById: userId,
              },
            },
          },
        });
        console.log(
          `Order updated to COMPLETED for ID: ${tracking.ModelVariant.Model.OrderId}`
        );
      } else if (modelStatuses.includes("INPROGRESS")) {
        await prisma.orders.update({
          where: {
            Id: tracking.ModelVariant.Model.OrderId,
          },
          data: {
            Status: "ONGOING",
            Audit: {
              update: {
                UpdatedById: userId,
              },
            },
          },
        });
        console.log(
          `Order updated to INPROGRESS for ID: ${tracking.ModelVariant.Model.OrderId}`
        );
      }

      const remainingOrders = await prisma.orders.findMany({
        where: {
          CollectionId: tracking.ModelVariant.Model.Order.CollectionId,
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Status: true,
        },
      });

      const orderStatuses = remainingOrders.map((order) => order.Status);

      if (orderStatuses.every((status) => status === "COMPLETED")) {
        await prisma.collections.update({
          where: {
            Id: tracking.ModelVariant.Model.Order.CollectionId,
          },
          data: {
            Status: "COMPLETED",
            Audit: {
              update: {
                UpdatedById: userId,
              },
            },
          },
        });
        console.log(
          `Collection updated to COMPLETED for ID: ${tracking.ModelVariant.Model.Order.CollectionId}`
        );
      } else if (orderStatuses.includes("ONGOING")) {
        await prisma.collections.update({
          where: {
            Id: tracking.ModelVariant.Model.Order.CollectionId,
          },
          data: {
            Status: "ONGOING",
            Audit: {
              update: {
                UpdatedById: userId,
              },
            },
          },
        });
        console.log(
          `Collection updated to ONGOING for ID: ${tracking.ModelVariant.Model.Order.CollectionId}`
        );
      }

      return res.status(200).send({
        status: 200,
        message: "Variant completed successfully",
        data: {},
      });
    } catch (error) {
      console.error("Error in completeVariant:", error);
      return res.status(500).send({
        status: 500,
        message: "Internal server error. Please try again later!",
        data: {},
      });
    }
  },

  getAllTrackingByDepartment: async (req, res, next) => {
    const userDepartmentId = req.userDepartmentId;
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 7);
    try {
      const awaiting = await prisma.trakingModels.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          OR: [
            {
              MainStatus: "CHECKING",
              NextStage: { DepartmentId: userDepartmentId },
            },
            {
              MainStatus: "TODO",
              CurrentStage: {
                DepartmentId: userDepartmentId,
              },
            },
          ],
        },
        select: {
          Id: true,
          PrevStage: true,
          NextStage: true,
          DamagedItem: true,
          StartTime: true,
          Notes: true,
          QuantityInNum: true,
          QuantityInKg: true,
          MainStatus: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              ReasonText: true,
              Color: {
                select: {
                  ColorName: true,
                },
              },
              Model: {
                select: {
                  ModelName: true,
                  ModelNumber: true,
                  DemoModelNumber: true,
                  Id: true,
                },
              },
              Sizes: true,
              Quantity: true,
            },
          },
        },
      });
      const inProgress = await prisma.trakingModels.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          MainStatus: "INPROGRESS",
          CurrentStage: {
            DepartmentId: userDepartmentId,
          },
        },
        select: {
          Id: true,
          DamagedItem: true,
          StartTime: true,

          QuantityInNum: true,
          QuantityInKg: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          MainStatus: true,
          PrevStage: true,
          NextStage: true,
          Notes: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              ReasonText: true,
              Color: {
                select: {
                  ColorName: true,
                },
              },
              Model: {
                select: {
                  ModelName: true,
                  ModelNumber: true,
                  DemoModelNumber: true,
                  Id: true,
                },
              },
              Sizes: true,
              Quantity: true,
            },
          },
        },
      });
      const completed = await prisma.trakingModels.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          MainStatus: "DONE",
          EndTime: {
            gte: twoDaysAgo,
          },
          CurrentStage: {
            DepartmentId: userDepartmentId,
          },
        },
        select: {
          Id: true,
          DamagedItem: true,
          StartTime: true,
          QuantityInNum: true,
          QuantityInKg: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          MainStatus: true,
          Notes: true,
          PrevStage: true,
          NextStage: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              ReasonText: true,
              Color: {
                select: {
                  ColorName: true,
                },
              },
              Model: {
                select: {
                  ModelName: true,
                  ModelNumber: true,
                  DemoModelNumber: true,
                  Id: true,
                },
              },
              Sizes: true,
              Quantity: true,
            },
          },
        },
      });
      const givingConfirmation = await prisma.trakingModels.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          MainStatus: "CHECKING",
          CurrentStage: {
            DepartmentId: userDepartmentId,
          },
        },
        select: {
          Id: true,
          DamagedItem: true,
          StartTime: true,
          Notes: true,
          QuantityInNum: true,
          QuantityInKg: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          MainStatus: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              ReasonText: true,
              Color: {
                select: {
                  ColorName: true,
                },
              },
              Model: {
                select: {
                  ModelName: true,
                  ModelNumber: true,
                  DemoModelNumber: true,
                  Id: true,
                },
              },
              Sizes: true,
              Quantity: true,
            },
          },
        },
      });

      return res.status(200).send({
        status: 200,
        message: "",
        data: { awaiting, completed, inProgress, givingConfirmation },
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  getAllTracking: async (req, res, next) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    try {
      const awaiting = await prisma.trakingModels.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          OR: [{ MainStatus: "CHECKING" }, { MainStatus: "TODO" }],
        },
        select: {
          Id: true,
          PrevStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              TemplateId: true,
              AuditId: true,
              Department: {
                select: {
                  Name: true,
                },
              },
            },
          },
          NextStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              TemplateId: true,
              AuditId: true,
              Department: {
                select: {
                  Name: true,
                },
              },
            },
          },
          CurrentStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              TemplateId: true,
              AuditId: true,
              Department: {
                select: {
                  Name: true,
                },
              },
            },
          },
          DamagedItem: true,
          StartTime: true,
          EndTime: true,
          Notes: true,
          QuantityInNum: true,
          QuantityInKg: true,
          MainStatus: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              ReasonText: true,
              Color: {
                select: {
                  ColorName: true,
                },
              },
              Model: {
                select: {
                  Textile: {
                    select: {
                      TextileName: true,
                    },
                  },
                  Order: {
                    select: {
                      OrderNumber: true,
                      Collection: {
                        select: {
                          CollectionName: true,
                        },
                      },
                    },
                  },
                  Barcode: true,
                  ModelName: true,
                  ModelNumber: true,
                  DemoModelNumber: true,
                  Id: true,
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
                },
              },
              Sizes: true,
              Quantity: true,
            },
          },
        },
      });

      const inProgress = await prisma.trakingModels.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          MainStatus: "INPROGRESS",
        },
        select: {
          Id: true,
          PrevStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              TemplateId: true,
              AuditId: true,
              Department: {
                select: {
                  Name: true,
                },
              },
            },
          },
          NextStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              TemplateId: true,
              AuditId: true,
              Department: {
                select: {
                  Name: true,
                },
              },
            },
          },
          CurrentStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              TemplateId: true,
              AuditId: true,
              Department: {
                select: {
                  Name: true,
                },
              },
            },
          },
          DamagedItem: true,
          StartTime: true,
          EndTime: true,
          Notes: true,
          QuantityInNum: true,
          QuantityInKg: true,
          MainStatus: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              ReasonText: true,
              Color: {
                select: {
                  ColorName: true,
                },
              },
              Model: {
                select: {
                  Textile: {
                    select: {
                      TextileName: true,
                    },
                  },
                  Order: {
                    select: {
                      OrderNumber: true,
                      Collection: {
                        select: {
                          CollectionName: true,
                        },
                      },
                    },
                  },
                  Barcode: true,

                  ModelName: true,
                  ModelNumber: true,
                  DemoModelNumber: true,
                  Id: true,
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
                },
              },
              Sizes: true,
              Quantity: true,
            },
          },
        },
      });

      const completed = await prisma.trakingModels.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          MainStatus: "DONE",
          EndTime: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          Id: true,
          PrevStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              TemplateId: true,
              AuditId: true,
              Department: {
                select: {
                  Name: true,
                },
              },
            },
          },
          NextStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              TemplateId: true,
              AuditId: true,
              Department: {
                select: {
                  Name: true,
                },
              },
            },
          },
          CurrentStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              TemplateId: true,
              AuditId: true,
              Department: {
                select: {
                  Name: true,
                },
              },
            },
          },
          DamagedItem: true,
          StartTime: true,
          EndTime: true,
          Notes: true,
          QuantityInNum: true,
          QuantityInKg: true,
          MainStatus: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              ReasonText: true,
              Color: {
                select: {
                  ColorName: true,
                },
              },
              Model: {
                select: {
                  Textile: {
                    select: {
                      TextileName: true,
                    },
                  },
                  Order: {
                    select: {
                      OrderNumber: true,
                      Collection: {
                        select: {
                          CollectionName: true,
                        },
                      },
                    },
                  },
                  Barcode: true,

                  ModelName: true,
                  ModelNumber: true,
                  DemoModelNumber: true,
                  Id: true,
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
                },
              },
              Sizes: true,
              Quantity: true,
            },
          },
        },
      });

      const givingConfirmation = await prisma.trakingModels.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          MainStatus: "CHECKING",
        },
        select: {
          Id: true,
          PrevStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              TemplateId: true,
              AuditId: true,
              Department: {
                select: {
                  Name: true,
                },
              },
            },
          },
          NextStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              TemplateId: true,
              AuditId: true,
              Department: {
                select: {
                  Name: true,
                },
              },
            },
          },
          CurrentStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              TemplateId: true,
              AuditId: true,
              Department: {
                select: {
                  Name: true,
                },
              },
            },
          },
          DamagedItem: true,
          StartTime: true,
          Notes: true,
          QuantityInNum: true,
          QuantityInKg: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          MainStatus: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              ReasonText: true,
              Color: {
                select: {
                  ColorName: true,
                },
              },
              Model: {
                select: {
                  Textile: {
                    select: {
                      TextileName: true,
                    },
                  },
                  Order: {
                    select: {
                      OrderNumber: true,
                      Collection: {
                        select: {
                          CollectionName: true,
                        },
                      },
                    },
                  },
                  Barcode: true,

                  ModelName: true,
                  ModelNumber: true,
                  DemoModelNumber: true,
                  Id: true,
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
                },
              },
              Sizes: true,
              Quantity: true,
            },
          },
        },
      });

      const addNameField = (items) =>
        items.map((item) => {
          const modelName = item.ModelVariant.Model.ModelName;
          const categoryOneName =
            item.ModelVariant.Model.CategoryOne.CategoryName;
          const categoryTwoName =
            item.ModelVariant.Model.categoryTwo.CategoryName;

          return {
            ...item,
            name: `${modelName} - ${categoryOneName} - ${categoryTwoName}`,
            Barcode: item.ModelVariant.Model.Barcode,
            CollectionName:
              item.ModelVariant.Model.Order.Collection.CollectionName,
            OrderNumber: item.ModelVariant.Model.Order.OrderNumber,
            TextileName: item.ModelVariant.Model.Textile.TextileName,
          };
        });

      const awaitingWithNames = addNameField(awaiting);
      const inProgressWithNames = addNameField(inProgress);
      const completedWithNames = addNameField(completed);
      const givingConfirmationWithNames = addNameField(givingConfirmation);

      return res.status(200).send({
        status: 200,
        message: "",
        data: {
          awaiting: awaitingWithNames,
          completed: completedWithNames,
          inProgress: inProgressWithNames,
          givingConfirmation: givingConfirmationWithNames,
        },
      });
    } catch (error) {
      console.error("Error in getAllTracking:", error);
      return res.status(500).send({
        status: 500,
        message: "Internal server error. Please try again later!",
        data: {},
      });
    }
  },
};

export default TrackingModelController;
