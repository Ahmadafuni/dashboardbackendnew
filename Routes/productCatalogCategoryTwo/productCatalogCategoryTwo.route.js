import express from "express";
import ProductCatalogCategoryTwoController from "../../Controllers/ProductCatalogCategoryTwo/ProductCatalogCategoryTwo.controller.js";
import { verifyUser } from "../../Middleware/Auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["ENGINEERING"]),
  ProductCatalogCategoryTwoController.createCategory
);
router.get(
  "/all",
  verifyUser(["ENGINEERING"]),
  ProductCatalogCategoryTwoController.getAllCategories
);
router.get(
  "/",
  verifyUser(["ENGINEERING"]),
  ProductCatalogCategoryTwoController.getCategoryTwoNames
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING"]),
  ProductCatalogCategoryTwoController.getCategoryById
);
router.delete(
  "/:id",
  verifyUser(["ENGINEERING"]),
  ProductCatalogCategoryTwoController.deleteCategory
);
router.put(
  "/:id",
  verifyUser(["ENGINEERING"]),
  ProductCatalogCategoryTwoController.updateCategory
);
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING"]),
  ProductCatalogCategoryTwoController.searchPCCT
);

router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING"]),
  ProductCatalogCategoryTwoController.searchPCCT
);

const ProductCatalogCategorryTwoRoute = router;
export { ProductCatalogCategorryTwoRoute };
