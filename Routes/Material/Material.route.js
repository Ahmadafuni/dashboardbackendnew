import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import MaterialController from "../../Controllers/Material/Material.controller.js";

const router = express.Router();

router.post(
  "/parent",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialController.createMaterialParent
);
router.post(
  "/child/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialController.createMaterialChild
);
router.get(
  "/parent/all",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialController.getAllParentMaterials
);
router.get(
    "/childbyparent/:id",
    verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
    MaterialController.getChildMaterialByParentId
);
router.get(
  "/child/all/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialController.getAllChildMaterials
);
router.get(
  "/parent",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialController.getMaterialNames
);
router.get(
  "/child/names/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialController.getChildMaterialNames
);
router.get(
  "/parent/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialController.getParentMaterialById
);
router.get(
  "/child/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialController.getChildMaterialById
);
router.delete(
  "/parent/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialController.deleteParentMaterial
);
router.delete(
  "/child/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialController.deleteChildMaterial
);
router.put(
  "/parent/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialController.updateParentMaterial
);
router.put(
  "/child/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialController.updateChildMaterial
);
router.get(
  "/parent/search/:searchTerm",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  MaterialController.searchMaterial
);



const MaterialRoute = router;
export { MaterialRoute };
