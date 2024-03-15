import express from "express";
import ProductCatalogCategoryOneController from "../../Controllers/ProductCatalogCategoryOne/ProductCatalogCategoryOne.controller.js";
import { verifyUser } from "../../Middleware/Auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["ENGINEERING"]),
  ProductCatalogCategoryOneController.createCategory
);
router.get(
  "/all",
  verifyUser(["ENGINEERING"]),
  ProductCatalogCategoryOneController.getAllCategories
);
router.get(
  "/",
  verifyUser(["ENGINEERING"]),
  ProductCatalogCategoryOneController.getCategoryOneNames
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING"]),
  ProductCatalogCategoryOneController.getCategoryById
);
router.delete(
  "/:id",
  verifyUser(["ENGINEERING"]),
  ProductCatalogCategoryOneController.deleteCategory
);
router.put(
  "/:id",
  verifyUser(["ENGINEERING"]),
  ProductCatalogCategoryOneController.updateCategory
);
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING"]),
  ProductCatalogCategoryOneController.searchPCCO
);
const ProductCatalogCategorryOneRoute = router;
export { ProductCatalogCategorryOneRoute };
