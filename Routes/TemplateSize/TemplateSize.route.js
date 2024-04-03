import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import TemplateSizeController from "../../Controllers/TemplateSize/TemplateSize.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplateSizeController.createSize
);
router.get(
  "/all/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplateSizeController.getSizes
);
router.get(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplateSizeController.getTemplateSizeNames
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplateSizeController.getSizeById
);
router.delete(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplateSizeController.deleteSize
);
router.put(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplateSizeController.updateSize
);
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplateSizeController.searchTemplateSize
);
export { router as TemplateSizeRoute };
