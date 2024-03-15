import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ManufacturingStageController from "../../Controllers/ManufacturingStage/ManufacturingStage.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ManufacturingStageController.createStage
);
router.get(
  "/all",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ManufacturingStageController.getStages
);
router.get(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ManufacturingStageController.getStageNames
);
router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ManufacturingStageController.getStageById
);
router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ManufacturingStageController.deleteStage
);
router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ManufacturingStageController.updateStage
);
router.get(
  "/search/:searchTerm",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ManufacturingStageController.searchMS
);

export { router as ManufacturingStageRoute };
