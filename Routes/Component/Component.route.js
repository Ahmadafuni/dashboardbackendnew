import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ComponentController from "../../Controllers/Component/Component.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ComponentController.createComponent
);
router.get(
  "/all",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ComponentController.getComponents
);
router.get(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ComponentController.getComponentNames
);
router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ComponentController.getComponentById
);
router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ComponentController.deleteComponent
);
router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ComponentController.updateComponent
);
router.get(
  "/search/:searchTerm",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  ComponentController.searchComponents
);

export { router as ComponentRoute };
