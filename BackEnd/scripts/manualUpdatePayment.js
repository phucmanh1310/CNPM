// Script để manually update payment status cho testing
import mongoose from 'mongoose'
import Payment from './models/payment.model.js'
// import Order from './models/order.model.js';

const updatePaymentStatus = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL)
    console.log('Connected to MongoDB')

    // Get latest MoMo payments
    const payments = await Payment.find({ paymentMethod: 'momo' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('order', 'totalAmount paymentStatus')

    console.log('\n=== CURRENT MOMO PAYMENTS ===')
    payments.forEach((payment, index) => {
      console.log(`\n${index + 1}. Payment ID: ${payment._id}`)
      console.log(`   Order ID: ${payment.order._id}`)
      console.log(`   MoMo Order ID: ${payment.momoOrderId}`)
      console.log(`   Payment Status: ${payment.paymentStatus}`)
      console.log(`   Order Payment Status: ${payment.order.paymentStatus}`)
      console.log(`   Amount: ${payment.amount}`)
      console.log(`   Created: ${payment.createdAt}`)
    })

    // Ask user which payment to update
    console.log('\n=== MANUAL UPDATE ===')
    console.log('To update a payment status, modify the script below:')
    console.log('Example: await updatePaymentById("PAYMENT_ID", "success");')

    // Example: Update first payment to success
    if (payments.length > 0) {
      const firstPayment = payments[0]
      console.log(`\nUpdating payment ${firstPayment._id} to success...`)

      // Update payment
      firstPayment.paymentStatus = 'success'
      firstPayment.paidAt = new Date()
      await firstPayment.save()

      // Update order
      firstPayment.order.paymentStatus = 'success'
      await firstPayment.order.save()

      console.log('✅ Payment status updated successfully!')
    }

    // Show updated status
    console.log('\n=== UPDATED STATUS ===')
    const updatedPayments = await Payment.find({ paymentMethod: 'momo' })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('order', 'totalAmount paymentStatus')

    updatedPayments.forEach((payment, index) => {
      console.log(`\n${index + 1}. Payment ID: ${payment._id}`)
      console.log(`   Order ID: ${payment.order._id}`)
      console.log(`   Payment Status: ${payment.paymentStatus}`)
      console.log(`   Order Payment Status: ${payment.order.paymentStatus}`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  }
}

updatePaymentStatus()
