import prisma from "../../client.js";

const MaterialController = {
  createMaterial: async (req, res, next) => {
    const {
      name,
      type,
      color,
      quantity,
      unitOfMeasure,
      category,
      supplier,
      description,
    } = req.body;
    const userId = req.userId;
    try {
      await prisma.materials.create({
        data: {
          Name: name,
          Category: { connect: { Id: category.id } },
          Supplier: { connect: { Id: supplier.id } },
          Color: color,
          Description: description,
          Type: type,
          UnitOfMeasure: unitOfMeasure,
          Quantity: parseInt(quantity),
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
        message: "تم إنشاء المادة بنجاح!",
        data: {},
      });
    } catch (error) {
      console.log(error);
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getAllMaterials: async (req, res, next) => {
    const page = parseInt(req.headers["page"]) || 1;
    const itemsPerPage = parseInt(req.headers["items-per-page"]) || 7;

    try {
      const skip = (page - 1) * itemsPerPage;
      const materials = await prisma.materials.findMany({
        skip: skip,
        take: itemsPerPage,
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          Category: {
            select: {
              Id: true,
              CategoryName: true,
            },
          },
          Supplier: {
            select: {
              Id: true,
              Name: true,
            },
          },
        },
      });
      const totalTemplates = await prisma.materials.count({
        where: {
          AND: [
            {
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
        message: "تم جلب المواد بنجاح!",
        data: {
          materials,
          count: totalTemplates,
        },
      });
    } catch (error) {
      console.log("THE ERROR", error);
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getMaterialById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const material = await prisma.materials.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          Category: true,
          Supplier: true,
          Audit: {
            include: {
              CreatedBy: {
                select: {
                  Firstname: true,
                  Lastname: true,
                  Username: true,
                  Email: true,
                  PhoneNumber: true,
                },
              },
              UpdatedBy: {
                select: {
                  Firstname: true,
                  Lastname: true,
                  Username: true,
                  Email: true,
                  PhoneNumber: true,
                },
              },
            },
          },
        },
      });
      if (!material) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "المادة غير موجودة!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم إنشاء المادة بنجاح!",
        data: material,
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
  deleteMaterial: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.materials.update({
        where: {
          Id: +id,
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
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم حذف المادة بنجاح!",
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
  updateMaterial: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const {
      name,
      type,
      color,
      quantity,
      UnitOfMeasure,
      category,
      supplier,
      description,
    } = req.body;
    const userId = req.userId;
    try {
      await prisma.materials.update({
        where: {
          Id: +id,
        },
        data: {
          Name: name,
          Category: { connect: { Id: category.id } },
          Supplier: { connect: { Id: supplier.id } },
          Color: color,
          Description: description,
          Type: type,
          UnitOfMeasure: UnitOfMeasure,
          Quantity: quantity,
          Audit: {
            create: {
              CreatedById: userId,
              UpdatedById: userId,
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم تحديث المادة بنجاح!",
        data: {},
      });
    } catch (error) {
      console.log(error);
      // Server error or unsolved error
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  getMaterialNames: async (req, res, next) => {
    try {
      const materialNames = await prisma.materials
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          select: {
            Id: true,
            Name: true,
          },
        })
        .then((materials) =>
          materials.map((material) => ({
            id: material.Id,
            name: material.Name,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء المواد بنجاح!",
        data: materialNames,
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
  searchMaterial: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.materials.findMany({
        where: {
          Name: {
            contains: searchTerm,
            mode: "insensitive",
          },
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          Category: {
            select: {
              Id: true,
              CategoryName: true,
            },
          },
          Supplier: {
            select: {
              Id: true,
              Name: true,
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

export default MaterialController;
