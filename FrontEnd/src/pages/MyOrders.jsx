import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import useGetUserOrders from '../hooks/useGetUserOrders'
import useGetOwnerOrders from '../hooks/useGetOwnerOrders'
import useConfirmDelivery from '../hooks/useConfirmDelivery'
import useOrderNotifications from '../hooks/useOrderNotifications'
import OrderCard from '../components/OrderCard'
import Toast from '../components/Toast'
import NotificationToast from '../components/NotificationToast'
import axios from 'axios'
import { serverURL } from '../App'
import { TbReceipt2 } from 'react-icons/tb'
import { IoIosArrowRoundBack } from 'react-icons/io'

function MyOrders() {
  const navigate = useNavigate()
  const { userData } = useSelector((state) => state.user)
  const {
    userOrders,
    loading: userLoading,
    refetch: refetchUserOrders,
  } = useGetUserOrders()
  const {
    ownerOrders,
    loading: ownerLoading,
    refetch: refetchOwnerOrders,
  } = useGetOwnerOrders()
  const { confirmDelivery } = useConfirmDelivery()
  const { notifications, addNotification, removeNotification } =
    useOrderNotifications()
  const [updating, setUpdating] = useState(false)
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  })

  // Reset hasViewedOrders khi component mount (cho owner)
  useEffect(() => {
    if (userData?.role === 'owner') {
      // Có thể dispatch action để reset state trong Nav component
      // Hoặc sử dụng localStorage để track
      localStorage.setItem('hasViewedOrders', 'true')
    }
  }, [userData?.role])

  const handleStatusUpdate = async (orderId, shopOrderId, newStatus) => {
    try {
      setUpdating(true)
      await axios.put(
        `${serverURL}/api/order/updateOrderStatus`,
        {
          orderId,
          shopOrderId,
          status: newStatus,
        },
        { withCredentials: true }
      )

      // Refetch orders after update
      if (userData.role === 'owner') {
        refetchOwnerOrders()
      } else {
        refetchUserOrders()
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      setToast({
        show: true,
        message: 'Update order status to cancelled',
        type: 'error',
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleCancelOrder = async (orderId, shopOrderId, cancelReason) => {
    try {
      setUpdating(true)
      await axios.put(
        `${serverURL}/api/order/cancelOrder`,
        {
          orderId,
          shopOrderId,
          cancelReason,
        },
        { withCredentials: true }
      )

      // Refetch orders after cancel
      if (userData.role === 'owner') {
        refetchOwnerOrders()
      } else {
        refetchUserOrders()
      }

      setToast({
        show: true,
        message: 'The order has been canceled',
        type: 'success',
      })
    } catch (error) {
      console.error('Error cancelling order:', error)
      setToast({
        show: true,
        message: error.response?.data?.message || 'Order cancellation failed',
        type: 'error',
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleConfirmDelivery = async (orderId, shopOrderId) => {
    try {
      setUpdating(true)
      await confirmDelivery(orderId, shopOrderId)

      refetchUserOrders()
      addNotification('Delivery confirmed successfully!', 'success')
    } catch (error) {
      console.error('Error confirming delivery:', error)
      addNotification(error.message || 'Failed to confirm delivery', 'error')
    } finally {
      setUpdating(false)
    }
  }

  const orders = userData.role === 'owner' ? ownerOrders : userOrders
  const loading = userData.role === 'owner' ? ownerLoading : userLoading

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff9f6] pt-[100px] pb-[50px] px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-[#00BFFF] text-lg">Loading orders...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fff9f6] pt-[100px] pb-[50px] px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50"
            onClick={() => navigate('/')}
            title="Back to Home"
          >
            <IoIosArrowRoundBack size={24} className="text-[#00BFFF]" />
          </button>
          <div className="flex items-center gap-3">
            <TbReceipt2 size={32} className="text-[#00BFFF]" />
            <h1 className="text-3xl font-bold text-gray-800">
              {userData.role === 'owner' ? 'Restaurant Orders' : 'My Orders'}
            </h1>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <TbReceipt2 size={64} className="text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              {userData.role === 'owner' ? 'No orders yet' : 'No orders found'}
            </h2>
            <p className="text-gray-500">
              {userData.role === 'owner'
                ? 'Orders from customers will appear here'
                : 'Your order history will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                userRole={userData.role}
                onStatusUpdate={handleStatusUpdate}
                onCancelOrder={handleCancelOrder}
                onConfirmDelivery={handleConfirmDelivery}
              />
            ))}
          </div>
        )}

        {updating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="text-[#00BFFF] text-lg">Updating order...</div>
            </div>
          </div>
        )}

        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
        />

        {/* Notification Toasts */}
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={removeNotification}
          />
        ))}
      </div>
    </div>
  )
}

export default MyOrders
