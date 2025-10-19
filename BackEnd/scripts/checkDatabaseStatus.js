import mongoose from 'mongoose';
import Order from '../models/order.model.js';
import Payment from '../models/payment.model.js';
import dotenv from 'dotenv';

dotenv.config();

const checkDatabaseStatus = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/drone-delivery');
        console.log('✅ Connected to MongoDB');

        // Check recent orders with sessionId
        const recentOrders = await Order.find({
            sessionId: { $exists: true },
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }).sort({ createdAt: -1 }).limit(10);

        console.log(`\n📊 Found ${recentOrders.length} recent orders with sessionId:`);

        for (const order of recentOrders) {
            console.log(`- Order ${order._id}: ${order.paymentStatus} | Session: ${order.sessionId} | Amount: ${order.totalAmount} VND`);
        }

        // Check recent payments
        const recentPayments = await Payment.find({
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }).sort({ createdAt: -1 }).limit(5);

        console.log(`\n💰 Found ${recentPayments.length} recent payments:`);

        for (const payment of recentPayments) {
            console.log(`- Payment ${payment._id}: ${payment.paymentStatus} | Amount: ${payment.amount} VND | Orders: ${payment.orders?.length || 1}`);
        }

        // Check for any orders with sessionId but no matching payment
        const ordersWithoutPayment = await Order.find({
            sessionId: { $exists: true },
            paymentStatus: 'pending',
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (ordersWithoutPayment.length > 0) {
            console.log(`\n⚠️  Found ${ordersWithoutPayment.length} pending orders with sessionId:`);
            for (const order of ordersWithoutPayment) {
                console.log(`- Order ${order._id}: Session ${order.sessionId}`);
            }
        }

        console.log('\n✅ Database check completed');

    } catch (error) {
        console.error('❌ Database check failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
    }
};

// Run the check
checkDatabaseStatus();
