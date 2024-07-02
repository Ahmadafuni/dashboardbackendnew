import prisma from "../../client.js";

const SupplierController = {
  createSupplier: async (req, res, next) => {
    const { name, address, phone, description } = req.body;
    const userId = req.userId;
    try {
      await prisma.suppliers.create({
        data: {
          Name: name,
          PhoneNumber: phone,
          Address: address,
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
        message: "تم إنشاء المورد بنجاح!",
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
  getAllSuppliers: async (req, res, next) => {
    try {
      const suppliers = await prisma.suppliers.findMany({
        where: {
          Audit: {
            IsDeleted: false,
          },
        },
      });
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب الموردين بنجاح!",
        data: suppliers,
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
  getSupplierById: async (req, res, next) => {
    const id = parseInt(req.params.id);
    try {
      const supplier = await prisma.suppliers.findUnique({
        where: {
          Id: +id,
          Audit: {
            IsDeleted: false,
          },
        },
      });
      if (!supplier) {
        // Return response
        return res.status(404).send({
          status: 404,
          message: "المورد غير موجود!",
          data: {},
        });
      }
      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب الموردين بنجاح!",
        data: {
          name: supplier.Name,
          address: supplier.Address,
          phone: supplier.PhoneNumber,
          description: supplier.Description,
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
  deleteSupplier: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    try {
      await prisma.suppliers.update({
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
        message: "تم حذف المورد بنجاح!",
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
  updateSupplier: async (req, res, next) => {
    const id = parseInt(req.params.id);
    const userId = req.userId;
    const { name, address, phone, description } = req.body;
    try {
      await prisma.suppliers.update({
        where: {
          Id: +id,
        },
        data: {
          Name: name,
          PhoneNumber: phone,
          Address: address,
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
        message: "تم تحديث المورد بنجاح!",
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
  getSupplierNames: async (req, res, next) => {
    try {
      const supplierNames = await prisma.suppliers
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
        .then((suppliers) =>
          suppliers.map((supplier) => ({
            value: supplier.Id.toString(),
            label: supplier.Name,
          }))
        );

      // Return response
      return res.status(200).send({
        status: 200,
        message: "تم جلب أسماء الموردين بنجاح!",
        data: supplierNames,
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
  searchSupplier: async (req, res, next) => {
    const searchTerm = req.params.searchTerm;
    try {
      if (!searchTerm) {
        return res.status(400).send({
          status: 400,
          message: "لم يتم توفير مصطلح بحث.",
          data: {},
        });
      }
      const datas = await prisma.suppliers.findMany({
        where: {
          Name: {
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
};

export default SupplierController;
