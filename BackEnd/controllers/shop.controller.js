import uploadOnCloudinary from "../utils/cloudinary.js"
import Shop from "../models/shop.model.js"

export const creatEditShop = async (req, res) => {
    try {
        const { name, city, state, address } = req.body;
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path);
        }
        let shop = await Shop.findOne({ owner: req.userId });

        if (!shop) {
            shop = await Shop.create({ name, city, state, address, image, owner: req.userId });
        } else {
            shop = await Shop.findByIdAndUpdate(
                shop._id,
                { name, city, state, address, image, owner: req.userId },
                { new: true }
            );
        }

        await shop.populate("owner item");

        return res.status(200).json({ shop });
    } catch (error) {
        return res.status(500).json({ message: `create shop controller ${error.message}` });
    }
};

export const getMyShop = async (req, res) => {
    try {
        const shop = await Shop.findOne({ owner: req.userId })
            .populate("owner").populate({
                path: "item",
                options: { sort: { updatedAt: -1 } }
            });  // populate đúng “item”

        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }
        return res.status(200).json({ shop });  // trả status 200 cho GET
    } catch (error) {
        console.error("getMyShop error:", error);
        return res.status(500).json({ message: `getMyShop error ${error.message}` });
    }
};