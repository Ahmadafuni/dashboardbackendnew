import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ReportsController from "../../Controllers/Reports/Report.controller.js";

const router = express.Router();
router.post("/generateReport", 
verifyUser(["MotherCompany", "ENGINEERING", "FACTORYMANAGER"]),
ReportsController.generateReport);
router.post("/downloadReport", 
verifyUser(["MotherCompany", "ENGINEERING", "FACTORYMANAGER"]),
ReportsController.downloadReport);
router.post("/generateReports", 
verifyUser(["MotherCompany", "ENGINEERING", "FACTORYMANAGER"]),
ReportsController.generateReports);
router.post("/downloadReports", 
verifyUser(["MotherCompany", "ENGINEERING", "FACTORYMANAGER"]),
ReportsController.downloadReports);

router.get("/getAlldata", verifyUser(["MotherCompany", "ENGINEERING", "FACTORYMANAGER"]),
ReportsController.fetchAllData);


router.post("/productionReport", verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
ReportsController.productionReport);

router.post("/orderReport", verifyUser(["MotherCompany", "ENGINEERING", "FACTORYMANAGER"]),
ReportsController.orderReport);

const ReportsRoute = router;
export { ReportsRoute };