import React from 'react'
import { useState } from 'react'
import { FaRegEye } from 'react-icons/fa'
import { FaRegEyeSlash } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { useNavigate } from 'react-router-dom'
import { serverURL } from '../config/api' // Import từ App.js
import { ClipLoader } from 'react-spinners'
// import authRouter from "./routes/auth.routes.js";
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function SignUp() {
  const primaryColor = '#00BFFF'
  //   const hoverColor = "#e64323";
  const bgcolor = '#fff9f6'
  const borderColor = '#ddd'
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('user')
  const navigate = useNavigate()
  const [fullName, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [showPasswordRules, setShowPasswordRules] = useState(false)
  const [showMobileRules, setShowMobileRules] = useState(false)
  const dispatch = useDispatch()

  // Validation function
  const validateForm = () => {
    const errors = {}

    if (!fullName.trim()) {
      errors.fullName = 'Full name is required'
    }

    if (!email.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Invalid email format'
    }

    if (!mobile.trim()) {
      errors.mobile = 'Mobile number is required'
    } else if (mobile.length < 10) {
      errors.mobile = 'Mobile number must be at least 10 digits'
    }

    if (!password) {
      errors.password = 'Password is required'
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSignUp = async () => {
    // Validate form before submitting
    if (!validateForm()) {
      return
    }
    setLoading(true)
    try {
      const result = await axios.post(
        `${serverURL}/api/auth/signup`,
        {
          fullName,
          email,
          password,
          mobile,
          role,
        },
        { withCredentials: true }
      )
      setErr('')
      dispatch(setUserData(result.data))
      setLoading(false)
    } catch (error) {
      console.log('SignUp Error:', error)
      console.log('Error Response:', error?.response?.data)
      setErr(
        error?.response?.data?.message || 'Signup failed. Please try again.'
      )
      setLoading(false)
    }
  }

  // Validation Rules Component
  const PasswordRules = () => (
    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="text-sm font-semibold text-blue-800 mb-2">
        Password Requirements:
      </h4>
      <ul className="text-xs text-blue-700 space-y-1">
        <li>• At least 6 characters</li>
        <li>• Should include uppercase and lowercase letters</li>
        <li>• Should include numbers and special characters</li>
      </ul>
    </div>
  )

  const MobileRules = () => (
    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
      <h4 className="text-sm font-semibold text-green-800 mb-2">
        Mobile Number Requirements:
      </h4>
      <ul className="text-xs text-green-700 space-y-1">
        <li>• At least 10 digits</li>
        <li>• Numbers only (0-9)</li>
        <li>• Example: 0123456789</li>
      </ul>
    </div>
  )

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4"
      style={{ backgroundColor: bgcolor }}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border-[1px]"
        style={{ border: `1px solid ${borderColor}` }}
      >
        <h1 className="text-3xl font-bold mb-2" style={{ color: primaryColor }}>
          Snake
        </h1>
        <p className="text-grey-600 mb-8">
          Create your account to get started with delicious food deliveries.
        </p>

        {/* fullname */}
        <div className="mb-4">
          <label
            htmlFor="fullname"
            className="block text-gray-700 font-medium mb-1"
          >
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 ${
              validationErrors.fullName ? 'border-red-500' : ''
            }`}
            placeholder="Enter your full name"
            style={{ border: '1px solid ${borderColor}' }}
            onChange={(e) => {
              setFullname(e.target.value)
              if (validationErrors.fullName) {
                setValidationErrors((prev) => ({ ...prev, fullName: '' }))
              }
            }}
            value={fullName}
            required
          />
          {validationErrors.fullName && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.fullName}
            </p>
          )}
        </div>
        {/* email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1"
          >
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 ${
              validationErrors.email ? 'border-red-500' : ''
            }`}
            placeholder="Enter your email"
            style={{ border: '1px solid ${borderColor}' }}
            onChange={(e) => {
              setEmail(e.target.value)
              if (validationErrors.email) {
                setValidationErrors((prev) => ({ ...prev, email: '' }))
              }
            }}
            value={email}
            required
          />
          {validationErrors.email && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.email}
            </p>
          )}
        </div>
        {/* mobile */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="mobile" className="block text-gray-700 font-medium">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowMobileRules(!showMobileRules)}
              className="text-blue-600 text-sm hover:underline"
            >
              Rules
            </button>
          </div>
          <input
            type="tel"
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 ${
              validationErrors.mobile ? 'border-red-500' : ''
            }`}
            placeholder="Enter mobile number (0123456789)"
            style={{ border: '1px solid ${borderColor}' }}
            onChange={(e) => {
              setMobile(e.target.value)
              if (validationErrors.mobile) {
                setValidationErrors((prev) => ({ ...prev, mobile: '' }))
              }
            }}
            value={mobile}
            required
          />
          {validationErrors.mobile && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.mobile}
            </p>
          )}
          {showMobileRules && <MobileRules />}
        </div>
        {/* password */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="password"
              className="block text-gray-700 font-medium"
            >
              Password <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowPasswordRules(!showPasswordRules)}
              className="text-blue-600 text-sm hover:underline"
            >
              Rules
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500 ${
                validationErrors.password ? 'border-red-500' : ''
              }`}
              placeholder="Enter password (min 6 characters)"
              style={{ border: '1px solid ${borderColor}' }}
              onChange={(e) => {
                setPassword(e.target.value)
                if (validationErrors.password) {
                  setValidationErrors((prev) => ({ ...prev, password: '' }))
                }
              }}
              value={password}
              required
            />

            <button
              className="absolute right-3 cursor-pointer top-[14px] text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
          {validationErrors.password && (
            <p className="text-red-500 text-sm mt-1">
              {validationErrors.password}
            </p>
          )}
          {showPasswordRules && <PasswordRules />}
        </div>
        {/* role */}
        <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-gray-700 font-medium mb-1"
          >
            Role <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {[
              { value: 'user', label: 'Customer' },
              { value: 'owner', label: 'Owner' },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer"
                onClick={() => setRole(r.value)}
                style={
                  role === r.value
                    ? { backgroundColor: primaryColor, color: 'white' }
                    : { border: '1px solid ${primaryColor}', color: '#00BFFF' }
                }
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
        <button
          className={
            'w-full font-semibold py-2 rounded-lg transition duration-200 bg-[#00BFFF] text-white hover:bg-[#00BFFF] cursor-pointer'
          }
          onClick={handleSignUp}
          disabled={loading}
        >
          {loading ? <ClipLoader color="white" size={20} /> : 'Sign Up'}
        </button>
        {err && <p className="text-red-500 text-center my-[10px]">{err}</p>}
        <p
          className="text-center mt-2 cursor-pointer"
          onClick={() => navigate('/signin')}
        >
          Already have an account?{' '}
          <span className="text-[#00BFFF]"> Sign In</span>{' '}
        </p>
      </div>
    </div>
  )
}

export default SignUp
