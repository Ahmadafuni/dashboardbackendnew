import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import TemplateSizeController from "../../Controllers/TemplateSize/TemplateSize.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["ENGINEERING"]),
  TemplateSizeController.createSize
);
router.get(
  "/all",
  verifyUser(["ENGINEERING"]),
  TemplateSizeController.getSizes
);
router.get(
  "/",
  verifyUser(["ENGINEERING"]),
  TemplateSizeController.getTemplateSizeNames
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING"]),
  TemplateSizeController.getSizeById
);
router.delete(
  "/:id",
  verifyUser(["ENGINEERING"]),
  TemplateSizeController.deleteSize
);
router.put(
  "/:id",
  verifyUser(["ENGINEERING"]),
  TemplateSizeController.updateSize
);
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING"]),
  TemplateSizeController.searchTemplateSize
);
export { router as TemplateSizeRoute };
