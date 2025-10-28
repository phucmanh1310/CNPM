// hooks/userGetMyShop.jsx
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useCallback } from 'react'
import axios from 'axios'

import { setMyShopData } from '../redux/ownerSlice'

function useGetMyShop() {
  const dispatch = useDispatch()
  const { userData } = useSelector((s) => s.user)
  const { myShopData } = useSelector((s) => s.owner)

  const fetchShop = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/shop/get-my`)
      // console.log('fetchShop data:', data);
      // Backend có thể trả về { shop } hoặc trả trực tiếp shop object
      dispatch(setMyShopData(data?.shop ?? data))
    } catch (err) {
      if (err.response?.status === 404) dispatch(setMyShopData(null))
      console.error('Fetch shop error:', err)
    }
  }, [dispatch])

  useEffect(() => {
    if (userData?.role === 'owner') fetchShop()
    // console.log("Trigger fetchShop for owner:", userData);
  }, [userData, fetchShop])

  return { myShopData, refetch: fetchShop }
}

export default useGetMyShop
