import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ReportsController from "../../Controllers/Reports/Report.controller.js";

const router = express.Router();
router.post("/generateReport", 
verifyUser(["MotherCompany", "ENGINEERING", "FACTORYMANAGER","Accounting","PRODUCTION"]),
ReportsController.generateReport);
router.post("/downloadReport", 
verifyUser(["MotherCompany", "ENGINEERING", "FACTORYMANAGER","Accounting","PRODUCTION"]),
ReportsController.downloadReport);
router.post("/generateReports", 
verifyUser(["MotherCompany", "ENGINEERING", "FACTORYMANAGER","Accounting","PRODUCTION"]),
ReportsController.generateReports);
router.post("/downloadReports", 
verifyUser(["MotherCompany", "ENGINEERING", "FACTORYMANAGER","Accounting","PRODUCTION"]),
ReportsController.downloadReports);

router.get("/getAlldata", verifyUser(["MotherCompany", "ENGINEERING", "FACTORYMANAGER","Accounting","PRODUCTION"]),
ReportsController.fetchAllData);


router.post("/productionReport", verifyUser(["ENGINEERING", "FACTORYMANAGER","Accounting","PRODUCTION"]),
ReportsController.productionReport);

router.post("/orderReport", verifyUser(["MotherCompany", "ENGINEERING", "FACTORYMANAGER","Accounting","PRODUCTION"]),
ReportsController.orderReport);


router.post(
    "/departmentProductionReport",
     verifyUser(["ENGINEERING", "FACTORYMANAGER", "Accounting","PRODUCTION"]),
    ReportsController.departmentProductionReport
);


const ReportsRoute = router;
export { ReportsRoute };