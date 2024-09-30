import prisma from "../../client.js";

const SizeController = {
  createSize: async (req, res, next) => {
    const { sizeName, description } = req.body;
    const userId = req.userId;
    try {
      await prisma.sizes.create({
        data: {
          SizeName: sizeName,
          Description: description,
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
        message: "تم إنشاء الحجم بنجاح!",
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
  getSizes: async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const totalRecords = await prisma.sizes.count({});

    const totalPages = Math.ceil(totalRecords / size);
    
    try {
      const sizes = await prisma.sizes.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        skip: (page - 1) * size,
        take: size ,
        select: {
          Id: true,
          SizeName: true,
          Description: true,
        },
      });

      // Return response
      return res.status(200).send({
        status: 200,
        totalPages,
        message: "تم جلب الأحجام بنجاح!",
        data: sizes,
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
  getSizeById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const size = await prisma.sizes.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      if (!size) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "الحجم غير موجود!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب الأحجام بنجاح!",
        data: {
          sizeName: size.SizeName,
          description: size.Description,
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
  deleteSize: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.sizes.update({
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
        message: "تم حذف الحجم بنجاح!",
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
  updateSize: async (req, res, next) => {
    const { sizeName, description } = req.body;
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.sizes.update({
        where: {
          Id: +id,
        },
        data: {
          SizeName: sizeName,
          Description: description,
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
        message: "تم تحديث الحجم بنجاح!",
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
  getSizeNames: async (req, res, next) => {
    try {
      const sizeNames = await prisma.sizes.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          SizeName: true,
        },
      });
      // Transform data to required format
      const formattedSizeNames = sizeNames.map((size) => ({
        value: size.Id.toString(),
        label: size.SizeName,
      }));
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء الأحجام بنجاح!",
        data: formattedSizeNames,
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
  searchSize: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.sizes.findMany({
        where: {
          SizeName: {
            contains: searchTerm,
            mode: "insensitive",
          },
          Audit: {
            IsDeleted: false,
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
  getSizesByTemplate: async (req, res, next) => {
    const id = req.params.id;
    try {
      const sizeNames = await prisma.sizes
        .findMany({
          where: {
            Measurements: {
              some: {
                TemplateSize: {
                  TemplateId: +id,
                  TemplateSizeType: "CUTTING",
                },
              },
            },
            Audit: {
              IsDeleted: false,
            },
          },
        })
        .then((sizes) =>
          sizes.map((size) => ({
            value: size.Id.toString(),
            label: size.SizeName,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "Size list fatched!",
        data: sizeNames,
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
  getSizesByModel: async (req, res, next) => {
    const id = req.params.id;
    try {
      const model = await prisma.models.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      console.log("model" , model);

      const sizeNames = await prisma.sizes
        .findMany(
          {
          where: {
            Measurements: {
              some: {
                TemplateSize: {
                  TemplateId: model.TemplateId,
                  TemplateSizeType: "CUTTING",
                },
              },
            },
            Audit: {
              IsDeleted: false,
            },
          },
        }
      )
        .then((sizes) =>
          sizes.map((size) => ({
            value: size.Id.toString(),
            label: size.SizeName,
          }))
        );

        console.log("size" , sizeNames);


      // Return response
      return res.status(200).send({
        status: 200,
        message: "Size list fatched!",
        data: sizeNames,
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
};

export default SizeController;
