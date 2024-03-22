import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ProductCatalogTextileController from "../../Controllers/ProductCatalogTextile/ProductCatalogTextile.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogTextileController.createTextile
);
router.get(
  "/all",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogTextileController.getAllTextiles
);
router.get(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogTextileController.getCatalogueTextileNames
);
router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogTextileController.getTextileById
);
router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogTextileController.deleteTextile
);
router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogTextileController.updateTextile
);
router.get(
  "/search/:searchTerm",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogTextileController.searchPCT
);

const ProductCatalogTextileRoute = router;
export { ProductCatalogTextileRoute };
