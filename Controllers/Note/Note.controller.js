import prisma from "../../client.js";
import { io, socketUserList } from "../../server.js";

const NoteController = {
  createNote: async (req, res, next) => {
    const { NoteType, AssignedToDepartmentId, Description } = req.body;
    const userId = req.userId;
    const userDepartmentId = req.userDepartmentId;
    try {
      await prisma.notes.create({
        data: {
          NoteType: NoteType,
          CreatedDepartment: {
            connect: {
              Id: +userDepartmentId,
            },
          },
          AssignedToDepartment: {
            connect: {
              Id: +AssignedToDepartmentId,
            },
          },
          Description: Description,
          Audit: {
            create: {
              CreatedById: userId,
              UpdatedById: userId,
            },
          },
        },
      });

      await prisma.notifications.create({
        data: {
          Title: `${NoteType}`,
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
      // Return Response
      return res.status(201).send({
        status: 201,
        message: "New note created successfully!",
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
  getAllCreatedNotes: async (req, res, next) => {
    const userDepartmentId = req.userDepartmentId;
    try {
      const notes = await prisma.notes.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          CreatedDepartmentId: +userDepartmentId,
        },
        select: {
          Id: true,
          NoteType: true,
          AssignedToDepartment: {
            select: {
              Id: true,
              Name: true,
            },
          },
          Description: true,
        },
      });
      return res.status(200).send({
        status: 200,
        message: "Notes fetched successfully!",
        data: notes,
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
  getNoteById: async (req, res, next) => {
    const id = req.params.id;
    try {
      const note = await prisma.notes.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (!note) {
        return res.status(404).send({
          status: 404,
          message: "Note not found!",
          data: {},
        });
      }
      return res.status(200).send({
        status: 200,
        message: "Note fetched successfully!",
        data: {
          NoteType: note.NoteType,
          AssignedToDepartmentId: note.AssignedToDepartmentId.toString(),
          Description: note.Description,
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
  updateNote: async (req, res, next) => {
    const { NoteType, AssignedToDepartmentId, Description } = req.body;
    const userId = req.userId;
    const id = parseInt(req.params.id);
    try {
      await prisma.notes.update({
        where: {
          Id: +id,
        },
        data: {
          NoteType: NoteType,
          AssignedToDepartment: {
            connect: {
              Id: +AssignedToDepartmentId,
            },
          },
          Description: Description,
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });
      return res.status(200).send({
        status: 200,
        message: "Note updated successfully!",
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
  deleteNote: async (req, res, next) => {
    const userId = req.userId;
    const id = parseInt(req.params.id);
    try {
      await prisma.notes.update({
        where: {
          Id: +id,
        },
        data: {
          Audit: {
            update: {
              UpdatedById: userId,
              IsDeleted: true,
            },
          },
        },
      });
      return res.status(200).send({
        status: 200,
        message: "Note deleted successfully!",
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
  getCurrentDepartmentNotes: async (req, res, next) => {
    const userDepartmentId = req.userDepartmentId;
    try {
      const notes = await prisma.notes.findMany({
        where: {
          AssignedToDepartmentId: userDepartmentId,
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          NoteType: true,
          CreatedDepartment: {
            select: {
              Id: true,
              Name: true,
            },
          },
          Description: true,
        },
      });
      return res.status(200).send({
        status: 200,
        message: "Notes fatched successfully!",
        data: notes,
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

export default NoteController;
