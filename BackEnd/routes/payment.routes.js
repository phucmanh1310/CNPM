import express from "express";
import { createMoMoPayment, handleMoMoCallback, getPaymentStatus, testCallback } from "../controllers/payment.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Create MoMo payment (protected route)
router.post("/momo/create", isAuth, createMoMoPayment);

// Handle MoMo callback (public route for MoMo server)
router.post("/momo/callback", handleMoMoCallback);

// Manual test callback (for testing purposes)
router.post("/momo/test-callback", testCallback);

// Get payment status (protected route)
router.get("/status/:paymentId", isAuth, getPaymentStatus);

export default router;
