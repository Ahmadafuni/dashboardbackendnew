import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import NoteController from "../../Controllers/Note/Note.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
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
  ]),
  NoteController.getCurrentDepartmentNotes
);
router.get(
  "/all-created",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  NoteController.getAllCreatedNotes
);
router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  NoteController.getNoteById
);
router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  NoteController.updateNote
);
// router.get(
//   "/thisdepartment",
// verifyUser([
//   "FACTORYMANAGER",
//   "ENGINEERING",
//   "CUTTING",
//   "TAILORING",
//   "PRINTING",
//   "QUALITYASSURANCE",
// ]),
//   (req, res, next) => {
//     console.log("Hello");
//   }
// );
router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  NoteController.deleteNote
);

export { router as NoteRoute };
