// import express from "express";
// import { verifyUser } from "../../Middleware/Auth.middleware.js";
// import InternalOrderController from "../../Controllers/InternalOrder/InternalOrder.controller.js";

// const router = express.Router();

// router.post(
//   "/",
//   verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
//   InternalOrderController.createInternalOrder
// );
// router.get(
//   "/all",
//   verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
//   InternalOrderController.getAllInternalOrders
// );
// router.get(
//   "/",
//   verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
//   InternalOrderController.getInternalOrderNames
// );
// router.get(
//   "/:id",
//   verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
//   InternalOrderController.getInternalOrderById
// );
// router.delete(
//   "/:id",
//   verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
//   InternalOrderController.deleteInternalOrder
// );
// router.put(
//   "/:id",
//   verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
//   InternalOrderController.updateInternalOrder
// );
// router.get(
//   "/search/:searchTerm",
//   verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
//   InternalOrderController.searchInternalOrders
// );

// router.get(
//   "/search/:searchTerm",
//   verifyUser(["WAREHOUSEMANAGER", "ENGINEERING"]),
//   InternalOrderController.searchInternalOrders
// );

// const InternalOrderRoute = router;
// export { InternalOrderRoute };
