import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import MeasurementController from "../../Controllers/Measurement/Measurement.controller.js";

const router = express.Router();

router.get(
  "/all/:id/:type",
  verifyUser(["FACTORYMANAGER"]),
  MeasurementController.getAllMeasurements
);
router.get(
  "/:id",
  verifyUser(["FACTORYMANAGER"]),
  MeasurementController.getMeasurementById
);
router.post(
  "/",
  verifyUser(["FACTORYMANAGER"]),
  MeasurementController.createMeasurement
);
router.delete(
  "/:id",
  verifyUser(["FACTORYMANAGER"]),
  MeasurementController.deleteMeasurement
);
router.put(
  "/:id",
  verifyUser(["FACTORYMANAGER"]),
  MeasurementController.updateMeasurement
);

export { router as MeasurementRoute };
