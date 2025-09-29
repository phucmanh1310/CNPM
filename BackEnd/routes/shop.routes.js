import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import { creatEditShop, getMyShop } from "../controllers/shop.controller.js";

const shopRouter = express.Router();

shopRouter.post("/create-edit", isAuth, upload.single("image"), creatEditShop);
shopRouter.get("/get-my", isAuth, getMyShop)

export default shopRouter;
