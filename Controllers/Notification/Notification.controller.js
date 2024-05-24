import prisma from "../../client.js";

const NotificationController = {
  getAllNotifications: async (req, res, next) => {
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
      // Return Response
      return res.status(200).send({
        status: 200,
        message: "Notifications!",
        data: notifications,
      });
    } catch (error) {
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getUnreadCount: async (req, res, next) => {
    const userDepartmentId = req.userDepartmentId;
    try {
      const unreadCount = await prisma.notifications.count({
        where: {
          ToDepartmentId: userDepartmentId,
          IsSeen: false,
        },
      });
      // Return Response
      return res.status(200).send({
        status: 200,
        message: "Unread notifications!",
        data: unreadCount,
      });
    } catch (error) {
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
};
export default NotificationController;
