import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
const uploadOnCloudinary = async (file) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
        if (!file) return null;

        const result = await cloudinary.uploader.upload(file, {
            resource_type: "auto" // Hỗ trợ nhiều loại file
        });

        // Xóa file sau khi upload thành công
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }

        return result.secure_url;
    } catch (error) {
        // Xóa file nếu upload thất bại
        if (fs.existsSync(file)) {
            fs.unlinkSync(file);
        }
        console.log("Cloudinary upload error:", error);
        return null;
    }
};

export default uploadOnCloudinary;