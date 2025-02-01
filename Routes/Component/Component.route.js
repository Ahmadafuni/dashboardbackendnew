import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ComponentController from "../../Controllers/Component/Component.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  ComponentController.createComponent
);
router.get(
  "/all",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  ComponentController.getComponents
);
router.get(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  ComponentController.getComponentNames
);
router.get(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  ComponentController.getComponentById
);
router.delete(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  ComponentController.deleteComponent
);
router.put(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  ComponentController.updateComponent
);
router.get(
  "/search/:searchTerm",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  ComponentController.searchComponents
);

export { router as ComponentRoute };
