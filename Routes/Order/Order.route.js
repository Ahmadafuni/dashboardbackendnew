import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import OrderController from "../../Controllers/Order/Order.controller.js";
const router = express.Router();

router.post(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  OrderController.createOrder
);
router.get(
  "/all",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  OrderController.getOrders
);
router.get(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  OrderController.getOrderNames
);
router.get(
  "/ordersForDash",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  OrderController.getOrdersForDash
);
router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  OrderController.getOrderById
);
router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  OrderController.deleteOrder
);
router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  OrderController.updateOrder
);
router.get(
  "/search/:searchTerm",
  verifyUser(["STOREMANAGER", "ENGINEERING"]),
  OrderController.searchOrder
);
export { router as OrderRoute };
