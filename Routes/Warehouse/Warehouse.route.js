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
  verifyUser(["WAREHOUSEMANAGER", "FACTORYMANAGER", "ENGINEERING","Accounting"]),
  WarehouseController.getWarehouseNames
);
router.get(
  "/:id",
  verifyUser(["FACTORYMANAGER", "ENGINEERING" , "WAREHOUSEMANAGER" ]),
  WarehouseController.getWarehouseById
);
router.post(
  "/",
  verifyUser(["FACTORYMANAGER", "ENGINEERING" , "WAREHOUSEMANAGER" ]),
  WarehouseController.createWarehouse
);
router.put(
  "/:id",
  verifyUser(["FACTORYMANAGER", "ENGINEERING" , "WAREHOUSEMANAGER" ]),
  WarehouseController.updateWarehouse
);
router.delete(
  "/:id",
  verifyUser(["FACTORYMANAGER", "ENGINEERING" , "WAREHOUSEMANAGER" ]),
  WarehouseController.deleteWarehouse
);
router.get(
  "/search/:searchTerm",
  verifyUser(["FACTORYMANAGER", "ENGINEERING" , "WAREHOUSEMANAGER"  ]),
  WarehouseController.searchWarehouse
);


const WarehouseRoute = router;
export { WarehouseRoute };
