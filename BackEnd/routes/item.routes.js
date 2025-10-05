// routes/item.routes.js
import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { addItem, editItem, deleteItem, getItemById, getItemByCity } from "../controllers/item.controllers.js";
import { upload } from "../middlewares/multer.js";

const itemRouter = express.Router();

itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.put("/edit-item/:itemId", isAuth, upload.single("image"), editItem);
itemRouter.delete("/delete-item/:itemId", isAuth, deleteItem);
itemRouter.get("/get-by-city/:city", isAuth, getItemByCity);  // ← sửa route
itemRouter.get("/:itemId", isAuth, getItemById);  // ← đặt cuối để tránh conflict

export default itemRouter;
