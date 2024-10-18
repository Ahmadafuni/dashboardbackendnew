import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import ChartController from "../../Controllers/Chart/Chart.js";

const router = express.Router();

router.get(
    "/orderchart",
    verifyUser(["FACTORYMANAGER","ENGINEERING","MotherCompany"]),
    ChartController.getOrderChartData
);


export { router as ChartRoute };
