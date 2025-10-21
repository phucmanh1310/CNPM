// src/components/OwnerItemCard.jsx
import React from 'react'
import { FaRegEdit, FaTrash } from 'react-icons/fa'
import { Navigate, useNavigate } from 'react-router-dom'
export default function OwnerItemCard({
  item,
  layout = 'grid',
  onDelete, // ← thêm prop onDelete
}) {
  //Grid or List
  const isGrid = layout === 'grid'
  //navigate
  const navigate = useNavigate()

  return (
    <div
      className={`relative ${
        isGrid
          ? 'bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300'
          : 'bg-white rounded-lg shadow-md flex items-center border border-gray-200 hover:shadow-lg transition-all duration-300 p-4 mb-4'
      }`}
    >
      <img
        src={item.image}
        alt={item.name}
        className={
          isGrid
            ? 'w-full h-48 object-cover'
            : 'w-24 h-24 object-cover rounded-lg mr-4'
        }
      />
      <div className={isGrid ? 'p-4' : 'flex-1'}>
        <h2 className="text-lg font-semibold text-[#ff4d2d]">{item.name}</h2>
        <p>
          <span className="text-gray-70 font-medium text-sm">Category: </span>{' '}
          {item.category}
        </p>
        <p>
          <span className="text-gray-70 font-medium text-sm">Food Type: </span>
          {item.foodType}
        </p>
        <p className="text-orange-500 font-bold text-lg mt-1">
          ₫{item.price?.toLocaleString('vi-VN')}
        </p>
      </div>

      {/* Nút Edit/Delete */}
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={() => navigate(`/edit-item/${item._id}`)}
          className="bg-blue-100 text-blue-600 hover:bg-blue-200 p-2 rounded-full transition-colors duration-200"
          aria-label="Edit item"
        >
          <FaRegEdit size={16} />
        </button>
        <button
          onClick={() => {
            if (window.confirm('Delete this item?')) {
              onDelete(item) // ← gọi onDelete khi người dùng xác nhận
            }
          }}
          className="bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-full transition-colors duration-200"
          aria-label="Delete item"
        >
          <FaTrash size={16} />
        </button>
      </div>
    </div>
  )
}
