import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { placeOrder, getUserOrders, getOwnerOrders, updateOrderStatus, cancelOrder, confirmDelivery, fixStuckOrders } from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post("/placeOrder", isAuth, placeOrder);
orderRouter.get("/getUserOrders", isAuth, getUserOrders);
orderRouter.get("/getOwnerOrders", isAuth, getOwnerOrders);
orderRouter.put("/updateOrderStatus", isAuth, updateOrderStatus);
orderRouter.put("/cancelOrder", isAuth, cancelOrder);
orderRouter.put("/confirmDelivery", isAuth, confirmDelivery);
orderRouter.put("/fixStuckOrders", isAuth, fixStuckOrders);

export default orderRouter;
