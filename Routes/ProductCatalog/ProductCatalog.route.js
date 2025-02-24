import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ProductCatalogController from "../../Controllers/ProductCatalog/ProductCatalog.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogController.createProductCatalog
);
router.get(
  "/all",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","Monitoring","DRAWING","PRODUCTION"]),
  ProductCatalogController.getAllProductCatalogs
);
router.get(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","Monitoring","DRAWING","PRODUCTION"]),
  ProductCatalogController.getProductCatalogueNames
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","Monitoring","DRAWING","PRODUCTION"]),
  ProductCatalogController.getProductCatalogById
);
router.delete(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogController.deleteProductCatalog
);
router.put(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogController.updateProductCatalog
);
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","Monitoring","DRAWING","PRODUCTION"]),
  ProductCatalogController.searchPC
);
const ProductCatalogRoute = router;
export { ProductCatalogRoute };
