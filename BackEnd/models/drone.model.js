import mongoose from "mongoose";

const droneSchema = new mongoose.Schema({
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    name: {
        type: String,
        required: true,
        enum: ["Drone-1", "Drone-2", "Drone-3", "Drone-4", "Drone-5"]
    },
    status: {
        type: String,
        enum: ["Under Maintenance", "Busy", "Available"],
        default: "Available"
    },
    assignedOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        default: null
    },
    lastAssignedAt: {
        type: Date,
        default: null
    },
    maintenanceReason: {
        type: String,
        default: null
    }
}, { timestamps: true });

// Index để tối ưu query
droneSchema.index({ shop: 1, name: 1 }, { unique: true });
droneSchema.index({ shop: 1, status: 1 });

const Drone = mongoose.model("Drone", droneSchema);
export default Drone;
