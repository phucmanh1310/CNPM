import React, { useState } from 'react'
import { RxCross2 } from 'react-icons/rx'
import { FaExclamationTriangle } from 'react-icons/fa'

function CancelOrderModal({ isOpen, onClose, onConfirm, orderInfo, loading }) {
  const [cancelReason, setCancelReason] = useState('')
  const [selectedReason, setSelectedReason] = useState('')

  const predefinedReasons = [
    'The dish has been sold out',
    'Not enough ingredients to prepare',
    'Technical issue',
    'Others',
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!cancelReason.trim()) {
      alert('Please enter the reason for canceling the order')
      return
    }
    onConfirm(cancelReason.trim())
  }

  const handleReasonSelect = (reason) => {
    setSelectedReason(reason)
    if (reason === 'Others') {
      setCancelReason('')
    } else {
      setCancelReason(reason)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <FaExclamationTriangle className="text-red-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">
              Cancel order
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <RxCross2 size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Order:</p>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-gray-800">
                #{orderInfo?.orderId?.slice(-8)}
              </p>
              <p className="text-sm text-gray-600">{orderInfo?.shopName}</p>
              <p className="text-sm text-gray-600">{orderInfo?.customerName}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for order cancellation *
              </label>

              <div className="space-y-2 mb-3">
                {predefinedReasons.map((reason) => (
                  <label key={reason} className="flex items-center">
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => handleReasonSelect(reason)}
                      className="mr-2"
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>

              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter the reason for canceling the order..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                rows={3}
                disabled={loading}
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Canceling...' : 'Cancel confirmation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CancelOrderModal
