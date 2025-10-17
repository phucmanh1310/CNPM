import React from 'react'

function CategoryCard({ name, image, onImageLoad }) {
    return (
        <div className='relative w-40 sm:w-48 md:w-56 lg:w-64 h-32 md:h-44 rounded-2xl border-2 border-[#00BFFF] shrink-0 overflow-hidden bg-white shadow-xl shadow-gray-200 hover:shadow-lg transition-shadow'>
            <img src={image} alt={name} onLoad={onImageLoad} className='w-full h-full object-cover transform hover:scale-110 transition-transform duration-300' />
            <div className='absolute bottom-0 w-full left-0 bg-[#ffffff96] bg-opacity-95 px-3 py-1 rounded-t-xl text-center shadow text-sm font-medium text-gray-800 backdrop-blur'>
                <h3 className='text-sm font-medium text-gray-800 text-center leading-tight line-clamp-2'>{name}</h3>

            </div>
        </div>
    )
}

export default CategoryCard