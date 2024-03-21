import express from "express";
import ProductCatalogCategoryTwoController from "../../Controllers/ProductCatalogCategoryTwo/ProductCatalogCategoryTwo.controller.js";
import { verifyUser } from "../../Middleware/Auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogCategoryTwoController.createCategory
);
router.get(
  "/all",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogCategoryTwoController.getAllCategories
);
router.get(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogCategoryTwoController.getCategoryTwoNames
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogCategoryTwoController.getCategoryById
);
router.delete(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogCategoryTwoController.deleteCategory
);
router.put(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogCategoryTwoController.updateCategory
);
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogCategoryTwoController.searchPCCT
);

router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogCategoryTwoController.searchPCCT
);

const ProductCatalogCategorryTwoRoute = router;
export { ProductCatalogCategorryTwoRoute };
