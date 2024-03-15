import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import OrderDetailSizeController from "../../Controllers/OrderDetailSize/OrderDetailSize.controller.js";

const router = express.Router();

router.post("/", verifyUser(["STOREMANAGER", "ENGINEERING"]), OrderDetailSizeController.createSize);
router.get("/all", verifyUser(["STOREMANAGER", "ENGINEERING"]), OrderDetailSizeController.getSizes);
router.get("/", verifyUser(["STOREMANAGER", "ENGINEERING"]), OrderDetailSizeController.getOrderDetailSizes);
router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  OrderDetailSizeController.getSizeById
);
router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  OrderDetailSizeController.deleteSize
);
router.put("/:id", verifyUser(["STOREMANAGER", "ENGINEERING"]), OrderDetailSizeController.updateSize);

export { router as OrderDetailSizeRoute };
