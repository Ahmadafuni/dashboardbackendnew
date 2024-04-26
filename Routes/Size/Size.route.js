import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import SizeController from "../../Controllers/Size/Size.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SizeController.createSize
);
router.get(
  "/all",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SizeController.getSizes
);
router.get(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SizeController.getSizeNames
);
router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SizeController.getSizeById
);
router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SizeController.deleteSize
);
router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SizeController.updateSize
);
router.get(
  "/search/:searchTerm",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SizeController.searchSize
);
router.get(
  "/by-template/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SizeController.getSizesByTemplate
);
router.get(
  "/by-model/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SizeController.getSizesByModel
);
export { router as SizeRoute };
