// src/components/CartItemCard.jsx
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { removeFromCart, updateCartItemQuantity } from '../redux/userSlice'
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa'
import ConfirmModal from './ConfirmModal'
import Toast from './Toast'

function CartItemCard({ data }) {
  const dispatch = useDispatch()
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [showQuantityConfirm, setShowQuantityConfirm] = useState(false)
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
  }

  const handleQuantityDecrease = () => {
    if (data.quantity === 1) {
      setShowQuantityConfirm(true)
    } else {
      dispatch(
        updateCartItemQuantity({ id: data.id, quantity: data.quantity - 1 })
      )
      showToast('Quantity updated successfully!', 'info')
    }
  }

  const handleQuantityIncrease = () => {
    dispatch(
      updateCartItemQuantity({ id: data.id, quantity: data.quantity + 1 })
    )
    showToast('Quantity updated successfully!', 'info')
  }

  const handleRemoveConfirm = () => {
    dispatch(removeFromCart(data.id))
    setShowRemoveConfirm(false)
    showToast(`${data.name} removed from cart!`, 'error')
  }

  const handleQuantityConfirm = () => {
    dispatch(removeFromCart(data.id))
    setShowQuantityConfirm(false)
    showToast(`${data.name} removed from cart!`, 'warning')
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          {/* Left side - Product info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={data.image}
                alt={data.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col">
              <h1 className="font-bold text-gray-900 text-base mb-1">
                {data.name}
              </h1>
              <p className="text-sm text-gray-600 mb-2">
                <span className="text-gray-700 font-semibold">Price: </span> ₫
                {data.price?.toLocaleString('vi-VN')}
                <br />
                <span className="text-gray-700 font-semibold">
                  Quantity:{' '}
                </span>{' '}
                {data.quantity}
              </p>
              <p className="font-bold text-lg text-gray-900">
                ₫{(data.price * data.quantity)?.toLocaleString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Right side - Quantity controls and remove */}
          <div className="flex items-center gap-3">
            {/* Quantity controls */}
            <div className="flex items-center border border-gray-300 rounded-full">
              <button
                onClick={handleQuantityDecrease}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-full transition-colors"
              >
                <FaMinus size={12} />
              </button>

              <span className="w-10 h-8 flex items-center justify-center font-semibold text-gray-800 border-x border-gray-300">
                {data.quantity}
              </span>

              <button
                onClick={handleQuantityIncrease}
                className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-full transition-colors"
              >
                <FaPlus size={12} />
              </button>
            </div>

            {/* Remove button */}
            <button
              onClick={() => setShowRemoveConfirm(true)}
              className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <FaTrash size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      <ConfirmModal
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={handleRemoveConfirm}
        title="Remove Item"
        message={`Are you sure you want to remove "${data.name}" from your cart?`}
        confirmText="Remove"
        cancelText="Keep"
        type="danger"
      />

      {/* Quantity Warning Modal */}
      <ConfirmModal
        isOpen={showQuantityConfirm}
        onClose={() => setShowQuantityConfirm(false)}
        onConfirm={handleQuantityConfirm}
        title="Remove Item"
        message={`Reducing quantity to 0 will remove "${data.name}" from your cart. Do you want to continue?`}
        confirmText="Yes, Remove"
        cancelText="Cancel"
        type="warning"
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        duration={2500}
      />
    </>
  )
}

export default CartItemCard
