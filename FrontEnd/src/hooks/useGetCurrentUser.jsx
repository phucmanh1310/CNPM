// hooks/useGetCurrentUser.jsx
import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'

import { setUserData } from '../redux/userSlice'

function useGetCurrentUser() {
  const dispatch = useDispatch()
  const { userData } = useSelector((state) => state.user)

  const fetchCurrentUser = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/user/current`, {
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
    // Only fetch when userData is undefined (not yet checked)
    // Don't fetch when userData is null (already checked, no user logged in)
    if (userData === undefined) {
      fetchCurrentUser()
    }
  }, [userData, fetchCurrentUser])

  return { userData, refetch: fetchCurrentUser }
}

export default useGetCurrentUser
