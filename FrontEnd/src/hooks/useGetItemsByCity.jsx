// hooks/useGetItemsByCity.jsx
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'

import { setItemsInMyCity } from '../redux/userSlice'

function useGetItemsByCity() {
  // ← sửa tên function
  const dispatch = useDispatch()
  const { currentCity } = useSelector((state) => state.user)

  useEffect(() => {
    if (!currentCity) return // ← thêm check

    const fetchItems = async () => {
      try {
        const result = await axios.get(`/api/item/get-by-city/${currentCity}`)
        dispatch(setItemsInMyCity(result.data))
        console.log('Items:', result.data)
      } catch (error) {
        console.log('No items found: ' + error)
      }
    }
    fetchItems()
  }, [currentCity, dispatch])
}

export default useGetItemsByCity
