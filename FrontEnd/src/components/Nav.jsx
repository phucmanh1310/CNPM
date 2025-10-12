import React, { useState } from "react";
import axios from "axios";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RxCross2 } from "react-icons/rx";
import { FaPlus } from "react-icons/fa6";
import { serverURL } from "../App";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { TbReceipt2 } from "react-icons/tb";
import { FaPlane } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import useGetOwnerOrderCount from '../hooks/useGetOwnerOrderCount';
function Nav() {
    const { userData, currentCity, cartItems } = useSelector(state => state.user);
    const { myShopData } = useSelector(state => state.owner);
    const [showInfo, setShowInfo] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Hook để lấy số lượng đơn hàng pending cho owner
    const { orderCount } = useGetOwnerOrderCount();

    // Kiểm tra localStorage để xem đã xem orders chưa
    const hasViewedOrders = localStorage.getItem('hasViewedOrders') === 'true';

    //hàm thêm món ăn
    // Hàm xử lý đăng xuất
    const handleLogout = async () => {
        try {
            await axios.get(`${serverURL}/api/auth/signout`, { withCredentials: true })
            dispatch(setUserData(null));
        } catch (error) {
            console.log(error);
        }
    }

    // Hàm xử lý khi click vào My Orders
    const handleMyOrdersClick = () => {
        localStorage.setItem('hasViewedOrders', 'true');
        navigate('/my-orders');
    };

    // ✅ KIỂM TRA LOADING STATE - Sửa đổi quan trọng
    if (userData === null) {
        return (
            <div className="w-full h-[80px] flex items-center justify-center fixed top-0 z-[9999] bg-[#fff9f6]">
                <div className="text-[#00BFFF] text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="w-full h-[80px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] bg-[#fff9f6] overflow-visible">
            {/* Ẩn hiện search */}
            {showSearch && userData?.role === "user" &&
                <div className="w-[90%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] flex fixed top-[80px] left-[5%] md:hidden">
                    <div className="flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400">
                        <FaLocationDot size={24} color="#00BFFF" />
                        <span className="text-base font-medium text-gray-700">{currentCity}</span>
                    </div>
                    <div className="w-[80%] flex items-center gap-[10px]">
                        <IoIosSearch size={24} color="#00BFFF" />
                        <input
                            type="text"
                            placeholder="Search for food and places..."
                            className="px-[10px] text-gray-700 outline-0 w-full border-none bg-transparent text-base"
                        />
                    </div>
                </div>
            }

            <h1 className="text-3xl font-bold mb-2 text-[#00BFFF] cursor-pointer hover:text-[#0090cc] transition-colors" onClick={() => navigate('/')}>FASTFOOD</h1>

            {/* Desktop search bar - chỉ hiện cho user */}
            {userData.role === "user" && (
                <div className="md:w-[50%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-lg items-center gap-[20px] hidden md:flex">
                    <div className="flex items-center w-[30%] overflow-hidden gap-[10px] px-[10px] border-r-[2px] border-gray-400">
                        <FaLocationDot size={24} color="#00BFFF" />
                        <span className="text-base font-medium text-gray-700">{currentCity}</span>
                    </div>
                    <div className="w-[80%] flex items-center gap-[10px]">
                        <IoIosSearch size={24} color="#00BFFF" />
                        <input
                            type="text"
                            placeholder="Search for food and places..."
                            className="px-[10px] text-gray-700 outline-0 w-full border-none bg-transparent text-base"
                        />
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4">
                {userData.role === "user" &&
                    (showSearch ?
                        <RxCross2 size={24} className="text-[#00BFFF] md:hidden" onClick={() => setShowSearch(false)} />
                        : <IoIosSearch size={24} className="text-[#00BFFF] md:hidden" onClick={() => setShowSearch(true)} />
                    )
                }

                {userData.role === "user" &&
                    <div className="relative cursor-pointer" onClick={() => navigate('/cart')}>
                        <FiShoppingCart size={25} className="text-[#00BFFF]" />
                        <span className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#00BFFF] rounded-full px-[6px] py-[1px]">{cartItems.length}</span>
                    </div>
                }

                {userData.role === "owner" && <>
                    {myShopData && <>
                        <button className="hidden md:flex items-center gap-1 p-2 cursor-pointer rounded-full 
                            bg-[#ff4d2d]/10 text-[#00BFFF] text-sm font-medium" onClick={() => navigate('/add-item')}>
                            <FaPlus size={25} />
                            <span>Add Food Item</span>
                        </button>
                        <button className="md:hidden flex items-center p-2 cursor-pointer rounded-full 
                            bg-[#ff4d2d]/10 text-[#00BFFF] text-sm font-medium" onClick={() => navigate('/add-item')} >
                            <FaPlus size={20} />
                        </button>
                    </>}

                    <div className={`hidden md:flex items-center gap-2 cursor-pointer relative px-3 py-1 
                        rounded-lg text-sm font-medium transition-all duration-200 ${orderCount > 0 && !hasViewedOrders
                            ? 'bg-red-100 text-red-600 border-2 border-red-300 shadow-md'
                            : 'bg-[#ff4d2d]/10 text-[#00BFFF]'
                        }`} onClick={handleMyOrdersClick}>
                        <TbReceipt2 size={25} />
                        <span>My Orders</span>
                        {orderCount > 0 && (
                            <span className={`absolute -right-2 -top-2 text-xs font-bold text-white rounded-full px-[6px] py-[1px] ${!hasViewedOrders ? 'bg-red-500 animate-pulse' : 'bg-[#00BFFF]'
                                }`}>
                                {orderCount}
                            </span>
                        )}
                    </div>
                    <div className={`md:hidden flex items-center gap-2 cursor-pointer relative px-3 py-1 
                        rounded-lg text-sm font-medium transition-all duration-200 ${orderCount > 0 && !hasViewedOrders
                            ? 'bg-red-100 text-red-600 border-2 border-red-300 shadow-md'
                            : 'bg-[#ff4d2d]/10 text-[#00BFFF]'
                        }`} onClick={handleMyOrdersClick}>
                        <TbReceipt2 size={25} />
                        {orderCount > 0 && (
                            <span className={`absolute -right-2 -top-2 text-xs font-bold text-white rounded-full px-[6px] py-[1px] ${!hasViewedOrders ? 'bg-red-500 animate-pulse' : 'bg-[#00BFFF]'
                                }`}>
                                {orderCount}
                            </span>
                        )}
                    </div>
                </>}

                {/* Drone Management link for owners */}
                {userData.role === "owner" && myShopData && (
                    <>
                        <button
                            className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#00BFFF] text-sm font-medium hover:bg-[#ff4d2d]/20 transition-colors"
                            onClick={() => navigate('/drone-management')}
                        >
                            <FaPlane size={20} />
                            <span>Drone Management</span>
                        </button>
                        <button
                            className="md:hidden flex items-center gap-2 px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#00BFFF] text-sm font-medium hover:bg-[#ff4d2d]/20 transition-colors"
                            onClick={() => navigate('/drone-management')}
                        >
                            <FaPlane size={20} />
                        </button>
                    </>
                )}

                {userData.role === "user" && (
                    <button className="hidden md:block px-3 py-1 rounded-lg bg-[#ff4d2d]/10 text-[#00BFFF] text-sm font-medium" onClick={() => navigate('/my-orders')}>
                        My Orders
                    </button>
                )}

                <div className='w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#00BFFF] text-white text-[18px] 
                    shadow-xl font-semibold cursor-pointer'
                    onClick={() => setShowInfo(prev => !prev)}>
                    {userData.fullName ? userData.fullName.slice(0, 1) : <FaUser size={20} />}
                </div>

                {/* Profile dropdown */}
                {showInfo &&
                    <div className='fixed top-[80px] right-[10px] md:right-[10%] lg:right-[25%] w-[180px] bg-white shadow-2xl rounded-xl p-[20px] flex flex-col gap-[10px] z-[9999]'>
                        <div className="text-[17px] font-semibold">{userData.fullName}</div>
                        {userData.role === "user" && (
                            <div className="md:hidden text-[#00BFFF] font-semibold cursor-pointer" onClick={() => navigate('/my-orders')}>My Orders</div>
                        )}
                        <div className="text-[#00BFFF] font-semibold cursor-pointer"
                            onClick={handleLogout}>Log Out</div>
                    </div>
                }
            </div>
        </div>
    );
}

export default Nav;
