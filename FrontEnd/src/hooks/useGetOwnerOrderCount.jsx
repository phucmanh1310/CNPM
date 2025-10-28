import { useState, useEffect } from 'react'
import axios from 'axios'

function useGetOwnerOrderCount() {
  const [orderCount, setOrderCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOrderCount = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`/api/order/getOwnerOrders`)

      // Đếm số lượng đơn hàng có status pending
      const pendingCount = data.reduce((count, order) => {
        return (
          count +
          order.shopOrder.filter((shopOrder) => shopOrder.status === 'pending')
            .length
        )
      }, 0)

      setOrderCount(pendingCount)
      setError(null)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch order count')
      console.log('Error fetching order count:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderCount()
  }, [])

  return { orderCount, loading, error, refetch: fetchOrderCount }
}

export default useGetOwnerOrderCount
