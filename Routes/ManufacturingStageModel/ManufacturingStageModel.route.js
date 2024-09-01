import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ManufacturingStageModelController
    from "../../Controllers/ManufacturingStageModel/ManufacturingStageModel.controller.js";

const router = express.Router();

router.post(
  "/multi",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
    ManufacturingStageModelController.createMultiStage
);
router.post(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
    ManufacturingStageModelController.createStage
);
router.get(
  "/all/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
    ManufacturingStageModelController.getStages
);
router.get(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
    ManufacturingStageModelController.getStageNames
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
    ManufacturingStageModelController.getStageById
);
router.delete(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
    ManufacturingStageModelController.deleteStage
);
router.put(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
    ManufacturingStageModelController.updateStage
);
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
    ManufacturingStageModelController.searchMS
);
router.get(
  "/toggleup/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
    ManufacturingStageModelController.toggleUp
);
router.get(
  "/toggledown/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
    ManufacturingStageModelController.toggleDown
);

export { router as ManufacturingStageModelRoute };
