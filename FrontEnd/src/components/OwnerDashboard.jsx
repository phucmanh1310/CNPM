import React, { useEffect } from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaUtensils } from 'react-icons/fa'
import { FaPen } from 'react-icons/fa6'
import useGetMyShop from '../hooks/userGetMyShop'

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

    // Hiển thị loading khi chưa rõ trạng thái
    if (myShopData === undefined) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#fff9f6]">
                <Nav />
                <div className="text-[#00BFFF] text-lg">Loading your shop…</div>
            </div>
        )
    }

    // Khi đã có shop, render nội dung dashboard
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

                {Array.isArray(myShopData.item) && myShopData.item.length === 0 && (
                    <div className="text-gray-600 mt-4">
                        You haven't added any items yet. Click the edit button above to add your first food item.
                    </div>
                )}
            </div>
        </div>
    )
}
