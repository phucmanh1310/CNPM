import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Nav from "../components/Nav";
import FoodCard from "../components/FoodCard";
import { FaArrowLeft, FaMapMarkerAlt, FaStar, FaRegStar, FaClock, FaSearch, FaFilter, FaThLarge, FaBars } from "react-icons/fa";
import { categories } from "../category";

function ShopDetail() {
    const { shopId } = useParams();
    const navigate = useNavigate();
    const { shopsInMyCity, itemsInMyCity } = useSelector((state) => state.user);

    // Find the shop by ID
    const shop = shopsInMyCity?.find(s => s._id === shopId);

    // Filter items for this shop
    const shopItems = itemsInMyCity?.filter(item => {
        // item.shop could be ObjectId string or populated object
        return item.shop?._id === shopId || item.shop === shopId || item.shop?._id?.toString() === shopId;
    }) || [];

    // State for filtering and view
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                i <= rating ? (
                    <FaStar key={i} className="text-yellow-500 text-sm" />
                ) : (
                    <FaRegStar key={i} className="text-yellow-500 text-sm" />
                )
            );
        }
        return stars;
    };

    // Filter and sort logic using useMemo to prevent infinite loops
    const filteredItems = useMemo(() => {
        if (!shopItems || shopItems.length === 0) return [];

        let filtered = shopItems.filter(item => {
            // Search by name
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());

            // Filter by category
            const matchesCategory = !selectedCategory || item.category === selectedCategory;

            // Filter by price range
            const price = parseFloat(item.price);
            const minPrice = priceRange.min ? parseFloat(priceRange.min) : 0;
            const maxPrice = priceRange.max ? parseFloat(priceRange.max) : Infinity;
            const matchesPrice = price >= minPrice && price <= maxPrice;

            return matchesSearch && matchesCategory && matchesPrice;
        });

        // Sort the filtered items
        filtered.sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'price':
                    aValue = parseFloat(a.price);
                    bValue = parseFloat(b.price);
                    break;
                case 'rating':
                    aValue = a.rating?.average || 0;
                    bValue = b.rating?.average || 0;
                    break;
                case 'name':
                default:
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        return filtered;
    }, [shopItems, searchTerm, selectedCategory, priceRange, sortBy, sortOrder]);

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setPriceRange({ min: '', max: '' });
    };

    // If shop not found, show loading or error
    if (!shop) {
        return (
            <div className="w-screen min-h-screen flex flex-col items-center justify-center bg-[#fff9f6]">
                <Nav />
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Loading shop...</h2>
                    <p className="text-gray-600 mb-4">Shop ID: {shopId}</p>
                    <p className="text-gray-600 mb-4">Available shops: {shopsInMyCity?.length || 0}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-[#00BFFF] text-white rounded-lg hover:bg-[#0090cc] transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
            <Nav />

            {/* Back Button */}
            <div className="w-full max-w-6xl flex items-center p-[10px]">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50"
                    title="Back to Home"
                >
                    <FaArrowLeft className="text-[#00BFFF]" size={16} />
                </button>
            </div>

            {/* Shop Header */}
            <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="relative">
                    <img
                        src={shop.image}
                        alt={shop.name}
                        className="w-full h-64 object-cover"
                        onError={(e) => {
                            console.log('Image load error:', shop.image);
                            e.target.src = 'https://via.placeholder.com/800x300/4F46E5/FFFFFF?text=Shop+Image';
                        }}
                    />
                    <div className="absolute inset-0 bg-opacity-20"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                        <h1 className="text-3xl font-bold mb-2">{shop.name}</h1>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                {renderStars(shop.rating?.average || 4.2)}
                                <span>({shop.rating?.count || 0} reviews)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <FaClock />
                                <span>30-45 min</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="flex items-center text-gray-600 mb-4">
                        <FaMapMarkerAlt className="text-red-500 mr-2" />
                        <span>{shop.address}, {shop.city}, {shop.state}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-[#00BFFF]">{shopItems.length}</div>
                            <div className="text-sm text-gray-600">Menu Items</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-green-600">30.000đ</div>
                            <div className="text-sm text-gray-600">Delivery</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-2xl font-bold text-orange-600">₫100,000</div>
                            <div className="text-sm text-gray-600">Min Order</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Section */}
            <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-[10px]">
                <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h2 className="text-gray-800 text-2xl sm:text-3xl">
                        Menu ({shopItems.length} items)
                    </h2>

                    {/* Search and Filter Controls */}
                    <div className="flex items-center gap-3">
                        {/* Search Bar */}
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search menu items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00BFFF] focus:border-transparent"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters ? 'bg-[#00BFFF] text-white' : 'bg-white text-gray-600 border border-gray-300'
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
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
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
                                    placeholder="10,000"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
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
                                    placeholder="100,000"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
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
                    <span className="text-sm text-gray-600 font-medium">Quick filters:</span>
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedCategory === ''
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
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedCategory === category.name
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
                        {(searchTerm || selectedCategory || priceRange.min || priceRange.max) &&
                            ` (filtered from ${shopItems.length} total)`
                        }
                    </p>
                    {filteredItems.length > 0 && (
                        <p className="text-sm text-gray-500">
                            Sorted by {sortBy} ({sortOrder === 'asc' ? 'ascending' : 'descending'})
                        </p>
                    )}
                </div>

                {/* Items Display */}
                {filteredItems.length > 0 ? (
                    <div className={`w-full ${viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center'
                        : 'flex flex-col gap-4'
                        }`}>
                        {filteredItems.map((item, index) => (
                            <FoodCard key={index} data={item} layout={viewMode} />
                        ))}
                    </div>
                ) : (
                    <div className="w-full flex flex-col items-center justify-center py-12">
                        <div className="text-center">
                            <div className="text-6xl mb-4">🍽️</div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No items found</h3>
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
        </div>
    );
}

export default ShopDetail;
