import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import TrackingModelController from "../../Controllers/TrackingModel/TrackingModel.controller.js";

const router = express.Router();

router.get(
  "/current/dep",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
    "DRAWING",
  ]),
  TrackingModelController.getAllTrackingBydepartment
);

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
  ]),
  TrackingModelController.sendForCheckingOthers
);
router.get(
  "/confirm/variant/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
    "DRAWING",
  ]),
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
  ]),
  TrackingModelController.rejectVariant
);

router.get(
  "/complete/variant/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
    "DRAWING",
  ]),
  TrackingModelController.completeVariant
);

router.post(
  "/pauseunpause/variant/:id",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
    "DRAWING",
  ]),
  TrackingModelController.pauseUnpause
);

const TrackingModelRoute = router;
export { TrackingModelRoute };
