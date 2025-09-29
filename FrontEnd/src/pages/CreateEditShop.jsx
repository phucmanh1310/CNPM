import React, { useRef } from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { FaUtensils } from 'react-icons/fa'
import { useState } from 'react';
import axios from 'axios';
import { serverURL } from '../App';
import { useDispatch } from 'react-redux';
import { setMyShopData } from '../redux/ownerSlice';
import useGetMyShop from '../hooks/userGetMyShop';

function CreateEditShop() {
    const navigate = useNavigate()
    const { myShopData } = useSelector(state => state.owner)
    const { currentCity, currentState, currentAddress } = useSelector(state => state.user)
    const [name, setName] = useState(myShopData?.name || "")
    const [city, setCity] = useState(myShopData?.city || currentCity)
    const [state, setState] = useState(myShopData?.state || currentState)
    const [address, setAddress] = useState(myShopData?.address || currentAddress)
    const [frontendImage, setFrontendImage] = useState(myShopData?.image || null)
    const [backendImage, setBackendImage] = useState(null)
    const dispatch = useDispatch()
    const handleImage = (e) => {
        const file = e.target.files[0]
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
    }
    const { refetch } = useGetMyShop();
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted", { name, city, state, address, backendImage });
        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("city", city)
            formData.append("state", state)
            formData.append("address", address)
            if (backendImage) {
                formData.append("image", backendImage)
            }
            const result = await axios.post(
                `${serverURL}/api/shop/create-edit`,
                formData,
                { withCredentials: true }
            );
            // cập nhật Redux ngay kết quả mới
            dispatch(setMyShopData(result.data.shop || result.data));
            // gọi fetch lại shop từ server
            await refetch();
            // điều hướng về dashboard owner
            navigate("/", { replace: true });
        } catch (error) {
            console.log(error)
        }
    }

    // useGetMyShop is already called above for side effects if needed
    return (
        <div className='flex justify-center flex-col items-center p-6 bg-gradient-to-br from-blue-60 relative to-white min-h-screen'>
            < div className='absolute top-[20px] left-[20px] z-[10] mb-[10px]' onClick={() => navigate("/")} >
                <IoIosArrowRoundBack size={35} className='text-[#00BFFF]' />
            </div >
            <div className='max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-blue-100'>
                <div className='flex flex-col items-center mb-6'>
                    <div className='bg-blue-100 p-4 rounded-full mb-4'>
                        <FaUtensils className='text-[#00BFFF] w-16 h-16' />
                    </div>
                    <div className='text-3xl font-extrabold text-gray-900'>
                        {myShopData ? "Edit Shop" : "Add Shop"}
                    </div>
                </div>
                <form className='space-y-5' onSubmit={handleSubmit}>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor="">Name</label>
                        <input type="text" placeholder='Enter Shop Name' className='w-full px-4 py-2
                        border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            value={name}
                            onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor="">Shop Image</label>
                        <input type="file" accept='image/*' className='w-full px-4 py-2 
                        border rounded-lg  focus:outline-none focus:ring-2 focus:ring-blue-500'
                            onChange={handleImage} />
                        {frontendImage &&
                            <div className='mt-4'>
                                <img src={frontendImage} alt="" className='w-full h-48 object-cover
                            rounded-lg border' />
                            </div>}

                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor="">City</label>
                            <input type="text" placeholder='City' className='w-full px-4 py-2
                            border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                value={city}
                                onChange={(e) => setCity(e.target.value)} />
                        </div>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor="">State</label>
                            <input type="text" placeholder='State' className='w-full px-4 py-2
                            border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                value={state}
                                onChange={(e) => setState(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor="">Address</label>
                        <input type="text" placeholder='Enter Shop Address' className='w-full px-4 py-2
                        border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                            value={address}
                            onChange={(e) => setAddress(e.target.value)} />
                    </div>
                    <button type='submit' className='w-full bg-[#00BFFF] text-white px-6 py-3 rounded-lg 
                    font-semibold shadow-md hover:bg-blue-600 hover:shadow-lg transition-all 
                    duration-200 cursor-pointer'>
                        Save
                    </button>
                </form>
            </div>


        </div >
    )
}

export default CreateEditShop