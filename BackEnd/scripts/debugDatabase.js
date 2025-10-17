import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Drone from "../models/drone.model.js";
import dotenv from "dotenv";

dotenv.config();

const debugDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        // Check orders with drone assignments
        const ordersWithDrones = await Order.find({
            assignedDroneId: { $ne: null }
        }).populate('assignedDroneId', 'name status');

        console.log("\n=== Orders with Drone Assignments ===");
        ordersWithDrones.forEach(order => {
            console.log(`Order: ${order._id}`);
            console.log(`  Assigned Drone: ${order.assignedDroneId?.name || 'N/A'}`);
            console.log(`  Drone Status: ${order.assignedDroneId?.status || 'N/A'}`);
            console.log(`  Assigned At: ${order.droneAssignedAt || 'N/A'}`);
            console.log(`  Shop Orders Status: ${order.shopOrder.map(so => so.status).join(', ')}`);
            console.log('---');
        });

        // Check drones status
        const drones = await Drone.find({}).populate('shop', 'name');
        console.log("\n=== Drone Status ===");
        drones.forEach(drone => {
            console.log(`Drone: ${drone.name}`);
            console.log(`  Status: ${drone.status}`);
            console.log(`  Shop: ${drone.shop?.name || 'N/A'}`);
            console.log(`  Assigned Order: ${drone.assignedOrderId || 'None'}`);
            console.log(`  Last Assigned: ${drone.lastAssignedAt || 'Never'}`);
            console.log('---');
        });

        // Check orders without drone fields
        const ordersWithoutDroneFields = await Order.find({
            assignedDroneId: { $exists: false }
        });

        console.log(`\n=== Orders without drone fields: ${ordersWithoutDroneFields.length} ===`);
        if (ordersWithoutDroneFields.length > 0) {
            console.log("These orders need to be updated with drone fields");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error debugging database:", error);
        process.exit(1);
    }
};

debugDatabase();
