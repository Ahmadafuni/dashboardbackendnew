import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import CollectionCotroller from "../../Controllers/Collection/Collection.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["FACTORYMANAGER"]),
  CollectionCotroller.createCollection
);

router.get(
  "/update-archived",
  verifyUser(["FACTORYMANAGER", "STOREMANAGER", "ENGINEERING"]),
  CollectionCotroller.toggleArchivedCollectionById
);

router.get(
  "/archived",
  verifyUser(["FACTORYMANAGER", "STOREMANAGER", "ENGINEERING"]),
  CollectionCotroller.getArchivedCollections
);

router.get(
  "/all",
  // verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  CollectionCotroller.getCollections
);
router.get(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  CollectionCotroller.getCollectionNames
);
router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  CollectionCotroller.getCollectionById
);
router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  CollectionCotroller.deleteCollection
);
router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  CollectionCotroller.updateCollection
);

export { router as CollectionRoute };
