import prisma from "../../client.js";

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
          DamagedItem: +DamagedItem,
          ReplacedItemInKG: ReplacedItemInKG,
          ClothCount: +ClothCount,
          QuantityInKg: QuantityInKg,
          ClothLength: ClothLength,
          ClothWidth: ClothWidth,
          ClothWeight: ClothWeight,
          QuantityInNum: +QuantityInNum,
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
    const { QuantityDelivered, QuantityReceived, DamagedItem, Notes } =
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
      await prisma.trakingModels.update({
        where: {
          Id: tracking.Id,
        },
        data: {
          MainStatus: "CHECKING",
          DamagedItem: +DamagedItem,
          QuantityDelivered: +QuantityDelivered,
          QuantityReceived: +QuantityReceived,
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

      await prisma.notifications.create({
        data: {
          Title: `${tracking.ModelVariant.Model.ModelNumber}-${tracking.ModelVariant.Color.ColorName} came for checking`,
          Description: `${tracking.ModelVariant.Model.ModelNumber}-${tracking.ModelVariant.Color.ColorName} came for checking from ${tracking.CurrentStage.Department.Name}`,
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
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
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
          Title: `${tracking.ModelVariant.Model.ModelNumber}-${tracking.ModelVariant.Color.ColorName} got rejected!`,
          Description: `${tracking.ModelVariant.Model.ModelNumber}-${tracking.ModelVariant.Color.ColorName} got rejected by ${tracking.NextStage.Department.Name}`,
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
              data: {
                UpdatedById: userId,
              },
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
      // Create New Tracking with Next Stage
      await prisma.trakingModels.create({
        data: {
          ModelVariant: {
            connect: {
              Id: tracking.ModelVariantId,
            },
          },
          MainStatus: "TODO",
          StartTime: new Date(),
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
          Title: `${tracking.ModelVariant.Model.ModelNumber}-${tracking.ModelVariant.Color.ColorName} got confirmed!`,
          Description: `${tracking.ModelVariant.Model.ModelNumber}-${tracking.ModelVariant.Color.ColorName} got confirmed by ${tracking.NextStage.Department.Name}`,
          ToDepartment: {
            connect: {
              Id: tracking.CurrentStage.DepartmentId,
            },
          },
        },
      });

      return res.status(200).send({
        status: 200,
        message: "Variant confirmed successfully!",
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
          }${variant.Model.ModelNumber} Variant ${variant.Color.ColorName}`,
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

      await prisma.trakingModels.update({
        where: {
          Id: trackingId,
        },
        data: {
          MainStatus: "DONE",
          EndTime: new Date(),
          Audit: {
            update: {
              data: {
                UpdatedById: userId,
              },
            },
          },
        },
      });

      await prisma.modelVarients.update({
        where: {
          Id: tracking.ModelVariantId,
        },
        data: {
          Status: "DONE",
          Audit: {
            update: {
              data: {
                UpdatedById: userId,
              },
            },
          },
        },
      });

      const undoneVariants = await prisma.modelVarients.count({
        where: {
          ModelId: tracking.ModelVariant.ModelId,
          NOT: {
            Status: "DONE",
          },
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (undoneVariants > 0) {
        return res.status(200).send({
          status: 200,
          message: "Variant completed successfully",
          data: {},
        });
      }

      await prisma.models.update({
        where: {
          Id: tracking.ModelVariant.ModelId,
        },
        data: {
          Status: "DONE",
          Audit: {
            update: {
              data: {
                UpdatedById: userId,
              },
            },
          },
        },
      });

      const undoneModels = await prisma.models.count({
        where: {
          OrderId: tracking.ModelVariant.Model.OrderId,
          NOT: {
            Status: "DONE",
          },
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (undoneModels > 0) {
        return res.status(200).send({
          status: 200,
          message: "Variant completed successfully",
          data: {},
        });
      }

      await prisma.orders.update({
        where: {
          Id: tracking.ModelVariant.Model.OrderId,
        },
        data: {
          Status: "COMPLETED",
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
        message: "Variant completed successfully",
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
  getAllTrackingByDepartment: async (req, res, next) => {
    const userDepartmentId = req.userDepartmentId;
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
          DamagedItem: true,
          StartTime: true,
          Notes: true,
          RunningStatus: true,
          QuantityInNum: true,
          MainStatus: true,
          QuantityDelivered: true,
          ModelVariant: {
            select: {
              Id: true,
              Color: {
                select: {
                  ColorName: true,
                },
              },
              Model: {
                select: {
                  ModelName: true,
                  ModelNumber: true,
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
          RunningStatus: true,
          QuantityInNum: true,
          QuantityDelivered: true,
          MainStatus: true,
          Notes: true,
          ModelVariant: {
            select: {
              Id: true,
              Color: {
                select: {
                  ColorName: true,
                },
              },
              Model: {
                select: {
                  ModelName: true,
                  ModelNumber: true,
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
          CurrentStage: {
            DepartmentId: userDepartmentId,
          },
        },
        select: {
          Id: true,
          DamagedItem: true,
          StartTime: true,
          RunningStatus: true,
          QuantityInNum: true,
          QuantityDelivered: true,
          MainStatus: true,
          Notes: true,
          ModelVariant: {
            select: {
              Id: true,
              Color: {
                select: {
                  ColorName: true,
                },
              },
              Model: {
                select: {
                  ModelName: true,
                  ModelNumber: true,
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
          RunningStatus: true,
          Notes: true,
          QuantityInNum: true,
          QuantityDelivered: true,
          MainStatus: true,
          ModelVariant: {
            select: {
              Id: true,
              Color: {
                select: {
                  ColorName: true,
                },
              },
              Model: {
                select: {
                  ModelName: true,
                  ModelNumber: true,
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
};

export default TrackingModelController;
