import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { addItem, editItem, deleteItem, getItemById } from "../controllers/item.controllers.js";
import { upload } from "../middlewares/multer.js";

const itemRouter = express.Router();

itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.put("/edit-item/:itemId", isAuth, upload.single("image"), editItem);
itemRouter.delete("/delete-item/:itemId", isAuth, deleteItem);
itemRouter.get("/:itemId", isAuth, getItemById); // ← lấy Id của sản phẩm

export default itemRouter;
