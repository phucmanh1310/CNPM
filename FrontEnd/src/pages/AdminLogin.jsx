import React from 'react'
import { useState } from 'react'
import { FaRegEye } from 'react-icons/fa'
import { FaRegEyeSlash } from 'react-icons/fa'
import { FaShieldAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

import { ClipLoader } from 'react-spinners'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function AdminLogin() {
  // Distinct admin theming
  const primaryColor = '#7C3AED' // purple for admin
  const bgcolor = '#f8fafc' // slate-50
  const borderColor = '#ddd'
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const handleAdminLogin = async () => {
    setLoading(true)
    try {
      const result = await axios.post(
        `/api/auth/signin`,
        { email, password },
        { withCredentials: true }
      )

      // Kiểm tra nếu user có role admin
      if (result.data.user.role !== 'admin') {
        // Clear any non-admin session cookie to avoid logging in as user here
        try {
          await axios.get(`/api/auth/signout`, { withCredentials: true })
        } catch {
          // ignore signout cleanup errors
        }
        setErr('Access denied. Admin privileges required.')
        setLoading(false)
        return
      }

      // Dispatch dữ liệu user vào Redux
      dispatch(setUserData(result.data.user))

      console.log('Admin login success:', result.data)
      setErr('')
      setLoading(false)

      // Navigate đến admin dashboard
      navigate('/admin', { replace: true })
    } catch (error) {
      setErr(
        error?.response?.data?.message || 'Login failed. Please try again.'
      )
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: bgcolor }}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <div className="flex items-center gap-2 mb-2">
          <FaShieldAlt size={26} color={primaryColor} />
          <h1 className="text-3xl font-bold" style={{ color: primaryColor }}>
            Admin Portal
          </h1>
        </div>
        <p className="text-grey-600 mb-8">
          Sign in to access the admin dashboard and manage the system.
        </p>

        {/* email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1"
          >
            Email
          </label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            placeholder="Enter admin email"
            style={{ border: `1px solid ${borderColor}` }}
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            required
          />
        </div>

        {/* password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
              placeholder="Enter admin password"
              style={{ border: `1px solid ${borderColor}` }}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />

            <button
              className="absolute right-3 cursor-pointer top-3.5 text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>

        <button
          className="w-full font-semibold py-2 rounded-lg transition duration-200 bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
          onClick={handleAdminLogin}
          disabled={loading}
        >
          {loading ? <ClipLoader color="white" size={20} /> : 'ADMIN LOGIN'}
        </button>

        {err && <p className="text-red-500 text-center my-2.5">{err}</p>}
      </div>
    </div>
  )
}

export default AdminLogin
