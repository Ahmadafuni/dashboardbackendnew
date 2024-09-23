import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import TrackingModelController from "../../Controllers/TrackingModel/TrackingModel.controller.js";

const router = express.Router();


router.get(
  "/start/variant/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
    "DRAWING",
    "WAREHOUSEMANAGER",
  ]),
  TrackingModelController.startVariant
);

router.post(
  "/sent/cutting/checking/variant/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
    "DRAWING",
    "WAREHOUSEMANAGER",
  ]),
  TrackingModelController.sendForCheckingCutting
);
router.post(
  "/sent/others/checking/variant/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
    "DRAWING",
    "WAREHOUSEMANAGER",
  ]),
  TrackingModelController.sendForCheckingOthers
);
router.get(
  "/confirm/variant/:id",
  TrackingModelController.confirmVariant
);
router.get(
  "/reject/variant/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
    "DRAWING",
    "WAREHOUSEMANAGER",
  ]),
  TrackingModelController.rejectVariant
);

router.put(
  "/complete/variant/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
    "DRAWING",
    "WAREHOUSEMANAGER",
  ]),
  TrackingModelController.completeVariant
);

router.post(
  "/pausetracking/variant/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
    "DRAWING",
    "WAREHOUSEMANAGER",
  ]),
  TrackingModelController.pauseTracking
);
router.post(
    "/unpausetracking/variant/:id",
    verifyUser([
        "FACTORYMANAGER",
        "ENGINEERING",
        "CUTTING",
        "TAILORING",
        "PRINTING",
        "QUALITYASSURANCE",
        "DRAWING",
        "WAREHOUSEMANAGER",
    ]),
    TrackingModelController.unpauseTracking
);

router.get(
  "/alltracking",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  TrackingModelController.getAllTracking
);

router.get("/current/dep",
    verifyUser([
        "FACTORYMANAGER",
        "ENGINEERING",
        "CUTTING",
        "TAILORING",
        "PRINTING",
        "QUALITYASSURANCE",
        "DRAWING",
        "WAREHOUSEMANAGER",
    ]),
    TrackingModelController.getAllTrackingByDepartment);


router.get("/model/details/dept" ,
    verifyUser([
        "FACTORYMANAGER",
        "ENGINEERING",
        "CUTTING",
        "TAILORING",
        "PRINTING",
        "QUALITYASSURANCE",
        "DRAWING",
        "WAREHOUSEMANAGER",
    ]),
    TrackingModelController.getModelDetailsDepartment);

router.get("/model/details/mang" , TrackingModelController.getModelDetailsManager);

const TrackingModelRoute = router;
export { TrackingModelRoute };
