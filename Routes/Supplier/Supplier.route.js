import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import SupplierController from "../../Controllers/Supplier/Supplier.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  SupplierController.createSupplier
);
router.get(
  "/all",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  SupplierController.getAllSuppliers
);
router.get(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  SupplierController.getSupplierNames
);
router.get(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  SupplierController.getSupplierById
);
router.delete(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  SupplierController.deleteSupplier
);
router.put(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  SupplierController.updateSupplier
);
router.get(
  "/search/:searchTerm",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  SupplierController.searchSupplier
);
const SupplierRoute = router;
export { SupplierRoute };
