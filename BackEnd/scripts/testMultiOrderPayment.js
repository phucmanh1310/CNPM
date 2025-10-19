import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import Payment from '../models/payment.model.js';
import User from '../models/user.model.js';
import Shop from '../models/shop.model.js';
import Item from '../models/item.model.js';
import dotenv from 'dotenv';

dotenv.config();

const testMultiOrderPayment = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drone-delivery');
        console.log('✅ Connected to MongoDB');

        // Find a test user
        const user = await User.findOne({ email: 'test@example.com' });
        if (!user) {
            console.log('❌ Test user not found. Please create a user with email: test@example.com');
            return;
        }

        // Find shops
        const shops = await Shop.find().limit(2);
        if (shops.length < 2) {
            console.log('❌ Need at least 2 shops for testing');
            return;
        }

        console.log(`✅ Found ${shops.length} shops for testing`);

        // Create test orders from different shops
        const sessionId = `test_session_${Date.now()}`;
        const orders = [];

        for (let i = 0; i < shops.length; i++) {
            const shop = shops[i];
            const items = await Item.find({ shop: shop._id }).limit(2);

            if (items.length === 0) {
                console.log(`⚠️  Shop ${shop.name} has no items, skipping`);
                continue;
            }

            const subtotal = items.reduce((sum, item) => sum + item.price * 2, 0); // 2 quantity each

            const order = await Order.create({
                user: user._id,
                paymentMethod: 'momo',
                paymentStatus: 'pending',
                deliveryAddress: {
                    text: 'Test Address',
                    latitude: 10.762622,
                    longitude: 106.660172
                },
                totalAmount: subtotal,
                sessionId: sessionId,
                shopOrder: [{
                    shop: shop._id,
                    owner: shop.owner,
                    subtotal: subtotal,
                    shopOrderItems: items.map(item => ({
                        item: item._id,
                        price: item.price,
                        quantity: 2,
                        name: item.name
                    }))
                }]
            });

            orders.push(order);
            console.log(`✅ Created order ${order._id} for shop ${shop.name} - Amount: ${subtotal} VND`);
        }

        if (orders.length === 0) {
            console.log('❌ No orders created');
            return;
        }

        // Create payment for all orders
        const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        const momoOrderId = `MOMO_test_${Date.now()}`;

        const payment = await Payment.create({
            order: orders[0]._id,
            orders: orders.map(order => order._id),
            sessionId: sessionId,
            user: user._id,
            paymentMethod: 'momo',
            amount: totalAmount,
            paymentStatus: 'pending',
            momoOrderId: momoOrderId,
            momoResponse: { test: true }
        });

        console.log(`✅ Created payment ${payment._id} for ${orders.length} orders`);
        console.log(`💰 Total amount: ${totalAmount} VND`);

        // Simulate successful payment callback
        console.log('\n🔄 Simulating successful payment callback...');

        for (const order of orders) {
            order.paymentStatus = 'success';
            await order.save();
        }

        payment.paymentStatus = 'success';
        payment.paidAt = new Date();
        await payment.save();

        console.log('✅ Payment simulation completed successfully!');

        // Verify results
        console.log('\n📊 Verification:');
        const updatedOrders = await Order.find({ _id: { $in: orders.map(o => o._id) } });
        const updatedPayment = await Payment.findById(payment._id);

        console.log(`Orders with success status: ${updatedOrders.filter(o => o.paymentStatus === 'success').length}/${updatedOrders.length}`);
        console.log(`Payment status: ${updatedPayment.paymentStatus}`);
        console.log(`Payment amount: ${updatedPayment.amount} VND`);
        console.log(`Orders in payment: ${updatedPayment.orders.length}`);

        console.log('\n🎉 Multi-order payment test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
};

// Run the test
testMultiOrderPayment();
