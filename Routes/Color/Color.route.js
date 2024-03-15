import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ColorController from "../../Controllers/Color/Color.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ColorController.createColor
);
router.get(
  "/all",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ColorController.getColors
);
router.get(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ColorController.getColorNames
);
router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ColorController.getColorById
);
router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ColorController.deleteColor
);
router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ColorController.updateColor
);
router.get(
  "/search/:searchTerm",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ColorController.searchColor
);

export { router as ColorRoute };
