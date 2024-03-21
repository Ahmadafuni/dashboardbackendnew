import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ProductCatalogDetailController from "../../Controllers/ProductCatalogDetail/ProductCatalogDetail.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogDetailController.createDetail
);
router.get(
  "/all",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogDetailController.getAllDetails
);
router.get(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogDetailController.getCatalogueDetailNames
);
router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogDetailController.getDetailById
);
router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogDetailController.deleteDetail
);
router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogDetailController.updateDetail
);
router.get(
  "/search/:searchTerm",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ProductCatalogDetailController.searchPCD
);

const ProductCatalogDetailRoute = router;
export { ProductCatalogDetailRoute };
