import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import NotificationController from "../../Controllers/Notification/Notification.controller.js";

const router = express.Router();

router.get(
    "/",
    verifyUser([
        "FACTORYMANAGER",
        "ENGINEERING",
        "CUTTING",
        "TAILORING",
        "PRINTING",
        "QUALITYASSURANCE",
        "WAREHOUSEMANAGER",

    ]),
    NotificationController.getNotificationsByDepartment
);

router.get(
    "/unread-count",
    verifyUser([
        "FACTORYMANAGER",
        "ENGINEERING",
        "CUTTING",
        "TAILORING",
        "PRINTING",
        "QUALITYASSURANCE",
        "WAREHOUSEMANAGER",

    ]),
    NotificationController.getUnreadCountByDepartment
);

router.put(
    "/:id/read",
    verifyUser([
        "FACTORYMANAGER",
        "ENGINEERING",
        "CUTTING",
        "TAILORING",
        "PRINTING",
        "QUALITYASSURANCE",
        "WAREHOUSEMANAGER",

    ]),
    NotificationController.markAsRead
);

router.put(
    "/clear-all",
    verifyUser([
        "FACTORYMANAGER",
        "ENGINEERING",
        "CUTTING",
        "TAILORING",
        "PRINTING",
        "QUALITYASSURANCE",
        "WAREHOUSEMANAGER",

    ]),
    NotificationController.clearAll
);

router.get(
    "/all",
    verifyUser(["FACTORYMANAGER", "ENGINEERING"]),
    NotificationController.getAllNotifications
);

export { router as NotificationRoute };
