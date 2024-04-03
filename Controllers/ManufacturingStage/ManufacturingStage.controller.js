import prisma from "../../client.js";

const ManufacturingStageController = {
  createStage: async (req, res, next) => {
    const { stageName, department, duration, template, workDescription } =
      req.body;
    const userId = req.userId;
    try {
      const stagesCount = await prisma.manufacturingStages.count({
        where: {
          TemplateId: +template,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      await prisma.manufacturingStages.create({
        data: {
          Duration: +duration,
          StageName: stageName,
          StageNumber: stagesCount + 1,
          Department: { connect: { Id: +department } },
          Template: { connect: { Id: +template } },
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
  createMultiStage: async (req, res, next) => {
    const { stages } = req.body;
    const userId = req.userId;
    try {
      for (const s of stages) {
        await prisma.manufacturingStages.create({
          data: {
            Duration: parseInt(s.duration),
            StageName: s.stageName,
            StageNumber: s.stageNumber,
            Department: { connect: { Id: +s.department } },
            Template: { connect: { Id: +s.template } },
            WorkDescription: s.workDescription,
            Audit: {
              create: {
                CreatedById: userId,
                UpdatedById: userId,
              },
            },
          },
        });
      }
      // Return response
      return res.status(201).send({
        status: 201,
        message: "New manufacturing stages created successfully!",
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
    const templateId = req.params.id;
    try {
      const stages = await prisma.manufacturingStages.findMany({
        where: {
          TemplateId: +templateId,
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          StageName: true,
          StageNumber: true,
          Duration: true,
          WorkDescription: true,
          Department: {
            select: {
              Name: true,
            },
          },
        },
        orderBy: {
          StageNumber: "asc",
        },
      });

      // Return response
      return res.status(200).send({
        status: 200,
        message: "Manufacturing stages fetched successfully!",
        data: stages,
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
        data: {
          stageName: stage.StageName,
          department: stage.DepartmentId.toString(),
          duration: stage.Duration.toString(),
          workDescription: stage.WorkDescription,
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
  deleteStage: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      const current = await prisma.manufacturingStages.findUnique({
        where: {
          Id: id,
        },
      });

      const otherStages = await prisma.manufacturingStages.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
          TemplateId: current.TemplateId,
          StageNumber: { not: current.StageNumber },
        },
        orderBy: {
          StageNumber: "asc",
        },
      });
      for (const stage of otherStages) {
        if (stage.StageNumber > current.StageNumber) {
          await prisma.manufacturingStages.update({
            where: {
              Id: stage.Id,
            },
            data: {
              StageNumber: stage.StageNumber - 1,
              Audit: {
                update: {
                  UpdatedById: userId,
                },
              },
            },
          });
        }
      }
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
      console.log(error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
  updateStage: async (req, res, next) => {
    const { duration, stageName, department, workDescription } = req.body;
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
          Department: { connect: { Id: +department } },
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
  toggleUp: async (req, res, next) => {
    const stageId = req.params.id;
    try {
      const current = await prisma.manufacturingStages.findUnique({
        where: {
          Id: +stageId,
        },
      });
      const currentTop = await prisma.manufacturingStages.findFirst({
        where: {
          TemplateId: current.TemplateId,
          StageNumber: current.StageNumber - 1,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      await prisma.manufacturingStages.update({
        where: {
          Id: current.Id,
        },
        data: {
          StageNumber: currentTop.StageNumber,
        },
      });
      await prisma.manufacturingStages.update({
        where: {
          Id: currentTop.Id,
        },
        data: {
          StageNumber: current.StageNumber,
        },
      });

      return res.status(200).send({
        status: 200,
        message: "Toggle successfull!",
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
  toggleDown: async (req, res, next) => {
    const stageId = req.params.id;
    try {
      const current = await prisma.manufacturingStages.findUnique({
        where: {
          Id: +stageId,
        },
      });
      const currentDown = await prisma.manufacturingStages.findFirst({
        where: {
          TemplateId: current.TemplateId,
          StageNumber: current.StageNumber + 1,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      await prisma.manufacturingStages.update({
        where: {
          Id: current.Id,
        },
        data: {
          StageNumber: currentDown.StageNumber,
        },
      });
      await prisma.manufacturingStages.update({
        where: {
          Id: currentDown.Id,
        },
        data: {
          StageNumber: current.StageNumber,
        },
      });

      return res.status(200).send({
        status: 200,
        message: "Toggle successfull!",
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

export default ManufacturingStageController;
