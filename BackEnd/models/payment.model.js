import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    // For multi-order payments, store all order IDs
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }],
    sessionId: {
        type: String,
        default: null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ["cod", "momo"],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "success", "failed", "cancelled"],
        default: "pending"
    },
    // MoMo specific fields
    momoOrderId: {
        type: String,
        default: null
    },
    momoTransactionId: {
        type: String,
        default: null
    },
    momoPayUrl: {
        type: String,
        default: null
    },
    momoResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    // Timestamps
    paidAt: {
        type: Date,
        default: null
    },
    failedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
