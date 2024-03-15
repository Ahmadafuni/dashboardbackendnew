import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import MaterialMovementController from "../../Controllers/MaterialMovement/MaterialMovement.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialMovementController.createMaterialMovement
);
router.get(
  "/all",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialMovementController.getAllMaterialMovements
);
router.get(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialMovementController.getMaterialMovementNames
);
router.get(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialMovementController.getcreateMaterialMovementById
);
router.delete(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialMovementController.deleteMaterialMovement
);
router.put(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialMovementController.updateMaterialMovement
);
router.get(
  "/search/:searchTerm",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialMovementController.searchMaterialMovements
);

const MaterialMovementRoute = router;
export { MaterialMovementRoute };
