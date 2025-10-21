import { useState, useEffect } from 'react'
import axios from 'axios'
import { serverURL } from '../App'

function useGetUserOrders() {
  const [userOrders, setUserOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUserOrders = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get(`${serverURL}/api/order/getUserOrders`, {
        withCredentials: true,
      })
      setUserOrders(data)
      setError(null)
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch user orders')
      console.log('Error fetching user orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserOrders()
  }, [])

  return { userOrders, loading, error, refetch: fetchUserOrders }
}

export default useGetUserOrders
