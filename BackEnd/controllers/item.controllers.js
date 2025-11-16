import uploadOnCloudinary from '../utils/cloudinary.js'
import Shop from '../models/shop.model.js'
import Item from '../models/item.model.js'

// controllers/item.controllers.js
export const addItem = async (req, res) => {
  try {
    const { name, category, foodType, price } = req.body
    let image
    // console.log('req.file (in addItem):', req.file)
    if (req.file) {
      // uploadOnCloudinary may be mocked in tests; fallback to req.body.image
      image = await uploadOnCloudinary(req.file.path)
    }
    if (!image && req.body.image) {
      image = req.body.image // allow providing image url directly (tests / manual fallback)
    }

    // Tìm shop
    const shop = await Shop.findOne({ owner: req.userId })
    if (!shop) {
      return res.status(400).json({ message: 'Shop not found' })
    }

    // Tạo item
    const item = await Item.create({
      name,
      category,
      foodType,
      price,
      image,
      shop: shop._id,
    })

    // Push item ID vào mảng và save
    shop.item.push(item._id)
    await shop.save()

    // Lấy lại shop và populate
    const populatedShop = await Shop.findById(shop._id)
      .populate('owner')
      .populate({
        path: 'item',
        options: { sort: { updatedAt: -1 } },
      })

    return res.status(201).json(populatedShop)
  } catch (error) {
    return res
      .status(500)
      .json({ message: `add item controller ${error.message}` })
  }
}

export const getItemById = async (req, res) => {
  try {
    const { itemId } = req.params
    const item = await Item.findById(itemId)

    if (!item) {
      return res.status(404).json({ message: 'Item not found' })
    }

    return res.status(200).json(item)
  } catch (error) {
    console.error('getItemById error:', error)
    return res
      .status(500)
      .json({ message: `getItemById error: ${error.message}` })
  }
}

export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId
    const { name, category, foodType, price } = req.body
    let image
    if (req.file) {
      image = await uploadOnCloudinary(req.file.path)
    }
    const item = await Item.findByIdAndUpdate(
      itemId,
      {
        name,
        category,
        foodType,
        price,
        image,
      },
      { new: true }
    )
    if (!item) {
      return res.status(400).json({ message: 'item not found' })
    }
    await Shop.findOne({ owner: req.userId }).populate({
      path: 'item',
      options: { sort: { updateAt: -1 } },
    })
    return res.status(200).json(item)
  } catch {
    return res.status(500).json({ message: `edit item` })
  }
}

export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params
    console.log('Deleting item with ID:', itemId)

    // Xóa item khỏi database
    const item = await Item.findByIdAndDelete(itemId)
    if (!item) {
      console.log('Item not found for deletion')
      return res.status(404).json({ message: 'Item not found' })
    }
    console.log('Deleted item:', item)

    // Remove khỏi shop.item array
    await Shop.findByIdAndUpdate(item.shop, {
      $pull: { item: itemId },
    })

    return res.status(200).json({ message: 'Item deleted' })
  } catch (error) {
    console.error('deleteItem error:', error)
    return res
      .status(500)
      .json({ message: `deleteItem error: ${error.message}` })
  }
}

export const getItemByCity = async (req, res) => {
  try {
    const { city } = req.params
    if (!city) {
      return res.status(400).json({ message: 'City is required' })
    }
    const shops = await Shop.find({
      city: {
        $regex: new RegExp(`^${city}$`, 'i'),
      },
    }).populate('item')
    if (!shops) {
      return res.status(404).json({ message: 'Shop not found' })
    }
    const shopIds = shops.map((shop) => shop._id)
    const items = await Item.find({
      shop: {
        $in: shopIds,
      },
    })
    return res.status(200).json(items)
  } catch (error) {
    return res
      .status(500)
      .json({ message: `get item by city error: ${error.message}` })
  }
}
