import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ProductCatalogController from "../../Controllers/ProductCatalog/ProductCatalog.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["ENGINEERING"]),
  ProductCatalogController.createProductCatalog
);
router.get(
  "/all",
  verifyUser(["ENGINEERING"]),
  ProductCatalogController.getAllProductCatalogs
);
router.get(
  "/",
  verifyUser(["ENGINEERING"]),
  ProductCatalogController.getProductCatalogueNames
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING"]),
  ProductCatalogController.getProductCatalogById
);
router.delete(
  "/:id",
  verifyUser(["ENGINEERING"]),
  ProductCatalogController.deleteProductCatalog
);
router.put(
  "/:id",
  verifyUser(["ENGINEERING"]),
  ProductCatalogController.updateProductCatalog
);
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING"]),
  ProductCatalogController.searchPC
);
const ProductCatalogRoute = router;
export { ProductCatalogRoute };
