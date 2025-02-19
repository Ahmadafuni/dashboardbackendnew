import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import TemplateController from "../../Controllers/Template/Template.controller.js";
import { upload } from "../../Middleware/Upload.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER" ,"DRAWING"]),
  upload.single("template"),
  TemplateController.createTemplate
);
router.get(
  "/all",
  verifyUser(["ENGINEERING", "FACTORYMANAGER", "Monitoring" ,"DRAWING"]),
  TemplateController.getTemplates
);
router.get(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","Monitoring" ,"DRAWING"]),
  TemplateController.getTemplateNames
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","Monitoring" ,"DRAWING"]),
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
  upload.single("template"),
  TemplateController.updateTemplate
);
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","Monitoring" ,"DRAWING"]),
  TemplateController.searchTemplate
);
router.get(
  "/view-details/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","Monitoring" ,"DRAWING"]),
  TemplateController.viewTemplateDetails
);
export { router as TemplateRoute };
