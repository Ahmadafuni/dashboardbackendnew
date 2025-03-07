import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ReportsController from "../../Controllers/Reports/Report.controller.js";

const router = express.Router();

router.post("/generateReport", 
verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]), 
ReportsController.generateReport);
router.post("/downloadReport", 
verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]), 
ReportsController.downloadReport);
router.post("/generateReports", 
verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]), 
ReportsController.generateReports);
router.post("/downloadReports", 
verifyUser(["WAREHOUSEMANAGER", "ENGINEERING", "FACTORYMANAGER"]), 
ReportsController.downloadReports);

const ReportsRoute = router;
export { ReportsRoute };
