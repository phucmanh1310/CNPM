import express from 'express'
import isAuth from '../middlewares/isAuth.js'
import { upload } from '../middlewares/multer.js'
import {
  creatEditShop,
  getMyShop,
  getShopByCity,
} from '../controllers/shop.controller.js'

const shopRouter = express.Router()

shopRouter.post('/create-edit', isAuth, upload.single('image'), creatEditShop)
shopRouter.get('/get-my', isAuth, getMyShop)
shopRouter.get('/get-by-city/:city', getShopByCity)

export default shopRouter
