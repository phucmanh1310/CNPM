import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true, // Always send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
})

export default axiosInstance
