import prisma from "../../client.js";

const CollectionController = {
  createCollection: async (req, res, next) => {
    const { name, description } = req.body;
    const userId = req.userId;
    try {
      await prisma.collections.create({
        data: {
          CollectionName: name,
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
        message: "Collection created successfully!",
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
  getCollections: async (req, res, next) => {
    const { isArchived } = req.query;
    const isArchivedTrue = isArchived == "true";
    try {
      const collections = await prisma.collections.findMany({
        where: {
          IsArchived: isArchivedTrue,
          Audit: {
            IsDeleted: false,
          },
        },
        select: {
          Id: true,
          CollectionName: true,
          Description: true,
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "Collections fetched successfully!",
        data: collections,
        isArchivedTrue,
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
  getCollectionById: async (req, res, next) => {
    const id = req.params.id;
    try {
      const collection = await prisma.collections.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });

      if (!collection) {
        return res.status(404).send({
          status: 404,
          message: "Collection not found!",
          data: {},
        });
      }

      // Return response
      return res.status(200).send({
        status: 200,
        message: "Collection fetched successfully!",
        data: {
          name: collection.CollectionName,
          description: collection.Description,
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
  deleteCollection: async (req, res, next) => {
    const id = req.params.id;
    const userId = req.userId;
    try {
      await prisma.collections.update({
        where: {
          Id: +id,
        },
        data: {
          Audit: {
            update: {
              IsDeleted: true,
              UpdatedById: +userId,
            },
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "Collection deleted successfully!",
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
  updateCollection: async (req, res, next) => {
    const { name, description } = req.body;
    const userId = req.userId;
    const id = req.params.id;
    try {
      await prisma.collections.update({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          CollectionName: name,
          Description: description,
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
        message: "Collection updated successfully!",
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
  getCollectionNames: async (req, res, next) => {
    try {
      const collections = await prisma.collections
        .findMany({
          where: {
            Audit: {
              IsDeleted: false,
            },
          },
        })
        .then((collections) =>
          collections.map((collection) => ({
            value: collection.Id.toString(),
            label: collection.CollectionName,
          }))
        );
      // Return response
      return res.status(200).send({
        status: 200,
        message: "Fetched collection names!",
        data: collections,
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
  getArchivedCollections: async (req, res, next) => {
    try {
      const collections = await prisma.collections.findMany({
        where: {
          IsArchived: true,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      return res.status(200).send({
        status: 200,
        message: "تم جلب الكولكشنز بنجاح!",
        data: collections,
      });
    } catch (error) {
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },

  toggleArchivedCollectionById: async (req, res, next) => {
    const { toggle, id } = req.query;
    const isToggleTrue = toggle === "true";
    try {
      console.log(toggle, id);
      const collection = await prisma.collections.update({
        where: {
          Id: parseInt(id),
          Audit: {
            IsDeleted: false,
          },
        },
        data: {
          IsArchived: isToggleTrue,
        },
      });

      return res.status(200).send({
        status: 200,
        message: "تم تحديث الكولكشن بنجاح!",
        data: collection,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        status: 500,
        message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
        data: {},
      });
    }
  },
};

export default CollectionController;
