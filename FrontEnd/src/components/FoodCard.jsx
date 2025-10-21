import React, { useState } from 'react'
import { FaLeaf, FaDrumstickBite, FaStar, FaShoppingCart } from 'react-icons/fa'
import { FaMinus, FaPlus, FaRegStar } from 'react-icons/fa6'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../redux/userSlice'

function FoodCard({ data, layout = 'grid' }) {
  const [quantity, setQuantity] = useState(0)
  const dispatch = useDispatch()
  const { cartItems } = useSelector((state) => state.user)
  const isGrid = layout === 'grid'
  const renderStars = (rating) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <FaStar key={i} className="text-yellow-500 text-sm" />
        ) : (
          <FaRegStar key={i} className="text-yellow-500 text-sm" />
        )
      )
    }
    return stars
  }

  const handleIncrease = () => setQuantity((prev) => prev + 1)
  const handleDecrease = () => setQuantity((prev) => (prev > 0 ? prev - 1 : 0))

  if (isGrid) {
    return (
      <div
        className="w-[230px] rounded-2xl border border-[#00BFFF] bg-white shadow-md 
            hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
      >
        {/* Image */}
        <div className="relative w-full h-[160px]">
          <img
            src={data.image}
            alt={data.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
            {data.foodType === 'veg' ? (
              <FaLeaf className="text-green-600 text-lg" />
            ) : (
              <FaDrumstickBite className="text-orange-700 text-lg" />
            )}
          </div>
        </div>

        {/* Name & Rating */}
        <div className="flex-1 flex flex-col p-3">
          <h1 className="font-semibold text-gray-800 text-sm truncate">
            {data.name}
          </h1>

          <div className="flex items-center gap-1 mt-1">
            {renderStars(data.rating?.average || 0)}
            <span className="text-xs text-gray-500">
              ({data.rating?.count || 0})
            </span>
          </div>
        </div>

        {/* Price & Controls */}
        <div className="flex items-center justify-between mt-auto p-3 pt-0 gap-2">
          <span className="font-bold text-gray-900 text-sm flex-1 truncate">
            ₫{data.price?.toLocaleString('vi-VN')}
          </span>
          <div className="flex items-center border rounded-full overflow-hidden shadow-sm flex-shrink-0">
            <button
              className="px-2 py-1 hover:bg-gray-100 transition"
              onClick={handleDecrease}
            >
              <FaMinus size={12} />
            </button>
            <span className="px-2 text-sm font-semibold">{quantity}</span>
            <button
              className="px-2 py-1 hover:bg-gray-100 transition"
              onClick={handleIncrease}
            >
              <FaPlus size={12} />
            </button>
            <button
              className={`${
                cartItems.some((i) => i.id === data._id)
                  ? 'bg-gray-800'
                  : 'bg-[#00BFFF]'
              } text-white px-3 py-2 transition-colors hover:bg-[#0090cc]`}
              onClick={() => {
                quantity > 0
                  ? dispatch(
                      addToCart({
                        id: data._id,
                        name: data.name,
                        image: data.image,
                        price: data.price,
                        quantity,
                        foodType: data.foodType,
                        shop: data.shop,
                      })
                    )
                  : null
              }}
            >
              <FaShoppingCart />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // List view
  return (
    <div className="w-full bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 flex items-center p-4">
      {/* Image */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover rounded-lg"
        />
        <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md">
          {data.foodType === 'veg' ? (
            <FaLeaf className="text-green-600 text-sm" />
          ) : (
            <FaDrumstickBite className="text-orange-700 text-sm" />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 ml-4 min-w-0">
        <h1 className="font-semibold text-gray-800 text-lg mb-1 truncate">
          {data.name}
        </h1>
        <div className="flex items-center gap-1 mb-2">
          {renderStars(data.rating?.average || 0)}
          <span className="text-sm text-gray-500">
            ({data.rating?.count || 0})
          </span>
        </div>
        <span className="font-bold text-gray-900 text-lg block truncate">
          ₫{data.price?.toLocaleString('vi-VN')}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center border rounded-full overflow-hidden shadow-sm">
        <button
          className="px-3 py-2 hover:bg-gray-100 transition"
          onClick={handleDecrease}
        >
          <FaMinus size={14} />
        </button>
        <span className="px-3 text-sm font-semibold">{quantity}</span>
        <button
          className="px-3 py-2 hover:bg-gray-100 transition"
          onClick={handleIncrease}
        >
          <FaPlus size={14} />
        </button>
        <button
          className={`${
            cartItems.some((i) => i.id === data._id)
              ? 'bg-gray-800'
              : 'bg-[#00BFFF]'
          } text-white px-4 py-2 transition-colors hover:bg-[#0090cc]`}
          onClick={() => {
            quantity > 0
              ? dispatch(
                  addToCart({
                    id: data._id,
                    name: data.name,
                    image: data.image,
                    price: data.price,
                    quantity,
                    foodType: data.foodType,
                    shop: data.shop,
                  })
                )
              : null
          }}
        >
          <FaShoppingCart />
        </button>
      </div>
    </div>
  )
}

export default FoodCard
