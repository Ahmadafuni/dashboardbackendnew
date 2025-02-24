import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import CollectionController from "../../Controllers/Collection/Collection.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["FACTORYMANAGER"]),
  CollectionController.createCollection
);

router.get(
  "/update-archived",
  verifyUser(["FACTORYMANAGER", "ENGINEERING","PRODUCTION"]),
  CollectionController.toggleArchivedCollectionById
);

router.get(
  "/archived",
  verifyUser(["FACTORYMANAGER", "ENGINEERING","PRODUCTION"]),
  CollectionController.getArchivedCollections
);

router.get(
  "/all",
  // verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  CollectionController.getCollections
);
router.get(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","PRODUCTION"]),
  CollectionController.getCollectionNames
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER","PRODUCTION"]),
  CollectionController.getCollectionById
);
router.delete(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  CollectionController.deleteCollection
);
router.put(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  CollectionController.updateCollection
);

export { router as CollectionRoute };
