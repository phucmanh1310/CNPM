import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa'
import axios from 'axios'
import { serverURL } from '../App'

function PaymentSuccess() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState('loading')
  const [paymentData, setPaymentData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Get payment ID from URL params or localStorage
        const paymentId =
          searchParams.get('paymentId') ||
          localStorage.getItem('lastPaymentId') ||
          searchParams.get('orderId') // MoMo có thể trả về orderId

        console.log('Payment ID from URL:', searchParams.get('paymentId'))
        console.log(
          'Payment ID from localStorage:',
          localStorage.getItem('lastPaymentId')
        )
        console.log('Order ID from URL:', searchParams.get('orderId'))
        console.log('Final payment ID:', paymentId)

        if (!paymentId) {
          setPaymentStatus('error')
          setError('Payment ID not found')
          return
        }

        // Check payment status
        const response = await axios.get(
          `${serverURL}/api/payment/status/${paymentId}`,
          {
            withCredentials: true,
          }
        )

        console.log('Payment status response:', response.data)

        if (response.data.success) {
          setPaymentData(response.data.data)
          setPaymentStatus(response.data.data.paymentStatus)
        } else {
          setPaymentStatus('error')
          setError('Failed to get payment status')
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
        setPaymentStatus('error')
        setError('Failed to check payment status')
      }
    }

    checkPaymentStatus()
  }, [searchParams])

  const handleContinue = () => {
    if (paymentStatus === 'success') {
      navigate('/my-orders')
    } else {
      navigate('/cart')
    }
  }

  const renderStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <FaCheckCircle className="text-green-500" size={64} />
      case 'failed':
      case 'error':
        return <FaTimesCircle className="text-red-500" size={64} />
      default:
        return <FaSpinner className="text-blue-500 animate-spin" size={64} />
    }
  }

  const renderStatusMessage = () => {
    switch (paymentStatus) {
      case 'success':
        return {
          title: 'Payment Successful!',
          message:
            'Your order has been placed successfully. You will receive a confirmation email shortly.',
          buttonText: 'View My Orders',
          buttonClass: 'bg-green-500 hover:bg-green-600',
        }
      case 'failed':
        return {
          title: 'Payment Failed',
          message:
            'Your payment could not be processed. Please try again or contact support.',
          buttonText: 'Try Again',
          buttonClass: 'bg-red-500 hover:bg-red-600',
        }
      case 'error':
        return {
          title: 'Error',
          message: error || 'An error occurred while processing your payment.',
          buttonText: 'Go to Cart',
          buttonClass: 'bg-gray-500 hover:bg-gray-600',
        }
      default:
        return {
          title: 'Processing Payment...',
          message: 'Please wait while we verify your payment.',
          buttonText: 'Loading...',
          buttonClass: 'bg-gray-400 cursor-not-allowed',
        }
    }
  }

  const statusInfo = renderStatusMessage()

  return (
    <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-6">{renderStatusIcon()}</div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {statusInfo.title}
        </h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          {statusInfo.message}
        </p>

        {paymentData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">
              Payment Details
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">
                  {paymentData.amount?.toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="font-medium capitalize">
                  {paymentData.paymentMethod}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className={`font-medium capitalize ${
                    paymentData.paymentStatus === 'success'
                      ? 'text-green-600'
                      : paymentData.paymentStatus === 'failed'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                  }`}
                >
                  {paymentData.paymentStatus}
                </span>
              </div>
              {paymentData.momoTransactionId && (
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-medium text-xs">
                    {paymentData.momoTransactionId}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={paymentStatus === 'loading'}
          className={`w-full text-white py-3 rounded-lg font-semibold transition-colors ${statusInfo.buttonClass}`}
        >
          {statusInfo.buttonText}
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-3 text-gray-600 py-2 rounded-lg font-medium hover:text-gray-800 transition-colors"
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}

export default PaymentSuccess
