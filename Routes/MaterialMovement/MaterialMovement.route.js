import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import MaterialMovementController from "../../Controllers/MaterialMovement/MaterialMovement.controller.js";

const router = express.Router();

router.post(
    "/",
    verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
    MaterialMovementController.createMaterialMovement
);
router.get(
    "/all",
    verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
    MaterialMovementController.getAllMaterialMovements
);
router.get(
    "/movementname",
    verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
    MaterialMovementController.getMaterialMovementNames
);

router.get(
    "/movementtype/:type",
    verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
    MaterialMovementController.getMaterialMovementsByMovementType
);
router.get(
    "/:id",
    verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
    MaterialMovementController.getMaterialMovementById
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
