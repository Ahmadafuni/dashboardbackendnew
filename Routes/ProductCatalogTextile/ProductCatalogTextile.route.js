import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ProductCatalogTextileController from "../../Controllers/ProductCatalogTextile/ProductCatalogTextile.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ProductCatalogTextileController.createTextile
);
router.get(
  "/all",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ProductCatalogTextileController.getAllTextiles
);
router.get(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ProductCatalogTextileController.getCatalogueTextileNames
);
router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ProductCatalogTextileController.getTextileById
);
router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ProductCatalogTextileController.deleteTextile
);
router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ProductCatalogTextileController.updateTextile
);
router.get(
  "/search/:searchTerm",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ProductCatalogTextileController.searchPCT
);

const ProductCatalogTextileRoute = router;
export { ProductCatalogTextileRoute };
