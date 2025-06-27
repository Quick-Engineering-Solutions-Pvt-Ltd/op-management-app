import express from "express";
import {
  orderCreate,
  getOrderDetailsById,
  getAllOrders,
  searchOrders,
  updateOrderDetailsById,
} from "../controllers/order.create.js";
import { TryCatch } from "../middlewares/error.js";
import {authenticateUser, requirePermission, restrictTo,restrictToVerifiedUser} from "../middlewares/check.permission.middleware.js"




const router = express.Router();

router.route("/order-create-api").post(requirePermission("orders", "create"),TryCatch(orderCreate));
router.route("/get-order-details/:id").get(authenticateUser,TryCatch(getOrderDetailsById));
router.route("/get-all-orders").get(authenticateUser,restrictTo(["admin", "user"]),TryCatch(getAllOrders));
router.route("/search-order").get(authenticateUser,TryCatch(searchOrders));
router.route("/upadate-order/:id").get(authenticateUser,restrictToVerifiedUser,TryCatch(updateOrderDetailsById));

export default router;
