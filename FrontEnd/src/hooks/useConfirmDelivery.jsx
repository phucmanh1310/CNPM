import { useState } from 'react'
import axios from 'axios'
import { serverURL } from '../App'

function useConfirmDelivery() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const confirmDelivery = async (orderId, shopOrderId) => {
    try {
      setLoading(true)
      setError(null)

      const { data } = await axios.put(
        `${serverURL}/api/order/confirmDelivery`,
        {
          orderId,
          shopOrderId,
        },
        { withCredentials: true }
      )

      return data
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to confirm delivery'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return { confirmDelivery, loading, error }
}

export default useConfirmDelivery
