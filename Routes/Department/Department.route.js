import express from "express";
import DepartmentController from "../../Controllers/Department/Department.controller.js";
import { verifyUser } from "../../Middleware/Auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  DepartmentController.createDepartment
);

router.put(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  DepartmentController.updateDepartment
);

router.get(
  "/all",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  DepartmentController.getAllDepartments
);

router.get(
  "/",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  DepartmentController.getDepartmentNames
);

router.get(
  "/:id",
  verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  DepartmentController.getDepartmentById
);

router.get(
  "/search/:searchTerm",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  DepartmentController.searchDepartments
);

router.delete(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  DepartmentController.deleteDepartment
);

router.get(
  "/search/:searchTerm",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  DepartmentController.searchDepartments
);

const DepartmentRouter = router;
export { DepartmentRouter };
