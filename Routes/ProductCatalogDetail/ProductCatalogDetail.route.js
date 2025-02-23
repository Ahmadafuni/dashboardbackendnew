import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ProductCatalogDetailController from "../../Controllers/ProductCatalogDetail/ProductCatalogDetail.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogDetailController.createDetail
);
router.get(
  "/all/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER","Monitoring","DRAWING"]),
  ProductCatalogDetailController.getAllDetails
);
router.post(
  "/search-by-category",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogDetailController.searchByCategory
);
router.get(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER","Monitoring","DRAWING"]),
  ProductCatalogDetailController.getDetailById
);
router.delete(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogDetailController.deleteDetail
);
router.put(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogDetailController.updateDetail
);
router.get(
  "/search/:searchTerm",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER","Monitoring","DRAWING"]),
  ProductCatalogDetailController.searchPCD
);

const ProductCatalogDetailRoute = router;
export { ProductCatalogDetailRoute };
