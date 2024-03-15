import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ProductCatalogDetailController from "../../Controllers/ProductCatalogDetail/ProductCatalogDetail.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ProductCatalogDetailController.createDetail
);
router.get(
  "/all",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ProductCatalogDetailController.getAllDetails
);
router.get(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ProductCatalogDetailController.getCatalogueDetailNames
);
router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ProductCatalogDetailController.getDetailById
);
router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ProductCatalogDetailController.deleteDetail
);
router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ProductCatalogDetailController.updateDetail
);
router.get(
  "/search/:searchTerm",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ProductCatalogDetailController.searchPCD
);

const ProductCatalogDetailRoute = router;
export { ProductCatalogDetailRoute };
