import { useState, useEffect } from 'react'
import axios from 'axios'

function useGetOwnerOrders() {
  const [ownerOrders, setOwnerOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchOwnerOrders = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`/api/order/getOwnerOrders`)
      setOwnerOrders(data)
      setError(null)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch owner orders')
      console.log('Error fetching owner orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOwnerOrders()
  }, [])

  return { ownerOrders, loading, error, refetch: fetchOwnerOrders }
}

export default useGetOwnerOrders
