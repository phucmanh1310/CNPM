import Shop from '../models/shop.model.js';
import Order from '../models/order.model.js';
import Item from '../models/item.model.js';

export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddress } = req.body
        if (cartItems.length == 0 || !cartItems) {
            return res.status(400).json({ message: "Cart is empty" })
        }
        if (!deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude) {
            return res.status(400).json({ message: "Delivery address is required" })
        }
        for (const item of cartItems) {
            if (!item.shop || !item.id) {
                return res.status(400).json({ message: "Invalid cart item: missing shop or id" })
            }
        }
        //do là có thể đặt món từ nhiều shop nên sẽ group lại theo shop
        const groupItemsByShop = {

        }
        cartItems.forEach((item) => {
            const shopId = item.shop
            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = []
            }
            groupItemsByShop[shopId].push(item)
        });

        const shopOrders = []
        for (const shopId of Object.keys(groupItemsByShop)) {
            const shop = await Shop.findById(shopId).populate("owner")
            if (!shop) {
                return res.status(400).json({ message: "Shop not found" })
            }
            const items = groupItemsByShop[shopId]
            const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0)
            shopOrders.push({
                shop: shop._id,
                owner: shop.owner._id,
                subtotal,
                shopOrderItems: items.map((i) => {
                    return {
                        item: i._id,
                        price: i.price,
                        quantity: i.quantity,
                        name: i.name
                    }
                })
            })
        }

        const totalAmount = shopOrders.reduce((sum, so) => sum + so.subtotal, 0)
        const order = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrder: shopOrders
        })
        return res.status(201).json(order)

    } catch (error) {
        return res.status(500).json({ message: `place order error ${error.message}` })
    }
}

