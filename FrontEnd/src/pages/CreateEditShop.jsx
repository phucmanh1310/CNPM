import React from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'
import { FaUtensils, FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa'
import { useState } from 'react';
import axios from 'axios';
import { serverURL } from '../App';
import { useDispatch } from 'react-redux';
import { setMyShopData } from '../redux/ownerSlice';
import useGetMyShop from '../hooks/useGetMyShop';

function CreateEditShop() {
    const navigate = useNavigate()
    const { myShopData } = useSelector(state => state.owner)
    const { currentCity, currentState, currentAddress } = useSelector(state => state.user)
    const [name, setName] = useState(myShopData?.name || "")
    const [city, setCity] = useState(myShopData?.city || currentCity)
    const [shopState, setShopState] = useState(myShopData?.state || currentState) // renamed
    const [address, setAddress] = useState(myShopData?.address || currentAddress)
    const [frontendImage, setFrontendImage] = useState(myShopData?.image || null)
    const [backendImage, setBackendImage] = useState(null)
    const [isGettingLocation, setIsGettingLocation] = useState(false)
    const [locationError, setLocationError] = useState("")
    const dispatch = useDispatch()

    const handleImage = (e) => {
        const file = e.target.files[0]
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
    }

    // Get current location
    const getCurrentLocation = () => {
        setIsGettingLocation(true)
        setLocationError("")

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by this browser")
            setIsGettingLocation(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords

                    // Use a simple reverse geocoding service (you can replace with Google Maps API)
                    const response = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    )
                    const data = await response.json()

                    if (data.city) {
                        setCity(data.city)
                        setShopState(data.principalSubdivision || data.countryName || "")
                        setAddress(`${data.locality || data.city}, ${data.principalSubdivision || data.countryName || ""}`)
                    } else {
                        setLocationError("Could not determine location details")
                    }
                } catch (error) {
                    console.error('Reverse geocoding error:', error)
                    setLocationError("Could not get location details")
                }
                setIsGettingLocation(false)
            },
            (error) => {
                console.error('Geolocation error:', error)
                setLocationError("Could not get your location. Please enter manually.")
                setIsGettingLocation(false)
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
            }
        )
    }
    const { refetch } = useGetMyShop();
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Form submitted", { name, city, shopState, address, backendImage });
        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("city", city)
            formData.append("state", shopState)
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
            console.error('Create/Edit shop failed', error);
            alert(error.response?.data?.message || 'Error saving shop')
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
                    {/* Location Section */}
                    <div className='bg-gray-50 p-4 rounded-lg border'>
                        <div className='flex items-center justify-between mb-3'>
                            <label className='block text-sm font-medium text-gray-700'>
                                <FaMapMarkerAlt className='inline mr-2 text-red-500' />
                                Shop Location
                            </label>
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                disabled={isGettingLocation}
                                className='flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm disabled:opacity-50'
                            >
                                <FaLocationArrow className={isGettingLocation ? 'animate-spin' : ''} />
                                {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
                            </button>
                        </div>

                        {locationError && (
                            <div className='mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-600'>
                                {locationError}
                            </div>
                        )}

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>City *</label>
                                <input
                                    type="text"
                                    placeholder='Enter city name'
                                    className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>State/Province *</label>
                                <input
                                    type="text"
                                    placeholder='Enter state/province'
                                    className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    value={shopState}
                                    onChange={(e) => setShopState(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className='mt-4'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Full Address *</label>
                            <textarea
                                placeholder='Enter complete address (street number, street name, ward, district, city)'
                                className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                                rows={3}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                            <p className='text-xs text-gray-500 mt-1'>
                                Example: 123 Nguyen Hue Street, District 1, Ho Chi Minh City
                            </p>
                        </div>
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