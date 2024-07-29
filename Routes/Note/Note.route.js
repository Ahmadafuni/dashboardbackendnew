import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import NoteController from "../../Controllers/Note/Note.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  NoteController.createNote
);
router.get(
  "/current-notes",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
     "WAREHOUSEMANAGER"
  ]),
  NoteController.getCurrentDepartmentNotes
);
router.get(
  "/all-created",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  NoteController.getAllCreatedNotes
);
router.get(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  NoteController.getNoteById
);
router.put(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  NoteController.updateNote
);

router.delete(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  NoteController.deleteNote
);

export { router as NoteRoute };
