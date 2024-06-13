// import prisma from "../../client.js";

// const InternalOrderController = {
//   createInternalOrder: async (req, res, next) => {
//     const userId = req.userId;

//     const {
//       quantity,
//       expectedDelivery,
//       material,
//       notes,
//       specifics,
//       priority,
//       status,
//     } = req.body;

//     try {
//       const user = await prisma.users.findUnique({
//         where: {
//           Id: userId,
//         },
//         include: {
//           Department: true,
//         },
//       });

//       await prisma.internalOrders.create({
//         data: {
//           Quantity: quantity,
//           Department: { connect: { Id: user.Department.Id } },
//           ExpectedDeliveryDate: expectedDelivery,
//           Material: { connect: { Id: material.id } },
//           ApprovedBy: { connect: { Id: userId } },
//           OrderDate: new Date(),
//           Notes: notes,
//           Specifics: specifics,
//           Priority: priority,
//           Status: status,
//           Audit: {
//             create: {
//               CreatedById: userId,
//               UpdatedById: userId,
//             },
//           },
//         },
//       });
//       // Return response
//       return res.status(201).send({
//         status: 201,
//         message: "تم إنشاء الطلب بنجاح!",
//         data: {},
//       });
//     } catch (error) {
//       // Server error or unsolved error
//       console.log(error);
//       return res.status(500).send({
//         status: 500,
//         message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
//         data: { error },
//       });
//     }
//   },
//   getAllInternalOrders: async (req, res, next) => {
//     const page = parseInt(req.headers["page"]) || 1;
//     const itemsPerPage = parseInt(req.headers["items-per-page"]) || 7;

//     try {
//       const skip = (page - 1) * itemsPerPage;
//       const internalOrders = await prisma.internalOrders.findMany({
//         skip: skip,
//         take: itemsPerPage,
//         where: {
//           Audit: {
//             IsDeleted: false,
//           },
//         },
//         include: {
//           Department: {
//             select: {
//               Id: true,
//               Name: true,
//             },
//           },
//           Material: {
//             select: {
//               Id: true,
//               Name: true,
//             },
//           },
//         },
//       });

//       const totalTemplates = await prisma.internalOrders.count({
//         where: {
//           AND: [
//             {
//               Audit: {
//                 IsDeleted: false,
//               },
//             },
//           ],
//         },
//       });

//       // Return response
//       return res.status(200).send({
//         status: 200,
//         message: "تم جلب الطلبات بنجاح!",
//         data: {
//           internalOrders,
//           count: totalTemplates,
//         },
//       });
//     } catch (error) {
//       // Server error or unsolved error
//       return res.status(500).send({
//         status: 500,
//         message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
//         data: {},
//       });
//     }
//   },
//   getInternalOrderById: async (req, res, next) => {
//     const id = parseInt(req.params.id);
//     try {
//       const order = await prisma.internalOrders.findUnique({
//         where: {
//           Id: +id,
//           Audit: {
//             IsDeleted: false,
//           },
//         },
//         include: {
//           Audit: {
//             include: {
//               CreatedBy: {
//                 select: {
//                   Firstname: true,
//                   Lastname: true,
//                   Username: true,
//                   Email: true,
//                   PhoneNumber: true,
//                 },
//               },
//               UpdatedBy: {
//                 select: {
//                   Firstname: true,
//                   Lastname: true,
//                   Username: true,
//                   Email: true,
//                   PhoneNumber: true,
//                 },
//               },
//             },
//           },
//         },
//       });
//       if (!order) {
//         // Return response
//         return res.status(404).send({
//           status: 404,
//           message: "الطلب غير موجود!",
//           data: {},
//         });
//       }
//       // Return response
//       return res.status(200).send({
//         status: 200,
//         message: "تم جلب الطلبات بنجاح!",
//         data: order,
//       });
//     } catch (error) {
//       // Server error or unsolved error
//       return res.status(500).send({
//         status: 500,
//         message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
//         data: {},
//       });
//     }
//   },
//   deleteInternalOrder: async (req, res, next) => {
//     const id = parseInt(req.params.id);
//     const userId = req.userId;
//     try {
//       await prisma.internalOrders.update({
//         where: {
//           Id: +id,
//         },
//         data: {
//           Audit: {
//             update: {
//               IsDeleted: true,
//               UpdatedById: userId,
//             },
//           },
//         },
//       });
//       // Return response
//       return res.status(200).send({
//         status: 200,
//         message: "تم حذف الطلب بنجاح!",
//         data: {},
//       });
//     } catch (error) {
//       // Server error or unsolved error
//       return res.status(500).send({
//         status: 500,
//         message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
//         data: {},
//       });
//     }
//   },
//   updateInternalOrder: async (req, res, next) => {
//     const {
//       quantity,
//       expectedDelivery,
//       material,
//       notes,
//       specifics,
//       priority,
//       status,
//     } = req.body;

//     const id = parseInt(req.params.id);
//     const userId = req.userId;

//     try {
//       await prisma.internalOrders.update({
//         where: {
//           Id: +id,
//         },
//         data: {
//           Quantity: quantity,
//           ExpectedDeliveryDate: expectedDelivery,
//           Material: { connect: { Id: material.id } },
//           Notes: notes,
//           Specifics: specifics,
//           Priority: priority,
//           Status: status,
//           Audit: {
//             update: {
//               data: {
//                 UpdatedById: userId,
//               },
//             },
//           },
//         },
//       });
//       // Return response
//       return res.status(200).send({
//         status: 200,
//         message: "تم تحديث الطلب بنجاح!",
//         data: {},
//       });
//     } catch (error) {
//       // Server error or unsolved error
//       return res.status(500).send({
//         status: 500,
//         message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
//         data: {},
//       });
//     }
//   },
//   getInternalOrderNames: async (req, res, next) => {
//     try {
//       const internalOrderDetails = await prisma.internalOrders
//         .findMany({
//           where: {
//             Audit: {
//               IsDeleted: false,
//             },
//           },
//           include: {
//             Material: true,
//             Department: true,
//             ApprovedBy: true,
//           },
//         })
//         .then((orders) =>
//           orders.map((order) => ({
//             id: order.Id,
//             name: `${order.Material.Name} in ${order.Department.Name} approved by ${order.ApprovedBy.Firstname} ${order.ApprovedBy.Lastname}`,
//           }))
//         );

//       // Return response
//       return res.status(200).send({
//         status: 200,
//         message: "تم جلب تفاصيل الطلب الداخلي بنجاح!",
//         data: internalOrderDetails,
//       });
//     } catch (error) {
//       // Server error or unsolved error
//       return res.status(500).send({
//         status: 500,
//         message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
//         data: {},
//       });
//     }
//   },
//   searchInternalOrders: async (req, res, next) => {
//     const searchTerm = req.params.searchTerm;
//     try {
//       if (!searchTerm) {
//         return res.status(400).send({
//           status: 400,
//           message: "لم يتم توفير مصطلح بحث.",
//           data: {},
//         });
//       }

//       const datas = await prisma.internalOrders.findMany({
//         where: {
//           OR: [
//             {
//               Material: {
//                 Name: {
//                   contains: searchTerm,
//                   mode: "insensitive",
//                 },
//               },
//             },
//             {
//               Department: {
//                 Name: {
//                   contains: searchTerm,
//                   mode: "insensitive",
//                 },
//               },
//             },
//           ],
//           Audit: {
//             IsDeleted: false,
//           },
//         },
//       });

//       return res.status(200).send({
//         status: 200,
//         message: "تم البحث بنجاح!",
//         data: datas,
//       });
//     } catch (error) {
//       return res.status(500).send({
//         status: 500,
//         message: "خطأ في الخادم الداخلي. الرجاء المحاولة مرة أخرى لاحقًا!",
//         data: {},
//       });
//     }
//   },
// };
// export default InternalOrderController;
