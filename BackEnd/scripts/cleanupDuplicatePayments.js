// Script để cleanup duplicate MoMo payments và reset payment status
import mongoose from 'mongoose'
import Payment from './models/payment.model.js'
// import Order from './models/order.model.js';

const cleanupDuplicatePayments = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL)
    console.log('Connected to MongoDB')

    // Find all payments with duplicate momoOrderId
    const payments = await Payment.find({ paymentMethod: 'momo' })
      .sort({ createdAt: -1 })
      .populate('order', 'totalAmount paymentStatus')

    console.log('\n=== CLEANUP DUPLICATE PAYMENTS ===')

    // Group by momoOrderId to find duplicates
    const groupedByMomoOrderId = {}
    payments.forEach((payment) => {
      if (!groupedByMomoOrderId[payment.momoOrderId]) {
        groupedByMomoOrderId[payment.momoOrderId] = []
      }
      groupedByMomoOrderId[payment.momoOrderId].push(payment)
    })

    // Process each group
    for (const [momoOrderId, paymentGroup] of Object.entries(
      groupedByMomoOrderId
    )) {
      if (paymentGroup.length > 1) {
        console.log(
          `\nFound ${paymentGroup.length} payments with same momoOrderId: ${momoOrderId}`
        )

        // Keep only the first payment, mark others as failed
        const [keepPayment, ...duplicatePayments] = paymentGroup.sort(
          (a, b) => a.createdAt - b.createdAt
        )

        console.log(
          `Keeping payment: ${keepPayment._id} (Order: ${keepPayment.order._id})`
        )

        // Update duplicate payments to failed
        for (const duplicatePayment of duplicatePayments) {
          console.log(
            `Marking as failed: ${duplicatePayment._id} (Order: ${duplicatePayment.order._id})`
          )

          duplicatePayment.paymentStatus = 'failed'
          duplicatePayment.failedAt = new Date()
          await duplicatePayment.save()

          // Reset order payment status to pending
          duplicatePayment.order.paymentStatus = 'pending'
          await duplicatePayment.order.save()
        }
      }
    }

    // Show final status
    console.log('\n=== FINAL PAYMENT STATUS ===')
    const finalPayments = await Payment.find({ paymentMethod: 'momo' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('order', 'totalAmount paymentStatus')

    finalPayments.forEach((payment, index) => {
      console.log(`\n${index + 1}. Payment ID: ${payment._id}`)
      console.log(`   Order ID: ${payment.order._id}`)
      console.log(`   MoMo Order ID: ${payment.momoOrderId}`)
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

cleanupDuplicatePayments()
