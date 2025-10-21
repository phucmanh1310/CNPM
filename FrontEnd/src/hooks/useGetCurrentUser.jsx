// hooks/useGetCurrentUser.jsx
import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverURL } from '../App'
import { setUserData } from '../redux/userSlice'

function useGetCurrentUser() {
  const dispatch = useDispatch()
  const { userData } = useSelector((state) => state.user)

  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data } = await axios.get(`${serverURL}/api/user/current`, {
        withCredentials: true,
      })
      dispatch(setUserData(data.user))
    } catch (error) {
      // Nếu không có token hoặc token expired, clear user data
      dispatch(setUserData(null))
      console.log('No current user session' + { error })
    }
  }, [dispatch])

  useEffect(() => {
    // Chỉ fetch khi userData chưa có (undefined hoặc null)
    if (!userData) {
      fetchCurrentUser()
    }
  }, [userData, fetchCurrentUser])

  return { userData, refetch: fetchCurrentUser }
}

export default useGetCurrentUser
