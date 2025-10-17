import mongoose from "mongoose";
import Order from "../models/order.model.js";
import dotenv from "dotenv";

dotenv.config();

const updateOrderSchema = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Add assignedDroneId and droneAssignedAt fields to existing orders
        const result = await Order.updateMany(
            {
                assignedDroneId: { $exists: false }
            },
            {
                $set: {
                    assignedDroneId: null,
                    droneAssignedAt: null
                }
            }
        );

        console.log(`Updated ${result.modifiedCount} orders with drone fields`);

        // Verify the update
        const ordersWithDroneFields = await Order.countDocuments({
            assignedDroneId: { $exists: true }
        });

        console.log(`Total orders with drone fields: ${ordersWithDroneFields}`);

        process.exit(0);
    } catch (error) {
        console.error("Error updating order schema:", error);
        process.exit(1);
    }
};

updateOrderSchema();
