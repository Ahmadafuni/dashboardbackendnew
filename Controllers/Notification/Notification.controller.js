import prisma from "../../client.js";

const NotificationController = {
  getNotificationsByDepartment: async (req, res, next) => {
    const userDepartmentId = req.userDepartmentId;
    try {
      const notifications = await prisma.notifications.findMany({
        where: {
          ToDepartmentId: userDepartmentId,
        },
        select: {
          Id: true,
          Title: true,
          Description: true,
        },
      });
      return res.status(200).send({
        status: 200,
        message: "Notifications!",
        data: notifications,
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "Internal server error. Please try again later!",
        data: {},
      });
    }
  },

  getUnreadCountByDepartment: async (req, res, next) => {
    const userDepartmentId = req.userDepartmentId;
    try {
      const unreadCount = await prisma.notifications.count({
        where: {
          ToDepartmentId: userDepartmentId,
          IsSeen: false,
        },
      });
      return res.status(200).send({
        status: 200,
        message: "Unread notifications!",
        data: unreadCount,
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "Internal server error. Please try again later!",
        data: {},
      });
    }
  },

  markAsRead: async (req, res, next) => {
    const { id } = req.params;
    try {
      await prisma.notifications.update({
        where: { Id: parseInt(id) },
        data: { IsSeen: true },
      });
      return res.status(200).send({
        status: 200,
        message: "Notification marked as read!",
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "Internal server error. Please try again later!",
      });
    }
  },

  clearAll: async (req, res, next) => {
    const userDepartmentId = req.userDepartmentId;
    try {
      await prisma.notifications.updateMany({
        where: { ToDepartmentId: userDepartmentId },
        data: { IsSeen: true },
      });
      return res.status(200).send({
        status: 200,
        message: "All notifications marked as read!",
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "Internal server error. Please try again later!",
      });
    }
  },

  getAllNotifications: async (req, res, next) => {
    try {
      const notifications = await prisma.notifications.findMany({
        select: {
          Id: true,
          Title: true,
          Description: true,
        },
      });
      return res.status(200).send({
        status: 200,
        message: "All notifications!",
        data: notifications,
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "Internal server error. Please try again later!",
        data: {},
      });
    }
  }
};

export default NotificationController;
