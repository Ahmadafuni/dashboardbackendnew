import express from "express";
import MaterialCategoryController from "../../Controllers/MaterialCategory/MaterialCategory.controller.js";
import { verifyUser } from "../../Middleware/Auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialCategoryController.createMaterialCategory
);
router.get(
  "/all",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialCategoryController.getAllMaterialCategories
);
router.get(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialCategoryController.getMaterialCategoryNames
);

router.get(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialCategoryController.getMaterialCategoryById
);
router.delete(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialCategoryController.deleteMaterialCategory
);
router.put(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialCategoryController.updateMaterialCategory
);
router.get(
  "/search/:searchTerm",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialCategoryController.searchMaterialCategory
);

const MaterialCategoryRoute = router;
export { MaterialCategoryRoute };
