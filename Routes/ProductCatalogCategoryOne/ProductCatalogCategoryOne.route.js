import express from "express";
import ProductCatalogCategoryOneController from "../../Controllers/ProductCatalogCategoryOne/ProductCatalogCategoryOne.controller.js";
import { verifyUser } from "../../Middleware/Auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogCategoryOneController.createCategory
);
router.get(
  "/all",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogCategoryOneController.getAllCategories
);
router.get(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogCategoryOneController.getCategoryOneNames
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogCategoryOneController.getCategoryById
);
router.delete(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogCategoryOneController.deleteCategory
);
router.put(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogCategoryOneController.updateCategory
);
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogCategoryOneController.searchPCCO
);
const ProductCatalogCategorryOneRoute = router;
export { ProductCatalogCategorryOneRoute };
