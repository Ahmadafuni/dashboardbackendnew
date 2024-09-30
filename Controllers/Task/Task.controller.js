import prisma from "../../client.js";
import { io, socketUserList } from "../../server.js";

const TaskController = {
  createTask: async (req, res, next) => {
    const { TaskName, DueDate, AssignedToDepartmentId, Description } = req.body;
    const userId = req.userId;
    const userDepartmentId = req.userDepartmentId;
    const file = req.file;
    try {
      await prisma.tasks.create({
        data: {
          TaskName: TaskName,
          DueAt: new Date(DueDate),
          Description: Description,
          AssignedFile: file
            ? `/${file.destination.split("/")[1]}/${file.filename}`
            : "",
          FeedbackFile: "",
          AssignedToDepartment: {
            connect: {
              Id: +AssignedToDepartmentId,
            },
          },
          CreatedByDepartment: {
            connect: {
              Id: +userDepartmentId,
            },
          },
          Audit: {
            create: {
              CreatedById: userId,
              UpdatedById: userId,
            },
          },
        },
      });
      // Add Notification
      await prisma.notifications.create({
        data: {
          Title: TaskName,
          Description: Description,
          ToDepartment: {
            connect: {
              Id: +AssignedToDepartmentId,
            },
          },
        },
      });

      // Send Notification
      const sUser = socketUserList.filter(
        (user) => user.dep === +AssignedToDepartmentId
      );
      if (sUser.length > 0) {
        sUser.forEach((user) => {
          io.to(user.sId).emit("notification", 1);
        });
      }
      // Return response
      return res.status(201).send({
        status: 201,
        message: "تم إنشاء المهمة بنجاح!",
        data: {},
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
  getAllTasks: async (req, res, next) => {

    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const totalRecords = await prisma.tasks.count({});

    const totalPages = Math.ceil(totalRecords / size);
    const userDepartmentId = req.userDepartmentId;
    try {
      const tasks = await prisma.tasks.findMany({
        where: {
          Audit: { IsDeleted: false },
          CreatedByDepartmentId: userDepartmentId,
        },
        skip: (page - 1) * size,
        take: size ,
        select: {
          Id: true,
          TaskName: true,
          DueAt: true,
          Description: true,
          AssignedFile: true,
          Status: true,
          Feedback: true,
          AssignedToDepartment: {
            select: {
              Id: true,
              Name: true,
            },
          },
        },
      });

      // Return response with formatted tasks
      return res.status(200).send({
        status: 200,
        totalPages,
        message: "تم استرجاع المهام بنجاح!",
        data: tasks,
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
  getCurrentTasks: async (req, res, next) => {
    const userDepartmentId = req.userDepartmentId;
    try {
      const tasks = await prisma.tasks.findMany({
        where: {
          Audit: { IsDeleted: false },
          AssignedToDepartmentId: userDepartmentId,
        },
        select: {
          Id: true,
          TaskName: true,
          DueAt: true,
          Description: true,
          AssignedFile: true,
          Status: true,
          Feedback: true,
          CreatedByDepartment: {
            select: {
              Id: true,
              Name: true,
            },
          },
        },
      });

      // Return response with formatted tasks
      return res.status(200).send({
        status: 200,
        message: "تم استرجاع المهام بنجاح!",
        data: tasks,
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
  getTaskById: async (req, res, next) => {
    const id = req.params.id;
    try {
      const task = await prisma.tasks.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (!task) {
        return res.status(404).send({
          status: 404,
          message: "Task not found!",
          data: {},
        });
      }

      // Return response with formatted tasks
      return res.status(200).send({
        status: 200,
        message: "تم استرجاع المهام بنجاح!",
        data: {
          TaskName: task.TaskName,
          DueDate: task.DueAt,
          AssignedToDepartmentId: task.AssignedToDepartmentId.toString(),
          Description: task.Description,
        },
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
  deleteTask: async (req, res, next) => {
    const taskId = parseInt(req.params.id);
    const userDepartmentId = req.userDepartmentId;
    const userId = req.userId;
    try {
      const task = await prisma.tasks.findUnique({
        where: {
          Id: taskId,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (!task) {
        return res.status(404).send({
          status: 404,
          message: "Task not found!",
          data: {},
        });
      }

      if (task.CreatedByDepartmentId !== +userDepartmentId) {
        return res.status(405).send({
          status: 405,
          message: "Not permitted to update task!",
          data: {},
        });
      }

      await prisma.tasks.update({
        where: {
          Id: taskId,
        },
        data: {
          Audit: {
            update: {
              IsDeleted: true,
              UpdatedById: userId,
            },
          },
        },
      });

      return res.status(200).send({
        status: 200,
        message: "تم حذف المهمة بنجاح!",
        data: {},
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  updateTask: async (req, res, next) => {
    const { TaskName, DueDate, AssignedToDepartmentId, Description } = req.body;
    const id = req.params.id;
    const userId = req.userId;
    const userDepartmentId = req.userDepartmentId;
    const file = req.file;

    try {
      const task = await prisma.tasks.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (!task) {
        return res.status(404).send({
          status: 404,
          message: "Task not found!",
          data: {},
        });
      }

      if (task.Status !== "PENDING") {
        return res.status(405).send({
          status: 405,
          message: "Task already started or completed!",
          data: {},
        });
      }

      if (task.CreatedByDepartmentId !== +userDepartmentId) {
        return res.status(405).send({
          status: 405,
          message: "Not permitted to update task!",
          data: {},
        });
      }

      await prisma.tasks.update({
        where: {
          Id: +id,
        },
        data: {
          TaskName: TaskName,
          DueAt: new Date(DueDate),
          Description: Description,
          AssignedFile: file
            ? `/${file.destination.split("/")[1]}/${file.filename}`
            : task.AssignedFile,
          AssignedToDepartment: {
            connect: {
              Id: +AssignedToDepartmentId,
            },
          },
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });

      return res.status(200).send({
        status: 200,
        message: "تم تحديث المهمة بنجاح!",
        data: {},
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getTaskNames: async (req, res, next) => {
    try {
      const taskNames = await prisma.tasks
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            TaskName: true,
          },
        })
        .then((tasks) =>
          tasks.map((task) => ({
            id: task.Id,
            name: task.TaskName,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء المهام بنجاح!",
        data: taskNames,
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
  searchTasks: async (req, res, next) => {
    const query = req.params.searchTerm;
    try {
      if (!query || query.length < 3) {
        return res.status(400).send({
          status: 400,
          message: "Query must be at least 3 characters long.",
          data: {},
        });
      }
      const datas = await prisma.tasks.findMany({
        where: {
          OR: [
            {
              TaskName: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              Status: {
                equals: query,
              },
            },
            {
              Priority: {
                equals: query,
              },
            },
            {
              AssignedToDepartment: {
                Name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
            {
              CreatedByDepartment: {
                Name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            },
          ],
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          AssignedToDepartment: true,
          CreatedByDepartment: true,
          CreatedByManager: true,
        },
      });
      // Format tasks
      const formattedTasks = datas.map((task) => ({
        id: task.Id,
        taskName: task.TaskName,
        dueDate: task.DueAt.toISOString(),
        status: task.Status,
        priority: task.Priority,
        assignedToDepartment: {
          id: task.AssignedToDepartment.Id,
          name: task.AssignedToDepartment.Name,
        },
        createdByDepartment: {
          id: task.CreatedByDepartment?.Id,
          name: task.CreatedByDepartment?.Name,
        },
        createdByManager: {
          id: task.CreatedByManager?.Id,
          name:
            task.CreatedByManager?.Firstname +
            " " +
            task.CreatedByManager?.Lastname,
        },
        notes: task.Notes,
      }));
      return res.status(200).send({
        status: 200,
        message: "تم جلب المهام بنجاح!",
        data: formattedTasks,
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  startTask: async (req, res, next) => {
    const id = req.params.id;
    const userDepartmentId = req.userDepartmentId;
    try {
      const task = await prisma.tasks.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (!task) {
        return res.status(404).send({
          status: 404,
          message: "Task not found!",
          data: {},
        });
      }

      if (task.AssignedToDepartmentId !== userDepartmentId) {
        return res.status(405).send({
          status: 405,
          message: "You are not permitted to start the task!",
          data: {},
        });
      }

      if (task.Status !== "PENDING") {
        return res.status(409).send({
          status: 409,
          message: "Task already started or in progress!",
          data: {},
        });
      }

      await prisma.tasks.update({
        where: {
          Id: +id,
        },
        data: {
          Status: "ONGOING",
        },
      });

      return res.status(200).send({
        status: 200,
        message: "Task started successfully!",
        data: {},
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getSubmitFeedback: async (req, res, next) => {
    const id = req.params.id;
    try {
      const feedback = await prisma.tasks.findUnique({
        where: {
          Id: +id,
        },
        select: {
          Feedback: true,
          FeedbackFile: true,
        },
      });
      console.log(feedback);
      return res.status(200).send({
        status: 200,
        message: "Feedback fetched successfully!",
        data: {
          Feedback: feedback.Feedback ? feedback.Feedback : "",
          FeedbackFile: feedback.FeedbackFile,
        },
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  submitFeedback: async (req, res, next) => {
    const id = req.params.id;
    const { Feedback } = req.body;
    const userDepartmentId = req.userDepartmentId;
    const file = req.file;
    try {
      const task = await prisma.tasks.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (!task) {
        return res.status(404).send({
          status: 404,
          message: "Task not found!",
          data: {},
        });
      }

      if (task.AssignedToDepartmentId !== userDepartmentId) {
        return res.status(405).send({
          status: 405,
          message: "You are not permitted to start the task!",
          data: {},
        });
      }

      await prisma.tasks.update({
        where: {
          Id: +id,
        },
        data: {
          Feedback: Feedback,
          Status: "COMPLETED",
          FeedbackFile: file
            ? `/${file.destination.split("/")[1]}/${file.filename}`
            : !task.FeedbackFile
            ? ""
            : task.FeedbackFile,
        },
      });

      return res.status(200).send({
        status: 200,
        message: "Task submited successfully!",
        data: {},
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
};

export default TaskController;
