import express from "express";
import ProductCatalogCategoryTwoController from "../../Controllers/ProductCatalogCategoryTwo/ProductCatalogCategoryTwo.controller.js";
import { verifyUser } from "../../Middleware/Auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER", "DRAWING"]),
  ProductCatalogCategoryTwoController.createCategory
);
router.get(
  "/all",
  verifyUser(["ENGINEERING", "FACTORYMANAGER", "DRAWING"]),
  ProductCatalogCategoryTwoController.getAllCategories
);
router.get(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER", "DRAWING"]),
  ProductCatalogCategoryTwoController.getCategoryTwoNames
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER", "DRAWING"]),
  ProductCatalogCategoryTwoController.getCategoryById
);
router.delete(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER", "DRAWING"]),
  ProductCatalogCategoryTwoController.deleteCategory
);
router.put(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER", "DRAWING"]),
  ProductCatalogCategoryTwoController.updateCategory
);
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING", "FACTORYMANAGER", "DRAWING"]),
  ProductCatalogCategoryTwoController.searchPCCT
);

router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING", "FACTORYMANAGER", "DRAWING"]),
  ProductCatalogCategoryTwoController.searchPCCT
);

const ProductCatalogCategorryTwoRoute = router;
export { ProductCatalogCategorryTwoRoute };
