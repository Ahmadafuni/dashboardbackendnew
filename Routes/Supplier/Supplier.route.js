import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import SupplierController from "../../Controllers/Supplier/Supplier.controller.js";

const router = express.Router();


router.get(
  "/getMaterialMovementsById/:id",
  // verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SupplierController.getMaterialMovementsById
);
router.post(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SupplierController.createSupplier
);
router.get(
  "/all",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SupplierController.getAllSuppliers
);
router.get(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SupplierController.getSupplierNames
);
router.get(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SupplierController.getSupplierById
);
router.delete(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SupplierController.deleteSupplier
);
router.put(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SupplierController.updateSupplier
);
router.get(
  "/search/:searchTerm",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SupplierController.searchSupplier
);
const SupplierRoute = router;
export { SupplierRoute };