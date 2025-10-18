import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
};

// Toggle user active status
export const toggleUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.isActive = isActive;
        await user.save();

        res.status(200).json({
            message: `User ${isActive ? 'activated' : 'banned'} successfully`,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating user status", error: error.message });
    }
};

// Get all shops
export const getAllShops = async (req, res) => {
    try {
        const shops = await Shop.find({}).populate('owner', 'fullName email');
        res.status(200).json({ shops });
    } catch (error) {
        res.status(500).json({ message: "Error fetching shops", error: error.message });
    }
};

// Toggle shop active status
export const toggleShopStatus = async (req, res) => {
    try {
        const { shopId } = req.params;
        const { isActive } = req.body;

        const shop = await Shop.findById(shopId);
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        shop.isActive = isActive;
        await shop.save();

        res.status(200).json({
            message: `Shop ${isActive ? 'activated' : 'banned'} successfully`,
            shop: {
                id: shop._id,
                name: shop.name,
                city: shop.city,
                owner: shop.owner,
                isActive: shop.isActive
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating shop status", error: error.message });
    }
};

