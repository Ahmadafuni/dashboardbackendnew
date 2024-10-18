import express from "express";
import DepartmentController from "../../Controllers/Department/Department.controller.js";
import { verifyUser } from "../../Middleware/Auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["HumanResource", "ENGINEERING", "FACTORYMANAGER"]),
  DepartmentController.createDepartment
);
router.get("/create-central", DepartmentController.centralDepartment);
router.put(
  "/:id",
  verifyUser(["HumanResource", "ENGINEERING", "FACTORYMANAGER"]),
  DepartmentController.updateDepartment
);

router.get(
  "/all",
  verifyUser(["HumanResource", "ENGINEERING", "FACTORYMANAGER"]),
  DepartmentController.getAllDepartments
);

router.get("/", DepartmentController.getDepartmentNames);

router.get(
  "/:id",
  verifyUser(["HumanResource", "ENGINEERING", "FACTORYMANAGER"]),
  DepartmentController.getDepartmentById
);

router.get(
  "/search/:searchTerm",
  verifyUser(["HumanResource", "ENGINEERING", "FACTORYMANAGER"]),
  DepartmentController.searchDepartments
);

router.delete(
  "/:id",
  verifyUser(["HumanResource", "ENGINEERING", "FACTORYMANAGER"]),
  DepartmentController.deleteDepartment
);

router.get(
  "/search/:searchTerm",
  verifyUser(["HumanResource", "ENGINEERING", "FACTORYMANAGER"]),
  DepartmentController.searchDepartments
);

const DepartmentRouter = router;
export { DepartmentRouter };
