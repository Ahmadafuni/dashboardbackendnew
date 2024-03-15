import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import TemplateTypeController from "../../Controllers/TemplateType/TemplateType.controller.js";

const rouetr = express.Router();

rouetr.post(
  "/",
  verifyUser(["ENGINEERING"]),
  TemplateTypeController.createType
);
rouetr.get(
  "/all",
  verifyUser(["ENGINEERING"]),
  TemplateTypeController.getTypes
);
rouetr.get(
  "/",
  verifyUser(["ENGINEERING"]),
  TemplateTypeController.getTemplateTypeNames
);
rouetr.get(
  "/:id",
  verifyUser(["ENGINEERING"]),
  TemplateTypeController.getTypeById
);
rouetr.delete(
  "/:id",
  verifyUser(["ENGINEERING"]),
  TemplateTypeController.deleteType
);
rouetr.put(
  "/:id",
  verifyUser(["ENGINEERING"]),
  TemplateTypeController.updateType
);
rouetr.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING"]),
  TemplateTypeController.searchTemplateTypes
);
export { rouetr as TemplateTypeRoute };
