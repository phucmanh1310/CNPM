// src/pages/CartPage.jsx
import React, { useState } from 'react' // ← THÊM useState
import { useSelector, useDispatch } from 'react-redux'
import { clearCart } from '../redux/userSlice'
import { useNavigate } from 'react-router-dom'
import { IoIosArrowRoundBack } from 'react-icons/io'
import CartItemCard from '../components/CartItemCard'
import ConfirmModal from '../components/ConfirmModal'
import Toast from '../components/Toast'

function CartPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { cartItems } = useSelector((state) => state.user)

  // ← THÊM state cho modal và toast
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
  })

  const getTotalAmount = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
  }

  const handleClearCart = () => {
    dispatch(clearCart())
    setShowClearConfirm(false)
    showToast('Cart cleared successfully!', 'info')
  }

  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center p-6">
      <div className="w-full max-w-[800px]">
        {/* Header */}
        <div className="flex items-center gap-[20px] mb-6">
          <div className="z-[10] cursor-pointer" onClick={() => navigate('/')}>
            <IoIosArrowRoundBack size={35} className="text-[#00BFFF]" />
          </div>
          <h1 className="text-2xl font-bold text-start">Your Cart</h1>
        </div>

        {/* Cart Content */}
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-[#00BFFF] text-white rounded-lg hover:bg-[#0090cc]"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div>
            {/* Cart Items */}
            <div className="mb-6">
              {cartItems.map((item, index) => (
                <CartItemCard data={item} key={index} />
              ))}
            </div>

            {/* Total Amount Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Total Amount
                </h2>
                <span className="text-2xl font-bold text-[#00BFFF]">
                  ₫{getTotalAmount()?.toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Clear Cart
              </button>
              <button
                className="flex-1 px-6 py-3 bg-[#00BFFF] text-white rounded-lg hover:bg-[#0090cc] transition-colors font-medium"
                onClick={() => navigate('/checkout')}
              >
                Proceed to CheckOut
              </button>
            </div>
          </div>
        )}

        {/* ← THÊM Modal và Toast ở đây (sau content, trước </div> cuối) */}
        <ConfirmModal
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          onConfirm={handleClearCart}
          title="Clear Cart"
          message="Are you sure you want to remove all items from your cart? This action cannot be undone."
          confirmText="Yes, Clear All"
          cancelText="Cancel"
          type="warning"
        />

        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
          duration={2500}
        />
      </div>
    </div>
  )
}

export default CartPage
