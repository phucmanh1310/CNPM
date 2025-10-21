import React from 'react'
import { FaCircleCheck } from 'react-icons/fa6'
import { useNavigate, useLocation } from 'react-router-dom'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { formatCurrency } from '../utils/currency'

function OrderPlaced() {
  const navigate = useNavigate()
  const location = useLocation()
  const { orders, totalOrders } = location.state || {}

  return (
    <div
      className="min-h-screen bg-[#fff9f6] flex flex-col justify-center items-center px-4 
        text-center relative overflow-hidden"
    >
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-10">
        <button
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50"
          onClick={() => navigate('/')}
          title="Back to Home"
        >
          <IoIosArrowRoundBack size={24} className="text-[#00BFFF]" />
        </button>
      </div>

      <FaCircleCheck className="text-green-500 text-6xl mb-4" />
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        {totalOrders > 1 ? 'Orders Placed!' : 'Order Placed!'}
      </h1>

      {totalOrders > 1 ? (
        <div className="text-gray-600 max-w-md mb-6">
          <p className="mb-2">
            Your {totalOrders} orders have been placed successfully.
          </p>
          <p className="text-sm">
            Each restaurant will prepare their items separately. You can track
            all orders in the "My Orders" section.
          </p>
        </div>
      ) : (
        <p className="text-gray-600 max-w-md mb-6">
          Your order has been placed successfully. Your order is being prepared.
          You can track your order status in the "My Orders" section
        </p>
      )}

      {/* Show order details if available */}
      {orders && orders.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 max-w-md w-full">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Order Details
          </h3>
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order._id}
                className="text-left border-b pb-2 last:border-b-0"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Order #{order._id.slice(-8)}
                  </span>
                  <span className="text-sm font-bold text-[#00BFFF]">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {order.shopOrder[0]?.shop?.name || 'Restaurant'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg
                text-lg font-medium transition"
          onClick={() => {
            navigate('/')
          }}
        >
          Back to Home
        </button>
        <button
          className="bg-[#00BFFF] hover:bg-blue-600 text-white px-6 py-3 rounded-lg
                text-lg font-medium transition"
          onClick={() => {
            navigate('/my-orders')
          }}
        >
          View My Orders
        </button>
      </div>
    </div>
  )
}

export default OrderPlaced
