import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ColorController from "../../Controllers/Color/Color.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ColorController.createColor
);
router.get(
  "/all",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ColorController.getColors
);
router.get(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ColorController.getColorNames
);
router.get(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ColorController.getColorById
);
router.delete(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ColorController.deleteColor
);
router.put(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ColorController.updateColor
);
router.get(
  "/search/:searchTerm",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  ColorController.searchColor
);

export { router as ColorRoute };
