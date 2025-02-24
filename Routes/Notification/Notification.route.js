import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import NotificationController from "../../Controllers/Notification/Notification.controller.js";

const router = express.Router();

router.get(
    "/",
    verifyUser([
            "CUTTING",
            "DRAWING",
            "ENGINEERING",
            "FACTORYMANAGER",
            "PRINTING",
            "QUALITYASSURANCE",
            "TAILORING",
            "WAREHOUSEMANAGER",
            "HumanResource",
            "MotherCompany",
            "Accounting",
            "Monitoring",
            "PRODUCTION"

    ]),
    NotificationController.getNotificationsByDepartment
);

router.get(
    "/unread-count",
    verifyUser([
            "CUTTING",
            "DRAWING",
            "ENGINEERING",
            "FACTORYMANAGER",
            "PRINTING",
            "QUALITYASSURANCE",
            "TAILORING",
            "WAREHOUSEMANAGER",
            "HumanResource",
            "MotherCompany",
            "Accounting",
            "Monitoring",
            "PRODUCTION"
    ]),
    NotificationController.getUnreadCountByDepartment
);

router.get(
    "/unread-count/all",
    verifyUser([
            "FACTORYMANAGER",
            "ENGINEERING"
            ,"Accounting"]),
    NotificationController.getAllUnreadCount
);



router.put(
    "/:id/read",
    verifyUser([
            "CUTTING",
            "DRAWING",
            "ENGINEERING",
            "FACTORYMANAGER",
            "PRINTING",
            "QUALITYASSURANCE",
            "TAILORING",
            "WAREHOUSEMANAGER",
            "HumanResource",
            "MotherCompany",
            "Accounting",
            "Monitoring",
            "PRODUCTION"

    ]),
    NotificationController.markAsRead
);

router.put(
    "/clear-all",
    verifyUser([
            "CUTTING",
            "DRAWING",
            "ENGINEERING",
            "FACTORYMANAGER",
            "PRINTING",
            "QUALITYASSURANCE",
            "TAILORING",
            "WAREHOUSEMANAGER",
            "HumanResource",
            "MotherCompany",
            "Accounting",
            "Monitoring",
            "PRODUCTION"

    ]),
    NotificationController.clearAll
);

router.get(
    "/all",
    verifyUser(["FACTORYMANAGER", "ENGINEERING" ,"Monitoring","PRODUCTION"]),
    NotificationController.getAllNotifications
);

export { router as NotificationRoute };
