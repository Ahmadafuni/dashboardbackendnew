import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import TemplatePatterController from "../../Controllers/TemplatePattern/TemplatePattern.controller.js";

const rouetr = express.Router();

rouetr.post(
  "/",
  verifyUser(["ENGINEERING"]),
  TemplatePatterController.createPattern
);
rouetr.get(
  "/all",
  verifyUser(["ENGINEERING"]),
  TemplatePatterController.getPatterns
);
rouetr.get(
  "/",
  verifyUser(["ENGINEERING"]),
  TemplatePatterController.getTemplatePatternNames
);
rouetr.get(
  "/:id",
  verifyUser(["ENGINEERING"]),
  TemplatePatterController.getPatternById
);
rouetr.delete(
  "/:id",
  verifyUser(["ENGINEERING"]),
  TemplatePatterController.deletePattern
);
rouetr.put(
  "/:id",
  verifyUser(["ENGINEERING"]),
  TemplatePatterController.updatePattern
);
rouetr.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING"]),
  TemplatePatterController.searchTemplateTypes
);
export { rouetr as TemplatePatternRoute };
