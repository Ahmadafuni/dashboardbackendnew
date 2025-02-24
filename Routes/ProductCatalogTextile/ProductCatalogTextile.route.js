import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ProductCatalogTextileController from "../../Controllers/ProductCatalogTextile/ProductCatalogTextile.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogTextileController.createTextile
);
router.get(
  "/all",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER","PRODUCTION"]),
  ProductCatalogTextileController.getAllTextiles
);
router.get(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER","PRODUCTION"]),
  ProductCatalogTextileController.getCatalogueTextileNames
);
router.get(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER","PRODUCTION"]),
  ProductCatalogTextileController.getTextileById
);
router.delete(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogTextileController.deleteTextile
);
router.put(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogTextileController.updateTextile
);
router.get(
  "/search/:searchTerm",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER","PRODUCTION"]),
  ProductCatalogTextileController.searchPCT
);

const ProductCatalogTextileRoute = router;
export { ProductCatalogTextileRoute };
