import React from 'react'
import { useNavigate } from 'react-router-dom'
import { FaMapMarkerAlt, FaStar, FaRegStar, FaClock } from 'react-icons/fa'

function ShopCard({ shop }) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/shop/${shop._id}`)
  }

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

  return (
    <div
      className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden min-w-[280px]"
      onClick={handleClick}
    >
      {/* Shop Image */}
      <div className="relative w-full h-48">
        <img
          src={shop.image}
          alt={shop.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 shadow-md">
          <div className="flex items-center gap-1">
            {renderStars(shop.rating?.average || 4.2)}
            <span className="text-xs text-gray-600 ml-1">
              ({shop.rating?.count || 0})
            </span>
          </div>
        </div>
      </div>

      {/* Shop Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-lg mb-2 truncate">
          {shop.name}
        </h3>

        <div className="flex items-center text-gray-600 text-sm mb-2">
          <FaMapMarkerAlt className="text-red-500 mr-2" />
          <span className="truncate">{shop.address}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-600 text-sm">
            <FaClock className="text-blue-500 mr-2" />
            <span>30-45 min</span>
          </div>

          <div className="text-sm text-gray-600">
            {shop.item?.length || 0} items
          </div>
        </div>

        {/* Delivery Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-600 font-medium">Free delivery</span>
            <span className="text-gray-500">Min ₫200,000</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopCard
