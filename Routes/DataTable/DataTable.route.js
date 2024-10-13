import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";

import DataTableController from "../../Controllers/DataTable/DataTable.controller.js";

const router = express.Router();

router.get(
    "/fields/:tableName" ,

    DataTableController.getAllFields
);

router.post(
    "/filter/:tableName" ,
    DataTableController.filterTable
);

router.get(
    "/filter/dashboard/:demoModelNumber/:stage" ,
    DataTableController.filterDashboard
);

export { router as DataTableRoute };