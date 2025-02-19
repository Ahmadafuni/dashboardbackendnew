import express from "express";
import ProductCatalogCategoryOneController from "../../Controllers/ProductCatalogCategoryOne/ProductCatalogCategoryOne.controller.js";
import { verifyUser } from "../../Middleware/Auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER" ,"DRAWING"]),
  ProductCatalogCategoryOneController.createCategory
);
router.get(
  "/all",
  verifyUser(["ENGINEERING", "FACTORYMANAGER" ,"DRAWING"]),
  ProductCatalogCategoryOneController.getAllCategories
);
router.get(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER" ,"DRAWING"]),
  ProductCatalogCategoryOneController.getCategoryOneNames
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER" ,"DRAWING"]),
  ProductCatalogCategoryOneController.getCategoryById
);
router.delete(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER" ,"DRAWING"]),
  ProductCatalogCategoryOneController.deleteCategory
);
router.put(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER" ,"DRAWING"]),
  ProductCatalogCategoryOneController.updateCategory
);
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING", "FACTORYMANAGER" ,"DRAWING"]),
  ProductCatalogCategoryOneController.searchPCCO
);
const ProductCatalogCategorryOneRoute = router;
export { ProductCatalogCategorryOneRoute };
