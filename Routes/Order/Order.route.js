import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import OrderController from "../../Controllers/Order/Order.controller.js";
import { uploadOrder } from "../../Middleware/Upload.middleware.js";
const router = express.Router();

router.post(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  uploadOrder.single("orders"),
  OrderController.createOrder
);
router.get(
  "/all",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  OrderController.getOrders
);
router.get(
  "/",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  OrderController.getOrderNames
);
router.get(
  "/ordersForDash",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  OrderController.getOrdersForDash
);
router.get(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  OrderController.getOrderById
);
router.delete(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  OrderController.deleteOrder
);
router.put(
  "/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  uploadOrder.single("orders"),
  OrderController.updateOrder
);
router.get(
  "/search/:searchTerm",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  OrderController.searchOrder
);
router.get(
  "/start/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  OrderController.startOrder
);
router.get(
  "/hold/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  OrderController.holdOrder
);
export { router as OrderRoute };
