import React, { useEffect, useState, useMemo } from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { FaUtensils } from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverURL } from '../App'
import useGetMyShop from '../hooks/useGetMyShop'

export default function AddItem() {
  const navigate = useNavigate()
  const _dispatch = useDispatch()
  const { refetch } = useGetMyShop()

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [foodType, setFoodType] = useState('veg')
  const [frontendImage, setFrontendImage] = useState(null)
  const [backendImage, setBackendImage] = useState(null)

  // static categories list
  const categories = useMemo(() => ['Snack', 'Main course', 'Dessert', 'Others'], [])

  // When shop data arrives, pick a default category
  useEffect(() => {
    if (categories.length) setCategory(categories[0])
  }, [categories])

  const handleImage = (e) => {
    const file = e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // POST to add-item endpoint
      const form = new FormData()
      form.append('name', name)
      form.append('price', price)
      form.append('category', category)
      form.append('foodType', foodType)
      if (backendImage) form.append('image', backendImage)

      await axios.post(`${serverURL}/api/item/add-item`, form, {
        withCredentials: true,
      })

      // Refetch shop (server populates item array)
      await refetch()

      // Update Redux manually if needed (optional)
      // dispatch(setMyShopData({ ...myShopData, item: [...myShopData.item, newItem] }));

      // Navigate back to owner dashboard
      navigate('/', { replace: true })
    } catch (err) {
      console.error('Add item failed', err)
      alert(err.response?.data?.message || 'Error adding item')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-[#fff9f6]">
      <button
        className="self-start mb-4 text-[#00BFFF]"
        onClick={() => navigate('/')}
      >
        <IoIosArrowRoundBack size={32} />
      </button>

      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <FaUtensils className="text-[#00BFFF] w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold">Add Food Item</h2>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00BFFF]"
              placeholder="Enter Food Item Name"
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              required
              className="w-full px-4 py-2 
                        border rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {frontendImage && (
              <img
                src={frontendImage}
                alt=""
                className="mt-2 w-full h-40 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Price (₫)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              min="0"
              placeholder="0"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00BFFF]"
            />
          </div>

          {/* Category & Food Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00BFFF]"
              >
                <option value=""> Select Category </option>
                {categories.map((cate, index) => (
                  <option key={index} value={cate}>
                    {cate}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Food Type
              </label>
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00BFFF]"
              >
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-[#00BFFF] text-white py-2 rounded-lg font-medium hover:bg-blue-600 transition"
          >
            Save
          </button>
        </form>
      </div>
    </div>
  )
}
