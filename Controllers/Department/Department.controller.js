import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
import prisma from "../../client.js";

const DepartmentController = {
  centralDepartment: async (req, res, next) => {
    try {
      const department = await prisma.departments.findFirst({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (department) {
        return res.status(409).send({
          status: 409,
          message: "There is already a central department!",
          data: {},
        });
      }
      // Create Department
      await prisma.departments.create({
        data: {
          Name: "Central",
          Category: "FACTORYMANAGER",
          NameShort: "Central".toLowerCase(),
          Description: "Central department for factory managers.",
          Location: "Central",
          Audit: {
            create: { CreatedAt: new Date() },
          },
        },
      });
      // Return success response
      return res.status(200).send({
        status: 200,
        message: "Central department created successfully!",
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
  createDepartment: async (req, res, next) => {
    const { name, location, description, category } = req.body;
    const userId = req.userId;

    try {
      // Create new Department
      await prisma.departments.create({
        data: {
          Name: name,
          Description: description,
          Category: category,
          NameShort: name.toLowerCase(),
          Location: location,
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
        message: "تم إنشاء القسم بنجاح!",
        data: {},
      });
    } catch (error) {
      // Server error or unsolved error
      console.log("THE ERROR", error);
      if (error instanceof PrismaClientKnownRequestError) {
        return res.status(409).send({
          status: 409,
          message: "Department name already in use!",
          data: {},
        });
      }
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getAllDepartments: async (req, res, next) => {
    try {
      // Get all departments
      const departments = await prisma.departments.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          Name: true,
          Category: true,
          Description: true,
          Location: true,
        },
      });

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب الأقسام بنجاح!",
        data: departments,
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
  getDepartmentById: async (req, res, next) => {
    const departmentId = parseInt(req.params.id);
    try {
      // Get department
      const department = await prisma.departments.findUnique({
        where: {
          Id: departmentId,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (!department) {
        return res.status(404).send({
          status: 404,
          message: "Department not found!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب القسم بنجاح!",
        data: {
          name: department.Name,
          location: department.Location,
          description: department.Description,
          category: department.Category,
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
  updateDepartment: async (req, res, next) => {
    const { name, location, description, category } = req.body;
    const departmentId = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.departments.update({
        where: {
          Id: departmentId,
        },
        data: {
          Name: name,
          Description: description,
          CategoryName: category,
          Location: location,
          Audit: {
            update: {
              data: {
                UpdatedById: userId,
              },
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم تحديث القسم بنجاح!",
        data: {},
      });
    } catch (error) {
      // Server error or unsolved error
      console.log(error);
      if (error instanceof PrismaClientKnownRequestError) {
        return res.status(404).send({
          status: 404,
          message: "Department not found!",
          data: {},
        });
      }
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  deleteDepartment: async (req, res, next) => {
    const departmentId = parseInt(req.params.id);
    const userId = req.userId;

    try {
      await prisma.departments.update({
        where: {
          Id: +departmentId,
        },
        data: {
          Audit: {
            update: {
              data: {
                IsDeleted: true,
                UpdatedById: userId,
              },
            },
          },
        },
      });

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم حذف القسم بنجاح!",
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
  getDepartmentNames: async (req, res, next) => {
    try {
      const departmentNames = await prisma.departments
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
        })
        .then((departments) =>
          departments.map((department) => ({
            value: department.Id.toString(),
            label: department.Name,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء الأقسام بنجاح!",
        data: departmentNames,
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
  searchDepartments: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.departments.findMany({
        where: {
          Name: {
            contains: searchTerm,
            mode: "insensitive",
          },
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          Name: true,
          Category: true,
          Description: true,
          Location: true,
        },
      });

      return res.status(200).send({
        status: 200,
        message: "تم البحث بنجاح!",
        data: datas,
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

export default DepartmentController;
