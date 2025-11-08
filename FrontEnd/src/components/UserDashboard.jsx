import React, { useRef, useState, useEffect } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import { FaCircleChevronLeft, FaCircleChevronRight } from 'react-icons/fa6'
import { FaSearch, FaFilter, FaThLarge, FaBars } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import FoodCard from './FoodCard'
import ShopCard from './ShopCard'

function UserDashboard() {
  const { currentCity, shopsInMyCity, itemsInMyCity } = useSelector(
    (state) => state.user
  )

  const cateScrollRef = useRef()
  const shopScrollRef = useRef()

  const [showLeftCateButton, setShowLeftCateButton] = useState(false)
  const [showRightCateButton, setShowRightCateButton] = useState(false)
  const [showLeftShopButton, setShowLeftShopButton] = useState(false)
  const [showRightShopButton, setShowRightShopButton] = useState(false)

  // New state for view mode, search, and filters
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [filteredItems, setFilteredItems] = useState([])
  const [sortBy, setSortBy] = useState('name') // 'name', 'price', 'rating'
  const [sortOrder, setSortOrder] = useState('asc') // 'asc', 'desc'

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current
    if (element) {
      setLeftButton(element.scrollLeft > 0)
      setRightButton(
        element.scrollLeft + element.clientWidth < element.scrollWidth
      )
    }
  }

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({
        left: direction === 'left' ? -250 : 250,
        behavior: 'smooth',
      })
    }
  }

  useEffect(() => {
    const updateAllButtons = () => {
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      // updateButton(itemScrollRef, setShowLeftItemButton, setShowRightItemButton);
    }

    updateAllButtons()

    const cateElement = cateScrollRef.current
    const shopElement = shopScrollRef.current
    // const itemElement = itemScrollRef.current;

    const handleCateScroll = () =>
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
    const handleShopScroll = () =>
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
    // const handleItemScroll = () =>
    //     updateButton(itemScrollRef, setShowLeftItemButton, setShowRightItemButton);

    cateElement?.addEventListener('scroll', handleCateScroll)
    shopElement?.addEventListener('scroll', handleShopScroll)
    // itemElement?.addEventListener("scroll", handleItemScroll);

    window.addEventListener('resize', updateAllButtons)

    // update lại khi ảnh load xong
    const timeout = setTimeout(updateAllButtons, 200)

    return () => {
      cateElement?.removeEventListener('scroll', handleCateScroll)
      shopElement?.removeEventListener('scroll', handleShopScroll)
      // itemElement?.removeEventListener("scroll", handleItemScroll);
      window.removeEventListener('resize', updateAllButtons)
      clearTimeout(timeout)
    }
  }, [])

  // helper truyền callback khi ảnh load xong
  const handleImageLoad = () => {
    updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
    updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
  }

  // Filter, search, and sort logic
  useEffect(() => {
    if (!itemsInMyCity) return

    let filtered = itemsInMyCity.filter((item) => {
      // Search by name
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      // Filter by category
      const matchesCategory =
        !selectedCategory || item.category === selectedCategory

      // Filter by price range
      const price = parseFloat(item.price)
      const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0
      const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity
      const matchesPrice = price >= minPrice && price <= maxPrice

      return matchesSearch && matchesCategory && matchesPrice
    })

    // Sort the filtered items
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case 'price':
          aValue = parseFloat(a.price)
          bValue = parseFloat(b.price)
          break
        case 'rating':
          aValue = a.rating?.average || 0
          bValue = b.rating?.average || 0
          break
        case 'name':
        default:
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredItems(filtered)
  }, [
    itemsInMyCity,
    searchTerm,
    selectedCategory,
    priceRange,
    sortBy,
    sortOrder,
  ])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setPriceRange({ min: '', max: '' })
  }

  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
      <Nav />

      {/* ==================== Categories Section ==================== */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-gray-800 text-2xl sm:text-3xl">
            Inspiration for your first order
          </h1>
          <p className="text-gray-600 text-sm">
            Browse by category to discover new flavors
          </p>
        </div>
        <div className="w-full relative">
          {showLeftCateButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#00BFFF] text-white p-2 rounded-full shadow-lg hover:bg-[#0e40ad] z-10"
              onClick={() => scrollHandler(cateScrollRef, 'left')}
            >
              <FaCircleChevronLeft />
            </button>
          )}

          <div
            className="w-full flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-[#00BFFF] scrollbar-track-transparent scroll-smooth"
            ref={cateScrollRef}
          >
            {categories.map((cate, index) => (
              <CategoryCard
                name={cate.name}
                image={cate.image}
                key={index}
                onImageLoad={handleImageLoad}
              />
            ))}
          </div>

          {showRightCateButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#00BFFF] text-white p-2 rounded-full shadow-lg hover:bg-[#0e40ad] z-10"
              onClick={() => scrollHandler(cateScrollRef, 'right')}
            >
              <FaCircleChevronRight />
            </button>
          )}
        </div>
      </div>

      {/* ==================== Shops Section ==================== */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-gray-800 text-2xl sm:text-3xl">
            The store should try in {currentCity}
          </h1>
          <p className="text-gray-600 text-sm">
            {shopsInMyCity?.length || 0} restaurants available in your area
          </p>
        </div>
        <div className="w-full relative">
          {showLeftShopButton && (
            <button
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#00BFFF] text-white p-2 rounded-full shadow-lg hover:bg-[#0e40ad] z-10"
              onClick={() => scrollHandler(shopScrollRef, 'left')}
            >
              <FaCircleChevronLeft />
            </button>
          )}

          <div
            className="w-full flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-[#00BFFF] scrollbar-track-transparent scroll-smooth"
            ref={shopScrollRef}
          >
            {shopsInMyCity?.map((shop, index) => (
              <ShopCard key={index} shop={shop} onImageLoad={handleImageLoad} />
            ))}
          </div>

          {showRightShopButton && (
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#00BFFF] text-white p-2 rounded-full shadow-lg hover:bg-[#0e40ad] z-10"
              onClick={() => scrollHandler(shopScrollRef, 'right')}
            >
              <FaCircleChevronRight />
            </button>
          )}
        </div>
      </div>

      {/* ==================== Food Items Section ==================== */}
      <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-gray-800 text-2xl sm:text-3xl">
            Suggested Food Items
          </h1>

          {/* Search and Filter Controls */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search food items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                showFilters
                  ? 'bg-[#00BFFF] text-white'
                  : 'bg-white text-gray-600 border border-gray-300'
              }`}
            >
              <FaFilter />
              Filters
            </button>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00BFFF] text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="rating">Sort by Rating</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                }
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-[#00BFFF] text-white' : 'bg-white text-gray-600'} transition-colors`}
                title="Grid View"
              >
                <FaThLarge />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-[#00BFFF] text-white' : 'bg-white text-gray-600'} transition-colors`}
                title="List View"
              >
                <FaBars />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="w-full bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Price (₫)
                </label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange((prev) => ({ ...prev, min: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (₫)
                </label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange((prev) => ({ ...prev, max: e.target.value }))
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00BFFF]"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}

        {/* Quick Filter Buttons */}
        <div className="w-full flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 font-medium">
            Quick filters:
          </span>
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedCategory === ''
                ? 'bg-[#00BFFF] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.slice(0, 4).map((category, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(category.name)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedCategory === category.name
                  ? 'bg-[#00BFFF] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="w-full flex justify-between items-center">
          <p className="text-gray-600">
            {filteredItems.length} items found
            {(searchTerm ||
              selectedCategory ||
              priceRange.min ||
              priceRange.max) &&
              ` (filtered from ${itemsInMyCity?.length || 0} total)`}
          </p>
          {filteredItems.length > 0 && (
            <p className="text-sm text-gray-500">
              Sorted by {sortBy} (
              {sortOrder === 'asc' ? 'ascending' : 'descending'})
            </p>
          )}
        </div>

        {/* Items Display */}
        {filteredItems.length > 0 ? (
          <div
            className={`w-full ${
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center'
                : 'flex flex-col gap-4'
            }`}
          >
            {filteredItems.map((item, index) => (
              <FoodCard key={index} data={item} layout={viewMode} />
            ))}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No items found
              </h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-[#00BFFF] text-white rounded-lg hover:bg-[#0090cc] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== Popular Items Section ==================== */}
      {filteredItems.length > 0 && (
        <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-2.5">
          <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-gray-800 text-2xl sm:text-3xl">
              Popular in {currentCity}
            </h1>
            <p className="text-gray-600 text-sm">
              Most ordered items this week
            </p>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
            {filteredItems
              .filter((item) => (item.rating?.average || 0) >= 4.0)
              .slice(0, 4)
              .map((item, index) => (
                <div key={index} className="relative">
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full z-10">
                    Popular
                  </div>
                  <FoodCard data={item} layout="grid" />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ==================== Footer Section ==================== */}
      <div className="w-full bg-gray-50 border-t border-gray-200 py-8">
        <div className="w-full max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Can't find what you're looking for?
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or browse different categories
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category.name)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm text-gray-600 hover:bg-[#00BFFF] hover:text-white transition-colors"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
