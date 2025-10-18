import express from "express";
import {
    getAllUsers,
    toggleUserStatus,
    getAllShops,
    toggleShopStatus
} from "../controllers/admin.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        const User = (await import("../models/user.model.js")).default;
        const user = await User.findById(req.userId);

        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admin privileges required." });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: "Error verifying admin privileges", error: error.message });
    }
};

// Apply authentication and admin check to all routes
router.use(isAuth);
router.use(isAdmin);

// User management routes
router.get("/users", getAllUsers);
router.patch("/users/:userId/toggle", toggleUserStatus);

// Shop management routes
router.get("/shops", getAllShops);
router.patch("/shops/:shopId/toggle", toggleShopStatus);

export default router;
