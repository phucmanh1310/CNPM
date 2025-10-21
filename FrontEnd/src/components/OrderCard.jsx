import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../utils/currency'
import CancelOrderModal from './CancelOrderModal'

function OrderCard({
  order,
  userRole,
  onStatusUpdate,
  onCancelOrder,
  onConfirmDelivery,
}) {
  const navigate = useNavigate()
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedShopOrder, setSelectedShopOrder] = useState(null)

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-blue-100 text-blue-800'
      case 'preparing':
        return 'bg-orange-100 text-orange-800'
      case 'prepared':
        return 'bg-indigo-100 text-indigo-800'
      case 'handed over to drone':
        return 'bg-cyan-100 text-cyan-800'
      case 'delivering':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'success':
        return 'Thanh toán thành công'
      case 'pending':
        return 'Chờ thanh toán'
      case 'failed':
        return 'Thanh toán thất bại'
      case 'cancelled':
        return 'Thanh toán đã hủy'
      default:
        return 'Không xác định'
    }
  }

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return 'accepted'
      case 'accepted':
        return 'preparing'
      case 'preparing':
        return 'prepared'
      case 'prepared':
        return 'handed over to drone' // This will be handled by drone assignment
      case 'handed over to drone':
        return 'delivering' // Auto-transition
      case 'delivering':
        return 'delivered'
      default:
        return null
    }
  }

  const handleCancelClick = (shopOrder) => {
    setSelectedShopOrder(shopOrder)
    setShowCancelModal(true)
  }

  const handleCancelConfirm = (cancelReason) => {
    onCancelOrder(order._id, selectedShopOrder._id, cancelReason)
    setShowCancelModal(false)
    setSelectedShopOrder(null)
  }

  const handleCancelClose = () => {
    setShowCancelModal(false)
    setSelectedShopOrder(null)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Order #{order._id.slice(-8)}
          </h3>
          <p className="text-sm text-gray-600">
            {new Date(order.createdAt).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-[#00BFFF]">
            {formatCurrency(order.totalAmount)}
          </p>
          <p className="text-sm text-gray-600">
            {order.paymentMethod === 'cod'
              ? 'Cash on Delivery'
              : 'Online Payment'}
          </p>
          <div className="mt-1">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}
            >
              {getPaymentStatusText(order.paymentStatus)}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-600 mb-1">Delivery Address:</p>
        <p className="text-sm font-medium">{order.deliveryAddress.text}</p>
      </div>

      {userRole === 'user' && (
        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-1">Customer:</p>
          <p className="text-sm font-medium">{order.user?.name}</p>
        </div>
      )}

      {order.shopOrder.map((shopOrder, index) => (
        <div key={index} className="border-t pt-3 mb-3">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-gray-800">
              {shopOrder.shop?.name}
            </h4>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shopOrder.status)}`}
            >
              {shopOrder.status}
            </span>
          </div>

          {userRole === 'owner' && (
            <div className="mb-2">
              <p className="text-sm text-gray-600 mb-1">Customer:</p>
              <p className="text-sm font-medium">{order.user?.name}</p>
              <p className="text-xs text-gray-500">{order.user?.mobile}</p>
            </div>
          )}

          <div className="space-y-2">
            {shopOrder.shopOrderItems.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={item.item?.image}
                    alt={item.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-500">x{item.quantity}</span>
                </div>
                <span className="font-medium">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-2 pt-2 border-t">
            <span className="text-sm font-medium">Subtotal:</span>
            <span className="font-bold text-[#00BFFF]">
              {formatCurrency(shopOrder.subtotal)}
            </span>
          </div>

          {shopOrder.status === 'cancelled' && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-1">
                The order has been canceled
              </p>
              <p className="text-sm text-red-600">
                Reason: {shopOrder.cancelReason}
              </p>
              {shopOrder.cancelledAt && (
                <p className="text-xs text-red-500 mt-1">
                  Cancelled at:{' '}
                  {new Date(shopOrder.cancelledAt).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          )}

          {userRole === 'owner' &&
            shopOrder.status !== 'delivered' &&
            shopOrder.status !== 'cancelled' && (
              <div className="mt-3 space-y-2">
                {/* Regular status update button */}
                {shopOrder.status !== 'prepared' &&
                  shopOrder.status !== 'handed over to drone' &&
                  shopOrder.status !== 'delivering' && (
                    <button
                      onClick={() => {
                        const nextStatus = getNextStatus(shopOrder.status)
                        if (nextStatus) {
                          onStatusUpdate(order._id, shopOrder._id, nextStatus)
                        }
                      }}
                      className="w-full bg-[#00BFFF] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#0090cc] transition-colors"
                    >
                      {shopOrder.status === 'pending' && 'Accept Order'}
                      {shopOrder.status === 'accepted' && 'Start Preparing'}
                      {shopOrder.status === 'preparing' && 'Mark as Prepared'}
                    </button>
                  )}

                {/* Assign Drone button for prepared orders */}
                {shopOrder.status === 'prepared' && (
                  <button
                    onClick={() => {
                      // Navigate to drone management with order info
                      navigate('/drone-management', {
                        state: {
                          assignOrder: {
                            orderId: order._id,
                            shopOrderId: shopOrder._id,
                            shopId: shopOrder.shop._id,
                            shopName: shopOrder.shop.name,
                            customerName: order.user?.name,
                          },
                        },
                      })
                    }}
                    className="w-full bg-indigo-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-600 transition-colors"
                  >
                    Assign Drone
                  </button>
                )}

                {/* Handed over to drone status info */}
                {shopOrder.status === 'handed over to drone' && (
                  <div className="w-full bg-cyan-100 text-cyan-800 py-2 px-4 rounded-lg text-center font-medium">
                    Handed Over to Drone - Preparing for Delivery
                  </div>
                )}

                {/* Chỉ hiển thị nút Cancel khi status là pending */}
                {shopOrder.status === 'pending' && (
                  <button
                    onClick={() => handleCancelClick(shopOrder)}
                    className="w-full bg-red-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Cancel order
                  </button>
                )}
              </div>
            )}
        </div>
      ))}

      {/* Customer Actions */}
      {userRole === 'user' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {order.shopOrder.some(
            (shopOrder) => shopOrder.status === 'delivering'
          ) && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Delivery Status:
              </h4>
              {order.shopOrder.map(
                (shopOrder, index) =>
                  shopOrder.status === 'delivering' && (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-purple-800">
                          {shopOrder.shop?.name}
                        </p>
                        <p className="text-sm text-purple-600">
                          Your order is being delivered to you
                        </p>
                        {order.assignedDroneId && (
                          <div className="mt-2 p-2 bg-white bg-opacity-50 rounded">
                            <p className="text-xs text-purple-700">
                              <span className="font-medium">Drone:</span>{' '}
                              {order.assignedDroneId?.name ||
                                order.assignedDroneId}
                            </p>
                            <p className="text-xs text-purple-700">
                              <span className="font-medium">Status:</span>{' '}
                              {order.assignedDroneId?.status || 'Unknown'}
                            </p>
                            <p className="text-xs text-purple-700">
                              <span className="font-medium">Assigned at:</span>{' '}
                              {order.droneAssignedAt
                                ? new Date(
                                    order.droneAssignedAt
                                  ).toLocaleString('vi-VN')
                                : 'N/A'}
                            </p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          onConfirmDelivery(order._id, shopOrder._id)
                        }
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                      >
                        Confirm Received
                      </button>
                    </div>
                  )
              )}
            </div>
          )}

          {order.shopOrder.every(
            (shopOrder) => shopOrder.status === 'delivered'
          ) && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-green-800 font-medium">
                ✅ Order completed successfully!
              </p>
              {order.assignedDroneId && (
                <p className="text-xs text-green-700 mt-1">
                  Delivered by {order.assignedDroneId?.name || 'Drone'}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
        orderInfo={{
          orderId: order._id,
          shopName: selectedShopOrder?.shop?.name,
          customerName: order.user?.name,
        }}
        loading={false}
      />
    </div>
  )
}

export default OrderCard
