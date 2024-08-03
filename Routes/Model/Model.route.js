import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import { uploadModel } from "../../Middleware/Upload.middleware.js";
import ModelController from "../../Controllers/Model/Model.controller.js";

const router = express.Router();

router.get(
  "/Model-Details" ,
  // verifyUser(["FACTORYMANAGER", "STOREMANAGER", "ENGINEERING"]),

   ModelController.getModelDetails

)

router.post(
"/search",
// verifyUser(["FACTORYMANAGER", "STOREMANAGER", "ENGINEERING"]),
ModelController.filterModel

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
    "STOREMANAGER",
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
    "STOREMANAGER",
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
    verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
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
        "WAREHOUSEMANAGER"
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
        "WAREHOUSEMANAGER"
    ]),
    ModelController.holdModelVarient);

router.put(
    "/model-variants-restart/:id",
    verifyUser([
        "FACTORYMANAGER",
        "ENGINEERING",
        "CUTTING",
        "TAILORING",
        "PRINTING",
        "QUALITYASSURANCE",
        "WAREHOUSEMANAGER"
    ]),    ModelController.restartModelVarient);

router.put("/restart/:id",
    verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
    ModelController.restartModel);

router.put(
    "/hold/:id",
    verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
    ModelController.holdModel);


export { router as ModelRoute };
