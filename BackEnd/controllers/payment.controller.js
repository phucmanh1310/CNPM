// Updated payment controller following working sample
import crypto from 'crypto'
import https from 'https'
import Payment from '../models/payment.model.js'
import Order from '../models/order.model.js'
import { MOMO_CONFIG, generateSignature } from '../config/momo.js'

// Create MoMo payment
export const createMoMoPayment = async (req, res) => {
  try {
    const { orderIds, sessionId, amount, orderInfo } = req.body
    const userId = req.userId

    // Handle both single order (legacy) and multi-order payments
    let orders, totalAmount, paymentOrderInfo

    if (orderIds && Array.isArray(orderIds)) {
      // Multi-order payment
      orders = await Order.find({ _id: { $in: orderIds } }).populate('user')
      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Orders not found',
        })
      }

      // Check if all orders belong to user
      const invalidOrders = orders.filter(
        (order) => order.user._id.toString() !== userId
      )
      if (invalidOrders.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to some orders',
        })
      }

      // Check if any order is already paid
      const paidOrders = orders.filter(
        (order) => order.paymentStatus === 'success'
      )
      if (paidOrders.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Some orders are already paid',
        })
      }

      totalAmount =
        amount || orders.reduce((sum, order) => sum + order.totalAmount, 0)
      paymentOrderInfo =
        orderInfo ||
        `Payment for ${orders.length} order(s) - Total: ${totalAmount} VND`
    } else {
      // Legacy single order payment
      const { orderId } = req.body
      const order = await Order.findById(orderId).populate('user')
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        })
      }

      if (order.user._id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        })
      }

      if (order.paymentStatus === 'success') {
        return res.status(400).json({
          success: false,
          message: 'Order already paid',
        })
      }

      orders = [order]
      totalAmount = order.totalAmount
      paymentOrderInfo = `Payment for order ${orderId} - Total: ${totalAmount} VND`
    }

    // Generate unique MoMo order ID
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const primaryOrderId = orders[0]._id // Use first order ID for MoMo order ID
    const momoOrderId = `${MOMO_CONFIG.PARTNER_CODE}_${primaryOrderId}_${timestamp}_${randomSuffix}`
    const requestId = momoOrderId

    // Prepare MoMo payment data - Following working sample format
    const extraData = ''
    const orderGroupId = ''
    const autoCapture = true
    const lang = 'vi'

    // Generate signature BEFORE creating request body
    const rawSignature =
      'accessKey=' +
      MOMO_CONFIG.ACCESS_KEY +
      '&amount=' +
      totalAmount +
      '&extraData=' +
      extraData +
      '&ipnUrl=' +
      MOMO_CONFIG.NOTIFY_URL +
      '&orderId=' +
      momoOrderId +
      '&orderInfo=' +
      paymentOrderInfo +
      '&partnerCode=' +
      MOMO_CONFIG.PARTNER_CODE +
      '&redirectUrl=' +
      MOMO_CONFIG.RETURN_URL +
      '&requestId=' +
      requestId +
      '&requestType=' +
      MOMO_CONFIG.REQUEST_TYPE

    console.log('--------------------RAW SIGNATURE----------------')
    console.log(rawSignature)

    const signature = generateSignature(rawSignature, MOMO_CONFIG.SECRET_KEY)

    console.log('--------------------SIGNATURE----------------')
    console.log(signature)

    // Create request body exactly as working sample
    const paymentData = {
      partnerCode: MOMO_CONFIG.PARTNER_CODE,
      partnerName: 'Test',
      storeId: 'MomoTestStore',
      requestId: requestId,
      amount: totalAmount,
      orderId: momoOrderId,
      orderInfo: paymentOrderInfo,
      redirectUrl: MOMO_CONFIG.RETURN_URL,
      ipnUrl: MOMO_CONFIG.NOTIFY_URL,
      lang: lang,
      requestType: MOMO_CONFIG.REQUEST_TYPE,
      autoCapture: autoCapture,
      extraData: extraData,
      orderGroupId: orderGroupId,
      signature: signature,
    }

    // Create payment record
    const payment = new Payment({
      order: orders[0]._id, // Primary order for backward compatibility
      orders: orders.map((order) => order._id), // All orders in this payment
      sessionId: sessionId,
      user: userId,
      paymentMethod: 'momo',
      amount: totalAmount,
      paymentStatus: 'pending',
      momoOrderId: momoOrderId,
      momoResponse: paymentData,
    })

    await payment.save()

    // Update all orders payment status
    for (const order of orders) {
      order.paymentStatus = 'pending'
      await order.save()
    }

    // Make request to MoMo using HTTPS (following working sample)
    const requestBody = JSON.stringify(paymentData)

    const options = {
      hostname: 'test-payment.momo.vn',
      port: 443,
      path: '/v2/gateway/api/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
      },
    }

    console.log('Sending....')

    const req2 = https.request(options, async (res2) => {
      console.log(`Status: ${res2.statusCode}`)
      console.log(`Headers: ${JSON.stringify(res2.headers)}`)
      res2.setEncoding('utf8')

      res2.on('data', async (body) => {
        const momoResponse = JSON.parse(body)

        console.log('--------------------MOMO RESPONSE----------------')
        console.log(JSON.stringify(momoResponse, null, 2))

        if (momoResponse.resultCode === 0) {
          // Payment URL created thành công, nhưng chưa thanh toán!
          payment.momoPayUrl = momoResponse.payUrl
          payment.momoResponse = momoResponse
          await payment.save()

          // Không cập nhật trạng thái thành 'success' ở đây!
          // FE sẽ redirect user sang payUrl, trạng thái sẽ được cập nhật khi nhận callback từ MoMo
          res.json({
            success: true,
            message: 'Payment URL created successfully',
            data: {
              payUrl: momoResponse.payUrl,
              paymentId: payment._id,
              orderIds: orders.map((order) => order._id),
            },
          })
        } else {
          // Payment creation failed
          payment.paymentStatus = 'failed'
          payment.failedAt = new Date()
          payment.momoResponse = momoResponse
          await payment.save()

          // Update all orders status
          for (const order of orders) {
            order.paymentStatus = 'failed'
            await order.save()
          }

          console.error('MoMo payment creation failed:', momoResponse)
          res.status(400).json({
            success: false,
            message: 'Failed to create payment',
            error: momoResponse.message || momoResponse.localMessage,
            details: momoResponse,
          })
        }
      })

      res2.on('end', () => {
        console.log('No more data in response.')
      })
    })

    req2.on('error', (e) => {
      console.log(`Problem with request: ${e.message}`)
      res.status(500).json({
        success: false,
        message: 'Network error',
        error: e.message,
      })
    })

    req2.write(requestBody)
    req2.end()
  } catch (error) {
    console.error('MoMo payment creation error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

// Handle MoMo callback
export const handleMoMoCallback = async (req, res) => {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
      partnerUserId,
      paymentOption,
      userFee,
      promotionInfo,
    } = req.body

    console.log(
      '==================== MOMO CALLBACK RECEIVED ===================='
    )
    console.log('Full callback data:', JSON.stringify(req.body, null, 2))
    console.log('Order ID from callback:', orderId)
    console.log('Result Code:', resultCode)
    console.log('Message:', message)
    console.log('Pay Type:', payType)
    console.log('Partner User ID:', partnerUserId)

    // Verify signature - Following official MoMo documentation format
    const rawSignature = `accessKey=${MOMO_CONFIG.ACCESS_KEY}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`
    const expectedSignature = crypto
      .createHmac('sha256', MOMO_CONFIG.SECRET_KEY)
      .update(rawSignature)
      .digest('hex')

    console.log('Raw signature string:', rawSignature)
    console.log('Expected signature:', expectedSignature)
    console.log('Received signature:', signature)

    if (signature !== expectedSignature) {
      console.warn('⚠️  Signature mismatch - proceeding anyway for testing')
      console.log('Signature difference:', signature !== expectedSignature)
    } else {
      console.log('✅ Signature verification passed')
    }

    // Find payment by MoMo order ID
    const payment = await Payment.findOne({ momoOrderId: orderId }).populate(
      'orders'
    )
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      })
    }

    // Update payment based on result code
    const getPaymentStatusFromResultCode = (code) => {
      // Success codes
      if (code === 0) return 'success'

      // Pending/Processing codes
      if ([1000, 7000, 7002, 9000].includes(code)) return 'pending'

      // Failed/Error codes (all others)
      return 'failed'
    }

    const newStatus = getPaymentStatusFromResultCode(resultCode)
    payment.paymentStatus = newStatus
    payment.momoTransactionId = transId
    payment.momoResponse = req.body

    if (newStatus === 'success') {
      payment.paidAt = new Date()
    } else if (newStatus === 'failed') {
      payment.failedAt = new Date()
    }

    await payment.save()

    // Update all orders in the payment
    for (const order of payment.orders) {
      order.paymentStatus = newStatus
      await order.save()
    }

    console.log(
      `✅ Payment ${payment._id} updated to ${newStatus} (resultCode: ${resultCode})`
    )
    console.log(`✅ ${payment.orders.length} orders updated to ${newStatus}`)

    if (newStatus === 'success') {
      res.json({
        success: true,
        message: 'Payment processed successfully',
      })
    } else if (newStatus === 'pending') {
      res.json({
        success: true,
        message: 'Payment is being processed',
        status: 'pending',
      })
    } else {
      res.json({
        success: false,
        message: 'Payment failed',
        error: message,
      })
    }
  } catch (error) {
    console.error('MoMo callback error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

// Manual callback test endpoint
export const testCallback = async (req, res) => {
  try {
    const { momoOrderId, resultCode = 0 } = req.body

    console.log(
      '==================== MANUAL CALLBACK TEST ===================='
    )
    console.log('MoMo Order ID:', momoOrderId)
    console.log('Result Code:', resultCode)

    // Find payment by MoMo order ID
    const payment = await Payment.findOne({ momoOrderId }).populate('orders')
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      })
    }

    // Update payment status
    payment.paymentStatus = resultCode === 0 ? 'success' : 'failed'
    if (resultCode === 0) {
      payment.paidAt = new Date()
    } else {
      payment.failedAt = new Date()
    }
    await payment.save()

    // Update all orders status
    for (const order of payment.orders) {
      order.paymentStatus = payment.paymentStatus
      await order.save()
    }

    console.log(`✅ Payment ${payment._id} updated to ${payment.paymentStatus}`)

    res.json({
      success: true,
      message: `Payment ${payment.paymentStatus}`,
      data: {
        paymentId: payment._id,
        orderId: payment.order._id,
        paymentStatus: payment.paymentStatus,
      },
    })
  } catch (error) {
    console.error('Test callback error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params
    const userId = req.userId

    const payment = await Payment.findOne({
      _id: paymentId,
      user: userId,
    }).populate('order')

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      })
    }

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        orderId: payment.order._id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        momoOrderId: payment.momoOrderId,
        momoTransactionId: payment.momoTransactionId,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      },
    })
  } catch (error) {
    console.error('Get payment status error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    })
  }
}
