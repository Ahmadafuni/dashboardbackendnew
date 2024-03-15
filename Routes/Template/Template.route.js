import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import TemplateController from "../../Controllers/Template/Template.controller.js";
import { upload } from "../../Middleware/Upload.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["ENGINEERING"]),
  upload.single("template"),
  TemplateController.createTemplate
);
router.get(
  "/all",
  verifyUser(["ENGINEERING"]),
  TemplateController.getTemplates
);
router.get(
  "/",
  verifyUser(["ENGINEERING"]),
  TemplateController.getTemplateNames
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING"]),
  TemplateController.getTemplateById
);
router.delete(
  "/:id",
  verifyUser(["ENGINEERING"]),
  TemplateController.deleteTemplate
);
router.put(
  "/:id",
  verifyUser(["ENGINEERING"]),
  TemplateController.updateTemplate
);
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING"]),
  TemplateController.searchTemplate
);
export { router as TemplateRoute };
