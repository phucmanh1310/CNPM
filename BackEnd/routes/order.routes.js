import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { placeOrder } from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post("/placeOrder", isAuth, placeOrder);

export default orderRouter;
