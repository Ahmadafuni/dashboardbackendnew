import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import TaskController from "../../Controllers/Task/Task.controller.js";
import { uploadTask } from "../../Middleware/Upload.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  uploadTask.single("task"),
  TaskController.createTask
);

router.get(
  "/all",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
  ]),
  TaskController.getAllTasks
);
router.get(
  "/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
  ]),
  TaskController.getTaskById
);
router.get(
  "/start/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
  ]),
  TaskController.startTask
);
router.get(
  "/",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  TaskController.getTaskNames
);

router.get(
  "/search/:query",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
  ]),
  TaskController.searchTasks
);

router.delete(
  "/:id",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  TaskController.deleteTask
);
router.put(
  "/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
  ]),
  uploadTask.single("task"),
  TaskController.updateTask
);
router.get(
  "/feedback/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
  ]),
  TaskController.getSubmitFeedback
);
router.put(
  "/feedback/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
  ]),
  uploadTask.single("task"),
  TaskController.submitFeedback
);
// router.get(
//   "/search/:query",
//   verifyUser(["FACTORYMANAGER", "CUTTING", "ENGINEERING"]),
//   TaskController.searchTasks
// );
const TaskRoute = router;
export { TaskRoute };
