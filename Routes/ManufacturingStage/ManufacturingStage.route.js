import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ManufacturingStageController from "../../Controllers/ManufacturingStage/ManufacturingStage.controller.js";

const router = express.Router();

router.post(
  "/multi",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.createMultiStage
);
router.post(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.createStage
);
router.get(
  "/all/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.getStages
);
router.get(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.getStageNames
);
router.get(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.getStageById
);
router.delete(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.deleteStage
);
router.put(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.updateStage
);
router.get(
  "/search/:searchTerm",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.searchMS
);
router.get(
  "/toggleup/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.toggleUp
);
router.get(
  "/toggledown/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ManufacturingStageController.toggleDown
);

export { router as ManufacturingStageRoute };
