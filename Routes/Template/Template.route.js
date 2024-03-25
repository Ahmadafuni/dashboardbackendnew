import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import TemplateController from "../../Controllers/Template/Template.controller.js";
import { upload } from "../../Middleware/Upload.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  upload.single("template"),
  TemplateController.createTemplate
);
router.get(
  "/all",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplateController.getTemplates
);
router.get(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplateController.getTemplateNames
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplateController.getTemplateById
);
router.delete(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplateController.deleteTemplate
);
router.put(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplateController.updateTemplate
);
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplateController.searchTemplate
);
export { router as TemplateRoute };
