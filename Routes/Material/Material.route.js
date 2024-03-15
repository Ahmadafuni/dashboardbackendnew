import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import MaterialController from "../../Controllers/Material/Material.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialController.createMaterial
);
router.get(
  "/all",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialController.getAllMaterials
);
router.get(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialController.getMaterialNames
);
router.get(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialController.getMaterialById
);
router.delete(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialController.deleteMaterial
);
router.put(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialController.updateMaterial
);
router.get(
  "/search/:searchTerm",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
  MaterialController.searchMaterial
);
const MaterialRoute = router;
export { MaterialRoute };
