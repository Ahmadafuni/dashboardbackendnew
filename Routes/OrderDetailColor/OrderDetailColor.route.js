import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import OrderDetailColorController from "../../Controllers/OrderDetailColor/OrderDetailColor.controller.js";

const router = express.Router();

router.post("/", verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]), OrderDetailColorController.createColor);
router.get(
  "/all",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  OrderDetailColorController.getColors
);
router.get(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  OrderDetailColorController.getOrderDetailColorNames
);
router.get(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  OrderDetailColorController.getColorById
);
router.delete(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  OrderDetailColorController.deleteColor
);
router.put(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  OrderDetailColorController.updateColor
);

export { router as OrderDetailColorRoute };
