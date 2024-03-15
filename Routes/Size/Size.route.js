import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import SizeController from "../../Controllers/Size/Size.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  SizeController.createSize
);
router.get(
  "/all",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  SizeController.getSizes
);
router.get(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  SizeController.getSizeNames
);
router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  SizeController.getSizeById
);
router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  SizeController.deleteSize
);
router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  SizeController.updateSize
);
router.get(
  "/search/:searchTerm",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  SizeController.searchSize
);
export { router as SizeRoute };
