import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import { uploadModel } from "../../Middleware/Upload.middleware.js";
import ModelController from "../../Controllers/Model/Model.controller.js";
import prisma from "../../client.js";
const router = express.Router();

router.post(
  "/search",
  verifyUser(["FACTORYMANAGER", "WAREHOUSEMANAGER", "ENGINEERING" , "Accounting"]),
  ModelController.filterModel
);

//
router.get("/mokks", async (req, res) => {
  const models = await prisma.models.findMany({
    select: {
      OrderId: true,
      DemoModelNumber: true,
      Status: true,
    },
  });
  
  const groupedModels = models.reduce((acc, model) => {
    if (!acc[model.OrderId]) {
      acc[model.OrderId] = [];
    }
    acc[model.OrderId].push(model);
    return acc;
  }, {});

  const finalResult = Object.entries(groupedModels).reduce(
    (acc, [orderId, orderModels]) => {
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
    },
    {}
  );

  console.log(finalResult);
  res.send(finalResult);
});
//
router.get(
  "/tasks-stats",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  ModelController.getTasksStats
);

router.get(
  "/collections-stats",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  ModelController.getCollectionStats
);

router.get(
  "/model-stats",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  ModelController.getModelStats
);

router.get(
  "/orders-stats",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  ModelController.getOrdersStats
);

router.post(
  "/:id",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  uploadModel.array("models"),
  ModelController.createModel
);
router.get(
  "/productionModels",
  verifyUser([
    "WAREHOUSEMANAGER",
    "ENGINEERING",
    "CURRINT",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
    "FACTORYMANAGER",
  ]),
  ModelController.getProdModels
);

router.get(
  "/model-summary/:id",
  verifyUser([
    "WAREHOUSEMANAGER",
    "ENGINEERING",
    "CURRINT",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
    "FACTORYMANAGER",
  ]),
  ModelController.getModelSummary
);

router.get(
  "/all/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ModelController.getModelsByOrderId
);

router.get(
  "/allmodels",
  verifyUser(["ENGINEERING", "FACTORYMANAGER" , "WAREHOUSEMANAGER", "Accounting"]),
  ModelController.getAllModels
);

router.get(
  "/",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  ModelController.getModelNames
);

router.get(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ModelController.getModelById
);

router.delete(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ModelController.deleteModel
);

router.put(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  uploadModel.array("models"),
  ModelController.updateModel
);
router.get(
  "/search/:searchTerm",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  ModelController.searchModel
);
router.get(
  "/varients/all/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
    "WAREHOUSEMANAGER",
  ]),
  ModelController.getAllModelVarients
);
router.post(
  "/varients/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ModelController.createModelVarient
);
router.get(
  "/varients/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ModelController.getModelVarientById
);
router.put(
  "/varients/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ModelController.updateModelVarient
);
router.delete(
  "/varients/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ModelController.deleteModelVarient
);

router.put(
  "/model-variants-hold/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
    "WAREHOUSEMANAGER",
  ]),
  ModelController.holdModelVarient
);

router.put(
  "/model-variants-restart/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
    "WAREHOUSEMANAGER",
  ]),
  ModelController.restartModelVarient
);

router.put(
  "/restart/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ModelController.restartModel
);

router.put(
  "/hold/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ModelController.holdModel
);
router.post(
  "/addFileXsl/:id" ,
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
   ModelController.addFileXsl
);


// router test
router.get("/testModel/:modelVariantId" ,
  ModelController.getStagesWithDetailsByModelVariantId 
);


export { router as ModelRoute };
