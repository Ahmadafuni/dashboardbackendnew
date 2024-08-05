import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import OrderController from "../../Controllers/Order/Order.controller.js";
import { uploadOrder } from "../../Middleware/Upload.middleware.js";
const router = express.Router();


router.get(
  "/getOrderStatistics/:type" ,
  OrderController.getStatistics

)

router.get(
  "/getOrderPercentage" ,
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  OrderController.getOrderPercentage

);


router.post(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  uploadOrder.single("orders"),
  OrderController.createOrder
);
router.get(
  "/all",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  OrderController.getOrders
);
router.get(
  "/",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  OrderController.getOrderNames
);
router.get(
  "/ordersForDash",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  OrderController.getOrdersForDash
);
router.get(
  "/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
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
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  OrderController.searchOrder
);
router.get(
  "/start/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  OrderController.startOrder
);
router.put(
  "/hold/:id",
  verifyUser(["STOREMANAGER", "ENGINEERING", "FACTORYMANAGER"]),
  OrderController.holdOrder
);
router.get(
  "/restart/:id",
  verifyUser(["ENGINEERING", "FACTORYMANAGER"]),
  OrderController.restartOrder
);
export { router as OrderRoute };
