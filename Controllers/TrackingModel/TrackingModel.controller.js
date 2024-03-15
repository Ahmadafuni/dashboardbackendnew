import prisma from "../../client.js";

const TrackingModelController = {
  getAllTrackingModels: async (req, res, next) => {
    try {
      const trackingModels = await prisma.trakingModels.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
      });
      // Return response
      if (trackingModels.length === 0) {
        return res.status(404).send({
          status: 404,
          message: "نموذج التتبع غير موجود!",
          data: [],
        });
      }
      return res.status(200).send({
        status: 200,
        message: "تم جلب نماذج التتبع بنجاح!",
        data: trackingModels,
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
  getTrackingModelById: async (req, res, next) => {
    try {
      const modelId = req.params.id;
      const trackingModels = await prisma.trakingModels.findMany({
        where: {
          ModelId: parseInt(modelId),
        },
        include: {
          Department: true,
        },
      });
      // Check if trackingModels were found
      if (trackingModels.length === 0) {
        return res.status(404).send({
          status: 404,
          message: "نموذج التتبع غير موجود!",
          data: [],
        });
      }
      return res.status(200).send({
        status: 200,
        message: "تم جلب نماذج التتبع بنجاح!",
        data: trackingModels,
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
  updateTrackingModelById: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const {
        receivedFrom,
        damagedItem,
        replacedItem,
        quantityDelivered,
        clothWidthHeight,
        qtyInKg,
        qtyInNumber,
      } = req.body;

      // Update the current tracking model
      const updatedTrackingModel = await prisma.trakingModels.update({
        where: { Id: id },
        data: {
          DamagedItem: damagedItem,
          ReplacedItem: replacedItem,
          QuantityDelivered: quantityDelivered,
          Cloth: clothWidthHeight,
          QuantityInKg: qtyInKg,
          QuantityInNum: qtyInNumber,
          EndTime: new Date(),
        },
      });

      // Fetch the current tracking model's related model to get the TemplateId
      const currentModel = await prisma.models.findUnique({
        where: { Id: updatedTrackingModel.ModelId },
        include: { Template: true },
      });

      // Fetch the manufacturing stages based on the TemplateId
      const manufacturingStages = await prisma.manufacturingStages.findMany({
        where: { TemplateId: currentModel.TemplateId },
        orderBy: { StageNumber: "asc" },
      });

      // Find the next stage based on the current department's stage
      const currentStage = manufacturingStages.find(
        (stage) => stage.DepartmentId === updatedTrackingModel.DepartmentId
      );
      const nextStage = manufacturingStages.find(
        (stage) => stage.StageNumber === currentStage.StageNumber + 1
      );

      if (nextStage) {
        // Update the next tracking model based on the departmentId linked to the next stage
        await prisma.trakingModels.updateMany({
          where: {
            DepartmentId: nextStage.DepartmentId,
            ModelId: updatedTrackingModel.ModelId,
          },
          data: {
            ReceivedFromId: receivedFrom,
            QuantityReceived: quantityDelivered,
            MainStatus: "TODO",
          },
        });
      }

      return res.status(200).send({
        status: 200,
        message: "تم تحديث نموذج التتبع بنجاح!",
        data: {},
      });
    } catch (error) {
      console.error("Error updating tracking model: ", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  updateTrackingModelByIdProg: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);

      // Update the tracking model's StartTime and MainStatus
      await prisma.trakingModels.update({
        where: { Id: id },
        data: {
          StartTime: new Date(),
          MainStatus: "INPROGRESS",
        },
      });

      return res.status(200).send({
        status: 200,
        message: "تم تحديث نموذج التتبع بنجاح!",
        data: {},
      });
    } catch (error) {
      console.error("Error updating tracking model progress: ", error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  searchTrackingModel: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.trakingModels.findMany({
        where: {
          OR: [
            {
              Order: {
                OrderNumber: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              Department: {
                Name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              ReceivedFrom: {
                Name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              DeliveredTo: {
                Name: {
                  contains: searchTerm,
                  mode: "insensitive",
                },
              },
            },
          ],
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

export default TrackingModelController;
