import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ChartController from "../../Controllers/Chart/Chart.js";

const router = express.Router();

router.get(
    "/orderchart",
    verifyUser(["FACTORYMANAGER","ENGINEERING","MotherCompany","PRODUCTION"]),
    ChartController.getOrderChartData
);

router.get(
    "/notechart",
    verifyUser(["FACTORYMANAGER","ENGINEERING","HumanResource"]),
    ChartController.getAllAttentionNotes
);

router.get(
    "/taskchart",
    verifyUser(["FACTORYMANAGER","ENGINEERING","HumanResource"]),
    ChartController.getTasksChart
);



export { router as ChartRoute };
