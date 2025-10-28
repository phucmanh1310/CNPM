import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { FaUtensils } from 'react-icons/fa'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'

import useGetMyShop from '../hooks/useGetMyShop'

export default function EditItem() {
  const { itemId } = useParams()
  const navigate = useNavigate()
  const { refetch } = useGetMyShop()

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [foodType, setFoodType] = useState('veg')
  const [frontendImage, setFrontendImage] = useState(null)
  const [backendImage, setBackendImage] = useState(null)

  const categories = ['Snack', 'Main course', 'Dessert', 'Others']

  // load item once
  useEffect(() => {
    axios
      .get(`/api/item/${itemId}`)
      .then((res) => {
        const item = res.data
        setName(item.name)
        setPrice(item.price)
        setCategory(item.category)
        setFoodType(item.foodType)
        setFrontendImage(item.image)
      })
      .catch((err) => {
        console.error('Failed to fetch item:', err)
        alert('Failed to load item details')
        navigate('/')
      })
  }, [itemId, navigate])

  const handleImage = (e) => {
    const file = e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const form = new FormData()
      form.append('name', name)
      form.append('price', price)
      form.append('category', category)
      form.append('foodType', foodType)
      if (backendImage) form.append('image', backendImage)

      await axios.put(`/api/item/edit-item/${itemId}`, form)

      await refetch()
      navigate('/')
    } catch (err) {
      console.error('Edit item failed', err)
      alert(err.response?.data?.message || 'Error editing item')
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
          <h2 className="text-2xl font-bold">Edit Food Item</h2>
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
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00BFFF]"
            />
          </div>

          {/* Category & Food Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00BFFF]"
              >
                {categories.map((cate) => (
                  <option key={cate} value={cate}>
                    {cate}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Food Type
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
            Update
          </button>
        </form>
      </div>
    </div>
  )
}
