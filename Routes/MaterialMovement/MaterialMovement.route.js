import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import MaterialMovementController from "../../Controllers/MaterialMovement/MaterialMovement.controller.js";

const router = express.Router();

router.post(
  "/internal",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialMovementController.createInternalMaterialMovement
);
router.post(
  "/external",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialMovementController.createExternalMaterialMovement
);
router.get(
  "/all",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialMovementController.getAllMaterialMovements
);
router.get(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialMovementController.getMaterialMovementNames
);
router.get(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialMovementController.getcreateMaterialMovementById
);
router.delete(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialMovementController.deleteMaterialMovement
);
router.put(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialMovementController.updateMaterialMovement
);
router.get(
  "/search/:searchTerm",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialMovementController.searchMaterialMovements
);

const MaterialMovementRoute = router;
export { MaterialMovementRoute };
