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
    "WAREHOUSEMANAGER","Accounting" ,"Monitoring"
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
    "WAREHOUSEMANAGER","Accounting" ,"Monitoring"
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
    "WAREHOUSEMANAGER","Accounting" ,"Monitoring"
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
    "WAREHOUSEMANAGER","Accounting" ,"Monitoring"
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
    "WAREHOUSEMANAGER","Accounting" ,"Monitoring"
  ]),
  TrackingModelController.rejectVariant
);

router.get(
  "/restart/:id",
  // verifyUser([
  //   "FACTORYMANAGER",
  //   "ENGINEERING",
  // ]),
  TrackingModelController.restartRejectedModel
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
    "WAREHOUSEMANAGER","Accounting"  ,"Monitoring"
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
    "WAREHOUSEMANAGER","Accounting"  ,"Monitoring"
  ]),
  TrackingModelController.pauseUnpause
);

router.get(
  "/alltracking",
  verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
  TrackingModelController.getAllTracking
);

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
    "WAREHOUSEMANAGER",
    "Accounting",
    "Monitoring", 
  ]),
  TrackingModelController.getAllTrackingByDepartment
);

router.get(
  "/model/details/dept",
  verifyUser([
    "FACTORYMANAGER",
    "ENGINEERING",
    "CUTTING",
    "TAILORING",
    "PRINTING",
    "QUALITYASSURANCE",
    "DRAWING",
    "WAREHOUSEMANAGER",
    "Accounting",
    "Monitoring" 
  ]),
  TrackingModelController.getModelDetailsDepartment
);

router.get(
  "/model/details/mang",
  TrackingModelController.getModelDetailsManager
);

const TrackingModelRoute = router;
export { TrackingModelRoute };
