// Script để kiểm tra trạng thái thanh toán trong database
import mongoose from 'mongoose';
import Payment from './models/payment.model.js';
import Order from './models/order.model.js';

const checkPaymentStatus = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Connected to MongoDB');

        // Get latest payments
        const payments = await Payment.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('order', 'totalAmount paymentStatus')
            .populate('user', 'name email');

        console.log('\n=== LATEST PAYMENTS ===');
        payments.forEach((payment, index) => {
            console.log(`\n${index + 1}. Payment ID: ${payment._id}`);
            console.log(`   Order ID: ${payment.order._id}`);
            console.log(`   User: ${payment.user.name} (${payment.user.email})`);
            console.log(`   Amount: ${payment.amount.toLocaleString('vi-VN')} VND`);
            console.log(`   Payment Method: ${payment.paymentMethod}`);
            console.log(`   Payment Status: ${payment.paymentStatus}`);
            console.log(`   MoMo Order ID: ${payment.momoOrderId}`);
            console.log(`   MoMo Transaction ID: ${payment.momoTransactionId || 'N/A'}`);
            console.log(`   Created: ${payment.createdAt}`);
            console.log(`   Paid At: ${payment.paidAt || 'N/A'}`);
        });

        // Get latest orders
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');

        console.log('\n=== LATEST ORDERS ===');
        orders.forEach((order, index) => {
            console.log(`\n${index + 1}. Order ID: ${order._id}`);
            console.log(`   User: ${order.user.name} (${order.user.email})`);
            console.log(`   Payment Method: ${order.paymentMethod}`);
            console.log(`   Payment Status: ${order.paymentStatus}`);
            console.log(`   Total Amount: ${order.totalAmount.toLocaleString('vi-VN')} VND`);
            console.log(`   Created: ${order.createdAt}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

checkPaymentStatus();
