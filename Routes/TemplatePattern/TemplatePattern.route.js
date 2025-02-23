import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import TemplatePatterController from "../../Controllers/TemplatePattern/TemplatePattern.controller.js";

const rouetr = express.Router();

rouetr.post(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplatePatterController.createPattern
);
rouetr.get(
  "/all",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","DRAWING"]),
  TemplatePatterController.getPatterns
);
rouetr.get(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","DRAWING"]),
  TemplatePatterController.getTemplatePatternNames
);
rouetr.get(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","DRAWING"]),
  TemplatePatterController.getPatternById
);
rouetr.delete(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplatePatterController.deletePattern
);
rouetr.put(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplatePatterController.updatePattern
);
rouetr.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","DRAWING"]),
  TemplatePatterController.searchTemplateTypes
);
export { rouetr as TemplatePatternRoute };
