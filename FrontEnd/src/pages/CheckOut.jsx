import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from 'react-icons/io';
import { IoLocationSharp, IoSearchOutline } from 'react-icons/io5';
import { TbCurrentLocation } from 'react-icons/tb';
function CheckOut() {
    const navigate = useNavigate();
    const [selectedPayment, setSelectedPayment] = useState('cod');
    return (
        <div className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-6">
            {/* thanh điều hướng */}
            <div
                className='absolute top-[20px] left-[20px] z-[10]'
                onClick={() => navigate("/")}
            >
                <IoIosArrowRoundBack size={35} className='text-[#00BFFF]' />
            </div>
            {/* thanh đơn hàng */}
            <div className="w-full max-w-[900px] bg-white rounded-2xl shadow-lg p-6 space-y-6 ">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Checkout</h1>
                <section>
                    {/* Delivery Location */}
                    <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800'>
                        <IoLocationSharp size={20} className='text-[#00BFFF]' />
                        Delivery Location
                    </h2>
                    <div className='flex gap-2 mb-3'>
                        <input
                            type="text"
                            className="flex-1 border border-gray-300 rounded-lg p-2 text-sm
                            focus:outline-none focus:ring-2 focus:ring-[#]"
                            placeholder='Enter your delivery address..'
                        />
                        <button className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg 
                        flex items-center justify-center' size={17}>
                            {/*Nút tìm kiếm vị trí mới*/}
                            <IoSearchOutline />
                        </button>
                        <button className='bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg 
                        flex items-center justify-center' size={17}>
                            {/*Nút chọn vị trí hiện tại*/}
                            <TbCurrentLocation />
                        </button>
                    </div>

                    <div className="w-full h-40 rounded-md overflow-hidden border border-gray-300">
                        {/* Placeholder for map */}
                        <iframe
                            title="map"
                            src="https://www.openstreetmap.org/export/embed.html?bbox=78.644%2C25.448%2C78.646%2C25.450&layer=mapnik"
                            className="w-full h-full"
                            frameBorder="0"
                            scrolling="no"
                        ></iframe>
                    </div>

                </section>



                {/* Payment Method */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">Payment Method</h3>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setSelectedPayment('cod')}
                            className={`flex-1 border rounded-md p-4 flex flex-col items-center cursor-pointer transition ${selectedPayment === 'cod'
                                ? 'border-[#00BFFF] bg-blue-50'
                                : 'border-gray-300 bg-white'
                                }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-6 w-6 mb-2 ${selectedPayment === 'cod' ? 'text-[#00BFFF]' : 'text-gray-400'
                                    }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h1l1 2h13l1-2h1"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 16a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                            </svg>
                            <span className="font-semibold">Cash on Delivery</span>
                            <small className="text-gray-500">Pay when your food arrives</small>
                        </button>
                        <button
                            onClick={() => setSelectedPayment('card')}
                            className={`flex-1 border rounded-md p-4 flex flex-col items-center cursor-pointer transition ${selectedPayment === 'card'
                                ? 'border-[#00BFFF] bg-blue-50'
                                : 'border-gray-300 bg-white'
                                }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-6 w-6 mb-2 ${selectedPayment === 'card' ? 'text-[#00BFFF]' : 'text-gray-400'
                                    }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <rect width="20" height="14" x="2" y="5" rx="2" ry="2" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2 10h20" />
                            </svg>
                            <span className="font-semibold">UPI / Credit / Debit Card</span>
                            <small className="text-gray-500">Pay securely online</small>
                        </button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="mb-6 border border-gray-300 rounded-md p-4">
                    <h3 className="font-semibold mb-2">Order Summary</h3>
                    <div className="mb-2 flex justify-between">
                        <span>Corn Pizza × 1</span>
                        <span>₹199.00</span>
                    </div>
                    <div className="mb-2 flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold">₹199.00</span>
                    </div>
                    <div className="mb-2 flex justify-between">
                        <span>Delivery Fee</span>
                        <span>₹40</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#00BFFF]">
                        <span>Total</span>
                        <span>₹239.00</span>
                    </div>
                </div>

                {/* Place Order Button */}
                <button className="w-full bg-[#00BFFF] text-white py-3 rounded-md font-semibold hover:bg-blue-600 transition">
                    Place Order
                </button>
            </div>
        </div>
    );
}

export default CheckOut;
