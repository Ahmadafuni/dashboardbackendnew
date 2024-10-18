import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import OrderController from "../../Controllers/Order/Order.controller.js";
import { uploadOrder } from "../../Middleware/Upload.middleware.js";
const router = express.Router();

router.post(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  uploadOrder.single("orders"),
  OrderController.createOrder
);
router.get(
  "/all",
  verifyUser(["ENGINEERING", "FACTORYMANAGER", "MotherCompany"]),
  OrderController.getOrders
);
router.get(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER", "MotherCompany"]),
  OrderController.getOrderNames
);
router.get(
  "/ordersForDash",
  verifyUser(["ENGINEERING", "FACTORYMANAGER", "MotherCompany"]),
  OrderController.getOrdersForDash
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER", "MotherCompany"]),
  OrderController.getOrderById
);
router.delete(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  OrderController.deleteOrder
);
router.put(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  uploadOrder.single("orders"),
  OrderController.updateOrder
);
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING", "FACTORYMANAGER", "MotherCompany"]),
  OrderController.searchOrder
);
router.get(
  "/start/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  OrderController.startOrder
);
router.put(
  "/hold/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  OrderController.holdOrder
);
router.get(
  "/restart/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  OrderController.restartOrder
);
export { router as OrderRoute };
