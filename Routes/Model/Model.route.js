import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import { uploadModel } from "../../Middleware/Upload.middleware.js";
import ModelController from "../../Controllers/Model/Model.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["FACTORYMANAGER", "STOREMANAGER", "ENGINEERING"]),
  uploadModel.single("model"),
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
  ]),
  ModelController.getProdModels
);

router.get(
  "/all",
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
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ModelController.getModelById
);

router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ModelController.deleteModel
);

router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  uploadModel.single("model"),
  ModelController.updateModel
);
router.get(
  "/search/:searchTerm",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ModelController.searchModel
);
export { router as ModelRoute };
