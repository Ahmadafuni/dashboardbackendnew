import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import OrderDetailSizeController from "../../Controllers/OrderDetailSize/OrderDetailSize.controller.js";

const router = express.Router();

router.post("/", verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]), OrderDetailSizeController.createSize);
router.get("/all", verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]), OrderDetailSizeController.getSizes);
router.get("/", verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]), OrderDetailSizeController.getOrderDetailSizes);
router.get(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  OrderDetailSizeController.getSizeById
);
router.delete(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  OrderDetailSizeController.deleteSize
);
router.put("/:id", verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]), OrderDetailSizeController.updateSize);

export { router as OrderDetailSizeRoute };
