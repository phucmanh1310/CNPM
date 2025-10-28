// hooks/useGetCurrentUser.jsx
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'

import { setShopsInMyCity } from '../redux/userSlice'

function useGetShopByCity() {
  const dispatch = useDispatch()
  const { currentCity } = useSelector((state) => state.user)
  useEffect(() => {
    if (!currentCity) {
      console.log('No current city set')
      return
    }

    const fetchShops = async () => {
      try {
        console.log('Fetching shops for city:', currentCity)
        const result = await axios.get(`/api/shop/get-by-city/${currentCity}`)
        console.log('Shops API response:', result.data)
        dispatch(setShopsInMyCity(result.data))
      } catch (error) {
        console.log('Error fetching shops:', error)
      }
    }
    fetchShops()
  }, [currentCity, dispatch])
}

export default useGetShopByCity
