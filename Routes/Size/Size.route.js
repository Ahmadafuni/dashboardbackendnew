import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import SizeController from "../../Controllers/Size/Size.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER","DRAWING"]),
  SizeController.createSize
);
router.get(
  "/all",
  //verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SizeController.getSizes
);
router.get(
  "/",
  //verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SizeController.getSizeNames
);
router.get(
  "/:id",
  //verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  SizeController.getSizeById
);
router.delete(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER","DRAWING"]),
  SizeController.deleteSize
);
router.put(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER","DRAWING"]),
  SizeController.updateSize
);
router.get(
  "/search/:searchTerm",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER","DRAWING"]),
  SizeController.searchSize
);
router.get(
  "/by-template/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER","DRAWING"]),
  SizeController.getSizesByTemplate
);
router.get(
  "/by-model/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER","DRAWING"]),
  SizeController.getSizesByModel
);
export { router as SizeRoute };
