import prisma from "../../client.js";

const TaskController = {
  createTask: async (req, res, next) => {
    const { taskName, dueDate, priority, assignedToDepartment, notes } =
      req.body;
    const userId = req.userId;
    const userRole = req.userRole;
    try {
      // Find the department where the managerId matches the userId
      if (userRole === "FACTORYMANAGER") {
        await prisma.tasks.create({
          data: {
            TaskName: taskName,
            Priority: priority,
            Notes: notes,
            DueAt: new Date(dueDate),
            AssignedToDepartment: {
              connect: {
                Id: assignedToDepartment,
              },
            },
            CreatedByManager: {
              connect: {
                Id: userId,
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
        // Return response
        return res.status(201).send({
          status: 201,
          message: "تم إنشاء المهمة بنجاح!",
          data: {},
        });
      }

      const department = await prisma.departments.findFirst({
        where: {
          ManagerId: userId,
        },
      });

      if (!department && userRole !== "FACTORYMANAGER") {
        return res.status(404).send({
          status: 404,
          message: "Department for the manager not found.",
          data: {},
        });
      }

      await prisma.tasks.create({
        data: {
          TaskName: taskName,
          Priority: priority,
          Notes: notes,
          DueAt: new Date(dueDate),
          AssignedToDepartment: {
            connect: {
              Id: assignedToDepartment,
            },
          },
          CreatedByDepartment: {
            connect: {
              Id: department.Id,
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
      // Return response
      return res.status(201).send({
        status: 201,
        message: "تم إنشاء المهمة بنجاح!",
        data: {},
      });
    } catch (error) {
      console.log("the task error", error);
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getAllTasks: async (req, res, next) => {
    const userId = req.userId;

    const page = parseInt(req.headers["page"]) || 1;
    const itemsPerPage = parseInt(req.headers["items-per-page"]) || 7;

    const skip = (page - 1) * itemsPerPage;

    try {
      const tasks = await prisma.tasks.findMany({
        skip: skip,
        take: itemsPerPage,
        where: {
          Audit: { IsDeleted: false },
        },
        include: {
          AssignedToDepartment: true,
          CreatedByDepartment: true,
          CreatedByManager: true,
        },
      });
      // Format tasks
      const formattedTasks = tasks.map((task) => ({
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

      const totalDeparts = await prisma.departments.count({
        where: {
          AND: [
            {
              Id: {
                not: userId,
              },
              Audit: {
                IsDeleted: false,
              },
            },
          ],
        },
      });

      // Return response with formatted tasks
      return res.status(200).send({
        status: 200,
        message: "تم استرجاع المهام بنجاح!",
        data: {
          formattedTasks,
          count: totalDeparts,
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
    try {
      const deletedTask = await prisma.tasks.delete({
        where: {
          Id: taskId,
        },
      });
      if (deletedTask) {
        return res.status(200).send({
          status: 200,
          message: "تم حذف المهمة بنجاح!",
          data: deletedTask,
        });
      }
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  updateTask: async (req, res, next) => {
    const taskId = parseInt(req.params.id);
    const { taskName, dueDate, status, priority, assignedToDepartment, notes } =
      req.body;

    // Check if assignedToDepartment is an object (not updated) or direct ID (updated)
    const assignedToDepartmentId =
      typeof assignedToDepartment === "object"
        ? assignedToDepartment.id
        : assignedToDepartment;

    // Prepare the data for updating, mapping frontend names to DB field names
    const updateData = {
      TaskName: taskName,
      DueAt: new Date(dueDate),
      Status: status,
      Priority: priority,
      AssignedToDepartment: {
        connect: {
          Id: assignedToDepartmentId,
        },
      },
      Notes: notes,
    };

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    try {
      const updatedTask = await prisma.tasks.update({
        where: {
          Id: taskId,
        },
        data: updateData,
      });
      if (updatedTask) {
        return res.status(200).send({
          status: 200,
          message: "تم تحديث المهمة بنجاح!",
          data: updatedTask,
        });
      }
    } catch (error) {
      console.log("THE ERROR", error);
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
};

export default TaskController;
