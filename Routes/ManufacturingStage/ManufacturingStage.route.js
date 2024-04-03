import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ManufacturingStageController from "../../Controllers/ManufacturingStage/ManufacturingStage.controller.js";

const router = express.Router();

router.post(
  "/multi",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.createMultiStage
);
router.post(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.createStage
);
router.get(
  "/all/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.getStages
);
router.get(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.getStageNames
);
router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.getStageById
);
router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.deleteStage
);
router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.updateStage
);
router.get(
  "/search/:searchTerm",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.searchMS
);
router.get(
  "/toggleup/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.toggleUp
);
router.get(
  "/toggledown/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.toggleDown
);

export { router as ManufacturingStageRoute };
