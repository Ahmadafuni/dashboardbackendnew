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
    const { name, manager, description, category } = req.body;
    const userId = req.userId;

    try {
      // Create new Department
      await prisma.departments.create({
        data: {
          Name: name,
          Description: description,
          CategoryName: category,
          Manager: { connect: { Id: manager.id } },
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
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getAllDepartments: async (req, res, next) => {
    const userId = req.userId;

    const page = parseInt(req.headers["page"]) || 1;
    const itemsPerPage = parseInt(req.headers["items-per-page"]) || 7;

    const skip = (page - 1) * itemsPerPage;

    try {
      // Get all departments
      const departments = await prisma.departments.findMany({
        skip: skip,
        take: itemsPerPage,
        where: {
          AND: [
            { Audit: { IsDeleted: false } },
            { ManagerId: { not: userId } },
          ],
        },
        select: {
          Id: true,
          Name: true,
          CategoryName: true,
          Description: true,
          Manager: {
            select: {
              Id: true,
              Firstname: true,
              Lastname: true,
            },
          },
        },
      });

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

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب الأقسام بنجاح!",
        data: {
          departments,
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
  getDepartmentById: async (req, res, next) => {
    const departmentId = parseInt(req.params.id);
    try {
      // Get department
      const department = await prisma.departments.findUnique({
        where: {
          Id: +departmentId,
        },
        include: {
          Manager: {
            select: {
              Firstname: true,
              Lastname: true,
              Username: true,
              Email: true,
              PhoneNumber: true,
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب القسم بنجاح!",
        data: department,
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
    const { name, manager, description, category } = req.body;
    const departmentId = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.departments.update({
        where: {
          Id: +departmentId,
        },
        data: {
          Name: name,
          Description: description,
          CategoryName: category,
          Manager: { connect: { Id: manager.id } },
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
          CategoryName: true,
          Description: true,
          Manager: {
            select: {
              Id: true,
              Firstname: true,
              Lastname: true,
            },
          },
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
