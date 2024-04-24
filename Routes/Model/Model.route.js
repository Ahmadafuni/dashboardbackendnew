import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import { uploadModel } from "../../Middleware/Upload.middleware.js";
import ModelController from "../../Controllers/Model/Model.controller.js";

const router = express.Router();

router.post(
  "/:id",
  verifyUser(["FACTORYMANAGER", "STOREMANAGER", "ENGINEERING"]),
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
  "/all/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ModelController.getModels
);

router.get(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ModelController.getModelNames
);

router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ModelController.getModelById
);

router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ModelController.deleteModel
);

router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  uploadModel.array("models"),
  ModelController.updateModel
);
router.get(
  "/search/:searchTerm",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ModelController.searchModel
);
export { router as ModelRoute };
