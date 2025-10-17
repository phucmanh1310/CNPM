import mongoose from "mongoose";
import Order from "../models/order.model.js";
import dotenv from "dotenv";

dotenv.config();

const fixStuckOrders = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to MongoDB");

        // Find all orders with "handed over to drone" status
        const stuckOrders = await Order.find({
            "shopOrder.status": "handed over to drone"
        });

        console.log(`Found ${stuckOrders.length} stuck orders`);

        let fixedCount = 0;

        for (const order of stuckOrders) {
            console.log(`Processing order: ${order._id}`);
            for (const shopOrder of order.shopOrder) {
                if (shopOrder.status === "handed over to drone") {
                    shopOrder.status = "delivering";
                    fixedCount++;
                    console.log(`  Fixed shop order: ${shopOrder._id}`);
                }
            }
            await order.save();
        }

        console.log(`✅ Fixed ${fixedCount} stuck orders`);

        // Verify the fix
        const remainingStuckOrders = await Order.find({
            "shopOrder.status": "handed over to drone"
        });

        console.log(`Remaining stuck orders: ${remainingStuckOrders.length}`);

        process.exit(0);
    } catch (error) {
        console.error("Error fixing stuck orders:", error);
        process.exit(1);
    }
};

fixStuckOrders();
