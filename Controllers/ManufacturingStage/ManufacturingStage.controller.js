import prisma from "../../client.js";

const ManufacturingStageController = {
  createStage: async (req, res, next) => {
    const {
      duration,
      stageName,
      stageNumber,
      department,
      description,
      template,
      workDescription,
    } = req.body;
    const userId = req.userId;
    try {
      await prisma.manufacturingStages.create({
        data: {
          Duration: parseInt(duration),
          StageName: stageName,
          StageNumber: parseInt(stageNumber),
          Department: { connect: { Id: department.id } },
          Description: description,
          Template: { connect: { Id: template.id } },
          WorkDescription: workDescription,
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
        message: "New manufacturing stage created successfully!",
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
  getStages: async (req, res, next) => {
    const page = parseInt(req.headers["page"]) || 1;
    const itemsPerPage = parseInt(req.headers["items-per-page"]) || 7;

    try {
      const skip = (page - 1) * itemsPerPage;
      const stages = await prisma.manufacturingStages.findMany({
        skip: skip,
        take: itemsPerPage,
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          Department: true,
          Template: true,
        },
      });

      const totalTemplates = await prisma.templateSizes.count({
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
        message: "Manufacturing stages fetched successfully!",
        data: {
          stages,
          count: totalTemplates,
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
  getStageById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const stage = await prisma.manufacturingStages.findUnique({
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
      if (!stage) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "Manufacturing stage not found!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "Manufacturing stage fetched successfully!",
        data: stage,
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
  deleteStage: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.manufacturingStages.update({
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
        message: "Manufacturing stage deleted successfully!",
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
  updateStage: async (req, res, next) => {
    const {
      duration,
      stageName,
      stageNumber,
      department,
      description,
      template,
      workDescription,
    } = req.body;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.manufacturingStages.update({
        where: {
          Id: +id,
        },
        data: {
          Duration: parseInt(duration),
          StageName: stageName,
          StageNumber: parseInt(stageNumber),
          Department: { connect: { Id: department.id } },
          Description: description,
          Template: { connect: { Id: template.id } },
          WorkDescription: workDescription,
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
        message: "Manufacturing stage updated successfully!",
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
  getStageNames: async (req, res, next) => {
    try {
      const manufacturingStagesNames = await prisma.manufacturingStages
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
          include: {
            Department: true,
          },
        })
        .then((stages) =>
          stages.map((stage) => ({
            id: stage.Id,
            name: `${stage.StageName} at ${stage.Department.Name}`,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "Manufacturing stages names fetched successfully!",
        data: manufacturingStagesNames,
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
  searchMS: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.manufacturingStages.findMany({
        where: {
          StageName: {
            contains: searchTerm,
            mode: "insensitive",
          },
          Audit: {
            IsDeleted: false,
          },
        },
        include: {
          Template: true,
          Department: true,
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

export default ManufacturingStageController;
