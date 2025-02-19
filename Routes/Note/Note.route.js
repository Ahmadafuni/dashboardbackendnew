import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import NoteController from "../../Controllers/Note/Note.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser([
    "WAREHOUSEMANAGER",
    "ENGINEERING",
    "FACTORYMANAGER",
    "HumanResource",
    "MotherCompany",
  ]),
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
    "WAREHOUSEMANAGER",
    "HumanResource",
    "MotherCompany",
    "Accounting",
  ]),
  NoteController.getCurrentDepartmentNotes
);
router.get(
  "/all-created",
  verifyUser([
    "WAREHOUSEMANAGER",
    "ENGINEERING",
    "FACTORYMANAGER",
    "HumanResource",
    "MotherCompany",
  ]),
  NoteController.getAllCreatedNotes
);
router.get(
  "/:id",
  verifyUser([
    "WAREHOUSEMANAGER",
    "ENGINEERING",
    "FACTORYMANAGER",
    "HumanResource",
    "MotherCompany",
  ]),
  NoteController.getNoteById
);
router.put(
  "/:id",
  verifyUser([
    "WAREHOUSEMANAGER",
    "ENGINEERING",
    "FACTORYMANAGER",
    "HumanResource",
    "MotherCompany",
  ]),
  NoteController.updateNote
);

router.delete(
  "/:id",
  verifyUser([
    "WAREHOUSEMANAGER",
    "ENGINEERING",
    "FACTORYMANAGER",
    "HumanResource",
    "MotherCompany",
  ]),
  NoteController.deleteNote
);

export { router as NoteRoute };
