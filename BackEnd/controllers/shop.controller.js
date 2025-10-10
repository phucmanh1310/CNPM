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
        return res.status(200).json(shop);  // trả status 200 cho GET
    } catch (error) {
        console.error("getMyShop error:", error);
        return res.status(500).json({ message: `getMyShop error ${error.message}` });
    }
};

export const getShopByCity = async (req, res) => {
    try {
        const { city } = req.params
        console.log('Searching for shops in city:', city);

        const shops = await Shop.find({
            city: {
                $regex: new RegExp(`^${city}$`, "i")
            }

        }).populate('item')

        console.log('Found shops:', shops.length);
        console.log('Shops data:', shops.map(s => ({ name: s.name, city: s.city, state: s.state })));

        if (!shops || shops.length === 0) {
            // If no shops found with exact match, try partial match
            const partialShops = await Shop.find({
                city: {
                    $regex: new RegExp(city, "i")
                }
            }).populate('item');

            console.log('Partial match shops:', partialShops.length);

            if (partialShops.length === 0) {
                // If still no shops, return all shops as fallback
                console.log('No shops found for city, returning all shops');
                const allShops = await Shop.find({}).populate('item');
                return res.status(200).json(allShops);
            }

            return res.status(200).json(partialShops);
        }

        return res.status(200).json(shops);
    } catch (error) {
        console.error("get shop by city error:", error);
        return res.status(500).json({ message: `get shop by city error ${error.message}` });
    }
}