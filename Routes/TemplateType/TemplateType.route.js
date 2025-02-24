import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import TemplateTypeController from "../../Controllers/TemplateType/TemplateType.controller.js";

const rouetr = express.Router();

rouetr.post(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplateTypeController.createType
);
rouetr.get(
  "/all",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","DRAWING","PRODUCTION"]),
  TemplateTypeController.getTypes
);
rouetr.get(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","DRAWING","PRODUCTION"]),
  TemplateTypeController.getTemplateTypeNames
);
rouetr.get(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","DRAWING","PRODUCTION"]),
  TemplateTypeController.getTypeById
);
rouetr.delete(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplateTypeController.deleteType
);
rouetr.put(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  TemplateTypeController.updateType
);
rouetr.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","DRAWING","PRODUCTION"]),
  TemplateTypeController.searchTemplateTypes
);
export { rouetr as TemplateTypeRoute };
