import express from "express";
import { verifyUser } from "../../Middleware/Auth.middleware.js";
import OrderDetailsController from "../../Controllers/OrderDetails/OrderDetails.controller.js";

const router = express.Router();

// Route to create order details
router.post(
  "/",
  verifyUser(["ENGINEERING"]),
  OrderDetailsController.createOrderDetails
);

// Route to get order details
router.get(
  "/all",
  verifyUser(["ENGINEERING"]),
  OrderDetailsController.getOrderDetails
);

// Route to update order details
router.put(
  "/:id",
  verifyUser(["ENGINEERING"]),
  OrderDetailsController.updateOrderDetails
);

// Route to delete order details
router.delete(
  "/:id",
  verifyUser(["ENGINEERING"]),
  OrderDetailsController.deleteOrderDetails
);

router.get(
    "/search/:searchTerm",
    verifyUser(["ENGINEERING"]),
    OrderDetailsController.searchOrderDetails
  );
// Route to get order detail names
router.get(
  "/",
  verifyUser(["ENGINEERING"]),
  OrderDetailsController.getOrderDetailNames
);
// Search Order Details
router.get(
  "/search/:searchTerm",
  verifyUser(["ENGINEERING"]),
  OrderDetailsController.searchOrderDetails
);
export { router as OrderDetailRoute };
