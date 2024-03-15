import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import OrderDetailColorController from "../../Controllers/OrderDetailColor/OrderDetailColor.controller.js";

const router = express.Router();

router.post("/", verifyUser(["STOREMANAGER", "ENGINEERING"]), OrderDetailColorController.createColor);
router.get(
  "/all",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  OrderDetailColorController.getColors
);
router.get(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  OrderDetailColorController.getOrderDetailColorNames
);
router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  OrderDetailColorController.getColorById
);
router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  OrderDetailColorController.deleteColor
);
router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  OrderDetailColorController.updateColor
);

export { router as OrderDetailColorRoute };
