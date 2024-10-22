import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import WarehouseController from "../../Controllers/Warehouse/Warehouse.controller.js";

const router = express.Router();


router.get(
  "/getWarehouseMaterials",
  // verifyUser(["WAREHOUSEMANAGER", "FACTORYMANAGER", "ENGINEERING"]),
  WarehouseController.getWarehouseMaterials
);


router.get(
  "/all",
  verifyUser(["WAREHOUSEMANAGER", "FACTORYMANAGER", "ENGINEERING"]),
  WarehouseController.getAllWarehouses
);
router.get(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "FACTORYMANAGER", "ENGINEERING"]),
  WarehouseController.getWarehouseNames
);
router.get(
  "/:id",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  WarehouseController.getWarehouseById
);
router.post(
  "/",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  WarehouseController.createWarehouse
);
router.put(
  "/:id",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  WarehouseController.updateWarehouse
);
router.delete(
  "/:id",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  WarehouseController.deleteWarehouse
);
router.get(
  "/search/:searchTerm",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  WarehouseController.searchWarehouse
);





const WarehouseRoute = router;
export { WarehouseRoute };
