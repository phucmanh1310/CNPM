import Drone from '../models/drone.model.js';
import Order from '../models/order.model.js';

// Initialize drones for a shop (5 drones per shop)
export const initializeShopDrones = async (shopId) => {
    try {
        // Check if drones already exist for this shop
        const existingDrones = await Drone.find({ shop: shopId });
        if (existingDrones.length > 0) {
            return { message: "Drones already initialized for this shop", drones: existingDrones };
        }

        // Create 5 drones for the shop
        const droneNames = ["Drone-1", "Drone-2", "Drone-3", "Drone-4", "Drone-5"];
        const drones = [];

        for (const name of droneNames) {
            const drone = await Drone.create({
                shop: shopId,
                name: name,
                status: "Available"
            });
            drones.push(drone);
        }

        return { message: "Drones initialized successfully", drones };
    } catch (error) {
        throw new Error(`Initialize drones error: ${error.message}`);
    }
};

// Get all drones for a shop
export const getShopDrones = async (req, res) => {
    try {
        const { shopId } = req.params;

        // Verify that the shop belongs to the current user
        const Shop = (await import('../models/shop.model.js')).default;
        const shop = await Shop.findOne({ _id: shopId, owner: req.userId });

        if (!shop) {
            return res.status(404).json({ message: "Shop not found or not authorized" });
        }

        const drones = await Drone.find({ shop: shopId }).sort({ name: 1 });

        // If no drones exist, initialize them
        if (drones.length === 0) {
            const result = await initializeShopDrones(shopId);
            return res.status(200).json(result);
        }

        return res.status(200).json({ drones });
    } catch (error) {
        return res.status(500).json({ message: `Get shop drones error: ${error.message}` });
    }
};

// Update drone status (only Available -> Maintenance)
export const updateDroneStatus = async (req, res) => {
    try {
        const { droneId } = req.params;
        const { status, maintenanceReason } = req.body;

        const drone = await Drone.findById(droneId).populate('shop', 'owner');

        if (!drone) {
            return res.status(404).json({ message: "Drone not found" });
        }

        // Verify that the drone belongs to the current user's shop
        if (drone.shop.owner.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized to update this drone" });
        }

        // Only allow changing from Available to Maintenance
        if (drone.status !== "Available" && status === "Maintenance") {
            return res.status(400).json({ message: "Can only change Available drones to Maintenance" });
        }

        // Only allow changing from Maintenance to Available
        if (drone.status !== "Maintenance" && status === "Available") {
            return res.status(400).json({ message: "Can only change Maintenance drones to Available" });
        }

        // Cannot manually change Busy drones
        if (drone.status === "Busy") {
            return res.status(400).json({ message: "Cannot change status of busy drone. It will be automatically released after delivery." });
        }

        drone.status = status;
        if (status === "Maintenance") {
            drone.maintenanceReason = maintenanceReason || "Maintenance required";
        } else {
            drone.maintenanceReason = null;
        }

        await drone.save();

        return res.status(200).json({
            message: "Drone status updated successfully",
            drone
        });
    } catch (error) {
        return res.status(500).json({ message: `Update drone status error: ${error.message}` });
    }
};

// Assign drone to order
export const assignDroneToOrder = async (req, res) => {
    try {
        const { orderId, shopOrderId, droneId } = req.body;

        // Find the order and shop order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const shopOrder = order.shopOrder.id(shopOrderId);
        if (!shopOrder) {
            return res.status(404).json({ message: "Shop order not found" });
        }

        // Verify that the shop order belongs to the current user
        if (shopOrder.owner.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized to assign drone to this order" });
        }

        // Check if order is in prepared status
        if (shopOrder.status !== "prepared") {
            return res.status(400).json({ message: "Can only assign drone to prepared orders" });
        }

        // Find the drone
        const drone = await Drone.findById(droneId);
        if (!drone) {
            return res.status(404).json({ message: "Drone not found" });
        }

        // Verify that the drone belongs to the current user's shop
        if (drone.shop.toString() !== shopOrder.shop.toString()) {
            return res.status(400).json({ message: "Drone does not belong to this shop" });
        }

        // Check if drone is available
        if (drone.status !== "Available") {
            return res.status(400).json({ message: "Drone is not available for assignment" });
        }

        // Assign drone to order
        drone.status = "Busy";
        drone.assignedOrderId = orderId;
        drone.lastAssignedAt = new Date();

        // Update order
        shopOrder.status = "drone assigned";
        order.assignedDroneId = droneId;
        order.droneAssignedAt = new Date();

        await Promise.all([drone.save(), order.save()]);

        return res.status(200).json({
            message: "Drone assigned successfully",
            order: order,
            drone: drone
        });
    } catch (error) {
        return res.status(500).json({ message: `Assign drone error: ${error.message}` });
    }
};

// Release drone after delivery completion
export const releaseDrone = async (req, res) => {
    try {
        const { droneId } = req.params;

        const drone = await Drone.findById(droneId).populate('shop', 'owner');

        if (!drone) {
            return res.status(404).json({ message: "Drone not found" });
        }

        // Verify that the drone belongs to the current user's shop
        if (drone.shop.owner.toString() !== req.userId) {
            return res.status(403).json({ message: "Not authorized to release this drone" });
        }

        if (drone.status !== "Busy") {
            return res.status(400).json({ message: "Drone is not currently busy" });
        }

        // Release the drone
        drone.status = "Available";
        drone.assignedOrderId = null;
        drone.lastAssignedAt = null;

        await drone.save();

        return res.status(200).json({
            message: "Drone released successfully",
            drone
        });
    } catch (error) {
        return res.status(500).json({ message: `Release drone error: ${error.message}` });
    }
};

// Auto-release drone when order is delivered
export const autoReleaseDrone = async (orderId) => {
    try {
        const drone = await Drone.findOne({ assignedOrderId: orderId });

        if (drone && drone.status === "Busy") {
            drone.status = "Available";
            drone.assignedOrderId = null;
            drone.lastAssignedAt = null;
            await drone.save();

            console.log(`Drone ${drone.name} automatically released after delivery completion`);
        }
    } catch (error) {
        console.error(`Auto-release drone error: ${error.message}`);
    }
};
