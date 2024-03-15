import express from "express";
import MaterialCategoryController from "../../Controllers/MaterialCategory/MaterialCategory.controller.js";
import { verifyUser } from "../../Middleware/Auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialCategoryController.createMaterialCategory
);
router.get(
  "/all",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialCategoryController.getAllMaterialCategories
);
router.get(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialCategoryController.getMaterialCategoryNames
);

router.get(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialCategoryController.getMaterialCategoryById
);
router.delete(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialCategoryController.deleteMaterialCategory
);
router.put(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialCategoryController.updateMaterialCategory
);
router.get(
  "/search/:searchTerm",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialCategoryController.searchMaterialCategory
);

const MaterialCategoryRoute = router;
export { MaterialCategoryRoute };
