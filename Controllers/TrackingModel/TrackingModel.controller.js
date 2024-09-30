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
  return data ? data : null;
};

const TrackingModelController = {

  startVariant: async (req, res, next) => {
    const userId = req.userId;
    const variantId = +req.params.id;
    const userDepartmentId = req.userDepartmentId;
    console.log("variantId",variantId);
    
    try {
      await prisma.modelVarients.update({
        where: {
          Id: variantId,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          MainStatus: "INPROGRESS",
          RunningStatus: "ONGOING",
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
          RunningStatus: "ONGOING",
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
          RunningStatus: "ONGOING",
          StartTime: new Date(),
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
      console.log(error);
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
          RunningStatus: "ONGOING",
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
          RunningStatus: "ONGOING",
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
      console.error("Error in sendForCheckingOthers:", error);
      console.error("Error in sendForCheckingOthers:", error);
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
          RunningStatus: "ONGOING",
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

      await prisma.trakingModels.update({
        where: {
          Id: trackingId,
        },
        data: {
          MainStatus: "DONE",
          RunningStatus: "COMPLETED",
          EndTime: new Date(),
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      const mStages = await prisma.manufacturingStagesModel.findMany({
        where: {
          Model: {
            ModelVarients: {
              some: {
                TrakingModels: {
                  some: {
                    Id: tracking.Id, // Assuming tracking has the Id from TrackingModel
                  },
                },
                Id: tracking.ModelVariantId, // To ensure the variant matches
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

      if (!newCurrentStageId) {
        console.log("No next stage found for the current stage");
        return res.status(400).send({
          status: 400,
          message: "No next stage found for the current stage",
          data: {},
        });
      }

      const quantityReceivedFromPreviousDep =
        QuantityInKg !== null ? QuantityInNum : QuantityDelivered;

      const newTracking = await prisma.trakingModels.create({
        data: {
          ModelVariant: {
            connect: {
              Id: tracking.ModelVariantId,
            },
          },
          MainStatus: "TODO",
          RunningStatus: "ONGOING",
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

  completeVariant: async (req, res, next) => {
    const trackingId = +req.params.id;
    const userId = req.userId;
    const { QuantityReceived, QuantityDelivered, DamagedItem, Notes } = req.body;

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

      await prisma.trakingModels.update({
        where: {
          Id: trackingId,
        },
        data: {
          MainStatus: "DONE",
          RunningStatus: "COMPLETED",
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
          MainStatus: "DONE",
          RunningStatus: "COMPLETED",
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      console.log(`ModelVariant updated successfully for ID: ${tracking.ModelVariantId}`);

      const remainingVariants = await prisma.modelVarients.findMany({
        where: {
          ModelId: tracking.ModelVariant.ModelId,
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          MainStatus: true,
          RunningStatus: true,
        },
      });

      const variantStatuses = remainingVariants.map((variant) => variant.RunningStatus);

      if (variantStatuses.every((runningStatus) => runningStatus === "COMPLETED")) {
        await prisma.models.update({
          where: {
            Id: tracking.ModelVariant.ModelId,
          },
          data: {
            RunningStatus: "COMPLETED",
            EndTime: new Date(),
            Audit: {
              update: {
                UpdatedById: userId,
              },
            },
          },
        });
        console.log(`Model updated to DONE for ID: ${tracking.ModelVariant.ModelId}`);
      } else if (variantStatuses.includes("ONGOING")) {
        await prisma.models.update({
          where: {
            Id: tracking.ModelVariant.ModelId,
          },
          data: {
            RunningStatus: "ONGOING",
            Audit: {
              update: {
                UpdatedById: userId,
              },
            },
          },
        });
        console.log(`Model updated to INPROGRESS for ID: ${tracking.ModelVariant.ModelId}`);
      }

      const remainingModels = await prisma.models.findMany({
        where: {
          OrderId: tracking.ModelVariant.Model.OrderId,
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          RunningStatus: true,
        },
      });

      const modelStatuses = remainingModels.map((model) => model.RunningStatus);

      if (modelStatuses.every((runningStatus) => runningStatus === "COMPLETED")) {
        await prisma.orders.update({
          where: {
            Id: tracking.ModelVariant.Model.OrderId,
          },
          data: {
            RunningStatus: "COMPLETED",
            EndTime: new Date(),
            Audit: {
              update: {
                UpdatedById: userId,
              },
            },
          },
        });
        console.log(`Order updated to COMPLETED for ID: ${tracking.ModelVariant.Model.OrderId}`);
      } else if (modelStatuses.includes("ONGOING")) {
        await prisma.orders.update({
          where: {
            Id: tracking.ModelVariant.Model.OrderId,
          },
          data: {
            RunningStatus: "ONGOING",
            Audit: {
              update: {
                UpdatedById: userId,
              },
            },
          },
        });
        console.log(`Order updated to INPROGRESS for ID: ${tracking.ModelVariant.Model.OrderId}`);
      }

      const remainingOrders = await prisma.orders.findMany({
        where: {
          CollectionId: tracking.ModelVariant.Model.Order.CollectionId,
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          RunningStatus: true,
        },
      });

      const orderStatuses = remainingOrders.map((order) => order.RunningStatus);

      if (orderStatuses.every((ruunningStatus) => ruunningStatus === "COMPLETED")) {
        await prisma.collections.update({
          where: {
            Id: tracking.ModelVariant.Model.Order.CollectionId,
          },
          data: {
            RunningStatus: "COMPLETED",
            EndTime: new Date(),
            Audit: {
              update: {
                UpdatedById: userId,
              },
            },
          },
        });
        console.log(`Collection updated to COMPLETED for ID: ${tracking.ModelVariant.Model.Order.CollectionId}`);
      } else if (orderStatuses.includes("ONGOING")) {
        await prisma.collections.update({
          where: {
            Id: tracking.ModelVariant.Model.Order.CollectionId,
          },
          data: {
            RunningStatus: "ONGOING",
            Audit: {
              update: {
                UpdatedById: userId,
              },
            },
          },
        });
        console.log(`Collection updated to ONGOING for ID: ${tracking.ModelVariant.Model.Order.CollectionId}`);
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
    const userDepartmentId= req.userDepartmentId;
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 7);

    const pages = {
      awaiting: parseInt(req.query.awaitingPage) || 1,
      inProgress: parseInt(req.query.inProgressPage) || 1,
      completed: parseInt(req.query.completedPage) || 1,
      givingConfirmation: parseInt(req.query.givingConfirmationPage) || 1,
    };
    const sizes = {
      awaiting: parseInt(req.query.awaitingSize) || 10,
      inProgress: parseInt(req.query.inProgressSize) || 10,
      completed: parseInt(req.query.completedSize) || 10,
      givingConfirmation: parseInt(req.query.givingConfirmationSize) || 10,
    };

    try {
      const awaiting = await prisma.trakingModels.findMany({
        where: {
          Audit: { IsDeleted: false },
          ModelVariant: {
            Model: {
              Audit: { IsDeleted: false },
              Order: {
                Audit: { IsDeleted: false },
                Collection: { Audit: { IsDeleted: false } },
              },
            },
          },
          OR: [
            {
              MainStatus: "CHECKING",
              NextStage: { DepartmentId: userDepartmentId },
            },
            {
              MainStatus: "TODO",
              CurrentStage: { DepartmentId: userDepartmentId },
            },
          ],
        },
        skip: (pages.awaiting - 1) * sizes.awaiting,
        take: sizes.awaiting,
        select: {
          Id: true,
          PrevStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              ModelId: true,
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
              ModelId: true,
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
              ModelId: true,
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
          RunningStatus: true,
          StopData: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
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
                      OrderName: true,
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
                  Template: {
                    select: {
                     TemplatePattern:{
                       select: {
                         TemplatePatternName: true,
                       }
                     }
                    }
                 },
                 ProductCatalog: {
                  select: {
                    ProductCatalogName: true
                  }
                }
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
          Audit: { IsDeleted: false },
          ModelVariant: {
            Model: {
              Audit: { IsDeleted: false },
              Order: {
                Audit: { IsDeleted: false },
                Collection: { Audit: { IsDeleted: false } },
              },
            },
          },
          MainStatus: "INPROGRESS",
          CurrentStage: { DepartmentId: userDepartmentId },
        },
        skip: (pages.inProgress - 1) * sizes.inProgress,
        take: sizes.inProgress,
        select: {
          Id: true,
          PrevStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              ModelId: true,
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
              ModelId: true,
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
              ModelId: true,
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
          RunningStatus: true,
          StopData: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
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
                      OrderName: true,
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
                  Template: {
                    select: {
                     TemplatePattern:{
                       select: {
                         TemplatePatternName: true,
                       }
                     }
                    }
                 },
                 ProductCatalog: {
                  select: {
                    ProductCatalogName: true
                  }
                }
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
          Audit: { IsDeleted: false },
          ModelVariant: {
            Model: {
              Audit: { IsDeleted: false },
              Order: {
                Audit: { IsDeleted: false },
                Collection: { Audit: { IsDeleted: false } },
              },
            },
          },
          MainStatus: "DONE",
          EndTime: { gte: twoDaysAgo },
          CurrentStage: { DepartmentId: userDepartmentId },
        },
        skip: (pages.completed - 1) * sizes.completed,
        take: sizes.completed,
        select: {
          Id: true,
          PrevStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              ModelId: true,
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
              ModelId: true,
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
              ModelId: true,
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
          RunningStatus: true,
          StopData: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
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
                      OrderName: true,
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
                  Template: {
                    select: {
                     TemplatePattern:{
                       select: {
                         TemplatePatternName: true,
                       }
                     }
                    }
                 },
                 ProductCatalog: {
                  select: {
                    ProductCatalogName: true
                  }
                }
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
          Audit: { IsDeleted: false },
          ModelVariant: {
            Model: {
              Audit: { IsDeleted: false },
              Order: {
                Audit: { IsDeleted: false },
                Collection: { Audit: { IsDeleted: false } },
              },
            },
          },
          MainStatus: "CHECKING",
          CurrentStage: { DepartmentId: userDepartmentId },
        },
        skip: (pages.givingConfirmation - 1) * sizes.givingConfirmation,
        take: sizes.givingConfirmation,
        select: {
          Id: true,
          PrevStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              ModelId: true,
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
              ModelId: true,
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
              ModelId: true,
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
          RunningStatus: true,
          StopData: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
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
                      OrderName: true,
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
                  Template: {
                    select: {
                     TemplatePattern:{
                       select: {
                         TemplatePatternName: true,
                       }
                     }
                    }
                 },
                 ProductCatalog: {
                  select: {
                    ProductCatalogName: true
                  }
                }
                },
              },
              Sizes: true,
              Quantity: true,
            },
          },
        },
      });


      const addNameField = (items, stage) =>
        items.map((item) => {
          const modelName = item.ModelVariant.Model.ModelName;
          const TemplatePatternName = item.ModelVariant.Model.Template.TemplatePattern.TemplatePatternName;
          const categoryOneName = item.ModelVariant.Model.CategoryOne.CategoryName;
          const ProductCatalogName = item.ModelVariant.Model.ProductCatalog.ProductCatalogName;
          const categoryTwoName = item.ModelVariant.Model.categoryTwo.CategoryName;

          return {
            ...item,
            name: `${ProductCatalogName} - ${categoryOneName} - ${categoryTwoName} - ${TemplatePatternName}`,
            Barcode: item.ModelVariant.Model.Barcode,
            CollectionName: item.ModelVariant.Model.Order.Collection.CollectionName,
            OrderNumber: item.ModelVariant.Model.Order.OrderNumber,
            OrderName: item.ModelVariant.Model.Order.OrderName,
            TextileName: item.ModelVariant.Model.Textile.TextileName,
          };
        });

    const awaitingWithNames = addNameField(awaiting, 1);
    const inProgressWithNames = addNameField(inProgress, 2);
    const completedWithNames = addNameField(completed, 3);
    const givingConfirmationWithNames = addNameField(givingConfirmation, 4);



      return res.status(200).send({
        status: 200,
        message: "",
        data: {
          awaiting: awaitingWithNames,
          inProgress: inProgressWithNames,
          givingConfirmation: givingConfirmationWithNames,
          completed: completedWithNames,
        },
        totalPages: {
          totalPagesAwaiting: Math.ceil(
            (await prisma.trakingModels.count({
              where: {
                Audit: { IsDeleted: false },
                OR: [
                  {
                    MainStatus: "CHECKING",
                    NextStage: { DepartmentId: userDepartmentId },
                  },
                  {
                    MainStatus: "TODO",
                    CurrentStage: { DepartmentId: userDepartmentId },
                  },
                ],
              },
            })) / sizes.awaiting
          ),
          totalPagesInProgress: Math.ceil(
            (await prisma.trakingModels.count({
              where: {
                Audit: { IsDeleted: false },
                MainStatus: "INPROGRESS",
                CurrentStage: { DepartmentId: userDepartmentId },
              },
            })) / sizes.inProgress
          ),
          totalPagesCompleted: Math.ceil(
            (await prisma.trakingModels.count({
              where: {
                Audit: { IsDeleted: false },
                MainStatus: "DONE",
                EndTime: { gte: twoDaysAgo },
                CurrentStage: { DepartmentId: userDepartmentId },
              },
            })) / sizes.completed
          ),
          totalPagesGivingConfirmation: Math.ceil(
            (await prisma.trakingModels.count({
              where: {
                Audit: { IsDeleted: false },
                MainStatus: "CHECKING",
                NextStage: { DepartmentId: userDepartmentId },
              },
            })) / sizes.givingConfirmation
          ),
        },
      });
    } catch (error) {
      console.log("error",error);
      return res.status(500).send({
        status: 500,
        message: "Internal server error. Please try again later!",
        data: {},
      });
    }
  },

  getAllTracking: async (req, res, next) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pages = {
      awaiting: parseInt(req.query.awaitingPage) || 2,
      inProgress: parseInt(req.query.inProgressPage) || 1,
      completed: parseInt(req.query.completedPage) || 1,
      finished: parseInt(req.query.finishedPage) || 1,
      givingConfirmation: parseInt(req.query.givingConfirmationPage) || 1,
    };
    const sizes = {
      awaiting: parseInt(req.query.awaitingSize) || 10,
      inProgress: parseInt(req.query.inProgressSize) || 10,
      completed: parseInt(req.query.completedSize) || 10,
      finished: parseInt(req.query.finishedSize) || 10,
      givingConfirmation: parseInt(req.query.givingConfirmationSize) || 10,
    };

    const totalRecordsAwaiting = await prisma.trakingModels.count({
      where: {
        Audit: {
          IsDeleted: false,
        },
        ModelVariant: {
          Model: {
            Audit: {
              IsDeleted: false,
            },
            Order: {
              Audit: {
                IsDeleted: false,
              },
              Collection: {
                Audit: {
                  IsDeleted: false,
                },
              },
            },
          },
        },
        OR: [{ MainStatus: "CHECKING" }, { MainStatus: "TODO" }],
      },
    });
    const totalRecordsInProgress = await prisma.trakingModels.count({
      where: {
        Audit: {
          IsDeleted: false,
        },
        ModelVariant: {
          Model: {
            Audit: {
              IsDeleted: false,
            },
            Order: {
              Audit: {
                IsDeleted: false,
              },
              Collection: {
                Audit: {
                  IsDeleted: false,
                },
              },
            },
          },
        },
        MainStatus: "INPROGRESS",
      },
    });
    const totalRecordsCompleted = await prisma.trakingModels.count({
      where: {
        Audit: {
          IsDeleted: false,
        },
        ModelVariant: {
          Model: {
            Audit: {
              IsDeleted: false,
            },
            Order: {
              Audit: {
                IsDeleted: false,
              },
              Collection: {
                Audit: {
                  IsDeleted: false,
                },
              },
            },
          },
        },
        MainStatus: "DONE",
        EndTime: {
          gte: sevenDaysAgo,
        },
      },
    });

    const totalRecordsFinished = await prisma.trakingModels.count({
      where: {
        Audit: {
          IsDeleted: false,
        },
        ModelVariant: {
          Model: {
            RunningStatus: "COMPLETED",
            Audit: {
              IsDeleted: false,
            },
            Order: {
              Audit: {
                IsDeleted: false,
              },
              Collection: {
                Audit: {
                  IsDeleted: false,
                },
              },
            },
          },
        },
        MainStatus: "DONE",
        EndTime: {
          gte: sevenDaysAgo,
        },
      },
    });

    const totalRecordsGivingConfirmation = await prisma.trakingModels.count({
      where: {
        Audit: {
          IsDeleted: false,
        },
        ModelVariant: {
          Model: {
            Audit: {
              IsDeleted: false,
            },
            Order: {
              Audit: {
                IsDeleted: false,
              },
              Collection: {
                Audit: {
                  IsDeleted: false,
                },
              },
            },
          },
        },
        MainStatus: "CHECKING",
      },
    });

    const totalPagesAwaiting = Math.ceil(totalRecordsAwaiting / sizes.awaiting);
    const totalPagesInProgress = Math.ceil(totalRecordsInProgress / sizes.inProgress);
    const totalPagesCompleted = Math.ceil(totalRecordsCompleted / sizes.completed);
    const totalPagesFinished = Math.ceil(totalRecordsFinished / sizes.finished);
    const totalPagesGivingConfirmation = Math.ceil(
        totalRecordsGivingConfirmation / sizes.givingConfirmation
    );

    try {
      const awaiting = await prisma.trakingModels.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          ModelVariant: {
            Model: {
              Audit: {
                IsDeleted: false,
              },
              Order: {
                Audit: {
                  IsDeleted: false,
                },
                Collection: {
                  Audit: {
                    IsDeleted: false,
                  },
                },
              },
            },
          },
          OR: [{ MainStatus: "CHECKING" }, { MainStatus: "TODO" }],
        },
        skip: (pages.awaiting - 1) * sizes.awaiting,
        take: sizes.awaiting,
        select: {
          Id: true,
          PrevStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              ModelId: true,
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
              ModelId: true,
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
              ModelId: true,
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
          RunningStatus: true,
          StopData: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
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
                      OrderName: true,
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
                  Template: {
                    select: {
                     TemplatePattern:{
                       select: {
                         TemplatePatternName: true,
                       }
                     }
                    }
                 },
                 ProductCatalog: {
                  select: {
                    ProductCatalogName: true
                  }
                }
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
          ModelVariant: {
            Model: {
              Audit: {
                IsDeleted: false,
              },
              Order: {
                Audit: {
                  IsDeleted: false,
                },
                Collection: {
                  Audit: {
                    IsDeleted: false,
                  },
                },
              },
            },
          },
          MainStatus: "INPROGRESS",
        },
        skip: (pages.inProgress - 1) * sizes.inProgress,
        take: sizes.inProgress,

        select: {
          Id: true,
          PrevStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              ModelId: true,
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
              ModelId: true,
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
              ModelId: true,
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
          RunningStatus: true,
          StopData: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
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
                      OrderName: true,
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
                  Template: {
                    select: {
                     TemplatePattern:{
                       select: {
                         TemplatePatternName: true,
                       }
                     }
                    }
                 },
                 ProductCatalog: {
                  select: {
                    ProductCatalogName: true
                  }
                }
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
          ModelVariant: {
            Model: {
              Audit: {
                IsDeleted: false,
              },
              Order: {
                Audit: {
                  IsDeleted: false,
                },
                Collection: {
                  Audit: {
                    IsDeleted: false,
                  },
                },
              },
            },
          },
          MainStatus: "DONE",
          EndTime: {
            gte: sevenDaysAgo,
          },
        },
        skip: (pages.completed - 1) * sizes.completed,
        take: sizes.completed,

        select: {
          Id: true,
          PrevStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              ModelId: true,
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
              ModelId: true,
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
              ModelId: true,
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
          RunningStatus: true,
          StopData: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
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
                      OrderName: true,
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
                  Template: {
                    select: {
                     TemplatePattern:{
                       select: {
                         TemplatePatternName: true,
                       }
                     }
                    }
                 },
                 ProductCatalog: {
                  select: {
                    ProductCatalogName: true
                  }
                }
                },
              },
              Sizes: true,
              Quantity: true,
            },
          },
        },
      });

      const finished = await prisma.models.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          RunningStatus: "COMPLETED",
          EndTime: {
            gte: sevenDaysAgo,
          },
          Order: {
            Audit: {
              IsDeleted: false,
            },
            Collection: {
              Audit: {
                IsDeleted: false,
              },
            },
          },
        },
        skip: (pages.finished - 1) * sizes.finished,
        take: sizes.finished,
        include: {
          ProductCatalog: true,
          CategoryOne: true,
          categoryTwo: true,
          Template: {
            include: {
              TemplatePattern: true,
            },
          },
          Textile: true,
          Audit: true,
          Order: {
            include: {
              Collection: true,
            },
          },
          ModelVarients: {
            where: {
              Audit: {
                IsDeleted: false,
              },
            },
            include: {
              Color: true,
              TrakingModels: true,
            },
          },
        },
      });

      const processFinishedModel = (model) => {

        const modelName = `${model.ProductCatalog?.ProductCatalogName || 'N/A'} - ${model.CategoryOne?.CategoryName || 'N/A'} - ${model.categoryTwo?.CategoryName || 'N/A'} - ${model.Template?.TemplatePattern?.TemplatePatternName || 'N/A'}`;
        const collectionName = model.Order?.Collection?.CollectionName || 'N/A';
        const orderName = model.Order?.OrderName || 'N/A';
        const textileName = model.Textile?.TextileName || 'N/A';

        const startTime = new Date(model.StartTime);
        const endTime = new Date(model.EndTime);
        const duration = Math.abs((endTime - startTime) / (1000 * 60 * 60)).toFixed(2) + ' hours';

        const colors = model.ModelVarients.map(variant => variant.Color?.ColorName || 'N/A').join(' - ');
        const sizes = model.ModelVarients.flatMap(variant => variant.Sizes.map(size => size.label)).join(', ');

        // For each model variant, find the max stage tracking and aggregate quantities by size
        const maxStageTrackingData = model.ModelVarients.map(variant => {
          if (variant.TrakingModels.length > 0) {
            const maxStageTracking = variant.TrakingModels.reduce(
                (max, tracking) => (tracking.stageNumber > max.stageNumber ? tracking : max),
                variant.TrakingModels[0]
            );

            // Aggregating quantities for QuantityReceived and QuantityDelivered by size
            const totalQuantityReceived = maxStageTracking.QuantityReceived?.reduce((sum, qty) => sum + parseInt(qty.value || 0), 0) || 0;
            const totalQuantityDelivered = maxStageTracking.QuantityDelivered?.reduce((sum, qty) => sum + parseInt(qty.value || 0), 0) || 0;

            return {
              QuantityReceived: totalQuantityReceived,
              QuantityDelivered: totalQuantityDelivered,
            };
          }
          return { QuantityReceived: 0, QuantityDelivered: 0};
        });

        // Sum up the total quantities across all variants
        const totalQuantityReceived = maxStageTrackingData.reduce((sum, data) => sum + data.QuantityReceived, 0);
        const totalQuantityDelivered = maxStageTrackingData.reduce((sum, data) => sum + data.QuantityDelivered, 0);

        // Return the processed data for this model
        return {
          modelId: model.Id,
          modelDemoNumber: model.DemoModelNumber,
          modelBarcode: model.Barcode,
          modelName,
          collectionName,
          orderName,
          textileName,
          colors,
          sizes,
          QuantityReceived: totalQuantityReceived,
          QuantityDelivered: totalQuantityDelivered,
          duration,
        };
      };

      const processedFinished = finished.map(processFinishedModel);

      const givingConfirmation = await prisma.trakingModels.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          ModelVariant: {
            Model: {
              Audit: {
                IsDeleted: false,
              },
              Order: {
                Audit: {
                  IsDeleted: false,
                },
                Collection: {
                  Audit: {
                    IsDeleted: false,
                  },
                },
              },
            },
          },
          MainStatus: "CHECKING",
        },
        skip: (pages.givingConfirmation - 1) * sizes.givingConfirmation,
        take: sizes.givingConfirmation,

        select: {
          Id: true,
          PrevStage: {
            select: {
              Id: true,
              StageNumber: true,
              StageName: true,
              WorkDescription: true,
              Duration: true,
              ModelId: true,
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
              ModelId: true,
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
              ModelId: true,
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
          RunningStatus: true,
          StopData: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
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
                      OrderName: true,
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
                  Template: {
                     select: {
                      TemplatePattern:{
                        select: {
                          TemplatePatternName: true,
                        }
                      }
                     }
                  },
                  ProductCatalog: {
                    select: {
                      ProductCatalogName: true
                    }
                  }
                },
              },
              Sizes: true,
              Quantity: true,
            },
          },
        },
      });

      const addNameField = (items, stage) =>
          items.map((item) => {
            const modelName = item.ModelVariant.Model.ModelName;
            const TemplatePatternName = item.ModelVariant.Model.Template.TemplatePattern.TemplatePatternName;
            const categoryOneName = item.ModelVariant.Model.CategoryOne.CategoryName;
            const ProductCatalogName = item.ModelVariant.Model.ProductCatalog.ProductCatalogName;
            const categoryTwoName = item.ModelVariant.Model.categoryTwo.CategoryName;

            return {
              ...item,
              name: `${ProductCatalogName} - ${categoryOneName} - ${categoryTwoName} - ${TemplatePatternName}`,
              Barcode: item.ModelVariant.Model.Barcode,
              CollectionName: item.ModelVariant.Model.Order.Collection.CollectionName,
              OrderNumber: item.ModelVariant.Model.Order.OrderNumber,
              OrderName: item.ModelVariant.Model.Order.OrderName,
              TextileName: item.ModelVariant.Model.Textile.TextileName,
            };
          });

      const awaitingWithNames = addNameField(awaiting, 1);
      const inProgressWithNames = addNameField(inProgress, 2);
      const completedWithNames = addNameField(completed, 3);
      const givingConfirmationWithNames = addNameField(givingConfirmation, 4);

      return res.status(200).send({
        status: 200,
        message: "",
        data: {
          awaiting: awaitingWithNames,
          inProgress: inProgressWithNames,
          givingConfirmation: givingConfirmationWithNames,
          completed: completedWithNames,
          finished: processedFinished,
        },
        totalPages: {
          totalPagesAwaiting,
          totalPagesInProgress,
          totalPagesCompleted,
          totalPagesFinished,
          totalPagesGivingConfirmation,
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

  getModelDetailsDepartment: async (req, res) => {
    const userDepartmentId= req.userDepartmentId;

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 7);
  
    const getUniqueDemoModelCount = (workItems) => {
      const uniqueDemoModels = new Set();
      workItems.forEach((item) => {
        if (item.ModelVariant?.Model?.DemoModelNumber) {
          uniqueDemoModels.add(item.ModelVariant.Model.DemoModelNumber);
        }
      });
      return uniqueDemoModels.size;
    };

  
    try {
      const awaiting = await prisma.trakingModels.findMany({
        where: {
          Audit: { IsDeleted: false },
          ModelVariant: {
            Model: {
              Audit: { IsDeleted: false },
              Order: {
                Audit: { IsDeleted: false },
                Collection: { Audit: { IsDeleted: false } },
              },
            },
          },
          OR: [
            {
              MainStatus: "CHECKING",
              NextStage: { DepartmentId: userDepartmentId },
            },
            {
              MainStatus: "TODO",
              CurrentStage: { DepartmentId: userDepartmentId },
            },
          ],
        },
        select: {
          Id: true,
          CurrentStage: true,
          PrevStage: true,
          NextStage: true,
          DamagedItem: true,
          StartTime: true,
          Notes: true,
          QuantityInNum: true,
          QuantityInKg: true,
          MainStatus: true,
          RunningStatus: true,
          StopData: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
              Color: { select: { ColorName: true } },
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
          Audit: { IsDeleted: false },
          ModelVariant: {
            Model: {
              Audit: { IsDeleted: false },
              Order: {
                Audit: { IsDeleted: false },
                Collection: { Audit: { IsDeleted: false } },
              },
            },
          },
          MainStatus: "INPROGRESS",
          CurrentStage: { DepartmentId: userDepartmentId },
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
          RunningStatus: true,
          StopData: true,
          PrevStage: true,
          NextStage: true,
          Notes: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
              Color: { select: { ColorName: true } },
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
          Audit: { IsDeleted: false },
          ModelVariant: {
            Model: {
              Audit: { IsDeleted: false },
              Order: {
                Audit: { IsDeleted: false },
                Collection: { Audit: { IsDeleted: false } },
              },
            },
          },
          MainStatus: "DONE",
          EndTime: { gte: twoDaysAgo },
          CurrentStage: { DepartmentId: userDepartmentId },
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
          RunningStatus: true,
          StopData: true,
          Notes: true,
          PrevStage: true,
          NextStage: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
              Color: { select: { ColorName: true } },
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
          Audit: { IsDeleted: false },
          ModelVariant: {
            Model: {
              Audit: { IsDeleted: false },
              Order: {
                Audit: { IsDeleted: false },
                Collection: { Audit: { IsDeleted: false } },
              },
            },
          },
          MainStatus: "CHECKING",
          CurrentStage: { DepartmentId: userDepartmentId },
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
          RunningStatus: true,
          StopData: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
              Color: { select: { ColorName: true } },
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
  
      const sumQuantities = (items, field) => {
        return items.reduce((total, item) => {
          const quantities = item[field] || [];
          const fieldTotal = quantities.reduce((sum, q) => sum + (Number(q.value) || 0), 0);
          return total + fieldTotal;
        }, 0);
      };
      
      // Awaiting models and quantities
      const awaitingModels = getUniqueDemoModelCount(awaiting);
      const awaitingDeliveredQuantity = sumQuantities(awaiting, 'QuantityDelivered');
      const awaitingReceivedQuantity = sumQuantities(awaiting, 'QuantityReceived');
      
      // In progress models and quantities
      const inProgressModels = getUniqueDemoModelCount(inProgress);
      const inProgressDeliveredQuantity = sumQuantities(inProgress, 'QuantityDelivered');
      const inProgressReceivedQuantity = sumQuantities(inProgress, 'QuantityReceived');
      
      // Completed models and quantities
      const completedModels = getUniqueDemoModelCount(completed);
      const completedDeliveredQuantity = sumQuantities(completed, 'QuantityDelivered');
      const completedReceivedQuantity = sumQuantities(completed, 'QuantityReceived');
      
      // Giving confirmation models and quantities
      const givingConfirmationModels = getUniqueDemoModelCount(givingConfirmation);
      const givingConfirmationDeliveredQuantity = sumQuantities(givingConfirmation, 'QuantityDelivered');
      const givingConfirmationReceivedQuantity = sumQuantities(givingConfirmation, 'QuantityReceived');

      return res.status(200).send({
        status: 200,
        message: "",
        data: {
            awaitingModels,
            awaitingDeliveredQuantity,
            awaitingReceivedQuantity,
            inProgressModels,
            inProgressDeliveredQuantity,
            inProgressReceivedQuantity,
            completedModels,
            completedDeliveredQuantity,
            completedReceivedQuantity,
            givingConfirmationModels,
            givingConfirmationDeliveredQuantity,
            givingConfirmationReceivedQuantity
        },
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).send({
        status: 500,
        message: "Internal server error. Please try again later!",
        data: {},
      });
    }
  },

  getModelDetailsManager: async (req, res) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const getUniqueDemoModelCount = (workItems) => {
      const uniqueDemoModels = new Set();
      workItems.forEach((item) => {
        if (item.ModelVariant?.Model?.DemoModelNumber) {
          uniqueDemoModels.add(item.ModelVariant.Model.DemoModelNumber);
        }
      });
      return uniqueDemoModels.size;
    };
  
    try {
      const awaiting = await prisma.trakingModels.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          ModelVariant: {
            Model: {
              Audit: {
                IsDeleted: false,
              },
              Order: {
                Audit: {
                  IsDeleted: false,
                },
                Collection: {
                  Audit: {
                    IsDeleted: false,
                  },
                },
              },
            },
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
              ModelId: true,
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
              ModelId: true,
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
              ModelId: true,
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
          RunningStatus: true,
          StopData: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
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
                      OrderName: true,
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
          ModelVariant: {
            Model: {
              Audit: {
                IsDeleted: false,
              },
              Order: {
                Audit: {
                  IsDeleted: false,
                },
                Collection: {
                  Audit: {
                    IsDeleted: false,
                  },
                },
              },
            },
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
              ModelId: true,
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
              ModelId: true,
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
              ModelId: true,
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
          RunningStatus: true,
          StopData: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
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
                      OrderName: true,
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
          ModelVariant: {
            Model: {
              Audit: {
                IsDeleted: false,
              },
              Order: {
                Audit: {
                  IsDeleted: false,
                },
                Collection: {
                  Audit: {
                    IsDeleted: false,
                  },
                },
              },
            },
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
              ModelId: true,
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
              ModelId: true,
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
              ModelId: true,
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
          RunningStatus: true,
          StopData: true,
          QuantityDelivered: true,
          QuantityReceived: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
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
                      OrderName: true,
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
          ModelVariant: {
            Model: {
              Audit: {
                IsDeleted: false,
              },
              Order: {
                Audit: {
                  IsDeleted: false,
                },
                Collection: {
                  Audit: {
                    IsDeleted: false,
                  },
                },
              },
            },
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
              ModelId: true,
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
              ModelId: true,
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
              ModelId: true,
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
          RunningStatus: true,
          StopData: true,
          ModelVariant: {
            select: {
              Id: true,
              RunningStatus: true,
              StopData: true,
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
                      OrderName: true,
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

      const sumQuantities = (items, field) => {
        return items.reduce((total, item) => {
          const quantities = item[field] || [];
          const fieldTotal = quantities.reduce((sum, q) => sum + (Number(q.value) || 0), 0);
          return total + fieldTotal;
        }, 0);
      };
      
      // Awaiting models and quantities
      const awaitingModels = getUniqueDemoModelCount(awaiting);
      const awaitingDeliveredQuantity = sumQuantities(awaiting, 'QuantityDelivered');
      const awaitingReceivedQuantity = sumQuantities(awaiting, 'QuantityReceived');
      
      // In progress models and quantities
      const inProgressModels = getUniqueDemoModelCount(inProgress);
      const inProgressDeliveredQuantity = sumQuantities(inProgress, 'QuantityDelivered');
      const inProgressReceivedQuantity = sumQuantities(inProgress, 'QuantityReceived');
      
      // Completed models and quantities
      const completedModels = getUniqueDemoModelCount(completed);
      const completedDeliveredQuantity = sumQuantities(completed, 'QuantityDelivered');
      const completedReceivedQuantity = sumQuantities(completed, 'QuantityReceived');
      
      // Giving confirmation models and quantities
      const givingConfirmationModels = getUniqueDemoModelCount(givingConfirmation);
      const givingConfirmationDeliveredQuantity = sumQuantities(givingConfirmation, 'QuantityDelivered');
      const givingConfirmationReceivedQuantity = sumQuantities(givingConfirmation, 'QuantityReceived');

  
      return res.status(200).send({
        status: 200,
        message: "",
        data: {
            awaitingModels,
            awaitingDeliveredQuantity,
            awaitingReceivedQuantity,
            inProgressModels,
            inProgressDeliveredQuantity,
            inProgressReceivedQuantity,
            completedModels,
            completedDeliveredQuantity,
            completedReceivedQuantity,
            givingConfirmationModels,
            givingConfirmationDeliveredQuantity,
            givingConfirmationReceivedQuantity
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

  // we dont use this: we use the modelvarinte one
  pauseUnpause: async (req, res, next) => {
    const userId = req.userId;
    const userDepartmentId = req.userDepartmentId;
    const variantId = +req.params.id;
    const { stopData } = req.body;
    try {
      const variant = await prisma.modelVarients.findFirst({
        where: {
          Id: +variantId,
          MainStatus: "INPROGRESS",
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

      if (tracking.RunningStatus === "ONGOING") {
        await prisma.trakingModels.update({
          where: {
            Id: tracking.Id,
          },
          data: {
            RunningStatus: "ONHOLD",
            StopData: stopData,
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
            RunningStatus: "ONGOING",
            StopData: stopData,
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
              tracking.RunningStatus === "ONGOING" ? "Pausing" : "Unpausing"
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
            tracking.RunningStatus === "ONGOING" ? "Paused" : "Unpaused"
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

};

export default TrackingModelController;