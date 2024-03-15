import prisma from "../../client.js";

const ComponentController = {
  createComponent: async (req, res, next) => {
    const { name, quantity, uom, description, materialId, templateId } =
      req.body;
    const userId = req.userId;
    try {
      await prisma.components.create({
        data: {
          ComponentName: name,
          Quantity: quantity,
          UnitOfMeasure: uom,
          Description: description,
          MaterialId: materialId,
          TemplateId: templateId,
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
        message: "New component created successfully!",
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
  getComponents: async (req, res, next) => {
    try {
      const components = await prisma.components.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          Material: true,
          Template: true,
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "Components fetched successfully!",
        data: components,
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
  getComponentById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const component = await prisma.components.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
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
      if (!component) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "Component not found!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "Component fetched successfully!",
        data: component,
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
  deleteComponent: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.components.update({
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
        message: "Component deleted successfully!",
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
  updateComponent: async (req, res, next) => {
    const { name, quantity, uom, description, materialId, templateId } =
      req.body;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.components.update({
        where: {
          Id: +id,
        },
        data: {
          ComponentName: name,
          Quantity: quantity,
          UnitOfMeasure: uom,
          Description: description,
          MaterialId: materialId,
          TemplateId: templateId,
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
        message: "Component updated successfully!",
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
  getComponentNames: async (req, res, next) => {
    try {
      const componentNames = await prisma.components
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
        })
        .then((components) =>
          components.map((component) => ({
            id: component.Id,
            name: component.ComponentName,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "Component names fetched successfully!",
        data: componentNames,
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
  searchComponents: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.components.findMany({
        where: {
          ComponentName: {
            contains: searchTerm,
            mode: "insensitive",
          },
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          Material: true,
          Template: true,
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

export default ComponentController;
