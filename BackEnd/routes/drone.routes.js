import express from "express";
import isAuth from "../middlewares/isAuth.js";
import {
    getShopDrones,
    updateDroneStatus,
    assignDroneToOrder,
    releaseDrone
} from "../controllers/drone.controller.js";

const droneRouter = express.Router();

// Get all drones for a shop
droneRouter.get("/getShopDrones/:shopId", isAuth, getShopDrones);

// Update drone status (Available <-> Maintenance)
droneRouter.put("/updateStatus/:droneId", isAuth, updateDroneStatus);

// Assign drone to order
droneRouter.put("/assignToOrder", isAuth, assignDroneToOrder);

// Release drone manually (for emergency cases)
droneRouter.put("/releaseDrone/:droneId", isAuth, releaseDrone);

export default droneRouter;
