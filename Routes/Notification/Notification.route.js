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
  ]),
  NotificationController.getAllNotifications
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
  ]),
  NotificationController.getUnreadCount
);

export { router as NotificationRoute };
