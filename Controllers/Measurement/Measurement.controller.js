import prisma from "../../client.js";

const MeasurementController = {
  createMeasurement: async (req, res, next) => {
    const {
      MeasurementName,
      MeasurementValue,
      MeasurementUnit,
      SizeId,
      type,
      templateId,
    } = req.body;
    const userId = req.params.userId;
    try {
      const getTemplateSize = await prisma.templateSizes.findFirst({
        where: {
          Audit: {
            IsDeleted: false,
          },
          TemplateId: +templateId,
          TemplateSizeType: type,
        },
      });
      await prisma.measurements.create({
        data: {
          MeasurementName: MeasurementName,
          MeasurementValue: MeasurementValue,
          MeasurementUnit: MeasurementUnit,
          Size: { connect: { Id: +SizeId } },
          TemplateSize: { connect: { Id: getTemplateSize.Id } },
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
        message: "Measurement created successfully",
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
  getAllMeasurements: async (req, res, next) => {
    const template = req.params.id;
    const type = req.params.type;
    try {
      const measurements = await prisma.sizes.findMany({
        where: {
          Measurements: {
            some: {
              TemplateSize: {
                TemplateId: +template,
                TemplateSizeType: type,
              },
            },
          },
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          SizeName: true,
          Measurements: {
            where: {
              TemplateSize: {
                TemplateSizeType: type,
                TemplateId: +template,
              },
              Audit: {
                IsDeleted: false,
              },
            },
            select: {
              Id: true,
              MeasurementName: true,
              MeasurementValue: true,
              MeasurementUnit: true,
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "Measurements fatched successfully!",
        data: measurements,
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
  getMeasurementById: async (req, res, next) => {
    const id = req.params.id;
    try {
      const measurement = await prisma.measurements.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (!measurement) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "Measurement not found",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أحجام القوالب بنجاح!",
        data: {
          MeasurementName: measurement.MeasurementName,
          MeasurementValue: measurement.MeasurementValue,
          MeasurementUnit: measurement.MeasurementUnit,
          SizeId: measurement.SizeId.toString(),
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
  deleteMeasurement: async (req, res, next) => {
    const userId = req.params.userId;
    const id = req.params.id;
    try {
      await prisma.measurements.update({
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
        message: "Measurement deleted successfully!",
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
  updateMeasurement: async (req, res, next) => {
    const { MeasurementName, MeasurementValue, MeasurementUnit, SizeId } =
      req.body;
    const userId = req.params.userId;
    const id = req.params.id;
    try {
      await prisma.measurements.update({
        where: {
          Id: +id,
        },
        data: {
          MeasurementName: MeasurementName,
          MeasurementValue: MeasurementValue,
          MeasurementUnit: MeasurementUnit,
          Size: { connect: { Id: +SizeId } },
          Audit: {
            update: {
              UpdatedById: userId,
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "Measurement updated successfully!",
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
};

export default MeasurementController;
