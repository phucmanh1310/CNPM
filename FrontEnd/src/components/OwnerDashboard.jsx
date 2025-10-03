import axios from 'axios'
import React, { useEffect, useState } from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaUtensils, FaPlus } from 'react-icons/fa'
import { FaPen } from 'react-icons/fa6'
import { FaThLarge, FaBars } from 'react-icons/fa';
import useGetMyShop from '../hooks/useGetMyShop'
import OwnerItemCard from './OwnerItemCard'
import { serverURL } from "../App";

export default function OwnerDashboard() {
    const navigate = useNavigate()

    // Truy xuất shop data từ Redux
    const { myShopData } = useSelector(state => state.owner)

    // Gọi hook để fetch và nhận về hàm refetch (nếu cần)
    const { refetch } = useGetMyShop()

    // Khi component mount hoặc myShopData thay đổi:
    useEffect(() => {
        // Nếu chưa fetch lần nào, refetch
        if (myShopData === undefined) {
            refetch()
            return
        }
        // Nếu đã fetch mà không có shop, redirect tới trang tạo shop
        if (myShopData === null) {
            navigate('/create-edit-shop', { replace: true })
        }
    }, [myShopData, refetch, navigate])

    //quản lý item
    const [viewMode, setViewMode] = useState('grid'); // 'grid' hoặc 'list'
    const handleEditItem = item => {
        navigate(`/edit-item/${item._id}`);
    };

    // deleted sản phẩm
    const handleDeleteItem = async item => {
        if (!window.confirm("Delete this item?")) return;
        try {
            await axios.delete(
                `${serverURL}/api/item/delete-item/${item._id}`,
                { withCredentials: true }
            );
            // Cập nhật lại danh sách sau khi xóa
            await refetch();
        } catch (err) {
            console.error("Delete failed", err);
            alert(err.response?.data?.message || "Error deleting item");
        }
    };



    // Hiển thị loading khDi chưa rõ trạng thái
    if (myShopData === undefined) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#fff9f6]">
                <Nav />
                <div className="text-[#00BFFF] text-lg">Loading your shop…</div>
            </div>
        )
    }
    //function handle xoa va edit item



    //render
    return (
        <div className="w-full min-h-screen bg-[#fff9f6] flex flex-col items-center">
            <Nav />

            <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6 mt-8">
                <h1 className="text-2xl sm:text-3xl text-gray-900 flex items-center gap-3">
                    <FaUtensils className="text-[#00BFFF] w-14 h-14" />
                    Welcome to {myShopData.name}
                </h1>

                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-blue-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative">
                    <div
                        className="absolute top-4 right-4 bg-[#00BFFF] text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition-colors cursor-pointer"
                        onClick={() => navigate('/create-edit-shop')}
                    >
                        <FaPen size={20} />
                    </div>
                    <img
                        src={myShopData.image}
                        alt={myShopData.name}
                        className="w-full h-48 sm:h-64 object-cover"
                    />
                    <div className="p-4 sm:p-6">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                            {myShopData.name}
                        </h2>
                        <p className="text-gray-600">
                            {myShopData.city}, {myShopData.state}
                        </p>
                        <p className="text-gray-600 mb-4">{myShopData.address}</p>
                    </div>
                </div>

                {/* Add Food Item Section - Hiển thị khi chưa có món ăn */}
                {Array.isArray(myShopData.item) && myShopData.item.length === 0 && (
                    <div className="flex justify-center items-center p-4 sm:p-6">
                        <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex flex-col items-center text-center">
                                {/* Icon */}
                                <div className="bg-orange-100 p-4 rounded-full mb-4">
                                    <FaUtensils className="text-blue-500 w-12 h-12" />
                                </div>

                                {/* Title */}
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                                    Add Your Food Item
                                </h2>

                                {/* Description */}
                                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                                    Share your delicious creations with our customers by adding them to the menu.
                                </p>

                                {/* Add Food Button */}
                                <button
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium shadow-md transition-colors duration-200 flex items-center gap-2"
                                    onClick={() => navigate('/add-item')}
                                >
                                    <FaPlus size={16} />
                                    Add Food
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toggle View Buttons */}
                <div className="w-full max-w-4xl flex justify-end gap-2 mt-6 px-4 sm:px-6">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#00BFFF] text-white' : 'bg-white text-gray-600'} shadow`}
                    >
                        <FaThLarge />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#00BFFF] text-white' : 'bg-white text-gray-600'} shadow`}
                    >
                        <FaBars />
                    </button>
                </div>

                {/* Items Container */}
                <div className={`w-full max-w-4xl mt-4 px-4 sm:px-6 ${viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'flex flex-col gap-4'
                    }`}>
                    {myShopData?.item?.map(item => (
                        <OwnerItemCard
                            key={item._id}
                            item={item}
                            layout={viewMode}
                            onEdit={handleEditItem}
                            onDelete={handleDeleteItem}
                        />
                    ))}
                </div>
            </div>
        </div >
    )
}
