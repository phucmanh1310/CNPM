import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import {
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
} from '../redux/userSlice.js'
import { setLocation } from '../redux/mapSlice.js'

function useGetCity() {
  const dispatch = useDispatch()
  const apiKey = import.meta.env.VITE_GEOAPIKEY

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude
          dispatch(setLocation({ lat: latitude, lon: longitude }))
          const { data } = await axios.get(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`,
            { withCredentials: false } // Override global default for this external API call
          )

          if (data?.results?.length) {
            const loc = data.results[0]
            const city = loc.city || loc.town || loc.county || '' //thành phố
            const state = loc.ward || loc.region || '' //phường
            const currentAddress = loc.formatted || '' // địa chỉ
            dispatch(setCurrentCity(city))
            dispatch(setCurrentState(state))
            dispatch(setCurrentAddress(currentAddress))
          }
          // Nếu không có results thì không dispatch gì
        } catch (err) {
          console.error('Error fetching location:', err)
          // Không dispatch fallback
        }
      },
      (err) => {
        console.error('Error getting position:', err)
        // Không dispatch fallback
      }
    )
  }, [dispatch, apiKey])
}

export default useGetCity
