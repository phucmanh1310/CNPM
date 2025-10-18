import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/user.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from BackEnd directory
dotenv.config({ path: path.join(__dirname, "../.env") });

const createAdminUser = async () => {
    try {
        // Connect to database
        const mongoURI = process.env.MONGODB_URL || process.env.MONGO_URI || "mongodb://localhost:27017/ktpm";
        await mongoose.connect(mongoURI);
        console.log("Connected to database");

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: "admin" });
        if (existingAdmin) {
            console.log("Admin user already exists:", existingAdmin.email);
            return;
        }

        // Create admin user
        const adminEmail = "admin@gmail.com";
        const adminPassword = "admin";
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const adminUser = await User.create({
            fullName: "System Administrator",
            email: adminEmail,
            password: hashedPassword,
            mobile: "0123456789",
            role: "admin",
            isActive: true
        });

        console.log("Admin user created successfully:");
        console.log("Email:", adminEmail);
        console.log("Password:", adminPassword);
        console.log("User ID:", adminUser._id);

    } catch (error) {
        console.error("Error creating admin user:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from database");
    }
};

// Run the script
createAdminUser();
