import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import TaskController from "../../Controllers/Task/Task.controller.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
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
  verifyUser(["FACTORYMANAGER", "ENGINEERING", "CUTTING"]),
  TaskController.updateTask
);
// router.get(
//   "/search/:query",
//   verifyUser(["FACTORYMANAGER", "CUTTING", "ENGINEERING"]),
//   TaskController.searchTasks
// );
const TaskRoute = router;
export { TaskRoute };
